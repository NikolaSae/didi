// SVG PATH FLOW EFFECT
const canvas = document.getElementById('pathCanvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

// SVG FILE PATH - PROMENI OVO SA SVOJIM FAJLOM
const svgFilePath = './logotest27.svg'; // Stavi svoj SVG fajl ovde

let pathPoints = [];
let pathLength = 0;
let particles = [];
let animationRunning = true;

// SETTINGS - Optimized for smooth background effect
let opts = {
    particleCount: 20,
    speed: 1,
    trailAlpha: 0.02,
    particleSize: 1.5,
    glow: 0,
    colorCycleSpeed: 0.6
};

// Default values for reset
const defaultOpts = { ...opts };

// PARTICLE CLASS
class Particle {
    constructor(startOffset = null) {
        this.offset = startOffset !== null ? startOffset : Math.random();
        this.speed = 0.0001 + Math.random() * 0.0001;
        this.hue = Math.random() * 360;
        this.hueSpeed = (Math.random() - 0.5) * opts.colorCycleSpeed;
        this.size = opts.particleSize * (0.5 + Math.random() * 0.5);
    }
    
    update() {
        this.offset += this.speed * opts.speed;
        
        if (this.offset >= 1) {
            this.offset = 0;
        }
        
        this.hue += this.hueSpeed;
        if (this.hue < 0) this.hue += 360;
        if (this.hue > 360) this.hue -= 360;
    }
    
    getPosition() {
        if (!pathPoints || pathPoints.length < 2) {
            return { x: w/2, y: h/2 };
        }
        
        const index = Math.floor(this.offset * (pathPoints.length - 1));
        const nextIndex = Math.min(index + 1, pathPoints.length - 1);
        const t = (this.offset * (pathPoints.length - 1)) - index;
        
        const p1 = pathPoints[index];
        const p2 = pathPoints[nextIndex];
        
        return {
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
        };
    }
    
    draw() {
        const pos = this.getPosition();
        
        ctx.shadowBlur = opts.glow;
        ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// LOAD SVG FILE
async function loadSVGFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load SVG: ${response.status}`);
        }
        
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        const paths = svgDoc.querySelectorAll('path');
        let allPathsData = [];
        
        paths.forEach((path, index) => {
            const d = path.getAttribute('d');
            if (d && d.trim().length > 0) {
                console.log(`📌 Found path ${index + 1}`);
                allPathsData.push(d);
            }
        });
        
        if (allPathsData.length === 0) {
            throw new Error('No paths found in SVG file');
        }
        
        const combinedPath = allPathsData.join(' ');
        console.log(`✅ Combined ${allPathsData.length} path(s) from ${filePath}`);
        
        init(combinedPath);
        
    } catch (error) {
        console.error('❌ Error loading SVG:', error);
        console.log('🔄 Creating fallback circle animation...');
        createFallbackPath();
    }
}

// FALLBACK PATH (circle)
function createFallbackPath() {
    pathPoints = [];
    for (let i = 0; i < 360; i++) {
        pathPoints.push({
            x: w/2 + Math.cos(i * Math.PI / 180) * 200,
            y: h/2 + Math.sin(i * Math.PI / 180) * 200
        });
    }
    initParticles();
    animate();
}

// EXTRACT POINTS FROM SVG PATH
function extractPathPoints(pathString) {
    try {
        const pathElement = document.getElementById('mainPath');
        pathElement.setAttribute('d', pathString);
        
        const rawPoints = [];
        const totalLength = pathElement.getTotalLength();
        
        if (!totalLength || totalLength === 0 || isNaN(totalLength)) {
            console.error('❌ Invalid path length');
            return null;
        }
        
        pathLength = totalLength;
        console.log(`📏 Path length: ${Math.floor(totalLength)}px`);
        
        const numPoints = Math.min(2000, Math.max(500, Math.floor(totalLength / 2)));
        
        for (let i = 0; i <= numPoints; i++) {
            const point = pathElement.getPointAtLength((i / numPoints) * totalLength);
            rawPoints.push({ x: point.x, y: point.y });
        }
        
        // Calculate bounding box
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        rawPoints.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });
        
        const pathWidth = maxX - minX;
        const pathHeight = maxY - minY;
        
        // Scale to fit screen (95% of viewport width)
        const targetSize = w * 0.95;
        const scale = targetSize / Math.max(pathWidth, pathHeight);
        
        // Center and scale
        const scaledPoints = rawPoints.map(p => ({
            x: (p.x - minX) * scale + (w - pathWidth * scale) / 2,
            y: (p.y - minY) * scale + (h - pathHeight * scale) / 2
        }));
        
        console.log(`✅ Extracted ${scaledPoints.length} points`);
        return scaledPoints;
        
    } catch (error) {
        console.error('❌ Error extracting path points:', error);
        return null;
    }
}

// INITIALIZE
function init(pathString) {
    console.log('🔄 Initializing path flow...');
    
    pathPoints = extractPathPoints(pathString);
    
    if (!pathPoints || pathPoints.length < 2) {
        console.log('⚠️ Using fallback path');
        createFallbackPath();
        return;
    }
    
    initParticles();
    animate();
}

function initParticles() {
    particles = [];
    for (let i = 0; i < opts.particleCount; i++) {
        particles.push(new Particle(i / opts.particleCount));
    }
    console.log(`✅ Created ${particles.length} particles`);
}

// ANIMATION LOOP
function animate() {
    if (!animationRunning) return;
    
    requestAnimationFrame(animate);
    
    // Trail effect
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0, 0, 0, ${opts.trailAlpha})`;
    ctx.fillRect(0, 0, w, h);
    
    // Draw particles with additive blending
    ctx.globalCompositeOperation = 'lighter';
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
}

// RESIZE HANDLER
window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    
    // Reinitialize with current path if available
    if (pathPoints.length > 0) {
        const pathElement = document.getElementById('mainPath');
        const pathData = pathElement.getAttribute('d');
        if (pathData) {
            pathPoints = extractPathPoints(pathData);
        }
    }
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
});

