import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

const useCameraControls = (
  camera, // THREE.PerspectiveCamera object
  eventTargetElement, // DOM element for event listeners (renderer.domElement)
  cameraPositionRef, // Ref to store { rotateX, rotateY, cameraDistance, panOffset }
  selectedBodyRef, // Ref to the currently selected celestial body (optional, for future features)
  initialCameraPosition // { rotateX, rotateY, cameraDistance, panOffset }
) => {
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef(0);

  const minDistance = 5;
  const maxDistance = 200;
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0)); // For camera.lookAt

  const updateCameraPosition = useCallback(() => {
    if (!camera || !cameraPositionRef.current) return;

    const { rotateX, rotateY, cameraDistance, panOffset } = cameraPositionRef.current;

    const baseX = cameraDistance * Math.sin(rotateY) * Math.cos(rotateX);
    const baseZ = cameraDistance * Math.cos(rotateY) * Math.cos(rotateX);
    const baseY = cameraDistance * Math.sin(rotateX);

    camera.position.set(baseX + panOffset.x, baseY + panOffset.y, baseZ + panOffset.z);
    
    // Update camera target based on panOffset
    cameraTarget.current.set(panOffset.x, panOffset.y, panOffset.z);
    camera.lookAt(cameraTarget.current);

  }, [camera, cameraPositionRef]);

  const resetCamera = useCallback(() => {
    if (cameraPositionRef.current && initialCameraPosition) {
      cameraPositionRef.current.rotateX = initialCameraPosition.rotateX;
      cameraPositionRef.current.rotateY = initialCameraPosition.rotateY;
      cameraPositionRef.current.cameraDistance = initialCameraPosition.cameraDistance;
      // Ensure panOffset is a Vector3 and reset it
      if (cameraPositionRef.current.panOffset instanceof THREE.Vector3) {
        cameraPositionRef.current.panOffset.copy(initialCameraPosition.panOffset);
      } else {
        cameraPositionRef.current.panOffset = initialCameraPosition.panOffset.clone();
      }
    }
    updateCameraPosition();
  }, [cameraPositionRef, initialCameraPosition, updateCameraPosition]);

  useEffect(() => {
    if (!eventTargetElement || !camera) return;

    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left click
        // Selection logic is handled by useSolarSystem, this is for drag initiation
        isDraggingRef.current = true; // Assume drag, will be overridden by selection if target is hit
        isPanningRef.current = false;
      } else if (e.button === 2) { // Right click
        isDraggingRef.current = false; // Prevent rotation
        isPanningRef.current = true; // Enable panning
        e.preventDefault();
      } else if (e.button === 1) { // Middle click
        isDraggingRef.current = false;
        isPanningRef.current = true; 
        e.preventDefault();
      }
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current && !isPanningRef.current) return;

      const deltaMove = {
        x: e.clientX - previousMousePositionRef.current.x,
        y: e.clientY - previousMousePositionRef.current.y,
      };

      if (isDraggingRef.current) {
        cameraPositionRef.current.rotateY += deltaMove.x * 0.01;
        cameraPositionRef.current.rotateX += deltaMove.y * 0.01;
        cameraPositionRef.current.rotateX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPositionRef.current.rotateX));
      } else if (isPanningRef.current) {
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
        right.multiplyScalar(-deltaMove.x * 0.001 * cameraPositionRef.current.cameraDistance);
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
        up.multiplyScalar(deltaMove.y * 0.001 * cameraPositionRef.current.cameraDistance);
        
        cameraPositionRef.current.panOffset.add(right).add(up);
      }
      
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isPanningRef.current = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      if (e.deltaY > 0) {
        cameraPositionRef.current.cameraDistance *= (1 + zoomSpeed);
      } else {
        cameraPositionRef.current.cameraDistance *= (1 - zoomSpeed);
      }
      cameraPositionRef.current.cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraPositionRef.current.cameraDistance));
      updateCameraPosition();
    };
    
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Touch event handlers
    const handleTouchStart = (e) => {
      e.preventDefault();
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      if (e.touches.length === 1) {
        // Single touch might be for selection (handled in useSolarSystem) or rotation
        // For now, assume single touch starts rotation drag. Selection logic might need to override this.
        isDraggingRef.current = true;
        isPanningRef.current = false;
      } else if (e.touches.length === 2) { // Pinch to zoom
        isDraggingRef.current = false;
        isPanningRef.current = false;
        initialPinchDistanceRef.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 3) { // Three-finger pan
        isDraggingRef.current = false;
        isPanningRef.current = true;
         // Use average of first two touches for stability, or just first touch
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const currentMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const deltaMove = {
        x: currentMousePosition.x - previousMousePositionRef.current.x,
        y: currentMousePosition.y - previousMousePositionRef.current.y,
      };

      if (e.touches.length === 1 && isDraggingRef.current) {
        cameraPositionRef.current.rotateY += deltaMove.x * 0.01;
        cameraPositionRef.current.rotateX += deltaMove.y * 0.01;
        cameraPositionRef.current.rotateX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPositionRef.current.rotateX));
      } else if (e.touches.length === 2) { // Pinch zoom
        const currentPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialPinchDistanceRef.current > 0) {
          const pinchDelta = initialPinchDistanceRef.current - currentPinchDistance;
          cameraPositionRef.current.cameraDistance += pinchDelta * 0.05;
          cameraPositionRef.current.cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraPositionRef.current.cameraDistance));
        }
        initialPinchDistanceRef.current = currentPinchDistance;
      } else if (e.touches.length === 3 && isPanningRef.current) {
         const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
        right.multiplyScalar(-deltaMove.x * 0.001 * cameraPositionRef.current.cameraDistance);
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
        up.multiplyScalar(deltaMove.y * 0.001 * cameraPositionRef.current.cameraDistance);
        
        cameraPositionRef.current.panOffset.add(right).add(up);
      }
      
      if (e.touches.length >= 1 ) { // Update previous position for next move calculation
          if (e.touches.length === 1 || e.touches.length === 3) { // For drag and pan
            previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
      }
      updateCameraPosition();
    };

    const handleTouchEnd = (e) => {
      // Reset flags based on remaining touches
      if (e.touches.length < 1) {
        isDraggingRef.current = false;
        isPanningRef.current = false;
      } else if (e.touches.length < 2 && isPanningRef.current) { // Was panning with 3, now less than 2 (i.e. 0 or 1)
        isPanningRef.current = false; 
        // If one touch remains, it might initiate dragging for rotation.
        // This needs careful state management to avoid conflicts with selection.
        // For simplicity, just reset panning. Dragging state relies on current touch count in handleTouchStart/Move.
      } else if (e.touches.length < 2 && isDraggingRef.current) { // Was dragging with 1, now 0
         isDraggingRef.current = false;
      }
      initialPinchDistanceRef.current = 0;
    };

    eventTargetElement.addEventListener('mousedown', handleMouseDown);
    // mousemove and mouseup are added to window to handle cases where mouse leaves canvas
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    eventTargetElement.addEventListener('wheel', handleWheel, { passive: false });
    eventTargetElement.addEventListener('contextmenu', handleContextMenu);
    eventTargetElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    eventTargetElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    eventTargetElement.addEventListener('touchend', handleTouchEnd);

    // Initial camera position update
    updateCameraPosition();

    return () => {
      eventTargetElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      eventTargetElement.removeEventListener('wheel', handleWheel);
      eventTargetElement.removeEventListener('contextmenu', handleContextMenu);
      eventTargetElement.removeEventListener('touchstart', handleTouchStart);
      eventTargetElement.removeEventListener('touchmove', handleTouchMove);
      eventTargetElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    camera, 
    eventTargetElement, 
    cameraPositionRef, 
    // selectedBodyRef, // Add if interactions depend on selected body
    updateCameraPosition, 
    // initialCameraPosition // Not needed in effect dependencies directly unless it changes and should re-init listeners
  ]);

  return { resetCamera, updateCameraPosition }; // Return resetCamera and updateCameraPosition
};

export default useCameraControls;
