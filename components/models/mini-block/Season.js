import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Season = ({ visible = true }) => {
  const { scene } = useGLTF('/3d/mini-block/season.glb');
  const modelRef = useRef();

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
          child.visible = visible;
          child.renderOrder = 1;
        }
      });
    }
  }, [scene, visible]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      position={[0.6, -1, -1.3]}
      scale={6}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
};

export default Season;
