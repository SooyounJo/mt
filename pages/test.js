import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, arrowHelper, Text3D, Environment } from '@react-three/drei';
import Link from 'next/link';
import { TextureLoader } from 'three';

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
  { position: [6.5, -1.7, 8], intensity: 50.0, distance: 40, target: [0, -1, 0] },
];

function PointLightMarker({ position, direction = [0, -1, 0] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#ffe066" emissive="#ffe066" emissiveIntensity={1.2} />
      </mesh>
      {/* 공 옆(오른쪽)에 방향 화살표 */}
      <group position={[1, 0, 0]}>
        <arrowHelper args={[direction, [0, 0, 0], 2, '#ffe066', 0.5, 0.3]} />
      </group>
      <Html position={[0, 1.1, 0]} style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', textShadow: '0 0 4px #000' }}>
        {`(${position[0]}, ${position[1]}, ${position[2]})`}
      </Html>
    </group>
  );
}

function MemoryToneText() {
  return (
    <Text3D
      font="/font/coop.json"
      size={2.5}
      height={0.4}
      curveSegments={16}
      bevelEnabled
      bevelThickness={0.08}
      bevelSize={0.04}
      bevelOffset={0}
      bevelSegments={8}
      position={[-6, 12, 8]}
      castShadow
      receiveShadow
      letterSpacing={0.25}
    >
      memory tone
      <meshStandardMaterial color="#fffbe6" emissive="#ffe066" metalness={0.3} roughness={0.2} />
    </Text3D>
  );
}

function BackgroundPlane({ url = "/2d/plane.png" }) {
  const texture = React.useMemo(() => new TextureLoader().load(url), [url]);
  return (
    <mesh position={[0, -2, -10]} rotation={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 30]} />
      {/* plane 사이즈(30x15)에 맞는 이미지를 사용하는 것이 가장 자연스럽습니다. */}
      <meshBasicMaterial map={texture} toneMapped={false} color="#888" />
    </mesh>
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
      <Canvas camera={{ position: [0, -3, 10], fov: 35 }} shadows>
        <ambientLight intensity={2.0} />
        <directionalLight position={[5, 10, 7]} intensity={4.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <BackgroundPlane url="/2d/night3.jpg" />
        <MemoryToneText />
        {pointLights.map((light, idx) => {
          // 방향 벡터 계산: target - position
          const dir = [
            light.target[0] - light.position[0],
            light.target[1] - light.position[1],
            light.target[2] - light.position[2]
          ];
          // 정규화
          const len = Math.sqrt(dir[0]**2 + dir[1]**2 + dir[2]**2) || 1;
          const normDir = [dir[0]/len, dir[1]/len, dir[2]/len];
          return (
            <>
              <spotLight
                key={idx}
                position={light.position}
                intensity={light.intensity}
                distance={light.distance}
                angle={Math.PI / 8}
                penumbra={0.5}
                castShadow
                target-position={light.target}
              />
              <PointLightMarker position={light.position} direction={normDir} />
            </>
          );
        })}
        <FullTestModel />
        <OrbitControls />
      </Canvas>
    </div>
  );
} 