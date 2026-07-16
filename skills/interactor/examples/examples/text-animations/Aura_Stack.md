# Aura Stack

Three sticky typographic slides stack over a long scroll container and each transitions through a blur-fade-scale lifecycle — the first slides exits upward with blur, while the second and third fade in from below with staggered content reveals.

**Tags:** viewProgress, sticky, opacity, transform, filter, blur, stagger, reveal, fade, parallax

## Markup

```html
<interact-element data-interact-key="main-scroll-trigger">
  <div class="relative h-[700vh]">
    <div class="sticky-container">
      <interact-element data-interact-key="slide-1">
        <div class="slide slide-1">
          <div class="absolute top-12 left-12 label-text">Sequence 01</div>
          <div class="absolute bottom-12 right-12 label-text">Scroll to Explore</div>
          <div class="text-center px-6">
            <interact-element data-interact-key="s1-content">
              <h1 class="mega-text">Origin.</h1>
              <div class="mt-10 inline-block px-8 py-3 label-text">The Foundation of Motion</div>
            </interact-element>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="slide-2">
        <div class="slide slide-2">
          <interact-element data-interact-key="s2-bg-num"> </interact-element>
          <div class="relative z-10 w-full max-w-7xl px-10">
            <interact-element data-interact-key="s2-header">
              <div class="pb-10 mb-16">
                <div class="flex justify-between items-end mb-4">
                  <span class="label-text">Chapter Two</span>
                  <span class="label-text">Philosophy</span>
                </div>
                <h2 class="text-6xl md:text-9xl leading-none">Essentialism.</h2>
              </div>
            </interact-element>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-20">
              <interact-element data-interact-key="s2-body-left">
                <p class="text-3xl md:text-5xl leading-tight">
                  Clarity through restraint. By curating the essential, we amplify every detail.
                </p>
              </interact-element>
              <interact-element data-interact-key="s2-body-right">
                <div class="flex flex-col gap-8">
                  <p class="text-xl leading-relaxed max-w-lg">
                    Sample text provides enough length to demonstrate this animated content layout.
                  </p>
                  <div class="w-16 h-px"></div>
                </div>
              </interact-element>
            </div>
          </div>
        </div>
      </interact-element>

      <interact-element data-interact-key="slide-3">
        <div class="slide slide-3">
          <interact-element data-interact-key="s3-bg-num"> </interact-element>
          <div class="relative z-10 w-full max-w-7xl px-10">
            <interact-element data-interact-key="s3-header">
              <div class="pb-10 mb-16">
                <div class="flex justify-between items-end mb-4">
                  <span class="label-text">Chapter Three</span>
                  <span class="label-text">Architecture</span>
                </div>
                <h2 class="text-6xl md:text-9xl leading-none">Structure.</h2>
              </div>
            </interact-element>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
              <interact-element data-interact-key="s3-col-1">
                <div class="flex flex-col gap-6">
                  <span class="text-5xl">01</span>
                  <h3 class="text-2xl">Rhythm</h3>
                  <p class="leading-relaxed">
                    The underlying grid defines the tempo of the entire visual journey.
                  </p>
                </div>
              </interact-element>
              <interact-element data-interact-key="s3-col-2">
                <div class="flex flex-col gap-6">
                  <span class="text-5xl">02</span>
                  <h3 class="text-2xl">Hierarchy</h3>
                  <p class="leading-relaxed">
                    Intentional scale creates immediate points of interest for the eye.
                  </p>
                </div>
              </interact-element>
              <interact-element data-interact-key="s3-col-3">
                <div class="flex flex-col gap-6">
                  <span class="text-5xl">03</span>
                  <h3 class="text-2xl">Balance</h3>
                  <p class="leading-relaxed">
                    Negative space provides the breathing room necessary for focus.
                  </p>
                </div>
              </interact-element>
            </div>
          </div>
        </div>
      </interact-element>
    </div>
  </div>
</interact-element>

<footer class="h-screen flex flex-col items-center justify-center p-12">
  <div class="text-center">
    <p class="label-text mb-6">Sequence Complete</p>
    <h2 class="text-5xl">Design Lab.</h2>
    <p class="mt-8 max-w-md mx-auto">
      Explore the boundaries of digital interaction and refined aesthetics.
    </p>
  </div>
</footer>
```

