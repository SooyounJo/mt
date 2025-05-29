import React from 'react';

// 포인트 라이트 설정
const pointLights = [
  { position: [6.5, -1.7, 8], intensity: 50.0, distance: 40, target: [0, -1, 0] },
];

export default function SceneLights() {
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
      {/* 포인트 라이트들 렌더링 */}
      {pointLights.map((light, index) => (
        <pointLight
          key={index}
          position={light.position}
          intensity={light.intensity}
          distance={light.distance}
          castShadow
        />
      ))}
    </>
  );
}

// 포인트 라이트 설정을 외부에서 사용할 수 있도록 export
export { pointLights }; 