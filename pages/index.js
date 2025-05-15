import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import GridSystem from '../components/system/GridSystem';
import RecoModel from '../components/models/recode/RecoModel';
import LPModel from '../components/models/recode/LPModel';
import TurnModel from '../components/models/recode/TurnModel';
import Background from '../components/background/Background';
import Grid from '../components/system/Grid';
import GridBall from '../components/system/GridBall';
import Light from '../components/background/Light';
import Control from '../components/system/Control';
import IntroOverlay from '../components/IntroOverlay';
import BlurredFullBG from '../components/background/BlurredFullBG';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, z: 0 });
  const [activeModel, setActiveModel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [seasonOnLP, setSeasonOnLP] = useState(false);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null); // 'place' | 'season' | 'weather' | null
  const [showIntro, setShowIntro] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

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

  const handleIntroSubmit = (info) => {
    setUserInfo(info);
    setShowIntro(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showIntro && <BlurredFullBG />}
      {showIntro && <IntroOverlay onSubmit={handleIntroSubmit} />}
      {!showIntro && <Grid mousePosition={mousePosition} />}
      {!showIntro && (
        <button
          onClick={() => setIsGridVisible(!isGridVisible)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1000,
            fontFamily: 'monospace'
          }}
        >
          {isGridVisible ? '그리드 숨기기' : '그리드 보이기'}
        </button>
      )}
      {!showIntro && (
        <Canvas 
          onPointerMove={handlePointerMove}
          shadows={{ 
            type: 'PCFSoftShadowMap',
            enabled: true
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
          <GridSystem receiveShadow visible={isGridVisible} />
          <RecoModel receiveShadow castShadow />
          <LPModel receiveShadow castShadow travelText={userInfo?.destination} />
          <TurnModel receiveShadow castShadow />
        </Canvas>
      )}
    </div>
  );
}
