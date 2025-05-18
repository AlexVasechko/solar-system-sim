import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import processKey from '../utils/keyboardProcessor';

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
    panOffset: new THREE.Vector3(0, 0, 0)
  });

  const debugModeRef = useRef(false);
  const debugObjectsRef = useRef([]);
  const showPerformanceRef = useRef(false);
  const animationFrameRef = useRef(null);
  const highlightEffectRef = useRef(null);

  let lastTime = 0;
  let frameCount = 0;
  const monitorPerformance = (now) => {
    frameCount++;
    if (!lastTime) lastTime = now;
    if (now - lastTime > 1000) {
      const fps = frameCount;
      console.log(`FPS: ${fps}`);
      frameCount = 0;
      lastTime = now;

      const perfDisplay = document.getElementById('performance-stats');
      if (perfDisplay) {
        perfDisplay.textContent = `FPS: ${fps}`;
      }
    }
  };

  const savedSpeedRef = useRef(1);

  useEffect(() => {
    if (!containerRef.current) return;

    timeScaleRef.current = timeScale;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

    const containerElement = containerRef.current;
    containerElement.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.1;
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };
    let { rotateX, rotateY, cameraDistance, panOffset } = cameraPositionRef.current;

    const minDistance = 5;
    const maxDistance = 200;

    const orbitLabels = [];

    let initialPinchDistance = 0;

    const cameraTarget = new THREE.Vector3(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 5, 300);
    scene.add(sunLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 1).normalize();
    scene.add(directionalLight);

    const createHighlightEffect = () => {
      const highlightGeometry = new THREE.SphereGeometry(1, 32, 32);
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      });
      const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
      highlightMesh.scale.set(1.3, 1.3, 1.3);
      highlightMesh.visible = false;
      scene.add(highlightMesh);
      return highlightMesh;
    };

    highlightEffectRef.current = createHighlightEffect();

    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const celestialBodies = [];
    const allBodies = [];

    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      emissive: 0xffff00
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planetsData = [
      [0.5,  3,  0.015, 0xdddddd],
      [0.9,  6,  0.010, 0xffee55],
      [1.0,  8,  0.008, 0x0088ff],
      [0.8, 12,  0.006, 0xff2200],
      [3.0, 18,  0.004, 0xffaa00],
      [2.5, 24,  0.0032, 0xffee00],
      [2.0, 30,  0.0025, 0x00ffff],
      [1.8, 36,  0.002,  0x0044ff]
    ];
    
    const moonsData = [
      [2, 0.3, 2.5, 0.04, 0xffffff],

      [3, 0.2, 1.3, 0.05, 0xffffff],
      [3, 0.15, 2.0, 0.04, 0xffffff],

      [4, 0.4, 4,  0.018, 0xffffff],
      [4, 0.35, 5, 0.014, 0xffffff],
      [4, 0.45, 6, 0.011, 0xffffff],
      [4, 0.40, 7, 0.009, 0xffffff],

      [5, 0.3, 4,  0.02, 0xffffff],
      [5, 0.25, 5.5, 0.017, 0xffffff],

      [6, 0.25, 3.5, 0.03, 0xffffff],
      [6, 0.25, 4.5, 0.025, 0xffffff],

      [7, 0.3, 3.5, 0.028, 0xffffff]
    ];

    const planets = [];
    for (let i = 0; i < planetsData.length; i++) {
      const [size, distance, speed, color] = planetsData[i];
      const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
      const planetMaterial = new THREE.MeshLambertMaterial({ color });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      scene.add(planet);

      const orbitGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      const planetNames = [
        'Mercury', 'Venus', 'Earth', 'Mars',
        'Jupiter', 'Saturn', 'Uranus', 'Neptune'
      ];
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.font = 'Bold 32px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(planetNames[i], 128, 38);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(10, 2.5, 1);
      sprite.position.set(distance, 0.1, 0);
      scene.add(sprite);

      const orbitLabel = {
        sprite,
        type: 'planet',
        minZoom: 40,
        maxZoom: 200
      };
      orbitLabels.push(orbitLabel);

      planets.push(planet);

      const initialAngle = celestialBodiesRef.current[i]
        ? celestialBodiesRef.current[i].angle
        : Math.random() * Math.PI * 2;

      celestialBodies.push({
        type: 'planet',
        object: planet,
        distance,
        angle: initialAngle,
        speed,
        index: i
      });
    }

    const createMoons = (planetIndex, size, distance, speed, color, index) => {
      const parentPlanet = planets[planetIndex];

      const moonGeometry = new THREE.SphereGeometry(size, 16, 16);
      const moonMaterial = new THREE.MeshLambertMaterial({ color });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      scene.add(moon);

      const moonOrbitGeometry = new THREE.RingGeometry(distance - 0.02, distance + 0.02, 64);
      const moonOrbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
      moonOrbit.rotation.x = Math.PI / 2;

      const moonOrbitContainer = new THREE.Object3D();
      moonOrbitContainer.add(moonOrbit);
      scene.add(moonOrbitContainer);

      const moonNames = [
        'Moon', 'Phobos', 'Deimos', 'Io', 'Europa', 'Ganymede', 'Callisto',
        'Titan', 'Rhea', 'Titania', 'Oberon', 'Triton'
      ];
      const moonCanvas = document.createElement('canvas');
      const moonContext = moonCanvas.getContext('2d');
      moonCanvas.width = 256;
      moonCanvas.height = 64;
      moonContext.font = 'Bold 24px Arial';
      moonContext.fillStyle = 'white';
      moonContext.textAlign = 'center';
      moonContext.fillText(moonNames[index], 128, 32);
      const moonTexture = new THREE.CanvasTexture(moonCanvas);
      const moonSpriteMaterial = new THREE.SpriteMaterial({
        map: moonTexture,
        transparent: true,
        opacity: 0.7
      });
      const moonSprite = new THREE.Sprite(moonSpriteMaterial);
      moonSprite.scale.set(2, 0.5, 1);
      moonSprite.position.set(distance, 0.1, 0);

      const moonSpriteContainer = new THREE.Object3D();
      moonSpriteContainer.add(moonSprite);
      scene.add(moonSpriteContainer);

      const moonLabel = {
        sprite: moonSprite,
        container: moonSpriteContainer,
        type: 'moon',
        parentPlanet,
        orbitContainer: moonOrbitContainer,
        minZoom: 5,
        maxZoom: 30
      };
      orbitLabels.push(moonLabel);

      const moonIndex = planets.length + index;
      const initialAngle = celestialBodiesRef.current[moonIndex]
        ? celestialBodiesRef.current[moonIndex].angle
        : Math.random() * Math.PI * 2;

      celestialBodies.push({
        type: 'moon',
        object: moon,
        parentObject: parentPlanet,
        distance,
        angle: initialAngle,
        speed,
        moonIndex: index,
        orbitContainer: moonOrbitContainer,
        spriteContainer: moonSpriteContainer
      });
    };

    moonsData.forEach((moonData, index) => {
      createMoons(moonData[0], moonData[1], moonData[2], moonData[3], moonData[4], index);
    });

    const saturnRingGeometry = new THREE.RingGeometry(3.5, 5, 32);
    const saturnRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffee00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRing.rotation.x = Math.PI / 2;
    planets[5].add(saturnRing);

    allBodies.push({
      object: sun,
      type: 'star'
    });
    celestialBodies.forEach((body) => {
      allBodies.push({
        object: body.object,
        type: body.type,
        bodyData: body
      });
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const updateCameraPosition = () => {
      const baseX = cameraDistance * Math.sin(rotateY) * Math.cos(rotateX);
      const baseZ = cameraDistance * Math.cos(rotateY) * Math.cos(rotateX);
      const baseY = cameraDistance * Math.sin(rotateX);

      camera.position.set(baseX + panOffset.x, baseY + panOffset.y, baseZ + panOffset.z);
      camera.lookAt(cameraTarget.clone().add(panOffset));

      cameraPositionRef.current = {
        rotateX,
        rotateY,
        cameraDistance,
        panOffset: panOffset.clone()
      };
    };

    const resetCamera = () => {
      rotateY = 0;
      rotateX = Math.PI / 2;
      cameraDistance = 70;
      panOffset.set(0, 0, 0);
      updateCameraPosition();
    };

    const selectCelestialBody = (event) => {
      window.lastSelectionTime = Date.now();

      let clientX, clientY;
      if (event.touches) {
        if (event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
          clientX = event.changedTouches[0].clientX;
          clientY = event.changedTouches[0].clientY;
        } else {
          clientX = event.clientX || 0;
          clientY = event.clientY || 0;
        }
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const rect = containerElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / containerElement.clientWidth) * 2 - 1;
      mouse.y = -((clientY - rect.top) / containerElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = allBodies.map((body) => body.object);
      const directHits = raycaster.intersectObjects(meshes, false);

      if (directHits.length > 0) {
        const hitObject = directHits[0].object;
        const selectedBodyObj = allBodies.find((b) => b.object === hitObject);
        if (selectedBodyObj) {
          if (highlightEffectRef.current) {
            highlightEffectRef.current.visible = true;
            highlightEffectRef.current.position.copy(hitObject.position);
            
            let scale = 1.3;
            if (selectedBodyObj.type === 'star') {
              scale = 1.2;
            } else if (selectedBodyObj.type === 'planet') {
              scale = 1.5;
            } else if (selectedBodyObj.type === 'moon') {
              scale = 2.0;
            }
            
            let objectSize = 1;
            if (hitObject.geometry && hitObject.geometry.parameters) {
              objectSize = hitObject.geometry.parameters.radius || 1;
            }
            
            highlightEffectRef.current.scale.set(
              objectSize * scale, 
              objectSize * scale, 
              objectSize * scale
            );
          }
          
          processSelection(selectedBodyObj);
          return;
        }
      }

      clearSelection();
    };

    const processSelection = (selected) => {
      let data = null;
      if (selected.type === 'star') {
        data = {
          name: 'Sun',
          type: 'star',
          diameter: '1,392,700 km',
          rotationPeriod: '27 Earth days',
          temperature: '5,500°C (surface)',
          description: 'The Sun is the star at the center of the Solar System.'
        };
      } else if (selected.bodyData) {
        const b = selected.bodyData;
        if (b.type === 'planet') {
          const planetNames = [
            'Mercury', 'Venus', 'Earth', 'Mars',
            'Jupiter', 'Saturn', 'Uranus', 'Neptune'
          ];
          const planetInfo = [
            {
              name: "Mercury",
              diameter: "4,879 km",
              orbitalPeriod: "88 Earth days",
              temperature: "−173°C to 427°C",
              description: "Mercury, the closest planet to the Sun, is a small, rocky world resembling our Moon. Its surface is covered with impact craters from countless meteorite collisions. Due to its proximity to the Sun, Mercury experiences extreme temperature variations. Interestingly, Mercury has virtually no atmosphere, so its sky remains pitch-black even during daytime."
            },
            {
              name: "Venus",
              diameter: "12,104 km",
              orbitalPeriod: "225 Earth days",
              temperature: "Average 464°C",
              description: "Venus, named after the Roman goddess of love and beauty, is sometimes called Earth's sister planet due to its similar size and mass. Its surface, however, is a scorching desert landscape dominated by volcanic plains and clouds of sulfuric acid. Venus has the thickest atmosphere of all terrestrial planets, creating an intense greenhouse effect that makes it hotter than Mercury."
            },
            {
              name: "Earth",
              diameter: "12,756 km",
              orbitalPeriod: "365.25 days",
              temperature: "Average 15°C",
              description: "Earth, our home planet, is uniquely covered by vast oceans and vibrant continents teeming with life. Its protective atmosphere and magnetic field shield it from harmful solar radiation. Earth is the only planet known to sustain life, thanks to its abundant liquid water, moderate temperatures, and breathable atmosphere."
            },
            {
              name: "Mars",
              diameter: "6,792 km",
              orbitalPeriod: "687 Earth days",
              temperature: "−125°C to 20°C",
              description: "Mars, known as the \"Red Planet,\" gets its color from iron oxide (rust) in its soil. Its landscape features huge volcanoes, deep canyons, and polar ice caps composed of frozen water and carbon dioxide. Mars is actively explored by robotic spacecraft in search of past or present signs of life, and is a prime candidate for future human colonization."
            },
            {
              name: "Jupiter",
              diameter: "142,984 km",
              orbitalPeriod: "11.86 Earth years",
              temperature: "Average −110°C",
              description: "Jupiter is the largest planet in our Solar System—a gas giant famous for its colorful bands, swirling storms, and the Great Red Spot, a gigantic storm larger than Earth that has persisted for centuries. Jupiter's powerful magnetic field generates spectacular auroras and shelters dozens of moons, including four large moons discovered by Galileo in 1610."
            },
            {
              name: "Saturn",
              diameter: "120,536 km",
              orbitalPeriod: "29.46 Earth years",
              temperature: "Average −140°C",
              description: "Saturn, known for its stunning ring system, is a gas giant composed mainly of hydrogen and helium. Its rings consist of billions of icy particles ranging from dust grains to boulders. Saturn also hosts numerous moons, including Titan, a moon larger than Mercury with a dense atmosphere and surface lakes of liquid methane."
            },
            {
              name: "Uranus",
              diameter: "51,118 km",
              orbitalPeriod: "84.01 Earth years",
              temperature: "Average −195°C",
              description: "Uranus is a unique ice giant with a distinct blue-green hue from methane gas in its atmosphere. It rotates on its side, causing extreme seasonal shifts. Discovered by William Herschel in 1781, Uranus has faint rings and dozens of moons named after characters from Shakespearean plays and the works of Alexander Pope."
            },
            {
              name: "Neptune",
              diameter: "49,528 km",
              orbitalPeriod: "164.79 Earth years",
              temperature: "Average −200°C",
              description: "Neptune, the farthest known planet from the Sun, is an ice giant known for its striking deep-blue color and supersonic winds reaching speeds over 2,000 km/h—the fastest in our Solar System. Discovered mathematically in 1846 due to its gravitational effects on Uranus, Neptune hosts Triton, one of the Solar System's most unusual moons."
            }
          ];
          data = {
            name: planetNames[b.index],
            type: 'planet',
            diameter: planetInfo[b.index].diameter,
            orbitalPeriod: planetInfo[b.index].orbitalPeriod,
            temperature: planetInfo[b.index].temperature,
            description: planetInfo[b.index].description
          };
        } else if (b.type === 'moon') {
          const moonNames = [
            'Moon', 'Phobos', 'Deimos', 'Io', 'Europa', 'Ganymede', 'Callisto',
            'Titan', 'Rhea', 'Titania', 'Oberon', 'Triton'
          ];
          const moonInfo = [
            {
              name: "Moon",
              parentPlanet: "Earth",
              diameter: "3,474 km",
              orbitalPeriod: "27.3 days",
              description: "The Moon, Earth's sole natural satellite, is heavily cratered and marked by dark volcanic maria. Its gravity influences ocean tides, stabilizes Earth's axial tilt, and has inspired countless myths and legends. Neil Armstrong famously became the first human to set foot on the Moon in 1969."
            },
            {
              name: "Phobos",
              parentPlanet: "Mars",
              diameter: "22.2 km",
              orbitalPeriod: "7.7 hours",
              description: "Phobos, Mars's largest moon, is irregularly shaped and orbits incredibly close to Mars, rising and setting multiple times each Martian day. Scientists predict that Phobos will eventually either crash into Mars or break apart, forming a ring around the planet in the distant future."
            },
            {
              name: "Deimos",
              parentPlanet: "Mars",
              diameter: "12.4 km",
              orbitalPeriod: "30.3 hours",
              description: "Deimos is Mars's smaller, outer moon. It is irregularly shaped, heavily cratered, and likely captured from the asteroid belt. Its surface is smoother than Phobos due to a thick layer of fine dust and debris."
            },
            {
              name: "Io",
              parentPlanet: "Jupiter",
              diameter: "3,643 km",
              orbitalPeriod: "1.8 days",
              description: "Io, Jupiter's closest large moon, is the most volcanically active body in the Solar System, constantly reshaped by hundreds of active volcanoes spewing sulfur compounds. Its vibrant surface of reds, yellows, and whites resembles a pizza, caused by volcanic sulfur deposits."
            },
            {
              name: "Europa",
              parentPlanet: "Jupiter",
              diameter: "3,122 km",
              orbitalPeriod: "3.6 days",
              description: "Europa is an icy world, believed to harbor a vast subsurface ocean beneath its frozen crust, making it one of the most promising places to search for extraterrestrial life. Its smooth, cracked surface indicates geological activity beneath."
            },
            {
              name: "Ganymede",
              parentPlanet: "Jupiter",
              diameter: "5,268 km",
              orbitalPeriod: "7.2 days",
              description: "Ganymede is the largest moon in the Solar System—larger than Mercury. Unique among moons, it has its own magnetic field and is believed to contain a subsurface saltwater ocean beneath its thick icy crust."
            },
            {
              name: "Callisto",
              parentPlanet: "Jupiter",
              diameter: "4,821 km",
              orbitalPeriod: "16.7 days",
              description: "Callisto is Jupiter's outermost Galilean moon, heavily cratered and geologically inactive, making it a fascinating historical record of the early Solar System. Its icy, ancient surface reflects billions of years of impacts."
            },
            {
              name: "Titan",
              parentPlanet: "Saturn",
              diameter: "5,150 km",
              orbitalPeriod: "15.9 days",
              description: "Titan, Saturn's largest moon, is the only moon known to have a thick atmosphere and stable liquid on its surface—rivers and lakes of liquid methane. Its complex chemistry and atmospheric composition intrigue scientists searching for prebiotic conditions."
            },
            {
              name: "Rhea",
              parentPlanet: "Saturn",
              diameter: "1,528 km",
              orbitalPeriod: "4.5 days",
              description: "Rhea is Saturn's second-largest moon, characterized by its heavily cratered, icy surface. It has a thin atmosphere of oxygen and carbon dioxide, and may have a partial ring system, which would make it unique among moons."
            },
            {
              name: "Titania",
              parentPlanet: "Uranus",
              diameter: "1,578 km",
              orbitalPeriod: "8.7 days",
              description: "Titania is the largest moon of Uranus, featuring a complex surface with numerous impact craters, extensive canyon systems, and signs of geological activity. Its surface shows evidence of past tectonic forces and possible internal heating."
            },
            {
              name: "Oberon",
              parentPlanet: "Uranus",
              diameter: "1,523 km",
              orbitalPeriod: "13.5 days",
              description: "Oberon, Uranus's second-largest moon, has one of the darkest surfaces in the Solar System. Its terrain is marked by ancient impact craters and mysterious dark patches, which may be exposed material from its interior."
            },
            {
              name: "Triton",
              parentPlanet: "Neptune",
              diameter: "2,707 km",
              orbitalPeriod: "5.9 days",
              description: "Triton orbits Neptune in the opposite direction of the planet's rotation, suggesting it was captured rather than formed in place. It has active geysers of nitrogen gas and dust, making it one of only four known geologically active moons in our Solar System."
            }
          ];
          data = {
            name: moonNames[b.moonIndex],
            type: 'moon',
            parentPlanet: moonInfo[b.moonIndex].parentPlanet,
            diameter: moonInfo[b.moonIndex].diameter,
            orbitalPeriod: moonInfo[b.moonIndex].orbitalPeriod,
            description: moonInfo[b.moonIndex].description
          };
        }
      }
      if (data) {
        setSelectedBody(data);
        selectedBodyRef.current = data;
        createOrUpdateInfoPanel(data);
      }
    };

    const clearSelection = () => {
      setSelectedBody(null);
      selectedBodyRef.current = null;
      const panel = document.getElementById('celestial-body-info');
      if (panel) panel.style.display = 'none';
      
      if (highlightEffectRef.current) {
        highlightEffectRef.current.visible = false;
      }
    };

    const createOrUpdateInfoPanel = (bodyData) => {
      let infoPanel = document.getElementById('celestial-body-info');
      if (!infoPanel) {
        infoPanel = document.createElement('div');
        infoPanel.id = 'celestial-body-info';
        infoPanel.style.position = 'absolute';
        infoPanel.style.right = '20px';
        infoPanel.style.top = '20px';
        infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        infoPanel.style.color = 'white';
        infoPanel.style.padding = '15px';
        infoPanel.style.borderRadius = '5px';
        infoPanel.style.maxWidth = '300px';
        infoPanel.style.zIndex = '1000';
        infoPanel.style.fontSize = '14px';
        infoPanel.style.lineHeight = '1.4';
        infoPanel.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
        containerElement.appendChild(infoPanel);
      } else {
        infoPanel.style.display = 'block';
      }

      let content = `<h3 style="margin-top:0;color:#4CAF50;">${bodyData.name}</h3>`;
      content += `<p><strong>Type:</strong> ${bodyData.type}</p>`;
      if (bodyData.type === 'moon') {
        content += `<p><strong>Parent Planet:</strong> ${bodyData.parentPlanet}</p>`;
      }
      content += `<p><strong>Diameter:</strong> ${bodyData.diameter}</p>`;
      if (bodyData.type === 'star') {
        content += `<p><strong>Rotation Period:</strong> ${bodyData.rotationPeriod}</p>`;
        content += `<p><strong>Temperature:</strong> ${bodyData.temperature}</p>`;
      } else {
        content += `<p><strong>Orbital Period:</strong> ${bodyData.orbitalPeriod}</p>`;
        if (bodyData.temperature) {
          content += `<p><strong>Temperature:</strong> ${bodyData.temperature}</p>`;
        }
      }
      content += `<p>${bodyData.description}</p>`;
      infoPanel.innerHTML = content;
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        isDragging = false;
        isPanning = false;
        selectCelestialBody(e);
      } else if (e.button === 2) {
        isDragging = true;
        isPanning = false;
        e.preventDefault();
      } else if (e.button === 1) {
        isDragging = false;
        isPanning = true;
        e.preventDefault();
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging && !isPanning) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      if (isDragging) {
        rotateY += deltaMove.x * 0.01;
        rotateX += deltaMove.y * 0.01;
        rotateX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotateX));
      } else if (isPanning) {
        const right = new THREE.Vector3(-Math.cos(rotateY), 0, Math.sin(rotateY));
        const up = new THREE.Vector3(
          Math.sin(rotateY) * Math.sin(rotateX),
          Math.cos(rotateX),
          Math.cos(rotateY) * Math.sin(rotateX)
        );
        const panSpeed = 0.02 * (cameraDistance / 50);
        panOffset.addScaledVector(right, deltaMove.x * panSpeed);
        panOffset.addScaledVector(up, -deltaMove.y * panSpeed);
      }

      updateCameraPosition();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
      isPanning = false;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      if (e.deltaY > 0) {
        cameraDistance *= 1 + zoomSpeed;
      } else {
        cameraDistance *= 1 - zoomSpeed;
      }
      cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
      updateCameraPosition();
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = false;
        isPanning = false;
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        const handleThisTouchEnd = (endEvent) => {
          window.removeEventListener('touchend', handleThisTouchEnd);
          if (endEvent.touches.length > 0) return;
          const touchEndTime = Date.now();
          const touchEndX = endEvent.changedTouches[0].clientX;
          const touchEndY = endEvent.changedTouches[0].clientY;
          const dx = touchEndX - previousMousePosition.x;
          const dy = touchEndY - previousMousePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (touchEndTime - window.lastTouchStart < 300 && distance < 10) {
            const clickEvent = {
              clientX: touchEndX,
              clientY: touchEndY,
              preventDefault: () => {}
            };
            selectCelestialBody(clickEvent);
          }
        };
        window.lastTouchStart = Date.now();
        window.addEventListener('touchend', handleThisTouchEnd);
      } else if (e.touches.length === 3) {
        isDragging = false;
        isPanning = true;
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaMove = {
          x: e.touches[0].clientX - previousMousePosition.x,
          y: e.touches[0].clientY - previousMousePosition.y
        };
        rotateY += deltaMove.x * 0.01;
        rotateX += deltaMove.y * 0.01;
        rotateX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotateX));
        updateCameraPosition();
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      } else if (e.touches.length === 3 && isPanning) {
        const deltaMove = {
          x: e.touches[0].clientX - previousMousePosition.x,
          y: e.touches[0].clientY - previousMousePosition.y
        };
        const right = new THREE.Vector3(-Math.cos(rotateY), 0, Math.sin(rotateY));
        const up = new THREE.Vector3(
          Math.sin(rotateY) * Math.sin(rotateX),
          Math.cos(rotateX),
          Math.cos(rotateY) * Math.sin(rotateX)
        );
        const panSpeed = 0.02 * (cameraDistance / 50);
        panOffset.addScaledVector(right, deltaMove.x * panSpeed);
        panOffset.addScaledVector(up, -deltaMove.y * panSpeed);
        updateCameraPosition();
        previousMousePosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      isPanning = false;
    };

    const handleTouchZoomStart = (e) => {
      if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchZoomMove = (e) => {
      if (e.touches.length === 2) {
        const currentPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialPinchDistance > 0) {
          const pinchDelta = initialPinchDistance - currentPinchDistance;
          cameraDistance += pinchDelta * 0.05;
          cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
          updateCameraPosition();
        }
        initialPinchDistance = currentPinchDistance;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchstart', handleTouchZoomStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchmove', handleTouchZoomMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);


    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Camera';
    resetButton.style.position = 'absolute';
    resetButton.style.bottom = '20px';
    resetButton.style.left = '20px';
    resetButton.style.padding = '8px 16px';
    resetButton.style.backgroundColor = '#333';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontWeight = 'bold';
    resetButton.addEventListener('click', resetCamera);
    containerElement.appendChild(resetButton);

    const createTimeScaleControls = () => {
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'time-scale-controls';
      controlsDiv.style.position = 'absolute';
      controlsDiv.style.bottom = '20px';
      controlsDiv.style.right = '20px';
      controlsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      controlsDiv.style.color = 'white';
      controlsDiv.style.padding = '10px';
      controlsDiv.style.borderRadius = '4px';
      controlsDiv.style.zIndex = '1000';
      const title = document.createElement('div');
      title.textContent = 'Simulation Speed';
      title.style.fontWeight = 'bold';
      title.style.marginBottom = '8px';
      title.style.textAlign = 'center';
      controlsDiv.appendChild(title);

      const speeds = [
        { label: '⏸', value: 0 },
        { label: '0.25x', value: 0.25 },
        { label: '0.5x', value: 0.5 },
        { label: '1x', value: 1 },
        { label: '2x', value: 2 },
        { label: '4x', value: 4 },
        { label: '8x', value: 8 }
      ];
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.flexWrap = 'wrap';
      buttonContainer.style.gap = '6px';
      buttonContainer.style.justifyContent = 'center';
      const allButtons = [];

      speeds.forEach((speed) => {
        const button = document.createElement('button');
        button.textContent = speed.label;
        button.dataset.speed = speed.value;
        button.style.backgroundColor =
          speed.value === timeScaleRef.current ? '#4CAF50' : '#555';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.padding = '6px 10px';
        button.style.cursor = 'pointer';
        button.style.minWidth = '45px';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';

        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const clickedSpeed = parseFloat(button.dataset.speed);
          timeScaleRef.current = clickedSpeed;
          setTimeScale(clickedSpeed);
          allButtons.forEach((btn) => {
            const btnSpeed = parseFloat(btn.dataset.speed);
            btn.style.backgroundColor = btnSpeed === clickedSpeed ? '#4CAF50' : '#555';
          });
        });
        allButtons.push(button);
        buttonContainer.appendChild(button);
      });

      controlsDiv.appendChild(buttonContainer);
      
      const keyboardInfo = document.createElement('div');
      keyboardInfo.style.marginTop = '8px';
      keyboardInfo.style.fontSize = '12px';
      keyboardInfo.style.textAlign = 'center';
      keyboardInfo.innerHTML = 'Space: Pause/Resume<br>+/-: Change Speed';
      controlsDiv.appendChild(keyboardInfo);
      
      return controlsDiv;
    };

    const timeControls = createTimeScaleControls();
    containerElement.appendChild(timeControls);

    const handleKeyboardControls = (e) => {
      const prevState = {
        debugMode: debugModeRef.current,
        showPerformance: showPerformanceRef.current,
        timeScale: timeScaleRef.current,
        savedSpeed: savedSpeedRef.current,
      };

      const newState = processKey(prevState, { key: e.key, code: e.code });

      const debugChanged = newState.debugMode !== prevState.debugMode;
      const perfChanged = newState.showPerformance !== prevState.showPerformance;
      const speedChanged = newState.timeScale !== prevState.timeScale;

      debugModeRef.current = newState.debugMode;
      showPerformanceRef.current = newState.showPerformance;
      savedSpeedRef.current = newState.savedSpeed;
      timeScaleRef.current = newState.timeScale;

      if (debugChanged) {
        debugObjectsRef.current.forEach((obj) => scene.remove(obj));
        debugObjectsRef.current = [];
        if (newState.debugMode) {
          console.log('Debug mode ON');
        } else {
          const debugInfo = document.getElementById('debug-info');
          if (debugInfo) debugInfo.remove();
          console.log('Debug mode OFF');
        }
      }

      if (perfChanged) {
        let perfDisplay = document.getElementById('performance-stats');
        if (newState.showPerformance) {
          if (!perfDisplay) {
            perfDisplay = document.createElement('div');
            perfDisplay.id = 'performance-stats';
            perfDisplay.style.position = 'absolute';
            perfDisplay.style.top = '10px';
            perfDisplay.style.right = '10px';
            perfDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            perfDisplay.style.color = '#0f0';
            perfDisplay.style.padding = '5px 10px';
            perfDisplay.style.borderRadius = '4px';
            perfDisplay.style.fontFamily = 'monospace';
            perfDisplay.style.zIndex = '1000';
            perfDisplay.textContent = 'FPS: --';
            containerElement.appendChild(perfDisplay);
          } else {
            perfDisplay.style.display = 'block';
          }
          console.log('Performance monitoring ON');
        } else if (perfDisplay) {
          perfDisplay.style.display = 'none';
          console.log('Performance monitoring OFF');
        }
      }

      if (e.key === ' ' || e.code === 'Space' || e.key === '+' || e.key === '=' || e.key === 'Add' || e.key === '-' || e.key === '_' || e.key === 'Subtract') {
        e.preventDefault();
      }

      if (speedChanged) {
        setTimeScale(newState.timeScale);
        const buttons = document.querySelectorAll('.time-scale-controls button');
        buttons.forEach((btn) => {
          const speed = parseFloat(btn.dataset.speed);
          btn.style.backgroundColor = speed === newState.timeScale ? '#4CAF50' : '#555';
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyboardControls);

    const updateOrbitLabelVisibility = () => {
      orbitLabels.forEach((label) => {
        if (label.type === 'planet') {
          label.sprite.visible =
            cameraDistance >= label.minZoom && cameraDistance <= label.maxZoom;
        } else if (label.type === 'moon') {
          label.sprite.visible =
            cameraDistance >= label.minZoom && cameraDistance <= label.maxZoom;
          if (cameraDistance > label.maxZoom) {
            label.orbitContainer.visible = false;
          } else {
            label.orbitContainer.visible = true;
          }
          if (label.parentPlanet) {
            label.orbitContainer.position.copy(label.parentPlanet.position);
            label.container.position.copy(label.parentPlanet.position);
          }
        }
      });
    };

    const animate = (time) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      try {
        if (showPerformanceRef.current) {
          monitorPerformance(time);
        }
        const currentTimeScale = timeScaleRef.current;
        sun.rotation.y += 0.001 * currentTimeScale;

        celestialBodies.forEach((body, index) => {
          body.angle += body.speed * currentTimeScale;
          if (body.type === 'planet') {
            body.object.position.x = Math.cos(body.angle) * body.distance;
            body.object.position.z = Math.sin(body.angle) * body.distance;
            body.object.rotation.y += body.speed * 10 * currentTimeScale;
          } else if (body.type === 'moon') {
            const parentPos = body.parentObject.position;
            body.object.position.x = parentPos.x + Math.cos(body.angle) * body.distance;
            body.object.position.z = parentPos.z + Math.sin(body.angle) * body.distance;
            body.object.position.y =
              parentPos.y + Math.sin(body.angle * 0.5) * (body.distance * 0.1);
            body.object.rotation.y += body.speed * 5 * currentTimeScale;
            if (body.orbitContainer) {
              body.orbitContainer.position.copy(parentPos);
            }
            if (body.spriteContainer) {
              body.spriteContainer.position.copy(parentPos);
            }
          }
          if (celestialBodiesRef.current[index]) {
            celestialBodiesRef.current[index].angle = body.angle;
          } else {
            celestialBodiesRef.current[index] = { angle: body.angle };
          }
        });

        if (selectedBodyRef.current && highlightEffectRef.current && highlightEffectRef.current.visible) {
          const selectedType = selectedBodyRef.current.type;
          const selectedName = selectedBodyRef.current.name;
          
          let selectedObject = null;
          
          if (selectedType === 'star') {
            selectedObject = sun;
          } else {
            const bodies = celestialBodies.filter((b) => {
              if (b.type === 'planet') {
                const planetNames = [
                  'Mercury', 'Venus', 'Earth', 'Mars',
                  'Jupiter', 'Saturn', 'Uranus', 'Neptune'
                ];
                return planetNames[b.index] === selectedName;
              } else if (b.type === 'moon') {
                const moonNames = [
                  'Moon', 'Phobos', 'Deimos', 'Io', 'Europa', 'Ganymede', 'Callisto',
                  'Titan', 'Rhea', 'Titania', 'Oberon', 'Triton'
                ];
                return moonNames[b.moonIndex] === selectedName;
              }
              return false;
            });
            
            if (bodies.length > 0) {
              selectedObject = bodies[0].object;
            }
          }
          
          if (selectedObject) {
            highlightEffectRef.current.position.copy(selectedObject.position);
          }
        }

        updateOrbitLabelVisibility();
        renderer.render(scene, camera);
      } catch (err) {
        console.error('Error in animation loop:', err);
      }
    };
    animate();

    updateCameraPosition();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchstart', handleTouchZoomStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchZoomMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyboardControls);

      debugObjectsRef.current.forEach((obj) => scene.remove(obj));
      debugObjectsRef.current = [];
      
      if (highlightEffectRef.current) {
        scene.remove(highlightEffectRef.current);
      }

      if (containerElement) {
        if (containerElement.contains(renderer.domElement)) {
          containerElement.removeChild(renderer.domElement);
        }
        const infoPanel = document.getElementById('celestial-body-info');
        if (infoPanel) infoPanel.remove();

        const perfDisplay = document.getElementById('performance-stats');
        if (perfDisplay) perfDisplay.remove();

        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) debugInfo.remove();

        const button = containerElement.querySelector('button');
        if (button) containerElement.removeChild(button);

        const timeControls = containerElement.querySelector('.time-scale-controls');
        if (timeControls) containerElement.removeChild(timeControls);
      }

      scene.clear();
      renderer.dispose();
    };
  }, []);

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
          pointerEvents: 'none'
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
