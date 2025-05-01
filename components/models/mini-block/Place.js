import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

const Place = () => {
  const { scene } = useGLTF('/3d/mini-block/place.glb');

  useEffect(() => {
    console.log('Place model loaded:', scene);
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[0.8, -1, -1.2]}
      rotation={[0, 0, 0]}
      scale={7}
    />
  );
};

export default Place; 