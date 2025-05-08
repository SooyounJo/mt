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

// LP의 4곳 끝 좌표 (예시: 좌상, 우상, 좌하, 우하)
const lpPositions = [
  [-0.7, -0.06, 0.7],   // 좌상
  [0.7, -0.06, 0.7],    // 우상
  [-0.7, -0.06, -0.7],  // 좌하
  [0.7, -0.06, -0.7],   // 우하
];

export default function Place({ visible = true, positions }) {
  const posArr = positions && positions.length === files.length ? positions : defaultPositions;
  const [onLP, setOnLP] = useState(Array(files.length).fill(false));
  const modelRefs = useRef(Array(files.length).fill().map(() => React.createRef()));

  const handleClick = (idx) => {
    setOnLP((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    if (modelRefs.current[idx].current) {
      if (!onLP[idx]) {
        modelRefs.current[idx].current.position.set(...lpPositions[idx % 4]);
      } else {
        modelRefs.current[idx].current.position.set(...posArr[idx]);
      }
    }
  };

  return (
    <group>
      {files.map((file, idx) => {
        const { scene } = useGLTF(`/3d/mini-block/place/${file}`);
        return (
          <primitive
            key={file}
            ref={modelRefs.current[idx]}
            object={scene}
            scale={8}
            visible={visible}
            castShadow
            receiveShadow
            rotation={[0, Math.PI / 2, 0]}
            position={onLP[idx] ? lpPositions[idx % 4] : posArr[idx]}
            onClick={() => handleClick(idx)}
          />
        );
      })}
    </group>
  );
} 