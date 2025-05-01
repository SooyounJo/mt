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
          const meshBox = new THREE.Box3().setFromObject(child);
          const size = new THREE.Vector3();
          meshBox.getSize(size);
          const maxDimension = Math.max(size.x, size.y, size.z);

          if (originalMaterial.color.getHex() === 0xff0000) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xff0000,
              metalness: 0.0,
              roughness: 0.1,
              transmission: 0.0,
              thickness: 0.5,
              clearcoat: 1.0,
              clearcoatRoughness: 0.1,
              envMapIntensity: 1.0,
              ior: 1.5,
              emissive: 0xff0000,
              emissiveIntensity: 0.2
            });
          } else if (originalMaterial.color.getHex() === 0xffffff) {
            if (maxDimension < 1.0) {
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0xcccccc,
                metalness: 0.9,
                roughness: 0.2,
                transmission: 0.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                envMapIntensity: 1.5,
                reflectivity: 1.0
              });
            } else {
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