import React, { useMemo } from 'react';

// 포인트 라이트 설정 메모이제이션
const pointLights = [
  { position: [6.5, -1.7, 8], intensity: 50.0, distance: 40, target: [0, -1, 0] },
];

// 메모이제이션된 조명 컴포넌트
const SceneLights = React.memo(function SceneLights() {
  // 포인트 라이트 설정 메모이제이션
  const memoizedPointLights = useMemo(() => 
    pointLights.slice(0, 2).map((light, index) => ({
      ...light,
      intensity: light.intensity * 0.8
    })), 
    []
  );

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={2.0} 
        castShadow={false}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={50}
      />
      {memoizedPointLights.map((light, index) => (
        <pointLight
          key={index}
          position={light.position}
          intensity={light.intensity}
          distance={light.distance}
          castShadow={false}
          decay={2}
        />
      ))}
    </>
  );
});

export default SceneLights;

// 포인트 라이트 설정을 외부에서 사용할 수 있도록 export
export { pointLights }; 