import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';

const Grid = ({ mousePosition }) => {
  return (
    <>
      {/* 마우스 위치 표시 UI */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        fontFamily: 'monospace'
      }}>
        <div>X: {mousePosition.x}</div>
        <div>Y: {mousePosition.y}</div>
        <div>Z: {mousePosition.z}</div>
      </div>

      {/* 원점(0,0,0) 표시 */}
      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <Sphere position={[0, 0, 0]} args={[0.2, 32, 32]}>
          <meshStandardMaterial color="red" />
        </Sphere>
      </Canvas>
    </>
  );
};

export default Grid; 