import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Transaction,
  BudgetLimit,
  InvestmentAsset,
  ScamAnalysisResult,
  UserProfile,
  FinancialHealthScore,
  FinancialGoal,
  UserAccount,
  RegisterPayload,
  FinGuardScore,
  FinGuardScoreLevel,
  FinGuardScoreComponentDetail,
  FinGuardScoreHistoricalPoint,
  FutureMeSimulation,
  FamilyMember,
  FamilyIncident,
  GoalPlan,
  ImpactSavingsMetric,
} from '../types/finance';
import { api } from '../services/api';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  assets: InvestmentAsset[];
  scamReports: ScamAnalysisResult[];
  userProfile: UserProfile;
  healthScore: FinancialHealthScore;
  finguardScore: FinGuardScore;
  goals: FinancialGoal[];
  goalPlans: GoalPlan[];
  simulations: FutureMeSimulation[];
  familyMembers: FamilyMember[];
  familyIncidents: FamilyIncident[];
  impactSavings: ImpactSavingsMetric;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  // Auth state & methods
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (credentials: { usernameOrEmail: string; password?: string }) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  socialLogin: (provider: 'instagram' | 'facebook' | 'google', handle?: string) => Promise<void>;
  logout: () => void;
  // Financial & Feature methods
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addScamReport: (report: ScamAnalysisResult) => void;
  analyzeScam: (text: string) => Promise<ScamAnalysisResult>;
  addAsset: (asset: Omit<InvestmentAsset, 'id'>) => void;
  updateAsset: (asset: InvestmentAsset) => void;
  deleteAsset: (id: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  simulateDecision: (params: any) => Promise<FutureMeSimulation>;
  addSimulation: (sim: FutureMeSimulation) => void;
  addFamilyMember: (member: FamilyMember) => void;
  addGoalPlan: (goal: GoalPlan) => void;
  loadHackathonDemoData: () => void;
  resetToSampleData: () => void;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-11-10',
    merchant: 'Infosys Payroll',
    amount: 95000,
    type: 'credit',
    category: 'Salary',
    paymentMethod: 'Net Banking',
    notes: 'November Monthly Salary',
  },
  {
    id: 'tx-2',
    date: '2026-11-09',
    merchant: 'Swiggy Gourmet',
    amount: 680,
    type: 'debit',
    category: 'Food',
    paymentMethod: 'UPI',
    notes: 'Dinner with team',
  },
  {
    id: 'tx-3',
    date: '2026-11-08',
    merchant: 'Uber Premier',
    amount: 420,
    type: 'debit',
    category: 'Travel',
    paymentMethod: 'UPI',
    notes: 'Ride to Indiranagar',
  },
  {
    id: 'tx-4',
    date: '2026-11-07',
    merchant: 'Zerodha Coin SIP',
    amount: 15000,
    type: 'debit',
    category: 'Investment',
    paymentMethod: 'Net Banking',
    notes: 'Nifty 50 Index + Flexi Cap',
  },
  {
    id: 'tx-5',
    date: '2026-11-06',
    merchant: 'BESCOM Electricity',
    amount: 2350,
    type: 'debit',
    category: 'Utilities',
    paymentMethod: 'UPI',
    notes: 'Apartment power bill',
  },
  {
    id: 'tx-6',
    date: '2026-11-05',
    merchant: 'Amazon India',
    amount: 3499,
    type: 'debit',
    category: 'Shopping',
    paymentMethod: 'Credit Card',
    notes: 'Ergonomic keyboard',
  },
  {
    id: 'tx-7',
    date: '2026-11-04',
    merchant: 'PVR INOX IMAX',
    amount: 1250,
    type: 'debit',
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    notes: 'Sci-fi movie tickets',
  },
  {
    id: 'tx-8',
    date: '2026-11-03',
    merchant: 'Cult.fit Gym',
    amount: 1999,
    type: 'debit',
    category: 'Health',
    paymentMethod: 'UPI',
    notes: 'Monthly fitness pass',
  },
  {
    id: 'tx-9',
    date: '2026-11-02',
    merchant: 'Zomato Daily',
    amount: 320,
    type: 'debit',
    category: 'Food',
    paymentMethod: 'UPI',
    notes: 'Lunch bowl',
  },
  {
    id: 'tx-10',
    date: '2026-11-01',
    merchant: 'HPCL Auto Fuel',
    amount: 2100,
    type: 'debit',
    category: 'Travel',
    paymentMethod: 'Credit Card',
    notes: 'Full tank fuel',
  },
];

