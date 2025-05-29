import React, { useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, arrowHelper, Text3D, Environment } from '@react-three/drei';
import Link from 'next/link';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useRouter } from 'next/router';
import TestLight from '../components/background/TestLight';

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
  const { scene } = useGLTF('/3d/recode/lp5.glb');
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

// 포인트 라이트 위치와 좌표
const pointLights = [
  { position: [6.5, -1.7, 8], intensity: 50.0, distance: 40, target: [0, -1, 0] },
];

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
  const router = useRouter();
  const { destination, name } = router.query;
  const [isOrbitEnabled, setIsOrbitEnabled] = useState(true);
  const [fixedCamera, setFixedCamera] = useState(null); // null, 1, 2, 3
  const animatingCamera = useRef(false);
  const animationProgress = useRef(0);
  const animationDuration = 2.2; // 초 단위, 더 느리게
  const cameraFrom = useRef({ position: [0,0,0], target: [0,0,0] });
  const cameraTo = useRef({ position: [0,0,0], target: [0,0,0] });

  // 카메라 애니메이션 함수 (1초 대기 후 실행)
  function animateCamera(from, to, onComplete) {
    cameraFrom.current = from;
    cameraTo.current = to;
    animationProgress.current = 0;
    setFixedCamera(1); // 1번 시점으로 먼저 고정
    setIsOrbitEnabled(false);
    setTimeout(() => {
      animatingCamera.current = true;
      setFixedCamera(null); // OrbitControls도 비활성화
      // 애니메이션 완료 후 콜백 실행
      if (onComplete) {
        setTimeout(onComplete, animationDuration * 1000);
      }
    }, 1000);
  }

  // 고정 카메라 시점 컴포넌트 + 애니메이션
  function FixedCameraView({ view }) {
    const { camera } = useThree();
    useFrame((_, delta) => {
      if (animatingCamera.current) {
        animationProgress.current += delta / animationDuration;
        const t = Math.min(animationProgress.current, 1);
        // position damp
        const fromPos = cameraFrom.current.position;
        const toPos = cameraTo.current.position;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, fromPos[0] + (toPos[0] - fromPos[0]), 2, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, fromPos[1] + (toPos[1] - fromPos[1]), 2, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, fromPos[2] + (toPos[2] - fromPos[2]), 2, delta);
        // target damp
        const fromTarget = cameraFrom.current.target;
        const toTarget = cameraTo.current.target;
        const lookX = THREE.MathUtils.damp(camera._lookX || fromTarget[0], fromTarget[0] + (toTarget[0] - fromTarget[0]), 2, delta);
        const lookY = THREE.MathUtils.damp(camera._lookY || fromTarget[1], fromTarget[1] + (toTarget[1] - fromTarget[1]), 2, delta);
        const lookZ = THREE.MathUtils.damp(camera._lookZ || fromTarget[2], fromTarget[2] + (toTarget[2] - fromTarget[2]), 2, delta);
        camera.lookAt(lookX, lookY, lookZ);
        camera._lookX = lookX; camera._lookY = lookY; camera._lookZ = lookZ;
        camera.updateProjectionMatrix();
        if (t >= 1 &&
          Math.abs(camera.position.x - (fromPos[0] + (toPos[0] - fromPos[0]))) < 0.01 &&
          Math.abs(camera.position.y - (fromPos[1] + (toPos[1] - fromPos[1]))) < 0.01 &&
          Math.abs(camera.position.z - (fromPos[2] + (toPos[2] - fromPos[2]))) < 0.01) {
          animatingCamera.current = false;
          setFixedCamera(3); // 애니메이션 끝나면 3번 카메라로 고정
        }
        return;
      }
      if (view === 1) {
        camera.position.set(40, 16, 55);
        camera.fov = 35;
        camera.lookAt(4, -3, 0);
        camera.updateProjectionMatrix();
      } else if (view === 2) {
        camera.position.set(5, 24, 70);
        camera.fov = 35;
        camera.lookAt(5, -7, 0);
        camera.updateProjectionMatrix();
      } else if (view === 3) {
        camera.position.set(0, 7, 24);
        camera.fov = 35;
        camera.lookAt(0, -7, 7);
        camera.updateProjectionMatrix();
      }
    });
    return null;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {name && (
        <div style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          zIndex: 1200
        }}>{name}-s room</div>
      )}
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
      {/* 우측 상단 OrbitControls 토글 + 카메라 시점 버튼 */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setIsOrbitEnabled((prev) => !prev)}
          style={{
            padding: '8px 16px',
            backgroundColor: isOrbitEnabled ? '#222' : '#888',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          {isOrbitEnabled ? '뷰 고정' : '뷰 해제'}
        </button>
        <button
          onClick={() => { setFixedCamera(1); setIsOrbitEnabled(false); }}
          style={{
            padding: '8px 14px',
            backgroundColor: fixedCamera === 1 ? '#ffe066' : '#222',
            color: fixedCamera === 1 ? '#222' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}
        >1</button>
        <button
          onClick={() => { setFixedCamera(2); setIsOrbitEnabled(false); }}
          style={{
            padding: '8px 14px',
            backgroundColor: fixedCamera === 2 ? '#ffe066' : '#222',
            color: fixedCamera === 2 ? '#222' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}
        >2</button>
        <button
          onClick={() => { setFixedCamera(3); setIsOrbitEnabled(false); }}
          style={{
            padding: '8px 14px',
            backgroundColor: fixedCamera === 3 ? '#ffe066' : '#222',
            color: fixedCamera === 3 ? '#222' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}
        >3</button>
        {/* 뷰 변경 애니메이션 버튼 */}
        <button
          onClick={() => {
            // 1번 → 2번 → 3번 순서로 이동
            animateCamera(
              { position: [40, 8, 45], target: [4, -3, 0] }, // 1번
              { position: [5, 24, 60], target: [5, -7, 0] }, // 2번
              () => {
                animateCamera(
                  { position: [5, 24, 60], target: [5, -7, 0] }, // 2번
                  { position: [0, 7, 20], target: [0, -7, 7] }   // 3번
                );
              }
            );
          }}
          style={{
            padding: '8px 14px',
            backgroundColor: '#ffe066',
            color: '#222',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'monospace',
          }}
        >뷰 변경</button>
      </div>
      <Canvas camera={{ position: [6, 0, 15], fov: 35 }} shadows>
        <TestLight pointLights={pointLights} />
        <BackgroundPlane url="/2d/night3.jpg" />
        <FullTestModel />
        <GlassModel />
        <LPModelTest />
        {/* 올빗 컨트롤은 고정 카메라가 아닐 때만 활성화 */}
        {(!fixedCamera) && <OrbitControls enabled={isOrbitEnabled} enableZoom={isOrbitEnabled} enablePan={isOrbitEnabled} />}
        {/* 고정 카메라 시점 */}
        {fixedCamera && <FixedCameraView view={fixedCamera} />}
        {/* 카메라 애니메이션만 동작할 때도 FixedCameraView 필요 */}
        {(!fixedCamera && animatingCamera.current) && <FixedCameraView />}
        {/* 여행지 3D 텍스트 */}
        {destination && (
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
        )}
        {/* 플레인 1 */}
        <mesh position={[-0.2, -5.5, 11]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* 플레인2 */}
        <mesh position={[-0.2, -5.5, 12]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* 플레인3 */}
        <mesh position={[-1.2, -5.5, 11]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <mesh position={[-1.2, -5.5, 12]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      </Canvas>
    </div>
  );
} 