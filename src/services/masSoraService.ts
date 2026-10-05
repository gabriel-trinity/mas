import {
  AmortizationRow,
  BenchmarkType,
  DailyCompoundDetail,
  DailySoraRate,
  InArrearsResult,
  LoanCalculationResult,
  LoanInputs,
  StressScenario,
} from '../types/sora';
import { LATEST_MAS_BENCHMARKS, MAS_SORA_RATES } from '../data/masHistoricalRates';

export class MasSoraService {
  private ratesCache: DailySoraRate[] = MAS_SORA_RATES;

  /**
   * Returns benchmark rate percentage based on selection
   */
  public getBenchmarkRate(benchmarkType: BenchmarkType, customRate?: number): number {
    switch (benchmarkType) {
      case '3M_SORA':
        return LATEST_MAS_BENCHMARKS.compound3M;
      case '1M_SORA':
        return LATEST_MAS_BENCHMARKS.compound1M;
      case '6M_SORA':
        return LATEST_MAS_BENCHMARKS.compound6M;
      case 'OVERNIGHT':
        return LATEST_MAS_BENCHMARKS.overnightRate;
      case 'CUSTOM':
        return customRate !== undefined && !isNaN(customRate) ? customRate : 2.80;
      default:
        return LATEST_MAS_BENCHMARKS.compound3M;
    }
  }

  /**
   * Calculate Loan Repayments & Amortization Schedule
   */
  public calculateLoan(inputs: LoanInputs): LoanCalculationResult {
    const {
      principal,
      tenureYears,
      benchmarkType,
      customBenchmarkRate,
      bankSpread,
      interestCalculationMethod,
      startDate,
      extraMonthlyPayment,
      lumpSumPayment,
      lumpSumMonth,
    } = inputs;

    const benchmarkRate = this.getBenchmarkRate(benchmarkType, customBenchmarkRate);
    const effectiveAnnualRate = benchmarkRate + bankSpread;
    const monthlyRate = effectiveAnnualRate / 100 / 12;
    const totalMonths = tenureYears * 12;

    let baseMonthlyInstallment = 0;
    if (interestCalculationMethod === 'INTEREST_ONLY') {
      baseMonthlyInstallment = principal * monthlyRate;
    } else {
      if (monthlyRate === 0) {
        baseMonthlyInstallment = principal / totalMonths;
      } else {
        baseMonthlyInstallment =
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }
    }

    // Run baseline without prepayment to calculate savings
    const baselineTotalInterest = this.computeBaselineInterest(
      principal,
      monthlyRate,
      totalMonths,
      baseMonthlyInstallment,
      interestCalculationMethod
    );

    // Build month-by-month amortization schedule with prepayment support
    const amortizationSchedule: AmortizationRow[] = [];
    let currentBalance = principal;
    let cumulativeInterest = 0;
    let actualPayoffMonths = 0;

    const startDateTime = new Date(startDate || '2026-10-01');

    for (let m = 1; m <= totalMonths && currentBalance > 0.01; m++) {
      actualPayoffMonths = m;
      const interestForMonth = currentBalance * monthlyRate;
      let scheduledPrincipal = 0;

      if (interestCalculationMethod === 'INTEREST_ONLY') {
        scheduledPrincipal = m === totalMonths ? currentBalance : 0;
      } else {
        scheduledPrincipal = baseMonthlyInstallment - interestForMonth;
      }

      // Add extra payments if configured
      let extra = extraMonthlyPayment || 0;
      if (lumpSumPayment > 0 && m === lumpSumMonth) {
        extra += lumpSumPayment;
      }

      let totalPrincipalPaid = scheduledPrincipal + extra;
      if (totalPrincipalPaid > currentBalance) {
        totalPrincipalPaid = currentBalance;
      }

      const totalMonthlyPaid = totalPrincipalPaid + interestForMonth;
      currentBalance -= totalPrincipalPaid;
      if (currentBalance < 0.01) {
        currentBalance = 0;
      }

      cumulativeInterest += interestForMonth;

      const dateObj = new Date(startDateTime);
      dateObj.setMonth(dateObj.getMonth() + m - 1);
      const dateString = dateObj.toISOString().slice(0, 7); // YYYY-MM

      amortizationSchedule.push({
        month: m,
        year: Math.ceil(m / 12),
        date: dateString,
        payment: Number(totalMonthlyPaid.toFixed(2)),
        principalPaid: Number(totalPrincipalPaid.toFixed(2)),
        interestPaid: Number(interestForMonth.toFixed(2)),
        remainingBalance: Number(currentBalance.toFixed(2)),
        cumulativeInterest: Number(cumulativeInterest.toFixed(2)),
      });
    }

    // Yearly summary aggregation
    const yearlySummaryMap = new Map<number, { principal: number; interest: number; endingBalance: number }>();
    amortizationSchedule.forEach((row) => {
      const existing = yearlySummaryMap.get(row.year) || { principal: 0, interest: 0, endingBalance: row.remainingBalance };
      existing.principal += row.principalPaid;
      existing.interest += row.interestPaid;
      existing.endingBalance = row.remainingBalance;
      yearlySummaryMap.set(row.year, existing);
    });

    const yearlySummary = Array.from(yearlySummaryMap.entries()).map(([year, data]) => ({
      year,
      principalPaid: Number(data.principal.toFixed(2)),
      interestPaid: Number(data.interest.toFixed(2)),
      endingBalance: Number(data.endingBalance.toFixed(2)),
    }));

    const totalInterest = Number(cumulativeInterest.toFixed(2));
    const totalPrincipal = principal;
    const totalPayment = Number((totalPrincipal + totalInterest).toFixed(2));
    const interestSaved = Math.max(0, Number((baselineTotalInterest - totalInterest).toFixed(2)));
    const monthsSaved = Math.max(0, totalMonths - actualPayoffMonths);

    return {
      monthlyInstallment: Number(baseMonthlyInstallment.toFixed(2)),
      effectiveAnnualRate: Number(effectiveAnnualRate.toFixed(4)),
      benchmarkRate: Number(benchmarkRate.toFixed(4)),
      bankSpread: Number(bankSpread.toFixed(4)),
      totalPayment,
      totalInterest,
      totalPrincipal,
      payoffMonths: actualPayoffMonths,
      interestSavedWithExtra: interestSaved,
      monthsSavedWithExtra: monthsSaved,
      amortizationSchedule,
      yearlySummary,
    };
  }

