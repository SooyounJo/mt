import * as THREE from 'three';

export const useSeasonLogic = () => {
  const lpPosition = [0.2, -0.36, 0.08];
  const lpRadius = 1.35;
  const originalPosition = [0.6, -1, -1.3];

  const setupMesh = (child, visible) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;
      child.visible = visible;
      child.renderOrder = 1;
      child.geometry.computeBoundingBox();
      child.geometry.boundingSphere = child.geometry.boundingBox.getBoundingSphere(new THREE.Sphere());
      child.geometry.boundingSphere.radius *= 0.375;
    }
  };

  const createMaterial = (originalMaterial, isRed) => {
    return new THREE.MeshStandardMaterial({
      color: isRed ? new THREE.Color('#ff0000') : originalMaterial.color,
      metalness: originalMaterial.metalness,
      roughness: originalMaterial.roughness,
      transparent: originalMaterial.transparent,
      opacity: originalMaterial.opacity,
    });
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

  const calculateIntersection = (mouse, camera, planeNormal, plane, position) => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    camera.getWorldDirection(planeNormal);
    plane.setFromNormalAndCoplanarPoint(planeNormal, position);

    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    return intersection;
  };

  return {
    lpPosition,
    lpRadius,
    originalPosition,
    setupMesh,
    createMaterial,
    isOverLP,
    snapToLP,
    calculateIntersection
  };
}; 