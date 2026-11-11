import React, { useState } from 'react';
import Antigravity from '../components/Antigravity/Antigravity.jsx';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { UserRole } from '../types';
import {
  Zap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Car,
  Wrench,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToHome }) => {
  const { user, login, register, quickSwitchUser } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('driver@voltspot.io');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [role, setRole] = useState<UserRole>('DRIVER');

  const demoAccounts = [
    {
      id: 1,
      roleName: 'EV Driver',
      name: 'EV Driver',
      email: 'driver@voltspot.io',
      icon: Car,
      tag: 'Tata Nexon EV',
      badgeColor: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/50',
      desc: 'Discover hubs, check real-time slots, UPI payment & GST invoices'
    },
    {
      id: 2,
      roleName: 'Station Operator',
      name: 'VoltPower India Operators',
      email: 'operator@voltspot.io',
      icon: Wrench,
      tag: 'Hub Manager',
      badgeColor: 'border-blue-500/50 text-blue-300 bg-blue-950/50',
      desc: 'Manage fast chargers, set capacities & pricing (₹), track bookings'
    },
    {
      id: 3,
      roleName: 'System Admin',
      name: 'Central Administrator',
      email: 'admin@voltspot.io',
      icon: ShieldCheck,
      tag: 'Full Authority',
      badgeColor: 'border-rose-500/50 text-rose-300 bg-rose-950/50',
      desc: 'Approve stations, verify operators, financial reports & audit logs'
    }
  ];

  const handleQuickLogin = (id: number, roleName: string) => {
    quickSwitchUser(id);
    showToast('success', 'Authentication Successful', `Welcome back! Logged in as ${roleName}`);
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('error', 'Validation Error', 'Please enter your email address.');
      return;
    }

    const success = login(email.trim());
    if (success) {
      showToast('success', 'Sign In Successful', `Welcome back, ${email}!`);
      if (onLoginSuccess) onLoginSuccess();
    } else {
      showToast('error', 'User Not Found', 'No account found. Try 1-click demo profiles or register.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast('error', 'Missing Information', 'Please complete all fields.');
      return;
    }

    const newUser = register(name.trim(), email.trim(), phone.trim(), role);
    showToast('success', 'Account Registered', `Welcome to VoltSpot, ${newUser.name}!`);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="dark fixed inset-0 z-50 w-full overflow-y-auto bg-slate-950">
      <div className="relative grid min-h-full w-full place-items-center p-4 sm:p-6">
      {/* 1. Antigravity Interactive Particle Canvas Background */}
      <div className="fixed inset-0 pointer-events-auto z-0">
        <Antigravity
          colors={['#20a36a', '#2dd4bf', '#75d8a6', '#11865a', '#064e3b']}
          count={1600}
          magnetRadius={10}
          ringRadius={7.5}
          waveSpeed={0.45}
          waveAmplitude={1.2}
          waveCount={3}
          particleSize={0.95}
          lerpSpeed={0.06}
          autoAnimate={true}
          interactive={true}
          clickBurst={true}
          fieldStrength={11}
          opacity={0.88}
          lightMode={false}
          className="w-full h-full"
        />
      </div>

      {/* Subtle Dark Vignette Backdrop for Depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/85 pointer-events-none z-0" />

      {/* 2. Glassmorphism Login Card with Adjusted High-Contrast Text Colors (Centered via CSS Grid & Flexbox) */}
      <div className="relative z-10 max-w-lg w-full mx-auto my-auto self-center justify-self-center bg-slate-900/85 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 sm:p-8 overflow-hidden transition-all duration-300">
        
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300" />

        {/* Back Link */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Station Finder</span>
          </button>
        )}

        {/* Brand Header with Adjusted High-Contrast Text */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-3">
            <Zap className="w-7 h-7 fill-emerald-400 text-emerald-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Volt<span className="text-emerald-400">Spot</span> EV India
          </h2>
          <p className="text-xs sm:text-sm font-medium text-emerald-200/90 mt-1">
            Real-Time Charging Station Finder &amp; Slot Booking (₹ / INR)
          </p>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Interactive Antigravity Physics Engine</span>
          </div>
        </div>

        {/* 3. One-Click Instant Demo Profiles with Adjusted Contrast Colors */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
              1-Click Demo Access
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              Instant Switch
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((acc) => {
              const IconComp = acc.icon;
              const isActive = user?.email === acc.email;

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc.id, acc.roleName)}
                  className={`group p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400'
                      : 'border-slate-800 bg-slate-950/70 hover:border-emerald-500/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 group-hover:border-emerald-500/40 text-emerald-400 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {acc.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                          {acc.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                        {acc.desc}
                      </p>
                    </div>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Or Standard Login
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex p-1 bg-slate-950/90 border border-slate-800 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Driver / Operator
          </button>
        </div>

        {/* 4. Form Controls with Adjusted High-Contrast Text Colors */}
        {mode === 'login' ? (
          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@voltspot.io"
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-700 bg-slate-950/90 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-700 bg-slate-950/90 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to VoltSpot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('DRIVER')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'DRIVER'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  EV Driver
                </button>
                <button
                  type="button"
                  onClick={() => setRole('OPERATOR')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === 'OPERATOR'
                      ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Station Operator
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-950/90 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-950/90 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Mobile (+91)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 bg-slate-950/90 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mt-2"
            >
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Security Note with Adjusted Crisp Contrast */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-300 font-medium">
            🔒 Protected by 256-bit encryption &bull; RBI-Compliant UPI / RuPay &bull; GST Registered
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};
export default LoginPage;

