# Vertical Lanes

Four vertical image columns auto-scroll continuously in alternating directions when they enter the viewport, each column looping at a different speed for a parallax-lane effect; hovering an image reveals a title and gradient overlay.

**Tags:** viewEnter, hover, gallery, flex, transform, loop, parallax, stagger

## Markup

```html
<div class="gallery-container" id="gallery-container">
  <div class="gallery-column">
    <interact-element data-interact-key="#wrapper-1">
      <div class="animation-wrapper" id="wrapper-1">
        <div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/1029615/pexels-photo-1029615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Spiral Staircase" class="gallery-image">
            <div class="image-title">Spiral Staircase</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Geometric Facade" class="gallery-image">
            <div class="image-title">Geometric Facade</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/190417/pexels-photo-190417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Atrium View" class="gallery-image">
            <div class="image-title">Atrium View</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Modern Interior" class="gallery-image">
            <div class="image-title">Modern Interior</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/1029615/pexels-photo-1029615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Spiral Staircase" class="gallery-image">
            <div class="image-title">Spiral Staircase</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Geometric Facade" class="gallery-image">
            <div class="image-title">Geometric Facade</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/190417/pexels-photo-190417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Atrium View" class="gallery-image">
            <div class="image-title">Atrium View</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Modern Interior" class="gallery-image">
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
            <img src="https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Night Cityscape" class="gallery-image">
            <div class="image-title">Night Cityscape</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Flowing Lines" class="gallery-image">
            <div class="image-title">Flowing Lines</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Abstract Lines" class="gallery-image">
            <div class="image-title">Abstract Lines</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Bright Living Room" class="gallery-image">
            <div class="image-title">Bright Living Room</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Night Cityscape" class="gallery-image">
            <div class="image-title">Night Cityscape</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/256150/pexels-photo-256150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Flowing Lines" class="gallery-image">
            <div class="image-title">Flowing Lines</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Abstract Lines" class="gallery-image">
            <div class="image-title">Abstract Lines</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Bright Living Room" class="gallery-image">
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
            <img src="https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Symmetrical Hallway" class="gallery-image">
            <div class="image-title">Symmetrical Hallway</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/259598/pexels-photo-259598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Glass Ceiling" class="gallery-image">
            <div class="image-title">Glass Ceiling</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/220769/pexels-photo-220769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Industrial Interior" class="gallery-image">
            <div class="image-title">Industrial Interior</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/347135/pexels-photo-347135.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Suspension Bridge" class="gallery-image">
            <div class="image-title">Suspension Bridge</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Symmetrical Hallway" class="gallery-image">
            <div class="image-title">Symmetrical Hallway</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/259598/pexels-photo-259598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Glass Ceiling" class="gallery-image">
            <div class="image-title">Glass Ceiling</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/220769/pexels-photo-220769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Industrial Interior" class="gallery-image">
            <div class="image-title">Industrial Interior</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/347135/pexels-photo-347135.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Suspension Bridge" class="gallery-image">
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
            <img src="https://images.pexels.com/photos/259725/pexels-photo-259725.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Modern Museum" class="gallery-image">
            <div class="image-title">Modern Museum</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Skyscraper Reflection" class="gallery-image">
            <div class="image-title">Skyscraper Reflection</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/1212487/pexels-photo-1212487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Cozy Nook" class="gallery-image">
            <div class="image-title">Cozy Nook</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Library Rows" class="gallery-image">
            <div class="image-title">Library Rows</div>
          </div>
        </div>
        <div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/259725/pexels-photo-259725.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Modern Museum" class="gallery-image">
            <div class="image-title">Modern Museum</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Skyscraper Reflection" class="gallery-image">
            <div class="image-title">Skyscraper Reflection</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/1212487/pexels-photo-1212487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Cozy Nook" class="gallery-image">
            <div class="image-title">Cozy Nook</div>
          </div>
          <div class="image-container">
            <img src="https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Library Rows" class="gallery-image">
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
  font-family: 'Inter', sans-serif;
  background-color: #f4f1eb;
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
  color: white;
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
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
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
