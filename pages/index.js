import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Scene3D from '../components/background/3d';
import CameraControls, { useCameraControl } from '../components/camera/control';
import MusicInfoModal from '../components/MusicInfoModal';
import { springTransition } from '../components/albumcontrol';
import { OrbitControls } from '@react-three/drei';
import ClickHereText from '../components/ClickHereText';

// 플레인 코드 매핑 수정
const PLAIN_CODES = {
  // 계절 플레인
  1: { type: 'season', code: 'fall', name: '가을' },    
  2: { type: 'season', code: 'spring', name: '봄' },  
  3: { type: 'season', code: 'winter', name: '겨울' },  
  4: { type: 'season', code: 'summer', name: '여름' },  
  
  // 날씨 플레인
  5: { type: 'weather', code: 'snow', name: '눈' },   
  6: { type: 'weather', code: 'sunny', name: '맑음' },  
  7: { type: 'weather', code: 'windy', name: '바람' },  
  8: { type: 'weather', code: 'rain', name: '비' },   
  
  // 장소 플레인
  9: { type: 'place', code: 'city', name: '도시' },      
  10: { type: 'place', code: 'nature', name: '자연' },   
  11: { type: 'place', code: 'beach', name: '해변' },    
  12: { type: 'place', code: 'historical', name: '역사' },
  13: { type: 'place', code: 'religious', name: '종교' }, 
  14: { type: 'place', code: 'desert', name: '사막' },    
  15: { type: 'place', code: 'museum', name: '박물관' },    
  16: { type: 'place', code: 'festival', name: '축제' }   
};

