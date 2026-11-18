import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  PhoneCall,
  Lock,
  FileText,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { api } from '../../services/api';
import { ScamAnalysisResult } from '../../types/finance';
import { ScamIncidentReportModal } from './ScamIncidentReportModal';

const PRESET_SCAMS = [
  {
    label: '1. Bank KYC Suspended',
    category: 'Bank KYC',
    text: 'URGENT: Your SBI bank account will be suspended today due to pending PAN KYC. Click http://sbi-kyc-verify.online/auth to verify within 2 hours to avoid frozen funds.',
  },
  {
    label: '2. Electricity Disconnection',
    category: 'Electricity Bill',
    text: 'Dear consumer your electricity power will be disconnected at 9:30 PM from power office because your previous month bill was not updated. Please immediately contact our power officer at 9876543210.',
  },
  {
    label: '3. UPI Collect Cashback Trap',
    category: 'UPI Collect',
    text: 'Congratulations! You won ₹2,450 cashback from PhonePe reward center. Open your UPI app and approve the ₹2,450 collect request by entering your UPI PIN to receive money in your bank.',
  },
  {
    label: '4. Telegram VIP Investment',
    category: 'Telegram Investment',
    text: 'Guaranteed 300% returns in 24 hours! Join VIP Crypto Signals Telegram group. Invest ₹10,000 and get ₹30,000 back guaranteed by SEBI registered trading bot.',
  },
  {
    label: '5. WhatsApp Rating Job',
    category: 'WhatsApp Job',
    text: 'Part-time job offer! Earn ₹3,000 to ₹8,000 daily by simply rating hotels and Google Maps places on Telegram. Daily payouts, no experience needed. Message HR @CryptoEarnVIP.',
  },
  {
    label: '6. Google Maps Task Rating',
    category: 'Task Rating',
    text: 'Work from home task! Subscribe to 5 YouTube channels & give 5-star ratings to earn ₹500 immediately. Pre-deposit ₹2,000 to unlock VIP level tasks.',
  },
  {
    label: '7. Malicious Bank APK File',
    category: 'APK Installation',
    text: 'Dear customer, update to new PNB One 2026 banking app by downloading APK file directly: http://pnb-secure-update.apk. Do not use Play Store as server is under maintenance.',
  },
  {
    label: '8. QR Code "Receive" Scam',
    category: 'QR Code Scam',
    text: 'I am sending you ₹15,000 advance for your OLX sofa. Scan this QR code in Google Pay and enter your UPI PIN to claim and credit amount to your account.',
  },
  {
    label: '9. Instant Loan 0-Doc App',
    category: 'Instant Loan',
    text: 'Approved! Get ₹50,000 instant loan in 5 minutes with 0 CIBIL check & no income proof. Install SwiftRupee app and allow contact and gallery permissions.',
  },
  {
    label: '10. Legitimate Bank SMS (Safe)',
    category: 'Legitimate SMS',
    text: 'INR 450.00 debited from A/C XX4102 on 10-NOV-26 at BLR METRO CORP by UPI Ref 43158912345. Avl Bal INR 48,250.00. Call 18002586161 if not done by you.',
  },
];

