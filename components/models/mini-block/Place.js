import React, { useRef, useState } from 'react';
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

const lpPosition = [0.7, -0.06, 0.7]; // 우측 위

export default function Place({ visible = true, positions }) {
  const posArr = positions && positions.length === files.length ? positions : defaultPositions;
  const [onLPIdx, setOnLPIdx] = useState(null);
  const modelRefs = useRef(files.map(() => React.createRef()));

  const handleClick = (idx) => {
    if (!visible) return;
    setOnLPIdx(idx);
    files.forEach((file, i) => {
      if (modelRefs.current[i].current) {
        if (i === idx) {
          modelRefs.current[i].current.position.set(...lpPosition);
        } else {
          modelRefs.current[i].current.position.set(...posArr[i]);
        }
      }
    });
  };

  return (
    <group>
      {files.map((file, idx) => {
        const { scene } = useGLTF(`/3d/mini-block/place/${file}`);
        const isVisible = visible || onLPIdx === idx;
        return (
          <primitive
            key={file}
            ref={modelRefs.current[idx]}
            object={scene}
            scale={8}
            visible={isVisible}
            castShadow
            receiveShadow
            rotation={[0, Math.PI / 2, 0]}
            position={onLPIdx === idx ? lpPosition : posArr[idx]}
            onClick={isVisible ? () => handleClick(idx) : undefined}
            style={isVisible ? { cursor: 'pointer' } : { pointerEvents: 'none' }}
          />
        );
      })}
    </group>
  );
} 