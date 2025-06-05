import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 고정 카메라 시점 컴포넌트 + 애니메이션
export default function FixedCameraView({ 
  view, 
  animatingCamera, 
  animationProgress, 
  animationDuration, 
  cameraFrom, 
  cameraTo, 
  setFixedCamera 
}) {
  const { camera } = useThree();
  
  useFrame((_, delta) => {
    if (animatingCamera.current) {
      animationProgress.current += delta / animationDuration;
      const t = Math.min(animationProgress.current, 1);
      // position damp
      const fromPos = cameraFrom.current.position;
      const toPos = cameraTo.current.position;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, fromPos[0] + (toPos[0] - fromPos[0]), 2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, fromPos[1] + (toPos[1] - fromPos[1]), 2, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, fromPos[2] + (toPos[2] - fromPos[2]), 2, delta);
      // target damp
      const fromTarget = cameraFrom.current.target;
      const toTarget = cameraTo.current.target;
      const lookX = THREE.MathUtils.damp(camera._lookX || fromTarget[0], fromTarget[0] + (toTarget[0] - fromTarget[0]), 2, delta);
      const lookY = THREE.MathUtils.damp(camera._lookY || fromTarget[1], fromTarget[1] + (toTarget[1] - fromTarget[1]), 2, delta);
      const lookZ = THREE.MathUtils.damp(camera._lookZ || fromTarget[2], fromTarget[2] + (toTarget[2] - fromTarget[2]), 2, delta);
      camera.lookAt(lookX, lookY, lookZ);
      camera._lookX = lookX; camera._lookY = lookY; camera._lookZ = lookZ;
      camera.updateProjectionMatrix();
      if (t >= 1 &&
        Math.abs(camera.position.x - (fromPos[0] + (toPos[0] - fromPos[0]))) < 0.01 &&
        Math.abs(camera.position.y - (fromPos[1] + (toPos[1] - fromPos[1]))) < 0.01 &&
        Math.abs(camera.position.z - (fromPos[2] + (toPos[2] - fromPos[2]))) < 0.01) {
        animatingCamera.current = false;
        setFixedCamera(3); // 애니메이션 끝나면 3번 카메라로 고정
      }
      return;
    }
    if (view === 1) {
      camera.position.set(40, 16, 55);
      camera.fov = 35;
      camera.lookAt(4, -3, 0);
      camera.updateProjectionMatrix();
    } else if (view === 2) {
      camera.position.set(5, 24, 70);
      camera.fov = 35;
      camera.lookAt(5, -7, 0);
      camera.updateProjectionMatrix();
    } else if (view === 3) {
      camera.position.set(-2, 10, 19);
      camera.fov = 35;
      camera.lookAt(-2, -5, 10);
      camera.updateProjectionMatrix();
    } else if (view === 4) {
      camera.position.set(15, 15, 25);
      camera.fov = 35;
      camera.lookAt(0, -5, 10);
      camera.updateProjectionMatrix();
    } else if (view === 5) {
      camera.position.set(-3, 8, 15);
      camera.fov = 28;  // FOV를 더 낮춰서 왜곡 감소
      camera.lookAt(-5.5, -3.7, 8.2);  // LP의 위치를 정확히 바라보도록 설정
      camera.updateProjectionMatrix();
    }
  });
  return null;
} 