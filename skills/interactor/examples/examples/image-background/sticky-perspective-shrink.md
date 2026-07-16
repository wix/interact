# Sticky Perspective Shrink

A full-viewport image stays sticky while the user scrolls, shrinking and tilting in 3D perspective before settling flat and fading to grayscale.

**Tags:** viewProgress, sticky, transform, filter, border-radius, scale, 3d, parallax

## Markup

```html
<interact-element data-interact-key="track">
  <section class="sticky-track">
    <div class="sticky-frame">
      <img src="" />
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
}

body {
  overflow-x: clip;
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

.sticky-frame img {
  display: block;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
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
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },
  ],
};
```
