import React from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { ShieldAlert, Scale, FileText, AlertTriangle } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-dark-900 border-4 border-dark-600 text-jenga-500 mb-6">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-surface-text mb-4 uppercase tracking-widest">Terms of Service</h1>
          <p className="text-surface-muted text-lg font-mono">Last updated: March 14, 2026</p>
        </div>

        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 flex items-center gap-3 mt-0 uppercase tracking-widest">
              <FileText className="w-6 h-6 text-jenga-400" />
              1. Acceptance of Terms
            </h2>
            <p className="text-surface-muted leading-relaxed font-mono">
              By accessing, browsing, or using the JengaForge platform ("Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the Service. These terms constitute a legally binding agreement between you and JengaForge.
            </p>
          </div>

          <div className="bg-dark-900 border-4 border-red-500 rounded-none p-8 mb-10 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 flex items-center gap-3 mt-0 uppercase tracking-widest">
              <ShieldAlert className="w-6 h-6 text-red-400" />
              2. Prohibited Activities & Security
            </h2>
            <p className="text-surface-muted leading-relaxed mb-4 font-mono">
              The security and integrity of JengaForge are paramount. You agree not to engage in any of the following prohibited activities. Violation of these terms will result in immediate termination of your account and potential legal action.
            </p>
            <ul className="space-y-3 text-surface-muted font-mono">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Unauthorized Scraping:</strong> Automated data collection, scraping, crawling, or spidering of any part of the Service is strictly prohibited without express written consent from JengaForge.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Vulnerability Testing:</strong> You may not probe, scan, or test the vulnerability of any JengaForge system, network, or application. Penetration testing is strictly forbidden unless authorized under a formal bug bounty program.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Security Circumvention:</strong> Attempting to bypass, circumvent, or defeat any security measures, authentication protocols, or access controls is a severe violation.</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span><strong>Reverse Engineering:</strong> Decompiling, reverse engineering, or disassembling any software comprising or in any way making up a part of the Service.</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-dark-800 rounded-none border-2 border-red-500">
              <p className="text-red-400 text-sm font-black m-0 uppercase tracking-widest">
                <strong>Legal Repercussions:</strong> JengaForge actively monitors for unauthorized access and malicious activity. We reserve the right to investigate violations and cooperate with law enforcement authorities to prosecute users who violate these security provisions to the fullest extent of the law.
              </p>
            </div>
          </div>

          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 mt-0 uppercase tracking-widest">3. User Content and Conduct</h2>
            <p className="text-surface-muted leading-relaxed mb-4 font-mono">
              You are solely responsible for any content you post, upload, or otherwise make available on the Service. You agree not to post content that is:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-muted mb-0 font-mono">
              <li>Illegal, harmful, threatening, abusive, or harassing.</li>
              <li>Infringing on any patent, trademark, trade secret, copyright, or other proprietary rights.</li>
              <li>Containing software viruses or any other computer code designed to interrupt or destroy functionality.</li>
            </ul>
          </div>

          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 mt-0 uppercase tracking-widest">4. Intellectual Property</h2>
            <p className="text-surface-muted leading-relaxed mb-0 font-mono">
              The Service and its original content, features, and functionality are owned by JengaForge and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
          </div>

          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 mt-0 uppercase tracking-widest">5. Limitation of Liability</h2>
            <p className="text-surface-muted leading-relaxed mb-0 font-mono">
              In no event shall JengaForge, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
