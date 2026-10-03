import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Color Palette from Jengo AI Design Language v1.0
const BRAND_YELLOW = '#FFD100';
const BRAND_ORANGE = '#FF8C00';
const DARK_SURFACE = '#121212';
const DARK_BORDER = '#262626';
const TITANIUM = '#1E1E1E';
const HAIRLINE = '#383838';

/**
 * Single Architectural Brick with Line-Based Wireframe Edges
 * Embodies the Swahili "Jenga" (to build, construct) ethos:
 * Flat, structural, line-based, zero toy-like cartoon aesthetics.
 */
interface BrickProps {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  wireframeColor?: string;
  isAccent?: boolean;
}

const ConstructionBrick: React.FC<BrickProps> = ({
  position,
  size,
  color = DARK_SURFACE,
  wireframeColor = HAIRLINE,
  isAccent = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Precompute edges geometry for razor-sharp construction wireframes
  const edgeGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(...size);
    return new THREE.EdgesGeometry(box);
  }, [size]);

  return (
    <group position={position}>
      {/* Solid Structural Form */}
      <mesh ref={meshRef}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={isAccent ? 0.3 : 0.75}
          metalness={isAccent ? 0.8 : 0.25}
          emissive={isAccent ? BRAND_YELLOW : '#000000'}
          emissiveIntensity={isAccent ? 0.25 : 0}
        />
      </mesh>

      {/* High-Contrast Architectural Line Edges */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial
          color={wireframeColor}
          linewidth={isAccent ? 2 : 1}
          transparent
          opacity={isAccent ? 0.95 : 0.65}
        />
      </lineSegments>
    </group>
  );
};

/**
 * 3D Kinetic Jenga Structural Assemblage
 * An architectural foundation that breathes and aligns in real-time,
 * subtly tracking mouse movement with damped 3D parallax.
 */
export const Robot3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    // Subscribe to reduced motion changes
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalized screen coordinates [-1, 1]
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const speedFactor = reducedMotion ? 0.1 : 1;

    // Organic kinetic floating & harmonic breathing
    const idleYaw = Math.sin(time * 0.4 * speedFactor) * 0.08;
    const idlePitch = Math.cos(time * 0.3 * speedFactor) * 0.05;

    // Smooth inertia tracking of cursor position
    const targetRotY = mouse.x * 0.45 + idleYaw;
    const targetRotX = -mouse.y * 0.25 + idlePitch;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.06);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.06);

    // Subtle elevation float
    groupRef.current.position.y = -0.4 + Math.sin(time * 0.8 * speedFactor) * 0.12;

    // Luminous forge core pulsation
    if (coreRef.current) {
      const pulse = Math.sin(time * 2.5 * speedFactor) * 0.5 + 0.5;
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + pulse * 2.0;
      coreRef.current.rotation.y = time * 0.8 * speedFactor;
      coreRef.current.rotation.x = time * 0.5 * speedFactor;
    }
  });

  return (
    <Float speed={reducedMotion ? 0.5 : 1.8} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, -0.4, -0.5]}>
        {/* Tier 0: Heavy Base Foundation Beam */}
        <ConstructionBrick
          position={[0, -0.9, 0]}
          size={[3.4, 0.3, 1.4]}
          color="#0E0E0E"
          wireframeColor={BRAND_YELLOW}
        />

        {/* Tier 1: Dual Interlocking Foundation Piers */}
        <ConstructionBrick
          position={[-1.1, -0.5, 0]}
          size={[1.0, 0.5, 1.4]}
          color={DARK_SURFACE}
          wireframeColor={HAIRLINE}
        />
        <ConstructionBrick
          position={[1.1, -0.5, 0]}
          size={[1.0, 0.5, 1.4]}
          color={DARK_SURFACE}
          wireframeColor={HAIRLINE}
        />

        {/* Tier 2: Transverse Cross Beam (Architectural Tie) */}
        <ConstructionBrick
          position={[0, -0.1, 0]}
          size={[1.4, 0.4, 2.6]}
          color={TITANIUM}
          wireframeColor={HAIRLINE}
        />

        {/* Tier 3: Kinetic Accent Bricks (Bunifu Yellow & Titanium) */}
        <ConstructionBrick
          position={[-0.8, 0.35, 0.3]}
          size={[1.6, 0.4, 0.8]}
          color={DARK_SURFACE}
          wireframeColor={BRAND_YELLOW}
        />
        <ConstructionBrick
          position={[0.7, 0.35, -0.3]}
          size={[1.4, 0.4, 0.8]}
          color="#161616"
          wireframeColor={BRAND_YELLOW}
          isAccent
        />

        {/* Tier 4: Crown Cantilever Block */}
        <ConstructionBrick
          position={[0, 0.8, 0]}
          size={[2.2, 0.35, 1.0]}
          color={DARK_SURFACE}
          wireframeColor={BRAND_YELLOW}
        />

        {/* Glowing Octahedral Forge Core (The Spark of Creation) */}
        <mesh ref={coreRef} position={[0, -0.1, 0]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            color={BRAND_YELLOW}
            emissive={BRAND_ORANGE}
            emissiveIntensity={2.2}
            roughness={0.1}
            metalness={0.9}
            toneMapped={false}
          />
        </mesh>

        {/* Structural Core Point Light */}
        <pointLight position={[0, -0.1, 0]} color={BRAND_YELLOW} intensity={3.5} distance={5} />

        {/* Ground Projection Shadow */}
        <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.2, 2.8]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.65} />
        </mesh>
      </group>
    </Float>
  );
};

