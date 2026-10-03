
import React, { useRef } from 'react';
import { Tool } from '../types';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface MiniToolCardProps {
  tool: Tool;
}

export const MiniToolCard: React.FC<MiniToolCardProps> = ({ tool }) => {
  const ref = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
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

  return (
    <motion.div 
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.05 }} 
      transition={{ duration: 0.2 }} 
      className="h-full"
    >
      <Link 
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        to={`/tool/${tool.id}`}
        className="group block bg-dark-800 border-2 border-dark-600 rounded-none overflow-hidden hover:border-jenga-500 transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(255,140,0,1)] h-full flex flex-col"
      >
      <div 
        style={{
          transform: "translateZ(30px)",
          transformStyle: "preserve-3d",
        }}
        className="flex flex-col h-full"
      >
        <div className="relative h-16 overflow-hidden rounded-none bg-dark-700">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800 to-transparent z-10 opacity-80" />
          <div 
            style={{ transform: "translateZ(20px)" }}
            className="absolute bottom-2 left-3 z-20 flex items-center gap-1 drop-shadow-md"
          >
            <Star className="w-3 h-3 text-amber-500 fill-current" />
            <span className="text-surface-text font-mono text-xs">{tool.rating}</span>
          </div>
        </div>

        <div className="p-4 flex-grow flex flex-col justify-between bg-dark-800 rounded-none">
          <div style={{ transform: "translateZ(15px)" }}>
            <span className="text-[10px] font-mono font-bold text-jenga-500 uppercase tracking-widest block mb-1">
              {tool.category}
            </span>
            <h4 className="text-surface-text font-black text-sm group-hover:text-jenga-500 transition-colors line-clamp-1 uppercase tracking-tight">
              {tool.name}
            </h4>
          </div>
          
          <div 
            style={{ transform: "translateZ(25px)" }}
            className="mt-4 flex items-center justify-between"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-surface-text px-2 py-1 bg-dark-900 rounded-none border border-dark-600">
              {tool.pricing}
            </span>
            <div className="text-jenga-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
    </motion.div>
  );
};
