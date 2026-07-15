# Manta Ray

A horizontal overlapping gallery where each image breathes with a continuous vertical float loop triggered on view enter, and scales up on hover, with staggered per-item delays and seeded random size variation.

**Tags:** hover, viewEnter, gallery, flex, transform, scale, opacity, loop, stagger

## Markup

```html
<section class="min-h-screen flex items-center justify-center py-12 px-[10px] overflow-hidden">
  <div id="gallery-container" class="flex flex-nowrap justify-center items-center w-full gallery-wrapper">
    <interact-element data-interact-key="img-wrapper-0" class="pointer-events-auto cursor-pointer" style="--rnd-off: 0.20">
      <img src="https://static.wixstatic.com/media/9eca39_2fa2f1a0c40e452d8daa09d09459e275~mv2.jpg" alt="Crimson Bloom" class="w-full h-auto shadow-md rounded-sm">
    </interact-element>
    <interact-element data-interact-key="img-wrapper-1" class="pointer-events-auto cursor-pointer" style="--rnd-off: -0.62">
      <img src="https://static.wixstatic.com/media/9eca39_ebda7ab78f9c4009af3bba3ed53ff151~mv2.jpg" alt="Azure Waves" class="w-full h-auto shadow-md rounded-sm">
    </interact-element>
    <interact-element data-interact-key="img-wrapper-2" class="pointer-events-auto cursor-pointer" style="--rnd-off: 0.84">
      <img src="https://static.wixstatic.com/media/9eca39_efb67cf117ae4ddea9f2b0bc134c26d0~mv2.jpg" alt="Golden Fields" class="w-full h-auto shadow-md rounded-sm">
    </interact-element>
    <interact-element data-interact-key="img-wrapper-3" class="pointer-events-auto cursor-pointer" style="--rnd-off: -0.30">
      <img src="https://static.wixstatic.com/media/9eca39_37834a42d48547658ca5d3ca0046250a~mv2.webp" alt="Forest Deep" class="w-full h-auto shadow-md rounded-sm">
    </interact-element>
    <interact-element data-interact-key="img-wrapper-4" class="pointer-events-auto cursor-pointer" style="--rnd-off: 0.56">
      <img src="https://static.wixstatic.com/media/9eca39_565eb438708548da92653669027017a8~mv2.webp" alt="Urban Lines" class="w-full h-auto shadow-md rounded-sm">
    </interact-element>
    <interact-element data-interact-key="img-wrapper-5" class="pointer-events-auto cursor-pointer" style="--rnd-off: -0.78">
      <img src="https://static.wixstatic.com/media/9eca39_5a41dd4ed9284d6dacf0d2ec84697472~mv2.jpg" alt="Pastel Sky" class="w-full h-auto shadow-md rounded-sm">
    </interact-element>
  </div>
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
    interactions: []
};

imageData.forEach((data, index) => {
    const wrapperId = `img-wrapper-${index}`;

    interactConfig.interactions.push({
        key: wrapperId,
        trigger: 'viewEnter',
        params: { threshold: 0 },
        effects: [
            {
                key: wrapperId,
                effectId: 'breathe-vertical',
                triggerType: 'once',
                delay: index * 150,
                composite: 'add'
            }
        ]
    });

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
