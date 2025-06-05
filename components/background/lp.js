import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// LP 컴포넌트
export function LP() {
  const { scene } = useGLTF('/3d/background/lp.glb');
  const lpRef = useRef();

  useFrame(() => {
    if (lpRef.current) {
      lpRef.current.rotation.y += 0.008;
    }
  });

  return (
    <primitive 
      ref={lpRef}
      object={scene} 
      position={[-5.5, -3.7, 8.2]}
      scale={8}
    />
  );
}

// GLB 파일 프리로드
useGLTF.preload('/3d/background/lp5.glb');

export default LP; 