import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";

const scene = new THREE.Scene();

const loader = new STLLoader();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
});

renderer.setClearColor(0xffffff);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

camera.position.set(-15, 15, 15);

renderer.render(scene, camera);

const light = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
scene.add(light);

const orbitControls = new OrbitControls(camera, renderer.domElement);
const transformControls = new TransformControls(camera, renderer.domElement);
orbitControls.minPolarAngle = 0;
orbitControls.maxPolarAngle = Math.PI / 2.5;
orbitControls.minDistance = 10;
orbitControls.maxDistance = 50;
orbitControls.rotateSpeed = 0.5;

transformControls.setTranslationSnap(2);

transformControls.setMode("translate");

transformControls.addEventListener("objectChange", function () {
  const object = transformControls.object;

  const minY = 0;
  if (object.position.y < minY) {
    object.position.y = minY;
  } else {
    object.position.y = Math.round(object.position.y / 2.4) * 2.4;
  }

  renderer.render(scene, camera);
});

transformControls.addEventListener("dragging-changed", function (event) {
  orbitControls.enabled = !event.value;
});

transformControls.addEventListener("objectChange", function () {
  renderer.render(scene, camera);
});

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

/* ----------------------------- */
let raycaster = new THREE.Raycaster();

function initObject(name, color, path) {
  loader.load(path, function (geometry) {
    geometry.computeBoundingBox();
    geometry.translate(-geometry.boundingBox.min.x, -geometry.boundingBox.min.y, -geometry.boundingBox.min.z);

    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = name;

    mesh.scale.set(0.25, 0.25, 0.25);

    mesh.castShadow = true;
    mesh.receiveShadow = false;

    mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(-90));

    mesh.isDraggable = true;

    scene.add(mesh);

    transformControls.attach(mesh);
    transformControls.setRotationSnap(THREE.MathUtils.degToRad(90));
  });
}

const objectBar = document.getElementById("object-bar");
const images = objectBar.getElementsByTagName("img");
let color = 0xff0000;
const colorPicker = document.getElementById("colorPicker");

colorPicker.addEventListener("input", function () {
  color = parseInt(this.value.substring(1), 16);
});

for (let i = 0; i < images.length; i++) {
  images[i].addEventListener("click", function () {
    switch (this.id) {
      case "object1":
        initObject("object1", color, "resources/models/1x1.stl");
        break;
      case "object2":
        initObject("object2", color, "resources/models/1x2.stl");
        break;
      case "object3":
        initObject("object3", color, "resources/models/1x3.stl");
        break;
      case "object4":
        initObject("object4", color, "resources/models/1x4.stl");
        break;
      case "object5":
        initObject("object5", color, "resources/models/1x5.stl");
        break;
      case "object6":
        initObject("object6", color, "resources/models/1x12.stl");
        break;
      case "object7":
        initObject("object7", color, "resources/models/2x2.stl");
        break;
      case "object8":
        initObject("object8", color, "resources/models/2x3.stl");
        break;
      case "object9":
        initObject("object9", color, "resources/models/2x4.stl");
        break;
      case "object10":
        initObject("object10", color, "resources/models/2x5.stl");
        break;
      case "object11":
        initObject("object11", color, "resources/models/2x12.stl");
        break;
    }
  });
}

loader.load("resources/models/782.stl", function (geometry) {
  geometry.computeBoundingBox();

  const material = new THREE.MeshStandardMaterial({ color: 0x9ca3a8 });
  const baseplate = new THREE.Mesh(geometry, material);

  baseplate.castShadow = true;
  baseplate.receiveShadow = true;

  baseplate.scale.set(0.25, 0.25, 0.25);
  baseplate.rotateX(THREE.MathUtils.degToRad(-90));
  baseplate.isDraggable = false;

  scene.add(baseplate);
});

let selectedObject = null;
const gridSize = 2;
let highlightedMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, transparent: true, opacity: 0.5 });
let defaultMaterial = new THREE.MeshStandardMaterial({ color: color });

function onDocumentKeyDown(event) {
  removeHighlight(selectedObject);

  let offset = new THREE.Vector3(0, 0, 0);

  switch (event.key) {
    case "ArrowUp":
      offset.z = -gridSize;
      break;
    case "ArrowDown":
      offset.z = gridSize;
      break;
    case "ArrowLeft":
      offset.x = -gridSize;
      break;
    case "ArrowRight":
      offset.x = gridSize;
      break;
    case "Shift":
      offset.y = gridSize + 0.4;
      break;
    case "Control":
      offset.y = -gridSize - 0.4;
      break;
  }
  highlightObject(selectedObject);

  moveObject(selectedObject, offset);
}

function removeHighlight(object) {
  if (object) {
    object.material = defaultMaterial;
  }
}

function highlightObject(object) {
  if (object) {
    object.material = highlightedMaterial;
  }
}

function moveObject(object, offset) {
  if (object) {
    object.position.add(offset);
    renderer.render(scene, camera);
  }
}

function onDragStart(event) {
  const intersects = getIntersects(event.clientX, event.clientY);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (object.isDraggable) {
      if (object === selectedObject) {
        removeHighlight(selectedObject);
        selectedObject = null;
      } else {
        removeHighlight(selectedObject);
        selectedObject = object;
        highlightObject(selectedObject);
      }
    }
  }
}

function getIntersects(x, y) {
  x = (x / window.innerWidth) * 2 - 1;
  y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera({ x, y }, camera);
  return raycaster.intersectObjects(scene.children);
}

window.addEventListener("keydown", onDocumentKeyDown);
document.addEventListener("mousedown", onDragStart);

window.addEventListener("keydown", function (event) {
  if (event.key === "Delete") {
    if (selectedObject) {
      scene.remove(selectedObject);
      selectedObject = null;
    }
  }
});

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    removeHighlight(selectedObject);
    selectedObject = null;
  }
});

function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();

  renderer.render(scene, camera);
}

animate();
