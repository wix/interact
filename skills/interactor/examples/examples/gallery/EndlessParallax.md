# Endless Parallax

An endless floating image gallery where tiles drift and wrap continuously across a full-viewport canvas driven by mouse cursor position, with subtle parallax depth layering per tile; clicking a tile opens a modal with a gallery blur-in animation.

**Tags:** click, pointerMove, gallery, fixed, opacity, transform, filter, parallax, blur, loop

## Markup

```html
<interact-element data-interact-key="#page-container">
  <div id="page-container">
    <div id="gallery-container">
      <div class="gallery-tile" tabindex="0">
        <img src="" />
        <div class="gallery-tile-title">Vibrant Gradient</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="" />
        <div class="gallery-tile-title">Cool Tones</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="" />
        <div class="gallery-tile-title">Pastel Rainbow</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="" />
        <div class="gallery-tile-title">Marble Swirl</div>
      </div>
      <div class="gallery-tile" tabindex="0">
        <img src="" />
        <div class="gallery-tile-title">Liquid Abstract</div>
      </div>
    </div>

    <div id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <button class="modal-close" id="modalClose" aria-label="Close enlarged view">&times;</button>
      <div class="modal-content">
        <img id="modalImage" src="" />
        <div class="modal-text-overlay">
          <h1 id="modalTitle"></h1>
          <p id="modalDescription"></p>
        </div>
      </div>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: clip;
}

#gallery-container {
  position: fixed;
  inset: 0;
  overflow: clip;
}

.gallery-tile {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  backface-visibility: hidden;
  contain: layout paint;
  overflow: clip;
}

.gallery-tile:focus-visible {
  outline: 3px solid;
  outline-offset: 4px;
}

.gallery-tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.gallery-tile-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1rem 1rem;
  text-align: center;
  pointer-events: none;
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
  max-width: 90vw;
  max-height: 90vh;
  transform: scale(0.8);
}

.modal-content img {
  display: block;
  max-width: 100%;
  max-height: 90vh;
}

.modal-text-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 60px 30px 30px;
  box-sizing: border-box;
}

.modal-text-overlay h1 {
  margin: 0 0 10px;
}

.modal-text-overlay p {
  margin: 0;
}

.modal-close {
  padding: 0;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1001;
}

.modal-close:focus-visible {
  outline: 3px solid;
  outline-offset: 2px;
}
```

## Interact config

```js
const tiles = /* select existing '.gallery-tile' elements */ [];
const tileState = tiles.map((tile, index) => ({
  tile,
  image: tile.querySelector('img'),
  title: tile.querySelector('.gallery-tile-title'),
  motion: undefined, // Look up application-owned motion metadata for index.
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
}

const config = {
  effects: {
    'modal-fade-out': {
      keyframeEffect: {
        name: 'modal-hide',
        keyframes: [
          { opacity: 1, visibility: 'visible' },
          { opacity: 0, visibility: 'hidden' },
        ],
      },
      duration: 400,
      easing: 'ease-out',
      fill: 'both',
      triggerType: 'repeat',
    },
  },
  interactions: [
    {
      key: '#page-container',
      trigger: 'viewEnter',
      effects: [{ triggerType: 'once', duration: 0, customEffect: tickInfiniteGallery }],
    },
    {
      key: '#page-container',
      trigger: 'pointerMove',
      effects: [{ customEffect: updateCameraFromPointer, fill: 'both' }],
    },
    {
      key: '#page-container',
      trigger: 'click',
      listContainer: '#gallery-container',
      listItemSelector: '.gallery-tile',
      effects: [
        { triggerType: 'repeat', duration: 0, fill: 'both', customEffect: openTileModal },
        {
          key: '#page-container',
          selector: '#modal',
          triggerType: 'repeat',
          keyframeEffect: {
            name: 'modal-show',
            keyframes: [
              { offset: 0, visibility: 'visible', opacity: 0 },
              { offset: 1, opacity: 1 },
            ],
          },
          duration: 400,
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: '#page-container',
          selector: '.modal-content',
          triggerType: 'repeat',
          keyframeEffect: {
            name: 'modal-content-scale-in',
            keyframes: [{ transform: 'scale(0.8)' }, { transform: 'scale(1)' }],
          },
          duration: 400,
          easing: 'cubic-bezier(0.175,0.885,0.32,1.275)',
          fill: 'both',
        },
        {
          key: '#page-container',
          selector: '#gallery-container',
          triggerType: 'repeat',
          keyframeEffect: {
            name: 'canvas-blur-in',
            keyframes: [{ filter: 'blur(0px)' }, { filter: 'blur(8px)' }],
          },
          duration: 400,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
    {
      key: '#page-container',
      selector: '#modalClose',
      trigger: 'click',
      effects: [
        { key: '#page-container', selector: '#modal', effectId: 'modal-fade-out' },
        {
          key: '#page-container',
          selector: '.modal-content',
          triggerType: 'repeat',
          keyframeEffect: {
            name: 'modal-content-scale-out',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }],
          },
          duration: 400,
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: '#page-container',
          selector: '#gallery-container',
          triggerType: 'repeat',
          keyframeEffect: {
            name: 'canvas-blur-out',
            keyframes: [{ filter: 'blur(8px)' }, { filter: 'blur(0px)' }],
          },
          duration: 400,
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```
