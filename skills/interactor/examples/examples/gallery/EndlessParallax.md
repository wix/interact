# Endless Parallax

An endless floating image gallery where tiles drift and wrap continuously across a full-viewport canvas driven by mouse cursor position, with subtle parallax depth layering per tile; clicking a tile opens a modal with a gallery blur-in animation.

**Tags:** click, pointerMove, gallery, fixed, opacity, transform, filter, parallax, blur, loop

## Markup

```html
<interact-element data-interact-key="#page-container">
  <div id="page-container">
    <div id="gallery-container">
      <div class="gallery-tile" data-id="0" tabindex="0">
        <img src="https://images.unsplash.com/photo-1579546929518-9e-396f3cc809?q=80&w=800&auto=format&fit=crop" alt="">
        <div class="gallery-tile-title">Vibrant Gradient</div>
      </div>
      <div class="gallery-tile" data-id="1" tabindex="0">
        <img src="https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=800&auto=format&fit=crop" alt="">
        <div class="gallery-tile-title">Cool Tones</div>
      </div>
      <div class="gallery-tile" data-id="2" tabindex="0">
        <img src="https://images.unsplash.com/photo-1614850523011-8f49ffc73908?q=80&w=800&auto=format&fit=crop" alt="">
        <div class="gallery-tile-title">Pastel Rainbow</div>
      </div>
      <div class="gallery-tile" data-id="3" tabindex="0">
        <img src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop" alt="">
        <div class="gallery-tile-title">Marble Swirl</div>
      </div>
      <div class="gallery-tile" data-id="4" tabindex="0">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd5afbe?q=80&w=800&auto=format&fit=crop" alt="">
        <div class="gallery-tile-title">Liquid Abstract</div>
      </div>
    </div>

    <div id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <button class="modal-close" id="modalClose" aria-label="Close enlarged view">&times;</button>
      <div class="modal-content">
        <img id="modalImage" src="" alt="">
        <div class="modal-text-overlay">
          <h1 id="modalTitle"></h1>
          <p id="modalDescription"></p>
        </div>
      </div>
    </div>

    <button id="openModalTrigger" style="display:none;"></button>
    <button id="closeModalTrigger" style="display:none;"></button>
  </div>
</interact-element>
```

## Essential styles

```css
:root {
  --drift-speed: 1;
  --tile-scale: 1;
  --num-tiles: 100;
}

html, body {
  margin: 0; padding: 0;
  width: 100%; height: 100%;
  overflow: hidden;
  background: #f8f5ee;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
}

#gallery-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  transition: filter 0.4s ease-out;
}

.gallery-tile {
  position: absolute;
  top: 0; left: 0;
  opacity: 0;
  border-radius: 8px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  will-change: transform, opacity;
  backface-visibility: hidden;
  contain: layout paint;
  overflow: hidden;
  cursor: pointer;
}

.gallery-tile:focus-visible {
  outline: 3px solid #007bff;
  outline-offset: 4px;
  border-radius: 8px;
}

.gallery-tile img {
  display: block;
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 8px;
  pointer-events: none;
  transition: transform 0.3s ease-out;
}

.gallery-tile:hover img {
  transform: scale(1.05);
}

.gallery-tile-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1rem 1rem;
  color: white;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  pointer-events: none;
}

.gallery-tile:hover .gallery-tile-title {
  opacity: 1;
  transform: translateY(0);
}

#modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
}

.modal-content {
  position: relative;
  background: transparent;
  max-width: 90vw; max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  transform: scale(0.8);
}

.modal-content img {
  display: block;
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.modal-text-overlay {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 60px 30px 30px;
  color: #fff;
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  border-radius: 0 0 8px 8px;
  box-sizing: border-box;
}

.modal-text-overlay h1 {
  margin: 0 0 10px;
  font-size: 2rem; font-weight: 700;
  text-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.modal-text-overlay p {
  margin: 0; font-size: 1.1rem;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  opacity: 0.9;
}

.modal-close {
  background: none; border: none; padding: 0; font: inherit;
  position: absolute; top: 20px; right: 20px;
  font-size: 2rem; color: #fff; cursor: pointer; line-height: 1;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  z-index: 1001; border-radius: 50%;
}

.modal-close:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
```

## Interact config

