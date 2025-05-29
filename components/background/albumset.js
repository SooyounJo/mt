import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree, useLoader } from '@react-three/fiber';
import { TextureLoader, LinearFilter, Shape, ExtrudeGeometry } from 'three';
import { AnimatedMiniPlane } from './albumcontrol';
import { usePlaneStore } from './planeState';

// 플레인 세트 정의
export const PLANE_SETS = {
  SET1_FIRST: {
    name: '첫 번째 세트 - 첫 번째 그룹',
    range: { start: 1, end: 4 }
  },
  SET1_SECOND: {
    name: '첫 번째 세트 - 두 번째 그룹',
    range: { start: 5, end: 8 }
  },
  SET2: {
    name: '두 번째 세트',
    range: { start: 9, end: 16 }
  }
};

// 진행 단계 정의
const PROGRESS_STAGES = {
  INITIAL: 0,        // 초기 상태 (1-4 선택 가능)
  SECOND_SELECT: 1,  // 1-4 선택 후 (5-8 선택 가능)
  THIRD_SELECT: 2,   // 1-8 선택 완료 후 (9-16 선택 가능)
  FINAL_SELECT: 3,   // 9-16 선택 완료 후 (17-20 선택 가능)
  COMPLETED: 4       // 완료 상태
};

// 선택된 플레인 관리를 위한 전역 상태
const selectedPlanesState = {
  currentStage: PROGRESS_STAGES.INITIAL,
  selections: {
    first: null,    // 1-4 중 선택된 번호
    second: null,   // 5-8 중 선택된 번호
    third: null,    // 9-16 중 선택된 번호
    fourth: null    // 17-20 중 선택된 번호
  }
};

// 이벤트 리스너 관리
const listeners = new Set();

// 상태 변경 알림
const notifyStateChange = () => {
  listeners.forEach(listener => listener(selectedPlanesState));
};

// 상태 구독
export const subscribeToState = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// 플레인이 현재 단계에서 선택 가능한지 확인
const isPlaneSelectable = (planeNumber) => {
  // 이미 선택된 플레인은 선택 가능
  if (Object.values(selectedPlanesState.selections).includes(planeNumber)) {
    return true;
  }

  switch (selectedPlanesState.currentStage) {
    case PROGRESS_STAGES.INITIAL:
      return planeNumber >= 1 && planeNumber <= 4;
    case PROGRESS_STAGES.SECOND_SELECT:
      return planeNumber >= 5 && planeNumber <= 8;
    case PROGRESS_STAGES.THIRD_SELECT:
      return planeNumber >= 9 && planeNumber <= 16;
    case PROGRESS_STAGES.FINAL_SELECT:
      return planeNumber >= 17 && planeNumber <= 20;
    default:
      return false;
  }
};

// 플레인의 목표 위치 가져오기
const getTargetPosition = (planeNumber) => {
  for (const set of Object.values(PLANE_SETS)) {
    if (planeNumber >= set.range.start && planeNumber <= set.range.end) {
      return set.targetPosition;
    }
  }
  return null;
};

// 다음 단계로 진행 가능한지 확인
const canProgress = () => {
  switch (selectedPlanesState.currentStage) {
    case PROGRESS_STAGES.INITIAL:
      return selectedPlanesState.selections.first !== null;
    case PROGRESS_STAGES.SECOND_SELECT:
      return selectedPlanesState.selections.second !== null;
    case PROGRESS_STAGES.THIRD_SELECT:
      return selectedPlanesState.selections.third !== null;
    case PROGRESS_STAGES.FINAL_SELECT:
      return selectedPlanesState.selections.fourth !== null;
    default:
      return false;
  }
};

// 다음 단계로 진행
const progressToNextStage = () => {
  switch (selectedPlanesState.currentStage) {
    case PROGRESS_STAGES.INITIAL:
      selectedPlanesState.currentStage = PROGRESS_STAGES.SECOND_SELECT;
      break;
    case PROGRESS_STAGES.SECOND_SELECT:
      selectedPlanesState.currentStage = PROGRESS_STAGES.THIRD_SELECT;
      break;
    case PROGRESS_STAGES.THIRD_SELECT:
      selectedPlanesState.currentStage = PROGRESS_STAGES.FINAL_SELECT;
      break;
    case PROGRESS_STAGES.FINAL_SELECT:
      selectedPlanesState.currentStage = PROGRESS_STAGES.COMPLETED;
      break;
  }
  notifyStateChange();
};

