import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';

export function Pin() {
  const { scene } = useGLTF('/3d/background/pin.glb');
  
  return (
    <primitive 
      object={scene} 
      position={[-3.5, -3.7, 8.2]} // LP의 오른쪽으로 더 이동
      scale={8}
    />
  );
}

// GLB 파일 프리로드
useGLTF.preload('/3d/background/pin.glb'); 