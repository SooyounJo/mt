import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Matrix4 } from 'three';
import { usePlaneStore } from './planeState';

// 애니메이션 설정
const CONFIG = {
  springStrength: 0.15,  // 스프링 강도 증가
  damping: 0.75         // 감쇠 조정
};

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
  // refs
  const meshRef = useRef();
  const origin = useRef(new Vector3(...position));
  const target = useRef(new Vector3(...position));
  const velocity = useRef(new Vector3());
  const [isHovered, setIsHovered] = useState(false);

  // local state
  const [isSelected, setIsSelected] = useState(false);
  const [isSelectable, setIsSelectable] = useState(false);

  // three.js 관련
  const { camera, raycaster, pointer } = useThree();

  // global state
  const { 
    selectedPlanes,
    isPlaneSelectable,
    selectPlane,
    getTargetPosition,
    isPlaneSelected
  } = usePlaneStore();

  // 상태 업데이트 effect
  useEffect(() => {
    setIsSelected(isPlaneSelected(planeNumber));
    setIsSelectable(isPlaneSelectable(planeNumber));

    // 목표 위치 업데이트
    const pos = getTargetPosition(planeNumber);
    if (pos) {
      target.current.set(...pos);
    } else {
      target.current.copy(origin.current);
    }

    return () => {
      // cleanup: 위치 초기화
      if (meshRef.current) {
        meshRef.current.position.copy(origin.current);
        velocity.current.set(0, 0, 0);
      }
    };
  }, [selectedPlanes, planeNumber, isPlaneSelectable, getTargetPosition, isPlaneSelected]);

  // 애니메이션 frame
  useFrame(() => {
    if (!meshRef.current || !isSelected) return;

    const mesh = meshRef.current;
    
    // 현재 월드 위치 계산
    const currentWorldPosition = new Vector3();
    mesh.getWorldPosition(currentWorldPosition);

    // 목표 위치까지의 방향과 거리 계산
    const direction = target.current.clone().sub(currentWorldPosition);
    const distance = direction.length();

    if (distance > 0.001) {  // 의미 있는 거리가 있을 때만 이동
      // 스프링 힘 적용
      velocity.current.add(direction.normalize().multiplyScalar(CONFIG.springStrength * distance));
      velocity.current.multiplyScalar(CONFIG.damping);

      // 새로운 월드 위치 계산
      const newWorldPosition = currentWorldPosition.clone().add(velocity.current);

      // 부모의 월드 변환 행렬 가져오기
      const parentWorldMatrix = mesh.parent.matrixWorld;
      const parentWorldMatrixInverse = parentWorldMatrix.clone().invert();

      // 월드 위치를 로컬 위치로 변환
      const newLocalPosition = newWorldPosition.applyMatrix4(parentWorldMatrixInverse);

      // 위치 업데이트
      mesh.position.copy(newLocalPosition);
    } else {
      // 목표 위치에 거의 도달했을 때
      velocity.current.set(0, 0, 0);
      
      // 정확한 위치로 설정
      const finalLocalPosition = target.current.clone()
        .applyMatrix4(parentWorldMatrixInverse);
      mesh.position.copy(finalLocalPosition);
    }
  });

  const handlePointerOver = () => {
    if (isSelectable && !isSelected) {
      setIsHovered(true);
    }
  };

  const handlePointerOut = () => {
    setIsHovered(false);
  };

  // 클릭 핸들러
  const handleClick = (event) => {
    if (!isSelectable) return;

    // 이벤트 전파 중지
    event.stopPropagation();
    
    // 레이캐스터를 사용하여 가장 앞에 있는 객체 확인
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(event.object.parent.children);
    
    // 현재 메시가 가장 앞에 있는 객체인 경우에만 선택
    if (intersects.length > 0 && intersects[0].object === meshRef.current) {
      selectPlane(planeNumber);
    }
  };

  // 색상 결정
  const getColor = () => {
    if (isSelected) return COLORS.selected;
    if (isHovered) return COLORS.hover;
    return COLORS.default;
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      renderOrder={isSelected ? 2 : 1}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial 
        color={getColor()}
        transparent={true}
        opacity={1}
        depthWrite={true}
        depthTest={true}
      />
    </mesh>
  );
}

export default Plane; 