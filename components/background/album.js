import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { StaticAlbumSet, RotatingAlbumSet, ALBUM_SETS } from './albumset';
import { usePageTurnAnimation } from './albumcontrol';
import { PlayButton } from '../ui/PlayButton';
import { LP } from './lp';
import { TextureLoader } from 'three';

// 앨범 메인 컴포넌트
export default function Album({ onMusicPlay, isLoadingMusic, musicData, isPlaying = false }) {
  // 그룹 ref (나중에 그룹 제어용)
  const groupRef = React.useRef();
  const rightGroupRef = React.useRef(); // 첫 번째 세트: 플레인5-8 + 메인플레인
  const secondGroupRef = React.useRef(); // 두 번째 세트: 플레인13-16 + 메인플레인2

  // 페이지 넘김 애니메이션 훅 사용
  const { updateAnimations } = usePageTurnAnimation();
  
  // 앨범 커버 텍스처 상태
  const [albumTexture, setAlbumTexture] = useState(null);

  // 플레이 버튼 토글 상태
  const [playToggled, setPlayToggled] = useState(false);

  // 앨범 커버 텍스처 로드
  useEffect(() => {
    if (musicData?.cover_big) {
      const loader = new TextureLoader();
      loader.load(
        musicData.cover_big,
        (texture) => {
          setAlbumTexture(texture);
          console.log('앨범 커버 텍스처 로드 완료');
        },
        undefined,
        (error) => {
          console.error('앨범 커버 로드 실패:', error);
        }
      );
    }
  }, [musicData]);

  const handlePlayButtonClick = () => {
    setPlayToggled((prev) => !prev);
    if (onMusicPlay) {
      onMusicPlay();
    }
  };

  // 매 프레임마다 애니메이션 업데이트 - 성능 최적화
  useFrame((_, delta) => {
    // 30fps로 제한하여 성능 향상
    if (delta < 0.033) {
      updateAnimations(delta, rightGroupRef, secondGroupRef);
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* 첫 번째 고정 그룹 (플레인 1-4) */}
      <StaticAlbumSet {...ALBUM_SETS.staticSet1} />
      
      {/* 첫 번째 회전 세트 (플레인 5-12) */}
      <RotatingAlbumSet 
        groupRef={rightGroupRef}
        {...ALBUM_SETS.rotatingSet1}
      />
      
      {/* 두 번째 회전 세트 (플레인 13-16 + 질문) */}
      <RotatingAlbumSet 
        groupRef={secondGroupRef}
        {...ALBUM_SETS.rotatingSet2}
      />

      {/* PlayButton - 토글 효과 및 뒤로 이동 */}
      {musicData && (
        <PlayButton
          position={[-2, -4, 11]}
          onClick={handlePlayButtonClick}
          scale={playToggled ? 1.5 : 1}
          rotation={[-0.3, 0, 0]}
        />
      )}

      {/* 로딩 표시 */}
      {isLoadingMusic && (
        <mesh position={[0, 3, 8]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>
      )}

      {/* LP 레코드 플레이어 - 앨범 커버와 함께 회전 */}
      <LP albumTexture={albumTexture} isPlaying={isPlaying} />
    </group>
  );
} 