## Essential styles

```css
body {
  margin: 0;
  padding: 0;
  overflow-x: clip;
}

.sticky-container {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: clip;
}

.slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform, opacity, filter;
}

.slide-1 {
  z-index: 3;
}
.slide-2 {
  z-index: 2;
}
.slide-3 {
  z-index: 1;
}

.mega-text {
  font-size: clamp(4rem, 15vw, 18rem);
  line-height: 0.95;
}

.label-text {
  font-size: 0.75rem;
  opacity: 0.5;
}
```

## Interact config

```js
const BLUR_INTENSITY = 1;
const b = (px) => `blur(${px * BLUR_INTENSITY}px)`;

const config = {
  interactions: [
    {
      key: 'main-scroll-trigger',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'slide-1',
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          keyframeEffect: {
            name: 's1-exit-blur',
            keyframes: [
              { offset: 0, opacity: 1, filter: b(0), transform: 'scale(1)' },
              { offset: 0.2, opacity: 1, filter: b(15), transform: 'scale(1)' },
              { offset: 0.35, opacity: 0, filter: b(30), transform: 'scale(0.9)' },
              { offset: 1, opacity: 0 },
            ],
          },
        },
        {
          key: 's1-content',
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          keyframeEffect: {
            name: 's1-parallax',
            keyframes: [
              { offset: 0, transform: 'translateY(0)' },
              { offset: 0.35, transform: 'translateY(-80px)' },
              { offset: 1, transform: 'translateY(-80px)' },
            ],
          },
        },
        {
          key: 'slide-2',
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          keyframeEffect: {
            name: 's2-lifecycle',
            keyframes: [
              { offset: 0, opacity: 0, transform: 'translateY(100px)', filter: b(10) },
              { offset: 0.35, opacity: 0, transform: 'translateY(100px)', filter: b(10) },
              { offset: 0.5, opacity: 1, transform: 'translateY(0)', filter: b(0) },
              { offset: 0.65, opacity: 1, filter: b(0), transform: 'scale(1)' },
              { offset: 0.8, opacity: 1, filter: b(15), transform: 'scale(1)' },
              { offset: 0.9, opacity: 0, filter: b(30), transform: 'scale(0.95)' },
              { offset: 1, opacity: 0 },
            ],
          },
        },
        ...['s2-header', 's2-body-left', 's2-body-right'].map((id, i) => ({
          key: id,
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          keyframeEffect: {
            name: `${id}-reveal`,
            keyframes: [
              { offset: 0.4 + i * 0.05, opacity: 0, transform: 'translateY(40px)' },
              { offset: 0.55 + i * 0.05, opacity: 1, transform: 'translateY(0)' },
              { offset: 1, opacity: 1 },
            ],
          },
        })),
        {
          key: 's2-bg-num',
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          keyframeEffect: {
            name: 's2-parallax-num',
            keyframes: [
              { offset: 0.3, transform: 'translateY(50px)' },
              { offset: 0.9, transform: 'translateY(-50px)' },
            ],
          },
        },
        {
          key: 'slide-3',
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          keyframeEffect: {
            name: 's3-lifecycle',
            keyframes: [
              { offset: 0, opacity: 0, transform: 'translateY(100px)', filter: b(10) },
              { offset: 0.8, opacity: 0, transform: 'translateY(100px)', filter: b(10) },
              { offset: 0.95, opacity: 1, transform: 'translateY(0)', filter: b(0) },
              { offset: 1, opacity: 1 },
            ],
          },
        },
        ...['s3-col-1', 's3-col-2', 's3-col-3'].map((id, i) => ({
          key: id,
          rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
          rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
          fill: 'both',
          keyframeEffect: {
            name: `${id}-stagger`,
            keyframes: [
              { offset: 0.88 + i * 0.03, opacity: 0, transform: 'translateY(30px)' },
              { offset: 0.98, opacity: 1, transform: 'translateY(0)' },
              { offset: 1, opacity: 1 },
            ],
          },
        })),
      ],
    },
  ],
};
```
