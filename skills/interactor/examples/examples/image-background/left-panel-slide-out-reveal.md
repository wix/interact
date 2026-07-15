# Left Panel Slide Out Reveal

A white square panel overlays a blurred hero image at page load; as the user scrolls, the panel slides left off screen while the panel's text fades out and the hero image simultaneously sharpens and zooms back to full size.

**Tags:** viewProgress, fixed, opacity, transform, filter, reveal, fade, blur, scale

## Markup

```html
<header class="header">
  <div class="header__logo">Nexus</div>
  <div class="header__actions"></div>
</header>

<section class="hero">
  <interact-element data-interact-key="hero-img">
    <div class="hero__img-wrap">
      <img
        class="hero__img"
        src="IMAGE_URL"
        alt=""
      />
    </div>
  </interact-element>
  <div class="hero__gradient"></div>
  <interact-element data-interact-key="hero-darken">
    <div class="hero__darken"></div>
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
      <h2 class="section-two__title">Built<br/>Different.</h2>
    </div>
  </interact-element>

  <div class="section-two__rule"></div>

  <interact-element data-interact-key="s2-subtitles">
    <p class="section-two__intro">Performance without compromise. Architecture without limits. Next-generation silicon delivering unprecedented power per watt — unified memory, silent thermals, and all-day battery. Every component engineered to disappear so all you experience is absolute focus.</p>
  </interact-element>
</section>
```

## Essential styles

```css
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #000;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

interact-element { display: block; }

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
  color: #fff;
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
  background: none;
  border: none;
  color: inherit;
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
  background:
    linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%),
    linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.35) 100%);
}

.hero__darken {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
}

.spacer { height: 100vh; }

.driver { height: 120vh; }

.circle-wrap {
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 5vh;
  pointer-events: none;
}

.circle-wrap interact-element {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
}

.circle {
  width: 80vh;
  height: 80vh;
  aspect-ratio: 1;
  flex-shrink: 0;
  border-radius: 0;
  background: #fff;
  transform-origin: left center;
}

.section-two {
  position: fixed;
  z-index: 4;
  top: 50%;
  left: 5vh;
  transform: translateY(-50%);
  width: 80vh;
  height: 80vh;
  color: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8vh;
  pointer-events: none;
}

.section-two a { pointer-events: auto; }

.section-two__label {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #999;
  margin-bottom: 3vh;
}

.section-two__title {
  font-size: clamp(3rem, 7.5vh, 6.5rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #000;
  margin-bottom: 4vh;
}

.section-two__rule {
  width: 40px;
  height: 1px;
  background: rgba(0,0,0,0.15);
  margin-bottom: 4vh;
}

.section-two__intro {
  font-size: clamp(0.95rem, 1.7vh, 1.2rem);
  font-weight: 400;
  line-height: 1.8;
  color: #555;
  max-width: 48ch;
  letter-spacing: 0.005em;
}

@media (max-width: 1024px) {
  .section-two__title { font-size: clamp(2.5rem, 6vh, 4.5rem); }
  .section-two { padding: 6vh; }
}

@media (max-width: 768px) {
  .header { padding: 20px 20px; }
  .header__logo { font-size: 1.3rem; }
  .circle-wrap { justify-content: center; padding-left: 0; }
  .circle-wrap interact-element { justify-content: center; }
  .circle { width: 88vw; height: 88vw; transform-origin: center center; }
  .section-two {
    left: 50%;
    transform: translate(-50%, -50%);
    width: 88vw;
    height: 88vw;
    padding: 7vw;
  }
  .section-two__title { font-size: clamp(2.2rem, 8vw, 3.5rem); }
  .section-two__intro { font-size: 0.95rem; max-width: none; }
}

@media (max-width: 480px) {
  .header { padding: 16px 16px; }
  .circle { width: 92vw; height: 92vw; }
  .section-two { width: 92vw; height: 92vw; padding: 6vw; }
  .section-two__title { font-size: clamp(2rem, 9vw, 3rem); }
  .section-two__intro { font-size: 0.85rem; line-height: 1.65; }
  .section-two__label { margin-bottom: 2vh; }
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
          rangeEnd:   { name: 'entry', offset: { value: 18, unit: 'percentage' } },
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
          rangeEnd:   { name: 'entry', offset: { value: 25, unit: 'percentage' } },
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
          rangeEnd:   { name: 'entry', offset: { value: 85, unit: 'percentage' } },
          easing: EASE_OUT,
          fill: 'both',
        },
        {
          key: 'hero-img',
          keyframeEffect: {
            name: 'img-settle',
            keyframes: [
              { transform: 'scale(1.1)' },
              { transform: 'scale(1)' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 30, unit: 'percentage' } },
          rangeEnd:   { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          easing: 'ease-out',
          fill: 'both',
        },
        {
          key: 'hero-img',
          keyframeEffect: {
            name: 'img-unblur',
            keyframes: [
              { filter: 'blur(14px)' },
              { filter: 'blur(0px)' },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 10, unit: 'percentage' } },
          rangeEnd:   { name: 'entry', offset: { value: 80, unit: 'percentage' } },
          easing: 'ease-out',
          fill: 'both',
          composite: 'add',
        },
      ],
    },
  ],
};
```
