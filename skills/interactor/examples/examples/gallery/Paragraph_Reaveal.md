# Paragraph Reveal

Inline images hidden between words in a paragraph expand from zero width into the text flow as the user scrolls through a tall sticky section, staggered evenly across the scroll range using viewProgress keyframe animations.

**Tags:** viewProgress, sticky, opacity, reveal, stagger

## Markup

```html
<interact-element data-interact-key="scroll-track">
  <main class="track">
    <section class="sticky-content">
      <p class="sr-only">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>
      <article class="text-block" aria-hidden="true">
        <span class="italic-text">Visual</span>
        <span>storytelling</span>
        <interact-element data-interact-key="mask-1">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>creates</span>
        <span>a</span>
        <span>deep</span>
        <interact-element data-interact-key="mask-2">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>and</span>
        <span>lasting</span>
        <span>impact</span>
        <interact-element data-interact-key="mask-3">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>on</span>
        <span>the</span>
        <span>soul.</span>
        <span>Good</span>
        <span>design</span>
        <interact-element data-interact-key="mask-4">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>moves</span>
        <span>us</span>
        <span>forward,</span>
        <interact-element data-interact-key="mask-5">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>while</span>
        <span class="italic-text">rhythm</span>
        <span>guides</span>
        <interact-element data-interact-key="mask-6">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>the</span>
        <span>eye.</span>
        <span>Every</span>
        <interact-element data-interact-key="mask-7">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>pixel</span>
        <span>matters</span>
        <span>in</span>
        <span>the</span>
        <span>end</span>
        <interact-element data-interact-key="mask-8">
          <div class="image-mask">
            <img src="" />
          </div>
        </interact-element>
        <span>result.</span>
      </article>
    </section>
  </main>
</interact-element>
```

## Essential styles

```css
body {
  margin: 0;
  overflow-x: clip;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: clip;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.track {
  height: 600vh;
  position: relative;
}

.sticky-content {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: clip;
  padding-top: 15vh;
  padding-left: 5vw;
  padding-right: 5vw;
  box-sizing: border-box;
}

.text-block {
  display: block;
  text-align: left;
  max-width: 100%;
}

.text-block span {
  margin-right: 0.25em;
  display: inline-block;
}

interact-element {
  display: inline;
}

.image-mask {
  height: 1.2em;
  overflow: clip;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  vertical-align: middle;
  max-width: 0px;
  margin-right: 0px;
  opacity: 0;
  position: relative;
  top: -0.1em;
}

@media (max-width: 768px) {
  .image-mask {
    height: 1.38em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .image-mask {
    opacity: 1 !important;
    margin-right: 0.4em !important;
    max-width: 125px !important;
  }

  @media (max-width: 768px) {
    .image-mask {
      max-width: 25px !important;
    }
  }
}

.image-mask img {
  height: 100%;
  width: auto;
  min-width: 180px;
  object-fit: cover;
  object-position: left center;
}
```

## Interact config

```js
const REVEAL_WIDTH = 125;
const IMAGE_COUNT = 8;

const desktopRevealKeyframes = [
  { maxWidth: '0px', marginRight: '0px', opacity: 0 },
  { maxWidth: REVEAL_WIDTH + 'px', marginRight: '0.4em', opacity: 1 },
];

const mobileRevealKeyframes = [
  { maxWidth: '0px', marginRight: '0px', opacity: 0 },
  { maxWidth: '25px', marginRight: '0.4em', opacity: 1 },
];

const TOTAL_MASKS = 8;

const selectedIndices =
  IMAGE_COUNT >= TOTAL_MASKS
    ? Array.from({ length: TOTAL_MASKS }, (_, i) => i)
    : IMAGE_COUNT === 1
      ? [0]
      : Array.from({ length: IMAGE_COUNT }, (_, i) =>
          Math.round((i * (TOTAL_MASKS - 1)) / (IMAGE_COUNT - 1)),
        );

const R = 6;

const startCover = Math.round(100 / (R + 1)) + 1;
const endCover = Math.round((100 * R) / (R + 1)) - 1;
const totalRange = endCover - startCover;
const count = selectedIndices.length;
const effectWidth = Math.max(8, Math.round((totalRange / count) * 1.25));
const stagger = count > 1 ? (totalRange - effectWidth) / (count - 1) : 0;

const effects = [];
for (let j = 0; j < count; j++) {
  const idx = selectedIndices[j];
  const s = Math.round((startCover + j * stagger) * 10) / 10;
  const e = Math.round(Math.min(s + effectWidth, endCover) * 10) / 10;
  effects.push({
    key: 'mask-' + (idx + 1),
    conditions: ['desktop'],
    fill: 'both',
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: s } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: e } },
    keyframeEffect: {
      name: 'reveal-mask-' + (idx + 1) + '-desktop',
      keyframes: desktopRevealKeyframes,
    },
  });
  effects.push({
    key: 'mask-' + (idx + 1),
    conditions: ['mobile'],
    fill: 'both',
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: s } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: e } },
    keyframeEffect: {
      name: 'reveal-mask-' + (idx + 1) + '-mobile',
      keyframes: mobileRevealKeyframes,
    },
  });
}

const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
    mobile: { type: 'media', predicate: '(max-width: 768px)' },
  },
  interactions: [
    {
      key: 'scroll-track',
      trigger: 'viewProgress',
      effects: effects,
    },
  ],
};
```
