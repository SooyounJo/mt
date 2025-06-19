import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';
import { usePlaneStore } from './planeState';
import * as THREE from 'three';

// LP 모델 기본 설정
const LP_CONFIG = {
  radius: 1.2,
  height: 0.05,
  segments: 32,
  color: '#1a1a1a',
  metalness: 0.8,
  roughness: 0.2
};

// LP 컴포넌트
export function LP({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const lpRef = useRef();

  useFrame(() => {
    if (lpRef.current) {
      lpRef.current.rotation.y += 0.01; // 회전 애니메이션
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* LP 본체 */}
      <Cylinder
        ref={lpRef}
        args={[LP_CONFIG.radius, LP_CONFIG.radius, LP_CONFIG.height, LP_CONFIG.segments]}
      >
        <meshStandardMaterial
          color={LP_CONFIG.color}
          metalness={LP_CONFIG.metalness}
          roughness={LP_CONFIG.roughness}
        />
      </Cylinder>
      
      {/* LP 중앙 라벨 */}
      <Cylinder
        args={[0.2, 0.2, LP_CONFIG.height + 0.001, LP_CONFIG.segments]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.5}
          roughness={0.5}
        />
      </Cylinder>
    </group>
  );
}

// 호버링 효과 설정
const HOVER_CONFIG = {
  scale: 1.15,           // 호버 시 크기 (15% 확대)
  duration: 0.15,        // 애니메이션 지속시간 (초)
  smoothness: 8          // 애니메이션 부드러움 정도
};

// 개별 미니플레인 컴포넌트 (호버링 효과 포함)
export function AnimatedMiniPlane({ position, planeNumber, color = "#fff", onClick, ...props }) {
  const meshRef = React.useRef();
  const [hovered, setHovered] = React.useState(false);
  const targetScale = React.useRef(1);
  const currentScale = React.useRef(1);

  // 매 프레임마다 스케일 보간
  useFrame((_, delta) => {
    if (meshRef.current) {
      targetScale.current = hovered ? HOVER_CONFIG.scale : 1;
      currentScale.current += (targetScale.current - currentScale.current) * HOVER_CONFIG.smoothness * delta;
      meshRef.current.scale.set(
        currentScale.current,
        currentScale.current,
        currentScale.current
      );
    }
  });

  const handlePointerEnter = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[Math.PI/2, 0, 0]}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      receiveShadow
      castShadow
      {...props}
    >
      <boxGeometry args={[0.8, 0.8, 0.1]} />
      <meshStandardMaterial 
        color={color}
        emissive={hovered ? "#666" : "#000"}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
}

// 호버링 설정을 외부에서 조정할 수 있는 제어 함수들
export const AlbumControlAPI = {
  // 호버링 스케일 조정
  setHoverScale: (scale) => {
    HOVER_CONFIG.scale = scale;
  },
  
  // 애니메이션 부드러움 조정
  setSmoothness: (smoothness) => {
    HOVER_CONFIG.smoothness = smoothness;
  },
  
  // 현재 설정 가져오기
  getConfig: () => ({ ...HOVER_CONFIG }),
  
  // 기본값으로 리셋
  resetConfig: () => {
    HOVER_CONFIG.scale = 1.15;
    HOVER_CONFIG.smoothness = 8;
  }
};

// 전역에서 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.AlbumControl = AlbumControlAPI;
}

