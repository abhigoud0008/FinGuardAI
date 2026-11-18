import React, { useState } from 'react';
import {
  Database,
  Shield,
  Server,
  Cloud,
  FileCode,
  Copy,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Layers,
  Cpu,
} from 'lucide-react';

interface FirestoreSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIRESTORE_SCHEMA = `// ==========================================
// FIRESTORE DATABASE COLLECTIONS ARCHITECTURE
// ==========================================

// 1. users collection
// Document ID: user.uid (unique index on username)
{
  "uid": "usr_99812",
  "username": "abhigoud9346", // unique identifier
  "name": "Abhishek Goud",
  "email": "abhigoud9346@gmail.com",
  "authProvider": "finguard", // 'finguard' | 'instagram' | 'facebook' | 'google'
  "persona": "salaried", // 'student' | 'salaried' | 'small_business' | 'new_investor'
  "monthlyIncome": 95000,
  "monthlyExpenses": 42000,
  "existingSavings": 345000,
  "totalDebt": 320000,
  "createdAt": "2026-11-10T08:00:00Z",
  "updatedAt": "2026-11-11T08:30:00Z"
}

// 2. transactions collection
// Document ID: auto-generated
{
  "id": "tx_481902",
  "userId": "usr_99812",
  "merchant": "Swiggy Gourmet",
  "amount": 680,
  "type": "debit", // 'debit' | 'credit'
  "category": "Food", // 'Food' | 'Travel' | 'Shopping' | 'Utilities' | 'Investment' | 'Entertainment' | 'Health' | 'Salary'
  "paymentMethod": "UPI", // 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash'
  "date": "2026-11-09",
  "rawSms": "Rs 680 spent at Swiggy for dinner UPI/431289123",
  "createdAt": "2026-11-09T20:15:00Z"
}

// 3. budgets collection
// Document ID: \${userId}_\${category}_\${yearMonth}
{
  "id": "usr_99812_Food_2026_11",
  "userId": "usr_99812",
  "category": "Food",
  "limit": 14000,
  "spent": 4850,
  "month": "2026-11",
  "updatedAt": "2026-11-10T12:00:00Z"
}

// 4. investments collection
// Document ID: auto-generated
{
  "id": "inv_81923",
  "userId": "usr_99812",
  "name": "UTI Nifty 50 Index Fund",
  "type": "Mutual Fund", // 'Mutual Fund' | 'SIP' | 'Stock' | 'Fixed Deposit' | 'Gold' | 'PPF'
  "category": "Equity", // 'Equity' | 'Debt' | 'Commodity' | 'Cash / Liquid'
  "investedAmount": 180000,
  "currentValue": 226000,
  "monthlySip": 10000,
  "riskLevel": "Moderate",
  "lastValuationDate": "2026-11-10"
}

// 5. taxReports collection
// Document ID: auto-generated
{
  "id": "tax_2026_27_usr_99812",
  "userId": "usr_99812",
  "financialYear": "2026-27",
  "grossSalary": 1250000,
  "oldRegimeTax": 91000,
  "newRegimeTax": 54600,
  "recommendedRegime": "New Regime",
  "taxSavings": 36400,
  "deductionsClaimed": {
    "section80C": 150000,
    "section80D": 35000,
    "section24b": 0,
    "section80CCD1B": 50000
  },
  "generatedAt": "2026-11-11T08:20:00Z"
}

// 6. fraudReports collection
// Document ID: auto-generated
{
  "id": "fraud_rep_7102",
  "userId": "usr_99812",
  "inputContent": "URGENT: Your SBI YONO account will be deactivated in 12 hours...",
  "riskScore": 96,
  "riskLevel": "Dangerous", // 'Safe' | 'Suspicious' | 'Dangerous'
  "scamType": "Bank Impersonation Phishing",
  "indicators": [
    "Unverified bit.ly shortened URL",
    "Artificial 12-hour urgency",
    "Threat of account deactivation"
  ],
  "recommendedActions": [
    "Do NOT click the link",
    "Report to 1930 Cybercrime Portal",
    "Block the sender"
  ],
  "timestamp": "2026-11-10T14:22:00Z"
}

// 7. chatHistory collection
// Document ID: auto-generated
{
  "id": "chat_session_8819",
  "userId": "usr_99812",
  "messages": [
    {
      "sender": "user",
      "text": "Can I afford a bike worth ₹1,20,000?",
      "timestamp": "2026-11-11T08:15:00Z"
    },
    {
      "sender": "assistant",
      "text": "Yes! Based on your ₹95,000 income, an EMI of ₹4,850/mo fits comfortably within 6% of your take-home pay...",
      "timestamp": "2026-11-11T08:15:02Z"
    }
  ],
  "updatedAt": "2026-11-11T08:15:02Z"
}`;

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if caller is authenticated user
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check ownership of user documents
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 1. users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // 2. transactions collection
    match /transactions/{transactionId} {
      allow read, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid 
                                          && request.resource.data.userId == request.auth.uid;
    }

    // 3. budgets collection
    match /budgets/{budgetId} {
      allow read, write: if isAuthenticated() && (resource == null || resource.data.userId == request.auth.uid)
                                              && request.resource.data.userId == request.auth.uid;
    }

    // 4. investments collection
    match /investments/{assetId} {
      allow read, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create, update: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
    }

    // 5. taxReports collection
    match /taxReports/{reportId} {
      allow read, write: if isAuthenticated() && (resource == null || resource.data.userId == request.auth.uid);
    }

    // 6. fraudReports collection
    match /fraudReports/{reportId} {
      allow read, write: if isAuthenticated() && (resource == null || resource.data.userId == request.auth.uid);
    }

    // 7. chatHistory collection
    match /chatHistory/{sessionId} {
      allow read, write: if isAuthenticated() && (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}`;

export const FirestoreSchemaModal: React.FC<FirestoreSchemaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'schema' | 'rules' | 'deploy'>('diagram');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                FinGuard AI System Architecture & Firestore Blueprint
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Database schema, security rules, Google Gemini integration & deployment specs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-xl p-1"
          >
            &times;
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'diagram'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Architecture Diagram
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Firestore Collections (7)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            firestore.rules
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'deploy'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Production Deployment
          </button>
        </div>

        {/* TAB 1: Architecture Diagram */}
        {activeTab === 'diagram' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
              <pre className="text-emerald-400 font-bold mb-3">
                {`+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|  React 19 + TypeScript + Tailwind CSS v4 + Recharts + Web Speech API (Voice)    |
+---------------------------------------------------------------------------------+
                                      |
                       HTTP / JSON REST API Calls (Vite Proxy)
                                      v
+---------------------------------------------------------------------------------+
|                                BACKEND TIER                                     |
|  Node.js + Express + TypeScript Gateway (server.ts)                             |
|  - /api/budget/parse-sms     (SMS & UPI message natural language parser)        |
|  - /api/scam/analyze         (Cybersecurity risk score 0-100 & phishing checks) |
|  - /api/portfolio/analyze    (Asset allocation & diversification CFP engine)    |
|  - /api/tax/calculate        (Old vs New Tax Regime calculator with cess & 87A) |
|  - /api/coach/chat           (Financial coach conversational agent with Voice)  |
|  - /api/ocr/receipt          (Gemini 3.8 Flash Vision receipt line-item reader) |
|  - /api/prediction/forecast  (Predictive machine learning spending velocities)  |
+---------------------------------------------------------------------------------+
                   |                                             |
                   v                                             v
+------------------------------------+        +-----------------------------------+
|             AI TIER                |        |           PERSISTENCE TIER        |
| Google Gemini 3.8 Flash            |        | Firebase Firestore                |
| - High-throughput reasoning        |        | - users (Profiles & budgets)      |
| - Multimodal receipt image vision  |        | - transactions (UPI & Card logs)  |
| - Structured JSON Schemas          |        | - investments (SIPs & stocks)     |
| - Low latency response times       |        | - taxReports & fraudReports       |
+------------------------------------+        +-----------------------------------+`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-blue-600 dark:text-blue-400 block">
                  Zero Exposure of API Keys
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  GEMINI_API_KEY is isolated strictly on the server-side Node.js process and never bundled in client assets.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                  Deterministic Fallbacks
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  All banking SMS parsing and scam checks include built-in offline regex engines ensuring zero runtime failures.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-teal-600 dark:text-teal-400 block">
                  Indian Tax Law Accuracy
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Calibrated to the latest Union Budget provisions including the ₹75,000 standard deduction under the New Tax Regime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Schema */}
        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                7 Core Collections: users, transactions, budgets, investments, taxReports, fraudReports, chatHistory
              </span>
              <button
                onClick={() => copyToClipboard(FIRESTORE_SCHEMA)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Schema'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-y-auto max-h-[420px] leading-relaxed">
              {FIRESTORE_SCHEMA}
            </pre>
          </div>
        )}

        {/* TAB 3: Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                Production-grade firestore.rules with Granular RBAC and User ID Ownership
              </span>
              <button
                onClick={() => copyToClipboard(FIRESTORE_RULES)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Rules'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-y-auto max-h-[420px] leading-relaxed">
              {FIRESTORE_RULES}
            </pre>
          </div>
        )}

        {/* TAB 4: Deployment */}
        {activeTab === 'deploy' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span>Firebase Hosting + Cloud Run / App Engine Deployment</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                To deploy FinGuard AI to Firebase and Google Cloud:
              </p>

              <div className="p-3 bg-slate-900 rounded-lg text-slate-200 font-mono space-y-1">
                <p># 1. Install Firebase CLI</p>
                <p className="text-emerald-400">npm install -g firebase-tools</p>
                <p className="mt-2"># 2. Login & Initialize</p>
                <p className="text-emerald-400">firebase login</p>
                <p className="text-emerald-400">firebase init firestore</p>
                <p className="mt-2"># 3. Deploy Security Rules</p>
                <p className="text-emerald-400">firebase deploy --only firestore:rules</p>
                <p className="mt-2"># 4. Build and Run Server</p>
                <p className="text-emerald-400">npm run build</p>
                <p className="text-emerald-400">npm run start</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
