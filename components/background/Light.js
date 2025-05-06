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
      light.shadow.bias = -0.003;           // 더 진한 경계
      light.shadow.normalBias = 0.2;        // 더 강한 접촉 그림자

      //창문 그림자 길어지게
      light.shadow.camera.left = -20;
      light.shadow.camera.right = 20;
      light.shadow.camera.top = 20;
      light.shadow.camera.bottom = -20;
      light.shadow.camera.far = 60;

      // ✅ 낮고 옆 방향에서 빛이 들어오도록 변경 (길게 그림자)
      light.position.set(-7, 6, 6);
      light.intensity = 4;  // 조명 강도 증가

      // ✅ target 위치 조정 (중앙 바닥 쪽으로)
      if (light.target) {
        light.target.position.set(0, -1, 0);
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

      <ambientLight intensity={0.2} />  // 주변광 강도 감소

      <directionalLight
        name="directionalLight"
        position={[-12, 5, 8]}
        intensity={3.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.003}
        shadow-radius={0}
        shadow-normalBias={0.2}
      >
        <object3D position={[0, -1, 0]} />
      </directionalLight>

      <spotLight
        position={[-10, 4, -6]}
        intensity={2.5}
        angle={Math.PI / 5}
        penumbra={0.4}
        decay={2.5}
        distance={25}
        color="#ffffff"
        castShadow
      />

      {/* 보조 조명 추가 - 반대편에서 약한 조명 */}
      <pointLight
        position={[8, 3, -4]}
        intensity={0.3}
        distance={15}
        decay={2}
        color="#ffffff"
      />
    </>
  );
};

export default Light;
