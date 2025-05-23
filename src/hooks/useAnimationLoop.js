import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { calculateOrbitPosition } from '../utils/orbitUtils';

export default function useAnimationLoop(
  scene,
  camera,
  renderer,
  simulationObjects, // { sunObject, celestialBodies }
  orbitLabels,
  timeScaleRef,
  selectedBodyRef,
  highlightEffectRef,
  showPerformanceRef,
  cameraPositionRef,
  celestialBodiesRef, // Ref to persist angles
  planetsData, // For mapping selected name to object data
  moonsData,   // For mapping selected name to object data
  containerRef // For performance monitor attachment
) {
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);
  const fpsRef = useRef(0);

  const monitorPerformance = (time) => {
    framesRef.current++;
    if (time >= lastTimeRef.current + 1000) {
      fpsRef.current = framesRef.current;
      framesRef.current = 0;
      lastTimeRef.current = time;
      const perfDisplay = document.getElementById('performance-stats');
      if (perfDisplay) {
        perfDisplay.textContent = `FPS: ${fpsRef.current}`;
      }
    }
  };

  const updateOrbitLabelVisibility = useCallback(() => {
    if (!cameraPositionRef?.current || !orbitLabels) return;
    const currentCameraDistance = cameraPositionRef.current.cameraDistance;
    const scaleFactor = currentCameraDistance / 70; // maintain roughly constant on-screen size
    orbitLabels.forEach((label) => {
      if (!label.sprite) return;
      const isInZoomRange = currentCameraDistance >= label.minZoom && currentCameraDistance <= label.maxZoom;
      label.sprite.visible = isInZoomRange;
      if (label.baseScale) {
        const x = label.baseScale.x * scaleFactor;
        const y = label.baseScale.y * scaleFactor;
        label.sprite.scale.set(x, y, 1);
      }
      if (label.type === 'moon') {
        if (label.orbitContainer) label.orbitContainer.visible = isInZoomRange;
        if (label.parentPlanet && label.orbitContainer) label.orbitContainer.position.copy(label.parentPlanet.position);
        if (label.parentPlanet && label.container) label.container.position.copy(label.parentPlanet.position);
      }
    });
  }, [cameraPositionRef, orbitLabels]);


  useEffect(() => {
    if (!scene || !camera || !renderer || !simulationObjects?.sunObject || !simulationObjects?.celestialBodies) {
      // If core components aren't ready, don't start the loop.
      return;
    }
    
    const animate = (time) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      try {
        if (showPerformanceRef?.current) {
          monitorPerformance(time);
        }
        const currentTimeScale = timeScaleRef?.current ?? 1;

        if (simulationObjects.sunObject) {
          simulationObjects.sunObject.rotation.y += 0.001 * currentTimeScale;
        }

        simulationObjects.celestialBodies.forEach((body, index) => {
          body.angle += body.speed * currentTimeScale;
          if (body.type === 'planet') {
            const { x, z } = calculateOrbitPosition(body.distance, body.angle, body.eccentricity || 0);
            body.object.position.x = x;
            body.object.position.z = z;
            body.object.rotation.y += body.speed * 10 * currentTimeScale;
          } else if (body.type === 'moon') {
            const parentPos = body.parentObject.position;
            body.object.position.x = parentPos.x + Math.cos(body.angle) * body.distance;
            body.object.position.z = parentPos.z + Math.sin(body.angle) * body.distance;
            body.object.position.y = parentPos.y + Math.sin(body.angle * 0.5) * (body.distance * 0.1);
            body.object.rotation.y += body.speed * 5 * currentTimeScale;
            if (body.orbitContainer) body.orbitContainer.position.copy(parentPos);
            if (body.spriteContainer) body.spriteContainer.position.copy(parentPos);
          }
          if (celestialBodiesRef?.current && Array.isArray(celestialBodiesRef.current)) {
            if (!celestialBodiesRef.current[index]) celestialBodiesRef.current[index] = {};
            celestialBodiesRef.current[index].angle = body.angle;
          }
        });

        if (selectedBodyRef?.current && highlightEffectRef?.current?.visible) {
          const { type: selectedType, name: selectedName } = selectedBodyRef.current;
          let selectedObjectInstance = null;
          if (selectedType === 'star') {
            selectedObjectInstance = simulationObjects.sunObject;
          } else {
            const foundBody = simulationObjects.celestialBodies.find(cb => cb.name === selectedName && cb.type === selectedType);
            if (foundBody) selectedObjectInstance = foundBody.object;
          }
          
          if (selectedObjectInstance) {
            highlightEffectRef.current.position.copy(selectedObjectInstance.position);
            // Scaling logic for highlightEffectRef
            let scaleMultiplier = 1.3, objectRadius = 1;
            const geomParams = selectedObjectInstance.geometry?.parameters;

            if (selectedType === 'star' && simulationObjects.sunObject) { 
              scaleMultiplier = 1.2; 
              if(geomParams?.radius) objectRadius = geomParams.radius;
            } else {
              const bodyDataArr = selectedType === 'planet' ? planetsData : moonsData;
              const bodyData = bodyDataArr.find(bd => bd.name === selectedName);
              if (bodyData?.size) {
                objectRadius = bodyData.size;
                scaleMultiplier = selectedType === 'planet' ? 1.5 : 2.0;
              } else if (geomParams?.radius) { 
                 objectRadius = geomParams.radius;
              }
            }
            highlightEffectRef.current.scale.set(objectRadius * scaleMultiplier, objectRadius * scaleMultiplier, objectRadius * scaleMultiplier);
          }
        }
        
        updateOrbitLabelVisibility();
        // Camera updates are handled by useCameraControls, which should be called within its own RAF if needed,
        // or if cameraPositionRef changes, updateCameraViaControls in useSolarSystem's animate loop will apply it.
        // For this hook, we assume camera matrix is up-to-date before render.
        
        renderer.render(scene, camera);
      } catch (err) {
        console.error('Error in animation loop:', err);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Performance display cleanup if it was created by this hook
      const perfDisplay = document.getElementById('performance-stats');
      if (perfDisplay && perfDisplay.parentNode === containerRef?.current) {
         // containerRef.current.removeChild(perfDisplay); // This might cause issues if React manages this node
      }
    };
  }, [
    scene, camera, renderer, simulationObjects, orbitLabels, timeScaleRef, 
    selectedBodyRef, highlightEffectRef, showPerformanceRef, cameraPositionRef, 
    celestialBodiesRef, planetsData, moonsData, containerRef, updateOrbitLabelVisibility
    // monitorPerformance is defined in this scope, so not a dep.
  ]);

  // This hook is primarily for side effects (the animation loop itself)
  // and doesn't need to return values unless specific controls for the loop are needed externally.
}
