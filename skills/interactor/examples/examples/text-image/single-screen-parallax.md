# Single Screen Parallax

A sticky scroll section where a giant background headline translates horizontally and a hero image scales to zero as the user scrolls, with subtle pointer-tracking parallax on the hero image when hovered.

**Tags:** viewProgress, pointerMove, parallax, sticky, transform, scale, text, opacity

## Markup

```html
<interact-element data-interact-key="scroll-section">
  <section class="scroll-section">
    <div class="sticky-stage">
      <header class="site-header">
        <div class="header-block">SEARCH</div>
        <nav class="site-nav" aria-label="Primary">
          <a href="#">Books</a><a href="#">Audiobooks</a><a href="#">Noname's Book Club</a>
          <a href="#">Home + Apparel</a><a href="#">Gift Cards</a><a href="#">All</a>
        </nav>
        <div class="header-block header-block--right">CART (1)</div>
      </header>

      <interact-element data-interact-key="bg-text">
        <div class="bg-text-layer" aria-hidden="true">
          <h1 class="bg-text">WE WANT REPARATIONS</h1>
        </div>
      </interact-element>

      <p class="bg-text-sub">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>

      <main class="hero-main">
        <interact-element data-interact-key="hero-image">
          <div class="hero-image-scaler">
            <div class="hero-image-wrap">
              <img src="" alt="" width="900" height="1200" />
            </div>
          </div>
        </interact-element>
      </main>
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: contents;
}

.scroll-section {
  height: 220vh;
}

.sticky-stage {
  position: sticky;
  top: 0;
  height: 100dvh;
  min-height: 100vh;
  overflow: clip;
}

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
}

.header-block {
  width: 6rem;
}

.header-block--right {
  text-align: right;
}

.site-nav {
  display: none;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.bg-text-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.bg-text {
  margin: 0;
  padding: 0 4vw;
  font-size: min(50vw, 780px);
  white-space: nowrap;
  transform: translateX(0) scaleY(1.4);
  transform-origin: left center;
}

.bg-text-sub {
  position: fixed;
  left: 4vw;
  bottom: clamp(2rem, 8vh, 3.5rem);
  z-index: 21;
  max-width: 34rem;
  margin: 0;
  pointer-events: none;
}

.hero-main {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.hero-image-scaler {
  pointer-events: auto;
  transform: scale(1);
  transform-origin: center center;
}

.hero-image-wrap {
  width: 96vw;
  max-width: 720px;
  aspect-ratio: 4 / 3;
  overflow: clip;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.hero-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

@media (min-width: 768px) {
  .header-block {
    width: 8rem;
  }
  .site-nav {
    display: flex;
  }
  .hero-image-wrap {
    aspect-ratio: 5 / 4;
  }
}

@media (min-width: 1024px) {
  .bg-text-sub {
    max-width: 62rem;
    bottom: 1.25rem;
  }
}
```

## Interact config

```js
const pct = (value) => ({ value, unit: 'percentage' });
const cover = (a, b) => ({
  rangeStart: { name: 'cover', offset: pct(a) },
  rangeEnd: { name: 'cover', offset: pct(b) },
});

const trackX = (px) => ({
  key: 'hero-image',
  trigger: 'pointerMove',
  params: { hitArea: 'self', axis: 'x' },
  conditions: ['hoverDevice', 'motionOk'],
  effects: [
    {
      key: 'hero-image',
      selector: '.hero-image-wrap',
      keyframeEffect: {
        name: `image-track-x-${px}`,
        keyframes: [
          { transform: `translate3d(-${px}px,0,0)` },
          { transform: `translate3d(${px}px,0,0)` },
        ],
      },
      transitionDuration: 160,
      transitionEasing: 'easeOut',
      fill: 'both',
    },
  ],
});

const trackY = (px) => ({
  key: 'hero-image',
  trigger: 'pointerMove',
  params: { hitArea: 'self', axis: 'y' },
  conditions: ['hoverDevice', 'motionOk'],
  effects: [
    {
      key: 'hero-image',
      selector: '.hero-image-wrap',
      composite: 'accumulate',
      keyframeEffect: {
        name: `image-track-y-${px}`,
        keyframes: [
          { transform: `translate3d(0,-${px}px,0)` },
          { transform: `translate3d(0,${px}px,0)` },
        ],
      },
      transitionDuration: 160,
      transitionEasing: 'easeOut',
      fill: 'both',
    },
  ],
});

const config = {
  conditions: {
    motionOk: { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    hoverDevice: { type: 'media', predicate: '(hover: hover) and (pointer: fine)' },
  },
  interactions: [
    trackX(180),
    trackY(140),
    {
      key: 'scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'bg-text',
          selector: '.bg-text',
          conditions: ['motionOk'],
          keyframeEffect: {
            name: 'text-parallax',
            keyframes: [
              { transform: 'translateX(0) scaleY(1.4)' },
              { transform: 'translateX(calc(-100% + 100vw)) scaleY(1.4)' },
            ],
          },
          ...cover(0, 100),
          easing: 'linear',
          fill: 'both',
        },
        {
          key: 'hero-image',
          selector: '.hero-image-scaler',
          conditions: ['motionOk'],
          keyframeEffect: {
            name: 'image-scale-scroll',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0)' }],
          },
          ...cover(0, 100),
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```
