import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Place = () => {
  const { scene } = useGLTF('/3d/mini-block/place.glb');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
          child.visible = true;
          child.renderOrder = 1;
        }
      });
    }
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[1.3, -1, -1.2]}
      rotation={[0, 0, 0]}
      scale={7}
    />
  );
};

export default Place; 