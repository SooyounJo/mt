import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Text, Text3D } from '@react-three/drei';
import { useThree, useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, LinearFilter, Shape, ExtrudeGeometry, FrontSide } from 'three';
import { AnimatedMiniPlane } from './albumcontrol';
import { usePlaneStore } from './planeState';
import { PlayButton } from '../ui/PlayButton';
import { SelectableMiniPlane } from '../planes/SelectableMiniPlane';

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

// 스프링 애니메이션 설정
const springConfig = {
  tension: 120,  // 스프링의 강도
  friction: 14,  // 감쇠 계수
  precision: 0.001  // 애니메이션 종료 임계값
};

// 스프링 애니메이션 함수
const spring = (current, target, velocity, config) => {
  const dx = target - current;
  const spring = dx * config.tension;
  const damper = velocity * config.friction;
  const acceleration = (spring - damper) / 1000;
  const newVelocity = velocity + acceleration;
  const newPosition = current + newVelocity;

  if (Math.abs(dx) < config.precision && Math.abs(newVelocity) < config.precision) {
    return [target, 0];
  }
  return [newPosition, newVelocity];
};

// 카메라 스프링 전환 함수
const springTransition = (camera, fromPos, fromTarget, toPos, toTarget, onComplete) => {
  const velocities = {
    pos: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 }
  };
  const currentPos = { x: fromPos[0], y: fromPos[1], z: fromPos[2] };
  const currentTarget = { x: fromTarget[0], y: fromTarget[1], z: fromTarget[2] };

  const animate = () => {
    // 위치 업데이트
    [currentPos.x, velocities.pos.x] = spring(currentPos.x, toPos[0], velocities.pos.x, springConfig);
    [currentPos.y, velocities.pos.y] = spring(currentPos.y, toPos[1], velocities.pos.y, springConfig);
    [currentPos.z, velocities.pos.z] = spring(currentPos.z, toPos[2], velocities.pos.z, springConfig);

    // 시점 업데이트
    [currentTarget.x, velocities.target.x] = spring(currentTarget.x, toTarget[0], velocities.target.x, springConfig);
    [currentTarget.y, velocities.target.y] = spring(currentTarget.y, toTarget[1], velocities.target.y, springConfig);
    [currentTarget.z, velocities.target.z] = spring(currentTarget.z, toTarget[2], velocities.target.z, springConfig);
  
    // 카메라 업데이트
    camera.position.set(currentPos.x, currentPos.y, currentPos.z);
    camera.lookAt(currentTarget.x, currentTarget.y, currentTarget.z);

    // 애니메이션 계속 여부 확인
    if (
      Math.abs(currentPos.x - toPos[0]) > springConfig.precision ||
      Math.abs(currentPos.y - toPos[1]) > springConfig.precision ||
      Math.abs(currentPos.z - toPos[2]) > springConfig.precision ||
      Math.abs(currentTarget.x - toTarget[0]) > springConfig.precision ||
      Math.abs(currentTarget.y - toTarget[1]) > springConfig.precision ||
      Math.abs(currentTarget.z - toTarget[2]) > springConfig.precision
    ) {
      requestAnimationFrame(animate);
    } else {
      onComplete && onComplete();
    }
  };

  animate();
};