// START
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, w, h);

// Load SVG and start animation
loadSVGFile(svgFilePath);

// UI CONTROLS
const controlsToggle = document.getElementById('controlsToggle');
const controlsContent = document.getElementById('controlsContent');
const resetBtn = document.getElementById('resetBtn');

// Toggle controls panel
controlsToggle.addEventListener('click', () => {
    controlsContent.classList.toggle('active');
});

// Particle Count
document.getElementById('particleCount').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    document.getElementById('particleCountValue').textContent = value;
    opts.particleCount = value;
    initParticles();
});

// Particle Size
document.getElementById('particleSize').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById('particleSizeValue').textContent = value.toFixed(1);
    opts.particleSize = value;
    particles.forEach(p => {
        p.size = opts.particleSize * (0.5 + Math.random() * 0.5);
    });
});

// Speed
document.getElementById('speed').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = value.toFixed(1);
    opts.speed = value;
});

// Trail Alpha
document.getElementById('trailAlpha').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById('trailAlphaValue').textContent = value.toFixed(3);
    opts.trailAlpha = value;
});

// Glow
document.getElementById('glow').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    document.getElementById('glowValue').textContent = value;
    opts.glow = value;
});

// Reset to defaults
resetBtn.addEventListener('click', () => {
    Object.assign(opts, defaultOpts);
    
    document.getElementById('particleCount').value = defaultOpts.particleCount;
    document.getElementById('particleCountValue').textContent = defaultOpts.particleCount;
    
    document.getElementById('particleSize').value = defaultOpts.particleSize;
    document.getElementById('particleSizeValue').textContent = defaultOpts.particleSize.toFixed(1);
    
    document.getElementById('speed').value = defaultOpts.speed;
    document.getElementById('speedValue').textContent = defaultOpts.speed.toFixed(1);
    
    document.getElementById('trailAlpha').value = defaultOpts.trailAlpha;
    document.getElementById('trailAlphaValue').textContent = defaultOpts.trailAlpha.toFixed(3);
    
    document.getElementById('glow').value = defaultOpts.glow;
    document.getElementById('glowValue').textContent = defaultOpts.glow;
    
    initParticles();
});

console.log('🚀 DIDI Website Loaded - SVG Path Flow Active');