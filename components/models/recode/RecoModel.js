import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const RecoModel = () => {
  const { scene, error } = useGLTF('/3d/recode/reco.glb');

  useEffect(() => {
    if (error) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        child.visible = true;
        child.renderOrder = 1;

        const originalMaterial = child.material;
        const meshBox = new THREE.Box3().setFromObject(child);
        const size = new THREE.Vector3();
        meshBox.getSize(size);
        const maxDimension = Math.max(size.x, size.y, size.z);

        // 기존 material logic 그대로 유지
        if (originalMaterial.color.getHex() === 0xff0000) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            metalness: 0.0,
            roughness: 0.1,
            emissive: 0xff0000,
            emissiveIntensity: 0.2
          });
        } else if (originalMaterial.color.getHex() === 0xffffff) {
          if (maxDimension < 1.0) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xcccccc,
              metalness: 0.9,
              roughness: 0.2
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.0,
              roughness: 0.1
            });
          }
        }
      }
    });
  }, [scene, error]);

  if (error) return null;

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

