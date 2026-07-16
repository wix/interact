# Accordion Scroll Vertical

Each panel in a vertical stack expands its height and reveals an overlay text label on hover, then collapses when the pointer leaves.

**Tags:** hover, gallery, flex, height, opacity, transform, fade, stagger

## Markup

```html
<div class="w-full mx-auto">
  <div id="feature-container" class="feature-container">
    <interact-element data-interact-key="#column-1">
      <div id="column-1" class="feature-column">
        <interact-element data-interact-key="#text-1">
          <div id="text-1" class="feature-text-group">
            <p class="feature-bottom-subtitle">Italian Alps</p>
            <h2 class="feature-bottom-title">Serene Lakes</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </interact-element>
    <interact-element data-interact-key="#column-2">
      <div id="column-2" class="feature-column">
        <interact-element data-interact-key="#text-2">
          <div id="text-2" class="feature-text-group">
            <p class="feature-bottom-subtitle">Arid Climate</p>
            <h2 class="feature-bottom-title">Vast Deserts</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </interact-element>
    <interact-element data-interact-key="#column-3">
      <div id="column-3" class="feature-column">
        <interact-element data-interact-key="#text-3">
          <div id="text-3" class="feature-text-group">
            <p class="feature-bottom-subtitle">Tropical Paradise</p>
            <h2 class="feature-bottom-title">Lush Rainforests</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </interact-element>
    <interact-element data-interact-key="#column-4">
      <div id="column-4" class="feature-column">
        <interact-element data-interact-key="#text-4">
          <div id="text-4" class="feature-text-group">
            <p class="feature-bottom-subtitle">Coastal Views</p>
            <h2 class="feature-bottom-title">Ocean Cliffs</h2>
          </div>
        </interact-element>
        <img src="" class="feature-image" />
      </div>
    </interact-element>
  </div>
</div>
```

## Essential styles

```css
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-container {
  display: flex;
  flex-direction: column;
  gap: var(--panel-gap, 1.5rem);
  width: 100%;
  margin: 0 auto;
}

.feature-column {
  width: 100%;
  max-height: var(--panel-default-height, 20vh);
  overflow: clip;
  position: relative;
  z-index: 1;
}

.feature-column .feature-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-text-group {
  position: absolute;
  bottom: 1.25rem;
  left: 1.25rem;
  opacity: 0;
  transform: translateY(20px);
  z-index: 10;
  user-select: none;
  pointer-events: none;
}

.feature-bottom-subtitle {
  white-space: nowrap;
}

.feature-bottom-title {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .feature-column {
    max-height: 25vh;
  }
}
```

## Interact config

```js
const config = {
  effects: {
    'expand-column': {
      keyframeEffect: {
        name: 'expand-collapse',
        keyframes: [
          { maxHeight: '20vh', marginBottom: '0rem', zIndex: 1 },
          { maxHeight: '50vh', marginBottom: 'calc(-30vh - 1.5rem)', zIndex: 10 },
        ],
      },
      duration: 500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'both',
    },
    'show-text': {
      keyframeEffect: {
        name: 'show-hide-text',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
      duration: 400,
      delay: 200,
      easing: 'ease-out',
      fill: 'both',
    },
  },
  interactions: [
    {
      key: '#column-1',
      trigger: 'hover',
      effects: [
        { key: '#column-1', effectId: 'expand-column', triggerType: 'alternate' },
        { key: '#text-1', effectId: 'show-text', triggerType: 'alternate' },
      ],
    },
    {
      key: '#column-2',
      trigger: 'hover',
      effects: [
        { key: '#column-2', effectId: 'expand-column', triggerType: 'alternate' },
        { key: '#text-2', effectId: 'show-text', triggerType: 'alternate' },
      ],
    },
    {
      key: '#column-3',
      trigger: 'hover',
      effects: [
        { key: '#column-3', effectId: 'expand-column', triggerType: 'alternate' },
        { key: '#text-3', effectId: 'show-text', triggerType: 'alternate' },
      ],
    },
    {
      key: '#column-4',
      trigger: 'hover',
      effects: [
        { key: '#column-4', effectId: 'expand-column', triggerType: 'alternate' },
        { key: '#text-4', effectId: 'show-text', triggerType: 'alternate' },
      ],
    },
  ],
};
```
