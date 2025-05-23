// This hook contains the heavy initialization and animation logic for the
// solar system scene. Splitting it into its own module keeps the main React
// component concise and easier to maintain.
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
// processKey is now used by useKeyboardControls
import planetsDataImport from '../data/planets';
import moonsDataImport from '../data/moons';
import useThreeSetup from './useThreeSetup';
import useCelestialObjects from './useCelestialObjects';
import useCameraControls from './useCameraControls';
import useObjectSelection from './useObjectSelection'; 
import useAnimationLoop from './useAnimationLoop'; 
import useKeyboardControls from './useKeyboardControls'; 

export default function useSolarSystem(
  containerRef,
  timeScale, // Current value from reducer state
  timeScaleRef,
  savedSpeedRef,
  // setTimeScale, // Replaced by dispatch
  selectedBodyRef, // Ref for current selected body data
  // setSelectedBody, // Replaced by dispatch
  dispatch, // Added dispatch
  celestialBodiesRef,
  cameraPositionRef, 
  debugModeRef,
  debugObjectsRef,
  showPerformanceRef,
  // animationFrameRef, // Managed by useAnimationLoop
  highlightEffectRef,
  resetCameraCallback 
) {
  const { scene, camera, renderer } = useThreeSetup(containerRef);
  
  const [simulationObjects, setSimulationObjects] = useState({
    sunObject: null,
    celestialBodies: [],
    allBodies: [],
    orbitLabels: [],
  });

  const objectCreatorOutput = useCelestialObjects(scene, planetsDataImport, moonsDataImport, celestialBodiesRef);

  useEffect(() => {
    if (objectCreatorOutput.sunObject) {
      setSimulationObjects({
        sunObject: objectCreatorOutput.sunObject,
        celestialBodies: objectCreatorOutput.createdCelestialBodies,
        allBodies: objectCreatorOutput.createdAllBodies,
        orbitLabels: objectCreatorOutput.createdOrbitLabels,
      });
    }
  }, [objectCreatorOutput]);
  
  const initialCameraStaticPos = useRef({
    rotateX: Math.PI / 2,
    rotateY: 0,
    cameraDistance: 70,
    panOffset: new THREE.Vector3(0, 0, 0),
  }).current;

  useEffect(() => {
      if (cameraPositionRef.current && typeof cameraPositionRef.current.cameraDistance === 'undefined') { 
          cameraPositionRef.current = { 
              ...initialCameraStaticPos, 
              panOffset: initialCameraStaticPos.panOffset.clone() 
          };
      }
  }, [cameraPositionRef, initialCameraStaticPos]);

  const { 
    resetCamera: resetCameraViaControls, 
    updateCameraPosition: updateCameraViaControls 
  } = useCameraControls(
    camera,
    renderer?.domElement, 
    cameraPositionRef,    
    selectedBodyRef,
    initialCameraStaticPos 
  );
  
  useEffect(() => {
    if (updateCameraViaControls) {
        updateCameraViaControls();
    }
  }, [cameraPositionRef, updateCameraViaControls]);

  useObjectSelection(
    camera,
    renderer?.domElement,
    simulationObjects.allBodies, 
    highlightEffectRef,
    selectedBodyRef,
    dispatch, // Pass dispatch
    planetsDataImport,
    moonsDataImport,
    simulationObjects.sunObject 
  );

  useAnimationLoop(
    scene, camera, renderer, simulationObjects, 
    simulationObjects.orbitLabels, timeScaleRef, selectedBodyRef, 
    highlightEffectRef, showPerformanceRef, cameraPositionRef, 
    celestialBodiesRef, planetsDataImport, moonsDataImport, 
    containerRef, updateCameraViaControls
  );

  useKeyboardControls(
    debugModeRef,
    showPerformanceRef,
    timeScaleRef,
    savedSpeedRef,
    dispatch, // Pass dispatch
    resetCameraViaControls, 
    containerRef, 
    scene,        
    debugObjectsRef
  );

  const sceneInitializedRef = useRef(false);
  const prevRendererInstanceRef = useRef(null); 
  const animationFrameIdRef = useRef(null); // Local ref for animation frame ID for this hook if needed

  useEffect(() => {
    if (!scene || !camera || !renderer || !simulationObjects.sunObject ) {
      sceneInitializedRef.current = false;
      if (updateCameraViaControls) updateCameraViaControls(); 
      return; 
    }
    
    if (sceneInitializedRef.current && renderer === prevRendererInstanceRef.current) {
        if (updateCameraViaControls) updateCameraViaControls(); 
        return;
    }
    sceneInitializedRef.current = true;
    prevRendererInstanceRef.current = renderer; 

    timeScaleRef.current = timeScale; // Sync timeScale prop with ref used by animation loop
    
    const createHighlightEffect = () => {
      const highlightGeometry = new THREE.SphereGeometry(1, 32, 32);
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, transparent: true, opacity: 0.3, side: THREE.BackSide,
      });
      const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
      highlightMesh.visible = false;
      scene.add(highlightMesh);
      return highlightMesh;
    };

    if (!highlightEffectRef.current && scene) { 
        highlightEffectRef.current = createHighlightEffect();
    }
    
    // Initial call to ensure camera position is correctly set up by useCameraControls
    if (updateCameraViaControls) updateCameraViaControls(); 

    // The main animation loop is now in useAnimationLoop.
    // Keyboard controls are in useKeyboardControls.
    // Camera controls (mouse/touch) are in useCameraControls.
    // Object selection (mousedown) is in useObjectSelection.
    // This useEffect primarily ensures that when core dependencies change,
    // the simulation is correctly (re)initialized or updated.

    return () => {
      // Cleanup for resources specifically managed ONLY by this top-level useSolarSystem hook.
      // Most cleanup is now delegated to the more specific hooks.
      if(scene){ 
          if (highlightEffectRef.current?.parent) { // If highlight was created here and not by another hook
            scene.remove(highlightEffectRef.current);
            highlightEffectRef.current?.geometry?.dispose();
            highlightEffectRef.current?.material?.dispose();
            highlightEffectRef.current = null; // Clear the ref
          }
          // Debug objects are managed by useKeyboardControls
      }
      
      // Performance and debug info DOM elements cleanup, if created imperatively and not by React components.
      // This might be redundant if child hooks or React components handle their own DOM.
      ['performance-stats', 'debug-info'].forEach(id => {
        const el = document.getElementById(id);
        if (el?.parentNode) el.parentNode.removeChild(el);
      });

      sceneInitializedRef.current = false; 
      prevRendererInstanceRef.current = null; 
    };
  }, [ 
    scene, camera, renderer, simulationObjects, timeScale, // Core objects and state
    containerRef, timeScaleRef, selectedBodyRef, celestialBodiesRef, cameraPositionRef, 
    debugModeRef, debugObjectsRef, showPerformanceRef, highlightEffectRef, 
    resetCameraViaControls, updateCameraViaControls, 
    resetCameraCallback, dispatch
  ]);

  return {
    resetCameraApp: resetCameraViaControls 
  };
}
