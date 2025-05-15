import React, { useRef, useEffect } from 'react';
import { useGLTF, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LPModel = ({ travelText }) => {
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
            envMapIntensity: 1.2
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
      {travelText && (
        <Text
          position={[0.8, -0.3, -0.1]} // LP 위에 살짝 띄움
          fontSize={0.25}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          outlineColor="#fff"
          outlineWidth={0.02}
          castShadow
          receiveShadow
          materialProps={{
            emissive: '#fff',
            emissiveIntensity: 1.5,
          }}
          rotation={[0, Math.PI / 2, 0]}
        >
          {travelText.charAt(0).toUpperCase() + travelText.slice(1)}
        </Text>
      )}
    </group>
  );
};

export default LPModel;
