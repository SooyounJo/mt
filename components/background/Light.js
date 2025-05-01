import React from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';

const Light = () => {
  return (
    <>
      <Environment 
        files="/3d/hdri/meadow.hdr" 
        background 
      />

      <ambientLight intensity={0.05} color="#e0e0ff" />

      <directionalLight
        position={[-5, 6, 5]}
        intensity={6}
        color="#f0f0ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.00001}
        shadow-radius={0}
        shadow-normalBias={0.02}
      />

      <mesh position={[-5, 10, 5]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};

export default Light;
