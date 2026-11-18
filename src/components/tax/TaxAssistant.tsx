import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Loader2,
  TrendingDown,
  Info,
  ArrowRight,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { api } from '../../services/api';
import { TaxInput, TaxRegimeComparison } from '../../types/finance';

export const TaxAssistant: React.FC = () => {
  const [taxInput, setTaxInput] = useState<TaxInput>({
    grossAnnualSalary: 1250000,
    basicSalary: 625000,
    hraReceived: 240000,
    rentPaid: 216000,
    metroCity: true,
    section80C: 150000, // PPF, EPF, ELSS
    section80D: 35000, // Health insurance
    section24b: 0, // Home loan interest
    section80CCD1B: 50000, // NPS
    otherDeductions: 0,
  });

  const [comparison, setComparison] = useState<TaxRegimeComparison | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculateTaxes = async () => {
    setCalculating(true);
    try {
      const data = await api.calculateTax(taxInput);
      setComparison(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    calculateTaxes();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Core Feature 4</span>
          <span aria-hidden="true">·</span>
          <span>Income Tax Department of India (FY 2024-25 / FY 2025-26)</span>
          <span aria-hidden="true">·</span>
          <span>Section 87A Rebate & 80C Optimizer</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          India Tax Assistant: Old vs New Regime
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Compare your total tax liability under the revised New Tax Regime (₹75,000 standard deduction) versus the deduction-heavy Old Tax Regime.
        </p>
      </div>

      {/* Grid: Inputs Form & Comparison Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
              <span>Taxpayer Income & Deductions</span>
            </h3>
            <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
              Annual (₹)
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Gross Annual Cost-to-Company / Salary (₹)
              </label>
              <input
                type="number"
                value={taxInput.grossAnnualSalary}
                onChange={(e) =>
                  setTaxInput({
                    ...taxInput,
                    grossAnnualSalary: Number(e.target.value),
                    basicSalary: Number(e.target.value) * 0.5,
                  })
                }
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Basic Salary (₹)
                </label>
                <input
                  type="number"
                  value={taxInput.basicSalary}
                  onChange={(e) => setTaxInput({ ...taxInput, basicSalary: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  HRA Received (₹)
                </label>
                <input
                  type="number"
                  value={taxInput.hraReceived}
                  onChange={(e) => setTaxInput({ ...taxInput, hraReceived: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Total Rent Paid (₹)
                </label>
                <input
                  type="number"
                  value={taxInput.rentPaid}
                  onChange={(e) => setTaxInput({ ...taxInput, rentPaid: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taxInput.metroCity}
                    onChange={(e) => setTaxInput({ ...taxInput, metroCity: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                    Metro City (50% HRA)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Eligible Chapter VI-A Deductions
              </span>

              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                    <span>Section 80C (PPF, EPF, ELSS, Life Ins)</span>
                    <span className="text-[10px]">Max ₹1,50,000</span>
                  </div>
                  <input
                    type="number"
                    max={150000}
                    value={taxInput.section80C}
                    onChange={(e) => setTaxInput({ ...taxInput, section80C: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-0.5">
                    <span>Section 80D (Health Insurance self + parents)</span>
                    <span className="text-[10px]">Max ₹75,000</span>
                  </div>
                  <input
                    type="number"
                    value={taxInput.section80D}
                    onChange={(e) => setTaxInput({ ...taxInput, section80D: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5 truncate" title="Section 24b Home Loan">
                      Sec 24b (Home Loan Interest)
                    </label>
                    <input
                      type="number"
                      max={200000}
                      value={taxInput.section24b}
                      onChange={(e) => setTaxInput({ ...taxInput, section24b: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-0.5 truncate" title="NPS Tier 1">
                      80CCD(1B) (NPS Tier-1)
                    </label>
                    <input
                      type="number"
                      max={50000}
                      value={taxInput.section80CCD1B}
                      onChange={(e) => setTaxInput({ ...taxInput, section80CCD1B: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={calculateTaxes}
              disabled={calculating}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Slabs & Deductions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate & Optimize Tax</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Comparative Verdict & Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {comparison ? (
            <>
              {/* Verdict Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-teal-900/30 border border-blue-500/30 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-blue-400 block">
                      FinGuard Recommendation
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                      Choose {comparison.recommendedRegime}
                    </h3>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-blue-400/30 text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Tax Savings
                    </span>
                    <span className="text-xl font-mono font-extrabold text-emerald-400 tabular-nums">
                      ₹{comparison.taxSavingsWithRecommended.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 mt-4 leading-relaxed">
                  {comparison.aiExplanation}
                </p>
              </div>

              {/* Side-by-Side Slabs Comparison Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Old Regime Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    comparison.recommendedRegime === 'Old Regime'
                      ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Old Tax Regime
                    </h4>
                    {comparison.recommendedRegime === 'Old Regime' && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                        Winner
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Standard Deduction</span>
                      <span className="font-mono tabular-nums">₹50,000</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Deductions Claimed</span>
                      <span className="font-mono tabular-nums">
                        ₹{comparison.oldRegime.exemptionsDeductions.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Taxable Income</span>
                      <span className="font-mono tabular-nums">
                        ₹{comparison.oldRegime.taxableIncome.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Base Tax</span>
                      <span className="font-mono tabular-nums">
                        ₹{comparison.oldRegime.calculatedTax.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Health & Edu Cess (4%)</span>
                      <span className="font-mono tabular-nums">
                        ₹{Math.round(comparison.oldRegime.cess).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white">Total Tax Payable</span>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        ₹{comparison.oldRegime.totalTaxLiability.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* New Regime Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    comparison.recommendedRegime === 'New Regime'
                      ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      New Tax Regime
                    </h4>
                    {comparison.recommendedRegime === 'New Regime' && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Standard Deduction</span>
                      <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                        ₹75,000 (Enhanced)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Deductions Paperwork</span>
                      <span className="text-slate-400">Zero (Simplified)</span>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Taxable Income</span>
                      <span className="font-mono tabular-nums">
                        ₹{comparison.newRegime.taxableIncome.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Base Concessional Tax</span>
                      <span className="font-mono tabular-nums">
                        ₹{comparison.newRegime.calculatedTax.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Health & Edu Cess (4%)</span>
                      <span className="font-mono tabular-nums">
                        ₹{Math.round(comparison.newRegime.cess).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white">Total Tax Payable</span>
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        ₹{comparison.newRegime.totalTaxLiability.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Savings Strategies & Suggestions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Chartered Accountant Optimization Strategies</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {comparison.deductionSuggestions.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
