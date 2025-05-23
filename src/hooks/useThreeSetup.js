import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function useThreeSetup(containerRef) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50; // Default camera position, can be adjusted later
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const containerElement = containerRef.current;
    containerElement.appendChild(renderer.domElement);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    // Sun Light (PointLight)
    const sunLight = new THREE.PointLight(0xffffff, 5, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Starfield
    const starGeometry = new THREE.SphereGeometry(0.1, 4, 4);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starCount = 2000;
    const stars = new THREE.InstancedMesh(starGeometry, starMaterial, starCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < starCount; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
      dummy.updateMatrix();
      stars.setMatrixAt(i, dummy.matrix);
    }
    scene.add(stars);

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        if (containerElement.contains(rendererRef.current.domElement)) {
          containerElement.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      // Scene cleanup (removing lights, stars) can be done here if they are not managed elsewhere
      // For now, assuming useSolarSystem will clear its specific additions from the scene.
    };
  }, [containerRef]);

  return { scene: sceneRef.current, camera: cameraRef.current, renderer: rendererRef.current };
}
