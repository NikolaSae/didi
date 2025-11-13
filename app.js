// THREE.JS MAKETA ASSEMBLY ANIMATION
(function() {
  const canvas = document.getElementById('assembly-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 18, 45);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ============ LIGHTING ============
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(15, 30, 15);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.left = -40;
  directionalLight.shadow.camera.right = 40;
  directionalLight.shadow.camera.top = 40;
  directionalLight.shadow.camera.bottom = -40;
  scene.add(directionalLight);

  // ============ BASE PLATFORM ============
  const baseGeometry = new THREE.BoxGeometry(35, 0.8, 35);
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x90C695,
    roughness: 0.9,
    metalness: 0.1
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0;
  base.receiveShadow = true;
  scene.add(base);

  // ============ CREATE BRICK TEXTURE ============
  function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#C14A3A';
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = '#8B3626';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 64) {
        const offsetX = (y / 32) % 2 === 0 ? 0 : 32;
        ctx.strokeRect(x + offsetX, y, 64, 32);
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }

  const brickTexture = createBrickTexture();
  const parts = [];
  
  // ============ CREATE HOUSE ============
  function createHouse(x, z, color, size = 1) {
    const group = new THREE.Group();
    
    // Body
    const bodyGeo = new THREE.BoxGeometry(2 * size, 3 * size, 2 * size);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      map: brickTexture,
      roughness: 0.8,
      metalness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5 * size;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Windows
    const windowGeo = new THREE.BoxGeometry(0.4, 0.5, 0.1);
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: 0x87CEEB,
      emissive: 0x4A90E2,
      emissiveIntensity: 0.3
    });
    
    for (let i = 0; i < 2; i++) {
      const window1 = new THREE.Mesh(windowGeo, windowMat);
      window1.position.set(-0.6 + i * 1.2, 2 * size, 1.01 * size);
      window1.castShadow = true;
      group.add(window1);
    }
    
    // Roof
    const roofGeo = new THREE.ConeGeometry(1.7 * size, 1.5 * size, 4);
    const roofMat = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.75 * size;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    // Door
    const doorGeo = new THREE.BoxGeometry(0.6, 1, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.5 * size, 1.01 * size);
    door.castShadow = true;
    group.add(door);
    
    group.position.set(x, 0, z);
    return group;
  }
  
  // ============ CREATE TREE ============
  function createTree(x, z, size = 1) {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3 * size, 0.4 * size, 2 * size, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 1
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1 * size;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);
    
    // Leaves
    const leavesGeo = new THREE.SphereGeometry(1.2 * size, 8, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.8
    });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 2.5 * size;
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    group.add(leaves);
    
    group.position.set(x, 0, z);
    return group;
  }
  
  // ============ CREATE FENCE ============
  function createFence(x, z, rotation) {
    const group = new THREE.Group();
    
    // Posts
    for (let i = 0; i < 4; i++) {
      const postGeo = new THREE.BoxGeometry(0.2, 1.8, 0.2);
      const postMat = new THREE.MeshStandardMaterial({ 
        color: 0xD2691E,
        roughness: 0.9
      });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(i * 1 - 1.5, 0.9, 0);
      post.castShadow = true;
      post.receiveShadow = true;
      group.add(post);
    }
    
    // Rails
    const railGeo = new THREE.BoxGeometry(3.5, 0.15, 0.15);
    const railMat = new THREE.MeshStandardMaterial({ 
      color: 0xD2691E,
      roughness: 0.9
    });
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.y = 1.2;
    rail1.castShadow = true;
    group.add(rail1);
    
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.y = 0.6;
    rail2.castShadow = true;
    group.add(rail2);
    
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    return group;
  }

  // ============ CREATE STREET LAMP ============
  function createStreetLamp(x, z) {
    const group = new THREE.Group();
    
    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 3.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ 
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.75;
    pole.castShadow = true;
    group.add(pole);
    
    // Light bulb
    const lightGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const lightMat = new THREE.MeshStandardMaterial({ 
      color: 0xFFFFAA,
      emissive: 0xFFFF00,
      emissiveIntensity: 0.8
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.y = 3.5;
    light.castShadow = true;
    group.add(light);
    
    // Point light
    const pointLight = new THREE.PointLight(0xFFFF00, 0.5, 10);
    pointLight.position.y = 3.5;
    pointLight.castShadow = true;
    group.add(pointLight);
    
    group.position.set(x, 0, z);
    return group;
  }

  // ============ CREATE ROAD ============
  function createRoad(x, z, length, rotation) {
    const group = new THREE.Group();
    
    // Road surface
    const roadGeo = new THREE.BoxGeometry(length, 0.2, 3);
    const roadMat = new THREE.MeshStandardMaterial({ 
      color: 0x404040,
      roughness: 0.95
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.y = 0.5;
    road.receiveShadow = true;
    group.add(road);
    
    // Road line
    const lineGeo = new THREE.BoxGeometry(length * 0.8, 0.25, 0.2);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.y = 0.65;
    group.add(line);
    
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    return group;
  }

  // ============ HELPER FUNCTION ============
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const startYBase = 50;
  
  // ============ CREATE SCENE OBJECTS ============
  
  // Houses
  for (let i = 0; i < 8; i++) {
    const x = randomInRange(-12, 12);
    const z = randomInRange(-12, 12);
    const size = randomInRange(0.8, 1.2);
    const startY = randomInRange(startYBase, startYBase + 30);
    const delay = randomInRange(0, 0.4);
    parts.push({ 
      obj: createHouse(x, z, 0xFF6B6B, size), 
      startY, 
      targetY: 1.5 * size, 
      delay,
      rotationSpeed: randomInRange(1, 3)
    });
  }
  
  // Trees
  for (let i = 0; i < 12; i++) {
    const x = randomInRange(-14, 14);
    const z = randomInRange(-14, 14);
    const size = randomInRange(0.7, 1.1);
    const startY = randomInRange(startYBase, startYBase + 25);
    const delay = randomInRange(0.1, 0.5);
    parts.push({ 
      obj: createTree(x, z, size), 
      startY, 
      targetY: 1, 
      delay,
      rotationSpeed: randomInRange(0.5, 2)
    });
  }
  
  // Fences
  for (let i = 0; i < 10; i++) {
    const x = randomInRange(-13, 13);
    const z = randomInRange(-13, 13);
    const rotation = randomInRange(0, Math.PI * 2);
    const startY = randomInRange(startYBase, startYBase + 20);
    const delay = randomInRange(0.15, 0.55);
    parts.push({ 
      obj: createFence(x, z, rotation), 
      startY, 
      targetY: 0.9, 
      delay,
      rotationSpeed: randomInRange(1, 2.5)
    });
  }
  
  // Street Lamps
  for (let i = 0; i < 6; i++) {
    const x = randomInRange(-11, 11);
    const z = randomInRange(-11, 11);
    const startY = randomInRange(startYBase + 5, startYBase + 35);
    const delay = randomInRange(0.2, 0.6);
    parts.push({ 
      obj: createStreetLamp(x, z), 
      startY, 
      targetY: 0, 
      delay,
      rotationSpeed: randomInRange(0.8, 2)
    });
  }
  
  // Roads
  const roadPositions = [
    { x: 0, z: -8, length: 25, rotation: 0 },
    { x: 0, z: 8, length: 25, rotation: 0 },
    { x: -8, z: 0, length: 25, rotation: Math.PI / 2 },
    { x: 8, z: 0, length: 25, rotation: Math.PI / 2 }
  ];
  
  roadPositions.forEach((pos, i) => {
    const startY = randomInRange(startYBase - 5, startYBase + 10);
    const delay = randomInRange(0.05, 0.35);
    parts.push({ 
      obj: createRoad(pos.x, pos.z, pos.length, pos.rotation), 
      startY, 
      targetY: 0.5, 
      delay,
      rotationSpeed: randomInRange(0.5, 1.5)
    });
  });

  // Add all parts to scene
  parts.forEach(part => {
    part.obj.position.y = part.startY;
    scene.add(part.obj);
  });

  // ============ SCROLL ANIMATION ============
  let scrollProgress = 0;
  const maxScroll = document.body.scrollHeight - window.innerHeight;

  function updatePartsPosition() {
    parts.forEach(part => {
      const partProgress = Math.max(0, Math.min(1, (scrollProgress - part.delay) / 0.6));
      const eased = 1 - Math.pow(1 - partProgress, 3); // Ease-out cubic
      const newY = part.startY - (part.startY - part.targetY) * eased;
      part.obj.position.y = newY;
      part.obj.rotation.y = (1 - eased) * Math.PI * part.rotationSpeed;
      
      // Add wobble during animation
      if (partProgress > 0 && partProgress < 1) {
        part.obj.rotation.x = Math.sin(partProgress * Math.PI * 4) * 0.1;
        part.obj.rotation.z = Math.cos(partProgress * Math.PI * 3) * 0.1;
      } else {
        part.obj.rotation.x = 0;
        part.obj.rotation.z = 0;
      }
    });
  }

  window.addEventListener('scroll', () => {
    let rawProgress = window.scrollY / maxScroll;
    scrollProgress = Math.min(rawProgress / 0.85, 1);
    updatePartsPosition();
  });

  // ============ ANIMATION LOOP ============
  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0001;
    camera.position.x = Math.sin(time) * 3;
    camera.position.z = 45 + Math.cos(time) * 2;
    camera.lookAt(0, 5, 0);
    renderer.render(scene, camera);
  }
  animate();

  // ============ WINDOW RESIZE ============
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Initial position update
  updatePartsPosition();
})();
particlesJS('particles-js', {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#F59E0B"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      }
    },
    "opacity": {
      "value": 0.3,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 2,
        "size_min": 0.5,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#F59E0B",
      "opacity": 0.2,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 1.5,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": {
          "opacity": 0.5
        }
      },
      "push": {
        "particles_nb": 4
      }
    }
  },
  "retina_detect": true
});