// 최적화된 RotatingAlbumSet
export function RotatingAlbumSet({ groupRef, pivotPoint, frontPlanes, backPlanes, mainPlaneColor = "#ffffff", isSecondSet = false }) {
  const { animationStep } = usePlaneStore();
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isSecondSet && animationStep >= 1) {
      const fadeIn = setInterval(() => {
        setOpacity(prev => prev >= 1 ? (clearInterval(fadeIn), 1) : prev + 0.05);
      }, 50);
      return () => clearInterval(fadeIn);
    }
  }, [isSecondSet, animationStep]);

  const handlePlayClick = () => {
    if (typeof window !== 'undefined' && window.cameraControl) {
      const camera = window.cameraControl.camera;
      if (!camera) return;

      // 3번 뷰에서 5번 뷰로 스프링 전환
      springTransition(
        camera,
        [-2, 9, 18.5],  // 3번 뷰 위치
        [-3.5, -5, 10], // 3번 뷰 시점
        [-4, 12, 16],   // 5번 뷰 위치
        [-5.5, -4, 8.2],// 5번 뷰 시점
        () => {
          window.cameraControl.setFixedCamera(5);
          window.cameraControl.setIsOrbitEnabled(false);
        }
      );
    }
  };

  if (isSecondSet && animationStep < 1) return null;

  const mainPlaneProps = {
    position: [1.6 - pivotPoint[0], -5.54 - pivotPoint[1], 11.6 - pivotPoint[2]],
    rotation: [Math.PI/2, 0, 0]
  };

  return (
    <group ref={groupRef} position={pivotPoint}>
      {frontPlanes.map((planeNumber, index) => (
        <SelectableMiniPlane
          key={planeNumber}
          position={[
            (index < 2 ? 2.3 : 1.3) - pivotPoint[0],
            -5.5 - pivotPoint[1],
            (index % 2 === 0 ? 11.6 : 12.8) - pivotPoint[2]
          ]}
          planeNumber={planeNumber}
        />
      ))}

      <mesh {...mainPlaneProps}>
        <boxGeometry args={[2.8, 3.6, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {isSecondSet && (
        <>
          <mesh position={[1.6 - pivotPoint[0], -5.54 - pivotPoint[1], 11.5 - pivotPoint[2]]} rotation={[-Math.PI/2, 0, 0]}>
            <boxGeometry args={[2.8, 3.6, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={opacity} side={FrontSide} />
          </mesh>

          <mesh position={[1.6 - pivotPoint[0], -5.59 - pivotPoint[1], 11.5 - pivotPoint[2]]} rotation={[-Math.PI/2, 0, 0]}>
            <boxGeometry args={[2.8, 3.6, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={opacity} />
          </mesh>

          {animationStep >= 2 && (
            <>
            <PlayButton
                position={[1 - pivotPoint[0], -6.2 - pivotPoint[1], 11.5 - pivotPoint[2]]}
                onClick={handlePlayClick}
              scale={1.2}
              rotation={[0.5, 0, 5.2]}
            />
              <Text3D
                font="/font/digi.json"
                position={[0.5 - pivotPoint[0], -8.2 - pivotPoint[1], 11.5 - pivotPoint[2]]}
                rotation={[-Math.PI/2 - 0.5, Math.PI, 0]}
                size={0.6}
                height={0.2}
                curveSegments={12}
                bevelEnabled
                bevelThickness={0.04}
                bevelSize={0.04}
                bevelOffset={0}
                bevelSegments={5}
              >
                PLAY
                <meshStandardMaterial 
                  color="#ff0000"
                  metalness={0.5}
                  roughness={0.5}
                  emissive="#ff0000"
                  emissiveIntensity={0.2}
                />
              </Text3D>
              <Text3D
                font="/font/digi.json"
                position={[0.4 - pivotPoint[0], -8.2 - pivotPoint[1], 12.5 - pivotPoint[2]]}
                rotation={[-Math.PI/2 - 0.5, Math.PI, 0]}
                size={0.25}
                height={0.1}
                curveSegments={12}
                bevelEnabled
                bevelThickness={0.02}
                bevelSize={0.02}
                bevelOffset={0}
                bevelSegments={5}
              >
                {`Back\nYour\nTravel\nMemories`}
                <meshStandardMaterial 
                  color="#ff0000"
                  metalness={0.5}
                  roughness={0.5}
                  emissive="#ff0000"
                  emissiveIntensity={0.2}
                />
              </Text3D>
            </>
          )}
        </>
      )}

      {!isSecondSet && backPlanes?.map((planeNumber, index) => (
        <SelectableMiniPlane
          key={planeNumber}
          position={[
            (index < 2 ? 2.3 : 1.3) - pivotPoint[0],
            -5.7 - pivotPoint[1],
            (index % 2 === 0 ? 11.6 : 12.8) - pivotPoint[2]
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
            11.8 + (index % 2 === 1 ? 1.1 : 0)
          ]}
          planeNumber={planeNumber}
        />
      ))}
    </>
  );
}

// 앨범 세트 설정
export const ALBUM_SETS = {
  staticSet1: { startPosition: [-0.7, -5.5], planeNumbers: [1, 2, 3, 4] },
  rotatingSet1: { pivotPoint: [0.3, -5.44, 11.8], frontPlanes: [5, 6, 7, 8], backPlanes: [9, 10, 11, 12] },
  rotatingSet2: { pivotPoint: [0.3, -5.34, 11.8], frontPlanes: [13, 14, 15, 16], isSecondSet: true }
}; 