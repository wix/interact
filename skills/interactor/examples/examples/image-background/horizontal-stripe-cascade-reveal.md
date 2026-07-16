# Horizontal Stripe Cascade Reveal

On scroll, 20 alternating horizontal white stripes slide in from opposite sides to cover the hero image, while the image zooms and blurs, then a second section fades up into view.

**Tags:** viewProgress, viewEnter, stagger, reveal, opacity, transform, filter, blur, fade, fixed

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

<div class="stripes" id="stripes">
  <interact-element data-interact-key="h1"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h2"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h3"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h4"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h5"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h6"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h7"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h8"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h9"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h10"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h11"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h12"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h13"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h14"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h15"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h16"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h17"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h18"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h19"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="h20"><div class="stripe"></div></interact-element>
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

.stripes {
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  overflow: clip;
  pointer-events: none;
}

.stripes interact-element {
  flex: 1;
  min-height: 0;
}

.stripe {
  width: 100%;
  height: 100%;
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
const COUNT = 20;

const stripeEffects = [];
const staggerStep = 2;
const duration = 50;
for (let i = 1; i <= COUNT; i++) {
  const startPct = (i - 1) * staggerStep;
  const endPct = startPct + duration;
  const dir = i % 2 === 1 ? '-110%' : '110%';
  stripeEffects.push({
    key: `h${i}`,
    keyframeEffect: {
      name: `h${i}-slide`,
      keyframes: [{ transform: `translateX(${dir})` }, { transform: 'translateX(0)' }],
    },
    rangeStart: { name: 'entry', offset: { value: startPct, unit: 'percentage' } },
    rangeEnd: { name: 'entry', offset: { value: Math.min(endPct, 100), unit: 'percentage' } },
    easing: EASE_OUT,
    fill: 'both',
  });
}

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
          key: 'hero-content',
          keyframeEffect: {
            name: 'hero-title-out',
            keyframes: [{ opacity: 1 }, { opacity: 0 }],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 15, unit: 'percentage' } },
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

        ...stripeEffects,

        {
          key: 's2-title',
          keyframeEffect: {
            name: 's2-title-float',
            keyframes: [
              { opacity: 0, transform: 'translateY(80px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 70, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 92, unit: 'percentage' } },
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
          rangeStart: { name: 'entry', offset: { value: 78, unit: 'percentage' } },
          rangeEnd: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
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
          duration: 2200,
          iterations: Infinity,
          easing: 'ease-in-out',
          fill: 'both',
          triggerType: 'state',
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
          duration: 1000,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
          triggerType: 'once',
        },
      ],
    },
  ],
};
```
