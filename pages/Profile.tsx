import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Zap, Calendar, Layers, Trophy, 
  Settings, ArrowRight, Bookmark, FolderOpen, Send, ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { TOOLS_REGISTRY, getToolById } from '../constants';
import { ToolSubmission } from '../types';
import { ToolCard } from '../components/ToolCard';
import { PageWrapper } from '../components/PageWrapper';
import { EditProfileModal } from '../components/EditProfileModal';
import { stackService, UserStack } from '../services/stackService';
import { toolService } from '../services/toolService';

export const Profile: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userStacks, setUserStacks] = useState<UserStack[]>([]);
  const [submissions, setSubmissions] = useState<ToolSubmission[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    stackService.getUserStacks(user.id).then((data) => {
      if (active) setUserStacks(data);
    });
    toolService.getUserSubmissions().then((data) => {
      if (active) setSubmissions(data);
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (!isAuthReady) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-32 flex justify-center">
          <div className="w-8 h-8 border-4 border-jenga-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const savedTools = TOOLS_REGISTRY.filter(t => user.savedToolIds.includes(t.id));

  const stats = [
    { label: 'Saved Tools', value: user.savedToolIds.length, icon: Bookmark, color: 'text-jenga-500' },
    { label: 'Stacks Built', value: userStacks.length, icon: Layers, color: 'text-blue-500' },
    { label: 'Submissions', value: submissions.length, icon: Send, color: 'text-emerald-400' },
  ];

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12 pb-32">
      {/* Profile Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative bg-dark-800 border-4 border-dark-600 rounded-none p-8 md:p-12 mb-16 overflow-hidden group shadow-[8px_8px_0px_0px_rgba(255,140,0,1)]"
      >
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
          <Trophy className="w-64 h-64 text-white" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-none bg-dark-900 p-2 border-4 border-dark-600 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-4xl md:text-6xl font-black text-surface-muted">{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 bg-jenga-500 text-dark-950 p-3 rounded-none border-2 border-dark-950">
              <Zap className="w-6 h-6 fill-current" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-surface-text tracking-widest uppercase">{user.name}</h1>
              <p className="text-surface-muted font-mono text-sm mt-2 flex items-center justify-center md:justify-start gap-2">
                <Calendar className="w-4 h-4" />
                Member since {new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="md:ml-auto">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-dark-900 hover:bg-jenga-500 hover:text-dark-950 text-surface-text font-black border-2 border-dark-600 transition-all rounded-none uppercase tracking-widest"
            >
              <Settings className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </motion.div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto md:ml-0 md:mr-auto">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-dark-800 border-2 border-dark-600 rounded-none p-6 hover:border-jenga-500 transition-all group shadow-[4px_4px_0px_0px_rgba(255,140,0,1)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-none bg-dark-900 border-2 border-dark-600 group-hover:scale-110 transition-transform">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-surface-muted group-hover:text-jenga-500">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-black text-surface-text mb-1 font-mono">{stat.value}</p>
            <p className="text-xs font-black text-surface-muted uppercase tracking-widest font-mono">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="space-y-16">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-surface-text flex items-center gap-4 uppercase tracking-widest">
              <div className="w-2 h-8 bg-jenga-500 rounded-none" />
              My Saved Arsenal
            </h2>
            <Link to="/" className="text-jenga-500 hover:text-jenga-400 text-sm font-black flex items-center gap-2 uppercase tracking-widest font-mono">
              Explore More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {savedTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="p-20 text-center bg-dark-900 border-4 border-dashed border-dark-600 rounded-none">
              <Bookmark className="w-16 h-16 text-surface-muted mx-auto mb-6" />
              <h3 className="text-2xl font-black text-surface-text mb-2 uppercase tracking-widest">Nothing in your arsenal yet</h3>
              <p className="text-surface-muted mb-8 max-w-sm mx-auto font-mono">Build your personalized stack by saving tools as you explore the repository.</p>
              <Link to="/" className="inline-flex px-8 py-3 bg-jenga-500 text-dark-950 font-black border-2 border-dark-950 rounded-none uppercase tracking-widest hover:bg-jenga-400 transition-colors">
                Start Exploring
              </Link>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-surface-text flex items-center gap-4 uppercase tracking-widest">
              <div className="w-2 h-8 bg-blue-500 rounded-none" />
              My Created Stacks
            </h2>
            <Link to="/stacks" className="text-blue-500 hover:text-blue-400 text-sm font-black flex items-center gap-2 uppercase tracking-widest font-mono">
              Manage Stacks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {userStacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userStacks.map((stack, i) => (
                <Link to={`/stack/${stack.id}`} key={stack.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-dark-800 border-2 border-dark-600 rounded-none p-6 hover:border-blue-500 transition-all group shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-none flex items-center justify-center border-2 border-dark-950">
                        <FolderOpen className="text-dark-950 w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-surface-muted uppercase tracking-widest">{stack.toolIds.length} Tools</span>
                    </div>
                    <h3 className="text-xl font-black text-surface-text mb-2 uppercase tracking-widest">{stack.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {stack.toolIds.slice(0, 3).map(tid => {
                        const tool = getToolById(tid);
                        return tool ? (
                          <span key={tid} className="text-[10px] font-mono px-2 py-1 bg-dark-900 border border-dark-600 text-surface-muted uppercase">
                            {tool.name}
                          </span>
                        ) : null;
                      })}
                      {stack.toolIds.length > 3 && (
                        <span className="text-[10px] font-mono px-2 py-1 bg-dark-900 border border-dark-600 text-surface-muted uppercase">
                          +{stack.toolIds.length - 3} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-dark-900 border-4 border-dashed border-dark-600 rounded-none">
              <Layers className="w-12 h-12 text-surface-muted mx-auto mb-4" />
              <h3 className="text-xl font-black text-surface-text mb-2 uppercase tracking-widest">No Stacks Built</h3>
              <p className="text-surface-muted mb-6 max-w-sm mx-auto font-mono text-sm">Create custom toolchains to streamline your workflows.</p>
              <Link to="/stacks" className="inline-flex px-6 py-2 bg-blue-500 text-dark-950 font-black border-2 border-dark-950 rounded-none uppercase tracking-widest hover:bg-blue-400 transition-colors text-sm">
                Build a Stack
              </Link>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-surface-text flex items-center gap-4 uppercase tracking-widest">
              <div className="w-2 h-8 bg-emerald-400 rounded-none" />
              Submitted Tools
            </h2>
            <Link to="/" className="text-emerald-400 hover:text-emerald-300 text-sm font-black flex items-center gap-2 uppercase tracking-widest font-mono">
              Browse Directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {submissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {submissions.map(sub => {
                const statusBadge =
                  sub.status === 'APPROVED'
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400'
                    : sub.status === 'REJECTED'
                    ? 'bg-red-950/70 border-red-500 text-red-400'
                    : 'bg-amber-950/70 border-jenga-500 text-jenga-400';

                return (
                  <div
                    key={sub.id}
                    className="bg-dark-800 border-2 border-dark-600 p-6 rounded-none flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-mono uppercase tracking-widest text-surface-muted">
                          {sub.category} · {sub.pricing}
                        </span>
                        <span className={`px-2 py-0.5 border text-[10px] font-mono font-bold uppercase tracking-widest ${statusBadge}`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-surface-text uppercase tracking-wider">{sub.name}</h3>
                      <p className="text-xs font-mono text-surface-muted line-clamp-2">{sub.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-dark-700 text-xs font-mono">
                      <a
                        href={sub.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jenga-500 hover:text-jenga-400 inline-flex items-center gap-1"
                      >
                        <span>Visit URL</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span className="text-surface-muted">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'Submitted'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-dark-900 border-4 border-dashed border-dark-600 rounded-none">
              <Send className="w-12 h-12 text-surface-muted mx-auto mb-4" />
              <h3 className="text-xl font-black text-surface-text mb-2 uppercase tracking-widest">No Tool Submissions Yet</h3>
              <p className="text-surface-muted mb-6 max-w-sm mx-auto font-mono text-sm">
                Submit new AI models or developer tools from the directory header to track their review status here.
              </p>
              <Link to="/" className="inline-flex px-6 py-2 bg-dark-800 hover:bg-jenga-500 hover:text-dark-950 text-jenga-500 font-black border-2 border-jenga-500 rounded-none uppercase tracking-widest transition-colors text-sm">
                Go to Directory
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
    </PageWrapper>
  );
};
