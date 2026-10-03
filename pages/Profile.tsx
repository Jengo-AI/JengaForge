
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Zap, Calendar, Layers, Trophy, 
  Settings, ArrowRight, Bookmark, FolderOpen, Key, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { TOOLS_REGISTRY, getToolById } from '../constants';
import { ToolCard } from '../components/ToolCard';
import { PageWrapper } from '../components/PageWrapper';
import { EditProfileModal } from '../components/EditProfileModal';
import { stackService, UserStack } from '../services/stackService';

export const Profile: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('USER_GEMINI_API_KEY') || '');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [userStacks, setUserStacks] = useState<UserStack[]>([]);

  useEffect(() => {
    if (user) {
      stackService.getUserStacks(user.id).then(setUserStacks);
    }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto md:ml-0 md:mr-auto">
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
              <div className={`p-3 rounded-none bg-dark-900 border-2 border-dark-600 group-hover:scale-110 transition-transform`}>
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
              <div className="w-2 h-8 bg-jenga-500 rounded-none" />
              API Configurations
            </h2>
          </div>
          <div className="bg-dark-800 border-2 border-dark-600 rounded-none p-6 md:p-8 max-w-2xl shadow-[4px_4px_0px_0px_rgba(255,140,0,1)] hover:border-jenga-500 transition-all">
             <h3 className="text-xl font-bold mb-4 text-surface-text uppercase tracking-widest">Gemini API Key</h3>
             <p className="text-surface-muted mb-6 font-mono text-sm leading-relaxed">
               Enter your Gemini API key to unlock dynamic assistant features directly inside JengaForge. Your key is securely stored locally in your browser and never sent to our servers.
             </p>
             <form onSubmit={(e) => {
               e.preventDefault();
               if(apiKey.trim()) {
                 localStorage.setItem('USER_GEMINI_API_KEY', apiKey.trim());
               } else {
                 localStorage.removeItem('USER_GEMINI_API_KEY');
               }
               setIsKeySaved(true);
               setTimeout(() => setIsKeySaved(false), 3000);
             }} className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-grow">
                 <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                 <input
                   type="password"
                   value={apiKey}
                   onChange={(e) => setApiKey(e.target.value)}
                   className="w-full bg-dark-900 border-2 border-dark-600 py-3 pl-11 pr-4 text-surface-text focus:border-jenga-500 outline-none transition-all font-mono"
                   placeholder="AIzaSy..."
                 />
               </div>
               <button
                 type="submit"
                 className="bg-jenga-500 hover:bg-jenga-400 text-dark-950 px-6 py-3 font-black uppercase tracking-widest transition-all border-2 border-dark-950 flex justify-center items-center gap-2 whitespace-nowrap active:scale-95"
               >
                  {isKeySaved ? <><Check className="w-5 h-5" /> Saved</> : 'Save Key'}
               </button>
             </form>
          </div>
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
      </div>
    </div>
    </PageWrapper>
  );
};
