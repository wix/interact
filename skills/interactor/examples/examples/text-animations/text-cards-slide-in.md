# Text Cards Slide In

Cards containing typographic step content slide in from alternating sides with a 3D perspective transform as the user scrolls through dedicated trigger sections, while a hero title and subtitle fade up on initial view entry.

**Tags:** viewProgress, viewEnter, opacity, transform, 3d, stagger, reveal, fixed, fade

## Markup

```html
<interact-element data-interact-key="hero" class="hero">
  <interact-element data-interact-key="hero-title">
    <h1>The Journey</h1>
  </interact-element>
  <interact-element data-interact-key="hero-subtitle">
    <p>From idea to completion</p>
  </interact-element>
</interact-element>
<div class="hero-spacer"></div>

<div class="card-stage">
  <interact-element data-interact-key="card-1" class="card-wrapper">
    <div class="card">
      <div class="card-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <span class="card-label">Step 01</span>
      <h2 class="card-heading">Design</h2>
      <p class="card-subtitle">Crafting the vision</p>
      <p class="card-body">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>
    </div>
  </interact-element>

  <interact-element data-interact-key="card-2" class="card-wrapper">
    <div class="card">
      <div class="card-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      <span class="card-label">Step 02</span>
      <h2 class="card-heading">Build</h2>
      <p class="card-subtitle">Engineering excellence</p>
      <p class="card-body">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>
    </div>
  </interact-element>

  <interact-element data-interact-key="card-3" class="card-wrapper">
    <div class="card">
      <div class="card-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
          />
          <path
            d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
          />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3" />
        </svg>
      </div>
      <span class="card-label">Step 03</span>
      <h2 class="card-heading">Launch</h2>
      <p class="card-subtitle">Into the world</p>
      <p class="card-body">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>
    </div>
  </interact-element>

  <interact-element data-interact-key="card-4" class="card-wrapper">
    <div class="card">
      <div class="card-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <span class="card-label">Step 04</span>
      <h2 class="card-heading">Complete</h2>
      <p class="card-subtitle">Mission accomplished</p>
      <p class="card-body">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>
    </div>
  </interact-element>
</div>

<div class="scroll-canvas">
  <interact-element data-interact-key="trigger-1">
    <div class="scroll-section"></div>
  </interact-element>
  <interact-element data-interact-key="trigger-2">
    <div class="scroll-section"></div>
  </interact-element>
  <interact-element data-interact-key="trigger-3">
    <div class="scroll-section"></div>
  </interact-element>
  <interact-element data-interact-key="trigger-4">
    <div class="scroll-section"></div>
  </interact-element>
  <div class="scroll-section"></div>
</div>
```

## Essential styles

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

interact-element {
  display: block;
}

.hero-spacer {
  height: 100vh;
}

.hero {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 5;
}

.hero h1 {
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 1.05;
  opacity: 0;
}

.hero p {
  font-size: clamp(1rem, 2vw, 1.5rem);
  opacity: 0;
}

.card-stage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.card-wrapper {
  position: absolute;
  width: 630px;
  aspect-ratio: 4 / 3.2;
}

.card-wrapper:nth-child(1) {
  z-index: 1;
}
.card-wrapper:nth-child(2) {
  z-index: 2;
}
.card-wrapper:nth-child(3) {
  z-index: 3;
}
.card-wrapper:nth-child(4) {
  z-index: 4;
}

.card {
  width: 100%;
  height: 100%;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  opacity: 0;
}

.scroll-canvas {
  position: relative;
  z-index: 0;
}

.scroll-section {
  height: 100vh;
}

@media (max-width: 750px) {
  .card-wrapper {
    width: calc(100% - 20px);
  }
  .card {
    padding: 36px 28px;
  }
}

@media (max-width: 390px) {
  .card-wrapper {
    width: calc(100% - 20px);
  }
  .card {
    padding: 28px 20px;
  }
}
```

## Interact config

```js
const entryRange = {
  rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
  rangeEnd: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
};

const config = {
  conditions: {
    'full-motion': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
    'reduced-motion': {
      type: 'media',
      predicate: '(prefers-reduced-motion: reduce)',
    },
  },

  effects: {
    'enter-from-left': {
      keyframeEffect: {
        name: 'enter-left',
        keyframes: [
          {
            opacity: 0,
            transform: 'perspective(800px) translateX(-120vw) rotateX(-6deg) rotateY(14deg)',
          },
          { opacity: 1, transform: 'perspective(800px) translateX(0) rotateX(0) rotateY(0)' },
        ],
      },
      fill: 'both',
      easing: 'ease-out',
      ...entryRange,
    },
    'enter-from-right': {
      keyframeEffect: {
        name: 'enter-right',
        keyframes: [
          {
            opacity: 0,
            transform: 'perspective(800px) translateX(120vw) rotateX(-6deg) rotateY(-14deg)',
          },
          { opacity: 1, transform: 'perspective(800px) translateX(0) rotateX(0) rotateY(0)' },
        ],
      },
      fill: 'both',
      easing: 'ease-out',
      ...entryRange,
    },
    'fade-center': {
      keyframeEffect: {
        name: 'fade-center',
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
      },
      fill: 'both',
      easing: 'ease-out',
      ...entryRange,
    },
  },

  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      sequences: [
        {
          offset: 400,
          triggerType: 'once',
          effects: [
            {
              key: 'hero-title',
              keyframeEffect: {
                name: 'hero-title-fade',
                keyframes: [
                  { opacity: 0, transform: 'translateY(16px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
              },
              duration: 800,
              easing: 'ease-out',
              fill: 'forwards',
            },
            {
              key: 'hero-subtitle',
              keyframeEffect: {
                name: 'hero-sub-fade',
                keyframes: [
                  { opacity: 0, transform: 'translateY(16px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
              },
              duration: 800,
              easing: 'ease-out',
              fill: 'forwards',
            },
          ],
        },
      ],
    },
    {
      key: 'trigger-1',
      trigger: 'viewProgress',
      effects: [
        { key: 'card-1', effectId: 'enter-from-left', conditions: ['full-motion'] },
        { key: 'card-1', effectId: 'fade-center', conditions: ['reduced-motion'] },
      ],
    },
    {
      key: 'trigger-2',
      trigger: 'viewProgress',
      effects: [
        { key: 'card-2', effectId: 'enter-from-right', conditions: ['full-motion'] },
        { key: 'card-2', effectId: 'fade-center', conditions: ['reduced-motion'] },
      ],
    },
    {
      key: 'trigger-3',
      trigger: 'viewProgress',
      effects: [
        { key: 'card-3', effectId: 'enter-from-left', conditions: ['full-motion'] },
        { key: 'card-3', effectId: 'fade-center', conditions: ['reduced-motion'] },
      ],
    },
    {
      key: 'trigger-4',
      trigger: 'viewProgress',
      effects: [
        { key: 'card-4', effectId: 'enter-from-right', conditions: ['full-motion'] },
        { key: 'card-4', effectId: 'fade-center', conditions: ['reduced-motion'] },
      ],
    },
  ],
};
```
