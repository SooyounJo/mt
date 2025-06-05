import React, { useState, useRef } from 'react';

// 카메라 제어 훅
export function useCameraControl() {
  const [isOrbitEnabled, setIsOrbitEnabled] = useState(true);
  const [fixedCamera, setFixedCamera] = useState(null); // null, 1, 2, 3
  const animatingCamera = useRef(false);
  const animationProgress = useRef(0);
  const animationDuration = 2.2; // 초 단위, 더 느리게
  const cameraFrom = useRef({ position: [0,0,0], target: [0,0,0] });
  const cameraTo = useRef({ position: [0,0,0], target: [0,0,0] });

  // 카메라 애니메이션 함수 (1초 대기 후 실행)
  function animateCamera(from, to, onComplete) {
    cameraFrom.current = from;
    cameraTo.current = to;
    animationProgress.current = 0;
    setFixedCamera(1); // 1번 시점으로 먼저 고정
    setIsOrbitEnabled(false);
    setTimeout(() => {
      animatingCamera.current = true;
      setFixedCamera(null); // OrbitControls도 비활성화
      // 애니메이션 완료 후 콜백 실행
      if (onComplete) {
        setTimeout(onComplete, animationDuration * 1000);
      }
    }, 1000);
  }

  // 미리 정의된 카메라 애니메이션 시퀀스
  function startCameraSequence() {
    // 1번 → 2번 → 3번 순서로 이동
    animateCamera(
      { position: [40, 8, 45], target: [4, -3, 0] }, // 1번
      { position: [5, 24, 60], target: [5, -7, 0] }, // 2번
      () => {
        animateCamera(
          { position: [5, 24, 60], target: [5, -7, 0] }, // 2번
          { position: [-2, 10, 19], target: [-2, -5, 10] }   // 3번 (카메라 뷰 3과 동일하게 설정)
        );
      }
    );
  }

  return {
    // 상태
    isOrbitEnabled,
    fixedCamera,
    animatingCamera,
    animationProgress,
    animationDuration,
    cameraFrom,
    cameraTo,
    
    // 액션
    setIsOrbitEnabled,
    setFixedCamera,
    animateCamera,
    startCameraSequence,
  };
}

// 카메라 컨트롤 UI 컴포넌트
export default function CameraControls({ cameraControl }) {
  const {
    isOrbitEnabled,
    fixedCamera,
    setIsOrbitEnabled,
    setFixedCamera,
    startCameraSequence,
  } = cameraControl;

  return (
    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: 8 }}>
      {/* 뷰 고정/해제 버튼 */}
      <button
        onClick={() => setIsOrbitEnabled((prev) => !prev)}
        style={{
          padding: '8px 16px',
          backgroundColor: isOrbitEnabled ? '#222' : '#888',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontWeight: 'bold',
        }}
      >
        {isOrbitEnabled ? '뷰 고정' : '뷰 해제'}
      </button>
      
      {/* 카메라 시점 1번 버튼 */}
      <button
        onClick={() => { setFixedCamera(1); setIsOrbitEnabled(false); }}
        style={{
          padding: '8px 14px',
          backgroundColor: fixedCamera === 1 ? '#ffe066' : '#222',
          color: fixedCamera === 1 ? '#222' : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >1</button>
      
      {/* 카메라 시점 2번 버튼 */}
      <button
        onClick={() => { setFixedCamera(2); setIsOrbitEnabled(false); }}
        style={{
          padding: '8px 14px',
          backgroundColor: fixedCamera === 2 ? '#ffe066' : '#222',
          color: fixedCamera === 2 ? '#222' : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >2</button>
      
      {/* 카메라 시점 3번 버튼 */}
      <button
        onClick={() => { setFixedCamera(3); setIsOrbitEnabled(false); }}
        style={{
          padding: '8px 14px',
          backgroundColor: fixedCamera === 3 ? '#ffe066' : '#222',
          color: fixedCamera === 3 ? '#222' : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >3</button>
      
      {/* 카메라 시점 4번 버튼 */}
      <button
        onClick={() => { setFixedCamera(4); setIsOrbitEnabled(false); }}
        style={{
          padding: '8px 14px',
          backgroundColor: fixedCamera === 4 ? '#ffe066' : '#222',
          color: fixedCamera === 4 ? '#222' : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >4</button>
      
      {/* 카메라 시점 5번 버튼 */}
      <button
        onClick={() => { setFixedCamera(5); setIsOrbitEnabled(false); }}
        style={{
          padding: '8px 14px',
          backgroundColor: fixedCamera === 5 ? '#ffe066' : '#222',
          color: fixedCamera === 5 ? '#222' : '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >5</button>
      
      {/* 뷰 변경 애니메이션 버튼 */}
      <button
        onClick={startCameraSequence}
        style={{
          padding: '8px 14px',
          backgroundColor: '#ffe066',
          color: '#222',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >뷰 변경</button>
    </div>
  );
} 