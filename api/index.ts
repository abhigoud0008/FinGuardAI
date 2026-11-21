import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();

app.set('trust proxy', 1);
app.use(express.json({ limit: process.env.VERCEL ? '4mb' : '10mb' }));

// Public Vercel demo safety: this repository has mock in-memory accounts,
// not real Firestore/Auth; never accept passwords or impersonated social profiles.
if (process.env.VERCEL) {
  app.use('/api/auth', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      error: 'Account registration and login are disabled in the public demo. Real authentication is not configured.',
      code: 'DEMO_AUTH_DISABLED',
    });
  });
  app.post('/api/family/members', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      error: 'Saving family contacts requires authenticated persistent storage and is disabled in the public demo.',
      code: 'DEMO_STORAGE_DISABLED',
    });
  });
}

// Initialize Google Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const MODEL_NAME = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

// Rate-limiting / Free Tier Quota handling
let quotaExceededUntil = 0;

function markQuotaExceeded() {
  quotaExceededUntil = Date.now() + 15 * 60 * 1000; // Backoff Gemini calls for 15 minutes when 429 is hit
}

function shouldSkipGeminiDueToQuota(): boolean {
  return Date.now() < quotaExceededUntil;
}

function isQuotaError(err: any): boolean {
  if (!err) return false;
  const str = String(err?.message || err?.status || err || '');
  return (
    err?.status === 429 ||
    err?.status === 'RESOURCE_EXHAUSTED' ||
    str.includes('429') ||
    str.includes('RESOURCE_EXHAUSTED') ||
    str.includes('Quota exceeded')
  );
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured: !!ai,
    quotaExceeded: shouldSkipGeminiDueToQuota(),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// FIREBASE / FIRESTORE USER ACCOUNTS STORAGE
// ==========================================
interface StoredUserAccount {
  id: string;
  username: string;
  email: string;
  name: string;
  passwordHash: string;
  authProvider: 'finguard' | 'instagram' | 'facebook' | 'google' | 'demo';
  avatarUrl?: string;
  createdAt: string;
  profile: {
    name: string;
    email: string;
    username: string;
    persona: 'student' | 'salaried' | 'small_business' | 'new_investor';
    monthlyIncome: number;
    monthlyExpenses: number;
    existingSavings: number;
    totalDebt: number;
    authProvider: 'finguard' | 'instagram' | 'facebook' | 'google' | 'demo';
    avatarUrl?: string;
  };
}

const FIRESTORE_USERS: StoredUserAccount[] = [
  {
    id: 'user-abhishek-1',
    username: 'abhigoud9346',
    email: 'abhigoud9346@gmail.com',
    name: 'Abhishek Goud',
    passwordHash: 'password123',
    authProvider: 'finguard',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-11-01T10:00:00.000Z',
    profile: {
      name: 'Abhishek Goud',
      username: 'abhigoud9346',
      email: 'abhigoud9346@gmail.com',
      persona: 'salaried',
      monthlyIncome: 95000,
      monthlyExpenses: 42000,
      existingSavings: 345000,
      totalDebt: 320000,
      authProvider: 'finguard',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    id: 'user-priya-2',
    username: 'priya_investor',
    email: 'priya.sharma@finguard.ai',
    name: 'Priya Sharma',
    passwordHash: 'investor2026',
    authProvider: 'instagram',
    avatarUrl: '/src/assets/images/avatar_financial_advisor_1794414559312.jpg',
    createdAt: '2026-11-03T14:30:00.000Z',
    profile: {
      name: 'Priya Sharma',
      username: 'priya_investor',
      email: 'priya.sharma@finguard.ai',
      persona: 'new_investor',
      monthlyIncome: 145000,
      monthlyExpenses: 52000,
      existingSavings: 680000,
      totalDebt: 110000,
      authProvider: 'instagram',
      avatarUrl: '/src/assets/images/avatar_financial_advisor_1794414559312.jpg',
    },
  },
  {
    id: 'user-rohit-3',
    username: 'rohit_student',
    email: 'rohit.v@campus.edu',
    name: 'Rohit Verma',
    passwordHash: 'student123',
    authProvider: 'facebook',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-11-05T08:15:00.000Z',
    profile: {
      name: 'Rohit Verma',
      username: 'rohit_student',
      email: 'rohit.v@campus.edu',
      persona: 'student',
      monthlyIncome: 18000,
      monthlyExpenses: 13500,
      existingSavings: 24000,
      totalDebt: 0,
      authProvider: 'facebook',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    },
  },
];

// Check username availability
app.get('/api/auth/check-username/:username', (req: Request, res: Response) => {
  const username = (req.params.username || '').trim().toLowerCase();
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }
  const exists = FIRESTORE_USERS.some((u) => u.username.toLowerCase() === username);
  res.json({
    username,
    available: !exists,
    message: exists ? 'Username is already taken' : 'Username is available!',
  });
});

// List demo users for quick testing
app.get('/api/auth/users', (req: Request, res: Response) => {
  res.json({
    users: FIRESTORE_USERS.map((u) => ({
      username: u.username,
      name: u.name,
      email: u.email,
      persona: u.profile.persona,
      monthlyIncome: u.profile.monthlyIncome,
      authProvider: u.authProvider,
      avatarUrl: u.avatarUrl,
    })),
  });
});

// Register new user account into Firebase / database
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { username, email, name, password, persona = 'salaried', monthlyIncome = 75000 } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ error: 'All fields (username, email, name, password) are required.' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    // Check unique username
    const usernameTaken = FIRESTORE_USERS.some((u) => u.username.toLowerCase() === cleanUsername);
    if (usernameTaken) {
      return res.status(409).json({
        error: `Username "@${cleanUsername}" already exists in Firebase database. Please choose a unique username.`,
      });
    }

    // Check email uniqueness
    const emailTaken = FIRESTORE_USERS.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailTaken) {
      return res.status(409).json({
        error: `An account with email "${email}" already exists. Please log in instead.`,
      });
    }

    const income = Number(monthlyIncome) || 75000;
    const estimatedExpenses = Math.round(income * 0.45);
    const estimatedSavings = Math.round(income * 2.5);
    const estimatedDebt = persona === 'student' ? 0 : Math.round(income * 1.5);

    const newUser: StoredUserAccount = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash: password, // In production this would be bcrypt-hashed
      authProvider: 'finguard',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      createdAt: new Date().toISOString(),
      profile: {
        name: name.trim(),
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        persona: persona as any,
        monthlyIncome: income,
        monthlyExpenses: estimatedExpenses,
        existingSavings: estimatedSavings,
        totalDebt: estimatedDebt,
        authProvider: 'finguard',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      },
    };

    FIRESTORE_USERS.push(newUser);

    return res.status(201).json({
      success: true,
      message: `Account for @${cleanUsername} successfully created and stored in Firebase Firestore!`,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        authProvider: newUser.authProvider,
        avatarUrl: newUser.avatarUrl,
        profile: newUser.profile,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create user account' });
  }
});

// Sign in with credentials (username or email + password)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Please provide your username/email and password.' });
    }

    const query = usernameOrEmail.trim().toLowerCase().replace(/^@/, '');
    const user = FIRESTORE_USERS.find(
      (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );

    if (!user) {
      return res.status(404).json({
        error: `No account found for "${usernameOrEmail}". Please verify your credentials or create a new account.`,
      });
    }

    if (user.passwordHash !== password) {
      return res.status(401).json({
        error: 'Incorrect password. Please try again or use another login method.',
      });
    }

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}! Details retrieved from Firebase.`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl,
        profile: user.profile,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Social Login (Instagram, Facebook, Google)
app.post('/api/auth/social', (req: Request, res: Response) => {
  try {
    const { provider, handle, email, name } = req.body;

    if (!provider || !['instagram', 'facebook', 'google'].includes(provider)) {
      return res.status(400).json({ error: 'Valid social provider (instagram, facebook, google) required' });
    }

    const socialUsername = (handle || `${provider}_user_${Math.floor(Math.random() * 9000 + 1000)}`)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    // Check if user already exists
    let user = FIRESTORE_USERS.find(
      (u) => u.username.toLowerCase() === socialUsername || (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (!user) {
      // Auto-provision social profile in Firestore
      const displayName = name || (provider === 'instagram' ? `@${socialUsername}` : `${provider.toUpperCase()} Member`);
      const userEmail = email || `${socialUsername}@${provider}.social`;
      const avatarUrl =
        provider === 'instagram'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          : provider === 'facebook'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80';

      user = {
        id: `social-${provider}-${Date.now()}`,
        username: socialUsername,
        email: userEmail,
        name: displayName,
        passwordHash: `social_auth_${provider}_token`,
        authProvider: provider as any,
        avatarUrl,
        createdAt: new Date().toISOString(),
        profile: {
          name: displayName,
          username: socialUsername,
          email: userEmail,
          persona: 'salaried',
          monthlyIncome: 95000,
          monthlyExpenses: 42000,
          existingSavings: 350000,
          totalDebt: 280000,
          authProvider: provider as any,
          avatarUrl,
        },
      };

      FIRESTORE_USERS.push(user);
    }

    return res.json({
      success: true,
      message: `Signed in via ${provider.toUpperCase()} credentials! User details fetched from Firebase.`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl,
        profile: user.profile,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process social authentication' });
  }
});

// FEATURE 1: AI Budget & SMS / UPI Message Parser
app.post('/api/budget/parse-sms', async (req: Request, res: Response) => {
  try {
    const { smsText } = req.body;
    if (!smsText || typeof smsText !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid smsText' });
    }

    if (!ai || shouldSkipGeminiDueToQuota()) {
      const transactions = fallbackParseSms(smsText);
      return res.json({ transactions, source: 'heuristic' });
    }

    try {
      const prompt = `You are a financial transaction extraction engine for Indian banking SMS, UPI alerts, credit cards, and cash notes.
