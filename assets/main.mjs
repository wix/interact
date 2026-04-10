// WIX INTERACT RUNTIME
import { Interact } from './lib/interact/es/web.js';
import * as presets from './lib/motion-presets/motion-presets.js';

// =============================================================================
// FUNCTIONS & METHODS
// =============================================================================

// --- Hero Grid Functions ---
const gridContainer = document.getElementById('grid-container');
const lineCache = new Map();
const lineStates = new Map();
// let centerX, centerY, maxDist;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

/* this is the old grid function
function updateGrid() {
  gridContainer.innerHTML = '';
  lineCache.clear();
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  const cellSize = 40;
  const containerWidth = gridContainer.offsetWidth || windowWidth;
  const containerHeight = gridContainer.offsetHeight || windowHeight;
  const cols = Math.ceil(containerWidth / cellSize);
  const rows = Math.ceil(containerHeight / cellSize);
  const neededCells = cols * rows;

  gridContainer.style.display = 'grid';
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < neededCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    const line = document.createElement('div');
    line.className = 'grid-line';
    cell.appendChild(line);
    fragment.appendChild(cell);
  }
  gridContainer.appendChild(fragment);

  centerX = windowWidth / 2;
  centerY = windowHeight / 2;
  maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  const lines = document.getElementsByClassName('grid-line');
  for (let line of lines) {
    const rect = line.getBoundingClientRect();
    lineCache.set(line, {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY,
    });
  }
}
*/

function buildGrid() {
  gridContainer.innerHTML = '';
  lineCache.clear();
  lineStates.clear();

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  const cellSize = 40;
  const containerWidth = gridContainer.offsetWidth || windowWidth;
  const containerHeight = gridContainer.offsetHeight || windowHeight;
  const cols = Math.ceil(containerWidth / cellSize);
  const rows = Math.ceil(containerHeight / cellSize);
  const neededCells = cols * rows;

  gridContainer.style.display = 'grid';
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < neededCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    const line = document.createElement('div');
    line.className = 'grid-line';
    cell.appendChild(line);
    fragment.appendChild(cell);
  }
  gridContainer.appendChild(fragment);

  const lines = document.getElementsByClassName('grid-line');
  for (let line of lines) {
    const rect = line.getBoundingClientRect();
    lineCache.set(line, {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + rect.height / 2 + window.scrollY,
    });

    lineStates.set(line, {
      currentAngle: 0,
      angleVelocity: 0,
      currentScale: 0.2,
      scaleVelocity: 0,
      currentOpacity: 0.3,
    });
  }
}

const pointerMoveEffect = (element, progress) => {
  mouseX = progress.x * windowWidth;
  mouseY = progress.y * windowHeight;
};

const gridWaveEffect = (element, progress) => {
  const time = progress * Math.PI * 2 * 10;
  for (const [line, cache] of lineCache) {
    const state = lineStates.get(line);
    if (!state) continue;

    const dx = mouseX - cache.x;
    const dy = mouseY - cache.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    const maxDist = 800;
    const distRatio = Math.min(1, dist / maxDist);

    const easedDistRatio = Math.pow(distRatio, 0.35);

    const stiffness = 0.35 - easedDistRatio * 0.32;
    const damping = 0.82 - easedDistRatio * 0.12;

    let angleDiff = targetAngle - state.currentAngle;
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;

    const springForce = angleDiff * stiffness * (1 + Math.abs(angleDiff) * 0.002);

    const velocityFactor = Math.abs(state.angleVelocity) / 25;
    const dynamicDamping = damping - velocityFactor * 0.08;

    state.angleVelocity += springForce;
    state.angleVelocity *= Math.max(0.6, dynamicDamping);

    state.angleVelocity = Math.max(-25, Math.min(25, state.angleVelocity));
    state.currentAngle += state.angleVelocity;

    if (state.currentAngle > 360) state.currentAngle -= 360;
    if (state.currentAngle < -360) state.currentAngle += 360;

    const wavePhase = time - Math.pow(dist, 1.15) * 0.004;
    const wave = Math.sin(wavePhase);
    const normalizedWave = (wave + 1) / 2;

    const distFactor = Math.min(1, dist / 1500);
    const minScale = 0.2;
    const growthAmplitude = 1.2 * (1 - distFactor);
    const baseScale = minScale + growthAmplitude * normalizedWave;

    const velocityStretch = 1 + (Math.abs(state.angleVelocity) / 25) * 0.6;
    const targetScale = baseScale * velocityStretch;

    const scaleDiff = targetScale - state.currentScale;
    const scaleStiffness = stiffness * 1.2;
    state.scaleVelocity += scaleDiff * scaleStiffness;
    state.scaleVelocity *= damping;
    state.currentScale += state.scaleVelocity;

    state.currentScale = Math.max(0.1, state.currentScale);

    const targetOpacity = 0.3 + 0.7 * normalizedWave * (1 - distFactor * 0.5);
    state.currentOpacity += (targetOpacity - state.currentOpacity) * stiffness * 0.5;

    const hideRadius = 25;
    const fadeZone = 40;
    let proximityMask = (dist - hideRadius) / fadeZone;
    proximityMask = Math.max(0, Math.min(1, proximityMask));

    line.style.transform = `rotate(${state.currentAngle}deg) scaleY(${state.currentScale * proximityMask})`;
    line.style.opacity = state.currentOpacity * proximityMask;
  }
};

