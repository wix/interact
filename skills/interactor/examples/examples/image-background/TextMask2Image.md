# Text Mask to Image

As the page is scrolled through a tall sticky section, bold uppercase text scales exponentially via a CSS custom property and mix-blend-mode screen to unmask a background landscape image through the letterforms, while a subtitle fades and slides up from below the viewport.

**Tags:** viewProgress, sticky, transform, opacity, scale, reveal, fade

## Markup

```html
<interact-element data-interact-key="scroll-section">
  <section class="scroll-section">
    <div class="sticky-container">
      <div class="bg-image"></div>
      <interact-element data-interact-key="text-layer">
        <div class="text-layer">
          <h1 class="mask-text">WONDER</h1>
        </div>
      </interact-element>
      <interact-element data-interact-key="subtitle">
        <p class="subtitle">Every moment holds something extraordinary</p>
      </interact-element>
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
@property --text-scale {
  syntax: '<number>';
  inherits: true;
  initial-value: 1;
}

.scroll-section {
  position: relative;
  height: 600vh;
}

.sticky-container {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  overflow: clip;
}

.bg-image {
  position: absolute;
  inset: 0;
  background-image: url('');
  background-position: center;
  background-size: cover;
}

.text-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  mix-blend-mode: screen;
}

.mask-text {
  color: #000;
  font-size: clamp(1rem, 4vw, 5rem);
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  transform: scale(var(--text-scale));
}

.subtitle {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'text-layer',
          keyframeEffect: {
            name: 'text-zoom',
            keyframes: [
              { '--text-scale': '1', offset: 0 },
              { '--text-scale': '2.5', offset: 0.1 },
              { '--text-scale': '7', offset: 0.2 },
              { '--text-scale': '20', offset: 0.3 },
              { '--text-scale': '55', offset: 0.4 },
              { '--text-scale': '150', offset: 0.5 },
              { '--text-scale': '400', offset: 0.6 },
              { '--text-scale': '800', offset: 0.7 },
              { '--text-scale': '800', offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'subtitle',
          keyframeEffect: {
            name: 'subtitle-slide',
            keyframes: [
              { transform: 'translateY(50vh)', opacity: 0, offset: 0 },
              { transform: 'translateY(50vh)', opacity: 0, offset: 0.7 },
              { transform: 'translateY(15vh)', opacity: 1, offset: 0.8 },
              { transform: 'translateY(0)', opacity: 1, offset: 0.9 },
              { transform: 'translateY(0)', opacity: 1, offset: 1 },
            ],
          },
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },
  ],
};
```
