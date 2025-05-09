import React, { useRef, useState } from 'react';
import { Text3D, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const NumberBlock = ({ number, position, isActive, onClick }) => {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const targetY = isActive ? 0.5 : 0;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
  });

  return (
    <Text3D
      ref={meshRef}
      font="https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json"
      size={0.5}
      height={0.2}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.02}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={5}
      position={position}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={onClick}
    >
      {number}
      <meshPhysicalMaterial
        color={isHovered ? "#ff6666" : "#ff9999"}
        metalness={0.1}
        roughness={0.1}
        transmission={0.9}
        thickness={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </Text3D>
  );
};

const Model123 = ({ onModelChange }) => {
  const [activeNumber, setActiveNumber] = useState(null);

  const handleClick = (number) => {
    const newActiveNumber = activeNumber === number ? null : number;
    setActiveNumber(newActiveNumber);
    
    // 숫자에 따라 다른 모델을 활성화
    if (newActiveNumber === "1") {
      onModelChange('season');
    } else if (newActiveNumber === "2") {
      onModelChange('place');
    } else if (newActiveNumber === "3") {
      onModelChange('weather');
    } else if (newActiveNumber === "4") {
      onModelChange('place'); // 4번도 place 모델을 활성화하도록 설정
    } else {
      onModelChange(null);
    }
  };

  return (
    <group position={[-0.8, -0.8, -2]} rotation={[0, Math.PI / 2, 0]} scale={0.875}>
      <Center>
        <NumberBlock 
          number="1" 
          position={[-0.7, 0, 0]} 
          isActive={activeNumber === "1"}
          onClick={() => handleClick("1")}
        />
        <NumberBlock 
          number="2" 
          position={[-0.2, 0, 0]} 
          isActive={activeNumber === "2"}
          onClick={() => handleClick("2")}
        />
        <NumberBlock 
          number="3" 
          position={[0.3, 0, 0]} 
          isActive={activeNumber === "3"}
          onClick={() => handleClick("3")}
        />
        <NumberBlock 
          number="4" 
          position={[0.8, 0, 0]} 
          isActive={activeNumber === "4"}
          onClick={() => handleClick("4")}
        />
      </Center>
    </group>
  );
};

export default Model123;
