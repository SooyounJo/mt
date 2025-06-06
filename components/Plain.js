import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';

export default function Plain({ position, rotation, plainNumber, onSelect }) {
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    // 이벤트 전파 중단
    e.stopPropagation();
    
    // 플레인 선택 이벤트 발생
    if (onSelect) {
      onSelect(plainNumber);
    }
    
    // 카메라 위치 변경 (선택 효과)
    const distance = 3;
    camera.position.set(
      position[0] + Math.sin(rotation[1]) * distance,
      position[1] + 1,
      position[2] + Math.cos(rotation[1]) * distance
    );
    camera.lookAt(position[0], position[1], position[2]);
  };

  return (
    <mesh
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial 
        color={hovered ? "#357ABD" : "#4A90E2"} 
        transparent 
        opacity={hovered ? 1 : 0.8}
        emissive={hovered ? "#357ABD" : "#000000"}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
} 