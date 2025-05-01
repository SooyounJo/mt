import React from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';

const Control = ({ isDragging = false }) => {
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 5, 10]} 
        fov={50}
      />
      <OrbitControls 
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={2}
        maxDistance={40}
        enabled={!isDragging}
      />
    </>
  );
};

export default Control; 