/* this is the old desktop effect with the mouse movement... I added a new effect that also uses mouse
movement but it's a bit different. It's a bit more subtle and it's more like a wind effect.
function rotateGridEffect(_containerElement, progress) {
  const mouseX = progress.x * windowWidth;
  const mouseY = progress.y * windowHeight;

  const screenDiagonal = Math.sqrt(windowWidth ** 2 + windowHeight ** 2);

  for (const [line, cache] of lineCache) {
    const deltaX = mouseX - cache.x;
    const deltaY = mouseY - cache.y;
    const distFromMouse = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    const distFromCenter = Math.sqrt(
      Math.pow(cache.x - centerX, 2) + Math.pow(cache.y - centerY, 2),
    );
    const lengthScale = 1 + (distFromCenter / maxDist) * 1.5;

    let moveX = 0;
    let moveY = 0;
    if (distFromMouse > 0) {
      const influence = Math.max(0, 1 - distFromMouse / (screenDiagonal * 1.2));
      const pullFactor = influence;
      const maxMove = 60;
      moveX = (deltaX / distFromMouse) * (maxMove * pullFactor);
      moveY = (deltaY / distFromMouse) * (maxMove * pullFactor);
    }
    line.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${angle}deg) scaleY(${lengthScale})`;
  }
}
*/
/* OPTION 2: this is the second iteration of the grid effect with the mouse movement... 
it's a bit different. It's a bit more subtle and it's more like a wind effect.
const rotateGridEffect = (containerElement, progress) => {
    const mouseX = progress.x * windowWidth;
    const mouseY = progress.y * windowHeight;
    
    for (const [line, cache] of lineCache) {
        const dx = mouseX - cache.x;
        const dy = mouseY - cache.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = dist * 0.5;
        const influenceRadius = 3000;
        const rawProximity = Math.max(0, 1 - dist / influenceRadius);
        const proximity = Math.pow(rawProximity, 1.5); 
        const scale = 1 + (proximity * 0.9);
        const twist = proximity * 100;
        line.style.transform = `rotate(${angle + 45 + twist}deg) scaleY(${scale})`;
    }
};
*/

const rotateGridEffectMobile = (containerElement, progress) => {
  const time = progress * Math.PI * 2 * 3; // 3 full wave cycles per animation loop

  for (const [line, cache] of lineCache) {
    const dist = cache.x + cache.y;
    const spatialPhase = dist * 0.004;
    const wave = Math.sin(time - spatialPhase);
    const windForce = (wave + 1) / 2;
    const sharpWind = Math.pow(windForce, 2);
    const angle = sharpWind * 360;
    const scale = 1 + sharpWind * 0.4;
    line.style.transform = `rotate(${angle}deg) scaleY(${scale})`;
  }
};

// --- Tunnel Effect Functions ---
const NUM_CIRCLES = 45;
const tunnelRings = [];
let cx = 0;
let cy = 0;
let tunnelSceneRect = { top: 0, left: 0, width: 0, height: 0 };
const tunnelSceneContainer = document.getElementById('tunnel-scene-container');

