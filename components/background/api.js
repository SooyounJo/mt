// 앨범 상태 관리를 위한 전역 객체
let albumState = {
  currentStep: 0,
  isAnimating: false,
  currentSet: 1,
  canGoNext: true,
  canGoPrevious: false
};

// 앨범 이벤트 리스너 관리
const listeners = new Set();

// 상태 변경 알림 함수
const notifyListeners = () => {
  listeners.forEach(listener => listener(albumState));
};

// 앨범 API 객체
export const AlbumAPI = {
  // 상태 구독
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // 현재 상태 가져오기
  getState: () => ({ ...albumState }),

  // 다음 페이지로 이동
  turnPage: () => {
    if (!albumState.canGoNext || albumState.isAnimating) return false;
    
    albumState.isAnimating = true;
    
    // 첫 번째 세트에서 두 번째 세트로
    if (albumState.currentStep === 0) {
      albumState.currentSet = 1;
      albumState.currentStep = 1;
      albumState.canGoPrevious = true;
    }
    // 두 번째 세트 활성화
    else if (albumState.currentStep === 1) {
      albumState.currentSet = 2;
      albumState.currentStep = 2;
      albumState.canGoNext = false;
    }
    
    notifyListeners();
    return true;
  },

  // 이전 페이지로 이동
  goToPrevious: () => {
    if (!albumState.canGoPrevious || albumState.isAnimating) return false;
    
    albumState.isAnimating = true;
    
    // 두 번째 세트에서 첫 번째 세트로
    if (albumState.currentStep === 2) {
      albumState.currentSet = 2;
      albumState.currentStep = 1;
      albumState.canGoNext = true;
    }
    // 첫 번째 세트로 돌아가기
    else if (albumState.currentStep === 1) {
      albumState.currentSet = 1;
      albumState.currentStep = 0;
      albumState.canGoPrevious = false;
      albumState.canGoNext = true;
    }
    
    notifyListeners();
    return true;
  },

  // 애니메이션 완료 처리
  completeAnimation: () => {
    albumState.isAnimating = false;
    notifyListeners();
  },

  // 앨범 상태 초기화
  reset: () => {
    albumState = {
      currentStep: 0,
      isAnimating: false,
      currentSet: 1,
      canGoNext: true,
      canGoPrevious: false
    };
    notifyListeners();
  },

  // React 훅에서 사용할 수 있는 상태 구독 함수
  useAlbumState: () => {
    const [state, setState] = React.useState(albumState);

    React.useEffect(() => {
      const unsubscribe = AlbumAPI.subscribe(newState => {
        setState({ ...newState });
      });
      return unsubscribe;
    }, []);

    return state;
  }
};

// 전역에서 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.AlbumAPI = AlbumAPI;
} 