# Wheel Carousel

Six image cards arranged in a circle spin continuously on `viewEnter`, while hovering any card scales its image up slightly.

**Tags:** viewEnter, hover, carousel, loop, rotate, scale, transform

## Markup

```html
<section class="arc-viewport">
  <interact-element data-interact-key="#wheel">
    <div id="wheel" class="wheel">
      <div id="card-1" class="card"><img src="" /></div>
      <div id="card-2" class="card"><img src="" /></div>
      <div id="card-3" class="card"><img src="" /></div>
      <div id="card-4" class="card"><img src="" /></div>
      <div id="card-5" class="card"><img src="" /></div>
      <div id="card-6" class="card"><img src="" /></div>
    </div>
  </interact-element>
</section>
```

## Essential styles

```css
:root {
  --r: 65;
  --cs: 20;
}

body {
  margin: 0;
  overflow-x: hidden;
}

.arc-viewport {
  position: relative;
  width: 100%;
  height: 68vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.wheel {
  position: relative;
  width: calc(var(--r) * 2vmin + var(--cs) * 1vmin);
  height: calc(var(--r) * 2vmin + var(--cs) * 1vmin);
  transform-origin: center center;
  margin-top: 10vh;
  flex-shrink: 0;
}

interact-element {
  display: contents;
}

.card {
  position: absolute;
  width: calc(var(--cs) * 1vmin);
  height: calc(var(--cs) * 1vmin);
  left: 50%;
  top: 50%;
  overflow: hidden;
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

#card-1 {
  margin-left: calc((var(--r) * 1 - var(--cs) / 2) * 1vmin);
  margin-top: calc((var(--r) * 0 - var(--cs) / 2) * 1vmin);
  z-index: 100;
}
#card-2 {
  margin-left: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
  margin-top: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
  z-index: 187;
}
#card-3 {
  margin-left: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
  margin-top: calc((var(--r) * 0.866 - var(--cs) / 2) * 1vmin);
  z-index: 187;
}
#card-4 {
  margin-left: calc((var(--r) * -1 - var(--cs) / 2) * 1vmin);
  margin-top: calc((var(--r) * 0 - var(--cs) / 2) * 1vmin);
  z-index: 100;
}
#card-5 {
  margin-left: calc((var(--r) * -0.5 - var(--cs) / 2) * 1vmin);
  margin-top: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
  z-index: 13;
}
#card-6 {
  margin-left: calc((var(--r) * 0.5 - var(--cs) / 2) * 1vmin);
  margin-top: calc((var(--r) * -0.866 - var(--cs) / 2) * 1vmin);
  z-index: 13;
}

@media (max-width: 768px) {
  :root {
    --r: 22;
    --cs: 12;
  }
  .arc-viewport {
    height: 58vh;
  }
  .wheel {
    margin-top: 8vh;
  }
}

@media (max-width: 480px) {
  :root {
    --r: 18;
    --cs: 10;
  }
  .arc-viewport {
    height: 50vh;
  }
  .wheel {
    margin-top: 6vh;
  }
}
```

## Interact config

```js
const config = {
  effects: {
    'wheel-spin': {
      keyframeEffect: {
        name: 'wheel-spin-kf',
        keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      },
      duration: 30000,
      iterations: Infinity,
      easing: 'linear',
    },
    'card-counter': {
      keyframeEffect: {
        name: 'card-counter-kf',
        keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }],
      },
      duration: 30000,
      iterations: Infinity,
      easing: 'linear',
    },
    'img-hover': {
      keyframeEffect: {
        name: 'img-hover-kf',
        keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
      },
      duration: 250,
      easing: 'ease-out',
      fill: 'both',
    },
  },
  interactions: [
    {
      key: '#wheel',
      trigger: 'viewEnter',
      effects: [
        { key: '#wheel', effectId: 'wheel-spin' },
        { selector: '.card', effectId: 'card-counter' },
      ],
    },
    {
      key: '#wheel',
      trigger: 'hover',
      listContainer: '.card',
      effects: [{ selector: 'img', effectId: 'img-hover', triggerType: 'alternate' }],
    },
  ],
};
```
