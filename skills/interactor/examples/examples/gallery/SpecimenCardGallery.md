# Specimen Card Gallery

Five specimen cards fan out from a spread, blurred, and 3D-rotated state and converge into a flat centered row as the user scrolls through a sticky container driven by viewProgress.

**Tags:** viewProgress, sticky, flex, gallery, opacity, transform, filter, blur, stagger, reveal, 3d

## Markup

```html
<section class="hero">
  <h1>Ammonoidea</h1>
  <p>[ scroll to reveal the collection ]</p>
</section>

<interact-element data-interact-key="scroll-wrapper">
  <div id="scroll-wrapper">
    <div class="sticky-container">
      <div class="cards-row">
        <interact-element data-interact-key="card-1">
          <div class="card" id="card-1">
            <div class="card-meta">
              <span class="card-label">white colors</span>
              <span class="card-code">[C456JK]</span>
            </div>
            <div class="card-title-row">
              <span class="card-name">Ammonoidea</span>
              <span class="card-arrow">→</span>
            </div>
            <div class="card-image">
              <img src="" />
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="card-2">
          <div class="card" id="card-2">
            <div class="card-meta">
              <span class="card-label">white colors</span>
              <span class="card-code">[C456JK]</span>
            </div>
            <div class="card-title-row">
              <span class="card-name">Ammonoidea</span>
              <span class="card-arrow">→</span>
            </div>
            <div class="card-image">
              <img src="" />
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="card-3">
          <div class="card" id="card-3">
            <div class="card-meta">
              <span class="card-label">white colors</span>
              <span class="card-code">[C456JK]</span>
            </div>
            <div class="card-title-row">
              <span class="card-name">Ammonoidea</span>
              <span class="card-arrow">→</span>
            </div>
            <div class="card-image">
              <img src="" />
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="card-4">
          <div class="card" id="card-4">
            <div class="card-meta">
              <span class="card-label">white colors</span>
              <span class="card-code">[C456JK]</span>
            </div>
            <div class="card-title-row">
              <span class="card-name">Ammonoidea</span>
              <span class="card-arrow">→</span>
            </div>
            <div class="card-image">
              <img src="" />
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="card-5">
          <div class="card" id="card-5">
            <div class="card-meta">
              <span class="card-label">white colors</span>
              <span class="card-code">[C456JK]</span>
            </div>
            <div class="card-title-row">
              <span class="card-name">Ammonoidea</span>
              <span class="card-arrow">→</span>
            </div>
            <div class="card-image">
              <img src="" />
            </div>
          </div>
        </interact-element>
      </div>
    </div>
  </div>
</interact-element>

<section class="end-section">
  <p>[ end of collection ]</p>
</section>
```

## Essential styles

```css
:root {
  --card-width: 260px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

interact-element {
  display: contents;
}

.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}

#scroll-wrapper {
  height: 600vh;
  position: relative;
}

.sticky-container {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: clip;
}

.cards-row {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
}

.card {
  width: var(--card-width);
  overflow: clip;
  flex-shrink: 0;
  padding: 10px 10px 10px;
  opacity: 0;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-image {
  width: 100%;
  aspect-ratio: 36 / 50;
  overflow: clip;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.end-section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'scroll-wrapper',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'card-1',
          keyframeEffect: {
            name: 'card-1-spread',
            keyframes: [
              {
                opacity: 0,
                filter: 'blur(12px)',
                transform:
                  'translateX(560px) translateY(60px) perspective(1200px) rotateY(15deg) scale(0.7)',
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(280px) translateY(0px) perspective(1200px) rotateY(4.5deg) scale(0.88)',
                offset: 0.45,
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)',
              },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 15, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 85, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
        {
          key: 'card-2',
          keyframeEffect: {
            name: 'card-2-spread',
            keyframes: [
              {
                opacity: 0,
                filter: 'blur(12px)',
                transform:
                  'translateX(280px) translateY(60px) perspective(1200px) rotateY(9deg) scale(0.7)',
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(140px) translateY(0px) perspective(1200px) rotateY(2.7deg) scale(0.88)',
                offset: 0.45,
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)',
              },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 10, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 72, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
        {
          key: 'card-3',
          keyframeEffect: {
            name: 'card-3-spread',
            keyframes: [
              {
                opacity: 0,
                filter: 'blur(12px)',
                transform:
                  'translateX(0px) translateY(60px) perspective(1200px) rotateY(0deg) scale(0.7)',
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(0.88)',
                offset: 0.45,
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)',
              },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 58, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
        {
          key: 'card-4',
          keyframeEffect: {
            name: 'card-4-spread',
            keyframes: [
              {
                opacity: 0,
                filter: 'blur(12px)',
                transform:
                  'translateX(-280px) translateY(60px) perspective(1200px) rotateY(-9deg) scale(0.7)',
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(-140px) translateY(0px) perspective(1200px) rotateY(-2.7deg) scale(0.88)',
                offset: 0.45,
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)',
              },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 10, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 72, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
        {
          key: 'card-5',
          keyframeEffect: {
            name: 'card-5-spread',
            keyframes: [
              {
                opacity: 0,
                filter: 'blur(12px)',
                transform:
                  'translateX(-560px) translateY(60px) perspective(1200px) rotateY(-15deg) scale(0.7)',
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(-280px) translateY(0px) perspective(1200px) rotateY(-4.5deg) scale(0.88)',
                offset: 0.45,
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform:
                  'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)',
              },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 15, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 85, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      ],
    },
  ],
};
```
