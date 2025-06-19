import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Center } from '@react-three/drei';

const ClickHereText = ({ onClick }) => {
  const textRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      textRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Center position={[-2.2, 1.8, 0]} rotation={[0, Math.PI / 8, Math.PI / 6]}>
      <Text
        ref={textRef}
        fontSize={0.2}
        color={hovered ? '#ff0000' : '#ff0000'}
        anchorX="center"
        anchorY="middle"
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        material-toneMapped={false}
        material-roughness={0.2}
        material-metalness={0.8}
        material-envMapIntensity={1}
        material-clearcoat={1}
        material-clearcoatRoughness={0.2}
        height={0.15}
        bevelEnabled
        bevelThickness={0.08}
        bevelSize={0.05}
        bevelSegments={8}
        style={{
          fontWeight: 'bold',
          letterSpacing: '0.2em',
          transform: 'scaleX(1.5)'
        }}
      >
        Click Here
      </Text>
    </Center>
  );
};

export default ClickHereText; 