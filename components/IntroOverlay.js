import React, { useState } from 'react';

export default function IntroOverlay({ onSubmit }) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && destination) {
      onSubmit({ name, destination });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.55)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <h1 style={{marginBottom: 16, color: '#fff', fontWeight: 700, fontSize: 128, letterSpacing: 1, textAlign: 'center'}}>memory tone</h1>
      <h3 style={{marginBottom: 32, color: '#fff', fontWeight: 600, fontSize: 18, textAlign: 'center'}}>여행을 기록하기 시작합니다</h3>
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '8px 4px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 110,
        marginLeft: 0
      }}>
        <label style={{marginBottom: 12, width: '100%', color: '#fff'}}>
          이름
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc'}} />
        </label>
        <label style={{marginBottom: 18, width: '100%', color: '#fff'}}>
          여행지
          <input type="text" value={destination} onChange={e => setDestination(e.target.value)} style={{width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc'}} />
        </label>
        <button type="submit" style={{padding: '10px 24px', borderRadius: 6, background: '#222', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer'}}>시작하기</button>
      </form>
    </div>
  );
} 