// 플레인 선택 핸들러
const handlePlaneSelection = (planeNumber) => {
  if (!isPlaneSelectable(planeNumber)) return false;

  // 이미 선택된 플레인이면 선택 해제
  const isCurrentlySelected = Object.values(selectedPlanesState.selections).includes(planeNumber);
  
  if (isCurrentlySelected) {
    // 현재 단계에 해당하는 선택만 해제 가능
    if (
      (selectedPlanesState.currentStage === PROGRESS_STAGES.INITIAL && planeNumber <= 4) ||
      (selectedPlanesState.currentStage === PROGRESS_STAGES.SECOND_SELECT && planeNumber >= 5 && planeNumber <= 8) ||
      (selectedPlanesState.currentStage === PROGRESS_STAGES.THIRD_SELECT && planeNumber >= 9 && planeNumber <= 16) ||
      (selectedPlanesState.currentStage === PROGRESS_STAGES.FINAL_SELECT && planeNumber >= 17)
    ) {
      // 해당하는 선택 필드 찾기
      if (planeNumber <= 4) selectedPlanesState.selections.first = null;
      else if (planeNumber <= 8) selectedPlanesState.selections.second = null;
      else if (planeNumber <= 16) selectedPlanesState.selections.third = null;
      else selectedPlanesState.selections.fourth = null;
      
      notifyStateChange();
    }
    return true;
  }

  // 새로운 선택
  if (planeNumber <= 4) {
    selectedPlanesState.selections.first = planeNumber;
    // 첫 번째 선택이 완료되면 자동으로 다음 단계로
    if (selectedPlanesState.currentStage === PROGRESS_STAGES.INITIAL) {
      selectedPlanesState.currentStage = PROGRESS_STAGES.SECOND_SELECT;
    }
  } else if (planeNumber <= 8) {
    selectedPlanesState.selections.second = planeNumber;
  } else if (planeNumber <= 16) {
    selectedPlanesState.selections.third = planeNumber;
  } else {
    selectedPlanesState.selections.fourth = planeNumber;
  }

  notifyStateChange();
  return true;
};

// 텍스처 로더 인스턴스 생성
const textureLoader = new TextureLoader();

// 텍스처 캐시 객체
const textureCache = {};

// 텍스처 로드 함수
const loadTexture = (planeNumber) => {
  if (!textureCache[planeNumber]) {
    const texture = textureLoader.load(`/2d/mini/${planeNumber}.png`);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    textureCache[planeNumber] = texture;
  }
  return textureCache[planeNumber];
};

// SelectableMiniPlane 컴포넌트
export function SelectableMiniPlane({ position, planeNumber, ...props }) {
  const { isPlaneSelectable, selectPlane, isPlaneSelected } = usePlaneStore();
  const selected = isPlaneSelected(planeNumber);
  const selectable = isPlaneSelectable(planeNumber);

  // 텍스처 메모이제이션
  const texture = useMemo(() => {
    if (planeNumber >= 1 && planeNumber <= 16) {
      return loadTexture(planeNumber);
    }
    return null;
  }, [planeNumber]);

  return (
    <mesh
      position={position}
      rotation={[-Math.PI/2, 0, 0]}
      onClick={() => selectable && selectPlane(planeNumber)}
      {...props}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial 
        color={selected ? "#ffeb3b" : selectable ? "#fff" : "#808080"}
        map={texture}
        transparent={true}
        side={2}
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}

// 텍스트 캔버스 생성 함수
const createTextCanvas = (text, width = 1024, height = 1024) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', {
    antialias: true,
    alpha: true
  });

  // 배경색 설정
  context.fillStyle = '#a0a0a0';
  context.fillRect(0, 0, width, height);

  // 텍스트 스타일 설정
  context.fillStyle = '#000000';
  context.font = 'bold 64px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // 안티앨리어싱 설정
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  // 텍스트 줄바꿈 처리
  const lines = text.split('\n');
  const lineHeight = 80;
  const startY = (height - (lines.length * lineHeight)) / 2;

  lines.forEach((line, i) => {
    context.fillText(line.trim(), width/2, startY + (i * lineHeight));
  });

  return canvas;
};

