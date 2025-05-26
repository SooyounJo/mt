import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const Book = (props) => {
  const { scene } = useGLTF('/3d/book/book.glb');

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
      scale={40}
      position={[1.8, -1, -1.3]}
      rotation={[0, 1.6, 0]}
      {...props}
    />
  );
};

export default Book; 