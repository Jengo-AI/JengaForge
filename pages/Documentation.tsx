import React from 'react';
import { PageWrapper } from '../components/PageWrapper';
import { BookOpen, Compass, ShieldCheck, Box } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
        <div className="border-b-4 border-dark-700 pb-8">
          <h1 className="text-4xl md:text-6xl font-black text-surface-text uppercase tracking-widest flex items-center gap-4 mb-4">
            <BookOpen className="w-10 h-10 md:w-16 md:h-16 text-jenga-500" />
            Platform Docs
          </h1>
          <p className="text-surface-muted font-mono uppercase tracking-widest text-jenga-500">JengaForge Manual / Version 4.1 (October 2026)</p>
        </div>

        <section className="space-y-8">
          <div className="bg-dark-800 border-l-4 border-jenga-500 p-8">
            <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-4 flex items-center gap-3">
              <Compass className="w-6 h-6 text-jenga-500" />
              1. Navigating the Forge
            </h2>
            <div className="font-mono text-surface-muted space-y-4 text-sm leading-relaxed">
              <p>JengaForge tracks the shift from standalone chatbots to autonomous Agentic Systems. Updated for the October 2026 landscape, the directory indexes frontier LLMs, coding IDEs, image/video pipelines, and active deprecation notices.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-surface-text font-bold">Search &amp; Filtering:</strong> Use the directory filters or press <code className="text-jenga-500">⌘K</code> / <code className="text-jenga-500">/</code> for the Global Command Palette. URL query parameters preserve exact category, search, sort, and page states for bookmarking and sharing.</li>
                <li><strong className="text-surface-text font-bold">Compare Tools:</strong> Open the Comparison Matrix to benchmark up to 5 tools simultaneously across Power, Ease of Use, Community Adoption, Cost Efficiency, and Ecosystem Integration—or freeze a baseline tool in the sticky left column.</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800 border-l-4 border-jenga-500 p-8">
            <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-4 flex items-center gap-3">
              <Box className="w-6 h-6 text-jenga-500" />
              2. Building Custom Stacks
            </h2>
            <div className="font-mono text-surface-muted space-y-4 text-sm leading-relaxed">
              <p>Individual tools achieve basic tasks; coordinated stacks power repeatable engineering workflows. Stacks combine canonical tools into shareable architectures.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sign in with Google to save tools to your Arsenal and build custom stacks persisted to Cloud Firestore across sessions and devices.</li>
                <li>Synthesize end-to-end toolchains using Jengo&apos;s AI Workflow Architect and save verified pipelines directly to your workspace.</li>
                <li>Share custom stacks via public URLs, social cards, or one-click cloning.</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800 border-l-4 border-jenga-500 p-8">
            <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-jenga-500" />
              3. Server-Side AI Proxy &amp; Firestore Hardening
            </h2>
            <div className="font-mono text-surface-muted space-y-4 text-sm leading-relaxed">
               <p>JengaForge isolates sensitive API credentials strictly on the Express backend. Assistant queries (<code className="text-jenga-500">/api/chat</code>) and workflow synthesis (<code className="text-jenga-500">/api/workflow/suggest</code>) are proxied server-side through Gemini 4 (<code className="text-jenga-500">gemini-4-hydrogen</code>) with rate limiting, Helmet CSP headers, and CORS origin enforcement.</p>
               <p>Database writes for user profiles, stacks, reviews, tool submissions, and upvotes are validated by hardened Firestore Security Rules enforcing owner-only mutations, server timestamps, SSRF URL filtering, and canonical tool ID checks.</p>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};
