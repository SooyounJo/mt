import React from 'react';
import { AnimatedMiniPlane } from './albumcontrol';

// 플레인 세트 정의
export const PLANE_SETS = {
  SET1_FIRST: {
    name: '첫 번째 세트 - 첫 번째 그룹',
    range: { start: 1, end: 4 },
    targetPosition: [-5.5, -3.6, 8.2]
  },
  SET1_SECOND: {
    name: '첫 번째 세트 - 두 번째 그룹',
    range: { start: 5, end: 8 },
    targetPosition: [-6, -3.6, 8.2]
  },
  SET2: {
    name: '두 번째 세트',
    range: { start: 9, end: 16 },
    targetPosition: [-5.5, -3.6, 9]
  },
  SET3: {
    name: '세 번째 세트',
    range: { start: 17, end: 20 },
    targetPosition: [-6, -3.6, 9]
  }
};

// 진행 단계 정의
const PROGRESS_STAGES = {
  INITIAL: 0,        // 초기 상태 (1-4 선택 가능)
  FIRST_GROUP: 1,    // 1-4 선택 후 (5-8 선택 가능)
  SECOND_GROUP: 2,   // 5-8 선택 후 (9-16 선택 가능)
  THIRD_GROUP: 3,    // 9-16 선택 후 (17-20 선택 가능)
  COMPLETED: 4       // 완료 상태
};

// 이벤트 리스너 관리
const listeners = new Set();

// 선택된 플레인 관리를 위한 전역 상태
const selectedPlanesState = {
  selections: new Set(), // 선택된 플레인 번호들
  currentStage: PROGRESS_STAGES.INITIAL,
  movedPlanes: new Set(), // 이동 완료된 플레인들
  disabledPlanes: new Set() // 비활성화된 플레인들
};

// 상태 변경 알림
const notifyStateChange = () => {
  listeners.forEach(listener => listener(selectedPlanesState));
};

// 상태 구독
export const subscribeToState = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// 플레인이 속한 세트 찾기
const getPlaneSet = (planeNumber) => {
  return Object.entries(PLANE_SETS).find(([_, set]) => 
    planeNumber >= set.range.start && planeNumber <= set.range.end
  )?.[0] || null;
};

// 플레인의 목표 위치 가져오기
const getTargetPosition = (planeNumber) => {
  const setKey = getPlaneSet(planeNumber);
  return setKey ? PLANE_SETS[setKey].targetPosition : null;
};

// 플레인이 현재 단계에서 선택 가능한지 확인
const isPlaneSelectable = (planeNumber) => {
  // 이미 이동 완료된 플레인은 항상 활성화 상태 유지
  if (selectedPlanesState.movedPlanes.has(planeNumber)) {
    return true;
  }

  // 비활성화된 플레인은 선택 불가
  if (selectedPlanesState.disabledPlanes.has(planeNumber)) {
    return false;
  }

  switch (selectedPlanesState.currentStage) {
    case PROGRESS_STAGES.INITIAL:
      return planeNumber >= 1 && planeNumber <= 4;
    case PROGRESS_STAGES.FIRST_GROUP:
      return planeNumber >= 5 && planeNumber <= 8;
    case PROGRESS_STAGES.SECOND_GROUP:
      return planeNumber >= 9 && planeNumber <= 16;
    case PROGRESS_STAGES.THIRD_GROUP:
      return planeNumber >= 17 && planeNumber <= 20;
    default:
      return false;
  }
};

// 다음 단계로 진행 가능한지 확인
const canProgress = () => {
  const selections = selectedPlanesState.selections;
  
  switch (selectedPlanesState.currentStage) {
    case PROGRESS_STAGES.INITIAL:
      return Array.from(selections).some(num => num >= 1 && num <= 4);
    case PROGRESS_STAGES.FIRST_GROUP:
      return Array.from(selections).some(num => num >= 5 && num <= 8);
    case PROGRESS_STAGES.SECOND_GROUP:
      return Array.from(selections).some(num => num >= 9 && num <= 16);
    case PROGRESS_STAGES.THIRD_GROUP:
      return Array.from(selections).some(num => num >= 17 && num <= 20);
    default:
      return false;
  }
};

// 다음 단계로 진행
const progressToNextStage = () => {
  const currentStage = selectedPlanesState.currentStage;
  
  // 현재 선택된 플레인을 이동 완료 상태로 표시
  selectedPlanesState.selections.forEach(num => {
    selectedPlanesState.movedPlanes.add(num);
  });

  // 이전 단계의 플레인들을 비활성화
  switch (currentStage) {
    case PROGRESS_STAGES.INITIAL:
      for (let i = 1; i <= 4; i++) {
        if (!selectedPlanesState.movedPlanes.has(i)) {
          selectedPlanesState.disabledPlanes.add(i);
        }
      }
      selectedPlanesState.currentStage = PROGRESS_STAGES.FIRST_GROUP;
      break;
    case PROGRESS_STAGES.FIRST_GROUP:
      for (let i = 5; i <= 8; i++) {
        if (!selectedPlanesState.movedPlanes.has(i)) {
          selectedPlanesState.disabledPlanes.add(i);
        }
      }
      selectedPlanesState.currentStage = PROGRESS_STAGES.SECOND_GROUP;
      break;
    case PROGRESS_STAGES.SECOND_GROUP:
      for (let i = 9; i <= 16; i++) {
        if (!selectedPlanesState.movedPlanes.has(i)) {
          selectedPlanesState.disabledPlanes.add(i);
        }
      }
      selectedPlanesState.currentStage = PROGRESS_STAGES.THIRD_GROUP;
      break;
    case PROGRESS_STAGES.THIRD_GROUP:
      for (let i = 17; i <= 20; i++) {
        if (!selectedPlanesState.movedPlanes.has(i)) {
          selectedPlanesState.disabledPlanes.add(i);
        }
      }
      selectedPlanesState.currentStage = PROGRESS_STAGES.COMPLETED;
      break;
  }
  
  notifyStateChange();
};

