
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getToolById, TOOLS_REGISTRY } from '../constants';
import { Tool } from '../types';
import { toolService } from '../services/toolService';
import { 
  ArrowLeft, Star, Share2, Bookmark, CheckCircle, Zap, Shield, 
  ExternalLink, Sparkles, FolderPlus, Plus, X, ListPlus, Loader2,
  ThumbsUp, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComparisonChart } from '../components/ComparisonChart';
import { MiniToolCard } from '../components/MiniToolCard';
import { ReviewSection } from '../components/ReviewSection';
import { SocialShareModal } from '../components/SocialShareModal';
import { useAuth } from '../context/AuthContext';
import { PageWrapper } from '../components/PageWrapper';
import { stackService, UserStack } from '../services/stackService';

export const ToolDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const initialTool = useMemo(() => getToolById(id || '') || null, [id]);
  const [tool, setTool] = useState<Tool | null>(initialTool);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);
  const [upvotes, setUpvotes] = useState<number>(initialTool?.reviews || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialTool);

  const { user, toggleSavedTool, openAuthModal } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStackName, setNewStackName] = useState('');
  const [userStacks, setUserStacks] = useState<UserStack[]>([]);
  const [isCreatingStack, setIsCreatingStack] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    toolService.fetchToolById(id).then(res => {
      if (res.tool) {
        setTool(res.tool);
        setUpvotes(res.tool.reviews || 0);
      }
      if (res.related && res.related.length > 0) {
        setRelatedTools(res.related);
      } else if (res.tool) {
        setRelatedTools(
          TOOLS_REGISTRY.filter(t => t.id !== res.tool?.id && (t.category === res.tool?.category || t.tags.some(tag => res.tool?.tags.includes(tag)))).slice(0, 5)
        );
      }
      setIsLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} – AI Tool Specs & Workflow Stack | JengaForge`;
    }
    return () => {
      document.title = 'JengaForge – AI Tools Directory & Agentic Workflow Builder';
    };
  }, [tool]);

  useEffect(() => {
    if (user) {
      stackService.getUserStacks(user.id).then(setUserStacks);
    } else {
      setUserStacks([]);
    }
  }, [user]);

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const isSavedInArsenal = useMemo(() => {
    return user?.savedToolIds?.includes(tool?.id || '') || false;
  }, [user, tool]);

  const isSavedInAnyStack = useMemo(() => {
    return userStacks.some(stack => stack.toolIds.includes(tool?.id || ''));
  }, [userStacks, tool]);

  const handleUpvote = async () => {
    if (!tool || isUpvoting) return;
    setIsUpvoting(true);
    const res = await toolService.upvoteTool(tool.id);
    setIsUpvoting(false);
    if (res.status === 'success') {
      if (typeof res.upvotes === 'number') {
        setUpvotes(res.upvotes);
      } else {
        setUpvotes(prev => (hasUpvoted ? Math.max(0, prev - 1) : prev + 1));
      }
      setHasUpvoted(res.action === 'added');
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex flex-col items-center justify-center font-mono">
          <Loader2 className="w-8 h-8 text-jenga-500 animate-spin mb-4" />
          <p className="text-surface-muted uppercase tracking-widest text-xs">Querying full-stack tool record...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!tool) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <h2 className="text-2xl font-bold mb-4">Tool not found</h2>
        <Link to="/" className="text-jenga-500 hover:text-jenga-400 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
      </PageWrapper>
    );
  }

  const handleOpenModal = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveToStack = async (stackId: string) => {
    if (!user) return;
    
    const stack = userStacks.find(s => s.id === stackId);
    if (!stack) return;

    if (stack.toolIds.includes(tool.id)) {
       setSaveStatus(`Already in ${stack.name}`);
       setTimeout(() => {
         setIsModalOpen(false);
         setSaveStatus(null);
       }, 1200);
       return;
    }

    const updatedToolIds = [...stack.toolIds, tool.id];
    const success = await stackService.updateStackTools(stackId, updatedToolIds);
    if (success) {
      setUserStacks(userStacks.map(s => s.id === stackId ? { ...s, toolIds: updatedToolIds } : s));
      setSaveStatus(`Added to ${stack.name}`);
    } else {
      setSaveStatus("Failed to save");
    }
    
    setTimeout(() => {
      setIsModalOpen(false);
      setSaveStatus(null);
    }, 1200);
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackName.trim() || !user || isCreatingStack) return;
    
    setIsCreatingStack(true);
    try {
      const newStack = await stackService.createStack(user.id, newStackName, [tool.id]);
      setUserStacks([...userStacks, newStack]);
      setSaveStatus(`Created "${newStackName}" & Added Tool`);
    } catch (error: any) {
      setSaveStatus("Failed to create stack");
      console.error(error);
    } finally {
      setNewStackName('');
      setIsCreatingStack(false);
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveStatus(null);
      }, 1200);
    }
  };

  return (
    <PageWrapper>
      <div className="pb-20 relative">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[450px] lg:h-[450px] py-20 lg:py-0 w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-dark-950 z-10" />
        
        <div className="absolute top-6 left-4 md:left-8 z-20">
            <Link to="/" className="flex items-center space-x-2 text-surface-text hover:text-jenga-500 transition-colors bg-dark-800 px-4 py-2 rounded-none border-2 border-dark-600 font-mono uppercase tracking-widest text-xs">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Forge</span>
            </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full z-20 px-4 md:px-8 pb-10 container mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                    <div className="flex items-center space-x-3 mb-4">
                        <span className="bg-jenga-500 text-dark-950 text-[10px] font-black px-2.5 py-1 rounded-none uppercase tracking-widest">{tool.category}</span>
                        <span className="bg-dark-800 text-surface-text text-[10px] font-black px-2.5 py-1 rounded-none border-2 border-dark-600 uppercase tracking-widest">{tool.pricing}</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-jenga-500 mb-4 tracking-tighter leading-[0.9] lg:leading-[0.85] uppercase">{tool.name}</h1>
                    <div className="flex items-center space-x-4 md:space-x-6 text-surface-muted">
                        <div className="flex items-center space-x-1.5 text-amber-500">
                            <Star className="w-6 h-6 fill-current" />
                            <span className="font-black text-surface-text text-2xl tracking-tighter">{tool.rating}</span>
                        </div>
                        <div className="h-4 w-px bg-dark-700"></div>
                        <span className="text-sm font-bold uppercase tracking-widest text-surface-muted">{tool.reviews.toLocaleString()} Reviews</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Live Upvote Button */}
                        <button 
                            onClick={handleUpvote}
                            disabled={isUpvoting}
                            title="Upvote this tool in the ecosystem"
                            className={`flex items-center space-x-2 px-4 md:px-5 py-4 md:py-5 font-black text-sm md:text-base transition-all border-2 rounded-none font-mono uppercase tracking-widest ${
                              hasUpvoted
                                ? 'bg-jenga-500 border-jenga-500 text-dark-950 font-black'
                                : 'bg-dark-800 border-dark-600 text-surface-text hover:border-jenga-500 hover:text-jenga-500'
                            }`}
                        >
                            <ThumbsUp className={`w-5 h-5 ${hasUpvoted ? 'fill-dark-950' : ''}`} />
                            <span>{upvotes} Upvotes</span>
                        </button>

                        {/* Share Social Card & Link Button */}
                        <button 
                            onClick={() => setIsShareModalOpen(true)}
                            title="Share social card and link"
                            className="flex items-center space-x-2 px-4 py-4 md:py-5 bg-dark-800 border-2 border-dark-600 text-surface-text hover:text-jenga-500 hover:border-jenga-500 transition-all rounded-none cursor-pointer"
                        >
                            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline">Share Card</span>
                        </button>
                        
                        <a 
                          href={tool.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 md:space-x-3 px-6 md:px-8 py-4 md:py-5 font-black text-lg md:text-xl bg-surface-text text-dark-950 hover:bg-jenga-500 transition-all hover:shadow-[4px_4px_0px_0px_rgba(255,140,0,1)] group rounded-none border-2 border-dark-950 font-mono uppercase tracking-widest text-xs md:text-sm"
                        >
                           <span>Launch Tool</span>
                           <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>

                        <button 
                            onClick={() => toggleSavedTool(tool.id)}
                            className={`flex items-center space-x-2 md:space-x-3 px-6 md:px-8 py-4 md:py-5 font-black text-lg md:text-xl transition-all border-2 rounded-none font-mono uppercase tracking-widest text-xs md:text-sm ${
                                isSavedInArsenal 
                                ? 'bg-dark-800 border-jenga-500 text-jenga-500 hover:bg-dark-700' 
                                : 'bg-dark-800 border-dark-600 text-surface-text hover:border-jenga-500 hover:text-jenga-500'
                            }`}
                        >
                            {isSavedInArsenal ? <CheckCircle className="w-5 h-5 md:w-6 md:h-6" /> : <Bookmark className="w-5 h-5 md:w-6 md:h-6" />}
                            <span>{isSavedInArsenal ? 'In Arsenal' : 'Save to Arsenal'}</span>
                        </button>
                    </div>

                    {/* New Prominent Save to Stack Button */}
                    <button 
                        onClick={handleOpenModal}
                        className={`flex items-center justify-center space-x-3 md:space-x-4 px-6 md:px-10 py-5 md:py-6 font-black text-lg md:text-2xl transition-all border-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 rounded-none font-mono uppercase tracking-widest text-xs md:text-sm ${
                            isSavedInAnyStack 
                            ? 'bg-dark-800 border-jenga-500 text-jenga-500 hover:bg-dark-700' 
                            : 'bg-jenga-500 border-jenga-500 text-dark-950 hover:bg-jenga-400 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]'
                        }`}
                    >
                        <FolderPlus className="w-8 h-8" />
                        <span>{isSavedInAnyStack ? 'Add to Another Stack' : 'Build Custom Workflow Stack'}</span>
                    </button>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-12">
            {tool.status === 'Deprecated' && (
              <div className="bg-amber-950/40 border-2 border-amber-600/80 p-5 rounded-none flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-300 uppercase font-mono text-sm tracking-wider">
                    Deprecation Notice · Historical Archive
                  </h3>
                  <p className="text-xs md:text-sm text-amber-200/90 mt-1 font-mono leading-relaxed">
                    {tool.deprecatedReason || "This tool or model prototype has been discontinued or superseded. Not recommended for new production workflows."}
                  </p>
                </div>
              </div>
            )}

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-jenga-500 rounded-none"></div>
                    <h2 className="text-3xl font-black text-surface-text tracking-widest uppercase">The Lowdown</h2>
                </div>
                <p className="text-surface-muted text-xl leading-relaxed font-mono">{tool.description}</p>
                
                <div className="mt-6">
                    <a 
                        href={tool.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-jenga-500 hover:text-jenga-400 font-mono text-sm uppercase tracking-widest transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {tool.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    {tool.tags.map(tag => (
                        <span key={tag} className="px-4 py-2 bg-dark-800 rounded-none border-2 border-dark-600 text-xs font-black text-surface-text uppercase tracking-widest hover:text-jenga-500 hover:border-jenga-500 transition-all cursor-default font-mono">
                            #{tag}
                        </span>
                    ))}
                </div>
            </section>
            
            <section className="bg-dark-800 rounded-none p-10 border-2 border-dark-600 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest">Spec Benchmark</h2>
                    <span className="px-3 py-1 bg-dark-700 text-jenga-500 text-[10px] font-black rounded-none border border-dark-600 tracking-widest uppercase font-mono">Verified 2026</span>
                 </div>
                 <ComparisonChart tools={[tool]} />
            </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
            <div className="bg-dark-800 border-2 border-dark-600 rounded-none p-8 shadow-[4px_4px_0px_0px_rgba(255,140,0,1)] relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-32 h-32 text-jenga-500" />
                </div>
                <h3 className="font-black text-xl text-surface-text mb-8 flex items-center gap-3 uppercase tracking-widest">
                    <Zap className="text-jenga-500 w-6 h-6" />
                    Forge Metrics
                </h3>
                <div className="space-y-6">
                    {Object.entries(tool.specs).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-surface-muted font-bold uppercase tracking-widest font-mono">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-surface-text font-mono font-black">{value}%</span>
                            </div>
                            <div className="w-full h-2 bg-dark-700 rounded-none overflow-hidden">
                                <div className="h-full bg-jenga-500" style={{ width: `${value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-dark-800 border-2 border-dark-600 rounded-none p-8 relative shadow-[4px_4px_0px_0px_rgba(255,140,0,1)]">
                <div className="absolute top-0 left-0 w-full h-2 bg-jenga-500"></div>
                <h3 className="font-black text-xl text-surface-text mb-4 flex items-center gap-3 uppercase tracking-widest">
                    <Shield className="text-green-500 w-6 h-6" />
                    Agent's Choice
                </h3>
                <p className="text-surface-muted text-sm italic leading-relaxed font-mono">
                    "{tool.name} is a high-impact asset for {tool.category.toLowerCase()} workflows. Our March 2026 stress tests confirm its raw power is among the top 5% in the repository."
                </p>
            </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="container mx-auto px-4">
        <ReviewSection toolId={tool.id} />
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="container mx-auto px-4 mt-16 pt-16 border-t-4 border-dark-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-4xl font-black text-surface-text flex items-center gap-4 tracking-widest uppercase">
                        <Sparkles className="w-8 h-8 text-jenga-400" />
                        Common Pairings
                    </h2>
                </div>
            </div>
            
            <div className="relative group">
                <div className="flex overflow-x-auto gap-8 pb-12 no-scrollbar scroll-smooth snap-x snap-mandatory">
                    {relatedTools.map(relatedTool => (
                        <div key={relatedTool.id} className="flex-none w-72 md:w-80 snap-start">
                            <MiniToolCard tool={relatedTool} />
                        </div>
                    ))}
                    <div className="flex-none w-1 h-1" />
                </div>
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-dark-950 to-transparent pointer-events-none z-20" />
            </div>
        </section>
      )}

      {/* Save to Stack Modal */}
      <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setIsModalOpen(false)} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-dark-800 border-4 border-dark-600 w-[95%] sm:w-full max-w-lg rounded-none shadow-[16px_16px_0px_0px_rgba(255,140,0,1)] overflow-hidden"
          >
            {saveStatus ? (
              <div className="p-10 sm:p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-dark-700 border-2 border-green-500 rounded-none flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-surface-text uppercase tracking-widest">{saveStatus}</p>
              </div>
            ) : (
              <>
                <div className="p-6 md:p-10 border-b-4 border-dark-600 flex items-center justify-between bg-dark-900">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-jenga-500 rounded-none border-2 border-dark-950">
                        <ListPlus className="text-dark-950 w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-black text-surface-text tracking-widest uppercase">Save to Stack</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-surface-muted hover:text-jenga-500 transition-colors">
                    <X className="w-6 h-6 md:w-8 md:h-8" />
                  </button>
                </div>
                
                <div className="p-6 md:p-10 space-y-8 md:space-y-10">
                  <div className="space-y-4">
                    <p className="text-xs font-black text-surface-muted uppercase tracking-widest ml-1 font-mono">Existing Stacks</p>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {userStacks.map(stack => (
                        <button 
                          key={stack.id}
                          onClick={() => handleSaveToStack(stack.id)}
                          className="w-full flex items-center justify-between p-5 bg-dark-900 border-2 border-dark-600 hover:border-jenga-500 hover:bg-dark-700 transition-all text-left group rounded-none"
                        >
                          <div>
                            <p className="text-lg font-black text-surface-text group-hover:text-jenga-500 transition-colors uppercase tracking-widest">{stack.name}</p>
                            <p className="text-surface-muted text-xs font-bold uppercase tracking-wider font-mono">{stack.toolIds.length} Tools Connected</p>
                          </div>
                          <Plus className="w-5 h-5 text-surface-muted group-hover:text-jenga-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t-4 border-dark-600">
                    <p className="text-xs font-black text-surface-muted uppercase tracking-widest ml-1 font-mono">Create New Stack</p>
                    <form onSubmit={handleCreateAndAdd} className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={newStackName}
                        onChange={(e) => setNewStackName(e.target.value)}
                        placeholder="e.g. Video Production Hub"
                        className="flex-grow bg-dark-900 border-2 border-dark-600 px-4 md:px-6 py-3 md:py-4 text-surface-text focus:outline-none focus:border-jenga-500 transition-all font-bold placeholder:text-surface-muted rounded-none font-mono text-sm"
                      />
                      <button 
                        type="submit"
                        disabled={!newStackName.trim() || isCreatingStack}
                        className="bg-jenga-500 hover:bg-jenga-400 disabled:opacity-50 text-dark-950 px-6 py-3 transition-all border-2 border-dark-950 active:scale-90 rounded-none flex items-center justify-center min-w-[72px]"
                      >
                        {isCreatingStack ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-8 h-8" />}
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {tool && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`${tool.name} — AI Tool Review & Specs`}
          description={tool.description}
          category={tool.category}
          tags={tool.tags}
        />
      )}
    </div>
    </PageWrapper>
  );
};
