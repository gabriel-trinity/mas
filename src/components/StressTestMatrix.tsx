import React, { useMemo, useState } from 'react';
import { ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import { LATEST_MAS_BENCHMARKS } from '../data/masHistoricalRates';
import { soraService } from '../services/masSoraService';

export const StressTestMatrix: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(800000);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [baseBenchmark, setBaseBenchmark] = useState<number>(LATEST_MAS_BENCHMARKS.compound3M);
  const [bankSpread, setBankSpread] = useState<number>(0.65);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(12000); // SGD 12k monthly gross household income
  const [otherMonthlyDebt, setOtherMonthlyDebt] = useState<number>(800); // Car loan, personal loan, etc.

  const scenarios = useMemo(() => {
    return soraService.calculateStressScenarios(principal, tenureYears, baseBenchmark, bankSpread);
  }, [principal, tenureYears, baseBenchmark, bankSpread]);

  // Current baseline installment
  const baselineScenario = scenarios.find((s) => s.rateAdjustment === 0) || scenarios[1];
  const masStressScenario = scenarios.find((s) => s.rateAdjustment === 2.0) || scenarios[scenarios.length - 2];

  // TDSR Calculations (55% threshold)
  const currentTotalDebt = (baselineScenario?.monthlyPayment || 0) + otherMonthlyDebt;
  const currentTdsr = monthlyIncome > 0 ? (currentTotalDebt / monthlyIncome) * 100 : 0;

  const stressTotalDebt = (masStressScenario?.monthlyPayment || 0) + otherMonthlyDebt;
  const stressTdsr = monthlyIncome > 0 ? (stressTotalDebt / monthlyIncome) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Intro Header with MAS Navy Accent (Strictly No Red) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1DDE8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#002B49]">
              SORA Rate Sensitivity & MAS TDSR Stress-Test
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Evaluate mortgage payment vulnerability under rate hikes and verify compliance with MAS 55% TDSR regulations.
          </p>
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Mortgage Principal (SGD)</label>
          <input
            type="number"
            step={50000}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Loan Tenure (Years)</label>
          <input
            type="number"
            min={5}
            max={35}
            value={tenureYears}
            onChange={(e) => setTenureYears(Math.min(35, Math.max(1, Number(e.target.value))))}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Base 3M SORA Benchmark (%)</label>
          <input
            type="number"
            step={0.01}
            value={baseBenchmark}
            onChange={(e) => setBaseBenchmark(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Bank Spread Margin (%)</label>
          <input
            type="number"
            step={0.01}
            value={bankSpread}
            onChange={(e) => setBankSpread(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
          />
        </div>
      </div>

      {/* TDSR Regulatory Check Banner (MAS Navy & Gold, Strictly No Red) */}
      <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#C5A059]" />
              <span>MAS TDSR (Total Debt Servicing Ratio) Assessment</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              MAS Notice 645 mandates total monthly debt servicing obligations to not exceed 55% of gross monthly income.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F0F6FA] p-2.5 rounded-xl border border-[#D1DDE8] shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Baseline TDSR</span>
              <span
                className={`text-sm font-mono font-extrabold ${
                  currentTdsr <= 55 ? 'text-[#0D6838]' : 'text-[#002B49]'
                }`}
              >
                {currentTdsr.toFixed(1)}% {currentTdsr <= 55 ? '✓ Compliant' : '⚠ Exceeded'}
              </span>
            </div>
            <div className="w-px h-8 bg-[#D1DDE8]" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Stress (+2.0%) TDSR</span>
              <span
                className={`text-sm font-mono font-extrabold ${
                  stressTdsr <= 55 ? 'text-[#0D6838]' : 'text-[#002B49]'
                }`}
              >
                {stressTdsr.toFixed(1)}% {stressTdsr <= 55 ? '✓ Compliant' : '⚠ Exceeded'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar for TDSR in MAS Standard (Strictly No Red) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>0%</span>
            <span className="text-[#0D6838]">Healthy (&lt; 40%)</span>
            <span className="text-[#9E7B34]">Prudential Range (40-54%)</span>
            <span className="text-[#002B49] font-extrabold">55% MAS Statutory Cap</span>
            <span>100%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative border border-[#D1DDE8]">
            <div
              style={{ width: `${Math.min(100, stressTdsr)}%` }}
              className={`h-full transition-all duration-300 ${
                stressTdsr <= 45
                  ? 'bg-[#0D6838]'
                  : stressTdsr <= 55
                  ? 'bg-[#C5A059]'
                  : 'bg-[#002B49]'
              }`}
            />
            {/* 55% marker in MAS Navy */}
            <div className="absolute top-0 bottom-0 left-[55%] w-1 bg-[#002B49] z-10" />
          </div>
        </div>

        {/* Borrower Income inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Monthly Gross Household Income (SGD)
            </label>
            <input
              type="number"
              step={500}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
              placeholder="12,000"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Other Monthly Debt Obligations (Car/Credit/Personal Loans) (SGD)
            </label>
            <input
              type="number"
              step={100}
              value={otherMonthlyDebt}
              onChange={(e) => setOtherMonthlyDebt(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49] tabular-nums bg-white"
              placeholder="800"
            />
          </div>
        </div>
      </div>

      {/* Sensitivity Matrix Table with MAS Navy Styling (Strictly No Red) */}
      <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
            <span>Interest Rate Sensitivity Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated monthly repayment and total lifetime interest under rate cut and rate hike conditions
          </p>
        </div>

        <div className="overflow-x-auto border border-[#D1DDE8] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F0F6FA] text-[#002B49] font-bold border-b border-[#D1DDE8]">
              <tr>
                <th className="py-3 px-4">Rate Scenario</th>
                <th className="py-3 px-4 text-center">Simulated SORA</th>
                <th className="py-3 px-4 text-center">Effective Rate</th>
                <th className="py-3 px-4 text-right">Monthly Payment</th>
                <th className="py-3 px-4 text-right">Monthly &Delta;</th>
                <th className="py-3 px-4 text-right">Total Interest (SGD)</th>
                <th className="py-3 px-4 text-right">Min Income for TDSR (55%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {scenarios.map((sc) => {
                const isBaseline = sc.rateAdjustment === 0;
                const isHike = sc.rateAdjustment > 0;
                const isCut = sc.rateAdjustment < 0;
                const isMasBenchmark = sc.rateAdjustment === 2.0;

                return (
                  <tr
                    key={sc.scenarioName}
                    className={`transition-colors ${
                      isMasBenchmark
                        ? 'bg-[#F0F6FA] font-semibold'
                        : isBaseline
                        ? 'bg-slate-50 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-sans text-slate-900 flex items-center gap-2">
                      {isCut && (
                        <span className="p-1 rounded-md bg-[#EBF7EE] text-[#0D6838]">
                          <TrendingDown className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isHike && (
                        <span
                          className={`p-1 rounded-md ${
                            isMasBenchmark
                              ? 'bg-[#002B49] text-[#C5A059] font-bold'
                              : 'bg-[#F0F6FA] text-[#002B49]'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isBaseline && (
                        <span className="p-1 rounded-md bg-slate-100 text-slate-700">
                          <span className="w-3.5 h-3.5 block rounded-full bg-[#002B49] m-auto" />
                        </span>
                      )}
                      <span className="font-bold">{sc.scenarioName}</span>
                    </td>

                    <td className="py-3 px-4 text-center tabular-nums text-slate-700 font-medium">
                      {sc.simulatedSoraRate.toFixed(4)}%
                    </td>

                    <td className="py-3 px-4 text-center tabular-nums font-bold text-[#002B49]">
                      {sc.effectiveRate.toFixed(4)}%
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums text-[#002B49] font-extrabold text-[13px]">
                      S$ {sc.monthlyPayment.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                    </td>

                    <td
                      className={`py-3 px-4 text-right tabular-nums font-bold ${
                        isBaseline
                          ? 'text-slate-400'
                          : isCut
                          ? 'text-[#0D6838]'
                          : 'text-[#002B49]'
                      }`}
                    >
                      {isBaseline
                        ? '-'
                        : isCut
                        ? `-S$ ${Math.abs(sc.monthlyDifference).toFixed(2)}/mo`
                        : `+S$ ${sc.monthlyDifference.toFixed(2)}/mo`}
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums text-[#9E7B34] font-bold">
                      S$ {sc.totalInterest.toLocaleString('en-SG', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums text-slate-700 font-semibold">
                      S$ {(sc.tdsrRequiredIncome || 0).toLocaleString('en-SG')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
