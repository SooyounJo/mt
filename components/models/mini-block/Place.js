import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Place = ({ visible = true }) => {
  const { scene } = useGLTF('/3d/mini-block/place.glb');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
          child.visible = visible;
          child.renderOrder = 1;
          
          // 기존 material 속성 유지하면서 새로운 material 적용
          const originalMaterial = child.material;
          child.material = new THREE.MeshPhysicalMaterial({
            ...originalMaterial,
            color: originalMaterial.color,
            metalness: 0.1,
            roughness: 0.1,
            clearcoat: 1,
            clearcoatRoughness: 0.1
          });
        }
      });
    }
  }, [scene, visible]);

  return (
    <primitive
      object={scene}
      position={[1.1, -1, -1.2]}
      rotation={[0, 0, 0]}
      scale={7}
    />
  );
};

export default Place; 