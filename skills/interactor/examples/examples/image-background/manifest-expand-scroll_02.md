# Manifest Expand Scroll

A sticky hero section where the title and text columns fade up on view enter, while the full-bleed image progressively shrinks and shifts to the top-left corner as the user scrolls through the track.

**Tags:** viewEnter, viewProgress, opacity, transform, stagger, reveal, fade, scale, sticky

## Markup

```html
<interact-element data-interact-key="page">
  <section class="sticky-track">
    <div class="sticky-frame">

      <interact-element data-interact-key="title" data-interact-initial="true">
        <div class="title-wrap">
          <div class="title-area">
            <h1>MANIFEST<sup>®</sup></h1>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="text-cols" data-interact-initial="true">
        <div class="text-wrap">
          <div class="text-columns">
            <div class="text-col">
              <p>Design studio<br>focused on brand<br>identity & digital<br>experiences</p>
            </div>
            <div class="text-col">
              <p>Founded 2019<br>New York, Paris<br>& Tokyo</p>
            </div>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="image-box" data-interact-initial="true">
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
* { margin: 0; padding: 0; box-sizing: border-box; }

interact-element { display: block; }

body {
  background: #000;
  color: #fff;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.045;
  background-image: url('');
}

.sticky-track {
  height: 400vh;
  position: relative;
}

.sticky-frame {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100vw;
  overflow: clip;
}

.title-wrap {
  position: absolute;
  top: 40px;
  left: 40px;
  z-index: 10;
}

.title-area h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(6rem, 18vw, 16rem);
  font-weight: 400;
  line-height: 0.85;
  letter-spacing: 0.03em;
  color: #fff;
}

.title-area h1 sup {
  font-size: 0.12em;
  vertical-align: super;
  letter-spacing: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 300;
}

.text-wrap {
  position: absolute;
  top: calc(40px + clamp(6rem, 18vw, 16rem) * 0.85 + 24px);
  left: 40px;
  z-index: 10;
}

.text-columns {
  display: flex;
  gap: 40px;
}

.text-col {
  max-width: 140px;
}

.text-col p {
  font-size: 0.55rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.4);
}

.image-wrap {
  position: absolute;
  top: 24px;
  right: 24px;
  bottom: 24px;
  left: 24px;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: clip;
  border-radius: 3px;
}

.image-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(1) brightness(0.65) contrast(1.25);
}
```

## Interact config

```js
{
  interactions: [
    {
      key: 'title',
      trigger: 'viewEnter',
      params: { type: 'once' },
      effects: [
        {
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
      ],
    },
    {
      key: 'text-cols',
      trigger: 'viewEnter',
      params: { type: 'once' },
      effects: [
        {
          keyframeEffect: {
            name: 'text-in',
            keyframes: [
              { opacity: '0', transform: 'translateY(30px)', offset: 0 },
              { opacity: '1', transform: 'translateY(0)', offset: 1 },
            ],
          },
          duration: 900,
          delay: 250,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
      ],
    },
    {
      key: 'image-box',
      trigger: 'viewEnter',
      params: { type: 'once' },
      effects: [
        {
          keyframeEffect: {
            name: 'image-in',
            keyframes: [
              { opacity: '0', transform: 'translateY(60px)', offset: 0 },
              { opacity: '1', transform: 'translateY(0)', offset: 1 },
            ],
          },
          duration: 1100,
          delay: 450,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
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
            name: 'container-shrink',
            keyframes: [
              { top: '24px', right: '24px', offset: 0 },
              { top: 'calc(60% - 24px)', right: '24px', offset: 0.5 },
              { top: 'calc(60% - 24px)', right: 'calc(75% - 24px)', offset: 1 },
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
            name: 'image-zoom-in',
            keyframes: [
              { transform: 'scale(1)', offset: 0 },
              { transform: 'scale(1.25)', offset: 1 },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
      ],
    },
  ],
}
```
