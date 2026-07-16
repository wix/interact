# Shape Mask Parallax

As the page scrolls through a 500vh sticky section, a single image is revealed through five different SVG shape masks that swap in sequence — rectangle, organic curves, abstract blobs, rounded-square grid, and polygon arrow.

**Tags:** viewProgress, sticky, opacity, fade, reveal

## Markup

```html
<interact-element data-interact-key="scroll-driver" class="scroll-driver">
  <div class="sticky-stage">
    <div class="layout">
      <div class="image-col">
        <interact-element data-interact-key="mask-1" class="mask-wrap">
          <div class="masked-image mask-shape-1"></div>
        </interact-element>
        <interact-element data-interact-key="mask-2" class="mask-wrap">
          <div class="masked-image mask-shape-2"></div>
        </interact-element>
        <interact-element data-interact-key="mask-3" class="mask-wrap">
          <div class="masked-image mask-shape-3"></div>
        </interact-element>
        <interact-element data-interact-key="mask-4" class="mask-wrap">
          <div class="masked-image mask-shape-4"></div>
        </interact-element>
        <interact-element data-interact-key="mask-5" class="mask-wrap">
          <div class="masked-image mask-shape-5"></div>
        </interact-element>
      </div>

      <div class="text-col">
        <interact-element data-interact-key="text-block">
          <div class="text-inner">
            <p class="label">About Me</p>
            <h2 class="title">The <em>Person</em><br />Behind It All</h2>
            <p class="description">
              Sample text provides enough length to demonstrate this animated content layout.
              <a href="#">Get in touch</a>
            </p>
          </div>
        </interact-element>
      </div>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

interact-element {
  display: block;
}

html,
body {
  height: 100%;
  overflow-x: clip;
}

.scroll-driver {
  height: 500vh;
  position: relative;
}

.sticky-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: clip;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout {
  display: flex;
  width: 100%;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 4rem;
  gap: 7rem;
  align-items: center;
  justify-content: center;
}

.image-col {
  flex: 1 1 55%;
  position: relative;
  height: 85vh;
  max-height: 800px;
}

.mask-wrap {
  position: absolute;
  inset: 0;
}

.masked-image {
  width: 100%;
  height: 100%;
  background-image: url('');
  background-size: cover;
  background-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.text-col {
  flex: 0 0 48%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 2rem;
}

.title {
  font-size: clamp(3rem, 6vw, 6.5rem);
  line-height: 1.05;
  font-weight: 400;
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.divider {
  display: none;
}

.description {
  font-size: 0.95rem;
  line-height: 1.8;
  font-weight: 300;
  max-width: 500px;
}

@media (max-width: 900px) {
  .layout {
    flex-direction: column;
    padding: 1.5rem;
    gap: 2rem;
    justify-content: center;
  }

  .image-col {
    flex: none;
    width: 100%;
    height: 42vh;
  }

  .text-col {
    flex: none;
    width: 100%;
  }

  .title {
    font-size: clamp(2rem, 7vw, 3rem);
  }

  .description {
    font-size: 0.875rem;
  }
}
```

## Interact config

