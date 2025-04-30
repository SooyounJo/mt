import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const Season = () => {
  const { scene } = useGLTF('/3d/ele.glb');
  const modelRef = useRef();

  useEffect(() => {
    if (scene) {
      console.log('Model initial rotation:', scene.rotation);
    }
  }, [scene]);

  return (
    <primitive
      ref={modelRef}
      object={scene}
      position={[0, -1, -1.3]}
      scale={6}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
};

export default Season;
