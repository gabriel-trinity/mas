import React, { useMemo, useState } from 'react';
import {
  Activity,
  Code2,
  Database,
  RefreshCw,
  Search,
} from 'lucide-react';
import { DailySoraRate } from '../types/sora';
import { MAS_SORA_RATES } from '../data/masHistoricalRates';

export const RatesExplorer: React.FC = () => {
  const [rates, setRates] = useState<DailySoraRate[]>(MAS_SORA_RATES);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<'rate' | 'compound1M' | 'compound3M' | 'compound6M'>('compound3M');
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/sora-rates');
  const [apiStatus, setApiStatus] = useState<'ready' | 'testing' | 'success' | 'error'>('ready');
  const [apiMessage, setApiMessage] = useState<string>('Ready for backend integration');

  // Manual rate override inputs
  const [overrideDate, setOverrideDate] = useState<string>('2026-10-06');
  const [overrideRate, setOverrideRate] = useState<string>('2.7500');

  // Filter rates by date search
  const filteredRates = useMemo(() => {
    if (!searchTerm.trim()) return rates;
    const term = searchTerm.toLowerCase().trim();
    return rates.filter((r) => r.date.toLowerCase().includes(term));
  }, [rates, searchTerm]);

  // Metric stats
  const stats = useMemo(() => {
    if (rates.length === 0) return { min: 0, max: 0, avg: 0, latest: 0 };
    const values = rates.map((r) => r[selectedMetric] || r.rate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
    return {
      min: Number(min.toFixed(4)),
      max: Number(max.toFixed(4)),
      avg: Number(avg.toFixed(4)),
      latest: Number((rates[0]?.[selectedMetric] || rates[0]?.rate || 0).toFixed(4)),
    };
  }, [rates, selectedMetric]);

  // Chart coordinate calculation (recent 45 records for clarity)
  const chartData = useMemo(() => {
    const slice = rates.slice(0, 45).reverse();
    if (slice.length < 2) return [];

    const values = slice.map((d) => d[selectedMetric] || d.rate);
    const minVal = Math.min(...values) - 0.05;
    const maxVal = Math.max(...values) + 0.05;
    const range = maxVal - minVal || 1;

    return slice.map((item, idx) => {
      const val = item[selectedMetric] || item.rate;
      const x = (idx / (slice.length - 1)) * 100;
      const y = 100 - ((val - minVal) / range) * 100;
      return {
        date: item.date,
        val,
        x,
        y,
      };
    });
  }, [rates, selectedMetric]);

  const svgPath = useMemo(() => {
    if (chartData.length < 2) return '';
    return chartData.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [chartData]);

  // Test backend API connection handler
  const handleTestApi = async () => {
    setApiStatus('testing');
    setApiMessage('Querying API endpoint...');

    try {
      const res = await fetch(apiEndpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRates(data);
          setApiStatus('success');
          setApiMessage(`Successfully synchronized ${data.length} records from backend!`);
          return;
        }
      }
      throw new Error(`Endpoint returned status ${res.status}`);
    } catch (err: unknown) {
      setTimeout(() => {
        setApiStatus('error');
        setApiMessage(
          `Notice: Backend endpoint (${apiEndpoint}) not yet connected. Using built-in MAS baseline dataset. Frontend is fully prepared to consume this endpoint once your backend is ready!`
        );
      }, 600);
    }
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(overrideRate);
    if (isNaN(rateNum) || rateNum <= 0) return;

    const newRecord: DailySoraRate = {
      date: overrideDate,
      rate: rateNum,
      volumeSGDMillion: 4200,
      compound1M: Number((rateNum + 0.015).toFixed(4)),
      compound3M: Number((rateNum + 0.035).toFixed(4)),
      compound6M: Number((rateNum + 0.055).toFixed(4)),
      soraIndex: 1.159200,
    };

    setRates([newRecord, ...rates]);
  };

  return (
    <div className="space-y-8">
      {/* Intro Header with MAS Navy Accent (Strictly No Red) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1DDE8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#002B49]">
              MAS SORA Rates & Backend Integration Gateway
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Browse official historical MAS overnight rates and configure the future backend API integration endpoint.
          </p>
        </div>
      </div>

      {/* Visual Chart Card with Official MAS Branding */}
      <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#F0F6FA] text-[#002B49]">
                <Activity className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-[#002B49]">SORA Historical Benchmark Trajectory</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily movements of MAS overnight and compounded benchmarks
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F0F6FA] rounded-xl border border-[#D1DDE8]">
            {[
              { id: 'compound3M', label: '3M SORA' },
              { id: 'compound1M', label: '1M SORA' },
              { id: 'compound6M', label: '6M SORA' },
              { id: 'rate', label: 'Overnight' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  selectedMetric === m.id
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Stats Bar with Official MAS Styling (No Red) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1 text-xs">
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D1DDE8]">
            <span className="text-slate-500 block text-[11px] font-bold">Latest Value</span>
            <span className="text-base font-extrabold font-mono text-[#002B49] tabular-nums">
              {stats.latest.toFixed(4)}%
            </span>
          </div>
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D1DDE8]">
            <span className="text-slate-500 block text-[11px] font-bold">Period Average</span>
            <span className="text-base font-bold font-mono text-[#002B49] tabular-nums">
              {stats.avg.toFixed(4)}%
            </span>
          </div>
          <div className="p-3 bg-[#EBF7EE] rounded-xl border border-[#C2E8CC]">
            <span className="text-[#0D6838] block text-[11px] font-bold">Period Low</span>
            <span className="text-base font-bold font-mono text-[#0D6838] tabular-nums">
              {stats.min.toFixed(4)}%
            </span>
          </div>
          <div className="p-3 bg-[#FDF8EE] rounded-xl border border-[#F6EED8]">
            <span className="text-[#9E7B34] block text-[11px] font-bold">Period High</span>
            <span className="text-base font-bold font-mono text-[#9E7B34] tabular-nums">
              {stats.max.toFixed(4)}%
            </span>
          </div>
        </div>

        {/* SVG Sparkline Chart with MAS Navy & Gold Tone */}
        <div className="h-48 w-full relative pt-2">
          {chartData.length > 1 ? (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              {/* Gridlines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="#E2E8F0" strokeWidth="0.8" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#E2E8F0" strokeWidth="0.8" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="#E2E8F0" strokeWidth="0.8" />

              {/* Area gradient under curve */}
              <defs>
                <linearGradient id="masSoraGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#002B49" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#002B49" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,100 ${chartData.map((p) => `${p.x},${p.y}`).join(' ')} 100,100`}
                fill="url(#masSoraGrad)"
              />

              {/* Line path in MAS Navy */}
              <path
                d={svgPath}
                fill="none"
                stroke="#002B49"
                strokeWidth="2.4"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Latest dot in MAS Gold */}
              {chartData.length > 0 && (
                <circle
                  cx={chartData[chartData.length - 1].x}
                  cy={chartData[chartData.length - 1].y}
                  r="4.5"
                  className="fill-[#C5A059] stroke-white stroke-2 shadow-xs"
                />
              )}
            </svg>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No historical chart data available
            </div>
          )}
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-mono font-medium">
          <span>{chartData[0]?.date || 'Past'}</span>
          <span className="font-bold text-[#002B49]">{chartData[chartData.length - 1]?.date || 'Today'}</span>
        </div>
      </div>

      {/* Backend Integration Ready Panel in MAS Corporate Navy (#002B49) */}
      <div className="bg-[#002B49] text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-[#001A2E] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#C5A059] text-[#002B49]">
              <Database className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Backend Integration Architecture</h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#002B49] bg-[#C5A059] px-2.5 py-0.5 rounded-lg">
            Plug-and-Play Ready
          </span>
        </div>

        <p className="text-xs text-[#D1DDE8] leading-relaxed">
          The frontend is pre-wired to consume live MAS rates from your backend service. Once you create your backend route (e.g. Express proxy or automated cron fetching from MAS Datastore API), specify the endpoint URL below.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs font-mono font-bold bg-[#001A2E] border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#C5A059]"
            placeholder="/api/sora-rates"
          />

          <button
            type="button"
            disabled={apiStatus === 'testing'}
            onClick={handleTestApi}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-[#C5A059] hover:bg-[#9E7B34] text-[#002B49] hover:text-white rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${apiStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test Backend Sync</span>
          </button>
        </div>

        {apiMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-sans ${
              apiStatus === 'success'
                ? 'bg-[#0D6838]/30 border border-[#0D6838] text-[#68D391]'
                : apiStatus === 'error'
                ? 'bg-[#001A2E] border border-[#C5A059]/40 text-[#F6EED8]'
                : 'bg-[#001A2E]/80 border border-white/10 text-[#D1DDE8]'
            }`}
          >
            {apiMessage}
          </div>
        )}

        {/* Expected JSON Schema documentation */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-xs text-[#D1DDE8] font-bold mb-1.5 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Expected Backend JSON Response Format:</span>
          </div>
          <pre className="p-3.5 bg-[#001A2E] rounded-xl text-[11px] font-mono text-[#68D391] overflow-x-auto border border-white/10">
{`[
  {
    "date": "2026-10-05",
    "rate": 2.7450,
    "compound1M": 2.7600,
    "compound3M": 2.7800,
    "compound6M": 2.8000,
    "volumeSGDMillion": 4150,
    "soraIndex": 1.158420
  }
]`}
          </pre>
        </div>
      </div>

      {/* Manual Rate Entry & Test */}
      <div className="bg-white border border-[#D1DDE8] rounded-2xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-[#002B49] mb-2">Simulate New Daily Rate Entry</h4>
        <form onSubmit={handleApplyOverride} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-700 block mb-1">Publication Date</label>
            <input
              type="date"
              value={overrideDate}
              onChange={(e) => setOverrideDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl bg-[#F8FAFC] focus:ring-2 focus:ring-[#002B49]"
            />
          </div>

          <div className="flex-1">
            <label className="text-xs font-bold text-slate-700 block mb-1">Overnight SORA Rate (% p.a.)</label>
            <input
              type="number"
              step={0.0001}
              value={overrideRate}
              onChange={(e) => setOverrideRate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D1DDE8] rounded-xl bg-[#F8FAFC] focus:ring-2 focus:ring-[#002B49]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold bg-[#002B49] text-white rounded-xl hover:bg-[#001A2E] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
          >
            Inject Rate
          </button>
        </form>
      </div>

      {/* Historical Rates Table */}
      <div className="bg-white border border-[#D1DDE8] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#002B49] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#002B49]" />
              <span>MAS Daily Publication Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive historical records with Actual/365 compounded series
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search date (e.g. 2026-09)..."
              className="pl-8 pr-3 py-1.5 text-xs font-medium border border-[#D1DDE8] rounded-xl w-56 focus:ring-2 focus:ring-[#002B49] bg-[#F8FAFC]"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#D1DDE8] rounded-xl max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F0F6FA] text-[#002B49] font-bold border-b border-[#D1DDE8] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Overnight SORA</th>
                <th className="py-2.5 px-3 text-right">1M Compounded</th>
                <th className="py-2.5 px-3 text-right">3M Compounded</th>
                <th className="py-2.5 px-3 text-right">6M Compounded</th>
                <th className="py-2.5 px-3 text-right">Volume (SGD M)</th>
                <th className="py-2.5 px-3 text-right">SORA Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredRates.map((r) => (
                <tr key={r.date} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-bold text-[#002B49]">{r.date}</td>
                  <td className="py-2 px-3 text-right text-slate-900 font-semibold tabular-nums">
                    {r.rate.toFixed(4)}%
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 font-medium tabular-nums">
                    {r.compound1M?.toFixed(4) || '-'}%
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-[#002B49] tabular-nums">
                    {r.compound3M?.toFixed(4) || '-'}%
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 font-medium tabular-nums">
                    {r.compound6M?.toFixed(4) || '-'}%
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 tabular-nums">
                    {r.volumeSGDMillion ? `S$ ${r.volumeSGDMillion.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500 tabular-nums">
                    {r.soraIndex?.toFixed(6) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
