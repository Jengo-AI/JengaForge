import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FEATURED_STACKS, getToolById } from '../constants';
import { PageWrapper } from '../components/PageWrapper';
import { ToolCard } from '../components/ToolCard';
import { SocialShareModal } from '../components/SocialShareModal';
import { Layers, ArrowLeft, Heart, Share2, Loader2, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { stackService } from '../services/stackService';
import { useAuth } from '../context/AuthContext';

export const StackDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [stack, setStack] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (stack) {
      document.title = `${stack.name} – AI Stack Blueprint | JengaForge`;
    }
    return () => {
      document.title = 'JengaForge – AI Tools Directory & Agentic Workflow Builder';
    };
  }, [stack]);

  useEffect(() => {
    const fetchStack = async () => {
      setIsLoading(true);
      // Check featured stacks first
      const featured = FEATURED_STACKS.find(s => s.id === id);
      if (featured) {
        setStack({
          ...featured,
          isFeatured: true,
          toolIds: featured.tools
        });
        setIsLoading(false);
        return;
      }

      // Check Firestore stacks
      if (id) {
        const firestoreStack = await stackService.getStackById(id);
        if (firestoreStack) {
          const isOwner = user?.id === firestoreStack.userId;
          setStack({
            ...firestoreStack,
            isFeatured: false,
            author: isOwner ? 'You' : 'Community',
            role: isOwner ? 'Creator' : 'Member',
            description: isOwner ? 'A custom intelligence stack built by you.' : 'A community submitted stack.',
            likes: 0
          });
        }
      }
      setIsLoading(false);
    };

    fetchStack();
  }, [id, user]);

  const handleCopyStack = async () => {
    if (!user || !stack || isCopying) return;
    setIsCopying(true);
    
    // Create new stack for the current user matching the name
    const newStack = await stackService.createStack(user.id, `${stack.name} (Copy)`);
    if (newStack) {
      // Add tools
      await stackService.updateStackTools(newStack.id, stack.toolIds);
      setCopyFeedback('Stack successfully cloned to your Arsenal!');
    } else {
      setCopyFeedback('Failed to clone stack.');
    }
    setIsCopying(false);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <Loader2 className="w-12 h-12 text-jenga-500 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!stack) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-black text-surface-text mb-4 uppercase tracking-widest">Stack Not Found</h1>
          <Link to="/stacks" className="text-jenga-500 hover:text-jenga-400 font-mono uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Stacks
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const isOwner = !stack.isFeatured && user?.id === stack.userId;

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12 pb-32">
        <Link to="/stacks" className="inline-flex items-center text-surface-muted hover:text-jenga-500 font-mono uppercase tracking-widest text-xs mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stacks
        </Link>
        
        <div className="bg-dark-800 border-4 border-dark-600 rounded-none p-10 mb-12 shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b-4 border-dark-700 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-dark-900 border-2 border-dark-600 rounded-none text-jenga-500 text-[10px] font-black uppercase tracking-widest mb-4 font-mono">
                <Layers className="w-3 h-3" />
                {stack.isFeatured ? 'Featured Stack' : 'Custom Stack'}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-surface-text tracking-widest uppercase mb-4">{stack.name}</h1>
              <p className="text-surface-muted text-lg font-mono max-w-2xl">{stack.description}</p>
            </div>
            
            <div className="flex flex-col gap-4 min-w-[200px]">
              <div className="bg-dark-900 border-2 border-dark-600 p-4 rounded-none flex items-center gap-3">
                <div className="w-10 h-10 bg-dark-700 border-2 border-dark-600 flex items-center justify-center text-surface-text font-black font-mono">
                  {stack.author.charAt(0)}
                </div>
                <div>
                  <p className="text-surface-text font-black uppercase tracking-widest text-xs">{stack.author}</p>
                  <p className="text-surface-muted text-[10px] font-mono uppercase tracking-widest">{stack.role}</p>
                </div>
              </div>
              
              {stack.isFeatured ? (
                <div className="flex gap-2">
                  <button className="flex-1 bg-dark-900 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 text-surface-text py-2 flex items-center justify-center gap-2 transition-colors font-mono uppercase tracking-widest text-xs font-bold">
                     <Heart className="w-4 h-4" /> {stack.likes}
                  </button>
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex-1 bg-dark-900 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 text-surface-text py-2 flex items-center justify-center gap-2 transition-colors font-mono uppercase tracking-widest text-xs font-bold cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-jenga-500" /> Share Card
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full bg-dark-900 border-2 border-dark-600 hover:border-jenga-500 hover:text-jenga-500 text-surface-text py-2 flex items-center justify-center gap-2 transition-colors font-mono uppercase tracking-widest text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-jenga-500" /> Share Stack Card
                </button>
              )}

              {/* Copy Feedback Notification */}
              {copyFeedback && (
                <div className="bg-dark-900 border-2 border-green-500 text-green-400 p-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{copyFeedback}</span>
                </div>
              )}

              {/* Allow non-owners to copy this stack if they are logged in */}
              {!isOwner && user && (
                 <button 
                  onClick={handleCopyStack}
                  disabled={isCopying}
                  className="w-full bg-jenga-500 border-2 border-dark-950 hover:bg-jenga-400 text-dark-950 py-3 flex items-center justify-center gap-2 transition-colors font-mono uppercase tracking-widest text-xs font-black disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isCopying ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Copy className="w-4 h-4" /> Clone Stack</>}
                </button>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-surface-text uppercase tracking-widest mb-6 flex items-center gap-3">
              Integrated Tools <span className="text-jenga-500 bg-dark-900 px-2 py-1 text-sm border-2 border-dark-600">{stack.toolIds.length}</span>
            </h2>
            
            {stack.toolIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stack.toolIds.map((tid: string, index: number) => {
                  const tool = getToolById(tid);
                  if (!tool) return null;
                  return (
                    <motion.div
                      key={tid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ToolCard tool={tool} />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-dark-900 border-2 border-dashed border-dark-600">
                <p className="text-surface-muted font-mono uppercase tracking-widest">No tools have been added to this stack yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {stack && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`${stack.name} — AI Workflow Stack`}
          description={stack.description}
          category={stack.isFeatured ? 'FEATURED STACK' : 'COMMUNITY STACK'}
        />
      )}
    </PageWrapper>
  );
};
