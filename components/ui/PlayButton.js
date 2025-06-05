import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Shape, ExtrudeGeometry } from 'three';

// 삼각형 모양 정의
const triangleShape = new Shape().moveTo(0, 0).lineTo(0, 1).lineTo(0.866, 0.5).lineTo(0, 0);
const extrudeSettings = { 
  depth: 0.2, 
  bevelEnabled: true, 
  bevelThickness: 0.05, 
  bevelSize: 0.05, 
  bevelSegments: 3 
};

export function PlayButton({ position, onClick, scale = 1, rotation = [0, 0, 0] }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const time = useRef(0);
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  useFrame((_, delta) => {
    time.current += delta;
    if (meshRef.current) {
      // 부드러운 상하 움직임
      meshRef.current.position.y = position[1] + Math.sin(time.current * 2) * 0.1;
      
      // 부드러운 크기 변화
      targetScale.current = hovered ? 1.2 : 1;
      currentScale.current += (targetScale.current - currentScale.current) * 8 * delta;
      meshRef.current.scale.set(
        scale * currentScale.current,
        scale * currentScale.current,
        scale * currentScale.current
      );
    }
  });

  const meshProps = useMemo(() => ({
    ref: meshRef,
    position,
    rotation,
    onClick,
    onPointerOver: () => {
      setHovered(true);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      setHovered(false);
      document.body.style.cursor = 'default';
    }
  }), [position, rotation, onClick]);

  return (
    <mesh {...meshProps}>
      <extrudeGeometry args={[triangleShape, extrudeSettings]} />
      <meshStandardMaterial color={hovered ? "#ff6b6b" : "#ff0000"} metalness={0.5} roughness={0.5} />
    </mesh>
  );
} 