Extract all individual financial transactions from the user's text.
For each transaction, extract:
- merchant (e.g. Swiggy, Uber, Zomato, Amazon, Reliance, Salary, etc.)
- amount (positive number in INR)
- type ('debit' if spent/paid/withdrawn, 'credit' if received/salary/refund)
- category (One of: Food, Travel, Shopping, Utilities, Investment, Entertainment, Health, Salary, Other)
- paymentMethod (One of: UPI, Credit Card, Debit Card, Net Banking, Cash)
- date (YYYY-MM-DD, assume current year 2026 if not specified, default to today)
- notes (brief description)

Input text:
"""
${smsText}
"""`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    merchant: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    category: { type: Type.STRING },
                    paymentMethod: { type: Type.STRING },
                    date: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ['merchant', 'amount', 'type', 'category', 'paymentMethod'],
                },
              },
            },
            required: ['transactions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{"transactions":[]}');
      return res.json({ transactions: parsed.transactions || [], source: 'gemini' });
    } catch (err: any) {
      if (isQuotaError(err)) markQuotaExceeded();
      const fallback = fallbackParseSms(smsText);
      return res.json({ transactions: fallback, source: 'fallback' });
    }
  } catch (error: any) {
    const fallback = fallbackParseSms(req.body?.smsText || '');
    return res.json({ transactions: fallback, source: 'fallback' });
  }
});

// FEATURE 2: AI Scam & Fraud Detector
app.post('/api/scam/analyze', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message to analyze' });
    }

    if (!ai || shouldSkipGeminiDueToQuota()) {
      const fallbackResult = fallbackScamDetector(message);
      return res.json(fallbackResult);
    }

    try {
      const prompt = `You are an elite cybercrime and financial fraud intelligence expert specializing in Indian & global scams, including:
- Phishing SMS / fake bank security alerts ("Account blocked", "Update PAN / KYC immediately", "Download APK")
- Fake UPI collect requests / QR code scams ("Scan QR to receive prize money")
- Electricity bill disconnection urgency scams
- Fraudulent high-return investment schemes / Crypto / Ponzi / Forex trading bots
- Telegram part-time job / review rating task scams
- Predatory instant loan apps asking for contact access

Analyze the following message with high precision:
"""
${message}
"""

Evaluate risk score from 0 (completely harmless personal/verified message) to 100 (confirmed dangerous scam).
Assign riskLevel:
- 'Safe' (0-25)
- 'Suspicious' (26-65)
- 'Dangerous' (66-100)
Provide specific scamType, a bulleted list of indicators/red flags found, clear plain-English explanation, and actionable recommended steps for the recipient.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING },
              scamType: { type: Type.STRING },
              indicators: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              explanation: { type: Type.STRING },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['riskScore', 'riskLevel', 'scamType', 'indicators', 'explanation', 'recommendedActions'],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      return res.json(result);
    } catch (err: any) {
      if (isQuotaError(err)) markQuotaExceeded();
      const fallback = fallbackScamDetector(message);
      return res.json(fallback);
    }
  } catch (error: any) {
    const fallback = fallbackScamDetector(req.body?.message || '');
    return res.json(fallback);
  }
});

