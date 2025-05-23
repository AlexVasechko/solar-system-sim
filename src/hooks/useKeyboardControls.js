import { useEffect, useCallback } from 'react';
import processKey from '../utils/keyboardProcessor'; 
import * as THREE from 'three'; 
import { ACTION_TYPES } from '../components/SolarSystemSimulation'; // Import ACTION_TYPES

export default function useKeyboardControls(
  debugModeRef,
  showPerformanceRef,
  timeScaleRef,
  savedSpeedRef,
  // setTimeScale, // Replaced by dispatch
  dispatch, // Added dispatch
  resetCameraFunction, 
  containerRef,       
  scene,              
  debugObjectsRef     
) {
  const handleKeyboardControls = useCallback((e) => {
    const targetTagName = e.target.tagName.toLowerCase();
    const isInputElement = targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select' || e.target.isContentEditable;

    if ([' ', '+', '=', '-', '_', 'r', 'd', 'p'].includes(e.key.toLowerCase()) || 
        ['Space', 'NumpadAdd', 'NumpadSubtract'].includes(e.code) ) {
      if (!isInputElement) {
        e.preventDefault();
      }
    }
    // Allow typing in input fields without triggering controls unless it's Escape or Enter (handled by processKey)
    if (isInputElement && !['Escape', 'Enter'].includes(e.key)) {
        return;
    }


    const prevState = {
      debugMode: debugModeRef.current,
      showPerformance: showPerformanceRef.current,
      timeScale: timeScaleRef.current,
      savedSpeed: savedSpeedRef.current,
    };

    const newState = processKey(prevState, { key: e.key, code: e.code });

    // Update refs and dispatch actions based on newState
    if (debugModeRef && debugModeRef.current !== newState.debugMode) {
      dispatch({ type: ACTION_TYPES.TOGGLE_DEBUG_MODE }); 
      // debugModeRef.current will be updated by useEffect in SolarSystemSimulation
    }
    if (showPerformanceRef && showPerformanceRef.current !== newState.showPerformance) {
      dispatch({ type: ACTION_TYPES.TOGGLE_SHOW_PERFORMANCE });
      // showPerformanceRef.current will be updated by useEffect in SolarSystemSimulation
    }
    
    if (timeScaleRef && timeScaleRef.current !== newState.timeScale) {
      dispatch({ type: ACTION_TYPES.SET_TIME_SCALE, payload: newState.timeScale });
      // timeScaleRef.current will be updated by useEffect in SolarSystemSimulation
    }

    if (savedSpeedRef && savedSpeedRef.current !== newState.savedSpeed) {
        dispatch({ type: ACTION_TYPES.SET_SAVED_SPEED, payload: newState.savedSpeed });
        // savedSpeedRef.current will be updated by useEffect in SolarSystemSimulation
    }
    
    // Handle debug mode visual changes (e.g., adding/removing AxesHelper)
    if (newState.debugMode !== prevState.debugMode) {
      if (newState.debugMode) {
        if (scene && debugObjectsRef && !debugObjectsRef.current.find(obj => obj.type === "AxesHelper")) {
          const axesHelper = new THREE.AxesHelper(100); 
          scene.add(axesHelper);
          debugObjectsRef.current.push(axesHelper);
        }
      } else {
        if (scene && debugObjectsRef) {
          debugObjectsRef.current.forEach(obj => scene.remove(obj));
          debugObjectsRef.current = [];
        }
        const debugInfoEl = document.getElementById('debug-info'); 
        if (debugInfoEl?.parentNode) debugInfoEl.parentNode.removeChild(debugInfoEl);
      }
    }

    // Handle performance display changes
    // This DOM manipulation ideally should be a React component, but for now, keep as is if it works.
    if (newState.showPerformance !== prevState.showPerformance) {
      let perfDisplay = document.getElementById('performance-stats');
      if (newState.showPerformance) {
        if (!perfDisplay && containerRef?.current) { 
          perfDisplay = document.createElement('div');
          perfDisplay.id = 'performance-stats';
          Object.assign(perfDisplay.style, {
            position: 'absolute', top: '10px', right: '10px', 
            backgroundColor: 'rgba(0,0,0,0.7)', color: '#0f0', 
            padding: '5px 10px', borderRadius: '4px', 
            fontFamily: 'monospace', zIndex: '1000'
          });
          perfDisplay.textContent = 'FPS: --';
          containerRef.current.appendChild(perfDisplay);
        } else if (perfDisplay) {
          perfDisplay.style.display = 'block';
        }
      } else if (perfDisplay) {
        perfDisplay.style.display = 'none';
      }
    }

    if (e.key.toLowerCase() === 'r' && resetCameraFunction) {
      resetCameraFunction();
    }
  }, [
    debugModeRef, showPerformanceRef, timeScaleRef, savedSpeedRef, 
    dispatch, resetCameraFunction, containerRef, scene, debugObjectsRef
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardControls);
    return () => {
      window.removeEventListener('keydown', handleKeyboardControls);
      // Cleanup debug objects and performance display if they were managed here
      // This cleanup is a bit tricky if elements are appended to containerRef outside React's lifecycle.
      // For now, assuming debug objects are the primary concern for this hook's direct cleanup.
      if (debugObjectsRef?.current && scene) {
        debugObjectsRef.current.forEach(obj => scene.remove(obj));
        debugObjectsRef.current = [];
      }
      // Performance display is harder to clean up here if containerRef can be different or unmount separately.
      // It's generally better practice for such DOM elements to be React components.
    };
  }, [handleKeyboardControls, debugObjectsRef, scene, containerRef]); // Added missing dependencies
}
