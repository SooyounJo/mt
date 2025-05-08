import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';

const files = [
  'fa.glb',
  'sp.glb',
  'su.glb',
  'wi.glb',
];

const defaultPositions = [
  [0.7, -1, -1.5],
  [0.7, -1, -2],
  [0.7, -1, -2.5],
  [0.7, -1, -3],
];

const DEFAULT_LP_POSITION = [-0.7, -0.06, 0.7]; // y축 0.3만 올라오게 수정

export default function Season({ visible = true, lpPosition = DEFAULT_LP_POSITION }) {
  // LP에 올라간 인덱스(그룹 내 단 하나만)
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
        const { scene } = useGLTF(`/3d/mini-block/season/${file}`);
        // LP에 올라간 요소는 항상 보임, 그 외는 visible prop에 따름
        const isVisible = visible || onLPIdx === idx;
        return (
          <primitive
            key={file}
            ref={modelRefs.current[idx]}
            object={scene}
            scale={6}
            visible={isVisible}
            castShadow
            receiveShadow
            rotation={[0, Math.PI / 2, 0]}
            position={onLPIdx === idx ? lpPosition : defaultPositions[idx]}
            onClick={isVisible ? () => handleClick(idx) : undefined}
            style={isVisible ? { cursor: 'pointer' } : { pointerEvents: 'none' }}
          />
        );
      })}
    </group>
  );
}
