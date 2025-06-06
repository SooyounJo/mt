import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Scene3D from '../components/background/3d';
import CameraControls, { useCameraControl } from '../components/camera/control';
import MusicModal from './MusicModal';
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
  
  // 전역에서 카메라 컨트롤 접근 가능하도록 설정
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.cameraControl = cameraControl;
    }
  }, [cameraControl]);
  
  // 버튼 상태 관리
  const [buttonState, setButtonState] = React.useState({
    canGoNext: true,
    canGoPrevious: false
  });

  // 버튼 투명도 상태 관리
  const [buttonOpacity, setButtonOpacity] = React.useState(0);
  
  // 플레인 선택 상태를 더 명확하게 관리
  const [selections, setSelections] = useState({
    season: null,
    weather: null,
    place: null
  });
  
  // 현재 페이지 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  
  // 음악 생성 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  
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

  // 디버깅을 위한 상태 로그
  useEffect(() => {
    console.log('현재 선택 상태:', selections);
  }, [selections]);

  // 디버깅을 위한 상태 로그 추가
  useEffect(() => {
    console.log('=== 재생 버튼 상태 디버깅 ===');
    console.log('isGenerating:', isGenerating);
    console.log('selections:', selections);
    console.log('선택된 계절:', selections.season);
    console.log('선택된 날씨:', selections.weather);
    console.log('선택된 장소:', selections.place);
    console.log('재생버튼 비활성화 여부:', isGenerating || !selections.season || !selections.weather || !selections.place);
  }, [isGenerating, selections]);

  // 디버깅을 위한 상태 로그 추가
  useEffect(() => {
    console.log('=== 현재 선택 상태 ===');
    console.log('계절:', selections.season ? PLAIN_CODES[Object.keys(PLAIN_CODES).find(key => PLAIN_CODES[key].type === 'season' && PLAIN_CODES[key].code === selections.season)]?.name : '선택 안됨');
    console.log('날씨:', selections.weather ? PLAIN_CODES[Object.keys(PLAIN_CODES).find(key => PLAIN_CODES[key].type === 'weather' && PLAIN_CODES[key].code === selections.weather)]?.name : '선택 안됨');
    console.log('장소:', selections.place ? PLAIN_CODES[Object.keys(PLAIN_CODES).find(key => PLAIN_CODES[key].type === 'place' && PLAIN_CODES[key].code === selections.place)]?.name : '선택 안됨');
    console.log('전체 선택 상태:', selections);
  }, [selections]);

  // 플레인 선택 핸들러 개선
  const handlePlainSelect = (plainNumber) => {
    console.log(`\n=== 플레인 ${plainNumber}번 선택됨 ===`);
    
    const plainInfo = PLAIN_CODES[plainNumber];
    if (!plainInfo) {
      console.error('오류: 유효하지 않은 플레인 번호:', plainNumber);
      return;
    }

    console.log('선택된 정보:', {
      종류: plainInfo.type,
      코드: plainInfo.code,
      이름: plainInfo.name
    });

    setSelections(prev => {
      const newSelections = {
        ...prev,
        [plainInfo.type]: plainInfo.code
      };
      
      console.log('=== 선택 후 상태 ===');
      console.log('이전 상태:', prev);
      console.log('새로운 상태:', newSelections);
      console.log('활성화 조건 충족 여부:', Boolean(newSelections.season && newSelections.weather && newSelections.place));
      
      return newSelections;
    });
  };

  // 재생 버튼 핸들러 개선
  const handlePlay = async () => {
    console.log('=== 재생 버튼 클릭 ===');
    console.log('현재 선택 상태:', {
      계절: selections.season,
      날씨: selections.weather,
      장소: selections.place
    });

    if (!selections.season || !selections.weather || !selections.place) {
      const missing = [];
      if (!selections.season) missing.push('계절');
      if (!selections.weather) missing.push('날씨');
      if (!selections.place) missing.push('장소');
      
      alert(`다음 항목을 선택해주세요: ${missing.join(', ')}`);
      return;
    }

    try {
      setIsGenerating(true);
      console.log('음악 생성 시작');
      
      await springTransition();

      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seasonCode: selections.season,
          weatherCode: selections.weather,
          placeCode: selections.place
        })
      });

      let data;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.log('서버 응답 (raw):', text);
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            throw new Error('서버 응답을 처리할 수 없습니다. 관리자에게 문의해주세요.');
          }
        }
      } catch (parseError) {
        console.error('응답 처리 오류:', parseError);
        if (response.status === 402) {
          throw new Error('크레딧이 부족합니다. 크레딧을 충전해주세요.');
        } else if (response.status === 429) {
          throw new Error('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (response.status === 401) {
          throw new Error('API 키가 유효하지 않습니다. 관리자에게 문의해주세요.');
        } else if (response.status === 403) {
          throw new Error('크레딧이 부족하거나 API 접근 권한이 없습니다.');
        }
        throw new Error('서버 응답을 처리할 수 없습니다. 관리자에게 문의해주세요.');
      }

      if (!response.ok) {
        console.error('서버 오류 응답:', data);
        throw new Error(data.error || `서버 오류가 발생했습니다. (${response.status})`);
      }

      if (!data.audioUrl) {
        console.error('오디오 URL 누락:', data);
        throw new Error('생성된 음악을 찾을 수 없습니다.');
      }

      console.log('생성된 음악 정보:', data);
      setAudioUrl(data.audioUrl);
      setShowMusicModal(true);
    } catch (error) {
      console.error('음악 생성 오류:', error);
      alert(error.message || '음악 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

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
        <Link href="/intro_page">
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

      {/* 통합된 Canvas */}
      <Canvas camera={{ position: [6, 0, 15], fov: 35 }} shadows>
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
        />
      </Canvas>

      {/* 재생 버튼 */}
      <div className="play-button-container">
        <button
          onClick={handlePlay}
          disabled={isGenerating || !selections.season || !selections.weather || !selections.place}
          className="play-button"
        >
          {isGenerating ? '음악 생성 중...' : (
            !selections.season || !selections.weather || !selections.place ? 
            `선택 필요:\n${!selections.season ? '계절 ' : ''}${!selections.weather ? '날씨 ' : ''}${!selections.place ? '장소' : ''}`
              .trim()
              .split('\n')
              .join('\n') : 
            '재생'
          )}
        </button>
      </div>

      {/* 음악 재생 모달 */}
      {showMusicModal && (
        <MusicModal
          audioUrl={audioUrl}
          onClose={() => {
            setShowMusicModal(false);
            setAudioUrl(null);
          }}
        />
      )}
    </div>
  );
} 