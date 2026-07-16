# Horizontal and Vertical Scroll

Six image cards rise up from below the viewport in a staggered sequence as the user scrolls, then the entire row slides horizontally to reveal remaining cards — all driven by a single viewProgress trigger on a tall sticky section.

**Tags:** viewProgress, sticky, transform, stagger, scroll, gallery

## Markup

```html
<interact-element data-interact-key="#scroll-section">
  <section id="scroll-section" class="relative" style="height:900vh;">
    <div class="sticky-wrap">
      <interact-element data-interact-key="#stack">
        <div id="stack" class="flex w-max">
          <interact-element data-interact-key="#card-1">
            <div id="card-1" class="card relative flex flex-col justify-end overflow-hidden">
              <img src="" />
              <div class="card-content p-6 md:p-8">
                <h2 class="text-3xl md:text-4xl font-bold">Discovery</h2>
                <p class="text-base md:text-lg">Every scroll reveals something new.</p>
              </div>
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-2">
            <div id="card-2" class="card relative flex flex-col justify-end overflow-hidden">
              <img src="" />
              <div class="card-content p-6 md:p-8">
                <h2 class="text-3xl md:text-4xl font-bold">Progression</h2>
                <p class="text-base md:text-lg">Building momentum with each frame.</p>
              </div>
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-3">
            <div id="card-3" class="card relative flex flex-col justify-end overflow-hidden">
              <img src="" />
              <div class="card-content p-6 md:p-8">
                <h2 class="text-3xl md:text-4xl font-bold">Harmony</h2>
                <p class="text-base md:text-lg">Where design and motion align.</p>
              </div>
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-4">
            <div id="card-4" class="card relative flex flex-col justify-end overflow-hidden">
              <img src="" />
              <div class="card-content p-6 md:p-8">
                <h2 class="text-3xl md:text-4xl font-bold">Energy</h2>
                <p class="text-base md:text-lg">A dynamic visual experience.</p>
              </div>
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-5">
            <div id="card-5" class="card relative flex flex-col justify-end overflow-hidden">
              <img src="" />
              <div class="card-content p-6 md:p-8">
                <h2 class="text-3xl md:text-4xl font-bold">Clarity</h2>
                <p class="text-base md:text-lg">The story becomes clear.</p>
              </div>
            </div>
          </interact-element>

          <interact-element data-interact-key="#card-6">
            <div id="card-6" class="card relative flex flex-col justify-end overflow-hidden">
              <img src="" />
              <div class="card-content p-6 md:p-8">
                <h2 class="text-3xl md:text-4xl font-bold">Finale</h2>
                <p class="text-base md:text-lg">The final view unfolds.</p>
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
:root {
  --hvs-gap: 4;
  --hvs-card-w: 33.3;
  --hvs-card-h: 75;
}

.sticky-wrap {
  position: sticky;
  top: calc((100 - var(--hvs-card-h)) / 2 * 1vh);
  height: calc(var(--hvs-card-h) * 1vh);
  width: 100%;
  overflow: clip;
}

#stack {
  gap: calc(var(--hvs-gap) * 1px);
}

.card {
  transform: translateY(100vh);
  width: 80vw;
  height: calc(var(--hvs-card-h) * 1vh);
}

@media (min-width: 768px) {
  .card {
    width: calc(var(--hvs-card-w) * 1vw);
  }
}

.card img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.card .card-content {
  position: relative;
  z-index: 2;
}
```

## Interact config

```js
const numCards = 6;

const root = getComputedStyle(document.documentElement);
const gap = parseFloat(root.getPropertyValue('--hvs-gap'));
const cardH = parseFloat(root.getPropertyValue('--hvs-card-h'));
const cardW = parseFloat(root.getPropertyValue('--hvs-card-w'));
const scrollGapPX = (numCards - 1) * gap;
const mobileScrollEnd = `translateX(calc(-${numCards * 80 - 100}vw - ${scrollGapPX}px))`;
const desktopScrollEnd = `translateX(calc(-${numCards * cardW - 100}vw - ${scrollGapPX}px))`;

const entryOffset = Math.max(cardH + 10, 100);

const config = {
  conditions: {
    desktop: { type: 'media', predicate: '(min-width: 768px)' },
    mobile: { type: 'media', predicate: '(max-width: 767px)' },
  },
  interactions: [
    {
      key: '#scroll-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: '#stack',
          conditions: ['desktop'],
          keyframeEffect: {
            name: 'stack-scroll-desktop',
            keyframes: [{ transform: 'translateX(0vw)' }, { transform: desktopScrollEnd }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 90 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#stack',
          conditions: ['mobile'],
          keyframeEffect: {
            name: 'stack-scroll-mobile',
            keyframes: [{ transform: 'translateX(0vw)' }, { transform: mobileScrollEnd }],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 90 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-1',
          keyframeEffect: {
            name: 'card-1-scroll-effect',
            keyframes: [
              { transform: `translateY(${entryOffset}vh)` },
              { transform: 'translateY(0vh)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 10 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 40 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-2',
          keyframeEffect: {
            name: 'card-2-scroll-effect',
            keyframes: [
              { transform: `translateY(${entryOffset}vh)` },
              { transform: 'translateY(0vh)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 10 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-3',
          keyframeEffect: {
            name: 'card-3-scroll-effect',
            keyframes: [
              { transform: `translateY(${entryOffset}vh)` },
              { transform: 'translateY(0vh)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 10 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 60 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-4',
          keyframeEffect: {
            name: 'card-4-scroll-effect',
            keyframes: [
              { transform: `translateY(${entryOffset}vh)` },
              { transform: 'translateY(0vh)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 40 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 70 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-5',
          keyframeEffect: {
            name: 'card-5-scroll-effect',
            keyframes: [
              { transform: `translateY(${entryOffset}vh)` },
              { transform: 'translateY(0vh)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 50 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 80 } },
          easing: 'linear',
          fill: 'both',
        },
        {
          key: '#card-6',
          keyframeEffect: {
            name: 'card-6-scroll-effect',
            keyframes: [
              { transform: `translateY(${entryOffset}vh)` },
              { transform: 'translateY(0vh)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 60 } },
          rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: 90 } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```
