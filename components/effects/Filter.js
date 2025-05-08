import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';

const NUM_PARTICLES = 80;

function randomVec3() {
  return [
    (Math.random() - 0.5) * 10,
    Math.random() * 6 + 0.5,
    (Math.random() - 0.5) * 10
  ];
}

export default function Filter() {
  const group = useRef();
  const positions = useRef(Array.from({ length: NUM_PARTICLES }, randomVec3));

  useFrame((state, delta) => {
    positions.current.forEach((pos, i) => {
      pos[0] += (Math.random() - 0.5) * 0.01;
      pos[1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
      pos[2] += (Math.random() - 0.5) * 0.01;
      if (pos[1] < 0.5) pos[1] = Math.random() * 6 + 0.5;
    });
    if (group.current) {
      group.current.children.forEach((mesh, i) => {
        mesh.position.set(...positions.current[i]);
      });
    }
  });

  return (
    <>
      {/* 먼지 파티클 */}
      <group ref={group}>
        {positions.current.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#fff" transparent opacity={0.15} />
          </mesh>
        ))}
      </group>
      {/* 필름 노이즈/비네트 효과 */}
      <EffectComposer>
        <Noise opacity={0.6} />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </>
  );
} 