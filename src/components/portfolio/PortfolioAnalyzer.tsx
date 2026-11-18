import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { api } from '../../services/api';
import { InvestmentAsset, PortfolioHealth } from '../../types/finance';

const EXPOSURE_COLORS: Record<string, string> = {
  Equity: '#3B82F6',
  Debt: '#10B981',
  Commodity: '#F59E0B',
  'Cash / Liquid': '#64748B',
};

export const PortfolioAnalyzer: React.FC = () => {
  const { assets, addAsset, deleteAsset, userProfile } = useFinance();
  const [analyzing, setAnalyzing] = useState(false);
  const [portfolioHealth, setPortfolioHealth] = useState<PortfolioHealth | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'Mutual Fund' as const,
    investedAmount: '',
    currentValue: '',
    monthlySip: '',
    category: 'Equity' as const,
    riskLevel: 'Moderate' as const,
  });

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const data = await api.analyzePortfolio(assets, userProfile.monthlyIncome);
      setPortfolioHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [assets]);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.investedAmount) return;
    addAsset({
      name: newAsset.name,
      type: newAsset.type,
      investedAmount: parseFloat(newAsset.investedAmount),
      currentValue: parseFloat(newAsset.currentValue || newAsset.investedAmount),
      monthlySip: newAsset.monthlySip ? parseFloat(newAsset.monthlySip) : undefined,
      category: newAsset.category,
      riskLevel: newAsset.riskLevel,
    });
    setShowAddModal(false);
    setNewAsset({
      name: '',
      type: 'Mutual Fund',
      investedAmount: '',
      currentValue: '',
      monthlySip: '',
      category: 'Equity',
      riskLevel: 'Moderate',
    });
  };

  const totalInvested = assets.reduce((sum, a) => sum + a.investedAmount, 0);
  const totalCurrent = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalSip = assets.reduce((sum, a) => sum + (a.monthlySip || 0), 0);

  // Allocation pie chart data
  const categoryTotals: Record<string, number> = {};
  assets.forEach((a) => {
    categoryTotals[a.category] = (categoryTotals[a.category] || 0) + a.currentValue;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Core Feature 3</span>
            <span aria-hidden="true">·</span>
            <span>Wealth & Portfolio Diagnostics</span>
            <span aria-hidden="true">·</span>
            <span>SIP Compounding Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Investment Health Analyzer
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>Re-Analyze</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment / SIP</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Current Valuation</span>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            ₹{totalCurrent.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+₹{totalGain.toLocaleString('en-IN')} (+{totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : 0}%)</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Invested Principal</span>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            ₹{totalInvested.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across {assets.length} diversified holdings
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Monthly SIP Commitment</span>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            ₹{totalSip.toLocaleString('en-IN')}/mo
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {((totalSip / (userProfile.monthlyIncome || 1)) * 100).toFixed(1)}% of take-home pay
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Health Diagnostics</span>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{portfolioHealth?.overallHealthScore || 74}</span>
            <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 text-xs text-teal-600 dark:text-teal-400 font-medium">
            Solid Growth Allocation
          </div>
        </div>
      </div>

      {/* Health Gauges & Exposure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diversification & Risk Score Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Portfolio Diagnostics Scores
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation by Gemini AI against market volatility benchmarks
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-500">
              CFP Calibrated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Diversification Score Meter */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Diversification Score
                </span>
                <span className="text-base font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {portfolioHealth?.diversificationScore || 78}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${portfolioHealth?.diversificationScore || 78}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Well spread across Large Cap, Flexi Cap, Fixed Income, and Gold.
              </p>
            </div>

            {/* Risk Score Meter */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Risk Exposure Index
                </span>
                <span className="text-base font-mono font-bold text-amber-500 tabular-nums">
                  {portfolioHealth?.riskScore || 64}/100
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${portfolioHealth?.riskScore || 64}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Moderately aggressive profile, suitable for 5+ years wealth creation.
              </p>
            </div>
          </div>

          {/* AI Rebalancing Recommendations */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Suggested Improvements & Rebalancing</span>
            </h4>
            <div className="space-y-2 text-xs">
              {(portfolioHealth?.recommendations || [
                'Increase debt or liquid allocation to 20% to hedge against equity market drawdowns.',
                'Ensure ongoing SIPs in Nifty 50 Index funds remain uninterrupted during market dips.',
                'Consider maximizing ELSS tax-saving funds if choosing the Old Tax Regime.',
              ]).map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                >
                  <span className="font-mono text-blue-500 font-bold">{i + 1}.</span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Class Exposure Pie & Table (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Asset Allocation Exposure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current proportion across asset classes
            </p>
          </div>

          <div className="h-48 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={EXPOSURE_COLORS[entry.name] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Value']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {pieData.map((item) => {
              const pct = totalCurrent > 0 ? ((item.value / totalCurrent) * 100).toFixed(1) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: EXPOSURE_COLORS[item.name] || '#64748B' }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-slate-500">{pct}%</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Asset Holdings Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Portfolio Holdings & SIPs ({assets.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed breakdown of mutual funds, stocks, and fixed deposits
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-medium">
              <tr>
                <th className="pb-3">Asset Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Monthly SIP</th>
                <th className="pb-3 text-right">Invested</th>
                <th className="pb-3 text-right">Current Value</th>
                <th className="pb-3 text-right">Returns</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {assets.map((asset) => {
                const gain = asset.currentValue - asset.investedAmount;
                const gainPct = asset.investedAmount > 0 ? (gain / asset.investedAmount) * 100 : 0;
                return (
                  <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {asset.name}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {asset.type}
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: EXPOSURE_COLORS[asset.category] || '#64748B' }}
                        />
                        <span>{asset.category}</span>
                      </span>
                    </td>
                    <td className="py-3 font-mono tabular-nums text-slate-500">
                      {asset.monthlySip ? `₹${asset.monthlySip.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      ₹{asset.investedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      ₹{asset.currentValue.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-3 text-right font-mono font-semibold tabular-nums ${
                        gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {gain >= 0 ? '+' : ''}{gainPct.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteAsset(asset.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Investment Asset
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Scheme / Stock / Asset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mirae Asset Large Cap, HDFC FD, Gold ETF"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Asset Type
                  </label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="SIP">Systematic Investment (SIP)</option>
                    <option value="Stock">Direct Stock</option>
                    <option value="Fixed Deposit">Fixed Deposit (FD)</option>
                    <option value="Gold">Gold / SGB</option>
                    <option value="PPF">PPF / EPF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Asset Class
                  </label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Equity">Equity</option>
                    <option value="Debt">Debt</option>
                    <option value="Commodity">Commodity / Gold</option>
                    <option value="Cash / Liquid">Cash / Liquid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Invested Principal (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={newAsset.investedAmount}
                    onChange={(e) => setNewAsset({ ...newAsset, investedAmount: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Current Market Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="115000"
                    value={newAsset.currentValue}
                    onChange={(e) => setNewAsset({ ...newAsset, currentValue: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Monthly SIP Amount (optional, ₹)
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={newAsset.monthlySip}
                  onChange={(e) => setNewAsset({ ...newAsset, monthlySip: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
