# Cards Peel Off Scroll

Stacked content cards animate in sequence as the user scrolls — each card peels off the stack with a rotational fade-out on exit, while the hero title and final card fade in on view entry.

**Tags:** viewProgress, viewEnter, sticky, opacity, transform, rotate, stagger, reveal

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

<section class="card-section first">
  <div class="card-wrap">
    <interact-element data-interact-key="card-1">
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <span class="label">Step 01</span>
        <h2>Design</h2>
        <p class="subtitle">Every great product begins with intention</p>
        <p class="body">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </interact-element>
  </div>
</section>

<section class="card-section second">
  <div class="card-wrap">
    <interact-element data-interact-key="card-2">
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
          </svg>
        </div>
        <span class="label">Step 02</span>
        <h2>Build</h2>
        <p class="subtitle">Craft with precision and care</p>
        <p class="body">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </interact-element>
  </div>
</section>

<section class="card-section third">
  <div class="card-wrap">
    <interact-element data-interact-key="card-3">
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <span class="label">Step 03</span>
        <h2>Launch</h2>
        <p class="subtitle">Bring your vision to the world</p>
        <p class="body">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </interact-element>
  </div>
</section>

<section class="card-section fourth">
  <div class="card-wrap">
    <interact-element data-interact-key="card-4">
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <span class="label">Step 04</span>
        <h2>Complete</h2>
        <p class="subtitle">All layers aligned, scroll ends here</p>
        <p class="body">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </interact-element>
  </div>
</section>
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

body {
  overflow-x: clip;
}

.hero {
  position: fixed;
  inset: 0 0 auto;
  z-index: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 2rem;
  pointer-events: none;
}

.hero h1 {
  font-size: clamp(2.75rem, 6vw, 4.25rem);
  margin-bottom: 0.75rem;
  opacity: 0;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0;
}

.card-section {
  position: relative;
}

.card-section.first {
  min-height: 280dvh;
  z-index: 4;
}
.card-section.second {
  min-height: 440dvh;
  margin-top: -280dvh;
  z-index: 3;
}
.card-section.third {
  min-height: 600dvh;
  margin-top: -440dvh;
  z-index: 2;
}
.card-section.fourth {
  min-height: 700dvh;
  margin-top: -600dvh;
  z-index: 1;
}

.card-wrap {
  position: sticky;
  top: 0;
  height: 100dvh;
  display: grid;
  place-items: start center;
  padding: max(10rem, 27dvh) 2rem 2rem;
}

.card {
  --tilt: 0deg;
  width: 57.6dvh;
  aspect-ratio: 5 / 4;
  padding: 3.5rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: rotate(var(--tilt));
}

.card-section.first .card {
  --tilt: -4deg;
}
.card-section.second .card {
  --tilt: 5deg;
}
.card-section.third .card {
  --tilt: -3.5deg;
}
.card-section.fourth .card {
  --tilt: 2.5deg;
}

@media (max-width: 750px) {
  .card-wrap {
    padding: max(10rem, 27dvh) 20px 20px;
  }
  .card {
    width: min(57.6dvh, calc(100vw - 40px));
    padding: 2.5rem 1.5rem;
  }
}

@media (max-width: 390px) {
  .card {
    padding: 2rem 1.25rem;
  }
}
```

## Interact config

```js
const exitRange = {
  rangeStart: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
  rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
};

const heroEnter = {
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  fill: 'both',
};

const config = {
  conditions: {
    'full-motion': {
      type: 'media',
      predicate: '(prefers-reduced-motion: no-preference)',
    },
  },

  interactions: [
    {
      key: 'hero',
      trigger: 'viewEnter',
      sequences: [
        {
          offset: 300,
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
              duration: 1200,
              ...heroEnter,
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
              duration: 1000,
              ...heroEnter,
            },
          ],
        },
      ],
    },

    {
      key: 'card-1',
      trigger: 'viewProgress',
      conditions: ['full-motion'],
      effects: [
        {
          keyframeEffect: {
            name: 'card-1-exit',
            keyframes: [
              { transform: 'rotate(-4deg)', opacity: 1 },
              { transform: 'rotate(-10deg)', opacity: 0 },
            ],
          },
          fill: 'both',
          easing: 'ease-in',
          ...exitRange,
        },
      ],
    },

    {
      key: 'card-2',
      trigger: 'viewProgress',
      conditions: ['full-motion'],
      effects: [
        {
          keyframeEffect: {
            name: 'card-2-exit',
            keyframes: [
              { transform: 'rotate(5deg)', opacity: 1 },
              { transform: 'rotate(11deg)', opacity: 0 },
            ],
          },
          fill: 'both',
          easing: 'ease-in',
          ...exitRange,
        },
      ],
    },

    {
      key: 'card-3',
      trigger: 'viewProgress',
      conditions: ['full-motion'],
      effects: [
        {
          keyframeEffect: {
            name: 'card-3-exit',
            keyframes: [
              { transform: 'rotate(-3.5deg)', opacity: 1 },
              { transform: 'rotate(-9.5deg)', opacity: 0 },
            ],
          },
          fill: 'both',
          easing: 'ease-in',
          ...exitRange,
        },
      ],
    },

    {
      key: 'card-4',
      trigger: 'viewEnter',
      conditions: ['full-motion'],
      effects: [
        {
          keyframeEffect: {
            name: 'card-4-enter',
            keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(2.5deg)' }],
          },
          triggerType: 'once',
          duration: 600,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        },
      ],
    },
  ],
};
```
