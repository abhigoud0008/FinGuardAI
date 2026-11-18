export type TransactionCategory = 
  | 'Food' 
  | 'Travel' 
  | 'Shopping' 
  | 'Utilities' 
  | 'Investment' 
  | 'Entertainment' 
  | 'Health' 
  | 'Salary' 
  | 'Other';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash';

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: TransactionCategory;
  paymentMethod: PaymentMethod;
  notes?: string;
  rawSms?: string;
}

export interface BudgetLimit {
  category: TransactionCategory;
  limit: number;
  spent: number;
}

export type RiskLevel = 'Safe' | 'Suspicious' | 'Dangerous';

export interface ScamAnalysisResult {
  id?: string;
  timestamp: string;
  inputContent: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  scamType: string;
  threatCategory?: string;
  indicators: string[];
  explanation: string;
  recommendedActions: string[];
}

export interface ScamIncidentReport {
  incidentId: string;
  timestamp: string;
  mhaPortalText: string;
  emailTemplate: string;
  phoneHelpline1930Summary: string;
  recommendedActions: string[];
}

export interface InvestmentAsset {
  id: string;
  name: string;
  type: 'Mutual Fund' | 'SIP' | 'Stock' | 'Fixed Deposit' | 'Gold' | 'PPF' | 'Crypto';
  investedAmount: number;
  currentValue: number;
  monthlySip?: number;
  category: 'Equity' | 'Debt' | 'Commodity' | 'Cash / Liquid';
  riskLevel: 'Low' | 'Moderate' | 'High';
}

export interface PortfolioHealth {
  diversificationScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  overallHealthScore: number; // 0 - 100
  totalInvested: number;
  totalCurrent: number;
  absoluteReturn: number;
  returnPercentage: number;
  exposure: {
    equity: number;
    debt: number;
    commodity: number;
    cash: number;
  };
  recommendations: string[];
}

export interface TaxInput {
  grossAnnualSalary: number;
  basicSalary: number;
  hraReceived: number;
  rentPaid: number;
  metroCity: boolean;
  section80C: number;
  section80D: number;
  section24b: number;
  section80CCD1B: number;
  otherDeductions: number;
}

export interface TaxRegimeComparison {
  grossIncome: number;
  oldRegime: {
    exemptionsDeductions: number;
    standardDeduction: number;
    taxableIncome: number;
    calculatedTax: number;
    cess: number;
    totalTaxLiability: number;
  };
  newRegime: {
    standardDeduction: number;
    taxableIncome: number;
    calculatedTax: number;
    cess: number;
    totalTaxLiability: number;
  };
  recommendedRegime: 'Old Regime' | 'New Regime' | 'Either';
  taxSavingsWithRecommended: number;
  aiExplanation: string;
  deductionSuggestions: string[];
}

export interface FinancialHealthScore {
  overallScore: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  metrics: {
    savingsRate: { score: number; value: number; benchmark: string; status: 'good' | 'average' | 'needs-work' };
    expenseRatio: { score: number; value: number; benchmark: string; status: 'good' | 'average' | 'needs-work' };
    debtRatio: { score: number; value: number; benchmark: string; status: 'good' | 'average' | 'needs-work' };
    investmentRatio: { score: number; value: number; benchmark: string; status: 'good' | 'average' | 'needs-work' };
    emergencyFundMonths: { score: number; value: number; benchmark: string; status: 'good' | 'average' | 'needs-work' };
  };
  keyTakeaways: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  calculations?: {
    label: string;
    value: string;
  }[];
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'Emergency' | 'Vehicle' | 'House' | 'Retirement' | 'Travel' | 'Education';
}

export interface UserProfile {
  name: string;
  email: string;
  username?: string;
  persona: 'student' | 'salaried' | 'small_business' | 'new_investor';
  monthlyIncome: number;
  monthlyExpenses: number;
  existingSavings: number;
  emergencyFund?: number;
  totalDebt: number;
  authProvider?: 'finguard' | 'instagram' | 'facebook' | 'google' | 'demo';
  avatarUrl?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  name: string;
  passwordHash?: string;
  authProvider: 'finguard' | 'instagram' | 'facebook' | 'google' | 'demo';
  avatarUrl?: string;
  createdAt: string;
  profile: UserProfile;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password?: string;
  provider?: 'finguard' | 'instagram' | 'facebook' | 'google' | 'demo';
}

export interface RegisterPayload {
  username: string;
  email: string;
  name: string;
  password: string;
  persona: 'student' | 'salaried' | 'small_business' | 'new_investor';
  monthlyIncome: number;
}

