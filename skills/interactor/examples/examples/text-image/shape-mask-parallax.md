# Shape Mask Parallax

As the page scrolls through a sticky section, five masked versions of one image swap in sequence. Supply each mask class with its own `mask-image` URL.

**Tags:** viewProgress, sticky, opacity, fade, reveal

## Markup

```html
<interact-element data-interact-key="scroll-driver" class="scroll-driver">
  <div class="sticky-stage">
    <div class="layout">
      <div class="image-col">
        <interact-element data-interact-key="mask-1" class="mask-wrap">
          <div class="masked-image mask-shape-1"></div>
        </interact-element>
        <interact-element data-interact-key="mask-2" class="mask-wrap">
          <div class="masked-image mask-shape-2"></div>
        </interact-element>
        <interact-element data-interact-key="mask-3" class="mask-wrap">
          <div class="masked-image mask-shape-3"></div>
        </interact-element>
        <interact-element data-interact-key="mask-4" class="mask-wrap">
          <div class="masked-image mask-shape-4"></div>
        </interact-element>
        <interact-element data-interact-key="mask-5" class="mask-wrap">
          <div class="masked-image mask-shape-5"></div>
        </interact-element>
      </div>

      <div class="text-col">
        <p>About Me</p>
        <h2>The <em>Person</em><br />Behind It All</h2>
        <p class="description">
          Sample text provides enough length to demonstrate this animated content layout.
          <a href="#">Get in touch</a>
        </p>
      </div>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
}

.scroll-driver {
  height: 500vh;
}

.sticky-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: clip;
}

.layout {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
}

.image-col {
  flex: 1;
  position: relative;
  height: 85vh;
}

.mask-wrap {
  position: absolute;
  inset: 0;
}

.masked-image {
  width: 100%;
  height: 100%;
  background-image: url('');
  background-size: cover;
  background-position: center;
  -webkit-mask-image: var(--mask-image);
  mask-image: var(--mask-image);
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.mask-shape-1,
.mask-shape-2,
.mask-shape-3,
.mask-shape-4,
.mask-shape-5 {
  --mask-image: url('');
}

.text-col {
  flex: 1;
  padding: 2rem;
}

.description {
  max-width: 500px;
}

@media (max-width: 900px) {
  .layout {
    flex-direction: column;
  }

  .image-col {
    width: 100%;
    height: 42vh;
  }

  .text-col {
    width: 100%;
  }
}
```

## Interact config

```js
const fullRange = {
  rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  fill: 'both',
};

const config = {
  interactions: [
    {
      key: 'scroll-driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'mask-1',
          keyframeEffect: {
            name: 'mask-1-cut',
            keyframes: [
              { opacity: 1, offset: 0 },
              { opacity: 1, offset: 0.199 },
              { opacity: 0, offset: 0.2 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-2',
          keyframeEffect: {
            name: 'mask-2-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.199 },
              { opacity: 1, offset: 0.2 },
              { opacity: 1, offset: 0.399 },
              { opacity: 0, offset: 0.4 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-3',
          keyframeEffect: {
            name: 'mask-3-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.399 },
              { opacity: 1, offset: 0.4 },
              { opacity: 1, offset: 0.599 },
              { opacity: 0, offset: 0.6 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-4',
          keyframeEffect: {
            name: 'mask-4-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.599 },
              { opacity: 1, offset: 0.6 },
              { opacity: 1, offset: 0.799 },
              { opacity: 0, offset: 0.8 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-5',
          keyframeEffect: {
            name: 'mask-5-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.799 },
              { opacity: 1, offset: 0.8 },
              { opacity: 1, offset: 1 },
            ],
          },
          ...fullRange,
        },
      ],
    },
  ],
};
```
