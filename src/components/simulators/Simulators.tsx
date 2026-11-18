import React, { useState } from 'react';
import {
  Calculator,
  Target,
  Sparkles,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldAlert,
  Flame,
  Award,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types/finance';

export const Simulators: React.FC = () => {
  const { goals, addGoal, updateGoalProgress } = useFinance();
  const [activeTab, setActiveTab] = useState<'emi' | 'goals' | 'credit'>('emi');

  // EMI State
  const [loanPrincipal, setLoanPrincipal] = useState(1500000); // 15 Lakhs home/car loan
  const [interestRate, setInterestRate] = useState(9.5); // 9.5%
  const [loanTenureYears, setLoanTenureYears] = useState(10); // 10 years
  const [extraPrepaymentMonthly, setExtraPrepaymentMonthly] = useState(3000); // ₹3,000 extra/mo

  // Goal Form State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '2027-12-31',
    category: 'Emergency' as const,
  });

  // Credit Simulator State
  const [creditCardLimit, setCreditCardLimit] = useState(200000);
  const [creditCardSpend, setCreditCardSpend] = useState(65000);
  const [onTimePayments, setOnTimePayments] = useState(true);
  const [hasRecentEnquiries, setHasRecentEnquiries] = useState(false);

  // Calculate Base EMI
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const baseEmi = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const totalBasePayment = baseEmi * totalMonths;
  const totalBaseInterest = totalBasePayment - loanPrincipal;

  // Calculate Prepayment Impact
  let balance = loanPrincipal;
  let monthsWithExtra = 0;
  let totalInterestWithExtra = 0;
  const effectiveMonthlyPayment = baseEmi + extraPrepaymentMonthly;

  while (balance > 0 && monthsWithExtra < totalMonths * 2) {
    monthsWithExtra++;
    const interestForMonth = balance * monthlyRate;
    totalInterestWithExtra += interestForMonth;
    const principalPaid = effectiveMonthlyPayment - interestForMonth;
    balance -= principalPaid;
    if (balance <= 0) break;
  }

  const interestSaved = Math.max(0, Math.round(totalBaseInterest - totalInterestWithExtra));
  const monthsSaved = Math.max(0, totalMonths - monthsWithExtra);
  const yearsSaved = (monthsSaved / 12).toFixed(1);

  // Alternative: Investing Extra Prepayment into 12% Nifty 50 SIP
  const sipFutureValue = Math.round(
    extraPrepaymentMonthly *
      ((Math.pow(1 + 0.12 / 12, totalMonths) - 1) / (0.12 / 12)) *
      (1 + 0.12 / 12)
  );

  // Credit Score Calculator
  const utilization = Math.round((creditCardSpend / (creditCardLimit || 1)) * 100);
  let simulatedScore = 740;
  if (utilization <= 30) simulatedScore += 35;
  else if (utilization > 50) simulatedScore -= 40;
  if (!onTimePayments) simulatedScore -= 70;
  if (hasRecentEnquiries) simulatedScore -= 20;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) return;
    addGoal({
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || '0'),
      targetDate: newGoal.targetDate,
      category: newGoal.category,
    });
    setShowGoalModal(false);
    setNewGoal({
      title: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '2027-12-31',
      category: 'Emergency',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Extra Hackathon Features</span>
            <span aria-hidden="true">·</span>
            <span>Mathematical Decision Engines</span>
            <span aria-hidden="true">·</span>
            <span>Wealth Compounding Tools</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Financial Simulators & Goal Planning
          </h1>
        </div>

        {/* Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('emi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'emi'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Smart EMI Planner
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'goals'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Goal Tracker
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'credit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Credit Score Simulator
          </button>
        </div>
      </div>

      {/* TAB 1: Smart EMI Planner */}
      {activeTab === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <span>Loan & Prepayment Parameters</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-400">Loan Principal</label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{loanPrincipal.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={10000000}
                  step={50000}
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-400">Interest Rate (% p.a.)</label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {interestRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={18}
                  step={0.25}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-400">Tenure (Years)</label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {loanTenureYears} Years ({totalMonths} mo)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between mb-1">
                  <label className="text-blue-600 dark:text-blue-400 font-bold">
                    Extra Monthly Prepayment
                  </label>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    +₹{extraPrepaymentMonthly.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30000}
                  step={500}
                  value={extraPrepaymentMonthly}
                  onChange={(e) => setExtraPrepaymentMonthly(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Paying even a small extra surplus straight towards principal bypasses compounding interest.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500">Standard Monthly EMI</span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                  ₹{baseEmi.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Total interest without prepayment: ₹{Math.round(totalBaseInterest).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 shadow-sm">
                <span className="text-xs text-emerald-400 font-semibold">Interest Saved via Prepayment</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                  ₹{interestSaved.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Loan closes <strong className="text-white">{yearsSaved} years earlier</strong>!
                </div>
              </div>
            </div>

            {/* Crucial Decision Matrix: Prepay Loan vs Invest in SIP */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>AI Financial Dilemma: Prepay Loan vs Invest in Nifty 50 SIP?</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Option A: Prepay Loan (Guaranteed {interestRate}% Return)
                  </span>
                  <p className="text-slate-500">
                    Guaranteed, zero-risk return by extinguishing debt. You save ₹{interestSaved.toLocaleString('en-IN')} in interest and finish your loan in {(monthsWithExtra / 12).toFixed(1)} years.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block">
                    Option B: Invest ₹{extraPrepaymentMonthly}/mo in Equity SIP (~12%)
                  </span>
                  <p className="text-slate-500">
                    The same monthly surplus invested in index funds can grow to <strong className="text-emerald-500 font-mono">₹{sipFutureValue.toLocaleString('en-IN')}</strong> over {loanTenureYears} years, generating wealth that exceeds interest saved.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-950 dark:text-blue-200">
                <strong>FinGuard Verdict:</strong> If your loan interest rate is &gt;10% (e.g. personal or car loan), prioritize aggressive prepayment. If it's a tax-deductible home loan under 8.5%, investing the surplus into equity SIP yields higher net wealth.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Financial Goal Tracker */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Financial Milestones ({goals.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track savings progress and automated targets
              </p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div
                  key={goal.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{goal.category}</span>
                      <span className="font-mono tabular-nums">Target: {goal.targetDate}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {goal.title}
                    </h4>

                    <div className="mt-4 flex items-baseline justify-between text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-base tabular-nums">
                        ₹{goal.currentAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-500 font-mono tabular-nums">
                        of ₹{goal.targetAmount.toLocaleString('en-IN')} ({progress}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      ₹{remaining.toLocaleString('en-IN')} left
                    </span>
                    <button
                      onClick={() => updateGoalProgress(goal.id, 5000)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold cursor-pointer transition-colors"
                    >
                      +₹5,000 Deposit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Goal Modal */}
          {showGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    New Financial Goal
                  </h3>
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="text-slate-400 hover:text-white cursor-pointer text-sm"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Downpayment for EV, Emergency Fund"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        Target (₹)
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="250000"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        Saved So Far (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="50000"
                        value={newGoal.currentAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        Category
                      </label>
                      <select
                        value={newGoal.category}
                        onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Emergency">Emergency</option>
                        <option value="Vehicle">Vehicle</option>
                        <option value="House">House</option>
                        <option value="Travel">Travel</option>
                        <option value="Retirement">Retirement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowGoalModal(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
                    >
                      Save Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Credit Score Simulator */}
      {activeTab === 'credit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>CIBIL / Credit Factors Simulator</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-slate-600 dark:text-slate-400">Monthly Card Spend</label>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{creditCardSpend.toLocaleString('en-IN')} ({utilization}%)
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={creditCardSpend}
                  onChange={(e) => setCreditCardSpend(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-[11px] text-slate-400">
                  Credit bureaus prefer utilization under 30% for a prime score.
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    100% On-Time Payment Track Record
                  </span>
                  <input
                    type="checkbox"
                    checked={onTimePayments}
                    onChange={(e) => setOnTimePayments(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Multiple Hard Loan Inquiries (Last 90 Days)
                  </span>
                  <input
                    type="checkbox"
                    checked={hasRecentEnquiries}
                    onChange={(e) => setHasRecentEnquiries(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-teal-900/30 border border-blue-500/30 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400 block">
                  Simulated Credit Score
                </span>
                <div className="text-4xl font-extrabold font-mono text-white mt-1 tabular-nums">
                  {simulatedScore}{' '}
                  <span className="text-xs font-normal text-slate-400">/ 900</span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold mt-1 block">
                  {simulatedScore >= 750 ? 'Excellent Prime Bracket' : simulatedScore >= 680 ? 'Good / Moderate' : 'Needs Repair'}
                </span>
              </div>

              <div className="w-24 h-24 rounded-full border-4 border-blue-500/40 flex items-center justify-center bg-slate-950 text-2xl font-bold font-mono text-blue-400">
                {simulatedScore}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Proven Steps to Reach 800+
              </h4>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Keep credit card balances strictly below 30% of total credit limit (₹{Math.round(creditCardLimit * 0.3).toLocaleString('en-IN')}).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Enable auto-debit for full statement balance, never just the minimum due.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Never close your oldest credit card; credit age accounts for 15% of your score.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
