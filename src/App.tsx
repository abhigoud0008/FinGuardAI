import React, { useState, useEffect } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ScamDetector } from './components/scam-detector/ScamDetector';
import { BudgetAnalyzer } from './components/budget/BudgetAnalyzer';
import { PortfolioAnalyzer } from './components/portfolio/PortfolioAnalyzer';
import { TaxAssistant } from './components/tax/TaxAssistant';
import { FinancialCoach } from './components/coach/FinancialCoach';
import { Simulators } from './components/simulators/Simulators';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { FutureMeSimulator } from './components/simulator/FutureMeSimulator';
import { FamilyProtectionCenter } from './components/family/FamilyProtectionCenter';
import { GoalPlanner } from './components/goals/GoalPlanner';
import { FirestoreSchemaModal } from './components/architecture/FirestoreSchemaModal';
import { AuthModal } from './components/auth/AuthModal';
import {
  LayoutDashboard,
  ShieldAlert,
  Wallet,
  TrendingUp,
  FileSpreadsheet,
  Bot,
  Calculator,
  LineChart,
  Compass,
  Users,
  Target,
  Sparkles,
} from 'lucide-react';

function AppContent() {
  const { isAuthModalOpen, closeAuthModal } = useFinance();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Workspace Sub-Header Bar (Prioritized Order) */}
      {activeTab !== 'landing' && (
        <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-x-auto">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => handleTabClick('scam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'scam'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                  : 'text-red-400 hover:bg-red-500/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>1. Scam Shield (1930)</span>
            </button>

            <button
              onClick={() => handleTabClick('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>2. FinGuard Score</span>
            </button>

            <button
              onClick={() => handleTabClick('budget')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'budget'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>3. Smart Budgeting</span>
            </button>

            <button
              onClick={() => handleTabClick('future-me')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'future-me'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>4. Future Me Simulator</span>
            </button>

            <button
              onClick={() => handleTabClick('coach')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'coach'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>5. AI Coach (Voice)</span>
            </button>

            <button
              onClick={() => handleTabClick('goals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'goals'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>6. Goal Planner</span>
            </button>

            <button
              onClick={() => handleTabClick('tax')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'tax'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>7. Tax Assistant</span>
            </button>

            <button
              onClick={() => handleTabClick('portfolio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-teal-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>8. Portfolio</span>
            </button>

            <button
              onClick={() => handleTabClick('family')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'family'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Family Guard</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'landing' && (
          <LandingPage
            onStart={() => setActiveTab('dashboard')}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab)} />}

        {activeTab === 'scam' && <ScamDetector />}

        {activeTab === 'budget' && <BudgetAnalyzer />}

        {activeTab === 'future-me' && <FutureMeSimulator />}

        {activeTab === 'family' && <FamilyProtectionCenter />}

        {activeTab === 'goals' && <GoalPlanner />}

        {activeTab === 'portfolio' && <PortfolioAnalyzer />}

        {activeTab === 'tax' && <TaxAssistant />}

        {activeTab === 'coach' && <FinancialCoach />}

        {activeTab === 'analytics' && <AnalyticsPage />}

        {activeTab === 'simulators' && <Simulators />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">FinGuard AI</span>
            <span aria-hidden="true">·</span>
            <span>India&apos;s AI Financial Safety Copilot</span>
            <span aria-hidden="true">·</span>
            <span>Helpline 1930 &amp; MHA Integrated</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Firestore Schema
            </button>
            <button
              onClick={() => setActiveTab('scam')}
              className="text-red-400 hover:underline transition-colors cursor-pointer"
            >
              Helpline 1930 Portal
            </button>
            <button
              onClick={() => setActiveTab('landing')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Mission &amp; Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication Gateway Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      {/* Architecture & DB Schema Modal */}
      <FirestoreSchemaModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
