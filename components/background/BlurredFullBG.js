import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGLTF } from '@react-three/drei';

function BlurredFullModel() {
  const { scene } = useGLTF('/3d/background/full4.glb');
  return (
    <primitive 
      object={scene} 
      position={[-1.7, -4.5, 0.4]}
      rotation={[0, Math.PI / 2, 0]}
      scale={35}
      receiveShadow
      castShadow
    />
  );
}

export default function BlurredFullBG() {
  return (
    <div style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1000 }}>
      <Canvas
        camera={{ position: [0, 0, 120], fov: 20 }}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[-15, 6, -6]} intensity={2} />
        <BlurredFullModel />
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>
    </div>
  );
} 