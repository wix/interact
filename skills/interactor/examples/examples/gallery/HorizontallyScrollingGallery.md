# Horizontally Scrolling Gallery

Six portrait gallery items in a horizontal flex row reveal an ellipse-clipped, counter-rotated image and a fade-in label on hover, while a GSAP ticker drives edge-based auto-scroll when the cursor moves into the left or right 15% of the container.

**Tags:** hover, gallery, flex, transform, clip-path, opacity, reveal, fade, rotate

## Markup

```html
<div class="gallery-container">
  <div class="gallery-grid">

    <interact-element data-interact-key="item-1">
      <div class="gallery-item" data-title="Serene Lake">
        <interact-element data-interact-key="clip-1">
          <div class="image-clipper">
            <interact-element data-interact-key="img-1">
              <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop" alt="Serene Lake">
            </interact-element>
          </div>
        </interact-element>
        <interact-element data-interact-key="text-1">
          <div class="gallery-item-text">
            <h3 class="gallery-item-title">Serene Lake</h3>
          </div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-2">
      <div class="gallery-item" data-title="Mountain Majesty">
        <interact-element data-interact-key="clip-2">
          <div class="image-clipper">
            <interact-element data-interact-key="img-2">
              <img src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=2070&auto=format&fit=crop" alt="Mountain Majesty">
            </interact-element>
          </div>
        </interact-element>
        <interact-element data-interact-key="text-2">
          <div class="gallery-item-text">
            <h3 class="gallery-item-title">Mountain Majesty</h3>
          </div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-3">
      <div class="gallery-item" data-title="Coastal Drive">
        <interact-element data-interact-key="clip-3">
          <div class="image-clipper">
            <interact-element data-interact-key="img-3">
              <img src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1974&auto=format&fit=crop" alt="Coastal Drive">
            </interact-element>
          </div>
        </interact-element>
        <interact-element data-interact-key="text-3">
          <div class="gallery-item-text">
            <h3 class="gallery-item-title">Coastal Drive</h3>
          </div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-4">
      <div class="gallery-item" data-title="Forest Path">
        <interact-element data-interact-key="clip-4">
          <div class="image-clipper">
            <interact-element data-interact-key="img-4">
              <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1925&auto=format&fit=crop" alt="Forest Path">
            </interact-element>
          </div>
        </interact-element>
        <interact-element data-interact-key="text-4">
          <div class="gallery-item-text">
            <h3 class="gallery-item-title">Forest Path</h3>
          </div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-5">
      <div class="gallery-item" data-title="Desert Dunes">
        <interact-element data-interact-key="clip-5">
          <div class="image-clipper">
            <interact-element data-interact-key="img-5">
              <img src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070&auto=format&fit=crop" alt="Desert Dunes">
            </interact-element>
          </div>
        </interact-element>
        <interact-element data-interact-key="text-5">
          <div class="gallery-item-text">
            <h3 class="gallery-item-title">Desert Dunes</h3>
          </div>
        </interact-element>
      </div>
    </interact-element>

    <interact-element data-interact-key="item-6">
      <div class="gallery-item" data-title="City Lights">
        <interact-element data-interact-key="clip-6">
          <div class="image-clipper">
            <interact-element data-interact-key="img-6">
              <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop" alt="City Lights">
            </interact-element>
          </div>
        </interact-element>
        <interact-element data-interact-key="text-6">
          <div class="gallery-item-text">
            <h3 class="gallery-item-title">City Lights</h3>
          </div>
        </interact-element>
      </div>
    </interact-element>

  </div>
</div>
```

## Essential styles

```css
body {
    font-family: 'Inter', sans-serif;
    background-color: #000;
    color: white;
    overflow: hidden;
    margin: 0;
}
.gallery-container {
    display: flex;
    align-items: center;
    height: 100vh;
    width: 100vw;
    position: relative;
}
.gallery-grid {
    display: flex;
    overflow-x: auto;
    padding: 0 1.5vw;
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: auto;
}
.gallery-grid::-webkit-scrollbar { display: none; }

.gallery-item {
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    height: 50vh;
    width: 30vw;
    margin: 0 1.5vw;
    background-color: #000;
    overflow: hidden;
    border-radius: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.image-clipper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    clip-path: ellipse(142% 142% at 50% 50%);
    transform: rotate(0deg);
    will-change: transform, clip-path;
}

.gallery-item img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1) rotate(0deg);
    will-change: transform;
}

.gallery-item-text {
    position: relative;
    z-index: 5;
    color: white;
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
}

.gallery-item-title {
    font-size: clamp(0.8rem, 2vw, 1.2rem);
    font-weight: 700;
    text-transform: uppercase;
}
```

## Interact config

```js
const itemCount = 6;
const interactions = [];

for (let i = 1; i <= itemCount; i++) {
    interactions.push({
        key: `item-${i}`,
        trigger: 'hover',
        effects: [
            {
                key: `clip-${i}`,
                transition: {
                    duration: 600,
                    easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
                    styleProperties: [
                        { name: 'transform', value: 'rotate(45deg)' },
                        { name: 'clip-path', value: 'ellipse(35% 45% at 50% 50%)' }
                    ]
                }
            },
            {
                key: `img-${i}`,
                transition: {
                    duration: 600,
                    easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
                    styleProperties: [
                        { name: 'transform', value: 'rotate(-45deg) scale(1.5)' }
                    ]
                }
            },
            {
                key: `text-${i}`,
                transition: {
                    duration: 500,
                    easing: 'ease-out',
                    styleProperties: [
                        { name: 'opacity', value: '1' },
                        { name: 'transform', value: 'translateY(0)' }
                    ]
                }
            }
        ]
    });
}

{ interactions }
```

## Animation logic

```js
const container = document.querySelector('.gallery-container');
const slider = document.querySelector('.gallery-grid');

let scrollSpeed = 0;
const SCROLL_AMOUNT = 5;

const leftCursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\'><polyline points=\'15 6 9 12 15 18\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/></svg>") 4 12, auto';
const rightCursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\'><polyline points=\'9 6 15 12 9 18\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/></svg>") 20 12, auto';

container.addEventListener('mousemove', (e) => {
    const containerRect = container.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const containerWidth = containerRect.width;
    const hotZoneWidth = containerWidth * 0.15;

    if (mouseX < hotZoneWidth) {
        scrollSpeed = -SCROLL_AMOUNT;
        container.style.cursor = leftCursor;
    } else if (mouseX > containerWidth - hotZoneWidth) {
        scrollSpeed = SCROLL_AMOUNT;
        container.style.cursor = rightCursor;
    } else {
        scrollSpeed = 0;
        container.style.cursor = 'default';
    }
});

container.addEventListener('mouseleave', () => {
    scrollSpeed = 0;
    container.style.cursor = 'default';
});

gsap.ticker.add(() => {
    if (scrollSpeed !== 0) {
        slider.style.pointerEvents = 'none';
        slider.scrollLeft += scrollSpeed;
    } else {
        slider.style.pointerEvents = 'auto';
    }
});
```
