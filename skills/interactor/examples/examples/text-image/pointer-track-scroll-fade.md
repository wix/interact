# Pointer Track Scroll Fade

A portrait photo tracks the pointer while fading out on scroll, and the bottom link shifts on hover.

**Tags:** pointerMove, viewProgress, hover, sticky, opacity, transform, fade, parallax

## Markup

```html
<interact-element data-interact-key="scroll-area">
  <div class="scroll-area">
    <section class="section">
      <span class="header">Marcus Elijah — Visual Artist & Creative Director</span>
      <span class="hero-text">SAMPLE TEXT FOR THE ANIMATED LAYOUT.</span>
      <interact-element data-interact-key="photo">
        <div class="image-wrapper">
          <img src="" alt="" />
        </div>
      </interact-element>
      <interact-element data-interact-key="link">
        <span class="bottom-link"><a href="#">Explore His Work</a></span>
      </interact-element>
    </section>
  </div>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
}

.scroll-area {
  height: 200vh;
}

.section {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-text {
  position: absolute;
  text-align: center;
  max-width: 80vw;
  pointer-events: none;
}

.header {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  text-align: center;
}

.bottom-link {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  text-align: center;
}

.image-wrapper {
  width: clamp(200px, 22vw, 274px);
  aspect-ratio: 274 / 342;
  overflow: clip;
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .hero-text {
    max-width: 90vw;
    padding-inline: 20px;
  }

  .header {
    top: 24px;
    padding-inline: 20px;
  }

  .bottom-link {
    bottom: 24px;
  }

  .image-wrapper {
    width: clamp(140px, 38vw, 200px);
  }
}
```

## Interact config

```js
const config = {
  conditions: {
    hoverDevice: { type: 'media', predicate: '(hover: hover) and (pointer: fine)' },
  },
  interactions: [
    {
      key: 'scroll-area',
      trigger: 'pointerMove',
      params: { hitArea: 'root' },
      conditions: ['hoverDevice'],
      effects: [
        {
          key: 'photo',
          namedEffect: { type: 'TrackMouse' },
          easing: 'ease-out',
          fill: 'both',
        },
      ],
    },
    {
      key: 'scroll-area',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'photo',
          keyframeEffect: {
            name: 'fade-out',
            keyframes: [
              { opacity: 1, offset: 0 },
              { opacity: 0, offset: 1 },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },
    {
      key: 'link',
      trigger: 'hover',
      effects: [
        {
          transition: {
            duration: 300,
            easing: 'ease',
            styleProperties: [{ name: 'transform', value: 'translateY(-2px)' }],
          },
        },
      ],
    },
  ],
};
```
