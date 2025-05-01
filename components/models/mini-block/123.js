import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Model123 = () => {
  const { scene } = useGLTF('/3d/mini-block/123.glb');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const originalMaterial = child.material;
          const originalColor = originalMaterial.color.getHex();
          
          child.material = new THREE.MeshPhysicalMaterial({
            color: originalColor,  // 원래 색상 유지
            metalness: 0.0,
            roughness: 0.1,
            transmission: 0.9,  // 투명도 높게 설정
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 1.0,
            ior: 1.5  // 굴절률 설정
          });
        }
      });
    }
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[-0.6, -1, -1.3]}
      rotation={[0, Math.PI / 2, 0]}
      scale={7}
    />
  );
};

export default Model123; 