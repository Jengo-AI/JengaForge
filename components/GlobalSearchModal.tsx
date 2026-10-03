import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Sparkles, Layers, ArrowRight, CornerDownLeft, 
  Clock, Flame, Star, Folder, Zap
} from 'lucide-react';
import { TOOLS_REGISTRY, FEATURED_STACKS } from '../constants';
import { ToolCategory } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = 'all' | 'tools' | 'workflows' | 'categories';

interface SearchResultItem {
  id: string;
  type: 'tool' | 'workflow' | 'category' | 'action';
  title: string;
  subtitle: string;
  category?: string;
  tags?: string[];
  meta?: string;
  url: string;
  badge?: string;
  rating?: number;
  highlightMatch?: string;
}

const RECENT_SEARCHES_KEY = 'jenga_recent_searches_v1';

const TRENDING_SEARCHES = [
  'Claude Sonnet 5.5',
  'Gemini 4 Argon',
  'GPT-6 Astra',
  'Autonomous Developer',
  'FLUX 3 Image',
  'DeepSeek-V4.1',
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['Gemini 3.1 Pro', 'Autonomous Developer', 'Cursor'];
    } catch {
      return ['Gemini 3.1 Pro', 'Autonomous Developer'];
    }
  });

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    setActiveTab('all');
    onClose();
  };

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Perform search across Tools, Stacks, Categories
  const searchResults: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results: SearchResultItem[] = [];

    if (!q) return [];

    // 1. Categories Search
    const allCategories = Object.values(ToolCategory);
    for (const cat of allCategories) {
      if (cat.toLowerCase().includes(q)) {
        const count = TOOLS_REGISTRY.filter(t => t.category === cat).length;
        results.push({
          id: `cat-${cat}`,
          type: 'category',
          title: cat,
          subtitle: `Browse all ${count} tools in ${cat}`,
          category: 'Category',
          meta: `${count} tools available`,
          url: `/?category=${encodeURIComponent(cat)}`,
          badge: 'CATEGORY',
        });
      }
    }

    // 2. Tools Search
    for (const tool of TOOLS_REGISTRY) {
      const nameMatch = tool.name.toLowerCase().includes(q);
      const descMatch = tool.description.toLowerCase().includes(q);
      const catMatch = tool.category.toLowerCase().includes(q);
      const tagMatch = tool.tags.some(t => t.toLowerCase().includes(q));
      const priceMatch = tool.pricing.toLowerCase() === q || (q === 'free' && tool.pricing === 'Free');

      if (nameMatch || descMatch || catMatch || tagMatch || priceMatch) {
        results.push({
          id: `tool-${tool.id}`,
          type: 'tool',
          title: tool.name,
          subtitle: tool.description,
          category: tool.category,
          tags: tool.tags,
          meta: `${tool.pricing} · ${tool.reviews.toLocaleString()} reviews`,
          url: `/tool/${tool.id}`,
          badge: tool.pricing.toUpperCase(),
          rating: tool.rating,
        });
      }
    }

    // 3. Featured Stacks / Workflows Search
    for (const stack of FEATURED_STACKS) {
      const nameMatch = stack.name.toLowerCase().includes(q);
      const descMatch = stack.description.toLowerCase().includes(q);
      const roleMatch = stack.role.toLowerCase().includes(q);
      const authorMatch = stack.author.toLowerCase().includes(q);
      const toolMatch = stack.tools.some(tid => tid.toLowerCase().includes(q));

      if (nameMatch || descMatch || roleMatch || authorMatch || toolMatch) {
        results.push({
          id: `stack-${stack.id}`,
          type: 'workflow',
          title: stack.name,
          subtitle: stack.description,
          category: stack.role,
          tags: stack.tools,
          meta: `Workflow · ${stack.tools.length} integrated tools · ${stack.likes} likes`,
          url: `/stack/${stack.id}`,
          badge: 'WORKFLOW',
        });
      }
    }

    // 4. Quick Actions
    if ('compare'.includes(q)) {
      results.push({
        id: 'action-compare',
        type: 'action',
        title: 'Compare AI Models & Tools',
        subtitle: 'Side-by-side radar specs, benchmarks, and pricing matrices',
        category: 'Action',
        url: '/compare',
        badge: 'UTILITY',
      });
    }
    if ('assistant'.includes(q) || 'ask'.includes(q) || 'chat'.includes(q)) {
      results.push({
        id: 'action-assistant',
        type: 'action',
        title: 'Ask AI Architecture Assistant',
        subtitle: 'Get automated stack recommendations and prompt architectures',
        category: 'Action',
        url: '/assistant',
        badge: 'AI AGENT',
      });
    }

    return results;
  }, [query]);

  // Filter results by active tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return searchResults;
    if (activeTab === 'tools') return searchResults.filter(r => r.type === 'tool');
    if (activeTab === 'workflows') return searchResults.filter(r => r.type === 'workflow');
    if (activeTab === 'categories') return searchResults.filter(r => r.type === 'category');
    return searchResults;
  }, [searchResults, activeTab]);

  // Derived safe selected index
  const safeSelectedIndex = filteredResults.length > 0
    ? Math.min(selectedIndex, filteredResults.length - 1)
    : 0;

  // Navigate to selected result
  const handleSelect = (item: SearchResultItem) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    handleClose();
    navigate(item.url);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[safeSelectedIndex]) {
        handleSelect(filteredResults[safeSelectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${safeSelectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [safeSelectedIndex]);

  // Quick categories list for empty state
  const quickCategories = [
    ToolCategory.LLM,
    ToolCategory.DEV_TOOLS,
    ToolCategory.IMAGE_GEN,
    ToolCategory.VIDEO_GEN,
    ToolCategory.PRODUCTIVITY,
    ToolCategory.PROMPT_ENGINEERING,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 px-4 pb-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Global Search AI Tools and Workflows"
        >
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm"
          />

          {/* Modal Panel (Brutalist High-Contrast Construction Aesthetic) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl bg-dark-900 border-2 border-dark-600 shadow-2xl overflow-hidden rounded-none z-10 flex flex-col max-h-[85vh]"
          >
            {/* Signature Top Hazard Stripe Accent */}
            <div className="h-1.5 w-full hazard-stripe" />

            {/* Search Input Bar */}
            <div className="flex items-center px-4 md:px-6 py-4 border-b border-dark-700 bg-dark-850 gap-3">
              <Search className="w-5 h-5 text-jenga-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search AI tools, workflows, categories, or tags (e.g., 'Gemini', 'Coding', 'Autonomous')..."
                className="w-full bg-transparent text-surface-text placeholder-surface-muted focus:outline-none text-base md:text-lg font-sans"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setSelectedIndex(0);
                  }}
                  className="p-1 hover:bg-dark-700 text-surface-muted hover:text-surface-text transition-colors cursor-pointer"
                  title="Clear query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-2 py-1 bg-dark-800 hover:bg-dark-700 text-surface-muted hover:text-surface-text text-[11px] font-mono uppercase tracking-widest border border-dark-700 transition-colors cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Filter Tabs Bar (When Query Exists) */}
            {query.trim().length > 0 && (
              <div className="flex items-center px-4 md:px-6 py-2 border-b border-dark-800 bg-dark-900 gap-2 overflow-x-auto text-xs font-mono">
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedIndex(0);
                  }}
                  className={`px-3 py-1 transition-colors uppercase tracking-wider ${
                    activeTab === 'all'
                      ? 'bg-jenga-500 text-dark-950 font-bold'
                      : 'text-surface-muted hover:text-surface-text bg-dark-800'
                  }`}
                >
                  All ({searchResults.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tools');
                    setSelectedIndex(0);
                  }}
                  className={`px-3 py-1 transition-colors uppercase tracking-wider ${
                    activeTab === 'tools'
                      ? 'bg-jenga-500 text-dark-950 font-bold'
                      : 'text-surface-muted hover:text-surface-text bg-dark-800'
                  }`}
                >
                  Tools ({searchResults.filter(r => r.type === 'tool').length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('workflows');
                    setSelectedIndex(0);
                  }}
                  className={`px-3 py-1 transition-colors uppercase tracking-wider ${
                    activeTab === 'workflows'
                      ? 'bg-jenga-500 text-dark-950 font-bold'
                      : 'text-surface-muted hover:text-surface-text bg-dark-800'
                  }`}
                >
                  Workflows ({searchResults.filter(r => r.type === 'workflow').length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('categories');
                    setSelectedIndex(0);
                  }}
                  className={`px-3 py-1 transition-colors uppercase tracking-wider ${
                    activeTab === 'categories'
                      ? 'bg-jenga-500 text-dark-950 font-bold'
                      : 'text-surface-muted hover:text-surface-text bg-dark-800'
                  }`}
                >
                  Categories ({searchResults.filter(r => r.type === 'category').length})
                </button>
              </div>
            )}

            {/* Content Area */}
            <div 
              ref={listRef}
              className="flex-1 overflow-y-auto divide-y divide-dark-800 max-h-[60vh] p-2 md:p-3"
            >
              {/* --- Case 1: Query is present and has results --- */}
              {query.trim().length > 0 && filteredResults.length > 0 && (
                <div className="space-y-1">
                  {filteredResults.map((item, index) => {
                    const isSelected = index === safeSelectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-index={index}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`group px-3 md:px-4 py-3 flex items-start justify-between gap-3 cursor-pointer transition-colors border ${
                          isSelected
                            ? 'bg-dark-800 border-jenga-500/80 text-surface-text'
                            : 'border-transparent hover:bg-dark-850 hover:border-dark-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Item Icon */}
                          <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 border mt-0.5 ${
                            isSelected
                              ? 'bg-jenga-500 border-jenga-400 text-dark-950'
                              : 'bg-dark-800 border-dark-700 text-jenga-500'
                          }`}>
                            {item.type === 'tool' && <Sparkles className="w-4 h-4" />}
                            {item.type === 'workflow' && <Layers className="w-4 h-4" />}
                            {item.type === 'category' && <Folder className="w-4 h-4" />}
                            {item.type === 'action' && <Zap className="w-4 h-4" />}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm md:text-base tracking-tight text-surface-text">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 border ${
                                  item.badge === 'FREE' 
                                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                                    : item.badge === 'WORKFLOW'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                    : 'bg-dark-800 text-jenga-400 border-dark-600'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                              {item.category && item.type !== 'category' && (
                                <span className="text-[11px] font-mono text-surface-muted">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-surface-muted line-clamp-1 mt-0.5">
                              {item.subtitle}
                            </p>

                            {/* Tags or metadata */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {item.tags.slice(0, 4).map(t => (
                                  <span key={t} className="text-[10px] font-mono text-surface-muted hover:text-jenga-400">
                                    #{t}
                                  </span>
                                ))}
                                {item.rating && (
                                  <span className="text-[10px] font-mono text-jenga-400 flex items-center gap-0.5 ml-auto">
                                    <Star className="w-2.5 h-2.5 fill-jenga-400 text-jenga-400" />
                                    {item.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Select indicator */}
                        <div className="hidden sm:flex items-center self-center shrink-0 text-surface-muted group-hover:text-jenga-400">
                          {isSelected ? (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-jenga-400">
                              <span>Select</span>
                              <CornerDownLeft className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- Case 2: Query is present but no results found --- */}
              {query.trim().length > 0 && filteredResults.length === 0 && (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 bg-dark-800 border border-dark-700 mx-auto flex items-center justify-center mb-3 text-surface-muted">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-surface-text">
                    No results for &ldquo;{query}&rdquo;
                  </h4>
                  <p className="text-xs text-surface-muted max-w-md mx-auto mt-1 mb-6">
                    We could not find any AI tools, workflows, or categories matching your query.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => {
                        setQuery('');
                        setActiveTab('all');
                      }}
                      className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-surface-text text-xs font-mono border border-dark-700 cursor-pointer"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate(`/assistant?q=${encodeURIComponent(query)}`);
                      }}
                      className="px-3 py-1.5 bg-jenga-500 hover:bg-jenga-400 text-dark-950 font-bold text-xs font-mono cursor-pointer flex items-center gap-1"
                    >
                      <span>Ask AI Architecture Assistant</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* --- Case 3: Empty Query (Trending, Recent, Quick Categories) --- */}
              {query.trim().length === 0 && (
                <div className="p-3 md:p-4 space-y-6">
                  {/* Recent Searches (if any) */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-surface-muted mb-2">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-jenga-500" />
                          Recent Searches
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="hover:text-jenga-400 text-[10px] cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map(term => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-2.5 py-1 bg-dark-800 hover:bg-dark-700 hover:border-jenga-500/60 border border-dark-700 text-xs font-mono text-surface-text transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-surface-muted mb-2">
                      <Flame className="w-3.5 h-3.5 text-jenga-500" />
                      Trending AI Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map(term => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 hover:border-jenga-500 border border-dark-700 text-xs text-surface-text transition-all cursor-pointer flex items-center gap-2 group"
                        >
                          <Search className="w-3 h-3 text-jenga-500 group-hover:scale-110 transition-transform" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Browse Categories Shortcuts */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-surface-muted mb-2">
                      <Folder className="w-3.5 h-3.5 text-jenga-500" />
                      Browse by Category
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {quickCategories.map(cat => {
                        const count = TOOLS_REGISTRY.filter(t => t.category === cat).length;
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              handleClose();
                              navigate(`/?category=${encodeURIComponent(cat)}`);
                            }}
                            className="px-3 py-2 bg-dark-800 hover:bg-dark-700 hover:border-jenga-500 border border-dark-700 text-left transition-all cursor-pointer group"
                          >
                            <div className="font-bold text-xs text-surface-text group-hover:text-jenga-400 truncate">
                              {cat}
                            </div>
                            <div className="text-[10px] font-mono text-surface-muted">
                              {count} frontier tools
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Feature Links */}
                  <div className="pt-2 border-t border-dark-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-surface-muted">
                    <button
                      onClick={() => {
                        handleClose();
                        navigate('/stacks');
                      }}
                      className="hover:text-jenga-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-jenga-500" />
                      <span>Explore Agentic Stacks</span>
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate('/compare');
                      }}
                      className="hover:text-jenga-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-jenga-500" />
                      <span>Compare AI Tools</span>
                    </button>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate('/assistant');
                      }}
                      className="hover:text-jenga-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-jenga-500" />
                      <span>Ask AI Assistant</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Info Bar */}
            <div className="px-4 md:px-6 py-2.5 bg-dark-950 border-t border-dark-800 flex items-center justify-between text-[11px] font-mono text-surface-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-700 text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-700 text-[10px]">↓</kbd>
                  <span className="ml-1 hidden sm:inline">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-700 text-[10px]">↵</kbd>
                  <span className="ml-1 hidden sm:inline">Select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-700 text-[10px]">esc</kbd>
                  <span className="ml-1 hidden sm:inline">Close</span>
                </span>
              </div>
              <div className="text-[10px] text-jenga-500 uppercase tracking-widest hidden md:inline">
                JengaForge Global Index · April 2026
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
