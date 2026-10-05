import React, { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  FileSpreadsheet,
} from 'lucide-react';
import { soraService } from '../services/masSoraService';

export const InArrearsCalculator: React.FC = () => {
  // Dates: Default to a recent quarterly or monthly period
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [principal, setPrincipal] = useState<number>(5000000); // Typical SGD 5M commercial facility
  const [spreadRate, setSpreadRate] = useState<number>(0.90); // 0.90% p.a.
  const [filterBusinessOnly, setFilterBusinessOnly] = useState<boolean>(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  // Quick Period Presets
  const setQuickPeriod = (preset: '30d' | '90d' | 'q1' | 'q2' | 'q3') => {
    switch (preset) {
      case '30d':
        setStartDate('2026-09-01');
        setEndDate('2026-10-01');
        break;
      case '90d':
        setStartDate('2026-07-01');
        setEndDate('2026-09-30');
        break;
      case 'q1':
        setStartDate('2026-01-01');
        setEndDate('2026-03-31');
        break;
      case 'q2':
        setStartDate('2026-04-01');
        setEndDate('2026-06-30');
        break;
      case 'q3':
        setStartDate('2026-07-01');
        setEndDate('2026-09-30');
        break;
    }
  };

  const calculationResult = useMemo(() => {
    try {
      return soraService.calculateInArrears(startDate, endDate, principal, spreadRate);
    } catch (err: unknown) {
      return null;
    }
  }, [startDate, endDate, principal, spreadRate]);

  const handleExportCsv = () => {
    if (!calculationResult) return;
    const headers = [
      'Date',
      'Day of Week',
      'Is Business Day',
      'Overnight SORA Rate (%)',
      'Day Weight (n_i)',
      'Daily Factor (1 + r*n/365)',
      'Cumulative Product Factor',
      'Daily Accrued Interest (SGD)',
    ];

    const rows = calculationResult.details.map((d) => [
      d.date,
      d.dayOfWeek,
      d.isBusinessDay ? 'Yes' : 'No (Carried Over)',
      d.rate.toFixed(4),
      d.dayWeight,
      d.dailyFactor.toFixed(8),
      d.cumulativeFactor.toFixed(8),
      d.dailyInterestOnPrincipal.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MAS_SORA_In_Arrears_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedDetails = useMemo(() => {
    if (!calculationResult) return [];
    if (!filterBusinessOnly) return calculationResult.details;
    return calculationResult.details.filter((d) => d.isBusinessDay);
  }, [calculationResult, filterBusinessOnly]);

  return (
    <div className="space-y-8">
      {/* Intro Header with MAS Navy Accent (Strictly No Red) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1DDE8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#002B49]">
              MAS Compounded SORA in Arrears Calculator
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Exact daily compounding for corporate loans, trade finance, credit lines, and MAS interest settlements.
          </p>
        </div>

        {/* Quick Period Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#D1DDE8] shadow-2xs">
          <span className="text-xs text-slate-500 font-bold pl-1 mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => setQuickPeriod('30d')}
            className="text-xs px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F0F6FA] hover:text-[#002B49] hover:border-[#002B49]/40 border border-[#D1DDE8] rounded-lg text-slate-700 font-semibold transition-colors"
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => setQuickPeriod('90d')}
            className="text-xs px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F0F6FA] hover:text-[#002B49] hover:border-[#002B49]/40 border border-[#D1DDE8] rounded-lg text-slate-700 font-semibold transition-colors"
          >
            90 Days
          </button>
          <button
            type="button"
            onClick={() => setQuickPeriod('q2')}
            className="text-xs px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F0F6FA] hover:text-[#002B49] hover:border-[#002B49]/40 border border-[#D1DDE8] rounded-lg text-slate-700 font-semibold transition-colors"
          >
            Q2 2026
          </button>
          <button
            type="button"
            onClick={() => setQuickPeriod('q3')}
            className="text-xs px-2.5 py-1 bg-[#F8FAFC] hover:bg-[#F0F6FA] hover:text-[#002B49] hover:border-[#002B49]/40 border border-[#D1DDE8] rounded-lg text-slate-700 font-semibold transition-colors"
          >
            Q3 2026
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Interest Period Start</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Interest Period End</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Facility Principal (SGD)</label>
          <input
            type="number"
            min={1000}
            step={100000}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Spread / Margin (% p.a.)</label>
          <input
            type="number"
            min={0}
            step={0.05}
            value={spreadRate}
            onChange={(e) => setSpreadRate(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
          />
        </div>
      </div>

      {/* Results Banner in MAS Brand Palette */}
      {calculationResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">Compounded SORA (p.a.)</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#002B49] mt-1 tabular-nums">
                {calculationResult.compoundedSoraRate.toFixed(4)}%
              </div>
              <span className="text-[11px] text-[#002B49] mt-1 block font-semibold">
                Official MAS Actual/365 compounding
              </span>
            </div>

            <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">Total Applicable Rate (p.a.)</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#002B49] mt-1 tabular-nums">
                {calculationResult.totalEffectiveRate.toFixed(4)}%
              </div>
              <span className="text-[11px] text-slate-600 mt-1 block font-mono font-semibold">
                {calculationResult.compoundedSoraRate.toFixed(4)}% + {spreadRate.toFixed(2)}% spread
              </span>
            </div>

            <div className="bg-[#002B49] text-white rounded-2xl p-5 shadow-md sm:col-span-2 border border-[#001A2E]">
              <span className="text-xs text-[#D1DDE8] font-bold block">Total Interest Payable for Period</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1 tabular-nums">
                S$ {calculationResult.totalInterestPayable.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#D1DDE8] mt-2 font-mono">
                <span>Principal: S${principal.toLocaleString('en-SG')}</span>
                <span>·</span>
                <span className="text-[#68D391] font-bold">
                  {calculationResult.calendarDays} Days ({calculationResult.businessDays} business days)
                </span>
              </div>
            </div>
          </div>

          {/* Mathematical Audit Formula Box */}
          <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 text-xs space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#002B49]">
                <FileSpreadsheet className="w-4 h-4 text-[#C5A059]" />
                <span>MAS Statutory Compounding Formula Proof</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="text-[#002B49] hover:text-[#9E7B34] font-bold transition-colors cursor-pointer"
              >
                {showFormulaDetails ? 'Hide Verification' : 'Show Verification Details'}
              </button>
            </div>

            <div className="bg-[#002B49] text-white p-4 rounded-xl border border-[#001A2E] font-mono text-[12px] leading-relaxed overflow-x-auto shadow-inner">
              <div className="text-[#C5A059] mb-1 font-sans text-xs font-bold">
                Monetary Authority of Singapore (MAS) Official Formula:
              </div>
              <div className="text-white">
                Compounded SORA = [ &prod;<sub>i=1</sub><sup>d<sub>b</sub></sup> (1 + r<sub>i</sub> &times; n<sub>i</sub> / 365) - 1 ] &times; (365 / D) &times; 100%
              </div>
              <div className="mt-2 text-[#D1DDE8] font-sans text-xs">
                Where <span className="font-mono text-[#68D391]">d<sub>b</sub></span> = {calculationResult.businessDays} business days,{' '}
                <span className="font-mono text-[#C5A059]">D</span> = {calculationResult.calendarDays} calendar days,{' '}
                <span className="font-mono text-[#90CDF4]">n<sub>i</sub></span> = calendar day weight (weekends carry Friday rate).
              </div>
            </div>

            {showFormulaDetails && (
              <div className="pt-2 text-slate-700 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span>Cumulative Product Factor (&prod;):</span>
                  <span className="font-mono font-bold text-[#002B49]">
                    {calculationResult.details[calculationResult.details.length - 1]?.cumulativeFactor.toFixed(8)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span>Compounding Yield ((Product - 1) &times; 365 / D):</span>
                  <span className="font-mono font-bold text-[#002B49]">
                    {calculationResult.compoundedSoraRate.toFixed(6)}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Interest Calculation Formula:</span>
                  <span className="font-mono font-bold text-[#002B49]">
                    S$ {principal.toLocaleString()} &times; {calculationResult.totalEffectiveRate.toFixed(4)}% &times; ({calculationResult.calendarDays} / 365) = S$ {calculationResult.totalInterestPayable.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Daily Ledger Table */}
          <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
                  <span>Daily Compounding Audit Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Day-by-day overnight SORA rate application and cumulative product factor
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterBusinessOnly}
                    onChange={(e) => setFilterBusinessOnly(e.target.checked)}
                    className="rounded border-[#D1DDE8] text-[#002B49] focus:ring-[#002B49]"
                  />
                  <span>Business days only</span>
                </label>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-[#D1DDE8] rounded-xl hover:border-[#002B49] hover:text-[#002B49] transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#D1DDE8] rounded-xl max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0F6FA] text-[#002B49] font-bold border-b border-[#D1DDE8] sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Day</th>
                    <th className="py-2.5 px-3 text-right">Overnight SORA</th>
                    <th className="py-2.5 px-3 text-center">Weight (n<sub>i</sub>)</th>
                    <th className="py-2.5 px-3 text-right">Daily Factor</th>
                    <th className="py-2.5 px-3 text-right">Cumulative Factor</th>
                    <th className="py-2.5 px-3 text-right">Accrued Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {displayedDetails.map((day) => (
                    <tr
                      key={day.date}
                      className={
                        day.isBusinessDay
                          ? 'hover:bg-slate-50/80'
                          : 'bg-[#F0F6FA]/70 text-slate-700 hover:bg-[#F0F6FA]'
                      }
                    >
                      <td className="py-2 px-3 font-bold text-[#002B49]">{day.date}</td>
                      <td className="py-2 px-3 font-sans text-slate-700 font-medium">
                        {day.dayOfWeek}
                        {!day.isBusinessDay && (
                          <span className="text-[10px] text-[#002B49] ml-1.5 font-sans font-bold">(Weekend carry)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-[#002B49] font-bold tabular-nums">
                        {day.rate.toFixed(4)}%
                      </td>
                      <td className="py-2 px-3 text-center tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            day.dayWeight > 1
                              ? 'bg-[#F0F6FA] text-[#002B49] font-bold border border-[#D1DDE8]'
                              : 'text-slate-600'
                          }`}
                        >
                          {day.dayWeight}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                        {day.dailyFactor.toFixed(8)}
                      </td>
                      <td className="py-2 px-3 text-right text-[#002B49] font-semibold tabular-nums">
                        {day.cumulativeFactor.toFixed(8)}
                      </td>
                      <td className="py-2 px-3 text-right text-[#0D6838] font-bold tabular-nums">
                        S$ {day.dailyInterestOnPrincipal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