```js
{
  interactions: [
    {
      key: '#openModalTrigger', trigger: 'click',
      effects: [
        { key: '#modal', keyframeEffect: { name: 'modal-show',
            keyframes: [{ offset: 0, visibility: 'visible', opacity: 0 }, { offset: 1, opacity: 1 }],
            duration: 400, easing: 'ease-out', fill: 'forwards' } },
        { key: '.modal-content', keyframeEffect: { name: 'modal-content-scale-in',
            keyframes: [{ transform: 'scale(0.8)' }, { transform: 'scale(1)' }],
            duration: 400, easing: 'cubic-bezier(0.175,0.885,0.32,1.275)', fill: 'forwards' } },
        { key: '#gallery-container', keyframeEffect: { name: 'canvas-blur-in',
            keyframes: [{ filter: 'blur(0px)' }, { filter: 'blur(8px)' }],
            duration: 400, easing: 'ease-out', fill: 'forwards' } },
      ]
    },
    {
      key: '#closeModalTrigger', trigger: 'click',
      effects: [
        { key: '#modal', effectId: 'modal-fade-out', keyframeEffect: { name: 'modal-hide',
            keyframes: [{ opacity: 1 }, { opacity: 0 }],
            duration: 400, easing: 'ease-out', fill: 'forwards' } },
        { key: '.modal-content', keyframeEffect: { name: 'modal-content-scale-out',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }],
            duration: 400, easing: 'ease-out', fill: 'forwards' } },
        { key: '#gallery-container', effectId: 'canvas-unblur', keyframeEffect: { name: 'canvas-blur-out',
            keyframes: [{ filter: 'blur(8px)' }, { filter: 'blur(0px)' }],
            duration: 400, easing: 'ease-out', fill: 'forwards' } },
      ]
    },
    {
      key: '#modal', trigger: 'animationEnd', params: { effectId: 'modal-fade-out' },
      effects: [{ keyframeEffect: { name: 'set-modal-hidden',
        keyframes: [{ visibility: 'hidden' }], duration: 0, fill: 'forwards' } }]
    },
  ]
}
```

## Animation logic

