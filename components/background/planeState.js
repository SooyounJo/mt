import { create } from 'zustand';

// 페이지 정의
export const PAGES = {
  PAGE1: { name: '1페이지', range: { start: 1, end: 4 } },
  PAGE2: { name: '2페이지', range: { start: 5, end: 8 } },
  PAGE3: { name: '3페이지', range: { start: 9, end: 16 } }
};

// 페이지 순서
const PAGE_ORDER = ['PAGE1', 'PAGE2', 'PAGE3'];

// 플레인이 속한 페이지 찾기
const getPageForPlane = (planeNumber) => {
  return Object.entries(PAGES).find(([_, page]) => 
    planeNumber >= page.range.start && planeNumber <= page.range.end
  )?.[0];
};

// Zustand store 생성
export const usePlaneStore = create((set, get) => ({
  currentPage: 'PAGE1',
  selectedPlanes: {
    PAGE1: null,
    PAGE2: null,
    PAGE3: null
  },
  userAnswer: '', // 사용자 답변 저장
  animationStep: 0, // 애니메이션 단계 추가 (0: 초기, 1: 첫번째 세트 회전 완료)

  // 애니메이션 단계 업데이트
  setAnimationStep: (step) => {
    set({ animationStep: step });
  },

  // 사용자 답변 업데이트
  setUserAnswer: (answer) => {
    set({ userAnswer: answer });
  },

  // 선택 가능 여부 확인
  isPlaneSelectable: (planeNumber) => {
    const { currentPage } = get();
    const planePage = getPageForPlane(planeNumber);
    return planePage === currentPage;
  },

  // Plane 선택
  selectPlane: (planeNumber) => {
    const { currentPage } = get();
    const planePage = getPageForPlane(planeNumber);
    
    if (planePage !== currentPage) return;

    set(state => {
      // 같은 플레인을 다시 클릭하면 선택 해제
      if (state.selectedPlanes[planePage] === planeNumber) {
        return {
          ...state,
          selectedPlanes: {
            ...state.selectedPlanes,
            [planePage]: null
          }
        };
      }

      // 새로운 선택
      const nextPage = PAGE_ORDER[PAGE_ORDER.indexOf(currentPage) + 1] || currentPage;
      return {
        selectedPlanes: {
          ...state.selectedPlanes,
          [planePage]: planeNumber
        },
        currentPage: nextPage
      };
    });
  },

  // 플레인이 선택되어 있는지 확인
  isPlaneSelected: (planeNumber) => {
    const { selectedPlanes } = get();
    const planePage = getPageForPlane(planeNumber);
    return selectedPlanes[planePage] === planeNumber;
  }
})); 