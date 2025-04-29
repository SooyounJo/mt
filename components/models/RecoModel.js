import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const RecoModel = () => {
  const { scene, error } = useGLTF('/3d/reco.glb', true);
  
  useEffect(() => {
    if (error) {
      console.error('모델 로딩 에러:', error);
      return;
    }

    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      scene.traverse((child) => {
        if (child.isMesh) {
          const originalMaterial = child.material;
          if (originalMaterial.color.getHex() === 0xffffff) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              metalness: 0.0,
              roughness: 0.1,
              transmission: 0.9,
              thickness: 0.5,
              clearcoat: 1.0,
              clearcoatRoughness: 0.1,
              envMapIntensity: 1.0,
              ior: 1.5
            });
          }
        }
      });
    }
  }, [scene, error]);

  if (error) {
    return null;
  }

  return (
    <primitive 
      object={scene} 
      scale={2.5} 
      position={[0, -1.5, 0]} 
      rotation={[0, Math.PI / 2, 0]}
    />
  );
};

export default RecoModel; 