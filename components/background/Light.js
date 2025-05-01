import React, { useEffect } from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

const diagnoseShadowInteractions = (scene) => {
  const report = {
    totalMeshes: 0,
    shadowCasters: 0,
    shadowReceivers: 0,
    badMaterials: [],
    floatingMeshes: [],
  };

  const groundY = -1.5;

  scene.traverse((child) => {
    if (child.isMesh) {
      report.totalMeshes++;

      if (child.castShadow) report.shadowCasters++;
      if (child.receiveShadow) report.shadowReceivers++;

      // 그림자 비우호적 재질 검사
      const type = child.material?.type;
      const goodTypes = ['MeshStandardMaterial', 'MeshPhysicalMaterial'];
      if (!goodTypes.includes(type)) {
        report.badMaterials.push({
          name: child.name,
          materialType: type,
        });
      }

      // 바닥보다 떠 있는지 검사
      const y = child.getWorldPosition(new THREE.Vector3()).y;
      if (y - groundY > 0.3) {
        report.floatingMeshes.push({
          name: child.name,
          y,
        });
      }
    }
  });

  console.table(report);
  console.log("📊 모델 간 그림자 진단이 완료되었습니다.");
  return report;
};

const Light = () => {
  const { scene } = useThree();

  useEffect(() => {
    const light = scene.getObjectByName('directionalLight');
    if (light && scene) {
      //조명 그림자 품질 강화
      light.castShadow = true;
      light.shadow.mapSize.set(4096, 4096); // 해상도 ↑
      light.shadow.bias = -0.002;           // 더 진한 경계
      light.shadow.normalBias = 0.15;       // 접촉 그림자 강조

      //창문 그림자 길어지게
      light.shadow.camera.left = -20;
      light.shadow.camera.right = 20;
      light.shadow.camera.top = 20;
      light.shadow.camera.bottom = -20;
      light.shadow.camera.far = 60;

      // ✅ 낮고 옆 방향에서 빛이 들어오도록 변경 (길게 그림자)
      light.position.set(-12, 4, 6);

      // ✅ target 위치 조정 (중앙 바닥 쪽으로)
      if (light.target) {
        light.target.position.set(0, 0, 0);
        light.target.updateMatrixWorld();
      }

      // 그림자 상호작용 진단 실행
      diagnoseShadowInteractions(scene);
    }
  }, [scene]);

  return (
    <>
      <Environment 
        files="/3d/hdri/meadow.hdr" 
        background 
      />

      <ambientLight intensity={0.001} />

      <directionalLight
        name="directionalLight"
        position={[-12, 4, 6]}
        intensity={6}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.002}
        shadow-radius={0}
        shadow-normalBias={0.15}
      >
        <object3D position={[0, 0, 0]} />
      </directionalLight>

      <mesh position={[-12, 4, 6]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};

export default Light;
