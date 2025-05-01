import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSeasonLogic } from './SeasonLogic';

const Season = ({ visible = true, onDragStart, onDragEnd, onDrop }) => {
  const { scene } = useGLTF('/3d/mini-block/season2.glb');
  const modelRef = useRef();
  const [isDraggable, setIsDraggable] = useState(false);
  const [isOnLP, setIsOnLP] = useState(false);
  const { camera } = useThree();
  const mouse = new THREE.Vector2();
  const lastMouse = new THREE.Vector2();
  const plane = new THREE.Plane();
  const planeNormal = new THREE.Vector3();
  const originalMaterials = useRef({});
  const boundingBox = useRef(null);

  const {
    originalPosition,
    setupMesh,
    createMaterial,
    isOverLP,
    snapToLP,
    calculateIntersection
  } = useSeasonLogic();

  useEffect(() => {
    if (scene) {
      boundingBox.current = new THREE.Box3().setFromObject(scene);
      
      scene.traverse((child) => {
        if (child.isMesh) {
          setupMesh(child, visible);
          originalMaterials.current[child.uuid] = child.material.clone();
        }
      });
    }
  }, [scene, visible, setupMesh]);

  const updateMaterials = (isRed) => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
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

export default Season;
