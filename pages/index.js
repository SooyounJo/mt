import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import GridSystem from '../components/system/GridSystem';
import RecoModel from '../components/models/recode/RecoModel';
import LPModel from '../components/models/recode/LPModel';
import TurnModel from '../components/models/recode/TurnModel';
import Background from '../components/background/Background';
import Season from '../components/models/mini-block/Season';
import Weather from '../components/models/mini-block/Weather';
import Place from '../components/models/mini-block/Place';
import Model123 from '../components/models/mini-block/123';
import Grid from '../components/system/Grid';
import Light from '../components/background/Light';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, z: 0 });

  const handlePointerMove = (event) => {
    if (event.intersects && event.intersects.length > 0) {
      const point = event.intersects[0].point;
      setMousePosition({
        x: point.x.toFixed(2),
        y: point.y.toFixed(2),
        z: point.z.toFixed(2)
      });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Grid mousePosition={mousePosition} />

      <Canvas onPointerMove={handlePointerMove}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls 
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          minDistance={2}
          maxDistance={40}
        />
        
        <Light />
        
        <Environment preset="sunset" />
        
        <Background />
        <GridSystem />
        <RecoModel />
        <LPModel />
        <TurnModel />
        <Season />
        <Weather />
        <Place />
        <Model123 />
      </Canvas>
    </div>
  );
}
