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
import GridBall from '../components/system/GridBall';
import Light from '../components/background/Light';
import Control from '../components/system/Control';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, z: 0 });
  const [activeModel, setActiveModel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [seasonOnLP, setSeasonOnLP] = useState(false);

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

  const handleSeasonDrop = (isOnLP) => {
    setSeasonOnLP(isOnLP);
  };

  const isSeasonVisible = seasonOnLP || activeModel === 'season';
  const isWeatherVisible = activeModel === 'weather';
  const isPlaceVisible = activeModel === 'place';

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Grid mousePosition={mousePosition} />

      <Canvas 
        onPointerMove={handlePointerMove}
        shadows={{ 
          type: 'PCFSoftShadowMap',
          enabled: true
        }}
        camera={{ position: [10, 5, -12], fov: 50 }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, -3);
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          physicallyCorrectLights: true,
          shadowMap: { type: THREE.PCFSoftShadowMap }
        }}
      >
        <Control isDragging={isDragging} />
        <Light />
        <GridBall />
        
        <Background receiveShadow castShadow />
        <GridSystem receiveShadow />
        <RecoModel receiveShadow castShadow />
        <LPModel receiveShadow castShadow />
        <TurnModel receiveShadow castShadow />
        <Season 
          receiveShadow 
          castShadow 
          visible={isSeasonVisible}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onDrop={handleSeasonDrop}
        />
        <Weather 
          receiveShadow 
          castShadow 
          visible={isWeatherVisible}
        />
        <Place 
          receiveShadow 
          castShadow 
          visible={isPlaceVisible}
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
