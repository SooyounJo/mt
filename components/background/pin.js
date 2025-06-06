import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function Pin() {
  const { scene } = useGLTF('/3d/background/pin.glb');
  const pinRef = useRef();
  const [shouldRotate, setShouldRotate] = useState(false);
  const [rotation, setRotation] = useState([0, 0, 0]);

  useEffect(() => {
    // 전역 이벤트 리스너 등록
    const handlePinRotation = () => {
      setTimeout(() => {
        setShouldRotate(true);
      }, 3000); // 3초 후에 회전 시작
    };

    window.addEventListener('startPinRotation', handlePinRotation);
    return () => window.removeEventListener('startPinRotation', handlePinRotation);
  }, []);

  useFrame((_, delta) => {
    if (shouldRotate && pinRef.current) {
      // 목표 회전값: -30도 (-Math.PI/6)
      const targetRotation = -Math.PI/6;
      const currentRotation = rotation[1];
      const step = delta * 2; // 회전 속도 조절
      
      if (Math.abs(currentRotation - targetRotation) > 0.01) {
        const newRotation = currentRotation + (targetRotation - currentRotation) * step;
        setRotation([0, newRotation, 0]);
        pinRef.current.rotation.set(0, newRotation, 0);
      } else {
        setRotation([0, targetRotation, 0]);
        pinRef.current.rotation.set(0, targetRotation, 0);
        setShouldRotate(false);
      }
    }
  });
  
  return (
    <primitive 
      ref={pinRef}
      object={scene} 
      position={[-3.5, -3.7, 8.2]} // LP의 오른쪽으로 더 이동
      scale={8}
    />
  );
}

// GLB 파일 프리로드
useGLTF.preload('/3d/background/pin.glb'); 