// 플레인 선택 핸들러
const handlePlaneSelection = (planeNumber) => {
  if (!isPlaneSelectable(planeNumber)) return false;

  // 이미 선택된 플레인이면 선택 해제 (이동 완료된 플레인은 해제 불가)
  if (selectedPlanesState.selections.has(planeNumber)) {
    if (!selectedPlanesState.movedPlanes.has(planeNumber)) {
      selectedPlanesState.selections.delete(planeNumber);
      notifyStateChange();
    }
    return true;
  }

  // 새로운 선택
  selectedPlanesState.selections.add(planeNumber);
  notifyStateChange();
  return true;
};

// 수정된 SelectableMiniPlane 컴포넌트
export function SelectableMiniPlane({ position, planeNumber, ...props }) {
  const [isSelected, setIsSelected] = React.useState(false);
  const [isSelectable, setIsSelectable] = React.useState(true);
  const [currentPosition, setCurrentPosition] = React.useState(position);
  const animationRef = React.useRef(null);
  const originalPosition = React.useRef(position);

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
      
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newPos = startPos.map((start, i) => 
        start + (targetPos[i] - start) * easeProgress
      );

      setCurrentPosition(newPos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animate();
  };

  // 상태 변경 구독
  React.useEffect(() => {
    const updateState = () => {
      const newIsSelected = selectedPlanesState.selections.has(planeNumber);
      setIsSelected(newIsSelected);
      setIsSelectable(isPlaneSelectable(planeNumber));
      
      if (newIsSelected || selectedPlanesState.movedPlanes.has(planeNumber)) {
        const targetPos = getTargetPosition(planeNumber);
        if (targetPos) {
          animateToPosition(targetPos);
        }
      } else {
        animateToPosition(originalPosition.current);
      }
    };

    const unsubscribe = subscribeToState(updateState);
    updateState();
    return () => {
      unsubscribe();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [planeNumber]);

  // 클릭 핸들러
  const handleClick = () => {
    if (!isSelectable) return;
    
    const wasSelected = selectedPlanesState.selections.has(planeNumber);
    
    if (handlePlaneSelection(planeNumber)) {
      if (wasSelected && canProgress()) {
        if (window.AlbumPageControl) {
          window.AlbumPageControl.turnPage();
          progressToNextStage();
        }
      }
    }
  };

  return (
    <AnimatedMiniPlane
      position={currentPosition}
      planeNumber={planeNumber}
      color={isSelected || selectedPlanesState.movedPlanes.has(planeNumber) ? "#ffeb3b" : isSelectable ? "#fff" : "#808080"}
      onClick={handleClick}
      {...props}
    />
  );
}

// 고정된 앨범 세트 컴포넌트
export function StaticAlbumSet({ startPosition = [0, 0], planeNumbers = [] }) {
  // props 검증
  if (!startPosition || !Array.isArray(startPosition) || !planeNumbers || !Array.isArray(planeNumbers)) {
    console.warn('StaticAlbumSet: Invalid props provided', { startPosition, planeNumbers });
    return null;
  }

  return (
    <>
      {planeNumbers[0] && (
        <SelectableMiniPlane position={[startPosition[0], -5.5, 12]} planeNumber={planeNumbers[0]} />
      )}
      {planeNumbers[1] && (
        <SelectableMiniPlane position={[startPosition[0], -5.5, 13]} planeNumber={planeNumbers[1]} />
      )}
      {planeNumbers[2] && (
        <SelectableMiniPlane position={[startPosition[0] - 1, -5.5, 12]} planeNumber={planeNumbers[2]} />
      )}
      {planeNumbers[3] && (
        <SelectableMiniPlane position={[startPosition[0] - 1, -5.5, 13]} planeNumber={planeNumbers[3]} />
      )}
    </>
  );
}

// 회전 가능한 앨범 세트 컴포넌트
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
        position={[2.8 - pivotPoint[0], -5.7 - pivotPoint[1], 12 - pivotPoint[2]]} 
        planeNumber={backPlanes[0]} 
      />
      <SelectableMiniPlane 
        position={[2.8 - pivotPoint[0], -5.7 - pivotPoint[1], 13 - pivotPoint[2]]} 
        planeNumber={backPlanes[1]} 
      />
      <SelectableMiniPlane 
        position={[1.8 - pivotPoint[0], -5.7 - pivotPoint[1], 13 - pivotPoint[2]]} 
        planeNumber={backPlanes[2]} 
      />
      <SelectableMiniPlane 
        position={[1.8 - pivotPoint[0], -5.7 - pivotPoint[1], 12 - pivotPoint[2]]} 
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