  private computeBaselineInterest(
    principal: number,
    monthlyRate: number,
    totalMonths: number,
    installment: number,
    method: 'AMORTIZED' | 'INTEREST_ONLY'
  ): number {
    if (method === 'INTEREST_ONLY') {
      return principal * monthlyRate * totalMonths;
    }
    let balance = principal;
    let totalInt = 0;
    for (let m = 1; m <= totalMonths && balance > 0.01; m++) {
      const intPaid = balance * monthlyRate;
      const prinPaid = Math.min(balance, installment - intPaid);
      balance -= prinPaid;
      totalInt += intPaid;
    }
    return totalInt;
  }

  /**
   * Compounded SORA in Arrears calculation for exact period.
   * Standard MAS Formula:
   * Compounded SORA = [ Product_i=1..d_b (1 + r_i * n_i / 365) - 1 ] * (365 / D) * 100%
   * Day count: Actual/365
   */
  public calculateInArrears(
    startDateStr: string,
    endDateStr: string,
    principal: number,
    spreadRate: number
  ): InArrearsResult {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (end <= start) {
      throw new Error('End date must be strictly after start date.');
    }

    // Map existing rates by date for rapid lookup
    const rateMap = new Map<string, number>();
    this.ratesCache.forEach((r) => rateMap.set(r.date, r.rate));

    const dayDetails: DailyCompoundDetail[] = [];
    let cumulativeProduct = 1.0;
    let totalCalendarDays = 0;
    let businessDaysCount = 0;

    // Default fallback rate if historical date isn't in database
    const fallbackRate = LATEST_MAS_BENCHMARKS.overnightRate;

    // Loop through each calendar date up to the day before end date (interest period convention)
    const current = new Date(start);
    while (current < end) {
      const dateIso = current.toISOString().split('T')[0];
      const dayOfWeekNum = current.getDay(); // 0 Sun, 6 Sat
      const isBusinessDay = dayOfWeekNum !== 0 && dayOfWeekNum !== 6;

      if (isBusinessDay) {
        businessDaysCount++;
      }

      // In MAS SORA compounding in arrears:
      // Rates are published for business days.
      // If Friday, rate applies for 3 days (Fri, Sat, Sun) until Monday.
      // If Mon-Thu, rate applies for 1 day.
      // For accurate daily breakdown representation:
      let dayWeight = 1;
      let effectiveDailyRate = rateMap.get(dateIso) ?? fallbackRate;

      // If weekend day, it carries the preceding Friday's rate
      if (dayOfWeekNum === 6) {
        // Saturday
        const friday = new Date(current);
        friday.setDate(friday.getDate() - 1);
        const friIso = friday.toISOString().split('T')[0];
        effectiveDailyRate = rateMap.get(friIso) ?? fallbackRate;
      } else if (dayOfWeekNum === 0) {
        // Sunday
        const friday = new Date(current);
        friday.setDate(friday.getDate() - 2);
        const friIso = friday.toISOString().split('T')[0];
        effectiveDailyRate = rateMap.get(friIso) ?? fallbackRate;
      }

      const dailyRateDecimal = effectiveDailyRate / 100;
      const dailyFactor = 1 + (dailyRateDecimal * dayWeight) / 365;
      cumulativeProduct *= dailyFactor;

      const dailyInterest = principal * (dailyRateDecimal / 365);

      const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      dayDetails.push({
        date: dateIso,
        dayOfWeek: daysOfWeekNames[dayOfWeekNum],
        isBusinessDay,
        rate: effectiveDailyRate,
        dayWeight,
        dailyFactor: Number(dailyFactor.toFixed(8)),
        cumulativeFactor: Number(cumulativeProduct.toFixed(8)),
        dailyInterestOnPrincipal: Number(dailyInterest.toFixed(2)),
      });

      totalCalendarDays += 1;
      current.setDate(current.getDate() + 1);
    }

    // Compounded SORA calculation
    // Compounded SORA = [ (Product) - 1 ] * (365 / D) * 100%
    const compoundedSoraDecimal = (cumulativeProduct - 1) * (365 / totalCalendarDays);
    const compoundedSoraRate = Number((compoundedSoraDecimal * 100).toFixed(4));
    const totalEffectiveRate = Number((compoundedSoraRate + spreadRate).toFixed(4));

    // Total interest payable = Principal * (Total Effective Rate / 100) * (D / 365)
    const totalInterestPayable = Number(
      (principal * (totalEffectiveRate / 100) * (totalCalendarDays / 365)).toFixed(2)
    );

    return {
      startDate: startDateStr,
      endDate: endDateStr,
      calendarDays: totalCalendarDays,
      businessDays: businessDaysCount,
      principal,
      compoundedSoraRate,
      spreadRate,
      totalEffectiveRate,
      totalInterestPayable,
      details: dayDetails,
    };
  }

