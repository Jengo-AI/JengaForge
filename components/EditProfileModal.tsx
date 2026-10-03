import React, { useState, useRef, useEffect } from 'react';
import { X, User, Link as LinkIcon, Loader2, Key } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setAvatar(user?.avatar || '');
      setApiKey(localStorage.getItem('USER_GEMINI_API_KEY') || '');
    }
  }, [isOpen, user]);

  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (apiKey.trim()) {
        localStorage.setItem('USER_GEMINI_API_KEY', apiKey.trim());
      } else {
        localStorage.removeItem('USER_GEMINI_API_KEY');
      }
      await updateProfile({ name, avatar });
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div 
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-dark-800 border-4 border-dark-600 w-[95%] sm:w-full max-w-md rounded-none shadow-[8px_8px_0px_0px_rgba(255,140,0,1)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-surface-muted hover:text-jenga-500 transition-colors z-20" style={{ transform: "translateZ(30px)" }}>
              <X className="w-6 h-6" />
            </button>

            <div className="p-6 md:p-8" style={{ transform: "translateZ(20px)" }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-surface-text mb-2 uppercase tracking-widest">Edit Profile</h2>
                <p className="text-surface-muted text-sm font-mono">Update your personal information</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-surface-muted uppercase tracking-widest ml-1 font-mono">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-900 border-2 border-dark-600 rounded-none py-3 pl-11 pr-4 text-surface-text focus:ring-2 focus:ring-jenga-500 outline-none transition-all font-mono"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-surface-muted uppercase tracking-widest ml-1 font-mono">Avatar URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="url"
                      className="w-full bg-dark-900 border-2 border-dark-600 rounded-none py-3 pl-11 pr-4 text-surface-text focus:ring-2 focus:ring-jenga-500 outline-none transition-all font-mono"
                      placeholder="https://example.com/avatar.png"
                      value={avatar}
                      onChange={e => setAvatar(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-surface-muted ml-1 font-mono">Leave blank to use default avatar</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-surface-muted uppercase tracking-widest ml-1 font-mono">Gemini API Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      className="w-full bg-dark-900 border-2 border-dark-600 rounded-none py-3 pl-11 pr-4 text-surface-text focus:ring-2 focus:ring-jenga-500 outline-none transition-all font-mono"
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-surface-muted ml-1 font-mono">Required for AI Assistant features</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-jenga-500 hover:bg-jenga-400 text-dark-950 rounded-none font-black py-4 flex items-center justify-center gap-2 transition-all border-2 border-dark-950 active:scale-95 disabled:opacity-70 mt-6 uppercase tracking-widest"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Save Changes</span>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
