import React from 'react';
import { EffectComposer, SMAA } from '@react-three/postprocessing';

export default function Filter() {
  return (
    <EffectComposer>
      <SMAA />
    </EffectComposer>
  );
} 