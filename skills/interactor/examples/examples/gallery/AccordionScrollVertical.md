# Accordion Scroll Vertical

Each panel in a vertical stack expands its height and reveals an overlay text label on hover, then collapses when the pointer leaves.

**Tags:** hover, click, gallery, flex, height, opacity, transform, fade, stagger

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
        <img src="https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=1974&auto=format=fit=crop" alt="A serene lake with mountains in the background" class="feature-image">
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
        <img src="https://images.unsplash.com/photo-1488197047962-b48492212cda?q=80&w=2070&auto=format=fit=crop" alt="Sand dunes in a vast desert under a clear sky" class="feature-image">
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
        <img src="https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1974&auto=format=fit=crop" alt="A dense rainforest with sunlight filtering through the canopy" class="feature-image">
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
        <img src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1974&auto=format=fit=crop" alt="Dramatic ocean cliffs with waves crashing below" class="feature-image">
      </div>
    </interact-element>
  </div>
</div>
```

## Essential styles

```css
:root {
  --panel-default-height: 20vh;
  --panel-open-height: 50vh;
  --panel-speed: 1;
  --panel-gap: 1.5rem;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #ffffff;
  overscroll-behavior-y: contain;
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
  overflow: hidden;
  position: relative;
  z-index: 1;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
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
  text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.6);
  line-height: 1.2;
  user-select: none;
  pointer-events: none;
}

.feature-bottom-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}

.feature-bottom-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .feature-column {
    max-height: 25vh;
  }
  .feature-bottom-title {
    font-size: 1.5rem;
  }
  .feature-bottom-subtitle {
    font-size: 0.8rem;
  }
}
```

## Interact config

```js
{
  effects: {
    'expand-column': {
      keyframeEffect: {
        name: 'expand-collapse',
        keyframes: [
          { maxHeight: '20vh', marginBottom: '0rem', zIndex: 1 },
          { maxHeight: '50vh', marginBottom: 'calc(-30vh - 1.5rem)', zIndex: 10 }
        ]
      },
      duration: 500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'both'
    },
    'show-text': {
      keyframeEffect: {
        name: 'show-hide-text',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ]
      },
      duration: 400,
      delay: 200,
      easing: 'ease-out',
      fill: 'both'
    }
  },
  interactions: [
    {
      key: '#column-1',
      trigger: 'hover',
      params: { type: 'alternate' },
      effects: [
        { key: '#column-1', effectId: 'expand-column' },
        { key: '#text-1', effectId: 'show-text' }
      ]
    },
    {
      key: '#column-2',
      trigger: 'hover',
      params: { type: 'alternate' },
      effects: [
        { key: '#column-2', effectId: 'expand-column' },
        { key: '#text-2', effectId: 'show-text' }
      ]
    },
    {
      key: '#column-3',
      trigger: 'hover',
      params: { type: 'alternate' },
      effects: [
        { key: '#column-3', effectId: 'expand-column' },
        { key: '#text-3', effectId: 'show-text' }
      ]
    },
    {
      key: '#column-4',
      trigger: 'hover',
      params: { type: 'alternate' },
      effects: [
        { key: '#column-4', effectId: 'expand-column' },
        { key: '#text-4', effectId: 'show-text' }
      ]
    }
  ]
}
```
