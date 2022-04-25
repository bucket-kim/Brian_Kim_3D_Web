import "./style.css";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import gsap from "gsap";
import vertexShader from "./shader/coffeeSteam/vertex.glsl";
import fragmentShader from "./shader/coffeeSteam/fragment.glsl";
import bakedVertexShader from "./shader/baked/vertex.glsl";
import bakedFragmentShader from "./shader/baked/fragment.glsl";
import loadVertexShader from "./shader/loader/vertex.glsl";
import loadFragmentShader from "./shader/loader/fragment.glsl";
import { Pane } from "tweakpane";
import { sRGBEncoding } from "three";

/**
 * Base
 */
// Debug
// const gui = new dat.GUI();
// loadingManager
let sceneReady = false;

const loadingLine = document.querySelector(".loading-bar");

const loadingManager = new THREE.LoadingManager(
  // loaded
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMat.uniforms.uAlpha, {
        duration: 1,
        value: 0,
        delay: 0.25,
      });
      loadingLine.classList.add("ended");
      loadingLine.style.transform = "";
    });
    window.setTimeout(() => {
      sceneReady = true;
    }, 2000);
  },
  // progress

  (itemUrl, itemLoaded, itemTotal) => {
    const progressRatio = itemLoaded / itemTotal;
    loadingLine.style.transform = `scaleX(${progressRatio})`;
  }
);

// tweakpane
const pane = new Pane({});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/js/libs/draco");

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);

// initial loader
// const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

const overlayGeo = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMat = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: loadVertexShader,
  fragmentShader: loadFragmentShader,
});
const overlay = new THREE.Mesh(overlayGeo, overlayMat);
scene.add(overlay);

// scene.add(overlay);

// load textures
const houseMap = textureLoader.load("texture/house_baked.jpg");
houseMap.flipY = false;
houseMap.encoding = THREE.sRGBEncoding;

const houseNightMap = textureLoader.load("texture/house_night_baked.png");
houseNightMap.flipY = false;
houseNightMap.encoding = THREE.sRGBEncoding;

const lighttMap = textureLoader.load("texture/house_night_baked.jpg");
lighttMap.flipY = false;
lighttMap.encoding = THREE.sRGBEncoding;

const fairyMap = textureLoader.load("texture/ambient_light.png");
fairyMap.flipY = false;
fairyMap.encoding = THREE.sRGBEncoding;

/**
 * Load Model
 */

// light shaders
const bakedEmission = textureLoader.load("texture/emission_light.png");
bakedEmission.flipY = false;
bakedEmission.encoding = THREE.sRGBEncoding;

let emissionColor = {};
emissionColor.deskColor = "#f294ee";
emissionColor.computerColor = "#fba03a";
emissionColor.shelfColor = "#5CADFF";

let ambientColor = {};
ambientColor.roomColor = "#fff1df";
ambientColor.fairyColor = "#fff1df";

const lightShader = new THREE.ShaderMaterial({
  uniforms: {
    uBakedTexture: { value: houseMap },
    uBakedNightTexture: { value: houseNightMap },
    uFairyTexture: { value: fairyMap },
    uLightMapTexture: { value: bakedEmission },
    uNightLightTexture: { value: lighttMap },

    uMix: { value: 0 },

    uNightLight: { value: 0 },

    uFairyColor: { value: new THREE.Color(ambientColor.fairyColor) },
    uFairyLightStrength: { value: 1.0 },

    // uRoomColor: { value: new THREE.Color(ambientColor.roomColor) },
    // uRoomLightStrength: { value: 1.0 },

    uDeskLightColor: { value: new THREE.Color(emissionColor.deskColor) },
    uDeskLightStrength: { value: 1.5 },

    uCompLightColor: { value: new THREE.Color(emissionColor.computerColor) },
    uCompLightStrength: { value: 1.5 },

    uShelfLightColor: { value: new THREE.Color(emissionColor.shelfColor) },
    uShelfLightStrength: { value: 1.5 },
  },
  vertexShader: bakedVertexShader,
  fragmentShader: bakedFragmentShader,
  side: THREE.DoubleSide,
});

const dayNight = pane.addFolder({
  title: "Day and Night",
  expanded: true,
});

// const lightSwitch = pane.addInput(lightShader.uniforms.uNightLight, "value", {
//   label: "Light on and off",
//   min: 0,
//   max: 1,
//   disabled: true,
// });

dayNight.addInput(lightShader.uniforms.uMix, "value", {
  label: "Day and Night",
  min: 0,
  max: 1,
});

const emission = pane.addFolder({
  title: "Emission Lights",
  expanded: false,
});

emission
  .addInput(emissionColor, "deskColor", {
    view: "color",
    label: "desk light",
  })
  .on("change", () => {
    lightShader.uniforms.uDeskLightColor.value.set(emissionColor.deskColor);
  });
