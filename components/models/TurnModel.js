import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const TurnModel = () => {
  const { scene } = useGLTF('/3d/tu2.glb');
  const { gl } = useThree();

  const rotateRef = useRef();

  const [isRotating, setIsRotating] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const currentRotation = useRef(0);

  // 기본 축 위치 설정
  const defaultPosition = {
    x: -0.3,  // X축 위치
    y: -0.36, // Y축 위치
    z: -0.5   // Z축 위치
  };

  // 기본 회전 각도 설정 (라디안)
  const defaultRotation = {
    x: 0,     // X축 회전
    y: 1.4,   // Y축 회전
    z: 0      // Z축 회전
  };

  // 더블클릭 핸들러
  useEffect(() => {
    const handleDoubleClick = (e) => {
      e.preventDefault();

      const additionalRotation = -Math.PI / 6; // 반시계 방향 30도
      const currentY = rotateRef.current?.rotation.y || 0;
      const nextY = currentY + additionalRotation;

      setTargetRotation(nextY);
      setIsRotating(true);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [gl]);

  // 회전 애니메이션
  useFrame((_, delta) => {
    if (isRotating && rotateRef.current) {
      const speed = 8;
      const threshold = 0.01;

      const newY = THREE.MathUtils.damp(
        currentRotation.current,
        targetRotation,
        speed,
        delta
      );

      if (Math.abs(newY - targetRotation) < threshold) {
        rotateRef.current.rotation.y = targetRotation;
        currentRotation.current = targetRotation;
        setIsRotating(false);
      } else {
        rotateRef.current.rotation.y = newY;
        currentRotation.current = newY;
      }
    }
  });

  // 재질 설정
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2,
          });
        }
      });
    }
  }, [scene]);

  return (
    <group 
      ref={rotateRef}
      position={[defaultPosition.x, defaultPosition.y, defaultPosition.z]}
      rotation={[defaultRotation.x, defaultRotation.y, defaultRotation.z]}
    >
      <primitive object={scene} scale={2.5} />
    </group>
  );
};

export default TurnModel;
