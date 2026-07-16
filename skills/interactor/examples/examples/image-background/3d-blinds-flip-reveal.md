# 3D Blinds Flip Reveal

Ten horizontal blinds fold open in a staggered cascade driven by scroll progress, revealing a white content section over a fixed hero image that simultaneously zooms, blurs, and darkens.

**Tags:** viewProgress, viewEnter, fixed, opacity, transform, filter, reveal, stagger, 3d, blur, scale, fade

## Markup

```html
<section class="hero">
  <interact-element data-interact-key="hero-img">
    <div class="hero__img-wrap">
      <img class="hero__img" src="" />
    </div>
  </interact-element>
  <interact-element data-interact-key="hero-darken">
    <div class="hero__darken"></div>
  </interact-element>

  <interact-element data-interact-key="hero-content">
    <h1 class="hero__content">
      <span class="hero__title">The Future of Computing. Now.</span>
    </h1>
  </interact-element>

  <interact-element data-interact-key="hero-scroll">
    <div class="hero__scroll">
      <span>Scroll</span>
      <svg
        class="hero__scroll-arrow"
        viewBox="0 0 14 8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M1 1l6 6 6-6" />
      </svg>
    </div>
  </interact-element>
</section>

<div class="spacer"></div>

<interact-element data-interact-key="driver">
  <div class="driver"></div>
</interact-element>

<div class="blinds">
  <interact-element data-interact-key="b1"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b2"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b3"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b4"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b5"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b6"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b7"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b8"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b9"><div class="blind"></div></interact-element>
  <interact-element data-interact-key="b10"><div class="blind"></div></interact-element>
</div>

<section class="section-two">
  <interact-element data-interact-key="s2-title">
    <div class="section-two__left">
      <p class="section-two__label">Why Nexus</p>
      <h2 class="section-two__title">Built<br />Different.</h2>
    </div>
  </interact-element>

  <interact-element data-interact-key="s2-subtitles">
    <div class="section-two__right">
      <p class="section-two__intro">Performance without compromise. Architecture without limits.</p>
      <p class="section-two__line">
        Sample text provides enough length to demonstrate this animated content layout.
      </p>
    </div>
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

.hero__darken {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: #000;
}

.hero__scroll {
  position: absolute;
  bottom: 52px;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transform: translateX(-50%);
}

.hero__scroll-arrow {
  width: 14px;
  height: 8px;
}

.hero__content {
  position: absolute;
  bottom: 160px;
  left: 52px;
  z-index: 2;
  max-width: 680px;
}

[data-interact-key='hero-content'] {
  opacity: 0;
  transform: translateY(40px);
}

.spacer {
  height: 100vh;
}

.driver {
  height: 120vh;
}

.blinds {
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.blinds interact-element {
  flex: 1;
  min-height: 0;
  transform-origin: top center;
}

.blind {
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: #fff;
}

.section-two {
  position: fixed;
  inset: 0;
  z-index: 4;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-content: center;
  pointer-events: none;
}

.section-two__left,
.section-two__right {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .hero__content {
    right: 20px;
    bottom: 100px;
    left: 20px;
    max-width: none;
  }

  .section-two {
    grid-template-columns: 1fr;
  }
}
```

## Interact config

```js
const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';

const blindEffect = (key, startPct, endPct) => ({
  key,
  keyframeEffect: {
    name: `${key}-flip`,
    keyframes: [
      { transform: 'perspective(800px) rotateX(-90deg)' },
      { transform: 'perspective(800px) rotateX(0deg)' },
    ],
  },
  rangeStart: { name: 'entry', offset: { value: startPct, unit: 'percentage' } },
  rangeEnd: { name: 'entry', offset: { value: endPct, unit: 'percentage' } },
  easing: EASE_OUT,
  fill: 'both',
});

const config = {
  interactions: [
    {
      key: 'driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'hero-scroll',
          keyframeEffect: {
            name: 'scroll-out',
            keyframes: [{ opacity: 1 }, { opacity: 0 }],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 12, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'hero-img',
          keyframeEffect: {
            name: 'img-zoom',
            keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'hero-img',
          keyframeEffect: {
            name: 'img-blur',
            keyframes: [{ filter: 'blur(0px)' }, { filter: 'blur(6px)' }],
          },
          rangeStart: { name: 'entry', offset: { value: 10, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 70, unit: 'percentage' } },
          easing: 'ease-out',
          fill: 'both',
          composite: 'add',
        },
        {
          key: 'hero-darken',
          keyframeEffect: {
            name: 'darken-in',
            keyframes: [{ opacity: 0 }, { opacity: 0.55 }],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 60, unit: 'percentage' } },
          easing: 'ease-out',
          fill: 'both',
        },
        blindEffect('b1', 0, 50),
        blindEffect('b2', 5, 55),
        blindEffect('b3', 10, 60),
        blindEffect('b4', 15, 65),
        blindEffect('b5', 20, 70),
        blindEffect('b6', 25, 75),
        blindEffect('b7', 30, 80),
        blindEffect('b8', 35, 85),
        blindEffect('b9', 40, 90),
        blindEffect('b10', 45, 95),
      ],
    },

    {
      key: 'hero-scroll',
      trigger: 'viewEnter',
      effects: [
        {
          selector: '.hero__scroll-arrow',
          keyframeEffect: {
            name: 'arrow-bounce',
            keyframes: [
              { transform: 'translateY(0)', opacity: 0.3 },
              { transform: 'translateY(6px)', opacity: 1 },
              { transform: 'translateY(12px)', opacity: 0.3 },
            ],
          },
          triggerType: 'state',
          duration: 2200,
          iterations: Infinity,
          easing: 'ease-in-out',
          fill: 'both',
        },
      ],
    },

    {
      key: 'hero-content',
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      effects: [
        {
          keyframeEffect: {
            name: 'hero-title-in',
            keyframes: [
              { opacity: 0, transform: 'translateY(40px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          triggerType: 'once',
          duration: 1000,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
      ],
    },

    {
      key: 'driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'hero-content',
          keyframeEffect: {
            name: 'hero-title-out',
            keyframes: [{ opacity: 1 }, { opacity: 0 }],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 15, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },

    {
      key: 'driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 's2-title',
          keyframeEffect: {
            name: 's2-title-float',
            keyframes: [
              { opacity: 0, transform: 'translateY(80px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 65, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 95, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
        {
          key: 's2-subtitles',
          keyframeEffect: {
            name: 's2-subs-float',
            keyframes: [
              { opacity: 0, transform: 'translateY(60px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 75, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      ],
    },
  ],
};
```