// 페이지 넘김 애니메이션 훅
export function usePageTurnAnimation() {
  // 애니메이션 상태
  const [firstSetAnimating, setFirstSetAnimating] = React.useState(false);
  const [secondSetAnimating, setSecondSetAnimating] = React.useState(false);
  const [firstSetProgress, setFirstSetProgress] = React.useState(0);
  const [secondSetProgress, setSecondSetProgress] = React.useState(0);
  const [currentSet, setCurrentSet] = React.useState(1); // 1: 첫 번째 세트, 2: 두 번째 세트
  const [reverseAnimating, setReverseAnimating] = React.useState(false); // 역방향 애니메이션
  const animationDuration = 1.5; // 1.5초 애니메이션
  const { setAnimationStep, animationStep } = usePlaneStore(); // animationStep도 가져오기
  
  // 피봇 포인트들
  const firstPivotPoint = [0.8, -5.44, 11.8]; // 첫 번째 세트 피봇
  const secondPivotPoint = [0.8, -5.34, 11.8]; // 두 번째 세트 피봇
  
  // 애니메이션 시작 함수
  const startPageTurn = () => {
    if (currentSet === 1 && !firstSetAnimating) {
      setFirstSetAnimating(true);
      setFirstSetProgress(0);
    } else if (currentSet === 2 && !secondSetAnimating) {
      setSecondSetAnimating(true);
      setSecondSetProgress(0);
    }
  };
  
  // 이전 버튼 함수 (역방향 또는 리셋)
  const goToPrevious = () => {
    if (animationStep === 1 && !reverseAnimating) {
      // 1세트 역방향 애니메이션
      setReverseAnimating(true);
      setFirstSetProgress(1); // 1에서 시작해서 0으로
    } else if (animationStep === 2 && !reverseAnimating) {
      // 2세트 역방향 애니메이션  
      setReverseAnimating(true);
      setSecondSetProgress(1); // 1에서 시작해서 0으로
    }
  };
  
  // 전역 컨트롤 API
  React.useEffect(() => {
    window.AlbumPageControl = {
      turnPage: startPageTurn,
      goToPrevious: goToPrevious,
      animationStep,
      canGoNext: (currentSet === 1 && animationStep === 0) || (currentSet === 2 && animationStep === 1),
      canGoPrevious: animationStep > 0 && !reverseAnimating
    };
    return () => {
      delete window.AlbumPageControl;
    };
  }, [currentSet, firstSetAnimating, secondSetAnimating, firstSetProgress, animationStep, reverseAnimating]);

  // 애니메이션 업데이트 함수
  const updateAnimations = (delta, rightGroupRef, secondGroupRef) => {
    // 첫 번째 세트 애니메이션 (정방향)
    if (firstSetAnimating && rightGroupRef?.current && !reverseAnimating) {
      setFirstSetProgress((prev) => {
        const newProgress = Math.min(prev + delta / animationDuration, 1);
        
        // Z축 기준 180도 원 운동 회전 애니메이션 (Math.PI)
        const rotationZ = newProgress * Math.PI; // 180도 회전
        
        // 다른 축은 0으로 고정하고 Z축만 회전
        if (rightGroupRef?.current?.rotation) {
          rightGroupRef.current.rotation.x = 0;
          rightGroupRef.current.rotation.y = 0;
          rightGroupRef.current.rotation.z = rotationZ;
        }
        
        // 애니메이션 완료
        if (newProgress >= 1 && !reverseAnimating) {
          setFirstSetAnimating(false);
          // 상태 업데이트를 한 번만 실행
          setTimeout(() => setAnimationStep(1), 0);
          setCurrentSet(2); // 두 번째 세트로 전환
        }
        
        return newProgress;
      });
    }
    
    // 첫 번째 세트 역방향 애니메이션
    if (reverseAnimating && rightGroupRef?.current && animationStep === 1) {
      setFirstSetProgress((prev) => {
        const newProgress = Math.max(prev - delta / animationDuration, 0);
        
        // Z축 기준 역방향 회전
        const rotationZ = newProgress * Math.PI;
        
        if (rightGroupRef?.current?.rotation) {
          rightGroupRef.current.rotation.x = 0;
          rightGroupRef.current.rotation.y = 0;
          rightGroupRef.current.rotation.z = rotationZ;
        }
        
        // 역방향 애니메이션 완료
        if (newProgress <= 0) {
          setReverseAnimating(false);
          // 상태 업데이트를 한 번만 실행
          setTimeout(() => setAnimationStep(0), 0);
          setCurrentSet(1); // 첫 번째 세트로 전환
        }
        
        return newProgress;
      });
    }
    
    // 두 번째 세트 애니메이션 (정방향)
    if (secondSetAnimating && secondGroupRef?.current && !reverseAnimating) {
      setSecondSetProgress((prev) => {
        const newProgress = Math.min(prev + delta / animationDuration, 1);
        
        // Z축 기준 180도 원 운동 회전 애니메이션 (Math.PI)
        const rotationZ = newProgress * Math.PI; // 180도 회전
        
        // 다른 축은 0으로 고정하고 Z축만 회전
        if (secondGroupRef?.current?.rotation) {
          secondGroupRef.current.rotation.x = 0;
          secondGroupRef.current.rotation.y = 0;
          secondGroupRef.current.rotation.z = rotationZ;
        }
        
        // 애니메이션 완료
        if (newProgress >= 1 && !reverseAnimating) {
          setSecondSetAnimating(false);
          // 상태 업데이트를 한 번만 실행
          setTimeout(() => setAnimationStep(2), 0);
        }
        
        return newProgress;
      });
    }
    
    // 두 번째 세트 역방향 애니메이션
    if (reverseAnimating && secondGroupRef?.current && animationStep === 2) {
      setSecondSetProgress((prev) => {
        const newProgress = Math.max(prev - delta / animationDuration, 0);
        
        // Z축 기준 역방향 회전
        const rotationZ = newProgress * Math.PI;
        
        if (secondGroupRef?.current?.rotation) {
          secondGroupRef.current.rotation.x = 0;
          secondGroupRef.current.rotation.y = 0;
          secondGroupRef.current.rotation.z = rotationZ;
        }
        
        // 역방향 애니메이션 완료
        if (newProgress <= 0) {
          setReverseAnimating(false);
          // 상태 업데이트를 한 번만 실행
          setTimeout(() => setAnimationStep(1), 0);
          setCurrentSet(2); // 두 번째 세트 대기
        }
        
        return newProgress;
      });
    }
  };

  return {
    firstPivotPoint,
    secondPivotPoint,
    updateAnimations
  };
}

