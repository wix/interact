# 7-Card Fan Spread

Seven stacked cards fan out from a tight cluster into a full spread as the user scrolls, using a sticky container to hold the deck in view throughout a 600 vh scroll section.

**Tags:** viewProgress, scroll, sticky, gallery, transform, rotate, stagger, fan

## Markup

```html
<section class="intro">
  <h1>The Collection</h1>
  <p>Scroll to reveal</p>
</section>

<interact-element data-interact-key="#scroll-wrapper">
  <div id="scroll-wrapper">
    <div class="sticky-container">
      <div class="deck">
        <interact-element data-interact-key="#card-1">
          <div id="card-1" class="card">
            <img src="" />
            <div class="card-label">
              <span>01 — Landscape</span>
              <h3>Alpine Peaks</h3>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="#card-2">
          <div id="card-2" class="card">
            <img src="" />
            <div class="card-label">
              <span>02 — Ocean</span>
              <h3>Tropical Shore</h3>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="#card-3">
          <div id="card-3" class="card">
            <img src="" />
            <div class="card-label">
              <span>03 — Sky</span>
              <h3>Northern Lights</h3>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="#card-4">
          <div id="card-4" class="card">
            <img src="" />
            <div class="card-label">
              <span>04 — Flora</span>
              <h3>Cherry Blossoms</h3>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="#card-5">
          <div id="card-5" class="card">
            <img src="" />
            <div class="card-label">
              <span>05 — Desert</span>
              <h3>Sand Dunes</h3>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="#card-6">
          <div id="card-6" class="card">
            <img src="" />
            <div class="card-label">
              <span>06 — Water</span>
              <h3>Misty Waterfall</h3>
            </div>
          </div>
        </interact-element>

        <interact-element data-interact-key="#card-7">
          <div id="card-7" class="card">
            <img src="" />
            <div class="card-label">
              <span>07 — Urban</span>
              <h3>City Lights</h3>
            </div>
          </div>
        </interact-element>
      </div>
    </div>
  </div>
</interact-element>

<section class="outro">
  <p>— fin —</p>
</section>
```

## Essential styles

```css
:root {
  --card-w: 280px;
  --card-h: 400px;
  --section-height: 600vh;
}

.intro {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.intro p {
  margin-top: 1.2rem;
}

#scroll-wrapper {
  height: var(--section-height);
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

.deck {
  position: relative;
  width: var(--card-w);
  height: var(--card-h);
}

.card {
  position: absolute;
  width: var(--card-w);
  height: var(--card-h);
  overflow: clip;
  transform-origin: center 140%;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2.5rem 1.4rem 1.4rem;
}

.card-label span {
  display: block;
  margin-bottom: 0.35rem;
}

#card-1 {
  z-index: 1;
}

#card-2 {
  z-index: 2;
}

#card-3 {
  z-index: 3;
}

#card-4 {
  z-index: 4;
}

#card-5 {
  z-index: 5;
}

#card-6 {
  z-index: 6;
}

#card-7 {
  z-index: 7;
}

.outro {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

interact-element {
  display: contents;
}
```

## Interact config

```js
const CARDS = 7;
const SPREAD = 12;
const MID = Math.floor(CARDS / 2);

const fanEffects = [];

for (let i = 0; i < CARDS; i++) {
  const off = i - MID;
  const startAngle = off * 0.8;
  const endAngle = off * SPREAD;

  fanEffects.push({
    key: `#card-${i + 1}`,
    keyframeEffect: {
      name: `fan-${i + 1}`,
      keyframes: [
        { transform: `rotate(${startAngle}deg)` },
        { transform: `rotate(${endAngle}deg)` },
      ],
    },
    rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
    rangeEnd: { name: 'contain', offset: { value: 55, unit: 'percentage' } },
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'both',
  });
}

const config = {
  interactions: [
    {
      key: '#scroll-wrapper',
      trigger: 'viewProgress',
      effects: fanEffects,
    },
  ],
};
```