// -------------------------------------------------------------
// FINGUARD AI FINANCIAL SAFETY COPILOT CORE TYPES
// -------------------------------------------------------------

export type FinGuardScoreLevel = 'Elite' | 'Secure' | 'Growing' | 'Vulnerable' | 'High Risk';

export interface FinGuardScoreHistoricalPoint {
  month: string;
  score: number;
}

export interface FinGuardScoreComponentDetail {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  formula: string;
  status: string;
}

export interface FinGuardScoreComponent {
  score: number;
  max: number;
  weight: string;
  value: number;
  benchmark: string;
  formula: string;
  status: 'good' | 'average' | 'needs-work';
}

export interface FinGuardScore {
  overall: number; // 0 - 100
  overallScore: number;
  level: FinGuardScoreLevel;
  components: FinGuardScoreComponentDetail[];
  componentDict?: {
    savingsRate: FinGuardScoreComponent;
    emergencyFund: FinGuardScoreComponent;
    debtRatio: FinGuardScoreComponent;
    investmentRatio: FinGuardScoreComponent;
    taxEfficiency: FinGuardScoreComponent;
    fraudSafetyAwareness: FinGuardScoreComponent;
  };
  historicalTrend: FinGuardScoreHistoricalPoint[];
  history?: { date: string; score: number }[];
  keyRecommendations: string[];
}

export interface FutureMeSimulation {
  id: string;
  purchaseTitle?: string;
  purchaseName?: string;
  cost: number;
  category: 'Gadget' | 'Vehicle' | 'Travel' | 'Loan' | 'Investment' | 'Lifestyle' | 'Purchase';
  paymentType: 'full_cash' | 'emi_loan' | 'sip_divert' | 'Cash' | 'EMI' | 'Loan';
  emiMonths?: number;
  emiAmount?: number;
  currentScore: number;
  projectedScore: number;
  scoreDelta?: number;
  emergencyFundBefore: number; // in months
  emergencyFundAfter: number;
  savingsDelayMonths: number;
  debtBurdenChange: string | number;
  financialRisk: 'Low' | 'Moderate' | 'High' | 'Dangerous' | 'Safe' | 'Critical';
  recommendation: string;
  safeAlternative?: string;
  alternativePlan?: string;
  timestamp: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship?: 'Mother' | 'Father' | 'Grandparent' | 'Spouse' | 'Child' | 'Sibling' | 'Other';
  relation?: string;
  phoneNumber?: string;
  phone?: string;
  protectionStatus: 'Protected' | 'Alert' | 'Pending';
  scamAlertsCount?: number;
  scamBlockedCount?: number;
  threatsBlocked?: number;
  avatarColor?: string;
  lastActive?: string;
  lastScanTime?: string;
}

export interface FamilyIncident {
  id: string;
  memberId: string;
  memberName: string;
  relationship: string;
  messageSnippet: string;
  threatType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  timestamp: string;
  status: 'Resolved' | 'Action Required' | 'Reported 1930';
}

export type GoalType =
  | 'Bike'
  | 'Laptop'
  | 'Car'
  | 'House'
  | 'Wedding'
  | 'Education'
  | 'Emergency'
  | 'Emergency Fund'
  | 'Retirement'
  | 'Vacation'
  | 'Custom';

export interface GoalPlan {
  id: string;
  type?: GoalType;
  goalType?: GoalType;
  title: string;
  targetAmount: number;
  currentSavings?: number;
  currentAmount?: number;
  targetMonths?: number;
  monthlyRequired?: number;
  targetDate?: string;
  projectedDate?: string;
  projectedCompletionDate?: string;
  monthlySavingRequired?: number;
  successProbability: number; // 0 - 100%
  recommendedMonthlySavings?: number;
  suggestedInstrument?: string;
  suggestedVehicle?: string;
  category?: string;
  status?: 'On Track' | 'Needs Attention' | 'Completed';
}

export type ThreatTypeCategory =
  | 'Bank KYC Scam'
  | 'PAN Update Scam'
  | 'Electricity Bill Scam'
  | 'Fake UPI Collect Request'
  | 'WhatsApp Job Scam'
  | 'Telegram Investment Scam'
  | 'Task Rating Scam'
  | 'APK Installation Scam'
  | 'QR Code Scam'
  | 'Instant Loan Approval Scam';

export interface ImpactSavingsMetric {
  scamsPreventedCount: number;
  potentialMoneySaved: number;
  monthlySavingsImproved: number;
  scoreImprovementPoints: number;
  totalSaved: number;
  scamsBlockedAmount: number;
  badPurchasesAvoided: number;
  taxSaved: number;
  budgetOptimized: number;
}
