import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Scene3D from '../components/background/3d';
import CameraControls, { useCameraControl } from '../components/camera/control';
import MusicInfoModal from '../components/MusicInfoModal';
import { springTransition } from '../components/albumcontrol';

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
  

  
  // 버튼 상태 관리 최적화
  const [buttonState, setButtonState] = React.useState({
    canGoNext: true,
    canGoPrevious: false
  });

  // 버튼 투명도 상태 메모이제이션
  const [buttonOpacity, setButtonOpacity] = React.useState(0);
  
  // 플레인 선택 상태를 메모이제이션
  const [selections, setSelections] = React.useState({
    season: null,
    weather: null,
    place: null
  });
  
  // 현재 페이지 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  
  // 음악 관련 상태
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [musicData, setMusicData] = useState(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 성능 최적화: 불필요한 상태 업데이트 방지
  const updateButtonState = React.useCallback(() => {
    if (typeof window !== 'undefined' && window.AlbumPageControl) {
      setButtonState(prev => {
        const next = {
          canGoNext: window.AlbumPageControl.canGoNext,
          canGoPrevious: window.AlbumPageControl.canGoPrevious
        };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    }
  }, []);

  // 버튼 상태 업데이트 최적화
  React.useEffect(() => {
    updateButtonState();
    const interval = setInterval(updateButtonState, 200); // 간격 늘림
    return () => clearInterval(interval);
  }, [updateButtonState]);

  // 카메라 뷰 변경 감지 최적화
  React.useEffect(() => {
    let fadeInInterval;
    if (cameraControl.fixedCamera === 3) {
      fadeInInterval = setInterval(() => {
        setButtonOpacity(prev => {
          if (prev >= 1) {
            clearInterval(fadeInInterval);
            return 1;
          }
          return prev + 0.1; // 스텝 크기 증가
        });
      }, 100); // 간격 늘림
    } else {
      setButtonOpacity(0);
    }
    return () => {
      if (fadeInInterval) clearInterval(fadeInInterval);
    };
  }, [cameraControl.fixedCamera]);

  // 플레인 선택 핸들러 메모이제이션
  const handlePlainSelect = React.useCallback((plainNumber) => {
    const plainInfo = PLAIN_CODES[plainNumber];
    if (!plainInfo) return;

    setSelections(prev => {
      const newSelections = {
        ...prev,
        [plainInfo.type]: plainInfo.code
      };
      return newSelections;
    });
  }, []);

  // 음악 검색 핸들러 메모이제이션
  const handleMusicPlay = React.useCallback(async () => {
    if (!selections.season || !selections.weather || !selections.place) {
      const missing = [];
      if (!selections.season) missing.push('계절');
      if (!selections.weather) missing.push('날씨');
      if (!selections.place) missing.push('장소');
      
      alert(`먼저 다음 항목을 선택해주세요: ${missing.join(', ')}`);
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

      console.log('🎵 검색 키워드:', keywords);
      console.log('📍 목적지:', destination);

      // API 호출
      const response = await fetch('/api/search-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keywords,
          destination: destination || '여행'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API 응답 오류:', response.status, errorData);
        throw new Error(errorData.message || `음악 검색 실패 (상태: ${response.status})`);
      }

      const data = await response.json();
      console.log('🎵 검색 결과:', data);

      if (!data.preview) {
        throw new Error('재생 가능한 음악을 찾을 수 없습니다.');
      }

      setMusicData(data);
      
      // 카메라 이동 후 모달 표시 (1초 지연)
      setTimeout(() => {
        setShowMusicModal(true);
      }, 1000);

    } catch (error) {
      console.error('음악 검색 오류:', error);
      const errorMessage = error.message || '음악을 불러오는 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsLoadingMusic(false);
    }
  }, [selections, destination, cameraControl]);

  // 전역에서 카메라 컨트롤과 플레인 선택 핸들러 접근 가능하도록 설정
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.cameraControl = cameraControl;
      window.handlePlainSelect = handlePlainSelect;
      
      // Zustand 스토어와 메인 페이지 상태를 동기화
      window.syncPlaneSelection = (planeNumber) => {
        handlePlainSelect(planeNumber);
      };
    }
  }, [cameraControl, handlePlainSelect]);

  // 페이지 전환 핸들러 추가
  const handlePageTurn = (direction) => {
    if (direction === 'next') {
      setCurrentPage(prev => {
        const nextPage = prev + 1;
        // 2번째 페이지로 넘어갈 때 자동으로 플레인 선택
        if (nextPage === 2) {
          setSelections({
            season: 'spring',  // 2번 플레인의 계절
            weather: 'sunny',  // 6번 플레인의 날씨
            place: 'nature'    // 10번 플레인의 장소
          });
        }
        return nextPage;
      });
    } else {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  // 페이지 버튼 클릭 핸들러 수정
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

  return (
    <div className="main-container">
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
              marginLeft: buttonState.canGoNext ? 0 : 348
            }}
          >
            ←
          </button>
        )}
        
        {buttonState.canGoNext && (
          <button
            onClick={handleNextPage}
            className="nav-button"
            style={{
              marginLeft: buttonState.canGoPrevious ? 0 : 348
            }}
          >
            →
          </button>
        )}
      </div>

      {/* 통합된 Canvas - 성능 최적화 */}
      <Canvas 
        camera={{ position: [6, 0, 15], fov: 35 }} 
        shadows={false}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: false,
          alpha: false,
          powerPreference: "high-performance"
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
    </div>
  );
} 