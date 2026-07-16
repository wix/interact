# Endless Parallax

An endless floating image gallery where tiles drift and wrap continuously across a full-viewport canvas driven by mouse cursor position, with subtle parallax depth layering per tile; clicking a tile opens a modal with a gallery blur-in animation.

**Tags:** click, pointerMove, gallery, fixed, opacity, transform, filter, parallax, blur, loop

## Markup

```html
<interact-element data-interact-key="#page-container">
  <div id="page-container">
    <div id="gallery-container">
      <div class="gallery-tile" tabindex="0">
        <img src="">
        <div class="gallery-tile-title">Vibrant Gradient</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="">
        <div class="gallery-tile-title">Cool Tones</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="">
        <div class="gallery-tile-title">Pastel Rainbow</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="">
        <div class="gallery-tile-title">Marble Swirl</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="">
        <div class="gallery-tile-title">Liquid Abstract</div>
      </div>
    </div>

    <div id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <button class="modal-close" id="modalClose" aria-label="Close enlarged view">&times;</button>
      <div class="modal-content">
        <img id="modalImage" src="">
        <div class="modal-text-overlay">
          <h1 id="modalTitle"></h1>
          <p id="modalDescription"></p>
        </div>
      </div>
    </div>

    <button id="openModalTrigger" style="display:none"></button>
    <button id="closeModalTrigger" style="display:none"></button>
  </div>
</interact-element>
```

## Essential styles

```css
html, body {
  margin: 0; padding: 0;
  width: 100%; height: 100%;
  overflow: hidden;
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
  will-change: transform, opacity;
  backface-visibility: hidden;
  contain: layout paint;
  overflow: hidden;
  cursor: pointer;
}

.gallery-tile:focus-visible {
  outline: 3px solid;
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
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
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
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
}

.modal-content {
  position: relative;
  max-width: 90vw; max-height: 90vh;
  border-radius: 8px;
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
  border-radius: 0 0 8px 8px;
  box-sizing: border-box;
}

.modal-text-overlay h1 {
  margin: 0 0 10px;
  font-size: 2rem; font-weight: 700;
}

.modal-text-overlay p {
  margin: 0; font-size: 1.1rem;
  opacity: 0.9;
}

.modal-close { border: none; padding: 0; font: inherit;
  position: absolute; top: 20px; right: 20px;
  font-size: 2rem; cursor: pointer; line-height: 1;
  z-index: 1001; border-radius: 50%;
}

.modal-close:focus-visible { outline: 3px solid; outline-offset: 2px; }

```

## Interact config

```js
const tiles = /* select existing '.gallery-tile' elements */ [];
const tileState = tiles.map((tile, index) => ({
  tile,
  image: tile.querySelector('img'),
  title: tile.querySelector('.gallery-tile-title'),
  motion: undefined // Look up application-owned motion metadata for index.
}));

function updateCameraFromPointer(event) {
  // Update camera velocity from pointer position.
}

function tickInfiniteGallery() {
  // Advance and damp the camera.
  // For each tileState entry:
  // - wrap its coordinates inside the virtual world;
  // - update only the existing tile transform and opacity.
  // Request the next animation frame.
}

function openTileModal(tile) {
  // Copy the tile's existing image and title into #modalImage and #modalTitle.
  // Look up any optional modal description by tile index.
  // Activate #openModalTrigger so Interact plays the modal effects.
}

function closeTileModal() {
  // Activate #closeModalTrigger.
}

{
  effects: {
    'modal-fade-out': {
      keyframeEffect: {
        name: 'modal-hide',
        keyframes: [{ opacity: 1 }, { opacity: 0 }]
      },
      duration: 400,
      easing: 'ease-out',
      fill: 'forwards'
    },
  },
  interactions: [
    {
      key: '#page-container', trigger: 'viewEnter',
      effects: [{ triggerType: 'once', duration: 0, customEffect: tickInfiniteGallery }]
    },
    {
      key: '#page-container', trigger: 'pointerMove',
      effects: [{ customEffect: updateCameraFromPointer }]
    },
    {
      key: '.gallery-tile', trigger: 'click',
      effects: [{ triggerType: 'repeat', duration: 0, customEffect: openTileModal }]
    },
    {
      key: '#modalClose', trigger: 'click',
      effects: [{ triggerType: 'repeat', duration: 0, customEffect: closeTileModal }]
    },
    {
      key: '#openModalTrigger', trigger: 'click',
      effects: [
        { key: '#modal', keyframeEffect: { name: 'modal-show',
            keyframes: [{ offset: 0, visibility: 'visible', opacity: 0 }, { offset: 1, opacity: 1 }] },
            duration: 400, easing: 'ease-out', fill: 'forwards' },
        { key: '.modal-content', keyframeEffect: { name: 'modal-content-scale-in',
            keyframes: [{ transform: 'scale(0.8)' }, { transform: 'scale(1)' }] },
            duration: 400, easing: 'cubic-bezier(0.175,0.885,0.32,1.275)', fill: 'forwards' },
        { key: '#gallery-container', keyframeEffect: { name: 'canvas-blur-in',
            keyframes: [{ filter: 'blur(0px)' }, { filter: 'blur(8px)' }] },
            duration: 400, easing: 'ease-out', fill: 'forwards' },
      ]
    },
    {
      key: '#closeModalTrigger', trigger: 'click',
      effects: [
        { key: '#modal', effectId: 'modal-fade-out' },
        { key: '.modal-content', keyframeEffect: { name: 'modal-content-scale-out',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }] },
            duration: 400, easing: 'ease-out', fill: 'forwards' },
        { key: '#gallery-container', keyframeEffect: { name: 'canvas-blur-out',
            keyframes: [{ filter: 'blur(8px)' }, { filter: 'blur(0px)' }] },
            duration: 400, easing: 'ease-out', fill: 'forwards' },
      ]
    },
    {
      key: '#modal', trigger: 'animationEnd', params: { effectId: 'modal-fade-out' },
      effects: [{ keyframeEffect: { name: 'set-modal-hidden',
        keyframes: [{ visibility: 'hidden' }] }, duration: 0, fill: 'forwards' }]
    },
  ]
}
```
