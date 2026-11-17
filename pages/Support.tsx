import React from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/PageWrapper';
import { Mail, LifeBuoy, MessageSquare, AlertTriangle } from 'lucide-react';

export const Support: React.FC = () => {
  const faqs = [
    {
      q: "How does the AI Assistant and Workflow Architect work?",
      a: "JengaAgent and the AI Workflow Architect route requests securely through the backend Express proxy (/api/chat and /api/workflow/suggest) powered by Gemini 4. No manual browser API key setup is required."
    },
    {
      q: "My app says 'Firebase Configuration Failed'. What do I do?",
      a: "Strict privacy extensions or adblockers can block Firebase Auth or Firestore connections. Try allowing this application domain and reloading the page."
    },
    {
      q: "Can I submit a new AI tool to the registry?",
      a: "Yes. Click the 'Submit Tool' button in the directory header on the homepage to queue a model, agent, or developer tool for review. You can track your submissions inside your Profile."
    },
    {
      q: "Where are my custom stacks and saved tools stored?",
      a: "Authenticated accounts persist custom stacks, saved tools, upvotes, and reviews directly in Cloud Firestore so your arsenal syncs across sessions and devices."
    }
  ];

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16">
        {/* Header */}
        <div className="border-b-4 border-dark-700 pb-8">
          <h1 className="text-4xl md:text-6xl font-black text-jenga-500 uppercase tracking-widest flex items-center gap-4 mb-4">
            <LifeBuoy className="w-10 h-10 md:w-16 md:h-16" />
            Support Desk
          </h1>
          <p className="text-surface-muted font-mono uppercase tracking-widest">Get unblocked. Keep building.</p>
        </div>

        {/* Contact Channels */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-dark-800 border-2 border-dark-600 p-8 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] hover:border-jenga-500 transition-colors">
            <Mail className="w-8 h-8 text-jenga-500 mb-6" />
            <h3 className="text-xl font-black text-surface-text uppercase tracking-widest mb-2">Email Support</h3>
            <p className="text-surface-muted font-mono mb-6 text-sm">Response roughly within 24 hours. Priority goes to verified bug reports.</p>
            <a href="mailto:support@jengaforge.com" className="bg-jenga-500 text-dark-950 font-black px-6 py-3 uppercase tracking-widest font-mono text-sm inline-block hover:bg-jenga-400 transition-colors">Contact Us</a>
          </div>

          <div className="bg-dark-800 border-2 border-dark-600 p-8 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] hover:border-jenga-500 transition-colors">
            <MessageSquare className="w-8 h-8 text-jenga-500 mb-6" />
            <h3 className="text-xl font-black text-surface-text uppercase tracking-widest mb-2">Interactive Assistant</h3>
            <p className="text-surface-muted font-mono mb-6 text-sm">Need stack advice or workflow architecture guidance right away? Ask JengaAgent directly.</p>
            <Link to="/assistant" className="bg-dark-700 border border-dark-600 text-jenga-500 font-black px-6 py-3 uppercase tracking-widest font-mono text-sm inline-block hover:border-jenga-500 transition-colors">Open JengaAgent</Link>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-8 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-jenga-500" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-dark-800 border-[1px] border-dark-600 p-6 rounded-none">
                <h4 className="text-jenga-500 font-bold uppercase tracking-widest mb-2 font-mono text-sm">{faq.q}</h4>
                <p className="text-surface-muted font-mono leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
};
