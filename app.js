import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15); // Positioned above and back for a good starting view
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Load HDR Environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load("environment.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Load GLB Model
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "model.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error("Error loading model:", error);
  }
);

// Add Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Orbit Controls for Camera Movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth the camera movements
controls.dampingFactor = 0.1;
controls.minDistance = 5; // Set how close the camera can zoom in
controls.maxDistance = 50; // Set how far the camera can zoom out

// Create Text
const fontLoader = new FontLoader();
fontLoader.load("https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("Food Art & Design", {
    font: font,
    size: 1,
    height: 0.2,
    curveSegments: 12,
  });

// Set color to red
const textMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const textMesh = new THREE.Mesh(textGeometry, textMaterial);


  textMesh.position.set(-8, 2, -5); // Positioned behind the model
  textMesh.rotation.x = -0.1;
  scene.add(textMesh);

  // Animate Text (Flag Effect)
  const waveText = () => {
    const vertices = textGeometry.attributes.position.array;
    const wave = gsap.timeline();
    for (let i = 0; i < vertices.length; i += 3) {
      const delay = (i / vertices.length) * 0.5;
      wave.to(
        vertices,
        {
          [i + 1]: vertices[i + 1] + Math.random() * 0.5 - 0.25, // Slight vertical wave
          [i + 2]: vertices[i + 2] + Math.random() * 0.5 - 0.25, // Slight depth wave
          duration: 0.5,
          repeat: 1,
          yoyo: true,
          delay: delay,
          onUpdate: () => {
            textGeometry.attributes.position.needsUpdate = true;
          },
        },
        0
      );
    }
  };

  // Add Event Listener
  window.addEventListener("click", waveText);
});

// Animation Loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update(); // Update controls every frame
  renderer.render(scene, camera);
};
animate();

// Handle Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add Background Music
const audio = new Audio("./under_your_spell.mp3"); // Replace with your MP3 file path
audio.loop = true;

document.body.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch((err) => console.error("Failed to play audio:", err));
  }
});
