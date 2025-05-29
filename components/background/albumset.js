import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree, useLoader } from '@react-three/fiber';
import { TextureLoader, LinearFilter, Shape, ExtrudeGeometry, FrontSide } from 'three';
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

// 전역 상수 및 유틸리티
const textureLoader = new TextureLoader();
const textureCache = new Map();
const triangleShape = new Shape().moveTo(0, 0).lineTo(0, 1).lineTo(0.866, 0.5).lineTo(0, 0);
const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 };

// 텍스처 로드 최적화 함수
const loadTexture = (planeNumber) => {
  if (!textureCache.has(planeNumber)) {
    const texture = textureLoader.load(`/2d/mini/${planeNumber}.png`);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    textureCache.set(planeNumber, texture);
  }
  return textureCache.get(planeNumber);
};

// 최적화된 PlayButton
export function PlayButton({ position, onClick, scale = 1, rotation = [0, 0, 0] }) {
  const [hovered, setHovered] = useState(false);
  const meshProps = useMemo(() => ({
    position,
    rotation,
    scale,
    onClick,
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false)
  }), [position, rotation, scale, onClick]);

  return (
    <mesh {...meshProps}>
      <extrudeGeometry args={[triangleShape, extrudeSettings]} />
      <meshStandardMaterial color={hovered ? "#ff6b6b" : "#ff0000"} metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

// 최적화된 SelectableMiniPlane
export function SelectableMiniPlane({ position, planeNumber }) {
  const { isPlaneSelectable, selectPlane, isPlaneSelected } = usePlaneStore();
  const selected = isPlaneSelected(planeNumber);
  const selectable = isPlaneSelectable(planeNumber);
  const texture = useMemo(() => planeNumber >= 1 && planeNumber <= 16 ? loadTexture(planeNumber) : null, [planeNumber]);

  const meshProps = useMemo(() => ({
    position,
    rotation: [-Math.PI/2, 0, 0],
    onClick: () => selectable && selectPlane(planeNumber)
  }), [position, selectable, selectPlane, planeNumber]);

  return (
    <mesh {...meshProps}>
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial 
        color={selected ? "#ffeb3b" : selectable ? "#fff" : "#808080"}
        map={texture}
        transparent
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

// 최적화된 RotatingAlbumSet
export function RotatingAlbumSet({ groupRef, pivotPoint, frontPlanes, backPlanes, mainPlaneColor = "#a0a0a0", isSecondSet = false }) {
  const { animationStep } = usePlaneStore();
  const [opacity, setOpacity] = useState(0);
  const texture = useMemo(() => isSecondSet ? loadTexture(17) : null, [isSecondSet]);

  useEffect(() => {
    if (isSecondSet && animationStep >= 1) {
      const fadeIn = setInterval(() => {
        setOpacity(prev => prev >= 1 ? (clearInterval(fadeIn), 1) : prev + 0.05);
      }, 50);
      return () => clearInterval(fadeIn);
    }
  }, [isSecondSet, animationStep]);

  if (isSecondSet && animationStep < 1) return null;

  const mainPlaneProps = {
    position: [2.1 - pivotPoint[0], -5.54 - pivotPoint[1], 11.8 - pivotPoint[2]],
    rotation: [Math.PI/2, 0, 0]
  };

  return (
    <group ref={groupRef} position={pivotPoint}>
      {frontPlanes.map((planeNumber, index) => (
        <SelectableMiniPlane
          key={planeNumber}
          position={[
            (index < 2 ? 2.8 : 1.8) - pivotPoint[0],
            -5.5 - pivotPoint[1],
            (index % 2 === 0 ? 12 : 13) - pivotPoint[2]
          ]}
          planeNumber={planeNumber}
        />
      ))}

      <mesh {...mainPlaneProps}>
        <boxGeometry args={[2.6, 3.4, 0.1]} />
        <meshStandardMaterial color={mainPlaneColor} />
      </mesh>

      {isSecondSet && (
        <>
          <mesh position={[2.1 - pivotPoint[0], -5.54 - pivotPoint[1], 11.7 - pivotPoint[2]]} rotation={[-Math.PI/2, 0, 0]}>
            <boxGeometry args={[2.6, 3.4, 0.001]} />
            <meshStandardMaterial color={mainPlaneColor} transparent opacity={opacity} side={FrontSide} />
          </mesh>

          <mesh position={[2.1 - pivotPoint[0], -5.59 - pivotPoint[1], 11.7 - pivotPoint[2]]} rotation={[-Math.PI/2, 0, 0]}>
            <boxGeometry args={[2.6, 3.4, 0.001]} />
            <meshStandardMaterial map={texture} transparent opacity={opacity} />
          </mesh>

          {animationStep >= 2 && (
            <PlayButton
              position={[2.1 - pivotPoint[0], -5.54 - pivotPoint[1], 8.7 - pivotPoint[2]]}
              onClick={() => console.log("플레이 버튼 클릭")}
              scale={1.2}
              rotation={[0.5, 0, 5.2]}
            />
          )}
        </>
      )}

      {!isSecondSet && backPlanes?.map((planeNumber, index) => (
        <SelectableMiniPlane
          key={planeNumber}
          position={[
            (index < 2 ? 2.8 : 1.8) - pivotPoint[0],
            -5.7 - pivotPoint[1],
            (index % 2 === 0 ? 12 : 13) - pivotPoint[2]
          ]}
          planeNumber={planeNumber}
        />
      ))}
    </group>
  );
}

// 최적화된 StaticAlbumSet
export function StaticAlbumSet({ startPosition = [0, 0], planeNumbers = [] }) {
  if (!Array.isArray(planeNumbers) || planeNumbers.length === 0) return null;

  return (
    <>
      {planeNumbers.map((planeNumber, index) => (
        <SelectableMiniPlane
          key={planeNumber}
          position={[
            startPosition[0] - (index >= 2 ? 1 : 0),
            -5.5,
            12 + (index % 2 === 1 ? 1 : 0)
          ]}
          planeNumber={planeNumber}
        />
      ))}
    </>
  );
}

// 앨범 세트 설정
export const ALBUM_SETS = {
  staticSet1: { startPosition: [-0.2, -5.5], planeNumbers: [1, 2, 3, 4] },
  rotatingSet1: { pivotPoint: [0.8, -5.44, 11.8], frontPlanes: [5, 6, 7, 8], backPlanes: [9, 10, 11, 12] },
  rotatingSet2: { pivotPoint: [0.8, -5.34, 11.8], frontPlanes: [13, 14, 15, 16], isSecondSet: true }
}; 