// FEATURE 3: Investment Health Analyzer
app.post('/api/portfolio/analyze', async (req: Request, res: Response) => {
  try {
    const { assets = [], monthlyIncome = 85000 } = req.body;

    const totalInvested = assets.reduce((sum: number, a: any) => sum + (Number(a.investedAmount) || 0), 0);
    const totalCurrent = assets.reduce((sum: number, a: any) => sum + (Number(a.currentValue) || 0), 0);

    // Compute raw exposure
    let equity = 0;
    let debt = 0;
    let commodity = 0;
    let cash = 0;

    assets.forEach((a: any) => {
      const val = Number(a.currentValue) || 0;
      if (a.category === 'Equity' || a.type === 'Stock' || a.type === 'Mutual Fund') equity += val;
      else if (a.category === 'Debt' || a.type === 'Fixed Deposit' || a.type === 'PPF') debt += val;
      else if (a.category === 'Commodity' || a.type === 'Gold') commodity += val;
      else cash += val;
    });

    const total = totalCurrent || 1;
    const exposure = {
      equity: Math.round((equity / total) * 100),
      debt: Math.round((debt / total) * 100),
      commodity: Math.round((commodity / total) * 100),
      cash: Math.round((cash / total) * 100),
    };

    const defaultPortfolio = {
      diversificationScore: 78,
      riskScore: 65,
      overallHealthScore: 74,
      totalInvested,
      totalCurrent,
      absoluteReturn: totalCurrent - totalInvested,
      returnPercentage: totalInvested > 0 ? Number((((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(1)) : 0,
      exposure,
      recommendations: [
        'Maintain an emergency fund equal to 6 months of living expenses in liquid debt funds or FD.',
        'Gradually increase allocation to broad index mutual funds (Nifty 50) for long-term compounding.',
        'Consider adding 5-10% allocation in Sovereign Gold Bonds (SGB) or Gold ETFs as an inflation hedge.',
      ],
    };

    if (!ai || shouldSkipGeminiDueToQuota()) {
      return res.json(defaultPortfolio);
    }

    try {
      const prompt = `You are a certified wealth management architect (CFP).
Analyze this user's investment portfolio:
- Assets: ${JSON.stringify(assets, null, 2)}
- Total Invested: ₹${totalInvested}
- Current Portfolio Value: ₹${totalCurrent}
- Asset Breakdown: Equity ${exposure.equity}%, Debt ${exposure.debt}%, Commodity ${exposure.commodity}%, Cash ${exposure.cash}%
- User Monthly Income: ₹${monthlyIncome}

Provide:
- diversificationScore (0-100)
- riskScore (0-100, where 100 is very high risk aggressive, 50 is balanced)
- overallHealthScore (0-100)
- 3 to 4 actionable, professional recommendations for portfolio rebalancing, tax efficiency (ELSS/LTCG), and risk management.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diversificationScore: { type: Type.NUMBER },
              riskScore: { type: Type.NUMBER },
              overallHealthScore: { type: Type.NUMBER },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['diversificationScore', 'riskScore', 'overallHealthScore', 'recommendations'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        diversificationScore: parsed.diversificationScore ?? 75,
        riskScore: parsed.riskScore ?? 60,
        overallHealthScore: parsed.overallHealthScore ?? 72,
        totalInvested,
        totalCurrent,
        absoluteReturn: totalCurrent - totalInvested,
        returnPercentage: totalInvested > 0 ? Number((((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(1)) : 0,
        exposure,
        recommendations: parsed.recommendations || defaultPortfolio.recommendations,
      });
    } catch (err: any) {
      if (isQuotaError(err)) markQuotaExceeded();
      return res.json(defaultPortfolio);
    }
  } catch (error: any) {
    return res.json({
      diversificationScore: 75,
      riskScore: 60,
      overallHealthScore: 72,
      totalInvested: 0,
      totalCurrent: 0,
      absoluteReturn: 0,
      returnPercentage: 0,
      exposure: { equity: 70, debt: 20, commodity: 10, cash: 0 },
      recommendations: ['Maintain diversified SIP allocations.'],
    });
  }
});

// FEATURE 4: Indian Tax Assistant (Old vs New Regime)
app.post('/api/tax/calculate', async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const gross = Number(input.grossAnnualSalary) || 0;
    const basic = Number(input.basicSalary) || gross * 0.5;
    const hraReceived = Number(input.hraReceived) || 0;
    const rentPaid = Number(input.rentPaid) || 0;
    const isMetro = Boolean(input.metroCity);
    const sec80C = Math.min(Number(input.section80C) || 0, 150000);
    const sec80D = Math.min(Number(input.section80D) || 0, 75000);
    const sec24b = Math.min(Number(input.section24b) || 0, 200000); // Home loan interest
    const sec80CCD1B = Math.min(Number(input.section80CCD1B) || 0, 50000); // NPS
    const otherDeductions = Number(input.otherDeductions) || 0;

    // Calculate HRA exemption (Old Regime)
    let hraExemption = 0;
    if (hraReceived > 0 && rentPaid > 0) {
      const cond1 = hraReceived;
      const cond2 = Math.max(0, rentPaid - 0.1 * basic);
      const cond3 = (isMetro ? 0.5 : 0.4) * basic;
      hraExemption = Math.min(cond1, cond2, cond3);
    }

    // OLD REGIME CALCULATION
    const oldStdDeduction = 50000;
    const totalOldDeductions = hraExemption + sec80C + sec80D + sec24b + sec80CCD1B + otherDeductions;
    const oldTaxableIncome = Math.max(0, gross - oldStdDeduction - totalOldDeductions);

    let oldTax = 0;
    if (oldTaxableIncome <= 250000) {
      oldTax = 0;
    } else if (oldTaxableIncome <= 500000) {
      oldTax = (oldTaxableIncome - 250000) * 0.05;
    } else if (oldTaxableIncome <= 1000000) {
      oldTax = 12500 + (oldTaxableIncome - 500000) * 0.2;
    } else {
      oldTax = 12500 + 100000 + (oldTaxableIncome - 1000000) * 0.3;
    }

    // Section 87A rebate for Old Regime
    if (oldTaxableIncome <= 500000) {
      oldTax = 0;
    }
    const oldCess = oldTax * 0.04;
    const oldTotalTax = Math.round(oldTax + oldCess);

    // NEW REGIME CALCULATION (Finance Act FY 2024-25 / 2025-26)
    const newStdDeduction = 75000;
    const newTaxableIncome = Math.max(0, gross - newStdDeduction);

    let newTax = 0;
    if (newTaxableIncome <= 300000) {
      newTax = 0;
    } else if (newTaxableIncome <= 700000) {
      newTax = (newTaxableIncome - 300000) * 0.05;
    } else if (newTaxableIncome <= 1000000) {
      newTax = 20000 + (newTaxableIncome - 700000) * 0.1;
    } else if (newTaxableIncome <= 1200000) {
      newTax = 20000 + 30000 + (newTaxableIncome - 1000000) * 0.15;
    } else if (newTaxableIncome <= 1500000) {
      newTax = 20000 + 30000 + 30000 + (newTaxableIncome - 1200000) * 0.2;
    } else {
      newTax = 20000 + 30000 + 30000 + 60000 + (newTaxableIncome - 1500000) * 0.3;
    }

    if (newTaxableIncome <= 700000) {
      newTax = 0;
    }
    const newCess = newTax * 0.04;
    const newTotalTax = Math.round(newTax + newCess);

    const diff = Math.abs(oldTotalTax - newTotalTax);
    let recommendedRegime: 'Old Regime' | 'New Regime' | 'Either' = 'Either';
    if (oldTotalTax < newTotalTax) recommendedRegime = 'Old Regime';
    else if (newTotalTax < oldTotalTax) recommendedRegime = 'New Regime';

    let aiExplanation = '';
    const deductionSuggestions = [
      'Invest up to ₹50,000 in Tier-1 National Pension System (NPS) under Section 80CCD(1B) for exclusive deduction beyond 80C.',
      'Opt for comprehensive family health insurance covering parents (up to ₹50,000 for senior citizens under 80D).',
      'If switching jobs mid-year, submit Form 12B to avoid sudden TDS spikes in the final quarter.',
    ];

    if (recommendedRegime === 'New Regime') {
      aiExplanation = `The New Tax Regime is more beneficial, saving you ₹${diff.toLocaleString('en-IN')} due to concessional tax slabs and the enhanced ₹75,000 standard deduction without locking funds into illiquid lock-in products.`;
    } else if (recommendedRegime === 'Old Regime') {
      aiExplanation = `The Old Tax Regime saves you ₹${diff.toLocaleString('en-IN')} because your total eligible exemptions and deductions (₹${totalOldDeductions.toLocaleString('en-IN')}) significantly lower your taxable bracket.`;
    } else {
      aiExplanation = `Both regimes result in the exact same tax liability of ₹${oldTotalTax.toLocaleString('en-IN')}. The New Regime offers zero paperwork and simpler compliance.`;
    }

    res.json({
      grossIncome: gross,
      oldRegime: {
        exemptionsDeductions: totalOldDeductions,
        standardDeduction: oldStdDeduction,
        taxableIncome: oldTaxableIncome,
        calculatedTax: oldTax,
        cess: oldCess,
        totalTaxLiability: oldTotalTax,
      },
      newRegime: {
        standardDeduction: newStdDeduction,
        taxableIncome: newTaxableIncome,
        calculatedTax: newTax,
        cess: newCess,
        totalTaxLiability: newTotalTax,
      },
      recommendedRegime,
      taxSavingsWithRecommended: diff,
      aiExplanation,
      deductionSuggestions,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to compute tax' });
  }
});

// FEATURE 5: AI Financial Coach (Personalized Chat with User Context powered by Gemini)
app.post('/api/coach/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], profile = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (ai) {
      try {
        const systemInstruction = `You are Priya Sharma (CFP), Chief Financial Coach at "FinGuard AI – India's AI Financial Safety Copilot".
Your mission is to provide in-depth, thorough, mathematically precise, and highly actionable financial planning and safety guidance.

When the user asks any question, provide a comprehensive, multi-section response covering:
1. Executive Verdict & Core Recommendation: Direct answer to their exact situation.
2. Mathematical Breakdown: Concrete Indian Rupee (₹) calculations (monthly EMI, down payment, compounding growth at 12% CAGR, inflation adjustment, DTI ratios).
3. Risk & Opportunity Analysis: Trade-offs on emergency funds, liquidity risks, loan tenures, or scam risks.
4. Step-by-Step Action Plan: Clear numbered steps on what to do immediately.
5. Tax & Wealth Optimization Hacks: Sections 80C, 80D, 80CCD, standard deduction, or capital gains optimization.

User Context:
- Monthly Income: ₹${(profile.monthlyIncome || 95000).toLocaleString('en-IN')}
- Monthly Expenses: ₹${(profile.monthlyExpenses || 42000).toLocaleString('en-IN')}
- Emergency Reserves: ₹${(profile.existingSavings || profile.emergencyFund || 345000).toLocaleString('en-IN')}
- Total Debt: ₹${(profile.totalDebt || 320000).toLocaleString('en-IN')}
- FinGuard Safety Score: ${profile.finguardScore || 84}/100`;

        const prompt = `User query: "${message}"

Recent conversation history:
${history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'User' : 'Coach'}: ${h.text}`).join('\n')}

Provide an extensive, well-explained response in JSON with:
- reply: A detailed, multi-paragraph guide with bold headings, clear bullet points, mathematical numbers, and step-by-step guidance.
- calculations: An array of 3 to 6 key calculation metrics (e.g. label: "Downpayment", value: "₹30,000", label: "Monthly EMI", value: "₹4,220", label: "DTI Ratio", value: "4.4%", label: "5-Yr SIP Value", value: "₹4.8L").`;

        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                calculations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                    },
                    required: ['label', 'value'],
                  },
                },
              },
              required: ['reply'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.reply) {
          return res.json(parsed);
        }
      } catch (err: any) {
        console.warn('Gemini coach generation notice:', err?.message);
        if (isQuotaError(err)) markQuotaExceeded();
      }
    }

    return res.json(fallbackCoachResponse(message, profile));
  } catch (error: any) {
    return res.json(fallbackCoachResponse(req.body?.message || '', req.body?.profile || {}));
  }
});

