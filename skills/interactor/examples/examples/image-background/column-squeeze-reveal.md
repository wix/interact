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
        <div class="elegant-blurb">
          <p>Sample text provides enough length to demonstrate this animated content layout.</p>
        </div>
        <interact-element data-interact-key="hero-text" class="hero-text-wrap">
          <div class="hero-text-inner">
            <span class="hero-word hero-w1">Built</span>
            <span class="hero-word hero-w2">Space</span>
          </div>
        </interact-element>
      </div>
    </interact-element>

    <div class="scroll-cue">
      <span class="scroll-cue-label">Explore</span>
      <div class="scroll-cue-arrow"></div>
    </div>

  </div>
</interact-element>
```

## Essential styles

```css
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

interact-element {
  display: block;
}

html, body {
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
  margin-left: 1.5rem;
  border-radius: 6px;
  overflow: hidden;
}

.left-col {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 2;
  overflow: clip;
  padding-right: 12px;
}

.left-inner {
  width: 22vw;
  height: 100%;
  position: relative;
  overflow: clip;
}

.elegant-blurb {
  position: absolute;
  top: 2.8rem;
  left: 0.5rem;
  max-width: 18rem;
  z-index: 3;
}

.elegant-blurb p {
  font-size: clamp(0.62rem, 0.78vw, 0.75rem);
  font-weight: 300;
  line-height: 1.8;
  letter-spacing: 0.01em;
  text-wrap: pretty;
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
  font-weight: 400;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 0.88;
  letter-spacing: -0.01em;
  transform-origin: left bottom;
}

.hero-w1 {
  font-size: 11vw;
  left: 0;
  transform: translateX(calc(11vw * 0.88)) rotate(-90deg);
}

.hero-w2 {
  font-size: 11vw;
  left: calc(11vw * 0.88 + 0.5vw);
  transform: translateX(calc(11vw * 0.88)) rotate(-90deg);
}

.right-col {
  position: absolute;
  inset: 0;
  overflow: clip;
  z-index: 1;
}

.bg-image-el {
  position: absolute;
  inset: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  background-image: url('');
  background-size: cover;
  background-position: center top;
  position: relative;
}

.bg-image::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scroll-cue {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: absolute;
  bottom: 2.2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.scroll-cue-label {
  font-size: 0.7rem;
  font-weight: 300;
  letter-spacing: 0.25em;
}

.scroll-cue-arrow {
  width: 1px;
  height: 2rem;
  animation: scroll-pulse 2.2s ease-in-out infinite;
}

@keyframes scroll-pulse {
  0%, 100% { opacity: 0.2; transform: scaleY(0.6); }
  50% { opacity: 0.7; transform: scaleY(1); }
}

@media (max-width: 750px) {
  .sticky-stage {
    top: 0.75rem;
    width: calc(100vw - 1.5rem);
    height: calc(100vh - 1.5rem);
    margin-left: 0.75rem;
    border-radius: 4px;
  }

  .left-col {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    padding-right: 0;
    pointer-events: none;
  }

  .left-inner {
    width: 100% !important;
    height: 100%;
  }

  .elegant-blurb {
    top: 1.6rem;
    left: 1.4rem;
    right: 1.4rem;
    max-width: none;
  }

  .elegant-blurb p {
    font-size: 0.72rem;
  }

  .hero-word {
    transform: none !important;
    position: relative;
    display: block;
    bottom: auto;
    left: auto !important;
  }

  .hero-text-wrap {
    position: absolute;
    inset: auto 0 0 0;
    top: auto;
    padding: 1.4rem;
  }

  .hero-text-inner {
    transform: none !important;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    height: auto;
  }

  .hero-w1,
  .hero-w2 {
    font-size: 16vw;
    line-height: 0.92;
  }

  .scroll-cue {
    bottom: 1.2rem;
  }
}
```

## Interact config

```js
{
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
            keyframes: [
              { width: '22vw' },
              { width: '9vw' }
            ]
          },
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd:   { name: 'exit',  offset: { value: 0,   unit: 'percentage' } },
          fill: 'both',
          easing: 'ease-in-out'
        },
        {
          key: 'hero-text',
          selector: '.hero-text-inner',
          keyframeEffect: {
            name: 'scale-text',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(0.41)' }
            ]
          },
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd:   { name: 'exit',  offset: { value: 0,   unit: 'percentage' } },
          fill: 'both',
          easing: 'ease-in-out'
        },
        {
          key: 'bg-image',
          selector: '.bg-image',
          keyframeEffect: {
            name: 'zoom-image',
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(1.4)' }
            ]
          },
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd:   { name: 'exit',  offset: { value: 0,   unit: 'percentage' } },
          fill: 'both',
          easing: 'ease-in-out'
        }
      ]
    }
  ]
}
```
