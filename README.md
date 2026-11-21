# FinGuard AI - Intelligent Financial Assistant & Fraud Defense Copilot

FinGuard AI is a **hackathon/demo financial assistant, not a production banking or authentication system**. It is an intelligent financial platform built for the Indian fintech ecosystem. It integrates **Google Gemini 3.8 Flash**, **Express/Node.js**, a simulated in-memory account layer (**not connected to Firestore**), and **React 19 + TypeScript + Tailwind CSS** to safeguard users against digital financial fraud, automate expense categorization from raw bank SMS/UPI alerts, optimize income taxes, diagnose investment portfolios, and provide AI-driven financial coaching with voice synthesis.

---

## Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|  React 19 + TypeScript + Tailwind CSS v4 + Recharts + Web Speech API (Voice)    |
|  - Modern Dark/Light Mode                                                       |
|  - Real-time Health Gauge & Interactive Simulators                              |
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
| Google Gemini 3.8 Flash            |        | Mock/in-memory demo data          |
| - High-throughput reasoning        |        | - Not durable across restarts     |
| - Multimodal receipt image vision  |        | - Account API disabled on Vercel  |
| - Structured JSON Schemas          |        | - No synced financial data        |
| - Low latency response times       |        | - Sample data only                |
+------------------------------------+        +-----------------------------------+
```

---

## Core Features Implemented

### 1. AI Budget & SMS / UPI Parser
- **Inputs**: Bank SMS alerts, UPI push notifications, cash notes.
  - Examples: `"Rs 350 spent at Swiggy"`, `"Rs 240 paid to Uber"`, `"Rs 5000 credited salary"`.
- **Extraction**: Automatic classification into Food, Travel, Shopping, Utilities, Investment, Entertainment, Health, and Salary.
- **Analytics**: Monthly spending report, budget limit progress bars, category breakdown charts, and savings opportunities.

### 2. AI Scam & Fraud Shield
- **Inputs**: Suspicious SMS, WhatsApp forwards, email notices, or QR payment prompts.
- **Threat Engine**: Evaluates phishing URLs, fake electricity bill disconnection scams, bank KYC deactivation threats, fraudulent Telegram task jobs, and fake UPI collect/refund requests.
- **Output**:
  - Risk Score (0-100 gauge)
  - Risk Level: Safe, Suspicious, Dangerous
  - Specific scam vector and identified red flags
  - Actionable immediate countermeasures (e.g. Do NOT enter UPI PIN, Report to 1930 Cybercrime Portal).

### 3. Investment Health Diagnostics
- **Inputs**: Mutual funds, SIP commitments, direct equities, fixed deposits, gold.
- **Calculations**:
  - Diversification Score (0-100)
  - Risk Index (0-100)
  - Exposure Analysis: Equity vs Debt vs Commodity vs Liquid Cash
  - Professional rebalancing and rupee-cost averaging recommendations.

### 4. Indian Tax Assistant (Old vs New Regime)
- **Engine**: Calibrated to Union Budget FY 2024-25 and FY 2025-26.
- **Inputs**: Gross CTC, Basic Salary, HRA received, Rent paid, Metro status, 80C, 80D, Section 24b Home Loan Interest, 80CCD(1B) NPS.
- **Comparison**: Side-by-side computation of base tax, standard deduction (₹75,000 for New Regime vs ₹50,000 for Old Regime), Section 87A rebate, and 4% Health & Education cess.
- **Output**: Clear recommendation with exact rupee savings and deduction optimization strategies.

### 5. AI Financial Coach & Voice Assistant
- **Engine**: Context-aware conversational agent powered by Gemini 3.8 Flash.
- **Context**: Considers user persona, monthly income, active SIPs, and emergency buffer.
- **Queries**: `"Can I afford a bike worth ₹1,20,000?"`, `"How much should I save monthly?"`, `"Should I choose SIP or FD?"`, `"Should I prepay loan early?"`.
- **Voice Integration**: Hands-free speech-to-text input with microphone button + Text-to-Speech audio readout with mute toggle.

### 6. Financial Health Score
- **Algorithm**: Multi-factor 0-100 score weighing:
  - Savings Rate (benchmark >30%)
  - Expense Ratio (benchmark <50%)
  - Debt-to-Income Ratio (benchmark <30%)
  - Investment Allocation (benchmark >20%)
  - Emergency Fund Adequacy (benchmark 6 months living costs).
- **Categories**: Excellent, Good, Moderate, Poor with targeted recommendations.

### Extra Hackathon Innovations
- **Multimodal OCR Receipt Scanner**: Upload physical bill images; Gemini 3.8 Flash extracts items, date, vendor, taxes, and logs the expense.
- **AI Expense Prediction**: Next-month cashflow forecast by category with confidence intervals.
- **Smart EMI & Prepayment Planner**: Visualizes interest saved and tenure reduction when prepaying extra, compared against investing the same amount into an equity SIP.
- **Credit Score Simulator**: Simulates impact of credit utilization, payment history, and inquiries on CIBIL scores.
- **Financial Goal Tracker**: Milestone progress tracker with automated target dates and deposit simulator.

---

## Folder Structure

```
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── server.ts                       # Traditional Express backend for local/Render
├── api/index.ts                    # Single Vercel serverless API gateway (public demo)
├── vercel.json                     # Vite + Vercel API path rewrites
├── .env.vercel.example             # Vercel environment variable names
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                    # React client entry point
    ├── index.css                   # Tailwind CSS v4 + custom dark variant
    ├── App.tsx                     # Top-level application router and state
    ├── types/
    │   └── finance.ts              # Full TypeScript schemas for finances & Gemini
    ├── services/
    │   └── api.ts                  # Typed client REST API service
    ├── context/
    │   └── FinanceContext.tsx      # Central reactive state & health score calculator
    └── components/
        ├── layout/
        │   └── Navbar.tsx          # 3-Zone Top Bar Contract header
        ├── landing/
        │   └── LandingPage.tsx     # Hero, features, testimonials, pricing, FAQ
        ├── dashboard/
        │   └── Dashboard.tsx       # Top KPI cards, Recharts trends & recent logs
        ├── scam-detector/
        │   └── ScamDetector.tsx    # Phishing & UPI scam risk evaluation
        ├── budget/
        │   └── BudgetAnalyzer.tsx  # SMS batch parser & OCR receipt scanner
        ├── portfolio/
        │   └── PortfolioAnalyzer.tsx # Investment diagnostics & SIP health
        ├── tax/
        │   └── TaxAssistant.tsx    # Indian Old vs New Tax Regime optimizer
        ├── coach/
        │   └── FinancialCoach.tsx  # Gemini coach chat with voice assistant
        ├── analytics/
        │   └── AnalyticsPage.tsx   # Predictive spending velocities & forecast
        ├── simulators/
        │   └── Simulators.tsx      # EMI prepayment planner, goals, credit score
        └── architecture/
            └── FirestoreSchemaModal.tsx # Interactive Firestore schema & rules
