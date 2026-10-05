import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Landmark,
  ShieldCheck,
  SlidersHorizontal,
  Table,
  TrendingUp,
} from 'lucide-react';
import { UserPerspective } from '../types/sora';
import masLogo from '../assets/mas_logo.jpg';

export type NavTab = 'loan' | 'in-arrears' | 'stress-test' | 'rates';

interface HeaderProps {
  perspective: UserPerspective;
  onPerspectiveChange: (p: UserPerspective) => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  perspective,
  onPerspectiveChange,
  activeTab,
  onTabChange,
  onOpenGuide,
}) => {
  const [showGovExplainer, setShowGovExplainer] = useState(false);

  return (
    <header className="border-b border-[#D1DDE8] bg-white sticky top-0 z-30 shadow-xs">
      {/* Official Singapore Government Agency Masthead (MAS Navy & Gold, Strictly No Red) */}
      <div className="bg-[#F0F6FA] border-b border-[#D1DDE8] text-[11px] text-slate-700 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#002B49] text-[#C5A059] font-bold text-[9px]">
              SG
            </span>
            <span className="font-semibold text-slate-800">A Singapore Government Agency Website</span>
            <button
              type="button"
              onClick={() => setShowGovExplainer(!showGovExplainer)}
              className="text-[#002B49] hover:text-[#9E7B34] hover:underline flex items-center gap-0.5 font-bold ml-1 cursor-pointer"
            >
              <span>How to identify</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showGovExplainer ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span>Official SORA Benchmark Fixing · 09:00 SGT</span>
          </div>
        </div>

        {showGovExplainer && (
          <div className="max-w-7xl mx-auto py-2.5 px-2 text-slate-600 text-[11px] space-y-1 border-t border-[#D1DDE8] mt-1.5 bg-white rounded-lg">
            <p>
              Official Singapore government websites use the <strong>.gov.sg</strong> domain. Secure websites use <strong>HTTPS</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Main MAS Header Bar with Provided Official Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Authentic MAS Logo Image + Typography */}
          <div className="flex items-center gap-3.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('loan');
              }}
              className="flex items-center gap-3 group"
            >
              {/* User-specified Official MAS Navy & Gold Emblem Logo */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#002B49]/20 shadow-xs group-hover:ring-2 group-hover:ring-[#002B49] transition-all bg-[#002B49] flex items-center justify-center p-0.5">
                <img
                  src={masLogo}
                  alt="Monetary Authority of Singapore"
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://scontent.fsin11-1.fna.fbcdn.net/v/t39.30808-6/278925111_101176359249766_268148734539588340_n.jpg?stp=dst-jpg_tt6&cstp=mx400x400&ctp=s400x400&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=bUiKcu89RJEQ7kNvwEwciZx&_nc_oc=Adra6ndd83cxdDDD88nSqKQLAUoZH-r5DicKtXWiSomZKactFg0Up7IAA3GWdhU1BiM&_nc_zt=23&_nc_ht=scontent.fsin11-1.fna&_nc_gid=WMeFuwOygAEzhuvpvZXsig&_nc_ss=7a2a8&oh=00_AQPNomjuDlPEA7MNyrPD1XieaGrSoKS0fSN7rZd05zNjlw&oe=6AC93919';
                  }}
                />
              </div>

              <div className="flex flex-col">
                <div className="text-[15px] sm:text-base font-extrabold tracking-tight text-[#002B49] leading-tight group-hover:text-[#9E7B34] transition-colors">
                  Monetary Authority of Singapore
                </div>
                <div className="text-[11px] font-bold text-[#64748B] tracking-wide uppercase mt-0.5">
                  Singapore Overnight Rate Average (SORA)
                </div>
              </div>
            </a>
          </div>

          {/* Zone 2: Navigation Links with MAS Navy Active Underline (No Red) */}
          {perspective === 'market_participant' ? (
            <nav className="hidden lg:flex items-center h-full gap-1">
              {[
                { id: 'loan', label: 'Loan & Mortgage', icon: Landmark },
                { id: 'in-arrears', label: 'In-Arrears Daily', icon: Table },
                { id: 'stress-test', label: 'TDSR Sensitivity', icon: TrendingUp },
                { id: 'rates', label: 'MAS Rates & API', icon: SlidersHorizontal },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 h-full text-xs font-bold transition-all relative border-b-2 ${
                      isActive
                        ? 'border-[#002B49] text-[#002B49]'
                        : 'border-transparent text-slate-600 hover:text-[#002B49] hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#002B49] bg-[#F0F6FA] px-3.5 py-1.5 rounded-lg border border-[#D1DDE8]">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>MAS Executive Directorate Oversight Mode Active</span>
            </div>
          )}

          {/* Zone 3: Perspective Switcher & Actions */}
          <div className="flex items-center gap-3">
            {/* Perspective Switcher Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-[#F0F6FA] rounded-xl border border-[#D1DDE8]">
              <button
                type="button"
                onClick={() => onPerspectiveChange('market_participant')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  perspective === 'market_participant'
                    ? 'bg-white text-[#002B49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Market Loans
              </button>
              <button
                type="button"
                onClick={() => onPerspectiveChange('mas_director')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  perspective === 'mas_director'
                    ? 'bg-[#002B49] text-[#C5A059] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>MAS Director</span>
              </button>
            </div>

            <button
              onClick={onOpenGuide}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-[#D1DDE8] rounded-lg hover:border-[#002B49] hover:text-[#002B49] transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>MAS Methodology</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar with MAS Navy active states */}
        {perspective === 'market_participant' && (
          <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
            {[
              { id: 'loan', label: 'Loan Repayments' },
              { id: 'in-arrears', label: 'In-Arrears Daily' },
              { id: 'stress-test', label: 'TDSR Stress Test' },
              { id: 'rates', label: 'MAS Rates & API' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#002B49] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
