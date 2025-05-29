import React from 'react';
import { useFrame } from '@react-three/fiber';
import { StaticAlbumSet, RotatingAlbumSet, ALBUM_SETS } from './albumset';
import { usePageTurnAnimation } from './albumcontrol';

// 앨범 메인 컴포넌트
export default function Album() {
  // 그룹 ref (나중에 그룹 제어용)
  const groupRef = React.useRef();
  const rightGroupRef = React.useRef(); // 첫 번째 세트: 플레인5-8 + 메인플레인
  const secondGroupRef = React.useRef(); // 두 번째 세트: 플레인13-16 + 메인플레인2

  // 페이지 넘김 애니메이션 훅 사용
  const { updateAnimations } = usePageTurnAnimation();

  // 매 프레임마다 애니메이션 업데이트
  useFrame((_, delta) => {
    updateAnimations(delta, rightGroupRef, secondGroupRef);
  });
  
  return (
    <group ref={groupRef}>
      {/* 첫 번째 고정 그룹 (플레인 1-4) */}
      <StaticAlbumSet {...ALBUM_SETS.staticSet1} />
      
      {/* 두 번째 고정 그룹 (플레인 21-24) */}
      <StaticAlbumSet {...ALBUM_SETS.staticSet2} />
      
      {/* 첫 번째 회전 세트 (플레인 5-12) */}
      <RotatingAlbumSet 
        groupRef={rightGroupRef}
        {...ALBUM_SETS.rotatingSet1}
      />
      
      {/* 두 번째 회전 세트 (플레인 13-20) */}
      <RotatingAlbumSet 
        groupRef={secondGroupRef}
        {...ALBUM_SETS.rotatingSet2}
      />
    </group>
  );
} 