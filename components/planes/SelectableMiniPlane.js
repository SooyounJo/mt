import React, { useMemo } from 'react';
import { TextureLoader, LinearFilter } from 'three';

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
  const texture = useMemo(() => 
    planeNumber >= 1 && planeNumber <= 16 ? loadTexture(planeNumber) : null, 
    [planeNumber]
  );

  return (
    <mesh position={position} rotation={[-Math.PI/2, 0, 0]}>
      <boxGeometry args={[0.85, 0.85, 0.1]} />
      <meshStandardMaterial 
        color="#ffffff"
        map={texture}
        transparent
        side={2}
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
} 