import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Clock,
  Car,
  Home,
  Laptop,
  GraduationCap,
  Heart,
  Plane,
  ShieldAlert
} from 'lucide-react';
import { GoalPlan, GoalType } from '../../types/finance';

const GOAL_ICONS: Record<string, any> = {
  Emergency: ShieldAlert,
  'Emergency Fund': ShieldAlert,
  Bike: Car,
  Car: Car,
  Laptop: Laptop,
  House: Home,
  Vacation: Plane,
  Education: GraduationCap,
  Wedding: Heart,
  Retirement: Target,
  Custom: Target
};

export const GoalPlanner: React.FC = () => {
  const { goalPlans, addGoalPlan, userProfile } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('Emergency Buffer (6 Mos)');
  const [goalType, setGoalType] = useState<GoalType>('Emergency');
  const [targetAmount, setTargetAmount] = useState<number>(300000);
  const [currentAmount, setCurrentAmount] = useState<number>(120000);
  const [targetMonths, setTargetMonths] = useState<number>(12);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(15000);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount <= 0) return;

    // Compound / amortization projection
    const remaining = Math.max(0, targetAmount - currentAmount);
    const requiredMonthly = Math.round(remaining / targetMonths);
    const canAchieveRatio = monthlyContribution / (requiredMonthly || 1);
    const probability = Math.min(98, Math.max(25, Math.round(canAchieveRatio * 85)));

    const now = new Date();
    const projDate = new Date();
    projDate.setMonth(now.getMonth() + targetMonths);

    let vehicle = 'Nifty 50 Index Fund SIP (12% CAGR)';
    if (targetMonths <= 12) {
      vehicle = 'High-Yield Liquid Mutual Fund / Arbitrage (7% CAGR)';
    } else if (targetMonths <= 36) {
      vehicle = 'Short-Duration Debt Fund + Large Cap Blend (9% CAGR)';
    }

    const newPlan: GoalPlan = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      goalType,
      targetAmount,
      currentAmount,
      targetMonths,
      monthlyRequired: requiredMonthly,
      projectedDate: projDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      successProbability: probability,
      suggestedVehicle: vehicle,
      status: probability >= 75 ? 'On Track' : 'Needs Attention'
    };

    addGoalPlan(newPlan);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Goal-Based Wealth Planner</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                  Target &amp; Risk Aligned
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Map life milestones (Emergency fund, Car, House, Education) with mathematical certainty. 
                FinGuard calculates monthly SIPs, inflation-adjusted targets, and success probabilities.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Life Goal
          </button>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goalPlans.map((goal) => {
          const goalKind = goal.goalType || goal.type || 'Custom';
          const Icon = GOAL_ICONS[goalKind] || Target;
          const currentAmt = goal.currentAmount ?? goal.currentSavings ?? 0;
          const targetAmt = goal.targetAmount || 1;
          const progressPct = Math.min(100, Math.round((currentAmt / targetAmt) * 100));
          const monthlyReq = goal.monthlyRequired ?? goal.monthlySavingRequired ?? Math.round(targetAmt / (goal.targetMonths || 12));

          return (
            <div
              key={goal.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-lg relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-800 rounded-xl text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{goal.title}</h4>
                      <span className="text-[11px] text-slate-400">{goal.targetMonths || 12} Months Horizon</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    goal.status === 'On Track' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {goal.status || 'On Track'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Accumulated</span>
                    <span className="font-bold text-white">
                      ₹{currentAmt.toLocaleString('en-IN')} / ₹{targetAmt.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        progressPct >= 70 ? 'bg-emerald-400' : progressPct >= 35 ? 'bg-teal-400' : 'bg-indigo-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{progressPct}% Completed</span>
                    <span>₹{Math.max(0, targetAmt - currentAmt).toLocaleString('en-IN')} remaining</span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-800/80 my-3">
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Required Monthly</span>
                    <span className="text-sm font-extrabold text-white">₹{monthlyReq.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Success Probability</span>
                    <span className={`text-sm font-extrabold ${goal.successProbability >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {goal.successProbability}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended vehicle & projected target date */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Completion: <strong className="text-white">{goal.projectedDate}</strong></span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                  <strong className="block text-emerald-200">Recommended Vehicle:</strong>
                  {goal.suggestedVehicle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Life Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Plan a New Financial Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddGoal} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Enfield Hunter 350, Emergency Runway, Bali Vacation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Goal Category</label>
                  <select
                    value={goalType}
                    onChange={(e: any) => setGoalType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Emergency">Emergency Buffer</option>
                    <option value="Bike">Bike / Two Wheeler</option>
                    <option value="Car">Car Purchase</option>
                    <option value="Laptop">Laptop / Tech Gear</option>
                    <option value="House">House Down Payment</option>
                    <option value="Vacation">Vacation / Travel</option>
                    <option value="Education">Education / Certification</option>
                    <option value="Wedding">Wedding / Family Event</option>
                    <option value="Custom">Custom Target</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={5000}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Current Saved So Far (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target Horizon (Months)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={targetMonths}
                    onChange={(e) => setTargetMonths(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Planned Monthly Contribution (₹/month)</label>
                <input
                  type="number"
                  required
                  min={500}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl"
                >
                  Calculate &amp; Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
