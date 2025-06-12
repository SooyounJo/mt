import React, { useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function Particles({ count = 40 }) {
  const meshRefs = useRef([]);
  // 파티클의 초기 위치와 속도
  const [particles] = useState(() =>
    Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 20, // -10~10
        Math.random() * 8 - 2,      // -2~6
        (Math.random() - 0.5) * 20  // -10~10
      ],
      speed: [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      ],
      opacity: 0.7 + Math.random() * 0.2 // 0.7~0.9로 더 밝게
    }))
  );

  useFrame(() => {
    meshRefs.current.forEach((ref, i) => {
      if (ref) {
        ref.position.x += particles[i].speed[0];
        ref.position.y += particles[i].speed[1];
        ref.position.z += particles[i].speed[2];
        if (ref.position.y < -3 || ref.position.y > 7) {
          ref.position.y = Math.random() * 8 - 2;
        }
      }
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={el => (meshRefs.current[i] = el)}
          position={p.position}
        >
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshPhysicalMaterial
            color="#fff"
            transparent
            opacity={p.opacity}
            emissive="#ffffff"
            emissiveIntensity={2.5}
            metalness={0.7}
            roughness={0.15}
            thickness={1.2}
            transmission={0.7}
            ior={1.2}
            attenuationColor="#ffffff"
            attenuationDistance={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function LPModel() {
  const { scene } = useGLTF('/3d/background/lp.glb');
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002; // 훨씬 더 느리게 회전
    }
  });
  return (
    <primitive 
      ref={ref}
      object={scene} 
      position={[0, -0.7, 0]}
      rotation={[Math.PI / 2 - Math.PI / 9, 0, 0]}
      scale={16}
      receiveShadow
      castShadow
    />
  );
}

function CameraAngle() {
  const { camera } = useThree();
  React.useEffect(() => {
    camera.position.set(0, 0, 13);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

export default function First({ onSubmit }) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && destination) {
      onSubmit({ name, destination });
    }
  };

  return (
    <div style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1000 }}>
      {/* 3D 배경 */}
      <Canvas
        camera={{ position: [0, 0, 13], fov: 20 }}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <CameraAngle />
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[-18, 10, -8]}
          intensity={10}
          castShadow
        />
        <pointLight 
          position={[12, -8, 10]}
          intensity={2}
        />
        <Particles count={40} />
        <LPModel />
        <EffectComposer>
          <Bloom luminanceThreshold={0} intensity={1.2} radius={0.8} />
        </EffectComposer>
      </Canvas>
      
      {/* IntroOverlay - 입력 폼 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <h1 style={{marginBottom: 128, marginTop: -120, color: '#fff', fontWeight: 700, fontSize: 128, letterSpacing: 1, textAlign: 'center'}}>memory tone</h1>
        <h3 style={{marginBottom: 32, color: '#fff', fontWeight: 600, fontSize: 18, textAlign: 'center'}}>여행을 기록하기 시작합니다</h3>
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '8px 4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 110,
          marginLeft: 0
        }}>
          <label style={{marginBottom: 12, width: '100%', color: '#fff'}}>
            이름
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc'}} />
          </label>
          <label style={{marginBottom: 18, width: '100%', color: '#fff'}}>
            여행장소
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} style={{width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc'}} />
          </label>
          <button type="submit" style={{padding: '10px 24px', borderRadius: 6, background: '#222', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer'}}>시작하기</button>
        </form>
      </div>
    </div>
  );
} 