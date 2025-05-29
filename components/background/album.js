import React from 'react';
import { AnimatedMiniPlane } from './albumcontrol';

// 8개의 플레인 메쉬 컴포넌트 (앨범 형태)
export default function Album() {
  // 그룹 ref (나중에 그룹 제어용)
  const groupRef = React.useRef();

  return (
    <group ref={groupRef}>
      {/* 플레인1-4 (고정 그룹) */}
      <AnimatedMiniPlane position={[-0.2, -5.5, 12]} planeNumber={1} />
      <AnimatedMiniPlane position={[-0.2, -5.5, 13]} planeNumber={2} />
      <AnimatedMiniPlane position={[-1.2, -5.5, 12]} planeNumber={3} />
      <AnimatedMiniPlane position={[-1.2, -5.5, 13]} planeNumber={4} />
      
      {/* 플레인5-8 + 메인플레인 그룹 */}
      <group>
        <AnimatedMiniPlane position={[2.8, -5.5, 12]} planeNumber={5} />
        <AnimatedMiniPlane position={[2.8, -5.5, 13]} planeNumber={6} />
        <AnimatedMiniPlane position={[1.8, -5.5, 12]} planeNumber={7} />
        <AnimatedMiniPlane position={[1.8, -5.5, 13]} planeNumber={8} />
        
        {/* 직사각형 메인 플레인 (호버링 효과 없음) */}
        <mesh position={[2.1, -5.54, 11.8]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.6, 3.4, 0.1]} />
          <meshStandardMaterial color="#a0a0a0" />
        </mesh>
      </group>
    </group>
  );
} 