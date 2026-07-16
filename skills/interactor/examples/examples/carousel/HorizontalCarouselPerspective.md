# Horizontal Carousel Perspective

Cards fly through a sticky 3D stage driven by page scroll, each one sweeping in from the side, centering with full depth, then receding away — paired with a fading title that syncs to whichever card is front and center.

**Tags:** viewProgress, sticky, carousel, 3d, transform, opacity, stagger, perspective, scroll

## Markup

```html
<div class="scroll-section">
  <interact-element data-interact-key=".sticky-wrapper">
    <div class="sticky-wrapper">
      <div class="animation-layout-container">
        <div class="animation-viewport">
          <interact-element data-interact-key="#card-1">
            <div id="card-1" class="card">
              <img src="" class="card-image" />
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-2">
            <div id="card-2" class="card">
              <img src="" class="card-image" />
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-3">
            <div id="card-3" class="card">
              <img src="" class="card-image" />
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-4">
            <div id="card-4" class="card">
              <img src="" class="card-image" />
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-5">
            <div id="card-5" class="card">
              <img src="" class="card-image" />
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-6">
            <div id="card-6" class="card">
              <img src="" class="card-image" />
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-7">
            <div id="card-7" class="card">
              <img src="" class="card-image" />
            </div>
          </interact-element>
        </div>

        <div class="text-viewport">
          <interact-element data-interact-key="#dynamic-title-container">
            <div id="dynamic-title-container">
              <span id="dynamic-title-text">
                <h2>Stellar Nurseries</h2>
                <p>Where Stars Are Born</p>
              </span>
            </div>
          </interact-element>
        </div>
      </div>
    </div>
  </interact-element>
</div>
```

## Essential styles

```css
.scroll-section {
  height: 1000vh;
}

.sticky-wrapper {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: clip;
}

.animation-layout-container {
  display: flex;
  width: 100%;
  height: 100vh;
  flex-direction: column;
}

.animation-viewport {
  position: relative;
  width: 100%;
  flex-grow: 1;
  perspective: 2000px;
}

.text-viewport {
  position: relative;
  width: 100%;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  position: absolute;
  width: 500px;
  height: 60vh;
  max-width: 70vw;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

#dynamic-title-container {
  z-index: 10;
  pointer-events: none;
}

#dynamic-title-text {
  display: inline-block;
  opacity: 0;
}

@media (max-width: 768px) {
  .animation-layout-container {
    flex-direction: row;
  }

  .animation-viewport {
    width: 60%;
    height: 100vh;
  }

  .text-viewport {
    width: 40%;
    height: 100vh;
    align-items: center;
    justify-content: flex-start;
  }

  .card {
    width: 250px;
    height: 350px;
    max-width: 90vw;
  }
}
```

## Interact config

