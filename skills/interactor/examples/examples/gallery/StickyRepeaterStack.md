# Sticky Repeater Stack

Five gradient cards stack using sticky positioning and scale down to 0.8 as each subsequent card scrolls over the previous one, driven by viewProgress with cover-range offsets computed from viewport geometry.

**Tags:** viewProgress, sticky, stack, stagger, scale, transform, scroll, cards

## Markup

```html
<section class="intro-section">
  <div>
    <h1>Repeater Stack Effect</h1>
    <p>Scroll down to experience a scroll-driven stacking animation.</p>
  </div>
  <div class="scroll-down-arrow"></div>
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
:root {
  --card-bg-1: linear-gradient(135deg, #007BFF, #00BFFF);
  --card-bg-2: linear-gradient(135deg, #8A2BE2, #4B0082);
  --card-bg-3: linear-gradient(135deg, #32CD32, #008000);
  --card-bg-4: linear-gradient(135deg, #FF4500, #FF8C00);
  --card-bg-5: linear-gradient(135deg, #FF1493, #C71585);
}

body {
  margin: 0;
  background-color: #111;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.intro-section, .outro-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
}

.intro-section h1, .outro-section h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  margin-bottom: 1rem;
}

.intro-section p {
  font-size: clamp(1rem, 2vw, 1.2rem);
  max-width: 600px;
  color: #aaa;
  line-height: 1.6;
}

.scroll-down-arrow {
  position: absolute;
  bottom: 30px;
  left: 50%;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  width: 24px;
  height: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(-45deg); }
  40% { transform: translateY(-10px) rotate(-45deg); }
  60% { transform: translateY(-5px) rotate(-45deg); }
}

.scroll-section {
  position: relative;
}

.repeater-wrapper {
  display: flex;
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
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

#card-1 { background: var(--card-bg-1); }
#card-2 { background: var(--card-bg-2); }
#card-3 { background: var(--card-bg-3); }
#card-4 { background: var(--card-bg-4); }
#card-5 { background: var(--card-bg-5); }
```

## Interact config

```js
const STACK_GAP = 250;
const SCROLL_SPEED = 1;
const NUM = 5;
const vh = window.innerHeight;
const padTopPx = 0.15 * vh;
const cardHPx = 0.40 * vh;
const stickyTopPx = 0.35 * vh;
const gapPx = Math.round(STACK_GAP / SCROLL_SPEED);

const cardTops = [];
for (let i = 0; i < NUM; i++) {
    cardTops.push(padTopPx + i * (cardHPx + gapPx));
}

const lastStickScroll = vh + cardTops[NUM - 1] - stickyTopPx;
const sectionPx = Math.round(lastStickScroll + cardHPx + gapPx);
const totalCover = sectionPx + vh;
const perCardSpan = (cardHPx + gapPx) / totalCover * 100;

document.querySelector('.scroll-section').style.height = sectionPx + 'px';
document.querySelector('.repeater-wrapper').style.gap = gapPx + 'px';

const effects = [];
for (let i = 0; i < NUM; i++) {
    const stickScroll = vh + cardTops[i] - stickyTopPx;
    const startPct = stickScroll / totalCover * 100;
    const endPct = (i < NUM - 1)
        ? startPct + perCardSpan - 1
        : sectionPx / totalCover * 100;

    effects.push({
        key: 'card-' + (i + 1),
        keyframeEffect: {
            name: 'card-' + (i + 1) + '-scale',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0.8)' }]
        },
        rangeStart: { name: 'cover', offset: { unit: 'percentage', value: Math.round(startPct) } },
        rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: Math.round(endPct) } },
        fill: 'both',
        composite: 'add',
        easing: 'linear'
    });
}

{
    interactions: [{
        key: 'scroll-section',
        trigger: 'viewProgress',
        effects: effects
    }]
}
```
