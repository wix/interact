# Rise Of The Dead

Individual letters in "RISING DEAD" each rotate up from below the text baseline with a 3D flip effect as the user scrolls, with randomised stagger offsets so each character rises independently.

**Tags:** viewProgress, stagger, 3d, rotate, opacity, transform, sticky, scroll

## Markup

```html
<div class="spacer">
  <p>↓ Scroll Down to Enter the Timeline ↓</p>
</div>

<interact-element data-interact-key="scroll-track">
  <section class="relative h-[450vh] w-full">
    <div
      class="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden"
    >
      <h1 class="text-6xl md:text-9xl text-center leading-tight mb-12 w-full">
        <span class="sr-only">RISING DEAD</span>
        <div class="block whitespace-nowrap text-center" aria-hidden="true">
          <span class="char-perspective"
            ><interact-element data-interact-key="char-0-0"
              ><span class="letter-visual">R</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-0-1"
              ><span class="letter-visual">I</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-0-2"
              ><span class="letter-visual">S</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-0-3"
              ><span class="letter-visual">I</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-0-4"
              ><span class="letter-visual">N</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-0-5"
              ><span class="letter-visual">G</span></interact-element
            ></span
          >
        </div>
        <div class="block whitespace-nowrap text-center" aria-hidden="true">
          <span class="char-perspective"
            ><interact-element data-interact-key="char-1-0"
              ><span class="letter-visual">D</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-1-1"
              ><span class="letter-visual">E</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-1-2"
              ><span class="letter-visual">A</span></interact-element
            ></span
          >
          <span class="char-perspective"
            ><interact-element data-interact-key="char-1-3"
              ><span class="letter-visual">D</span></interact-element
            ></span
          >
        </div>
      </h1>

      <div class="max-w-2xl px-6 text-center">
        <p class="text-lg md:text-xl leading-relaxed">
          Sample text provides enough length to demonstrate this animated content layout.
        </p>
      </div>
    </div>
  </section>
</interact-element>

<div class="spacer">
  <p>End of Timeline</p>
</div>
```

## Essential styles

```css
body {
  overflow-x: clip;
}

.char-perspective {
  perspective: 600px;
  display: inline-block;
  margin: 0 2px;
}

interact-element {
  display: inline-block;
  transform-origin: bottom center;
  transform-style: preserve-3d;
  vertical-align: bottom;
}

interact-element[data-interact-key='scroll-track'] {
  display: block;
  width: 100%;
}

.letter-visual {
  display: block;
  will-change: transform, opacity;
}

.spacer {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Interact config

```js
const letterKeys = [
  'char-0-0',
  'char-0-1',
  'char-0-2',
  'char-0-3',
  'char-0-4',
  'char-0-5',
  'char-1-0',
  'char-1-1',
  'char-1-2',
  'char-1-3',
];

const effects = letterKeys.map((letterKey, index) => {
  const startDelayVH = index * 20;
  const durationVH = 50;

  return {
    key: letterKey,
    fill: 'both',
    rangeStart: {
      name: 'entry',
      offset: { value: 100 + startDelayVH, unit: 'vh' },
    },
    rangeEnd: {
      name: 'entry',
      offset: { value: 100 + startDelayVH + durationVH, unit: 'vh' },
    },
    keyframeEffect: {
      name: `rise-${letterKey}`,
      keyframes: [
        {
          opacity: 0,
          transform: 'rotateX(90deg) translateY(10px) translateZ(-50px)',
        },
        {
          opacity: 1,
          transform: 'rotateX(0deg) translateY(0) translateZ(0)',
        },
      ],
    },
  };
});

const config = {
  interactions: [
    {
      key: 'scroll-track',
      trigger: 'viewProgress',
      effects: effects,
    },
  ],
};
```
