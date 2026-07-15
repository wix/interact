# Mouse Track Infinite Gallery

An infinite, wrapping grid of images that pans continuously in the direction of the mouse cursor using momentum physics; hovering an individual item blurs its image and fades its caption.

**Tags:** hover, pointerMove, gallery, infinite, loop, filter, blur, transform, scale, opacity, parallax

## Markup

```html
<div id="gallery-viewport">
  <div id="gallery-content">

    <div class="gallery-item">
      <interact-element data-interact-key="item-0">
        <div class="cursor-pointer">
          <div class="img-wrapper">
            <div class="parallax-layer" id="parallax-0">
              <interact-element data-interact-key="img-0">
                <img src="" class="gallery-img" />
              </interact-element>
            </div>
          </div>
          <div class="text-wrapper">
            <interact-element data-interact-key="txt-0">
              <div class="gallery-text">NEON VOID</div>
            </interact-element>
          </div>
        </div>
      </interact-element>
    </div>

    <div class="gallery-item">
      <interact-element data-interact-key="item-1">
        <div class="cursor-pointer">
          <div class="img-wrapper">
            <div class="parallax-layer" id="parallax-1">
              <interact-element data-interact-key="img-1">
                <img src="" class="gallery-img" />
              </interact-element>
            </div>
          </div>
          <div class="text-wrapper">
            <interact-element data-interact-key="txt-1">
              <div class="gallery-text">URBAN ECHO</div>
            </interact-element>
          </div>
        </div>
      </interact-element>
    </div>

    <div class="gallery-item">
      <interact-element data-interact-key="item-2">
        <div class="cursor-pointer">
          <div class="img-wrapper">
            <div class="parallax-layer" id="parallax-2">
              <interact-element data-interact-key="img-2">
                <img src="" class="gallery-img" />
              </interact-element>
            </div>
          </div>
          <div class="text-wrapper">
            <interact-element data-interact-key="txt-2">
              <div class="gallery-text">SILENT FORM</div>
            </interact-element>
          </div>
        </div>
      </interact-element>
    </div>

    <div class="gallery-item">
      <interact-element data-interact-key="item-3">
        <div class="cursor-pointer">
          <div class="img-wrapper">
            <div class="parallax-layer" id="parallax-3">
              <interact-element data-interact-key="img-3">
                <img src="" class="gallery-img" />
              </interact-element>
            </div>
          </div>
          <div class="text-wrapper">
            <interact-element data-interact-key="txt-3">
              <div class="gallery-text">LIQUID TIME</div>
            </interact-element>
          </div>
        </div>
      </interact-element>
    </div>

    <div class="gallery-item">
      <interact-element data-interact-key="item-4">
        <div class="cursor-pointer">
          <div class="img-wrapper">
            <div class="parallax-layer" id="parallax-4">
              <interact-element data-interact-key="img-4">
                <img src="" class="gallery-img" />
              </interact-element>
            </div>
          </div>
          <div class="text-wrapper">
            <interact-element data-interact-key="txt-4">
              <div class="gallery-text">GLASS SOUL</div>
            </interact-element>
          </div>
        </div>
      </interact-element>
    </div>

  </div>
</div>
```

## Essential styles

```css
:root {
    --item-size: 40vh;
}

body {
    margin: 0;
    overflow: hidden;
    background-color: #ffffff;
    color: black;
    font-family: 'Helvetica Neue', sans-serif;
    user-select: none;
}

#gallery-viewport {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    cursor: grab;
    position: relative;
}

#gallery-viewport:active {
    cursor: grabbing;
}

#gallery-content {
    position: relative;
    width: 100%;
    height: 100%;
}

.gallery-item {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: var(--item-size);
    will-change: transform;
}

.cursor-pointer {
    cursor: pointer;
}

.img-wrapper {
    width: 100%;
    height: var(--item-size);
    border-radius: 4px;
    overflow: hidden;
    background: #1a1a1a;
    position: relative;
    box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.2);
}

.parallax-layer {
    width: 100%;
    height: 100%;
    will-change: transform;
    transform: scale(3.0);
    transform-origin: center;
}

.gallery-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform-origin: center;
}

.text-wrapper {
    position: absolute;
    top: 100%;
    padding-top: 5px;
    left: 0;
    width: 100%;
    pointer-events: none;
}

.gallery-text {
    font-size: 14px;
    font-weight: 500;
    color: #111111;
    letter-spacing: 0.5px;
    transform-origin: top left;
    display: inline-block;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .gallery-text {
        font-size: 12px;
    }
}
```