function updateTunnelBounds() {
  if (tunnelSceneContainer) {
    const rect = tunnelSceneContainer.getBoundingClientRect();
    tunnelSceneRect = rect;
    cx = rect.width / 2;
    cy = rect.height / 2;
  }
}

function generateTunnel() {
  const container = document.getElementById('tunnel-container');
  if (!container) return;
  container.innerHTML = '';
  tunnelRings.length = 0;

  for (let i = 0; i < NUM_CIRCLES; i++) {
    const circle = document.createElement('div');
    circle.classList.add('tunnel-circle');

    circle.style.position = 'absolute';
    circle.style.top = '50%';
    circle.style.left = '50%';

    const normalizedDepth = i / NUM_CIRCLES;
    const alpha = 0.05 + (1 - normalizedDepth) * 0.95;
    circle.style.borderColor = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
    circle.style.transform = 'translate(-50%, -50%)';

    const scale = 100 * Math.pow(0.91, i);
    circle.style.width = `${scale}%`;
    circle.style.height = `${scale}%`;
    circle.style.zIndex = NUM_CIRCLES - i;

    container.appendChild(circle);

    const easeVariance = 0.85 + Math.random() * 0.3;

    tunnelRings.push({
      element: circle,
      x: 0,
      y: 0,
      factor: ((NUM_CIRCLES - i) / NUM_CIRCLES) * 0.03,
      easeVariance: easeVariance,
    });
  }
}

const animateTunnel = (_rootElement, progress) => {
  const localMouseX = progress.x * windowWidth;
  const localMouseY = progress.y * windowHeight;

  const targetX = localMouseX - cx;
  const targetY = localMouseY - cy;

  const dist = Math.sqrt(targetX * targetX + targetY * targetY);
  const maxDistLocal = Math.max(cx, cy) || 1;

  const normalizedDist = dist / maxDistLocal;
  const stretch = 1 + Math.pow(normalizedDist, 1.2) * 2.0;

  tunnelRings.forEach((ring, index) => {
    const targetMoveX = targetX * ring.factor * stretch;
    const targetMoveY = targetY * ring.factor * stretch;

    let baseEase = 0.08 + 0.02 * (1 - index / NUM_CIRCLES);
    const finalEase = baseEase * ring.easeVariance;

    ring.x += (targetMoveX - ring.x) * finalEase;
    ring.y += (targetMoveY - ring.y) * finalEase;

    ring.element.style.transform = `translate(-50%, -50%) translate3d(${ring.x}px, ${ring.y}px, 0)`;
  });
};

const animateTunnelMobile = (_rootElement, progress) => {
  const normalizedProgress = (progress - 0.05) * 2;

  const wavePhase = progress * Math.PI * 5;
  const slowWave = Math.sin(wavePhase * 0.5);
  const fastWave = Math.sin(wavePhase * 2.5);

  tunnelRings.forEach((ring, index) => {
    const depth = 1 - index / NUM_CIRCLES;
    const depthCubed = Math.pow(depth, 4.5);

    const baseY = normalizedProgress * depthCubed;
    const waveY = slowWave * 5 * depth;
    const targetY = baseY + waveY;

    const sway = fastWave * 50 * depthCubed;
    const drift = Math.sin(wavePhase + index * 0.3) * 8 * depth;
    const targetX = sway + drift;

    const breathe = 1 + slowWave * 0.08 * depth;
    const zoomPush = 1 + normalizedProgress * 0.15 * depthCubed;
    const targetScale = breathe * zoomPush;

    const tiltAmount = normalizedProgress * 3 * depthCubed;
    const spinOffset = fastWave * 1.5 * depth;
    const targetRotation = tiltAmount + spinOffset;

    const ease = 0.02 + 0.08 * depth;
    ring.x = ring.x || 0;
    ring.y = ring.y || 0;
    ring.scale = ring.scale || 1;
    ring.rotation = ring.rotation || 0;

    ring.x += (targetX - ring.x) * ease;
    ring.y += (targetY - ring.y) * ease;
    ring.scale += (targetScale - ring.scale) * ease * 0.5;
    ring.rotation += (targetRotation - ring.rotation) * ease;

    ring.element.style.transform = `translate(-50%, -50%) translate3d(${ring.x}px, ${ring.y}px, 0) scale(${ring.scale}) rotate(${ring.rotation}deg)`;
  });
};

