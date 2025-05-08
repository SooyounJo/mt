import React, { useState } from 'react';
import SeasonPart from './SeasonParts';

const Season = ({ visible = true, onDragStart, onDragEnd, onDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [partsOnLP, setPartsOnLP] = useState({
    Spring: false,
    Summer: false,
    Fall: false,
    Winter: false
  });

  const handlePartDrop = (partName, isOnLP) => {
    setPartsOnLP(prev => ({
      ...prev,
      [partName]: isOnLP
    }));
    if (onDrop) onDrop(isOnLP);
  };

  return (
    <group>
      <SeasonPart
        partName="Spring"
        visible={visible}
        onDragStart={() => {
          setIsDragging(true);
          if (onDragStart) onDragStart();
        }}
        onDragEnd={() => {
          setIsDragging(false);
          if (onDragEnd) onDragEnd();
        }}
        onDrop={(isOnLP) => handlePartDrop('Spring', isOnLP)}
        originalPosition={[-2, 0, 0]}
        isOnLP={partsOnLP.Spring}
        setIsOnLP={(value) => setPartsOnLP(prev => ({ ...prev, Spring: value }))}
      />

      <SeasonPart
        partName="Summer"
        visible={visible}
        onDragStart={() => {
          setIsDragging(true);
          if (onDragStart) onDragStart();
        }}
        onDragEnd={() => {
          setIsDragging(false);
          if (onDragEnd) onDragEnd();
        }}
        onDrop={(isOnLP) => handlePartDrop('Summer', isOnLP)}
        originalPosition={[-1, 0, 0]}
        isOnLP={partsOnLP.Summer}
        setIsOnLP={(value) => setPartsOnLP(prev => ({ ...prev, Summer: value }))}
      />

      <SeasonPart
        partName="Fall"
        visible={visible}
        onDragStart={() => {
          setIsDragging(true);
          if (onDragStart) onDragStart();
        }}
        onDragEnd={() => {
          setIsDragging(false);
          if (onDragEnd) onDragEnd();
        }}
        onDrop={(isOnLP) => handlePartDrop('Fall', isOnLP)}
        originalPosition={[0, 0, 0]}
        isOnLP={partsOnLP.Fall}
        setIsOnLP={(value) => setPartsOnLP(prev => ({ ...prev, Fall: value }))}
      />

      <SeasonPart
        partName="Winter"
        visible={visible}
        onDragStart={() => {
          setIsDragging(true);
          if (onDragStart) onDragStart();
        }}
        onDragEnd={() => {
          setIsDragging(false);
          if (onDragEnd) onDragEnd();
        }}
        onDrop={(isOnLP) => handlePartDrop('Winter', isOnLP)}
        originalPosition={[1, 0, -3]}
        isOnLP={partsOnLP.Winter}
        setIsOnLP={(value) => setPartsOnLP(prev => ({ ...prev, Winter: value }))}
      />
    </group>
  );
};

export default Season;
