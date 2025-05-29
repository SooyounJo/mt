import React from 'react';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Scene3D from '../components/background/3d';
import CameraControls, { useCameraControl } from '../components/camera/control';

export default function Test() {
  const router = useRouter();
  const { destination, name } = router.query;
  
  // 카메라 제어 훅 사용
  const cameraControl = useCameraControl();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {name && (
        <div style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          zIndex: 1200
        }}>{name}-s room</div>
      )}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 1100
      }}>
        <Link href="/intro_page">
          <button
            style={{
              padding: '8px 18px',
              background: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
            }}
          >
            ← 뒤로 가기
          </button>
        </Link>
      </div>
      
      {/* 카메라 컨트롤 UI */}
      <CameraControls cameraControl={cameraControl} />
      
      {/* 페이지 넘김 버튼 */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100
      }}>
        <button
          onClick={() => {
            if (window.AlbumPageControl) {
              window.AlbumPageControl.turnPage();
            }
          }}
          style={{
            padding: '12px 24px',
            background: '#ffe066',
            color: '#222',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontFamily: 'monospace'
          }}
        >
          다음 →
        </button>
      </div>
      
      <Canvas camera={{ position: [6, 0, 15], fov: 35 }} shadows>
        <Scene3D
          destination={destination}
          isOrbitEnabled={cameraControl.isOrbitEnabled}
          fixedCamera={cameraControl.fixedCamera}
          animatingCamera={cameraControl.animatingCamera}
          animationProgress={cameraControl.animationProgress}
          animationDuration={cameraControl.animationDuration}
          cameraFrom={cameraControl.cameraFrom}
          cameraTo={cameraControl.cameraTo}
          setFixedCamera={cameraControl.setFixedCamera}
        />
      </Canvas>
    </div>
  );
} 