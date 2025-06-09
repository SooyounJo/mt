import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { StaticAlbumSet, RotatingAlbumSet, ALBUM_SETS } from './albumset';
import { usePageTurnAnimation } from './albumcontrol';
import { PlayButton } from '../ui/PlayButton';
import { TextureLoader } from 'three';

// 앨범 메인 컴포넌트
export default function Album({ onMusicPlay, isLoadingMusic, musicData }) {
  // 그룹 ref (나중에 그룹 제어용)
  const groupRef = React.useRef();
  const rightGroupRef = React.useRef(); // 첫 번째 세트: 플레인5-8 + 메인플레인
  const secondGroupRef = React.useRef(); // 두 번째 세트: 플레인13-16 + 메인플레인2

  // 페이지 넘김 애니메이션 훅 사용
  const { updateAnimations } = usePageTurnAnimation();
  
  // 앨범 커버 텍스처 상태
  const [albumTexture, setAlbumTexture] = useState(null);
  const albumPlaneRef = React.useRef();

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
    console.log('PlayButton 클릭됨!');
    if (onMusicPlay) {
      onMusicPlay();
    }
  };

  // 매 프레임마다 애니메이션 업데이트
  useFrame((_, delta) => {
    updateAnimations(delta, rightGroupRef, secondGroupRef);
    
    // 앨범 커버 회전 애니메이션
    if (albumPlaneRef.current && albumTexture) {
      albumPlaneRef.current.rotation.z += delta * 0.5;
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

      {/* PlayButton - "플레이 백 유어 트레블 메모리즈" 근처에 배치 */}
      <PlayButton
        position={[0, 2, 8]}
        onClick={handlePlayButtonClick}
        scale={isLoadingMusic ? 0.8 : 1}
        rotation={[0, 0, 0]}
      />

      {/* 로딩 표시 */}
      {isLoadingMusic && (
        <mesh position={[0, 3, 8]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>
      )}

      {/* 앨범 커버 동그란 플레인 */}
      {albumTexture && (
        <mesh ref={albumPlaneRef} position={[3, 0, 8]}>
          <circleGeometry args={[1.5, 32]} />
          <meshStandardMaterial 
            map={albumTexture} 
            transparent={true}
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
} 