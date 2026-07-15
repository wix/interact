# Pointer Scale Scroll Blur

A portrait image scales toward the mouse pointer via the ScaleMouse preset on pointer movement and blurs out progressively as the page scrolls, while a call-to-action link brightens on hover.

**Tags:** pointerMove, viewProgress, hover, scale, blur, filter, sticky, transform, opacity

## Markup

```html
<interact-element data-interact-key="scroll-area">
  <div class="scroll-area">
    <section class="section">
      <span class="header">Marcus Elijah — Visual Artist & Creative Director</span>
      <div class="left-content">
        <span class="hero-text">MARCUS ELIJAH — A JOURNEY THROUGH LIGHT SHADOW AND THE QUIET POWER OF SELF EXPRESSION</span>
      </div>
      <interact-element data-interact-key="photo-scroll">
        <div class="photo-container">
          <interact-element data-interact-key="photo">
            <div class="image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=800&q=80"
                alt="Portrait"
              />
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
* { margin: 0; padding: 0; box-sizing: border-box; }

interact-element { display: block; }

body {
  background: #ffffff;
  font-family: system-ui, sans-serif;
}

.scroll-area {
  height: 200vh;
}

.section {
  position: sticky;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8vw;
}

.left-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 50%;
}

.hero-text {
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 300;
  font-size: clamp(2.8rem, 5vw, 5rem);
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.85);
  letter-spacing: 0.02em;
  line-height: 1.05;
  text-align: left;
  user-select: none;
  pointer-events: none;
}

.header {
  position: absolute;
  top: 40px;
  left: 8vw;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 1rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.9);
}

.bottom-link {
  position: absolute;
  bottom: 40px;
  left: 8vw;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.bottom-link a {
  color: rgba(0, 0, 0, 0.7);
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  padding-bottom: 2px;
}

.image-wrapper {
  position: relative;
  width: clamp(200px, 22vw, 274px);
  aspect-ratio: 274 / 342;
  border-radius: 0;
  overflow: visible;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

@media (max-width: 768px) {
  .section {
    flex-direction: column;
    justify-content: center;
    gap: 2rem;
    padding: 0 24px;
  }

  .left-content {
    max-width: 100%;
  }

  .hero-text {
    font-size: clamp(2.5rem, 9vw, 4rem);
    text-align: center;
  }

  .header {
    top: 24px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 0.75rem;
  }

  .bottom-link {
    bottom: 24px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 0.75rem;
  }

  .image-wrapper {
    width: clamp(140px, 38vw, 200px);
  }
}

@media (max-width: 480px) {
  .hero-text {
    font-size: clamp(2rem, 8vw, 3rem);
  }

  .header {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
  }
}
```

## Interact config

```js
{
  interactions: [
    {
      key: 'scroll-area',
      trigger: 'pointerMove',
      params: { hitArea: 'root' },
      effects: [
        {
          key: 'photo',
          namedEffect: { type: 'ScaleMouse' },
          easing: 'ease-out',
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
            styleProperties: [
              { name: 'color', value: 'rgba(0, 0, 0, 1)' },
              { name: 'border-color', value: 'rgba(0, 0, 0, 0.8)' },
            ],
          },
        },
      ],
    },
  ],
}
```
