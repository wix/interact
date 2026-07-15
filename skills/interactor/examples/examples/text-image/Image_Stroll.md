# Image Stroll

As the page scrolls, a portrait image travels from a small inset position to fill half the viewport while bio text words fade and rise into view one by one, all scroll-driven across a tall sticky about-section.

**Tags:** viewProgress, sticky, grid, parallax, stagger, fade, reveal, transform, opacity

## Markup

```html
<div class="spacer">Scroll down</div>

<interact-element data-interact-key="about-section">
  <section class="about">

    <div class="lines-layer">
      <div class="lines-sticky">
        <div class="grid-line line-1"></div>
        <div class="grid-line line-2"></div>
        <div class="grid-line line-3"></div>
      </div>
    </div>

    <div class="image-layer">
      <div class="image-sticky">
        <interact-element data-interact-key="person-image">
          <div class="person-image">
            <img src="IMAGE_URL" alt="Black-and-white portrait">
          </div>
        </interact-element>
        <interact-element data-interact-key="image-overlay">
          <div class="image-overlay" aria-hidden="true"></div>
        </interact-element>
      </div>
    </div>

    <div class="text-container">
      <div class="text-sticky">
        <div class="h-line h-line-top"></div>
        <div class="h-line h-line-bottom"></div>
        <div class="intro-grid">
          <div class="grid-heading">
            <h2>Hi, I'm Jane</h2>
          </div>
          <interact-element data-interact-key="bio-text" class="grid-bio">
            <p class="bio-text">
              <span class="word" data-i="0">Creative</span>
              <span class="word" data-i="1">Director</span>
              <span class="word" data-i="2">&amp;</span>
              <span class="word" data-i="3">Visual</span>
              <span class="word" data-i="4">Designer</span>
              <span class="word" data-i="5">with</span>
              <span class="word" data-i="6">over</span>
              <span class="word" data-i="7">15</span>
              <span class="word" data-i="8">years</span>
              <span class="word" data-i="9">of</span>
              <span class="word" data-i="10">experience</span>
              <span class="word" data-i="11">crafting</span>
              <span class="word" data-i="12">brand</span>
              <span class="word" data-i="13">identities</span>
              <span class="word" data-i="14">and</span>
              <span class="word" data-i="15">immersive</span>
              <span class="word" data-i="16">digital</span>
              <span class="word" data-i="17">experiences</span>
              <span class="word" data-i="18">for</span>
              <span class="word" data-i="19">global</span>
              <span class="word" data-i="20">brands.</span>
            </p>
          </interact-element>
        </div>
      </div>
    </div>

    <div class="detail-container">
      <div class="detail-sticky">
        <div class="detail-grid">
          <div class="detail-text-cell">
            <p>&ldquo;With roots in built space, print, and screen, Jane brings a rare mix of craft and vision to each project. Her work has been noted by Awwwards, Comm Arts, and the Type Club &mdash; and shaped by a drive to make things that feel as good as they look.&rdquo;</p>
            <div class="detail-cta-wrap">
              <a class="detail-cta" href="#">Explore <span class="arrow" aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</interact-element>

<div class="spacer" style="height: 100vh;"></div>
```

## Essential styles

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Instrument Sans', system-ui, sans-serif;
  background: #000;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

.spacer {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.15);
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.about {
  height: 300vh;
  position: relative;
}

.lines-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.lines-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
}

.grid-line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
}

.line-1 { left: 25%; }
.line-2 { left: 50%; }
.line-3 { display: none; }

.image-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.image-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
}

.person-image {
  position: absolute;
  overflow: clip;
  pointer-events: auto;
  left: 50%;
  top: 0;
  width: 50%;
  height: 100%;
}

.detail-cta:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .bio-text .word { opacity: 1 !important; transform: none !important; }
}

.image-overlay { display: none; }

.person-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(1);
}

.text-container {
  height: 170vh;
  position: relative;
  z-index: 1;
}

.text-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
}

.intro-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  height: 100%;
  align-items: start;
  padding-top: calc(8vh + 15px);
}

.grid-heading {
  grid-column: 3 / 5;
  padding: 0 1.5rem;
}

.grid-heading h2 {
  font-size: 39px;
  font-weight: 300;
  letter-spacing: 1px;
  line-height: 0.91;
}

.grid-bio {
  grid-column: 5 / 9;
  padding: 0 1.5rem;
}

.bio-text {
  font-size: 39px;
  line-height: 1.19;
  letter-spacing: 1px;
  color: #fff;
  font-weight: 300;
}

.bio-text .word {
  display: inline-block;
}

.detail-container {
  height: 110vh;
  position: relative;
}

.detail-sticky {
  position: sticky;
  top: 5vh;
  height: 90vh;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  height: 100%;
}

