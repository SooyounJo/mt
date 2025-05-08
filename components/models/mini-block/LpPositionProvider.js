import React, { createContext, useContext } from 'react';

const LpPositionContext = createContext({
  season: [-0.7, -0.06, 0.7],   // 좌측 위
  place: [0.7, -0.06, 0.7],     // 우측 위
  weather: [-0.7, -0.06, -0.7], // 좌측 아래
});

export function LpPositionProvider({ children, value }) {
  return (
    <LpPositionContext.Provider value={value || {
      season: [-0.7, 0-0.06, 0.7],
      place: [0.7, 0, 0.7],
      weather: [-0.7, 0, -0.7],
    }}>
      {children}
    </LpPositionContext.Provider>
  );
}

export function useLpPositions() {
  return useContext(LpPositionContext);
} 