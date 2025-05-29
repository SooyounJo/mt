import React from 'react';

// 8개의 플레인 메쉬 컴포넌트 (앨범 형태)
export default function Album() {
  return (
    <>
      {/* 플레인 1 */}
      <mesh position={[-0.2, -5.5, 12]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* 플레인2 */}
      <mesh position={[-0.2, -5.5, 13]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* 플레인3 */}
      <mesh position={[-1.2, -5.5, 12]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[-1.2, -5.5, 13]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* 우측으로 3만큼 이동된 복사본들 */}
      {/* 복사된 플레인 1 */}
      <mesh position={[2.8, -5.5, 12]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* 복사된 플레인 2 */}
      <mesh position={[2.8, -5.5, 13]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* 복사된 플레인 3 */}
      <mesh position={[1.8, -5.5, 12]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* 복사된 플레인 4 */}
      <mesh position={[1.8, -5.5, 13]} rotation={[Math.PI/2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </>
  );
} 