emission.addInput(lightShader.uniforms.uDeskLightStrength, "value", {
  min: 0,
  max: 2.5,
  step: 0.01,
  label: "strength",
});
emission
  .addInput(emissionColor, "computerColor", {
    view: "color",
    label: "computer light",
  })
  .on("change", () => {
    lightShader.uniforms.uCompLightColor.value.set(emissionColor.computerColor);
  });
emission.addInput(lightShader.uniforms.uCompLightStrength, "value", {
  min: 0,
  max: 2.5,
  step: 0.01,
  label: "strength",
});
emission
  .addInput(emissionColor, "shelfColor", {
    view: "color",
    label: "shelf light",
  })
  .on("change", () => {
    lightShader.uniforms.uShelfLightColor.value.set(emissionColor.shelfColor);
  });
emission.addInput(lightShader.uniforms.uShelfLightStrength, "value", {
  min: 0,
  max: 2.5,
  step: 0.01,
  label: "strength",
});
emission
  .addInput(ambientColor, "fairyColor", {
    view: "color",
    label: "fairy color",
  })
  .on("change", () => {
    lightShader.uniforms.uFairyColor.value.set(ambientColor.fairyColor);
  });
emission.addInput(lightShader.uniforms.uFairyLightStrength, "value", {
  min: 0,
  max: 2.5,
  step: 0.01,
  label: "strength",
});

// static house
gltfLoader.load("/model/scene_color.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = lightShader;
  });
  gltf.scene.position.y = -1;
  scene.add(gltf.scene);
});

// active chair top part

let chair = new THREE.Object3D();

gltfLoader.load("/model/topChair.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = lightShader;
  });
  gltf.scene.position.y = -1;
  chair = gltf.scene.children[0];
  scene.add(gltf.scene);
});

// photos
let photos = new THREE.Object3D();

gltfLoader.load("/model/photos.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = lightShader;
  });
  gltf.scene.position.y = -1;
  scene.add(gltf.scene);
});

// coffee steam model

let steamColor = {
  color: "#ffffff",
};

const steamShader = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
    uTimeFreq: { value: 0.5 },
    vUvFrequency: { value: new THREE.Vector2(2.5, 2.5) },
    uColor: { value: new THREE.Color(steamColor.color) },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

gltfLoader.load("/model/coffee_steam.glb", (gltf) => {
  const model = gltf.scene;
  // model.name = "model";
  const coffeeSteam = pane.addFolder({
    title: "coffee steam",
    expanded: false,
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
const logoTexture = textureLoader.load("/texture/logo.jpg");
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

// raycaster
const raycaster = new THREE.Raycaster();

// points of interests
const points = [
  {
    position: new THREE.Vector3(-2.5, 2, 0.75),
    element: document.querySelector(".point-0"),
  },
  {
    position: new THREE.Vector3(-1.9, 1.5, -0.7),
    element: document.querySelector(".point-1"),
  },
  {
    position: new THREE.Vector3(2.1, 1.5, -1.8),
    element: document.querySelector(".point-2"),
  },
];

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
controls.maxDistance = 27;

controls.zoomSpeed = 0.3;

controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.rotateSpeed = 0.25;

const minPan = new THREE.Vector3(-2.5, -1, -2.5);
const maxPan = new THREE.Vector3(2.5, 1, 2.5);
const _v = new THREE.Vector3();

controls.addEventListener("change", () => {
  _v.copy(controls.target);
  controls.target.clamp(minPan, maxPan);
  _v.sub(controls.target);
  camera.position.sub(_v);
});

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
renderer.setClearColor(0x0a1b30);

// stats
const stats = Stats();
// document.body.appendChild(stats.dom);

/**
 * Animate
 */

const clock = new THREE.Clock();

const contact = document.querySelector(".phone");

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // steam animation
  steamShader.uniforms.uTime.value = elapsedTime;

  // points
  if (sceneReady) {
    for (const point of points) {
      const screenPosition = point.position.clone();
      screenPosition.project(camera);

      raycaster.setFromCamera(screenPosition, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length === 0) {
        point.element.classList.add("visible");
      } else {
        const intersectionDistance = intersects[0].distance;
        const pointDistance = point.position.distanceTo(camera.position);

        if (intersectionDistance < pointDistance) {
          point.element.classList.remove("visible");
        } else {
          point.element.classList.add("visible");
        }
      }

      const translateX = screenPosition.x * sizes.width * 0.5;
      const translateY = -screenPosition.y * sizes.height * 0.5;
      point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px) `;
    }
  }

  // chair animation
  chair.rotation.y = Math.sin(elapsedTime * 0.75) * 0.5;

  // Render
  renderer.render(scene, camera);

  // stats.update();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
