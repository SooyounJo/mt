import React from 'react';
import { useGLTF, Text3D, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import SceneLights from '../lights/lights';
import Album from './album';
import FixedCameraView from '../camera/camera';

// 3D 모델 컴포넌트들
function FullTestModel() {
  const { scene } = useGLTF('/3d/background/test1glb.glb');
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
          metalness: 0,
          roughness: 0.05,
          transmission: 1,
          thickness: 5,
          ior: 1.5,
          clearcoat: 1,
          clearcoatRoughness: 0,
          reflectivity: 1,
          envMapIntensity: 2,
          opacity: 0.4,
          transparent: true,
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

function LPModelTest() {
  const { scene } = useGLTF('/3d/background/lp5.glb');
  const groupRef = React.useRef();
  const [center, setCenter] = React.useState([0, 0, 0]);

  React.useEffect(() => {
    if (scene) {
      // 메시 전체의 중심 계산
      const box = new THREE.Box3().setFromObject(scene);
      const centerVec = new THREE.Vector3();
      box.getCenter(centerVec);
      // 피봇을 메시 중심으로 이동
      scene.position.sub(centerVec);
      setCenter([centerVec.x, centerVec.y, centerVec.z]);
      // 메시별 머티리얼 처리
      scene.traverse((child) => {
        if (child.isMesh) {
          if (!child.material.map) {
            child.material = new THREE.MeshStandardMaterial({ color: 0x000000 });
          }
        }
      });
    }
  }, [scene]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
    }
  });

  return (
    <group ref={groupRef} position={[-5.5, -3.7, 8.2]} scale={8} receiveShadow castShadow>
      <primitive object={scene} />
    </group>
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
      <LPModelTest />
      <Album />
      <DestinationText destination={destination} />
      
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