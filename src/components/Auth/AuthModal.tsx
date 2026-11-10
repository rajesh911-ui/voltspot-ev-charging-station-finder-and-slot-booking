import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { useToast } from '../Toast';
import { UserRole } from '../../types';
import Antigravity from '../Antigravity/Antigravity.jsx';
import { X, UserCheck, ShieldCheck, Wrench, Car, LogOut, ArrowRight, Mail, Phone, Lock, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { user, login, register, logout, quickSwitchUser } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('DRIVER');

  const demoAccounts = [
    {
      id: 1,
      roleName: 'EV Driver',
      name: 'Alex Rivera',
      email: 'driver@voltspot.io',
      icon: Car,
      desc: 'Can search stations, manage EV garage, book slots, view costs',
    },
    {
      id: 2,
      roleName: 'Station Operator',
      name: 'Marcus Vance',
      email: 'operator@voltspot.io',
      icon: Wrench,
      desc: 'Manage stations, toggle ports Available/In-Use, see station revenue',
    },
    {
      id: 3,
      roleName: 'Platform Admin',
      name: 'Sarah Chen',
      email: 'admin@voltspot.io',
      icon: ShieldCheck,
      desc: 'Approve operators & stations, audit bookings, view system telemetry',
    },
    {
      id: 4,
      roleName: 'Pending Operator',
      name: 'Elena Rostova',
      email: 'elena@greencharge.com',
      icon: UserCheck,
      desc: 'Newly registered operator waiting for Admin approval',
    },
  ];

  const handleQuickLogin = (id: number, roleName: string) => {
    quickSwitchUser(id);
    showToast('success', 'Logged In', `Switched to ${roleName}`);
    onClose();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('error', 'Validation Error', 'Please enter your email.');
      return;
    }

    const success = login(email.trim());
    if (success) {
      showToast('success', 'Welcome Back', `Logged in as ${email}`);
      onClose();
    } else {
      showToast('error', 'User Not Found', 'No account found with this email. Try quick demo accounts or register.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast('error', 'Validation Error', 'Please fill in all registration fields.');
      return;
    }

    const newUser = register(name.trim(), email.trim(), phone.trim(), role);
    showToast(
      'success',
      'Registration Complete',
      `Account created for ${newUser.name} (${role}).`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Interactive Antigravity Banner Header */}
        <div className="relative h-28 w-full overflow-hidden bg-slate-950 flex-shrink-0 border-b border-slate-800">
          <div className="absolute inset-0">
            <Antigravity
              colors={['#20a36a', '#2dd4bf', '#75d8a6', '#11865a']}
              count={700}
              magnetRadius={8}
              ringRadius={6}
              particleSize={0.85}
              autoAnimate={true}
              interactive={true}
              clickBurst={true}
              fieldStrength={10}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 p-4 flex items-center justify-between z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Antigravity EV Auth</span>
              </div>
              <h3 className="text-base font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                VoltSpot EV India
              </h3>
              <p className="text-xs text-emerald-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">
                Sign In to book charging slots in Indian Rupees (₹)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors shadow-sm"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Demo Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1-Click Instant Demo Profiles
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                Pre-configured JWT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => {
                const IconComponent = acc.icon;
                const isCurrent = user?.id === acc.id;

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickLogin(acc.id, acc.roleName)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {acc.roleName}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-1 truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {acc.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Or Custom Auth
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Form Tabs: Login vs Register */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Register New Account
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@voltspot.io"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Sign In with Spring Boot JWT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setRole('DRIVER')}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      role === 'DRIVER'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    EV Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('OPERATOR')}
                    className={`p-2.5 rounded-lg border text-left text-xs ${
                      role === 'OPERATOR'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Station Operator
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {user && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  logout();
                  showToast('info', 'Logged Out', 'You have been signed out.');
                  onClose();
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Current User</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
