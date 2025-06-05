import React, { useMemo, useState, useRef } from 'react';
import { TextureLoader, LinearFilter } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { usePlaneStore } from '../background/planeState';

// 텍스처 캐시 및 로더 설정
const textureLoader = new TextureLoader();
const textureCache = new Map();

// 텍스처 로드 최적화 함수
const loadTexture = (planeNumber) => {
  if (!textureCache.has(planeNumber)) {
    const texture = textureLoader.load(`/2d/mini/${planeNumber}.png`);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    textureCache.set(planeNumber, texture);
  }
  return textureCache.get(planeNumber);
};

export function SelectableMiniPlane({ position, planeNumber }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const scaleRef = useRef(1);

  const { 
    toggleMiniPlane, 
    isMiniPlaneSelected, 
    isMiniPlaneSelectable 
  } = usePlaneStore();

  const isSelected = isMiniPlaneSelected(planeNumber);
  const isSelectable = isMiniPlaneSelectable(planeNumber);

  const texture = useMemo(() => 
    planeNumber >= 1 && planeNumber <= 16 ? loadTexture(planeNumber) : null, 
    [planeNumber]
  );

  // 호버링 애니메이션
  useFrame((_, delta) => {
    if (meshRef.current && isSelectable) {
      const targetScale = hovered ? 1.1 : 1;
      scaleRef.current += (targetScale - scaleRef.current) * 5 * delta;
      meshRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
    }
  });

  const handleClick = () => {
    if (isSelectable) {
      toggleMiniPlane(planeNumber);
    }
  };

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI/2, 0, 0]}
        onPointerOver={() => {
          if (isSelectable) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          if (isSelectable) {
            setHovered(false);
            document.body.style.cursor = 'default';
          }
        }}
        onClick={handleClick}
      >
        <boxGeometry args={[0.85, 0.85, 0.1]} />
        <meshStandardMaterial 
          color={isSelectable ? "#ffffff" : "#cccccc"}
          map={texture}
          transparent
          side={2}
          metalness={0.1}
          roughness={0.5}
          opacity={isSelectable ? 1 : 0.7}
        />
      </mesh>
      
      {/* 체크 표시 */}
      {isSelected && (
        <>
          {/* 체크 마크 배경 */}
          <mesh
            position={[0.25, 0.05, 0.25]}
            rotation={[-Math.PI/2, 0, 0]}
          >
            <circleGeometry args={[0.15]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          {/* 체크 마크 */}
          <Text
            position={[0.25, 0.06, 0.25]}
            rotation={[-Math.PI/2, 0, 0]}
            fontSize={0.2}
            color="#ff0000"
            anchorX="center"
            anchorY="middle"
          >
            ✓
          </Text>
        </>
      )}
    </group>
  );
} 