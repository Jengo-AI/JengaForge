import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Share2, Globe, ExternalLink } from 'lucide-react';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  description = 'Discover, stack, and automate with frontier 2026 AI tools on JengaForge.',
  url,
  category = 'AI TOOL',
  tags = [],
  imageUrl = '/social-card.png',
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<'markdown' | 'html' | null>(null);
  const [activeTab, setActiveTab] = useState<'share' | 'preview' | 'embed'>('share');

  // Compute canonical share URL
  const resolvedUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://jengaforge.ai');
  const shareText = `${title} — on JengaForge (Jengo.AI Suite)`;
  const hashtagList = tags.length > 0
    ? tags.slice(0, 3).map(t => t.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean).join(',')
    : 'AI,JengaForge,AgenticAI';

  // Social share intent links (using standard anchor tags, avoiding window.open)
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resolvedUrl)}&hashtags=${encodeURIComponent(hashtagList)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resolvedUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}: ${resolvedUrl}`)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(resolvedUrl)}&text=${encodeURIComponent(shareText)}`;
  const redditShareUrl = `https://reddit.com/submit?url=${encodeURIComponent(resolvedUrl)}&title=${encodeURIComponent(shareText)}`;

  const markdownSnippet = `[![${title} on JengaForge](https://img.shields.io/badge/JengaForge-${encodeURIComponent(title.replace(/-/g, '_'))}-FFD100?style=flat-square&logo=google)](${resolvedUrl})`;
  const htmlEmbedSnippet = `<a href="${resolvedUrl}" target="_blank" rel="noopener noreferrer"><img src="${imageUrl}" alt="${title} on JengaForge" width="600" /></a>`;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(resolvedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      // Fallback
    }
  };

  const handleCopySnippet = async (type: 'markdown' | 'html') => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(type === 'markdown' ? markdownSnippet : htmlEmbedSnippet);
        setCopiedSnippet(type);
        setTimeout(() => setCopiedSnippet(null), 2400);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: resolvedUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark-950/85 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-dark-900 border-2 border-dark-600 shadow-[8px_8px_0px_0px_rgba(255,209,0,1)] z-10 overflow-hidden text-surface-text"
          >
            {/* Top Signature Hazard Stripe Rule */}
            <div className="hazard-stripe h-2.5 w-full border-b border-dark-950" />

            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-dark-700 flex items-start justify-between bg-dark-850">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-jenga-500 text-dark-950 font-mono text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">
                    SOCIAL SHARE CARD
                  </span>
                  <span className="text-surface-muted text-[10px] font-mono uppercase tracking-widest">
                    JENGO.AI SUITE
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-surface-text">
                  Share to Social Networks
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-2 border border-dark-600 bg-dark-800 hover:border-jenga-500 hover:text-jenga-500 transition-colors cursor-pointer text-surface-muted"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex border-b border-dark-700 bg-dark-900 font-mono text-xs uppercase tracking-widest">
              <button
                onClick={() => setActiveTab('share')}
                className={`flex-1 py-3 px-4 text-center font-bold border-b-2 transition-colors ${
                  activeTab === 'share'
                    ? 'border-jenga-500 text-jenga-500 bg-dark-800'
                    : 'border-transparent text-surface-muted hover:text-surface-text'
                }`}
              >
                Channels & Link
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-3 px-4 text-center font-bold border-b-2 transition-colors ${
                  activeTab === 'preview'
                    ? 'border-jenga-500 text-jenga-500 bg-dark-800'
                    : 'border-transparent text-surface-muted hover:text-surface-text'
                }`}
              >
                Card Preview
              </button>
              <button
                onClick={() => setActiveTab('embed')}
                className={`flex-1 py-3 px-4 text-center font-bold border-b-2 transition-colors ${
                  activeTab === 'embed'
                    ? 'border-jenga-500 text-jenga-500 bg-dark-800'
                    : 'border-transparent text-surface-muted hover:text-surface-text'
                }`}
              >
                Embed & Badge
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {activeTab === 'share' && (
                <>
                  {/* Share Link Input with Copy Action */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-surface-muted mb-2 font-bold">
                      Direct Share Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-dark-950 border-2 border-dark-600 px-3 py-2.5 font-mono text-xs text-surface-text truncate select-all">
                        {resolvedUrl}
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className={`flex items-center gap-2 px-4 py-2.5 font-mono uppercase tracking-widest text-xs font-black transition-all border-2 ${
                          copied
                            ? 'bg-green-500 border-green-500 text-dark-950 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)]'
                            : 'bg-jenga-500 border-jenga-500 text-dark-950 hover:bg-yellow-400 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,209,0,1)]'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* One-Click Social Network Channels */}
                  <div>
                    <span className="block text-xs font-mono uppercase tracking-widest text-surface-muted mb-3 font-bold">
                      Share via Platform
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs uppercase tracking-wider">
                      {/* X (formerly Twitter) */}
                      <a
                        href={twitterShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-dark-800 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          <span className="font-bold">X / Twitter</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      </a>

                      {/* LinkedIn */}
                      <a
                        href={linkedinShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-dark-800 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          <span className="font-bold">LinkedIn</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={whatsappShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-dark-800 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 fill-current text-green-400" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.004.57 2.016.84 2.806.841h.005c3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.77-5.772-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                          </svg>
                          <span className="font-bold">WhatsApp</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      </a>

                      {/* Telegram */}
                      <a
                        href={telegramShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-dark-800 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 fill-current text-sky-400" viewBox="0 0 24 24">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z" />
                          </svg>
                          <span className="font-bold">Telegram</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      </a>

                      {/* Reddit */}
                      <a
                        href={redditShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-dark-800 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 fill-current text-orange-500" viewBox="0 0 24 24">
                            <path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm7.135 13.916a2.036 2.036 0 0 1-.72 2.038c-.37.318-.87.498-1.415.498a4.935 4.935 0 0 1-2.99-1.01 7.28 7.28 0 0 1-4.02 0 4.928 4.928 0 0 1-2.99 1.01 2.036 2.036 0 0 1-1.415-.498 2.035 2.035 0 0 1-.72-2.038c.08-.415.28-.79.57-1.077a2.6 2.6 0 0 1-.06-.575c0-2.316 2.59-4.195 5.795-4.195.42 0 .835.032 1.235.093l.8-2.61a.48.48 0 0 1 .45-.34l2.585.39a1.44 1.44 0 1 1 1.25.96l-2.22-.335-.63 2.06c1.39.56 2.32 1.55 2.32 2.677a2.6 2.6 0 0 1-.06.575 2.07 2.07 0 0 1 .57 1.077z" />
                          </svg>
                          <span className="font-bold">Reddit</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      </a>

                      {/* Native System Share Sheet */}
                      <button
                        onClick={handleNativeShare}
                        className="flex items-center justify-between p-3 bg-dark-800 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-jenga-500" />
                          <span className="font-bold">Device Share</span>
                        </div>
                        <Globe className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-surface-muted">
                    <span>Social Card Graphic (1200 × 630)</span>
                    <span className="text-jenga-500 font-bold">Standard OpenGraph</span>
                  </div>

                  {/* Rendered Social Card Mockup */}
                  <div className="border-2 border-dark-600 bg-dark-950 p-4 relative overflow-hidden group">
                    <div className="hazard-stripe h-1.5 w-full mb-3" />
                    
                    {/* Media card banner */}
                    <div className="relative aspect-[1.91/1] w-full bg-dark-900 border border-dark-700 overflow-hidden mb-3">
                      <img
                        src={imageUrl}
                        alt="Social Card Visual"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to vector SVG if png fails
                          (e.target as HTMLImageElement).src = '/social-card.svg';
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-dark-950/90 border border-jenga-500 px-2 py-0.5 text-[9px] font-mono font-bold text-jenga-500 uppercase tracking-widest">
                        JENGO.AI // {category}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-surface-muted">
                          jengaforge.ai
                        </span>
                        <span className="text-dark-600">•</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-jenga-500">
                          Bunifu Suite
                        </span>
                      </div>
                      <h4 className="font-black text-base text-surface-text uppercase tracking-tight line-clamp-1">
                        {title}
                      </h4>
                      <p className="text-xs text-surface-muted font-mono line-clamp-2">
                        {description}
                      </p>
                      {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 bg-dark-900 border border-dark-700 text-surface-muted uppercase">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-surface-muted pt-2 border-t border-dark-800">
                    <span>Includes: OpenGraph, Twitter Cards, Schema.org</span>
                    <a
                      href={imageUrl}
                      download="jengaforge-social-card.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-jenga-500 hover:text-yellow-400 inline-flex items-center gap-1 uppercase tracking-wider font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Image Asset
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'embed' && (
                <div className="space-y-4">
                  {/* Markdown Badge Snippet */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono uppercase tracking-widest text-surface-muted font-bold">
                        Markdown Badge (for README.md)
                      </span>
                      <button
                        onClick={() => handleCopySnippet('markdown')}
                        className="text-xs font-mono text-jenga-500 hover:text-yellow-400 uppercase tracking-widest font-bold flex items-center gap-1"
                      >
                        {copiedSnippet === 'markdown' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedSnippet === 'markdown' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 bg-dark-950 border border-dark-700 text-surface-text font-mono text-xs overflow-x-auto select-all">
                      {markdownSnippet}
                    </pre>
                  </div>

                  {/* HTML Embed Snippet */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono uppercase tracking-widest text-surface-muted font-bold">
                        HTML Link with Social Banner
                      </span>
                      <button
                        onClick={() => handleCopySnippet('html')}
                        className="text-xs font-mono text-jenga-500 hover:text-yellow-400 uppercase tracking-widest font-bold flex items-center gap-1"
                      >
                        {copiedSnippet === 'html' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedSnippet === 'html' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 bg-dark-950 border border-dark-700 text-surface-text font-mono text-xs overflow-x-auto select-all">
                      {htmlEmbedSnippet}
                    </pre>
                  </div>

                  <div className="p-3 bg-dark-850 border border-dark-700 text-xs font-mono text-surface-muted">
                    <p className="font-bold text-surface-text uppercase mb-1">
                      Swahili "Jenga" Developer Directives
                    </p>
                    <p>
                      Easily embed this tool or stack in your project documentation, hackathon repositories, or blog posts with automated referral tracking.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-dark-700 bg-dark-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-surface-muted uppercase tracking-widest">
                  Live Social Meta Ready
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-dark-750 hover:bg-dark-700 border border-dark-600 text-surface-text font-mono uppercase tracking-widest text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
