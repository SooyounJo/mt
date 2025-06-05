import React from 'react';
import { Plane } from './Plane';

/**
 * @description
 * PlaneGroup은 Plane 컴포넌트를 묶어 3D 그룹으로 렌더링합니다.
 * 
 * @props
 * - planes: [{ number: number, position: [x, y, z] }]
 * - groupPosition: 그룹의 전체 위치
 */
export function PlaneGroup({ planes, groupPosition = [0, 0, -1] }) {
  return (
    <group position={groupPosition}>
      {planes.map((plane) => (
        <Plane 
          key={plane.number} 
          position={plane.position} 
          planeNumber={plane.number} 
        />
      ))}
    </group>
  );
}

/**
 * @description
 * 정적 위치의 플레인 그룹을 생성합니다.
 * 2x2 그리드 형태로 4개의 플레인을 배치합니다.
 */
export function createStaticPlaneGroup(start, numbers) {
  const planes = [
    { number: numbers[0], position: [start[0], -5.5, 10] },
    { number: numbers[1], position: [start[0], -5.5, 11] },
    { number: numbers[2], position: [start[0] - 1, -5.5, 10] },
    { number: numbers[3], position: [start[0] - 1, -5.5, 11] }
  ];
  return <PlaneGroup planes={planes} />;
}

/**
 * @description
 * 회전 가능한 플레인 그룹을 생성합니다.
 * 피봇 포인트를 중심으로 앞면과 뒷면에 플레인을 배치합니다.
 */
export function createRotatingPlaneGroup(pivot, front, back) {
  const offset = (x, y, z) => [x - pivot[0], y - pivot[1], z - pivot[2]];
  
  const planes = [
    // 앞면 플레인
    ...front.map((n, i) => ({
      number: n,
      position: offset(
        i < 2 ? 2.8 : 1.8,  // X 좌표
        -5.5,               // Y 좌표
        12 + (i % 2)       // Z 좌표 (12 또는 13)
      )
    })),
    
    // 뒷면 플레인
    ...back.map((n, i) => ({
      number: n,
      position: offset(
        i < 2 ? 2.8 : 1.8,  // X 좌표
        -5.7,               // Y 좌표
        12 + (i % 2)       // Z 좌표 (12 또는 13)
      )
    }))
  ];
  
  return <PlaneGroup planes={planes} />;
}

export default PlaneGroup; 