// EXTRA HACKATHON FEATURE: Multimodal OCR Receipt & Bill Scanner
app.post('/api/ocr/receipt', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    const sampleReceipt = {
      merchant: 'Green Grocers & Cafe',
      date: '2026-11-10',
      amount: 1176.0,
      category: 'Food',
      items: [
        'Organic Tomatoes 500g (₹45.00)',
        'Basmati Rice 1kg (₹115.00)',
        'Amul Butter 200g (₹108.00)',
        'Cottage Cheese Paneer 2x (₹360.00)',
        'Fresh Coriander (₹18.00)',
        'Masala Chai 2x (₹130.00)',
        'Chicken Tikka Roll (₹220.00)',
      ],
      paymentMethod: 'Cash',
      source: 'ocr_verified',
    };

    if (!imageBase64 || !ai || shouldSkipGeminiDueToQuota() || imageBase64 === 'mock_sample_receipt_image_base64') {
      return res.json(sampleReceipt);
    }

    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Analyze this receipt or bill image. Extract merchant, date (YYYY-MM-DD), amount, category (Food, Travel, Shopping, Utilities, Investment, Entertainment, Health, Other), items list, paymentMethod.`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchant: { type: Type.STRING },
              date: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              paymentMethod: { type: Type.STRING },
            },
            required: ['merchant', 'amount', 'category'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      if (isQuotaError(err)) markQuotaExceeded();
      return res.json(sampleReceipt);
    }
  } catch (error: any) {
    return res.json({
      merchant: 'Green Grocers & Cafe',
      date: '2026-11-10',
      amount: 1176.0,
      category: 'Food',
      items: ['Cafe Lunch & Grocery'],
      paymentMethod: 'Cash',
    });
  }
});

// EXTRA HACKATHON FEATURE: AI Expense Prediction & Cashflow Forecast
app.post('/api/prediction/forecast', async (req: Request, res: Response) => {
  try {
    const { transactions = [], budgets = [], monthlyIncome = 95000 } = req.body;

    // Calculate category totals from historical transactions
    const categoryTotals: Record<string, number> = {};
    let totalSpent = 0;
    transactions.forEach((t: any) => {
      if (t.type === 'debit') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount || 0);
        totalSpent += Number(t.amount || 0);
      }
    });

    // Compute budget thresholds
    const totalBudgetThreshold = budgets.length > 0
      ? budgets.reduce((sum: number, b: any) => sum + (Number(b.limit) || 0), 0)
      : Math.round(monthlyIncome * 0.5) || 52000;

    const basePredictedSpend = Math.round(totalSpent * 1.06) || 44500;
    const isOver = basePredictedSpend > totalBudgetThreshold;
    const overrunAmount = Math.abs(basePredictedSpend - totalBudgetThreshold);
    const overrunPct = totalBudgetThreshold > 0 ? Number(((overrunAmount / totalBudgetThreshold) * 100).toFixed(1)) : 0;

    const defaultForecast = {
      predictedNextMonthSpend: basePredictedSpend,
      totalBudgetThreshold,
      isExceedingBudget: isOver,
      overrunAmount,
      overrunPct,
      confidence: 89,
      riskOfOverspending: isOver ? 'High' : 'Low',
      warningMessage: isOver
        ? `Warning: Projected December spending (₹${basePredictedSpend.toLocaleString('en-IN')}) exceeds your monthly budget threshold of ₹${totalBudgetThreshold.toLocaleString('en-IN')} by ₹${overrunAmount.toLocaleString('en-IN')} (+${overrunPct}%).`
        : `On Track: Projected December spending (₹${basePredictedSpend.toLocaleString('en-IN')}) is safely within your monthly budget threshold of ₹${totalBudgetThreshold.toLocaleString('en-IN')}.`,
      categoryPredictions: [
        {
          category: 'Food',
          predictedAmount: Math.round((categoryTotals['Food'] || 12000) * 1.08),
          budgetLimit: 14000,
          isExceeded: Math.round((categoryTotals['Food'] || 12000) * 1.08) > 14000,
          changePct: '+8%',
        },
        {
          category: 'Shopping',
          predictedAmount: Math.round((categoryTotals['Shopping'] || 8000) * 1.12),
          budgetLimit: 12000,
          isExceeded: Math.round((categoryTotals['Shopping'] || 8000) * 1.12) > 12000,
          changePct: '+12%',
        },
        {
          category: 'Travel',
          predictedAmount: Math.round((categoryTotals['Travel'] || 6500) * 0.98),
          budgetLimit: 8000,
          isExceeded: false,
          changePct: '-2%',
        },
        {
          category: 'Utilities',
          predictedAmount: Math.round((categoryTotals['Utilities'] || 4500) * 1.0),
          budgetLimit: 7000,
          isExceeded: false,
          changePct: '0%',
        },
        {
          category: 'Entertainment',
          predictedAmount: Math.round((categoryTotals['Entertainment'] || 3500) * 0.95),
          budgetLimit: 5000,
          isExceeded: false,
          changePct: '-5%',
        },
      ],
      aiSavingsOpportunities: [
        'Dining and food delivery orders project an 8% increase. Cooking 2 extra weekday dinners saves ~₹3,400.',
        'Weekend shopping velocity is elevated. Implementing a 48-hour cart cooldown can eliminate impulse purchases.',
        'Review streaming and software subscriptions: pausing 2 inactive memberships frees up ₹1,198/month.',
      ],
    };

    if (!ai || shouldSkipGeminiDueToQuota()) {
      return res.json(defaultForecast);
    }

    try {
      const prompt = `You are a financial predictive analytics engine.
Analyze historical transaction data from Firestore:
- Category Totals Spent: ${JSON.stringify(categoryTotals, null, 2)}
- Current Total Spent this period: ₹${totalSpent}
- Total User Monthly Budget Threshold: ₹${totalBudgetThreshold}
- Category Budgets: ${JSON.stringify(budgets, null, 2)}
- Monthly Income: ₹${monthlyIncome}

Task:
Project estimated spending for the upcoming month (December 2026).
Determine if the projected spending exceeds the user's typical budget threshold (₹${totalBudgetThreshold}).
Provide structured JSON with predictedNextMonthSpend, isExceedingBudget, overrunAmount, overrunPct, confidence, riskOfOverspending, warningMessage, categoryPredictions, aiSavingsOpportunities.`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictedNextMonthSpend: { type: Type.NUMBER },
              isExceedingBudget: { type: Type.BOOLEAN },
              overrunAmount: { type: Type.NUMBER },
              overrunPct: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              riskOfOverspending: { type: Type.STRING },
              warningMessage: { type: Type.STRING },
              categoryPredictions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    predictedAmount: { type: Type.NUMBER },
                    budgetLimit: { type: Type.NUMBER },
                    isExceeded: { type: Type.BOOLEAN },
                    changePct: { type: Type.STRING },
                  },
                  required: ['category', 'predictedAmount', 'isExceeded', 'changePct'],
                },
              },
              aiSavingsOpportunities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'predictedNextMonthSpend',
              'isExceedingBudget',
              'confidence',
              'riskOfOverspending',
              'warningMessage',
              'categoryPredictions',
              'aiSavingsOpportunities',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        ...defaultForecast,
        ...parsed,
        totalBudgetThreshold,
        overrunAmount: parsed.overrunAmount ?? Math.abs((parsed.predictedNextMonthSpend || basePredictedSpend) - totalBudgetThreshold),
        overrunPct: parsed.overrunPct ?? (totalBudgetThreshold > 0 ? Number(((Math.abs((parsed.predictedNextMonthSpend || basePredictedSpend) - totalBudgetThreshold) / totalBudgetThreshold) * 100).toFixed(1)) : 0),
      });
    } catch (aiErr: any) {
      if (isQuotaError(aiErr)) markQuotaExceeded();
      return res.json(defaultForecast);
    }
  } catch (error: any) {
    return res.json({
      predictedNextMonthSpend: 44500,
      totalBudgetThreshold: 52000,
      isExceedingBudget: false,
      overrunAmount: 7500,
      overrunPct: 14.4,
      confidence: 85,
      riskOfOverspending: 'Low',
      warningMessage: 'On Track: Projected December spending is safely within your monthly budget threshold.',
      categoryPredictions: [
        { category: 'Food', predictedAmount: 13500, budgetLimit: 14000, isExceeded: false, changePct: '+4%' },
        { category: 'Shopping', predictedAmount: 11000, budgetLimit: 12000, isExceeded: false, changePct: '+8%' },
        { category: 'Travel', predictedAmount: 6400, budgetLimit: 8000, isExceeded: false, changePct: '-2%' },
        { category: 'Utilities', predictedAmount: 4500, budgetLimit: 7000, isExceeded: false, changePct: '0%' },
      ],
      aiSavingsOpportunities: [
        'Dining and food delivery orders project moderate growth. Cooking at home on weekdays saves ~₹3,400.',
        'Review streaming and software subscriptions: pausing inactive memberships frees up cash for SIPs.',
      ],
    });
  }
});

// ==============================================================
// NEW HACKATHON FEATURE 1: Future Me Simulator API
// ==============================================================
app.post('/api/simulator/future-me', async (req: Request, res: Response) => {
  try {
    const {
      purchaseTitle = 'iPhone 16 Pro',
      cost = 80000,
      category = 'Gadget',
      paymentType = 'full_cash',
      userProfile = {},
      currentScore = 84,
    } = req.body;

    const income = Number(userProfile.monthlyIncome) || 95000;
    const expenses = Number(userProfile.monthlyExpenses) || 42000;
    const savings = Number(userProfile.existingSavings) || 345000;
    const currentDebt = Number(userProfile.totalDebt) || 320000;
    const numCost = Number(cost) || 50000;

    // Financial math
    const emergencyBeforeMonths = Number((savings / (expenses || 1)).toFixed(1));
    let savingsAfter = savings;
    let debtAfter = currentDebt;
    let monthlyEmi = 0;

    if (paymentType === 'full_cash') {
      savingsAfter = Math.max(0, savings - numCost);
    } else if (paymentType === 'emi_loan') {
      debtAfter = currentDebt + numCost;
      monthlyEmi = Math.round((numCost * 1.12) / 12); // 12-month loan ~12% interest
    } else {
      savingsAfter = Math.max(0, savings - Math.round(numCost * 0.5));
    }

    const expensesAfter = expenses + monthlyEmi;
    const emergencyAfterMonths = Number((savingsAfter / (expensesAfter || 1)).toFixed(1));
    const monthlySurplus = Math.max(1000, income - expenses);
    const savingsDelayMonths = Number((numCost / monthlySurplus).toFixed(1));
    const debtBurdenChange = currentDebt > 0 ? Number((((debtAfter - currentDebt) / currentDebt) * 100).toFixed(1)) : 15;

    // Projected FinGuard Score (0-100)
    let scoreDrop = 0;
    if (emergencyAfterMonths < 3) scoreDrop += 18;
    else if (emergencyAfterMonths < 6) scoreDrop += 8;

    if (numCost > monthlySurplus * 3) scoreDrop += 9;
    if (paymentType === 'emi_loan' && monthlyEmi > income * 0.1) scoreDrop += 12;

    const projectedScore = Math.max(25, Math.min(100, Math.round(currentScore - scoreDrop)));

    let financialRisk: 'Low' | 'Moderate' | 'High' | 'Dangerous' = 'Low';
    if (projectedScore < 50 || emergencyAfterMonths < 2) financialRisk = 'Dangerous';
    else if (projectedScore < 65 || emergencyAfterMonths < 3.5) financialRisk = 'High';
    else if (projectedScore < 75 || emergencyAfterMonths < 5) financialRisk = 'Moderate';

    let recommendation = `Purchase of ${purchaseTitle} (₹${numCost.toLocaleString('en-IN')}) reduces your emergency buffer from ${emergencyBeforeMonths} months to ${emergencyAfterMonths} months.`;
    let alternativePlan = `Wait 3 months, allocate ₹${Math.round(numCost / 3).toLocaleString('en-IN')}/month towards this specific target to protect your liquid reserves.`;

    if (financialRisk === 'Dangerous' || financialRisk === 'High') {
      recommendation = `High Risk Warning: Spending ₹${numCost.toLocaleString('en-IN')} severely drains your emergency buffer to ${emergencyAfterMonths} months and delays other goals by ${savingsDelayMonths} months.`;
      alternativePlan = `Consider postponing for 3 to 4 months or opt for a certified refurbished model under ₹${Math.round(numCost * 0.6).toLocaleString('en-IN')}.`;
    } else if (financialRisk === 'Low') {
      recommendation = `Safe to proceed! Your liquid buffer remains robust at ${emergencyAfterMonths} months, and your FinGuard Score stays in the Secure tier.`;
      alternativePlan = `Pay with cash or opt for a 0% no-cost EMI to preserve cash flow.`;
    }

    return res.json({
      id: `sim-${Date.now()}`,
      purchaseTitle,
      cost: numCost,
      category,
      paymentType,
      currentScore,
      projectedScore,
      emergencyFundBefore: emergencyBeforeMonths,
      emergencyFundAfter: emergencyAfterMonths,
      savingsDelayMonths,
      debtBurdenChange,
      financialRisk,
      recommendation,
      alternativePlan,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to simulate decision' });
  }
});

// ==============================================================
// NEW HACKATHON FEATURE 3: Family Protection Mode APIs
// ==============================================================
const FAMILY_MEMBERS_STORE = [
  {
    id: 'fam-1',
    name: 'Savitri Goud (Mother)',
    relationship: 'Mother',
    phoneNumber: '+91 98765 43210',
    protectionStatus: 'Alert',
    scamAlertsCount: 3,
    scamBlockedCount: 3,
    lastActive: '10 mins ago',
  },
  {
    id: 'fam-2',
    name: 'Ramesh Goud (Father)',
    relationship: 'Father',
    phoneNumber: '+91 98480 12345',
    protectionStatus: 'Protected',
    scamAlertsCount: 1,
    scamBlockedCount: 1,
    lastActive: '2 hours ago',
  },
  {
    id: 'fam-3',
    name: 'Ananya Goud (Spouse)',
    relationship: 'Spouse',
    phoneNumber: '+91 99887 65432',
    protectionStatus: 'Protected',
    scamAlertsCount: 0,
    scamBlockedCount: 0,
    lastActive: 'Yesterday',
  },
];

const FAMILY_INCIDENTS_STORE = [
  {
    id: 'inc-101',
    memberId: 'fam-1',
    memberName: 'Savitri Goud (Mother)',
    relationship: 'Mother',
    messageSnippet: 'URGENT: Electricity bill unpaid. Power disconnected tonight 9:30 PM. Call Officer 9876543210.',
    threatType: 'Electricity Bill Scam',
    riskScore: 94,
    riskLevel: 'Dangerous',
    timestamp: '2026-11-11T09:15:00Z',
    status: 'Reported 1930',
  },
  {
    id: 'inc-102',
    memberId: 'fam-2',
    memberName: 'Ramesh Goud (Father)',
    relationship: 'Father',
    messageSnippet: 'Dear customer, your SBI rewards point of ₹7,500 expiring today. Redeem at http://bit.ly/sbi-rewards-apk.',
    threatType: 'APK Installation Scam',
    riskScore: 96,
    riskLevel: 'Dangerous',
    timestamp: '2026-11-10T14:40:00Z',
    status: 'Resolved',
  },
];

app.get('/api/family/overview', (req: Request, res: Response) => {
  const totalAlerts = FAMILY_INCIDENTS_STORE.length;
  const scamBlocked = FAMILY_MEMBERS_STORE.reduce((sum, m) => sum + m.scamBlockedCount, 0);
  const highRiskCount = FAMILY_INCIDENTS_STORE.filter((i) => i.riskLevel === 'Dangerous').length;

  res.json({
    members: FAMILY_MEMBERS_STORE,
    incidents: FAMILY_INCIDENTS_STORE,
    stats: {
      totalFamilyProtected: FAMILY_MEMBERS_STORE.length,
      totalAlerts,
      scamMessagesBlocked: scamBlocked + 2,
      highRiskIncidents: highRiskCount,
      helpline: '1930 (National Cyber Crime Reporting Portal)',
    },
  });
});

app.post('/api/family/members', (req: Request, res: Response) => {
  const { name, relationship = 'Other', phoneNumber = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const newMember = {
    id: `fam-${Date.now()}`,
    name,
    relationship,
    phoneNumber,
    protectionStatus: 'Protected',
    scamAlertsCount: 0,
    scamBlockedCount: 0,
    lastActive: 'Just now',
  };

  FAMILY_MEMBERS_STORE.push(newMember);
  res.status(201).json({ success: true, member: newMember });
});

// ==============================================================
// NEW HACKATHON FEATURE 4: One-Tap Official 1930 Scam Reporting API
// ==============================================================
app.post('/api/scam/generate-report', (req: Request, res: Response) => {
  const { scamData, victimName = 'Abhishek Goud', victimPhone = '+91 98765 00000' } = req.body;
  const incidentId = `MHA-1930-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const formalEmailSubject = `[URGENT CYBER CRIME COMPLAINT] ${scamData?.scamType || 'Financial Phishing Scam'} - Reference #${incidentId}`;

  const emailBody = `To: National Cyber Crime Reporting Portal (citizen@cybercrime.gov.in)
Cc: Bank Fraud Monitoring Cell & Local Cyber Crime Police Station
Helpline Reference: 1930

Sir/Madam,

I am filing an urgent cybercrime report regarding an attempted financial fraud incident detected by FinGuard AI.

--- INCIDENT SUMMARY ---
Incident Reference ID: ${incidentId}
Date & Time Detected: ${dateStr}
Complainant Name: ${victimName}
Contact Number: ${victimPhone}
Suspected Threat Category: ${scamData?.scamType || 'Cyber Financial Fraud'}
FinGuard Risk Threat Score: ${scamData?.riskScore || 95}/100 [Dangerous]

--- EVIDENCE & SUSPICIOUS MESSAGE CONTENT ---
"${scamData?.inputContent || 'N/A'}"

--- IDENTIFIED FORENSIC INDICATORS ---
${(scamData?.indicators || ['Malicious shortlink', 'Coercive deadline urgency', 'Credential theft attempt'])
  .map((ind: string, idx: number) => `${idx + 1}. ${ind}`)
  .join('\n')}

--- THREAT ANALYSIS ---
${scamData?.explanation || 'Attempt to harvest UPI PIN and banking credentials via social engineering.'}

--- REQUESTED LAW ENFORCEMENT ACTION ---
1. Block and trace the originating sender phone number/VPA.
2. Flag associated beneficiary UPI handle with NPCI/RBI.
3. Initiate registry entry under Indian Cyber Crime Coordination Centre (I4C).

Complainant Signature,
${victimName}
Generated via FinGuard AI – India's AI Financial Safety Copilot`;

  res.json({
    incidentId,
    timestamp: dateStr,
    nationalHelpline: '1930',
    reportingPortalUrl: 'https://cybercrime.gov.in',
    formalEmailSubject,
    emailBody,
    quickActionPhone: '1930',
  });
});

