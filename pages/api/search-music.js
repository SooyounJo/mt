// Deezer API를 사용한 음악 검색
export default async function handler(req, res) {
  // GET 요청 시 API 상태 확인
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Music Search API is working!', 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { keywords, destination } = req.body;

    // 한국어 키워드를 영어 음악 장르/무드로 변환
    const keywordMapping = {
      '가을': ['autumn', 'fall', 'mellow', 'acoustic'],
      '봄': ['spring', 'fresh', 'happy', 'upbeat'],
      '겨울': ['winter', 'chill', 'ambient', 'calm'],
      '여름': ['summer', 'tropical', 'beach', 'pop'],
      '눈': ['snow', 'peaceful', 'ambient'],
      '맑음': ['sunny', 'bright', 'happy', 'pop'],
      '바람': ['wind', 'folk', 'indie'],
      '비': ['rain', 'sad', 'ballad', 'piano'],
      '도시': ['city', 'urban', 'electronic', 'pop'],
      '자연': ['nature', 'folk', 'acoustic', 'indie'],
      '해변': ['beach', 'tropical', 'reggae', 'pop'],
      '역사': ['classical', 'instrumental', 'traditional'],
      '종교': ['spiritual', 'gospel', 'classical'],
      '사막': ['ambient', 'world', 'ethnic'],
      '박물관': ['classical', 'instrumental', 'ambient'],
      '축제': ['festival', 'party', 'dance', 'pop']
    };

    // 영어 키워드들로 변환
    const englishKeywords = [];
    keywords.forEach(keyword => {
      const mapped = keywordMapping[keyword];
      if (mapped) {
        englishKeywords.push(...mapped);
      } else {
        englishKeywords.push(keyword); // 이미 영어인 경우
      }
    });

    // 중복 제거하고 상위 3개만 선택
    const uniqueKeywords = [...new Set(englishKeywords)].slice(0, 3);
    
    // travel, music 등의 일반적인 키워드 추가
    const searchQuery = [...uniqueKeywords, 'music', 'travel'].join(' ');
    
    console.log('🎵 원본 키워드:', keywords);
    console.log('🎵 변환된 키워드:', uniqueKeywords);
    console.log('🎵 최종 검색 쿼리:', searchQuery);

    // Deezer API 호출
    const deezerResponse = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=20`,
      {
        headers: {
          'User-Agent': 'ConMid-Music-Search/1.0'
        }
      }
    );

    if (!deezerResponse.ok) {
      console.error('Deezer API 호출 실패:', deezerResponse.status);
      throw new Error('Deezer API 호출 실패');
    }

    const data = await deezerResponse.json();
    console.log('🎵 Deezer 응답 데이터 수:', data.data?.length || 0);
    
    // 미리듣기 URL이 있는 트랙만 필터링
    const validTracks = data.data?.filter(track => track.preview) || [];
    console.log('🎵 유효한 트랙 수:', validTracks.length);

    if (validTracks.length === 0) {
      // 백업 검색: 더 일반적인 키워드로 재시도
      console.log('🎵 백업 검색 시도...');
      const fallbackQuery = 'chill music travel';
      const fallbackResponse = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(fallbackQuery)}&limit=20`
      );
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const fallbackTracks = fallbackData.data?.filter(track => track.preview) || [];
        
        if (fallbackTracks.length > 0) {
          const selectedTrack = fallbackTracks[0];
          return res.status(200).json({
            id: selectedTrack.id,
            title: selectedTrack.title,
            artist: selectedTrack.artist.name,
            album: selectedTrack.album.title,
            duration: selectedTrack.duration,
            preview: selectedTrack.preview,
            cover: selectedTrack.album.cover_medium,
            cover_big: selectedTrack.album.cover_big,
            artist_picture: selectedTrack.artist.picture_medium,
            searchKeywords: fallbackQuery,
            isFallback: true
          });
        }
      }
      
      return res.status(404).json({ message: '검색된 음악이 없습니다.' });
    }

    // 랜덤하게 하나 선택 (상위 5개 중에서)
    const selectedTrack = validTracks[Math.floor(Math.random() * Math.min(validTracks.length, 5))];

    const musicData = {
      id: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist.name,
      album: selectedTrack.album.title,
      duration: selectedTrack.duration,
      preview: selectedTrack.preview,
      cover: selectedTrack.album.cover_medium,
      cover_big: selectedTrack.album.cover_big,
      artist_picture: selectedTrack.artist.picture_medium,
      searchKeywords: searchQuery,
      originalKeywords: keywords
    };

    console.log('🎵 선택된 음악:', musicData.title, 'by', musicData.artist);

    res.status(200).json(musicData);

  } catch (error) {
    console.error('음악 검색 오류:', error);
    res.status(500).json({ 
      message: '음악 검색 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
} 