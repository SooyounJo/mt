import React from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// LP5 모델 컴포넌트
export default function LPModel() {
  const { scene } = useGLTF('/3d/background/lp5.glb');
  const groupRef = React.useRef();
  const [center, setCenter] = React.useState([0, 0, 0]);

  React.useEffect(() => {
    if (scene) {
      // 메시 전체의 중심 계산
      const box = new THREE.Box3().setFromObject(scene);
      const centerVec = new THREE.Vector3();
      box.getCenter(centerVec);
      // 피봇을 메시 중심으로 이동
      scene.position.sub(centerVec);
      setCenter([centerVec.x, centerVec.y, centerVec.z]);
      // 메시별 머티리얼 처리
      scene.traverse((child) => {
        if (child.isMesh) {
          if (!child.material.map) {
            child.material = new THREE.MeshStandardMaterial({ color: 0x000000 });
          }
        }
      });
    }
  }, [scene]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
    }
  });

  return (
    <group ref={groupRef} position={[-5.5, -3.7, 8.2]} scale={8} receiveShadow castShadow>
      <primitive object={scene} />
    </group>
  );
} 