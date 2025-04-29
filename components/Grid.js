import React from 'react';
import { Grid, Text } from '@react-three/drei';
import * as THREE from 'three';

export function GridSystem() {
  return (
    <>
      {/* 메인 그리드 */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeStrength={1}
        fadeDistance={30}
        followCamera={false}
        position={[0, -1.5, 0]}
      />
      
      {/* X축 (빨간색) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -1.5, 0, 10, -1.5, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="red" linewidth={2} />
      </line>
      
      {/* Y축 (녹색) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -1.5, 0, 0, 8.5, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="green" linewidth={2} />
      </line>
      
      {/* Z축 (파란색) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -1.5, 0, 0, -1.5, 10])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="blue" linewidth={2} />
      </line>

      {/* 축 레이블 */}
      <Text 
        position={[10.5, -1.5, 0]}
        color="red"
        fontSize={0.5}
        anchorX="left"
      >
        X
      </Text>
      
      <Text 
        position={[0, 9, 0]}
        color="green"
        fontSize={0.5}
        anchorY="top"
      >
        Y
      </Text>
      
      <Text 
        position={[0, -1.5, 10.5]}
        color="blue"
        fontSize={0.5}
        anchorX="left"
      >
        Z
      </Text>
    </>
  );
} 