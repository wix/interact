# Strobe Headline

Stacked duplicate rows of a headline strobe and flicker per character on view enter, with each character's timing staggered by its row's distance from the solid center row and its position in the word, then a subtitle slides up after all flickers resolve.

**Tags:** viewEnter, opacity, transform, stagger, flicker, reveal, fade

## Markup

```html
<interact-element data-interact-key="stack" class="visualizer-container" id="stack-container">
  <div class="row duplicate">
    <interact-element data-interact-key="char-0-0"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-0-1"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-0-2"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-0-3"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-0-4"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-0-5"><span class="char">S</span></interact-element>
    <interact-element data-interact-key="char-0-6"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-0-7"><span class="char">V</span></interact-element>
    <interact-element data-interact-key="char-0-8"><span class="char">E</span></interact-element>
    <span class="space"></span>
    <interact-element data-interact-key="char-0-10"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-0-11"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-0-12"><span class="char">A</span></interact-element>
    <interact-element data-interact-key="char-0-13"><span class="char">L</span></interact-element>
    <interact-element data-interact-key="char-0-14"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-0-15"><span class="char">T</span></interact-element>
    <interact-element data-interact-key="char-0-16"><span class="char">Y</span></interact-element>
  </div>
  <div class="row duplicate">
    <interact-element data-interact-key="char-1-0"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-1-1"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-1-2"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-1-3"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-1-4"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-1-5"><span class="char">S</span></interact-element>
    <interact-element data-interact-key="char-1-6"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-1-7"><span class="char">V</span></interact-element>
    <interact-element data-interact-key="char-1-8"><span class="char">E</span></interact-element>
    <span class="space"></span>
    <interact-element data-interact-key="char-1-10"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-1-11"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-1-12"><span class="char">A</span></interact-element>
    <interact-element data-interact-key="char-1-13"><span class="char">L</span></interact-element>
    <interact-element data-interact-key="char-1-14"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-1-15"><span class="char">T</span></interact-element>
    <interact-element data-interact-key="char-1-16"><span class="char">Y</span></interact-element>
  </div>
  <div class="row duplicate">
    <interact-element data-interact-key="char-2-0"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-2-1"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-2-2"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-2-3"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-2-4"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-2-5"><span class="char">S</span></interact-element>
    <interact-element data-interact-key="char-2-6"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-2-7"><span class="char">V</span></interact-element>
    <interact-element data-interact-key="char-2-8"><span class="char">E</span></interact-element>
    <span class="space"></span>
    <interact-element data-interact-key="char-2-10"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-2-11"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-2-12"><span class="char">A</span></interact-element>
    <interact-element data-interact-key="char-2-13"><span class="char">L</span></interact-element>
    <interact-element data-interact-key="char-2-14"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-2-15"><span class="char">T</span></interact-element>
    <interact-element data-interact-key="char-2-16"><span class="char">Y</span></interact-element>
  </div>
  <h1 class="row middle">
    <span class="char">I</span><span class="char">M</span><span class="char">M</span
    ><span class="char">E</span><span class="char">R</span><span class="char">S</span
    ><span class="char">I</span><span class="char">V</span><span class="char">E</span
    ><span class="space"></span><span class="char">R</span><span class="char">E</span
    ><span class="char">A</span><span class="char">L</span><span class="char">I</span
    ><span class="char">T</span><span class="char">Y</span>
  </h1>
  <div class="row duplicate">
    <interact-element data-interact-key="char-4-0"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-4-1"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-4-2"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-4-3"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-4-4"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-4-5"><span class="char">S</span></interact-element>
    <interact-element data-interact-key="char-4-6"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-4-7"><span class="char">V</span></interact-element>
    <interact-element data-interact-key="char-4-8"><span class="char">E</span></interact-element>
    <span class="space"></span>
    <interact-element data-interact-key="char-4-10"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-4-11"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-4-12"><span class="char">A</span></interact-element>
    <interact-element data-interact-key="char-4-13"><span class="char">L</span></interact-element>
    <interact-element data-interact-key="char-4-14"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-4-15"><span class="char">T</span></interact-element>
    <interact-element data-interact-key="char-4-16"><span class="char">Y</span></interact-element>
  </div>
  <div class="row duplicate">
    <interact-element data-interact-key="char-5-0"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-5-1"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-5-2"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-5-3"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-5-4"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-5-5"><span class="char">S</span></interact-element>
    <interact-element data-interact-key="char-5-6"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-5-7"><span class="char">V</span></interact-element>
    <interact-element data-interact-key="char-5-8"><span class="char">E</span></interact-element>
    <span class="space"></span>
    <interact-element data-interact-key="char-5-10"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-5-11"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-5-12"><span class="char">A</span></interact-element>
    <interact-element data-interact-key="char-5-13"><span class="char">L</span></interact-element>
    <interact-element data-interact-key="char-5-14"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-5-15"><span class="char">T</span></interact-element>
    <interact-element data-interact-key="char-5-16"><span class="char">Y</span></interact-element>
  </div>
  <div class="row duplicate">
    <interact-element data-interact-key="char-6-0"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-6-1"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-6-2"><span class="char">M</span></interact-element>
    <interact-element data-interact-key="char-6-3"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-6-4"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-6-5"><span class="char">S</span></interact-element>
    <interact-element data-interact-key="char-6-6"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-6-7"><span class="char">V</span></interact-element>
    <interact-element data-interact-key="char-6-8"><span class="char">E</span></interact-element>
    <span class="space"></span>
    <interact-element data-interact-key="char-6-10"><span class="char">R</span></interact-element>
    <interact-element data-interact-key="char-6-11"><span class="char">E</span></interact-element>
    <interact-element data-interact-key="char-6-12"><span class="char">A</span></interact-element>
    <interact-element data-interact-key="char-6-13"><span class="char">L</span></interact-element>
    <interact-element data-interact-key="char-6-14"><span class="char">I</span></interact-element>
    <interact-element data-interact-key="char-6-15"><span class="char">T</span></interact-element>
    <interact-element data-interact-key="char-6-16"><span class="char">Y</span></interact-element>
  </div>
</interact-element>

<div class="desc-container">
  <interact-element data-interact-key="hero-desc">
    <div id="hero-desc">
      <p style="margin: 0">
        Experience the harmony of sound and vision.<br />
        An interactive journey powered by code.
      </p>
    </div>
  </interact-element>
</div>
```

