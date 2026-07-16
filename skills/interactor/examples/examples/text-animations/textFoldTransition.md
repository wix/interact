# Text Fold Transition

Three full-screen text pairs are stacked in a fixed overlay; scrolling through snap-point sections drives each pair's lines sliding up and out while the next pair's lines slide in from below, using masked overflow to create a clean fold reveal.

**Tags:** viewProgress, pageVisible, scroll, transform, opacity, stagger, reveal, sticky, fixed, clip-path

## Markup

```html
<!DOCTYPE html>
<html lang="en" class="snap-y snap-mandatory scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Text Fold Transition</title>
  </head>
  <body class="m-0">
    <div
      id="visual-layer"
      class="visual-layer fixed inset-0 flex items-center justify-center pointer-events-none z-20"
    >
      <!-- PAIR 1 -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center"
      >
        <div class="sr-only">
          <h1>First Impression</h1>
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
        <div class="mb-8" aria-hidden="true">
          <span class="text-mask">
            <interact-element data-interact-key="p1-h1-l1">
              <span class="text-6xl md:text-9xl line-content">First</span>
            </interact-element>
          </span>
          <span class="text-mask">
            <interact-element data-interact-key="p1-h1-l2">
              <span class="text-6xl md:text-9xl line-content">Impression</span>
            </interact-element>
          </span>
        </div>
        <div class="space-y-1" aria-hidden="true">
          <span class="text-mask"
            ><interact-element data-interact-key="p1-l1"
              ><span class="text-xl md:text-3xl line-content"
                >In the digital realm, your design serves as the</span
              ></interact-element
            ></span
          >
          <span class="text-mask"
            ><interact-element data-interact-key="p1-l2"
              ><span class="text-xl md:text-3xl line-content"
                >silent ambassador of your brand, articulating values</span
              ></interact-element
            ></span
          >
          <span class="text-mask"
            ><interact-element data-interact-key="p1-l3"
              ><span class="text-xl md:text-3xl line-content"
                >and intent long before a single word is read.</span
              ></interact-element
            ></span
          >
        </div>
      </div>

      <!-- PAIR 2 -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center"
      >
        <div class="sr-only">
          <h1>Seamless Motion</h1>
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
        <div class="mb-8" aria-hidden="true">
          <span class="text-mask">
            <interact-element data-interact-key="p2-h1-l1">
              <span class="text-6xl md:text-9xl line-content">Seamless</span>
            </interact-element>
          </span>
          <span class="text-mask">
            <interact-element data-interact-key="p2-h1-l2">
              <span class="text-6xl md:text-9xl line-content">Motion</span>
            </interact-element>
          </span>
        </div>
        <div class="space-y-1" aria-hidden="true">
          <span class="text-mask"
            ><interact-element data-interact-key="p2-l1"
              ><span class="text-xl md:text-3xl line-content"
                >Animation transforms static interfaces into living</span
              ></interact-element
            ></span
          >
          <span class="text-mask"
            ><interact-element data-interact-key="p2-l2"
              ><span class="text-xl md:text-3xl line-content"
                >ecosystems, providing critical context and guiding</span
              ></interact-element
            ></span
          >
          <span class="text-mask"
            ><interact-element data-interact-key="p2-l3"
              ><span class="text-xl md:text-3xl line-content"
                >the user's eye through a fluid narrative.</span
              ></interact-element
            ></span
          >
        </div>
      </div>

      <!-- PAIR 3 -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center"
      >
        <div class="sr-only">
          <h1>Final Impact</h1>
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
        <div class="mb-8" aria-hidden="true">
          <span class="text-mask">
            <interact-element data-interact-key="p3-h1-l1">
              <span class="text-6xl md:text-9xl line-content">Final</span>
            </interact-element>
          </span>
          <span class="text-mask">
            <interact-element data-interact-key="p3-h1-l2">
              <span class="text-6xl md:text-9xl line-content">Impact</span>
            </interact-element>
          </span>
        </div>
        <div class="space-y-1" aria-hidden="true">
          <span class="text-mask"
            ><interact-element data-interact-key="p3-l1"
              ><span class="text-xl md:text-3xl line-content"
                >The final impression is the one that lingers,</span
              ></interact-element
            ></span
          >
          <span class="text-mask"
            ><interact-element data-interact-key="p3-l2"
              ><span class="text-xl md:text-3xl line-content"
                >creating a resonant memory that persists after</span
              ></interact-element
            ></span
          >
          <span class="text-mask"
            ><interact-element data-interact-key="p3-l3"
              ><span class="text-xl md:text-3xl line-content"
                >the browser tab is closed forever.</span
              ></interact-element
            ></span
          >
        </div>
      </div>
    </div>

    <interact-element data-interact-key="scroll-track">
      <div class="relative w-full">
        <div class="snap-point"></div>
        <div class="snap-point"></div>
        <div class="snap-point"></div>
      </div>
    </interact-element>
  </body>
</html>
```

## Essential styles

