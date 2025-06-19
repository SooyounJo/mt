import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CustomCursorParticle() {
  const { gl, camera } = useThree();
  const [pos, setPos] = useState([0, 0, 0]);
  const [scale, setScale] = useState(1);
  const last = useRef({ x: 0, y: 0, t: Date.now() });
  const targetScale = useRef(1);
  const zPlane = 0; // 커서를 위치시킬 z 평면 (LP와 비슷한 깊이)

  useEffect(() => {
    const handleMove = (e) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      // Raycaster로 z=0 평면과의 교차점 계산
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), -zPlane);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, intersection);
      setPos([intersection.x, intersection.y, intersection.z]);
      last.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    };
    const handleClick = () => {
      targetScale.current = 1.7;
    };
    gl.domElement.addEventListener('mousemove', handleMove);
    gl.domElement.addEventListener('mousedown', handleClick);
    gl.domElement.style.cursor = 'none';
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMove);
      gl.domElement.removeEventListener('mousedown', handleClick);
      gl.domElement.style.cursor = 'auto';
    };
  }, [gl, camera]);

  useFrame(() => {
    setScale((prev) => {
      if (Math.abs(prev - targetScale.current) < 0.01) {
        targetScale.current = 1;
        return 1;
      }
      return prev + (targetScale.current - prev) * 0.2;
    });
  });

  return (
    <mesh position={pos} scale={[scale, scale, scale]}>
      <sphereGeometry args={[0.09, 24, 24]} />
      <meshBasicMaterial color="#fff" transparent opacity={0.9} />
    </mesh>
  );
}

export default CustomCursorParticle; 