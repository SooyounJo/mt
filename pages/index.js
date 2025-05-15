import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import RecoModel from '../components/models/recode/RecoModel';
import LPModel from '../components/models/recode/LPModel';
import TurnModel from '../components/models/recode/TurnModel';
import Background from '../components/background/Background';
import Light from '../components/background/Light';
import Control from '../components/system/Control';
import IntroOverlay from '../components/IntroOverlay';
import First from '../components/background/first';

export default function Home() {
  const [activeModel, setActiveModel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [seasonOnLP, setSeasonOnLP] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null); // 'place' | 'season' | 'weather' | null
  const [showIntro, setShowIntro] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

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
      {showIntro && <First />}
      {showIntro && <IntroOverlay onSubmit={handleIntroSubmit} />}
      {!showIntro && (
        <Canvas 
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
          <Background receiveShadow castShadow />
          <RecoModel receiveShadow castShadow />
          <LPModel receiveShadow castShadow travelText={userInfo?.destination} />
          <TurnModel receiveShadow castShadow />
        </Canvas>
      )}
    </div>
  );
}
