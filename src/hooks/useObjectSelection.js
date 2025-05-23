import { useEffect, useRef, useCallback } from 'react'; // Added useCallback
import * as THREE from 'three';
import { ACTION_TYPES } from '../components/SolarSystemSimulation'; // Import ACTION_TYPES

export default function useObjectSelection(
  camera,
  eventTargetElement,
  allBodies, 
  highlightEffectRef, 
  selectedBodyRef,    
  // setSelectedBody,    // Replaced by dispatch
  dispatch,           // Added dispatch
  planetsData,        
  moonsData,          
  sunObject           
) {
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const processSelectionInternal = useCallback((selected) => {
    let data = null;
    if (selected.type === 'star') {
      data = {
        name: 'Sun', type: 'star', diameter: '1,392,700 km',
        rotationPeriod: '27 Earth days', temperature: '5,500°C (surface)',
        description: 'The Sun is the star at the center of the Solar System.'
      };
    } else if (selected.bodyData) {
      const b = selected.bodyData;
      let celestialData;
      if (b.type === 'planet') celestialData = planetsData.find(p => p.name === b.name);
      else if (b.type === 'moon') celestialData = moonsData.find(m => m.name === b.name);

      if (celestialData) {
        data = {
          name: celestialData.name, type: b.type, diameter: celestialData.diameter,
          orbitalPeriod: celestialData.orbitalPeriod, temperature: celestialData.temperature,
          description: celestialData.description, parentPlanet: celestialData.parentPlanetName
        };
      }
    }
    dispatch({ type: ACTION_TYPES.SET_SELECTED_BODY, payload: data });
    if(selectedBodyRef) selectedBodyRef.current = data; // Keep ref in sync if needed elsewhere immediately
  }, [dispatch, planetsData, moonsData, selectedBodyRef]); // Added dependencies

  const clearSelectionInternal = useCallback(() => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_BODY, payload: null });
    if(selectedBodyRef) selectedBodyRef.current = null; // Keep ref in sync
    if (highlightEffectRef?.current) {
      highlightEffectRef.current.visible = false;
    }
  }, [dispatch, selectedBodyRef, highlightEffectRef]); // Added dependencies
  
  const selectCelestialBodyInternal = useCallback((event) => {
    if (!camera || !eventTargetElement ) return; 
    
    // Prevent selection if click is on UI elements
    if (event.target && (event.target.closest && (event.target.closest('.time-scale-controls') || event.target.closest('button')))) {
      return; 
    }
    // window.lastSelectionTime is used by useSolarSystem to differentiate tap from drag, may not be needed here
    // if this hook purely handles selection click/tap.
    
    let clientX, clientY;
    if (event.touches) {
      if (event.touches.length > 0) {
        clientX = event.touches[0].clientX; clientY = event.touches[0].clientY;
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX; clientY = event.changedTouches[0].clientY;
      } else { return; }
    } else {
      clientX = event.clientX; clientY = event.clientY;
    }

    const rect = eventTargetElement.getBoundingClientRect();
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const currentAllBodies = allBodies || []; // Ensure allBodies is not null/undefined
    const meshes = currentAllBodies.map((body) => body.object);
    if (sunObject && !meshes.includes(sunObject)) meshes.push(sunObject);

    const directHits = raycaster.current.intersectObjects(meshes, false);

    if (directHits.length > 0) {
      const hitObject = directHits[0].object;
      let selectedBodyObj = currentAllBodies.find((b) => b.object === hitObject);
      if (!selectedBodyObj && hitObject === sunObject) {
          selectedBodyObj = { object: sunObject, type: 'star', bodyData: { name: 'Sun' } };
      }

      if (selectedBodyObj) {
        if (highlightEffectRef?.current) {
          highlightEffectRef.current.visible = true;
          highlightEffectRef.current.position.copy(hitObject.position);
          let scale = 1.3, objectSize = 1;
          if (selectedBodyObj.type === 'star') scale = 1.2;
          else if (selectedBodyObj.type === 'planet') scale = 1.5;
          else if (selectedBodyObj.type === 'moon') scale = 2.0;

          if (hitObject.geometry?.parameters?.radius) {
            objectSize = hitObject.geometry.parameters.radius;
          } else if (selectedBodyObj.bodyData?.size) {
            objectSize = selectedBodyObj.bodyData.size;
          }
          highlightEffectRef.current.scale.set(objectSize * scale, objectSize * scale, objectSize * scale);
        }
        processSelectionInternal(selectedBodyObj);
        return;
      }
    }
    clearSelectionInternal();
  }, [camera, eventTargetElement, allBodies, sunObject, highlightEffectRef, processSelectionInternal, clearSelectionInternal]); // Added dependencies

  useEffect(() => {
    if (!eventTargetElement) return;

    const handleMouseDown = (e) => {
        if (e.button === 0) { // Left click
            selectCelestialBodyInternal(e);
        }
    };
    
    // Consider adding touchstart for tap-to-select functionality,
    // ensuring it doesn't conflict with useCameraControls' gestures.
    // This might require more sophisticated gesture detection (e.g., differentiating tap from drag start).
    // For now, mousedown covers click-based selection.

    eventTargetElement.addEventListener('mousedown', handleMouseDown);

    return () => {
      eventTargetElement.removeEventListener('mousedown', handleMouseDown);
    };
  }, [eventTargetElement, selectCelestialBodyInternal]); // selectCelestialBodyInternal is now a dependency
}
