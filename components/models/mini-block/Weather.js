import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';

const files = ['wea.glb'];
const defaultPositions = [[0.7, -1, -1.3]];
const DEFAULT_LP_POSITION = [-0.3, -0.26, -0.3]; // 중심 기준 0.3 거리 좌측 아래

export default function Weather({ visible = true, lpPosition = DEFAULT_LP_POSITION }) {
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
          modelRefs.current[i].current.position.set(...defaultPositions[i]);
        }
      }
    });
  };

  return (
    <group>
      {files.map((file, idx) => {
        const { scene } = useGLTF(`/3d/mini-block/${file}`);
        const isVisible = visible || onLPIdx === idx;
        return (
          <primitive
            key={file}
            ref={modelRefs.current[idx]}
            object={scene}
            position={onLPIdx === idx ? lpPosition : defaultPositions[idx]}
            rotation={[0, Math.PI / 2, 0]}
            scale={onLPIdx === idx ? 8 * 0.8 : 8}
            visible={isVisible}
            castShadow
            receiveShadow
            onClick={isVisible ? () => handleClick(idx) : undefined}
            style={isVisible ? { cursor: 'pointer' } : { pointerEvents: 'none' }}
          />
        );
      })}
    </group>
  );
} 