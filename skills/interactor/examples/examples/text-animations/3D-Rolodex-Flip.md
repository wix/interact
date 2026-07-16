# 3D Rolodex Flip

Each full-viewport text card flips into view from below with a 3D rotateX and scale, holds centered, then flips upward as the user scrolls past, driven entirely by scroll progress.

**Tags:** viewProgress, list, transform, opacity, 3d, rotate, scale, stagger, scroll

## Markup

```html
<div class="layout-grid">
  <div class="col">
    <div>Featuring</div>
    <div>Abigail DeVille<br />Xaviera Simmons<br />Rosa-Johan Uddoh</div>
  </div>
  <div class="col">
    <div style="text-align: center">Curated By</div>
    <div style="text-align: center">Racquel Chevremont<br />Mickalene Thomas</div>
  </div>
  <div class="col">
    <div style="text-align: right">Presented By</div>
    <div style="text-align: right">Pioneer Works<br />04.02-06.20.21<br />Brooklyn, NY</div>
  </div>
</div>

<div class="content-scroll">
  <interact-element data-interact-key="item-1">
    <div>
      <div class="meta-info">Exhibition 01</div>
      <h1 class="hero-text">Xaviera<br />Simmons</h1>
    </div>
  </interact-element>

  <interact-element data-interact-key="item-2">
    <div>
      <div class="meta-info">Exhibition 02</div>
      <h1 class="hero-text">Heavies</h1>
    </div>
  </interact-element>

  <interact-element data-interact-key="item-3">
    <div>
      <div class="meta-info">Exhibition 03</div>
      <h1 class="hero-text">Rosa-Johan<br />Uddoh</h1>
    </div>
  </interact-element>

  <interact-element data-interact-key="item-4">
    <div>
      <div class="meta-info">Exhibition 04</div>
      <h1 class="hero-text">Abigail<br />DeVille</h1>
    </div>
  </interact-element>

  <interact-element data-interact-key="item-5">
    <div>
      <div class="meta-info">Exhibition 05</div>
      <h1 class="hero-text">Pioneer<br />Works</h1>
    </div>
  </interact-element>
</div>
```

## Essential styles

```css
html {
  scroll-snap-type: y mandatory;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: clip;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 10;
}

.col {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 0.8rem;
}

.content-scroll {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

interact-element {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

.hero-text {
  font-size: 12vw;
  line-height: 0.9;
  text-align: center;
  margin: 0;
  transform-origin: center center;
}

.meta-info {
  font-size: 1rem;
  opacity: 0.6;
  margin-bottom: 10px;
  text-align: center;
}

@media (max-width: 768px) {
  .layout-grid {
    position: absolute;
    height: auto;
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .col {
    flex-direction: row;
    align-items: center;
    gap: 15px;
    padding: 15px;
  }

  .col div {
    text-align: left !important;
  }

  .hero-text {
    font-size: 18vw;
  }
}
```

## Interact config

```js
const createScrollInteraction = (id) => ({
  key: id,
  trigger: 'viewProgress',
  effects: [
    {
      rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
      rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
      keyframeEffect: {
        name: `3D-Rolodex-Flip-${id}`,
        keyframes: [
          {
            transform: 'perspective(1000px) rotateX(-90deg) scale(0.6)',
            opacity: 0,
          },
          {
            transform: 'perspective(1000px) rotateX(0deg) scale(1)',
            opacity: 1,
            offset: 0.5,
          },
          {
            transform: 'perspective(1000px) rotateX(90deg) scale(0.6)',
            opacity: 0,
          },
        ],
      },
      fill: 'both',
      composite: 'replace',
    },
  ],
});

const config = {
  interactions: [
    createScrollInteraction('item-1'),
    createScrollInteraction('item-2'),
    createScrollInteraction('item-3'),
    createScrollInteraction('item-4'),
    createScrollInteraction('item-5'),
  ],
};
```
