import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Copy, Check, ExternalLink, 
  Search, Filter, ShieldCheck, Zap, Sliders, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/PageWrapper';
import { STARTER_STACKS, getToolById } from '../constants';
import { StarterStack } from '../types';
import { stackService } from '../services/stackService';
import { useAuth } from '../context/AuthContext';
import { AIWorkflowSuggester } from '../components/AIWorkflowSuggester';

export const StarterStacks: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('All');
  const [cloningStackId, setCloningStackId] = useState<string | null>(null);
  const [clonedSuccessId, setClonedSuccessId] = useState<string | null>(null);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Customization modal state
  const [customizingStack, setCustomizingStack] = useState<StarterStack | null>(null);
  const [customizedName, setCustomizedName] = useState('');
  const [customizedTools, setCustomizedTools] = useState<string[]>([]);
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  // Extract available workflow phases
  const allPhases = ['All', ...Array.from(new Set(STARTER_STACKS.map(s => s.workflowPhase)))];

  const filteredStacks = STARTER_STACKS.filter(stack => {
    const matchesSearch = !searchQuery || 
      stack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.targetObjective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPhase = selectedPhase === 'All' || stack.workflowPhase === selectedPhase;
    return matchesSearch && matchesPhase;
  });

  const handleInstantClone = async (stack: StarterStack) => {
    if (!user) {
      openAuthModal();
      return;
    }

    setCloningStackId(stack.id);
    setCloneError(null);

    try {
      const clonedStack = await stackService.createStack(
        `${stack.name} (My Stack)`,
        stack.tools
      );

      setClonedSuccessId(stack.id);
      setTimeout(() => {
        navigate(`/stack/${clonedStack.id}`);
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to clone starter stack.';
      setCloneError(msg);
    } finally {
      setCloningStackId(null);
    }
  };

  const openCustomizeModal = (stack: StarterStack) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setCustomizingStack(stack);
    setCustomizedName(`${stack.name} (Custom)`);
    setCustomizedTools([...stack.tools]);
  };

  const handleSaveCustomized = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizingStack || !user || isSavingCustom) return;

    if (!customizedName.trim()) {
      setCloneError('Stack name is required.');
      return;
    }

    if (customizedTools.length === 0) {
      setCloneError('Stack must contain at least one tool.');
      return;
    }

    setIsSavingCustom(true);
    setCloneError(null);

    try {
      const newStack = await stackService.createStack(
        customizedName.trim(),
        customizedTools
      );
      setCustomizingStack(null);
      navigate(`/stack/${newStack.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save customized stack.';
      setCloneError(msg);
    } finally {
      setIsSavingCustom(false);
    }
  };

  const toggleToolSelection = (toolId: string) => {
    setCustomizedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12 pb-32">
        {/* Header Section */}
        <header className="mb-14">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark-800 border-2 border-dark-600 text-jenga-500 text-[11px] font-black uppercase tracking-widest font-mono">
              <Sparkles className="w-3.5 h-3.5 text-jenga-500" />
              Jengo · Workflow Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-dark-900 border border-dark-700 text-surface-muted text-[11px] font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Repository Verified
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-dark-700 pb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-surface-text tracking-widest uppercase">
                Starter Stacks
              </h1>
              <p className="text-surface-muted mt-3 text-lg md:text-xl font-mono max-w-3xl leading-relaxed">
                Pre-built, battle-tested AI workflows synthesized by <span className="text-jenga-400 font-bold">Jengo</span>. Clone in one click to deploy into your workspace or customize every toolchain component.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/stacks"
                className="px-5 py-3 bg-dark-800 hover:bg-dark-700 text-surface-text border-2 border-dark-600 hover:border-jenga-500 font-black text-xs font-mono uppercase tracking-widest transition-all"
              >
                My Stacks Workspace
              </Link>
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {cloneError && (
          <div className="mb-8 p-4 bg-red-950/60 border-2 border-red-500 text-red-400 text-xs font-mono flex items-center justify-between gap-3">
            <span>{cloneError}</span>
            <button 
              onClick={() => setCloneError(null)}
              className="text-red-300 hover:text-white uppercase font-black"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-dark-900 border-2 border-dark-600 p-4 md:p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-surface-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows, roles, keywords..."
              className="w-full bg-dark-950 border border-dark-700 focus:border-jenga-500 pl-10 pr-4 py-2.5 text-xs font-mono text-surface-text placeholder:text-surface-muted outline-none transition-all rounded-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-wider text-surface-muted shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-jenga-500" /> Phase:
            </span>
            {allPhases.map((phase) => (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                  selectedPhase === phase
                    ? 'bg-jenga-500 text-dark-950 font-black border-dark-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-dark-800 text-surface-muted hover:text-surface-text border-dark-700 hover:border-dark-500'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        {/* Starter Stacks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {filteredStacks.map((stack, idx) => {
            const isCloning = cloningStackId === stack.id;
            const isCloned = clonedSuccessId === stack.id;

            return (
              <motion.article
                key={stack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-dark-900 border-4 border-dark-600 rounded-none overflow-hidden flex flex-col justify-between relative group hover:border-jenga-500 transition-all shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]"
              >
                {/* Hazard Stripe Accent Header */}
                <div className="h-1.5 hazard-stripe w-full"></div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {stack.badge && (
                          <span className="px-2.5 py-0.5 bg-jenga-500 text-dark-950 font-black text-[10px] uppercase tracking-widest font-mono border border-dark-950">
                            {stack.badge}
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-dark-800 text-surface-muted text-[10px] uppercase tracking-wider font-mono border border-dark-700">
                          {stack.workflowPhase}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-jenga-400 font-bold uppercase">
                        ★ {stack.likes} Clones
                      </span>
                    </div>

                    {/* Stack Title & Tagline */}
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-surface-text group-hover:text-jenga-400 transition-colors">
                      {stack.name}
                    </h2>
                    {stack.tagline && (
                      <p className="text-xs font-mono text-jenga-500 uppercase tracking-wide font-bold mt-1">
                        ↳ {stack.tagline}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-sm font-mono text-surface-muted mt-3 leading-relaxed">
                      {stack.description}
                    </p>

                    {/* Target Objective */}
                    <div className="my-4 p-3 bg-dark-950 border border-dark-700">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-surface-muted block">
                        Target Objective:
                      </span>
                      <p className="text-xs font-mono text-surface-text font-bold mt-0.5">
                        {stack.targetObjective}
                      </p>
                    </div>

                    {/* Step-by-Step Architectural Pipeline */}
                    <div className="space-y-2.5 mt-5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-surface-muted block font-black">
                        Pipeline Stages ({stack.steps.length} Integrated Tools):
                      </span>

                      <div className="space-y-2">
                        {stack.steps.map((step, sIdx) => {
                          const toolRecord = getToolById(step.toolId);
                          return (
                            <div
                              key={sIdx}
                              className="bg-dark-950 border border-dark-700 p-2.5 flex items-start justify-between gap-3 text-xs font-mono hover:border-dark-500 transition-colors"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="w-5 h-5 bg-dark-800 text-jenga-500 font-bold text-[10px] flex items-center justify-center border border-dark-600 shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/tool/${step.toolId}`}
                                      className="font-black text-surface-text hover:text-jenga-500 uppercase flex items-center gap-1 transition-colors"
                                    >
                                      <span>{toolRecord?.name || step.toolId}</span>
                                      <ExternalLink className="w-2.5 h-2.5 text-surface-muted" />
                                    </Link>
                                    <span className="text-[9px] text-surface-muted uppercase px-1 bg-dark-900 border border-dark-800">
                                      {step.phase}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-surface-muted mt-0.5 leading-snug">
                                    {step.action}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-6 mt-6 border-t-2 border-dark-700 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleInstantClone(stack)}
                      disabled={isCloning || isCloned}
                      className="w-full sm:flex-1 py-3.5 px-4 bg-jenga-500 hover:bg-jenga-400 disabled:opacity-50 text-dark-950 font-black text-xs font-mono uppercase tracking-widest transition-all border-2 border-dark-950 flex items-center justify-center gap-2 cursor-pointer rounded-none active:scale-95"
                    >
                      {isCloning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cloning Workflow...
                        </>
                      ) : isCloned ? (
                        <>
                          <Check className="w-4 h-4 text-dark-950" />
                          Cloned! Launching...
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Clone To My Workspace
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => openCustomizeModal(stack)}
                      className="w-full sm:w-auto py-3.5 px-4 bg-dark-800 hover:bg-dark-700 text-surface-text hover:text-jenga-400 border-2 border-dark-600 hover:border-jenga-500 font-black text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-none"
                    >
                      <Sliders className="w-3.5 h-3.5 text-jenga-500" />
                      <span>Customize</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Embedded Interactive Synthesizer Section */}
        <section className="mt-20">
          <div className="mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-jenga-500 font-bold block">
              Custom Architectural Synthesis
            </span>
            <h2 className="text-3xl font-black uppercase tracking-widest text-surface-text mt-1">
              Need a Bespoke Workflow? Let Jengo Build It.
            </h2>
            <p className="text-surface-muted text-sm font-mono mt-1">
              If the pre-built starter stacks don't match your exact use-case, prompt Jengo to synthesize a tailored toolchain.
            </p>
          </div>

          <AIWorkflowSuggester />
        </section>

        {/* Customize Modal */}
        <AnimatePresence>
          {customizingStack && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-dark-900 border-4 border-dark-600 w-full max-w-2xl p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(255,140,0,1)] relative overflow-hidden"
              >
                <div className="h-1.5 hazard-stripe absolute top-0 left-0 right-0"></div>

                <div className="flex items-center justify-between border-b-2 border-dark-700 pb-4 mb-6 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-jenga-500"></span>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-surface-text">
                      Customize Workflow
                    </h3>
                  </div>
                  <button
                    onClick={() => setCustomizingStack(null)}
                    className="text-surface-muted hover:text-jenga-500 text-sm font-mono uppercase font-black"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleSaveCustomized} className="space-y-6">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-surface-muted block mb-2">
                      Custom Stack Name:
                    </label>
                    <input
                      type="text"
                      value={customizedName}
                      onChange={(e) => setCustomizedName(e.target.value)}
                      className="w-full bg-dark-950 border-2 border-dark-600 focus:border-jenga-500 p-3 text-sm font-mono text-surface-text outline-none rounded-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-surface-muted block mb-2">
                      Toggle Integrated Tools in This Stack ({customizedTools.length} selected):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                      {customizingStack.tools.map((toolId) => {
                        const tool = getToolById(toolId);
                        const isSelected = customizedTools.includes(toolId);
                        return (
                          <button
                            key={toolId}
                            type="button"
                            onClick={() => toggleToolSelection(toolId)}
                            className={`p-3 text-left border text-xs font-mono transition-all flex items-center justify-between cursor-pointer rounded-none ${
                              isSelected
                                ? 'bg-dark-800 border-jenga-500 text-surface-text'
                                : 'bg-dark-950 border-dark-700 text-surface-muted opacity-60'
                            }`}
                          >
                            <div>
                              <span className="font-black uppercase block">
                                {tool?.name || toolId}
                              </span>
                              <span className="text-[10px] text-surface-muted">
                                {tool?.category}
                              </span>
                            </div>
                            <span className={`w-4 h-4 border flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-jenga-500 border-dark-950 text-dark-950 font-black' : 'border-dark-600'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-dark-700 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomizingStack(null)}
                      className="px-4 py-2.5 bg-dark-800 text-surface-muted hover:text-surface-text border border-dark-600 text-xs font-mono uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCustom || customizedTools.length === 0 || !customizedName.trim()}
                      className="px-6 py-2.5 bg-jenga-500 hover:bg-jenga-400 disabled:opacity-50 text-dark-950 font-black text-xs font-mono uppercase tracking-widest border border-dark-950 flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingCustom ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          Deploy Customized Stack
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
};
