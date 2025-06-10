import React, { useMemo, useEffect } from 'react';
import { useGLTF, Text3D, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { TextureLoader, MeshStandardMaterial, MeshBasicMaterial } from 'three';
import * as THREE from 'three';
import SceneLights from '../lights/lights';
import Album from './album';
import FixedCameraView from '../camera/camera';
import LPModel from './lp';
import { CustomCursor } from '../cursor';

// 공통 머티리얼 메모이제이션
const glassMaterial = new MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.1,
  roughness: 0.1,
  transparent: true,
  opacity: 0.2,
  envMapIntensity: 0.3
});

// 3D 모델 컴포넌트들
function FullTestModel() {
  const { scene } = useGLTF('/3d/background/fin.glb');
  
  // 성능 최적화: 메시 최적화
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        
        // 머티리얼 최적화
        if (child.material) {
          child.material.envMapIntensity = 0.5;
          child.material.needsUpdate = false;
        }
        
        // 지오메트리 최적화
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]}
      scale={10}
      frustumCulled={true}
    />
  );
}

function GlassModel() {
  const { scene } = useGLTF('/3d/background/glass.glb');
  
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        
        if (child.name && child.name.toLowerCase().includes('glass')) {
          child.material = glassMaterial;
        }
        
        // 지오메트리 최적화
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
      }
    });
  }, [scene]);
  
  return (
    <primitive 
      object={scene} 
      position={[0, 0, 0]}
      scale={10}
      frustumCulled={true}
    />
  );
}

function BackgroundPlane({ url = "/2d/night3.jpg" }) {
  // 텍스처 메모이제이션
  const texture = useMemo(() => {
    const tex = new TextureLoader().load(url);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }, [url]);

  // 메시 메모이제이션
  const geometry = useMemo(() => new THREE.PlaneGeometry(60, 30), []);
  const material = useMemo(() => new MeshBasicMaterial({ 
    map: texture, 
    toneMapped: false, 
    color: "#888" 
  }), [texture]);

  return (
    <mesh 
      position={[0, -2, -10]} 
      rotation={[0, 0, 0]} 
      receiveShadow={false}
      geometry={geometry}
      material={material}
      frustumCulled={true}
    />
  );
}

// 3D 텍스트 컴포넌트
const DestinationText = React.memo(function DestinationText({ destination }) {
  if (!destination) return null;
  
  return (
    <Text3D
      font="/font/digi.json"
      size={0.6}
      height={0.1}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.04}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={3}
      position={[-6.3, -5, 10.4]}
      castShadow={false}
      receiveShadow={false}
    >
      {destination}
      <meshPhysicalMaterial 
        color="#fff" 
        metalness={0.2} 
        roughness={0.3}
        envMapIntensity={0.5}
      />
    </Text3D>
  );
});

// Pin 모델 컴포넌트
const PinModel = React.memo(function PinModel() {
  const { scene } = useGLTF('/3d/background/pin2.glb');
  const [rotation, setRotation] = React.useState([0, 0, 0]);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const animationCompleted = React.useRef(false);
  const lastTime = React.useRef(0);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        
        // 지오메트리 최적화
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
      }
    });
  }, [scene]);

  useEffect(() => {
    if (window.cameraControl?.camera) {
      const originalCallback = window.cameraControl.setFixedCamera;
      window.cameraControl.setFixedCamera = (view) => {
        originalCallback(view);
        if (view === 5 && !animationCompleted.current) {
          setTimeout(() => setShouldAnimate(true), 2000);
        }
      };
    }
  }, []);

  // 애니메이션 최적화
  useFrame((state) => {
    if (shouldAnimate && !animationCompleted.current) {
      const currentTime = state.clock.getElapsedTime();
      const deltaTime = currentTime - lastTime.current;
      lastTime.current = currentTime;

      const targetRotation = -Math.PI/6;
      const currentRotation = rotation[1];
      const step = deltaTime * 2;
      
      if (Math.abs(currentRotation - targetRotation) > 0.01) {
        setRotation([0, currentRotation + (targetRotation - currentRotation) * step, 0]);
      } else {
        setRotation([0, targetRotation, 0]);
        animationCompleted.current = true;
      }
    }
  });

  return (
    <primitive 
      object={scene} 
      position={[-3.6, -3.9, 6.8]}
      rotation={rotation}
      scale={10}
      frustumCulled={true}
    />
  );
});

// GLB 파일 프리로드
useGLTF.preload('/3d/background/pin2.glb');
useGLTF.preload('/3d/background/fin.glb');
useGLTF.preload('/3d/background/glass.glb');

// 메인 3D 씬 컴포넌트
const Scene3D = React.memo(function Scene3D({ 
  destination, 
  isOrbitEnabled, 
  fixedCamera, 
  animatingCamera, 
  animationProgress, 
  animationDuration, 
  cameraFrom, 
  cameraTo, 
  setFixedCamera,
  onMusicPlay,
  isLoadingMusic,
  musicData,
  isPlaying
}) {
  return (
    <>
      <SceneLights />
      <BackgroundPlane />
      <FullTestModel />
      <GlassModel />
      <LPModel />
      <PinModel />
      <Album 
        onMusicPlay={onMusicPlay}
        isLoadingMusic={isLoadingMusic}
        musicData={musicData}
        isPlaying={isPlaying}
      />
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
});

export default Scene3D; 