import { useState, useEffect, useRef } from 'react';
import styles from '../styles/MusicModal.module.css';

export default function MusicModal({ audioUrl, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <div className={styles.playerContainer}>
          <audio ref={audioRef} src={audioUrl} />
          
          <div className={styles.controls}>
            <button 
              className={styles.playButton}
              onClick={togglePlay}
            >
              {isPlaying ? '일시정지' : '재생'}
            </button>
            
            <div className={styles.progressBar}>
              <div 
                className={styles.progress}
                style={{ width: `${(currentTime / 30) * 100}%` }}
              />
            </div>
            
            <div className={styles.timeDisplay}>
              {formatTime(currentTime)} / 0:30
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 