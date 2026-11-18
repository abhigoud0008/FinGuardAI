import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Compass, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShoppingBag, 
  Bike, 
  Laptop, 
  Plane, 
  CreditCard, 
  ShieldCheck,
  History,
  Info
} from 'lucide-react';
import { FutureMeSimulation } from '../../types/finance';

interface PresetItem {
  name: string;
  category: 'Purchase' | 'Loan' | 'Investment' | 'Lifestyle';
  cost: number;
  icon: any;
  paymentType: 'Cash' | 'EMI' | 'Loan';
  emiMonths?: number;
  emiAmount?: number;
}

const PRESETS: PresetItem[] = [
  {
    name: 'iPhone 16 Pro Max',
    category: 'Purchase',
    cost: 135000,
    icon: ShoppingBag,
    paymentType: 'Cash'
  },
  {
    name: 'Royal Enfield Hunter 350',
    category: 'Purchase',
    cost: 175000,
    icon: Bike,
    paymentType: 'EMI',
    emiMonths: 24,
    emiAmount: 8500
  },
  {
    name: 'MacBook Pro M3 Max',
    category: 'Purchase',
    cost: 199900,
    icon: Laptop,
    paymentType: 'Cash'
  },
  {
    name: 'Europe 10-Day Vacation',
    category: 'Lifestyle',
    cost: 250000,
    icon: Plane,
    paymentType: 'Cash'
  },
  {
    name: 'Instant Personal Loan',
    category: 'Loan',
    cost: 300000,
    icon: CreditCard,
    paymentType: 'Loan',
    emiMonths: 36,
    emiAmount: 11000
  }
];

