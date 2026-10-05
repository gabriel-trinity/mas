import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Landmark,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Table,
  TrendingUp,
} from 'lucide-react';
import { UserPerspective } from '../types/sora';
import { LionHeadSymbol } from './LionHeadSymbol';
import masOfficialLogo from '../assets/mas_official_logo.svg';
import masEmblemJpg from '../assets/mas_logo.jpg';

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
  const [svgLogoError, setSvgLogoError] = useState(false);

  return (
    <header className="border-b border-[#D1DDE8] bg-white sticky top-0 z-30 shadow-xs">
      {/* Official Singapore Government Agency Masthead with Lion Head Symbol (mas.gov.sg style) */}
      <div className="bg-[#F0F0F0] border-b border-[#E0E0E0] text-[12px] text-[#444444] py-1.5 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Authentic Red Singapore Lion Head Symbol */}
            <LionHeadSymbol className="w-[15px] h-[17px] mr-0.5" />
            <span className="font-normal text-[#444444]">A Singapore Government Agency Website</span>
            <button
              type="button"
              onClick={() => setShowGovExplainer(!showGovExplainer)}
              className="text-[#002B49] hover:text-[#A78337] hover:underline flex items-center gap-0.5 font-semibold ml-1 cursor-pointer transition-colors"
            >
              <span>How to identify</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showGovExplainer ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span>Official SORA Benchmark Fixing · 09:00 SGT</span>
          </div>
        </div>

        {/* Singapore Government Trust Verification Accordion */}
        {showGovExplainer && (
          <div className="max-w-7xl mx-auto py-3 px-3 text-slate-700 text-xs border-t border-[#E0E0E0] mt-2 bg-white rounded-xl shadow-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#002B49] font-mono text-sm">.gov.sg</span>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  <strong>Official government websites use .gov.sg</strong>
                  <br />
                  Always check that the address ends with <strong>.gov.sg</strong> before sharing confidential information.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#0D6838] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-600">
                  <strong>Secure websites use HTTPS</strong>
                  <br />
                  Look for a lock icon in your browser address bar to verify that the connection is encrypted.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main MAS Header Bar (Matching mas.gov.sg Style & Source Sans 3 Typography) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Zone 1: Official MAS Logo & Brand Heading */}
          <div className="flex items-center gap-3.5">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('loan');
              }}
              className="flex items-center gap-3 group"
            >
              {!svgLogoError ? (
                /* Official MAS Vector Logo as used on mas.gov.sg */
                <div className="flex items-center gap-3">
                  <img
                    src={masOfficialLogo}
                    alt="Monetary Authority of Singapore"
                    className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.01]"
                    onError={() => setSvgLogoError(true)}
                  />
                  <div className="hidden sm:flex flex-col border-l border-[#D1DDE8] pl-3">
                    <span className="text-[10px] font-bold tracking-widest text-[#002B49] uppercase">
                      Financial Benchmarks
                    </span>
                    <span className="text-[12px] font-extrabold text-[#002B49] tracking-tight">
                      SORA Gateway
                    </span>
                  </div>
                </div>
              ) : (
                /* Fallback Emblem + Typography */
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#002B49]/20 shadow-xs group-hover:ring-2 group-hover:ring-[#002B49] transition-all bg-[#002B49] flex items-center justify-center p-0.5">
                    <img
                      src={masEmblemJpg}
                      alt="Monetary Authority of Singapore"
                      className="w-full h-full object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[15px] sm:text-base font-extrabold tracking-tight text-[#002B49] leading-tight group-hover:text-[#A78337] transition-colors font-sans">
                      Monetary Authority of Singapore
                    </div>
                    <div className="text-[11px] font-bold text-[#64748B] tracking-wide uppercase mt-0.5">
                      Singapore Overnight Rate Average (SORA)
                    </div>
                  </div>
                </div>
              )}
            </a>
          </div>

          {/* Zone 2: Navigation Links with MAS Navy Active Underline (Source Sans 3 Style) */}
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
                    className={`flex items-center gap-1.5 px-3.5 h-full text-xs font-semibold tracking-wide transition-all relative border-b-2 cursor-pointer ${
                      isActive
                        ? 'border-[#002B49] text-[#002B49] font-bold'
                        : 'border-transparent text-slate-600 hover:text-[#A78337] hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A78337]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#002B49] bg-[#F0F6FA] px-3.5 py-1.5 rounded-lg border border-[#D1DDE8]">
              <ShieldCheck className="w-4 h-4 text-[#A78337]" />
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
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  perspective === 'mas_director'
                    ? 'bg-[#002B49] text-[#A78337] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#A78337]" />
                <span>MAS Director</span>
              </button>
            </div>

            <button
              onClick={onOpenGuide}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-[#D1DDE8] rounded-lg hover:border-[#002B49] hover:text-[#002B49] transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#A78337]" />
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
                className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
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
