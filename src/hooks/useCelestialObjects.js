import { useEffect, useState } from 'react';
import *_THREE from 'three'; // Using *_THREE to avoid conflicts if a global THREE is present
// Ensure THREE is correctly imported and used. If using a module system:
import * as THREE from 'three';
import { calculateOrbitPosition } from '../utils/orbitUtils'; // Assuming this path is correct

export default function useCelestialObjects(scene, planetsData, moonsData, celestialBodiesRef) {
  const [createdObjects, setCreatedObjects] = useState({
    sunObject: null,
    createdCelestialBodies: [],
    createdAllBodies: [],
    createdOrbitLabels: [],
  });

  useEffect(() => {
    if (!scene) {
      // Scene is not ready, do nothing or clear existing objects if necessary
      setCreatedObjects({
        sunObject: null,
        createdCelestialBodies: [],
        createdAllBodies: [],
        createdOrbitLabels: [],
      });
      return;
    }

    const localCelestialBodies = [];
    const localAllBodies = [];
    const localOrbitLabels = [];
    const localPlanets = []; // To store THREE.Mesh objects for planets, used for moon parenting

    // Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    localAllBodies.push({ object: sun, type: 'star', bodyData: { name: 'Sun' } }); // Basic data for sun

    // Planets
    planetsData.forEach((planetData, i) => {
      const { name, size, distance, speed, color, eccentricity, tilt } = planetData;
      const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({ color });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.castShadow = true;
      planet.receiveShadow = true;
      planet.rotation.z = THREE.MathUtils.degToRad(tilt);
      scene.add(planet);
      localPlanets.push(planet); // Add to local planets array for moon parenting

      const orbitGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.font = 'Bold 32px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(name, 128, 38);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(10, 2.5, 1);
      sprite.position.set(distance, 0.1, 0); // Initial position, will be updated
      scene.add(sprite);
      localOrbitLabels.push({
        sprite,
        type: 'planet',
        minZoom: 40,
        maxZoom: 200,
        baseScale: { x: 10, y: 2.5 }
      });

      const initialAngle = celestialBodiesRef.current[i]?.angle || Math.random() * Math.PI * 2;
      const planetSimData = {
        type: 'planet',
        object: planet,
        distance,
        angle: initialAngle,
        speed,
        eccentricity,
        name,
        index: i,
        // Orbit and sprite are not directly part of this sim data structure but managed elsewhere or implicitly linked
      };
      localCelestialBodies.push(planetSimData);
      localAllBodies.push({ object: planet, type: 'planet', bodyData: planetSimData });
    });

    // Saturn's Rings (specific example, ideally this would be part of planet data)
    const saturnBodyData = localCelestialBodies.find(body => body.name === 'Saturn');
    if (saturnBodyData) {
      const saturnRingGeometry = new THREE.RingGeometry(3.5, 5, 32);
      const saturnRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xffee00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
      saturnRing.rotation.x = Math.PI / 2;
      saturnBodyData.object.add(saturnRing); // Add ring to Saturn's THREE.Mesh
    }

    // Moons
    moonsData.forEach((moonData, moonIdx) => {
      const { name, parentPlanetName, size, distance, speed, color } = moonData;
      const parentPlanetBody = localCelestialBodies.find(
        (body) => body.type === 'planet' && body.name === parentPlanetName
      );

      if (!parentPlanetBody) {
        console.error(`Parent planet ${parentPlanetName} not found for moon ${name}`);
        return;
      }
      const parentPlanetObject = parentPlanetBody.object; // THREE.Mesh of the parent planet

      const moonGeometry = new THREE.SphereGeometry(size, 16, 16);
      const moonMaterial = new THREE.MeshStandardMaterial({ color });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.castShadow = true;
      moon.receiveShadow = true;
      scene.add(moon);

      const moonOrbitGeometry = new THREE.RingGeometry(distance - 0.02, distance + 0.02, 64);
      const moonOrbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
      });
      const moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
      moonOrbit.rotation.x = Math.PI / 2;
      const moonOrbitContainer = new THREE.Object3D(); // To be positioned at parent planet
      moonOrbitContainer.add(moonOrbit);
      scene.add(moonOrbitContainer);

      const moonCanvas = document.createElement('canvas');
      const moonContext = moonCanvas.getContext('2d');
      moonCanvas.width = 256;
      moonCanvas.height = 64;
      moonContext.font = 'Bold 24px Arial';
      moonContext.fillStyle = 'white';
      moonContext.textAlign = 'center';
      moonContext.fillText(name, 128, 32);
      const moonTexture = new THREE.CanvasTexture(moonCanvas);
      const moonSpriteMaterial = new THREE.SpriteMaterial({
        map: moonTexture,
        transparent: true,
        opacity: 0.7,
      });
      const moonSprite = new THREE.Sprite(moonSpriteMaterial);
      moonSprite.scale.set(2, 0.5, 1);
      // moonSprite.position will be relative to its container, set later
      const moonSpriteContainer = new THREE.Object3D(); // To be positioned at parent planet
      moonSpriteContainer.add(moonSprite);
      scene.add(moonSpriteContainer);

      localOrbitLabels.push({
        sprite: moonSprite,
        container: moonSpriteContainer, // For positioning relative to parent
        type: 'moon',
        parentPlanet: parentPlanetObject,
        orbitContainer: moonOrbitContainer, // For positioning relative to parent
        minZoom: 5,
        maxZoom: 120,
        baseScale: { x: 2, y: 0.5 },
      });
      
      const moonGlobalIndex = planetsData.length + moonIdx;
      const initialAngle = celestialBodiesRef.current[moonGlobalIndex]?.angle || Math.random() * Math.PI * 2;
      const moonSimData = {
        type: 'moon',
        object: moon,
        parentObject: parentPlanetObject,
        distance,
        angle: initialAngle,
        speed,
        name,
        moonIndex: moonIdx, // Original index from moonsData for data lookups
        orbitContainer: moonOrbitContainer,
        spriteContainer: moonSpriteContainer,
      };
      localCelestialBodies.push(moonSimData);
      localAllBodies.push({ object: moon, type: 'moon', bodyData: moonSimData });
    });
    
    setCreatedObjects({
      sunObject: sun,
      createdCelestialBodies: localCelestialBodies,
      createdAllBodies: localAllBodies,
      createdOrbitLabels: localOrbitLabels,
    });

    // Cleanup function for this effect
    return () => {
      // Remove all objects created by this hook from the scene
      localAllBodies.forEach(body => {
        if (body.object && body.object.parent) {
          body.object.parent.remove(body.object);
        }
        // Also remove orbits and labels associated with this body if they are directly managed here
      });
      localOrbitLabels.forEach(label => {
        if (label.sprite && label.sprite.parent) label.sprite.parent.remove(label.sprite);
        if (label.container && label.container.parent) label.container.parent.remove(label.container);
        if (label.orbitContainer && label.orbitContainer.parent) label.orbitContainer.parent.remove(label.orbitContainer);
        // TODO: Dispose textures and materials from sprites and orbits
      });
      if (sun && sun.parent) {
        sun.parent.remove(sun);
      }
      // TODO: Add disposal of geometries and materials for all created objects to prevent memory leaks
      // This is crucial for a robust application. For example:
      // sunGeometry.dispose(); sunMaterial.dispose();
      // planetGeometry.dispose(); planetMaterial.dispose(); orbitGeometry.dispose(); orbitMaterial.dispose(); etc.
      // For sprites: texture.dispose(); spriteMaterial.dispose();
    };

  }, [scene, planetsData, moonsData, celestialBodiesRef]); // Rerun if scene or data changes

  return createdObjects;
}
