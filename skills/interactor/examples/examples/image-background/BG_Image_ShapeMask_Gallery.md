# Background Image Shape Mask Gallery

A sticky full-viewport section where three background images circle-reveal sequentially as the user scrolls, each scaling in while the previous blurs out.

**Tags:** viewProgress, sticky, gallery, clip-path, transform, filter, blur, reveal, scale

## Markup

```html
<interact-element data-interact-key="scroll-section">
  <section class="scroll-section" role="region" aria-labelledby="about-heading">
    <div class="sticky-container">
      <interact-element data-interact-key="bg-idle" aria-hidden="true">
        <div class="bg-layer bg-idle"></div>
      </interact-element>

      <interact-element data-interact-key="bg-education" aria-hidden="true">
        <div class="bg-layer bg-education"></div>
      </interact-element>

      <interact-element data-interact-key="bg-conservation" aria-hidden="true">
        <div class="bg-layer bg-conservation"></div>
      </interact-element>

      <interact-element data-interact-key="bg-agriculture" aria-hidden="true">
        <div class="bg-layer bg-agriculture"></div>
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
  height: 500vh;
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

.bg-idle {
  z-index: 0;
  background-image: url('');
}

.bg-education,
.bg-conservation,
.bg-agriculture {
  clip-path: circle(0% at 50% 50%);
}

.bg-education {
  z-index: 1;
  background-image: url('');
}

.bg-conservation {
  z-index: 2;
  background-image: url('');
}

.bg-agriculture {
  z-index: 3;
  background-image: url('');
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
          key: 'bg-education',
          fill: 'both',
          easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
          keyframeEffect: {
            name: 'reveal-education',
            keyframes: [
              { clipPath: 'circle(0% at 50% 50%)', transform: 'scale(1.2)', offset: 0 },
              { clipPath: 'circle(0% at 50% 50%)', transform: 'scale(1.17)', offset: 0.1 },
              { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.06)', offset: 0.33 },
              { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },

        {
          key: 'bg-conservation',
          fill: 'both',
          easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
          keyframeEffect: {
            name: 'reveal-conservation',
            keyframes: [
              { clipPath: 'circle(0% at 50% 50%)', transform: 'scale(1.2)', offset: 0 },
              { clipPath: 'circle(0% at 50% 50%)', transform: 'scale(1.09)', offset: 0.38 },
              { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.02)', offset: 0.62 },
              { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },

        {
          key: 'bg-agriculture',
          fill: 'both',
          easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
          keyframeEffect: {
            name: 'reveal-agriculture',
            keyframes: [
              { clipPath: 'circle(0% at 50% 50%)', transform: 'scale(1.15)', offset: 0 },
              { clipPath: 'circle(0% at 50% 50%)', transform: 'scale(1.08)', offset: 0.66 },
              { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)', offset: 0.9 },
              { clipPath: 'circle(150% at 50% 50%)', transform: 'scale(1.0)', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },

        {
          key: 'bg-idle',
          fill: 'both',
          easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
          keyframeEffect: {
            name: 'blur-idle',
            keyframes: [
              { filter: 'blur(0px)', offset: 0 },
              { filter: 'blur(0px)', offset: 0.1 },
              { filter: 'blur(30px)', offset: 0.33 },
              { filter: 'blur(30px)', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },

        {
          key: 'bg-education',
          fill: 'both',
          easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
          keyframeEffect: {
            name: 'blur-education',
            keyframes: [
              { filter: 'blur(0px)', offset: 0 },
              { filter: 'blur(0px)', offset: 0.38 },
              { filter: 'blur(30px)', offset: 0.62 },
              { filter: 'blur(30px)', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },

        {
          key: 'bg-conservation',
          fill: 'both',
          easing: 'cubic-bezier(0.37, 0, 0.63, 1)',
          keyframeEffect: {
            name: 'blur-conservation',
            keyframes: [
              { filter: 'blur(0px)', offset: 0 },
              { filter: 'blur(0px)', offset: 0.66 },
              { filter: 'blur(30px)', offset: 0.9 },
              { filter: 'blur(30px)', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },
      ],
    },
  ],
};
```
