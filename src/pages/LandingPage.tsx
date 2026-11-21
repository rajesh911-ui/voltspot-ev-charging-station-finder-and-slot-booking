import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  CalendarClock,
  Check,
  CircleHelp,
  ExternalLink,
  MapPin,
  Menu,
  Navigation,
  PlugZap,
  Search,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import Antigravity from '../components/Antigravity/Antigravity.jsx';
import chargingStationImage from '../assets/images/ev_charging_station_hero_1793370397856.jpg';

interface LandingPageProps {
  onSignIn: () => void;
  onRegister: () => void;
  onOperatorRegister: () => void;
}

const cities = ['Bengaluru', 'Delhi NCR', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai'];

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  onRegister,
  onOperatorRegister,
}) => {
  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `EV charging stations near ${area.trim() ? `${area.trim()}, ` : ''}${city}, India`
  )}`;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="dark relative isolate min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Antigravity
          color={undefined}
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
          className="h-full w-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/85"
        aria-hidden="true"
      />
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="VoltSpot home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-emerald-200 shadow-sm shadow-emerald-950/40">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Volt<span className="text-emerald-300">Spot</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            <a className="text-sm font-semibold text-slate-300 transition hover:text-emerald-300" href="#how-it-works">How it works</a>
            <a className="text-sm font-semibold text-slate-300 transition hover:text-emerald-300" href="#features">Features</a>
            <a className="text-sm font-semibold text-slate-300 transition hover:text-emerald-300" href="#operators">For operators</a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-slate-300">
              <MapPin className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              <span className="sr-only">Choose a city for Google Maps search</span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="max-w-32 cursor-pointer border-0 bg-transparent py-0 pl-0 pr-5 text-sm font-semibold text-slate-100 focus:ring-0"
                aria-label="Choose a city"
              >
                {cities.map((cityName) => <option className="bg-slate-900 text-slate-100" key={cityName}>{cityName}</option>)}
              </select>
            </label>
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Create account
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isMenuOpen && (
          <nav className="border-t border-slate-800 bg-slate-950 px-4 py-3 sm:hidden" aria-label="Mobile navigation">
            <a onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900" href="#how-it-works">How it works</a>
            <a onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900" href="#features">Features</a>
            <a onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-900" href="#operators">For operators</a>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
              <button onClick={onSignIn} className="rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-bold text-slate-200">Sign in</button>
              <button onClick={onRegister} className="rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Create account</button>
            </div>
          </nav>
        )}
      </header>

      <main id="top" className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Find. Reserve.
                <span className="block text-emerald-300">Charge. Go.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                Find charging stations, compare listed prices in rupees, and reserve a time slot before you set off.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Find charging stations <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-100 transition hover:border-emerald-500/60 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  See how it works <ArrowDown className="h-4 w-4" />
                </a>
              </div>

              <form
                className="mt-9 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-lg shadow-black/20 sm:flex sm:items-center sm:gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  window.open(mapSearch, '_blank', 'noopener,noreferrer');
                }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
                  <Search className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                  <label className="sr-only" htmlFor="landing-area">Area or landmark</label>
                  <input
                    id="landing-area"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    placeholder={`Area or landmark in ${city}`}
                    className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:ring-0"
                  />
                </div>
                <label className="sr-only" htmlFor="mobile-city">City</label>
                <select
                  id="mobile-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-2 w-full rounded-lg border-slate-700 bg-slate-800 text-sm font-semibold text-slate-100 focus:border-emerald-400 focus:ring-emerald-400 sm:hidden"
                >
                  {cities.map((cityName) => <option className="bg-slate-900 text-slate-100" key={cityName}>{cityName}</option>)}
                </select>
                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:mt-0 sm:w-auto"
                >
                  Search Maps <ExternalLink className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
                <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                Opens Google Maps in a new tab. This site uses only the area you enter; it does not request device location.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.7)]">
                <img
                  src={chargingStationImage}
                  alt="Electric vehicle charging station"
                  className="h-[340px] w-full object-cover sm:h-[440px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-emerald-500/30 bg-slate-950/95 p-4 shadow-lg sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-emerald-100">
                      <PlugZap className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-white">The right charger, with less guesswork</p>
                      <p className="mt-1 text-sm leading-5 text-slate-300">Check station details, available ports, connector types, and listed tariffs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Make every charging stop count.</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">One place to explore station details and plan your next charge.</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm shadow-black/10">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-900/60 text-emerald-300"><Navigation className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-bold text-white">Find a station</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Search by area, adjust the distance, and filter by connector, charging speed, or availability.</p>
            </article>
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm shadow-black/10">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-900/60 text-emerald-300"><CalendarClock className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-bold text-white">Plan a charging slot</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Review port and station details, then reserve a suitable time in the booking flow.</p>
            </article>
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm shadow-black/10">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-900/60 text-emerald-300"><WalletCards className="h-5 w-5" /></span>
              <h3 className="mt-5 text-lg font-bold text-white">Compare listed tariffs</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">See the station's listed price per kWh in ₹ and an estimated cost during booking.</p>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-slate-900/70 py-16 text-white lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">A clearer route to your next charge.</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">Move from searching to booking with the information you need at each step.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <span className="text-sm font-bold text-emerald-300">Locate</span>
                  <p className="mt-3 text-sm leading-6 text-slate-200">Choose a location and narrow results using practical filters.</p>
                </article>
                <article className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <span className="text-sm font-bold text-emerald-300">Compare</span>
                  <p className="mt-3 text-sm leading-6 text-slate-200">Check connector, power, port status, and listed price.</p>
                </article>
                <article className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <span className="text-sm font-bold text-emerald-300">Reserve</span>
                  <p className="mt-3 text-sm leading-6 text-slate-200">Select an available port and confirm your booking details.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-20">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">A station finder built around your choices.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">Explore the station directory on a map or as a list, then narrow the options to match your vehicle and trip.</p>
            <ul className="mt-7 space-y-3">
              {['Connector and charging-speed filters', 'Search radius up to 60 km', 'Availability and listed tariff details'].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/60 text-emerald-300"><Check className="h-4 w-4" /></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-emerald-500/15 bg-slate-900 p-6 shadow-lg shadow-black/20 sm:p-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-300">VoltSpot station finder</p>
                  <p className="mt-1 text-xl font-extrabold text-white">Your route, your filters.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-emerald-100"><MapPin className="h-5 w-5" /></span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {['CCS2', 'Type 2', 'CHAdeMO', 'Fast DC', 'Up to 60 km'].map((filter) => (
                  <span key={filter} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200">{filter}</span>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-200">Station details</span>
                  <span className="font-bold text-emerald-300">Prices in ₹</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-700">
                  <div className="h-full w-2/3 rounded-full bg-emerald-500" />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">Sample interface preview. Station availability and coverage depend on the directory data.</p>
              </div>
              <button
                type="button"
                onClick={onSignIn}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Open station finder <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section id="operators" className="scroll-mt-24 border-y border-slate-800 bg-slate-900/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Operate a charging station?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Create an operator account to manage station information, ports, and listed tariffs in the operator portal.</p>
            </div>
            <button
              type="button"
              onClick={onOperatorRegister}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-950 px-5 py-3 text-sm font-bold text-emerald-300 transition hover:border-emerald-400/70 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Register as an operator <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-3xl border border-emerald-500/30 bg-emerald-900 px-6 py-10 text-white shadow-xl shadow-emerald-950/30 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Ready to plan your next charging stop?</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-200">Sign in to browse stations, review details, and manage your bookings.</p>
            </div>
            <button
              type="button"
              onClick={onRegister}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-emerald-950 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
          <div>
            <a href="#top" className="inline-flex items-center gap-2 text-lg font-extrabold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-emerald-100"><Zap className="h-4 w-4 fill-current" /></span>
              Volt<span className="-ml-2 text-emerald-300">Spot</span>
            </a>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">A clearer way to find EV charging stations, compare listed tariffs, and plan bookings.</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Explore</h3>
            <a className="mt-3 block text-sm text-slate-300 hover:text-emerald-300" href="#features">Features</a>
            <a className="mt-2 block text-sm text-slate-300 hover:text-emerald-300" href="#how-it-works">How it works</a>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Get started</h3>
            <button onClick={onSignIn} className="mt-3 block text-sm text-slate-300 hover:text-emerald-300">Sign in</button>
            <button onClick={onOperatorRegister} className="mt-2 block text-sm text-slate-300 hover:text-emerald-300">Station operators</button>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400">
          Current station data may include demo entries; nationwide live coverage is not connected.
        </div>
      </footer>
    </div>
  );
};
