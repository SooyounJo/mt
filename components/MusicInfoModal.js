import { useEffect, useRef, useState } from 'react';
import styles from '../styles/MusicInfoModal.module.css';

const MusicInfoModal = ({ musicInfo, isOpen, onClose, onPlayStatusChange }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        onPlayStatusChange?.(false);
      });
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [musicInfo]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPlayStatusChange?.(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        onPlayStatusChange?.(true);
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !musicInfo) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        <div className={styles.content}>
          {/* 앨범 커버 */}
          <div className={styles.albumCover}>
            <img 
              src={musicInfo.cover_big || musicInfo.cover} 
              alt={`${musicInfo.album} cover`}
              className={styles.coverImage}
            />
            <div className={styles.playOverlay}>
              <button 
                className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                onClick={togglePlay}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>

          {/* 오른쪽 영역: 음악 정보 + 플레이어 */}
          <div className={styles.rightSection}>
            {/* 음악 정보 */}
            <div className={styles.musicInfo}>
              <h2 className={styles.title}>{musicInfo.title}</h2>
              <p className={styles.artist}>{musicInfo.artist}</p>
              <p className={styles.album}>{musicInfo.album}</p>
              
              {/* 검색 키워드 */}
              {musicInfo.searchKeywords && (
                <p className={styles.keywords}>
                  키워드: {musicInfo.searchKeywords}
                </p>
              )}
            </div>

          {/* 오디오 플레이어 */}
          <div className={styles.audioPlayer}>
            <audio
              ref={audioRef}
              src={musicInfo.preview}
              preload="metadata"
            />
            
            <div className={styles.progressContainer}>
              <div 
                className={styles.progressBar}
                onClick={handleSeek}
              >
                <div 
                  className={styles.progressFill}
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className={styles.timeInfo}>
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

            {/* 30초 미리듣기 안내 */}
            <p className={styles.previewNotice}>
              🎵 30초 미리듣기 제공
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicInfoModal;