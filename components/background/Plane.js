import React, { useRef, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { usePlaneStore } from './planeState';

// 색상 설정
const COLORS = {
  selected: "#ffeb3b",    // 선택된 상태 (노란색)
  default: "#ffffff",     // 기본 상태 (흰색)
  hover: "#f5f5f5"       // 호버 상태 (연한 회색)
};

/**
 * @description
 * Plane 컴포넌트는 단일 평면을 3D 공간에 렌더링하며,
 * 클릭 가능한 상태와 선택 시 애니메이션 이동을 수행합니다.
 * 
 * @props
 * - position: 초기 위치 [x, y, z]
 * - planeNumber: 고유 식별자 번호
 */
export function Plane({ position, planeNumber }) {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isSelectable, setIsSelectable] = useState(false);

  const { raycaster, pointer, camera } = useThree();
  const { isPlaneSelectable, selectPlane, isPlaneSelected } = usePlaneStore();

  // 상태 업데이트
  useEffect(() => {
    setIsSelected(isPlaneSelected(planeNumber));
    setIsSelectable(isPlaneSelectable(planeNumber));
  }, [planeNumber, isPlaneSelectable, isPlaneSelected]);

  const handlePointerOver = () => {
    if (isSelectable) {
      setIsHovered(true);
    }
  };

  const handlePointerOut = () => {
    setIsHovered(false);
  };

  const handleClick = (event) => {
    if (!isSelectable) return;
    event.stopPropagation();
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(event.object.parent.children);
    
    if (intersects.length > 0 && intersects[0].object === meshRef.current) {
      selectPlane(planeNumber);
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial 
        color={isSelected ? COLORS.selected : isHovered ? COLORS.hover : COLORS.default}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
}

export default Plane; 