import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Layers, Loader2, CheckCircle2, 
  AlertCircle, Plus, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { suggestAIWorkflow } from '../services/geminiService';
import { WorkflowSuggestion } from '../types';
import { getToolById } from '../constants';
import { stackService } from '../services/stackService';
import { useAuth } from '../context/AuthContext';

interface AIWorkflowSuggesterProps {
  onStackCreated?: () => void;
  className?: string;
}

const PRESET_WORKFLOW_PROMPTS = [
  "Autonomous full-stack web application with code agent, live database, and reactive styling",
  "African commerce and fintech platform with M-Pesa mobile money integration and local logistics",
  "High-velocity creative content engine: cinematic video, voice generation, and 4K visual art",
  "Frontier multi-modal reasoning pipeline for research synthesis, document audit, and fast coding",
];

export const AIWorkflowSuggester: React.FC<AIWorkflowSuggesterProps> = ({ onStackCreated, className = "" }) => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<WorkflowSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Saving workflow as a stack
  const [isSavingStack, setIsSavingStack] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const handleGenerateWorkflow = async (customPrompt?: string) => {
    const textToSubmit = (customPrompt || prompt).trim();
    if (!textToSubmit || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSavedSuccessMsg(null);

    const res = await suggestAIWorkflow(textToSubmit);
    setIsLoading(false);

    if (res.status === 'success' && res.data) {
      setSuggestion(res.data);
    } else {
      setError(res.message || 'Unable to synthesize workflow. Please try again.');
    }
  };

  const handleSaveAsStack = async () => {
    if (!suggestion) return;

    if (!user) {
      openAuthModal();
      return;
    }

    setIsSavingStack(true);
    try {
      const canonicalIds = suggestion.canonicalToolIds || suggestion.steps.map(s => s.toolId);
      const newStack = await stackService.createStack(
        suggestion.workflowTitle || 'AI Synthesized Stack',
        canonicalIds
      );

      setSavedSuccessMsg(`Workflow successfully saved as "${newStack.name}" in your workspace!`);
      if (onStackCreated) {
        onStackCreated();
      }
      setTimeout(() => {
        navigate(`/stack/${newStack.id}`);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save workflow as stack.';
      setError(msg);
    } finally {
      setIsSavingStack(false);
    }
  };

  return (
    <div className={`bg-dark-900 border-4 border-dark-600 rounded-none p-6 md:p-8 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] ${className}`}>
      {/* Top Banner Hazard Stripe Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 hazard-stripe"></div>

      {/* Header Lockup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-dark-800 border border-dark-600 text-jenga-500 text-[11px] font-black uppercase tracking-widest font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Workflow Architect · Bunifu Suite
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-surface-text flex items-center gap-2">
            <span>Jengo</span>
            <span className="w-2.5 h-2.5 bg-jenga-500 inline-block align-middle"></span>
          </h2>
          <p className="text-surface-muted text-sm font-mono mt-1">
            Swahili: <span className="text-jenga-400 font-bold">to build, to construct</span>. Formulates end-to-end multi-step pipelines <span className="text-surface-text font-bold">strictly using repository models & tools</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-jenga-400 bg-dark-950 px-2.5 py-1 border border-dark-700">
            <ShieldCheck className="w-3.5 h-3.5 text-jenga-500" />
            Repo-Constrained
          </span>
        </div>
      </div>

      {/* Preset Quick Prompts */}
      <div className="mb-4">
        <label className="text-[11px] font-mono uppercase tracking-wider text-surface-muted block mb-2">
          Or select an architectural target:
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_WORKFLOW_PROMPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(preset);
                handleGenerateWorkflow(preset);
              }}
              disabled={isLoading}
              className="text-left text-xs font-mono px-3 py-1.5 bg-dark-800 hover:bg-dark-700 hover:border-jenga-500 border border-dark-700 text-surface-text transition-all truncate max-w-full cursor-pointer disabled:opacity-50"
            >
              ⚡ {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerateWorkflow();
        }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you are building (e.g., 'Autonomous developer stack for high-throughput API')..."
            className="flex-1 bg-dark-950 border-2 border-dark-600 focus:border-jenga-500 px-4 py-3 text-surface-text text-sm font-mono placeholder:text-surface-muted outline-none transition-all rounded-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="bg-jenga-500 hover:bg-jenga-400 disabled:opacity-50 text-dark-950 px-6 py-3 font-black text-sm uppercase tracking-widest transition-all border-2 border-dark-950 shrink-0 flex items-center justify-center gap-2 cursor-pointer rounded-none active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Synthesize Workflow
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Feedback */}
      {error && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/50 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Feedback */}
      {savedSuccessMsg && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Suggested Workflow Display */}
      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-8 border-t-2 border-dark-700 pt-6 space-y-6"
          >
            {/* Meta Information Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-950 p-4 border border-dark-700">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-jenga-500 font-bold block">
                  {suggestion.estimatedComplexity} Complexity
                </span>
                <h3 className="text-xl font-black uppercase tracking-wider text-surface-text mt-0.5">
                  {suggestion.workflowTitle}
                </h3>
                <p className="text-xs font-mono text-surface-muted mt-1">
                  Objective: {suggestion.targetObjective}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAsStack}
                  disabled={isSavingStack}
                  className="px-4 py-2 bg-jenga-500 hover:bg-jenga-400 text-dark-950 font-black text-xs font-mono uppercase tracking-wider transition-all border border-dark-950 flex items-center gap-1.5 cursor-pointer rounded-none disabled:opacity-50"
                >
                  {isSavingStack ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Save As Stack
                </button>
              </div>
            </div>

            {/* Workflow Pipeline Steps */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-surface-muted font-mono flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-jenga-500" />
                Step-by-Step Architecture Pipeline ({suggestion.steps.length} Steps)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestion.steps.map((step) => {
                  const toolRecord = getToolById(step.toolId);
                  return (
                    <div
                      key={step.stepNumber}
                      className="bg-dark-950 border-2 border-dark-700 p-4 flex flex-col justify-between relative group hover:border-jenga-500 transition-all rounded-none"
                    >
                      <div>
                        {/* Step Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="w-6 h-6 bg-dark-800 text-jenga-500 font-mono font-bold text-xs flex items-center justify-center border border-dark-600">
                            {step.stepNumber}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-surface-muted bg-dark-900 px-2 py-0.5 border border-dark-800 truncate max-w-[150px]">
                            {step.phase}
                          </span>
                        </div>

                        {/* Tool Identifier */}
                        <div className="mb-2">
                          <Link
                            to={`/tool/${step.toolId}`}
                            className="text-base font-black uppercase tracking-wider text-surface-text hover:text-jenga-500 flex items-center gap-1.5 transition-colors"
                          >
                            <span>{step.toolName}</span>
                            <ExternalLink className="w-3 h-3 text-surface-muted group-hover:text-jenga-500" />
                          </Link>
                          {toolRecord && (
                            <span className="text-[10px] font-mono text-surface-muted uppercase">
                              {toolRecord.category} · {toolRecord.pricing}
                            </span>
                          )}
                        </div>

                        {/* Role Description */}
                        <p className="text-xs text-surface-text font-mono leading-relaxed mb-3">
                          {step.roleDescription}
                        </p>
                      </div>

                      {/* Rationale Footnote */}
                      <div className="pt-2 border-t border-dark-800">
                        <span className="text-[10px] font-mono text-jenga-400 block italic">
                          Why: {step.rationale}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pipeline Summary */}
            <div className="bg-dark-800 p-4 border border-dark-600 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-jenga-500 mt-1.5 shrink-0"></span>
              <p className="text-xs font-mono text-surface-text leading-relaxed">
                <strong className="text-jenga-400 uppercase font-black mr-1">Pipeline Synergy:</strong>
                {suggestion.summary}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
