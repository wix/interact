# Scroll Mask Reveal

As the page scrolls, inline image thumbnails embedded within a sticky text block reveal horizontally by animating their `max-width`, `margin-right`, and `opacity` from hidden to visible, creating a staggered masked photo-reveal effect woven between words.

**Tags:** viewProgress, sticky, opacity, reveal, stagger, mask, inline-image

## Markup

```html
<interact-element data-interact-key="scroll-track">
  <main class="track">
    <section class="sticky-content">
      <p class="sr-only">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>

      <article class="text-block" aria-hidden="true">
        <span>Visual</span>
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
        <span>rhythm</span>
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
  font-size: max(30px, 3.5vw);
  line-height: 1.6;
  max-width: 100%;
}

@media (max-width: 768px) {
  .text-block {
    font-size: max(30px, 3.5vw);
    line-height: 1.84;
  }
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
  will-change: max-width, margin-right, opacity;
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
const desktopRevealKeyframes = [
  { maxWidth: '0px', marginRight: '0px', opacity: 0 },
  { maxWidth: '125px', marginRight: '0.4em', opacity: 1 },
];

const mobileRevealKeyframes = [
  { maxWidth: '0px', marginRight: '0px', opacity: 0 },
  { maxWidth: '25px', marginRight: '0.4em', opacity: 1 },
];

const createEffect = (key, startOffset, endOffset, conditions, keyframes) => ({
  key,
  conditions,
  fill: 'both',
  rangeStart: { name: 'cover', offset: { value: startOffset, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: endOffset, unit: 'percentage' } },
  keyframeEffect: {
    name: `reveal-${key}-${conditions[0]}`,
    keyframes,
  },
});

const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
    mobile: { type: 'media', predicate: '(max-width: 768px)' },
  },
  interactions: [
    {
      key: 'scroll-track',
      trigger: 'viewProgress',
      effects: [
        createEffect('mask-1', 15, 25, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-2', 23, 33, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-3', 31, 41, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-4', 39, 49, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-5', 47, 57, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-6', 55, 65, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-7', 63, 73, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-8', 71, 81, ['desktop'], desktopRevealKeyframes),
        createEffect('mask-1', 15, 25, ['mobile'], mobileRevealKeyframes),
        createEffect('mask-2', 23, 33, ['mobile'], mobileRevealKeyframes),
        createEffect('mask-3', 31, 41, ['mobile'], mobileRevealKeyframes),
        createEffect('mask-4', 39, 49, ['mobile'], mobileRevealKeyframes),
        createEffect('mask-5', 47, 57, ['mobile'], mobileRevealKeyframes),
        createEffect('mask-6', 55, 65, ['mobile'], mobileRevealKeyframes),
        createEffect('mask-7', 63, 73, ['mobile'], mobileRevealKeyframes),
        createEffect('mask-8', 71, 81, ['mobile'], mobileRevealKeyframes),
      ],
    },
  ],
};
```
