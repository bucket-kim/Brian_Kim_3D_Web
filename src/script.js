import "./style.css";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import normalizeWheel from "normalize-wheel";
import vertexShader from "./shader/coffeeSteam/vertex.glsl";
import fragmentShader from "./shader/coffeeSteam/fragment.glsl";
import { Pane } from "tweakpane";
import { sRGBEncoding } from "three";

/**
 * Base
 */
// Debug
// const gui = new dat.GUI();

// tweakpane
const pane = new Pane();

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

// static house
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

// active chair top part

let chair = new THREE.Object3D();

gltfLoader.load("/model/topChair.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = new THREE.MeshBasicMaterial({
      map: houseMap,
      side: THREE.DoubleSide,
    });
  });
  gltf.scene.position.y = -1;
  chair = gltf.scene.children[0];
  scene.add(gltf.scene);
});

// coffee steam model

let steamColor = {
  color: "#95847e",
};

const steamShader = new THREE.ShaderMaterial({
  color: steamColor,
  transparent: true,
  depthWrite: false,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uTimeFreq: { value: 0.5 },
    vUvFrequency: { value: new THREE.Vector2(2.5, 2.5) },
    uColor: { value: new THREE.Color(steamColor.color) },
  },
});

gltfLoader.load("/model/coffee_steam.glb", (gltf) => {
  const model = gltf.scene;
  model.name = "model";
  const coffeeSteam = pane.addFolder({
    title: "coffee steam",
  });
  model.traverse((child) => {
    child.material = steamShader;
    if (child.name === "Plane029") {
      coffeeSteam
        .addInput(steamColor, "color", {
          view: "color",
        })
        .on("change", () => {
          steamShader.uniforms.uColor.value.set(steamColor.color);
        });
      coffeeSteam.addInput(child.material.uniforms.uTimeFreq, "value", {
        label: "frequency",
        min: 0.001,
        max: 2,
        step: 0.001,
      });
      coffeeSteam.addInput(child.material.uniforms.vUvFrequency.value, "x", {
        label: "length",
        min: 0.001,
        max: 5,
        step: 0.001,
      });
      coffeeSteam.addInput(child.material.uniforms.vUvFrequency.value, "y", {
        label: "thickness",
        min: 0.001,
        max: 5,
        step: 0.001,
      });
    }
  });
  model.position.y = -1;
  scene.add(model);
});

// mac screen loader
const danceVideo = document.createElement("video");
const body = document.querySelector("body");
body.append(danceVideo);

document.addEventListener(
  "contextmenu",
  (e) => {
    e.preventDefault();
  },
  false
);

danceVideo.src = "/video/brianDanceVideo.mp4";
danceVideo.muted = true;
danceVideo.playsInline = true;
danceVideo.loop = true;
danceVideo.autoplay = true;
danceVideo.controls = false;

const videoTexture = new THREE.VideoTexture(danceVideo);
videoTexture.encoding = THREE.sRGBEncoding;

const danceVidMat = new THREE.MeshBasicMaterial({
  map: videoTexture,
});

gltfLoader.load("/model/macScreen.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = danceVidMat;
  });
  gltf.scene.position.y = -1;
  scene.add(gltf.scene);
});

// computer screen
const logoTexture = textureLoader.load("/texture/logo.png");
logoTexture.encoding = sRGBEncoding;
const logoMat = new THREE.MeshBasicMaterial({
  map: logoTexture,
});

gltfLoader.load("/model/computerScreen.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = logoMat;
  });
  gltf.scene.position.y = -1;
  scene.add(gltf.scene);
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

controls.minDistance = 3;
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

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // steam animation
  steamShader.uniforms.uTime.value = elapsedTime;

  // chair animation
  chair.rotation.y = Math.sin(elapsedTime * 0.75) * 0.5;

  // Render
  renderer.render(scene, camera);

  stats.update();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
