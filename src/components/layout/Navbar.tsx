import React from 'react';
import { ShieldAlert, Sun, Moon, Sparkles, Terminal, LogOut, KeyRound, Compass, Users, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenArchitecture }) => {
  const { isDarkMode, toggleDarkMode, isAuthenticated, currentUser, userProfile, openAuthModal, logout } =
    useFinance();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Brand wordmark */}
        <button
          onClick={() => setActiveTab('landing')}
          className="text-left text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2 group cursor-pointer"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-all">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-slate-900 dark:text-white font-extrabold text-base">FinGuard</span>
              <span className="text-emerald-500 font-extrabold text-base">AI</span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider">India's Safety Copilot</span>
          </div>
        </button>

        {/* Prioritized Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scam')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'scam'
                ? 'bg-red-500/10 text-red-500 font-bold border border-red-500/30'
                : 'hover:text-red-400'
            }`}
          >
            🛡️ Scam Shield (1930)
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            FinGuard Score
          </button>
          <button
            onClick={() => setActiveTab('future-me')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'future-me'
                ? 'bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30'
                : 'hover:text-purple-400'
            }`}
          >
            Future Me Simulator
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'family'
                ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/30'
                : 'hover:text-indigo-400'
            }`}
          >
            Family Guard
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'budget'
                ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Spending
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'goals'
                ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                : 'hover:text-emerald-400'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'coach'
                ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            AI Coach
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`cursor-pointer transition-all whitespace-nowrap px-2.5 py-1 rounded-lg ${
              activeTab === 'tax'
                ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tax
          </button>
        </nav>

        {/* Action cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenArchitecture}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <span>Architecture &amp; DB</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {(currentUser?.username || userProfile.name).charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                    @{currentUser?.username || userProfile.username || 'user'}
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Protected
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log Out of your account"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
