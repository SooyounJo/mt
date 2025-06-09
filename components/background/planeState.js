import { create } from 'zustand';

// 페이지 및 단계 정의
const PAGES = {
  PAGE1: { range: { start: 1, end: 4 }, maxSelections: 1 },
  PAGE2: { range: { start: 5, end: 8 }, maxSelections: 1 },
  PAGE3: { range: { start: 9, end: 16 }, maxSelections: 1 }
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
  selectedMiniPlanes: new Set(),
  userAnswer: '',
  animationStep: 0,

  // 미니 플레인 선택/해제
  toggleMiniPlane: (planeNumber) => {
    set(state => {
      const newSelected = new Set(state.selectedMiniPlanes);
      const page = getPageForPlane(planeNumber);
      
      // 이미 선택된 경우 해제
      if (newSelected.has(planeNumber)) {
        newSelected.delete(planeNumber);
        return { selectedMiniPlanes: newSelected };
      }

      // 새로운 선택 시 조건 체크
      if (page === state.currentPage) {
        // 같은 페이지의 이전 선택 해제
        Array.from(newSelected).forEach(num => {
          if (getPageForPlane(num) === page) {
            newSelected.delete(num);
          }
        });
        
        // 새로운 선택 추가
        newSelected.add(planeNumber);
        
        // 메인 페이지의 선택 상태와 동기화
        if (typeof window !== 'undefined' && window.syncPlaneSelection) {
          window.syncPlaneSelection(planeNumber);
        }
        
        // 자동으로 다음 페이지로 이동
        if (page === 'PAGE1') {
          return {
            selectedMiniPlanes: newSelected,
            currentPage: 'PAGE2'
          };
        } else if (page === 'PAGE2') {
          return {
            selectedMiniPlanes: newSelected,
            currentPage: 'PAGE3'
          };
        }
        
        return { selectedMiniPlanes: newSelected };
      }
      
      return state;
    });
  },

  // 미니 플레인이 선택되었는지 확인
  isMiniPlaneSelected: (planeNumber) => {
    return get().selectedMiniPlanes.has(planeNumber);
  },

  // 미니 플레인이 현재 선택 가능한지 확인
  isMiniPlaneSelectable: (planeNumber) => {
    const state = get();
    const page = getPageForPlane(planeNumber);
    
    // 현재 페이지의 플레인만 선택 가능
    if (page !== state.currentPage) return false;
    
    // 이미 선택된 플레인은 선택 해제 가능
    if (state.selectedMiniPlanes.has(planeNumber)) return true;
    
    // 같은 페이지에 이미 선택된 플레인이 있는지 확인
    const hasSelectionInPage = Array.from(state.selectedMiniPlanes).some(num => 
      getPageForPlane(num) === page
    );
    
    return !hasSelectionInPage;
  },

  // 애니메이션 단계 업데이트
  setAnimationStep: (step) => {
    set({ animationStep: step });
  },

  // 사용자 답변 업데이트
  setUserAnswer: (answer) => {
    set({ userAnswer: answer });
  }
})); 