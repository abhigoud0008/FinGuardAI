# FinGuard AI - Intelligent Financial Assistant & Fraud Defense Copilot

FinGuard AI is a production-ready, intelligent financial platform built for the Indian fintech ecosystem. It integrates **Google Gemini 3.8 Flash**, **Express/Node.js**, **Firebase Firestore**, and **React 19 + TypeScript + Tailwind CSS** to safeguard users against digital financial fraud, automate expense categorization from raw bank SMS/UPI alerts, optimize income taxes, diagnose investment portfolios, and provide AI-driven financial coaching with voice synthesis.

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
| Google Gemini 3.8 Flash            |        | Firebase Firestore                |
| - High-throughput reasoning        |        | - users (Profiles & budgets)      |
| - Multimodal receipt image vision  |        | - transactions (UPI & Card logs)  |
| - Structured JSON Schemas          |        | - investments (SIPs & stocks)     |
| - Low latency response times       |        | - taxReports & fraudReports       |
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
├── server.ts                       # Express backend + Gemini 3.8 Flash SDK endpoints
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

## Firestore Database Collections & Schema

### Collections:
1. `users`: Stores user profile, income, persona, and aggregate debt.
2. `transactions`: Granular debit and credit records parsed from SMS or receipts.
3. `budgets`: Category limits and monthly spent trackers.
4. `investments`: Holdings across mutual funds, stocks, fixed deposits, and gold.
5. `taxReports`: Historical tax calculations and regime recommendations.
6. `fraudReports`: Evaluated suspicious messages, indicators, and risk scores.
7. `chatHistory`: Multi-turn conversational sessions with the AI Coach.

Security rules are enforced via `firestore.rules` guaranteeing document-level ownership by authenticated user (`request.auth.uid == userId`).

---

## Production Deployment Instructions

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