export const FutureMeSimulator: React.FC = () => {
  const { userProfile, finguardScore, simulations, addSimulation, simulateDecision } = useFinance();

  // Form states
  const [purchaseName, setPurchaseName] = useState('Apple iPhone 16 Pro');
  const [category, setCategory] = useState<'Purchase' | 'Loan' | 'Investment' | 'Lifestyle'>('Purchase');
  const [cost, setCost] = useState<number>(85000);
  const [paymentType, setPaymentType] = useState<'Cash' | 'EMI' | 'Loan'>('Cash');
  const [emiMonths, setEmiMonths] = useState<number>(12);
  const [emiAmount, setEmiAmount] = useState<number>(7500);

  // Financial baseline overrides (prefilled from profile)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(userProfile.monthlyIncome || 95000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(userProfile.monthlyExpenses || 42000);
  const [currentEmergencyFund, setCurrentEmergencyFund] = useState<number>(userProfile.emergencyFund || 250000);
  const [currentDebt, setCurrentDebt] = useState<number>(userProfile.totalDebt || 35000);

  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<FutureMeSimulation | null>(simulations[0] || null);

  const handleRunSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!purchaseName.trim() || cost <= 0) return;

    setLoading(true);
    try {
      const res = await simulateDecision({
        purchaseName,
        category,
        cost,
        paymentType,
        emiMonths: paymentType !== 'Cash' ? emiMonths : undefined,
        emiAmount: paymentType !== 'Cash' ? (emiAmount || Math.round((cost * 1.12) / emiMonths)) : undefined,
        currentIncome: monthlyIncome,
        monthlyExpenses,
        emergencyFund: currentEmergencyFund,
        debt: currentDebt
      });

      setCurrentResult(res);
      addSimulation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (p: PresetItem) => {
    setPurchaseName(p.name);
    setCategory(p.category);
    setCost(p.cost);
    setPaymentType(p.paymentType);
    if (p.emiMonths) setEmiMonths(p.emiMonths);
    if (p.emiAmount) setEmiAmount(p.emiAmount);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Safe':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Moderate':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'High Risk':
      case 'Critical':
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-2xl text-purple-400">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Future Me Financial Simulator</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-900/60 text-purple-300 border border-purple-700">
                  Pre-Purchase Decision AI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Before you swipe or take an EMI, simulate its true impact. FinGuard calculates your emergency runway drop, 
                FinGuard Safety Score erosion, and goal delays before you commit real money.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0">Popular Decisions:</span>
        {PRESETS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.name}
              onClick={() => handleSelectPreset(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 shrink-0 transition"
            >
              <Icon className="w-3.5 h-3.5 text-purple-400" />
              <span>{p.name} (₹{(p.cost / 1000).toFixed(0)}k)</span>
            </button>
          );
        })}
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Decision Parameters
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">What are you planning to buy / do?</label>
              <input
                type="text"
                required
                value={purchaseName}
                onChange={(e) => setPurchaseName(e.target.value)}
                placeholder="e.g. Royal Enfield Hunter 350, iPhone 16 Pro, Bali Trip"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Purchase">Gadget / Vehicle</option>
                  <option value="Lifestyle">Vacation / Event</option>
                  <option value="Loan">Personal Loan</option>
                  <option value="Investment">Lump-sum Investment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Total Cost (₹)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Payment Method</label>
                <select
                  value={paymentType}
                  onChange={(e: any) => setPaymentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Cash">Full Cash / Debit Card</option>
                  <option value="EMI">No-Cost / Credit Card EMI</option>
                  <option value="Loan">Bank / NBFC Loan</option>
                </select>
              </div>

              {paymentType !== 'Cash' ? (
                <div>
                  <label className="block text-slate-400 mb-1">Tenure (Months)</label>
                  <select
                    value={emiMonths}
                    onChange={(e) => setEmiMonths(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={6}>6 Months</option>
                    <option value={9}>9 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={18}>18 Months</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 mb-1">Emergency Fund (₹)</label>
                  <input
                    type="number"
                    value={currentEmergencyFund}
                    onChange={(e) => setCurrentEmergencyFund(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {paymentType !== 'Cash' && (
              <div>
                <label className="block text-slate-400 mb-1">Estimated Monthly EMI (₹)</label>
                <input
                  type="number"
                  value={emiAmount || Math.round((cost * 1.12) / emiMonths)}
                  onChange={(e) => setEmiAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/20 text-xs flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>Simulating Financial Consequences...</>
              ) : (
                <>
                  <Compass className="w-4 h-4" /> Simulate Future Impact Now
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Comparison Result */}
        <div className="lg:col-span-7 space-y-4">
          {currentResult ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Simulated Decision</span>
                  <h3 className="text-xl font-extrabold text-white">{currentResult.purchaseName}</h3>
                  <p className="text-xs text-purple-400 font-semibold">
                    ₹{currentResult.cost.toLocaleString('en-IN')} via {currentResult.paymentType}
                    {currentResult.emiMonths ? ` (${currentResult.emiMonths} mos @ ₹${currentResult.emiAmount?.toLocaleString('en-IN')}/mo)` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRiskBadge(currentResult.financialRisk)}`}>
                    {currentResult.financialRisk} Risk
                  </span>
                </div>
              </div>

              {/* Before vs After Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Score Comparison */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold block mb-2">FinGuard Score Impact</span>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <span className="text-xs text-slate-500">Current</span>
                      <div className="text-2xl font-bold text-white">{currentResult.currentScore}</div>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                    
                    <div className="text-center">
                      <span className="text-xs text-slate-500">Projected</span>
                      <div className={`text-2xl font-bold ${
                        currentResult.projectedScore < currentResult.currentScore ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {currentResult.projectedScore}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Net Change</span>
                      {(() => {
                        const delta = currentResult.scoreDelta ?? (currentResult.projectedScore - currentResult.currentScore);
                        return (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            delta < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {delta > 0 ? `+${delta}` : delta} pts
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Emergency Fund Impact */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold block mb-2">Emergency Fund Runway</span>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <span className="text-xs text-slate-500">Current</span>
                      <div className="text-2xl font-bold text-teal-400">{currentResult.emergencyFundBefore} mos</div>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                    
                    <div className="text-center">
                      <span className="text-xs text-slate-500">Projected</span>
                      <div className={`text-2xl font-bold ${
                        currentResult.emergencyFundAfter < 3 ? 'text-red-400' : currentResult.emergencyFundAfter < 5 ? 'text-amber-400' : 'text-teal-400'
                      }`}>
                        {currentResult.emergencyFundAfter} mos
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Buffer Safety</span>
                      <span className={`text-xs font-bold ${currentResult.emergencyFundAfter < 4 ? 'text-red-400' : 'text-slate-300'}`}>
                        {currentResult.emergencyFundAfter < 4 ? '⚠️ Critical' : 'Adequate'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consequence Metrics: Savings delay, Goal delay */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Savings Goal Delay</span>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {currentResult.savingsDelayMonths} Months Delay
                  </div>
                  <span className="text-[10px] text-slate-500">Postpones other long-term targets</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Debt Burden Impact</span>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    {currentResult.debtBurdenChange}
                  </div>
                  <span className="text-[10px] text-slate-500">Affects credit &amp; liquidity profile</span>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white text-xs">FinGuard CFP Advisory</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {currentResult.recommendation}
                </p>
                {currentResult.safeAlternative && (
                  <div className="pt-2 border-t border-purple-900/60 text-[11px] text-purple-300">
                    <strong>Recommended Strategy:</strong> {currentResult.safeAlternative}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Configure a purchase or select a preset on the left to simulate future outcomes.</p>
            </div>
          )}

          {/* Previous Scenarios History */}
          {simulations.length > 1 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-white">Previous Simulations</h4>
              </div>

              <div className="space-y-2">
                {simulations.slice(1, 4).map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => setCurrentResult(sim)}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800/60 rounded-xl border border-slate-800/80 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{sim.purchaseName}</span>
                      <span className="text-[10px] text-slate-400">
                        ₹{sim.cost.toLocaleString('en-IN')} • {sim.paymentType} • Score Delta: {sim.scoreDelta} pts
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(sim.financialRisk)}`}>
                      {sim.financialRisk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
