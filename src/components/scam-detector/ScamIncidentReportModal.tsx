import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  PhoneCall, 
  ShieldAlert, 
  Send, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { ScamAnalysisResult, ScamIncidentReport } from '../../types/finance';
import { api } from '../../services/api';

interface ScamIncidentReportModalProps {
  analysis: ScamAnalysisResult;
  onClose: () => void;
}

export const ScamIncidentReportModal: React.FC<ScamIncidentReportModalProps> = ({ analysis, onClose }) => {
  const [report, setReport] = useState<ScamIncidentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('WhatsApp');
  const [financialLoss, setFinancialLoss] = useState<number>(0);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await api.generateScamReport({
        scamContent: analysis.inputContent,
        riskScore: analysis.riskScore,
        category: analysis.threatCategory || 'Suspicious Phishing / Financial Fraud',
        platform,
        financialLoss: financialLoss > 0 ? financialLoss : undefined
      });
      setReport(generated);
    } catch (err) {
      console.error('Failed to generate official report:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const downloadTextFile = () => {
    if (!report) return;
    const blob = new Blob([report.mhaPortalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberCrime_Incident_${report.incidentId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">One-Tap Cyber Crime Report (1930 / MHA)</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  National Portal Format
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auto-structured formal complaint formatted for the Ministry of Home Affairs National Cyber Crime Portal.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-xs">
          {/* Quick Helpline Callout */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-sm">Emergency Citizen Helpline: 1930</span>
                <p className="text-[11px] text-slate-300">
                  If money was debited, call <strong>1930 within the 'Golden Hour'</strong> (first 2 hours) to freeze bank accounts through the CFCFRMS portal.
                </p>
              </div>
            </div>
            <a 
              href="tel:1930" 
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shrink-0 flex items-center gap-1.5 transition text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call 1930 Now
            </a>
          </div>

          {!report ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="font-semibold text-white">Incident Details to Include in Report:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Source / Platform Received</label>
                    <select 
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 text-xs"
                    >
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="SMS">Bank / Telemarketer SMS</option>
                      <option value="Telegram">Telegram Group / Channel</option>
                      <option value="UPI App">PhonePe / Google Pay / Paytm Collect Request</option>
                      <option value="Email">Phishing Email</option>
                      <option value="APK Download">Malicious APK File Link</option>
                      <option value="Phone Call">IVR / Fraud Call</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Financial Loss Amount (₹, if any)</label>
                    <input 
                      type="number" 
                      placeholder="0 (Attempted Scam)"
                      value={financialLoss || ''}
                      onChange={(e) => setFinancialLoss(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Detected Scam Threat Type:</span>
                  <span className="text-white font-semibold">{analysis.threatCategory || 'Suspicious Phishing / Financial Fraud'}</span>
                  <p className="text-[11px] text-red-400 mt-1 font-mono">
                    Scam Risk Score: {analysis.riskScore}/100 • Critical Indicators: {analysis.indicators.slice(0, 3).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-bold rounded-xl transition flex items-center gap-2"
                >
                  {loading ? 'Formatting Official Docket...' : 'Generate Official Report Docket'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Docket Ready: <strong>{report.incidentId}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadTextFile}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download .TXT
                  </button>
                </div>
              </div>

              {/* Tabs: MHA Complaint Text / Email Format / Grievance Officer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-400" /> Formal Complaint Text (for cybercrime.gov.in)
                  </span>
                  <button
                    onClick={() => copyToClipboard(report.mhaPortalText, 'mha')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
                  >
                    {copiedSection === 'mha' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSection === 'mha' ? 'Copied!' : 'Copy Portal Text'}
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                  {report.mhaPortalText}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-blue-400" /> Bank Nodal / Cyber Cell Email Template
                  </span>
                  <button
                    onClick={() => copyToClipboard(report.emailTemplate, 'email')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
                  >
                    {copiedSection === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSection === 'email' ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-36 overflow-y-auto">
                  {report.emailTemplate}
                </pre>
              </div>

              {/* Direct Link to Portal */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">
                    Paste this text into the Citizen Complaints section at <strong>cybercrime.gov.in</strong>
                  </span>
                </div>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold transition"
                >
                  Open Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
