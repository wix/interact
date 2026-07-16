# Card Spread

Five photo cards start stacked at center and fan out horizontally across the viewport as the user scrolls, with a sticky container pinning the cards while a tall scroll section drives the viewProgress interaction; on mobile the cards slide in sequentially from below instead.

**Tags:** viewProgress, scroll, sticky, gallery, transform, height, stagger, reveal

## Markup

```html
<interact-element data-interact-key=".scroll-section">
  <section class="scroll-section">
    <div class="cards-container-wrapper">
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
    </div>
  </section>
</interact-element>
```

## Essential styles

```css
body,
html {
  margin: 0;
  padding: 0;
}

.scroll-section {
  height: 400vh;
}

.cards-container-wrapper {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: clip;
}

#cards-collection {
  position: relative;
  width: 20vw;
  height: 100vh;
  margin: 0 auto;
}

.card {
  position: absolute;
  width: 20vw;
  height: 100vh;
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
  .scroll-section {
    height: 500vh;
  }

  #cards-collection {
    width: 90vw;
  }

  .card {
    width: 100%;
    height: 75vh;
    left: 0;
    top: 12.5vh;
    transform: translateY(0);
  }

  #card-2,
  #card-3,
  #card-4,
  #card-5 {
    transform: translateY(100vh);
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
  .card {
    transform: none !important;
    height: 100vh !important;
  }

  @media (min-width: 769px) {
    .card {
      height: 85vh !important;
    }

    #card-1 {
      transform: translateX(-40vw) !important;
    }

    #card-2 {
      transform: translateX(-20vw) !important;
    }

    #card-3 {
      transform: translateX(0) !important;
    }

    #card-4 {
      transform: translateX(20vw) !important;
    }

    #card-5 {
      transform: translateX(40vw) !important;
    }
  }

  @media (max-width: 768px) {
    #card-1,
    #card-2,
    #card-3,
    #card-4,
    #card-5 {
      transform: translateY(0) !important;
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
      key: '.scroll-section',
      trigger: 'viewProgress',
      conditions: ['desktop'],
      effects: [
        {
          key: '#cards-collection',
          selector: '.card',
          keyframeEffect: {
            name: 'card-shrink',
            keyframes: [{ height: '100vh' }, { height: '85vh' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },
          easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
          fill: 'both',
        },
        {
          key: '#card-1',
          keyframeEffect: {
            name: 'card-1-move',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-40vw)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },
          easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
          fill: 'both',
        },
        {
          key: '#card-2',
          keyframeEffect: {
            name: 'card-2-move',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-20vw)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },
          easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
          fill: 'both',
        },
        {
          key: '#card-3',
          keyframeEffect: {
            name: 'card-3-move',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(0)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },
          easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
          fill: 'both',
        },
        {
          key: '#card-4',
          keyframeEffect: {
            name: 'card-4-move',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(20vw)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },
          easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
          fill: 'both',
        },
        {
          key: '#card-5',
          keyframeEffect: {
            name: 'card-5-move',
            keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(40vw)' }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 20 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },
          easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
          fill: 'both',
        },
      ],
    },
    {
      key: '.scroll-section',
      trigger: 'viewProgress',
      conditions: ['mobile'],
      effects: [
        {
          key: '#card-2',
          keyframeEffect: {
            name: 'card-2-in',
            keyframes: [{ transform: 'translateY(100vh)' }, { transform: 'translateY(0)' }],
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 0 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 25 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-3',
          keyframeEffect: {
            name: 'card-3-in',
            keyframes: [{ transform: 'translateY(100vh)' }, { transform: 'translateY(0)' }],
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 25 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 50 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-4',
          keyframeEffect: {
            name: 'card-4-in',
            keyframes: [{ transform: 'translateY(100vh)' }, { transform: 'translateY(0)' }],
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 75 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-5',
          keyframeEffect: {
            name: 'card-5-in',
            keyframes: [{ transform: 'translateY(100vh)' }, { transform: 'translateY(0)' }],
          },
          rangeStart: { name: 'contain', offset: { unit: 'percentage', value: 75 } },
          rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: 100 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```
