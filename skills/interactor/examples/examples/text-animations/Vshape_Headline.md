# V Shape Headline

Letters of the word "INTERACT" bounce in from below in a V-curve formation on viewport enter, then flatten to a straight baseline as the user scrolls through a sticky section.

**Tags:** viewEnter, viewProgress, stagger, transform, opacity, sticky, typography, 3d

## Markup

```html
<div class="min-h-[500vh]">
  <div class="h-[80vh] flex items-center justify-center">
    <p>Scroll Down ↓</p>
  </div>

  <interact-element data-interact-key="scroll-track" class="track-wrapper h-[300vh] relative">
    <div class="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
      <h1 aria-label="INTERACT" class="text-6xl md:text-9xl mb-8 flex gap-2 perspective-1000">
        <interact-element data-interact-key="letter-0" aria-hidden="true"
          ><span class="letter-span">I</span></interact-element
        >
        <interact-element data-interact-key="letter-1" aria-hidden="true"
          ><span class="letter-span">N</span></interact-element
        >
        <interact-element data-interact-key="letter-2" aria-hidden="true"
          ><span class="letter-span">T</span></interact-element
        >
        <interact-element data-interact-key="letter-3" aria-hidden="true"
          ><span class="letter-span">E</span></interact-element
        >
        <interact-element data-interact-key="letter-4" aria-hidden="true"
          ><span class="letter-span">R</span></interact-element
        >
        <interact-element data-interact-key="letter-5" aria-hidden="true"
          ><span class="letter-span">A</span></interact-element
        >
        <interact-element data-interact-key="letter-6" aria-hidden="true"
          ><span class="letter-span">C</span></interact-element
        >
        <interact-element data-interact-key="letter-7" aria-hidden="true"
          ><span class="letter-span">T</span></interact-element
        >
      </h1>

      <div class="max-w-md text-center px-6 z-10 mt-12">
        <p>Sample text provides enough length to demonstrate this animated content layout.</p>
      </div>
    </div>
  </interact-element>

  <div class="h-screen flex items-center justify-center">
    <p>End of Section</p>
  </div>
</div>
```

## Essential styles

```css
body::-webkit-scrollbar {
  display: none;
}
body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

interact-element {
  display: inline-flex;
}

interact-element.track-wrapper {
  display: block;
}

.letter-span {
  display: inline-block;
  will-change: transform;
  opacity: 0;
}
```

## Interact config

```js
const text = 'INTERACT';
const enterLeft = [];
const enterRight = [];
const flattenEffects = [];

text.split('').forEach((_, index) => {
  const key = `letter-${index}`;
  const distFromCenter = Math.abs(index - (text.length - 1) / 2);

  const curveOffset = distFromCenter * distFromCenter * -12;
  const fixOffset = -1 * curveOffset;

  const enterEffect = {
    key,
    keyframeEffect: {
      name: `bounce-in-${index}`,
      keyframes: [
        { opacity: 0, transform: 'translateY(50vh)' },
        { opacity: 1, offset: 0.6 },
        { opacity: 1, transform: `translateY(${curveOffset}px)` },
      ],
    },
    duration: 1000,
    easing: 'cubic-bezier(0.18, 1.25, 0.4, 1)',
    fill: 'both',
    composite: 'replace',
  };

  if (index < text.length / 2) enterLeft.unshift(enterEffect);
  else enterRight.push(enterEffect);

  flattenEffects.push({
    key,
    keyframeEffect: {
      name: `flatten-${index}`,
      keyframes: [{ transform: 'translateY(0px)' }, { transform: `translateY(${fixOffset}px)` }],
    },
    rangeStart: { name: 'contain', offset: { value: 10, unit: 'percentage' } },
    rangeEnd: { name: 'contain', offset: { value: 90, unit: 'percentage' } },
    fill: 'both',
    composite: 'add',
  });
});

const config = {
  interactions: [
    {
      key: 'scroll-track',
      trigger: 'viewEnter',
      params: { threshold: 0.1 },
      sequences: [
        { delay: 30, offset: 60, triggerType: 'once', effects: enterLeft },
        { delay: 30, offset: 60, triggerType: 'once', effects: enterRight },
      ],
    },
    {
      key: 'scroll-track',
      trigger: 'viewProgress',
      effects: flattenEffects,
    },
  ],
};
```
