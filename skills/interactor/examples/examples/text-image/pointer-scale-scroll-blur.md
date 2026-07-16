# Pointer Scale Scroll Blur

A portrait image scales toward the pointer, blurs as the page scrolls, and shifts its call-to-action link on hover.

**Tags:** pointerMove, viewProgress, hover, scale, blur, filter, sticky, transform, opacity

## Markup

```html
<interact-element data-interact-key="scroll-area">
  <div class="scroll-area">
    <section class="section">
      <span class="header">Marcus Elijah — Visual Artist & Creative Director</span>
      <div class="left-content">
        <span class="hero-text">SAMPLE TEXT FOR THE ANIMATED LAYOUT.</span>
      </div>
      <interact-element data-interact-key="photo-scroll">
        <div class="photo-container">
          <interact-element data-interact-key="photo">
            <div class="image-wrapper">
              <img src="" alt="" />
            </div>
          </interact-element>
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
  justify-content: space-between;
  padding: 0 8vw;
}

.left-content {
  max-width: 50%;
}

.hero-text {
  pointer-events: none;
}

.header {
  position: absolute;
  top: 40px;
  left: 8vw;
}

.bottom-link {
  position: absolute;
  bottom: 40px;
  left: 8vw;
}

.image-wrapper {
  width: clamp(200px, 22vw, 274px);
  aspect-ratio: 274 / 342;
}

.image-wrapper img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .section {
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    padding-inline: 24px;
  }

  .left-content {
    max-width: 100%;
  }

  .header {
    top: 24px;
    left: 0;
    width: 100%;
    text-align: center;
  }

  .bottom-link {
    bottom: 24px;
    left: 0;
    width: 100%;
    text-align: center;
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
          namedEffect: { type: 'ScaleMouse' },
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
          key: 'photo-scroll',
          keyframeEffect: {
            name: 'blur-out',
            keyframes: [
              { filter: 'blur(0px)', offset: 0 },
              { filter: 'blur(20px)', offset: 1 },
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