/**
 * 3D Kinetic Architectural Blueprint Grid
 * Floor-plane perspective grid with dynamic traveling laser pulses,
 * giving a real construction blueprint / forge horizon presence.
 */
export const ArchitecturalGrid: React.FC = () => {
  const gridLinesRef = useRef<THREE.LineSegments>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  const gridData = useMemo(() => {
    const size = 32;
    const divisions = 24;
    const step = size / divisions;
    const half = size / 2;
    const vertices: number[] = [];

    for (let i = 0; i <= divisions; i++) {
      const coord = -half + i * step;
      // Lines along Z
      vertices.push(coord, 0, -half, coord, 0, half);
      // Lines along X
      vertices.push(-half, 0, coord, half, 0, coord);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (scanRingRef.current) {
      // Expand scan radius across grid
      const progress = (time * 0.6) % 1;
      const scale = progress * 16 + 0.1;
      scanRingRef.current.scale.set(scale, scale, 1);
      (scanRingRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.45;
    }

    if (gridLinesRef.current) {
      // Subtle tilt responsive to cursor
      gridLinesRef.current.rotation.z = mouse.x * 0.03;
    }
  });

  return (
    <group position={[0, -1.8, -1]} rotation={[-Math.PI / 2.35, 0, 0]}>
      {/* Structural Wireframe Grid Lines */}
      <lineSegments ref={gridLinesRef} geometry={gridData}>
        <lineBasicMaterial color={DARK_BORDER} transparent opacity={0.4} />
      </lineSegments>

      {/* Expanding Radar / Construction Scan Ring */}
      <mesh ref={scanRingRef} position={[0, 0, 0.01]}>
        <ringGeometry args={[0.96, 1.0, 48]} />
        <meshBasicMaterial color={BRAND_YELLOW} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Center Origin Crosshair */}
      <group position={[0, 0, 0.02]}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={4}
              array={new Float32Array([-1.5, 0, 0, 1.5, 0, 0, 0, -1.5, 0, 0, 1.5, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={BRAND_YELLOW} transparent opacity={0.8} />
        </lineSegments>
      </group>
    </group>
  );
};

// Pure deterministic pseudo-random generator to satisfy React 19 render purity rules
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Upgraded Kinetic Particle Swarm & Construction Embers
 * 180 luminous construction spark particles floating with dynamic wave mathematics,
 * responding to mouse presence with gentle swirl dynamics.
 */
export const ParticleField: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 180;
  const { mouse } = useThree();

  // Initialize deterministic particle positions and velocity metadata (100% pure)
  const { positions, randomFactors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const factors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r1 = pseudoRandom(i * 3 + 1);
      const r2 = pseudoRandom(i * 3 + 2);
      const r3 = pseudoRandom(i * 3 + 3);

      pos[i * 3] = (r1 - 0.5) * 12;
      pos[i * 3 + 1] = (r2 - 0.5) * 8 - 0.5;
      pos[i * 3 + 2] = (r3 - 0.5) * 8 - 1;

      factors[i * 3] = r1 * Math.PI * 2; // Phase
      factors[i * 3 + 1] = 0.008 + r2 * 0.018; // Speed
      factors[i * 3 + 2] = 0.3 + r3 * 0.7; // Radius / amplitude
    }

    return { positions: pos, randomFactors: factors };
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArr = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const phase = randomFactors[idx];
      const speed = randomFactors[idx + 1];
      const radius = randomFactors[idx + 2];

      // Drift upward with harmonic horizontal wave scaled by radius
      posArr[idx + 1] += speed;
      posArr[idx] += Math.sin(time * 0.8 + phase) * (0.006 * radius);
      posArr[idx + 2] += Math.cos(time * 0.6 + phase) * (0.004 * radius);

      // Mouse interactive deflection
      const dx = posArr[idx] - mouse.x * 4;
      const dy = posArr[idx + 1] - mouse.y * 3;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2.0 && dist > 0.01) {
        const force = (2.0 - dist) * 0.005;
        posArr[idx] += (dx / dist) * force;
        posArr[idx + 1] += (dy / dist) * force;
      }

      // Loop boundary reset
      if (posArr[idx + 1] > 4.5) {
        posArr[idx + 1] = -3.8;
        posArr[idx] = (pseudoRandom(time * 10 + i) - 0.5) * 12;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color={BRAND_YELLOW}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};
