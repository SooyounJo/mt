import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import GridSystem from '../components/models/GridSystem';
import RecoModel from '../components/models/RecoModel';
import LPModel from '../components/models/LPModel';
import TurnModel from '../components/models/TurnModel';
import Background from '../components/models/Background';
import Season from '../components/models/Season';

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={2}
          maxDistance={10}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[-5, 5, 5]} 
          intensity={1.5} 
          castShadow
        />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow
        />
        <Environment preset="city" />
        
        {/* <Background /> */}
        <GridSystem />
        <RecoModel />
        <LPModel />
        <TurnModel />
        <Season />
      </Canvas>
    </div>
  );
}
