import { useState, useEffect } from 'react';

/**
 * Window resize event를 감지하는 커스텀 훅
 * @returns {Object} width와 height 값을 포함한 객체
 */
const useResize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // resize 이벤트 핸들러
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 초기 사이즈 설정
    handleResize();

    // 클린업 함수
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useResize; 