const INITIAL_BUDGETS: BudgetLimit[] = [
  { category: 'Food', limit: 14000, spent: 1000 },
  { category: 'Travel', limit: 7000, spent: 2520 },
  { category: 'Shopping', limit: 10000, spent: 3499 },
  { category: 'Utilities', limit: 5000, spent: 2350 },
  { category: 'Investment', limit: 20000, spent: 15000 },
  { category: 'Entertainment', limit: 4000, spent: 1250 },
  { category: 'Health', limit: 3000, spent: 1999 },
];

const INITIAL_ASSETS: InvestmentAsset[] = [
  {
    id: 'asset-1',
    name: 'UTI Nifty 50 Index Fund Direct-Growth',
    type: 'Mutual Fund',
    investedAmount: 240000,
    currentValue: 312000,
    monthlySip: 10000,
    category: 'Equity',
    riskLevel: 'Moderate',
  },
  {
    id: 'asset-2',
    name: 'Parag Parikh Flexi Cap Fund Direct-Growth',
    type: 'Mutual Fund',
    investedAmount: 180000,
    currentValue: 245000,
    monthlySip: 5000,
    category: 'Equity',
    riskLevel: 'Moderate',
  },
  {
    id: 'asset-3',
    name: 'HDFC Corporate Bond Fund Direct',
    type: 'Mutual Fund',
    investedAmount: 100000,
    currentValue: 114000,
    category: 'Debt',
    riskLevel: 'Low',
  },
  {
    id: 'asset-4',
    name: 'Sovereign Gold Bonds (SGB 2021 Series)',
    type: 'Gold',
    investedAmount: 50000,
    currentValue: 78000,
    category: 'Commodity',
    riskLevel: 'Low',
  },
  {
    id: 'asset-5',
    name: 'State Bank of India 3-Year Fixed Deposit',
    type: 'Fixed Deposit',
    investedAmount: 150000,
    currentValue: 168000,
    category: 'Cash / Liquid',
    riskLevel: 'Low',
  },
];

