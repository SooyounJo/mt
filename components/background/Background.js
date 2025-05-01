import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const Background = () => {
  const { scene } = useGLTF('/3d/background/backg.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        child.visible = true;
        child.renderOrder = 1;
      }
    });
  }, [scene]);

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

