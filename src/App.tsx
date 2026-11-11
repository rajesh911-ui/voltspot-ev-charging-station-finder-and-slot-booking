import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { DriverPortal } from './pages/DriverPortal';
import { BookingsManager } from './pages/BookingsManager';
import { OperatorPortal } from './pages/OperatorPortal';
import { AdminPortal } from './pages/AdminPortal';
import { LoginPage } from './pages/LoginPage';
import { AuthModal } from './components/Auth/AuthModal';
import { BackendExplorerModal } from './components/BackendExplorer/BackendExplorerModal';
import { Zap, ShieldCheck, Heart } from 'lucide-react';

function AppContent() {
  const { role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBackendExplorerOpen, setIsBackendExplorerOpen] = useState(false);
  const isLoginScreen = currentTab === 'login';

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('voltspot_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('voltspot_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('voltspot_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync tab if user changes role directly
  useEffect(() => {
    if (role === 'OPERATOR' && currentTab === 'admin') {
      setCurrentTab('operator');
    } else if (role === 'ADMIN' && currentTab === 'operator') {
      setCurrentTab('admin');
    }
  }, [role, currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {!isLoginScreen && (
        <>
          <Navbar
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab)}
            onOpenBackendExplorer={() => setIsBackendExplorerOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {currentTab === 'finder' && (
              <DriverPortal onOpenBackendExplorer={() => setIsBackendExplorerOpen(true)} />
            )}

            {currentTab === 'bookings' && <BookingsManager />}

            {currentTab === 'operator' && <OperatorPortal />}

            {currentTab === 'admin' && <AdminPortal />}
          </main>

          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  VoltSpot EV Platform
                </span>
                <span>·</span>
                <span>Spring Boot 3 + MySQL 8 + React</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsBackendExplorerOpen(true)}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Spring Boot Architecture Hub
                </button>
                <span>·</span>
                <span>Zero Double-Booking Guarantee</span>
                <span>·</span>
                <span>Haversine Geo-Search</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {isLoginScreen && (
        <LoginPage
          onLoginSuccess={() => setCurrentTab('finder')}
          onBackToHome={() => setCurrentTab('finder')}
        />
      )}

      {!isLoginScreen && isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
      {!isLoginScreen && isBackendExplorerOpen && (
        <BackendExplorerModal onClose={() => setIsBackendExplorerOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
