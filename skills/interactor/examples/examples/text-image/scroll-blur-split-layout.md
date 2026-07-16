# Scroll Blur Split Layout

A sticky split-screen layout where scrolling progressively blurs the hero portrait and headline text, with a subtle hover transition on the navigation link.

**Tags:** viewProgress, hover, sticky, flex, filter, blur

## Markup

```html
<interact-element data-interact-key="scroll-area">
  <div class="scroll-area">
    <section class="section">
      <span class="header">Marcus Elijah — Visual Artist & Creative Director</span>
      <div class="left-content">
        <interact-element data-interact-key="text">
          <span class="hero-text">SAMPLE TEXT FOR THE ANIMATED LAYOUT.</span>
        </interact-element>
      </div>
      <interact-element data-interact-key="link">
        <span class="bottom-link"><a href="#">Explore His Work</a></span>
      </interact-element>
      <div class="photo-wrap">
        <interact-element data-interact-key="photo">
          <div class="right-image">
            <div class="image-wrapper">
              <img src="" />
            </div>
          </div>
        </interact-element>
      </div>
    </section>
  </div>
</interact-element>
```

## Essential styles

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

interact-element {
  display: block;
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
  align-items: stretch;
}

.left-content {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 6vw;
}

.header {
  position: absolute;
  top: 40px;
  left: 8vw;
  font-size: 1rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.hero-text {
  font-weight: 400;
  font-size: clamp(2.8rem, 5vw, 5rem);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.05;
  text-align: left;
}

.bottom-link {
  position: absolute;
  bottom: 40px;
  left: 8vw;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.bottom-link a {
  border-bottom: 1px solid;
  padding-bottom: 2px;
}

.photo-wrap {
  width: 50vw;
  height: 100vh;
}

.right-image {
  width: 50vw;
  height: 100vh;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  overflow: clip;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
}

@media (max-width: 768px) {
  .section {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
  }

  .header {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    text-align: center;
    font-size: 0.7rem;
    padding: 20px 24px 0;
  }

  .photo-wrap {
    order: -1;
    width: 100%;
    height: 50vh;
  }

  .right-image {
    width: 100%;
    height: 50vh;
  }

  .left-content {
    width: 100%;
    padding: 1.5rem 24px;
    justify-content: flex-start;
  }

  .hero-text {
    font-size: clamp(1.8rem, 7vw, 2.8rem);
    text-align: center;
  }

  .bottom-link {
    position: relative;
    top: auto;
    left: auto;
    bottom: auto;
    width: 100%;
    text-align: center;
    font-size: 0.75rem;
    padding: 0 24px 20px;
  }
}

@media (max-width: 480px) {
  .hero-text {
    font-size: clamp(1.5rem, 6vw, 2.2rem);
  }
}
```

## Interact config

```js
{
  interactions: [
    {
      key: 'scroll-area',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'photo',
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
        {
          key: 'text',
          keyframeEffect: {
            name: 'blur-out-text',
            keyframes: [
              { filter: 'blur(0px)', offset: 0 },
              { filter: 'blur(10px)', offset: 1 },
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
            { name: 'transform', value: 'translateY(-2px)' }
          ],
          },
        },
      ],
    },
  ],
}
```
