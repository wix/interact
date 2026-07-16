# Blur Focus Gallery

A grid of image cards where hovering any card blurs all others via CSS `:has()`, while the hovered card scales up and reveals its title caption.

**Tags:** hover, grid, gallery, filter, blur, opacity, transform, scale

## Markup

```html
<section class="grid-container">
  <interact-element data-interact-key="card-1">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Card 1</h3>
        <p>Hover to see info</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-2">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Card 2</h3>
        <p>Hover to see info</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-3">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Card 3</h3>
        <p>Hover to see info</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-4">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Card 4</h3>
        <p>Hover to see info</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-5">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Card 5</h3>
        <p>Hover to see info</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-6">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Card 6</h3>
        <p>Hover to see info</p>
      </div>
    </div>
  </interact-element>
</section>
```

## Essential styles

```css
:root {
  --blur-intensity: 12px;
}
body {
  margin: 0;
  padding: 40px;
  overflow-x: hidden;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows: 180px;
  gap: 40px;
  width: 100%;
}
interact-element {
  display: block;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  cursor: pointer;
  z-index: 1;
}
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 2px;
}
.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: filter 300ms ease;
  will-change: filter;
}
.grid-container:has(interact-element:hover) .card-bg {
  filter: blur(var(--blur-intensity));
}
interact-element:hover .card-bg {
  filter: none !important;
}
.card-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 2px;
}
.card-content {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  opacity: 0;
  transform: translateY(10px);
  z-index: 2;
  line-height: 1.2;
  will-change: opacity, transform;
}
.card-content h3 {
  margin: 0 0 3px 0;
  font-size: 1rem;
}
.card-content p {
  margin: 0;
  font-size: 0.85rem;
}
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 800px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Interact config

```js
const CARD_COUNT = 6;
const DURATION = 300;
const EASING = 'ease';

const interactions = [];

for (let i = 1; i <= CARD_COUNT; i++) {
  const effects = [];

  effects.push({
    key: `card-${i}`,
    selector: '.card-inner',
    transition: {
      duration: DURATION,
      easing: EASING,
      styleProperties: [{ name: 'transform', value: 'scale(1.05)' }],
    },
  });

  effects.push({
    key: `card-${i}`,
    selector: '.card-overlay',
    transition: {
      duration: DURATION,
      easing: EASING,
      styleProperties: [{ name: 'background', value: 'rgba(0,0,0,0.35)' }],
    },
  });

  effects.push({
    key: `card-${i}`,
    selector: '.card-content',
    transition: {
      duration: DURATION,
      easing: EASING,
      styleProperties: [
        { name: 'opacity', value: '1' },
        { name: 'transform', value: 'translateY(0)' },
      ],
    },
  });

  effects.push({
    key: `card-${i}`,
    transition: {
      duration: 0,
      styleProperties: [{ name: 'z-index', value: '999' }],
    },
  });

  interactions.push({
    key: `card-${i}`,
    trigger: 'hover',
    effects,
  });
}

{
  interactions;
}
```