// --- Mouse Track Tunnel Functions ---
function generateMouseTunnel() {
  const mount = document.getElementById('mt-tunnel-mount');
  if (!mount) return;
  const DEPTH = 12;
  let currentParent = mount;

  for (let i = 0; i < DEPTH; i++) {
    const circle = document.createElement('div');

    if (i === 0) {
      circle.classList.add('ring-base', 'tunnel-static');
      mount.appendChild(circle);

      const moverRoot = document.createElement('div');
      moverRoot.classList.add('ring-base');
      moverRoot.style.border = 'none';
      moverRoot.style.width = '100%';
      moverRoot.style.height = '100%';

      mount.appendChild(moverRoot);
      currentParent = moverRoot;
    } else {
      circle.classList.add('tunnel-moving', 'ring-base');
      circle.style.position = 'relative';
      currentParent.appendChild(circle);
      currentParent = circle;
    }
  }
}

// --- Primitive Interaction Generator ---
function generateCircleInteractions(prefix) {
  return [
    {
      key: `${prefix}-circle-1`,
      trigger: 'hover',
      effects: [
        {
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1.1)' }],
          },
        },
        {
          selector: '.fill-circle',
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1)' }],
          },
        },
        {
          key: `${prefix}-circle-2`,
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translate(20px, -20px)' }],
          },
        },
        {
          key: `${prefix}-circle-3`,
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translate(20px, -20px)' }],
          },
        },
      ],
    },
    {
      key: `${prefix}-circle-2`,
      trigger: 'hover',
      effects: [
        {
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1.1)' }],
          },
        },
        {
          selector: '.fill-circle',
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1)' }],
          },
        },
        {
          key: `${prefix}-circle-1`,
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translate(-20px, 20px)' }],
          },
        },
        {
          key: `${prefix}-circle-3`,
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translate(20px, -20px)' }],
          },
        },
      ],
    },
    {
      key: `${prefix}-circle-3`,
      trigger: 'hover',
      effects: [
        {
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1.1)' }],
          },
        },
        {
          selector: '.fill-circle',
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1)' }],
          },
        },
        {
          key: `${prefix}-circle-1`,
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translate(-20px, 20px)' }],
          },
        },
        {
          key: `${prefix}-circle-2`,
          transition: {
            duration: 400,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'translate(-20px, 20px)' }],
          },
        },
      ],
    },
  ];
}

// --- Geometry Helper ---
function shouldExist(x, y, z) {
  return [x, y, z].filter((c) => c === 0).length < 2;
}

// --- Sponge Geometry Generator ---
function generateSpongeGeometry() {
  const spongeContainer = document.getElementById('sponge');
  if (!spongeContainer) return;

  const HS = 30; // Half size
  const fragment = document.createDocumentFragment();

  const transformTemplates = [
    `rotateY(0deg) translateZ(${HS}px)`,
    `rotateY(180deg) translateZ(${HS}px)`,
    `rotateY(90deg) translateZ(${HS}px)`,
    `rotateY(-90deg) translateZ(${HS}px)`,
    `rotateX(90deg) translateZ(${HS}px)`,
    `rotateX(-90deg) translateZ(${HS}px)`,
  ];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (shouldExist(x, y, z)) {
          const voxel = document.createElement('div');
          voxel.className = 'voxel';
          voxel.style.setProperty('--x', x);
          voxel.style.setProperty('--y', y);
          voxel.style.setProperty('--z', z);

          for (let i = 0; i < transformTemplates.length; i++) {
            const face = document.createElement('div');
            face.className = 'cube-face';
            face.style.transform = transformTemplates[i];
            voxel.appendChild(face);
          }

          fragment.appendChild(voxel);
        }
      }
    }
  }

  spongeContainer.appendChild(fragment);
}

// =============================================================================
// CONFIGURATIONS
// =============================================================================

// --- Animation Presets ---
const FADE_UP_OPTS = { type: 'FadeIn', direction: 'bottom', distance: '60px' };
const CLICK_EASING = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
const ENTRANCE_DURATION = 1000;
const ENTRANCE_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const ENTRANCE_OFFSET = '50px';
const ENTRANCE_SLIDE_DIST = '120px';
const mobileEasing = 'cubic-bezier(0.25, 1, 0.5, 1)';

