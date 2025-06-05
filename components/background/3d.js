import React from 'react';
import { useGLTF, Text3D, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import SceneLights from '../lights/lights';
import Album from './album';
import FixedCameraView from '../camera/camera';
import LPModel from './lp';
import { CustomCursor } from '../cursor';

// 3D 모델 컴포넌트들
function FullTestModel() {
  const { scene } = useGLTF('/3d/background/fin.glb');
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

function GlassModel() {
  const { scene } = useGLTF('/3d/background/glass.glb');
  React.useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.name && child.name.toLowerCase().includes('glass')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0.1,
          roughness: 0.1,
          transmission: 0.9,
          thickness: 0.5,
          ior: 1.5,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.5,
          transparent: true,
          opacity: 0.5
        });
      }
    });
  }, [scene]);
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

function BackgroundPlane({ url = "/2d/night3.jpg" }) {
  const texture = React.useMemo(() => new TextureLoader().load(url), [url]);
  return (
    <mesh position={[0, -2, -10]} rotation={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 30]} />
      <meshBasicMaterial map={texture} toneMapped={false} color="#888" />
    </mesh>
  );
}

// 3D 텍스트 컴포넌트
function DestinationText({ destination }) {
  if (!destination) return null;
  
  return (
    <Text3D
      font="/font/digi.json"
      size={0.6}
      height={0.1}
      curveSegments={16}
      bevelEnabled
      bevelThickness={0.04}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={4}
      position={[-6.3, -5, 10.4]}
      castShadow
      receiveShadow
    >
      {destination}
      <meshPhysicalMaterial color="#fff" metalness={0.2} roughness={0.3} />
    </Text3D>
  );
}

// Pin 모델 컴포넌트
function PinModel() {
  const { scene } = useGLTF('/3d/background/pin2.glb');
  return (
    <primitive 
      object={scene} 
      position={[-3.6, -3.9, 6.8]}
      scale={10}
      receiveShadow
      castShadow
    />
  );
}

// GLB 파일 프리로드
useGLTF.preload('/3d/background/pin2.glb');

// 메인 3D 씬 컴포넌트
export default function Scene3D({ 
  destination, 
  isOrbitEnabled, 
  fixedCamera, 
  animatingCamera, 
  animationProgress, 
  animationDuration, 
  cameraFrom, 
  cameraTo, 
  setFixedCamera 
}) {
  return (
    <>
      <SceneLights />
      <BackgroundPlane />
      <FullTestModel />
      <GlassModel />
      <LPModel />
      <PinModel />
      <Album />
      <DestinationText destination={destination} />
      <CustomCursor cameraView={fixedCamera} />
      
      {/* 올빗 컨트롤은 고정 카메라가 아닐 때만 활성화 */}
      {(!fixedCamera) && <OrbitControls enabled={isOrbitEnabled} enableZoom={isOrbitEnabled} enablePan={isOrbitEnabled} />}
      
      {/* 고정 카메라 시점 */}
      {fixedCamera && (
        <FixedCameraView 
          view={fixedCamera}
          animatingCamera={animatingCamera}
          animationProgress={animationProgress}
          animationDuration={animationDuration}
          cameraFrom={cameraFrom}
          cameraTo={cameraTo}
          setFixedCamera={setFixedCamera}
        />
      )}
      
      {/* 카메라 애니메이션만 동작할 때도 FixedCameraView 필요 */}
      {(!fixedCamera && animatingCamera.current) && (
        <FixedCameraView 
          animatingCamera={animatingCamera}
          animationProgress={animationProgress}
          animationDuration={animationDuration}
          cameraFrom={cameraFrom}
          cameraTo={cameraTo}
          setFixedCamera={setFixedCamera}
        />
      )}
    </>
  );
} 