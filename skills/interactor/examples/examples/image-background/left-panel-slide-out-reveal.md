# Left Panel Slide Out Reveal

A white square panel overlays a blurred hero image at page load; as the user scrolls, the panel slides left off screen while the panel's text fades out and the hero image simultaneously sharpens and zooms back to full size.

**Tags:** viewProgress, fixed, opacity, transform, filter, reveal, fade, blur, scale

## Markup

```html
<section class="hero">
  <interact-element data-interact-key="hero-img">
    <div class="hero__img-wrap">
      <img class="hero__img" src="" />
    </div>
  </interact-element>
</section>

<div class="spacer"></div>

<interact-element data-interact-key="driver">
  <div class="driver"></div>
</interact-element>

<div class="circle-wrap">
  <interact-element data-interact-key="circle-reveal">
    <div class="circle"></div>
  </interact-element>
</div>

<section class="section-two">
  <interact-element data-interact-key="s2-title">
    <div>
      <p class="section-two__label">Why Nexus</p>
      <h2 class="section-two__title">Built<br />Different.</h2>
    </div>
  </interact-element>

  <div class="section-two__rule"></div>

  <interact-element data-interact-key="s2-subtitles">
    <p class="section-two__intro">
      Sample text provides enough length to demonstrate this animated content layout.
    </p>
  </interact-element>
</section>
```

## Essential styles

```css
* {
  box-sizing: border-box;
}

body {
  overflow-x: clip;
}

interact-element {
  display: block;
}

.hero {
  position: fixed;
  inset: 0;
  z-index: 1;
}

.hero__img-wrap {
  position: absolute;
  inset: 0;
}

.hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 15%;
  transform-origin: center;
}

.spacer {
  height: 100vh;
}

.driver {
  height: 120vh;
}

.circle-wrap {
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  pointer-events: none;
}

.circle-wrap interact-element {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.circle {
  width: 80vh;
  height: 80vh;
  aspect-ratio: 1;
  flex-shrink: 0;
  transform-origin: left center;
  background: #fff;
}

.section-two {
  position: fixed;
  top: 50%;
  left: 0;
  z-index: 4;
  display: flex;
  width: 80vh;
  height: 80vh;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
  transform: translateY(-50%);
}

@media (max-width: 768px) {
  .circle-wrap,
  .circle-wrap interact-element {
    justify-content: center;
  }

  .circle,
  .section-two {
    width: 88vw;
    height: 88vw;
  }

  .circle {
    transform-origin: center;
  }

  .section-two {
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
```

## Interact config

```js
const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';

const config = {
  interactions: [
    {
      key: 'driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 's2-subtitles',
          keyframeEffect: {
            name: 's2-subs-out',
            keyframes: [
              { opacity: 1, transform: 'translateX(0)' },
              { opacity: 0, transform: 'translateX(-60px)' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 18, unit: 'percentage' } },
          easing: 'ease-in',
          fill: 'both',
        },
        {
          key: 's2-title',
          keyframeEffect: {
            name: 's2-title-out',
            keyframes: [
              { opacity: 1, transform: 'translateX(0)' },
              { opacity: 0, transform: 'translateX(-80px)' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 5, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 25, unit: 'percentage' } },
          easing: 'ease-in',
          fill: 'both',
        },
        {
          key: 'circle-reveal',
          selector: '.circle',
          keyframeEffect: {
            name: 'square-slide',
            keyframes: [
              { transform: 'translateX(0)' },
              { transform: 'translateX(calc(-100% - 5vh))' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 15, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 85, unit: 'percentage' } },
          easing: EASE_OUT,
          fill: 'both',
        },
        {
          key: 'hero-img',
          keyframeEffect: {
            name: 'img-settle',
            keyframes: [{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
          },
          rangeStart: { name: 'entry', offset: { value: 30, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'hero-img',
          keyframeEffect: {
            name: 'img-unblur',
            keyframes: [{ filter: 'blur(14px)' }, { filter: 'blur(0px)' }],
          },
          rangeStart: { name: 'entry', offset: { value: 10, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 80, unit: 'percentage' } },
          easing: 'ease-out',
          fill: 'both',
          composite: 'add',
        },
      ],
    },
  ],
};
```
