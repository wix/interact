# Diagonal Shuffle

Five image cards stacked at the viewport center fly in from alternating diagonal corners as you scroll, each rotating and scaling into a slightly tilted resting position one after another.

**Tags:** viewProgress, sticky, gallery, transform, rotate, scale, opacity, stagger, reveal, 3d

## Markup

```html
<div class="intro-spacer"></div>

<interact-element data-interact-key="#scroll-section">
  <div id="scroll-section">
    <div class="sticky-wrapper">
      <interact-element data-interact-key="#card-1">
        <div id="card-1" class="card">
          <img src="" class="card-img" />
          <div class="card-content">
            <h2 class="card-title">Misty Mountains</h2>
            <p class="card-description">A journey through ethereal landscapes.</p>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-2">
        <div id="card-2" class="card">
          <img src="" class="card-img" />
          <div class="card-content">
            <h2 class="card-title">Forest Canopy</h2>
            <p class="card-description">Overhead view of a dense, green forest.</p>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-3">
        <div id="card-3" class="card">
          <img src="" class="card-img" />
          <div class="card-content">
            <h2 class="card-title">Alpine Lake</h2>
            <p class="card-description">Crystal clear water reflecting the peaks.</p>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-4">
        <div id="card-4" class="card">
          <img src="" class="card-img" />
          <div class="card-content">
            <h2 class="card-title">Hidden Waterfall</h2>
            <p class="card-description">Nature's raw and untamed power.</p>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="#card-5">
        <div id="card-5" class="card">
          <img src="" class="card-img" />
          <div class="card-content">
            <h2 class="card-title">Rolling Hills</h2>
            <p class="card-description">Endless green fields under a summer sky.</p>
          </div>
        </div>
      </interact-element>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
body {
  overflow-x: clip;
}

.intro-spacer {
  height: 100vh;
}

#scroll-section {
  position: relative;
  height: 450vh;
}

.sticky-wrapper {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100vw;
  overflow: clip;
  perspective: 1200px;
}

.card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90vw;
  max-width: 400px;
  aspect-ratio: 3 / 4;
  opacity: 0;
  transform-style: preserve-3d;
  overflow: clip;
}

.card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 10;
}

.card-description {
  margin-top: 0.25rem;
}

@media (min-width: 768px) {
  .card {
    aspect-ratio: 4 / 3;
  }

  .card-content {
    padding: 1.5rem;
  }
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#card-1',
          keyframeEffect: {
            name: 'card-1-fly-in',
            keyframes: [
              {
                transform: 'translate(-50%, -50%) translate(-80vw, 50vh) rotate(-45deg) scale(0.7)',
                opacity: 1,
              },
              {
                transform: 'translate(-50%, -50%) translate(0, 0) rotate(-4deg) scale(1)',
                opacity: 1,
              },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 5 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 25 } },
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#card-2',
          keyframeEffect: {
            name: 'card-2-fly-in',
            keyframes: [
              {
                transform: 'translate(-50%, -50%) translate(80vw, 50vh) rotate(45deg) scale(0.7)',
                opacity: 1,
              },
              {
                transform: 'translate(-50%, -50%) translate(0, 0) rotate(3deg) scale(1)',
                opacity: 1,
              },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 40 } },
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#card-3',
          keyframeEffect: {
            name: 'card-3-fly-in',
            keyframes: [
              {
                transform: 'translate(-50%, -50%) translate(-80vw, 50vh) rotate(-45deg) scale(0.7)',
                opacity: 1,
              },
              {
                transform: 'translate(-50%, -50%) translate(0, 0) rotate(-2deg) scale(1)',
                opacity: 1,
              },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 35 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 55 } },
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#card-4',
          keyframeEffect: {
            name: 'card-4-fly-in',
            keyframes: [
              {
                transform: 'translate(-50%, -50%) translate(80vw, 50vh) rotate(45deg) scale(0.7)',
                opacity: 1,
              },
              {
                transform: 'translate(-50%, -50%) translate(0, 0) rotate(1deg) scale(1)',
                opacity: 1,
              },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 70 } },
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#card-5',
          keyframeEffect: {
            name: 'card-5-fly-in',
            keyframes: [
              {
                transform: 'translate(-50%, -50%) translate(-80vw, 50vh) rotate(-45deg) scale(0.7)',
                opacity: 1,
              },
              {
                transform: 'translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1)',
                opacity: 1,
              },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 65 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 85 } },
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
  ],
};
```
