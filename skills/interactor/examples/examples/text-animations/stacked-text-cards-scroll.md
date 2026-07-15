# Stacked Text Cards Scroll

Four sticky content cards stack on top of each other as the user scrolls, each new card rotating into place from alternating counter-clockwise and clockwise angles via viewProgress, while a hero heading and subtitle fade up on viewEnter.

**Tags:** viewProgress, viewEnter, sticky, rotate, transform, opacity, fade, stagger, reveal

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
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <span class="label">Step 01</span>
        <h2>Design</h2>
        <p class="subtitle">Every great product begins with intention</p>
        <p class="body">The first card anchors in place. As you scroll, each new card will stack on top, creating a layered experience that guides the eye.</p>
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
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
          </svg>
        </div>
        <span class="label">Step 02</span>
        <h2>Build</h2>
        <p class="subtitle">Craft with precision and care</p>
        <p class="body">This card scrolls in and stops directly on top of the first. The stacking creates depth and draws attention to the journey.</p>
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
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <span class="label">Step 03</span>
        <h2>Launch</h2>
        <p class="subtitle">Bring your vision to the world</p>
        <p class="body">Three cards now stacked. Each layer represents a phase of the process, building toward the final result.</p>
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <span class="label">Step 04</span>
        <h2>Complete</h2>
        <p class="subtitle">All layers aligned, scroll ends here</p>
        <p class="body">The full stack is now visible. Four cards, one story. This is where the scroll stops and the experience concludes.</p>
      </div>
    </interact-element>
  </div>
</section>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

interact-element { display: block; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', sans-serif;
  background: #f5f5f7;
  color: #1d1d1f;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.hero {
  position: sticky;
  top: 48vh;
  transform: translateY(-50%);
  z-index: 0;
  min-height: 54vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.hero h1 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: clamp(2.75rem, 6vw, 4.25rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  margin-bottom: 0.75rem;
  opacity: 0;
}

.hero p {
  color: #6e6e73;
  font-size: 1.2rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  opacity: 0;
}

.card-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-section.first  { min-height: 580vh; margin-top: -40vh; }
.card-section.second { min-height: 420vh; margin-top: -420vh; }
.card-section.third  { min-height: 260vh; margin-top: -260vh; }
.card-section.fourth { min-height: 120vh; margin-top: -120vh; }

.card-wrap {
  position: sticky;
  top: 50vh;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.card-section.first  .card-wrap { z-index: 1; }
.card-section.second .card-wrap { z-index: 2; }
.card-section.third  .card-wrap { z-index: 3; }
.card-section.fourth .card-wrap { z-index: 4; }

.card {
  width: 72vh;
  aspect-ratio: 4 / 3.2;
  background: #fff;
  border-radius: 36px;
  padding: 4rem 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04), 0 48px 160px rgba(0,0,0,0.08);
}

.card-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 18px;
}

.card-icon svg {
  width: 28px;
  height: 28px;
  color: #1d1d1f;
}

.card .label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #86868b;
  margin-bottom: 1rem;
}

.card h2 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 2.75rem;
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin-bottom: 1rem;
}

.card .subtitle {
  color: #1d1d1f;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.01em;
  max-width: 85%;
}

.card .body {
  color: #6e6e73;
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  margin-top: 1.5rem;
  max-width: 80%;
}

@media (max-width: 750px) {
  body { padding: 0 20px; }
  .hero { padding: 2rem 0; }
  .card-wrap { padding: 20px 0; }
  .card {
    width: min(72vh, calc(100vw - 40px));
    padding: 3rem 2rem;
  }
  .card h2 { font-size: 2.25rem; }
  .card .subtitle { font-size: 1.05rem; }
  .card .body { font-size: 0.9rem; }
}

@media (max-width: 390px) {
  body { padding: 0 20px; }
  .card {
    width: min(72vh, calc(100vw - 40px));
    padding: 2.5rem 1.5rem;
  }
}
```

## Interact config

```js
const entryRange = {
  rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
  rangeEnd:   { name: 'entry', offset: { value: 100, unit: 'percentage' } },
};

{
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
    'enter-ccw': {
      keyframeEffect: {
        name: 'enter-ccw',
        keyframes: [
          { transform: 'rotate(-8deg)' },
          { transform: 'rotate(0deg)' },
        ],
      },
      fill: 'both',
      easing: 'ease-out',
      ...entryRange,
    },
    'enter-cw': {
      keyframeEffect: {
        name: 'enter-cw',
        keyframes: [
          { transform: 'rotate(8deg)' },
          { transform: 'rotate(0deg)' },
        ],
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
      sequences: [{
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
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
            duration: 1000,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          },
        ],
      }],
    },
    {
      key: 'card-2',
      trigger: 'viewProgress',
      conditions: ['full-motion'],
      effects: [
        { effectId: 'enter-ccw' },
      ],
    },
    {
      key: 'card-3',
      trigger: 'viewProgress',
      conditions: ['full-motion'],
      effects: [
        { effectId: 'enter-cw' },
      ],
    },
    {
      key: 'card-4',
      trigger: 'viewProgress',
      conditions: ['full-motion'],
      effects: [
        { effectId: 'enter-ccw' },
      ],
    },
  ],
}
```
