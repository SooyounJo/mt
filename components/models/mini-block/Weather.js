import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';

const files = ['wea.glb'];
const defaultPositions = [[0.7, -1, -1.3]];
// LP의 4곳 끝 좌표 (예시: 좌상, 우상, 좌하, 우하)
const lpPositions = [
  [-0.7, -0.06, 0.7],   // 좌상
  [0.7, -0.06, 0.7],    // 우상
  [-0.7, -0.06, -0.7],  // 좌하
  [0.7, -0.06, -0.7],   // 우하
];

export default function Weather({ visible = true }) {
  const [onLP, setOnLP] = useState(Array(files.length).fill(false));
  const modelRefs = useRef(files.map(() => React.createRef()));

  const handleClick = (idx) => {
    setOnLP((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    if (modelRefs.current[idx].current) {
      if (!onLP[idx]) {
        modelRefs.current[idx].current.position.set(...lpPositions[idx]);
      } else {
        modelRefs.current[idx].current.position.set(...defaultPositions[idx]);
      }
    }
  };

  return (
    <group>
      {files.map((file, idx) => {
        const { scene } = useGLTF(`/3d/mini-block/${file}`);
        return (
          <primitive
            key={file}
            ref={modelRefs.current[idx]}
            object={scene}
            position={onLP[idx] ? lpPositions[idx] : defaultPositions[idx]}
            rotation={[0, Math.PI / 2, 0]}
            scale={8}
            visible={visible}
            castShadow
            receiveShadow
            onClick={() => handleClick(idx)}
          />
        );
      })}
    </group>
  );
} 