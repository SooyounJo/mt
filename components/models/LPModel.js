import React, { useRef } from 'react';
import { useGLTF, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LPModel = () => {
  const { scene } = useGLTF('/3d/lp5.glb');
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // Y축을 기준으로만 회전 (물리적 이동 없음)
      groupRef.current.rotation.y += 0.01;
    }
  });

  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
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
    }
  }, [scene]);

  return (
    <group position={[0.21, -0.36, 0.07]}>
      {/* 고정된 중심점 */}
      <Sphere args={[0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
      </Sphere>
      
      {/* 회전 그룹 */}
      <group ref={groupRef} position={[0, 0, 0]}>
        <primitive 
          object={scene} 
          scale={2.5}
          position={[0, 0, 0]} 
        />
      </group>
    </group>
  );
};

export default LPModel; 