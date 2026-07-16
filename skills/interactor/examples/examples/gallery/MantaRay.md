# Manta Ray

A horizontal overlapping gallery where images enter as a staggered sequence, breathe with a continuous vertical loop, and scale up on hover.

**Tags:** hover, viewEnter, gallery, flex, transform, scale, opacity, loop, stagger

## Markup

```html
<section class="min-h-screen flex items-center justify-center py-12 px-[10px] overflow-hidden">
  <interact-element data-interact-key="gallery">
    <div
      id="gallery-container"
      class="flex flex-nowrap justify-center items-center w-full gallery-wrapper"
    >
      <interact-element
        data-interact-key="img-wrapper-0"
        class="pointer-events-auto cursor-pointer"
      >
        <img src="" class="w-full h-auto rounded-sm" />
      </interact-element>
      <interact-element
        data-interact-key="img-wrapper-1"
        class="pointer-events-auto cursor-pointer"
      >
        <img src="" class="w-full h-auto rounded-sm" />
      </interact-element>
      <interact-element
        data-interact-key="img-wrapper-2"
        class="pointer-events-auto cursor-pointer"
      >
        <img src="" class="w-full h-auto rounded-sm" />
      </interact-element>
      <interact-element
        data-interact-key="img-wrapper-3"
        class="pointer-events-auto cursor-pointer"
      >
        <img src="" class="w-full h-auto rounded-sm" />
      </interact-element>
    </div>
  </interact-element>
</section>
```

## Essential styles

```css
:root {
  --base-size: 12;
  --overlap-ratio: 0.67;
}

.gallery-wrapper {
  perspective: 1000px;
}

interact-element[data-interact-key='gallery'] {
  display: contents;
}

interact-element[data-interact-key^='img-wrapper-'] {
  width: calc(var(--base-size) * 1vw);
  flex-shrink: 0;
}

#gallery-container > interact-element + interact-element {
  margin-left: calc(var(--base-size) * var(--overlap-ratio) * -1vw);
}

interact-element {
  position: relative;
  z-index: 1;
}
```

## Interact config

```js
const HOVER_SCALE = 2.5;

const imageKeys = ['img-wrapper-0', 'img-wrapper-1', 'img-wrapper-2', 'img-wrapper-3'];

const config = {
  effects: {
    'breathe-vertical': {
      keyframeEffect: {
        name: 'breathe',
        keyframes: [{ transform: 'translateY(-62px)' }, { transform: 'translateY(262px)' }],
      },
      duration: 2000,
      easing: 'ease-in-out',
      iterations: Infinity,
      alternate: true,
    },
    'scale-up-image': {
      keyframeEffect: {
        name: 'scale-up',
        keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(' + HOVER_SCALE + ')' }],
      },
      duration: 300,
      easing: 'ease-out',
      fill: 'both',
    },
  },
  interactions: [
    {
      key: 'gallery',
      trigger: 'viewEnter',
      params: { threshold: 0 },
      sequences: [
        {
          offset: 150,
          triggerType: 'once',
          effects: [
            {
              selector: 'interact-element > img',
              effectId: 'breathe-vertical',
              composite: 'add',
            },
          ],
        },
      ],
    },
  ],
};

imageKeys.forEach((wrapperId) => {
  config.interactions.push({
    key: wrapperId,
    trigger: 'hover',
    effects: [
      {
        key: wrapperId,
        selector: 'img',
        effectId: 'scale-up-image',
        triggerType: 'alternate',
        composite: 'add',
      },
    ],
  });
});
```
