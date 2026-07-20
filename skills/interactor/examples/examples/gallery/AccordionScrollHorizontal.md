# Accordion Scroll Horizontal

Hover over any panel to expand it — vertically on mobile, horizontally on desktop — while a title and subtitle fade up from the bottom.

**Tags:** hover, gallery, flex, accordion, responsive, height, transform, opacity, reveal, stagger

## Markup

```html
<main id="feature-container" class="feature-container">
  <interact-element data-interact-key="col-1">
    <div class="feature-hit-area">
      <div id="column-1" class="feature-column" tabindex="0">
        <interact-element data-interact-key="txt-1">
          <div class="feature-text-group">
            <p class="feature-bottom-subtitle">Italian Alps</p>
            <h2 class="feature-bottom-title">Serene Lakes</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-2">
    <div class="feature-hit-area">
      <div id="column-2" class="feature-column" tabindex="0">
        <interact-element data-interact-key="txt-2">
          <div class="feature-text-group">
            <p class="feature-bottom-subtitle">Arid Climate</p>
            <h2 class="feature-bottom-title">Vast Deserts</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-3">
    <div class="feature-hit-area">
      <div id="column-3" class="feature-column" tabindex="0">
        <interact-element data-interact-key="txt-3">
          <div class="feature-text-group">
            <p class="feature-bottom-subtitle">Tropical Paradise</p>
            <h2 class="feature-bottom-title">Lush Rainforests</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-4">
    <div class="feature-hit-area">
      <div id="column-4" class="feature-column" tabindex="0">
        <interact-element data-interact-key="txt-4">
          <div class="feature-text-group">
            <p class="feature-bottom-subtitle">Coastal Views</p>
            <h2 class="feature-bottom-title">Ocean Cliffs</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-5">
    <div class="feature-hit-area">
      <div id="column-5" class="feature-column" tabindex="0">
        <interact-element data-interact-key="txt-5">
          <div class="feature-text-group">
            <p class="feature-bottom-subtitle">Metropolitan Area</p>
            <h2 class="feature-bottom-title">Urban Landscapes</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-6">
    <div class="feature-hit-area">
      <div id="column-6" class="feature-column" tabindex="0">
        <interact-element data-interact-key="txt-6">
          <div class="feature-text-group">
            <p class="feature-bottom-subtitle">Night Sky</p>
            <h2 class="feature-bottom-title">The Aurora</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </div>
  </interact-element>
</main>
```

## Essential styles

```css
:root {
  --panel-default-width: 220px;
}

html {
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.feature-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  padding: 1.25rem;
  box-sizing: border-box;
}

interact-element[data-interact-key^='col-'] {
  display: contents;
}

.feature-hit-area {
  width: 100%;
  height: 25vh;
  position: relative;
}

.feature-column {
  width: 100%;
  max-height: 25vh;
  overflow: clip;
  position: absolute;
  inset: 0;
  z-index: 1;
}

.feature-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.feature-text-group {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  z-index: 10;
  pointer-events: none;
}

.feature-bottom-subtitle {
  margin-bottom: 0.25rem;
}

.feature-bottom-title {
  white-space: nowrap;
}

@media (min-width: 769px) {
  body {
    height: 100vh;
    display: flex;
    align-items: center;
    overflow: clip;
  }

  .feature-container {
    flex-direction: row;
    height: 80vh;
    width: auto;
    margin: 0 auto;
    padding: 1rem 5vw;
    gap: 1rem;
    overflow-x: auto;
  }

  .feature-hit-area {
    width: var(--panel-default-width, 220px);
    height: 100%;
    flex-shrink: 0;
  }

  .feature-column {
    width: var(--panel-default-width, 220px);
    max-height: none;
    height: 100%;
  }
}
```

## Interact config

```js
const panelDefaultWidth = '220px';
const panelOpenWidth = '600px';
const panelSpeed = 1;

const config = {
  effects: {
    'v-expand': {
      keyframeEffect: {
        name: 'v-exp',
        keyframes: [{ maxHeight: '25vh' }, { maxHeight: '75vh', zIndex: 10 }],
      },
      duration: Math.round(600 / panelSpeed),
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
    },
    'h-expand': {
      keyframeEffect: {
        name: 'h-exp',
        keyframes: [{ width: panelDefaultWidth }, { width: panelOpenWidth, zIndex: 10 }],
      },
      duration: Math.round(600 / panelSpeed),
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
    },
    reveal: {
      keyframeEffect: {
        name: 't-rev',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
      duration: Math.round(400 / panelSpeed),
      delay: Math.round(150 / panelSpeed),
      easing: 'ease-out',
      fill: 'both',
    },
  },
  conditions: {
    mobile: { type: 'media', predicate: '(max-width: 768px)' },
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
  },
  interactions: [],
};

for (let i = 1; i <= 6; i++) {
  const colKey = `col-${i}`;
  const txtKey = `txt-${i}`;

  config.interactions.push({
    key: colKey,
    trigger: 'hover',
    conditions: ['mobile'],
    effects: [
      { key: colKey, selector: '.feature-column', effectId: 'v-expand', triggerType: 'alternate' },
      { key: txtKey, effectId: 'reveal', triggerType: 'alternate' },
    ],
  });

  config.interactions.push({
    key: colKey,
    trigger: 'hover',
    conditions: ['desktop'],
    effects: [
      { key: colKey, selector: '.feature-column', effectId: 'h-expand', triggerType: 'alternate' },
      { key: txtKey, effectId: 'reveal', triggerType: 'alternate' },
    ],
  });
}
```
