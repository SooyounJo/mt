import React, { useEffect, useState, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
    // 카메라 뷰가 3번인지 확인
    setIsView3(cameraView === 3);

    if (cameraView === 3) {
      // 커서 숨기기
      gl.domElement.style.cursor = 'none';
      
      // 펜 모델 크기와 회전 조정
      scene.scale.set(7, 7, 7); // 크기를 5에서 7로 증가
      scene.rotation.set(
        Math.PI / 4, // X축 회전 (45도)
        0,          // Y축 회전
        Math.PI / 6 // Z축 회전 (30도)
      );

      // 마우스 이동 이벤트 핸들러
      const handleMouseMove = (event) => {
        const rect = gl.domElement.getBoundingClientRect();
        
        // 뷰포트 좌표계로 변환 (-1 ~ 1)
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 레이캐스터를 사용하여 3D 공간상의 위치 계산
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        
        // 카메라로부터 일정 거리에 커서 위치
        const distance = 15;
        const cursorPos = camera.position.clone()
          .add(raycaster.ray.direction.multiplyScalar(distance));

        setCursorPosition({
          x: cursorPos.x,
          y: cursorPos.y,
          z: cursorPos.z
        });
      };

      // 클릭 이벤트 핸들러 추가
      const handleClick = () => {
        setIsShaking(true);
        shakeStartTime.current = gl.info.render.frame * 0.016; // 현재 시간 저장
      };

      // 이벤트 리스너 등록
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);

      return () => {
        // 클린업: 이벤트 리스너 제거 및 커서 복원
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
        gl.domElement.style.cursor = 'auto';
      };
    } else {
      // 3번 뷰가 아닐 때는 기본 커서로 복원
      gl.domElement.style.cursor = 'auto';
    }
  }, [cameraView, gl, scene, camera]);

  // 3번 뷰가 아니면 렌더링하지 않음
  if (!isView3) return null;

  return (
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
  );
}

export function useCursor(cameraView) {
  const [isCustomCursor, setIsCustomCursor] = useState(false);

  useEffect(() => {
    setIsCustomCursor(cameraView === 3);
  }, [cameraView]);

  return { isCustomCursor };
} 