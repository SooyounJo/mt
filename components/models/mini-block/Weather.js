import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Weather = ({ visible = true, onDragStart, onDragEnd, onDrop, selectedNumber = null, dragEnabled = true }) => {
  const { scene } = useGLTF('/3d/mini-block/wea.glb');
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
  const originalPosition = [0.7, -1, -1.3];
  const lpPosition = [0.2, -0.36, 0.08];
  const lpRadius = 1.35;

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
          child.geometry.boundingSphere.radius *= 0.375;
        }
      });
    }
  }, [scene, visible]);

  const updateMaterials = (isRed) => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        const originalMaterial = originalMaterials.current[child.uuid];
        child.material = new THREE.MeshStandardMaterial({
          color: isRed && !isOnLP ? new THREE.Color('#ff0000') : originalMaterial.color,
          metalness: originalMaterial.metalness,
          roughness: originalMaterial.roughness,
          transparent: originalMaterial.transparent,
          opacity: originalMaterial.opacity,
        });
      }
    });
  };

  useEffect(() => {
    updateMaterials(isDraggable);
  }, [isDraggable, isOnLP, scene]);

  const handlePointerEnter = (e) => {
    e.stopPropagation();
    if (visible && !isOnLP && selectedNumber === 3) {
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
      y: lpPosition[1] + 0.1,
      z: lpPosition[2]
    };
  };

  const handlePointerDown = (e) => {
    if (!dragEnabled) return;
    if (selectedNumber !== 3 || isOnLP) return;
    
    e.stopPropagation();
    modelRef.current.isDragging = true;
    document.body.style.cursor = 'grabbing';
    if (onDragStart) onDragStart();
    lastMouse.set(e.clientX, e.clientY);

    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      camera.getWorldDirection(planeNormal);
      plane.setFromNormalAndCoplanarPoint(planeNormal, modelRef.current.position);

      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      modelRef.current.position.copy(intersection);
    };

    const handlePointerUp = () => {
      modelRef.current.isDragging = false;
      document.body.style.cursor = 'auto';
      if (onDragEnd) onDragEnd();

      const droppedOnLP = isOverLP(modelRef.current.position);
      if (droppedOnLP) {
        const snapPosition = snapToLP();
        modelRef.current.position.set(snapPosition.x, snapPosition.y, snapPosition.z);
        setIsOnLP(true);
      } else {
        modelRef.current.position.set(...originalPosition);
        setIsOnLP(false);
      }

      if (onDrop) {
        onDrop(droppedOnLP);
      }

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
        position={[originalPosition[0], originalPosition[1] + 0.2, originalPosition[2]]}
        rotation={[0, Math.PI / 2, 0]}
        scale={1}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <primitive
        ref={modelRef}
        object={scene}
        position={originalPosition}
        rotation={[0, Math.PI / 2, 0]}
        scale={8}
      />
    </group>
  );
};

export default Weather; 