export const ScamDetector: React.FC = () => {
  const { scamReports, addScamReport } = useFinance();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScamAnalysisResult | null>(scamReports[0] || null);
  const [filterLevel, setFilterLevel] = useState<'All' | 'Dangerous' | 'Suspicious' | 'Safe'>('All');
  const [showReportModal, setShowReportModal] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const result = await api.analyzeScam(inputText.trim());
      setCurrentResult(result);
      addScamReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = scamReports.filter((r) => {
    if (filterLevel === 'All') return true;
    return r.riskLevel === filterLevel;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-red-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Flagship Protection Center
          </span>
          <span aria-hidden="true">·</span>
          <span>10 Major Indian Threat Archetypes</span>
          <span aria-hidden="true">·</span>
          <span>One-Tap MHA 1930 Cyber Crime Report</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          AI Scam & Fraud Shield
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Instantly evaluate suspicious SMS, WhatsApp forwards, email notices, APK downloads, or UPI PIN traps. 
          FinGuard AI analyzes phishing URLs, psychological urgency, and generates instant formal complaint dockets.
        </p>
      </div>

      {/* Main Analyzer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="scam-input" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500" />
                <span>Paste Suspicious Message / Link / SMS</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {inputText.length} characters
              </span>
            </div>

            <textarea
              id="scam-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 'Urgent! Your bank account will be blocked within 24 hours. Update PAN immediately at http://bit.ly/bank-verify' or paste WhatsApp forward..."
              className="w-full p-4 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none font-sans"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Encrypted on device · Never shared</span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !inputText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Indicators...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Run AI Fraud Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick-test Presets - 10 Indian Threat Archetypes */}
          <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Judge Demo Library: 10 Indian Cyber Threat Archetypes
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click any to auto-fill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SCAMS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setInputText(preset.text)}
                  className="p-2 text-left text-[11px] font-medium bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-red-400 dark:hover:border-red-500 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
                >
                  <span className="font-semibold block truncate">{preset.label}</span>
                  <span className="text-[9px] text-slate-400 block truncate">{preset.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Helpline Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-red-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-600 text-white shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Citizen Cyber Crime Helpline: 1930
                </h4>
                <p className="text-xs text-slate-300">
                  Dial <strong>1930</strong> within the "Golden Hour" of any unauthorized debit to immediately freeze funds across Indian banking channels.
                </p>
              </div>
            </div>
            <a
              href="tel:1930"
              className="text-xs font-bold px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shrink-0 flex items-center gap-1 transition"
            >
              <PhoneCall className="w-3 h-3" /> Call 1930
            </a>
          </div>
        </div>

        {/* Right Column: AI Analysis Result (5 cols) */}
        <div className="lg:col-span-5">
          {currentResult ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
              {/* Header with Risk Level Badge */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Analysis Verdict
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentResult.scamType}
                  </h3>
                  {currentResult.threatCategory && (
                    <span className="text-[11px] text-purple-400 font-semibold block mt-0.5">
                      Threat Class: {currentResult.threatCategory}
                    </span>
                  )}
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    currentResult.riskLevel === 'Dangerous'
                      ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                      : currentResult.riskLevel === 'Suspicious'
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {currentResult.riskLevel === 'Dangerous' ? (
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                  ) : currentResult.riskLevel === 'Suspicious' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  )}
                  <span>{currentResult.riskLevel}</span>
                </div>
              </div>

              {/* Score Meter */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Risk Score</span>
                  <span className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white">
                    {currentResult.riskScore} <span className="text-xs text-slate-500">/ 100</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentResult.riskScore > 65
                        ? 'bg-red-500'
                        : currentResult.riskScore > 25
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${currentResult.riskScore}%` }}
                  />
                </div>
              </div>

              {/* One-Tap 1930 Report Button (When Risk is High) */}
              {currentResult.riskScore >= 70 && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-red-400" /> One-Tap Official Reporting
                    </span>
                    <span className="text-[10px] text-red-400 font-bold uppercase">MHA 1930 Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    High fraud threat detected. Auto-generate formal complaint text formatted for the National Cyber Crime Portal.
                  </p>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition shadow-md shadow-red-600/30 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" /> Generate 1930 / MHA Cyber Crime Report
                  </button>
                </div>
              )}

              {/* Why It Is Suspicious */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Why It Is Flagged
                </h4>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {currentResult.explanation}
                </p>
              </div>

              {/* Indicators Identified */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Key Indicators Identified ({currentResult.indicators.length})
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {currentResult.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">&bull;</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Recommended Immediate Action</span>
                </h4>
                <ul className="space-y-1 text-xs text-blue-950 dark:text-blue-200">
                  {currentResult.recommendedActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{i + 1}.</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No Message Analyzed Yet
              </h3>
              <p className="text-xs max-w-xs mt-1">
                Paste any text message, SMS alert, or WhatsApp forward on the left to inspect for cyber threats.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Audit History & Threat Timeline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fraud Detection Timeline & Audit Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified records of analyzed threats and reports
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['All', 'Dangerous', 'Suspicious', 'Safe'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  filterLevel === lvl
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredHistory.map((report) => (
            <div
              key={report.id}
              onClick={() => setCurrentResult(report)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {report.scamType}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-500">
                      Score {report.riskScore}/100
                    </span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-xs text-slate-400">
                      {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                    "{report.inputContent}"
                  </p>
                </div>

                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    report.riskLevel === 'Dangerous'
                      ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60'
                      : report.riskLevel === 'Suspicious'
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60'
                      : 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60'
                  }`}
                >
                  {report.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1930 Report Modal */}
      {showReportModal && currentResult && (
        <ScamIncidentReportModal
          analysis={currentResult}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
