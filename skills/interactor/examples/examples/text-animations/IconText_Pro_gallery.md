# IconText Pro Gallery

On hover, each narrow card in a horizontal flex gallery expands its width, the centered icon slides toward the top-left corner, and a title and description fade up into view.

**Tags:** hover, flex, gallery, opacity, transform, scale, reveal

## Markup

```html
<header class="gallery-header">
  <h1>Pro Heights Gallery</h1>
</header>

<main class="feature-container">
  <interact-element data-interact-key="col-1">
    <div id="col-1-card" class="feature-column" tabindex="0">
      <div class="icon-wrapper">
        <svg
          class="feature-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
      </div>
      <div class="feature-text-group">
        <p class="feature-bottom-subtitle">Monolithic Peaks</p>
        <h2 class="feature-bottom-title">The High Alps</h2>
        <p class="feature-description">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-2">
    <div id="col-2-card" class="feature-column" tabindex="0">
      <div class="icon-wrapper">
        <svg
          class="feature-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </div>
      <div class="feature-text-group">
        <p class="feature-bottom-subtitle">Stark Silhouettes</p>
        <h2 class="feature-bottom-title">Desert Sands</h2>
        <p class="feature-description">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-3">
    <div id="col-3-card" class="feature-column" tabindex="0">
      <div class="icon-wrapper">
        <svg
          class="feature-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
          />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C10.9 14.36 12 15.19 12 18s-1.5 5-10 3Z" />
        </svg>
      </div>
      <div class="feature-text-group">
        <p class="feature-bottom-subtitle">Natural Textures</p>
        <h2 class="feature-bottom-title">Wild Forests</h2>
        <p class="feature-description">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-4">
    <div id="col-4-card" class="feature-column" tabindex="0">
      <div class="icon-wrapper">
        <svg
          class="feature-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M2 6c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1"
          />
          <path
            d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1"
          />
          <path
            d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1"
          />
        </svg>
      </div>
      <div class="feature-text-group">
        <p class="feature-bottom-subtitle">Timeless Tides</p>
        <h2 class="feature-bottom-title">Deep Waters</h2>
        <p class="feature-description">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="col-5">
    <div id="col-5-card" class="feature-column" tabindex="0">
      <div class="icon-wrapper">
        <svg
          class="feature-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="8" height="18" x="3" y="3" rx="2" />
          <rect width="8" height="10" x="13" y="11" rx="2" />
          <path d="M9 9h.01" />
          <path d="M17 15h.01" />
          <path d="M9 13h.01" />
          <path d="M17 19h.01" />
          <path d="M9 17h.01" />
        </svg>
      </div>
      <div class="feature-text-group">
        <p class="feature-bottom-subtitle">Urban Density</p>
        <h2 class="feature-bottom-title">Steel Grids</h2>
        <p class="feature-description">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </div>
  </interact-element>
</main>
```

## Essential styles

```css
:root {
  --panel-default-width: 180px;
  --panel-open-width: 700px;
}

html {
  overflow-x: clip;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: clip;
}

.gallery-header {
  width: 100%;
  text-align: center;
  padding: 2.5rem 1rem;
  z-index: 20;
}

.feature-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
}

interact-element {
  display: block;
  width: 100% !important;
}

@media (max-width: 768px) {
  .feature-column {
    width: 100% !important;
    height: auto;
    min-height: 420px;
    padding: 3rem 2rem;
    overflow: clip;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  .icon-wrapper {
    margin-bottom: 2rem;
    opacity: 0.25;
    transform: scale(1.2);
  }

  .feature-text-group {
    position: relative;
    opacity: 1 !important;
    transform: none !important;
    text-align: left;
  }
}

.feature-icon {
  width: 42px;
  height: 42px;
}

@media (min-width: 769px) {
  body {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: clip;
  }

  .feature-container {
    flex-direction: row;
    height: 65vh;
    width: auto;
    max-width: 95vw;
    margin: 0 auto;
    padding: 0 2vw;
    gap: 1.25rem;
    overflow: visible;
  }

  interact-element {
    display: block;
    height: 100%;
    width: auto !important;
  }

  .feature-column {
    width: var(--panel-default-width, 180px);
    height: 100%;
    flex-shrink: 0;
    overflow: clip;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    opacity: 0.8;
    pointer-events: none;
  }

  .feature-text-group {
    position: absolute;
    bottom: 3.5rem;
    left: 3.5rem;
    width: calc(var(--panel-open-width, 700px) - 100px);
    max-height: calc(100% - 3rem);
    overflow: clip;
    opacity: 0;
    transform: translateY(20px);
    z-index: 10;
    pointer-events: none;
    text-align: left;
  }
}
```

## Interact config

```js
const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
  },
  effects: {
    'h-expand': {
      keyframeEffect: {
        name: 'h-exp',
        keyframes: [{ width: '180px' }, { width: '700px', zIndex: 10 }],
      },
      triggerType: 'alternate',
      duration: 800,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
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
      triggerType: 'alternate',
      duration: 400,
      delay: 250,
      easing: 'ease-out',
      fill: 'both',
    },
    'icon-move': {
      keyframeEffect: {
        name: 'i-mov',
        keyframes: [
          { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
          { transform: 'translate(-280px, -170px) scale(0.9)', opacity: 1 },
        ],
      },
      triggerType: 'alternate',
      duration: 800,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      fill: 'both',
    },
  },
  interactions: [
    {
      key: 'col-1',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        { key: 'col-1', selector: '#col-1-card', effectId: 'h-expand' },
        { key: 'col-1', selector: '#col-1-card .feature-text-group', effectId: 'reveal' },
        { key: 'col-1', selector: '#col-1-card .icon-wrapper', effectId: 'icon-move' },
      ],
    },
    {
      key: 'col-2',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        { key: 'col-2', selector: '#col-2-card', effectId: 'h-expand' },
        { key: 'col-2', selector: '#col-2-card .feature-text-group', effectId: 'reveal' },
        { key: 'col-2', selector: '#col-2-card .icon-wrapper', effectId: 'icon-move' },
      ],
    },
    {
      key: 'col-3',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        { key: 'col-3', selector: '#col-3-card', effectId: 'h-expand' },
        { key: 'col-3', selector: '#col-3-card .feature-text-group', effectId: 'reveal' },
        { key: 'col-3', selector: '#col-3-card .icon-wrapper', effectId: 'icon-move' },
      ],
    },
    {
      key: 'col-4',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        { key: 'col-4', selector: '#col-4-card', effectId: 'h-expand' },
        { key: 'col-4', selector: '#col-4-card .feature-text-group', effectId: 'reveal' },
        { key: 'col-4', selector: '#col-4-card .icon-wrapper', effectId: 'icon-move' },
      ],
    },
    {
      key: 'col-5',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        { key: 'col-5', selector: '#col-5-card', effectId: 'h-expand' },
        { key: 'col-5', selector: '#col-5-card .feature-text-group', effectId: 'reveal' },
        { key: 'col-5', selector: '#col-5-card .icon-wrapper', effectId: 'icon-move' },
      ],
    },
  ],
};
```
