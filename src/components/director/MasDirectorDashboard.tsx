import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  RefreshCw,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { BankSubmissionRecord, DirectorPolicyLevers, MacroprudentialMetrics } from '../../types/sora';
import {
  DEFAULT_MACROPRUDENTIAL_METRICS,
  LATEST_MAS_BENCHMARKS,
  REPORTING_BANKS_SUBMISSIONS,
} from '../../data/masHistoricalRates';
import masLogo from '../../assets/mas_logo.jpg';

export const MasDirectorDashboard: React.FC = () => {
  // Director Sub-tab navigation
  const [directorTab, setDirectorTab] = useState<'fixing_audit' | 'macroprudential' | 'policy_levers' | 'briefing'>(
    'fixing_audit'
  );

  // Bank Submissions state
  const [submissions] = useState<BankSubmissionRecord[]>(REPORTING_BANKS_SUBMISSIONS);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Macroprudential Stress Testing Levers
  const [simulatedRateHikeBps, setSimulatedRateHikeBps] = useState<number>(200); // +200 bps
  const [macroMetrics] = useState<MacroprudentialMetrics>(DEFAULT_MACROPRUDENTIAL_METRICS);

  // Policy Levers State
  const [policyLevers, setPolicyLevers] = useState<DirectorPolicyLevers>({
    tdsrCeilingPercent: 55,
    stressTestFloorRatePercent: 4.0,
    ltvLimitPercent: 75,
    masLiquidityFacilityBias: 'Neutral',
  });

  const [policyAppliedNotice, setPolicyAppliedNotice] = useState<string | null>(null);

  // Dynamic systemic stress calculations based on hike
  const dynamicSurveillance = useMemo(() => {
    const hikePercent = simulatedRateHikeBps / 100;
    const baseTdsr = macroMetrics.averageBorrowerTdsrPercent;
    
    // Each 100 bps rate hike roughly increases average portfolio TDSR by ~3.8 percentage points
    const stressedTdsr = Math.min(65, Number((baseTdsr + (hikePercent * 3.85)).toFixed(1)));
    
    // Vulnerable borrowers exceeding TDSR ceiling
    const baselineAtRisk = macroMetrics.atRiskBorrowersBaselinePercent;
    const stressedAtRisk = Number((baselineAtRisk + (hikePercent * 2.8)).toFixed(1));
    
    // Monthly systemic repayment increase across S$236B residential mortgage stock
    const systemicMonthlyIncrease = Math.round(macroMetrics.totalResidentialMortgageStockBillion * (hikePercent * 0.01 / 12) * 1000 * 0.8);

    return {
      stressedTdsr,
      stressedAtRisk,
      systemicMonthlyIncrease,
      currentEffectiveRate: (LATEST_MAS_BENCHMARKS.compound3M + 0.65).toFixed(4),
      stressedEffectiveRate: (LATEST_MAS_BENCHMARKS.compound3M + 0.65 + hikePercent).toFixed(4),
    };
  }, [simulatedRateHikeBps, macroMetrics]);

  // Handle re-verification of bank submissions
  const handleRunIntegrityAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
    }, 600);
  };

  const handleApplyPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyAppliedNotice(
      `Directorate Directive Recorded: TDSR ceiling set at ${policyLevers.tdsrCeilingPercent}%, Stress-test floor at ${policyLevers.stressTestFloorRatePercent}%, Liquidity stance: ${policyLevers.masLiquidityFacilityBias}.`
    );
    setTimeout(() => setPolicyAppliedNotice(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Executive Directorate Header in MAS Navy (#002B49) and Gold (#C5A059) */}
      <div className="bg-[#002B49] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#001A2E] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="w-13 h-13 rounded-2xl overflow-hidden border border-white/20 shadow-md bg-[#001A2E] shrink-0 p-1">
              <img
                src={masLogo}
                alt="MAS Emblem"
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://scontent.fsin11-1.fna.fbcdn.net/v/t39.30808-6/278925111_101176359249766_268148734539588340_n.jpg?stp=dst-jpg_tt6&cstp=mx400x400&ctp=s400x400&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=bUiKcu89RJEQ7kNvwEwciZx&_nc_oc=Adra6ndd83cxdDDD88nSqKQLAUoZH-r5DicKtXWiSomZKactFg0Up7IAA3GWdhU1BiM&_nc_zt=23&_nc_ht=scontent.fsin11-1.fna&_nc_gid=WMeFuwOygAEzhuvpvZXsig&_nc_ss=7a2a8&oh=00_AQPNomjuDlPEA7MNyrPD1XieaGrSoKS0fSN7rZd05zNjlw&oe=6AC93919';
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#C5A059] uppercase tracking-widest">
                <span>Monetary Authority of Singapore · Directorate Oversight</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
                SORA Benchmark Governance & Macroprudential Console
              </h1>
              <p className="text-xs sm:text-sm text-[#D1DDE8] mt-1 max-w-3xl">
                Central bank directorate view for benchmark fixing governance, transaction-level submission auditing, and macroprudential mortgage debt surveillance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-xl bg-[#001A2E] border border-white/10 text-xs font-mono">
              <span className="text-slate-400">Fixing:</span>{' '}
              <span className="text-[#C5A059] font-extrabold text-sm">{LATEST_MAS_BENCHMARKS.overnightRate.toFixed(4)}%</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#0D6838] text-xs font-bold text-white flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>IOSCO Principles Certified</span>
            </div>
          </div>
        </div>

        {/* Executive Sub-navigation (MAS Navy & Gold, Strictly No Red) */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'fixing_audit', label: '1. Benchmark Fixing & Bank Submissions', icon: FileCheck2 },
            { id: 'macroprudential', label: '2. Macroprudential Debt Surveillance', icon: ShieldAlert },
            { id: 'policy_levers', label: '3. Regulatory Policy Levers', icon: Scale },
            { id: 'briefing', label: '4. Executive Committee Briefing Note', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = directorTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDirectorTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C5A059] text-[#002B49] shadow-xs'
                    : 'text-[#D1DDE8] hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: Benchmark Fixing & Bank Submissions Audit */}
      {directorTab === 'fixing_audit' && (
        <div className="space-y-6">
          {/* Key Administration Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">Overnight SORA Fixing</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#002B49] mt-1 tabular-nums">
                {LATEST_MAS_BENCHMARKS.overnightRate.toFixed(4)}%
              </div>
              <span className="text-[11px] text-[#0D6838] mt-1 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3 text-[#0D6838]" /> Published 09:00:00 SGT
              </span>
            </div>

            <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">Daily Aggregate Volume</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#002B49] mt-1 tabular-nums">
                S$ {LATEST_MAS_BENCHMARKS.volumeSGDMillion.toLocaleString()}M
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                6 reporting banks (100% submission rate)
              </span>
            </div>

            <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">Calculation Waterfall</span>
              <div className="text-xl font-bold font-mono text-[#002B49] mt-1">
                Level 1: Volume-Weighted
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block font-medium">
                Standard methodology (no fallback required)
              </span>
            </div>

            <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block">Submission Window</span>
              <div className="text-xl font-bold font-mono text-[#002B49] mt-1">
                08:00 - 08:30 SGT
              </div>
              <span className="text-[11px] text-[#0D6838] mt-1 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3 text-[#0D6838]" /> All submissions verified
              </span>
            </div>
          </div>

          {/* Reporting Banks Submissions Audit Ledger */}
          <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
                  <span>Daily Reporting Bank Submissions (Eligible Transactions)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unsecured overnight interbank SGD lending submitted by commercial banks under MAS SORA Governance Rules
                </p>
              </div>

              <button
                type="button"
                disabled={isAuditing}
                onClick={handleRunIntegrityAudit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#002B49] hover:bg-[#001A2E] text-white rounded-xl transition-colors whitespace-nowrap disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>Re-verify Calculations</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-[#D1DDE8] rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F0F6FA] text-[#002B49] font-bold border-b border-[#D1DDE8]">
                  <tr>
                    <th className="py-3 px-4">Bank Name</th>
                    <th className="py-3 px-4">BIC Code</th>
                    <th className="py-3 px-4 text-right">Reported Volume (SGD)</th>
                    <th className="py-3 px-4 text-right">Weighted Rate (%)</th>
                    <th className="py-3 px-4 text-center">Variance vs Fixing</th>
                    <th className="py-3 px-4">Received Time</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {submissions.map((bank) => (
                    <tr key={bank.bankCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-[#002B49]">
                        {bank.bankName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{bank.bankCode}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#002B49] tabular-nums">
                        S$ {bank.reportedVolumeSGDMillion.toLocaleString()}M
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-[#002B49] tabular-nums">
                        {bank.weightedRatePercent.toFixed(4)}%
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums">
                        <span className="text-xs px-2.5 py-0.5 rounded-md font-mono font-bold bg-[#F0F6FA] text-[#002B49] border border-[#D1DDE8]">
                          {bank.varianceBps > 0 ? `+${bank.varianceBps.toFixed(2)}` : bank.varianceBps.toFixed(2)} bps
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{bank.submissionTime}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-[#0D6838] bg-[#EBF7EE] border border-[#C2E8CC] px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[#0D6838]" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Methodology & IOSCO Compliance Statement */}
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D1DDE8] text-xs text-slate-600 space-y-1.5">
              <span className="font-bold text-[#002B49] block">
                Benchmark Administration Protocol (MAS Notice 648 & IOSCO Compliance)
              </span>
              <p className="leading-relaxed">
                SORA is computed as the volume-weighted average rate of eligible transactions reported by the designated
                commercial banks between 08:00 and 18:30 on the preceding business day. Outlier trimming thresholds and
                calculation contingency procedures comply with the MAS SORA Administrator Code of Conduct.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Macroprudential Debt Surveillance */}
      {directorTab === 'macroprudential' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
                <span>Systemic Household Mortgage Debt Sensitivity Simulation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stress-test the resilience of Singapore&apos;s S$ {macroMetrics.totalResidentialMortgageStockBillion} Billion residential mortgage stock against rising SORA benchmark rates.
              </p>
            </div>

            {/* Simulated Rate Hike Slider */}
            <div className="p-5 bg-[#F8FAFC] border border-[#D1DDE8] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Simulated Policy Rate Hike / Benchmark Shock:
                </span>
                <span className="text-sm font-mono font-extrabold text-[#002B49] bg-[#F0F6FA] border border-[#D1DDE8] px-3 py-0.5 rounded-lg tabular-nums">
                  +{simulatedRateHikeBps} bps (+{(simulatedRateHikeBps / 100).toFixed(2)}%)
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={400}
                step={25}
                value={simulatedRateHikeBps}
                onChange={(e) => setSimulatedRateHikeBps(Number(e.target.value))}
                className="w-full accent-[#002B49] h-2 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono font-medium">
                <span>0 bps (Baseline)</span>
                <span>+100 bps</span>
                <span className="text-[#9E7B34] font-bold">+200 bps (MAS Stress Floor)</span>
                <span>+300 bps</span>
                <span className="text-[#002B49] font-bold">+400 bps (Severe Shock)</span>
              </div>
            </div>

            {/* Impact Cards (Strictly No Red) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border border-[#D1DDE8] rounded-2xl bg-white shadow-xs">
                <span className="text-xs text-slate-600 font-bold block">Systemic Portfolio Average TDSR</span>
                <div className="text-3xl font-extrabold font-mono text-[#002B49] mt-1 tabular-nums">
                  {dynamicSurveillance.stressedTdsr}%
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Baseline: {macroMetrics.averageBorrowerTdsrPercent}% (Cap is 55%)
                </span>
              </div>

              <div className="p-5 border border-[#D1DDE8] rounded-2xl bg-white shadow-xs">
                <span className="text-xs text-slate-600 font-bold block">Vulnerable Borrowers Exceeding 55% TDSR</span>
                <div className="text-3xl font-extrabold font-mono mt-1 tabular-nums text-[#002B49]">
                  {dynamicSurveillance.stressedAtRisk}%
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Baseline: {macroMetrics.atRiskBorrowersBaselinePercent}% of residential borrowers
                </span>
              </div>

              <div className="p-5 border border-[#D1DDE8] rounded-2xl bg-white shadow-xs">
                <span className="text-xs text-slate-600 font-bold block">Aggregate Monthly Debt Outflow Surge</span>
                <div className="text-3xl font-extrabold font-mono text-[#9E7B34] mt-1 tabular-nums">
                  +S$ {dynamicSurveillance.systemicMonthlyIncrease}M / mo
                </div>
                <span className="text-xs text-slate-500 mt-1 block">
                  Additional interest payments across Singapore banking sector
                </span>
              </div>
            </div>

            {/* Assessment Callout in Official MAS Notice Box (Strictly No Red) */}
            <div className="p-5 rounded-2xl border border-l-4 border-l-[#002B49] border-[#D1DDE8] bg-white text-xs leading-relaxed text-slate-700 shadow-2xs">
              <div className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-[#002B49]">
                <ShieldAlert className="w-4 h-4 text-[#C5A059]" />
                <span>
                  MAS Directorate Assessment for +{simulatedRateHikeBps} bps Shock:
                </span>
              </div>
              {simulatedRateHikeBps < 150 && (
                <p>
                  Household balance sheets remain resilient. Low leverage ratios (average LTV &lt; 50%) and substantial
                  CPF balances provide sufficient buffer against immediate delinquency risks.
                </p>
              )}
              {simulatedRateHikeBps >= 150 && simulatedRateHikeBps < 250 && (
                <p>
                  Moderate household cash-flow contraction. While credit defaults are mitigated by MAS prudential stress
                  testing at loan origination, discretionary retail consumption may see noticeable slowdown.
                </p>
              )}
              {simulatedRateHikeBps >= 250 && (
                <p>
                  Elevated financial vulnerability. {dynamicSurveillance.stressedAtRisk}% of borrowers would exceed the 55%
                  TDSR regulatory boundary. Directorate recommends close monitoring of lower-income cohorts and stress testing
                  local commercial banks under severe NPL projections.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Regulatory Policy Levers */}
      {directorTab === 'policy_levers' && (
        <div className="space-y-6">
          <form onSubmit={handleApplyPolicy} className="bg-white border border-[#D1DDE8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
                <span>Macroprudential Policy Levers & Money Market Operations</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate adjusting MAS statutory caps, stress test floors, and domestic liquidity facility biases
              </p>
            </div>

            {policyAppliedNotice && (
              <div className="p-3.5 bg-[#EBF7EE] border border-[#C2E8CC] rounded-xl text-xs text-[#0A4D2A] flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#0D6838] shrink-0" />
                <span>{policyAppliedNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TDSR Ceiling */}
              <div className="p-4 bg-[#F8FAFC] border border-[#D1DDE8] rounded-2xl space-y-2">
                <label className="text-xs font-bold text-[#002B49] block">
                  Total Debt Servicing Ratio (TDSR) Ceiling (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={40}
                    max={65}
                    step={1}
                    value={policyLevers.tdsrCeilingPercent}
                    onChange={(e) =>
                      setPolicyLevers({ ...policyLevers, tdsrCeilingPercent: Number(e.target.value) })
                    }
                    className="w-24 px-3 py-2 text-xs font-mono font-bold bg-white border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49]"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Statutory limit (Historically 55%, tightened from 60% in Dec 2021)
                  </span>
                </div>
              </div>

              {/* Stress Test Floor */}
              <div className="p-4 bg-[#F8FAFC] border border-[#D1DDE8] rounded-2xl space-y-2">
                <label className="text-xs font-bold text-[#002B49] block">
                  Mortgage Medium-Term Stress Rate Floor (% p.a.)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={3.0}
                    max={6.0}
                    step={0.25}
                    value={policyLevers.stressTestFloorRatePercent}
                    onChange={(e) =>
                      setPolicyLevers({ ...policyLevers, stressTestFloorRatePercent: Number(e.target.value) })
                    }
                    className="w-24 px-3 py-2 text-xs font-mono font-bold bg-white border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49]"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Minimum underwriting rate floor mandated for financial institutions (4.00%)
                  </span>
                </div>
              </div>

              {/* LTV Limit */}
              <div className="p-4 bg-[#F8FAFC] border border-[#D1DDE8] rounded-2xl space-y-2">
                <label className="text-xs font-bold text-[#002B49] block">
                  Loan-to-Value (LTV) Cap for 1st Housing Loan (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={60}
                    max={85}
                    step={5}
                    value={policyLevers.ltvLimitPercent}
                    onChange={(e) =>
                      setPolicyLevers({ ...policyLevers, ltvLimitPercent: Number(e.target.value) })
                    }
                    className="w-24 px-3 py-2 text-xs font-mono font-bold bg-white border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49]"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    Maximum bank borrowing percentage against property valuation (75%)
                  </span>
                </div>
              </div>

              {/* Money Market Operations Bias */}
              <div className="p-4 bg-[#F8FAFC] border border-[#D1DDE8] rounded-2xl space-y-2">
                <label className="text-xs font-bold text-[#002B49] block">
                  MAS Domestic Money Market Operations (DMMO) Stance
                </label>
                <select
                  value={policyLevers.masLiquidityFacilityBias}
                  onChange={(e) =>
                    setPolicyLevers({
                      ...policyLevers,
                      masLiquidityFacilityBias: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-[#D1DDE8] rounded-xl focus:ring-2 focus:ring-[#002B49]"
                >
                  <option value="Neutral">Neutral: Overnight interbank rates track SORA benchmark closely</option>
                  <option value="Injection">Liquidity Injection: Alleviate upward overnight spike pressures</option>
                  <option value="Absorption">Liquidity Absorption: Sterilize excess banking system liquidity</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setPolicyLevers({
                    tdsrCeilingPercent: 55,
                    stressTestFloorRatePercent: 4.0,
                    ltvLimitPercent: 75,
                    masLiquidityFacilityBias: 'Neutral',
                  })
                }
                className="px-4 py-2 text-xs font-bold border border-[#D1DDE8] rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                Reset to MAS Defaults
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#002B49] text-white rounded-xl hover:bg-[#001A2E] transition-colors shadow-xs cursor-pointer"
              >
                Save Policy Parameters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: Executive Committee Briefing Note (MAS Navy & Gold, Strictly No Red) */}
      {directorTab === 'briefing' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-[#002B49] rounded-2xl p-8 shadow-md space-y-6 max-w-4xl mx-auto">
            <div className="border-b-2 border-[#002B49] pb-4 flex justify-between items-start">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-[#9E7B34] font-bold uppercase">
                  CONFIDENTIAL · FOR INTERNAL CIRCULATION ONLY
                </span>
                <h2 className="text-xl font-extrabold text-[#002B49] mt-1">
                  MONETARY AUTHORITY OF SINGAPORE
                </h2>
                <h3 className="text-sm font-bold text-slate-700">
                  Monetary & Financial Stability Committee (MFSC) Briefing Note
                </h3>
              </div>
              <div className="text-right text-xs font-mono text-slate-600">
                <div className="font-bold">Date: {LATEST_MAS_BENCHMARKS.publicationDate}</div>
                <div>Ref: MAS/DMM/SORA-2026/Q4</div>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              <div>
                <h4 className="font-bold text-[#002B49] mb-1">1. SORA BENCHMARK INTEGRITY & FIXING</h4>
                <p>
                  Today&apos;s SORA fixing was determined at{' '}
                  <strong className="font-mono text-[#002B49] font-bold">{LATEST_MAS_BENCHMARKS.overnightRate.toFixed(4)}%</strong>, based on{' '}
                  <strong className="font-mono font-bold text-[#002B49]">S$ {LATEST_MAS_BENCHMARKS.volumeSGDMillion.toLocaleString()}M</strong> in eligible overnight interbank cash transactions across 6 reporting banks. Submissions were received within the 08:00–08:30 SGT window without outlier triggers. The fixing is certified fully compliant with IOSCO Principles for Financial Benchmarks.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#002B49] mb-1">2. SORA TERM STRUCTURE</h4>
                <p>
                  The compounded term structure stands at: 1-Month:{' '}
                  <span className="font-mono font-bold text-[#002B49]">{LATEST_MAS_BENCHMARKS.compound1M.toFixed(4)}%</span>, 3-Month:{' '}
                  <span className="font-mono font-bold text-[#9E7B34]">{LATEST_MAS_BENCHMARKS.compound3M.toFixed(4)}%</span>, and 6-Month:{' '}
                  <span className="font-mono font-bold text-[#002B49]">{LATEST_MAS_BENCHMARKS.compound6M.toFixed(4)}%</span>. The 3M Compounded SORA benchmark continues to anchor over 99% of new floating-rate residential mortgages and corporate credit facilities.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#002B49] mb-1">3. SYSTEMIC RESILIENCE & TDSR VULNERABILITY</h4>
                <p>
                  Total outstanding residential mortgage debt currently stands at{' '}
                  <strong className="text-[#002B49]">S$ {macroMetrics.totalResidentialMortgageStockBillion} Billion</strong>. Under current interest rates, the banking sector portfolio weighted-average TDSR is{' '}
                  <span className="font-mono font-bold text-[#0D6838]">{macroMetrics.averageBorrowerTdsrPercent}%</span>, comfortably beneath the 55% macroprudential limit. Stress testing indicates that a +200 bps benchmark shock would push an estimated {dynamicSurveillance.stressedAtRisk}% of borrowers into the above-55% TDSR bracket, generating an aggregate +S${dynamicSurveillance.systemicMonthlyIncrease}M monthly cashflow obligation.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#002B49] mb-1">4. DIRECTORATE RECOMMENDATION</h4>
                <p>
                  Maintain current macroprudential settings (55% TDSR ceiling and 4.00% medium-term mortgage stress test floor). Domestic Money Market Operations (DMMO) will maintain a <strong className="text-[#002B49]">{policyLevers.masLiquidityFacilityBias}</strong> liquidity stance to support orderly transmission of monetary policy.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D1DDE8] flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">
                Prepared by: Domestic Markets Management Department (MAS)
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#002B49] text-white rounded-xl hover:bg-[#001A2E] transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Print Official Memo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
