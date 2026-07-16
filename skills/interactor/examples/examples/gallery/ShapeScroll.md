# Shape Scroll

Six full-viewport image panels stack on top of each other; as the user scrolls, each successive panel is revealed from nothing via an expanding circular clip-path, driven by invisible scroll-trigger elements.

**Tags:** viewProgress, sticky, clip-path, reveal, stagger

## Markup

```html
<main class="animation-section">
  <interact-element data-interact-key="#trigger-2">
    <div id="trigger-2" class="trigger-area" style="top:25%;height:6.25%;"></div>
  </interact-element>
  <interact-element data-interact-key="#trigger-3">
    <div id="trigger-3" class="trigger-area" style="top:37.5%;height:6.25%;"></div>
  </interact-element>
  <interact-element data-interact-key="#trigger-4">
    <div id="trigger-4" class="trigger-area" style="top:50%;height:6.25%;"></div>
  </interact-element>
  <interact-element data-interact-key="#trigger-5">
    <div id="trigger-5" class="trigger-area" style="top:62.5%;height:6.25%;"></div>
  </interact-element>
  <interact-element data-interact-key="#trigger-6">
    <div id="trigger-6" class="trigger-area" style="top:75%;height:6.25%;"></div>
  </interact-element>

  <interact-element data-interact-key="#container-1">
    <div id="container-1" class="content-panel">
      <div class="text-center w-full pt-32 pb-20 z-10">
        <h1>Container 1</h1>
        <p>This is the starting point.</p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="#container-2">
    <div id="container-2" class="content-panel">
      <div class="text-center w-full pt-32 pb-20 z-10">
        <h1>Container 2</h1>
        <p>Revealed by scrolling.</p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="#container-3">
    <div id="container-3" class="content-panel">
      <div class="text-center w-full pt-32 pb-20 z-10">
        <h1>Container 3</h1>
        <p>And another one.</p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="#container-4">
    <div id="container-4" class="content-panel">
      <div class="text-center w-full pt-32 pb-20 z-10">
        <h1>Container 4</h1>
        <p>Keep scrolling...</p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="#container-5">
    <div id="container-5" class="content-panel">
      <div class="text-center w-full pt-32 pb-20 z-10">
        <h1>Container 5</h1>
        <p>Almost there.</p>
      </div>
    </div>
  </interact-element>

  <interact-element data-interact-key="#container-6">
    <div id="container-6" class="content-panel">
      <div class="text-center w-full pt-32 pb-20 z-10">
        <h1>Container 6</h1>
        <p>The final reveal.</p>
      </div>
    </div>
  </interact-element>
</main>
```

## Essential styles

```css
:root {
  --pw: 100;
  --ph: 100;
}

#container-2,
#container-3,
#container-4,
#container-5,
#container-6 {
  clip-path: circle(0% at center);
}

#container-1 {
  z-index: 1;
}

#container-2 {
  z-index: 2;
}

#container-3 {
  z-index: 3;
}

#container-4 {
  z-index: 4;
}

#container-5 {
  z-index: 5;
}

#container-6 {
  z-index: 6;
}

.trigger-area {
  position: absolute;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.animation-section {
  position: relative;
  width: 100%;
  height: 800vh;
}

.content-panel {
  position: sticky;
  top: calc((100 - var(--ph)) * 0.5vh);
  width: calc(var(--pw) * 1vw);
  height: calc(var(--ph) * 1vh);
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: clip;
}

.content-panel > div {
  transform-origin: center bottom;
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: '#trigger-2',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#container-2',
          keyframeEffect: {
            name: 'reveal-circle-2',
            keyframes: [
              { clipPath: 'circle(0% at center)' },
              { clipPath: 'circle(80% at center)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#trigger-3',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#container-3',
          keyframeEffect: {
            name: 'reveal-circle-3',
            keyframes: [
              { clipPath: 'circle(0% at center)' },
              { clipPath: 'circle(80% at center)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#trigger-4',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#container-4',
          keyframeEffect: {
            name: 'reveal-circle-4',
            keyframes: [
              { clipPath: 'circle(0% at center)' },
              { clipPath: 'circle(80% at center)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#trigger-5',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#container-5',
          keyframeEffect: {
            name: 'reveal-circle-5',
            keyframes: [
              { clipPath: 'circle(0% at center)' },
              { clipPath: 'circle(80% at center)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
    {
      key: '#trigger-6',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#container-6',
          keyframeEffect: {
            name: 'reveal-circle-6',
            keyframes: [
              { clipPath: 'circle(0% at center)' },
              { clipPath: 'circle(80% at center)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```
