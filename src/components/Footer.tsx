import React from 'react';
import { ExternalLink, Mail } from 'lucide-react';

interface FooterProps {
  onOpenGuide?: () => void;
  perspective?: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide }) => {
  return (
    <footer className="bg-[#08457E] text-white text-sm font-sans mt-16 border-t-4 border-[#A78337]" id="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Tier: Organization Title and Official Brand SG Logo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              <a
                href="https://www.mas.gov.sg/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
              >
                Monetary Authority of Singapore
              </a>
            </h2>
            <p className="text-xs text-[#C5A059] font-semibold mt-1">
              Central Bank and Integrated Financial Regulatory Authority of Singapore
            </p>
          </div>

          {/* Official Brand SG Logo SVG from mas.gov.sg */}
          <div className="shrink-0 flex items-center gap-3">
            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest hidden sm:inline">
              Singapore
            </span>
            <svg
              width="44"
              height="44"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              className="w-11 h-11"
              aria-label="Brand Singapore Emblem"
            >
              <g fill="none" fillRule="evenodd">
                <path d="M0 0h48v48H0z" />
                <path
                  d="M9.066 27.325c.207-.257.568-.205.774.054 1.39 1.912 3.143 2.896 5.414 2.9 2.064.004 3.305-.82 3.307-2.11.002-1.135-.77-1.808-2.73-2.379l-3.096-.883c-2.94-.832-4.691-2.797-4.687-5.17.007-3.149 2.85-5.363 6.824-5.355 2.632.005 4.85.938 6.394 2.696.207.207.206.517-.001.774l-1.603 1.649c-.207.309-.568.308-.775-.002-1.184-1.293-2.473-1.966-4.022-1.969-2.116-.004-3.46.87-3.462 2.161-.002 1.032.823 1.757 2.886 2.328l3.302.936c2.992.831 4.434 2.486 4.428 5.221-.006 3.252-2.849 5.414-6.978 5.406-3.097-.006-5.469-1.146-7.632-3.73a.5.5 0 01.002-.724l1.655-1.803zm31.896-4.583c.362 0 .568.259.567.568l-.001.774c-.011 5.471-3.941 9.541-9.36 9.53-5.317-.01-9.18-4.094-9.17-9.617.011-5.174 3.89-9.592 9.258-9.582 2.787.005 5.005.887 6.962 2.852.206.207.205.517-.001.774l-1.552 1.7c-.207.258-.516.258-.774 0-1.391-1.397-2.732-2.02-4.693-2.023-3.303-.006-5.682 2.621-5.69 6.286-.007 3.664 2.362 6.302 5.666 6.308 2.942.005 5.009-1.539 5.337-4.273l-5.626-.01c-.31-.001-.567-.209-.567-.518l.005-2.22c0-.361.259-.567.569-.566l8.67.017zm-17 21.58c-11.225-.021-20.306-9.137-20.285-20.36C3.7 12.737 12.815 3.655 24.04 3.676c11.223.022 20.305 9.138 20.283 20.362-.021 11.224-9.137 20.305-20.36 20.284zM24.045 0C10.79-.025.026 10.7 0 23.954-.025 37.209 10.7 47.974 23.954 48c13.254.025 24.02-10.7 24.046-23.954C48.025 10.792 37.3.026 24.046 0z"
                  fill="#FFF"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Middle Tier: Subscription Card & Social/Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-between">
          {/* MAS Subscription Box */}
          <a
            href="https://www.mas.gov.sg/subscription-services"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all border border-white/15 group"
          >
            <div className="w-12 h-12 rounded-lg bg-[#C5A059] text-[#002B49] flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-base group-hover:text-[#C5A059] transition-colors">
                Subscribe to Updates
              </div>
              <div className="text-xs text-white/80 mt-0.5">
                Get notified whenever news, statistical bulletins, and interest rate benchmark notices are posted.
              </div>
            </div>
          </a>

          {/* Right Links & Social Icons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-5">
            <div className="flex items-center gap-4 text-sm font-semibold">
              <a
                href="https://www.mas.gov.sg/contact-us"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C29C63] hover:underline"
              >
                Contact Us
              </a>
              <span className="text-white/30">|</span>
              <a
                href="https://www.mas.gov.sg/feedback"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C29C63] hover:underline"
              >
                Feedback
              </a>
              {onOpenGuide && (
                <>
                  <span className="text-white/30">|</span>
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="text-[#C29C63] hover:underline cursor-pointer"
                  >
                    SORA Methodology
                  </button>
                </>
              )}
            </div>

            {/* Social Icons (LinkedIn & Twitter/X styled in official MAS Gold #D9B173) */}
            <div className="flex items-center gap-2.5">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/mas"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MAS LinkedIn"
                className="w-8 h-8 rounded-full border border-[#C29C63]/60 flex items-center justify-center hover:bg-[#C29C63] hover:text-[#08457E] text-[#C29C63] transition-all"
              >
                <span className="font-bold text-xs">in</span>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com/mas_sg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MAS Twitter"
                className="w-8 h-8 rounded-full border border-[#C29C63]/60 flex items-center justify-center hover:bg-[#C29C63] hover:text-[#08457E] text-[#C29C63] transition-all"
              >
                <span className="font-bold text-xs">𝕏</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Legals, Vulnerability Reporting & Copyright (Exact MAS gov.sg layout) */}
        <div className="pt-6 border-t border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#C29C63]">
            <li>
              <a
                href="https://www.tech.gov.sg/report_vulnerability"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <span>Report Vulnerability</span>
                <ExternalLink className="w-3 h-3 text-[#C29C63]" />
              </a>
            </li>
            <li className="text-white/30 select-none">|</li>
            <li>
              <a
                href="https://www.mas.gov.sg/privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Privacy Statement
              </a>
            </li>
            <li className="text-white/30 select-none">|</li>
            <li>
              <a
                href="https://www.mas.gov.sg/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Terms of Use
              </a>
            </li>
            <li className="text-white/30 select-none">|</li>
            <li>
              <a
                href="https://eservices.mas.gov.sg"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                MAS API Gateway
              </a>
            </li>
          </ul>

          <div className="text-white/75 font-normal text-[11px] flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span>© 2026, Government of Singapore.</span>
            <span className="hidden sm:inline text-white/30">·</span>
            <span>Last updated on 05 Oct 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
