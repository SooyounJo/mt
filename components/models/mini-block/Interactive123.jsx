import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Interactive123 = ({ scene, castShadow = true, receiveShadow = true }) => {
  const groupRef = useRef();
  const blockRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [meshes, setMeshes] = useState([]);

  useEffect(() => {
    if (!scene) return;

    const meshList = [];
    let meshIndex = 0;

    scene.traverse((child) => {
      if (child.isMesh) {
        const originalColor = child.material?.color?.getHex?.() || 0xffffff;

        const mat = new THREE.MeshPhysicalMaterial({
          color: originalColor,
          metalness: 0.0,
          roughness: 0.1,
          transmission: 0.9,
          thickness: 0.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.0,
          ior: 1.5,
          transparent: true,
          opacity: 1
        });

        child.material = mat;
        child.userData.originalColor = new THREE.Color(originalColor); // 호버 색상 복구용
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        child.frustumCulled = false;
        child.visible = true;

        blockRefs.current[meshIndex] = child;
        meshList.push({ index: meshIndex, mesh: child });
        meshIndex++;
      }
    });

    setMeshes(meshList);
  }, [scene, castShadow, receiveShadow]);

  useFrame(() => {
    blockRefs.current.forEach((block, index) => {
      if (!block) return;

      // 클릭된 블록만 위로 부드럽게 떠오르게
      const targetY = index === activeIndex ? 0.5 : 0;
      block.position.y += (targetY - block.position.y) * 0.1;

      // 호버 상태면 밝게, 아니면 원래 색으로
      const material = block.material;
      if (index === hoveredIndex) {
        material.color.lerp(new THREE.Color(0xffffff), 0.1);
      } else {
        material.color.lerp(block.userData.originalColor, 0.1);
      }
    });
  });

  if (!scene || meshes.length === 0) return null;

  return (
    <group
      ref={groupRef}
      position={[-0.6, -1, -1.3]}
      rotation={[0, Math.PI / 2, 0]}
      scale={0.009}
    >
      {meshes.map(({ index, mesh }) => (
        <group key={index}>
          {/* 클릭/호버 감지용 투명 Mesh */}
          <mesh
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(index === activeIndex ? null : index);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIndex(index);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredIndex(null);
            }}
          >
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* 실제 렌더링되는 오브젝트 */}
          <primitive object={mesh} />
        </group>
      ))}
    </group>
  );
};

export default Interactive123;


