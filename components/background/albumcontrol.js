import React from 'react';
import { useFrame } from '@react-three/fiber';

// 호버링 효과 설정
const HOVER_CONFIG = {
  scale: 1.15,           // 호버 시 크기 (15% 확대)
  duration: 0.15,        // 애니메이션 지속시간 (초)
  smoothness: 8          // 애니메이션 부드러움 정도
};

// 개별 미니플레인 컴포넌트 (호버링 효과 포함)
export function AnimatedMiniPlane({ position, planeNumber, ...props }) {
  const meshRef = React.useRef();
  const [hovered, setHovered] = React.useState(false);
  const targetScale = React.useRef(1);
  const currentScale = React.useRef(1);

  // 매 프레임마다 스케일 보간
  useFrame((_, delta) => {
    if (meshRef.current) {
      targetScale.current = hovered ? HOVER_CONFIG.scale : 1;
      
      // 부드러운 스케일 전환
      currentScale.current += (targetScale.current - currentScale.current) * HOVER_CONFIG.smoothness * delta;
      
      meshRef.current.scale.set(
        currentScale.current,
        currentScale.current,
        currentScale.current
      );
    }
  });

  const handlePointerEnter = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = () => {
    console.log(`플레인${planeNumber} 클릭됨!`);
    // 여기에 클릭 이벤트 로직 추가 가능
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[Math.PI/2, 0, 0]}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      receiveShadow
      castShadow
      {...props}
    >
      <boxGeometry args={[0.8, 0.8, 0.1]} />
      <meshStandardMaterial color="#fff" />
    </mesh>
  );
}

// 호버링 설정을 외부에서 조정할 수 있는 제어 함수들
export const AlbumControlAPI = {
  // 호버링 스케일 조정
  setHoverScale: (scale) => {
    HOVER_CONFIG.scale = scale;
  },
  
  // 애니메이션 부드러움 조정
  setSmoothness: (smoothness) => {
    HOVER_CONFIG.smoothness = smoothness;
  },
  
  // 현재 설정 가져오기
  getConfig: () => ({ ...HOVER_CONFIG }),
  
  // 기본값으로 리셋
  resetConfig: () => {
    HOVER_CONFIG.scale = 1.15;
    HOVER_CONFIG.smoothness = 8;
  }
};

// 전역에서 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.AlbumControl = AlbumControlAPI;
} 