.detail-text-cell {
  grid-column: 1 / 5;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.detail-text-cell p {
  font-size: 47px;
  line-height: 1.25;
  letter-spacing: 1px;
  color: #fff;
  font-weight: 300;
  text-indent: 3em;
}

.h-line {
  position: absolute;
  left: 0;
  width: 100vw;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 3;
  pointer-events: none;
}

.h-line-top { top: 8vh; }
.h-line-bottom { top: 54vh; }

.detail-cta-wrap {
  padding-top: 1.5rem;
  padding-bottom: 1rem;
}

.detail-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  font-size: 24px;
  font-weight: 300;
  letter-spacing: 1px;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  padding: 0.55em 1.4em;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.detail-cta:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.detail-cta .arrow {
  font-size: 0.85em;
  display: inline-block;
  transition: transform 0.3s ease;
}

.detail-cta:hover .arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .about { height: 510vh; }

  .text-sticky { position: sticky; top: 0; height: 100vh; padding-top: 8vh; }

  .text-container { height: 260vh; margin-bottom: 20vh; }

  .detail-container { height: 180vh; }
  .detail-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    padding: calc(67vh - 70px) 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .intro-grid { display: block; padding-top: 0; }
  .grid-heading, .grid-bio { display: block; grid-column: auto; padding: 0 1.25rem; }
  .grid-heading { margin-bottom: 33vh; width: calc(50% - 15px); margin-left: calc(50% + 15px); }
  .grid-heading h2 { font-size: 25px; line-height: 1.05; letter-spacing: 0.5px; }
  .bio-text { font-size: 25px; line-height: 1.35; letter-spacing: 0.3px; }

  .detail-grid { display: block; }
  .detail-text-cell { grid-column: auto; padding: 0 1.25rem; gap: 1.5rem; }
  .detail-text-cell p { font-size: 25px; line-height: 1.35; text-indent: 0; letter-spacing: 0.3px; }
  .detail-cta { font-size: 25px; }
  .detail-cta-wrap { padding-top: 1.25rem; }

  .person-image {
    left: 1.25rem;
    top: 8vh;
    width: calc(50% - 1.25rem);
    height: 32vh;
  }

  .image-overlay {
    display: block;
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
    z-index: 1;
  }

  .text-container   { position: relative; z-index: 1; }
  .detail-container { position: relative; z-index: 7; }

  .h-line { display: none; }
  .lines-layer { z-index: 10; }
  .line-1 { left: 1.25rem; }
  .line-2 { left: 50%; }
  .line-3 { display: block; left: auto; right: 1.25rem; }

  @media (prefers-reduced-motion: reduce) {
    .person-image {
      left: 0 !important; top: 0 !important;
      width: 100% !important; height: 100% !important;
    }
    .image-overlay { opacity: 0.45; }
  }
}
```

## Interact config

```js
const WORD_COUNT = 21;
const WORD_START = 27;
const WORD_STAGGER = 0.65;
const WORD_DURATION = 2;
const LAST_WORD_END = WORD_START + (WORD_COUNT - 1) * WORD_STAGGER + WORD_DURATION;
const IMAGE_START = Math.ceil(LAST_WORD_END) + 1;
const IMAGE_END = IMAGE_START + 20;

const wordEffects = Array.from({ length: WORD_COUNT }, (_, i) => ({
  key: 'bio-text',
  selector: `[data-i="${i}"]`,
  rangeStart: { name: 'cover', offset: { value: WORD_START + i * WORD_STAGGER, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: WORD_START + i * WORD_STAGGER + WORD_DURATION, unit: 'percentage' } },
  fill: 'both',
  easing: 'ease-out',
  keyframeEffect: {
    name: `word-${i}`,
    keyframes: [
      { opacity: '0', transform: 'translateY(20px)' },
      { opacity: '1', transform: 'translateY(0)' },
    ],
  },
}));

const imageMovementMobile = {
  key: 'person-image',
  conditions: ['is-mobile'],
  rangeStart: { name: 'cover', offset: { value: 44, unit: 'percentage' } },
  rangeEnd:   { name: 'cover', offset: { value: 58, unit: 'percentage' } },
  fill: 'both',
  easing: 'linear',
  keyframeEffect: {
    name: 'image-travel-grow-mobile',
    keyframes: [
      { left: '1.25rem', top: '8vh', width: 'calc(50% - 1.25rem)', height: '32vh' },
      { left: '0',       top: '0',   width: '100%',               height: '100%' },
    ],
  },
};

const overlayFadeMobile = {
  conditions: ['is-mobile'],
  key: 'image-overlay',
  rangeStart: { name: 'cover', offset: { value: 50, unit: 'percentage' } },
  rangeEnd:   { name: 'cover', offset: { value: 58, unit: 'percentage' } },
  fill: 'both',
  keyframeEffect: {
    name: 'overlay-fade',
    keyframes: [
      { opacity: '0' },
      { opacity: '0.45' },
    ],
  },
};

const imageMovement = {
  key: 'person-image',
  conditions: ['is-desktop'],
  rangeStart: { name: 'cover', offset: { value: IMAGE_START, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: IMAGE_END, unit: 'percentage' } },
  fill: 'both',
  keyframeEffect: {
    name: 'image-move-grow',
    keyframes: [
      { left: '0%', top: '8%', width: '25%', height: '46%' },
      { left: '50%', top: '0%', width: '50%', height: '100%' },
    ],
  },
};

const imageParallax = {
  key: 'person-image',
  selector: 'img',
  rangeStart: { name: 'cover', offset: { value: IMAGE_START, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: IMAGE_END, unit: 'percentage' } },
  fill: 'both',
  keyframeEffect: {
    name: 'image-parallax',
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
    ],
  },
};

{
  conditions: {
    'motion-ok':  { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    'is-mobile':  { type: 'media', predicate: '(max-width: 768px)' },
    'is-desktop': { type: 'media', predicate: '(min-width: 769px)' },
  },
  interactions: [
    {
      key: 'about-section',
      trigger: 'viewProgress',
      conditions: ['motion-ok'],
      effects: [
        ...wordEffects,
        imageMovement,
        imageMovementMobile,
        overlayFadeMobile,
        imageParallax,
      ],
    },
  ],
}
```