export default function MainPage() {
  const router = useRouter();
  const { destination, name } = router.query;
  
  // 카메라 제어 훅 사용
  const cameraControl = useCameraControl();
  
  // 입장 시 카메라 1번 뷰로 고정
  React.useEffect(() => {
    cameraControl.setFixedCamera(1);
    cameraControl.setIsOrbitEnabled(false);
  }, []);

  // 입장 시 정보 미입력 시 intro로 리다이렉트
  useEffect(() => {
    if (!name || !destination) {
      router.replace('/intro');
    }
  }, [name, destination]);

  // 버튼 상태 관리 최적화
  const [buttonState, setButtonState] = React.useState({
    canGoNext: true,
    canGoPrevious: false
  });

  // 버튼 투명도 상태 (애니메이션 제거, 항상 1)
  const [buttonOpacity] = React.useState(1);
  
  // 플레인 선택 상태
  const [selections, setSelections] = React.useState({
    season: null,
    weather: null,
    place: null
  });
  
  // 현재 페이지 상태
  const [currentPage, setCurrentPage] = useState(1);
  
  // 음악 관련 상태
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [musicData, setMusicData] = useState(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [showText, setShowText] = useState(true);
  const [currentView, setCurrentView] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  
  // 버튼 상태 업데이트 최적화 (setInterval 제거)
  // 카메라 뷰 변경 감지 최적화 (setInterval 제거, 애니메이션 제거)

  // 플레인 선택 핸들러
  const handlePlainSelect = React.useCallback((plainNumber) => {
    const plainInfo = PLAIN_CODES[plainNumber];
    if (!plainInfo) return;
    setSelections(prev => ({
      ...prev,
      [plainInfo.type]: plainInfo.code
    }));
  }, []);

  // 음악 검색 핸들러
  const handleMusicPlay = React.useCallback(async () => {
    if (!selections.season || !selections.weather || !selections.place) {
      alert('먼저 모든 항목을 선택해주세요.');
      return;
    }
    cameraControl.setFixedCamera(4);
    cameraControl.setIsOrbitEnabled(false);
    try {
      setIsLoadingMusic(true);
      const keywords = Object.entries(selections)
        .map(([type, code]) => {
          const info = Object.values(PLAIN_CODES).find(p => p.type === type && p.code === code);
          return info ? info.name : null;
        })
        .filter(Boolean);
      const response = await fetch('/api/search-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, destination: destination || '여행' })
      });
      if (!response.ok) throw new Error('음악 검색 실패');
      const data = await response.json();
      if (!data.preview) throw new Error('재생 가능한 음악을 찾을 수 없습니다.');
      setMusicData(data);
      setShowMusicModal(true);
    } catch (error) {
      alert(error.message || '음악을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingMusic(false);
    }
  }, [selections, destination, cameraControl]);

  // 페이지 전환 핸들러
  const handlePageTurn = (direction) => {
    if (direction === 'next') {
      setCurrentPage(prev => {
        const nextPage = prev + 1;
        if (nextPage === 2) {
          setSelections({
            season: 'spring',
            weather: 'sunny',
            place: 'nature'
          });
        }
        return nextPage;
      });
    } else {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  // 페이지 버튼 클릭 핸들러
  const handleNextPage = () => {
    if (typeof window !== 'undefined' && window.AlbumPageControl) {
      window.AlbumPageControl.turnPage();
      handlePageTurn('next');
    }
  };
  const handlePrevPage = () => {
    if (typeof window !== 'undefined' && window.AlbumPageControl) {
      window.AlbumPageControl.goToPrevious();
      handlePageTurn('prev');
    }
  };

  const handleTextClick = () => {
    setShowText(false);
    setIsTransitioning(true);
    cameraControl.setIsOrbitEnabled(false);
    cameraControl.startCameraSequence();
    setTimeout(() => {
      setCurrentView(2);
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="relative w-full h-screen">
      <style jsx>{`
        .main-container {
          width: 100vw;
          height: 100vh;
          position: relative;
        }
        
        .scene-container {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
        }
        
        .scene-container > * {
          pointer-events: auto;
        }
        
        /* 재생 버튼 스타일 - 일시적으로 비활성화
        .play-button-container {
          position: fixed;
          bottom: 40px;
          right: 40px;
          z-index: 9999;
        }
        
        .play-button {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #4A90E2;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 18px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          line-height: 1.2;
          padding: 10px;
        }
        
        .play-button:not(:disabled):hover {
          transform: scale(1.05);
          background: #357ABD;
        }
        
        .play-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        */
      `}</style>

      {/* UI Elements */}
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
      
      {/* 뒤로가기 버튼 */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 1100
      }}>
        <Link href="/intro">
          <button style={{
            padding: '8px 18px',
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
          }}>
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
            onClick={handlePrevPage}
            className="nav-button"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 4px 16px rgba(255, 180, 71, 0.10)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#ff3333',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginLeft: buttonState.canGoNext ? 0 : 348
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 4L8 12L16 20" stroke="#ff3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {buttonState.canGoNext && (
          <button
            onClick={handleNextPage}
            className="nav-button"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 4px 16px rgba(255, 180, 71, 0.10)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#ff3333',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginLeft: buttonState.canGoPrevious ? 0 : 348
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 4L16 12L8 20" stroke="#ff3333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* 통합된 Canvas - 성능 최적화 */}
      <Canvas 
        camera={{ position: [6, 0, 15], fov: 35 }} 
        shadows={false}
        dpr={[0.7, 1]}
        performance={{ min: 0.2 }}
        gl={{ 
          antialias: false,
          alpha: false,
          powerPreference: "low-power"
        }}
      >
        {/* Scene3D */}
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
          onMusicPlay={handleMusicPlay}
          isLoadingMusic={isLoadingMusic}
          musicData={musicData}
          isPlaying={isPlaying}
        />
      </Canvas>

      {/* 음악 정보 모달 */}
      {showMusicModal && musicData && (
        <MusicInfoModal
          musicInfo={musicData}
          isOpen={showMusicModal}
          onClose={() => {
            setShowMusicModal(false);
            setMusicData(null);
            setIsPlaying(false);
          }}
          onPlayStatusChange={setIsPlaying}
        />
      )}

      {/* 3D 텍스트 오버레이 */}
      {showText && currentView === 1 && (
        <div className="absolute inset-0 z-50" style={{ pointerEvents: 'auto' }}>
          <Canvas
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'transparent'
            }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <ClickHereText onClick={handleTextClick} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>
      )}

      {/* 기존 카메라 뷰 */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* ... existing camera view code ... */}
      </div>

      {/* 기존 UI 요소들 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* ... other UI elements ... */}
      </div>
    </div>
  );
} 