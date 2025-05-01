import React from 'react';
import { useGLTF } from '@react-three/drei';

const Background = () => {
  const { scene } = useGLTF('/3d/backgra.glb');
  
  return (
    <primitive 
      object={scene} 
      position={[-2.8, -4.5, 0.1]}
      rotation={[0, Math.PI / 2, 0]}
      scale={35}
    />
  );
};

export default Background; 