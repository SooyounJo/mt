import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 빛나는 원형 커서를 위한 컴포넌트
function GlowingCircle({ position }) {
  // 그라데이션 텍스처 생성
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // 방사형 그라데이션 생성
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 원 그리기
    ctx.beginPath();
    ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
    ctx.lineWidth = 200;  // 라인 두께 증가
    
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 100,   // 내부 원
      centerX, centerY, 240   // 외부 원
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[0.24, 0.24]} />
        <meshBasicMaterial
          map={gradientTexture}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function CustomCursor({ cameraView }) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, z: 0 });
  const { scene } = useGLTF('/3d/background/pen3.glb');
  const { camera, gl } = useThree();
  const [isView3, setIsView3] = useState(false);
  
  // 애니메이션 관련 상태
  const [isShaking, setIsShaking] = useState(false);
  const shakeStartTime = useRef(0);
  const groupRef = useRef();

  // 흔들림 애니메이션 프레임 업데이트
  useFrame((state) => {
    if (isShaking && groupRef.current) {
      const elapsedTime = state.clock.getElapsedTime() - shakeStartTime.current;
      const duration = 0.5; // 애니메이션 지속 시간 (1초)
      
      if (elapsedTime < duration) {
        // 사인 함수를 사용하여 부드러운 좌우 흔들림 효과 생성
        const frequency = 4; // 흔들림 빈도를 15에서 4로 수정 (2번 왕복)
        const amplitude = 0.05; // 흔들림 폭
        // 시간이 지날수록 진폭이 감소하는 효과
        const decay = 1 - (elapsedTime / duration);
        
        const shake = Math.sin(elapsedTime * frequency * Math.PI) * amplitude * decay;
        groupRef.current.rotation.z = shake;
      } else {
        // 애니메이션 종료
        setIsShaking(false);
        groupRef.current.rotation.z = 0;
      }
    }
  });

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

    const handleClick = () => {
      if (cameraView === 3) {
        setIsShaking(true);
        shakeStartTime.current = gl.info.render.frame * 0.016;
      }
    };

    gl.domElement.style.cursor = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      gl.domElement.style.cursor = 'auto';
    };
  }, [cameraView, gl, camera]);

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
        <GlowingCircle 
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