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
  
  // 버튼 상태 관리 (클라이언트 사이드)
  const [buttonState, setButtonState] = React.useState({
    canGoNext: true,
    canGoPrevious: false
  });
  
  // 클라이언트 사이드에서 버튼 상태 업데이트
  React.useEffect(() => {
    const updateButtonState = () => {
      if (typeof window !== 'undefined' && window.AlbumPageControl) {
        setButtonState({
          canGoNext: window.AlbumPageControl.canGoNext,
          canGoPrevious: window.AlbumPageControl.canGoPrevious
        });
      }
    };
    
    // 초기 상태 설정
    updateButtonState();
    
    // 주기적으로 상태 확인 (애니메이션 상태 변화 감지)
    const interval = setInterval(updateButtonState, 100);
    
    return () => clearInterval(interval);
  }, []);

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
        zIndex: 1100,
        display: 'flex',
        gap: 12
      }}>
        {/* 이전 버튼 - 애니메이션 단계가 0보다 클 때만 표시 */}
        {buttonState.canGoPrevious && (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.AlbumPageControl) {
                window.AlbumPageControl.goToPrevious();
              }
            }}
            style={{
              padding: '12px 24px',
              background: '#888',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontFamily: 'monospace'
            }}
          >
            ← 이전
          </button>
        )}
        
        {/* 다음 버튼 - 더 이상 진행할 수 없을 때는 숨김 */}
        {buttonState.canGoNext && (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.AlbumPageControl) {
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
        )}
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