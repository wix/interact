# Sticky Repeater Stack

Five cards stack using sticky positioning and scale down to 0.8 as each subsequent card scrolls over the previous one, driven by viewProgress with cover-range offsets computed from viewport geometry.

**Tags:** viewProgress, sticky, stack, stagger, scale, transform, scroll, cards

## Markup

```html
<section class="intro-section">
  <div>
    <h1>Repeater Stack Effect</h1>
    <p>Scroll down to experience a scroll-driven stacking animation.</p>
  </div>
</section>

<interact-element data-interact-key="scroll-section">
  <section class="scroll-section" id="scroll-section">
    <div class="repeater-wrapper">
      <interact-element data-interact-key="card-1">
        <div class="card" id="card-1">Container 1</div>
      </interact-element>
      <interact-element data-interact-key="card-2">
        <div class="card" id="card-2">Container 2</div>
      </interact-element>
      <interact-element data-interact-key="card-3">
        <div class="card" id="card-3">Container 3</div>
      </interact-element>
      <interact-element data-interact-key="card-4">
        <div class="card" id="card-4">Container 4</div>
      </interact-element>
      <interact-element data-interact-key="card-5">
        <div class="card" id="card-5">Container 5</div>
      </interact-element>
    </div>
  </section>
</interact-element>

<section class="outro-section">
  <h1>End of Section</h1>
</section>
```

## Essential styles

```css
body {
  margin: 0;
  overflow-x: clip;
}

.intro-section,
.outro-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
}

.intro-section h1,
.outro-section h1 {
  margin-bottom: 1rem;
}

.intro-section p {
  max-width: 600px;
}

.scroll-section {
  position: relative;
  height: calc(300vh + 1250px);
}

.repeater-wrapper {
  display: flex;
  gap: 250px;
  flex-direction: column;
  align-items: center;
  padding-top: 15vh;
  perspective: 1000px;
}

interact-element {
  display: contents;
}

.card {
  width: 100vw;
  max-width: 800px;
  height: 40vh;
  position: sticky;
  top: 35vh;
  display: flex;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}
```

## Interact config

```js
const STACK_GAP = 250;
const SCROLL_SPEED = 1;
const NUM = 5;
const vh = window.innerHeight;
const padTopPx = 0.15 * vh;
const cardHPx = 0.4 * vh;
const stickyTopPx = 0.35 * vh;
const gapPx = Math.round(STACK_GAP / SCROLL_SPEED);

const cardTops = [];
for (let i = 0; i < NUM; i++) {
  cardTops.push(padTopPx + i * (cardHPx + gapPx));
}

const lastStickScroll = vh + cardTops[NUM - 1] - stickyTopPx;
const sectionPx = Math.round(lastStickScroll + cardHPx + gapPx);
const totalCover = sectionPx + vh;
const perCardSpan = ((cardHPx + gapPx) / totalCover) * 100;

const effects = [];
for (let i = 0; i < NUM; i++) {
  const stickScroll = vh + cardTops[i] - stickyTopPx;
  const startPct = (stickScroll / totalCover) * 100;
  const endPct = i < NUM - 1 ? startPct + perCardSpan - 1 : (sectionPx / totalCover) * 100;

  effects.push({
    key: 'card-' + (i + 1),
    keyframeEffect: {
      name: 'card-' + (i + 1) + '-scale',
      keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }],
    },
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: Math.round(startPct) } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: Math.round(endPct) } },
    fill: 'both',
    composite: 'add',
    easing: 'linear',
  });
}

const config = {
  interactions: [
    {
      key: 'scroll-section',
      trigger: 'viewProgress',
      effects: effects,
    },
  ],
};
```
