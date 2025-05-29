import React from 'react';
import { AnimatedMiniPlane } from './albumcontrol';

// 플레인 그룹 정의
export const PLANE_GROUPS = {
  GROUP1: { start: 1, end: 4, name: '첫 번째 고정 그룹' },
  GROUP2: { start: 5, end: 8, name: '첫 번째 세트 앞면' },
  GROUP3: { start: 9, end: 16, name: '첫/두번째 세트 뒷면' },
  GROUP4: { start: 17, end: 20, name: '두 번째 세트 앞면' },
  GROUP5: { start: 21, end: 24, name: '두 번째 고정 그룹' }
};

// 선택된 플레인 관리를 위한 전역 상태
const selectedPlanesState = {
  selections: new Map(), // 그룹별 선택된 플레인 번호
  movingPlane: null, // 현재 이동 중인 플레인
  targetPosition: [2, 2, 2], // 목표 위치
  originalPositions: new Map(), // 플레인의 원래 위치 저장
};

// 플레인이 속한 그룹 찾기
const getPlaneGroup = (planeNumber) => {
  return Object.entries(PLANE_GROUPS).find(([_, range]) => 
    planeNumber >= range.start && planeNumber <= range.end
  )?.[0] || null;
};

// 플레인 선택 핸들러
const handlePlaneSelection = (planeNumber, position) => {
  const targetGroup = getPlaneGroup(planeNumber);
  if (!targetGroup) return false;

  // 이미 이동 중인 플레인이 있으면 선택 불가
  if (selectedPlanesState.movingPlane) return false;

  // 현재 그룹의 선택된 플레인
  const currentSelection = selectedPlanesState.selections.get(targetGroup);
  
  // 이미 선택된 플레인이면 선택 해제
  if (currentSelection === planeNumber) {
    selectedPlanesState.selections.delete(targetGroup);
    selectedPlanesState.originalPositions.delete(planeNumber);
    return true;
  }

  // 새로운 선택
  if (currentSelection) {
    // 같은 그룹의 이전 선택 해제
    selectedPlanesState.originalPositions.delete(currentSelection);
  }
  
  selectedPlanesState.selections.set(targetGroup, planeNumber);
  selectedPlanesState.originalPositions.set(planeNumber, position);
  return true;
};

// 선택된 플레인 이동 시작
const startPlaneMovement = (planeNumber) => {
  if (selectedPlanesState.movingPlane) return null;
  selectedPlanesState.movingPlane = planeNumber;
  return selectedPlanesState.targetPosition;
};

// 이동 완료 처리
const completePlaneMovement = (planeNumber) => {
  if (selectedPlanesState.movingPlane === planeNumber) {
    selectedPlanesState.movingPlane = null;
  }
};

// 플레인이 현재 선택되었는지 확인
const isPlaneSelected = (planeNumber) => {
  return Array.from(selectedPlanesState.selections.values()).includes(planeNumber);
};

// 플레인이 이동 중인지 확인
const isPlaneMoving = (planeNumber) => {
  return selectedPlanesState.movingPlane === planeNumber;
};

// 수정된 SelectableMiniPlane 컴포넌트
export function SelectableMiniPlane({ position, planeNumber, ...props }) {
  const [currentPosition, setCurrentPosition] = React.useState(position);
  const [isSelected, setIsSelected] = React.useState(false);
  const animationRef = React.useRef(null);

  // 부드러운 이동 애니메이션
  const animateToPosition = (targetPos) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startPos = [...currentPosition];
    const startTime = Date.now();
    const duration = 500; // 0.5초

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 이징 함수 적용 (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newPos = startPos.map((start, i) => 
        start + (targetPos[i] - start) * easeProgress
      );

      setCurrentPosition(newPos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        if (progress >= 1 && targetPos === selectedPlanesState.targetPosition) {
          completePlaneMovement(planeNumber);
        }
      }
    };

    animate();
  };

  // 클릭 핸들러
  const handleClick = () => {
    const wasSelected = isPlaneSelected(planeNumber);
    
    if (handlePlaneSelection(planeNumber, position)) {
      const isNowSelected = isPlaneSelected(planeNumber);
      setIsSelected(isNowSelected);
      
      if (wasSelected) {
        // 이미 선택된 상태에서 다시 클릭하면 이동
        animateToPosition(selectedPlanesState.targetPosition);
        startPlaneMovement(planeNumber);
      } else if (!isNowSelected) {
        // 선택 해제되면 원래 위치로 복귀
        animateToPosition(position);
      }
    }
  };

  // 선택 상태 감시
  React.useEffect(() => {
    const checkSelection = () => {
      const newIsSelected = isPlaneSelected(planeNumber);
      if (isSelected !== newIsSelected) {
        setIsSelected(newIsSelected);
      }
    };

    // 50ms마다 선택 상태 확인
    const interval = setInterval(checkSelection, 50);
    return () => clearInterval(interval);
  }, [planeNumber, isSelected]);

  // 컴포넌트 언마운트 시 애니메이션 정리
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <AnimatedMiniPlane
      position={currentPosition}
      planeNumber={planeNumber}
      color={isSelected ? "#ffeb3b" : "#fff"}
      onClick={handleClick}
      {...props}
    />
  );
}