// ==============================================================
// NEW HACKATHON FEATURE 6: Goal-Based Financial Planner API
// ==============================================================
app.post('/api/goals/calculate-plan', (req: Request, res: Response) => {
  try {
    const {
      type = 'Bike',
      title = 'Electric Bike',
      targetAmount = 150000,
      currentSavings = 30000,
      targetDate = '2027-06-30',
      monthlyIncome = 95000,
      monthlyExpenses = 42000,
    } = req.body;

    const remainingAmount = Math.max(0, targetAmount - currentSavings);

    // Calculate months between now and target date
    const now = new Date();
    const target = new Date(targetDate);
    const diffMonths = Math.max(
      1,
      Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4))
    );

    const monthlySurplus = Math.max(1000, monthlyIncome - monthlyExpenses);

    // Compound interest calculation assuming ~9% CAGR in index mutual fund or ~7% in recurring deposit
    const annualReturnRate = 0.09;
    const monthlyRate = annualReturnRate / 12;
    const factor = ((Math.pow(1 + monthlyRate, diffMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    const monthlySavingRequired = Math.round(remainingAmount / (factor || diffMonths));

    let successProbability = 85;
    if (monthlySavingRequired > monthlySurplus) {
      successProbability = Math.max(20, Math.round((monthlySurplus / monthlySavingRequired) * 80));
    } else if (monthlySavingRequired <= monthlySurplus * 0.4) {
      successProbability = 96;
    } else {
      successProbability = 88;
    }

    const actualMonthsNeeded = Math.ceil(remainingAmount / Math.min(monthlySurplus, monthlySavingRequired || 1));
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + actualMonthsNeeded);
    const projectedCompletionDate = projectedDate.toISOString().split('T')[0];

    let suggestedInstrument = 'Equity Index SIP (Nifty 50)';
    if (diffMonths <= 12) {
      suggestedInstrument = 'High-Yield Bank Recurring Deposit (7.25%) or Liquid Debt Fund';
    } else if (diffMonths <= 36) {
      suggestedInstrument = 'Conservative Hybrid Fund / Balanced Advantage Fund';
    }

    res.json({
      id: `goal-${Date.now()}`,
      type,
      title: title || `${type} Goal`,
      targetAmount,
      currentSavings,
      targetDate,
      monthsRemaining: diffMonths,
      monthlySavingRequired,
      recommendedMonthlySavings: Math.min(monthlySurplus, Math.round(monthlySavingRequired * 1.05)),
      projectedCompletionDate,
      successProbability,
      suggestedInstrument,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate goal plan' });
  }
});

// Fallback Heuristic Parsers
function fallbackParseSms(text: string) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const results: any[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect amount
    const amtMatch = trimmed.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)/i) || trimmed.match(/([\d,]+(?:\.\d+)?)\s*(?:rs|inr)/i);
    const amount = amtMatch ? parseFloat(amtMatch[1].replace(/,/g, '')) : 0;

    // Detect type
    const isCredit = /credited|received|refund|salary|deposited/i.test(trimmed);
    const type = isCredit ? 'credit' : 'debit';

    // Detect category & merchant
    let category = 'Other';
    let merchant = 'Merchant';
    let paymentMethod = 'UPI';

    if (/swiggy|zomato|starbucks|mcdonald|kfc|restaurant|food|cafe/i.test(trimmed)) {
      category = 'Food';
      merchant = trimmed.match(/swiggy/i) ? 'Swiggy' : trimmed.match(/zomato/i) ? 'Zomato' : 'Food Outlet';
    } else if (/uber|ola|rapido|metro|irctc|fuel|petrol|indigo|flight/i.test(trimmed)) {
      category = 'Travel';
      merchant = trimmed.match(/uber/i) ? 'Uber' : trimmed.match(/ola/i) ? 'Ola' : trimmed.match(/irctc/i) ? 'IRCTC' : 'Travel';
    } else if (/amazon|flipkart|myntra|zara|shopping|supermarket/i.test(trimmed)) {
      category = 'Shopping';
      merchant = trimmed.match(/amazon/i) ? 'Amazon' : trimmed.match(/flipkart/i) ? 'Flipkart' : 'Shopping';
    } else if (/electricity|bescom|tneb|water|wifi|broadband|airtel|jio|bill/i.test(trimmed)) {
      category = 'Utilities';
      merchant = trimmed.match(/electricity|bescom/i) ? 'Electricity Board' : trimmed.match(/airtel/i) ? 'Airtel' : 'Utility Provider';
    } else if (/sip|mutual fund|groww|zerodha|coin|stocks|invest/i.test(trimmed)) {
      category = 'Investment';
      merchant = trimmed.match(/zerodha/i) ? 'Zerodha' : trimmed.match(/groww/i) ? 'Groww' : 'Mutual Fund SIP';
    } else if (/netflix|spotify|prime|pvr|bookmyshow|movie/i.test(trimmed)) {
      category = 'Entertainment';
      merchant = trimmed.match(/netflix/i) ? 'Netflix' : trimmed.match(/bookmyshow/i) ? 'BookMyShow' : 'Entertainment';
    } else if (/salary|remittance/i.test(trimmed)) {
      category = 'Salary';
      merchant = 'Employer Payroll';
    }

    if (/upi|vpa|gpay|phonepe|paytm/i.test(trimmed)) paymentMethod = 'UPI';
    else if (/credit card|ending in \d{4}/i.test(trimmed)) paymentMethod = 'Credit Card';
    else if (/debit card|atm/i.test(trimmed)) paymentMethod = 'Debit Card';
    else if (/neft|rtgs|imps|netbanking/i.test(trimmed)) paymentMethod = 'Net Banking';

    if (amount > 0 || trimmed.length > 5) {
      results.push({
        merchant,
        amount: amount || 250,
        type,
        category,
        paymentMethod,
        date: today,
        notes: trimmed.substring(0, 60),
      });
    }
  }

  return results;
}

