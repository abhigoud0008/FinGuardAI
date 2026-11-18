import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  Sparkles, 
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const FinGuardScoreCard: React.FC = () => {
  const { finguardScore } = useFinance();
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const getTierColor = (level: string) => {
    switch (level) {
      case 'Elite':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Secure':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'Growing':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Vulnerable':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'High Risk':
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const getGaugeStrokeColor = (score: number) => {
    if (score >= 90) return '#34d399'; // emerald-400
    if (score >= 75) return '#2dd4bf'; // teal-400
    if (score >= 60) return '#fbbf24'; // amber-400
    if (score >= 40) return '#fb923c'; // orange-400
    return '#f87171'; // red-400
  };

  // SVG Gauge calculations (semi-circle / 260 deg arc)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (finguardScore.overall / 100) * (circumference * 0.75);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">FinGuard Financial Safety Score</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Proprietary 0–100 Algorithm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Composite metric weighting safety, liquidity resilience, scam alertness, and net savings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Mathematical Formulas</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gauge + Summary + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        {/* Left: Circular Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-800"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={getGaugeStrokeColor(finguardScore.overall)}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">{finguardScore.overall}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Out of 100</span>
              <span className={`mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${getTierColor(finguardScore.level)}`}>
                {finguardScore.level}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {finguardScore.level === 'Elite' && 'Superlative safety & financial discipline. Immune to predatory credit.'}
              {finguardScore.level === 'Secure' && 'Healthy safety cushion & robust scam defenses. Low vulnerability.'}
              {finguardScore.level === 'Growing' && 'Good baseline, but emergency runway or high-risk exposure needs tuning.'}
              {finguardScore.level === 'Vulnerable' && 'High exposure to sudden shocks. Action required on emergency fund.'}
              {finguardScore.level === 'High Risk' && 'Critical vulnerability. Urgent budget restructuring and fraud shield required.'}
            </p>
          </div>
        </div>

        {/* Center: 6 Weighted Components breakdown */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>6-Pillar Safety Architecture</span>
            <span>Weight & Score</span>
          </div>

          {finguardScore.components.map((comp) => {
            const pct = Math.min(100, Math.round((comp.score / comp.maxScore) * 100));
            return (
              <div 
                key={comp.name} 
                onClick={() => setSelectedComponent(selectedComponent === comp.name ? null : comp.name)}
                className="p-2.5 bg-slate-950/40 hover:bg-slate-800/40 rounded-lg border border-slate-800/80 cursor-pointer transition"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-200">{comp.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Weight: {comp.weight}%</span>
                    <span className="font-bold text-white">{comp.score}/{comp.maxScore}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {selectedComponent === comp.name && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                    <p><span className="text-slate-300 font-semibold">Formula:</span> <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">{comp.formula}</code></p>
                    <p><span className="text-slate-300 font-semibold">Status:</span> {comp.status}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Trend Mini Chart */}
        <div className="lg:col-span-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                6-Month Trajectory
              </span>
              <span className="text-emerald-400 font-bold">+18 pts</span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finguardScore.historicalTrend} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" domain={[40, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#scoreTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="font-semibold text-emerald-300 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Next Level Milestone
            </span>
            <p className="text-[11px] text-slate-300">
              Increase emergency runway by 1.2 months to reach <span className="text-white font-bold">Elite Tier (90+)</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Formula Deep Dive Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">FinGuard Score Algorithmic Weightage</h3>
              </div>
              <button 
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-300">
              <p>
                Unlike generic credit scores that only measure loan repayment, the 
                <strong className="text-white"> FinGuard Score</strong> evaluates holistic financial safety, 
                cybersecurity awareness, and emergency survivability.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">1. Savings Ratio (25% Weight)</div>
                  <code className="text-[11px] text-slate-400 block mb-1">Score = (Monthly Savings / Monthly Income) × 100</code>
                  <p className="text-[11px] text-slate-400">Target: ≥ 30% for full 25 points.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-teal-400 mb-1">2. Emergency Fund Runway (20% Weight)</div>
                  <code className="text-[11px] text-slate-400 block mb-1">Months = Cash Reserves / Monthly Expenses</code>
                  <p className="text-[11px] text-slate-400">Target: ≥ 6 months for full 20 points.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-blue-400 mb-1">3. Debt-to-Income Ratio (15% Weight)</div>
                  <code className="text-[11px] text-slate-400 block mb-1">DTI = (Total Monthly EMIs / Income) × 100</code>
                  <p className="text-[11px] text-slate-400">Target: &lt; 20% for full 15 points. (&gt; 45% = 0 pts)</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-indigo-400 mb-1">4. Investment Diversification (15% Weight)</div>
                  <code className="text-[11px] text-slate-400 block mb-1">Asset Mix (Equity + Debt + Gold + PPF/FD)</code>
                  <p className="text-[11px] text-slate-400">Target: 3+ non-correlated asset classes.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1">5. Tax Efficiency (10% Weight)</div>
                  <code className="text-[11px] text-slate-400 block mb-1">Deductions Claimed / Eligible Deductions</code>
                  <p className="text-[11px] text-slate-400">Target: Optimized 80C, 80D, NPS regime choice.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-rose-400 mb-1">6. Fraud Safety Awareness (15% Weight)</div>
                  <code className="text-[11px] text-slate-400 block mb-1">Scam Shield Scans + Reported Unknown UPI/SMS</code>
                  <p className="text-[11px] text-slate-400">Target: Zero unverified link clicks &amp; active shield checks.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-semibold text-white">Score Tier Benchmarks:</span>
                <div className="grid grid-cols-5 gap-2 text-center mt-2">
                  <div className="p-1.5 rounded bg-red-950/40 border border-red-900 text-[10px]">
                    <div className="font-bold text-red-400">High Risk</div>
                    <div className="text-slate-400">0 – 39</div>
                  </div>
                  <div className="p-1.5 rounded bg-orange-950/40 border border-orange-900 text-[10px]">
                    <div className="font-bold text-orange-400">Vulnerable</div>
                    <div className="text-slate-400">40 – 59</div>
                  </div>
                  <div className="p-1.5 rounded bg-amber-950/40 border border-amber-900 text-[10px]">
                    <div className="font-bold text-amber-400">Growing</div>
                    <div className="text-slate-400">60 – 74</div>
                  </div>
                  <div className="p-1.5 rounded bg-teal-950/40 border border-teal-900 text-[10px]">
                    <div className="font-bold text-teal-400">Secure</div>
                    <div className="text-slate-400">75 – 89</div>
                  </div>
                  <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-900 text-[10px]">
                    <div className="font-bold text-emerald-400">Elite</div>
                    <div className="text-slate-400">90 – 100</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
