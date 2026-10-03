import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FEATURED_STACKS, TOOLS_REGISTRY } from '../constants';
import { ToolCard } from '../components/ToolCard';
import { Tool, ToolCategory } from '../types';
import { toolService } from '../services/toolService';
import { SubmitToolModal } from '../components/SubmitToolModal';
import { 
  Search, Layers, ArrowRight, Bot, X, ChevronDown, Filter, 
  ChevronLeft, ChevronRight, Plus 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { Robot3D, ParticleField, ArchitecturalGrid } from '../components/Robot3D';

import { PageWrapper } from '../components/PageWrapper';

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL or use defaults
  const searchTerm = searchParams.get('q') || '';
  const selectedCategory = (searchParams.get('category') as ToolCategory | 'All') || 'All';
  const sortBy = (searchParams.get('sort') as 'relevance' | 'rating' | 'reviews' | 'name') || 'relevance';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Full-Stack Server State
  const [tools, setTools] = useState<Tool[]>([]);
  const [totalTools, setTotalTools] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'ONLINE' | 'FALLBACK' | 'CONNECTING'>('CONNECTING');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const updateFilters = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== 'relevance') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset page to 1 on filter changes unless explicitly changing page
    if (!('page' in updates)) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityText = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const loadTools = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await toolService.fetchTools({
        q: searchTerm,
        category: selectedCategory,
        sort: sortBy,
        page: currentPage,
        limit: 9,
      });

      setTools(response.data);
      setTotalTools(response.meta.total);
      setTotalPages(response.meta.totalPages);
      setApiStatus(response.status === 'fallback' ? 'FALLBACK' : 'ONLINE');
    } catch (err) {
      console.error('Failed to load tools from full-stack API:', err);
      setApiStatus('FALLBACK');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  // Ping backend health
  useEffect(() => {
    toolService.checkServerHealth().then(res => {
      if (res.ok) {
        setApiLatency(res.latencyMs);
        setApiStatus('ONLINE');
      } else {
        setApiStatus('FALLBACK');
      }
    });
  }, []);

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() });
    const exploreEl = document.getElementById('explore-tools');
    if (exploreEl) {
      window.scrollTo({
        top: exploreEl.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-24 px-4 overflow-hidden">
        <motion.div 
          style={{ y: yBg }}
          className="absolute inset-0 bg-dark-950 z-0 pointer-events-none"
        />
        
        {/* Floating 3D Architectural Forge & Blueprint Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.65} />
            <directionalLight position={[8, 12, 6]} intensity={1.4} />
            <directionalLight position={[-8, -4, -4]} intensity={0.8} color="#FFD100" />
            <ArchitecturalGrid />
            <Robot3D />
            <ParticleField />
          </Canvas>
        </div>

        <motion.div 
          style={{ opacity: opacityText, scale: scaleText }}
          className="container mx-auto max-w-4xl relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block mb-6 px-4 py-1.5 bg-dark-800 border-2 border-jenga-500 text-jenga-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 justify-center w-fit mx-auto"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-jenga-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 bg-jenga-500"></span>
            </span>
            Updated Apr 20, 2026 • State of AI
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-8xl font-black text-jenga-500 uppercase tracking-tighter mb-6 leading-[0.9] md:leading-[0.85]"
          >
            The Ultimate <br />
            <span className="text-surface-text">AI Toolbox</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base md:text-xl font-mono text-surface-muted mb-12 max-w-2xl mx-auto uppercase tracking-widest leading-relaxed"
          >
            Stop guessing. Start building. The definitive map of the 2026 AI landscape, from Agentic LLMs to Sovereign AI.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-jenga-500 blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-surface-muted group-focus-within:text-jenga-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 md:py-5 bg-dark-800 border-2 border-dark-600 rounded-none text-surface-text placeholder-surface-muted focus:outline-none focus:ring-0 focus:border-jenga-500 transition-all text-sm md:text-lg font-mono uppercase tracking-widest"
                placeholder="Search 'Claude 4.7', 'DeepSeek', or 'Video Agents'..."
                value={searchTerm}
                onChange={(e) => {
                  updateFilters({ q: e.target.value });
                  if (e.target.value) {
                    const exploreSection = document.getElementById('explore-tools');
                    if (exploreSection) {
                      const rect = exploreSection.getBoundingClientRect();
                      if (rect.top > window.innerHeight / 2) {
                         window.scrollTo({
                           top: exploreSection.offsetTop - 72,
                           behavior: 'smooth'
                         });
                      }
                    }
                  }
                }}
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-dark-700 rounded-none text-xs text-surface-muted font-mono border border-dark-600 uppercase">
                  <kbd>⌘</kbd> <kbd>K</kbd>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories & Directory */}
      <section className="container mx-auto px-4" id="explore-tools">
        <div className="sticky top-[72px] z-40 bg-dark-950/95 backdrop-blur-md pt-6 pb-4 border-b-2 border-dark-700 mb-8 -mx-4 px-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black uppercase tracking-widest text-jenga-500 hidden lg:block">Explore Tools</h2>
                
                {/* Full-Stack API Status Pill */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-dark-900 border border-dark-600 text-[10px] font-mono uppercase tracking-widest">
                  <span className={`w-2 h-2 rounded-full ${apiStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-surface-muted">API:</span>
                  <span className={apiStatus === 'ONLINE' ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>
                    {apiStatus} {apiLatency ? `(${apiLatency}ms)` : ''}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full sm:w-auto px-3.5 py-2 bg-dark-800 hover:bg-jenga-500 hover:text-dark-950 text-jenga-500 text-xs font-black uppercase tracking-widest border-2 border-jenga-500 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Tool</span>
                </button>

                <div className="relative flex-1 w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-surface-muted" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 bg-dark-800 border-2 border-dark-600 rounded-none text-surface-text placeholder-surface-muted focus:outline-none focus:border-jenga-500 transition-colors text-sm font-mono uppercase tracking-widest"
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => updateFilters({ q: e.target.value })}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => updateFilters({ q: '' })}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-muted hover:text-jenga-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-surface-muted" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-8 py-2 bg-dark-800 border-2 border-dark-600 rounded-none text-surface-text focus:outline-none focus:border-jenga-500 transition-colors text-xs font-mono uppercase tracking-widest font-bold"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="rating">Sort: Top Rated</option>
                    <option value="reviews">Sort: Most Reviews</option>
                    <option value="name">Sort: A-Z</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-surface-muted" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {['All', ...Object.values(ToolCategory)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilters({ category: cat })}
                  className={`whitespace-nowrap px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors border-2 ${
                    selectedCategory === cat
                      ? 'bg-jenga-500 border-jenga-500 text-dark-950 font-black'
                      : 'bg-dark-800 border-dark-600 text-surface-text hover:border-jenga-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-dark-850 border-2 border-dark-700 animate-pulse p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-dark-700 w-1/3" />
                  <div className="h-6 bg-dark-700 w-2/3" />
                  <div className="h-3 bg-dark-700 w-full" />
                  <div className="h-3 bg-dark-700 w-4/5" />
                </div>
                <div className="h-10 bg-dark-700 w-full" />
              </div>
            ))}
          </div>
        ) : tools.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-surface-muted mb-4 px-1">
              <span>
                Showing <strong className="text-jenga-500">{((currentPage - 1) * 9) + 1}</strong> - <strong className="text-jenga-500">{Math.min(currentPage * 9, totalTools)}</strong> of <strong className="text-surface-text">{totalTools}</strong> tools
              </span>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2 font-mono">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-dark-800 border-2 border-dark-600 text-surface-text hover:border-jenga-500 hover:text-jenga-500 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 uppercase tracking-widest text-xs font-black"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 border-2 text-xs font-black uppercase tracking-widest transition-all ${
                      currentPage === pageNum
                        ? 'bg-jenga-500 border-jenga-500 text-dark-950 font-black shadow-[2px_2px_0px_0px_rgba(255,140,0,1)]'
                        : 'bg-dark-800 border-dark-600 text-surface-text hover:border-jenga-500 hover:text-jenga-500'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-dark-800 border-2 border-dark-600 text-surface-text hover:border-jenga-500 hover:text-jenga-500 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 uppercase tracking-widest text-xs font-black"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-dark-800 border-2 border-dashed border-dark-600 rounded-none">
             <p className="text-surface-muted text-lg font-mono uppercase tracking-widest">No tools found matching your criteria.</p>
             <button onClick={() => updateFilters({ q: '', category: 'All' })} className="mt-4 px-4 py-2 bg-dark-700 border border-dark-600 rounded-none text-jenga-500 hover:bg-jenga-500 hover:text-dark-950 hover:border-jenga-500 transition-colors font-mono uppercase tracking-widest text-xs font-black">Clear filters</button>
          </div>
        )}
      </section>

      {/* Tool Submission Modal */}
      <SubmitToolModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitted={() => loadTools()}
      />

      {/* AI Agents Spotlight Section */}
      <section className="container mx-auto px-4 pt-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b-2 border-dark-700 pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-widest text-surface-text mb-2 flex items-center gap-3">
              <Bot className="w-8 h-8 text-jenga-500" />
              Autonomous AI Agents
            </h2>
            <p className="text-surface-muted font-mono uppercase tracking-widest text-sm">The next frontier. Tools that plan, execute, and iterate on their own.</p>
          </div>
          <button 
            onClick={() => {
              updateFilters({ category: ToolCategory.AGENT });
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }} 
            className="text-jenga-500 hover:text-jenga-400 flex items-center gap-1 font-mono font-bold uppercase tracking-widest whitespace-nowrap text-sm"
          >
            View all agents <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS_REGISTRY.filter(t => t.category === ToolCategory.AGENT).slice(0, 4).map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
            >
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Stacks Section */}
      {FEATURED_STACKS.length > 0 && (
        <section className="bg-dark-900 py-16 border-y-4 border-dark-700 bg-diagonal-stripes">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10 border-b-2 border-dark-700 pb-4">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-widest text-surface-text mb-2">Community Stacks</h2>
                <p className="text-surface-muted font-mono uppercase tracking-widest text-sm">Battle-tested workflows curated by top creators.</p>
            </div>
            <Link to="/stacks" className="text-jenga-500 hover:text-jenga-400 flex items-center gap-1 font-mono font-bold uppercase tracking-widest text-sm">
                View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURED_STACKS.map((stack, index) => (
                <motion.div 
                  key={stack.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-dark-800 border-2 border-dark-600 rounded-none p-6 hover:border-jenga-500 transition-all hover:shadow-[4px_4px_0px_0px_rgba(255,140,0,1)] overflow-hidden"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-none border-2 border-dark-600 bg-dark-700 flex items-center justify-center text-surface-text font-black font-mono">
                            {stack.author.charAt(0)}
                        </div>
                        <div>
                            <p className="text-surface-text font-black uppercase tracking-widest text-sm">{stack.name}</p>
                            <p className="text-surface-muted text-xs font-mono uppercase tracking-widest">by {stack.author} • {stack.role}</p>
                        </div>
                    </div>
                    <p className="text-surface-muted text-sm mb-6 font-mono">{stack.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-4 h-4 text-jenga-500" />
                        <span className="text-xs text-surface-muted uppercase font-bold tracking-widest font-mono">Included Tools:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {stack.tools.map(toolId => {
                            const tool = TOOLS_REGISTRY.find(t => t.id === toolId);
                            return tool ? (
                                <span key={toolId} className="px-3 py-1 bg-dark-700 rounded-none border border-dark-600 text-xs text-surface-text font-mono tracking-widest uppercase">
                                    {tool.name}
                                </span>
                            ) : null;
                        })}
                    </div>
                    <Link to={`/stack/${stack.id}`} className="block w-full text-center bg-dark-700 hover:bg-jenga-500 hover:text-dark-950 text-surface-text py-3 rounded-none text-xs font-black uppercase tracking-widest transition-colors border border-dark-600 hover:border-jenga-500">
                        View Stack Details
                    </Link>
                </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}
    </div>
    </PageWrapper>
  );
};