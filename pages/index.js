import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
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
import Control from '../components/system/Control';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, z: 0 });
  const [activeModel, setActiveModel] = useState(null);

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

  const handleModelChange = (model) => {
    setActiveModel(model);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Grid mousePosition={mousePosition} />

      <Canvas 
        onPointerMove={handlePointerMove}
        shadows={{ 
          type: 'PCFSoftShadowMap',
          enabled: true
        }}
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          physicallyCorrectLights: true,
          shadowMap: { type: THREE.PCFSoftShadowMap }
        }}
      >
        <Control />
        <Light />
        
        <Background receiveShadow castShadow />
        <GridSystem receiveShadow />
        <RecoModel receiveShadow castShadow />
        <LPModel receiveShadow castShadow />
        <TurnModel receiveShadow castShadow />
        <Season 
          receiveShadow 
          castShadow 
          visible={activeModel === 'season'}
        />
        <Weather 
          receiveShadow 
          castShadow 
          visible={activeModel === 'weather'}
        />
        <Place 
          receiveShadow 
          castShadow 
          visible={activeModel === 'place'}
        />
        <Model123 
          receiveShadow 
          castShadow 
          onModelChange={handleModelChange}
        />
      </Canvas>
    </div>
  );
}
