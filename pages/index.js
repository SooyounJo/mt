import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GridSystem } from '../components/Grid';
import LPModel from '../components/models/LPModel';
import RecoModel from '../components/models/RecoModel';
import TurnModel from '../components/models/TurnModel';

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden' }}>
      <Canvas 
        style={{ width: '100%', height: '100%' }}
        camera={{ 
          position: [0, 3, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="studio" intensity={1.5} />
        <GridSystem />
        <RecoModel />
        <LPModel />
        <TurnModel />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
          target={[0, -1.5, 0]}
        />
      </Canvas>
    </div>
  );
}