// PlayButton 컴포넌트
export function PlayButton({ position, onClick }) {
  const [hovered, setHovered] = useState(false);
  const buttonRef = useRef();

  // 삼각형 모양 생성
  const triangleShape = new Shape();
  triangleShape.moveTo(0, 0);
  triangleShape.lineTo(0, 1);
  triangleShape.lineTo(0.866, 0.5);
  triangleShape.lineTo(0, 0);

  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3
  };

  return (
    <mesh
      ref={buttonRef}
      position={position}
      rotation={[0, Math.PI / 2, 0]}
      scale={0.5}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <extrudeGeometry args={[triangleShape, extrudeSettings]} />
      <meshStandardMaterial 
        color={hovered ? "#ff6b6b" : "#ff0000"}
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
}

// 회전 가능한 앨범 세트 컴포넌트
export function RotatingAlbumSet({ groupRef, pivotPoint, frontPlanes, backPlanes, mainPlaneColor = "#a0a0a0", showQuestion = false, isSecondSet = false }) {
  const { userAnswer, setUserAnswer } = usePlaneStore();
  const backPlaneRef = useRef();

  // 질문 텍스처 메모이제이션
  const questionTexture = useMemo(() => {
    if (!isSecondSet) return null;

    const defaultText = userAnswer ? userAnswer : "이 여행은 당신에게\n어떤 의미가 있는\n여행이었나요?\n\n(클릭하여 입력)";
    const canvas = createTextCanvas(defaultText);
    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.anisotropy = 16;
    return texture;
  }, [isSecondSet, userAnswer]);

  const handlePlaneClick = (event) => {
    if (!isSecondSet) return;
    event.stopPropagation();
    
    const answer = prompt("이 여행은 당신에게 어떤 의미가 있는 여행이었나요?", userAnswer);
    if (answer !== null) {
      setUserAnswer(answer);
    }
  };

  const handlePlayClick = (event) => {
    event.stopPropagation();
    console.log("플레이 버튼 클릭됨");
    // 여기에 재생 로직 추가
  };

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
      
      {/* 메인 직사각형 플레인 (앞면) */}
      <mesh 
        position={[2.1 - pivotPoint[0], -5.54 - pivotPoint[1], 11.8 - pivotPoint[2]]} 
        rotation={[Math.PI/2, 0, 0]} 
        receiveShadow 
        castShadow
      >
        <boxGeometry args={[2.6, 3.4, 0.1]} />
        <meshStandardMaterial 
          color={mainPlaneColor} 
          transparent={isSecondSet}
          opacity={isSecondSet ? 0.8 : 1}
        />
      </mesh>

      {/* 뒷면 직사각형 플레인 */}
      {isSecondSet && (
        <mesh 
          ref={backPlaneRef}
          position={[2.1 - pivotPoint[0], -5.54 - pivotPoint[1], 11.7 - pivotPoint[2]]} 
          rotation={[-Math.PI/2, 0, 0]} 
          receiveShadow 
          castShadow
          onClick={handlePlaneClick}
        >
          <boxGeometry args={[2.6, 3.4, 0.1]} />
          <meshStandardMaterial 
            color={mainPlaneColor} 
            map={questionTexture}
            side={2}
            transparent={true}
            opacity={0.95}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* 플레이 버튼 (두 번째 세트이고 답변이 있을 때만 표시) */}
      {isSecondSet && userAnswer && userAnswer.trim() !== "" && (
        <PlayButton 
          position={[6.1 - pivotPoint[0], -5.54 - pivotPoint[1], 11.8 - pivotPoint[2]]}
          onClick={handlePlayClick}
        />
      )}

      {/* 뒷면 플레인들 (두 번째 세트가 아닐 때만 표시) */}
      {!isSecondSet && backPlanes && (
        <>
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
        </>
      )}
    </group>
  );
}

// 고정된 앨범 세트 컴포넌트
export function StaticAlbumSet({ startPosition = [0, 0], planeNumbers = [] }) {
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
  
  // 회전 세트 2 (플레인 13-16 + 질문)
  rotatingSet2: {
    pivotPoint: [0.8, -5.34, 11.8],
    frontPlanes: [13, 14, 15, 16],
    isSecondSet: true
  }
}; 