```

---

## Firestore Schema (Design Only — Not Implemented)

### Collections:
1. `users`: Stores user profile, income, persona, and aggregate debt.
2. `transactions`: Granular debit and credit records parsed from SMS or receipts.
3. `budgets`: Category limits and monthly spent trackers.
4. `investments`: Holdings across mutual funds, stocks, fixed deposits, and gold.
5. `taxReports`: Historical tax calculations and regime recommendations.
6. `fraudReports`: Evaluated suspicious messages, indicators, and risk scores.
7. `chatHistory`: Multi-turn conversational sessions with the AI Coach.

`firestore.rules` is a planned ruleset only: the present Express server does **not** authenticate users against Firebase or persist these collections to Firestore. Do not claim real account security or store personal financial information until proper authentication and persistence are implemented.

---

## Vercel deployment (public demonstration only)

> **Security notice:** This app's traditional backend contains simulated accounts and unverified social login logic, not production Firebase authentication. The Vercel API deliberately disables all `/api/auth/*` and `/api/family/*` routes; these return HTTP 503. Do not enter real passwords, bank messages, account numbers, receipts, or sensitive financial details. The app's existing browser-side demo state is not secure, authenticated storage.

1. Open [Vercel New Project](https://vercel.com/new) and import [abhigoud0008/FinGuardAI](https://github.com/abhigoud0008/FinGuardAI), branch `main`.
2. Framework preset: **Vite**. Root directory: `./`. Build command: `npx vite build` (frontend only). Output directory: `dist`. Node.js: 22.x.
3. Add server-side environment variables in Vercel **Project → Settings → Environment Variables**: `GEMINI_API_KEY` (secret) and optional `GEMINI_MODEL` (defaults to `gemini-2.5-flash-lite` in the Vercel API). Verify the model ID is available to your API account. Do not put secrets in `VITE_` variables or commit a real `.env` file.
4. Deploy. Vercel hosts the React site and routes `/api/*` to `api/index.ts` using `vercel.json`. This API is a serverless function, **not an always-running Express process**.
5. Test `https://YOUR-VERCEL-DOMAIN/api/health` and confirm JSON `status: "ok"` (the Gemini configured flag reflects key presence, not successful Gemini calls). Test budget parsing, scam analysis, portfolio analysis, tax calculations, and financial coach with **fictional** data.
6. Check the deployment's **Runtime Logs** if any endpoint returns 500 or HTML instead of JSON. Do not use the Vercel project for real accounts until authentication, authorization, durable storage, and input validation are implemented.

### API/deployment limitations

- **Authentication / family APIs:** Deliberately disabled on Vercel, because mock identities and in-memory records are not safe or durable. A frontend demo profile may still appear and **must not be mistaken for a verified login**.
- **Tax assistant:** Contains historical tax assumptions and is **not verified for the current tax year**. Do not use it for filing or investment decisions.
- **Gemini:** Uses a separately metered third-party API; model access, quota limits and possible charges differ from Vercel. Some analyses fall back to heuristic/sample results.
- **Hosting:** Vercel Hobby has usage/function limits and permits personal, non-commercial use; it does not guarantee permanent running infrastructure. Large uploaded receipt images may exceed request-body limits.
- **Future production work:** Add Firebase Authentication (real provider token validation), Firestore persistence with ownership rules, passwordless or securely hashed credentials, verified calculations, proper rate limiting, and delete any legacy plaintext demo credentials from source history if you intend to use this publicly.

Documentation: [Vercel Vite](https://vercel.com/docs/frameworks/frontend/vite) and [Vercel Functions](https://vercel.com/docs/functions).

---

## Traditional server deployment (not Vercel)

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Express + Vite on port 3000)
npm run dev
```

### Build & Production Deployment
```bash
# 1. Build client SPA bundle
npm run build

# 2. Start full-stack server
npm run start
```

### Firebase Hosting & Cloud Run Deployment
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy to Cloud Run / Firebase Hosting
gcloud run deploy finguard-ai --source . --port 3000
```
