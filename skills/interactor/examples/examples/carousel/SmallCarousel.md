# Small Carousel

A 3D perspective carousel of space nebula cards arranged in depth with rotateY offsets; hovering any card scales its image and fades in its text.

**Tags:** hover, carousel, 3d, scale, opacity, transform, rotate, fade

## Markup

```html
<div class="carousel-container" id="carousel-container">
  <div class="carousel" id="carousel">
    <interact-element data-interact-key="#card-0">
      <div class="card active" id="card-0">
        <img src="" class="card-image" draggable="false" />
        <div class="card-content">
          <div class="card-artist">Orion Nebula</div>
          <div class="card-keywords">Stellar Nursery • Cosmic Clouds • New Stars</div>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-1">
      <div class="card right-1" id="card-1">
        <img src="" class="card-image" draggable="false" />
        <div class="card-content">
          <div class="card-artist">Carina Nebula</div>
          <div class="card-keywords">Cosmic Reef • Massive Stars • Destruction</div>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-2">
      <div class="card right-2" id="card-2">
        <img src="" class="card-image" draggable="false" />
        <div class="card-content">
          <div class="card-artist">Eagle Nebula</div>
          <div class="card-keywords">Creation • Destruction • Pillars of Gas</div>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-3">
      <div class="card right-3" id="card-3">
        <img src="" class="card-image" draggable="false" />
        <div class="card-content">
          <div class="card-artist">Veil Nebula</div>
          <div class="card-keywords">Supernova Remnant • Wisps • Ethereal</div>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-4">
      <div class="card left-2" id="card-4">
        <img src="" class="card-image" draggable="false" />
        <div class="card-content">
          <div class="card-artist">Rosette Nebula</div>
          <div class="card-keywords">Stellar Cluster • Rose • Ionized Hydrogen</div>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-5">
      <div class="card left-1" id="card-5">
        <img src="" class="card-image" draggable="false" />
        <div class="card-content">
          <div class="card-artist">Horsehead Nebula</div>
          <div class="card-keywords">Dark Nebula • Cosmic Dust • Silhouette</div>
        </div>
      </div>
    </interact-element>
  </div>
</div>
```

## Essential styles

```css
body {
  overflow: hidden;
}

.carousel-container {
  perspective: 1500px;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.carousel {
  position: relative;
  width: 300px;
  height: 500px;
  transform-style: preserve-3d;
}

.card {
  position: absolute;
  width: 300px;
  height: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 2rem 1.25rem 1.5rem;
  box-sizing: border-box;
  opacity: 0;
}

.card.active {
  transform: translateX(0) translateZ(0) rotateY(0deg) scale(1);
  z-index: 10;
}
.card.left-1 {
  transform: translateX(-60%) translateZ(-200px) rotateY(35deg) scale(0.9);
  z-index: 5;
}
.card.right-1 {
  transform: translateX(60%) translateZ(-200px) rotateY(-35deg) scale(0.9);
  z-index: 5;
}
.card.left-2 {
  transform: translateX(-110%) translateZ(-400px) rotateY(45deg) scale(0.8);
  z-index: 2;
}
.card.right-2 {
  transform: translateX(110%) translateZ(-400px) rotateY(-45deg) scale(0.8);
  z-index: 2;
}
.card.right-3 {
  transform: translateX(150%) translateZ(-600px) rotateY(-55deg) scale(0.7);
  z-index: 1;
}
```

## Interact config

```js
const interactions = [];

const cardCount = 6;

for (let index = 0; index < cardCount; index++) {
  interactions.push({
    trigger: 'hover',
    key: `#card-${index}`,
    effects: [
      {
        key: `#card-${index}`,
        selector: '.card-image',
        keyframeEffect: {
          name: `card-${index}-image-hover`,
          keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }],
        },
        duration: 600,
        easing: 'ease-out',
        fill: 'both',
        triggerType: 'alternate',
      },
      {
        key: `#card-${index}`,
        selector: '.card-content',
        keyframeEffect: {
          name: `card-${index}-content-hover`,
          keyframes: [{ opacity: 0 }, { opacity: 1 }],
        },
        duration: 350,
        easing: 'ease-out',
        fill: 'both',
        triggerType: 'alternate',
      },
    ],
  });
}

const config = { interactions };
```
