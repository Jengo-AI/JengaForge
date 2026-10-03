
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getToolById } from '../constants';
import { Layers, Trash2, ArrowRight, FolderOpen, Sparkles, Zap, Plus, ChevronRight, X, Loader2, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageWrapper } from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';
import { stackService, UserStack } from '../services/stackService';

export const Stacks: React.FC = () => {
  const { user, isAuthReady, openAuthModal } = useAuth();
  const [stacks, setStacks] = useState<UserStack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStackName, setNewStackName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;
    
    if (user) {
      setIsLoading(true);
      stackService.getUserStacks(user.id).then(fetchedStacks => {
        setStacks(fetchedStacks);
        setIsLoading(false);
      });
    } else {
      setStacks([]);
      setIsLoading(false);
    }
  }, [user, isAuthReady]);

  const deleteStack = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stack?')) {
      const success = await stackService.deleteStack(id);
      if (success) {
        setStacks(stacks.filter(s => s.id !== id));
      }
    }
  };

  const removeToolFromStack = async (stackId: string, toolId: string) => {
    const stack = stacks.find(s => s.id === stackId);
    if (!stack) return;
    
    const newToolIds = stack.toolIds.filter(tid => tid !== toolId);
    const success = await stackService.updateStackTools(stackId, newToolIds);
    if (success) {
      setStacks(stacks.map(s => s.id === stackId ? { ...s, toolIds: newToolIds } : s));
    }
  };

  const handleCreateStack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStackName.trim() || !user || isCreating) return;
    
    setIsCreating(true);
    try {
      const newStack = await stackService.createStack(user.id, newStackName);
      setStacks([...stacks, newStack]);
      setNewStackName('');
      setIsCreateModalOpen(false);
    } catch (error: any) {
      alert(`Failed to create stack. Error: ${error?.message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthReady || isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <Loader2 className="w-12 h-12 text-jenga-500 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-dark-800 border-4 border-dark-600 rounded-none flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-surface-muted" />
        </div>
        <h1 className="text-4xl font-black text-surface-text mb-4 uppercase tracking-widest">Authentication Required</h1>
        <p className="text-surface-muted text-lg mb-10 max-w-md mx-auto font-mono">
            Stacks are individualized structures physically bound to your identity. Log in to construct your arsenal.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={openAuthModal}
            className="inline-flex items-center gap-2 bg-jenga-500 hover:bg-jenga-400 text-dark-950 px-8 py-4 font-black text-xl transition-all border-4 border-dark-950 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] rounded-none uppercase tracking-widest"
          >
              Sign In <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      </PageWrapper>
    );
  }

  if (stacks.length === 0) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-dark-800 border-4 border-dark-600 rounded-none flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10 text-surface-muted" />
        </div>
        <h1 className="text-4xl font-black text-surface-text mb-4 uppercase tracking-widest">No Stacks Yet</h1>
        <p className="text-surface-muted text-lg mb-10 max-w-md mx-auto font-mono">
            You haven't built any intelligence stacks. Head to the forge to start organizing your AI arsenal.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-jenga-500 hover:bg-jenga-400 text-dark-950 px-8 py-4 font-black text-xl transition-all border-4 border-dark-950 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] rounded-none uppercase tracking-widest"
          >
              Create Stack <Plus className="w-6 h-6" />
          </button>
          <Link to="/" className="inline-flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-surface-text px-8 py-4 font-black text-xl transition-all border-4 border-dark-600 rounded-none uppercase tracking-widest">
              Explore Tools <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
      
      {/* Create Stack Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsCreateModalOpen(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-dark-800 border-4 border-dark-600 w-full max-w-lg rounded-none shadow-[16px_16px_0px_0px_rgba(255,140,0,1)] overflow-hidden"
            >
              <div className="p-10 border-b-4 border-dark-600 flex items-center justify-between bg-dark-900">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-jenga-500 rounded-none border-2 border-dark-950">
                      <Layers className="text-dark-950 w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-black text-surface-text tracking-widest uppercase">New Stack</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-surface-muted hover:text-jenga-500 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="p-10">
                <form onSubmit={handleCreateStack} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-surface-muted uppercase tracking-widest ml-1 font-mono">Stack Name</label>
                    <input 
                      type="text" 
                      value={newStackName}
                      onChange={(e) => setNewStackName(e.target.value)}
                      placeholder="e.g. Video Production Hub"
                      className="w-full bg-dark-900 border-2 border-dark-600 px-6 py-4 text-surface-text focus:outline-none focus:border-jenga-500 transition-all font-bold placeholder:text-surface-muted rounded-none font-mono"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!newStackName.trim() || isCreating}
                    className="w-full bg-jenga-500 hover:bg-jenga-400 disabled:opacity-50 text-dark-950 px-6 py-4 font-black text-xl transition-all border-2 border-dark-950 active:scale-90 rounded-none uppercase tracking-widest flex items-center justify-center min-h-[64px]"
                  >
                    {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initialize Stack"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12 pb-32">
      <header className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-dark-800 border-2 border-dark-600 rounded-none text-jenga-500 text-[10px] font-black uppercase tracking-widest mb-4 font-mono">
            <Sparkles className="w-3 h-3" />
            Workspace
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-surface-text tracking-widest uppercase">Your Intelligence Stacks</h1>
        <p className="text-surface-muted mt-4 text-xl font-mono">Customized toolchains built for specialized outcomes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {stacks.map((stack, index) => (
            <motion.div 
                key={stack.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="bg-dark-800 border-4 border-dark-600 rounded-none overflow-hidden group hover:border-jenga-500 transition-all shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] flex flex-col"
            >
                <div className="p-10 border-b-4 border-dark-600 bg-dark-900 flex-grow">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-jenga-500 rounded-none flex items-center justify-center border-2 border-dark-950">
                                <FolderOpen className="text-dark-950 w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-surface-text tracking-widest uppercase">{stack.name}</h2>
                                <p className="text-surface-muted font-bold uppercase tracking-widest text-[10px] mt-1 font-mono">{stack.toolIds.length} Tools Integrated</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => deleteStack(stack.id)}
                            className="p-3 text-surface-muted hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {stack.toolIds.length > 0 ? (
                            stack.toolIds.map(tid => {
                                const tool = getToolById(tid);
                                if (!tool) return null;
                                return (
                                    <Link 
                                        key={tid} 
                                        to={`/tool/${tid}`}
                                        className="flex items-center gap-3 bg-dark-800 border-2 border-dark-600 rounded-none pl-4 pr-4 py-2 group/tool hover:border-jenga-500 transition-all"
                                    >
                                        <span className="text-sm font-black text-surface-text group-hover/tool:text-jenga-500 uppercase tracking-widest font-mono">{tool.name}</span>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); removeToolFromStack(stack.id, tid); }}
                                            className="ml-2 text-surface-muted hover:text-red-500 opacity-0 group-hover/tool:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </Link>
                                );
                            })
                        ) : (
                            <p className="text-surface-muted italic text-sm font-mono">No tools added to this stack yet.</p>
                        )}
                    </div>
                </div>
                
                <div className="p-8 bg-dark-800 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <Zap className="text-jenga-500 w-5 h-5" />
                        <span className="text-surface-text font-black text-sm uppercase tracking-widest">Stack Performance</span>
                        <div className="w-32 h-2 bg-dark-700 rounded-none ml-4 overflow-hidden hidden sm:block">
                            <div className="h-full bg-jenga-500" style={{ width: `${Math.min(stack.toolIds.length * 20, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link to={`/stack/${stack.id}`} className="bg-dark-900 border-2 border-dark-600 text-surface-text hover:bg-jenga-500 hover:text-dark-950 hover:border-jenga-500 px-6 py-3 font-black text-xs transition-all flex items-center gap-2 rounded-none uppercase tracking-widest">
                            View Details
                        </Link>
                        <button className="bg-dark-900 border-2 border-dark-600 text-surface-text hover:bg-jenga-500 hover:text-dark-950 hover:border-jenga-500 px-6 py-3 font-black text-xs transition-all flex items-center gap-2 rounded-none uppercase tracking-widest hidden sm:flex">
                            Compare
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        ))}

        {/* Create New Stack Card */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stacks.length * 0.1 }}
            whileHover={{ y: -5, scale: 1.01 }}
            className="h-full"
        >
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="w-full bg-dark-900 border-4 border-dashed border-dark-600 rounded-none p-10 flex flex-col items-center justify-center text-center group hover:border-jenga-500 transition-all h-full min-h-[300px] hover:bg-dark-800"
          >
              <div className="w-20 h-20 bg-dark-800 border-2 border-dark-600 rounded-none flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Plus className="w-10 h-10 text-surface-muted group-hover:text-jenga-500" />
              </div>
              <h3 className="text-2xl font-black text-surface-text mb-2 uppercase tracking-widest">Initialize New Stack</h3>
              <p className="text-surface-muted text-sm max-w-xs font-mono">Create an empty stack container to organize your specialized workflows.</p>
          </button>
        </motion.div>
      </div>
      
      {/* Create Stack Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setIsCreateModalOpen(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-dark-800 border-4 border-dark-600 w-full max-w-lg rounded-none shadow-[16px_16px_0px_0px_rgba(255,140,0,1)] overflow-hidden"
            >
              <div className="p-10 border-b-4 border-dark-600 flex items-center justify-between bg-dark-900">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-jenga-500 rounded-none border-2 border-dark-950">
                      <Layers className="text-dark-950 w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-black text-surface-text tracking-widest uppercase">New Stack</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-surface-muted hover:text-jenga-500 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="p-10">
                <form onSubmit={handleCreateStack} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-surface-muted uppercase tracking-widest ml-1 font-mono">Stack Name</label>
                    <input 
                      type="text" 
                      value={newStackName}
                      onChange={(e) => setNewStackName(e.target.value)}
                      placeholder="e.g. Video Production Hub"
                      className="w-full bg-dark-900 border-2 border-dark-600 px-6 py-4 text-surface-text focus:outline-none focus:border-jenga-500 transition-all font-bold placeholder:text-surface-muted rounded-none font-mono"
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!newStackName.trim() || isCreating}
                    className="w-full bg-jenga-500 hover:bg-jenga-400 disabled:opacity-50 text-dark-950 px-6 py-4 font-black text-xl transition-all border-2 border-dark-950 active:scale-90 rounded-none uppercase tracking-widest flex items-center justify-center min-h-[64px]"
                  >
                    {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initialize Stack"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </PageWrapper>
  );
};
