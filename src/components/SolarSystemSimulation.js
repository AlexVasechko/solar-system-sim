import React, { useRef, useEffect, useReducer, useCallback } from 'react';
import useSolarSystem from '../hooks/useSolarSystem';
import CelestialBodyInfoPanel from './CelestialBodyInfoPanel';
import ResetCameraButton from './ResetCameraButton';
import TimeScaleControls from './TimeScaleControls';
import InstructionsOverlay from './InstructionsOverlay';
import '../SolarSystemSimulation.css'; 
import * as THREE from 'three'; // For Vector3 in initial camera state

// Action Types
export const ACTION_TYPES = {
  SET_TIME_SCALE: 'SET_TIME_SCALE',
  SET_SELECTED_BODY: 'SET_SELECTED_BODY',
  TOGGLE_DEBUG_MODE: 'TOGGLE_DEBUG_MODE',
  TOGGLE_SHOW_PERFORMANCE: 'TOGGLE_SHOW_PERFORMANCE',
  SET_SAVED_SPEED: 'SET_SAVED_SPEED',
};

// Initial State
const initialState = {
  timeScale: 1,
  selectedBody: null,
  debugMode: false,
  showPerformance: false,
  savedSpeed: 1, 
};

// Reducer Function
function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_TIME_SCALE:
      return { ...state, timeScale: action.payload };
    case ACTION_TYPES.SET_SELECTED_BODY:
      return { ...state, selectedBody: action.payload };
    case ACTION_TYPES.TOGGLE_DEBUG_MODE:
      return { ...state, debugMode: !state.debugMode };
    case ACTION_TYPES.TOGGLE_SHOW_PERFORMANCE:
      return { ...state, showPerformance: !state.showPerformance };
    case ACTION_TYPES.SET_SAVED_SPEED:
      return { ...state, savedSpeed: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

const SolarSystemSimulation = () => {
  const [simulationState, dispatch] = useReducer(reducer, initialState);
  
  const containerRef = useRef(null);
  
  // Refs that will be synchronized with simulationState
  const timeScaleRef = useRef(simulationState.timeScale);
  const selectedBodyRef = useRef(simulationState.selectedBody);
  const debugModeRef = useRef(simulationState.debugMode);
  const showPerformanceRef = useRef(simulationState.showPerformance);
  const savedSpeedRef = useRef(simulationState.savedSpeed);

  // Ref for camera position, managed by useCameraControls via useSolarSystem
  const cameraPositionRef = useRef({
    rotateX: Math.PI / 2,
    rotateY: 0,
    cameraDistance: 70,
    panOffset: new THREE.Vector3(0, 0, 0),
  });
  
  const celestialBodiesRef = useRef([]); 
  const highlightEffectRef = useRef(null); 
  const debugObjectsRef = useRef([]); 

  // Synchronize refs with state changes from reducer
  useEffect(() => { timeScaleRef.current = simulationState.timeScale; }, [simulationState.timeScale]);
  useEffect(() => { selectedBodyRef.current = simulationState.selectedBody; }, [simulationState.selectedBody]);
  useEffect(() => { debugModeRef.current = simulationState.debugMode; }, [simulationState.debugMode]);
  useEffect(() => { showPerformanceRef.current = simulationState.showPerformance; }, [simulationState.showPerformance]);
  useEffect(() => { savedSpeedRef.current = simulationState.savedSpeed; }, [simulationState.savedSpeed]);

  // useSolarSystem now returns the reset function for the camera.
  const { resetCameraApp } = useSolarSystem(
    containerRef,
    simulationState.timeScale, 
    timeScaleRef,        
    savedSpeedRef,
    selectedBodyRef,
    dispatch, // Pass the main dispatch function
    celestialBodiesRef,
    cameraPositionRef,
    debugModeRef,
    debugObjectsRef,
    showPerformanceRef,
    highlightEffectRef
    // resetCameraCallback prop is removed as useSolarSystem now returns the reset function.
  );
  
  const handleResetButtonClick = () => {
    if (resetCameraApp) {
      resetCameraApp();
    }
  };

  return (
    <div ref={containerRef} className="solar-system-container" style={{ position: 'relative' }}>
      <InstructionsOverlay />
      <CelestialBodyInfoPanel selectedBody={simulationState.selectedBody} />
      <ResetCameraButton onClick={handleResetButtonClick} /> 
      <TimeScaleControls 
        timeScale={simulationState.timeScale} 
        onTimeScaleChange={(speed) => dispatch({ type: ACTION_TYPES.SET_TIME_SCALE, payload: speed })} 
      />
    </div>
  );
};

export default SolarSystemSimulation;
