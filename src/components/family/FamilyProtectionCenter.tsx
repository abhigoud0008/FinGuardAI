import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  PhoneCall, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Heart, 
  Lock, 
  Smartphone,
  ExternalLink,
  Info
} from 'lucide-react';
import { FamilyMember } from '../../types/finance';

export const FamilyProtectionCenter: React.FC = () => {
  const { familyMembers, familyIncidents, addFamilyMember, analyzeScam } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [testForwardText, setTestForwardText] = useState('');
  const [forwardingMember, setForwardingMember] = useState(familyMembers[0]?.name || 'Mom');
  const [forwardResult, setForwardResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  // New member form state
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<'Father' | 'Mother' | 'Spouse' | 'Child' | 'Grandparent'>('Mother');
  const [phone, setPhone] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: name.trim(),
      relation,
      phone: phone.trim() || '+91 98XXX XXXXX',
      protectionStatus: 'Protected',
      threatsBlocked: 0,
      avatarColor: relation === 'Mother' ? 'bg-rose-500' : relation === 'Father' ? 'bg-blue-500' : 'bg-purple-500',
      lastScanTime: 'Just now'
    };

    addFamilyMember(newMember);
    setName('');
    setPhone('');
    setShowAddModal(false);
  };

  const handleTestForward = async () => {
    if (!testForwardText.trim()) return;
    setIsScanning(true);
    try {
      const res = await analyzeScam(testForwardText);
      setForwardResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-indigo-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Family Protection Shield</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                  Senior Citizen &amp; Family Guard
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Elderly parents and non-tech-savvy relatives are the #1 target for electricity bill, pension KYC, and digital arrest scams in India. 
                FinGuard AI auto-scans forwarded SMS/WhatsApp threats and triggers 1930 emergency freezes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Add Family Member
            </button>
            <a
              href="tel:1930"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold rounded-xl transition"
            >
              <PhoneCall className="w-4 h-4 text-red-400" /> Helpline 1930
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Protected Members Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {familyMembers.map((member) => (
          <div 
            key={member.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${member.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-md`}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{member.name}</h4>
                  <span className="text-[11px] text-slate-400">{member.relation} • {member.phone}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Protected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-800/80 my-3">
              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Threats Blocked</span>
                <span className="text-base font-extrabold text-emerald-400">{member.threatsBlocked}</span>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Last Active</span>
                <span className="text-xs font-semibold text-slate-300">{member.lastScanTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-indigo-400" /> SMS / WhatsApp Guard
              </span>
              <button 
                onClick={() => {
                  setForwardingMember(member.name);
                  setTestForwardText("Dear SBI customer, your YONO account is blocked today. Update PAN immediately: http://bit.ly/sbi-pan-kyc-verify");
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Simulate Forward
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Section: Forward Suspicious Message to Family Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Test / Forward Family Suspicious Message</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Simulate a message received by an elderly family member on WhatsApp or SMS. FinGuard will triage the scam and draft an easy advisory you can send back.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Message received by:</span>
              <select
                value={forwardingMember}
                onChange={(e) => setForwardingMember(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.name}>{m.name} ({m.relation})</option>
                ))}
              </select>
            </div>

            <textarea
              rows={3}
              value={testForwardText}
              onChange={(e) => setTestForwardText(e.target.value)}
              placeholder="Paste suspicious SMS or WhatsApp message (e.g. Electricity bill disconnect, SBI YONO KYC, part-time job, lottery)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTestForwardText("Electricity power will be disconnected at 9:30 PM tonight from electricity office because your bill was not updated. Please call officer at 9821345678 immediately.")}
                  className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  Load Electricity Scam
                </button>
                <button
                  type="button"
                  onClick={() => setTestForwardText("Congratulations! Your mobile number won ₹25,00,000 in KBC Lottery. Send processing fee ₹3,500 on UPI id: kbcdirect@ybl to claim.")}
                  className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                >
                  Load KBC Lottery Scam
                </button>
              </div>

              <button
                onClick={handleTestForward}
                disabled={isScanning || !testForwardText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                {isScanning ? 'Analyzing for Senior Safety...' : 'Analyze Message'}
              </button>
            </div>
          </div>

          {forwardResult && (
            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">
                  Analysis for {forwardingMember}:
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  forwardResult.riskLevel === 'Dangerous' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {forwardResult.riskLevel.toUpperCase()} RISK ({forwardResult.riskScore}/100)
                </span>
              </div>

              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-red-300">Message to send to {forwardingMember}:</span>
                <p className="text-white italic bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
                  "⚠️ Please do NOT click that link or call that number! It is a known fake fraud message. Your electricity/bank account is completely safe. FinGuard AI verified it is a scam. I will check it for you."
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("⚠️ Please do NOT click that link or call that number! It is a known fake fraud message. Your electricity/bank account is completely safe. FinGuard AI verified it is a scam. I will check it for you.");
                    alert("Copied WhatsApp reply text to clipboard!");
                  }}
                  className="text-[10px] text-indigo-400 font-semibold hover:underline mt-1 block"
                >
                  Copy WhatsApp Reply for {forwardingMember}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Golden Hour 1930 Quick Guide */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">The 'Golden Hour' 1930 Protocol</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              If an elderly relative has accidentally clicked a fraudulent link or entered their UPI PIN, follow these 3 steps immediately:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  <span className="font-bold text-white block">Call 1930 Immediately</span>
                  <p className="text-slate-400 text-[11px]">
                    National Cyber Crime Helpline connects directly to bank fraud desks to freeze the transaction before cashout.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  <span className="font-bold text-white block">Block UPI &amp; NetBanking</span>
                  <p className="text-slate-400 text-[11px]">
                    Open bank mobile app or call bank customer care to freeze debit card and reset UPI PIN immediately.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  <span className="font-bold text-white block">File Complaint at cybercrime.gov.in</span>
                  <p className="text-slate-400 text-[11px]">
                    FinGuard generates the pre-filled official text docket with 1 tap.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center justify-between">
            <span>Official Portal: <strong>cybercrime.gov.in</strong></span>
            <a 
              href="https://cybercrime.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:underline flex items-center gap-1 font-semibold"
            >
              Visit <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Add Family Member to FinGuard Shield</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Relationship</label>
                <select
                  value={relation}
                  onChange={(e: any) => setRelation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Child">Child / Teen</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number (for SMS Alerts)</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Protect Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
