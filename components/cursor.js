import React, { useEffect, useState, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 빨간 플라스틱 공 커서 컴포넌트
function RedBallCursor({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.06, 32, 32]} />
      <meshPhysicalMaterial
        color="#ff0000"
        metalness={0.1}
        roughness={0.3}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transmission={0}
        thickness={0.5}
        ior={1.5}
      />
    </mesh>
  );
}

export function CustomCursor({ cameraView }) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, z: 0 });
  const { scene } = useGLTF('/3d/background/pen3.glb');
  const { camera, gl } = useThree();
  const [isView3, setIsView3] = useState(false);
  const groupRef = useRef();

  useEffect(() => {
    setIsView3(cameraView === 3);

    // 펜 모델 크기와 회전 조정
    if (cameraView === 3) {
      scene.scale.set(5, 5, 5);
      scene.rotation.set(
        Math.PI / 4, // X축 회전 (45도)
        0,          // Y축 회전
        Math.PI / 6 // Z축 회전 (30도)
      );
    }

    const handleMouseMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      
      // 카메라 뷰에 따라 거리 조정
      const distance = cameraView === 3 ? 10 : 5;
      const cursorPos = camera.position.clone()
        .add(raycaster.ray.direction.multiplyScalar(distance));

      setCursorPosition({
        x: cursorPos.x,
        y: cursorPos.y,
        z: cursorPos.z
      });
    };

    gl.domElement.style.cursor = 'none';
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.style.cursor = 'auto';
    };
  }, [cameraView, gl, camera, scene]);

  // 항상 커서를 렌더링하되, 카메라 뷰에 따라 다른 커서 표시
  return (
    <>
      {isView3 ? (
        <group 
          position={[cursorPosition.x, cursorPosition.y, cursorPosition.z]}
          ref={groupRef}
        >
          <primitive 
            object={scene}
            castShadow
            receiveShadow
          />
        </group>
      ) : (
        <RedBallCursor 
          position={[cursorPosition.x, cursorPosition.y, cursorPosition.z]} 
        />
      )}
    </>
  );
}

export function useCursor(cameraView) {
  const [isCustomCursor, setIsCustomCursor] = useState(false);

  useEffect(() => {
    setIsCustomCursor(true);  // 항상 커스텀 커서 사용
  }, [cameraView]);

  return { isCustomCursor };
} 