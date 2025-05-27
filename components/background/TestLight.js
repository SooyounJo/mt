import React from 'react';

export default function TestLight({ pointLights = [] }) {
  return (
    <>
      
      <ambientLight intensity={1.5} />
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
    </>
  );
} 