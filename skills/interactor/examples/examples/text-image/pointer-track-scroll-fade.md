# Pointer Track Scroll Fade

A portrait photo tracks the mouse pointer via the TrackMouse preset while fading out as the user scrolls through a sticky section, with a hover color transition on the bottom link.

**Tags:** pointerMove, viewProgress, hover, sticky, opacity, transform, fade, parallax

## Markup

```html
<interact-element data-interact-key="scroll-area">
  <div class="scroll-area">
    <section class="section">
      <span class="header">Marcus Elijah — Visual Artist & Creative Director</span>
      <span class="hero-text">MARCUS ELIJAH — A JOURNEY THROUGH LIGHT SHADOW AND THE QUIET POWER OF SELF EXPRESSION</span>
      <interact-element data-interact-key="photo">
        <div class="image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=800&q=80"
            alt="Portrait"
          />
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
  justify-content: center;
}

.hero-text {
  position: absolute;
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 300;
  font-size: clamp(2.8rem, 7vw, 6rem);
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.85);
  letter-spacing: 0.02em;
  line-height: 1.05;
  text-align: center;
  max-width: 80vw;
  user-select: none;
  pointer-events: none;
}

.header {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  text-align: center;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 1rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.9);
}

.bottom-link {
  position: absolute;
  bottom: 40px;
  left: 0;
  width: 100%;
  text-align: center;
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
  overflow: clip;
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
  .hero-text {
    font-size: clamp(3rem, 10vw, 5rem);
    max-width: 90vw;
    padding: 0 20px;
  }

  .header {
    top: 24px;
    font-size: 0.75rem;
    padding: 0 20px;
  }

  .bottom-link {
    bottom: 24px;
    font-size: 0.75rem;
  }

  .image-wrapper {
    width: clamp(140px, 38vw, 200px);
  }
}

@media (max-width: 480px) {
  .hero-text {
    font-size: clamp(2.5rem, 9vw, 4rem);
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
          namedEffect: { type: 'TrackMouse' },
          easing: 'ease-out',
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
