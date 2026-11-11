import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast';
import Antigravity from '../Antigravity/Antigravity.jsx';
import { LogOut, Sparkles, X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  if (!user) return null;

  const handleSignOut = () => {
    logout();
    showToast('info', 'Logged Out', 'You have been signed out.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-lg w-full overflow-hidden">
        <div className="relative h-28 w-full overflow-hidden bg-slate-950 border-b border-slate-800">
          <div className="absolute inset-0">
            <Antigravity
              color={undefined}
              colors={['#20a36a', '#2dd4bf', '#75d8a6', '#11865a']}
              count={700}
              magnetRadius={8}
              ringRadius={6}
              particleSize={0.85}
              autoAnimate={true}
              interactive={true}
              clickBurst={true}
              fieldStrength={10}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 p-4 flex items-center justify-between z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>VoltSpot Account</span>
              </div>
              <h3 className="text-base font-extrabold text-white">Account details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
              title="Close"
              aria-label="Close account details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Signed in as
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {user.role === 'DRIVER'
                ? 'EV Driver'
                : user.role === 'OPERATOR'
                ? 'VoltPowerIndia Operator'
                : 'Central Administrator'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-2 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