```css
body::-webkit-scrollbar {
  display: none;
}
body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.text-mask {
  overflow: clip;
  display: block;
  line-height: 1.1;
  padding-bottom: 0.2em;
}

.line-content {
  display: block;
}

.snap-point {
  height: 100vh;
  width: 100%;
  scroll-snap-align: start;
}

.visual-layer {
  opacity: 0;
}
.visual-layer.ready {
  opacity: 1;
}
```

## Interact config

```js
const SCROLL_EASING = 'cubic-bezier(0.8, 0, 0.8, 0.2)';
const LOAD_EASING = 'cubic-bezier(0.25, 1, 0.5, 1)';

const ENTER_SCROLL = [
  { transform: 'translateY(150%)', opacity: 0, offset: 0, easing: SCROLL_EASING },
  { transform: 'translateY(0%)', opacity: 1, offset: 1 },
];
const EXIT_SCROLL = [
  { transform: 'translateY(0%)', opacity: 1, offset: 0, easing: SCROLL_EASING },
  { transform: 'translateY(-150%)', opacity: 0, offset: 1 },
];
const ENTER_LOAD = [
  { transform: 'translateY(110%)', opacity: 0, offset: 0, easing: LOAD_EASING },
  { transform: 'translateY(0%)', opacity: 1, offset: 1 },
];

const T1_START = 26;
const T1_END = 48;
const T2_START = 51;
const T2_END = 72;

const config = {
  interactions: [
    {
      key: 'scroll-track',
      trigger: 'viewEnter',
      sequences: [
        {
          offset: 100,
          triggerType: 'once',
          effects: [
            {
              key: 'p1-h1-l1',
              duration: 1000,
              keyframeEffect: { name: 'in', keyframes: ENTER_LOAD },
              fill: 'both',
              composite: 'add',
            },
            {
              key: 'p1-h1-l2',
              duration: 1000,
              keyframeEffect: { name: 'in', keyframes: ENTER_LOAD },
              fill: 'both',
              composite: 'add',
            },
            {
              key: 'p1-l1',
              duration: 1000,
              keyframeEffect: { name: 'in', keyframes: ENTER_LOAD },
              fill: 'both',
              composite: 'add',
            },
            {
              key: 'p1-l2',
              duration: 1000,
              keyframeEffect: { name: 'in', keyframes: ENTER_LOAD },
              fill: 'both',
              composite: 'add',
            },
            {
              key: 'p1-l3',
              duration: 1000,
              keyframeEffect: { name: 'in', keyframes: ENTER_LOAD },
              fill: 'both',
              composite: 'add',
            },
          ],
        },
      ],
    },
    {
      key: 'scroll-track',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'p1-h1-l1',
          rangeStart: { name: 'cover', offset: { value: T1_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p1-h1-l2',
          rangeStart: { name: 'cover', offset: { value: T1_START + 1, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END + 1, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p1-l1',
          rangeStart: { name: 'cover', offset: { value: T1_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p1-l2',
          rangeStart: { name: 'cover', offset: { value: T1_START + 1, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END + 1, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p1-l3',
          rangeStart: { name: 'cover', offset: { value: T1_START + 2, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END + 2, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },

        {
          key: 'p2-h1-l1',
          rangeStart: { name: 'cover', offset: { value: T1_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-h1-l2',
          rangeStart: { name: 'cover', offset: { value: T1_START + 1, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END + 1, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-l1',
          rangeStart: { name: 'cover', offset: { value: T1_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-l2',
          rangeStart: { name: 'cover', offset: { value: T1_START + 1, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END + 1, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-l3',
          rangeStart: { name: 'cover', offset: { value: T1_START + 2, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T1_END + 2, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },

        {
          key: 'p2-h1-l1',
          rangeStart: { name: 'cover', offset: { value: T2_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-h1-l2',
          rangeStart: { name: 'cover', offset: { value: T2_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-l1',
          rangeStart: { name: 'cover', offset: { value: T2_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-l2',
          rangeStart: { name: 'cover', offset: { value: T2_START + 1, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END + 1, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p2-l3',
          rangeStart: { name: 'cover', offset: { value: T2_START + 2, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END + 2, unit: 'percentage' } },
          keyframeEffect: { name: 'exit', keyframes: EXIT_SCROLL },
          fill: 'both',
          composite: 'add',
        },

        {
          key: 'p3-h1-l1',
          rangeStart: { name: 'cover', offset: { value: T2_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p3-h1-l2',
          rangeStart: { name: 'cover', offset: { value: T2_START + 1, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END + 1, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p3-l1',
          rangeStart: { name: 'cover', offset: { value: T2_START, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p3-l2',
          rangeStart: { name: 'cover', offset: { value: T2_START + 1, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END + 1, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'p3-l3',
          rangeStart: { name: 'cover', offset: { value: T2_START + 2, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: T2_END + 2, unit: 'percentage' } },
          keyframeEffect: { name: 'enter', keyframes: ENTER_SCROLL },
          fill: 'both',
          composite: 'add',
        },
      ],
    },
  ],
};
```
