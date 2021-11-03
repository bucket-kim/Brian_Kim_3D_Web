import "./style.css";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import normalizeWheel from "normalize-wheel";
import vertexShader from "./shader/coffeeSteam/vertex.glsl";
import fragmentShader from "./shader/coffeeSteam/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// GLTF loader
const gltfLoader = new GLTFLoader();

// Texture loader
const textureLoader = new THREE.TextureLoader();

// load textures
const houseMap = textureLoader.load("texture/house_night_baked.png");
houseMap.flipY = false;
houseMap.encoding = THREE.sRGBEncoding;

/**
 * Test sphere
 */
// const testCube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial()
// );
// scene.add(testCube);

/**
 * Load Model
 */
gltfLoader.load("/model/basic_house.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = new THREE.MeshBasicMaterial({
      map: houseMap,
      side: THREE.DoubleSide,
    });
  });
  gltf.scene.position.y = -1;
  scene.add(gltf.scene);
});

// coffee steam model
gltfLoader.load("/model/coffee_steam.glb", (gltf) => {
  let model = gltf.scene;
  model.traverse((child) => {
    child.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  });
  model.position.y = -1;
  scene.add(model);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(14, 10, 14);
// const cameraTarget = new THREE.Vector3(14, 10, 14);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);

/**
 * Navigation control
 */
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;

controls.minDistance = 5;
controls.maxDistance = 20;

controls.zoomSpeed = 0.3;

controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.rotateSpeed = 0.25;

// zoom smoothe feature

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  vertexShader: vertexShader,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

// stats
const stats = Stats();
document.body.appendChild(stats.dom);

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  stats.update();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
