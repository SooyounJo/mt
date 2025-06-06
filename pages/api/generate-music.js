const STABLE_AUDIO_API_KEY = process.env.NEXT_PUBLIC_STABLE_AUDIO_API_KEY;
const API_ENDPOINT = 'https://api.stability.ai/v2/generation/stable-audio/text-to-audio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않는 메소드입니다.' });
  }

  if (!STABLE_AUDIO_API_KEY) {
    console.error('API 키가 설정되지 않음');
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.' });
  }

  try {
    const { seasonCode, weatherCode, placeCode } = req.body;

    if (!seasonCode || !weatherCode || !placeCode) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    // 먼저 API 키가 유효한지 확인
    const checkResponse = await fetch('https://api.stability.ai/v1/user/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STABLE_AUDIO_API_KEY}`
      }
    });

    if (!checkResponse.ok) {
      console.error('API 키 확인 오류:', await checkResponse.text());
      if (checkResponse.status === 401) {
        return res.status(401).json({ error: 'API 키가 유효하지 않습니다.' });
      }
      if (checkResponse.status === 403) {
        return res.status(403).json({ error: '크레딧이 부족합니다.' });
      }
      return res.status(500).json({ error: 'API 상태를 확인할 수 없습니다.' });
    }

    const formData = new FormData();
    formData.append('prompt', `Create a relaxing music for ${seasonCode} season with ${weatherCode} weather at ${placeCode}.`);
    formData.append('duration', '30');
    formData.append('seed', Math.floor(Math.random() * 4294967294).toString());
    formData.append('steps', '50');
    formData.append('cfg_scale', '7');
    formData.append('output_format', 'mp3');

    // Stable Audio API 호출
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABLE_AUDIO_API_KEY}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    // 응답 타입 확인 및 처리
    const contentType = response.headers.get('content-type');
    let data;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Raw API 응답:', text);
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('응답 파싱 오류:', e);
          throw new Error('API 응답을 파싱할 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('응답 처리 오류:', error);
      
      // 특정 에러 상태에 따른 처리
      if (response.status === 402) {
        return res.status(402).json({ error: '크레딧이 부족합니다.' });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: '너무 많은 요청이 발생했습니다.' });
      }
      if (response.status === 401) {
        return res.status(401).json({ error: 'API 키가 유효하지 않습니다.' });
      }
      if (response.status === 403) {
        return res.status(403).json({ error: '크레딧이 부족하거나 API 접근 권한이 없습니다.' });
      }
      
      return res.status(500).json({ 
        error: '서버 응답을 처리할 수 없습니다.',
        details: error.message
      });
    }

    if (!response.ok) {
      console.error('API 오류 응답:', data);
      return res.status(response.status).json({ 
        error: data?.message || '음악 생성 중 오류가 발생했습니다.',
        details: data
      });
    }

    // 오디오 데이터 확인 및 변환
    if (!data.audio) {
      console.error('오디오 데이터 없음:', data);
      return res.status(500).json({ error: '생성된 오디오를 찾을 수 없습니다.' });
    }

    const audioUrl = `data:audio/mp3;base64,${data.audio}`;
    return res.status(200).json({ audioUrl });
  } catch (error) {
    console.error('음악 생성 중 오류:', error);
    return res.status(500).json({ 
      error: error.message || '알 수 없는 오류가 발생했습니다.',
      details: error.stack
    });
  }
} 