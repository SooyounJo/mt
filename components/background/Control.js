import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';


const IS_TESTING = false;

export default function Control({ enablePan = true, enableZoom = true, enableRotate = true }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  // 각도(도), 높이, 거리 상태 추가
  const [angle, setAngle] = useState(90);
  const [height, setHeight] = useState(7); 
  const [distance, setDistance] = useState(6); 

 
  const target = [1.5, 1, -4 - 3];

  useEffect(() => {
    
    const rad = (angle * Math.PI) / 180;
   
    const x = target[0] + distance * Math.cos(rad);
    const z = target[2] + distance * Math.sin(rad);
    camera.position.set(x, height, z);
    camera.fov = 15;
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(...target);
      controlsRef.current.update();
    }
  }, [camera, angle, height, distance]);


  return (
    <>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1001,
        background: 'rgba(255,255,255,0.85)',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: 14
      }}>
        <div>
          <label>Y축 각도: {angle}°</label>
          <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(Number(e.target.value))} />
        </div>
        <div>
          <label>높이(y): {height}</label>
          <input type="range" min="3" max="12" step="0.1" value={height} onChange={e => setHeight(Number(e.target.value))} />
        </div>
        <div>
          <label>거리: {distance}</label>
          <input type="range" min="3" max="15" step="0.1" value={distance} onChange={e => setDistance(Number(e.target.value))} />
        </div>
      </div>
      <OrbitControls
        ref={controlsRef}
        args={[camera, gl.domElement]}
        enablePan={enablePan}
        enableZoom={enableZoom}
        enableRotate={enableRotate}
        minDistance={2}
        maxDistance={40}
        rotateSpeed={0.5}
        dampingFactor={0.05}

        //enabled={IS_TESTING}
      />
    </>
  );
}
