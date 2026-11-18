import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  PieChart as PieIcon,
  ShieldAlert,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { api } from '../../services/api';

const MONTHLY_SERIES = [
  { month: 'Jun 2026', food: 12500, travel: 5800, shopping: 8900, utilities: 4100, other: 6900 },
  { month: 'Jul 2026', food: 14100, travel: 6200, shopping: 10500, utilities: 4200, other: 6500 },
  { month: 'Aug 2026', food: 13200, travel: 5100, shopping: 9400, utilities: 4500, other: 6900 },
  { month: 'Sep 2026', food: 15800, travel: 7800, shopping: 11200, utilities: 4300, other: 7100 },
  { month: 'Oct 2026', food: 14500, travel: 6400, shopping: 12100, utilities: 3900, other: 6900 },
  { month: 'Nov 2026', food: 13800, travel: 6100, shopping: 9800, utilities: 4400, other: 7900 },
];

export const AnalyticsPage: React.FC = () => {
  const { transactions, userProfile } = useFinance();
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const data = await api.getExpenseForecast(transactions, userProfile.existingSavings);
        setForecast(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [transactions]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>FinGuard Intelligence</span>
          <span aria-hidden="true">·</span>
          <span>Cashflow Forecaster</span>
          <span aria-hidden="true">·</span>
          <span>Predictive Budget Trajectory</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          Deep Financial Analytics & AI Forecast
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Multi-dimensional spending trajectory, category growth velocities, and predictive machine learning models for upcoming cash demands.
        </p>
      </div>

      {/* AI Next-Month Prediction Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-teal-900/30 border border-blue-500/30 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                AI Next-Month Expense Prediction
              </span>
              <span className="text-[10px] text-teal-400 font-mono bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                Confidence: {forecast?.confidence || 88}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-white tabular-nums">
                ₹{forecast?.predictedNextMonthSpend ? forecast.predictedNextMonthSpend.toLocaleString('en-IN') : '44,100'}
              </span>
              <span className="text-xs text-slate-300">
                Estimated outflow for December 2026
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(forecast?.categoryPredictions || [
              { category: 'Food', predictedAmount: 13500, changePct: '-2%' },
              { category: 'Travel', predictedAmount: 6200, changePct: '+3%' },
              { category: 'Shopping', predictedAmount: 11000, changePct: '+10%' },
            ]).map((cp: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
              >
                <span className="text-slate-400 block">{cp.category}</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  ₹{cp.predictedAmount.toLocaleString('en-IN')}
                </span>
                <span
                  className={`text-[10px] font-mono ml-1 ${
                    cp.changePct.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  ({cp.changePct})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Savings Opportunities */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {(forecast?.aiSavingsOpportunities || [
            'Cooking dinner 3 days a week reduces food delivery bills by ₹4,500.',
            'Consolidating video streaming subscriptions frees up ₹899/month for SIP.',
            'Early booking of holiday travel can lock in 22% lower airfares.',
          ]).map((opp: string, i: number) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-blue-200 flex items-start gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{opp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Category Historical Line & Area Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              6-Month Category Spending Velocities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparative trends across top monthly expense categories
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_SERIES} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
              />
              <Line type="monotone" dataKey="food" stroke="#3B82F6" strokeWidth={2} name="Food & Dining" />
              <Line type="monotone" dataKey="travel" stroke="#14B8A6" strokeWidth={2} name="Travel & Commute" />
              <Line type="monotone" dataKey="shopping" stroke="#F59E0B" strokeWidth={2} name="Shopping" />
              <Line type="monotone" dataKey="utilities" stroke="#8B5CF6" strokeWidth={2} name="Utilities" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
