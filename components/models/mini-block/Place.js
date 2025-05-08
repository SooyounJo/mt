import React from 'react';
import { useGLTF } from '@react-three/drei';

const files = [
  'bea.glb',
  'cafe.glb',
  'city.glb',
  'fore.glb',
  'market.glb',
  'play.glb',
];

const defaultPositions = [
  [0.7, -1, -1.5],
  [0.7, -1, -2.05],
  [0.7, -1, -2.6],
  [0.2, -1, -1.5],
  [0.2, -1, -2.05],
  [0.2, -1, -2.6],
];

export default function Place({ visible = true, positions }) {
  const posArr = positions && positions.length === files.length ? positions : defaultPositions;
  return (
    <group>
      {files.map((file, idx) => {
        const { scene } = useGLTF(`/3d/mini-block/place/${file}`);
        return (
          <primitive
            key={file}
            object={scene}
            position={posArr[idx]}
            scale={8}
            visible={visible}
            castShadow
            receiveShadow
          />
        );
      })}
    </group>
  );
} 