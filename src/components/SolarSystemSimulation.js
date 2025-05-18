import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import useSolarSystem from '../hooks/useSolarSystem';

// Main component rendering the simulation container and overlay instructions.
const SolarSystemSimulation = () => {
  const containerRef = useRef(null);
  const [timeScale, setTimeScale] = useState(1);
  const timeScaleRef = useRef(1);

  const [selectedBody, setSelectedBody] = useState(null);
  const selectedBodyRef = useRef(null);

  const celestialBodiesRef = useRef([]);
  const cameraPositionRef = useRef({
    rotateX: Math.PI / 2,
    rotateY: 0,
    cameraDistance: 70,
    panOffset: new THREE.Vector3(0, 0, 0),
  });

  const debugModeRef = useRef(false);
  const debugObjectsRef = useRef([]);
  const showPerformanceRef = useRef(false);
  const animationFrameRef = useRef(null);
  const highlightEffectRef = useRef(null);
  const savedSpeedRef = useRef(1);

  // Initialize the solar system simulation logic.
  useSolarSystem(
    containerRef,
    timeScale,
    timeScaleRef,
    savedSpeedRef,
    setTimeScale,
    selectedBodyRef,
    setSelectedBody,
    celestialBodiesRef,
    cameraPositionRef,
    debugModeRef,
    debugObjectsRef,
    showPerformanceRef,
    animationFrameRef,
    highlightEffectRef
  );

  return (
    <div className="w-full h-screen" ref={containerRef}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          margin: '4px',
          padding: '4px 6px',
          fontSize: '12px',
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: 'white',
          borderRadius: '3px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          Solar System Simulation
        </div>
        <div>• Left-click to select bodies</div>
        <div>• Right-click to pan</div>
        <div>• Wheel to zoom</div>
        <div>• Press 'D' debug / 'P' perf</div>
        <div>• Space to pause / +- to change speed</div>
      </div>
    </div>
  );
};

export default SolarSystemSimulation;
