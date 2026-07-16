# Staggered Stripes Reveal

Sixteen vertical white stripes slide up from below in a left-to-right stagger driven by scroll progress, revealing a dark content section while the hero image zooms and blurs behind them.

**Tags:** viewProgress, viewEnter, fixed, flex, opacity, transform, filter, stagger, reveal, fade, blur

## Markup

```html
<header class="header">
  <div class="header__logo">Nexus</div>
  <div class="header__actions"></div>
</header>

<section class="hero">
  <interact-element data-interact-key="hero-img">
    <div class="hero__img-wrap">
      <img class="hero__img" src="" />
    </div>
  </interact-element>
  <div class="hero__gradient"></div>
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

<div class="stripes">
  <interact-element data-interact-key="s1"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s2"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s3"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s4"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s5"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s6"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s7"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s8"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s9"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s10"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s11"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s12"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s13"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s14"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s15"><div class="stripe"></div></interact-element>
  <interact-element data-interact-key="s16"><div class="stripe"></div></interact-element>
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
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow-x: hidden;
}

interact-element {
  display: block;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 52px;
  mix-blend-mode: difference;
}

.header__logo {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.header__search {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.header__search svg {
  width: 17px;
  height: 17px;
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
  transform-origin: center center;
}

.hero__gradient {
  position: absolute;
  inset: 0;
}

.hero__darken {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.hero__scroll {
  position: absolute;
  bottom: 52px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 0.55rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
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

.hero__title {
  font-size: clamp(3.2rem, 7vw, 5.5rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
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
  pointer-events: none;
}

.stripes interact-element {
  flex: 1;
  min-width: 0;
}

.stripe {
  width: 100%;
  height: 100%;
}

.section-two {
  position: fixed;
  inset: 0;
  z-index: 4;
  padding: 14vh 52px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-content: center;
  pointer-events: none;
}

.section-two a {
  pointer-events: auto;
}

.section-two__left {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 8px;
  padding-right: 64px;
  border-right: 1px solid;
}

.section-two__label {
  font-size: 0.55rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.section-two__title {
  font-size: clamp(3.5rem, 7vw, 6.5rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.section-two__right {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 44px;
  padding-left: 64px;
}

.section-two__intro {
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.6;
  margin-bottom: 24px;
  letter-spacing: -0.01em;
}

.section-two__line {
  font-size: 0.92rem;
  font-weight: 400;
  line-height: 1.85;
  margin-bottom: 0;
}

@media (max-width: 1024px) {
  .section-two {
    gap: 48px;
  }
  .section-two__title {
    font-size: clamp(2.8rem, 6vw, 4.5rem);
  }
}

@media (max-width: 768px) {
  .header {
    padding: 20px 20px;
  }
  .header__logo {
    font-size: 1.3rem;
  }
  .hero__scroll {
    bottom: 28px;
  }
  .hero__content {
    left: 20px;
    right: 20px;
    bottom: 100px;
    max-width: none;
  }
  .hero__title {
    font-size: clamp(2.2rem, 8vw, 3.5rem);
  }
  .section-two {
    padding: 18vh 24px 0;
    grid-template-columns: 1fr;
  }
  .section-two__left {
    border-right: none;
    padding-right: 0;
    padding-bottom: 24px;
    border-bottom: 1px solid;
  }
  .section-two__right {
    padding-left: 0;
    padding-top: 24px;
  }
  .section-two__title {
    font-size: clamp(2.5rem, 10vw, 3.5rem);
  }
  .section-two__intro {
    font-size: 1.05rem;
  }
  .section-two__line {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 16px 16px;
  }
  .hero__content {
    left: 16px;
    right: 16px;
    bottom: 80px;
  }
  .section-two {
    padding: 16vh 16px 0;
  }
  .section-two__label {
    margin-bottom: 16px;
  }
  .section-two__line {
    font-size: 0.8rem;
    line-height: 1.7;
  }
}
```

## Interact config

```js
const EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';

const stripeEffect = (key, startPct, endPct) => ({
  key,
  keyframeEffect: {
    name: `${key}-up`,
    keyframes: [{ transform: 'translateY(100%)' }, { transform: 'translateY(11vh)' }],
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
        stripeEffect('s1', 0.0, 62),
        stripeEffect('s2', 2.5, 64),
        stripeEffect('s3', 5.0, 67),
        stripeEffect('s4', 7.5, 69),
        stripeEffect('s5', 10.0, 72),
        stripeEffect('s6', 12.5, 74),
        stripeEffect('s7', 15.0, 77),
        stripeEffect('s8', 17.5, 79),
        stripeEffect('s9', 20.0, 82),
        stripeEffect('s10', 22.5, 84),
        stripeEffect('s11', 25.0, 87),
        stripeEffect('s12', 27.5, 89),
        stripeEffect('s13', 30.0, 92),
        stripeEffect('s14', 32.5, 94),
        stripeEffect('s15', 35.0, 97),
        stripeEffect('s16', 37.5, 100),
      ],
    },

    {
      key: 'hero-scroll',
      trigger: 'viewEnter',
      effects: [
        {
          triggerType: 'state',
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
        },
      ],
    },

    {
      key: 'hero-content',
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      effects: [
        {
          triggerType: 'once',
          keyframeEffect: {
            name: 'hero-title-in',
            keyframes: [
              { opacity: 0, transform: 'translateY(40px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
          },
          duration: 1000,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
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
