# Window Scroll

Six panels stacked in a sticky viewport each fly in from depth with a 3D rotateX + translateZ perspective transform, sequenced across a 1200vh scroll wrapper so each panel occupies an equal slice of the scroll range.

**Tags:** viewProgress, sticky, transform, opacity, 3d, stagger

## Markup

```html
<section class="spacer">
  <h1>Scroll down to begin...</h1>
</section>

<interact-element data-interact-key="#scroll-wrapper">
  <div id="scroll-wrapper">
    <div class="sticky-container">
      <interact-element data-interact-key="#panel-1">
        <div class="panel" id="panel-1">Panel One</div>
      </interact-element>

      <interact-element data-interact-key="#panel-2">
        <div class="panel" id="panel-2">Panel Two</div>
      </interact-element>

      <interact-element data-interact-key="#panel-3">
        <div class="panel" id="panel-3">Panel Three</div>
      </interact-element>

      <interact-element data-interact-key="#panel-4">
        <div class="panel" id="panel-4">Panel Four</div>
      </interact-element>

      <interact-element data-interact-key="#panel-5">
        <div class="panel" id="panel-5">Panel Five</div>
      </interact-element>

      <interact-element data-interact-key="#panel-6">
        <div class="panel" id="panel-6">Panel Six</div>
      </interact-element>
    </div>
  </div>
</interact-element>

<section class="spacer">
  <h1>You've reached the end.</h1>
</section>
```

## Essential styles

```css
body {
  margin: 0;
}

.spacer {
  height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 0 2rem;
}

#scroll-wrapper {
  height: 1200vh;
  position: relative;
}

.sticky-container {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: clip;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.panel {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  opacity: 0;
  padding: 2rem;
  box-sizing: border-box;
  text-align: center;
}

interact-element {
  display: contents;
}
```

## Interact config

```js
const panel3DKeyframes = [
  {
    offset: 0,
    opacity: 0,
    transform: 'perspective(1000px) rotateX(45deg) translateZ(-500px)',
  },
  {
    offset: 0.33,
    opacity: 1,
    transform: 'perspective(1000px) rotateX(0deg) translateZ(0px)',
  },
  {
    offset: 0.66,
    opacity: 1,
    transform: 'perspective(1000px) rotateX(0deg) translateZ(0px)',
  },
  {
    offset: 1,
    opacity: 0,
    transform: 'perspective(1000px) rotateX(-45deg) translateZ(500px)',
  },
];

const config = {
  interactions: [
    {
      key: '#scroll-wrapper',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#panel-1',
          keyframeEffect: {
            name: 'panel-1-3d-scroll',
            keyframes: panel3DKeyframes,
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 16.67 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#panel-2',
          keyframeEffect: {
            name: 'panel-2-3d-scroll',
            keyframes: panel3DKeyframes,
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 16.67 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 33.33 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#panel-3',
          keyframeEffect: {
            name: 'panel-3-3d-scroll',
            keyframes: panel3DKeyframes,
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 33.33 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 50 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#panel-4',
          keyframeEffect: {
            name: 'panel-4-3d-scroll',
            keyframes: panel3DKeyframes,
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 66.67 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#panel-5',
          keyframeEffect: {
            name: 'panel-5-3d-scroll',
            keyframes: panel3DKeyframes,
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 66.67 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 83.33 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#panel-6',
          keyframeEffect: {
            name: 'panel-6-3d-scroll',
            keyframes: panel3DKeyframes,
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 83.33 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```
