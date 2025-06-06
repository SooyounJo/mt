// 카메라 전환을 위한 스프링 트랜지션 함수
export const springTransition = () => {
  return new Promise((resolve) => {
    // 카메라 뷰 5로 전환
    if (typeof window !== 'undefined' && window.camera) {
      window.camera.position.set(0, 2, 5);
      window.camera.lookAt(0, 0, 0);
    }
    
    // 3초 후에 Pin 회전
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.pin) {
        window.pin.rotation.y += Math.PI / 6; // 30도 회전
      }
      resolve();
    }, 3000);
  });
}; 