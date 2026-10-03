import React, { useRef, useState } from 'react';
import { Tool } from '../types';
import { Star, Zap, Users, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { SocialShareModal } from './SocialShareModal';

interface ToolCardProps {
  tool: Tool;
  onCompare?: (tool: Tool) => void;
  isCompared?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onCompare, isCompared }) => {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

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

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the compare button
    if ((e.target as HTMLElement).closest('.compare-btn')) {
      return;
    }
    navigate(`/tool/${tool.id}`);
  };

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-dark-800 border-2 border-dark-600 rounded-none hover:border-jenga-500 transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(255,140,0,1)] flex flex-col h-full cursor-pointer"
    >
      <div
        style={{
          transform: "translateZ(50px)",
          transformStyle: "preserve-3d",
        }}
        className="flex flex-col h-full"
      >
        {/* Header Area */}
        <div className="relative h-24 overflow-hidden rounded-none bg-dark-700">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800 to-transparent z-10 opacity-80" />
          {tool.status === 'Deprecated' ? (
            <div 
              style={{ transform: "translateZ(30px)" }}
              className="absolute top-3 right-3 z-20 bg-amber-500/20 text-amber-300 border border-amber-500/80 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest font-bold"
            >
              Deprecated
            </div>
          ) : (
            <div 
              style={{ transform: "translateZ(30px)" }}
              className="absolute top-3 right-3 z-20 bg-dark-900 px-2 py-1 rounded-none text-xs font-mono uppercase tracking-widest text-surface-text border border-dark-600"
            >
              {tool.pricing}
            </div>
          )}
          <div 
            style={{ transform: "translateZ(40px)" }}
            className="absolute bottom-3 left-3 z-20 flex items-center space-x-1 text-jenga-500"
          >
            <Star className="w-4 h-4 fill-current" />
            <span className="text-surface-text font-mono text-sm">{tool.rating}</span>
            <span className="text-surface-muted text-xs font-mono">({tool.reviews})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col bg-dark-800 rounded-none">
          <div className="flex justify-between items-start mb-2">
              <div style={{ transform: "translateZ(20px)" }}>
                   <span className="text-[10px] font-mono font-bold text-jenga-500 uppercase tracking-widest">{tool.category}</span>
                  <h3 className="text-xl font-black text-surface-text group-hover:text-jenga-500 transition-colors uppercase tracking-tight">{tool.name}</h3>
              </div>
          </div>
          
          <p 
            style={{ transform: "translateZ(10px)" }}
            className="text-surface-muted text-sm mb-4 line-clamp-2 font-mono"
          >
            {tool.description}
          </p>

          {/* Specs Mini Viz */}
          <div 
            style={{ transform: "translateZ(15px)" }}
            className="flex items-center space-x-4 mb-4 text-xs text-surface-muted border-t-2 border-dark-700 pt-3 font-mono uppercase tracking-widest"
          >
              <div className="flex items-center space-x-1" title="Power Rating">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{tool.specs.power}</span>
              </div>
              <div className="flex items-center space-x-1" title="Community Score">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span>{tool.specs.community}</span>
              </div>
          </div>

          {/* Tags */}
          <div 
            style={{ transform: "translateZ(25px)" }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {tool.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-dark-700 text-surface-text text-[10px] uppercase rounded-none border border-dark-600 font-mono tracking-widest">
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div 
            style={{ transform: "translateZ(30px)" }}
            className="mt-auto pt-4 flex gap-2 relative z-50"
          >
              <span className="flex-1 block text-center bg-dark-700 group-hover:bg-jenga-500 group-hover:text-dark-950 text-surface-text py-2 rounded-none text-xs font-black uppercase tracking-widest transition-colors border border-dark-600 group-hover:border-jenga-500">
                  View Details
              </span>
              <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsShareOpen(true);
                  }}
                  title="Share tool social card"
                  className="compare-btn p-2 rounded-none border-2 border-dark-600 text-surface-muted hover:border-jenga-500 hover:text-jenga-500 hover:bg-dark-700 transition-colors cursor-pointer flex items-center justify-center"
              >
                  <Share2 className="w-4 h-4" />
              </button>
              {onCompare && (
                  <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCompare(tool);
                      }}
                      className={`compare-btn px-3 py-2 rounded-none border-2 transition-colors font-mono uppercase tracking-widest ${
                          isCompared 
                          ? 'bg-jenga-500 border-jenga-500 text-dark-950' 
                          : 'border-dark-600 text-surface-text hover:border-jenga-500 hover:text-jenga-500 hover:bg-dark-700'
                      }`}
                  >
                      <span className="text-xs font-bold">{isCompared ? 'Added' : 'Compare'}</span>
                  </button>
              )}
          </div>
        </div>
      </div>

      <SocialShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={`${tool.name} — AI Tool Specs`}
        description={tool.description}
        url={`${window.location.origin}/#/tool/${tool.id}`}
        category={tool.category}
        tags={tool.tags}
      />
    </motion.div>
  );
};