// 고정된 앨범 세트 컴포넌트 (SelectableMiniPlane 사용)
export function StaticAlbumSet({ startPosition, planeNumbers }) {
  return (
    <>
      <SelectableMiniPlane position={[startPosition[0], -5.5, 12]} planeNumber={planeNumbers[0]} />
      <SelectableMiniPlane position={[startPosition[0], -5.5, 13]} planeNumber={planeNumbers[1]} />
      <SelectableMiniPlane position={[startPosition[0] - 1, -5.5, 12]} planeNumber={planeNumbers[2]} />
      <SelectableMiniPlane position={[startPosition[0] - 1, -5.5, 13]} planeNumber={planeNumbers[3]} />
    </>
  );
}

// 회전 가능한 앨범 세트 컴포넌트 (SelectableMiniPlane 사용)
export function RotatingAlbumSet({ groupRef, pivotPoint, frontPlanes, backPlanes, mainPlaneColor = "#a0a0a0" }) {
  return (
    <group ref={groupRef} position={pivotPoint}>
      {/* 앞면 플레인들 */}
      <SelectableMiniPlane 
        position={[2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]]} 
        planeNumber={frontPlanes[0]} 
      />
      <SelectableMiniPlane 
        position={[2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]]} 
        planeNumber={frontPlanes[1]} 
      />
      <SelectableMiniPlane 
        position={[1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]]} 
        planeNumber={frontPlanes[2]} 
      />
      <SelectableMiniPlane 
        position={[1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]]} 
        planeNumber={frontPlanes[3]} 
      />
      
      {/* 뒷면 플레인들 */}
      <SelectableMiniPlane 
        position={[2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]]} 
        planeNumber={backPlanes[0]} 
      />
      <SelectableMiniPlane 
        position={[2.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]]} 
        planeNumber={backPlanes[1]} 
      />
      <SelectableMiniPlane 
        position={[1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 13 - pivotPoint[2]]} 
        planeNumber={backPlanes[2]} 
      />
      <SelectableMiniPlane 
        position={[1.8 - pivotPoint[0], -5.5 - pivotPoint[1], 12 - pivotPoint[2]]} 
        planeNumber={backPlanes[3]} 
      />
      
      {/* 메인 직사각형 플레인 */}
      <mesh 
        position={[2.1 - pivotPoint[0], -5.54 - pivotPoint[1], 11.8 - pivotPoint[2]]} 
        rotation={[Math.PI/2, 0, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[2.6, 3.4, 0.1]} />
        <meshStandardMaterial color={mainPlaneColor} />
      </mesh>
    </group>
  );
}

// 앨범 세트 설정
export const ALBUM_SETS = {
  // 고정 세트 1 (플레인 1-4)
  staticSet1: {
    startPosition: [-0.2, -5.5],
    planeNumbers: [1, 2, 3, 4]
  },
  
  // 고정 세트 2 (플레인 21-24)
  staticSet2: {
    startPosition: [2.8, -5.5],
    planeNumbers: [21, 22, 23, 24]
  },
  
  // 회전 세트 1 (플레인 5-12)
  rotatingSet1: {
    pivotPoint: [0.8, -5.44, 11.8],
    frontPlanes: [5, 6, 7, 8],
    backPlanes: [9, 10, 11, 12]
  },
  
  // 회전 세트 2 (플레인 13-20)
  rotatingSet2: {
    pivotPoint: [0.8, -5.34, 11.8],
    frontPlanes: [13, 14, 15, 16],
    backPlanes: [17, 18, 19, 20]
  }
}; 