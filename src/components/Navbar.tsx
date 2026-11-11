import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Sun, Moon, Code2, User, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenBackendExplorer: () => void;
  onOpenAuthModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenBackendExplorer,
  onOpenAuthModal,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = user?.role;
  const homeTab = role === 'OPERATOR' ? 'operator' : role === 'ADMIN' ? 'admin' : 'finder';
  const navItems = role === 'DRIVER'
    ? [
        { tab: 'finder', label: 'Find Chargers' },
        { tab: 'bookings', label: 'My Bookings' },
      ]
    : role === 'OPERATOR'
    ? [{ tab: 'operator', label: 'Operator Portal' }]
    : role === 'ADMIN'
    ? [{ tab: 'admin', label: 'Admin Panel' }]
    : [];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onTabChange(homeTab)}
            className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              VoltSpot<span className="text-emerald-600 dark:text-emerald-400">EV</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          {navItems.map(({ tab, label }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-slate-100 ${
                currentTab === tab
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : ''
              }`}
            >
              {label}
            </button>
          ))}

          <button
            onClick={onOpenBackendExplorer}
            className="whitespace-nowrap shrink-0 flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Spring Boot API</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle light/dark theme"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={`Account options for ${user.name}`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onTabChange('login')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2">
          {navItems.map(({ tab, label }) => (
            <button
              key={tab}
              onClick={() => {
                onTabChange(tab);
                setIsMobileMenuOpen(false);
              }}
              aria-current={currentTab === tab ? 'page' : undefined}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                currentTab === tab
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};
