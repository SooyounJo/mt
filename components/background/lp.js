import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';

// LP 컴포넌트 - 앨범 커버와 함께 회전
export function LP({ albumTexture, isPlaying = false }) {
  const { scene } = useGLTF('/3d/background/lp5.glb');
  const lpGroupRef = useRef();
  const albumPlaneRef = useRef();

  useFrame((_, delta) => {
    if (lpGroupRef.current) {
      // LP와 앨범 커버가 함께 회전 - 성능 최적화
      const rotationSpeed = isPlaying ? 0.02 : 0.008;
      lpGroupRef.current.rotation.y += rotationSpeed * delta * 60; // 프레임율 독립적
    }
  });

  return (
    <group ref={lpGroupRef} position={[-5.5, -3.7, 8.2]} scale={8}>
      {/* LP 모델 */}
      <primitive object={scene} />
      
      {/* 앨범 커버 원형 플레인 - LP 위에 배치 */}
      {albumTexture && (
        <mesh ref={albumPlaneRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial 
            map={albumTexture} 
            transparent={true}
            opacity={0.95}
          />
        </mesh>
      )}
    </group>
  );
}

// GLB 파일 프리로드
useGLTF.preload('/3d/background/lp5.glb');

export default LP; 