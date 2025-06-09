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
          transmission: 0.95,  // 빛 투과율 증가
          thickness: 0.2,      // 두께 감소
          ior: 1.2,           // 굴절률 감소
          clearcoat: 0.1,     // 코팅 효과 감소
          clearcoatRoughness: 0.1,
          envMapIntensity: 0.5,
          transparent: true,
          opacity: 0.1        // 90% 투명도
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
  const [rotation, setRotation] = React.useState([0, 0, 0]);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  // 카메라 뷰 변경 감지 및 애니메이션 시작
  React.useEffect(() => {
    if (window.cameraControl?.camera) {
      const originalCallback = window.cameraControl.setFixedCamera;
      window.cameraControl.setFixedCamera = (view) => {
        originalCallback(view);
        if (view === 5) { // 카메라가 5번 뷰로 이동했을 때
          setTimeout(() => {
            setShouldAnimate(true);
          }, 2000); // 2초 후 애니메이션 시작
        }
      };
    }
  }, []);

  // 회전 애니메이션
  useFrame((state, delta) => {
    if (shouldAnimate) {
      const targetRotation = -Math.PI/6;
      const currentRotation = rotation[1];
      const step = delta * 2; // 회전 속도 조절
      
      if (Math.abs(currentRotation - targetRotation) > 0.01) {
        setRotation([0, currentRotation + (targetRotation - currentRotation) * step, 0]);
      } else {
        setRotation([0, targetRotation, 0]);
      }
    }
  });

  return (
    <primitive 
      object={scene} 
      position={[-3.6, -3.9, 6.8]}
      rotation={rotation}
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
  setFixedCamera,
  onMusicPlay,
  isLoadingMusic,
  musicData
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
} 