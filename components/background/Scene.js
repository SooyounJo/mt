import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { LP } from './lp';
import { createStaticPlaneGroup, createRotatingPlaneGroup } from './PlaneGroup';

// 씬 설정
const SCENE_CONFIG = {
  camera: {
    position: [0, 0, 15],
    fov: 75
  },
  lights: {
    ambient: {
      intensity: 0.5
    },
    directional: {
      position: [5, 5, 5],
      intensity: 1
    }
  }
};

export function Scene() {
  return (
    <Canvas>
      {/* 카메라 설정 */}
      <PerspectiveCamera
        makeDefault
        position={SCENE_CONFIG.camera.position}
        fov={SCENE_CONFIG.camera.fov}
      />
      <OrbitControls enableZoom={false} />

      {/* 조명 설정 */}
      <ambientLight intensity={SCENE_CONFIG.lights.ambient.intensity} />
      <directionalLight
        position={SCENE_CONFIG.lights.directional.position}
        intensity={SCENE_CONFIG.lights.directional.intensity}
      />

      {/* LP 모델 */}
      <LP position={[0, -5, 10]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Plane 그룹 */}
      {createStaticPlaneGroup([-0.2, -5.5], [1, 2, 3, 4])}
      {createRotatingPlaneGroup(
        [0.8, -5.44, 11.8],
        [5, 6, 7, 8],
        [9, 10, 11, 12]
      )}
      {createRotatingPlaneGroup(
        [0.8, -5.34, 11.8],
        [13, 14, 15, 16],
        [17, 18, 19, 20]
      )}
    </Canvas>
  );
}

export default Scene; 