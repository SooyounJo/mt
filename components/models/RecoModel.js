import React from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

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

export default RecoModel; 