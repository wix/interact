# Headline Images Overlay

Six image panels in geometric shapes cycle one by one in an infinite looping sequence, triggered when the section enters the viewport, overlaid on large headline text using mix-blend-mode difference.

**Tags:** viewEnter, opacity, clip-path, stagger, fade, loop

## Markup

```html
<interact-element data-interact-key="header-scene">
  <section id="header-section">
    <div class="content-layout">
      <h1 class="text-top text-common">Design is the future of everything</h1>
      <h1 class="text-bottom text-common">Crafted today for a better tomorrow</h1>
    </div>

    <interact-element data-interact-key="mask-1">
      <div class="mask-item shape-square" style="--x: 5vw;--y: 10vh;--w: 75vmin;--h: 75vmin">
        <img src="" class="mask-bg" />
      </div>
    </interact-element>

    <interact-element data-interact-key="mask-2">
      <div class="mask-item shape-rect" style="--x: 82vw;--y: 0vh;--w: 18vw;--h: 100vh">
        <img src="" class="mask-bg" />
      </div>
    </interact-element>

    <interact-element data-interact-key="mask-3">
      <div class="mask-item shape-pentagon" style="--x: -5vw;--y: 55vh;--w: 50vmin;--h: 50vmin">
        <img src="" class="mask-bg" />
      </div>
    </interact-element>

    <interact-element data-interact-key="mask-4">
      <div class="mask-item shape-circle" style="--x: 50vw;--y: -5vh;--w: 45vmin;--h: 45vmin">
        <img src="" class="mask-bg" />
      </div>
    </interact-element>

    <interact-element data-interact-key="mask-5">
      <div class="mask-item shape-arch" style="--x: 35vw;--y: 25vh;--w: 35vmin;--h: 50vmin">
        <img src="" class="mask-bg" />
      </div>
    </interact-element>

    <interact-element data-interact-key="mask-6">
      <div class="mask-item shape-oval" style="--x: 15vw;--y: 65vh;--w: 70vw;--h: 35vh">
        <img src="" class="mask-bg" />
      </div>
    </interact-element>
  </section>
</interact-element>
```

## Essential styles

```css
:root {
  --grayscale: 100%;
  --mask-scale: 1;
}

body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: clip;
}

#header-section {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: clip;
  isolation: isolate;
}

.content-layout {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6vw;
  box-sizing: border-box;
  pointer-events: none;
  z-index: 50;
  mix-blend-mode: difference;
}

.text-common {
  font-size: clamp(2.7rem, 8.8vw, 7.5rem);
  line-height: 0.95;
}

.text-top {
  text-align: left;
  align-self: flex-start;
  max-width: 14ch;
  font-size: clamp(2.5rem, 8.5vw, 7.2rem);
}

.text-bottom {
  text-align: right;
  align-self: flex-end;
  max-width: 12ch;
  word-spacing: 0;
}

.mask-item {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w);
  height: var(--h);
  clip-path: var(--clip);
  -webkit-mask-image: var(--mask);
  mask-image: var(--mask);
  overflow: clip;
  z-index: 20;
  opacity: 0;
  will-change: opacity;
  transform: scale(var(--mask-scale));
  transform-origin: center;
}

.mask-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(var(--grayscale));
}

.shape-square {
  --clip: inset(0% 0% 0% 0%);
  --mask: none;
}
.shape-rect {
  --clip: inset(0% 0% 0% 0%);
  --mask: none;
}
.shape-circle {
  --clip: circle(50% at 50% 50%);
  --mask: none;
}
.shape-triangle {
  --clip: polygon(50% 0%, 0% 100%, 100% 100%);
  --mask: none;
}
.shape-oval {
  --clip: ellipse(50% 40% at 50% 50%);
  --mask: none;
}
.shape-arch {
  --clip: inset(0% 0% 0% 0% round 50% 50% 0 0);
  --mask: none;
}
.shape-pentagon {
  --clip: polygon(50% 0%, 98% 35%, 79% 90%, 21% 90%, 2% 35%);
  --mask: none;
}
```

## Interact config

```js
const STEP_DURATION = 0.8;
const TOTAL_DURATION = STEP_DURATION * 6;

const createSequencedKeyframes = (index, totalSteps) => {
  const stepSize = 1 / totalSteps;
  const start = index * stepSize;
  const end = (index + 1) * stepSize;

  const frames = [];
  frames.push({ opacity: 0, offset: 0 });
  if (start > 0) {
    frames.push({ opacity: 0, offset: start });
  }
  frames.push({ opacity: 1, offset: start });
  frames.push({ opacity: 1, offset: end });
  if (end < 1) {
    frames.push({ opacity: 0, offset: end });
    frames.push({ opacity: 0, offset: 1 });
  }
  return frames;
};

const config = {
  interactions: [
    {
      key: 'header-scene',
      trigger: 'viewEnter',
      params: { threshold: 0 },
      effects: [
        {
          key: 'mask-1',
          triggerType: 'once',
          duration: TOTAL_DURATION * 1000,
          iterations: Infinity,
          keyframeEffect: { name: 'sequence-1', keyframes: createSequencedKeyframes(0, 6) },
        },
        {
          key: 'mask-2',
          triggerType: 'once',
          duration: TOTAL_DURATION * 1000,
          iterations: Infinity,
          keyframeEffect: { name: 'sequence-2', keyframes: createSequencedKeyframes(1, 6) },
        },
        {
          key: 'mask-3',
          triggerType: 'once',
          duration: TOTAL_DURATION * 1000,
          iterations: Infinity,
          keyframeEffect: { name: 'sequence-3', keyframes: createSequencedKeyframes(2, 6) },
        },
        {
          key: 'mask-4',
          triggerType: 'once',
          duration: TOTAL_DURATION * 1000,
          iterations: Infinity,
          keyframeEffect: { name: 'sequence-4', keyframes: createSequencedKeyframes(3, 6) },
        },
        {
          key: 'mask-5',
          triggerType: 'once',
          duration: TOTAL_DURATION * 1000,
          iterations: Infinity,
          keyframeEffect: { name: 'sequence-5', keyframes: createSequencedKeyframes(4, 6) },
        },
        {
          key: 'mask-6',
          triggerType: 'once',
          duration: TOTAL_DURATION * 1000,
          iterations: Infinity,
          keyframeEffect: { name: 'sequence-6', keyframes: createSequencedKeyframes(5, 6) },
        },
      ],
    },
  ],
};
```
