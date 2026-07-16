# Corner Fold Scroll Animation

Five fullscreen sticky panels sequentially slide up from below and expand their images from the bottom-right corner using clip-path, triggered by dedicated scroll sections as the user scrolls down the page.

**Tags:** viewProgress, sticky, clip-path, transform, reveal, stagger

## Markup

```html
<div class="scroll-parent-container">
  <div class="sticky-wrapper">
    <div class="overflow-clipper">
      <interact-element data-interact-key="#panel-1">
        <div id="panel-1" class="sticky-item">
          <div class="animated-title px-4 md:px-8 py-4 md:py-2">
            <p class="text-2xl md:text-base">Text 1: Architectural Curves</p>
          </div>
          <interact-element data-interact-key="#image-container-1">
            <div id="image-container-1" class="image-container">
              <interact-element data-interact-key="#image-1">
                <img id="image-1" src="" class="animated-image" />
              </interact-element>
            </div>
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#panel-2">
        <div id="panel-2" class="sticky-item">
          <div class="animated-title px-4 md:px-8 py-4 md:py-2">
            <p class="text-2xl md:text-base">Text 2: Desert Landscape</p>
          </div>
          <interact-element data-interact-key="#image-container-2">
            <div id="image-container-2" class="image-container">
              <interact-element data-interact-key="#image-2">
                <img id="image-2" src="" class="animated-image" />
              </interact-element>
            </div>
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#panel-3">
        <div id="panel-3" class="sticky-item">
          <div class="animated-title px-4 md:px-8 py-4 md:py-2">
            <p class="text-2xl md:text-base">Text 3: Urban Metropolis</p>
          </div>
          <interact-element data-interact-key="#image-container-3">
            <div id="image-container-3" class="image-container">
              <interact-element data-interact-key="#image-3">
                <img id="image-3" src="" class="animated-image" />
              </interact-element>
            </div>
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#panel-4">
        <div id="panel-4" class="sticky-item">
          <div class="animated-title px-4 md:px-8 py-4 md:py-2">
            <p class="text-2xl md:text-base">Text 4: Forest Canopy</p>
          </div>
          <interact-element data-interact-key="#image-container-4">
            <div id="image-container-4" class="image-container">
              <interact-element data-interact-key="#image-4">
                <img id="image-4" src="" class="animated-image" />
              </interact-element>
            </div>
          </interact-element>
        </div>
      </interact-element>

      <interact-element data-interact-key="#panel-5">
        <div id="panel-5" class="sticky-item">
          <div class="animated-title px-4 md:px-8 py-4 md:py-2">
            <p class="text-2xl md:text-base">Text 5: Ocean Waves</p>
          </div>
          <interact-element data-interact-key="#image-container-5">
            <div id="image-container-5" class="image-container">
              <interact-element data-interact-key="#image-5">
                <img id="image-5" src="" class="animated-image" />
              </interact-element>
            </div>
          </interact-element>
        </div>
      </interact-element>
    </div>
  </div>

  <div class="scroll-triggers-placeholder">
    <interact-element data-interact-key="#trigger-1"
      ><div id="trigger-1" class="scroll-section"></div
    ></interact-element>
    <interact-element data-interact-key="#trigger-2"
      ><div id="trigger-2" class="scroll-section"></div
    ></interact-element>
    <interact-element data-interact-key="#trigger-3"
      ><div id="trigger-3" class="scroll-section"></div
    ></interact-element>
    <interact-element data-interact-key="#trigger-4"
      ><div id="trigger-4" class="scroll-section"></div
    ></interact-element>
    <interact-element data-interact-key="#trigger-5"
      ><div id="trigger-5" class="scroll-section"></div
    ></interact-element>
    <interact-element data-interact-key="#trigger-6"
      ><div id="trigger-6" class="scroll-section"></div
    ></interact-element>
  </div>
</div>
```

## Essential styles

```css
.fullscreen-section {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.scroll-parent-container {
  position: relative;
}

.sticky-wrapper {
  height: 100vh;
  width: 100vw;
  position: sticky;
  top: 0;
}

.overflow-clipper {
  width: 100%;
  height: 100%;
  overflow: clip;
  position: relative;
}

.scroll-triggers-placeholder {
  position: relative;
  z-index: -1;
}

.scroll-section {
  height: 100vh;
  width: 100%;
}

.sticky-item {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
}

#panel-1 {
  z-index: 1;
}

#panel-2 {
  z-index: 2;
}

#panel-3 {
  z-index: 3;
}

#panel-4 {
  z-index: 4;
}

#panel-5 {
  z-index: 5;
}

.animated-title {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 20;
}

.animated-title p {
  white-space: nowrap;
  overflow: clip;
}

.image-container {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: inset(0% 0% 0% 0%);
}

.animated-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#panel-2,
#panel-3,
#panel-4,
#panel-5 {
  transform: translateY(100vh);
}

.animated-image {
  clip-path: inset(0% 0% 100% 100%);
}
```

## Interact config

```js
const interactions = [];
const panelCount = 5;

interactions.push({
  key: '#trigger-1',
  trigger: 'viewProgress',
  effects: [
    {
      key: '#image-1',
      keyframeEffect: {
        name: 'panel1-img-reveal',
        keyframes: [{ clipPath: 'inset(0% 0% 100% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
      },
      rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
      rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
      fill: 'both',
      easing: 'linear',
    },
  ],
});

interactions.push({
  key: '#trigger-1',
  trigger: 'viewProgress',
  effects: [
    {
      key: '#image-container-1',
      keyframeEffect: {
        name: 'panel1-shrink',
        keyframes: [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 100% 100% 0%)' }],
      },
      rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
      rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
      fill: 'both',
      easing: 'linear',
    },
  ],
});

for (let i = 2; i <= panelCount; i++) {
  const currentPanel = `#panel-${i}`;
  const currentImage = `#image-${i}`;
  const currentImageContainer = `#image-container-${i}`;
  const currentTrigger = `#trigger-${i}`;
  const previousTrigger = `#trigger-${i - 1}`;

  interactions.push({
    key: previousTrigger,
    trigger: 'viewProgress',
    effects: [
      {
        key: currentPanel,
        keyframeEffect: {
          name: `panel${i}-slide-up`,
          keyframes: [{ transform: 'translateY(100vh)' }, { transform: 'translateY(0vh)' }],
        },
        rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
        rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
        fill: 'both',
        easing: 'linear',
      },
      {
        key: currentImage,
        keyframeEffect: {
          name: `panel${i}-img-reveal`,
          keyframes: [{ clipPath: 'inset(0% 0% 100% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
        },
        rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
        rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
        fill: 'both',
        easing: 'linear',
      },
    ],
  });

  if (i < panelCount) {
    interactions.push({
      key: currentTrigger,
      trigger: 'viewProgress',
      effects: [
        {
          key: currentImageContainer,
          keyframeEffect: {
            name: `panel${i}-shrink`,
            keyframes: [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 100% 100% 0%)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          fill: 'both',
          easing: 'linear',
        },
      ],
    });
  } else {
    interactions.push({
      key: `#trigger-${i}`,
      trigger: 'viewProgress',
      effects: [
        {
          key: currentImageContainer,
          keyframeEffect: {
            name: `panel${i}-shrink`,
            keyframes: [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 100% 100% 0%)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
          fill: 'both',
          easing: 'linear',
        },
      ],
    });
  }
}

const config = { interactions };
```
