import React, { useEffect, useRef } from 'react';

/**
 * AmbientBackground
 * High-performance ambient blueprint grid, laser crosshairs, interactive shockwave ripples,
 * and luminous construction micro-sparks.
 *
 * Implements Jengo AI Design Language v1.0:
 * - Architectural drafting grid & hairline survey markers
 * - Bunifu Yellow (#FFD100) and Jengo Orange (#FF8C00) interactive laser aura
 * - Mouse-reactive crosshair reticle with mathematical coordinate readout
 * - Seismic pulse waves on click
 * - 60fps GPU-composited canvas with automatic pause on tab blur and prefers-reduced-motion
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabVisible = true;

    // Check user accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth lerping
    let targetX = width / 2;
    let targetY = height / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isMouseActive = false;
    let mouseIdleTimer: number | null = null;
    let crosshairAlpha = 0;

    // Grid sizing
    const gridSize = 48; // Architectural blueprint spacing in pixels

    // Particles (Construction micro-sparks / blueprint nodes)
    const particleCount = prefersReducedMotion ? 0 : 28;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.2 - Math.random() * 0.35, // Slow upward drift
        size: Math.random() < 0.2 ? 2.0 : 1.2,
        alpha: 0.15 + Math.random() * 0.35,
        targetAlpha: 0.2 + Math.random() * 0.4,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Seismic Click Pulse Waves
    const waves: PulseWave[] = [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      isMouseActive = true;
      if (mouseIdleTimer) window.clearTimeout(mouseIdleTimer);
      mouseIdleTimer = window.setTimeout(() => {
        isMouseActive = false;
      }, 3500);
    };

    const handleClick = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      waves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.min(width, height) * 0.65,
        alpha: 0.55,
        speed: 8.5,
      });
      // Keep max 4 concurrent waves
      if (waves.length > 4) waves.shift();
    };

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Render loop
    const render = () => {
      if (!isTabVisible) return;

      // Smooth lerp (0.075 factor)
      if (!prefersReducedMotion) {
        currentX += (targetX - currentX) * 0.075;
        currentY += (targetY - currentY) * 0.075;

        // Smooth crosshair fade-in/out
        const targetAlpha = isMouseActive ? 1 : 0.25;
        crosshairAlpha += (targetAlpha - crosshairAlpha) * 0.05;
      } else {
        currentX = targetX;
        currentY = targetY;
        crosshairAlpha = 0.2;
      }

      ctx.clearRect(0, 0, width, height);

      // --- 1. Background Grid Intersections (Subtle blueprint '+' points) ---
      const startX = 0;
      const startY = 0;
      const armLength = 3;

      ctx.save();
      for (let x = startX; x < width; x += gridSize) {
        for (let y = startY; y < height; y += gridSize) {
          // Distance from mouse to calculate dynamic glow
          const dx = x - currentX;
          const dy = y - currentY;
          const distSq = dx * dx + dy * dy;

          if (distSq < 70000) { // Within ~265px
            const intensity = Math.max(0, 1 - Math.sqrt(distSq) / 265);
            ctx.strokeStyle = `rgba(255, 209, 0, ${0.08 + intensity * 0.35})`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(x - armLength - intensity * 2, y);
            ctx.lineTo(x + armLength + intensity * 2, y);
            ctx.moveTo(x, y - armLength - intensity * 2);
            ctx.lineTo(x, y + armLength + intensity * 2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // --- 2. Seismic Click Pulse Waves ---
      if (waves.length > 0) {
        ctx.save();
        for (let i = waves.length - 1; i >= 0; i--) {
          const w = waves[i];
          w.radius += w.speed;
          w.alpha *= 0.965; // Smooth exponential decay

          if (w.alpha < 0.01 || w.radius > w.maxRadius) {
            waves.splice(i, 1);
            continue;
          }

          // Outer shockwave
          ctx.strokeStyle = `rgba(255, 209, 0, ${w.alpha * 0.45})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Secondary trailing harmonic wave
          if (w.radius > 40) {
            ctx.strokeStyle = `rgba(255, 140, 0, ${w.alpha * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius * 0.75, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // --- 3. Construction Micro-Sparks / Data Packets ---
      if (!prefersReducedMotion && particles.length > 0) {
        ctx.save();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;

          // Wrap around edges
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          // Gentle breathing opacity
          const currentAlpha = p.alpha + Math.sin(p.pulsePhase) * 0.15;

          // Proximity to mouse enhances glow
          const pdx = p.x - currentX;
          const pdy = p.y - currentY;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
          const mouseGlow = pDist < 160 ? (1 - pDist / 160) * 0.4 : 0;

          ctx.fillStyle = `rgba(255, 209, 0, ${Math.min(0.9, currentAlpha + mouseGlow)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- 4. Interactive Crosshair Reticle & Architectural Coordinate Laser ---
      if (crosshairAlpha > 0.02) {
        ctx.save();
        const baseAlpha = crosshairAlpha * 0.14;

        // Subtle horizontal guide line
        const gradX = ctx.createLinearGradient(0, currentY, width, currentY);
        gradX.addColorStop(0, 'rgba(255, 209, 0, 0)');
        gradX.addColorStop(Math.max(0, (currentX - 350) / width), 'rgba(255, 209, 0, 0)');
        gradX.addColorStop(Math.max(0, currentX / width), `rgba(255, 209, 0, ${baseAlpha * 1.5})`);
        gradX.addColorStop(Math.min(1, (currentX + 350) / width), 'rgba(255, 209, 0, 0)');
        gradX.addColorStop(1, 'rgba(255, 209, 0, 0)');

        ctx.strokeStyle = gradX;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(width, currentY);
        ctx.stroke();

        // Subtle vertical guide line
        const gradY = ctx.createLinearGradient(currentX, 0, currentX, height);
        gradY.addColorStop(0, 'rgba(255, 209, 0, 0)');
        gradY.addColorStop(Math.max(0, (currentY - 350) / height), 'rgba(255, 209, 0, 0)');
        gradY.addColorStop(Math.max(0, currentY / height), `rgba(255, 209, 0, ${baseAlpha * 1.5})`);
        gradY.addColorStop(Math.min(1, (currentY + 350) / height), 'rgba(255, 209, 0, 0)');
        gradY.addColorStop(1, 'rgba(255, 209, 0, 0)');

        ctx.strokeStyle = gradY;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, height);
        ctx.stroke();

        // Central Precision Crosshair Box
        const boxSize = 12;
        ctx.strokeStyle = `rgba(255, 209, 0, ${crosshairAlpha * 0.28})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(currentX - boxSize / 2, currentY - boxSize / 2, boxSize, boxSize);

        // Center reticle dot
        ctx.fillStyle = `rgba(255, 209, 0, ${crosshairAlpha * 0.55})`;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Architectural Coordinate readout (JetBrains Mono / drafting style)
        if (crosshairAlpha > 0.4) {
          ctx.fillStyle = `rgba(255, 209, 0, ${crosshairAlpha * 0.45})`;
          ctx.font = '10px "JetBrains Mono", monospace';
          const coordText = `[ ${Math.round(currentX)} : ${Math.round(currentY)} ] CAD.01`;
          ctx.fillText(coordText, currentX + 14, currentY - 10);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mouseIdleTimer) window.clearTimeout(mouseIdleTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* 1. Underlying High-Contrast Blueprint Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FAF9F5 1px, transparent 1px),
            linear-gradient(to bottom, #FAF9F5 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Secondary Sub-Grid for Architectural Depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FFD100 1px, transparent 1px),
            linear-gradient(to bottom, #FFD100 1px, transparent 1px)
          `,
          backgroundSize: '192px 192px',
        }}
      />

      {/* 3. Hardware-Accelerated High-Performance Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* 4. Top Hairline Architectural Calibration Notch Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 flex justify-between items-start px-4 opacity-40">
        <div className="flex gap-4 font-mono text-[9px] text-surface-muted select-none">
          <span>000</span>
          <span>048</span>
          <span>096</span>
          <span>144</span>
          <span>192</span>
        </div>
        <div className="font-mono text-[9px] text-jenga-500 uppercase tracking-widest select-none">
          JENGA // ARCHITECTURAL DRAFT
        </div>
      </div>

      {/* 5. Precision Corner Brackets (Brutalist Survey Framing) */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-dark-600 opacity-60" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-dark-600 opacity-60" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-dark-600 opacity-60" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-dark-600 opacity-60" />

      {/* 6. Signature Jengo Hazard Stripe Edge Rule (1.5px Hairline at top edge) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] hazard-stripe opacity-75" />
    </div>
  );
};
