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
scene.add(transformControls);

transformControls.setTranslationSnap(2);

transformControls.setMode("translate");

transformControls.addEventListener("objectChange", function () {
  const object = transformControls.object;

  const minY = 0;
  if (object.position.y < minY) {
    object.position.y = minY;
    transformControls.update();
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

    const raycaster = new THREE.Raycaster();
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      mesh.position.copy(intersects[0].point);
    }

    scene.add(mesh);

    transformControls.attach(mesh);
    transformControls.setRotationSnap(THREE.MathUtils.degToRad(90));
  });
}

document.getElementById("object1").addEventListener("click", function () {
  initObject("object1", 0xff0000, "resources/models/3001.stl");
});
document.getElementById("object2").addEventListener("click", function () {
  initObject("object2", 0x00ff00, "resources/models/3001.stl");
});

loader.load("resources/models/782.stl", function (geometry) {
  geometry.computeBoundingBox();

  const material = new THREE.MeshStandardMaterial({ color: 0x9ca3a8 });
  const baseplate = new THREE.Mesh(geometry, material);

  baseplate.castShadow = true;
  baseplate.receiveShadow = true;

  baseplate.scale.set(0.25, 0.25, 0.25);
  baseplate.rotateX(THREE.MathUtils.degToRad(-90));

  scene.add(baseplate);
});

function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();

  renderer.render(scene, camera);
}

animate();
