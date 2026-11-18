import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Upload,
  Receipt,
  Search,
  Filter,
  CheckCircle,
  Loader2,
  Trash2,
  TrendingDown,
  Camera,
  Calendar,
  MessageSquare,
  FileText,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { api } from '../../services/api';
import { TransactionCategory, PaymentMethod, Transaction } from '../../types/finance';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#3B82F6',
  Travel: '#14B8A6',
  Shopping: '#F59E0B',
  Utilities: '#8B5CF6',
  Investment: '#10B981',
  Entertainment: '#EC4899',
  Health: '#06B6D4',
  Salary: '#22C55E',
  Other: '#64748B',
};

const SAMPLE_SMS_BATCH = `Rs 350 spent at Swiggy for dinner order UPI/431289123
Rs 240 paid to Uber for cab ride to tech park
Rs 5000 credited salary bonus from employer
Rs 1299 paid to Amazon India for wireless mouse
Rs 2850 spent at BESCOM Electricity bill payment
Rs 650 spent at Starbucks coffee`;

export const BudgetAnalyzer: React.FC = () => {
  const { transactions, budgets, addTransaction, deleteTransaction } = useFinance();
  const [smsInput, setSmsInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [receiptResult, setReceiptResult] = useState<any>(null);

  // Manual Transaction Form Modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    merchant: '',
    amount: '',
    type: 'debit' as 'debit' | 'credit',
    category: 'Food' as TransactionCategory,
    paymentMethod: 'UPI' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Parse SMS / UPI messages
  const handleParseSms = async () => {
    if (!smsInput.trim()) return;
    setParsing(true);
    try {
      const parsedTransactions = await api.parseSms(smsInput);
      parsedTransactions.forEach((tx) => {
        addTransaction({
          merchant: tx.merchant,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          paymentMethod: tx.paymentMethod,
          date: tx.date || new Date().toISOString().split('T')[0],
          notes: tx.notes || 'Auto-extracted via FinGuard AI',
        });
      });
      setSmsInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  // OCR Receipt scanner handler
  const handleScanSampleReceipt = async () => {
    setScanningReceipt(true);
    setReceiptResult(null);
    try {
      // Use the generated realistic sample receipt
      const res = await api.scanReceipt(
        'mock_sample_receipt_image_base64',
        'image/jpeg'
      );
      setReceiptResult(res);
      // Auto add to transactions
      if (res.amount && res.merchant) {
        addTransaction({
          merchant: res.merchant,
          amount: res.amount,
          type: 'debit',
          category: (res.category as TransactionCategory) || 'Food',
          paymentMethod: (res.paymentMethod as PaymentMethod) || 'Cash',
          date: res.date || new Date().toISOString().split('T')[0],
          notes: `OCR Scan: ${res.items?.length || 0} items extracted`,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningReceipt(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setScanningReceipt(true);
      try {
        const base64 = reader.result as string;
        const res = await api.scanReceipt(base64, file.type);
        setReceiptResult(res);
        if (res.amount && res.merchant) {
          addTransaction({
            merchant: res.merchant,
            amount: res.amount,
            type: 'debit',
            category: (res.category as TransactionCategory) || 'Shopping',
            paymentMethod: (res.paymentMethod as PaymentMethod) || 'Credit Card',
            date: res.date || new Date().toISOString().split('T')[0],
            notes: `Uploaded Bill: ${res.merchant}`,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setScanningReceipt(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.merchant || !manualForm.amount) return;
    addTransaction({
      merchant: manualForm.merchant,
      amount: parseFloat(manualForm.amount),
      type: manualForm.type,
      category: manualForm.category,
      paymentMethod: manualForm.paymentMethod,
      date: manualForm.date,
      notes: manualForm.notes,
    });
    setShowManualModal(false);
    setManualForm({
      merchant: '',
      amount: '',
      type: 'debit',
      category: 'Food',
      paymentMethod: 'UPI',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  // Filtered transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'debit')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const barData = budgets.map((b) => ({
    category: b.category,
    Spent: categoryTotals[b.category] || b.spent,
    Budget: b.limit,
  }));

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Core Feature 1</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Transaction Processing</span>
            <span aria-hidden="true">·</span>
            <span>Multimodal OCR Receipt Vision</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            AI Budget Analyzer & SMS Parser
          </h1>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Input Methods: SMS/UPI Text Parser & OCR Receipt Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Method 1: Bank SMS / UPI Parser (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Paste Bank SMS or UPI Alerts</span>
            </h2>
            <button
              onClick={() => setSmsInput(SAMPLE_SMS_BATCH)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Fill Sample Batch
            </button>
          </div>

          <textarea
            rows={4}
            value={smsInput}
            onChange={(e) => setSmsInput(e.target.value)}
            placeholder={`Paste raw bank SMS lines, e.g.:
"Rs 350 spent at Swiggy"
"Rs 240 paid to Uber"
"Rs 5000 credited salary"`}
            className="w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              AI automatically categorizes into Food, Travel, Utilities, etc.
            </span>
            <button
              onClick={handleParseSms}
              disabled={parsing || !smsInput.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {parsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract & Categorize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Method 2: Hackathon Feature - OCR Receipt Scanner (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-500" />
                <span>Multimodal OCR Receipt Scanner</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                Gemini Vision
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Upload physical store bills or restaurant slips. Gemini extracts itemized costs and logs the expense instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="flex-1 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-3 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Upload Bill Image
                </span>
                <span className="text-[10px] text-slate-400 block">PNG, JPG up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="text-xs text-slate-400">or</div>

              <button
                onClick={handleScanSampleReceipt}
                disabled={scanningReceipt}
                className="flex-1 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors flex flex-col items-center justify-center cursor-pointer"
              >
                <Camera className="w-5 h-5 text-teal-500 mb-1" />
                <span>Test Cafe Receipt</span>
                <span className="text-[10px] text-slate-400">Demo invoice sample</span>
              </button>
            </div>
          </div>

          {scanningReceipt && (
            <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini 3.8 Flash reading bill line items...</span>
            </div>
          )}

          {receiptResult && !scanningReceipt && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>{receiptResult.merchant}</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  ₹{receiptResult.amount}
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Category: {receiptResult.category} · {receiptResult.date}
              </div>
              {receiptResult.items && receiptResult.items.length > 0 && (
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  Items: {receiptResult.items.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Budget Limit vs Spending Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Spending vs Allocated Limits
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Category health relative to 50/30/20 guidelines
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Total Outflow: <span className="text-slate-900 dark:text-white font-bold">₹{totalSpent.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748B" fontSize={12} tickLine={false} />
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
                <Bar dataKey="Spent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Budget" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Share
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current month proportion
            </p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
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

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {pieData.slice(0, 4).map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">{p.name}</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                  ₹{p.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filterable Transactions Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Parsed Transactions Ledger ({filtered.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All parsed UPI, Card, and Cash transactions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search merchant or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Utilities">Utilities</option>
              <option value="Investment">Investment</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Salary">Salary</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-medium">
              <tr>
                <th className="pb-3">Date</th>
                <th className="pb-3">Merchant / Party</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Notes</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono tabular-nums text-slate-500">
                    {tx.date}
                  </td>
                  <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                    {tx.merchant}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#64748B' }}
                      />
                      <span>{tx.category}</span>
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">
                    {tx.notes || '-'}
                  </td>
                  <td
                    className={`py-3 text-right font-mono font-semibold tabular-nums ${
                      tx.type === 'credit'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Transaction
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Merchant / Payee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy, Netflix, Shell Petrol"
                  value={manualForm.merchant}
                  onChange={(e) => setManualForm({ ...manualForm, merchant: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="350"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Flow Type
                  </label>
                  <select
                    value={manualForm.type}
                    onChange={(e) => setManualForm({ ...manualForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="debit">Spent (Debit)</option>
                    <option value="credit">Received (Credit)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Investment">Investment</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health">Health</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