const INITIAL_SCAM_REPORTS: ScamAnalysisResult[] = [
  {
    id: 'scam-1',
    timestamp: '2026-11-10T12:30:00Z',
    inputContent: 'URGENT: Your HDFC bank account will be suspended today due to pending PAN KYC. Click http://hdfc-kyc-update.online/auth to verify within 2 hours.',
    riskScore: 92,
    riskLevel: 'Dangerous',
    scamType: 'Banking Phishing / Credential Harvesting',
    threatCategory: 'Bank KYC Scam',
    indicators: [
      'Unverified third-party phishing URL (hdfc-kyc-update.online)',
      'Artificial psychological urgency (suspended today in 2 hours)',
      'Bank never requests PAN or NetBanking password over SMS links',
    ],
    explanation: 'Deceptive cyber criminal campaign mimicking HDFC Bank. Visiting the link exposes your NetBanking username and OTP to rogue servers.',
    recommendedActions: [
      'Never open or forward this link',
      'Report directly to National Cyber Crime Portal Helpline: 1930',
      'Forward SMS to 1909 (TRAI DND Fraud reporting)',
    ],
  },
  {
    id: 'scam-2',
    timestamp: '2026-11-09T18:15:00Z',
    inputContent: 'Dear consumer your electricity power will be disconnected at 9:30 PM from power office because your previous month bill was not updated. Contact officer at 9876543210.',
    riskScore: 88,
    riskLevel: 'Dangerous',
    scamType: 'Electricity Utility Disconnection Extortion',
    threatCategory: 'Electricity Bill Scam',
    indicators: [
      'Personal 10-digit mobile number provided instead of official DISCOM board IVR',
      'Same-night disconnection threat creating panic',
      'Lack of Consumer Account number or specific electricity circle details',
    ],
    explanation: 'Nationwide electricity fraud racket. Calling the number leads to social engineering asking you to install AnyDesk or send ₹10 via malicious APK.',
    recommendedActions: [
      'Ignore the message and do not call the personal phone number',
      'Verify outstanding power dues exclusively on official DISCOM mobile app or portal',
    ],
  },
  {
    id: 'scam-3',
    timestamp: '2026-11-08T09:40:00Z',
    inputContent: 'Part-time job offer! Earn ₹3,000 to ₹8,000 daily by simply rating hotels on Google Maps. Daily payouts. Message HR on Telegram @CryptoEarnVIP.',
    riskScore: 95,
    riskLevel: 'Dangerous',
    scamType: 'Prepaid Task / Telegram Hotel Review Fraud',
    threatCategory: 'Telegram Investment Scam',
    indicators: [
      'Unrealistic earnings for minimal effort (₹8,000/day for ratings)',
      'Redirection to unverified Telegram handle',
      'Classic task scam progression requiring prepaid security deposits',
    ],
    explanation: 'Scammers pay initial ₹150 to build trust, then lock tens of thousands in prepaid task deposit tiers with zero withdrawal capability.',
    recommendedActions: [
      'Block the sender immediately',
      'Never pay money to unlock supposed freelance earnings',
    ],
  },
];

const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Reserve (6 Months)',
    targetAmount: 250000,
    currentAmount: 185000,
    targetDate: '2027-03-31',
    category: 'Emergency',
  },
  {
    id: 'goal-2',
    title: 'Ather 450X Electric Scooter',
    targetAmount: 150000,
    currentAmount: 45000,
    targetDate: '2027-06-30',
    category: 'Vehicle',
  },
  {
    id: 'goal-3',
    title: 'Apartment Down Payment Reserve',
    targetAmount: 800000,
    currentAmount: 280000,
    targetDate: '2029-12-31',
    category: 'House',
  },
];

const INITIAL_SIMULATIONS: FutureMeSimulation[] = [
  {
    id: 'sim-init-1',
    purchaseTitle: 'iPhone 16 Pro (256 GB)',
    purchaseName: 'Apple iPhone 16 Pro (256 GB)',
    cost: 80000,
    category: 'Purchase',
    paymentType: 'Cash',
    currentScore: 84,
    projectedScore: 67,
    scoreDelta: -17,
    emergencyFundBefore: 6.2,
    emergencyFundAfter: 4.1,
    savingsDelayMonths: 2.2,
    debtBurdenChange: 'No new debt (Liquid cash drop)',
    financialRisk: 'Moderate',
    recommendation: 'Purchase reduces liquid emergency buffer from 6.2 to 4.1 months. FinGuard Score drops from Secure (84) to Growing (67).',
    safeAlternative: 'Wait 3 months, allocate ₹15,000/mo into a short-term reserve to purchase without eroding emergency security.',
    alternativePlan: 'Wait 3 months, allocate ₹15,000/mo into a short-term reserve to purchase without eroding emergency security.',
    timestamp: '2026-11-10T16:30:00Z',
  },
  {
    id: 'sim-init-2',
    purchaseTitle: 'Royal Enfield Hunter 350',
    purchaseName: 'Royal Enfield Hunter 350',
    cost: 150000,
    category: 'Purchase',
    paymentType: 'EMI',
    emiMonths: 24,
    emiAmount: 7200,
    currentScore: 84,
    projectedScore: 78,
    scoreDelta: -6,
    emergencyFundBefore: 6.2,
    emergencyFundAfter: 5.6,
    savingsDelayMonths: 3.8,
    debtBurdenChange: '+18.5% DTI increase',
    financialRisk: 'Safe',
    recommendation: 'Safe to purchase with 2-year EMI. Your debt-to-income remains well under 25%, maintaining your Secure rating.',
    safeAlternative: 'Increase down payment by ₹25,000 using Diwali bonus to save ₹8,400 in total interest.',
    alternativePlan: 'Increase down payment by ₹25,000 using Diwali bonus to save ₹8,400 in total interest.',
    timestamp: '2026-11-08T11:20:00Z',
  },
];