// 스프링 전환 함수
const springTransition = (camera, startPos, startTarget, endPos, endTarget, onComplete) => {
  let progress = 0;
  const duration = 2; // 2초 동안 전환
  const startTime = Date.now();

  const animate = () => {
    const currentTime = Date.now();
    progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
    
    // 이징 함수 적용
    const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out

    // 위치 보간
    camera.position.set(
      startPos[0] + (endPos[0] - startPos[0]) * easeProgress,
      startPos[1] + (endPos[1] - startPos[1]) * easeProgress,
      startPos[2] + (endPos[2] - startPos[2]) * easeProgress
    );

    // 시점 보간
    const currentTarget = new THREE.Vector3(
      startTarget[0] + (endTarget[0] - startTarget[0]) * easeProgress,
      startTarget[1] + (endTarget[1] - startTarget[1]) * easeProgress,
      startTarget[2] + (endTarget[2] - startTarget[2]) * easeProgress
    );
    camera.lookAt(currentTarget);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  animate();
};

export function RotatingAlbumSet({ groupRef, pivotPoint, frontPlanes, backPlanes, mainPlaneColor = "#ffffff", isSecondSet = false }) {
  const { animationStep, selectedMiniPlanes } = usePlaneStore();
  const [opacity, setOpacity] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isSecondSet && animationStep >= 1) {
      const fadeIn = setInterval(() => {
        setOpacity(prev => prev >= 1 ? (clearInterval(fadeIn), 1) : prev + 0.05);
      }, 50);
      return () => clearInterval(fadeIn);
    }
  }, [isSecondSet, animationStep]);

  const handlePlayClick = async () => {
    if (typeof window !== 'undefined' && window.cameraControl) {
      const camera = window.cameraControl.camera;
      if (!camera) return;

      setIsGenerating(true);

      try {
        // 현재 카메라 위치와 시점 저장
        const currentPosition = camera.position.clone();
        const currentTarget = new THREE.Vector3();
        camera.getWorldDirection(currentTarget);
        currentTarget.multiplyScalar(10).add(camera.position);

        // 3번 뷰에서 5번 뷰로 스프링 전환
        springTransition(
          camera,
          currentPosition.toArray(),
          currentTarget.toArray(),
          [-4, 12, 16],
          [-5.5, -4, 8.2],
          async () => {
            window.cameraControl.setFixedCamera(5);
            window.cameraControl.setIsOrbitEnabled(false);

            // Pin 회전 시작 이벤트 발생
            window.dispatchEvent(new CustomEvent('startPinRotation'));

            // 선택된 플레인들로 음악 생성
            const selectedPlanesArray = Array.from(selectedMiniPlanes);
            if (selectedPlanesArray.length > 0) {
              try {
                const { generateMusic } = await import('../../utils/api');
                const result = await generateMusic(selectedPlanesArray);
                
                // 음악 재생 및 모달 표시
                if (result.audioUrl) {
                  const audio = new Audio(result.audioUrl);
                  // API 음성 시작 이벤트 발생
                  window.dispatchEvent(new Event('apiAudioStart'));
                  audio.play();

                  audio.onended = () => {
                    // API 음성 종료 이벤트 발생
                    window.dispatchEvent(new Event('apiAudioEnd'));
                  };
                  
                  // 모달 표시 (전역 이벤트 발생)
                  window.dispatchEvent(new CustomEvent('showMusicModal', {
                    detail: {
                      audioUrl: result.audioUrl,
                      prompt: result.prompt,
                      characteristics: result.characteristics
                    }
                  }));
                }
              } catch (error) {
                console.error('음악 생성 중 오류:', error);
                alert('음악 생성에 실패했습니다.');
              }
            }
          }
        );
      } catch (error) {
        console.error('카메라 전환 중 오류:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  if (isSecondSet && animationStep < 1) return null;

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
          onClick={handlePlayClick}
        />
      ))}

      <mesh position={[1.6 - pivotPoint[0], -5.54 - pivotPoint[1], 11.6 - pivotPoint[2]]} rotation={[Math.PI/2, 0, 0]}>
        <boxGeometry args={[2.8, 3.6, 0.1]} />
        <meshStandardMaterial color={mainPlaneColor} />
      </mesh>

      {isSecondSet && (
        <>
          <mesh position={[1.6 - pivotPoint[0], -5.54 - pivotPoint[1], 11.5 - pivotPoint[2]]} rotation={[-Math.PI/2, 0, 0]}>
            <boxGeometry args={[2.8, 3.6, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={opacity} />
          </mesh>

          <mesh position={[1.6 - pivotPoint[0], -5.59 - pivotPoint[1], 11.5 - pivotPoint[2]]} rotation={[-Math.PI/2, 0, 0]}>
            <boxGeometry args={[2.8, 3.6, 0.001]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={opacity} />
          </mesh>
        </>
      )}

      {backPlanes.map((planeNumber, index) => (
        <SelectableMiniPlane
          key={planeNumber}
          position={[
            (index < 2 ? 2.3 : 1.3) - pivotPoint[0],
            -5.7 - pivotPoint[1],
            (index % 2 === 0 ? 11.6 : 12.8) - pivotPoint[2]
          ]}
          planeNumber={planeNumber}
          onClick={handlePlayClick}
        />
      ))}
    </group>
  );
}

export default LP; 