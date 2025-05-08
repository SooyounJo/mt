import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

function LightSetup() {
  const { scene } = useThree();

  useEffect(() => {
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.name = 'windowLight';
    light.position.set(5, 6, -5);
    light.target.position.set(0, 0, 0);
    scene.add(light.target);

    light.castShadow = true;
    light.shadow.mapSize.set(4096, 4096);
    light.shadow.bias = -0.003;
    light.shadow.normalBias = 0.2;

    const cam = light.shadow.camera;
    cam.left = -15;
    cam.right = 15;
    cam.top = 15;
    cam.bottom = -15;
    cam.near = 0.1;
    cam.far = 60;
    cam.updateProjectionMatrix();

    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.05));
  }, [scene]);

  return (
    <Environment
      files="/3d/hdri/meadow.hdr"
      background={false}
      intensity={0.05}
    />
  );
}

export default LightSetup; 