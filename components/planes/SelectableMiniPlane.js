import React, { useMemo, useState, useRef, useEffect } from 'react';
import { TextureLoader, LinearFilter, Color } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { usePlaneStore } from '../background/planeState';

// 텍스처 캐시 및 로더 설정
const textureLoader = new TextureLoader();
const textureCache = new Map();

// 색상 설정
const COLORS = {
  default: new Color("#ffffff"),
  selected: new Color("#ffffff"),
  disabled: new Color("#cccccc"),
  hover: new Color("#f5f5f5")
};

// 애니메이션 설정
const ANIMATION_CONFIG = {
  colorSpeed: 5,  // 색상 전환 속도
  scaleSpeed: 8,  // 크기 전환 속도
  hoverScale: 1.1 // 호버 시 크기
};

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
  const materialRef = useRef();
  const scaleRef = useRef(1);
  const currentColor = useRef(new Color("#ffffff"));

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

  // 색상 및 크기 애니메이션
  useFrame((_, delta) => {
    if (meshRef.current && materialRef.current) {
      // 크기 애니메이션
      if (isSelectable && (hovered || scaleRef.current !== 1)) {
        const targetScale = hovered ? ANIMATION_CONFIG.hoverScale : 1;
        const scaleDiff = targetScale - scaleRef.current;
        
        if (Math.abs(scaleDiff) > 0.001) {
          scaleRef.current += scaleDiff * ANIMATION_CONFIG.scaleSpeed * delta;
          meshRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current);
        }
      }

      // 색상 애니메이션
      const targetColor = isSelectable 
        ? (hovered ? COLORS.hover : COLORS.default)
        : COLORS.disabled;

      currentColor.current.lerp(targetColor, ANIMATION_CONFIG.colorSpeed * delta);
      materialRef.current.color = currentColor.current;
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
          ref={materialRef}
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
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
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