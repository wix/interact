# Image Stroll

As the page scrolls, a portrait image travels from a small inset position to fill half the viewport while bio text words fade and rise into view one by one, all scroll-driven across a tall sticky about-section.

**Tags:** viewProgress, sticky, grid, parallax, stagger, fade, reveal, transform, opacity

## Markup

```html
<div class="spacer">Scroll down</div>

<interact-element data-interact-key="about-section">
  <section class="about">
    <div class="image-layer">
      <div class="image-sticky">
        <interact-element data-interact-key="person-image">
          <div class="person-image">
            <img src="" alt="" />
          </div>
        </interact-element>
      </div>
    </div>

    <div class="text-container">
      <div class="text-sticky">
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
            <p>Sample text provides enough length to demonstrate this animated content layout.</p>
            <div class="detail-cta-wrap">
              <a class="detail-cta" href="#">Explore</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</interact-element>

<div class="spacer"></div>
```

## Essential styles

```css
.spacer {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.about {
  height: 300vh;
  position: relative;
}

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
  left: 50%;
  top: 0;
  width: 50%;
  height: 100%;
}

.detail-cta:focus-visible {
  outline: 2px solid;
  outline-offset: 3px;
}

.person-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  padding-top: 8vh;
}

.grid-heading {
  grid-column: 3 / 5;
  padding: 0 1.5rem;
}

.grid-bio {
  grid-column: 5 / 9;
  padding: 0 1.5rem;
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

.detail-cta-wrap {
  padding-top: 1.5rem;
}

.detail-cta {
  display: inline-flex;
  align-items: center;
  min-width: 44px;
  min-height: 44px;
}

@media (max-width: 768px) {
  .about {
    height: 510vh;
  }

  .text-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    padding-top: 8vh;
  }

  .text-container {
    height: 260vh;
    margin-bottom: 20vh;
  }

  .detail-container {
    height: 180vh;
  }
  .detail-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    padding: calc(67vh - 70px) 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .intro-grid {
    display: block;
  }

  .grid-heading,
  .grid-bio {
    padding: 0 1.25rem;
  }

  .grid-heading {
    margin-bottom: 33vh;
    width: calc(50% - 15px);
    margin-left: calc(50% + 15px);
  }

  .detail-grid {
    display: block;
  }

  .detail-text-cell {
    padding: 0 1.25rem;
    gap: 1.5rem;
  }

  .person-image {
    left: 1.25rem;
    top: 8vh;
    width: calc(50% - 1.25rem);
    height: 32vh;
  }

  .text-container {
    z-index: 1;
  }

  .detail-container {
    z-index: 7;
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
  rangeStart: {
    name: 'cover',
    offset: { value: WORD_START + i * WORD_STAGGER, unit: 'percentage' },
  },
  rangeEnd: {
    name: 'cover',
    offset: { value: WORD_START + i * WORD_STAGGER + WORD_DURATION, unit: 'percentage' },
  },
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
  rangeEnd: { name: 'cover', offset: { value: 58, unit: 'percentage' } },
  fill: 'both',
  easing: 'linear',
  keyframeEffect: {
    name: 'image-travel-grow-mobile',
    keyframes: [
      { left: '1.25rem', top: '8vh', width: 'calc(50% - 1.25rem)', height: '32vh' },
      { left: '0', top: '0', width: '100%', height: '100%' },
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
    keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }],
  },
};

const config = {
  conditions: {
    'motion-ok': { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
    'is-mobile': { type: 'media', predicate: '(max-width: 768px)' },
    'is-desktop': { type: 'media', predicate: '(min-width: 769px)' },
  },
  interactions: [
    {
      key: 'about-section',
      trigger: 'viewProgress',
      conditions: ['motion-ok'],
      effects: [...wordEffects, imageMovement, imageMovementMobile, imageParallax],
    },
  ],
};
```
