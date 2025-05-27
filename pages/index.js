import React, { useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import * as THREE from 'three';
import RecoModel from '../components/models/recode/RecoModel';
import LPModel from '../components/models/recode/LPModel';
import TurnModel from '../components/models/recode/TurnModel';
import Background from '../components/background/Background';
import Light from '../components/background/Light';
import Control from '../components/system/Control';
import IntroOverlay from '../components/IntroOverlay';
import First from '../components/background/first';
import Filter from '../components/effects/Filter';
import Book from '../components/models/book';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const [activeModel, setActiveModel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [seasonOnLP, setSeasonOnLP] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null); // 'place' | 'season' | 'weather' | null
  const [showIntro, setShowIntro] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [isOrbitEnabled, setIsOrbitEnabled] = useState(true);
  const [isRecoCloseup, setIsRecoCloseup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // OrbitControls 비활성화 시 카메라 위치 고정
    // CameraMotion에서 처리하므로 여기선 필요 없음
  }, [isOrbitEnabled]);

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
    // test.js로 바로 이동 (쿼리스트링 전달)
    router.push({
      pathname: '/test',
      query: { name: info.name, destination: info.destination }
    });
  };

  // 카메라 애니메이션
  function CameraMotion() {
    const { camera } = useThree();
    useFrame(() => {
      if (isRecoCloseup) {
        // 목표 위치와 각도 (상단뷰 클로즈업)
        const targetPos = [0, 10, 0];
        const targetLook = [0, 0, 0];
        camera.position.lerp(
          { x: targetPos[0], y: targetPos[1], z: targetPos[2] },
          0.08
        );
        camera.lookAt(...targetLook);
        camera.updateProjectionMatrix();
      } else if (!isOrbitEnabled) {
        // OrbitControls 비활성화 시 기본 위치로
        const defaultPos = [3, 8, 7];
        const defaultLook = [2, 0, 0];
        camera.position.lerp(
          { x: defaultPos[0], y: defaultPos[1], z: defaultPos[2] },
          0.08
        );
        camera.lookAt(...defaultLook);
        camera.updateProjectionMatrix();
      }
    });
    return null;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100
      }}>
        <Link href="/test">
          <button
            style={{
              padding: '10px 24px',
              background: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
            }}
          >
            test
          </button>
        </Link>
      </div>
      {!showIntro && (
        <button
          onClick={() => setIsOrbitEnabled((prev) => !prev)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            padding: '8px 16px',
            backgroundColor: isOrbitEnabled ? '#222' : '#888',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1000,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          {isOrbitEnabled ? '뷰 고정' : '뷰 해제'}
        </button>
      )}
      {!showIntro && (
        <button
          onClick={() => setIsRecoCloseup(true)}
          style={{
            position: 'absolute',
            left: 24,
            bottom: 24,
            width: 56,
            height: 56,
            background: 'none',
            border: 'none',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="20" fill="#e53935" />
            <polygon points="16,12 30,20 16,28" fill="#fff" />
          </svg>
        </button>
      )}
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
          camera={{ position: [5, 7, -10], fov: 20 }}
        >
          <Stats />
          <CameraMotion />
          <Control isDragging={isDragging} enabled={isOrbitEnabled && !isRecoCloseup} />
          <Light />
          <Background receiveShadow castShadow />
          <RecoModel receiveShadow castShadow />
          <LPModel receiveShadow castShadow travelText={userInfo?.destination} />
          <TurnModel receiveShadow castShadow />
          <Book receiveShadow castShadow />
          <Filter isRecoCloseup={isRecoCloseup} />
        </Canvas>
      )}
    </div>
  );
}
