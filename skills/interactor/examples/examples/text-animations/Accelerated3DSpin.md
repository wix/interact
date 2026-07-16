# Accelerated 3D Spin

A large headline text continuously rotates on the Y-axis in a slow idle loop when it enters the viewport, then accelerates dramatically as the user scrolls, using composite layering to blend the idle spin and scroll-driven boost into a single accelerating 3D flip effect.

**Tags:** viewEnter, viewProgress, rotate, 3d, loop, transform, sticky, scroll-driven

## Markup

```html
<div class="scroll-wrapper">
  <div class="sticky-section select-none">
    <header class="poster-grid">
      <div>
        <p class="info-label">Featuring</p>
        <p class="info-value">Abigail Deville<br />Xaviera Simmons<br />Rosa-Johan Uddoh</p>
      </div>
      <div>
        <p class="info-label">Curated By</p>
        <p class="info-value">Racquel Chevremont<br />Mickalene Thomas<br />(Deux Femmes Noires)</p>
      </div>
      <div>
        <p class="info-label">Presented By</p>
        <p class="info-value">Pioneer Works<br />04.02–06.20.21<br />Brooklyn, NY</p>
      </div>
    </header>

    <main class="main-container">
      <interact-element data-interact-key="main-title">
        <div id="headline-container" class="rotating-card">
          <div class="card-face front">
            <h1 class="text-7xl md:text-9xl leading-none">HEAVIES</h1>
          </div>
          <div class="card-face back">
            <h1 class="text-7xl md:text-9xl leading-none">HEAVIES</h1>
          </div>
        </div>
      </interact-element>
    </main>

    <footer class="poster-grid">
      <div>
        <p class="info-label">Featuring</p>
        <p class="info-value">Abigail Deville<br />Xaviera Simmons<br />Rosa-Johan Uddoh</p>
      </div>
      <div>
        <p class="info-label">Curated By</p>
        <p class="info-value">Racquel Chevremont<br />Mickalene Thomas<br />(Deux Femmes Noires)</p>
      </div>
      <div>
        <p class="info-label">Presented By</p>
        <p class="info-value">Pioneer Works<br />04.02–06.20.21<br />Brooklyn, NY</p>
      </div>
    </footer>
  </div>
</div>

<interact-element
  data-interact-key="scroll-observer"
  style="display: block;position: absolute;top: 0;left: 0;width: 100%;height: 500vh;pointer-events: none;z-index: -1"
>
  <div class="scroll-observer-track"></div>
</interact-element>
```

## Essential styles

```css
body {
  margin: 0;
  overflow-x: clip;
}

.info-label {
  font-size: 0.6rem;
  margin-bottom: 4px;
}

.info-value {
  font-size: 0.8rem;
  line-height: 1.1;
}

.main-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
}

#headline-container {
  transform-style: preserve-3d;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rotating-card {
  position: relative;
  transform-style: preserve-3d;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-face {
  position: absolute;
  backface-visibility: hidden;
  white-space: nowrap;
}

.card-face.back {
  transform: rotateY(180deg);
}

.scroll-wrapper {
  height: 500vh;
}

.scroll-observer-track {
  width: 100%;
  height: 100%;
}

.sticky-section {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 4vw;
  box-sizing: border-box;
  overflow: clip;
}

.poster-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  max-width: 94vw;
  margin: 0 auto;
  gap: 2rem;
}

.poster-grid > div:nth-child(1) {
  justify-self: start;
  text-align: left !important;
}

.poster-grid > div:nth-child(2) {
  justify-self: center;
  text-align: left !important;
}

.poster-grid > div:nth-child(3) {
  justify-self: end;
  text-align: left !important;
}

@media (max-width: 768px) {
  .poster-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
    max-width: 100%;
  }

  .poster-grid > div {
    justify-self: start !important;
  }

  .sticky-section {
    padding: 2rem 1rem;
  }
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'main-title',
      trigger: 'viewEnter',
      effects: [
        {
          triggerType: 'once',
          duration: 12000,
          iterations: Infinity,
          easing: 'linear',
          fill: 'both',
          composite: 'replace',
          keyframeEffect: {
            name: 'momentumSpin3D_idle',
            keyframes: [
              { transform: 'perspective(600px) rotateY(0deg)' },
              { transform: 'perspective(600px) rotateY(360deg)' },
            ],
          },
        },
      ],
    },
    {
      key: 'scroll-observer',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'main-title',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          composite: 'add',
          keyframeEffect: {
            name: 'momentumSpin3D_scrollBoost',
            keyframes: [
              { transform: 'perspective(600px) rotateY(0deg)' },
              { transform: 'perspective(600px) rotateY(2880deg)' },
            ],
          },
        },
      ],
    },
  ],
};
```