```js
const cardCount = 7;
const effects = [];

const desktopAnimationKeyframes = [
  {
    offset: 0,
    transform:
      'translate(-50%, -50%) translateX(150%) translateZ(-900px) rotateY(-60deg) rotateX(15deg)',
    opacity: 0,
  },
  {
    offset: 0.3,
    transform:
      'translate(-50%, -50%) translateX(60%) translateZ(-300px) rotateY(-30deg) rotateX(5deg)',
    opacity: 1,
  },
  {
    offset: 0.5,
    transform: 'translate(-50%, -50%) translateX(0) translateZ(0) rotateY(0deg) rotateX(0deg)',
    opacity: 1,
  },
  {
    offset: 0.7,
    transform:
      'translate(-50%, -50%) translateX(-60%) translateZ(-300px) rotateY(30deg) rotateX(-5deg)',
    opacity: 1,
  },
  {
    offset: 1,
    transform:
      'translate(-50%, -50%) translateX(-150%) translateZ(-900px) rotateY(60deg) rotateX(-15deg)',
    opacity: 0,
  },
];

const mobileAnimationKeyframes = [
  {
    offset: 0,
    transform: 'translate(-50%, -50%) translateY(150%) translateZ(-900px) rotateX(60deg)',
    opacity: 0,
  },
  {
    offset: 0.3,
    transform: 'translate(-50%, -50%) translateY(60%) translateZ(-300px) rotateX(30deg)',
    opacity: 1,
  },
  {
    offset: 0.5,
    transform: 'translate(-50%, -50%) translateY(0) translateZ(0) rotateX(0deg)',
    opacity: 1,
  },
  {
    offset: 0.7,
    transform: 'translate(-50%, -50%) translateY(-60%) translateZ(-300px) rotateX(-30deg)',
    opacity: 1,
  },
  {
    offset: 1,
    transform: 'translate(-50%, -50%) translateY(-150%) translateZ(-900px) rotateX(-60deg)',
    opacity: 0,
  },
];

const titles = [
  { title: 'Stellar Nurseries', subtitle: 'Where Stars Are Born' },
  { title: 'Galactic Wonders', subtitle: 'A Universe of Possibility' },
  { title: 'Our Blue Planet', subtitle: 'A fragile existence' },
  { title: 'Cosmic Clouds', subtitle: 'The Dust of Creation' },
  { title: 'The Silent Moon', subtitle: 'A Watcher in the Night' },
  { title: 'Celestial Dance', subtitle: 'The Northern Lights' },
  { title: 'Final Frontier', subtitle: 'The Journey Beyond' },
];

let currentTitleIndex = -1;

for (let i = 1; i <= cardCount; i++) {
  const progressPerCard = 1 / (cardCount + 1);
  const start = (i - 1) * progressPerCard;
  const end = start + progressPerCard * 2;

  effects.push({
    key: `#card-${i}`,
    keyframeEffect: {
      name: `card-move-desktop-${i}`,
      keyframes: desktopAnimationKeyframes,
    },
    conditions: ['desktop'],
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: start * 100 } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: end * 100 } },
    easing: 'linear',
    fill: 'both',
  });

  effects.push({
    key: `#card-${i}`,
    keyframeEffect: {
      name: `card-move-mobile-${i}`,
      keyframes: mobileAnimationKeyframes,
    },
    conditions: ['mobile'],
    rangeStart: { name: 'cover', offset: { unit: 'percentage', value: start * 100 } },
    rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: end * 100 } },
    easing: 'linear',
    fill: 'both',
  });
}

effects.push({
  key: '#dynamic-title-container',
  customEffect: (el, progress) => {
    const textEl = el.querySelector('#dynamic-title-text');
    if (!textEl) return;

    let newOpacity = 0;
    let newTitleIndex = -1;

    for (let i = 1; i <= cardCount; i++) {
      const progressPerCard = 1 / (cardCount + 1);
      const start = (i - 1) * progressPerCard;
      const animationDuration = progressPerCard * 2;

      const fadeInStartPoint = start + 0.4 * animationDuration;
      const fadeInEndPoint = start + 0.5 * animationDuration;
      const fadeOutStartPoint = start + 0.5 * animationDuration;
      const fadeOutEndPoint = start + 0.6 * animationDuration;

      if (progress >= fadeInStartPoint && progress < fadeInEndPoint) {
        const rangeDuration = fadeInEndPoint - fadeInStartPoint;
        newOpacity = rangeDuration > 0 ? (progress - fadeInStartPoint) / rangeDuration : 1;
        newTitleIndex = i - 1;
        break;
      } else if (progress >= fadeInEndPoint && progress <= fadeOutStartPoint) {
        newOpacity = 1;
        newTitleIndex = i - 1;
        break;
      } else if (progress > fadeOutStartPoint && progress <= fadeOutEndPoint) {
        const rangeDuration = fadeOutEndPoint - fadeOutStartPoint;
        newOpacity = rangeDuration > 0 ? 1 - (progress - fadeOutStartPoint) / rangeDuration : 0;
        newTitleIndex = i - 1;
        break;
      }
    }

    if (newTitleIndex !== -1) {
      if (newTitleIndex !== currentTitleIndex) {
        const newTitle = titles[newTitleIndex];
        textEl.innerHTML = `<h2>${newTitle.title}</h2><p>${newTitle.subtitle}</p>`;
        currentTitleIndex = newTitleIndex;
      }
      textEl.style.opacity = Math.max(0, Math.min(1, newOpacity));
    } else {
      textEl.style.opacity = 0;
      currentTitleIndex = -1;
    }
  },
  rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 0 } },
  rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 100 } },
  fill: 'both',
});

const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 769px)' },
    mobile: { type: 'media', predicate: '(max-width: 768px)' },
  },
  interactions: [
    {
      key: '.sticky-wrapper',
      trigger: 'viewProgress',
      effects: effects,
    },
  ],
};
```
