import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Robot3D, ParticleField, ArchitecturalGrid } from './Robot3D';

export const HeroCanvas: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 12, 6]} intensity={1.4} />
      <directionalLight position={[-8, -4, -4]} intensity={0.8} color="#FFD100" />
      <ArchitecturalGrid />
      <Robot3D />
      <ParticleField />
    </Canvas>
  );
};
