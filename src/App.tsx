import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { RateTickerBar } from './components/RateTickerBar';
import { MortgageCalculator } from './components/MortgageCalculator';
import { InArrearsCalculator } from './components/InArrearsCalculator';
import { StressTestMatrix } from './components/StressTestMatrix';
import { RatesExplorer } from './components/RatesExplorer';
import { SoraGuideModal } from './components/SoraGuideModal';
import { MasDirectorDashboard } from './components/director/MasDirectorDashboard';
import { UserPerspective } from './types/sora';

export default function App() {
  const [perspective, setPerspective] = useState<UserPerspective>('market_participant');
  const [activeTab, setActiveTab] = useState<NavTab>('loan');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar Contract (3 zones with Role Switcher) */}
      <Header
        perspective={perspective}
        onPerspectiveChange={(p) => setPerspective(p)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Official MAS Benchmark Ribbon */}
      <RateTickerBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {perspective === 'mas_director' ? (
          <MasDirectorDashboard />
        ) : (
          <>
            {activeTab === 'loan' && <MortgageCalculator />}
            {activeTab === 'in-arrears' && <InArrearsCalculator />}
            {activeTab === 'stress-test' && <StressTestMatrix />}
            {activeTab === 'rates' && <RatesExplorer />}
          </>
        )}
      </main>

      {/* Institutional MAS Regulatory Guide Modal */}
      <SoraGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Official MAS Institutional Footer (Strictly No Red) */}
      <footer className="border-t border-[#D1DDE8] bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#002B49]">Monetary Authority of Singapore (MAS)</span>
            <span>·</span>
            <span>SORA Actual/365 Day-Count Standard</span>
            <span>·</span>
            <span className="font-semibold text-[#002B49]">
              {perspective === 'mas_director' ? 'Directorate Oversight Console' : 'Borrower Benchmark Portal'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-[#002B49] font-medium transition-colors cursor-pointer"
            >
              Methodology & Calculations
            </button>
            <span>·</span>
            <a
              href="https://www.mas.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002B49] hover:text-[#9E7B34] hover:underline font-bold transition-colors"
            >
              mas.gov.sg
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