## Interact config

```js
const HOVER_BLUR = 8;
const totalItems = 5;
const interactions = [];

for (let i = 0; i < totalItems; i++) {
    const itemKey = `item-${i}`;
    const imgKey = `img-${i}`;
    const txtKey = `txt-${i}`;

    interactions.push({
        key: itemKey,
        trigger: 'hover',
        effects: [
            {
                key: imgKey,
                transition: {
                    duration: 600,
                    easing: 'ease-out',
                    styleProperties: [
                        { name: 'filter', value: `blur(${HOVER_BLUR}px)` },
                        { name: 'transform', value: 'scale(0.95)' }
                    ]
                },
                fill: 'both',
                composite: 'add'
            },
            {
                key: txtKey,
                transition: {
                    duration: 500,
                    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                    styleProperties: [
                        { name: 'opacity', value: '0.4' }
                    ]
                },
                fill: 'both',
                composite: 'replace'
            }
        ]
    });
}

const config = { interactions };
```

## Animation logic

The infinite pan and parallax are driven by a hand-written `requestAnimationFrame` loop. Mouse position is converted to a velocity vector (desktop) or drag offset (mobile), which advances a wrapping world coordinate. Each item's screen position is computed modulo the world dimensions so the grid tiles seamlessly.

```js
const GRID_COLS = 8;
const GRID_ROWS = 5;
const MAX_SPEED = 6;
const VELOCITY_LERP = 0.03;
const DRAG_LERP = 0.08;
const PARALLAX_FACTOR = 0.08;
const MOBILE_BREAKPOINT = 768;

const layout = { itemSize: 0, gap: 0, colPitch: 0, rowPitch: 0, worldWidth: 0, worldHeight: 0 };

function updateLayout() {
    const rawFactor = 0.0002 * window.innerWidth + 0.12;
    const vhFactor = Math.min(0.4, Math.max(0.2, rawFactor));
    layout.itemSize = window.innerHeight * vhFactor;
    layout.gap = layout.itemSize * 0.6375;
    document.documentElement.style.setProperty('--item-size', `${layout.itemSize}px`);
    layout.colPitch = layout.itemSize + layout.gap;
    const textPadding = layout.itemSize * 0.25;
    layout.rowPitch = layout.itemSize + textPadding + layout.gap;
    layout.worldWidth = GRID_COLS * layout.colPitch;
    layout.worldHeight = GRID_ROWS * layout.rowPitch;
    if (window.galleryItems && window.galleryItems.length > 0) {
        window.galleryItems.forEach((item, index) => {
            const col = index % GRID_COLS;
            const row = Math.floor(index / GRID_COLS);
            item.baseX = col * layout.colPitch;
            item.baseY = row * layout.rowPitch;
        });
    }
}

updateLayout();

window.galleryItems = [];
document.querySelectorAll('.gallery-item').forEach((el, i) => {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    window.galleryItems.push({
        container: el,
        parallax: el.querySelector('.parallax-layer'),
        baseX: col * layout.colPitch,
        baseY: row * layout.rowPitch
    });
});

const viewport = document.getElementById('gallery-viewport');

const state = {
    currentX: 0, currentY: 0,
    velocityX: 0, velocityY: 0,
    targetX: 0, targetY: 0,
    dragStartX: 0, dragStartY: 0,
    isDragging: false
};

const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, isActive: false };

window.addEventListener('mousemove', (e) => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        if (!state.isDragging) return;
        e.preventDefault();
        state.targetX = e.clientX - state.dragStartX;
        state.targetY = e.clientY - state.dragStartY;
    } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.isActive = true;
    }
});

viewport.addEventListener('mousedown', (e) => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        state.isDragging = true;
        state.dragStartX = e.clientX - state.targetX;
        state.dragStartY = e.clientY - state.targetY;
        viewport.style.cursor = 'grabbing';
    }
});

const stopInteract = () => {
    state.isDragging = false;
    mouse.isActive = false;
    viewport.style.cursor = 'grab';
};

document.addEventListener('mouseleave', stopInteract);
window.addEventListener('mouseup', stopInteract);

viewport.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        state.isDragging = true;
        state.dragStartX = touch.clientX - state.targetX;
        state.dragStartY = touch.clientY - state.targetY;
    } else {
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        mouse.isActive = true;
    }
    e.preventDefault();
}, { passive: false });

viewport.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (window.innerWidth < MOBILE_BREAKPOINT) {
        if (!state.isDragging) return;
        state.targetX = touch.clientX - state.dragStartX;
        state.targetY = touch.clientY - state.dragStartY;
    } else {
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
    }
    e.preventDefault();
}, { passive: false });

viewport.addEventListener('touchend', stopInteract);

let lastInnerWidth = window.innerWidth;
let lastInnerHeight = window.innerHeight;

function animate() {
    if (window.innerWidth !== lastInnerWidth || window.innerHeight !== lastInnerHeight) {
        lastInnerWidth = window.innerWidth;
        lastInnerHeight = window.innerHeight;
        updateLayout();
        mouse.x = window.innerWidth / 2;
        mouse.y = window.innerHeight / 2;
    }

    const viewportCx = window.innerWidth / 2;
    const viewportCy = window.innerHeight / 2;
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    if (isMobile) {
        state.currentX += (state.targetX - state.currentX) * DRAG_LERP;
        state.currentY += (state.targetY - state.currentY) * DRAG_LERP;
        state.velocityX = 0;
        state.velocityY = 0;
    } else {
        let targetVx = 0;
        let targetVy = 0;
        if (mouse.isActive) {
            const nX = (mouse.x - viewportCx) / viewportCx;
            const nY = (mouse.y - viewportCy) / viewportCy;
            targetVx = -nX * MAX_SPEED;
            targetVy = -nY * MAX_SPEED;
        }
        state.velocityX += (targetVx - state.velocityX) * VELOCITY_LERP;
        state.velocityY += (targetVy - state.velocityY) * VELOCITY_LERP;
        state.currentX += state.velocityX;
        state.currentY += state.velocityY;
        state.targetX = state.currentX;
        state.targetY = state.currentY;
    }

    for (let i = 0; i < window.galleryItems.length; i++) {
        const item = window.galleryItems[i];

        let x = item.baseX + state.currentX;
        let y = item.baseY + state.currentY;

        let wrappedX = ((x % layout.worldWidth) + layout.worldWidth) % layout.worldWidth;
        if (wrappedX > layout.worldWidth / 2) wrappedX -= layout.worldWidth;

        let wrappedY = ((y % layout.worldHeight) + layout.worldHeight) % layout.worldHeight;
        if (wrappedY > layout.worldHeight / 2) wrappedY -= layout.worldHeight;

        const screenX = wrappedX + viewportCx;
        const screenY = wrappedY + viewportCy;

        const pX = wrappedX * -PARALLAX_FACTOR;
        const pY = wrappedY * -PARALLAX_FACTOR;

        const offsetX = layout.itemSize / 2;
        const offsetY = layout.itemSize / 2 + (layout.itemSize * 0.125);

        item.container.style.transform = `translate3d(${screenX - offsetX}px, ${screenY - offsetY}px, 0)`;
        item.parallax.style.transform = `scale(3.0) translate3d(${pX}px, ${pY}px, 0)`;
    }

    requestAnimationFrame(animate);
}

animate();
```
