import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Briefcase, Layers, MessageSquare, User as UserIcon, LogOut, Share2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { SocialShareModal } from './SocialShareModal';
import { AmbientBackground } from './AmbientBackground';
import { GlobalSearchModal } from './GlobalSearchModal';

interface HeaderProps {
  onOpenShare: () => void;
  onOpenSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenShare, onOpenSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, openAuthModal } = useAuth();

  const isActive = (path: string) => location.pathname === path ? "text-jenga-400 border-b-2 border-jenga-500 pb-1" : "text-surface-text hover:bg-dark-600 transition-colors duration-200 px-2 py-1";

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-700 bg-dark-800">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Briefcase className="text-jenga-500 w-6 h-6" />
          <span className="text-xl font-black tracking-tighter text-jenga-500 uppercase">JengaForge</span>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-2">
          <button
            onClick={onOpenSearch}
            title="Search AI tools, workflows, categories (Press ⌘K or /)"
            className="w-full flex items-center justify-between px-3 py-1.5 bg-dark-900 hover:bg-dark-700 text-surface-muted hover:text-surface-text border border-dark-700 hover:border-jenga-500 transition-all text-xs font-mono group cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-jenga-500 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">Search tools, workflows, tags...</span>
            </span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-dark-800 border border-dark-600 text-surface-muted group-hover:text-jenga-400 group-hover:border-jenga-500 transition-colors shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 font-mono uppercase tracking-[0.05rem] text-[12px] font-medium shrink-0">
          <Link to="/" className={isActive('/')}>Explore</Link>
          <Link to="/stacks" className={isActive('/stacks')}>Stacks</Link>
          <Link to="/compare" className={isActive('/compare')}>Compare</Link>
        </nav>

        {/* Header Right Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenShare}
            title="Share JengaForge"
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-surface-text text-xs font-mono font-bold uppercase tracking-widest transition-all border border-dark-600 hover:border-jenga-500 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-jenga-500" />
            <span>Share</span>
          </button>

          <Link to="/assistant">
             <button className="flex items-center gap-2 px-3 py-2 bg-dark-700 hover:bg-dark-600 text-surface-text text-xs font-bold uppercase tracking-widest transition-all border border-dark-600 hover:border-jenga-500 cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5 text-jenga-500" />
              <span>Ask AI</span>
            </button>
          </Link>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-full pr-3 pl-1 py-1 transition-colors cursor-pointer active:bg-jenga-300"
              >
                <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center overflow-hidden border border-dark-500">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs font-bold text-surface-text">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-surface-text truncate max-w-[120px]">{user.name}</span>
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-none shadow-2xl py-2 z-50"
                  >
                  <div className="px-4 py-3 border-b border-dark-700 mb-2">
                    <p className="text-sm font-bold text-surface-text truncate">{user.name}</p>
                    <p className="text-xs text-surface-muted truncate">{user.email}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-dark-700 transition-colors font-mono uppercase tracking-widest"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link 
                    to="/stacks" 
                    className="flex items-center gap-3 px-4 py-3 text-sm text-surface-text hover:bg-dark-700 transition-colors font-mono uppercase tracking-widest"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Layers className="w-4 h-4" />
                    Stacks
                  </Link>
                  <div className="h-px bg-dark-700 my-1 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-dark-700 transition-colors font-mono uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={openAuthModal}
              className="bg-jenga-500 hover:bg-jenga-400 text-dark-950 px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-colors rounded-none"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Search and Menu Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 bg-dark-700 hover:bg-dark-600 text-surface-text border border-dark-600 cursor-pointer"
            title="Global Search"
            aria-label="Open Global Search"
          >
            <Search className="w-5 h-5 text-jenga-500" />
          </button>
          <button 
            className="p-2 text-surface-text bg-dark-700 hover:bg-dark-600 border border-dark-600 cursor-pointer" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AuthModal />

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-800 border-b-4 border-dark-700 p-4 space-y-4 overflow-hidden font-mono uppercase tracking-widest text-sm"
          >
          <button
            onClick={() => {
              setIsMenuOpen(false);
              onOpenSearch();
            }}
            className="flex items-center gap-2 text-jenga-400 py-2 hover:text-jenga-300 w-full text-left font-bold"
          >
            <Search className="w-4 h-4 text-jenga-500" />
            <span>Search Tools & Stacks</span>
          </button>
          <Link to="/" className="block text-surface-text py-2 hover:text-jenga-500" onClick={() => setIsMenuOpen(false)}>Explore</Link>
          <Link to="/stacks" className="block text-surface-text py-2 hover:text-jenga-500" onClick={() => setIsMenuOpen(false)}>Stacks</Link>
          <Link to="/compare" className="block text-surface-text py-2 hover:text-jenga-500" onClick={() => setIsMenuOpen(false)}>Compare</Link>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              onOpenShare();
            }}
            className="flex items-center gap-2 text-surface-text py-2 hover:text-jenga-500 w-full text-left"
          >
            <Share2 className="w-4 h-4 text-jenga-500" />
            <span>Share Social Card</span>
          </button>
          {user ? (
            <>
              <div className="flex items-center gap-3 py-2 border-b border-dark-700 mb-2 pb-4">
                <div className="w-10 h-10 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-sm font-bold text-surface-text">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-surface-text font-bold">{user.name}</span>
                  <span className="text-surface-muted text-xs lowercase">{user.email}</span>
                </div>
              </div>
              <Link to="/profile" className="block text-jenga-500 py-2 font-bold hover:text-jenga-400" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              <button 
                onClick={() => { setIsMenuOpen(false); handleLogout(); }} 
                className="block text-red-500 py-2 font-bold hover:text-red-400 w-full text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => { setIsMenuOpen(false); openAuthModal(); }} className="block text-jenga-500 py-2 font-bold">Sign In</button>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

interface FooterProps {
  onOpenShare: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenShare }) => (
  <footer className="w-full py-8 md:py-12 bg-dark-900 border-t-4 border-dark-700 mt-auto">
    <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 gap-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
        <span className="text-jenga-500 font-bold font-mono uppercase tracking-widest text-sm md:text-base">JengaForge Precision Tools</span>
        <p className="font-mono text-[10px] text-surface-muted uppercase tracking-widest">&copy; 2026 JengaForge Precision Tools</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[12px] uppercase tracking-widest">
        <Link to="/support" className="text-surface-muted hover:text-jenga-400 transition-colors opacity-80 hover:opacity-100">Support</Link>
        <Link to="/documentation" className="text-surface-muted hover:text-jenga-400 transition-colors opacity-80 hover:opacity-100">Documentation</Link>
        <Link to="/api" className="text-surface-muted hover:text-jenga-400 transition-colors opacity-80 hover:opacity-100">API</Link>
        <button
          onClick={onOpenShare}
          className="text-surface-muted hover:text-jenga-400 transition-colors opacity-80 hover:opacity-100 cursor-pointer flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5 text-jenga-500" />
          <span>Share Card</span>
        </button>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global keyboard shortcuts (⌘K or Ctrl+K or /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
        return;
      }
      // '/' when not inside an active input or textarea
      if (
        e.key === '/' && 
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-surface-text font-sans relative">
      <AmbientBackground />
      <Header 
        onOpenShare={() => setIsShareModalOpen(true)} 
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />
      <main className="flex-grow relative z-10">
        {children}
      </main>
      <Footer onOpenShare={() => setIsShareModalOpen(true)} />
      
      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Social Share Card Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="JengaForge — AI Tools Directory & Agentic Stacks"
        description="Discover, stack, and automate with frontier 2026 AI tools and agentic workflows. Built for creators, scaled for the world."
        category="DIRECTORY"
        imageUrl="/social-card.png"
      />
    </div>
  );
};
