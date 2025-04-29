import React from 'react';
import { useGLTF } from '@react-three/drei';

const Season = () => {
  const { scene } = useGLTF('/3d/ele.glb');
  
  return (
    <primitive 
      object={scene} 
      position={[0, 0, -1]} // X축으로 3단위 우측 이동
      scale={5}
    />
  );
};

export default Season; 