## Essential styles

```css
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: clip;
}

.visualizer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  line-height: 0.85;
}

.row {
  display: flex;
  justify-content: center;
  white-space: nowrap;
  mix-blend-mode: screen;
}

.row.middle {
  z-index: 10;
}

.row.duplicate {
  pointer-events: none;
}

.char {
  display: inline-block;
  font-size: 5.5vw;
}

.space {
  display: inline-block;
  width: 2vw;
}

.desc-container {
  margin-top: 3rem;
  height: 6rem;
  overflow: clip;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
}

#hero-desc {
  font-size: 0.875rem;
  text-align: center;
  line-height: 1.625;
  max-width: 32rem;
  opacity: 0;
}

@media (min-width: 768px) {
  #hero-desc {
    font-size: 1rem;
  }
}
```

## Interact config

```js
const duplicateRows = [0, 1, 2, 4, 5, 6];
const firstWordColumns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const secondWordColumns = [10, 11, 12, 13, 14, 15, 16];
const animationDuration = 1200;
const paragraphDelay = 3 * 100 + 16 * 40 + animationDuration + 400;

const effectsFor = (row, columns) =>
  columns.map((column) => ({ key: `char-${row}-${column}`, effectId: 'flicker' }));

const rowSequences = duplicateRows.flatMap((row) => {
  const rowDelay = Math.abs(row - 3) * 100;
  return [
    {
      delay: rowDelay,
      offset: 40,
      triggerType: 'once',
      effects: effectsFor(row, firstWordColumns),
    },
    {
      delay: rowDelay + 400,
      offset: 40,
      triggerType: 'once',
      effects: effectsFor(row, secondWordColumns),
    },
  ];
});

const config = {
  effects: {
    flicker: {
      keyframeEffect: {
        name: 'flicker',
        keyframes: [
          { offset: 0.0, opacity: 1 },
          { offset: 0.1, opacity: 0 },
          { offset: 0.2, opacity: 1 },
          { offset: 0.3, opacity: 0 },
          { offset: 0.5, opacity: 1 },
          { offset: 0.6, opacity: 0 },
          { offset: 0.8, opacity: 1 },
          { offset: 1.0, opacity: 0 },
        ],
      },
      duration: animationDuration,
      easing: 'linear',
      fill: 'forwards',
    },
  },
  interactions: [
    {
      key: 'stack',
      trigger: 'viewEnter',
      sequences: rowSequences,
    },
    {
      key: 'hero-desc',
      trigger: 'viewEnter',
      effects: [
        {
          keyframeEffect: {
            name: 'hero-desc-reveal',
            keyframes: [
              { transform: 'translateY(110%)', opacity: 0 },
              { transform: 'translateY(0%)', opacity: 1 },
            ],
          },
          triggerType: 'once',
          duration: 800,
          delay: paragraphDelay,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
      ],
    },
  ],
};
```
