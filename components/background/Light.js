import React from 'react';
import * as THREE from 'three';

const Light = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[-5, 5, 5]} 
        intensity={1.5} 
        castShadow
      />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow
      />

      {/* 조명 위치 표시 */}
      <mesh position={[-5, 5, 5]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[5, 5, 5]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};

export default Light; 