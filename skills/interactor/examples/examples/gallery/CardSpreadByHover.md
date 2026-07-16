# Card Spread By Hover

Five stacked image cards fan out horizontally when the collection is hovered, revealing each card from behind the stack with a spring easing.

**Tags:** hover, gallery, transform, reveal

## Markup

```html
<interact-element data-interact-key="#cards-collection">
  <div id="cards-collection">
    <interact-element data-interact-key="#card-1">
      <div id="card-1" class="card">
        <img src="" />
        <div class="card-content">
          <h2>Serene Peaks</h2>
          <p>Find your calm</p>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-2">
      <div id="card-2" class="card">
        <img src="" />
        <div class="card-content">
          <h2>Rolling Hills</h2>
          <p>Explore the landscape</p>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-3">
      <div id="card-3" class="card">
        <img src="" />
        <div class="card-content">
          <h2>Alpine Lake</h2>
          <p>Reflect and relax</p>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-4">
      <div id="card-4" class="card">
        <img src="" />
        <div class="card-content">
          <h2>Hidden Falls</h2>
          <p>Discover nature's power</p>
        </div>
      </div>
    </interact-element>
    <interact-element data-interact-key="#card-5">
      <div id="card-5" class="card">
        <img src="" />
        <div class="card-content">
          <h2>Forest Canopy</h2>
          <p>Breathe the fresh air</p>
        </div>
      </div>
    </interact-element>
  </div>
</interact-element>
```

## Essential styles

```css
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

body {
  display: grid;
  place-items: center;
  overflow: clip;
}

#cards-collection {
  position: relative;
  width: 25vw;
  height: 70vh;
  margin: 0;
}

.card {
  position: absolute;
  width: 25vw;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: clip;
  transform: translateX(0);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 2;
  text-align: center;
}

.card-content h2 {
  margin: 0 0 0.5rem 0;
}

.card-content p {
  margin: 0;
}

#card-1 {
  z-index: 3;
}

#card-2 {
  z-index: 4;
}

#card-3 {
  z-index: 5;
}

#card-4 {
  z-index: 2;
}

#card-5 {
  z-index: 1;
}

@media (max-width: 768px) {
  #cards-collection {
    width: 25vw;
    height: 70vh;
  }

  .card {
    width: 100%;
    height: 70vh;
    left: 0;
    top: 0;
    transform: translateX(0);
  }

  .card-content {
    text-align: left;
    padding: 1.5rem;
  }

  #card-1 {
    z-index: 1;
  }

  #card-2 {
    z-index: 2;
  }

  #card-3 {
    z-index: 3;
  }

  #card-4 {
    z-index: 4;
  }

  #card-5 {
    z-index: 5;
  }
}

@media (prefers-reduced-motion: reduce) {
  @media (min-width: 769px) {
    .card {
      height: 70vh !important;
    }

    #card-1 {
      transform: translateX(calc(-50vw - 20px)) !important;
    }

    #card-2 {
      transform: translateX(calc(-25vw - 10px)) !important;
    }

    #card-3 {
      transform: translateX(0) !important;
    }

    #card-4 {
      transform: translateX(calc(25vw + 10px)) !important;
    }

    #card-5 {
      transform: translateX(calc(50vw + 20px)) !important;
    }
  }

  @media (max-width: 768px) {
    .card {
      height: 70vh !important;
    }

    #card-1 {
      transform: translateX(-10vw) !important;
    }

    #card-2 {
      transform: translateX(-5vw) !important;
    }

    #card-3 {
      transform: translateX(0) !important;
    }

    #card-4 {
      transform: translateX(5vw) !important;
    }

    #card-5 {
      transform: translateX(10vw) !important;
    }
  }
}
```

## Interact config

```js
const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
    mobile: { type: 'media', predicate: '(max-width: 768px)' },
  },
  interactions: [
    {
      key: '#cards-collection',
      trigger: 'hover',
      conditions: ['desktop'],
      effects: [
        {
          key: '#card-1',
          keyframeEffect: {
            name: 'card-1-move',
            keyframes: [
              { transform: 'translateX(0)' },
              { transform: 'translateX(calc(-50vw - 20px))' },
            ],
          },
          triggerType: 'alternate',
          duration: 600,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-2',
          keyframeEffect: {
            name: 'card-2-move',
            keyframes: [
              { transform: 'translateX(0)' },
              { transform: 'translateX(calc(-25vw - 10px))' },
            ],
          },
          triggerType: 'alternate',
          duration: 600,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-3',
          keyframeEffect: {
            name: 'card-3-move',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(0)' }],
          },
          triggerType: 'alternate',
          duration: 600,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-4',
          keyframeEffect: {
            name: 'card-4-move',
            keyframes: [
              { transform: 'translateX(0)' },
              { transform: 'translateX(calc(25vw + 10px))' },
            ],
          },
          triggerType: 'alternate',
          duration: 600,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-5',
          keyframeEffect: {
            name: 'card-5-move',
            keyframes: [
              { transform: 'translateX(0)' },
              { transform: 'translateX(calc(50vw + 20px))' },
            ],
          },
          triggerType: 'alternate',
          duration: 600,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
      ],
    },
    {
      key: '#cards-collection',
      trigger: 'hover',
      conditions: ['mobile'],
      effects: [
        {
          key: '#card-1',
          keyframeEffect: {
            name: 'card-1-move-mob',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-10vw)' }],
          },
          triggerType: 'alternate',
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-2',
          keyframeEffect: {
            name: 'card-2-move-mob',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-5vw)' }],
          },
          triggerType: 'alternate',
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-3',
          keyframeEffect: {
            name: 'card-3-move-mob',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(0)' }],
          },
          triggerType: 'alternate',
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-4',
          keyframeEffect: {
            name: 'card-4-move-mob',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(5vw)' }],
          },
          triggerType: 'alternate',
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
        {
          key: '#card-5',
          keyframeEffect: {
            name: 'card-5-move-mob',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(10vw)' }],
          },
          triggerType: 'alternate',
          duration: 500,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
      ],
    },
  ],
};
```
