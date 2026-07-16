# Blurry Transition

Three stacked text pairs are revealed sequentially as the user scrolls, each fading and unblurring in through a sticky 600vh timeline driven by viewProgress, with the first pair triggering automatically on viewEnter.

**Tags:** viewProgress, viewEnter, opacity, filter, blur, fade, stagger, sticky

## Markup

```html
<div class="main-scroll-wrapper">
  <interact-element data-interact-key="timeline-track">
    <div class="timeline-container">
      <div class="sticky-viewport">
        <interact-element data-interact-key="pair-1">
          <div class="text-pair">
            <h1>First Principle</h1>
            <p>Sample text provides enough length to demonstrate this animated content layout.</p>
          </div>
        </interact-element>

        <interact-element data-interact-key="pair-2">
          <div class="text-pair">
            <h1>Second Thought</h1>
            <p>Sample text provides enough length to demonstrate this animated content layout.</p>
          </div>
        </interact-element>

        <interact-element data-interact-key="pair-3">
          <div class="text-pair">
            <h1>Final Conclusion</h1>
            <p>Sample text provides enough length to demonstrate this animated content layout.</p>
          </div>
        </interact-element>
      </div>
    </div>
  </interact-element>
</div>
```

## Essential styles

```css
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: clip;
}

.main-scroll-wrapper {
  width: 100%;
}

.timeline-container {
  height: 600vh;
  position: relative;
}

.sticky-viewport {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: clip;
}

interact-element {
  display: contents;
}

.text-pair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 80%;
  max-width: 780px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  will-change: opacity, filter;
  z-index: 10;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

p {
  font-size: 1.25rem;
  line-height: 1.6;
}
```

## Interact config

```js
const timeInFrames = [
  { opacity: 0, filter: 'blur(20px)', visibility: 'hidden', pointerEvents: 'none', offset: 0 },
  {
    opacity: 0.01,
    filter: 'blur(19px)',
    visibility: 'visible',
    pointerEvents: 'auto',
    offset: 0.01,
  },
  { opacity: 1, filter: 'blur(0px)', visibility: 'visible', pointerEvents: 'auto', offset: 1 },
];

const scrollOutFrames = [
  { opacity: 1, filter: 'blur(0px)', visibility: 'visible', pointerEvents: 'auto', offset: 0 },
  {
    opacity: 0.01,
    filter: 'blur(19px)',
    visibility: 'visible',
    pointerEvents: 'auto',
    offset: 0.99,
  },
  { opacity: 0, filter: 'blur(20px)', visibility: 'hidden', pointerEvents: 'none', offset: 1 },
];

const pair2Frames = [
  { opacity: 0, filter: 'blur(20px)', visibility: 'hidden', pointerEvents: 'none', offset: 0 },
  {
    opacity: 0.01,
    filter: 'blur(19px)',
    visibility: 'visible',
    pointerEvents: 'auto',
    offset: 0.01,
  },
  { opacity: 1, filter: 'blur(0px)', visibility: 'visible', pointerEvents: 'auto', offset: 0.3 },
  { opacity: 1, filter: 'blur(0px)', visibility: 'visible', pointerEvents: 'auto', offset: 0.7 },
  {
    opacity: 0.01,
    filter: 'blur(19px)',
    visibility: 'visible',
    pointerEvents: 'auto',
    offset: 0.99,
  },
  { opacity: 0, filter: 'blur(20px)', visibility: 'hidden', pointerEvents: 'none', offset: 1 },
];

const pair3Frames = [
  { opacity: 0, filter: 'blur(20px)', visibility: 'hidden', pointerEvents: 'none', offset: 0 },
  {
    opacity: 0.01,
    filter: 'blur(19px)',
    visibility: 'visible',
    pointerEvents: 'auto',
    offset: 0.01,
  },
  { opacity: 1, filter: 'blur(0px)', visibility: 'visible', pointerEvents: 'auto', offset: 0.7 },
  { opacity: 1, filter: 'blur(0px)', visibility: 'visible', pointerEvents: 'auto', offset: 1 },
];

const config = {
  interactions: [
    {
      key: 'pair-1',
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      effects: [
        {
          triggerType: 'once',
          keyframeEffect: {
            name: 'pair1-auto-in',
            keyframes: timeInFrames,
          },
          duration: 1500,
          easing: 'ease-out',
          fill: 'forwards',
        },
      ],
    },

    {
      key: 'timeline-track',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'pair-1',
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 30, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 40, unit: 'percentage' } },
          keyframeEffect: {
            name: 'pair1-exit',
            keyframes: scrollOutFrames,
          },
        },

        {
          key: 'pair-2',
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 40, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 75, unit: 'percentage' } },
          keyframeEffect: {
            name: 'pair2-cycle',
            keyframes: pair2Frames,
          },
        },

        {
          key: 'pair-3',
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 75, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 95, unit: 'percentage' } },
          keyframeEffect: {
            name: 'pair3-cycle',
            keyframes: pair3Frames,
          },
        },
      ],
    },
  ],
};
```
