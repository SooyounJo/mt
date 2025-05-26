import React from 'react';
import { OrbitControls } from '@react-three/drei';

const Control = ({ isDragging = false, enabled = true }) => {
  return (
    <OrbitControls 
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      minDistance={2}
      maxDistance={40}
      enabled={!isDragging && enabled}
    />
  );
};

export default Control; 