const HOVER_SCALE = {
  name: 'hoverScale',
  keyframes: [
    { transform: 'scale(1)', offset: 0 },
    { transform: 'scale(1.02)', offset: 1 },
  ],
};

const TILT_UP_OPTS = {
  name: 'tiltUp',
  keyframes: [
    {
      opacity: 0,
      transform: 'translateY(80px) rotateX(60deg) scale(0.9)',
      transformOrigin: 'center top',
    },
    {
      opacity: 1,
      transform: 'translateY(0) rotateX(0deg) scale(1)',
      transformOrigin: 'center top',
    },
  ],
};

// --- Generated Primitive Interactions ---
const primitivePrefixes = ['hover'];
const primitiveInteractions = primitivePrefixes.flatMap((prefix) =>
  generateCircleInteractions(prefix),
);

// --- Interact Configuration ---
const config = {
  conditions: {
    Mobile: {
      type: 'media',
      predicate: '(max-width: 1000px)',
    },
    Desktop: {
      type: 'media',
      predicate: '(min-width: 1001px)',
    },

    // Hover media queries, when you hover over the page, in mobile
    hover: {
      type: 'media',
      predicate: '(hover: hover)',
    },
    notHover: {
      type: 'media',
      predicate: 'not (hover: hover)',
    },
  },

  effects: {
    spongeTumble: {
      key: 'sponge',
      duration: 20000,
      iterations: Infinity,
      easing: 'linear',
      fill: 'both',
      composite: 'replace',
      keyframeEffect: {
        keyframes: [
          { transform: 'rotate3d(1, 1, 1, 0deg)' },
          { transform: 'rotate3d(1, 1, 1, 360deg)' },
        ],
      },
    },
    spongeExplode: {
      key: 'sponge',
      duration: 1400,
      easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
      fill: 'both',
      composite: 'replace',
      keyframeEffect: {
        keyframes: [{ '--spacing': '0px' }, { '--spacing': '100px' }],
      },
    },
    spongeExplodeMobile: {
      key: 'sponge',
      duration: 3600,
      fill: 'both',
      composite: 'replace',
      keyframeEffect: {
        keyframes: [
          { '--spacing': '0px', offset: 0, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' },
          { '--spacing': '100px', offset: 0.5, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' },
          { '--spacing': '100px', offset: 0.667, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' },
          { '--spacing': '0px', offset: 1 },
        ],
      },
    },
  },

  interactions: [
    // Text Entrance
    {
      key: 'perf-text',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 1000,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        },
      ],
    },
    {
      key: 'perf-text-2',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 1000,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        },
      ],
    },

    // Sponge Tumble (Continuous)
    {
      key: 'sponge',
      trigger: 'pageVisible',
      effects: [{ effectId: 'spongeTumble' }],
    },

    // Sponge Explode (Hover)
    {
      key: 'hitbox',
      trigger: 'hover',
      conditions: ['Desktop'],
      params: { type: 'alternate' },
      effects: [{ effectId: 'spongeExplode' }],
    },
    {
      key: 'hitbox',
      trigger: 'viewEnter',
      params: { type: 'alternate' },
      effects: [
        {
          conditions: ['Mobile'],
          effectId: 'spongeExplodeMobile',
        },
      ],
    },

    // Hero Grid Interaction
    {
      key: 'hero-grid',
      trigger: 'pointerMove',
      params: { hitArea: 'root' },
      conditions: ['Desktop'],
      effects: [{ customEffect: pointerMoveEffect, centeredToTarget: true }],
    },

    {
      key: 'hero-grid',
      trigger: 'viewEnter',
      params: { type: 'once' },
      conditions: ['Desktop'],
      effects: [
        {
          customEffect: gridWaveEffect,
          duration: 16000,
          iterations: Infinity,
          easing: 'linear',
        },
      ],
    },

    {
      key: 'hero-grid',
      trigger: 'viewEnter',
      params: { type: 'once' },
      conditions: ['Mobile'],
      effects: [
        {
          customEffect: rotateGridEffectMobile,
          duration: 8000,
          iterations: Infinity,
          easing: 'linear',
        },
      ],
    },
    // Hero Text
    {
      key: 'hero-line-1',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 900,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          delay: 100,
        },
      ],
    },
    {
      key: 'hero-line-2',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          keyframeEffect: { ...TILT_UP_OPTS },
          duration: 900,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          delay: 250,
        },
      ],
    },
    {
      key: 'hero-subtitle',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          namedEffect: { ...FADE_UP_OPTS, distance: '30px' },
          duration: 1200,
          easing: 'ease-out',
          delay: 600,
        },
      ],
    },
    {
      key: 'nav-logo',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 1000 }],
    },
    {
      key: 'nav-cta',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 1000, delay: 200 }],
    },

    // Primitive Interactions (generated)
    ...primitiveInteractions,

    // Entrance Interactions (Swirling Plus)
    {
      key: 'entrance-card',
      trigger: 'viewEnter',
      params: { type: 'alternate', threshold: 0.8 },
      effects: [
        {
          key: 'circle-top',
          fill: 'both',
          keyframeEffect: {
            name: 'slideFromLeftToTop',
            keyframes: [
              { opacity: 0, transform: `translate(-${ENTRANCE_SLIDE_DIST}, -${ENTRANCE_OFFSET})` },
              { opacity: 1, transform: `translate(0, -${ENTRANCE_OFFSET})` },
            ],
          },
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
        },
        {
          key: 'circle-right',
          fill: 'both',
          keyframeEffect: {
            name: 'slideFromTopToRight',
            keyframes: [
              { opacity: 0, transform: `translate(${ENTRANCE_OFFSET}, -${ENTRANCE_SLIDE_DIST})` },
              { opacity: 1, transform: `translate(${ENTRANCE_OFFSET}, 0)` },
            ],
          },
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
          delay: 100,
        },
        {
          key: 'circle-bottom',
          fill: 'both',
          keyframeEffect: {
            name: 'slideFromRightToBottom',
            keyframes: [
              { opacity: 0, transform: `translate(${ENTRANCE_SLIDE_DIST}, ${ENTRANCE_OFFSET})` },
              { opacity: 1, transform: `translate(0, ${ENTRANCE_OFFSET})` },
            ],
          },
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
          delay: 200,
        },
        {
          key: 'circle-left',
          fill: 'both',
          keyframeEffect: {
            name: 'slideFromBottomToLeft',
            keyframes: [
              { opacity: 0, transform: `translate(-${ENTRANCE_OFFSET}, ${ENTRANCE_SLIDE_DIST})` },
              { opacity: 1, transform: `translate(-${ENTRANCE_OFFSET}, 0)` },
            ],
          },
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
          delay: 300,
        },
      ],
    },

    // Click Interaction (Ripple Effect)
    {
      key: 'click-center',
      trigger: 'click',
      effects: [
        {
          selector: '.fill-circle',
          transition: {
            duration: 500,
            easing: 'ease-out',
            styleProperties: [{ name: 'transform', value: 'scale(1)' }],
          },
        },
        {
          key: 'click-ripple-1',
          transition: {
            duration: 800,
            easing: CLICK_EASING,
            styleProperties: [
              { name: 'opacity', value: '1' },
              { name: 'transform', value: 'scale(1.7)' },
            ],
          },
        },
        {
          key: 'click-ripple-2',
          transition: {
            duration: 800,
            easing: CLICK_EASING,
            delay: 50,
            styleProperties: [
              { name: 'opacity', value: '0.5' },
              { name: 'transform', value: 'scale(2.6)' },
            ],
          },
        },
      ],
    },

    // Mouse Track Interaction (3D Tilt Tunnel)
    {
      key: 'mt-scene-root',
      trigger: 'pointerMove',
      params: { hitArea: 'self' },
      effects: [
        {
          key: 'mt-card-target',
          namedEffect: {
            type: 'Tilt3DMouse',
            maxAngle: 25,
            perspective: 200,
          },
          fill: 'both',
          composite: 'replace',
        },
        {
          key: 'mt-content-target',
          namedEffect: {
            type: 'Tilt3DMouse',
            maxAngle: 60,
            perspective: 100,
          },
          fill: 'both',
          composite: 'replace',
        },
      ],
    },

    // Scrollytelling Interaction (Atom Spin)
    {
      key: 'scrolly-atom-card',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'orbit-y',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'rotateY',
            keyframes: [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(360deg)' }],
          },
          composite: 'replace',
        },
        {
          key: 'orbit-x',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'rotateX',
            keyframes: [
              { transform: 'rotateX(90deg) rotateZ(0deg)' },
              { transform: 'rotateX(90deg) rotateZ(360deg)' },
            ],
          },
          composite: 'replace',
        },
        {
          key: 'orbit-diag-1',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'rotateDiag1',
            keyframes: [
              { transform: 'rotateZ(45deg) rotateY(0deg)' },
              { transform: 'rotateZ(45deg) rotateY(360deg)' },
            ],
          },
          composite: 'replace',
        },
        {
          key: 'orbit-diag-2',
          fill: 'both',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'rotateDiag2',
            keyframes: [
              { transform: 'rotateZ(-45deg) rotateY(0deg)' },
              { transform: 'rotateZ(-45deg) rotateY(-360deg)' },
            ],
          },
          composite: 'replace',
        },
      ],
    },

    // Mission Text
    {
      key: 'mission-text',
      trigger: 'viewEnter',
      effects: [
        {
          fill: 'backwards',
          namedEffect: {
            type: 'SlideIn',
            direction: 'bottom',
            distance: '100px',
          },
          duration: 1000,
          easing: 'ease-out',
        },
      ],
    },

    // Visual Break / Parallax
    {
      key: 'visual-break',
      trigger: 'viewEnter',
      params: {
        type: 'once',
        threshold: 0.2,
      },
      effects: [
        {
          fill: 'backwards',
          namedEffect: { type: 'ScaleIn' },
          duration: 1200,
        },
      ],
    },
    {
      key: 'visual-break',
      trigger: 'viewProgress',
      effects: [
        {
          namedEffect: { type: 'ParallaxScroll', range: 'continuous', speed: -0.05 },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          composite: 'add',
        },
      ],
    },

    // Beautiful Section Scroll Effects
    {
      key: 'beautiful-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'pyramid-target',
          fill: 'both',
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'pyramid-tumble',
            keyframes: [
              { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
              { transform: 'rotateX(720deg) rotateY(540deg) rotateZ(120deg)' },
            ],
          },
        },
        {
          key: 'word-1',
          keyframeEffect: {
            keyframes: [
              { opacity: 0, transform: 'translateY(100px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: 25, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 40, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'word-2',
          keyframeEffect: {
            keyframes: [
              { opacity: 0, transform: 'translateY(100px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: 28, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 43, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'word-3',
          keyframeEffect: {
            keyframes: [
              { opacity: 0, transform: 'translateY(50px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: 31, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 46, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'word-4',
          keyframeEffect: {
            keyframes: [
              { opacity: 0, transform: 'translateY(50px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: 34, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 49, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'word-5',
          keyframeEffect: {
            keyframes: [
              { opacity: 0, transform: 'translateY(50px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: 38, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 53, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'desc-text',
          keyframeEffect: {
            keyframes: [
              { opacity: 0, transform: 'translateY(50px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: 30, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 45, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },

    // Tunnel Interaction
    {
      key: 'tunnel-root',
      trigger: 'pointerMove',
      params: { hitArea: 'root' },
      conditions: ['Desktop'],
      effects: [
        {
          customEffect: animateTunnel,
          centeredToTarget: true,
          fill: 'both',
        },
      ],
    },
    {
      key: 'performance-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'tunnel-root',
          customEffect: animateTunnelMobile,
          fill: 'both',
          conditions: ['Mobile'],
          rangeStart: { name: 'cover', offset: { value: 10, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 30, unit: 'percentage' } },
        },
      ],
    },

    // Cards Hover
    {
      key: 'hover-target',
      trigger: 'hover',
      params: { type: 'alternate' },
      effects: [
        {
          keyframeEffect: { ...HOVER_SCALE },
          duration: 400,
          easing: 'ease-out',
          fill: 'both',
          composite: 'add',
        },
      ],
    },

    // Tailored Section Animations
    {
      key: 'tailored-header',
      trigger: 'viewEnter',
      params: { type: 'once' },
      effects: [
        {
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
        },
      ],
    },
    {
      key: 'tailored-col-1',
      trigger: 'viewEnter',
      params: { type: 'once' },
      effects: [
        {
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
          delay: 100,
        },
      ],
    },
    {
      key: 'tailored-col-2',
      trigger: 'viewEnter',
      params: { type: 'once' },
      effects: [
        {
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
          delay: 200,
        },
      ],
    },
    {
      key: 'tailored-col-3',
      trigger: 'viewEnter',
      params: { type: 'once' },
      effects: [
        {
          fill: 'backwards',
          namedEffect: { type: 'FadeIn', distance: '40px', direction: 'bottom' },
          duration: 800,
          delay: 300,
        },
      ],
    },

    // Spread Section (Desktop)
    {
      key: 'spread-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'spread-card-0',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'stayCenter',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(-50%, -50%) scale(1.3)' },
            ],
          },
        },
        {
          key: 'spread-card-1',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadLeftInner',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% - 16vw), -50%) scale(1.15)' },
            ],
          },
        },
        {
          key: 'spread-card-2',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadRightInner',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% + 16vw), -50%) scale(1.15)' },
            ],
          },
        },
        {
          key: 'spread-card-3',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadLeftOuter',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% - 32vw), -50%) scale(0.9)' },
            ],
          },
        },
        {
          key: 'spread-card-4',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadRightOuter',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% + 32vw), -50%) scale(0.9)' },
            ],
          },
        },

        // Spread Section (Mobile)

        {
          key: 'spread-card-0',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 25, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-0-scaleDown',
            keyframes: [
              { transform: 'translateX(-50%) translateY(0) scale(1)' },
              { transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-1',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 40, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-1-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-2',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 20, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 60, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-2-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-3',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 40, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 80, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-3-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-4',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 60, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-4-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
      ],
    },

    // Horizontal Scroll
    {
      key: 'h-section',
      trigger: 'viewProgress',
      effects: [
        // Desktop: h-track movement (9 cards × 600px + 8 gaps × 128px - 600px = 5824px)
        {
          key: 'h-track',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'moveLeft',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-5824px)' }],
          },
        },
        // Mobile: h-track movement (8 × (95vw + 4vw) = 792vw)
        {
          key: 'h-track',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'moveLeftMobile',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-792vw)' }],
          },
        },
        // Desktop card scaling
        {
          key: 'h-card-1',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 12.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter1',
            keyframes: [{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }],
          },
        },
        {
          key: 'h-card-2',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 25, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter2',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.3)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-3',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 12.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 37.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter3',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.3)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-4',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 25, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 50, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter4',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.3)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-5',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 37.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 62.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter5',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.3)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-6',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 50, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 75, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter6',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.3)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-7',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 62.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 87.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter7',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.3)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-8',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 75, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter8',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.3)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-9',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 87.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenter9',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }],
          },
        },
        {
          key: 'h-card-1',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 12.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM1',
            keyframes: [{ transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
          },
        },
        {
          key: 'h-card-2',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 25, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM2',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.05)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-3',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 12.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 37.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM3',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.05)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-4',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 25, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 50, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM4',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.05)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-5',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 37.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 62.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM5',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.05)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-6',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 50, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 75, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM6',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.05)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-7',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 62.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 87.5, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM7',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.05)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-8',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 75, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM8',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.05)', offset: 0.5 },
              { transform: 'scale(1)' },
            ],
          },
        },
        {
          key: 'h-card-9',
          conditions: ['Mobile'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 87.5, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'scaleCenterM9',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }],
          },
        },
      ],
    },

    // Footer
    {
      key: 'footer-brand',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 600 }],
    },
    {
      key: 'footer-link',
      trigger: 'viewEnter',
      effects: [{ fill: 'backwards', namedEffect: { type: 'FadeIn' }, duration: 600, delay: 100 }],
    },
  ],
};

// =============================================================================
// INITIALIZATION & USAGE
// =============================================================================

// Generate DOM elements
buildGrid();
generateTunnel();
generateMouseTunnel();
generateSpongeGeometry();

// Update bounds
updateTunnelBounds();

// Event listeners
window.addEventListener('resize', buildGrid);
window.addEventListener('resize', updateTunnelBounds);

// Respect reduced motion settings
Interact.forceReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Register presets
Interact.registerEffects(presets);

// Initialize Interact
Interact.create(config);