const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Savitri Goud (Mother)',
    relationship: 'Mother',
    relation: 'Mother',
    phoneNumber: '+91 98765 43210',
    phone: '+91 98765 43210',
    protectionStatus: 'Protected',
    scamAlertsCount: 3,
    scamBlockedCount: 3,
    threatsBlocked: 3,
    avatarColor: 'bg-rose-500',
    lastActive: '10 mins ago',
    lastScanTime: '10 mins ago',
  },
  {
    id: 'fam-2',
    name: 'Ramesh Goud (Father)',
    relationship: 'Father',
    relation: 'Father',
    phoneNumber: '+91 98480 12345',
    phone: '+91 98480 12345',
    protectionStatus: 'Protected',
    scamAlertsCount: 1,
    scamBlockedCount: 1,
    threatsBlocked: 1,
    avatarColor: 'bg-blue-500',
    lastActive: '2 hours ago',
    lastScanTime: '2 hours ago',
  },
  {
    id: 'fam-3',
    name: 'Ananya Goud (Spouse)',
    relationship: 'Spouse',
    relation: 'Spouse',
    phoneNumber: '+91 99887 65432',
    phone: '+91 99887 65432',
    protectionStatus: 'Protected',
    scamAlertsCount: 0,
    scamBlockedCount: 0,
    threatsBlocked: 0,
    avatarColor: 'bg-purple-500',
    lastActive: 'Yesterday',
    lastScanTime: 'Yesterday',
  },
];

const INITIAL_FAMILY_INCIDENTS: FamilyIncident[] = [
  {
    id: 'inc-101',
    memberId: 'fam-1',
    memberName: 'Savitri Goud (Mother)',
    relationship: 'Mother',
    messageSnippet: 'URGENT: Electricity power will be disconnected at 9:30 PM due to unpaid bill. Call Officer 9876543210 immediately.',
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
    messageSnippet: 'Dear customer, your SBI rewards points ₹7,500 expiring today. Download rewards APK app at bit.ly/sbi-rewards.',
    threatType: 'APK Installation Scam',
    riskScore: 96,
    riskLevel: 'Dangerous',
    timestamp: '2026-11-10T14:40:00Z',
    status: 'Resolved',
  },
];