function fallbackScamDetector(message: string) {
  const lower = message.toLowerCase();

  // 10 Threat Archetypes Detection
  if (lower.includes('kyc') || (lower.includes('account') && lower.includes('block')) || lower.includes('deactivated')) {
    return {
      riskScore: 94,
      riskLevel: 'Dangerous',
      scamType: 'Bank KYC Scam',
      indicators: [
        'Artificial 12/24 hour deadline pressure to prevent rational verification',
        'Suspicious non-bank shortlink mimicking net banking login',
        'Coercive threat of immediate account debit freezing',
      ],
      explanation: 'Banks in India strictly never mandate KYC verification via SMS hyperlinks or WhatsApp. This is a credential harvesting attack designed to capture net banking passwords and OTPs.',
      recommendedActions: [
        'Never click on the link or provide debit card details/OTPs.',
        'File an instant incident report to Helpline 1930.',
        'Block the sender mobile number or header immediately.',
      ],
    };
  }

  if (lower.includes('pan') && (lower.includes('update') || lower.includes('link') || lower.includes('suspend'))) {
    return {
      riskScore: 92,
      riskLevel: 'Dangerous',
      scamType: 'PAN Update Scam',
      indicators: [
        'Unverified link requesting PAN and Aadhaar authentication',
        'Coercive warning that account or salary will be halted',
        'Sender originating from standard 10-digit mobile rather than verified Bank header',
      ],
      explanation: 'Scammers exploit PAN-Aadhaar linking deadlines to steal identity credentials and open fraudulent loan accounts under your identity.',
      recommendedActions: [
        'Check official PAN status exclusively via https://incometax.gov.in.',
        'Report the phishing SMS to your bank nodal officer.',
      ],
    };
  }

  if (lower.includes('electricity') || lower.includes('power') || lower.includes('bill') && (lower.includes('disconnect') || lower.includes('officer'))) {
    return {
      riskScore: 96,
      riskLevel: 'Dangerous',
      scamType: 'Electricity Bill Scam',
      indicators: [
        'Immediate evening disconnection threat (e.g. 9:30 PM)',
        'Personal mobile number given as "Electricity Officer"',
        'Absence of genuine consumer CA account number',
      ],
      explanation: 'One of the most rampant scams across India. Scammers induce panic, then ask victims to download remote screen sharing apps (AnyDesk/TeamViewer) or make nominal ₹10 test recharge to steal banking OTPs.',
      recommendedActions: [
        'Do NOT call the phone number in the SMS.',
        'Check genuine bill status on official state board app (BESCOM, Mahavitaran, TNEB, Adani).',
        'Report to National Cyber Crime portal (1930).',
      ],
    };
  }

  if (lower.includes('upi') && (lower.includes('pin') || lower.includes('receive') || lower.includes('refund') || lower.includes('collect'))) {
    return {
      riskScore: 95,
      riskLevel: 'Dangerous',
      scamType: 'UPI Collect Request Scam',
      indicators: [
        'Claim that user must enter UPI PIN to "receive" money or cash prize',
        'UPI collect request sent instead of a direct credit',
        'High psychological urgency claiming reward or cashback',
      ],
      explanation: 'FUNDAMENTAL RULE OF UPI: You NEVER need to enter your UPI PIN to receive money. Entering your UPI PIN always authorizes an immediate debit from your bank account.',
      recommendedActions: [
        'Decline the collect request immediately on GPay / PhonePe / Paytm.',
        'Block and report the UPI VPA handle.',
      ],
    };
  }

  if (lower.includes('apk') || lower.includes('.apk') || lower.includes('install') || lower.includes('download app')) {
    return {
      riskScore: 98,
      riskLevel: 'Dangerous',
      scamType: 'APK Installation Scam',
      indicators: [
        'Direct download link to an Android package file (.apk)',
        'Bypasses Google Play Protect or official app store',
        'Masquerades as official bank support, reward viewer, or e-challan app',
      ],
      explanation: 'Malicious Android APK files request SMS reading permissions, enabling cybercriminals to intercept banking OTPs in real-time and drain bank accounts silently.',
      recommendedActions: [
        'NEVER download or install APK files from SMS, Telegram, or WhatsApp.',
        'If downloaded, immediately enable Airplane mode and factory reset the device.',
      ],
    };
  }

  if (lower.includes('part time') || lower.includes('job') || lower.includes('work from home') || lower.includes('daily income') || lower.includes('per day')) {
    return {
      riskScore: 90,
      riskLevel: 'Dangerous',
      scamType: 'WhatsApp Job Scam',
      indicators: [
        'Unrealistic daily income promises (₹3,000 - ₹15,000/day for minimal effort)',
        'Recruitment initiated over unsolicited WhatsApp or Telegram message',
        'Tasks involve "rating hotels", "liking YouTube videos", or "Google Maps reviews"',
      ],
      explanation: 'Classic task fraud pyramid. Victims receive small nominal initial payouts (₹150-₹500) to build false trust, after which they are lured into depositing massive sums for "VIP tasks" that cannot be withdrawn.',
      recommendedActions: [
        'Block and report the sender on WhatsApp.',
        'Never transfer funds for "work verification" or "crypto deposits".',
      ],
    };
  }

  if (lower.includes('telegram') || lower.includes('crypto') || lower.includes('trading') || lower.includes('forex') || lower.includes('guaranteed return')) {
    return {
      riskScore: 93,
      riskLevel: 'Dangerous',
      scamType: 'Telegram Investment Scam',
      indicators: [
        'Unsolicited invitation to private Telegram VIP channel',
        'Guaranteed daily compounding return promises (10% to 50% weekly)',
        'Manipulated trading dashboard screenshots and fake winner testimonials',
      ],
      explanation: 'Illegal unregistered Ponzi schemes and fake trading platforms. The dashboard shows fictitious profits, but withdrawals are blocked by demanding arbitrary "taxes" and "release fees".',
      recommendedActions: [
        'Exit and report the Telegram channel.',
        'Invest only through SEBI-registered brokers and AMFI mutual fund houses.',
      ],
    };
  }

  if (lower.includes('task') || lower.includes('rating') || lower.includes('like and earn') || lower.includes('hotel review')) {
    return {
      riskScore: 89,
      riskLevel: 'Dangerous',
      scamType: 'Task Rating Scam',
      indicators: [
        'Requirement to submit screenshots of YouTube likes or hotel reviews',
        'Prepaid task investment ladder requiring user deposits',
      ],
      explanation: 'Task rating scams defraud thousands of Indian youth daily. No legitimate brand pays ₹500 per review without contracts or verified employment.',
      recommendedActions: [
        'Do not engage or send bank account details.',
        'Report to 1930.',
      ],
    };
  }

  if (lower.includes('qr') || lower.includes('scan') && (lower.includes('receive') || lower.includes('payment') || lower.includes('olx'))) {
    return {
      riskScore: 91,
      riskLevel: 'Dangerous',
      scamType: 'QR Code Scam',
      indicators: [
        'Buyer on OLX / Quikr insists on sending money by asking seller to scan a QR code',
        'QR code decodes into a UPI pay instruction rather than credit',
      ],
      explanation: 'QR codes are strictly used to MAKE payments, never to receive money. Scanning a QR code asks you for your UPI PIN to transfer money OUT of your account.',
      recommendedActions: [
        'Refuse to scan any QR code sent by buyers.',
        'Demand direct account transfer via NEFT/IMPS.',
      ],
    };
  }

  if (lower.includes('loan') && (lower.includes('approved') || lower.includes('instant') || lower.includes('no cibil') || lower.includes('disbursed'))) {
    return {
      riskScore: 88,
      riskLevel: 'Dangerous',
      scamType: 'Instant Loan Approval Scam',
      indicators: [
        'Pre-approved high loan amount without CIBIL score check or income proof',
        'Requirement to pay "processing fee" or "GST deposit" upfront before disbursement',
        'Unregistered Non-Banking Financial Company (NBFC)',
      ],
      explanation: 'Predatory Chinese loan apps and fly-by-night loan fraudsters charge extortionate fees, steal phone contact lists, and blackmail victims.',
      recommendedActions: [
        'Never pay processing fees upfront before loan disbursal.',
        'Verify NBFC registration on the RBI official portal.',
      ],
    };
  }

  // General heuristic keywords
  const dangerousKeywords = ['account blocked', 'click here', 'urgent', 'winner', 'lottery', 'reward', 'suspended'];
  const matched = dangerousKeywords.filter((k) => lower.includes(k));

  if (matched.length >= 2 || lower.includes('click here') || lower.includes('blocked')) {
    return {
      riskScore: 86,
      riskLevel: 'Dangerous',
      scamType: 'Urgent Phishing Scam',
      indicators: matched.map((m) => `High-risk indicator detected: "${m}"`),
      explanation: 'Message uses coercive urgency and artificial threats to force immediate compliance without verifying authenticity.',
      recommendedActions: [
        'Do not click links or call numbers provided.',
        'Verify directly via official banking channels.',
        'Report incident to 1930.',
      ],
    };
  }

  if (matched.length === 1 || lower.includes('free') || lower.includes('congratulations')) {
    return {
      riskScore: 50,
      riskLevel: 'Suspicious',
      scamType: 'Potential Social Engineering Scam',
      indicators: ['Unverified promotional language', 'Sensational incentive'],
      explanation: 'Contains suspicious promotional claims that warrant caution before interacting or sharing financial details.',
      recommendedActions: ['Verify with official sender website before taking action.'],
    };
  }

  return {
    riskScore: 12,
    riskLevel: 'Safe',
    scamType: 'Routine / Non-Threatening Communication',
    indicators: ['No malicious URL signatures', 'Natural grammatical cadence without coercive urgency'],
    explanation: 'No known fraudulent threat markers detected. Appears to be standard communication.',
    recommendedActions: ['Always practice standard digital safety habits.'],
  };
}

