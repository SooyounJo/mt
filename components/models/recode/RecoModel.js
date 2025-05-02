import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const RecoModel = () => {
  const { scene, error } = useGLTF('/3d/recode/reco.glb');

  useEffect(() => {
    if (error) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);

    // 메시 크기 순으로 정렬하기 위한 배열
    const meshes = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false;
        child.visible = true;
        child.renderOrder = 1;

        const originalMaterial = child.material;
        const meshBox = new THREE.Box3().setFromObject(child);
        const size = new THREE.Vector3();
        meshBox.getSize(size);
        const maxDimension = Math.max(size.x, size.y, size.z);

        // 메시와 크기 정보 저장
        meshes.push({ mesh: child, size: maxDimension, originalMaterial });
      }
    });

    // 크기 순으로 정렬
    meshes.sort((a, b) => b.size - a.size);

    // 메시별 재질 설정
    meshes.forEach((item, index) => {
      const { mesh, originalMaterial } = item;

      if (index === 1) { // 두 번째로 큰 메시
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: originalMaterial.color.getHex(),
          metalness: 0.0,
          roughness: 0.1,
          transmission: 0.9,  // 투명도
          thickness: 0.5,     // 두께
          clearcoat: 1.0,     // 코팅
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.0,
          ior: 1.5           // 굴절률
        });
        
      } else if (originalMaterial.color.getHex() === 0xff0000) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xff0000,
          metalness: 0.0,
          roughness: 0.1,
          emissive: 0xff0000,
          emissiveIntensity: 0.2
        });
      } else if (originalMaterial.color.getHex() === 0xffffff) {
        if (item.size < 1.0) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.9,
            roughness: 0.2
          });
        } else {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.1
          });
        }
      }
    });
  }, [scene, error]);

  if (error) return null;

  return (
    <primitive 
      object={scene} 
      scale={2.5} 
      position={[0, -1.5, 0]} 
      rotation={[0, Math.PI / 2, 0]}
    />
  );
};

export default RecoModel;

