import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, arrowHelper } from '@react-three/drei';
import Link from 'next/link';

function FullTestModel() {
  const { scene } = useGLTF('/3d/background/full_test.glb');
  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]}
      scale={10}
      receiveShadow
      castShadow
    />
  );
}

// 포인트 라이트 위치와 좌표
const pointLights = [
  { position: [6.5, -1.7, 8], intensity: 50.0, distance: 40 },
];

function PointLightMarker({ position, direction = [0, -1, 0] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={1.2} />
      </mesh>
      {/* 방향 화살표 */}
      <arrowHelper args={[direction, [0, 0, 0], 2, '#ffe066', 0.5, 0.3]} />
      <Html position={[0, 1.1, 0]} style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', textShadow: '0 0 4px #000' }}>
        {`(${position[0]}, ${position[1]}, ${position[2]})`}
      </Html>
    </group>
  );
}

export default function Test() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 1100
      }}>
        <Link href="/">
          <button
            style={{
              padding: '8px 18px',
              background: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
            }}
          >
            ← 뒤로 가기
          </button>
        </Link>
      </div>
      <Canvas camera={{ position: [0, 2, 10], fov: 35 }} shadows>
        <ambientLight intensity={2.0} />
        <directionalLight position={[5, 10, 7]} intensity={4.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        {pointLights.map((light, idx) => (
          <spotLight
            key={idx}
            position={light.position}
            intensity={light.intensity}
            distance={light.distance}
            angle={Math.PI / 8}
            penumbra={0.5}
            castShadow
            target-position={[light.position[0], light.position[1] - 5, light.position[2]]}
          />
        ))}
        {/* 핀라이트 위치에 노란 공과 방향 표시 */}
        {pointLights.map((light, idx) => (
          <PointLightMarker key={idx} position={light.position} direction={[0, -1, 0]} />
        ))}
        <FullTestModel />
        <OrbitControls />
      </Canvas>
    </div>
  );
} 