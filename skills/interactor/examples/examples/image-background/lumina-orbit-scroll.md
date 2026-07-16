# Lumina Orbit Scroll

A full-viewport hero image shrinks, tilts in 3D, and fades out as the user scrolls through a sticky 500vh track, while the overlaid title and subtitle softly recede upward.

**Tags:** viewProgress, sticky, transform, filter, opacity, border-radius, scale, rotate, 3d, fade, reveal, parallax

## Markup

```html
<interact-element data-interact-key="track">
  <section class="sticky-track">
    <div class="sticky-frame">
      <div class="image-wrapper">
        <img src="" />
        <div class="hero-content">
          <h1>Ethereal</h1>
          <p>Between silence and light</p>
          <a href="#" class="cta-btn">Explore</a>
        </div>
      </div>
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
}

.sticky-track {
  position: relative;
  height: 500vh;
}

.sticky-frame {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  overflow: clip;
}

.image-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
}

.image-wrapper img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}

.hero-content {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.cta-btn {
  display: inline-block;
  pointer-events: auto;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'track',
      trigger: 'viewProgress',
      effects: [
        {
          selector: 'img',
          keyframeEffect: {
            name: 'orbit-image',
            keyframes: [
              {
                transform: 'scale(1.1) perspective(1500px) rotateX(0deg) rotateY(0deg)',
                borderRadius: '0px',
                filter: 'brightness(0.5) saturate(1.3) grayscale(0) sepia(0)',
                opacity: '1',
                offset: 0,
              },
              {
                transform: 'scale(0.65) perspective(1500px) rotateX(12deg) rotateY(-15deg)',
                borderRadius: '20px',
                filter: 'brightness(0.75) saturate(1.1) grayscale(0) sepia(0.1)',
                opacity: '1',
                offset: 0.35,
              },
              {
                transform: 'scale(0.4) perspective(1500px) rotateX(-8deg) rotateY(12deg)',
                borderRadius: '28px',
                filter: 'brightness(0.8) saturate(0.9) grayscale(0) sepia(0.2)',
                opacity: '1',
                offset: 0.5,
              },
              {
                transform: 'scale(0.2) perspective(1500px) rotateX(0deg) rotateY(0deg)',
                borderRadius: '32px',
                filter: 'brightness(0.5) saturate(0.3) grayscale(0.4) sepia(0.4)',
                opacity: '0.6',
                offset: 0.75,
              },
              {
                transform: 'scale(0.01) perspective(1500px) rotateX(0deg) rotateY(0deg)',
                borderRadius: '32px',
                filter: 'brightness(0.3) saturate(0.2) grayscale(0.6) sepia(0.5)',
                opacity: '0',
                offset: 1,
              },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
        {
          selector: 'h1',
          keyframeEffect: {
            name: 'title-reveal',
            keyframes: [
              { opacity: '1', transform: 'translateY(0) scale(1)', offset: 0 },
              { opacity: '1', transform: 'translateY(0) scale(1)', offset: 0.7 },
              { opacity: '0.7', transform: 'translateY(-20px) scale(0.95)', offset: 1 },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
        {
          selector: '.hero-content p',
          keyframeEffect: {
            name: 'subtitle-fade',
            keyframes: [
              { opacity: '1', transform: 'translateY(0)', offset: 0 },
              { opacity: '1', transform: 'translateY(0)', offset: 0.7 },
              { opacity: '0.5', transform: 'translateY(-10px)', offset: 1 },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },
  ],
};
```
