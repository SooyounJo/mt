import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';

function Scene() {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    // 카메라 초기 위치 설정
    camera.position.set(-30, 7, 0);
    camera.fov = 8;
    camera.updateProjectionMatrix();

    // OrbitControls 초기 타겟 설정
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
    }
  }, []);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={2}
        maxDistance={40}
        enabled={!isDragging}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}

export default function App() {
  return (
    <Canvas 
      camera={{ 
        position: [-30, 7, 0], 
        fov: 8,
        near: 0.1,
        far: 1000
      }}
      onCreated={({ camera }) => {
        camera.updateProjectionMatrix();
      }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Scene />
    </Canvas>
  );
}