```js
const IMAGE_DATA = [
  { src: 'https://images.unsplash.com/photo-1579546929518-9e-396f3cc809?q=80&w=800&auto=format&fit=crop', title: 'Vibrant Gradient', description: 'A soft, colorful gradient flows across the canvas, creating a dreamy and abstract mood.' },
  { src: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=800&auto=format&fit=crop', title: 'Cool Tones', description: 'Deep blues and purples blend together in a smooth, elegant, and modern background.' },
  { src: 'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?q=80&w=800&auto=format&fit=crop', title: 'Pastel Rainbow', description: 'A gentle spectrum of pastel colors provides a light and cheerful atmosphere.' },
  { src: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop', title: 'Marble Swirl', description: 'Elegant white and grey marble textures swirl together in a timeless, sophisticated pattern.' },
  { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd5afbe?q=80&w=800&auto=format&fit=crop', title: 'Liquid Abstract', description: 'Smooth, flowing lines of color create a sense of liquid motion and modern art.' },
  { src: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?q=80&w=800&auto=format&fit=crop', title: 'Sunset Haze', description: 'Warm colors of a sunset blend into a hazy, atmospheric and peaceful scene.' },
  { src: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=800&auto=format&fit=crop', title: 'Geometric Black', description: 'A dark, textured background with subtle geometric patterns for a modern, sleek look.' },
  { src: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?q=80&w=800&auto=format&fit=crop', title: 'Misty Forest', description: 'Sunlight filters through a misty forest, creating a serene and ethereal landscape.' },
  { src: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=800&auto=format&fit=crop', title: 'Holographic Shine', description: 'A vibrant, iridescent texture that shifts colors like a hologram.' },
  { src: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop', title: 'Field of Flowers', description: 'A beautiful field of yellow flowers under a bright, clear sky.' },
  { src: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=800&auto=format&fit=crop', title: 'Mountain Sunrise', description: 'A stunning sunrise over layers of mountains and fog.' },
  { src: 'https://images.unsplash.com/photo-1542281286-9e0e16bb7366?q=80&w=800&auto=format&fit=crop', title: 'Cherry Blossoms', description: 'A close-up of delicate pink cherry blossoms in full bloom.' },
  { src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop', title: 'Northern Lights', description: 'The aurora borealis lights up the night sky over a snowy landscape.' },
  { src: 'https://images.unsplash.com/photo-1502602898657-3e91760c0337?q=80&w=800&auto=format&fit=crop', title: 'Eiffel Tower', description: 'A classic view of the Eiffel Tower in Paris, France.' },
  { src: 'https://images.unsplash.com/photo-1533109721025-d1ae7de8c784?q=80&w=800&auto=format&fit=crop', title: 'Ocean Waves', description: 'Deep blue ocean waves crashing with white foam.' },
  { src: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=800&auto=format&fit=crop', title: 'Galaxy View', description: 'A mesmerizing view of the milky way galaxy in the night sky.' },
  { src: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=800&auto=format&fit=crop', title: 'Forest Canopy', description: 'An aerial view of a lush green forest canopy.' },
  { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', title: 'Misty Mountains', description: 'Layers of mountains fading into the distance in a thick mist.' },
  { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop', title: 'Green Hills', description: 'Rolling green hills under a dramatic, cloudy sky.' },
  { src: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=800&auto=format&fit=crop', title: 'Lakeside Dock', description: 'A peaceful wooden dock stretching out into a calm, clear lake.' },
];

const BASE_IMAGE_SCALE = 0.85;
const MAX_VELOCITY = 4;
const DAMPING = 0.97;
const IDLE_DRIFT_SPEED = 0.1;
const PARALLAX_SCALE_MIN = 0.95;
const PARALLAX_SCALE_MAX = 1.05;
const PARALLAX_ALPHA_MIN = 1.00;
const PARALLAX_ALPHA_MAX = 1.00;

let NUM_TILES = 100;
let tiles = [];
let camera = { x: 0, y: 0 };
let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
let velocity = { x: IDLE_DRIFT_SPEED, y: IDLE_DRIFT_SPEED };
let worldSize = { width: 0, height: 0 };
let isModalVisible = false;
let driftSpeed = 1;
let tileScaleFactor = 1;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const norm = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;

function readCssVars() {
  const cs = getComputedStyle(document.documentElement);
  driftSpeed = parseFloat(cs.getPropertyValue('--drift-speed')) || 1;
  tileScaleFactor = parseFloat(cs.getPropertyValue('--tile-scale')) || 1;
  const newNum = parseInt(cs.getPropertyValue('--num-tiles')) || 100;
  if (newNum !== NUM_TILES) {
    NUM_TILES = newNum;
    createAndLoadTiles();
  }
}

function resizeWorld() {
  worldSize.width = innerWidth * 5;
  worldSize.height = innerHeight * 5;
}

function createAndLoadTiles() {
  const galleryContainer = document.getElementById('gallery-container');
  galleryContainer.innerHTML = '';
  tiles = [];
  const imagePool = [...IMAGE_DATA, ...IMAGE_DATA, ...IMAGE_DATA, ...IMAGE_DATA, ...IMAGE_DATA];
  for (let i = 0; i < NUM_TILES; i++) {
    const data = imagePool[i % imagePool.length];
    const parallax = 0.5 + Math.random() * 1.0;
    const tileEl = document.createElement('div');
    tileEl.className = 'gallery-tile';
    tileEl.dataset.id = i;
    tileEl.tabIndex = 0;
    const imgEl = new Image();
    imgEl.src = data.src;
    const titleEl = document.createElement('div');
    titleEl.className = 'gallery-tile-title';
    titleEl.textContent = data.title;
    tileEl.appendChild(imgEl);
    tileEl.appendChild(titleEl);
    galleryContainer.appendChild(tileEl);
    const tile = {
      ...data, id: i, el: tileEl, isLoaded: false, hasPoppedIn: false,
      currentScale: 0,
      x: Math.random() * worldSize.width,
      y: Math.random() * worldSize.height,
      width: 0, height: 0, parallax, zIndex: 0
    };
    imgEl.onload = () => {
      tile.isLoaded = true;
      const aspect = imgEl.naturalWidth / imgEl.naturalHeight;
      tile.width = 400 * (BASE_IMAGE_SCALE * parallax);
      tile.height = tile.width / aspect;
      tile.el.style.width = `${tile.width}px`;
      tile.el.style.height = `${tile.height}px`;
    };
    imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x300/f8f5ee/333?text=Image+Failed'; };
    tiles.push(tile);
  }
  tiles.sort((a, b) => a.parallax - b.parallax).forEach((tile, idx) => {
    tile.zIndex = idx;
    tile.depthScale = lerp(PARALLAX_SCALE_MIN, PARALLAX_SCALE_MAX, norm(tile.parallax, 0.5, 1.5));
    tile.depthAlpha = lerp(PARALLAX_ALPHA_MIN, PARALLAX_ALPHA_MAX, norm(tile.parallax, 0.5, 1.5));
  });
}

function animate() {
  const dx = (mouse.x - innerWidth / 2) / (innerWidth / 2);
  const dy = (mouse.y - innerHeight / 2) / (innerHeight / 2);
  velocity.x += dx * 0.05;
  velocity.y += dy * 0.05;
  velocity.x *= DAMPING;
  velocity.y *= DAMPING;
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed < 0.05) {
    velocity.x += (Math.random() - 0.5) * 0.02;
    velocity.y += (Math.random() - 0.5) * 0.02;
  }
  velocity.x = clamp(velocity.x, -MAX_VELOCITY, MAX_VELOCITY);
  velocity.y = clamp(velocity.y, -MAX_VELOCITY, MAX_VELOCITY);
  camera.x += velocity.x * driftSpeed;
  camera.y += velocity.y * driftSpeed;
  updateTilesDOM();
  requestAnimationFrame(animate);
}

function updateTilesDOM() {
  tiles.forEach(tile => {
    if (!tile.isLoaded) return;
    if (!tile.hasPoppedIn) {
      tile.currentScale += (1 - tile.currentScale) * 0.08;
      tile.el.style.opacity = (tile.depthAlpha * tile.currentScale).toFixed(3);
      if (Math.abs(1 - tile.currentScale) < 0.001) {
        tile.currentScale = 1;
        tile.hasPoppedIn = true;
        tile.el.style.opacity = tile.depthAlpha.toString();
        tile.el.style.willChange = 'transform';
      }
    }
    const px = tile.parallax;
    let drawX = tile.x - camera.x * px;
    let drawY = tile.y - camera.y * px;
    const s = tile.currentScale * tile.depthScale * tileScaleFactor;
    const toVisRight = tile.width * (1 + s) / 2;
    const toVisBottom = tile.height * (1 + s) / 2;
    drawX = ((drawX + toVisRight) % worldSize.width + worldSize.width) % worldSize.width - toVisRight;
    drawY = ((drawY + toVisBottom) % worldSize.height + worldSize.height) % worldSize.height - toVisBottom;
    tile.x = drawX + camera.x * px;
    tile.y = drawY + camera.y * px;
    tile.el.style.transform = `translate(${drawX}px, ${drawY}px) scale(${s})`;
  });
}

function openModal(tile) {
  isModalVisible = true;
  document.getElementById('modalImage').src = tile.src;
  document.getElementById('modalImage').alt = tile.title;
  document.getElementById('modalTitle').textContent = tile.title;
  document.getElementById('modalDescription').textContent = tile.description;
  document.getElementById('openModalTrigger').click();
}

function closeModal() {
  isModalVisible = false;
  document.getElementById('closeModalTrigger').click();
}

const galleryContainer = document.getElementById('gallery-container');
const modal = document.getElementById('modal');

galleryContainer.addEventListener('click', e => {
  if (isModalVisible) return;
  const tileEl = e.target.closest('.gallery-tile');
  if (tileEl) {
    const tile = tiles.find(t => t.id === parseInt(tileEl.dataset.id, 10));
    if (tile) openModal(tile);
  }
});

galleryContainer.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    const tileEl = e.target.closest('.gallery-tile');
    if (tileEl) {
      e.preventDefault();
      const tile = tiles.find(t => t.id === parseInt(tileEl.dataset.id, 10));
      if (tile) openModal(tile);
    }
  }
});

document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && isModalVisible) closeModal(); });
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('resize', () => { resizeWorld(); createAndLoadTiles(); });

new MutationObserver(() => readCssVars())
  .observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

resizeWorld();
createAndLoadTiles();
animate();
```
