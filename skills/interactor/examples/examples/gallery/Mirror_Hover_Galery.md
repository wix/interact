# Mirror Hover Gallery

A grid of nature image cards where hovering any card zooms it, darkens its overlay, and reveals text while simultaneously mirroring that card's background image across the entire grid with a Chebyshev-distance stagger.

**Tags:** hover, grid, gallery, transform, opacity, stagger, scale, reveal, background

## Markup

```html
<section class="grid-container">
  <interact-element data-interact-key="card-1">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Title 1</h3>
        <p>Subtitle for card 1</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-2">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Title 2</h3>
        <p>Subtitle for card 2</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-3">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Title 3</h3>
        <p>Subtitle for card 3</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-4">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Title 4</h3>
        <p>Subtitle for card 4</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-5">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Title 5</h3>
        <p>Subtitle for card 5</p>
      </div>
    </div>
  </interact-element>
  <interact-element data-interact-key="card-6">
    <div class="card-inner">
      <div class="card-bg"></div>
      <div class="card-overlay"></div>
      <div class="card-content">
        <h3>Title 6</h3>
        <p>Subtitle for card 6</p>
      </div>
    </div>
  </interact-element>
</section>
```

## Essential styles

```css
body {
  margin: 0;
  padding: 40px;
  overflow-x: hidden;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows: 180px;
  gap: 40px;
  width: 100%;
}
interact-element {
  display: block;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  cursor: pointer;
}
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 5px;
}
.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.card-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 5px;
}
.card-content {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  opacity: 0;
  transform: translateY(10px);
  z-index: 2;
  line-height: 1.2;
  pointer-events: none;
}
.card-content h3 {
  margin: 0 0 3px 0;
  font-size: 1rem;
}
.card-content p {
  margin: 0;
  font-size: 0.85rem;
}
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 800px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Interact config

```js
const COLS = 8;
const allCards = Array.from(document.querySelectorAll('interact-element'));
const allBgs = Array.from(document.querySelectorAll('.card-bg'));
const CARD_COUNT = allCards.length;
const originalImages = allBgs.map((bg) => bg.style.backgroundImage);

const interactions = [];

for (let i = 1; i <= CARD_COUNT; i++) {
  interactions.push({
    key: `card-${i}`,
    trigger: 'hover',
    effects: [
      {
        selector: '.card-inner',
        keyframeEffect: {
          name: `card-zoom-${i}`,
          keyframes: [{ transform: 'scale(1.05)' }],
        },
        duration: 300,
        easing: 'ease-out',
        fill: 'both',
        triggerType: 'alternate',
      },
      {
        selector: '.card-overlay',
        transition: {
          duration: 300,
          easing: 'ease-out',
          styleProperties: [{ name: 'background', value: 'rgba(0,0,0,0.45)' }],
        },
      },
      {
        selector: '.card-content',
        keyframeEffect: {
          name: `text-reveal-${i}`,
          keyframes: [{ opacity: 1, transform: 'translateY(0)' }],
        },
        duration: 300,
        easing: 'ease-out',
        fill: 'both',
        triggerType: 'alternate',
      },
      {
        transition: {
          duration: 0,
          styleProperties: [{ name: 'z-index', value: '10' }],
        },
      },
    ],
  });
}

// { interactions }

// Global background mirror effect with Chebyshev-distance stagger
let lastHoveredIndex = 0;

allCards.forEach((el, elIndex) => {
  el.addEventListener('mouseenter', () => {
    lastHoveredIndex = elIndex;
    const hoverImage = el.querySelector('.card-bg').style.backgroundImage;
    const hoveredRow = Math.floor(elIndex / COLS);
    const hoveredCol = elIndex % COLS;
    const stagger =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stagger-delay')) ||
      0;

    const hoveredBg = allBgs[elIndex];
    hoveredBg.style.transition = 'none';
    hoveredBg.style.transitionDelay = '0ms';
    hoveredBg.style.backgroundImage = hoverImage;
    hoveredBg.offsetHeight;
    hoveredBg.style.transition = '';

    allBgs.forEach((cardBg, index) => {
      if (index === elIndex) return;
      const row = Math.floor(index / COLS);
      const col = index % COLS;
      const dist = Math.max(Math.abs(row - hoveredRow), Math.abs(col - hoveredCol));
      cardBg.style.transitionDelay = `${dist * stagger}ms`;
      cardBg.style.backgroundImage = hoverImage;
    });
  });

  el.addEventListener('mouseleave', () => {
    const hoveredRow = Math.floor(lastHoveredIndex / COLS);
    const hoveredCol = lastHoveredIndex % COLS;
    const stagger =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stagger-delay')) ||
      0;

    allCards.forEach((cardEl, index) => {
      const cardBg = cardEl.querySelector('.card-bg');
      if (cardBg) {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        const dist = Math.max(Math.abs(row - hoveredRow), Math.abs(col - hoveredCol));
        cardBg.style.transitionDelay = `${dist * stagger}ms`;
        cardBg.style.backgroundImage = originalImages[index];
      }
    });
  });
});
```
