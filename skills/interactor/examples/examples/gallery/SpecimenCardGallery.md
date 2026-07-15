# Specimen Card Gallery

Five specimen cards fan out from a spread, blurred, and 3D-rotated state and converge into a flat centered row as the user scrolls through a sticky container driven by viewProgress.

**Tags:** viewProgress, sticky, flex, gallery, opacity, transform, filter, blur, stagger, reveal, 3d

## Markup

```html
<section class="hero">
  <h1>Ammonoidea</h1>
  <p>[ scroll to reveal the collection ]</p>
  <div class="scroll-hint"></div>
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
              <img src="">
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
              <img src="">
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
              <img src="">
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
              <img src="">
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
              <img src="">
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
  --card-radius: 8px;
  --image-radius: 4px;
  --card-width: 260px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #000;
  color: #fff;
}

interact-element { display: contents; }

.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
}

.hero h1 {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  background: linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1rem;
  color: rgba(255,255,255,0.35);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.hero .scroll-hint {
  margin-top: 3rem;
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
  animation: pulse-hint 2s ease-in-out infinite;
}

@keyframes pulse-hint {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
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
  background: #fff;
  border-radius: var(--card-radius);
  overflow: hidden;
  flex-shrink: 0;
  color: #000;
  padding: 10px 10px 10px;
  opacity: 0;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.card-label {
  font-size: 0.6rem;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.card-code {
  font-size: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 300;
  color: #666;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-name {
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: capitalize;
}

.card-arrow {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 300;
  font-size: 1rem;
  color: #333;
}

.card-image {
  width: 100%;
  aspect-ratio: 36 / 50;
  background: #0a0a0a;
  border-radius: var(--image-radius);
  overflow: hidden;
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

.end-section p {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.2);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 300;
}
```

## Interact config

```js
{
  interactions: [{
    key: 'scroll-wrapper',
    trigger: 'viewProgress',
    effects: [
      {
        key: 'card-1',
        keyframeEffect: {
          name: 'card-1-spread',
          keyframes: [
            { opacity: 0, filter: 'blur(12px)', transform: 'translateX(560px) translateY(60px) perspective(1200px) rotateY(15deg) scale(0.7)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(280px) translateY(0px) perspective(1200px) rotateY(4.5deg) scale(0.88)', offset: 0.45 },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)' }
          ]
        },
        rangeStart: { name: 'contain', offset: { value: 15, unit: 'percentage' } },
        rangeEnd: { name: 'contain', offset: { value: 85, unit: 'percentage' } },
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      },
      {
        key: 'card-2',
        keyframeEffect: {
          name: 'card-2-spread',
          keyframes: [
            { opacity: 0, filter: 'blur(12px)', transform: 'translateX(280px) translateY(60px) perspective(1200px) rotateY(9deg) scale(0.7)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(140px) translateY(0px) perspective(1200px) rotateY(2.7deg) scale(0.88)', offset: 0.45 },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)' }
          ]
        },
        rangeStart: { name: 'contain', offset: { value: 10, unit: 'percentage' } },
        rangeEnd: { name: 'contain', offset: { value: 72, unit: 'percentage' } },
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      },
      {
        key: 'card-3',
        keyframeEffect: {
          name: 'card-3-spread',
          keyframes: [
            { opacity: 0, filter: 'blur(12px)', transform: 'translateX(0px) translateY(60px) perspective(1200px) rotateY(0deg) scale(0.7)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(0.88)', offset: 0.45 },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)' }
          ]
        },
        rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
        rangeEnd: { name: 'contain', offset: { value: 58, unit: 'percentage' } },
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      },
      {
        key: 'card-4',
        keyframeEffect: {
          name: 'card-4-spread',
          keyframes: [
            { opacity: 0, filter: 'blur(12px)', transform: 'translateX(-280px) translateY(60px) perspective(1200px) rotateY(-9deg) scale(0.7)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(-140px) translateY(0px) perspective(1200px) rotateY(-2.7deg) scale(0.88)', offset: 0.45 },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)' }
          ]
        },
        rangeStart: { name: 'contain', offset: { value: 10, unit: 'percentage' } },
        rangeEnd: { name: 'contain', offset: { value: 72, unit: 'percentage' } },
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      },
      {
        key: 'card-5',
        keyframeEffect: {
          name: 'card-5-spread',
          keyframes: [
            { opacity: 0, filter: 'blur(12px)', transform: 'translateX(-560px) translateY(60px) perspective(1200px) rotateY(-15deg) scale(0.7)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(-280px) translateY(0px) perspective(1200px) rotateY(-4.5deg) scale(0.88)', offset: 0.45 },
            { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)' }
          ]
        },
        rangeStart: { name: 'contain', offset: { value: 15, unit: 'percentage' } },
        rangeEnd: { name: 'contain', offset: { value: 85, unit: 'percentage' } },
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      }
    ]
  }]
}
```
