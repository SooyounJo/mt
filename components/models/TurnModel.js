import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TurnModel = () => {
  const { scene } = useGLTF('/3d/tu.glb');

  const groupRef = useRef();
  const pivotRef = useRef();

  const [isRotating, setIsRotating] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const currentRotation = useRef(0);

  // 더블클릭 핸들러
  const handleDoubleClick = (e) => {
    e.stopPropagation();

    // 클릭한 대상이 turn.glb인지 확인
    const clickedObject = e.object;
    if (!groupRef.current || !groupRef.current.children.length) return;

    const model = groupRef.current.children[0];
    const isClickedOnTurnModel = model.uuid === clickedObject.uuid
      || model.children.some(child => child.uuid === clickedObject.uuid);

    if (!isClickedOnTurnModel) return;

    // 더블클릭하면 항상 30도(=Math.PI/6) 추가 회전
    const additionalRotation = Math.PI / 6;
    setTargetRotation(currentRotation.current + additionalRotation);
    setIsRotating(true);
  };

  useFrame((state, delta) => {
    if (isRotating && pivotRef.current) {
      const speed = 8;
      const threshold = 0.01;

      const newRotation = THREE.MathUtils.damp(currentRotation.current, targetRotation, speed, delta);

      if (Math.abs(newRotation - targetRotation) < threshold) {
        pivotRef.current.rotation.y = targetRotation;
        currentRotation.current = targetRotation;
        setIsRotating(false);
      } else {
        pivotRef.current.rotation.y = newRotation;
        currentRotation.current = newRotation;
      }
    }
  });

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2
          });
        }
      });
    }
  }, [scene]);

  return (
    <group position={[-0.3, -0.36, -0.5]} rotation={[0, 1.4, 0]}>
      {/* 고정된 중심 pivot */}
      <group ref={pivotRef} position={[0.5, 0.75, -0.8]}>
        <group 
          ref={groupRef} 
          position={[-0.5, -0.75, 0.8]}
          onDoubleClick={handleDoubleClick} // ✅ 더블클릭 이벤트로 바뀜
        >
          <primitive object={scene} scale={2.5} />
        </group>
      </group>
    </group>
  );
};

export default TurnModel;
