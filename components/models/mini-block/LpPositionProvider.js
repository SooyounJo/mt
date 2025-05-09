import React, { createContext, useContext } from 'react';

const LpPositionContext = createContext({
  season: [-0.3, 0, 0.3],   // 좌측 위
  place: [0.3, 0, 0.3],     // 우측 위
  weather: [-0.3, 0, -0.3], // 좌측 아래
});

export function LpPositionProvider({ children, value }) {
  return (
    <LpPositionContext.Provider value={value || {
      season: [-0.3, -0.06, 0.3],
      place: [0.3, 0, 0.3],
      weather: [-0.3, 0, -0.3],
    }}>
      {children}
    </LpPositionContext.Provider>
  );
}

export function useLpPositions() {
  return useContext(LpPositionContext);
} 