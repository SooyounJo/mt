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
  
  // 전역에서 카메라 컨트롤 접근 가능하도록 설정
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.cameraControl = cameraControl;
    }
  }, [cameraControl]);
  
  // 버튼 상태 관리 (클라이언트 사이드)
  const [buttonState, setButtonState] = React.useState({
    canGoNext: true,
    canGoPrevious: false
  });

  // 버튼 투명도 상태 관리
  const [buttonOpacity, setButtonOpacity] = React.useState(0);
  
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

  // 카메라 뷰 변경 감지 및 버튼 투명도 조절
  React.useEffect(() => {
    if (cameraControl.fixedCamera === 3) {
      // 3번 뷰일 때 서서히 나타나게
      const fadeIn = setInterval(() => {
        setButtonOpacity(prev => {
          if (prev >= 1) {
            clearInterval(fadeIn);
            return 1;
          }
          return prev + 0.05;
        });
      }, 50);
      return () => clearInterval(fadeIn);
    } else {
      // 다른 뷰일 때는 투명하게
      setButtonOpacity(0);
    }
  }, [cameraControl.fixedCamera]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <style jsx>{`
        .nav-button {
          padding: 12px 18px;
          background: #888;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-family: monospace;
          transition: background-color 0.2s ease;
        }
        .nav-button:hover,
        .nav-button:active {
          background: #222;
        }
      `}</style>
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
        transform: 'translate(calc(-50% + 330px), -260px)',
        zIndex: 1100,
        display: 'flex',
        gap: 300,
        opacity: buttonOpacity,
        transition: 'opacity 0.3s ease'
      }}>
        {buttonState.canGoPrevious && (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.AlbumPageControl) {
                window.AlbumPageControl.goToPrevious();
              }
            }}
            className="nav-button"
            style={{
              marginLeft: buttonState.canGoNext ? 0 : 348
            }}
          >
            ←
          </button>
        )}
        
        {buttonState.canGoNext && (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.AlbumPageControl) {
                window.AlbumPageControl.turnPage();
              }
            }}
            className="nav-button"
            style={{
              marginLeft: buttonState.canGoPrevious ? 0 : 348
            }}
          >
            →
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