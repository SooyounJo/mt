import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const files = [
  'fa.glb',
  'sp.glb',
  'su.glb',
  'wi.glb',
];

const defaultPositions = [
  [0.7, -1, -1.5],
  [0.7, -1, -2],
  [0.7, -1, -2.5],
  [0.7, -1, -3],
];

const lpPosition = [0.2, -0.36, 0.08];
const lpRadius = 1.35;

function isOverLP(position) {
  const dx = position.x - lpPosition[0];
  const dz = position.z - lpPosition[2];
  const distanceToLP = Math.sqrt(dx * dx + dz * dz);
  return distanceToLP <= lpRadius;
}

function snapToLP() {
  return {
    x: lpPosition[0],
    y: lpPosition[1] + 0.1,
    z: lpPosition[2]
  };
}

export default function Season({ visible = true, onDragStart, onDragEnd, onDrop }) {
  const { camera } = useThree();
  const [onLP, setOnLP] = useState(Array(files.length).fill(false));
  const modelRefs = useRef(Array(files.length).fill().map(() => React.createRef()));
  const [isDragging, setIsDragging] = useState(Array(files.length).fill(false));
  const [boundingBoxes, setBoundingBoxes] = useState(Array(files.length).fill(null));
  const [originalMaterials, setOriginalMaterials] = useState(Array(files.length).fill(null));

  // bounding box 및 머티리얼 저장
  useEffect(() => {
    files.forEach((file, idx) => {
      const { scene } = useGLTF(`/3d/mini-block/season/${file}`);
      if (scene) {
        // bounding box
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        setBoundingBoxes(prev => {
          const next = [...prev];
          next[idx] = { size, center };
          return next;
        });
        // 머티리얼 저장
        let mats = [];
        scene.traverse(child => {
          if (child.isMesh) {
            mats.push(child.material.clone());
          }
        });
        setOriginalMaterials(prev => {
          const next = [...prev];
          next[idx] = mats;
          return next;
        });
      }
    });
  }, []);

  // 드래그 중일 때 빨간색으로 변경
  useEffect(() => {
    files.forEach((file, idx) => {
      const { scene } = useGLTF(`/3d/mini-block/season/${file}`);
      if (scene && originalMaterials[idx]) {
        let matIdx = 0;
        scene.traverse(child => {
          if (child.isMesh) {
            if (isDragging[idx]) {
              // 빨간색 머티리얼 적용
              const redMat = child.material.clone();
              redMat.color.set(0xff0000);
              redMat.emissive?.set(0xff0000);
              redMat.emissiveIntensity = 0.2;
              child.material = redMat;
            } else {
              // 원래 머티리얼 복원
              child.material = originalMaterials[idx][matIdx] || child.material;
            }
            matIdx++;
          }
        });
      }
    });
  }, [isDragging, originalMaterials]);

  const handlePointerDown = (idx, e) => {
    e.stopPropagation();
    setIsDragging((prev) => prev.map((v, i) => (i === idx ? true : v)));
    if (onDragStart) onDragStart();
    modelRefs.current[idx].current.isDragging = true;
    document.body.style.cursor = 'grabbing';
    const mouse = new THREE.Vector2();
    const lastMouse = new THREE.Vector2();
    const plane = new THREE.Plane();
    const planeNormal = new THREE.Vector3();
    lastMouse.set(e.clientX, e.clientY);

    const handlePointerMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      camera.getWorldDirection(planeNormal);
      plane.setFromNormalAndCoplanarPoint(planeNormal, modelRefs.current[idx].current.position);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      modelRefs.current[idx].current.position.copy(intersection);
    };

    const handlePointerUp = () => {
      modelRefs.current[idx].current.isDragging = false;
      document.body.style.cursor = 'auto';
      setIsDragging((prev) => prev.map((v, i) => (i === idx ? false : v)));
      const droppedOnLP = isOverLP(modelRefs.current[idx].current.position);
      setOnLP((prev) => prev.map((v, i) => (i === idx ? droppedOnLP : v)));
      if (droppedOnLP) {
        const snapPosition = snapToLP();
        modelRefs.current[idx].current.position.set(snapPosition.x, snapPosition.y, snapPosition.z);
      } else {
        modelRefs.current[idx].current.position.set(...defaultPositions[idx]);
      }
      if (onDrop) onDrop(droppedOnLP);
      if (onDragEnd) onDragEnd();
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <group>
      {files.map((file, idx) => {
        const { scene } = useGLTF(`/3d/mini-block/season/${file}`);
        const bbox = boundingBoxes[idx];
        return (
          <group key={file} position={onLP[idx] ? [lpPosition[0], lpPosition[1] + 0.1, lpPosition[2]] : defaultPositions[idx]}>
            {/* 실제 모델 */}
            <primitive
              ref={modelRefs.current[idx]}
              object={scene}
              scale={6}
              visible={visible}
              castShadow
              receiveShadow
              rotation={[0, Math.PI / 2, 0]}
            />
            {/* 드래그용 투명 박스 */}
            {bbox && (
              <mesh
                position={bbox.center}
                scale={bbox.size}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                visible={visible}
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
