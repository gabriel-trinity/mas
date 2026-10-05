import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { LATEST_MAS_BENCHMARKS } from '../data/masHistoricalRates';

export const RateTickerBar: React.FC = () => {
  return (
    <div className="border-b border-[#D1DDE8] bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs">
          {/* MAS Official Benchmark Identifier (Navy & Gold, Strictly No Red) */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-[#002B49] bg-white border border-[#D1DDE8] px-2.5 py-0.5 rounded-md shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
              <span className="text-[#002B49] font-extrabold tracking-tight">MAS</span>
              <span className="text-slate-800">SORA Official Fixing</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Published {LATEST_MAS_BENCHMARKS.publicationDate} (09:00 SGT)
            </span>
          </div>

          {/* Rates Ticker */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
            {/* 3M SORA Highlighted in MAS Gold & Navy */}
            <div className="flex items-center gap-1.5 bg-[#FDF8EE] text-[#9E7B34] border border-[#F6EED8] px-2.5 py-0.5 rounded-md shadow-2xs">
              <span className="text-[#9E7B34] font-sans text-[11px] font-bold">3M SORA:</span>
              <span className="font-extrabold tabular-nums text-[#002B49]">
                {LATEST_MAS_BENCHMARKS.compound3M.toFixed(4)}%
              </span>
            </div>

            <span className="text-slate-300 hidden sm:inline">·</span>

            {/* 1M SORA */}
            <div className="flex items-center gap-1 bg-white border border-[#D1DDE8] px-2 py-0.5 rounded-md text-slate-700">
              <span className="text-slate-500 font-sans text-[11px] font-medium">1M SORA:</span>
              <span className="font-bold text-[#002B49] tabular-nums">
                {LATEST_MAS_BENCHMARKS.compound1M.toFixed(4)}%
              </span>
            </div>

            <span className="text-slate-300 hidden sm:inline">·</span>

            {/* 6M SORA */}
            <div className="flex items-center gap-1 bg-white border border-[#D1DDE8] px-2 py-0.5 rounded-md text-slate-700">
              <span className="text-slate-500 font-sans text-[11px] font-medium">6M SORA:</span>
              <span className="font-bold text-[#002B49] tabular-nums">
                {LATEST_MAS_BENCHMARKS.compound6M.toFixed(4)}%
              </span>
            </div>

            <span className="text-slate-300 hidden md:inline">·</span>

            {/* Overnight SORA */}
            <div className="flex items-center gap-1 bg-white border border-[#D1DDE8] px-2 py-0.5 rounded-md text-slate-700 hidden md:flex">
              <span className="text-slate-500 font-sans text-[11px] font-medium">Overnight:</span>
              <span className="font-bold text-[#002B49] tabular-nums">
                {LATEST_MAS_BENCHMARKS.overnightRate.toFixed(4)}%
              </span>
            </div>

            <span className="text-slate-300 hidden lg:inline">·</span>

            {/* Volume in SGD */}
            <div className="flex items-center gap-1 bg-white border border-[#D1DDE8] text-slate-700 px-2 py-0.5 rounded-md hidden lg:flex">
              <span className="text-slate-500 font-sans text-[11px] font-medium">Daily Vol:</span>
              <span className="font-bold text-[#002B49] tabular-nums">
                S${LATEST_MAS_BENCHMARKS.volumeSGDMillion.toLocaleString()}M
              </span>
            </div>

            <div className="flex items-center gap-1 pl-1 text-[#0D6838] text-[11px] font-sans font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0D6838]" />
              <span>Actual/365</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
