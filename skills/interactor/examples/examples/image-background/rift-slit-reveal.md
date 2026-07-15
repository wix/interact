# Rift Slit Reveal

A sticky scroll sequence where a centered image expands from a thin horizontal slit to fill the viewport as the user scrolls, while title letters animate up from a clipped overflow on entry and a subtitle fades in below.

**Tags:** viewProgress, viewEnter, sticky, reveal, stagger, fade, scale, opacity, transform

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
            <img src="IMAGE_URL" alt="Sculpture" />
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
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
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(5rem, 16vw, 15rem);
  font-weight: 400;
  line-height: 0.85;
  letter-spacing: 0.1em;
  color: #fff;
}

.title-area .letter {
  display: inline-block;
  transform: translateY(120%);
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
  color: #fff;
  line-height: 2.4;
}

.rift-wrap {
  position: absolute;
  top: 50%;
  right: 20%;
  bottom: 50%;
  left: 20%;
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
  background: rgba(0, 0, 0, 0.12);
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
      key: 'title',
      trigger: 'viewEnter',
      effects: [
        {
          selector: '.letter:nth-child(1)',
          keyframeEffect: { name: 'l1', keyframes: [
            { transform: 'translateY(120%)', offset: 0 },
            { transform: 'translateY(0)', offset: 1 },
          ]},
          duration: 900,
          delay: 100,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
          triggerType: 'once',
        },
        {
          selector: '.letter:nth-child(2)',
          keyframeEffect: { name: 'l2', keyframes: [
            { transform: 'translateY(120%)', offset: 0 },
            { transform: 'translateY(0)', offset: 1 },
          ]},
          duration: 900,
          delay: 180,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
          triggerType: 'once',
        },
        {
          selector: '.letter:nth-child(3)',
          keyframeEffect: { name: 'l3', keyframes: [
            { transform: 'translateY(120%)', offset: 0 },
            { transform: 'translateY(0)', offset: 1 },
          ]},
          duration: 900,
          delay: 260,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
          triggerType: 'once',
        },
        {
          selector: '.letter:nth-child(4)',
          keyframeEffect: { name: 'l4', keyframes: [
            { transform: 'translateY(120%)', offset: 0 },
            { transform: 'translateY(0)', offset: 1 },
          ]},
          duration: 900,
          delay: 340,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
          triggerType: 'once',
        },
      ],
    },
    {
      key: 'subtitle',
      trigger: 'viewEnter',
      effects: [{
        keyframeEffect: {
          name: 'sub-in',
          keyframes: [
            { opacity: '0', transform: 'translateY(-15px) scale(0.9)', offset: 0 },
            { opacity: '1', transform: 'translateY(0) scale(1)', offset: 1 },
          ],
        },
        duration: 800,
        delay: 600,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both',
        triggerType: 'once',
      }],
    },
    {
      key: 'rift',
      trigger: 'viewEnter',
      effects: [{
        keyframeEffect: {
          name: 'rift-in',
          keyframes: [
            { opacity: '0', offset: 0 },
            { opacity: '1', offset: 1 },
          ],
        },
        duration: 1200,
        delay: 500,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'both',
        triggerType: 'once',
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
            name: 'rift-open',
            keyframes: [
              { top: '50%', right: '20%', bottom: '50%', left: '20%', offset: 0 },
              { top: '24px', right: '20%', bottom: '24px', left: '20%', offset: 0.5 },
              { top: '24px', right: '24px', bottom: '24px', left: '24px', offset: 1 },
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
              { transform: 'scale(1.4)', offset: 0 },
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
}
```
