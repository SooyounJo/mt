import { create } from 'zustand';

// 상수 정의
export const STAGES = {
  FIRST: {
    name: '첫 번째 단계',
    range: { start: 1, end: 4 },
    targetPosition: [-5.5, -3.6, 8.2]
  },
  SECOND: {
    name: '두 번째 단계',
    range: { start: 5, end: 8 },
    targetPosition: [-6, -3.6, 8.2]
  },
  THIRD: {
    name: '세 번째 단계',
    range: { start: 9, end: 16 },
    targetPosition: [-5.5, -3.6, 9]
  },
  FOURTH: {
    name: '마지막 단계',
    range: { start: 17, end: 20 },
    targetPosition: [-6, -3.6, 9]
  }
};

// 스테이지 유틸리티 함수
export const getNextStage = (currentStage) => {
  const stages = Object.keys(STAGES);
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
};

export const getStageForPlane = (planeNumber) => {
  return Object.entries(STAGES).find(([_, stage]) => 
    planeNumber >= stage.range.start && planeNumber <= stage.range.end
  )?.[0];
};

// Zustand store 생성
export const usePlaneStore = create((set, get) => ({
  currentStage: 'FIRST',
  selectedPlane: null,
  isAnimating: false,

  // 선택 가능 여부 확인
  isPlaneSelectable: (planeNumber) => {
    const { currentStage, selectedPlane } = get();
    
    // 이미 선택된 plane은 선택 가능
    if (selectedPlane === planeNumber) return true;
    
    // 현재 스테이지의 범위 내에 있는 plane만 선택 가능
    const stage = STAGES[currentStage];
    return planeNumber >= stage.range.start && planeNumber <= stage.range.end;
  },

  // Plane 선택
  selectPlane: (planeNumber) => {
    const { currentStage, selectedPlane, isPlaneSelectable } = get();
    
    if (!isPlaneSelectable(planeNumber)) return;

    // 이미 선택된 plane 클릭 시 선택 해제
    if (selectedPlane === planeNumber) {
      set({ selectedPlane: null });
      return;
    }

    set({ selectedPlane: planeNumber, isAnimating: true });

    // 애니메이션 완료 후 다음 단계로 진행
    setTimeout(() => {
      const nextStage = getNextStage(currentStage);
      if (nextStage) {
        set({ currentStage: nextStage, isAnimating: false });
      } else {
        // 마지막 단계에서는 페이지 전환
        if (window.AlbumPageControl) {
          window.AlbumPageControl.turnPage();
        }
        set({ isAnimating: false });
      }
    }, 500); // 애니메이션 시간과 동일하게 설정
  },

  // Plane의 목표 위치 가져오기
  getTargetPosition: (planeNumber) => {
    const { selectedPlane } = get();
    if (selectedPlane !== planeNumber) return null;
    
    const stageName = getStageForPlane(planeNumber);
    return stageName ? STAGES[stageName].targetPosition : null;
  }
})); 