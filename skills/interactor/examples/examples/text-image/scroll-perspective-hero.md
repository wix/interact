# Scroll Perspective Hero

A hero image animates through a 3D perspective rotation and scale as the user scrolls, while a giant backdrop headline and bottom content panel fade in, all driven by a sticky scroll container.

**Tags:** viewProgress, sticky, parallax, 3d, transform, opacity, scale, rotate, fade

## Markup

```html
<interact-element data-interact-key="scroll-driver">
  <div class="scroll-driver">
    <div class="sticky-stage">

      <div class="bg-universe"></div>

      <interact-element data-interact-key="giant-type">
        <div class="giant-type">
          <h1>BEYOND<br>REAL</h1>
        </div>
      </interact-element>

      <div class="hero-zone">
        <interact-element data-interact-key="hero-image">
          <div class="hero-frame">
            <img
              class="hero-img"
              src=""
              width="900"
              height="1200"

            >
          </div>
        </interact-element>
      </div>

      <header class="top-bar">
        <span class="brand">Apex Chroma</span>
      </header>

      <div class="content-panel">
        <div class="panel-left">
          <h2>Design<br><span>Without</span> Limits</h2>
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
*, *::before, *::after { box-sizing: border-box; }

:root {
  --space-x: clamp(1rem, 4vw, 2.5rem);
  --space-top: clamp(1rem, 3vw, 1.75rem);
  --space-bottom: clamp(1.25rem, 5vw, 3rem);
  --hero-width: clamp(160px, 42vw, 320px);
  --hero-max-height: min(50dvh, 68vw);
  --type-size: clamp(3.25rem, 22vw, 22rem);
  --heading-size: clamp(1.85rem, 7.5vw, 4.5rem);
  --body-size: clamp(0.8125rem, 2.4vw, 0.9rem);
  --brand-size: clamp(0.5rem, 1.6vw, 0.65rem);
  --cta-size: clamp(0.625rem, 1.8vw, 0.7rem);
  --panel-gap: clamp(1rem, 3vw, 2rem);
  --perspective: 700px;
  --scroll-height: 520vh;
}

body {
  margin: 0;
  overflow-x: clip;
}

interact-element { display: contents; }

.hero-frame {
  position: relative;
  width: var(--hero-width);
  aspect-ratio: 3 / 4;
  height: auto;
  max-height: var(--hero-max-height);
  transform-origin: center center;
  transform-style: preserve-3d;
  will-change: transform;
  transform: perspective(var(--perspective)) rotateY(0deg) rotateX(0deg) scale(0.65);
}

.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 1;
  visibility: visible;
}

.scroll-driver { height: var(--scroll-height); }

.sticky-stage {
  position: sticky;
  top: 0;
  height: 100dvh;
  min-height: 100vh;
  overflow: clip;
}

.bg-universe {
  position: absolute;
  inset: 0;
  overflow: clip;
}

.giant-type {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
  overflow: clip;
}

.giant-type h1 {
  font-size: var(--type-size);
  font-weight: 400;
  line-height: 0.85;
  letter-spacing: clamp(0.02em, 0.5vw, 0.04em);
  text-align: center;
  padding: 0 var(--space-x);
  width: 100%;
  max-width: 100%;
  transform-origin: center center;
}

.hero-zone {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    clamp(3.5rem, 12vh, 5rem)
    var(--space-x)
    clamp(10rem, 28vh, 12rem);
  z-index: 5;
  perspective: var(--perspective);
  perspective-origin: 50% 50%;
  overflow: visible;
  pointer-events: none;
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding:
    calc(var(--space-top) + env(safe-area-inset-top, 0px))
    calc(var(--space-x) + env(safe-area-inset-right, 0px))
    var(--space-top)
    calc(var(--space-x) + env(safe-area-inset-left, 0px));
}

.brand {
  font-size: var(--brand-size);
  letter-spacing: clamp(0.28em, 1.2vw, 0.4em);
  text-transform: uppercase;
}

.content-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 8;
  padding:
    0
    calc(var(--space-x) + env(safe-area-inset-right, 0px))
    calc(var(--space-bottom) + env(safe-area-inset-bottom, 0px))
    calc(var(--space-x) + env(safe-area-inset-left, 0px));
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--panel-gap);
  align-items: end;
}

.panel-left h2 {
  font-size: var(--heading-size);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.02em;
  margin: 0 0 clamp(0.5rem, 2vw, 0.75rem);
}

.panel-left p {
  font-size: var(--body-size);
  font-weight: 300;
  line-height: 1.75;
  max-width: min(22rem, 100%);
  margin: 0;
}

.panel-right {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.4rem, 1.5vw, 0.6rem);
  min-height: 2.75rem;
  padding: clamp(0.75rem, 2vw, 0.9rem) clamp(1.25rem, 4vw, 1.8rem);
  border: 1px solid;
  border-radius: 999px;
  font-size: var(--cta-size);
  letter-spacing: clamp(0.12em, 0.4vw, 0.18em);
  text-transform: uppercase;
  transition: border-color 0.3s;
  white-space: nowrap;
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
    transform: perspective(560px) rotateY(0deg) rotateX(0deg) scale(1) !important;
  }
}

@media (min-width: 640px) {
  .content-panel {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .panel-right {
    align-items: flex-end;
  }
}

@media (min-width: 768px) {
  :root {
    --hero-width: clamp(188px, 28.8vw, 320px);
    --hero-max-height: min(49.6dvh, 56vw);
    --scroll-height: 520vh;
  }

  .hero-zone {
    padding-bottom: clamp(8rem, 18vh, 10rem);
  }
}

@media (min-width: 1024px) {
  :root {
    --hero-width: clamp(208px, 22vw, 320px);
    --type-size: clamp(6rem, 18vw, 22rem);
  }
}

@media (max-width: 767px) {
  :root {
    --hero-width: clamp(150px, 52vw, 240px);
    --hero-max-height: min(42dvh, 72vw);
    --perspective: 560px;
    --scroll-height: 440vh;
    --type-size: clamp(3rem, 19vw, 5.5rem);
  }

  .hero-zone {
    align-items: center;
    padding-bottom: clamp(11rem, 32vh, 14rem);
  }
}

@media (max-width: 480px) {
  :root {
    --hero-width: clamp(140px, 58vw, 210px);
    --hero-max-height: min(38dvh, 78vw);
    --perspective: 480px;
    --scroll-height: 400vh;
    --heading-size: clamp(1.65rem, 9vw, 2.25rem);
  }
}

@media (max-height: 600px) and (orientation: landscape) {
  :root {
    --hero-width: clamp(120px, 24vh, 200px);
    --hero-max-height: min(58dvh, 32vw);
    --scroll-height: 380vh;
    --type-size: clamp(2.5rem, 14vw, 5rem);
    --heading-size: clamp(1.5rem, 5vw, 2.5rem);
  }

  .hero-zone {
    padding-top: clamp(2.5rem, 8vh, 3.5rem);
    padding-bottom: clamp(7rem, 22vh, 9rem);
  }

  .content-panel {
    gap: 0.75rem;
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

{
  conditions: {
    motionOk: { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
  },
  interactions: [{
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
  }],
}
```
