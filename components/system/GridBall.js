import React from 'react';
import { Sphere } from '@react-three/drei';

const GridBall = () => {
  return (
    <>
      {/* z+1 위치에 파란 공 */}
      <Sphere position={[0, 0, 1]} args={[0.2, 32, 32]}>
        <meshStandardMaterial color="blue" />
      </Sphere>

      {/* X+1 위치에 빨간공 */}
      <Sphere position={[1, 0, 0]} args={[0.2, 32, 32]}>
        <meshStandardMaterial color="red" />
      </Sphere>
    </>
  );
};

export default GridBall; 