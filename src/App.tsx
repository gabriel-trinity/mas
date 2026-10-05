import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { Footer } from './components/Footer';
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
      {/* Official MAS Three-Tier Header with Lion Head symbol & Source Sans 3 typography */}
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

      {/* Official MAS Website Footer (#08457E) with Brand SG Logo, Subscription & Legals */}
      <Footer onOpenGuide={() => setIsGuideOpen(true)} perspective={perspective} />
    </div>
  );
}
