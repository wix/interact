# Scroll Perspective Hero

A hero image animates through a 3D perspective rotation and scale as the user scrolls, while a giant backdrop headline and bottom content panel fade in, all driven by a sticky scroll container.

**Tags:** viewProgress, sticky, parallax, 3d, transform, opacity, scale, rotate, fade

## Markup

```html
<interact-element data-interact-key="scroll-driver">
  <div class="scroll-driver">
    <div class="sticky-stage">
      <interact-element data-interact-key="giant-type">
        <div class="giant-type">
          <h1>BEYOND<br />REAL</h1>
        </div>
      </interact-element>

      <div class="hero-zone">
        <interact-element data-interact-key="hero-image">
          <div class="hero-frame">
            <img class="hero-img" src="" alt="" width="900" height="1200" />
          </div>
        </interact-element>
      </div>

      <header class="top-bar">
        <span class="brand">Apex Chroma</span>
      </header>

      <div class="content-panel">
        <div class="panel-left">
          <h2>Design<br /><span>Without</span> Limits</h2>
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
        <div class="panel-right">
          <a href="#" class="cta">Launch Experience →</a>
        </div>
      </div>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
:root {
  --space-x: clamp(1rem, 4vw, 2.5rem);
  --hero-width: clamp(160px, 42vw, 320px);
  --perspective: 700px;
}

interact-element {
  display: contents;
}

.scroll-driver {
  height: 520vh;
}

.sticky-stage {
  position: sticky;
  top: 0;
  height: 100dvh;
  min-height: 100vh;
  overflow: clip;
}

.hero-frame {
  position: relative;
  width: var(--hero-width);
  aspect-ratio: 3 / 4;
  transform-origin: center center;
  transform-style: preserve-3d;
  transform: perspective(var(--perspective)) rotateY(0deg) rotateX(0deg) scale(0.65);
}

.hero-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.giant-type {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}

.giant-type h1 {
  width: 100%;
  font-size: clamp(3.25rem, 22vw, 22rem);
  text-align: center;
  transform-origin: center center;
}

.hero-zone {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  perspective: var(--perspective);
  pointer-events: none;
}

.top-bar {
  position: absolute;
  inset: 0 0 auto;
  z-index: 10;
  padding: calc(1rem + env(safe-area-inset-top, 0px))
    calc(var(--space-x) + env(safe-area-inset-right, 0px)) 1rem
    calc(var(--space-x) + env(safe-area-inset-left, 0px));
}

.content-panel {
  position: absolute;
  inset: auto 0 0;
  z-index: 8;
  padding: 0 calc(var(--space-x) + env(safe-area-inset-right, 0px))
    calc(1.25rem + env(safe-area-inset-bottom, 0px))
    calc(var(--space-x) + env(safe-area-inset-left, 0px));
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: end;
}

.panel-left p {
  max-width: min(22rem, 100%);
}

.panel-right {
  display: flex;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
}

.giant-type h1,
.content-panel {
  opacity: 0;
  visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .giant-type h1,
  .content-panel {
    opacity: 1;
    visibility: visible;
  }

  .hero-frame {
    transform: none !important;
  }
}

@media (min-width: 640px) {
  .content-panel {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .panel-right {
    justify-content: flex-end;
  }
}

@media (max-width: 767px) {
  :root {
    --hero-width: clamp(150px, 52vw, 240px);
    --perspective: 560px;
  }

  .scroll-driver {
    height: 440vh;
  }
}
```

## Interact config

```js
const pct = (value) => ({ value, unit: 'percentage' });
const cover = (start, end) => ({
  rangeStart: { name: 'cover', offset: pct(start) },
  rangeEnd: { name: 'cover', offset: pct(end) },
});
const scroll = cover(0, 100);
const fadeInScroll = {
  rangeStart: { name: 'contain', offset: pct(0) },
  rangeEnd: { name: 'contain', offset: pct(10) },
};

const scrollFadeIn = (name) => ({
  conditions: ['motionOk'],
  keyframeEffect: {
    name,
    keyframes: [
      { opacity: 0, visibility: 'hidden' },
      { opacity: 1, visibility: 'visible' },
    ],
  },
  ...fadeInScroll,
  easing: 'ease-out',
  fill: 'both',
});

function heroKeyframesForViewport() {
  const landscape = window.matchMedia('(max-height: 600px) and (orientation: landscape)').matches;
  const small = window.matchMedia('(max-width: 480px)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches;

  let perspective = 560;
  let peakPerspective = 440;
  let peakRotateY = 52;
  let scales = [0.65, 0.8, 0.96, 1.08, 1.18];

  if (landscape) {
    perspective = 420;
    peakPerspective = 330;
    peakRotateY = 32;
    scales = [0.58, 0.7, 0.82, 0.9, 0.98];
  } else if (small) {
    perspective = 390;
    peakPerspective = 310;
    peakRotateY = 38;
    scales = [0.6, 0.74, 0.88, 0.98, 1.06];
  } else if (mobile) {
    perspective = 450;
    peakPerspective = 360;
    peakRotateY = 45;
    scales = [0.62, 0.76, 0.9, 1.0, 1.1];
  }

  return scales.map((scale, index) => {
    const p = index === 2 ? peakPerspective : perspective;
    return {
      transform: `perspective(${p}px) rotateY(${index === 2 ? peakRotateY : 0}deg) rotateX(0deg) scale(${scale})`,
    };
  });
}

const config = {
  conditions: {
    motionOk: { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
  },
  interactions: [
    {
      key: 'scroll-driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'giant-type',
          selector: 'h1',
          ...scrollFadeIn('type-fade-in'),
        },
        {
          key: 'scroll-driver',
          selector: '.content-panel',
          ...scrollFadeIn('content-fade-in'),
        },
        {
          key: 'hero-image',
          selector: '.hero-frame',
          conditions: ['motionOk'],
          keyframeEffect: {
            name: 'hero-motion',
            keyframes: heroKeyframesForViewport(),
          },
          ...scroll,
          easing: 'ease-in-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```
