import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Weather = () => {
  const { scene } = useGLTF('/3d/mini-block/wea.glb');
  const [position, setPosition] = useState([0, -1, -1.3]);
  const [rotation, setRotation] = useState([0, Math.PI / 2, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const { camera, gl } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const lastMouse = new THREE.Vector2();

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setIsRotating(true);
    } else {
      setIsDragging(true);
    }
    lastMouse.set(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRotating(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging && !isRotating) return;

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    lastMouse.set(e.clientX, e.clientY);

    if (isDragging) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      const distance = -camera.position.z;
      const newPosition = new THREE.Vector3();
      newPosition.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, distance);

      setPosition([newPosition.x, newPosition.y, newPosition.z]);
    } else if (isRotating) {
      const newRotation = [
        rotation[0] + deltaY * 0.01,
        rotation[1] + deltaX * 0.01,
        rotation[2]
      ];
      setRotation(newRotation);
    }
  };

  React.useEffect(() => {
    if (isDragging || isRotating) {
      gl.domElement.addEventListener('pointermove', handlePointerMove);
      gl.domElement.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
      gl.domElement.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isRotating]);

  return (
    <primitive
      object={scene}
      position={[0.8, -1, -1.3]}
      rotation={[0, Math.PI / 2, 0]}
      scale={8}
      onPointerDown={handlePointerDown}
    />
  );
};

export default Weather; 