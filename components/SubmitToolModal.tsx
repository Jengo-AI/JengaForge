import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PlusCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ToolCategory } from '../types';
import { toolService } from '../services/toolService';
import { useAuth } from '../context/AuthContext';

interface SubmitToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const SubmitToolModal: React.FC<SubmitToolModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ToolCategory>(ToolCategory.AGENT);
  const [pricing, setPricing] = useState<'Free' | 'Freemium' | 'Paid' | 'Enterprise'>('Freemium');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Tool name is required.');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (!websiteUrl.trim() || !websiteUrl.startsWith('http')) {
      setError('A valid website URL starting with http:// or https:// is required.');
      return;
    }

    setLoading(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const result = await toolService.submitTool({
      name: name.trim(),
      category,
      pricing,
      description: description.trim(),
      websiteUrl: websiteUrl.trim(),
      tags: tags.length > 0 ? tags : [category.toLowerCase(), 'ai-stack'],
      submittedBy: user?.name || 'Anonymous Creator',
    });

    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        setSuccessMessage(null);
        setName('');
        setDescription('');
        setWebsiteUrl('');
        setTagsInput('');
        onClose();
        if (onSubmitted) onSubmitted();
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-dark-900 border-4 border-dark-600 w-full max-w-xl p-6 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-dark-700 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-jenga-500"></span>
              <h2 className="text-xl font-black uppercase tracking-widest text-surface-text">
                Submit AI Tool
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-surface-muted hover:text-jenga-500 p-1 border border-dark-600 hover:border-jenga-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs font-mono text-surface-muted mb-4 uppercase tracking-widest">
            Publish your model, agent, or developer framework to the JengaForge ecosystem.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border-2 border-red-600 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-950/80 border-2 border-green-500 text-green-400 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-surface-text font-black uppercase tracking-widest mb-1">
                Tool Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. DeepSeek-V4, Cursor Agent, Flux 2"
                className="w-full bg-dark-800 border-2 border-dark-600 px-3 py-2 text-surface-text focus:outline-none focus:border-jenga-500 uppercase tracking-widest"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-surface-text font-black uppercase tracking-widest mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ToolCategory)}
                  className="w-full bg-dark-800 border-2 border-dark-600 px-3 py-2 text-surface-text focus:outline-none focus:border-jenga-500 uppercase tracking-widest font-bold"
                >
                  {Object.values(ToolCategory).map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-surface-text font-black uppercase tracking-widest mb-1">
                  Pricing Model
                </label>
                <select
                  value={pricing}
                  onChange={e => setPricing(e.target.value as any)}
                  className="w-full bg-dark-800 border-2 border-dark-600 px-3 py-2 text-surface-text focus:outline-none focus:border-jenga-500 uppercase tracking-widest font-bold"
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-surface-text font-black uppercase tracking-widest mb-1">
                Website / Repository URL *
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com or https://github.com/..."
                className="w-full bg-dark-800 border-2 border-dark-600 px-3 py-2 text-surface-text focus:outline-none focus:border-jenga-500 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-surface-text font-black uppercase tracking-widest mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="What does this AI tool do, what are its unique benchmarks, and who is it designed for?"
                className="w-full bg-dark-800 border-2 border-dark-600 p-2.5 text-surface-text focus:outline-none focus:border-jenga-500 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-surface-text font-black uppercase tracking-widest mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="llm, coding, autonomous, open-weights"
                className="w-full bg-dark-800 border-2 border-dark-600 px-3 py-2 text-surface-text focus:outline-none focus:border-jenga-500 uppercase tracking-widest text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-dark-800 text-surface-muted hover:text-surface-text border border-dark-600 uppercase tracking-widest text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-jenga-500 text-dark-950 font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-jenga-400 disabled:opacity-50 transition-colors border-2 border-jenga-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Tool</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
