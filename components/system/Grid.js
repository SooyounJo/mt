import React from 'react';

const Grid = ({ mousePosition }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      <div>X: {mousePosition.x}</div>
      <div>Y: {mousePosition.y}</div>
      <div>Z: {mousePosition.z}</div>
    </div>
  );
};

export default Grid; 