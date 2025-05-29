import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { usePlaneStore } from './planeState';

// 애니메이션 설정
const ANIMATION_CONFIG = {
  springStrength: 0.1,
  damping: 0.8,
  duration: 500
};

// 색상 설정
const COLORS = {
  selected: "#ffeb3b",
  selectable: "#ffffff",
  disabled: "#808080"
};

export function Plane({ position, planeNumber }) {
  // refs
  const meshRef = useRef();
  const originalPosition = useRef(new Vector3(...position));
  const targetPosition = useRef(new Vector3(...position));
  const currentVelocity = useRef(new Vector3());

  // local state
  const [isSelected, setIsSelected] = useState(false);
  const [isSelectable, setIsSelectable] = useState(false);

  // global state
  const { 
    selectedPlane,
    isPlaneSelectable,
    selectPlane,
    getTargetPosition
  } = usePlaneStore();

  // 상태 업데이트 effect
  useEffect(() => {
    setIsSelected(selectedPlane === planeNumber);
    setIsSelectable(isPlaneSelectable(planeNumber));

    // 목표 위치 업데이트
    const newTargetPos = getTargetPosition(planeNumber);
    if (newTargetPos) {
      targetPosition.current.set(...newTargetPos);
    } else {
      targetPosition.current.copy(originalPosition.current);
    }

    return () => {
      // cleanup: 위치 초기화
      if (meshRef.current) {
        meshRef.current.position.copy(originalPosition.current);
      }
      currentVelocity.current.set(0, 0, 0);
    };
  }, [selectedPlane, planeNumber, isPlaneSelectable, getTargetPosition]);

  // 애니메이션 frame
  useFrame(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const currentPos = mesh.position;
    const targetPos = targetPosition.current;
    
    // 방향 벡터 계산
    const direction = targetPos.clone().sub(currentPos);
    
    // 스프링 힘 적용
    currentVelocity.current.add(
      direction.multiplyScalar(ANIMATION_CONFIG.springStrength)
    );
    currentVelocity.current.multiplyScalar(ANIMATION_CONFIG.damping);
    
    // 위치 업데이트
    currentPos.add(currentVelocity.current);
  });

  // 클릭 핸들러
  const handleClick = () => {
    if (!isSelectable) return;
    selectPlane(planeNumber);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial 
        color={isSelected ? COLORS.selected : isSelectable ? COLORS.selectable : COLORS.disabled} 
      />
    </mesh>
  );
}

export default Plane; 