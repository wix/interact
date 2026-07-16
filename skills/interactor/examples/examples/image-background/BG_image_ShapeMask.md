# BG Image Shape Mask

A background image zooms out while a black overlay circle-reveals over it as the user scrolls through a tall sticky section, transitioning from a lush photograph to a solid dark background.

**Tags:** viewProgress, sticky, clip-path, transform, scale, reveal, parallax

## Markup

```html
<interact-element data-interact-key="scroll-section">
  <section class="scroll-section" role="region" aria-labelledby="about-heading">
    <div class="sticky-container">
      <interact-element data-interact-key="bg-image" aria-hidden="true">
        <div class="bg-layer bg-image"></div>
      </interact-element>

      <interact-element data-interact-key="bg-black" aria-hidden="true">
        <div class="bg-layer bg-black"></div>
      </interact-element>

      <div class="overlay" aria-hidden="true"></div>

      <div class="content">
        <h2 id="about-heading" class="label">About Us</h2>
        <div class="text-wrap">
          <p class="about-text">
            We build resilient communities<br />
            through <span class="highlight">education</span>, environmental<br />
            <span class="highlight">conservation</span>, and sustainable<br />
            <span class="highlight">agriculture</span> — working alongside<br />
            local leaders across 34 countries.
          </p>
        </div>
        <p class="org-name">Green Horizons Foundation</p>
      </div>
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
.scroll-section {
  position: relative;
  height: 225vh;
}

.sticky-container {
  position: sticky;
  top: 0;
  display: flex;
  width: 100%;
  height: 100vh;
  align-items: center;
  overflow: clip;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
}

.bg-image {
  z-index: 0;
  background-image: url('');
}

.bg-black {
  z-index: 1;
  background: #000;
  clip-path: circle(0% at 50% 50%);
}

.content {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.text-wrap {
  display: flex;
  flex: 1;
  align-items: center;
}
```

## Interact config

```js
const config = {
  conditions: {
    motionAllowed: { type: 'media', predicate: '(prefers-reduced-motion: no-preference)' },
  },
  interactions: [
    {
      key: 'scroll-section',
      trigger: 'viewProgress',
      conditions: ['motionAllowed'],
      effects: [
        {
          key: 'bg-image',
          fill: 'both',
          easing: 'linear',
          keyframeEffect: {
            name: 'zoom-out-image',
            keyframes: [
              { transform: 'scale(1.8)', offset: 0 },
              { transform: 'scale(1.0)', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },
        {
          key: 'bg-black',
          fill: 'both',
          easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
          keyframeEffect: {
            name: 'reveal-black',
            keyframes: [
              { clipPath: 'circle(0% at 50% 50%)', offset: 0 },
              { clipPath: 'circle(150% at 50% 50%)', offset: 1 },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
        },
      ],
    },
  ],
};
```
