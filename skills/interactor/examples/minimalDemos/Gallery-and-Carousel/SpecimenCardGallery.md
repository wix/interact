# SpecimenCardGallery

A scroll-driven animation for cards in a sticky scroll section, grid/gallery, flex/carousel layout. It uses opacity, filter, transform to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, grid/gallery, flex/carousel; motion: opacity, filter, transform

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
                <img>
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
                <img>
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
                <img>
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
                <img>
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
                <img>
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

  <div id="slider-panel">
    <div class="panel-title">Controls</div>

    <div class="section-label">Animation</div>

    <label>
      Scroll Speed <span id="speed-val">1×</span>
      <input type="range" id="speed-slider" min="0.2" max="3" step="0.1" value="1">
    </label>

    <label>
      Spread Intensity <span id="spread-val">1×</span>
      <input type="range" id="spread-slider" min="0.3" max="2" step="0.1" value="1">
    </label>

    <label>
      Max Rotation <span id="rotation-val">15°</span>
      <input type="range" id="rotation-slider" min="0" max="45" step="1" value="15">
    </label>

    <div class="divider"></div>
    <div class="section-label">Layout</div>

    <label>
      Card Radius <span id="card-radius-val">8px</span>
      <input type="range" id="card-radius-slider" min="0" max="30" step="1" value="8">
    </label>

    <label>
      Image Radius <span id="image-radius-val">4px</span>
      <input type="range" id="image-radius-slider" min="0" max="24" step="1" value="4">
    </label>

    <label>
      Card Width <span id="card-width-val">260px</span>
      <input type="range" id="card-width-slider" min="180" max="360" step="10" value="260">
    </label>
  </div>
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

    #slider-panel {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      background: rgba(0,0,0,0.88);
      color: #fff;
      padding: 20px;
      border-radius: 12px;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      min-width: 230px;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.08);
      max-height: 90vh;
      overflow-y: auto;
    }

    #slider-panel .panel-title {
      font-weight: 600;
      margin-bottom: 16px;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
      letter-spacing: 0.02em;
    }

    #slider-panel .divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 12px 0;
    }

    #slider-panel .section-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.4);
      margin-bottom: 8px;
    }

    #slider-panel label {
      display: block;
      margin-bottom: 10px;
      color: rgba(255,255,255,0.7);
      font-size: 12px;
    }

    #slider-panel label span {
      float: right;
      color: rgba(255,255,255,0.5);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }

    #slider-panel input[type="range"] {
      width: 100%;
      margin-top: 4px;
      accent-color: #888;
    }
```

## Interact config

```js
const spread = parseFloat(document.getElementById('spread-slider').value) || 1;

const maxRot = parseFloat(document.getElementById('rotation-slider').value) || 15;

const cardWidth = parseFloat(document.getElementById('card-width-slider').value) || 260;

document.documentElement.style.setProperty('--card-width', cardWidth + 'px');

const gap = 20;

const step = cardWidth + gap;

const offsets = [step * 2, step, 0, -step, -step * 2];

const rotations = [maxRot, maxRot * 0.6, 0, -maxRot * 0.6, -maxRot];

const ranges = [
        [15, 85],
        [10, 72],
        [0, 58],
        [10, 72],
        [15, 85],
      ];

const effects = [];

for (let i = 0; i < 5; i++) {
        const ox = offsets[i] * spread;
        const ry = rotations[i];

        effects.push({
          key: `card-${i + 1}`,
          keyframeEffect: {
            name: `card-${i + 1}-spread`,
            keyframes: [
              {
                opacity: 0,
                filter: 'blur(12px)',
                transform: `translateX(${ox}px) translateY(60px) perspective(1200px) rotateY(${ry}deg) scale(0.7)`
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform: `translateX(${ox * 0.5}px) translateY(0px) perspective(1200px) rotateY(${ry * 0.3}deg) scale(0.88)`,
                offset: 0.45
              },
              {
                opacity: 1,
                filter: 'blur(0px)',
                transform: 'translateX(0px) translateY(0px) perspective(1200px) rotateY(0deg) scale(1)'
              }
            ]
          },
          rangeStart: { name: 'contain', offset: { value: ranges[i][0], unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: ranges[i][1], unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both'
        });
      }

const config = {
        interactions: [{
          key: 'scroll-wrapper',
          trigger: 'viewProgress',
          effects
        }]
      };
```
