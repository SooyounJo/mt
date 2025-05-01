import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const TurnModel = () => {
  const { scene } = useGLTF('/3d/recode/tu2.glb');
  const { gl } = useThree();

  const rotateRef = useRef();

  const [isRotating, setIsRotating] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const [isAtDefault, setIsAtDefault] = useState(true); // 회전 상태 추적
  const currentRotation = useRef(0);

  const defaultPosition = { x: -0.3, y: -0.38, z: -0.5 };
  const defaultRotation = { x: 0, y: 1.4, z: 0 };
  const ROTATION_AMOUNT = -Math.PI / 6;

  // 초기 회전값 설정 (튀김 현상 방지)
  useEffect(() => {
    currentRotation.current = defaultRotation.y;
    setTargetRotation(defaultRotation.y);
  }, []);

  // 더블클릭 시 회전 방향 토글
  useEffect(() => {
    const handleDoubleClick = (e) => {
      e.preventDefault();

      const baseRotation = defaultRotation.y;
      const newTarget = isAtDefault
        ? baseRotation + ROTATION_AMOUNT
        : baseRotation;

      setTargetRotation(newTarget);
      setIsRotating(true);
      setIsAtDefault(!isAtDefault);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [gl, isAtDefault]);

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
          child.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            envMapIntensity: 1.0,
            ior: 1.5,
            reflectivity: 0.8,
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
