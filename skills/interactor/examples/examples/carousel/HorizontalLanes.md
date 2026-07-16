# Horizontal Lanes

Four horizontal image rows loop continuously left and right at different speeds, each starting its infinite scroll animation when the row enters the viewport.

**Tags:** viewEnter, carousel, flex, loop, transform, gallery, stagger

## Markup

```html
<div class="gallery-container">
  <div class="gallery-row">
    <interact-element data-interact-key="#wrapper-1">
      <div class="animation-wrapper" id="wrapper-1">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Spiral Staircase</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Geometric Facade</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Atrium View</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Modern Interior</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Spiral Staircase</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Geometric Facade</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Atrium View</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Modern Interior</div>
          </div>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-row">
    <interact-element data-interact-key="#wrapper-2">
      <div class="animation-wrapper" id="wrapper-2">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Night Cityscape</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Flowing Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Abstract Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Bright Living Room</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Night Cityscape</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Flowing Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Abstract Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Bright Living Room</div>
          </div>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-row">
    <interact-element data-interact-key="#wrapper-3">
      <div class="animation-wrapper" id="wrapper-3">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Symmetrical Hallway</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Glass Ceiling</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Industrial Interior</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Suspension Bridge</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Symmetrical Hallway</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Glass Ceiling</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Industrial Interior</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Suspension Bridge</div>
          </div>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-row">
    <interact-element data-interact-key="#wrapper-4">
      <div class="animation-wrapper" id="wrapper-4">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Modern Museum</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Skyscraper Reflection</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Cozy Nook</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Library Rows</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Modern Museum</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Skyscraper Reflection</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Cozy Nook</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image" />
            <div class="image-title">Library Rows</div>
          </div>
        </div>
      </div>
    </interact-element>
  </div>
</div>
```

## Essential styles

```css
:root {
  --row-height: 25vh;
  --img-padding: 15px;
}

body {
  margin: 0;
  overflow: hidden;
}

.gallery-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.gallery-row {
  height: var(--row-height);
  position: relative;
  overflow: hidden;
}

.animation-wrapper {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: max-content;
}

.animation-wrapper > div {
  display: flex;
  flex-direction: row;
  height: 100%;
}

#wrapper-1,
#wrapper-3 {
  transform: translateX(-50%);
}

.image-container {
  position: relative;
  height: 100%;
  flex-shrink: 0;
}

.gallery-image {
  height: 100%;
  width: auto;
  object-fit: cover;
  padding: var(--img-padding);
  box-sizing: border-box;
  display: block;
}

.image-title {
  position: absolute;
  bottom: calc(var(--img-padding) + 15px);
  left: calc(var(--img-padding) + 15px);
  right: calc(var(--img-padding) + 15px);
  pointer-events: none;
  z-index: 2;
}

@media (max-width: 768px) {
  .gallery-row:nth-child(3),
  .gallery-row:nth-child(4) {
    display: none;
  }
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: '#wrapper-1',
      trigger: 'viewEnter',
      effects: [
        {
          key: '#wrapper-1',
          keyframeEffect: {
            name: 'scroll-right',
            keyframes: [{ transform: 'translateX(-50%)' }, { transform: 'translateX(0)' }],
          },
          duration: 40000,
          easing: 'linear',
          iterations: Infinity,
        },
      ],
    },
    {
      key: '#wrapper-2',
      trigger: 'viewEnter',
      effects: [
        {
          key: '#wrapper-2',
          keyframeEffect: {
            name: 'scroll-left',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
          },
          duration: 50000,
          easing: 'linear',
          iterations: Infinity,
        },
      ],
    },
    {
      key: '#wrapper-3',
      trigger: 'viewEnter',
      effects: [
        {
          key: '#wrapper-3',
          keyframeEffect: {
            name: 'scroll-right-fast',
            keyframes: [{ transform: 'translateX(-50%)' }, { transform: 'translateX(0)' }],
          },
          duration: 45000,
          easing: 'linear',
          iterations: Infinity,
        },
      ],
    },
    {
      key: '#wrapper-4',
      trigger: 'viewEnter',
      effects: [
        {
          key: '#wrapper-4',
          keyframeEffect: {
            name: 'scroll-left-fast',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
          },
          duration: 55000,
          easing: 'linear',
          iterations: Infinity,
        },
      ],
    },
  ],
};
```