  /**
   * Run SORA Stress Testing scenarios
   */
  public calculateStressScenarios(
    principal: number,
    tenureYears: number,
    baseBenchmarkRate: number,
    bankSpread: number
  ): StressScenario[] {
    const adjustments = [-0.5, 0, 0.5, 1.0, 1.5, 2.0, 3.0];
    const totalMonths = tenureYears * 12;

    const baseEffectiveRate = baseBenchmarkRate + bankSpread;
    const baseMonthlyRate = baseEffectiveRate / 100 / 12;
    const basePayment =
      (principal * (baseMonthlyRate * Math.pow(1 + baseMonthlyRate, totalMonths))) /
      (Math.pow(1 + baseMonthlyRate, totalMonths) - 1);

    return adjustments.map((adj) => {
      const simulatedSora = Math.max(0.1, Number((baseBenchmarkRate + adj).toFixed(4)));
      const effectiveRate = Number((simulatedSora + bankSpread).toFixed(4));
      const monthlyRate = effectiveRate / 100 / 12;

      let payment = 0;
      if (monthlyRate === 0) {
        payment = principal / totalMonths;
      } else {
        payment =
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }

      const totalInterest = payment * totalMonths - principal;
      const monthlyDifference = payment - basePayment;

      // Singapore MAS TDSR (Total Debt Servicing Ratio) capped at 55%
      // Required monthly income = Monthly Mortgage Payment / 0.55
      const tdsrRequiredIncome = Math.round(payment / 0.55);

      let scenarioName = 'Current Rate (Baseline)';
      if (adj < 0) scenarioName = `Rate Cut (${adj.toFixed(1)}%)`;
      if (adj > 0) scenarioName = `Rate Hike (+${adj.toFixed(1)}%)`;
      if (adj === 2.0) scenarioName = 'MAS Stress Test Benchmark (+2.0%)';

      return {
        scenarioName,
        rateAdjustment: adj,
        simulatedSoraRate: simulatedSora,
        effectiveRate,
        monthlyPayment: Number(payment.toFixed(2)),
        monthlyDifference: Number(monthlyDifference.toFixed(2)),
        totalInterest: Number(totalInterest.toFixed(2)),
        tdsrRequiredIncome,
      };
    });
  }

  /**
   * Export Amortization Table to CSV format for download
   */
  public generateAmortizationCsv(schedule: AmortizationRow[]): string {
    const headers = [
      'Month',
      'Year',
      'Period',
      'Total Payment (SGD)',
      'Principal Paid (SGD)',
      'Interest Paid (SGD)',
      'Remaining Balance (SGD)',
      'Cumulative Interest (SGD)',
    ];

    const rows = schedule.map((row) => [
      row.month,
      row.year,
      row.date,
      row.payment.toFixed(2),
      row.principalPaid.toFixed(2),
      row.interestPaid.toFixed(2),
      row.remainingBalance.toFixed(2),
      row.cumulativeInterest.toFixed(2),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Get all cached rates for the rates explorer
   */
  public getAllRates(): DailySoraRate[] {
    return [...this.ratesCache];
  }

  /**
   * Pluggable backend integration method:
   * When user connects their backend, this method will query the backend API route.
   */
  public async fetchRemoteMasRates(endpointUrl: string): Promise<DailySoraRate[]> {
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load rates from ${endpointUrl}: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      this.ratesCache = data;
      return data;
    }
    return this.ratesCache;
  }
}

export const soraService = new MasSoraService();
