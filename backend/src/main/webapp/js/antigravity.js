/**
 * VoltSpot EV - Antigravity Particle Simulation Engine
 * Based on React Bits <Antigravity /> component
 * WebGL 2 Shader Particle Engine with OKLab palette interpolation & dynamic magnetic cursor mechanics
 */
(function(window) {
  'use strict';

  const PIXEL_BUDGET = 2.4e6;
  const WORLD_HEIGHT = 31.5;
  const PALETTE_SIZE = 256;
  const DEFAULT_COLORS = ['#10b981', '#3b82f6', '#a843ff', '#34d399', '#064e3b'];
  const SHAPES = { capsule: 0, sphere: 1, box: 2, tetrahedron: 3 };
  const COLOR_MODES = { conic: 0, radial: 1, random: 2 };

  const VERTEX_SHADER = `#version 300 es
  precision highp float;
  layout(location = 0) in vec2 aCorner;
  layout(location = 1) in vec4 aParticle;
  layout(location = 2) in vec4 aSeed;
  uniform vec2 uSize;
  uniform float uPixel;
  uniform vec2 uCursor;
  uniform float uRing;
  uniform float uBand;
  uniform float uParticle;
  uniform float uAmbient;
  uniform float uTime;
  uniform float uPulse;
  uniform float uVariance;
  uniform float uDepth;
  uniform float uShape;
  uniform float uColorMode;
  uniform float uStops;
  uniform float uHue;
  uniform float uReveal;
  uniform float uStreak;
  uniform float uCharge;
  out vec2 vLocal;
  out vec2 vBounds;
  out float vU;
  out float vAlpha;
  out float vSoft;

  void main() {
    vec2 rel = aParticle.xy - uCursor;
    float dist = length(rel);
    vec2 radial = dist > 1e-3 ? rel / dist : vec2(1.0, 0.0);
    vec2 dir = radial;
    float speed = length(aParticle.zw);
    float streak = clamp(speed / uStreak, 0.0, 2.5);
    if (speed > 1e-3) {
      vec2 heading = aParticle.zw / speed * sign(dot(aParticle.zw, radial) + 1e-4);
      dir = normalize(mix(radial, heading, smoothstep(0.0, 1.0, streak)));
    }
    float ring = exp(-pow((dist - uRing) / uBand, 2.0));
    float z = aSeed.x;
    float depth = 1.0 + z * 0.32 * uDepth;
    float pulse = 1.0 + sin(uTime * uPulse + aSeed.y) * 0.22 * uVariance;
    float grow = uAmbient + (1.0 - uAmbient) * ring;
    float size = uParticle * depth * pulse * (0.85 + 0.3 * aSeed.w) * (1.0 + uCharge * 0.25 * ring);
    vec2 bounds;
    if (uShape < 0.5) {
      float width = size * 0.17 * mix(0.55, 1.0, ring);
      bounds = vec2(max(width, size * 0.5 * grow) * (1.0 + streak * 1.2), width);
    } else if (uShape < 1.5) {
      bounds = vec2(size * 0.22 * mix(0.45, 1.0, grow));
    } else {
      bounds = vec2(size * 0.26 * mix(0.45, 1.0, grow));
    }
    float soft = 1.0 + max(-z, 0.0) * 1.6 * uDepth;
    vec2 local = aCorner * (bounds + soft * 1.5 / uPixel);
    vec2 world = aParticle.xy + dir * local.x + vec2(-dir.y, dir.x) * local.y;
    gl_Position = vec4(world.x / uSize.x * 2.0 - 1.0, 1.0 - world.y / uSize.y * 2.0, 0.0, 1.0);
    vLocal = local * uPixel;
    vBounds = bounds * uPixel;
    vSoft = soft;
    if (uColorMode < 0.5) {
      vU = atan(radial.y, radial.x) / 6.28318530718 + uHue + (aSeed.z - 0.5) * 0.06;
    } else if (uColorMode < 1.5) {
      vU = clamp(dist / (uRing * 2.4), 0.0, 1.0) + (aSeed.z - 0.5) * 0.06;
    } else {
      vU = floor(aSeed.z * uStops) / max(uStops - 1.0, 1.0);
    }
    float fog = 1.0 - max(-z, 0.0) * 0.35 * uDepth;
    vAlpha = mix(uAmbient, 1.0, ring) * fog * uReveal;
  }`;

  const FRAGMENT_SHADER = `#version 300 es
  precision highp float;
  uniform sampler2D uPalette;
  uniform float uShape;
  uniform float uColorMode;
  uniform float uOpacity;
  in vec2 vLocal;
  in vec2 vBounds;
  in float vU;
  in float vAlpha;
  in float vSoft;
  out vec4 fragColor;

  void main() {
    vec2 p = vLocal;
    float d;
    if (uShape < 0.5) {
      float r = vBounds.y;
      d = length(vec2(max(abs(p.x) - max(vBounds.x - r, 0.0), 0.0), p.y)) - r;
    } else if (uShape < 1.5) {
      d = length(p) - vBounds.x;
    } else if (uShape < 2.5) {
      float r = vBounds.x * 0.28;
      vec2 q = abs(p) - (vBounds - r);
      d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    } else {
      float r = vBounds.x * 1.15;
      vec2 q = vec2(r * 0.5774 - p.x, abs(p.y));
      d = max(dot(q, vec2(0.5, 0.8660254)) - r * 0.5, -q.x - r * 0.5) * 1.2;
    }
    float alpha = clamp(0.5 - d / vSoft, 0.0, 1.0) * vAlpha * uOpacity;
    if (alpha < 0.002) discard;
    vec3 color = texture(uPalette, vec2(uColorMode < 0.5 ? fract(vU) : vU, uColorMode < 0.5 ? 0.25 : 0.75)).rgb;
    fragColor = vec4(color * alpha, alpha);
  }`;

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const parseColor = (val) => {
    const text = String(val || '').trim();
    const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
    if (hex) {
      const full = hex[1].length === 3 ? hex[1].replace(/./g, d => d + d) : hex[1];
      return [0, 2, 4].map(idx => parseInt(full.slice(idx, idx + 2), 16) / 255);
    }
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
    if (rgb) return [rgb[1], rgb[2], rgb[3]].map(c => clamp(parseFloat(c) / 255, 0, 1));
    return null;
  };

  const toLinear = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const toGamma = c => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055);

  const rgbToOklab = (r, g, b) => {
    const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    ];
  };

  const oklabToRgb = (L, a, b) => {
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
    return [
      clamp(toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), 0, 1),
      clamp(toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), 0, 1),
      clamp(toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s), 0, 1)
    ];
  };

  const buildPalette = (colors) => {
    const parsed = (colors && colors.length ? colors : DEFAULT_COLORS)
      .map(parseColor)
      .filter(Boolean);
    const list = parsed.length ? parsed : [[0.06, 0.73, 0.51], [0.23, 0.51, 0.96], [0.66, 0.26, 1.0]];
    const labs = list.map(c => rgbToOklab(c[0], c[1], c[2]));
    const data = new Uint8Array(PALETTE_SIZE * 4);

    for (let i = 0; i < PALETTE_SIZE; i++) {
      const t = (i / (PALETTE_SIZE - 1)) * (labs.length - 1);
      const idx = Math.floor(t);
      const f = t - idx;
      const c1 = labs[idx];
      const c2 = labs[Math.min(idx + 1, labs.length - 1)];
      const L = c1[0] + (c2[0] - c1[0]) * f;
      const a = c1[1] + (c2[1] - c1[1]) * f;
      const b = c1[2] + (c2[2] - c1[2]) * f;
      const rgb = oklabToRgb(L, a, b);

      const offset = i * 4;
      data[offset] = Math.round(rgb[0] * 255);
      data[offset + 1] = Math.round(rgb[1] * 255);
      data[offset + 2] = Math.round(rgb[2] * 255);
      data[offset + 3] = 255;
    }
    return data;
  };

  /**
   * Main Antigravity Controller
   */
  window.initAntigravity = function(containerElem, userConfig) {
    if (typeof containerElem === 'string') {
      containerElem = document.getElementById(containerElem) || document.querySelector(containerElem);
    }
    if (!containerElem) return null;

    const config = Object.assign({
      colors: ['#10b981', '#3b82f6', '#a843ff', '#34d399', '#064e3b'],
      count: 1400,
      magnetRadius: 7.0,
      ringRadius: 5.5,
      waveSpeed: 0.10,     // Move slowly and calmly
      waveAmplitude: 0.7,
      particleSize: 0.9,
      lerpSpeed: 0.12,
      autoAnimate: false,  // Only move where mouse or tap is
      clickBurst: true,
      fieldStrength: 7.5,
      opacity: 0.85,
      shape: 'capsule',
      colorMode: 'conic'
    }, userConfig || {});

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'antigravity__canvas';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.setAttribute('aria-hidden', 'true');

    // Preserve absolute positioning if already set so it does not interfere with flex/grid centering
    const computedPos = window.getComputedStyle(containerElem).position;
    if (computedPos === 'static') {
      containerElem.style.position = 'relative';
    }
    containerElem.style.overflow = 'hidden';
    containerElem.appendChild(canvas);

    let gl = canvas.getContext('webgl2', { alpha: true, antialias: true, depth: false });

    // Fallback if WebGL 2 is unavailable: Render High Performance 2D Canvas particles
    if (!gl) {
      console.warn('WebGL2 not available, falling back to Canvas 2D Antigravity');
      return init2DFallback(canvas, config);
    }

    // Compile Shaders
    const createShader = (glCtx, type, src) => {
      const shader = glCtx.createShader(type);
      glCtx.shaderSource(shader, src);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compilation error:', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return init2DFallback(canvas, config);

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      return init2DFallback(canvas, config);
    }

    gl.useProgram(program);

    // Uniform Locations
    const uSize = gl.getUniformLocation(program, 'uSize');
    const uPixel = gl.getUniformLocation(program, 'uPixel');
    const uCursor = gl.getUniformLocation(program, 'uCursor');
    const uRing = gl.getUniformLocation(program, 'uRing');
    const uBand = gl.getUniformLocation(program, 'uBand');
    const uParticle = gl.getUniformLocation(program, 'uParticle');
    const uAmbient = gl.getUniformLocation(program, 'uAmbient');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uPulse = gl.getUniformLocation(program, 'uPulse');
    const uVariance = gl.getUniformLocation(program, 'uVariance');
    const uDepth = gl.getUniformLocation(program, 'uDepth');
    const uShape = gl.getUniformLocation(program, 'uShape');
    const uColorMode = gl.getUniformLocation(program, 'uColorMode');
    const uStops = gl.getUniformLocation(program, 'uStops');
    const uHue = gl.getUniformLocation(program, 'uHue');
    const uReveal = gl.getUniformLocation(program, 'uReveal');
    const uStreak = gl.getUniformLocation(program, 'uStreak');
    const uCharge = gl.getUniformLocation(program, 'uCharge');
    const uOpacity = gl.getUniformLocation(program, 'uOpacity');

    // Build Palette Texture
    const paletteData = buildPalette(config.colors);
    const paletteTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, paletteTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, paletteData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Quad Corner Vertices (-1 to 1)
    const corners = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    const cornerBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf);
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);

    // Particle Buffers
    const count = Math.min(config.count, 3500);
    const particles = new Float32Array(count * 4); // x, y, vx, vy
    const seeds = new Float32Array(count * 4);     // z, y, u, sizeVariance

    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      particles[idx] = (Math.random() - 0.5) * 50;
      particles[idx + 1] = (Math.random() - 0.5) * WORLD_HEIGHT;
      particles[idx + 2] = 0;
      particles[idx + 3] = 0;

      seeds[idx] = Math.random() * 2 - 1;       // z depth
      seeds[idx + 1] = Math.random() * Math.PI * 2; // pulse phase
      seeds[idx + 2] = Math.random();           // color sample
      seeds[idx + 3] = Math.random();           // random variance
    }

    const particleBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuf);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);

    const seedBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);

    // VAO
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, particleBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);

    // State - starts quiet until mouse or touch interaction occurs
    let mouse = { x: -9999, y: -9999, active: false, lastInteraction: 0 };
    let curCursor = [-9999, -9999];
    let charge = 0;
    let time = 0;
    let animId = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = containerElem.getBoundingClientRect();
      const w = Math.max(rect.width || window.innerWidth, 300);
      const h = Math.max(rect.height || window.innerHeight, 300);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse / Touch / Keyboard "Tabbing" Tracking
    const updatePointer = (clientX, clientY) => {
      const rect = containerElem.getBoundingClientRect();
      const w = Math.max(rect.width || window.innerWidth, 1);
      const h = Math.max(rect.height || window.innerHeight, 1);
      const aspect = w / h;
      const worldW = WORLD_HEIGHT * aspect;

      const px = (clientX - (rect.left || 0)) / w;
      const py = (clientY - (rect.top || 0)) / h;

      mouse.x = (px - 0.5) * worldW;
      mouse.y = (py - 0.5) * WORLD_HEIGHT;
      mouse.active = true;
    };

    const onPointerMove = (e) => {
      updatePointer(e.clientX, e.clientY);
    };

    const onPointerDown = (e) => {
      updatePointer(e.clientX, e.clientY);
      if (config.clickBurst) {
        charge = 2.5; // Smooth localized ripple on click/tap
      }
    };

    // Keyboard "Tabbing" Tracking: when user tabs through buttons, inputs, cards, links
    const onFocusIn = (e) => {
      if (e.target && typeof e.target.getBoundingClientRect === 'function') {
        const targetRect = e.target.getBoundingClientRect();
        if (targetRect.width > 0 && targetRect.height > 0) {
          const centerX = targetRect.left + targetRect.width / 2;
          const centerY = targetRect.top + targetRect.height / 2;
          updatePointer(centerX, centerY);
          if (config.clickBurst) {
            charge = 1.8; // gentle pulse when tabbing to an element
          }
        }
      }
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
        if (config.clickBurst) {
          charge = 2.5;
        }
      }
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseLeaveDoc = (e) => {
      if (!e.relatedTarget && !e.toElement) {
        // If an element is currently focused via keyboard tabbing, preserve focus
        if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
          const targetRect = document.activeElement.getBoundingClientRect();
          if (targetRect.width > 0 && targetRect.height > 0) {
            updatePointer(targetRect.left + targetRect.width / 2, targetRect.top + targetRect.height / 2);
            return;
          }
        }
        mouse.active = false;
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Tab') {
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            const targetRect = document.activeElement.getBoundingClientRect();
            if (targetRect.width > 0 && targetRect.height > 0) {
              updatePointer(targetRect.left + targetRect.width / 2, targetRect.top + targetRect.height / 2);
              if (config.clickBurst) charge = 1.8;
            }
          }
        }, 15);
      }
    };

    const onScroll = () => {
      if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
        const targetRect = document.activeElement.getBoundingClientRect();
        if (targetRect.width > 0 && targetRect.height > 0) {
          updatePointer(targetRect.left + targetRect.width / 2, targetRect.top + targetRect.height / 2);
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('focusin', onFocusIn, { passive: true });
    window.addEventListener('keydown', onKeyDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeaveDoc, { passive: true });

    // Check if an input or button already has focus upon initialization
    if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
      const initRect = document.activeElement.getBoundingClientRect();
      if (initRect.width > 0 && initRect.height > 0) {
        updatePointer(initRect.left + initRect.width / 2, initRect.top + initRect.height / 2);
      }
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Animation Loop
    let lastT = performance.now();
    const render = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      time += dt * 0.5; // Continuous time progression for slow, smooth movement
      charge = Math.max(0, charge - dt * 2.0);

      // Continuous interaction as long as mouse is on screen or element is focused via tabbing
      const isInteracting = mouse.active;

      if (isInteracting) {
        if (curCursor[0] < -5000) {
          curCursor[0] = mouse.x;
          curCursor[1] = mouse.y;
        } else {
          curCursor[0] += (mouse.x - curCursor[0]) * 0.08;
          curCursor[1] += (mouse.y - curCursor[1]) * 0.08;
        }
      } else {
        curCursor[0] += (-9999 - curCursor[0]) * 0.05;
        curCursor[1] += (-9999 - curCursor[1]) * 0.05;
      }

      // Physics integration step for velocity
      const aspect = canvas.width / canvas.height;
      const worldW = WORLD_HEIGHT * aspect;
      const interactionRadius = config.magnetRadius || 7.5;

      for (let i = 0; i < count; i++) {
        const idx = i * 4;
        let px = particles[idx];
        let py = particles[idx + 1];

        // 1. Slow, calm ambient floating for the background
        const ambientFloat = 0.005;
        px += Math.sin(time * 0.25 + seeds[idx] * 4.0) * ambientFloat;
        py += Math.cos(time * 0.22 + seeds[idx + 1] * 4.0) * ambientFloat;

        // 2. WHERE MOUSE OR TABBING IS: CONTINUOUS SLOW SWIRL & WAVE ANIMATION
        if (isInteracting) {
          const dx = curCursor[0] - px;
          const dy = curCursor[1] - py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Only affect particles strictly within the mouse/tab interaction radius
          if (dist < interactionRadius && dist > 0.001) {
            const proximity = 1.0 - (dist / interactionRadius);
            const easeFactor = proximity * proximity; // Smooth quadratic falloff

            // Continuous slow fluid wave & gentle vortex swirl around mouse/tab
            const slowWave = Math.sin(time * 1.6 + seeds[idx + 1] * 6.28) * 0.35;
            const tangentX = -dy / dist;
            const tangentY = dx / dist;

            // Continuous slow orbital swirl
            const swirl = (0.28 + slowWave * 0.12) * easeFactor;

            // Gentle continuous breathing repulsion/attraction
            const push = (-0.32 + slowWave * 0.22 - charge * 1.5) * easeFactor;

            particles[idx + 2] += ((dx / dist) * push + tangentX * swirl) * dt * 2.0;
            particles[idx + 3] += ((dy / dist) * push + tangentY * swirl) * dt * 2.0;
          }
        }

        // Smooth damping so particles float continuously in a slow, silky way
        particles[idx + 2] *= 0.91;
        particles[idx + 3] *= 0.91;

        px += particles[idx + 2];
        py += particles[idx + 3];

        // Wrap around bounds
        if (px < -worldW * 0.55) px = worldW * 0.55;
        if (px > worldW * 0.55) px = -worldW * 0.55;
        if (py < -WORLD_HEIGHT * 0.55) py = WORLD_HEIGHT * 0.55;
        if (py > WORLD_HEIGHT * 0.55) py = -WORLD_HEIGHT * 0.55;

        particles[idx] = px;
        particles[idx + 1] = py;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, particles);

      // Draw
      gl.clearColor(0.015, 0.03, 0.06, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(uSize, worldW, WORLD_HEIGHT);
      gl.uniform1f(uPixel, canvas.height / WORLD_HEIGHT);
      gl.uniform2f(uCursor, isInteracting ? curCursor[0] : -9999.0, isInteracting ? curCursor[1] : -9999.0);
      gl.uniform1f(uRing, config.ringRadius);
      gl.uniform1f(uBand, 3.2);
      gl.uniform1f(uParticle, config.particleSize);
      gl.uniform1f(uAmbient, 0.38);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uPulse, 0.4); // Slow, gentle breathing rhythm
      gl.uniform1f(uVariance, 0.8);
      gl.uniform1f(uDepth, 1.0);
      gl.uniform1f(uShape, SHAPES[config.shape] !== undefined ? SHAPES[config.shape] : 0);
      gl.uniform1f(uColorMode, COLOR_MODES[config.colorMode] !== undefined ? COLOR_MODES[config.colorMode] : 0);
      gl.uniform1f(uStops, 4.0);
      gl.uniform1f(uHue, 0.0);
      gl.uniform1f(uReveal, 1.0);
      gl.uniform1f(uStreak, 0.6);
      gl.uniform1f(uCharge, isInteracting ? charge : 0.0);
      gl.uniform1f(uOpacity, config.opacity);

      gl.bindVertexArray(vao);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Return control object
    return {
      destroy: () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerleave', onPointerLeave);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      },
      updateColors: (newColors) => {
        const newPalette = buildPalette(newColors);
        gl.bindTexture(gl.TEXTURE_2D, paletteTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PALETTE_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, newPalette);
      }
    };
  };

  /**
   * High-Performance Canvas 2D Fallback
   */
  function init2DFallback(canvas, config) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let width, height;
    const colors = config.colors || DEFAULT_COLORS;
    const particles = [];
    const count = Math.min(config.count, 220);

    const resize = () => {
      width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        seed: Math.random() * 100,
        radius: Math.random() * 2.5 + 1.0,
        color: colors[i % colors.length],
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    let mouse = { x: -9999, y: -9999, active: false };
    const updatePointer2D = (cx, cy) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = cx - rect.left;
      mouse.y = cy - rect.top;
      mouse.active = true;
    };

    window.addEventListener('pointermove', e => updatePointer2D(e.clientX, e.clientY), { passive: true });
    window.addEventListener('pointerdown', e => updatePointer2D(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchstart', e => { if (e.touches[0]) updatePointer2D(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('touchmove', e => { if (e.touches[0]) updatePointer2D(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    window.addEventListener('focusin', e => {
      if (e.target && typeof e.target.getBoundingClientRect === 'function') {
        const r = e.target.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          updatePointer2D(r.left + r.width / 2, r.top + r.height / 2);
        }
      }
    }, { passive: true });
    window.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            const r = document.activeElement.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              updatePointer2D(r.left + r.width / 2, r.top + r.height / 2);
            }
          }
        }, 15);
      }
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', e => {
      if (!e.relatedTarget && !e.toElement) {
        if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
          const r = document.activeElement.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            updatePointer2D(r.left + r.width / 2, r.top + r.height / 2);
            return;
          }
        }
        mouse.active = false;
      }
    }, { passive: true });

    let raf;
    let time2D = 0;
    const render2D = () => {
      time2D += 0.02; // Continuous time progression
      ctx.clearRect(0, 0, width, height);

      for (let p of particles) {
        // Slow ambient drift
        p.x += Math.sin(time2D * 0.4 + p.seed) * 0.15;
        p.y += Math.cos(time2D * 0.35 + p.seed) * 0.15;

        // Continuous slow fluid swirl around mouse or tabbing target
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 1) {
            const factor = Math.pow(1.0 - dist / 140, 2);
            const slowWave = Math.sin(time2D * 1.5 + p.seed) * 0.35;
            const tangentX = -dy / dist;
            const tangentY = dx / dist;
            const swirl = (0.28 + slowWave * 0.12) * factor;
            const push = (-0.25 + slowWave * 0.15) * factor;

            p.vx += ((dx / dist) * push + tangentX * swirl) * 0.6;
            p.vy += ((dy / dist) * push + tangentY * swirl) * 0.6;
          }
        }

        p.vx *= 0.90;
        p.vy *= 0.90;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * config.opacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      raf = requestAnimationFrame(render2D);
    };
    raf = requestAnimationFrame(render2D);

    return {
      destroy: () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
      }
    };
  }

  // Auto-boot if container exists on page load
  document.addEventListener('DOMContentLoaded', () => {
    const bgElem = document.getElementById('antigravity-global-bg') || document.getElementById('antigravity-bg');
    if (bgElem && !window.__antigravityInitialized) {
      window.__antigravityInitialized = true;
      window.__globalAntigravityInstance = window.initAntigravity(bgElem);
    }
  });

})(window);

