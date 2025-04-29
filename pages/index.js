import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { GridSystem } from '../components/Grid';

const RecoModel = () => {
  const { scene } = useGLTF('/3d/reco.glb');
  
  React.useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);
    }
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      scale={2.5} 
      position={[0, -1.5, 0]} 
      rotation={[0, Math.PI / 2, 0]}
    />
  );
};

const LPModel = () => {
  const { scene } = useGLTF('/3d/lp4.glb');
  
  React.useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      // 모든 메시에 플라스틱 재질 적용
      scene.traverse((child) => {
        if (child.isMesh) {
          const originalMaterial = child.material;
          child.material = new THREE.MeshStandardMaterial({
            map: originalMaterial.map, // 기존 UV 텍스처 유지
            metalness: 0.1,           // 낮은 금속성
            roughness: 0.2,           // 낮은 거칠기로 광택감 강화
            envMapIntensity: 1.2,     // 환경 맵 반사 강도
            clearcoat: 0.5,           // 클리어코트 효과
            clearcoatRoughness: 0.1   // 클리어코트 거칠기
          });
        }
      });
    }
  }, [scene]);

  return (
    <group position={[0.6, -1.17, 0.22]} rotation={[0, 0, 0]}>
      <primitive 
        object={scene} 
        scale={2.5} 
      />
      <Sphere args={[0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
};

const TurnModel = () => {
  const { scene } = useGLTF('/3d/turn.glb');
  
  React.useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      // 모든 메시에 알루미늄 재질 적용
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,  // 알루미늄 색상
            metalness: 0.9,   // 금속성 (0-1)
            roughness: 0.2,   // 거칠기 (0-1, 낮을수록 더 반짝임)
            envMapIntensity: 1.5  // 환경 맵 반사 강도
          });
        }
      });
    }
  }, [scene]);

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <primitive 
        object={scene} 
        scale={2.5} 
      />
      <Sphere args={[0.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color="blue" emissive="blue" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
};

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, overflow: 'hidden' }}>
      <Canvas 
        style={{ width: '100%', height: '100%' }}
        camera={{ 
          position: [0, 3, 5], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="city" />
        <GridSystem />
        <RecoModel />
        <LPModel />
        <TurnModel />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
          target={[0, -1.5, 0]}
        />
      </Canvas>
    </div>
  );
}
