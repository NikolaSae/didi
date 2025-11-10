gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById('cityCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const dirLight = new THREE.DirectionalLight(0xffffff,1.2);
dirLight.position.set(10,20,10);
scene.add(dirLight);

// BACKGROUND CITY PLANE
const loader = new THREE.TextureLoader();
loader.load('textures/city_background.png', function(texture){
  const geometry = new THREE.PlaneGeometry(100, 50);
  const material = new THREE.MeshBasicMaterial({ map:texture, transparent:true });
  const bgPlane = new THREE.Mesh(geometry, material);
  bgPlane.position.set(0, 10, -30);
  scene.add(bgPlane);

  // Animate background with scroll
  gsap.to(bgPlane.position, {
    y: -5,
    x: -10,
    scrollTrigger:{
      trigger:'.city-background',
      start:'top bottom',
      end:'bottom top',
      scrub:true,
    }
  });
});

// 3D MODELS
const models = ['btree.glb','farm.glb','fence.glb','house.glb'];
const objects = [];
const gltfLoader = new THREE.GLTFLoader();

models.forEach((file,i)=>{
  gltfLoader.load(`models/${file}`, gltf=>{
    const obj = gltf.scene;
    obj.position.set((i-2)*6,0,(i%2)*4-2);
    obj.scale.set(2,2,2);
    obj.castShadow = true;
    obj.receiveShadow = true;
    scene.add(obj);
    objects.push(obj);
  });
});

// RENDER LOOP
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
