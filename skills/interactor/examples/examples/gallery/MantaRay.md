# Manta Ray

A horizontal overlapping gallery where each image breathes with a continuous vertical float loop triggered on view enter, and scales up on hover, with staggered per-item delays and seeded random size variation.

**Tags:** hover, viewEnter, gallery, flex, transform, scale, opacity, loop, stagger

## Markup

```html
<section class="min-h-screen flex items-center justify-center py-12 px-[10px] overflow-hidden">
  <interact-element data-interact-key="gallery">
    <div id="gallery-container" class="flex flex-nowrap justify-center items-center w-full gallery-wrapper">
      <interact-element data-interact-key="img-wrapper-0" class="pointer-events-auto cursor-pointer" style="--rnd-off: 0.20">
        <img src="" class="w-full h-auto shadow-md rounded-sm">
      </interact-element>
      <interact-element data-interact-key="img-wrapper-1" class="pointer-events-auto cursor-pointer" style="--rnd-off: -0.62">
        <img src="" class="w-full h-auto shadow-md rounded-sm">
      </interact-element>
      <interact-element data-interact-key="img-wrapper-2" class="pointer-events-auto cursor-pointer" style="--rnd-off: 0.84">
        <img src="" class="w-full h-auto shadow-md rounded-sm">
      </interact-element>
      <interact-element data-interact-key="img-wrapper-3" class="pointer-events-auto cursor-pointer" style="--rnd-off: -0.30">
        <img src="" class="w-full h-auto shadow-md rounded-sm">
      </interact-element>
      <interact-element data-interact-key="img-wrapper-4" class="pointer-events-auto cursor-pointer" style="--rnd-off: 0.56">
        <img src="" class="w-full h-auto shadow-md rounded-sm">
      </interact-element>
      <interact-element data-interact-key="img-wrapper-5" class="pointer-events-auto cursor-pointer" style="--rnd-off: -0.78">
        <img src="" class="w-full h-auto shadow-md rounded-sm">
      </interact-element>
    </div>
  </interact-element>
</section>

<interact-element data-interact-key="tooltip-wrapper" class="fixed bottom-4 left-4 pointer-events-none z-[99999]">
  <div id="image-tooltip" class="text-black opacity-0 transform translate-y-4 transition-all duration-300 ease-out">
    <h3 id="tooltip-title" class="font-extrabold text-2xl text-gray-900">Crimson Bloom</h3>
    <p id="tooltip-subtitle" class="text-lg text-gray-600">By Artist Name 1</p>
  </div>
</interact-element>
```

## Essential styles

```css
body { font-family: 'Inter', sans-serif; }

interact-element:not(:defined) { opacity: 0; }

:root {
    --base-size: 12;
    --size-variation: 0;
    --overlap-ratio: 0.67;
}

.gallery-wrapper {
    perspective: 1000px;
}

interact-element[data-interact-key="gallery"] {
    display: contents;
}

interact-element[data-interact-key^="img-wrapper-"] {
    width: max(
        calc(var(--base-size) * 0.3 * 1vw),
        calc((var(--base-size) + var(--rnd-off, 0) * var(--size-variation) * var(--base-size) * 1.5) * 1vw)
    );
    flex-shrink: 0;
}

#gallery-container > interact-element + interact-element {
    margin-left: calc(var(--base-size) * var(--overlap-ratio) * -1vw);
}

interact-element {
    position: relative;
    z-index: 1;
    transition: z-index 0s;
}

interact-element:hover {
    z-index: 9999 !important;
}

.tooltip-visible { opacity: 1 !important; transform: translateY(0) !important; }
.tooltip-hidden { opacity: 0 !important; transform: translateY(16px) !important; }
```

## Interact config

```js
const HOVER_SCALE = 2.5;

const imageData = [
    { title: "Crimson Bloom", sub: "By Artist Name 1" },
    { title: "Azure Waves", sub: "By Artist Name 2" },
    { title: "Golden Fields", sub: "By Artist Name 3" },
    { title: "Forest Deep", sub: "By Artist Name 4" },
    { title: "Urban Lines", sub: "By Artist Name 5" },
    { title: "Pastel Sky", sub: "By Artist Name 6" }
];

const interactConfig = {
    effects: {
        'breathe-vertical': {
            keyframeEffect: {
                name: 'breathe',
                keyframes: [
                    { transform: 'translateY(-62px)' },
                    { transform: 'translateY(262px)' }
                ]
            },
            duration: 2000,
            easing: 'ease-in-out',
            iterations: Infinity,
            alternate: true
        },
        'scale-up-image': {
            keyframeEffect: {
                name: 'scale-up',
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(' + HOVER_SCALE + ')' }
                ]
            },
            duration: 300,
            easing: 'ease-out',
            fill: 'both'
        }
    },
    interactions: [
        {
            key: 'gallery',
            trigger: 'viewEnter',
            params: { threshold: 0 },
            sequences: [{
                offset: 150,
                triggerType: 'once',
                effects: [{
                    selector: '#gallery-container > interact-element > img',
                    effectId: 'breathe-vertical',
                    composite: 'add'
                }]
            }]
        }
    ]
};

imageData.forEach((data, index) => {
    const wrapperId = `img-wrapper-${index}`;

    interactConfig.interactions.push({
        key: wrapperId,
        trigger: 'hover',
        effects: [
            {
                key: wrapperId,
                selector: 'img',
                effectId: 'scale-up-image',
                triggerType: 'alternate',
                composite: 'add'
            }
        ]
    });
});
```
