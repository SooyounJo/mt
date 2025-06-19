import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import BackgroundMusic from '../components/BackgroundMusic';
// import CustomCursorParticle from '../components/CustomCursorParticle';

// function Particles({ count = 40 }) { ... } // 파티클 컴포넌트 전체 주석 처리

function LPModel() {
  const { scene } = useGLTF('/3d/background/lp.glb');
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0005; // 훨씬 더 느리게 회전
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
      <BackgroundMusic />
      {/* 3D 배경 */}
      <Canvas
        camera={{ position: [0, 0, 13], fov: 20 }}
        style={{ width: '100vw', height: '100vh', background: 'transparent', cursor: 'none' }}
        dpr={[1, 1]}
        gl={{ antialias: false, alpha: true }}
        shadows={false}
      >
        <CameraAngle />
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[-10, 5, 2]}
          intensity={4}
          castShadow={false}
        />
        {/* <pointLight 
          position={[12, -8, 10]}
          intensity={2}
        /> */}
        {/* <EffectComposer>
          <Bloom luminanceThreshold={0} intensity={1.2} radius={0.8} />
        </EffectComposer> */}
        <LPModel />
      </Canvas>
      
      {/* IntroOverlay - 입력 폼 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        pointerEvents: 'none'
      }}>
        <h1 style={{marginBottom: 128, marginTop: -120, color: '#fff', fontWeight: 700, fontSize: 128, letterSpacing: 1, textAlign: 'center'}}>memory tone</h1>
        <h3 style={{marginBottom: 32, color: '#fff', fontWeight: 600, fontSize: 14, textAlign: 'center'}}>여행을 기록하기 시작합니다</h3>
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '4px 2px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 60,
          marginLeft: 0,
          pointerEvents: 'auto'
        }}>
          <label style={{marginBottom: 8, width: '100%', color: '#fff', fontSize: 14}}>
            이름
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc', fontSize: 14}} />
          </label>
          <label style={{marginBottom: 8, width: '100%', color: '#fff', fontSize: 14}}>
            여행 장소
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} style={{width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc', fontSize: 14}} />
          </label>
          <button type="submit" style={{padding: '10px 24px', borderRadius: 6, background: '#222', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 14, cursor: 'pointer'}}>시작하기</button>
        </form>
      </div>
    </div>
  );
} 