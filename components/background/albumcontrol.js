import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';

// LP 모델 기본 설정
const LP_CONFIG = {
  radius: 1.2,
  height: 0.05,
  segments: 32,
  color: '#1a1a1a',
  metalness: 0.8,
  roughness: 0.2
};

// LP 컴포넌트
export function LP({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const lpRef = useRef();

  useFrame(() => {
    if (lpRef.current) {
      lpRef.current.rotation.y += 0.01; // 회전 애니메이션
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* LP 본체 */}
      <Cylinder
        ref={lpRef}
        args={[LP_CONFIG.radius, LP_CONFIG.radius, LP_CONFIG.height, LP_CONFIG.segments]}
      >
        <meshStandardMaterial
          color={LP_CONFIG.color}
          metalness={LP_CONFIG.metalness}
          roughness={LP_CONFIG.roughness}
        />
      </Cylinder>
      
      {/* LP 중앙 라벨 */}
      <Cylinder
        args={[0.2, 0.2, LP_CONFIG.height + 0.001, LP_CONFIG.segments]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.5}
          roughness={0.5}
        />
      </Cylinder>
    </group>
  );
}

// 호버링 효과 설정
const HOVER_CONFIG = {
  scale: 1.15,           // 호버 시 크기 (15% 확대)
  duration: 0.15,        // 애니메이션 지속시간 (초)
  smoothness: 8          // 애니메이션 부드러움 정도
};

// 개별 미니플레인 컴포넌트 (호버링 효과 포함)
export function AnimatedMiniPlane({ position, planeNumber, color = "#fff", onClick, ...props }) {
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

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    console.log(`플레인${planeNumber} 클릭됨!`);
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
      <meshStandardMaterial 
        color={color}
        emissive={hovered ? "#666" : "#000"}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
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

// 페이지 넘김 애니메이션 훅
export function usePageTurnAnimation() {
  // 애니메이션 상태
  const [firstSetAnimating, setFirstSetAnimating] = React.useState(false);
  const [secondSetAnimating, setSecondSetAnimating] = React.useState(false);
  const [firstSetProgress, setFirstSetProgress] = React.useState(0);
  const [secondSetProgress, setSecondSetProgress] = React.useState(0);
  const [currentSet, setCurrentSet] = React.useState(1); // 1: 첫 번째 세트, 2: 두 번째 세트
  const [animationStep, setAnimationStep] = React.useState(0); // 0: 초기, 1: 1세트 완료, 2: 2세트 완료
  const [reverseAnimating, setReverseAnimating] = React.useState(false); // 역방향 애니메이션
  const animationDuration = 1.5; // 1.5초 애니메이션
  
  // 피봇 포인트들
  const firstPivotPoint = [0.8, -5.44, 11.8]; // 첫 번째 세트 피봇
  const secondPivotPoint = [0.8, -5.34, 11.8]; // 두 번째 세트 피봇
  
  // 애니메이션 시작 함수
  const startPageTurn = () => {
    if (currentSet === 1 && !firstSetAnimating && animationStep === 0) {
      setFirstSetAnimating(true);
      setFirstSetProgress(0);
    } else if (currentSet === 2 && !secondSetAnimating && animationStep === 1) {
      setSecondSetAnimating(true);
      setSecondSetProgress(0);
    }
  };
  
  // 이전 버튼 함수 (역방향 또는 리셋)
  const goToPrevious = () => {
    if (animationStep === 1 && !reverseAnimating) {
      // 1세트 역방향 애니메이션
      setReverseAnimating(true);
      setFirstSetProgress(1); // 1에서 시작해서 0으로
    } else if (animationStep === 2 && !reverseAnimating) {
      // 2세트 역방향 애니메이션  
      setReverseAnimating(true);
      setSecondSetProgress(1); // 1에서 시작해서 0으로
    }
  };
  
  // 전역 컨트롤 API
  React.useEffect(() => {
    window.AlbumPageControl = {
      turnPage: startPageTurn,
      goToPrevious: goToPrevious,
      animationStep: animationStep,
      canGoNext: (currentSet === 1 && animationStep === 0) || (currentSet === 2 && animationStep === 1),
      canGoPrevious: animationStep > 0 && !reverseAnimating
    };
    return () => {
      delete window.AlbumPageControl;
    };
  }, [currentSet, firstSetAnimating, secondSetAnimating, firstSetProgress, animationStep, reverseAnimating]);

  // 애니메이션 업데이트 함수
  const updateAnimations = (delta, rightGroupRef, secondGroupRef) => {
    // 첫 번째 세트 애니메이션 (정방향)
    if (firstSetAnimating && rightGroupRef.current && !reverseAnimating) {
      setFirstSetProgress((prev) => {
        const newProgress = Math.min(prev + delta / animationDuration, 1);
        
        // Z축 기준 180도 원 운동 회전 애니메이션 (Math.PI)
        const rotationZ = newProgress * Math.PI; // 180도 회전
        
        // 다른 축은 0으로 고정하고 Z축만 회전
        rightGroupRef.current.rotation.x = 0;
        rightGroupRef.current.rotation.y = 0;
        rightGroupRef.current.rotation.z = rotationZ;
        
        // 애니메이션 완료
        if (newProgress >= 1) {
          setFirstSetAnimating(false);
          setAnimationStep(1); // 1세트 완료
          setCurrentSet(2); // 두 번째 세트로 전환
        }
        
        return newProgress;
      });
    }
    
    // 첫 번째 세트 역방향 애니메이션
    if (reverseAnimating && rightGroupRef.current && animationStep === 1) {
      setFirstSetProgress((prev) => {
        const newProgress = Math.max(prev - delta / animationDuration, 0);
        
        // Z축 기준 역방향 회전
        const rotationZ = newProgress * Math.PI;
        
        rightGroupRef.current.rotation.x = 0;
        rightGroupRef.current.rotation.y = 0;
        rightGroupRef.current.rotation.z = rotationZ;
        
        // 역방향 애니메이션 완료
        if (newProgress <= 0) {
          setReverseAnimating(false);
          setAnimationStep(0); // 초기 상태로
          setCurrentSet(1); // 첫 번째 세트로 전환
        }
        
        return newProgress;
      });
    }
    
    // 두 번째 세트 애니메이션 (정방향)
    if (secondSetAnimating && secondGroupRef.current && !reverseAnimating) {
      setSecondSetProgress((prev) => {
        const newProgress = Math.min(prev + delta / animationDuration, 1);
        
        // Z축 기준 180도 원 운동 회전 애니메이션 (Math.PI)
        const rotationZ = newProgress * Math.PI; // 180도 회전
        
        // 다른 축은 0으로 고정하고 Z축만 회전
        secondGroupRef.current.rotation.x = 0;
        secondGroupRef.current.rotation.y = 0;
        secondGroupRef.current.rotation.z = rotationZ;
        
        // 애니메이션 완료
        if (newProgress >= 1) {
          setSecondSetAnimating(false);
          setAnimationStep(2); // 2세트 완료
        }
        
        return newProgress;
      });
    }
    
    // 두 번째 세트 역방향 애니메이션
    if (reverseAnimating && secondGroupRef.current && animationStep === 2) {
      setSecondSetProgress((prev) => {
        const newProgress = Math.max(prev - delta / animationDuration, 0);
        
        // Z축 기준 역방향 회전
        const rotationZ = newProgress * Math.PI;
        
        secondGroupRef.current.rotation.x = 0;
        secondGroupRef.current.rotation.y = 0;
        secondGroupRef.current.rotation.z = rotationZ;
        
        // 역방향 애니메이션 완료
        if (newProgress <= 0) {
          setReverseAnimating(false);
          setAnimationStep(1); // 1세트 완료 상태로
          setCurrentSet(2); // 두 번째 세트 대기
        }
        
        return newProgress;
      });
    }
  };

  return {
    firstPivotPoint,
    secondPivotPoint,
    updateAnimations
  };
}

export default LP; 