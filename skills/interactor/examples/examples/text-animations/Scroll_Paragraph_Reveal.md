# Scroll Paragraph Reveal

Words in a paragraph and eyebrow headline are individually revealed with a staggered scroll-driven animation — each word rises up, fades in, and deblurs as the user scrolls through a tall sticky section.

**Tags:** viewProgress, opacity, transform, filter, reveal, stagger, blur, sticky

## Markup

```html
<div class="spacer"><p>Scroll Down ↓</p></div>

<interact-element data-interact-key="scroll-track">
  <div class="scroll-track">
    <div class="sticky-container">
      <div class="text-wrapper">
        <h2 class="text-content eyebrow" aria-label="The Philosophy">
          <span class="word" aria-hidden="true">The</span>
          <span class="word" aria-hidden="true">Philosophy</span>
        </h2>
        <h1
          class="text-content main-text"
          aria-label="Designing interactions shouldn't be a struggle. We want text that flows like water, rising from the depths as you scroll."
        >
          <span class="word" aria-hidden="true">Designing</span>
          <span class="word" aria-hidden="true">interactions</span>
          <span class="word" aria-hidden="true">shouldn't</span>
          <span class="word" aria-hidden="true">be</span>
          <span class="word" aria-hidden="true">a</span>
          <span class="word" aria-hidden="true">struggle.</span>
        </h1>
      </div>
    </div>
  </div>
</interact-element>

<div class="spacer"><p>End of Section</p></div>
```

## Essential styles

```css
body {
  min-height: 100vh;
  margin: 0;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
body::-webkit-scrollbar {
  width: 0;
}

.spacer {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-track {
  position: relative;
  height: 300vh;
}

.sticky-container {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 5rem;
  overflow: clip;
}

.text-wrapper {
  max-width: 56rem;
}

.text-content {
  line-height: 1.2;
}

.eyebrow {
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.main-text {
  font-size: clamp(2rem, 5vw, 3.75rem);
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.75rem;
  row-gap: 0.5rem;
}

.word {
  display: inline-block;
  white-space: pre;
  transform-origin: bottom left;
  will-change: transform, opacity;
  opacity: 0.1;
  transform: translateY(20px);
}
```

## Interact config

```js
const wordRevealEffect = (element, progress) => {
  const wordElements = element.querySelectorAll('.word');
  const totalWords = wordElements.length;

  const finishAt = 0.8;
  const effectiveProgress = Math.min(progress / finishAt, 1.0);

  const entrySpeed = 0.1;

  wordElements.forEach((word, index) => {
    const start = (index / totalWords) * (1 - entrySpeed);
    const end = start + entrySpeed;

    let localProgress = (effectiveProgress - start) / (end - start);

    if (localProgress < 0) localProgress = 0;
    if (localProgress > 1) localProgress = 1;

    const eased = 1 - Math.pow(1 - localProgress, 3);

    const y = 40 - 40 * eased;
    const alpha = Math.max(0.1, eased);
    const blur = 10 - 10 * eased;

    word.style.transform = `translate3d(0, ${y}px, 0)`;
    word.style.opacity = alpha;
    word.style.filter = `blur(${blur}px)`;
  });
};

const config = {
  interactions: [
    {
      key: 'scroll-track',
      trigger: 'viewProgress',
      effects: [
        {
          customEffect: wordRevealEffect,
          fill: 'both',
          composite: 'replace',
          rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
        },
      ],
    },
  ],
};
```
