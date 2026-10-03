import React from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { Shield, EyeOff, Lock, Database } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-dark-900 border-4 border-dark-600 text-jenga-500 mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-surface-text mb-4 uppercase tracking-widest">Privacy Policy</h1>
          <p className="text-surface-muted text-lg font-mono">Last updated: March 14, 2026</p>
        </div>

        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 flex items-center gap-3 mt-0 uppercase tracking-widest">
              <EyeOff className="w-6 h-6 text-jenga-400" />
              1. Information Collection
            </h2>
            <p className="text-surface-muted leading-relaxed mb-4 font-mono">
              JengaForge is committed to protecting your privacy. We collect information to provide better services to our users. The types of information we collect include:
            </p>
            <ul className="space-y-3 text-surface-muted mb-0 font-mono">
              <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and profile picture.</li>
              <li><strong>Usage Data:</strong> We automatically collect information about how you interact with our Service, including IP addresses, browser types, and pages visited.</li>
              <li><strong>User Content:</strong> Information you provide when creating stacks, leaving reviews, or interacting with the AI assistant.</li>
            </ul>
          </div>

          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 flex items-center gap-3 mt-0 uppercase tracking-widest">
              <Database className="w-6 h-6 text-jenga-400" />
              2. Use of Information
            </h2>
            <p className="text-surface-muted leading-relaxed mb-4 font-mono">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-muted mb-0 font-mono">
              <li>To provide, maintain, and improve our Service.</li>
              <li>To personalize your experience and deliver relevant content.</li>
              <li>To communicate with you regarding updates, security alerts, and support messages.</li>
              <li>To monitor and analyze trends, usage, and activities in connection with our Service.</li>
            </ul>
          </div>

          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 flex items-center gap-3 mt-0 uppercase tracking-widest">
              <Lock className="w-6 h-6 text-jenga-400" />
              3. Data Security & Protection
            </h2>
            <p className="text-surface-muted leading-relaxed mb-4 font-mono">
              We implement robust security measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            <div className="p-4 bg-dark-900 rounded-none border-2 border-dark-600">
              <h3 className="text-lg font-black text-surface-text mb-2 mt-0 uppercase tracking-widest">Security Enforcement</h3>
              <p className="text-surface-muted text-sm mb-0 font-mono">
                In accordance with our Terms of Service, any unauthorized attempts to access our databases, scrape user information, or circumvent our security protocols are strictly prohibited. We employ advanced monitoring systems to detect such activities. Violators will face immediate account termination and potential legal action to protect our users' data.
              </p>
            </div>
          </div>

          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 mt-0 uppercase tracking-widest">4. Sharing of Information</h2>
            <p className="text-surface-muted leading-relaxed mb-4 font-mono">
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-surface-muted mb-0 font-mono">
              <li>With trusted third-party service providers who assist us in operating our website or conducting our business, so long as those parties agree to keep this information confidential.</li>
              <li>When we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.</li>
            </ul>
          </div>

          <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
            <h2 className="text-2xl font-black text-surface-text mb-4 mt-0 uppercase tracking-widest">5. Your Rights</h2>
            <p className="text-surface-muted leading-relaxed mb-0 font-mono">
              You have the right to access, update, or delete your personal information at any time. You can manage your account settings or contact our support team for assistance. You may also opt-out of receiving promotional communications from us.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
