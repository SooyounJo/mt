import React, { useState, useEffect } from 'react';
import styles from './MusicModal.module.css';

export function MusicModal() {
  const [modalData, setModalData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleShowModal = (event) => {
      setModalData(event.detail);
      setIsVisible(true);
    };

    window.addEventListener('showMusicModal', handleShowModal);
    return () => window.removeEventListener('showMusicModal', handleShowModal);
  }, []);

  if (!isVisible || !modalData) return null;

  const { audioUrl, prompt, characteristics } = modalData;
  const { season, weather, place } = characteristics;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button 
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>

        <h2 className={styles.title}>생성된 음악</h2>
        
        <div className={styles.audioPlayer}>
          <audio controls src={audioUrl} autoPlay>
            브라우저가 오디오 재생을 지원하지 않습니다.
          </audio>
        </div>

        <div className={styles.characteristics}>
          <h3>음악 특성</h3>
          <ul>
            {season && (
              <li>
                <strong>계절감:</strong> {season.prompt}
                {season.genre && ` (${season.genre}, BPM ${season.bpm})`}
              </li>
            )}
            {weather && (
              <li>
                <strong>날씨:</strong> {weather.prompt}
                {weather.instruments && ` (${weather.instruments})`}
              </li>
            )}
            {place && (
              <li>
                <strong>장소:</strong> {place.prompt}
                {place.mood && ` (${place.mood})`}
              </li>
            )}
          </ul>
        </div>

        <div className={styles.prompt}>
          <h3>생성 프롬프트</h3>
          <p>{prompt}</p>
        </div>
      </div>
    </div>
  );
} 