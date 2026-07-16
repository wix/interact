# Digital Jukebox

A vertical snap-scrolling list of album art cards that rotate and zoom through 3D perspective as they pass through the viewport, while a fixed info panel updates the artist and song title for whichever card is centered.

**Tags:** viewProgress, scroll, list, gallery, opacity, transform, 3d, snap, stagger

## Markup

```html
<div class="screen">
  <interact-element data-interact-key="scroll-container">
    <div class="scroll-view" id="scroll-view">
      <div class="item-list" id="item-list">
        <interact-element data-interact-key="item-0">
          <div class="list-item"></div>
        </interact-element>
        <interact-element data-interact-key="item-1">
          <div class="list-item"></div>
        </interact-element>
        <interact-element data-interact-key="item-2">
          <div class="list-item"></div>
        </interact-element>
        <interact-element data-interact-key="item-3">
          <div class="list-item"></div>
        </interact-element>
      </div>
    </div>
  </interact-element>

  <div class="info-panel">
    <h2 id="artist-name">Artist A</h2>
    <p id="song-title">Track A</p>
  </div>
</div>
```

## Essential styles

```css
:root {
  --item-width: 800px;
  --item-height: 512px;
  --item-gap: 32px;
}

body {
  margin: 0;
  overflow: hidden;
}

.screen {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
}

.scroll-view {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y proximity;
}

.item-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(50vh - var(--item-height) / 2) 0;
}

.list-item {
  width: var(--item-width);
  max-width: 90vw;
  height: var(--item-height);
  margin: 0 auto var(--item-gap);
  scroll-snap-align: center;
}

.info-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 10;
}
```

## Interact config

```js
const itemsData = [
  { artist: 'Artist A', title: 'Track A' },
  { artist: 'Artist B', title: 'Track B' },
  { artist: 'Artist C', title: 'Track C' },
  { artist: 'Artist D', title: 'Track D' },
];

const scroll3DEffect = {
  name: 'scroll-3d-transform',
  keyframes: [
    { offset: 0, opacity: 0.2, transform: 'perspective(500px) rotateX(25deg) translateZ(-350px)' },
    { offset: 0.5, opacity: 1, transform: 'perspective(500px) rotateX(0deg) translateZ(0px)' },
    { offset: 1, opacity: 0.2, transform: 'perspective(500px) rotateX(-25deg) translateZ(-350px)' },
  ],
};

const itemInteractions = itemsData.map((_, index) => ({
  key: `item-${index}`,
  trigger: 'viewProgress',
  effects: [
    {
      key: `item-${index}`,
      effectId: 'scroll-3d-transform',
    },
  ],
}));

const infoPanelInteraction = {
  key: 'scroll-container',
  trigger: 'viewProgress',
  effects: [
    {
      key: 'scroll-container',
      customEffect: (element, progress) => {
        const artistEl = document.getElementById('artist-name');
        const songEl = document.getElementById('song-title');
        const totalItems = itemsData.length;
        let closestIndex = Math.round(progress * (totalItems - 1));
        closestIndex = Math.max(0, Math.min(totalItems - 1, closestIndex));
        const currentData = itemsData[closestIndex];
        if (artistEl.textContent !== currentData.artist) {
          artistEl.textContent = currentData.artist;
        }
        if (songEl.textContent !== currentData.title) {
          songEl.textContent = currentData.title;
        }
      },
      rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
      rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
      fill: 'both',
    },
  ],
};

const config = {
  effects: {
    'scroll-3d-transform': {
      keyframeEffect: scroll3DEffect,
      easing: 'linear',
      fill: 'both',
    },
  },
  interactions: [...itemInteractions, infoPanelInteraction],
};
```
