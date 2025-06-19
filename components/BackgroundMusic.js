import { useEffect, useRef, useState } from 'react';

const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio('/mc.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    // 페이지 로드 시 자동 재생
    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('자동 재생이 차단되었습니다.');
      }
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // API 음성이 재생될 때 배경 음악 일시 중지
  const pauseBackgroundMusic = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  };

  // API 음성이 끝날 때 배경 음악 재생
  const resumeBackgroundMusic = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
    }
  };

  // 전역 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener('apiAudioStart', pauseBackgroundMusic);
    window.addEventListener('apiAudioEnd', resumeBackgroundMusic);

    return () => {
      window.removeEventListener('apiAudioStart', pauseBackgroundMusic);
      window.removeEventListener('apiAudioEnd', resumeBackgroundMusic);
    };
  }, [isPlaying]);

  return null;
};

export default BackgroundMusic; 