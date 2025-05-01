import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LPModel = () => {
  const { scene } = useGLTF('/3d/recode/lp5.glb');
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        child.visible = true;
        child.renderOrder = 1;
        const originalMaterial = child.material;

        if (originalMaterial.map) {
          child.material = new THREE.MeshStandardMaterial({
            map: originalMaterial.map,
            metalness: 0.1,
            roughness: 0.2,
            envMapIntensity: 1.2,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
          });
        } else {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.7,
            roughness: 0.2,
          });
        }
      }
    });
  }, [scene]);

  return (
    <group position={[0.2, -0.36, 0.08]}>
      <group ref={groupRef}>
        <primitive object={scene} scale={2.7} />
      </group>
    </group>
  );
};

export default LPModel;
