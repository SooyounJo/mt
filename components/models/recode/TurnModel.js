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
  const [isAtDefault, setIsAtDefault] = useState(true);
  const currentRotation = useRef(0);

  const defaultPosition = { x: -0.3, y: -0.38, z: -0.5 };
  const defaultRotation = { x: 0, y: 1.4, z: 0 };
  const ROTATION_AMOUNT = -Math.PI / 6;

  useEffect(() => {
    currentRotation.current = defaultRotation.y;
    setTargetRotation(defaultRotation.y);
  }, []);

  useEffect(() => {
    const handleDoubleClick = (e) => {
      e.preventDefault();
      const baseRotation = defaultRotation.y;
      const newTarget = isAtDefault ? baseRotation + ROTATION_AMOUNT : baseRotation;
      setTargetRotation(newTarget);
      setIsRotating(true);
      setIsAtDefault(!isAtDefault);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('dblclick', handleDoubleClick);
    return () => canvas.removeEventListener('dblclick', handleDoubleClick);
  }, [gl, isAtDefault]);

  useFrame((_, delta) => {
    if (isRotating && rotateRef.current) {
      const newY = THREE.MathUtils.damp(currentRotation.current, targetRotation, 8, delta);
      if (Math.abs(newY - targetRotation) < 0.01) {
        rotateRef.current.rotation.y = targetRotation;
        currentRotation.current = targetRotation;
        setIsRotating(false);
      } else {
        rotateRef.current.rotation.y = newY;
        currentRotation.current = newY;
      }
    }
  });

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
          child.visible = true;
          child.renderOrder = 1;
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