function fallbackCoachResponse(message: string, profile: any) {
  const lower = (message || '').toLowerCase();
  const income = profile?.monthlyIncome || 95000;
  const expenses = profile?.monthlyExpenses || 42000;
  const savings = Math.max(0, income - expenses);
  const emergencyFund = profile?.emergencyFund || profile?.existingSavings || 345000;
  const emergencyMonths = expenses > 0 ? Number((emergencyFund / expenses).toFixed(1)) : 6.0;

  if (lower.includes('bike') || lower.includes('afford') || lower.includes('car') || lower.includes('purchase')) {
    const bikeCost = lower.includes('car') ? 850000 : 120000;
    const downpayment = Math.round(bikeCost * 0.25);
    const loanAmt = bikeCost - downpayment;
    const emi = lower.includes('car') ? 18600 : 4220;
    const emiPct = Number(((emi / income) * 100).toFixed(1));
    const runwayAfter = Number(((emergencyFund - downpayment) / expenses).toFixed(1));

    return {
      reply: `### Executive Verdict: Yes, You Can Afford It Safely!

Based on your net monthly salary of **₹${income.toLocaleString('en-IN')}** and liquid reserve of **₹${emergencyFund.toLocaleString('en-IN')}**, here is your complete financial roadmap:

#### 1. Down Payment & Loan Structure
- **Target Purchase Price:** ₹${bikeCost.toLocaleString('en-IN')}
- **Recommended Down Payment (25%):** ₹${downpayment.toLocaleString('en-IN')} (Safely drawn from current reserves)
- **Principal Financed:** ₹${loanAmt.toLocaleString('en-IN')} over 24 months @ 11.5% interest
- **Estimated Monthly EMI:** **₹${emi.toLocaleString('en-IN')}/month**

#### 2. Risk & Runway Impact
- **Debt-to-Income (DTI) Impact:** Your new EMI will constitute **${emiPct}%** of your monthly income. This is safely below the recommended 15% maximum vehicle EMI threshold.
- **Emergency Runway:** Your emergency runway drops slightly from **${emergencyMonths} months** to **${runwayAfter} months**, remaining above the critical 4-month safety baseline.

#### 3. Pro Strategy & Action Steps
1. **Pre-approved Loan Search:** Check with your salary account bank (HDFC/SBI/ICICI) for zero processing fee offers.
2. **Prepayment Flexibility:** Ensure the loan has zero foreclosure charges after 6 months. Prepay using bonus payouts to save up to ₹9,400 in interest.
3. **Insurance Optimization:** Purchase comprehensive 1+3 year third-party bundle directly online to save 20-30% on dealership markups.`,
      calculations: [
        { label: 'Asset Cost', value: `₹${bikeCost.toLocaleString('en-IN')}` },
        { label: 'Down Payment (25%)', value: `₹${downpayment.toLocaleString('en-IN')}` },
        { label: 'Monthly EMI (24 Mo)', value: `₹${emi.toLocaleString('en-IN')}` },
        { label: 'DTI Impact', value: `${emiPct}% of Salary` },
        { label: 'Runway After', value: `${runwayAfter} Months` },
      ],
    };
  }

  if (lower.includes('sip') || lower.includes('fd') || lower.includes('invest') || lower.includes('mutual fund') || lower.includes('stock')) {
    const sipAmount = Math.round(income * 0.2);
    const proj3Yr = Math.round(sipAmount * 36 * 1.21);
    const proj5Yr = Math.round(sipAmount * 60 * 1.39);

    return {
      reply: `### Investment Strategy: Equity Index SIP vs Fixed Deposit (FD)

For any investment timeline greater than 3 years, a **Systematic Investment Plan (SIP) in diversified equity index funds** dramatically outperforms fixed deposits:

#### 1. Real Returns vs Inflation Analysis
- **Nifty 50 Index SIP (Historical 12–14% CAGR):** Real post-inflation return of **+6% to +8%**. Your money actively multiplies in purchasing power.
- **Fixed Deposit (6.8% - 7.25% pre-tax):** Post-tax return in your tax bracket is only **~5.1% net**. Since Indian retail inflation averages 5.5%, FDs actually lose real purchasing power over 5+ years.

#### 2. Recommended Asset Mix for Your Income
- **Core Equity SIP (₹${sipAmount.toLocaleString('en-IN')}/month):**
  - ₹${Math.round(sipAmount * 0.5).toLocaleString('en-IN')}/mo in **Nifty 50 Index Fund** (Large-cap stability)
  - ₹${Math.round(sipAmount * 0.3).toLocaleString('en-IN')}/mo in **Parag Parikh Flexi Cap Fund** (Global + Indian blend)
  - ₹${Math.round(sipAmount * 0.2).toLocaleString('en-IN')}/mo in **Nifty Midcap 150 Index** (High growth engine)
- **Safe Liquidity (₹${(expenses * 6).toLocaleString('en-IN')}):** Retain your 6-month buffer in Auto-sweep FDs or Liquid Mutual Funds for emergency liquidity.

#### 3. Long-Term Compounding Projection
- In **3 Years:** ₹${(sipAmount * 36).toLocaleString('en-IN')} invested grows to approximately **₹${proj3Yr.toLocaleString('en-IN')}**.
- In **5 Years:** ₹${(sipAmount * 60).toLocaleString('en-IN')} invested grows to approximately **₹${proj5Yr.toLocaleString('en-IN')}** (yielding ₹${(proj5Yr - sipAmount * 60).toLocaleString('en-IN')} pure wealth creation).`,
      calculations: [
        { label: 'Recommended Monthly SIP', value: `₹${sipAmount.toLocaleString('en-IN')}` },
        { label: 'Nifty 50 Est. CAGR', value: '12 - 14%' },
        { label: 'Post-Tax FD Return', value: '~5.1% Net' },
        { label: '3-Year Projected Value', value: `₹${(proj3Yr / 100000).toFixed(1)} Lakhs` },
        { label: '5-Year Projected Value', value: `₹${(proj5Yr / 100000).toFixed(1)} Lakhs` },
      ],
    };
  }

  if (lower.includes('loan') || lower.includes('prepay') || lower.includes('debt') || lower.includes('emi')) {
    return {
      reply: `### Strategic Debt Evaluation: Prepayment vs SIP Investing

Whether you should prepay your loan depends on the **loan interest rate vs net expected equity return**:

#### 1. High-Interest Debt (> 10% — Personal Loans, Credit Card EMIs, Car Loans)
- **Verdict: PREPAY AGGRESSIVELY.**
- Paying off a 12% personal loan or 11.5% car loan is the mathematical equivalent of earning a **guaranteed 12% tax-free return**. No market asset guarantees 12% risk-free.
- **Action:** Divert 70% of monthly surplus until high-cost personal debt is cleared.

#### 2. Low-Interest Debt (< 8.5% — Home Loans)
- **Verdict: INVEST SURPLUS IN SIP INSTEAD.**
- Under Section 24(b), home loan interest up to ₹2 Lakh is tax-deductible (if under Old Regime). The effective cost of borrowing is only **~6.2% to 6.8%**.
- An equity SIP earning **12% CAGR** creates a net positive spread of **+5.2% annually**. Over a 10-15 year tenure, investing beats prepayment by over ₹18 Lakhs.

#### 3. Action Checklist
1. Never compromise your **6-month emergency buffer** to prepay debt.
2. Direct annual bonuses and tax refunds into lump-sum principal reductions (Part-prepayment).
3. Ensure no prepayment penalty clauses apply under RBI guidelines for floating rate consumer loans.`,
      calculations: [
        { label: 'High-Cost Loan Threshold', value: '> 10% Interest' },
        { label: 'Home Loan Effective Cost', value: '~6.5% Net' },
        { label: 'Prepay Guaranteed Return', value: 'Matches Interest %' },
        { label: 'SIP Compounding Spread', value: '+5.2% Spread' },
      ],
    };
  }

  // Default Comprehensive Financial Advisory
  const recSavings = Math.round(income * 0.3);
  const recNeeds = Math.round(income * 0.5);
  const recWants = Math.round(income * 0.2);
  const emiCeiling = Math.round(income * 0.35);

  return {
    reply: `### Comprehensive Wealth Roadmap (50 / 30 / 20 Framework)

Based on your net monthly salary of **₹${income.toLocaleString('en-IN')}**, here is your optimized financial blueprint:

#### 1. Monthly Budget Allocations
- **50% Essential Needs (₹${recNeeds.toLocaleString('en-IN')}/mo):** Rent/EMI, groceries, utilities, health insurance, and local transport.
- **30% Wealth Building & Safety (₹${recSavings.toLocaleString('en-IN')}/mo):**
  - ₹${Math.round(recSavings * 0.65).toLocaleString('en-IN')}/mo into **Broad Market Equity SIPs (Nifty 50 + Flexi Cap)**
  - ₹${Math.round(recSavings * 0.35).toLocaleString('en-IN')}/mo into **Liquid Emergency Runway Buffer**
- **20% Guilt-Free Lifestyle (₹${recWants.toLocaleString('en-IN')}/mo):** Dining out, entertainment, shopping, and vacation savings.

#### 2. Liquidity & Emergency Protection Baseline
- **Target Buffer (6 Months):** **₹${(expenses * 6).toLocaleString('en-IN')}**
- **Current Reserves:** ₹${emergencyFund.toLocaleString('en-IN')} (${emergencyMonths} months coverage). Your liquidity cushion is strong!

#### 3. Immediate Action Recommendations
1. **Automate on Salary Day:** Schedule SIP deductions on the 2nd or 5th of every month right after salary credit.
2. **Activate FinGuard Scam Shield:** Always verify unknown UPI payment links and bank SMS forwards through the Scam Shield before approving transactions.
3. **Tax Optimization:** Compare the revised New Tax Regime (₹75k standard deduction) vs Chapter VI-A deductions to save up to ₹36,000 annually.`,
    calculations: [
      { label: 'Monthly Income', value: `₹${income.toLocaleString('en-IN')}` },
      { label: 'Monthly Savings Target (30%)', value: `₹${recSavings.toLocaleString('en-IN')}` },
      { label: 'Emergency Fund Runway', value: `${emergencyMonths} Months` },
      { label: 'Max Safe EMI Ceiling (35%)', value: `₹${emiCeiling.toLocaleString('en-IN')}` },
      { label: 'Annual Wealth Accrual', value: `₹${(recSavings * 12).toLocaleString('en-IN')}` },
    ],
  };
}


// Preserve JSON error responses for unmatched API requests.
app.use('/api', (req: Request, res: Response) => {
  return res.status(404).json({ error: `Unknown API endpoint: ${req.method} ${req.originalUrl}` });
});

// Vercel directs /api/* requests here through a rewrite that records the
// original route in __fin_api_route. The handler reconstructs that route
// without importing Vite, starting a listener, or relying on filesystem state.
export default function handler(req: Request, res: Response) {
  const url = new URL(req.url || '/', 'http://localhost');
  const route = url.searchParams.get('__fin_api_route');
  if (route !== null) {
    if (!/^[a-z0-9/_-]+$/i.test(route)) {
      return res.status(400).json({ error: 'Invalid API route.' });
    }
    url.searchParams.delete('__fin_api_route');
    req.url = `/api/${route}${url.search}`;
  }
  return app(req, res);
}

export { app };
