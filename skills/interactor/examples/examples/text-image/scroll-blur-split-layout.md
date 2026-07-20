# Scroll Blur Split Layout

A sticky split-screen layout where scrolling progressively blurs the hero portrait and headline while the link shifts on hover.

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
              <img src="" alt="" />
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
}

.bottom-link {
  position: absolute;
  bottom: 40px;
  left: 8vw;
}

.photo-wrap {
  width: 50%;
}

.right-image {
  width: 100%;
  height: 100vh;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  overflow: clip;
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
  }

  .bottom-link {
    position: relative;
    top: auto;
    left: auto;
    bottom: auto;
    width: 100%;
    text-align: center;
    padding: 0 24px 20px;
  }
}
```

## Interact config

```js
const config = {
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
            styleProperties: [{ name: 'transform', value: 'translateY(-2px)' }],
          },
        },
      ],
    },
  ],
};
```
