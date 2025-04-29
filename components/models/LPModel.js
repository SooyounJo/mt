import React, { useRef, useState } from 'react';
import { useGLTF, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LPModel = () => {
  const { scene } = useGLTF('/3d/lp4.glb');
  const groupRef = useRef();
  const [modelCenter, setModelCenter] = useState([0, 0, 0]);
  
  React.useEffect(() => {
    if (scene) {
      // 모델의 바운딩 박스 계산
      const box = new THREE.Box3().setFromObject(scene);
      const centerVec = new THREE.Vector3();
      box.getCenter(centerVec);
      
      // 모델을 중심점으로 이동
      scene.position.sub(centerVec);
      
      // 중심점 좌표 저장 (스케일 고려)
      setModelCenter([
        centerVec.x * 2.5,  // X 좌표
        centerVec.y * 2.5,  // Y 좌표
        centerVec.z * 2.5   // Z 좌표
      ]);

      // 재질 설정
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

  useFrame((state) => {
    if (groupRef.current) {
      // Y축을 기준으로만 회전 (물리적 이동 없음)
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={[0.21, -0.36, 0.07]}>
      {/* 회전 그룹 */}
      <group ref={groupRef} position={modelCenter}>
        <primitive 
          object={scene} 
          scale={2.5} 
        />
      </group>
      {/* 고정된 중심점 표시 */}
      <Sphere args={[0.05]} position={modelCenter}>
        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
};

export default LPModel; 