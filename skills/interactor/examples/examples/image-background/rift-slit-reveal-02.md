# Rift Slit Reveal 02

A full-viewport sticky image panel fades in on enter and then slits closed — collapsing inward from all sides into a thin vertical line at the center — as the user scrolls through a 500vh track, while the image simultaneously zooms in.

**Tags:** viewProgress, viewEnter, sticky, reveal, fade, scale, opacity, transform

## Markup

```html
<interact-element data-interact-key="page">
  <section class="sticky-track">
    <div class="sticky-frame">

      <interact-element data-interact-key="title">
        <div class="title-wrap">
          <div class="title-area">
            <h1><span class="letter">R</span><span class="letter">I</span><span class="letter">F</span><span class="letter">T</span></h1>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="subtitle" data-interact-initial="true">
        <div class="sub-wrap">
          <div class="sub-area">
            <p>Between the seen &amp; unseen<br>A study in negative space &amp; form — 2026</p>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="rift" data-interact-initial="true">
        <div class="rift-wrap">
          <div class="rift-container">
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

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.045;
}

.sticky-track {
  height: 500vh;
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
  bottom: calc(50% + 16px);
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 10;
  pointer-events: none;
}

.title-area {
  overflow: clip;
  padding-bottom: 0.1em;
}

.title-area h1 {
  font-size: clamp(5rem, 16vw, 15rem);
  font-weight: 400;
  line-height: 0.85;
  letter-spacing: 0.1em;
}

.title-area .letter {
  display: inline-block;
}

.sub-wrap {
  position: absolute;
  top: calc(50% + 20px);
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 10;
  pointer-events: none;
}

.sub-area p {
  font-size: 0.7rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  line-height: 2.4;
}

.rift-wrap {
  position: absolute;
  top: 24px;
  right: 24px;
  bottom: 24px;
  left: 24px;
  z-index: 5;
}

.rift-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: clip;
}

.rift-container::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.rift-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(1) brightness(0.7) contrast(1.2);
}
```

## Interact config

```js
{
  interactions: [
    {
      key: 'page',
      trigger: 'viewEnter',
      sequences: [{
        delay: 500,
        offset: 100,
        triggerType: 'once',
        effects: [
          {
            key: 'rift',
            keyframeEffect: {
              name: 'rift-in',
              keyframes: [
                { opacity: '0', offset: 0 },
                { opacity: '1', offset: 1 },
              ],
            },
            duration: 1200,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both',
          },
          {
            key: 'subtitle',
            keyframeEffect: {
              name: 'sub-in',
              keyframes: [
                { opacity: '0', transform: 'translateY(-15px) scale(0.9)', offset: 0 },
                { opacity: '1', transform: 'translateY(0) scale(1)', offset: 1 },
              ],
            },
            duration: 800,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'both',
          },
        ],
      }],
    },
    {
      key: 'page',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'rift',
          selector: '.rift-wrap',
          keyframeEffect: {
            name: 'rift-close',
            keyframes: [
              { top: '24px', right: '24px', bottom: '24px', left: '24px', offset: 0 },
              { top: '24px', right: '45%', bottom: '24px', left: '45%', offset: 0.5 },
              { top: '50%', right: '45%', bottom: '50%', left: '45%', offset: 1 },
            ],
          },
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          fill: 'both',
        },
        {
          key: 'rift',
          selector: '.rift-container img',
          keyframeEffect: {
            name: 'img-zoom',
            keyframes: [
              { transform: 'scale(1)', offset: 0 },
              { transform: 'scale(1.4)', offset: 1 },
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
