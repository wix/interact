# Manifest Expand Scroll

A sticky image panel expands from a small bottom-left corner position to fill the full viewport as the user scrolls, while the title, text columns, and image fade up individually on page entry.

**Tags:** viewProgress, viewEnter, sticky, opacity, transform, reveal, scale, stagger, fade

## Markup

```html
<interact-element data-interact-key="page">
  <section class="sticky-track">
    <div class="sticky-frame">
      <interact-element data-interact-key="title">
        <div class="title-wrap">
          <div class="title-area">
            <h1>MANIFEST<sup>®</sup></h1>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="text-cols">
        <div class="text-wrap">
          <div class="text-columns">
            <div class="text-col">
              <p>Design studio<br />focused on brand<br />identity & digital<br />experiences</p>
            </div>
            <div class="text-col">
              <p>Founded 2019<br />New York, Paris<br />& Tokyo</p>
            </div>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="image-box">
        <div class="image-wrap">
          <div class="image-container">
            <img src="" />
          </div>
        </div>
      </interact-element>
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
  height: 400vh;
}

.sticky-frame {
  position: sticky;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow: clip;
}

.title-wrap {
  position: absolute;
  top: 40px;
  left: 40px;
  z-index: 10;
}

[data-interact-key='title'] {
  opacity: 0;
  transform: translateY(40px);
}

.text-wrap {
  position: absolute;
  top: 25vh;
  left: 40px;
  z-index: 10;
}

[data-interact-key='text-cols'] {
  opacity: 0;
  transform: translateY(30px);
}

.text-columns {
  display: flex;
  gap: 40px;
}

.text-col {
  max-width: 140px;
}

.image-wrap {
  position: absolute;
  top: calc(60% - 24px);
  right: calc(75% - 24px);
  bottom: 24px;
  left: 24px;
}

[data-interact-key='image-box'] {
  opacity: 0;
  transform: translateY(60px);
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: clip;
}

.image-container img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'page',
      trigger: 'viewEnter',
      sequences: [
        {
          offset: 225,
          triggerType: 'once',
          effects: [
            {
              key: 'title',
              keyframeEffect: {
                name: 'title-in',
                keyframes: [
                  { opacity: '0', transform: 'translateY(40px)', offset: 0 },
                  { opacity: '1', transform: 'translateY(0)', offset: 1 },
                ],
              },
              duration: 1000,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            },
            {
              key: 'text-cols',
              keyframeEffect: {
                name: 'text-in',
                keyframes: [
                  { opacity: '0', transform: 'translateY(30px)', offset: 0 },
                  { opacity: '1', transform: 'translateY(0)', offset: 1 },
                ],
              },
              duration: 900,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            },
            {
              key: 'image-box',
              keyframeEffect: {
                name: 'image-in',
                keyframes: [
                  { opacity: '0', transform: 'translateY(60px)', offset: 0 },
                  { opacity: '1', transform: 'translateY(0)', offset: 1 },
                ],
              },
              duration: 1100,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            },
          ],
        },
      ],
    },
    {
      key: 'page',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'image-box',
          selector: '.image-wrap',
          keyframeEffect: {
            name: 'container-expand',
            keyframes: [
              { top: 'calc(60% - 24px)', right: 'calc(75% - 24px)', offset: 0 },
              { top: 'calc(60% - 24px)', right: '24px', offset: 0.5 },
              { top: '24px', right: '24px', offset: 1 },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'image-box',
          selector: '.image-container img',
          keyframeEffect: {
            name: 'image-zoom-out',
            keyframes: [
              { transform: 'scale(1.25)', offset: 0 },
              { transform: 'scale(1)', offset: 1 },
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
