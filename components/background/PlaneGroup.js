import React from 'react';
import Plane from './Plane';

export function PlaneGroup({ planes, groupPosition = [0, 0, 0] }) {
  return (
    <group position={groupPosition}>
      {planes.map((planeData) => (
        <Plane
          key={planeData.number}
          position={planeData.position}
          planeNumber={planeData.number}
        />
      ))}
    </group>
  );
}

// 고정된 PlaneGroup 생성 헬퍼
export function createStaticPlaneGroup(startPosition, planeNumbers) {
  const planes = [
    { number: planeNumbers[0], position: [startPosition[0], -5.5, 12] },
    { number: planeNumbers[1], position: [startPosition[0], -5.5, 13] },
    { number: planeNumbers[2], position: [startPosition[0] - 1, -5.5, 12] },
    { number: planeNumbers[3], position: [startPosition[0] - 1, -5.5, 13] }
  ];

  return <PlaneGroup planes={planes} />;
}

// 회전 가능한 PlaneGroup 생성 헬퍼
export function createRotatingPlaneGroup(pivotPoint, frontPlanes, backPlanes) {
  const planes = [
    // 앞면 플레인
    { number: frontPlanes[0], position: [2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]] },
    { number: frontPlanes[1], position: [2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]] },
    { number: frontPlanes[2], position: [1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]] },
    { number: frontPlanes[3], position: [1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]] },
    
    // 뒷면 플레인
    { number: backPlanes[0], position: [2.8 - pivotPoint[0], -5.7 - pivotPoint[1], 12 - pivotPoint[2]] },
    { number: backPlanes[1], position: [2.8 - pivotPoint[0], -5.7 - pivotPoint[1], 13 - pivotPoint[2]] },
    { number: backPlanes[2], position: [1.8 - pivotPoint[0], -5.7 - pivotPoint[1], 13 - pivotPoint[2]] },
    { number: backPlanes[3], position: [1.8 - pivotPoint[0], -5.7 - pivotPoint[1], 12 - pivotPoint[2]] }
  ];

  return <PlaneGroup planes={planes} />;
}

export default PlaneGroup; 