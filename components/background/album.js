import React from 'react';
import { useFrame } from '@react-three/fiber';
import { AnimatedMiniPlane } from './albumcontrol';

// 8개의 플레인 메쉬 컴포넌트 (앨범 형태)
export default function Album() {
  // 그룹 ref (나중에 그룹 제어용)
  const groupRef = React.useRef();
  const rightGroupRef = React.useRef(); // 첫 번째 세트: 플레인5-8 + 메인플레인
  const secondGroupRef = React.useRef(); // 두 번째 세트: 플레인13-16 + 메인플레인2
  
  // 애니메이션 상태
  const [firstSetAnimating, setFirstSetAnimating] = React.useState(false);
  const [secondSetAnimating, setSecondSetAnimating] = React.useState(false);
  const [firstSetProgress, setFirstSetProgress] = React.useState(0);
  const [secondSetProgress, setSecondSetProgress] = React.useState(0);
  const [currentSet, setCurrentSet] = React.useState(1); // 1: 첫 번째 세트, 2: 두 번째 세트
  const animationDuration = 1.5; // 1.5초 애니메이션
  
  // 피봇 포인트들
  const firstPivotPoint = [0.8, -5.44, 11.8]; // 첫 번째 세트 피봇
  const secondPivotPoint = [0.8, -5.34, 11.8]; // 두 번째 세트 피봇 (0.3 더 위로 이동)
  
  // 애니메이션 시작 함수
  const startPageTurn = () => {
    if (currentSet === 1 && !firstSetAnimating) {
      setFirstSetAnimating(true);
      setFirstSetProgress(0);
    } else if (currentSet === 2 && !secondSetAnimating && firstSetProgress >= 1) {
      setSecondSetAnimating(true);
      setSecondSetProgress(0);
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
  }, [currentSet, firstSetAnimating, secondSetAnimating, firstSetProgress]);

  useFrame((_, delta) => {
    // 첫 번째 세트 애니메이션
    if (firstSetAnimating && rightGroupRef.current) {
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
          setCurrentSet(2); // 두 번째 세트로 전환
        }
        
        return newProgress;
      });
    }
    
    // 두 번째 세트 애니메이션
    if (secondSetAnimating && secondGroupRef.current) {
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
      
      {/* 첫 번째 세트: 플레인5-8 + 9-12 + 메인플레인 그룹 (회전 애니메이션 대상) */}
      <group ref={rightGroupRef} position={firstPivotPoint}>
        {/* 피봇 포인트에서의 상대 위치로 조정 - 앞면 플레인들 */}
        <AnimatedMiniPlane position={[2.8 - firstPivotPoint[0], -5.5 - firstPivotPoint[1], 12 - firstPivotPoint[2]]} planeNumber={5} />
        <AnimatedMiniPlane position={[2.8 - firstPivotPoint[0], -5.5 - firstPivotPoint[1], 13 - firstPivotPoint[2]]} planeNumber={6} />
        <AnimatedMiniPlane position={[1.8 - firstPivotPoint[0], -5.5 - firstPivotPoint[1], 12 - firstPivotPoint[2]]} planeNumber={7} />
        <AnimatedMiniPlane position={[1.8 - firstPivotPoint[0], -5.5 - firstPivotPoint[1], 13 - firstPivotPoint[2]]} planeNumber={8} />
        
        {/* 뒷면 플레인들 (9-12) - 직사각형 플레인 뒷면에 배치 */}
        <AnimatedMiniPlane position={[2.8 - firstPivotPoint[0], -5.6 - firstPivotPoint[1], 12 - firstPivotPoint[2]]} planeNumber={9} />
        <AnimatedMiniPlane position={[2.8 - firstPivotPoint[0], -5.6 - firstPivotPoint[1], 13 - firstPivotPoint[2]]} planeNumber={10} />
        <AnimatedMiniPlane position={[1.8 - firstPivotPoint[0], -5.6 - firstPivotPoint[1], 12 - firstPivotPoint[2]]} planeNumber={11} />
        <AnimatedMiniPlane position={[1.8 - firstPivotPoint[0], -5.6 - firstPivotPoint[1], 13 - firstPivotPoint[2]]} planeNumber={12} />
        
        {/* 첫 번째 직사각형 메인 플레인 */}
        <mesh 
          position={[2.1 - firstPivotPoint[0], -5.54 - firstPivotPoint[1], 11.8 - firstPivotPoint[2]]} 
          rotation={[Math.PI/2, 0, 0]} 
          receiveShadow 
          castShadow
        >
          <boxGeometry args={[2.6, 3.4, 0.1]} />
          <meshStandardMaterial color="#a0a0a0" />
        </mesh>
      </group>
      
      {/* 두 번째 세트: 플레인13-16 + 17-20 + 메인플레인2 그룹 (독립 애니메이션) */}
      <group ref={secondGroupRef} position={secondPivotPoint}>
        {/* 앞면 플레인들 (13-16) */}
        <AnimatedMiniPlane position={[2.8 - secondPivotPoint[0], -5.4 - secondPivotPoint[1], 12 - secondPivotPoint[2]]} planeNumber={13} />
        <AnimatedMiniPlane position={[2.8 - secondPivotPoint[0], -5.4 - secondPivotPoint[1], 13 - secondPivotPoint[2]]} planeNumber={14} />
        <AnimatedMiniPlane position={[1.8 - secondPivotPoint[0], -5.4 - secondPivotPoint[1], 12 - secondPivotPoint[2]]} planeNumber={15} />
        <AnimatedMiniPlane position={[1.8 - secondPivotPoint[0], -5.4 - secondPivotPoint[1], 13 - secondPivotPoint[2]]} planeNumber={16} />
        
        {/* 뒷면 플레인들 (17-20) */}
        <AnimatedMiniPlane position={[2.8 - secondPivotPoint[0], -5.5 - secondPivotPoint[1], 12 - secondPivotPoint[2]]} planeNumber={17} />
        <AnimatedMiniPlane position={[2.8 - secondPivotPoint[0], -5.5 - secondPivotPoint[1], 13 - secondPivotPoint[2]]} planeNumber={18} />
        <AnimatedMiniPlane position={[1.8 - secondPivotPoint[0], -5.5 - secondPivotPoint[1], 12 - secondPivotPoint[2]]} planeNumber={19} />
        <AnimatedMiniPlane position={[1.8 - secondPivotPoint[0], -5.5 - secondPivotPoint[1], 13 - secondPivotPoint[2]]} planeNumber={20} />
        
        {/* 두 번째 직사각형 메인 플레인 */}
        <mesh 
          position={[2.1 - secondPivotPoint[0], -5.44 - secondPivotPoint[1], 11.8 - secondPivotPoint[2]]} 
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