```js
const maskShapes = [
  {
    selector: '.mask-shape-1',
    viewBox: '0 0 519 479',
    path: 'M0 0H518.5V479H0V0Z',
  },
  {
    selector: '.mask-shape-2',
    viewBox: '0 0 525 470',
    path: 'M350 0C446.65 0 525 78.3502 525 175V470C428.35 470 350 391.65 350 295V470C253.35 470 175 391.65 175 295V470C78.3502 470 3.8666e-06 391.65 0 295V0C96.6498 0 175 78.3502 175 175V0C271.65 0 350 78.3502 350 175V0Z',
  },
  {
    selector: '.mask-shape-3',
    viewBox: '0 0 525 495',
    path: 'M306.191 0C387.352 4.50047e-06 454.94 85.3952 469.614 198.376C472.351 88.3924 483.565 6.01402 496.986 6.0127C512.457 6.0127 525 115.477 525 250.507C525 385.537 512.457 495 496.986 495C483.149 494.999 471.656 407.429 469.383 292.32C454.248 404.445 386.939 488.974 306.191 488.974C235.798 488.974 175.616 424.734 151.312 333.974C143.912 424.723 125.529 488.986 104.021 488.987C77.8084 488.987 56.2349 393.527 53.5332 271.002C52.0823 393.564 40.6887 488.987 26.8457 488.987C12.0192 488.987 -1.86109e-05 379.523 0 244.493C2.83948e-05 109.463 12.0192 0.000227664 26.8457 0C40.7129 7.68953e-07 52.1224 95.7565 53.541 218.627C56.2768 96.2735 77.8339 0.999999 104.021 1C125.468 1.00078 143.807 64.8984 151.248 155.238C175.511 64.352 235.737 1.85543e-05 306.191 0Z',
  },
  {
    selector: '.mask-shape-4',
    viewBox: '0 0 525 501',
    path: 'M129.122 338.066C151.766 338.066 170.122 356.422 170.122 379.065V460C170.122 482.644 151.766 501 129.122 501H41C18.3564 501 9.03647e-05 482.644 0 460V379.065C0.00024519 356.422 18.3565 338.066 41 338.066H129.122ZM306.561 338.066C329.204 338.066 347.56 356.422 347.561 379.065V460C347.56 482.644 329.204 501 306.561 501H218.438C195.795 501 177.44 482.643 177.439 460V379.065C177.44 356.422 195.795 338.067 218.438 338.066H306.561ZM484 338.066C506.643 338.066 525 356.422 525 379.065V460C525 482.644 506.644 501 484 501H395.878C373.234 501 354.878 482.644 354.878 460V379.065C354.878 356.422 373.234 338.066 395.878 338.066H484ZM129.122 169.033C151.766 169.033 170.122 187.39 170.122 210.033V290.967C170.122 313.61 151.766 331.967 129.122 331.967H41C18.3563 331.967 0 313.61 0 290.967V210.033C0 187.39 18.3563 169.033 41 169.033H129.122ZM306.561 169.033C329.204 169.033 347.561 187.39 347.561 210.033V290.967C347.561 313.61 329.204 331.967 306.561 331.967H218.438C195.795 331.967 177.439 313.61 177.439 290.967V210.033C177.439 187.39 195.795 169.033 218.438 169.033H306.561ZM484 169.033C506.644 169.033 525 187.39 525 210.033V290.967C525 313.61 506.644 331.967 484 331.967H395.878C373.234 331.967 354.878 313.61 354.878 290.967V210.033C354.878 187.39 373.234 169.033 395.878 169.033H484ZM129.122 0C151.766 4.8106e-05 170.122 18.3564 170.122 41V121.934C170.122 144.577 151.766 162.934 129.122 162.934H41C18.3563 162.934 0 144.577 0 121.934V41C0 18.3563 18.3563 0 41 0H129.122ZM306.561 0C329.204 0 347.561 18.3563 347.561 41V121.934C347.561 144.577 329.204 162.934 306.561 162.934H218.439C195.796 162.934 177.439 144.577 177.439 121.934V41C177.439 18.3563 195.796 0 218.439 0H306.561ZM484 0C506.644 0 525 18.3563 525 41V121.934C525 144.577 506.644 162.934 484 162.934H395.878C373.234 162.934 354.878 144.577 354.878 121.934V41C354.878 18.3564 373.234 6.59163e-05 395.878 0H484Z',
  },
  {
    selector: '.mask-shape-5',
    viewBox: '0 0 501 495',
    path: 'M249.568 43.6777L286.817 0H481C492.046 2.9185e-06 501 8.95431 501 20V180.287L428.079 247.5L501 314.713V475C501 486.046 492.046 495 481 495H288.681L251.432 451.322L214.183 495H20C8.95432 495 1.89637e-05 486.046 0 475V314.713L72.9199 247.5L0 180.287V20C0 8.95431 8.95431 1.49578e-07 20 0H212.319L249.568 43.6777Z',
  },
];

maskShapes.forEach((m) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${m.viewBox}"><path d="${m.path}" fill="white"/></svg>`;
  const uri = 'url("")';
  document.querySelectorAll(m.selector).forEach((el) => {
    el.style.maskImage = uri;
    el.style.webkitMaskImage = uri;
  });
});

const fullRange = {
  rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
  rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  fill: 'both',
};

const config = {
  interactions: [
    {
      key: 'scroll-driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'mask-1',
          keyframeEffect: {
            name: 'mask-1-cut',
            keyframes: [
              { opacity: 1, offset: 0 },
              { opacity: 1, offset: 0.199 },
              { opacity: 0, offset: 0.2 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-2',
          keyframeEffect: {
            name: 'mask-2-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.199 },
              { opacity: 1, offset: 0.2 },
              { opacity: 1, offset: 0.399 },
              { opacity: 0, offset: 0.4 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-3',
          keyframeEffect: {
            name: 'mask-3-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.399 },
              { opacity: 1, offset: 0.4 },
              { opacity: 1, offset: 0.599 },
              { opacity: 0, offset: 0.6 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-4',
          keyframeEffect: {
            name: 'mask-4-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.599 },
              { opacity: 1, offset: 0.6 },
              { opacity: 1, offset: 0.799 },
              { opacity: 0, offset: 0.8 },
              { opacity: 0, offset: 1 },
            ],
          },
          ...fullRange,
        },
        {
          key: 'mask-5',
          keyframeEffect: {
            name: 'mask-5-cut',
            keyframes: [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.799 },
              { opacity: 1, offset: 0.8 },
              { opacity: 1, offset: 1 },
            ],
          },
          ...fullRange,
        },
      ],
    },
  ],
};
```
