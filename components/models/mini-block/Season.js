import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Season = ({ visible = true, onDragStart, onDragEnd, onDrop }) => {
  const { scene } = useGLTF('/3d/mini-block/season.glb');
  const modelRef = useRef();
  const [isDraggable, setIsDraggable] = useState(false);
  const [isOnLP, setIsOnLP] = useState(false);
  const { camera, gl, scene: threeScene } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const lastMouse = new THREE.Vector2();
  const plane = new THREE.Plane();
  const planeNormal = new THREE.Vector3();
  const originalMaterials = useRef({});
  const boundingBox = useRef(null);
  const originalPosition = useRef([0.6, -1, -1.3]);
  const lpPosition = [0.2, -0.36, 0.08]; // LP 모델의 위치
  const lpRadius = 1.35; // LP 모델의 반지름 (scale 2.7의 절반)

  useEffect(() => {
    if (scene) {
      boundingBox.current = new THREE.Box3().setFromObject(scene);
      
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false;
          child.visible = visible;
          child.renderOrder = 1;
          originalMaterials.current[child.uuid] = child.material.clone();
          child.geometry.computeBoundingBox();
          child.geometry.boundingSphere = child.geometry.boundingBox.getBoundingSphere(new THREE.Sphere());
          child.geometry.boundingSphere.radius *= 0.375; // 감지 영역 62.5% 축소 (0.75 * 0.5 = 0.375)
        }
      });
    }
  }, [scene, visible]);

  const updateMaterials = (isRed) => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        const originalMaterial = originalMaterials.current[child.uuid];
        // LP 위에 있을 때는 색상 변경하지 않음
        if (isOnLP) {
          child.material = originalMaterial.clone();
        } else {
          child.material = new THREE.MeshStandardMaterial({
            color: isRed ? new THREE.Color('#ff0000') : originalMaterial.color,
            metalness: originalMaterial.metalness,
            roughness: originalMaterial.roughness,
            transparent: originalMaterial.transparent,
            opacity: originalMaterial.opacity,
          });
        }
      }
    });
  };

  useEffect(() => {
    updateMaterials(isDraggable);
  }, [isDraggable, isOnLP, scene]);

  const handlePointerEnter = (e) => {
    e.stopPropagation();
    if (visible && !isOnLP) {
      setIsDraggable(true);
      document.body.style.cursor = 'grab';
    }
  };

  const handlePointerLeave = (e) => {
    e.stopPropagation();
    if (!modelRef.current?.isDragging) {
      setIsDraggable(false);
      document.body.style.cursor = 'auto';
    }
  };

  const isOverLP = (position) => {
    const dx = position.x - lpPosition[0];
    const dz = position.z - lpPosition[2];
    const distanceToLP = Math.sqrt(dx * dx + dz * dz);
    return distanceToLP <= lpRadius;
  };

  const snapToLP = () => {
    return {
      x: lpPosition[0],
      y: lpPosition[1] + 0.1, // LP 위에 살짝 띄움
      z: lpPosition[2]
    };
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    modelRef.current.isDragging = true;
    document.body.style.cursor = 'grabbing';
    if (onDragStart) onDragStart();
    lastMouse.set(e.clientX, e.clientY);

    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      camera.getWorldDirection(planeNormal);
      plane.setFromNormalAndCoplanarPoint(planeNormal, modelRef.current.position);

      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      // 드래그 중에는 자유롭게 이동
      modelRef.current.position.copy(intersection);
    };

    const handlePointerUp = () => {
      modelRef.current.isDragging = false;
      document.body.style.cursor = 'auto';
      
      const droppedOnLP = isOverLP(modelRef.current.position);
      if (droppedOnLP) {
        const snapPosition = snapToLP();
        modelRef.current.position.set(snapPosition.x, snapPosition.y, snapPosition.z);
        setIsOnLP(true);
      } else {
        modelRef.current.position.set(...originalPosition.current);
        setIsOnLP(false);
      }

      // LP 위에 드롭되었는지 여부를 부모 컴포넌트에 알림
      if (onDrop) {
        onDrop(droppedOnLP);
      }

      if (onDragEnd) onDragEnd();
      setIsDraggable(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <group>
      {/* 투명한 바운딩 박스 - 클릭 감지 영역 */}
      <mesh
        visible={false}
        position={[0.6, -1, -1.3]}
        rotation={[0, Math.PI / 2, 0]}
        scale={6}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* 실제 모델 */}
      <primitive
        ref={modelRef}
        object={scene}
        position={[0.6, -1, -1.3]}
        rotation={[0, Math.PI / 2, 0]}
        scale={6}
      />
    </group>
  );
};

export default Season;
