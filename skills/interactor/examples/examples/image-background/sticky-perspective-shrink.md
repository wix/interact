# Sticky Perspective Shrink

A full-viewport image stays sticky while the user scrolls, shrinking and tilting in 3D perspective before settling flat and fading to grayscale.

**Tags:** viewProgress, sticky, transform, filter, border-radius, scale, 3d, parallax

## Markup

```html
<interact-element data-interact-key="track">
  <section class="sticky-track">
    <div class="hero-copy">
      <div class="hero-copy-inner">
        <h1>Structure</h1>
        <p>Where light meets form</p>
      </div>
    </div>
    <div class="sticky-frame">
      <img
        src=""
      />
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

interact-element { display: block; }

body {
  overflow-x: hidden;
}

.sticky-track {
  height: 500vh;
  position: relative;
}

.sticky-frame {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: clip;
}

.sticky-frame img {
  display: block;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}

.hero-copy {
  position: sticky;
  top: 0;
  height: 0;
  z-index: 10;
  pointer-events: none;
}

.hero-copy-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
  text-align: center;
  padding: 0 24px;
}

.hero-copy h1 {
  font-size: clamp(3.5rem, 10vw, 9rem);
  font-weight: 300;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.hero-copy p {
  font-size: clamp(1.125rem, 2.2vw, 1.5rem);
  font-weight: 400;
  letter-spacing: 0.12em;
  line-height: 1.6;
  text-transform: uppercase;
}
```

## Interact config

```js
{
  interactions: [
    {
      key: 'track',
      trigger: 'viewProgress',
      effects: [
        {
          selector: 'img',
          keyframeEffect: {
            name: 'shrink-tilt-fade',
            keyframes: [
              {
                transform: 'scale(1) perspective(1200px) rotateX(0deg)',
                borderRadius: '0px',
                filter: 'brightness(0.7) grayscale(0)',
                offset: 0,
              },
              {
                transform: 'scale(0.55) perspective(1200px) rotateX(30deg)',
                borderRadius: '24px',
                filter: 'brightness(0.7) grayscale(0)',
                offset: 0.35,
              },
              {
                transform: 'scale(0.4) perspective(1200px) rotateX(0deg)',
                borderRadius: '32px',
                filter: 'brightness(0.7) grayscale(0)',
                offset: 0.6,
              },
              {
                transform: 'scale(0.4) perspective(1200px) rotateX(0deg)',
                borderRadius: '32px',
                filter: 'brightness(0.7) grayscale(1)',
                offset: 1,
              },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd:   { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },
  ],
}
```
