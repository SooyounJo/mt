import React, { useState } from 'react';
import First from './intro_component';
import { useRouter } from 'next/router';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const router = useRouter();

  const handleIntroSubmit = (info) => {
    // index.js로 바로 이동 (쿼리스트링 전달)
    router.push({
      pathname: '/',
      query: { name: info.name, destination: info.destination }
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showIntro && <First onSubmit={handleIntroSubmit} />}
    </div>
  );
}
