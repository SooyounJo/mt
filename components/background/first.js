import React, { useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGLTF } from '@react-three/drei';
import { Environment } from '@react-three/drei';

function BlurredFullModel() {
  const { scene } = useGLTF('/3d/background/full4.glb');
  return (
    <primitive 
      object={scene} 
      position={[-1.7, -4.5, 0.4]}
      rotation={[0, Math.PI / 2, 0]}
      scale={25}
      receiveShadow
      castShadow
    />
  );
}

function CameraAngle() {
  const { camera } = useThree();
  React.useEffect(() => {
    camera.position.set(19, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function Particles({ count = 40 }) {
  const meshRefs = React.useRef([]);
  // 파티클의 초기 위치와 속도
  const [particles] = React.useState(() =>
    Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        Math.random() * 12 - 4,
        (Math.random() - 0.5) * 30
      ],
      speed: [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      ],
      opacity: 0.5 + Math.random() * 0.3
    }))
  );

  useFrame(() => {
    meshRefs.current.forEach((ref, i) => {
      if (ref) {
        // 먼지가 천천히 움직이도록 위치 업데이트
        ref.position.x += particles[i].speed[0];
        ref.position.y += particles[i].speed[1];
        ref.position.z += particles[i].speed[2];
        // 화면을 벗어나면 다시 랜덤 위치로
        if (ref.position.y < -6 || ref.position.y > 10) {
          ref.position.y = Math.random() * 12 - 4;
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
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial
            color="#fff"
            transparent
            opacity={p.opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function First() {
  return (
    <div style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1000 }}>
      <Canvas
        camera={{ position: [0, 0, -15], fov: 20 }}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <Environment files="/3d/hdri/meadow.hdr" background />
        <CameraAngle />
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[-5, 10, -10]}
          intensity={2.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.001}
          shadow-normalBias={0.1}
        />
        <BlurredFullModel />
        <Particles count={80} />
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
} 