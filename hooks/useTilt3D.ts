import React, { useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'motion/react';

export function useTilt3D<T extends HTMLElement = HTMLDivElement>(maxTiltDeg = 5) {
  const ref = useRef<T>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxTiltDeg}deg`, `-${maxTiltDeg}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxTiltDeg}deg`, `${maxTiltDeg}deg`]);

  const handleMouseMove = (e: React.MouseEvent<T, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseLeave,
  };
}
