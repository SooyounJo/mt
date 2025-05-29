import { create } from 'zustand';

// 페이지 정의
export const PAGES = {
  PAGE1: { name: '1페이지', range: { start: 1, end: 4 } },
  PAGE2: { name: '2페이지', range: { start: 5, end: 8 } },
  PAGE3: { name: '3페이지', range: { start: 9, end: 16 } },
  PAGE4: { name: '4페이지', range: { start: 17, end: 20 } }
};

// 페이지별 고정 위치
const PAGE_POSITIONS = {
  PAGE1: [-5.8, -3.6, 8.2],
  PAGE2: [-5.5, -3.7, 9.0],
  PAGE3: [-5.0, -3.6, 8.2],
  PAGE4: [-4.6, -3.6, 8.2]
};

// 페이지 순서
const PAGE_ORDER = ['PAGE1', 'PAGE2', 'PAGE3', 'PAGE4'];

// 유틸리티 함수
export const getNextPage = (currentPage) => {
  const currentIndex = PAGE_ORDER.indexOf(currentPage);
  return currentIndex < PAGE_ORDER.length - 1 ? PAGE_ORDER[currentIndex + 1] : null;
};

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
    PAGE3: null,
    PAGE4: null
  },
  isAnimating: false,

  // 선택 가능 여부 확인
  isPlaneSelectable: (planeNumber) => {
    const { currentPage, selectedPlanes } = get();
    const currentPageData = PAGES[currentPage];
    const planePage = getPageForPlane(planeNumber);

    // 현재 페이지의 플레인만 선택 가능
    if (planePage !== currentPage) return false;

    // 이미 선택된 플레인은 선택 불가
    const allSelectedPlanes = Object.values(selectedPlanes).filter(Boolean);
    if (allSelectedPlanes.includes(planeNumber)) return false;

    return planeNumber >= currentPageData.range.start && 
           planeNumber <= currentPageData.range.end;
  },

  // Plane 선택
  selectPlane: (planeNumber) => {
    const { currentPage, selectedPlanes, isPlaneSelectable } = get();
    
    if (!isPlaneSelectable(planeNumber)) return;

    // 현재 페이지의 선택만 업데이트
    const newSelectedPlanes = {
      ...selectedPlanes,
      [currentPage]: planeNumber
    };

    set({ 
      selectedPlanes: newSelectedPlanes,
      isAnimating: true 
    });

    // 다음 페이지로 진행
    setTimeout(() => {
      const nextPage = getNextPage(currentPage);
      if (nextPage) {
        set({ currentPage: nextPage, isAnimating: false });
      } else {
        if (window.AlbumPageControl) {
          window.AlbumPageControl.turnPage();
        }
        set({ isAnimating: false });
      }
    }, 500);
  },

  // Plane의 목표 위치 가져오기
  getTargetPosition: (planeNumber) => {
    const { selectedPlanes } = get();
    
    // 선택된 플레인의 페이지 찾기
    const selectedPage = Object.entries(selectedPlanes).find(
      ([_, selectedNumber]) => selectedNumber === planeNumber
    )?.[0];

    // 선택되지 않은 플레인은 null 반환 (원래 위치 유지)
    if (!selectedPage) return null;

    // 해당 페이지의 고정 위치 반환
    return PAGE_POSITIONS[selectedPage];
  },

  // 플레인이 선택되어 있는지 확인
  isPlaneSelected: (planeNumber) => {
    const { selectedPlanes } = get();
    return Object.values(selectedPlanes).includes(planeNumber);
  },

  // 현재 페이지 번호 범위 가져오기
  getCurrentPageRange: () => {
    const { currentPage } = get();
    return PAGES[currentPage].range;
  },

  // 플레인이 독립적으로 동작해야 하는지 확인
  shouldActIndependently: (planeNumber) => {
    const { selectedPlanes } = get();
    return Object.values(selectedPlanes).includes(planeNumber);
  }
})); 