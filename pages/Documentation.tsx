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
          <p className="text-surface-muted font-mono uppercase tracking-widest text-jenga-500">JengaForge Manual / Version 2026.4</p>
        </div>

        <section className="space-y-8">
          <div className="bg-dark-800 border-l-4 border-jenga-500 p-8">
            <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-4 flex items-center gap-3">
              <Compass className="w-6 h-6 text-jenga-500" />
              1. Navigating the Forge
            </h2>
            <div className="font-mono text-surface-muted space-y-4 text-sm leading-relaxed">
              <p>JengaForge tracks the shift from traditional software to autonomous Agentic Systems. As of April 2026, the ecosystem is rapidly evolving. The homepage acts as your core directory map.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-surface-text font-bold">Search & Filtering:</strong> Use the massive directory search bar. Our query parameters route the exact filter combinations via URL, meaning you can bookmark or share any specific filter state.</li>
                <li><strong className="text-surface-text font-bold">Compare Tools:</strong> Click 'Compare' to enter the benchmark arena. We track raw power, cost efficiency, ease of use, community scale, and integration capabilities on a standard 0-100 radar metric.</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800 border-l-4 border-jenga-500 p-8">
            <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-4 flex items-center gap-3">
              <Box className="w-6 h-6 text-jenga-500" />
              2. Building Custom Stacks
            </h2>
            <div className="font-mono text-surface-muted space-y-4 text-sm leading-relaxed">
              <p>Individual tools achieve basic goals. Workflows generate systemic value. A "Stack" is a combination of AI tools meant to work in harmony.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create unlimited curated lists on the tool details page.</li>
                <li>Your stacks are mapped to your local device memory constraints.</li>
                <li>Community Top Rated Stacks appear on the homepage natively.</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800 border-l-4 border-jenga-500 p-8">
            <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-jenga-500" />
              3. Privacy & BYOK Doctrine
            </h2>
            <div className="font-mono text-surface-muted space-y-4 text-sm leading-relaxed">
               <p>We respect the sovereignty of your tokens. JengaForge embraces a "Bring Your Own Key" (BYOK) architecture for all embedded LLM processing.</p>
               <p>Your Google Gemini API Key required for our internal AI Assistant is <strong>never transmitted to our servers</strong>. It runs locally via Web SDKs and is kept entirely client-side using native modern browser local storage encryption layers.</p>
               <p className="text-jenga-500 font-bold mt-4">Always rotate your API keys regularly from your Google Cloud Console.</p>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};
