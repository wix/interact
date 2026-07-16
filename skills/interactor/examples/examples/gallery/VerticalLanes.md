# Vertical Lanes

Four vertical image columns auto-scroll continuously in alternating directions when they enter the viewport, each column looping at a different speed for a parallax-lane effect; hovering an image reveals its title and overlay.

**Tags:** viewEnter, hover, gallery, flex, transform, loop, parallax, stagger

## Markup

```html
<div class="gallery-container" id="gallery-container">
  <div class="gallery-column">
    <interact-element data-interact-key="#wrapper-1">
      <div class="animation-wrapper" id="wrapper-1">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Spiral Staircase</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Geometric Facade</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Atrium View</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Modern Interior</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Spiral Staircase</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Geometric Facade</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Atrium View</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Modern Interior</div>
          </div>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-column">
    <interact-element data-interact-key="#wrapper-2">
      <div class="animation-wrapper" id="wrapper-2">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Night Cityscape</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Flowing Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Abstract Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Bright Living Room</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Night Cityscape</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Flowing Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Abstract Lines</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Bright Living Room</div>
          </div>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-column">
    <interact-element data-interact-key="#wrapper-3">
      <div class="animation-wrapper" id="wrapper-3">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Symmetrical Hallway</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Glass Ceiling</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Industrial Interior</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Suspension Bridge</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Symmetrical Hallway</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Glass Ceiling</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Industrial Interior</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Suspension Bridge</div>
          </div>
        </div>
      </div>
    </interact-element>
  </div>

  <div class="gallery-column">
    <interact-element data-interact-key="#wrapper-4">
      <div class="animation-wrapper" id="wrapper-4">
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Modern Museum</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Skyscraper Reflection</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Cozy Nook</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Library Rows</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Modern Museum</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Skyscraper Reflection</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
            <div class="image-title">Cozy Nook</div>
          </div>
          <div class="image-container">
            <img src="" class="gallery-image">
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
  --col-width: 25vw;
  --img-padding: 15px;
  --img-border-radius: 24px;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.gallery-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
}

.gallery-column {
  flex: none;
  width: var(--col-width);
  position: relative;
  overflow: hidden;
}

.animation-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: max-content;
  will-change: transform;
}

.animation-wrapper > div {
  display: flex;
  flex-direction: column;
  width: 100%;
}

#wrapper-1, #wrapper-3 {
  transform: translateY(-50%);
}

.image-container {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  cursor: pointer;
}

.gallery-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  padding: var(--img-padding);
  box-sizing: border-box;
  border-radius: var(--img-border-radius);
  display: block;
}

.image-title {
  position: absolute;
  bottom: calc(var(--img-padding) + 15px);
  left: calc(var(--img-padding) + 15px);
  right: calc(var(--img-padding) + 15px);
  text-align: center;
  font-size: clamp(0.5rem, calc((var(--col-width) - 2 * var(--img-padding)) * 0.12), 1.5rem);
  line-height: 1.2;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 2;
}

.image-container::after {
  content: '';
  position: absolute;
  bottom: var(--img-padding);
  left: var(--img-padding);
  right: var(--img-padding);
  height: 50%;
  border-radius: 0 0 calc(var(--img-border-radius) - var(--img-padding)) calc(var(--img-border-radius) - var(--img-padding));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.image-container:hover .image-title,
.image-container:hover::after {
  opacity: 1;
}

@media (max-width: 768px) {
  .gallery-column:nth-child(3), .gallery-column:nth-child(4) {
    display: none;
  }
}
```

## Interact config

```js
{
  interactions: [
    {
      key: '#wrapper-1',
      trigger: 'viewEnter',
      effects: [{
        key: '#wrapper-1',
        triggerType: 'state',
        keyframeEffect: {
          name: 'scroll-down',
          keyframes: [{ transform: 'translateY(-50%)' }, { transform: 'translateY(0)' }]
        },
        duration: 40000,
        easing: 'linear',
        iterations: Infinity
      }]
    },
    {
      key: '#wrapper-2',
      trigger: 'viewEnter',
      effects: [{
        key: '#wrapper-2',
        triggerType: 'state',
        keyframeEffect: {
          name: 'scroll-up',
          keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-50%)' }]
        },
        duration: 50000,
        easing: 'linear',
        iterations: Infinity
      }]
    },
    {
      key: '#wrapper-3',
      trigger: 'viewEnter',
      effects: [{
        key: '#wrapper-3',
        triggerType: 'state',
        keyframeEffect: {
          name: 'scroll-down-fast',
          keyframes: [{ transform: 'translateY(-50%)' }, { transform: 'translateY(0)' }]
        },
        duration: 45000,
        easing: 'linear',
        iterations: Infinity
      }]
    },
    {
      key: '#wrapper-4',
      trigger: 'viewEnter',
      effects: [{
        key: '#wrapper-4',
        triggerType: 'state',
        keyframeEffect: {
          name: 'scroll-up-fast',
          keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-50%)' }]
        },
        duration: 55000,
        easing: 'linear',
        iterations: Infinity
      }]
    }
  ]
}
```
