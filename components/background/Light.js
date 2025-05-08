import React, { useEffect, useState } from 'react';
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
  const [showHelper, setShowHelper] = useState(true);

  useEffect(() => {
    const light = scene.getObjectByName('directionalLight');
    if (light && scene) {
      //조명 그림자 품질 강화
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      light.shadow.bias = -0.001;
      light.shadow.normalBias = 0.1;

      // 그림자 카메라 설정
      light.shadow.camera.left = -15;
      light.shadow.camera.right = 15;
      light.shadow.camera.top = 15;
      light.shadow.camera.bottom = -15;
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 50;
      light.shadow.camera.updateProjectionMatrix();

      light.position.set(-15, 6, -6);
      light.intensity = 5;

      if (light.target) {
        light.target.position.set(0, 1, 0);
        light.target.updateMatrixWorld();
      }

      // 카메라 헬퍼 추가
      const helper = new THREE.CameraHelper(light.shadow.camera);
      helper.visible = showHelper;
      scene.add(helper);

      // 그림자 상호작용 진단 실행
      diagnoseShadowInteractions(scene);

      // 클린업 함수
      return () => {
        scene.remove(helper);
      };
    }
  }, [scene, showHelper]);

  return (
    <>
      <Environment 
        files="/3d/hdri/meadow.hdr" 
        background
        intensity={0.3}
      />

      <ambientLight intensity={0.3} />

      <directionalLight
        name="directionalLight"
        position={[-12, 8, -10]}
        intensity={3}
        color="white"
      >
        <object3D position={[0, -1, 0]} />
      </directionalLight>

      {/* 헬퍼 토글 버튼 */}
      <mesh
        position={[0, 0, -5]}
        onClick={() => setShowHelper(!showHelper)}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </>
  );
};

export default Light;
