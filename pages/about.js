import React, { useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import styled from 'styled-components';
import * as THREE from 'three';

const Model = () => {
  const materials = useLoader(MTLLoader, '/re.mtl');
  const obj = useLoader(OBJLoader, '/re.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  return <primitive object={obj} position={[-1, 0, 0]} rotation={[1.5, 3.2, 0]} scale={[0.5, 0.5, 0.5]} />;
};

const StyledCanvasContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AxesLabels = () => (
  <>
    <Text position={[5.5, 0, 0]} fontSize={0.2} color="red">X</Text>
    <Text position={[0, 5.5, 0]} fontSize={0.2} color="green">Y</Text>
    <Text position={[0, 0, 5.5]} fontSize={0.2} color="blue">Z</Text>
  </>
);

export default function About() {
  return (
    <StyledCanvasContainer>
      <Canvas camera={{ fov: 75, position: [0, 5, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <axesHelper args={[5]} />
        <gridHelper args={[10, 10]} />
        <AxesLabels />
        <Model />
        <OrbitControls enableZoom={true} />
      </Canvas>
    </StyledCanvasContainer>
  );
} 