import React, { useRef } from 'react';
import { useGLTF, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TurnModel = () => {
  const { scene } = useGLTF('/3d/turn.glb');
  const groupRef = useRef();
  const isRotating = useRef(false);
  const targetRotation = useRef(0);
  
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!isRotating.current) {
      isRotating.current = true;
      targetRotation.current = groupRef.current.rotation.y + Math.PI * 2; // 360도 회전
    }
  };

  useFrame((state, delta) => {
    if (isRotating.current && groupRef.current) {
      const currentRotation = groupRef.current.rotation.y;
      const rotationSpeed = 2; // 회전 속도 조절
      
      if (Math.abs(currentRotation - targetRotation.current) > 0.01) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation.current,
          delta * rotationSpeed
        );
      } else {
        groupRef.current.rotation.y = targetRotation.current;
        isRotating.current = false;
      }
    }
  });

  React.useEffect(() => {
    if (scene) {
      // 모든 메시에 알루미늄 재질 적용
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2,
            envMapIntensity: 1.5
          });
        }
      });
    }
  }, [scene]);

  return (
    <group position={[0.4, -1.1, 0.1]} rotation={[0, 1.4, 0]}>
      {/* 회전 그룹 */}
      <group 
        ref={groupRef}
        onDoubleClick={handleDoubleClick}
      >
        <primitive 
          object={scene} 
          scale={2.5} 
        />
      </group>
      {/* 고정된 중심점 표시 */}
      <Sphere args={[0.05]} position={[0.5, 0.75, -0.8]}>
        <meshStandardMaterial color="purple" emissive="purple" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
};

export default TurnModel; 