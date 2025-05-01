import React from 'react';
import { useGLTF } from '@react-three/drei';

const Background = () => {
  const { scene } = useGLTF('/3d/background/back.glb');
  
  return (
    <primitive 
      object={scene} 
      position={[-1.7, -4.5, 0.4]}
      rotation={[0, Math.PI / 2, 0]}
      scale={35}
    />
  );
};

export default Background; 