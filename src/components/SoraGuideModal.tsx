import React from 'react';
import { CheckCircle, ExternalLink, X } from 'lucide-react';
import masLogo from '../assets/mas_logo.jpg';

interface SoraGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoraGuideModal: React.FC<SoraGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#001A2E]/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#D1DDE8] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D1DDE8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#002B49]/20 bg-[#002B49] shrink-0 p-0.5">
              <img
                src={masLogo}
                alt="MAS Emblem"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://scontent.fsin11-1.fna.fbcdn.net/v/t39.30808-6/278925111_101176359249766_268148734539588340_n.jpg?stp=dst-jpg_tt6&cstp=mx400x400&ctp=s400x400&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=bUiKcu89RJEQ7kNvwEwciZx&_nc_oc=Adra6ndd83cxdDDD88nSqKQLAUoZH-r5DicKtXWiSomZKactFg0Up7IAA3GWdhU1BiM&_nc_zt=23&_nc_ht=scontent.fsin11-1.fna&_nc_gid=WMeFuwOygAEzhuvpvZXsig&_nc_ss=7a2a8&oh=00_AQPNomjuDlPEA7MNyrPD1XieaGrSoKS0fSN7rZd05zNjlw&oe=6AC93919';
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#002B49]">MAS SORA Regulatory & Methodology Guide</h3>
              <p className="text-xs text-slate-500 font-medium">Official Singapore benchmark interest rate framework</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content (Strictly No Red) */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#002B49] flex items-center gap-1.5">
              <span>1. What is SORA?</span>
            </h4>
            <p className="text-xs leading-relaxed">
              <strong>SORA (Singapore Overnight Rate Average)</strong> is the volume-weighted average rate of unsecured overnight interbank SGD cash lending transactions in Singapore. It is calculated and published by the <strong>Monetary Authority of Singapore (MAS)</strong> every business day at 9:00 AM SGT for the preceding business day.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#002B49] flex items-center gap-1.5">
              <span>2. Why did Singapore transition from SIBOR & SOR?</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] border border-[#D1DDE8] rounded-xl">
                <span className="font-bold text-[#002B49] block mb-1">Old SOR / SIBOR:</span>
                <p className="text-slate-600 leading-normal">
                  Relied on USD/SGD FX swap market rates or subjective bank quote polls, leaving them vulnerable to market liquidity freezes or survey distortion.
                </p>
              </div>
              <div className="p-3 bg-[#EBF7EE] border border-[#C2E8CC] rounded-xl">
                <span className="font-bold text-[#0D6838] block mb-1">Modern SORA:</span>
                <p className="text-[#0A4D2A] leading-normal">
                  100% anchored in real, verified overnight interbank SGD loan transactions (averaging S$3B to S$5B daily volume), ensuring transparency and compliance with IOSCO principles.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#002B49] flex items-center gap-1.5">
              <span>3. Compounded in Advance vs. Compounded in Arrears</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#002B49] shrink-0 mt-0.5" />
                <span>
                  <strong>3M Compounded in Advance (Retail Mortgages):</strong> Banks like DBS, OCBC, and UOB look at the 3M Compounded SORA published by MAS on a specific date (e.g. 1st of the month) and lock in that interest rate for your upcoming 3-month quarterly period. You know your installment amount in advance!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#002B49] shrink-0 mt-0.5" />
                <span>
                  <strong>Compounded in Arrears (Corporate & Trade):</strong> Rates are observed each business day throughout the interest period and compounded daily using Friday carry-overs for weekends. The final interest payment is computed at the end of the loan term.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#002B49] flex items-center gap-1.5">
              <span>4. Singapore Statutory Day Count: Actual/365</span>
            </h4>
            <p className="text-xs leading-relaxed">
              Unlike US and European markets that frequently use Actual/360 or 30/360, all SGD money market and home loan interest calculations in Singapore use <strong>Actual/365</strong>:
            </p>
            <div className="p-3.5 bg-[#002B49] text-white rounded-xl font-mono text-[11px] border border-[#001A2E]">
              Interest = Principal &times; Applicable Rate &times; (Actual Days / 365)
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#002B49] flex items-center gap-1.5">
              <span>5. MAS TDSR Regulations</span>
            </h4>
            <p className="text-xs leading-relaxed">
              The <strong>Total Debt Servicing Ratio (TDSR)</strong> framework caps a borrower&apos;s total monthly debt obligations (including home loan, car loan, and cards) at <strong>55% of their gross monthly income</strong>. MAS also prescribes a minimum medium-term interest rate floor (typically 4.00% or current rate buffer) for mortgage qualification tests.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#D1DDE8] bg-[#F0F6FA] flex items-center justify-between rounded-b-2xl">
          <a
            href="https://www.mas.gov.sg/monetary-policy/sora"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#002B49] hover:text-[#9E7B34] hover:underline font-bold flex items-center gap-1"
          >
            <span>Official MAS SORA Web Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#002B49] text-white rounded-xl hover:bg-[#001A2E] transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
