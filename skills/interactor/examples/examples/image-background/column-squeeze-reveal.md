# Column Squeeze Reveal

A sticky two-column layout where scrolling squeezes the left text column from 22vw to 9vw, scales the rotated hero typography down, and simultaneously zooms the full-bleed background image.

**Tags:** viewProgress, sticky, transform, scale, reveal, parallax

## Markup

```html
<interact-element data-interact-key="scroll-driver" class="scroll-driver">
  <div class="sticky-stage">
    <div class="right-col">
      <interact-element data-interact-key="bg-image" class="bg-image-el">
        <div class="bg-image"></div>
      </interact-element>
    </div>

    <interact-element data-interact-key="left-col" class="left-col">
      <div class="left-inner">
        <interact-element data-interact-key="hero-text" class="hero-text-wrap">
          <div class="hero-text-inner">
            <span class="hero-word hero-w1">Built</span>
            <span class="hero-word hero-w2">Space</span>
          </div>
        </interact-element>
      </div>
    </interact-element>
  </div>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
}

html,
body {
  height: 100%;
  overflow-x: clip;
}

.scroll-driver {
  height: 300vh;
}

.sticky-stage {
  position: sticky;
  top: 1.5rem;
  width: calc(100vw - 3rem);
  height: calc(100vh - 3rem);
  overflow: clip;
}

.left-col {
  position: absolute;
  inset: 0 auto 0 0;
  z-index: 2;
  overflow: clip;
}

.left-inner {
  position: relative;
  width: 22vw;
  height: 100%;
  overflow: clip;
  background: #fff;
}

.hero-text-wrap {
  position: absolute;
  inset: 0;
  overflow: clip;
}

.hero-text-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: left bottom;
}

.hero-word {
  position: absolute;
  bottom: 0;
  white-space: nowrap;
  transform-origin: left bottom;
}

.hero-w1 {
  left: 0;
  transform: translateX(9.68vw) rotate(-90deg);
}

.hero-w2 {
  left: 10.18vw;
  transform: translateX(9.68vw) rotate(-90deg);
}

.right-col,
.bg-image-el {
  position: absolute;
  inset: 0;
}

.right-col {
  z-index: 1;
  overflow: clip;
}

.bg-image {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url('');
  background-position: center top;
  background-size: cover;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'scroll-driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'left-col',
          selector: '.left-inner',
          keyframeEffect: {
            name: 'squeeze-left',
            keyframes: [{ width: '22vw' }, { width: '9vw' }],
          },
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          easing: 'ease-in-out',
        },
        {
          key: 'hero-text',
          selector: '.hero-text-inner',
          keyframeEffect: {
            name: 'scale-text',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0.41)' }],
          },
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          easing: 'ease-in-out',
        },
        {
          key: 'bg-image',
          selector: '.bg-image',
          keyframeEffect: {
            name: 'zoom-image',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }],
          },
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          easing: 'ease-in-out',
        },
      ],
    },
  ],
};
```
