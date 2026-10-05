/**
 * SORA (Singapore Overnight Rate Average) Types & Definitions
 * Based on Monetary Authority of Singapore (MAS) conventions.
 */

export interface DailySoraRate {
  date: string; // YYYY-MM-DD
  rate: number; // Overnight rate in percentage, e.g. 2.8250 (%)
  volumeSGDMillion?: number; // Total volume in SGD millions
  compound1M?: number; // 1-Month Compounded SORA (%)
  compound3M?: number; // 3-Month Compounded SORA (%)
  compound6M?: number; // 6-Month Compounded SORA (%)
  soraIndex?: number; // MAS SORA Index
}

export type BenchmarkType = '3M_SORA' | '1M_SORA' | '6M_SORA' | 'OVERNIGHT' | 'CUSTOM';

export interface BankPackagePreset {
  id: string;
  bankName: string;
  packageName: string;
  benchmark: BenchmarkType;
  spreadYear1to3: number; // % e.g. 0.65
  spreadThereafter: number; // % e.g. 0.80
  lockInYears: number;
  description: string;
}

export interface LoanInputs {
  principal: number; // Loan amount in SGD
  tenureYears: number; // 1 to 35
  benchmarkType: BenchmarkType;
  customBenchmarkRate: number; // Used if benchmarkType === 'CUSTOM'
  bankSpread: number; // Bank margin in %, e.g. 0.70
  interestCalculationMethod: 'AMORTIZED' | 'INTEREST_ONLY';
  startDate: string; // YYYY-MM-DD
  // Prepayment options
  extraMonthlyPayment: number;
  lumpSumPayment: number;
  lumpSumMonth: number;
}

export interface AmortizationRow {
  month: number;
  year: number;
  date: string;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  cumulativeInterest: number;
}

export interface LoanCalculationResult {
  monthlyInstallment: number;
  effectiveAnnualRate: number; // SORA benchmark + spread
  benchmarkRate: number;
  bankSpread: number;
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  payoffMonths: number;
  interestSavedWithExtra: number;
  monthsSavedWithExtra: number;
  amortizationSchedule: AmortizationRow[];
  yearlySummary: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    endingBalance: number;
  }[];
}

export interface DailyCompoundDetail {
  date: string;
  dayOfWeek: string;
  isBusinessDay: boolean;
  rate: number; // Percentage e.g. 2.85
  dayWeight: number; // n_i (calendar days rate applies, e.g. 1 for Mon-Thu, 3 for Fri)
  dailyFactor: number; // (1 + r_i * n_i / 365)
  cumulativeFactor: number; // Product so far
  dailyInterestOnPrincipal: number;
}

export interface InArrearsResult {
  startDate: string;
  endDate: string;
  calendarDays: number; // D
  businessDays: number; // d_b
  principal: number;
  compoundedSoraRate: number; // Compounded annualised rate (%)
  spreadRate: number; // Spread %
  totalEffectiveRate: number; // Compounded + spread (%)
  totalInterestPayable: number; // In SGD
  details: DailyCompoundDetail[];
}

export interface StressScenario {
  scenarioName: string;
  rateAdjustment: number; // e.g. -0.5, 0, +0.5, +1.0, +1.5, +2.0
  simulatedSoraRate: number;
  effectiveRate: number;
  monthlyPayment: number;
  monthlyDifference: number;
  totalInterest: number;
  tdsrRequiredIncome?: number; // Income required if TDSR is 55%
}

export interface MasApiConfig {
  mode: 'embedded' | 'remote';
  apiUrl: string;
  apiKey?: string;
  lastUpdated: string;
  status: 'connected' | 'offline' | 'fallback';
}

export type UserPerspective = 'market_participant' | 'mas_director';

export interface BankSubmissionRecord {
  bankCode: string;
  bankName: string;
  reportedVolumeSGDMillion: number;
  weightedRatePercent: number;
  submissionTime: string;
  status: 'verified' | 'flagged' | 'pending';
  varianceBps: number;
}

export interface MacroprudentialMetrics {
  totalResidentialMortgageStockBillion: number; // e.g. SGD 235 Billion
  soraAdoptionRatePercent: number; // e.g. 99.4%
  averageBorrowerTdsrPercent: number; // e.g. 43.8%
  atRiskBorrowersBaselinePercent: number; // e.g. 2.8%
  atRiskBorrowersPlus200bpsPercent: number; // e.g. 8.4%
  systemicMonthlyRepaymentIncreaseMillion: number; // e.g. SGD 312M / month at +200bps
  interbankLiquidityScore: 'Robust' | 'Moderate' | 'Constrained';
  fixingPublicationCertified: boolean;
}

export interface DirectorPolicyLevers {
  tdsrCeilingPercent: number; // Default 55%
  stressTestFloorRatePercent: number; // Default 4.00%
  ltvLimitPercent: number; // Default 75%
  masLiquidityFacilityBias: 'Neutral' | 'Injection' | 'Absorption';
}

