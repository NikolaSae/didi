// js/city-scene.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/RGBELoader.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollTrigger.min.js';
gsap.registerPlugin(ScrollTrigger);

const canvasId = 'cityScene';

// ensure canvas exists (your CSS already styles #spin360 area; canvas will be full-screen background)
let canvas = document.getElementById(canvasId);
if (!canvas) {
  canvas = document.createElement('canvas');
  canvas.id = canvasId;
  document.body.appendChild(canvas);
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 7, 14);
camera.lookAt(0, 0, 0);

// lights (sunrise / warm toning)
const hemi = new THREE.HemisphereLight(0xfff7e6, 0x405064, 0.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 1.0);
sun.position.set(6, 10, 6);
sun.castShadow = false;
scene.add(sun);

// fill (stylized)
const fill1 = new THREE.PointLight(0xffd8b0, 0.35, 40);
fill1.position.set(-8, 6, -6);
scene.add(fill1);
const fill2 = new THREE.PointLight(0xd6f0ff, 0.25, 40);
fill2.position.set(8, 6, 6);
scene.add(fill2);

// environment HDRI (sunrise)
new RGBELoader().setDataType(THREE.UnsignedByteType).load(
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  },
  undefined,
  () => { /* fail silently if blocked */ }
);

// fallback platform (if no base model)
const fallbackPlatform = new THREE.Mesh(
  new THREE.CylinderGeometry(6, 6, 0.3, 64),
  new THREE.MeshStandardMaterial({ color: 0xf4f4f2, metalness: 0.05, roughness: 0.9 })
);
fallbackPlatform.rotation.x = -Math.PI / 2;
fallbackPlatform.position.y = -0.2;
scene.add(fallbackPlatform);

const loader = new GLTFLoader();
const objects = {};

// helper to try load any model, returns null on failure
function tryLoad(url, name) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    loader.load(url,
      (gltf) => {
        const obj = gltf.scene;
        obj.name = name || 'obj';
        resolve(obj);
      },
      undefined,
      () => resolve(null)
    );
  });
}

// CONFIG: adjust paths if you put different names
const MODEL_PATHS = {
  base: 'models/base.glb',
  buildings: 'models/buildings.glb',
  trees: 'models/trees.glb',
  cars: 'models/cars.glb',
  lamp: 'models/lamp.glb'
};

async function initScene() {
  const [base, buildings, trees, cars, lamp] = await Promise.all([
    tryLoad(MODEL_PATHS.base, 'base'),
    tryLoad(MODEL_PATHS.buildings, 'buildings'),
    tryLoad(MODEL_PATHS.trees, 'trees'),
    tryLoad(MODEL_PATHS.cars, 'cars'),
    tryLoad(MODEL_PATHS.lamp, 'lamp')
  ]);

  if (base) {
    base.position.set(0, -0.2, 0);
    scene.add(base);
    objects.base = base;
    if (base.scale) base.scale.setScalar(1.0);
    // optionally hide fallback
    fallbackPlatform.visible = false;
  }

  if (buildings) {
    buildings.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }});
    buildings.position.set(0, 6, 0);
    buildings.scale.setScalar(1.0);
    scene.add(buildings);
    objects.buildings = buildings;
  } else {
    // placeholder low-poly grid
    const group = new THREE.Group();
    for (let x=-2; x<=2; x++){
      for (let z=-2; z<=2; z++){
        const h = 0.8 + Math.random()*2.2;
        const g = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, h, 0.9),
          new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.58 - Math.random()*0.05, 0.55, 0.45) })
        );
        g.position.set(x*1.1, h/2, z*1.1);
        group.add(g);
      }
    }
    group.position.y = 6;
    scene.add(group);
    objects.buildings = group;
  }

  if (trees) {
    trees.position.set(0, 8, 0);
    scene.add(trees);
    objects.trees = trees;
  } else {
    const tg = new THREE.Group();
    for (let i=0;i<18;i++){
      const bx = (Math.random()*8)-4;
      const bz = (Math.random()*8)-4;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.38), new THREE.MeshStandardMaterial({color:0x8b5a2b}));
      trunk.position.set(bx, 0.19, bz);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.28,0.65,6), new THREE.MeshStandardMaterial({color:0x1f8a3b}));
      leaves.position.set(bx, 0.68, bz);
      tg.add(trunk); tg.add(leaves);
    }
    tg.position.y = 8;
    scene.add(tg);
    objects.trees = tg;
  }

  if (cars) {
    cars.position.set(0, 10, 0);
    scene.add(cars);
    objects.cars = cars;
  } else {
    const cg = new THREE.Group();
    for (let i=0;i<6;i++){
      const car = new THREE.Mesh(new THREE.BoxGeometry(0.33,0.18,0.16), new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(Math.random(),0.6,0.5)}));
      car.position.set(-2 + i*0.75, 0.12, -3.2);
      cg.add(car);
    }
    cg.position.y = 10;
    scene.add(cg);
    objects.cars = cg;
  }

  if (lamp) {
    lamp.position.set(0, 12, 0);
    scene.add(lamp);
    objects.lamp = lamp;
  }

  setupScrollAnimations();
  animate();
}

function setupScrollAnimations() {
  const triggerEl = document.querySelector('#spin360') || document.querySelector('#city') || document.body;

  if (objects.buildings) {
    gsap.fromTo(objects.buildings.position, { y: 8 }, {
      y: 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top center',
        end: '35% center',
        scrub: 0.8
      }
    });
    gsap.fromTo(objects.buildings.rotation, { y: 0.25 }, {
      y: 0,
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top center',
        end: '35% center',
        scrub: 0.8
      }
    });
  }

  if (objects.trees) {
    gsap.fromTo(objects.trees.position, { y: 10 }, {
      y: 0,
      ease: 'bounce.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: '20% center',
        end: '55% center',
        scrub: 0.9
      }
    });
  }

  if (objects.cars) {
    gsap.fromTo(objects.cars.position, { y: 14 }, {
      y: 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: '40% center',
        end: '85% center',
        scrub: 0.9
      }
    });
  }

  if (objects.lamp) {
    gsap.fromTo(objects.lamp.position, { y: 14 }, {
      y: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: '35% center',
        end: '70% center',
        scrub: 0.9
      }
    });
  }

  ScrollTrigger.create({
    trigger: triggerEl,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => {
      const t = self.progress;
      camera.position.x = Math.sin(t * Math.PI * 2) * 1.6;
      camera.position.y = 6 + Math.sin(t * Math.PI) * 1.1;
      camera.lookAt(0, 0, 0);
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

initScene();