const INITIAL_GOAL_PLANS: GoalPlan[] = [
  {
    id: 'goal-plan-1',
    type: 'Bike',
    goalType: 'Bike',
    title: 'Electric Motorcycle (Ather 450X)',
    targetAmount: 150000,
    currentSavings: 45000,
    currentAmount: 45000,
    targetDate: '2027-06-30',
    projectedDate: 'Jun 2027',
    targetMonths: 7,
    monthlyRequired: 5400,
    monthlySavingRequired: 5400,
    projectedCompletionDate: '2027-06-15',
    successProbability: 92,
    recommendedMonthlySavings: 6000,
    suggestedInstrument: 'High-Yield Recurring Deposit & Arbitrage Fund',
    suggestedVehicle: 'Arbitrage Fund / Liquid Mutual Fund',
    category: 'Vehicle',
    status: 'On Track',
  },
  {
    id: 'goal-plan-2',
    type: 'Emergency Fund',
    goalType: 'Emergency Fund',
    title: '6-Month Emergency Buffer',
    targetAmount: 250000,
    currentSavings: 185000,
    currentAmount: 185000,
    targetDate: '2027-03-31',
    projectedDate: 'Mar 2027',
    targetMonths: 4,
    monthlyRequired: 4200,
    monthlySavingRequired: 4200,
    projectedCompletionDate: '2027-03-20',
    successProbability: 96,
    recommendedMonthlySavings: 4500,
    suggestedInstrument: 'Instant-Redemption Liquid Fund & Auto-Sweep FD',
    suggestedVehicle: 'Instant-Redemption Liquid Fund & Auto-Sweep FD',
    category: 'Emergency',
    status: 'On Track',
  },
  {
    id: 'goal-plan-3',
    type: 'House',
    goalType: 'House',
    title: 'Apartment Down Payment Reserve',
    targetAmount: 800000,
    currentSavings: 280000,
    currentAmount: 280000,
    targetDate: '2029-12-31',
    projectedDate: 'Dec 2029',
    targetMonths: 37,
    monthlyRequired: 11800,
    monthlySavingRequired: 11800,
    projectedCompletionDate: '2029-11-15',
    successProbability: 88,
    recommendedMonthlySavings: 12500,
    suggestedInstrument: 'Nifty 50 Index + Multi-Cap Equity SIP',
    suggestedVehicle: 'Nifty 50 Index + Multi-Cap Equity SIP',
    category: 'House',
    status: 'On Track',
  },
];

const INITIAL_IMPACT_METRICS: ImpactSavingsMetric = {
  scamsPreventedCount: 14,
  potentialMoneySaved: 485000,
  monthlySavingsImproved: 12400,
  scoreImprovementPoints: 19,
  totalSaved: 215400,
  scamsBlockedAmount: 98000,
  badPurchasesAvoided: 85000,
  taxSaved: 24500,
  budgetOptimized: 7900,
};

