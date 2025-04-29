import React from 'react';
import { useGLTF } from '@react-three/drei';

const Background = () => {
  const { scene } = useGLTF('/3d/full5.glb');
  
  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1}
    />
  );
};

export default Background; 