import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const apiKey = process.env.STABILITY_API_KEY;
    console.log(apiKey);
    if (!apiKey) {
    
      throw new Error('API 키가 설정되지 않았습니다. 관리자에게 문의해주세요.');
    }

    const { seasonCode, weatherCode, placeCode } = await req.json();

    // 프롬프트 생성 - 더 자세한 음악 설명 추가
    const prompt = `Create a ${seasonCode} themed music with ${weatherCode} weather atmosphere in a ${placeCode} setting. 
    The music should be ambient and atmospheric, with natural sounds and instruments that reflect the environment. 
    Include subtle ${weatherCode} sound effects and ${seasonCode} characteristic elements. 
    The overall mood should match the ${placeCode} atmosphere.`;

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('duration', '60');    // 1분
    formData.append('steps', '50');       // 기본값
    formData.append('cfg_scale', '7');    // 기본값
    formData.append('output_format', 'mp3');

    const response = await fetch('https://api.stability.ai/v2/generation/stable-audio/text-to-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
        'Accept': 'audio/*'
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API 오류:', error);
      
      // 특정 에러 상태에 따른 처리
      if (response.status === 402) {
        throw new Error('크레딧이 부족합니다. 크레딧을 충전해주세요.');
      } else if (response.status === 429) {
        throw new Error('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (response.status === 401) {
        throw new Error('API 키가 유효하지 않습니다. 관리자에게 문의해주세요.');
      } else if (response.status === 403) {
        throw new Error('크레딧이 부족하거나 API 접근 권한이 없습니다.');
      }
      
      throw new Error(error.message || '음악 생성 중 오류가 발생했습니다.');
    }

    // 오디오 데이터를 Base64로 인코딩
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return new NextResponse(JSON.stringify({
      audioUrl: `data:audio/mp3;base64,${base64Audio}`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('음악 생성 오류:', error);
    
    return new NextResponse(JSON.stringify({
      error: error.message || '음악 생성 중 오류가 발생했습니다.'
    }), {
      status: error.status || 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 