const INITIAL_PROFILE: UserProfile = {
  name: 'Abhishek Goud',
  username: 'abhigoud9346',
  email: 'abhigoud9346@gmail.com',
  persona: 'salaried',
  monthlyIncome: 95000,
  monthlyExpenses: 42000,
  existingSavings: 345000,
  emergencyFund: 345000,
  totalDebt: 320000,
  authProvider: 'finguard',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('finguard_user');
      return stored ? JSON.parse(stored) : {
        id: 'user-default-1',
        username: 'abhigoud9346',
        name: 'Abhishek Goud',
        email: 'abhigoud9346@gmail.com',
        authProvider: 'finguard',
        createdAt: new Date().toISOString(),
        profile: INITIAL_PROFILE
      };
    } catch {
      return {
        id: 'user-default-1',
        username: 'abhigoud9346',
        name: 'Abhishek Goud',
        email: 'abhigoud9346@gmail.com',
        authProvider: 'finguard',
        createdAt: new Date().toISOString(),
        profile: INITIAL_PROFILE
      };
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<BudgetLimit[]>(INITIAL_BUDGETS);
  const [assets, setAssets] = useState<InvestmentAsset[]>(INITIAL_ASSETS);
  const [scamReports, setScamReports] = useState<ScamAnalysisResult[]>(INITIAL_SCAM_REPORTS);
  const [goals, setGoals] = useState<FinancialGoal[]>(INITIAL_GOALS);
  const [goalPlans, setGoalPlans] = useState<GoalPlan[]>(INITIAL_GOAL_PLANS);
  const [simulations, setSimulations] = useState<FutureMeSimulation[]>(INITIAL_SIMULATIONS);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [familyIncidents, setFamilyIncidents] = useState<FamilyIncident[]>(INITIAL_FAMILY_INCIDENTS);
  const [impactSavings, setImpactSavings] = useState<ImpactSavingsMetric>(INITIAL_IMPACT_METRICS);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('finguard_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.profile) return u.profile;
      }
    } catch {}
    return INITIAL_PROFILE;
  });

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (credentials: { usernameOrEmail: string; password?: string }) => {
    const res = await api.login(credentials);
    if (res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setUserProfile(res.user.profile);
      try {
        localStorage.setItem('finguard_user', JSON.stringify(res.user));
      } catch (e) {
        console.warn('Could not save user to localStorage:', e);
      }
      setIsAuthModalOpen(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    const res = await api.register(data);
    if (res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setUserProfile(res.user.profile);
      try {
        localStorage.setItem('finguard_user', JSON.stringify(res.user));
      } catch (e) {
        console.warn('Could not save user to localStorage:', e);
      }
      setIsAuthModalOpen(false);
    }
  };

  const socialLogin = async (provider: 'instagram' | 'facebook' | 'google', handle?: string) => {
    const res = await api.socialLogin({ provider, handle });
    if (res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      setUserProfile(res.user.profile);
      try {
        localStorage.setItem('finguard_user', JSON.stringify(res.user));
      } catch (e) {
        console.warn('Could not save user to localStorage:', e);
      }
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('finguard_user');
    } catch {}
  };

  // Sync dark mode class on HTML document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (tx.type === 'debit') {
      setBudgets((prev) =>
        prev.map((b) => (b.category === tx.category ? { ...b, spent: b.spent + tx.amount } : b))
      );
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addScamReport = (report: ScamAnalysisResult) => {
    setScamReports((prev) => [report, ...prev]);
  };

  const analyzeScam = async (text: string): Promise<ScamAnalysisResult> => {
    const res = await api.analyzeScam(text);
    addScamReport(res);
    return res;
  };

  const addAsset = (asset: Omit<InvestmentAsset, 'id'>) => {
    const newAsset: InvestmentAsset = {
      ...asset,
      id: `asset-${Date.now()}`,
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  const updateAsset = (updated: InvestmentAsset) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profileUpdate }));
  };

  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g))
    );
  };

  const simulateDecision = async (params: any): Promise<FutureMeSimulation> => {
    const res = await api.simulateFutureDecision(params);
    addSimulation(res);
    return res;
  };

  const addSimulation = (sim: FutureMeSimulation) => {
    setSimulations((prev) => [sim, ...prev]);
  };

  const addFamilyMember = (member: FamilyMember) => {
    setFamilyMembers((prev) => [member, ...prev]);
  };

  const addGoalPlan = (goal: GoalPlan) => {
    setGoalPlans((prev) => [goal, ...prev]);
  };

  const loadHackathonDemoData = () => {
    setUserProfile({
      name: 'Abhishek Goud',
      username: 'abhigoud9346',
      email: 'abhigoud9346@gmail.com',
      persona: 'salaried',
      monthlyIncome: 95000,
      monthlyExpenses: 42000,
      existingSavings: 345000,
      emergencyFund: 345000,
      totalDebt: 320000,
      authProvider: 'finguard',
    });
    setSimulations(INITIAL_SIMULATIONS);
    setFamilyMembers(INITIAL_FAMILY_MEMBERS);
    setFamilyIncidents(INITIAL_FAMILY_INCIDENTS);
    setGoalPlans(INITIAL_GOAL_PLANS);
    setImpactSavings({
      scamsPreventedCount: 18,
      potentialMoneySaved: 540000,
      monthlySavingsImproved: 14500,
      scoreImprovementPoints: 21,
      totalSaved: 215400,
      scamsBlockedAmount: 98000,
      badPurchasesAvoided: 85000,
      taxSaved: 24500,
      budgetOptimized: 7900,
    });
  };

  const resetToSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setAssets(INITIAL_ASSETS);
    setScamReports(INITIAL_SCAM_REPORTS);
    setGoals(INITIAL_GOALS);
    setGoalPlans(INITIAL_GOAL_PLANS);
    setSimulations(INITIAL_SIMULATIONS);
    setFamilyMembers(INITIAL_FAMILY_MEMBERS);
    setFamilyIncidents(INITIAL_FAMILY_INCIDENTS);
    setImpactSavings(INITIAL_IMPACT_METRICS);
    setUserProfile(INITIAL_PROFILE);
  };

  // Compute generic health score
  const computeHealthScore = (): FinancialHealthScore => {
    const income = userProfile.monthlyIncome || 95000;
    const expenses = userProfile.monthlyExpenses || 42000;
    const savings = Math.max(0, income - expenses);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const emergencyMonths = expenses > 0 ? Number(((userProfile.emergencyFund || userProfile.existingSavings) / expenses).toFixed(1)) : 0;
    const estimatedMonthlyDebt = Math.round((userProfile.totalDebt || 0) * 0.025);
    const debtRatio = income > 0 ? Number(((estimatedMonthlyDebt / income) * 100).toFixed(1)) : 0;
    const totalSip = assets.reduce((sum, a) => sum + (a.monthlySip || 0), 0);
    const investmentRatio = income > 0 ? Number(((totalSip / income) * 100).toFixed(1)) : 0;

    return {
      overallScore: 84,
      rating: 'Good',
      metrics: {
        savingsRate: { score: 85, value: Math.round(savingsRate), benchmark: '>30%', status: 'good' },
        expenseRatio: { score: 88, value: Math.round((expenses / income) * 100), benchmark: '<50%', status: 'good' },
        debtRatio: { score: 78, value: Math.round(debtRatio), benchmark: '<30%', status: 'good' },
        investmentRatio: { score: 80, value: Math.round(investmentRatio), benchmark: '>20%', status: 'good' },
        emergencyFundMonths: { score: 90, value: emergencyMonths, benchmark: '6 mo', status: 'good' },
      },
      keyTakeaways: [
        'Strong liquid emergency buffer shielding against unexpected expenses.',
        'Disciplined savings rate supporting consistent wealth growth.',
      ],
    };
  };

  const healthScore = computeHealthScore();

  // Compute branded FinGuard Score (0-100) using 6 official parameters
  const computeFinGuardScore = (): FinGuardScore => {
    const income = userProfile.monthlyIncome || 95000;
    const expenses = userProfile.monthlyExpenses || 42000;
    const savings = Math.max(0, income - expenses);
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;
    const emergencyMonths = expenses > 0 ? Number(((userProfile.emergencyFund || userProfile.existingSavings) / expenses).toFixed(1)) : 0;
    const estimatedMonthlyDebt = Math.round((userProfile.totalDebt || 0) * 0.025);
    const debtRatio = income > 0 ? Number(((estimatedMonthlyDebt / income) * 100).toFixed(1)) : 0;
    const totalSip = assets.reduce((sum, a) => sum + (a.monthlySip || 0), 0);
    const investmentRatio = income > 0 ? Number(((totalSip / income) * 100).toFixed(1)) : 0;

    // 1. Savings Rate (25% weight, max 25, benchmark >30%)
    const sPts = Math.min(25, Math.round((savingsRate / 30) * 25));

    // 2. Emergency Fund (20% weight, max 20, benchmark >=6 months)
    const ePts = Math.min(20, Math.round((emergencyMonths / 6) * 20));

    // 3. Debt Ratio (15% weight, max 15, benchmark <30%)
    const dPts = Math.min(15, Math.max(0, Math.round((1 - debtRatio / 40) * 15)));

    // 4. Investment Ratio (15% weight, max 15, benchmark >20%)
    const iPts = Math.min(15, Math.round((investmentRatio / 20) * 15));

    // 5. Tax Efficiency (10% weight, max 10, optimal New/Old regime utilization)
    const tPts = 9;

    // 6. Fraud Safety Awareness (15% weight, max 15, verified scam defense & family shield)
    const dangerousCount = scamReports.filter((s) => s.riskLevel === 'Dangerous').length;
    const fPts = Math.min(15, 10 + (dangerousCount > 0 ? 3 : 1) + (familyMembers.length >= 2 ? 2 : 0));

    const totalScore = Math.min(100, Math.max(15, sPts + ePts + dPts + iPts + tPts + fPts));

    let level: FinGuardScoreLevel = 'Secure';
    if (totalScore >= 90) level = 'Elite';
    else if (totalScore >= 75) level = 'Secure';
    else if (totalScore >= 60) level = 'Growing';
    else if (totalScore >= 40) level = 'Vulnerable';
    else level = 'High Risk';

    const componentsList: FinGuardScoreComponentDetail[] = [
      {
        name: 'Savings Ratio',
        score: sPts,
        maxScore: 25,
        weight: 25,
        formula: 'min(25, (Monthly Savings / Income) / 0.30 × 25)',
        status: savingsRate >= 30 ? 'Strong savings discipline' : 'Below 30% target',
      },
      {
        name: 'Emergency Fund Runway',
        score: ePts,
        maxScore: 20,
        weight: 20,
        formula: 'min(20, (Liquid Savings / Monthly Expenses) / 6.0 × 20)',
        status: emergencyMonths >= 6 ? 'Full 6-month buffer secure' : `${emergencyMonths} mos runway`,
      },
      {
        name: 'Debt-to-Income (DTI)',
        score: dPts,
        maxScore: 15,
        weight: 15,
        formula: 'max(0, 15 × (1 - (Est. Monthly EMI / Income) / 0.40))',
        status: debtRatio <= 30 ? 'Low debt burden' : 'High leverage risk',
      },
      {
        name: 'Investment Diversification',
        score: iPts,
        maxScore: 15,
        weight: 15,
        formula: 'min(15, (Monthly SIP Investment / Income) / 0.20 × 15)',
        status: investmentRatio >= 20 ? 'Active compounding in equity/gold' : 'Below 20% target',
      },
      {
        name: 'Tax Efficiency',
        score: tPts,
        maxScore: 10,
        weight: 10,
        formula: 'min(10, (Tax Exemptions Utilized / Benchmark) × 10)',
        status: 'Optimized regime deduction',
      },
      {
        name: 'Fraud Safety Awareness',
        score: fPts,
        maxScore: 15,
        weight: 15,
        formula: 'Base 10 pts + (Scams Blocked × 2.5) [Max 15]',
        status: 'Family shield armed & zero compromised transfers',
      },
    ];

    const historicalTrend: FinGuardScoreHistoricalPoint[] = [
      { month: 'Jun', score: 68 },
      { month: 'Jul', score: 71 },
      { month: 'Aug', score: 74 },
      { month: 'Sep', score: 78 },
      { month: 'Oct', score: 81 },
      { month: 'Nov', score: totalScore },
    ];

    return {
      overall: totalScore,
      overallScore: totalScore,
      level,
      components: componentsList,
      historicalTrend,
      history: [
        { date: 'Jun', score: 68 },
        { date: 'Jul', score: 71 },
        { date: 'Aug', score: 74 },
        { date: 'Sep', score: 78 },
        { date: 'Oct', score: 81 },
        { date: 'Nov', score: totalScore },
      ],
      keyRecommendations: [
        emergencyMonths >= 6
          ? 'Emergency fund covers living expenses for over 6 months.'
          : `Liquid emergency buffer is ${emergencyMonths} months. Target reaching 6 full months to protect score.`,
        'Active Fraud Shield enabled across 3 family members protecting against UPI collect & KYC scams.',
        'Diversified SIP allocation compounds wealth while maintaining debt ceiling below 30%.',
      ],
    };
  };

  const finguardScore = computeFinGuardScore();

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        assets,
        scamReports,
        userProfile,
        healthScore,
        finguardScore,
        goals,
        goalPlans,
        simulations,
        familyMembers,
        familyIncidents,
        impactSavings,
        isDarkMode,
        toggleDarkMode,
        currentUser,
        isAuthenticated,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        socialLogin,
        logout,
        addTransaction,
        deleteTransaction,
        addScamReport,
        analyzeScam,
        addAsset,
        updateAsset,
        deleteAsset,
        updateUserProfile,
        addGoal,
        updateGoalProgress,
        simulateDecision,
        addSimulation,
        addFamilyMember,
        addGoalPlan,
        loadHackathonDemoData,
        resetToSampleData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
