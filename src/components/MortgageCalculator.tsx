import React, { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  Calculator,
  ChevronDown,
  Info,
  PlusCircle,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { BenchmarkType, LoanInputs } from '../types/sora';
import { POPULAR_BANK_PACKAGES } from '../data/masHistoricalRates';
import { soraService } from '../services/masSoraService';

export const MortgageCalculator: React.FC = () => {
  // Primary Loan State
  const [principal, setPrincipal] = useState<number>(750000);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [benchmarkType, setBenchmarkType] = useState<BenchmarkType>('3M_SORA');
  const [customBenchmarkRate, setCustomBenchmarkRate] = useState<number>(2.78);
  const [bankSpread, setBankSpread] = useState<number>(0.65);
  const [interestCalculationMethod, setInterestCalculationMethod] = useState<'AMORTIZED' | 'INTEREST_ONLY'>('AMORTIZED');
  const [startDate, setStartDate] = useState<string>('2026-10-01');

  // Prepayment & Accelerated Payoff State
  const [showPrepayment, setShowPrepayment] = useState<boolean>(false);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);
  const [lumpSumPayment, setLumpSumPayment] = useState<number>(0);
  const [lumpSumMonth, setLumpSumMonth] = useState<number>(12);

  // Amortization Schedule View Options
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');
  const [searchYear, setSearchYear] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // Selected bank package ID
  const [selectedPackageId, setSelectedPackageId] = useState<string>('dbs-3m-sora');

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = POPULAR_BANK_PACKAGES.find((p) => p.id === pkgId);
    if (pkg) {
      setBenchmarkType(pkg.benchmark);
      setBankSpread(pkg.spreadYear1to3);
    }
  };

  const loanInputs: LoanInputs = useMemo(
    () => ({
      principal,
      tenureYears,
      benchmarkType,
      customBenchmarkRate,
      bankSpread,
      interestCalculationMethod,
      startDate,
      extraMonthlyPayment: showPrepayment ? extraMonthlyPayment : 0,
      lumpSumPayment: showPrepayment ? lumpSumPayment : 0,
      lumpSumMonth,
    }),
    [
      principal,
      tenureYears,
      benchmarkType,
      customBenchmarkRate,
      bankSpread,
      interestCalculationMethod,
      startDate,
      showPrepayment,
      extraMonthlyPayment,
      lumpSumPayment,
      lumpSumMonth,
    ]
  );

  const result = useMemo(() => {
    return soraService.calculateLoan(loanInputs);
  }, [loanInputs]);

  const handleDownloadCsv = () => {
    const csvData = soraService.generateAmortizationCsv(result.amortizationSchedule);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MAS_SORA_Loan_Amortization_SGD_${principal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered monthly amortization rows
  const filteredMonthlySchedule = useMemo(() => {
    if (!searchYear) return result.amortizationSchedule;
    return result.amortizationSchedule.filter(
      (row) => row.year.toString() === searchYear.trim() || row.date.startsWith(searchYear.trim())
    );
  }, [result.amortizationSchedule, searchYear]);

  const paginatedMonthlySchedule = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredMonthlySchedule.slice(startIdx, startIdx + pageSize);
  }, [filteredMonthlySchedule, page]);

  const totalMonthlyPages = Math.ceil(filteredMonthlySchedule.length / pageSize);

  const principalRatio = (result.totalPrincipal / result.totalPayment) * 100;
  const interestRatio = (result.totalInterest / result.totalPayment) * 100;

  return (
    <div className="space-y-8">
      {/* Overview Intro Banner with MAS Navy Accent (Strictly No Red) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1DDE8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#002B49]">
              Singapore SORA Loan & Mortgage Calculator
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Institutional calculator benchmarked to MAS Compounded SORA for retail housing and commercial property financing.
          </p>
        </div>

        {/* Bank Package Selector dropdown */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#D1DDE8] shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold pl-1 whitespace-nowrap">Bank Preset:</span>
          <select
            value={selectedPackageId}
            onChange={(e) => handleSelectPackage(e.target.value)}
            className="text-xs font-bold bg-[#F8FAFC] border border-[#D1DDE8] rounded-lg px-2.5 py-1.5 text-[#002B49] focus:outline-hidden focus:ring-2 focus:ring-[#002B49]"
          >
            {POPULAR_BANK_PACKAGES.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.bankName}: {pkg.packageName} (+{pkg.spreadYear1to3}%)
              </option>
            ))}
            <option value="custom">Custom Bank Package</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Output Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Loan Inputs (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#002B49] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#C5A059]" />
                <span>Loan Parameters</span>
              </span>
              <span className="text-xs font-bold text-[#0D6838] bg-[#EBF7EE] border border-[#C2E8CC] px-2.5 py-0.5 rounded-md font-mono">
                Actual/365 SG Standard
              </span>
            </h3>

            {/* Principal Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Loan Principal (SGD)</label>
                <span className="text-xs font-mono font-bold text-[#002B49] bg-[#F0F6FA] px-2 py-0.5 rounded tabular-nums">
                  S$ {principal.toLocaleString('en-SG')}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  S$
                </div>
                <input
                  type="number"
                  min={10000}
                  max={50000000}
                  step={10000}
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-mono font-bold text-[#002B49] bg-white border border-[#D1DDE8] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#002B49] focus:border-[#002B49] tabular-nums transition-all"
                  placeholder="750,000"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {[500000, 750000, 1000000, 1500000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPrincipal(amt)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      principal === amt
                        ? 'border-[#002B49] bg-[#002B49] text-white shadow-2xs'
                        : 'border-[#D1DDE8] bg-[#F8FAFC] text-slate-700 hover:bg-[#F0F6FA] hover:border-[#002B49]/40'
                    }`}
                  >
                    S$ {(amt / 1000).toLocaleString()}k
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Tenure */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Loan Tenure</label>
                <span className="text-xs font-mono font-bold text-[#002B49] tabular-nums">
                  {tenureYears} Years ({tenureYears * 12} Months)
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2 mb-2.5">
                {[15, 20, 25, 30].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`text-xs py-1.5 rounded-lg border text-center transition-all ${
                      tenureYears === yr
                        ? 'border-[#002B49] bg-[#002B49] text-white font-bold shadow-2xs'
                        : 'border-[#D1DDE8] bg-[#F8FAFC] text-slate-700 hover:bg-[#F0F6FA] font-medium'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    max={35}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Math.min(35, Math.max(1, Number(e.target.value))))}
                    className="w-full px-2.5 py-1.5 text-xs text-center font-mono font-bold border border-[#D1DDE8] rounded-lg focus:ring-2 focus:ring-[#002B49] bg-[#F8FAFC]"
                    placeholder="Custom yr"
                  />
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={35}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-[#002B49] h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Benchmark Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                MAS SORA Benchmark Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: '3M_SORA', label: '3M SORA', desc: 'Retail Mortgages' },
                  { id: '1M_SORA', label: '1M SORA', desc: 'Monthly Reprice' },
                  { id: '6M_SORA', label: '6M SORA', desc: 'Semi-Annual' },
                  { id: 'CUSTOM', label: 'Custom %', desc: 'Manual Input' },
                ].map((item) => {
                  const isSelected = benchmarkType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setBenchmarkType(item.id as BenchmarkType);
                        setSelectedPackageId('custom');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#002B49] bg-[#F0F6FA] ring-1 ring-[#002B49] shadow-xs'
                          : 'border-[#D1DDE8] hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`text-xs font-bold ${isSelected ? 'text-[#002B49]' : 'text-slate-900'}`}>
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{item.desc}</div>
                    </button>
                  );
                })}
              </div>

              {benchmarkType === 'CUSTOM' && (
                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Custom Benchmark Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step={0.0001}
                    min={0}
                    max={15}
                    value={customBenchmarkRate}
                    onChange={(e) => setCustomBenchmarkRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-lg focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              )}
            </div>

            {/* Bank Spread / Margin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Bank Spread / Margin (% p.a.)</label>
                <span className="text-xs font-mono font-bold text-[#002B49] bg-[#F0F6FA] px-2 py-0.5 rounded tabular-nums border border-[#D1DDE8]">
                  +{bankSpread.toFixed(2)}% p.a.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    max={5}
                    value={bankSpread}
                    onChange={(e) => {
                      setBankSpread(Math.max(0, Number(e.target.value)));
                      setSelectedPackageId('custom');
                    }}
                    className="w-full pl-3 pr-8 py-2 text-sm font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                    %
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {[0.60, 0.65, 0.70, 0.85].map((spread) => (
                    <button
                      key={spread}
                      type="button"
                      onClick={() => {
                        setBankSpread(spread);
                        setSelectedPackageId('custom');
                      }}
                      className={`text-xs px-2.5 py-2 rounded-lg border font-mono font-semibold transition-all ${
                        bankSpread === spread
                          ? 'border-[#002B49] bg-[#002B49] text-white shadow-2xs'
                          : 'border-[#D1DDE8] bg-[#F8FAFC] text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{spread.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Repayment Type & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Repayment Method</label>
                <div className="flex items-center gap-1 p-1 bg-[#F0F6FA] rounded-xl border border-[#D1DDE8]">
                  <button
                    type="button"
                    onClick={() => setInterestCalculationMethod('AMORTIZED')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      interestCalculationMethod === 'AMORTIZED'
                        ? 'bg-white text-[#002B49] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Principal + Interest
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestCalculationMethod('INTEREST_ONLY')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      interestCalculationMethod === 'INTEREST_ONLY'
                        ? 'bg-white text-[#002B49] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Interest Only
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">First Payment Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Prepayment & Extra Payment Simulator in MAS Green Accent */}
          <div className="bg-white border border-[#C2E8CC] rounded-2xl p-5 shadow-xs">
            <button
              type="button"
              onClick={() => setShowPrepayment(!showPrepayment)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0D6838] flex items-center justify-center text-white shadow-2xs">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#002B49] block">Prepayment & Accelerated Payoff Simulator</span>
                  <span className="text-[11px] text-[#0D6838] font-medium">Calculate exact interest savings from lump-sum or extra monthly contributions</span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${showPrepayment ? 'rotate-180' : ''}`}
              />
            </button>

            {showPrepayment && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Extra Monthly Contribution (SGD)
                    </label>
                    <input
                      type="number"
                      step={100}
                      min={0}
                      value={extraMonthlyPayment}
                      onChange={(e) => setExtraMonthlyPayment(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#0D6838] tabular-nums bg-white"
                      placeholder="e.g. 500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      One-Time Lump Sum Prepayment (SGD)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={lumpSumPayment}
                        onChange={(e) => setLumpSumPayment(Math.max(0, Number(e.target.value)))}
                        className="w-2/3 px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#0D6838] tabular-nums bg-white"
                        placeholder="e.g. 50,000"
                      />
                      <input
                        type="number"
                        min={1}
                        max={tenureYears * 12}
                        value={lumpSumMonth}
                        onChange={(e) => setLumpSumMonth(Math.max(1, Number(e.target.value)))}
                        className="w-1/3 px-2 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#0D6838] text-center bg-white"
                        title="Month number to make lump sum"
                        placeholder="Month #"
                      />
                    </div>
                  </div>
                </div>

                {(result.interestSavedWithExtra > 0 || result.monthsSavedWithExtra > 0) && (
                  <div className="p-3.5 bg-[#EBF7EE] border border-[#C2E8CC] text-[#0A4D2A] rounded-xl text-xs flex items-start gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#0D6838] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm block text-[#0D6838]">Acceleration Impact:</span>
                      <span>
                        You will save{' '}
                        <strong className="font-mono text-[#0D6838] text-sm">
                          S$ {result.interestSavedWithExtra.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                        </strong>{' '}
                        in total interest and clear your mortgage{' '}
                        <strong className="font-mono text-[#0D6838] text-sm">
                          {Math.floor(result.monthsSavedWithExtra / 12)} years{' '}
                          {result.monthsSavedWithExtra % 12 > 0 ? `${result.monthsSavedWithExtra % 12} months` : ''}
                        </strong>{' '}
                        earlier!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculation Result Summary in MAS Navy (#002B49) & Gold (#C5A059) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#002B49] text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-[#001A2E] space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#D1DDE8] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                Monthly Installment
              </span>
              <span className="text-xs font-mono font-bold text-[#002B49] bg-[#C5A059] px-2.5 py-1 rounded-lg">
                Total: {result.effectiveAnnualRate.toFixed(4)}% p.a.
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono tabular-nums text-white">
                S$ {result.monthlyInstallment.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-[#D1DDE8] mt-1.5 flex items-center gap-1.5 font-mono">
                <span className="bg-[#001A2E]/80 px-2 py-0.5 rounded text-white border border-white/10">Benchmark {result.benchmarkRate.toFixed(4)}%</span>
                <span>+</span>
                <span className="bg-[#001A2E]/80 px-2 py-0.5 rounded text-white border border-white/10">Spread {result.bankSpread.toFixed(2)}%</span>
              </div>
            </div>

            {/* Interest vs Principal Ratio Bar */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between text-xs font-mono font-semibold">
                <span className="text-[#68D391] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#68D391]" /> Principal: {principalRatio.toFixed(1)}%
                </span>
                <span className="text-[#C5A059] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]" /> Interest: {interestRatio.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#001A2E] rounded-full overflow-hidden flex ring-1 ring-white/10">
                <div style={{ width: `${principalRatio}%` }} className="bg-[#0D6838] h-full" />
                <div style={{ width: `${interestRatio}%` }} className="bg-[#C5A059] h-full" />
              </div>
            </div>

            {/* Detailed Figures Matrix */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="bg-[#001A2E]/80 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Total Principal</span>
                <span className="font-mono font-bold text-white tabular-nums text-sm">
                  S$ {result.totalPrincipal.toLocaleString('en-SG')}
                </span>
              </div>

              <div className="bg-[#001A2E]/80 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Total Interest</span>
                <span className="font-mono font-bold text-[#C5A059] tabular-nums text-sm">
                  S$ {result.totalInterest.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-[#001A2E]/80 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Total Repayment</span>
                <span className="font-mono font-bold text-white tabular-nums text-sm">
                  S$ {result.totalPayment.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="bg-[#001A2E]/80 p-3 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Tenure Schedule</span>
                <span className="font-mono font-bold text-white tabular-nums text-sm">
                  {Math.ceil(result.payoffMonths / 12)} Yrs ({result.payoffMonths} Mos)
                </span>
              </div>
            </div>

            {/* First Year Snapshot */}
            <div className="bg-[#001A2E]/90 rounded-xl p-3.5 text-xs space-y-1.5 border border-white/10">
              <div className="text-slate-200 font-bold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>First 12 Months Cashflow Split:</span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Principal Repaid (Year 1):</span>
                <span className="text-[#68D391] font-bold tabular-nums">
                  S$ {result.yearlySummary[0]?.principalPaid.toLocaleString('en-SG') || '0.00'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Interest Incurred (Year 1):</span>
                <span className="text-[#C5A059] font-bold tabular-nums">
                  S$ {result.yearlySummary[0]?.interestPaid.toLocaleString('en-SG') || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Callout with MAS Navy Accent (Strictly No Red) */}
          <div className="p-4 bg-white rounded-2xl border-l-4 border-l-[#002B49] border border-[#D1DDE8] text-xs text-slate-700 space-y-1.5 shadow-2xs">
            <div className="font-bold text-[#002B49] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#C5A059]" />
              <span>MAS Regulatory Guidance Note</span>
            </div>
            <p className="leading-relaxed">
              Retail residential mortgages benchmarked to 3M Compounded SORA reprice on a quarterly cycle
              (every 3 months) in advance using the official 3M Compounded SORA published by MAS.
            </p>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Section */}
      <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
              <span>Loan Amortization Schedule</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Principal vs interest reduction trajectory across the entire loan tenure
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#F0F6FA] rounded-xl border border-[#D1DDE8]">
              <button
                type="button"
                onClick={() => setScheduleView('yearly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  scheduleView === 'yearly' ? 'bg-white text-[#002B49] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly View
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  scheduleView === 'monthly' ? 'bg-white text-[#002B49] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Ledger
              </button>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-[#D1DDE8] rounded-xl hover:border-[#002B49] hover:text-[#002B49] transition-colors shadow-2xs whitespace-nowrap"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Yearly View Table */}
        {scheduleView === 'yearly' && (
          <div className="overflow-x-auto border border-[#D1DDE8] rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F0F6FA] text-[#002B49] font-bold border-b border-[#D1DDE8]">
                <tr>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4 text-right">Principal Repaid (SGD)</th>
                  <th className="py-3 px-4 text-right">Interest Repaid (SGD)</th>
                  <th className="py-3 px-4 text-right">Total Annual Cost (SGD)</th>
                  <th className="py-3 px-4 text-right">Ending Loan Balance (SGD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.yearlySummary.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[#002B49]">Year {row.year}</td>
                    <td className="py-2.5 px-4 text-right text-[#0D6838] font-bold tabular-nums">
                      S$ {row.principalPaid.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#9E7B34] font-bold tabular-nums">
                      S$ {row.interestPaid.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-[#002B49] tabular-nums">
                      S$ {(row.principalPaid + row.interestPaid).toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-[#002B49] tabular-nums">
                      S$ {row.endingBalance.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Monthly View Table */}
        {scheduleView === 'monthly' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={searchYear}
                onChange={(e) => {
                  setSearchYear(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by Year (e.g. 1) or Date (e.g. 2026-12)..."
                className="text-xs px-3 py-1.5 border border-[#D1DDE8] rounded-lg max-w-xs focus:ring-2 focus:ring-[#002B49]"
              />
              <span className="text-xs text-slate-500 font-mono">
                Showing {paginatedMonthlySchedule.length} of {filteredMonthlySchedule.length} months
              </span>
            </div>

            <div className="overflow-x-auto border border-[#D1DDE8] rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0F6FA] text-[#002B49] font-bold border-b border-[#D1DDE8]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Payment</th>
                    <th className="py-2.5 px-3 text-right">Principal</th>
                    <th className="py-2.5 px-3 text-right">Interest</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-right">Cumulative Int</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {paginatedMonthlySchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 text-slate-500">{row.month}</td>
                      <td className="py-2 px-3 text-slate-800 font-bold">{row.date}</td>
                      <td className="py-2 px-3 text-right text-[#002B49] font-bold tabular-nums">
                        S$ {row.payment.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-[#0D6838] font-bold tabular-nums">
                        S$ {row.principalPaid.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-[#9E7B34] font-bold tabular-nums">
                        S$ {row.interestPaid.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-[#002B49] font-bold tabular-nums">
                        S$ {row.remainingBalance.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500 tabular-nums">
                        S$ {row.cumulativeInterest.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalMonthlyPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs font-semibold border border-[#D1DDE8] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-600 font-medium">
                  Page {page} of {totalMonthlyPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalMonthlyPages}
                  onClick={() => setPage((p) => Math.min(totalMonthlyPages, p + 1))}
                  className="px-3 py-1 text-xs font-semibold border border-[#D1DDE8] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
