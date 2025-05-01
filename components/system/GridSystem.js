import React from 'react';
import { Grid } from '@react-three/drei';

const GridSystem = () => {
  return (
    <Grid
      args={[10, 10]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#6f6f6f"
      sectionSize={3.3}
      sectionThickness={1}
      sectionColor="#9d4b4b"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  );
};

export default GridSystem; 