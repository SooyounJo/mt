import React from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimatedMiniPlane } from './albumcontrol';

// 8개의 플레인 메쉬 컴포넌트 (앨범 형태)
export default function Album() {
  // 그룹 ref (나중에 그룹 제어용)
  const groupRef = React.useRef();
  const rightGroupRef = React.useRef(); // 플레인5-8 + 메인플레인 그룹
  
  // 애니메이션 상태
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [animationProgress, setAnimationProgress] = React.useState(0);
  const animationDuration = 1.5; // 1.5초 애니메이션
  
  // 피봇 포인트 (직사각형 플레인의 좌측 끝)
  // 직사각형 플레인: position=[2.1, -5.54, 11.8], size=[2.6, 3.4, 0.1], rotation=[Math.PI/2, 0, 0]
  // 좌측 끝: 중심에서 x축 방향으로 -1.3만큼 이동 (2.1 - 2.6/2 = 0.8)
  const pivotPoint = [0.8, -5.54, 11.8]; // 직사각형 플레인 좌측 끝
  
  // 애니메이션 시작 함수
  const startPageTurn = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setAnimationProgress(0);
    }
  };
  
  // 전역 컨트롤 API
  React.useEffect(() => {
    window.AlbumPageControl = {
      turnPage: startPageTurn
    };
    return () => {
      delete window.AlbumPageControl;
    };
  }, []);

  useFrame((_, delta) => {
    if (isAnimating && rightGroupRef.current) {
      setAnimationProgress((prev) => {
        const newProgress = Math.min(prev + delta / animationDuration, 1);
        
        // Z축 기준 180도 원 운동 회전 애니메이션 (Math.PI)
        const rotationZ = newProgress * Math.PI; // 180도 회전
        
        // 다른 축은 0으로 고정하고 Z축만 회전
        rightGroupRef.current.rotation.x = 0;
        rightGroupRef.current.rotation.y = 0;
        rightGroupRef.current.rotation.z = rotationZ;
        
        // 애니메이션 완료
        if (newProgress >= 1) {
          setIsAnimating(false);
        }
        
        return newProgress;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* 플레인1-4 (고정 그룹) */}
      <AnimatedMiniPlane position={[-0.2, -5.5, 12]} planeNumber={1} />
      <AnimatedMiniPlane position={[-0.2, -5.5, 13]} planeNumber={2} />
      <AnimatedMiniPlane position={[-1.2, -5.5, 12]} planeNumber={3} />
      <AnimatedMiniPlane position={[-1.2, -5.5, 13]} planeNumber={4} />
      
      {/* 플레인5-8 + 메인플레인 그룹 (회전 애니메이션 대상) - 피봇 포인트에서 회전 */}
      <group ref={rightGroupRef} position={pivotPoint}>
        {/* 피봇 포인트에서의 상대 위치로 조정 */}
        <AnimatedMiniPlane position={[2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]]} planeNumber={5} />
        <AnimatedMiniPlane position={[2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]]} planeNumber={6} />
        <AnimatedMiniPlane position={[1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]]} planeNumber={7} />
        <AnimatedMiniPlane position={[1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]]} planeNumber={8} />
        
        {/* 직사각형 메인 플레인 (피봇 포인트에서의 상대 위치) */}
        <mesh 
          position={[2.1 - pivotPoint[0], -5.54 - pivotPoint[1], 11.8 - pivotPoint[2]]} 
          rotation={[Math.PI/2, 0, 0]} 
          receiveShadow 
          castShadow
        >
          <boxGeometry args={[2.6, 3.4, 0.1]} />
          <meshStandardMaterial color="#a0a0a0" />
        </mesh>
      </group>
    </group>
  );
} 