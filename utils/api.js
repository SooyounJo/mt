// 계절감 매핑 (1-4)
const SEASON_MAPPING = {
  1: { prompt: "가을의 서정적인", bpm: 70, genre: "어쿠스틱" },
  2: { prompt: "봄의 산뜻한", bpm: 85, genre: "팝" },
  3: { prompt: "겨울의 차분한", bpm: 65, genre: "클래식" },
  4: { prompt: "여름의 활기찬", bpm: 95, genre: "댄스" }
};

// 날씨 매핑 (5-8)
const WEATHER_MAPPING = {
  5: { prompt: "눈 내리는", instruments: "피아노,스트링" },
  6: { prompt: "햇살 가득한", instruments: "어쿠스틱 기타,피아노" },
  7: { prompt: "바람 부는", instruments: "플룻,하프" },
  8: { prompt: "비 오는", instruments: "신디사이저,피아노" }
};

// 장소 매핑 (9-16)
const PLACE_MAPPING = {
  9: { prompt: "도시의 밤거리", mood: "몽환적인" },
  10: { prompt: "고요한 숲속", mood: "평화로운" },
  11: { prompt: "북적이는 카페", mood: "따뜻한" },
  12: { prompt: "한적한 해변", mood: "편안한" },
  13: { prompt: "산속 오두막", mood: "아늑한" },
  14: { prompt: "분주한 시장", mood: "활기찬" },
  15: { prompt: "고즈넉한 사원", mood: "명상적인" },
  16: { prompt: "열대 우림", mood: "신비로운" }
};

export async function generateMusic(selectedPlanes) {
  try {
    // 선택된 플레인들의 특성 조합
    const seasonPlane = selectedPlanes.find(num => num >= 1 && num <= 4);
    const weatherPlane = selectedPlanes.find(num => num >= 5 && num <= 8);
    const placePlane = selectedPlanes.find(num => num >= 9 && num <= 16);

    // 프롬프트 생성
    const seasonData = SEASON_MAPPING[seasonPlane] || {};
    const weatherData = WEATHER_MAPPING[weatherPlane] || {};
    const placeData = PLACE_MAPPING[placePlane] || {};

    const prompt = `
      ${seasonData.prompt || ''} 
      ${weatherData.prompt || ''} 
      ${placeData.prompt || ''} 
      분위기의 음악. 
      ${placeData.mood ? placeData.mood + ' 느낌으로. ' : ''}
      ${seasonData.genre ? seasonData.genre + ' 장르로. ' : ''}
      ${weatherData.instruments ? weatherData.instruments + '를 주요 악기로. ' : ''}
      BPM은 ${seasonData.bpm || 80}으로 설정.
      길이는 30초.
    `.trim().replace(/\s+/g, ' ');

    // API 호출 (실제 API 엔드포인트로 교체 필요)
    const response = await fetch('/api/generate-music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        duration: 30,
        bpm: seasonData.bpm || 80
      })
    });

    if (!response.ok) {
      throw new Error('음악 생성에 실패했습니다.');
    }

    const data = await response.json();
    return {
      audioUrl: data.audioUrl,
      prompt,
      characteristics: {
        season: seasonData,
        weather: weatherData,
        place: placeData
      }
    };
  } catch (error) {
    console.error('음악 생성 중 오류 발생:', error);
    throw error;
  }
} 