import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SeasonPart = ({ 
  partName, 
  visible = true, 
  onDragStart, 
  onDragEnd, 
  onDrop,
  originalPosition,
  isOnLP,
  setIsOnLP
}) => {
  const { scene } = useGLTF('/3d/mini-block/season2.glb');
  const modelRef = useRef();
  const [isDraggable, setIsDraggable] = useState(false);
  const { camera } = useThree();
  const mouse = new THREE.Vector2();
  const lastMouse = new THREE.Vector2();
  const plane = new THREE.Plane();
  const planeNormal = new THREE.Vector3();
  const originalMaterials = useRef({});
  const boundingBox = useRef(null);

  useEffect(() => {
    if (scene) {
      // 디버깅을 위해 모든 메시 이름 출력
      console.log('Available meshes in the model:');
      scene.traverse((child) => {
        if (child.isMesh) {
          console.log('Mesh name:', child.name);
          // 특정 파트만 표시하도록 설정
          child.visible = child.name === partName;
          if (child.visible) {
            child.castShadow = true;
            child.receiveShadow = true;
            originalMaterials.current[child.uuid] = child.material.clone();
          }
        }
      });
      
      boundingBox.current = new THREE.Box3().setFromObject(scene);
    }
  }, [scene, partName]);

  const createMaterial = (originalMaterial, isRed) => {
    const material = originalMaterial.clone();
    if (isRed) {
      material.color.set(0xff0000);
      material.emissive.set(0xff0000);
      material.emissiveIntensity = 0.2;
    } else {
      material.color.set(originalMaterial.color);
      material.emissive.set(0x000000);
      material.emissiveIntensity = 0;
    }
    return material;
  };

  const updateMaterials = (isRed) => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh && child.name === partName) {
        const originalMaterial = originalMaterials.current[child.uuid];
        child.material = createMaterial(originalMaterial, isRed && !isOnLP);
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

  const calculateIntersection = (mouse, camera, planeNormal, plane, position) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    camera.getWorldDirection(planeNormal);
    plane.setFromNormalAndCoplanarPoint(planeNormal, position);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    return intersection;
  };

  const isOverLP = (position) => {
    const lpPosition = new THREE.Vector3(0, 0, 0); // LP의 실제 위치로 수정 필요
    const distance = position.distanceTo(lpPosition);
    return distance < 1.5;
  };

  const snapToLP = () => {
    return new THREE.Vector3(0, 0, 0); // LP의 실제 위치로 수정 필요
  };

  const handlePointerDown = (e) => {
    if (isOnLP) return;
    
    e.stopPropagation();
    modelRef.current.isDragging = true;
    document.body.style.cursor = 'grabbing';
    if (onDragStart) onDragStart();
    lastMouse.set(e.clientX, e.clientY);

    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      const intersection = calculateIntersection(
        mouse,
        camera,
        planeNormal,
        plane,
        modelRef.current.position
      );
      
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
        setIsDraggable(false);
      } else {
        modelRef.current.position.set(...originalPosition);
        setIsOnLP(false);
      }

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
      <mesh
        visible={false}
        position={originalPosition}
        rotation={[0, Math.PI / 2, 0]}
        scale={6}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <primitive
        ref={modelRef}
        object={scene}
        position={originalPosition}
        rotation={[0, Math.PI / 2, 0]}
        scale={6}
      />
    </group>
  );
};

export default SeasonPart; 