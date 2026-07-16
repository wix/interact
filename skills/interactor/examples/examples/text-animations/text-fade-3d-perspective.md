# Text Fade 3D Perspective

Three stacked full-screen text sections animate in and out with scroll-driven 3D perspective tilts and opacity fades as the page scrolls through a 700vh sticky container.

**Tags:** viewProgress, sticky, opacity, transform, 3d, fade, stagger, reveal, perspective

## Markup

```html
<interact-element data-interact-key="scroll-trigger">
  <div class="relative" style="height: 700vh">
    <div class="sticky-container">
      <!-- SECTION 1 — DESIGN -->
      <interact-element data-interact-key="slide-1">
        <div class="slide slide-1">
          <interact-element data-interact-key="s1-content">
            <div class="text-center px-6">
              <h1 class="hero-text">Design.</h1>
              <p class="mt-16 md:mt-20 sub-headline max-w-2xl mx-auto">
                Not what it looks like.<br />What it feels like.
              </p>
            </div>
          </interact-element>
        </div>
      </interact-element>

      <!-- SECTION 2 — LESS -->
      <interact-element data-interact-key="slide-2">
        <div class="slide slide-2">
          <interact-element data-interact-key="s2-bg">
            <div class="bg-glyph" style="bottom: -12%;right: -8%">Less</div>
          </interact-element>

          <div class="relative z-10 w-full max-w-5xl px-5 md:px-10">
            <interact-element data-interact-key="s2-header">
              <div class="mb-12 md:mb-20">
                <div class="label mb-8">The Principle</div>
                <h2 class="section-title">Less.<br />But better.</h2>
              </div>
            </interact-element>

            <div class="thin-rule mb-10 md:mb-16"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
              <interact-element data-interact-key="s2-left">
                <p class="sub-headline">
                  Remove everything that doesn't serve the experience. What remains is essential.
                </p>
              </interact-element>
              <interact-element data-interact-key="s2-right">
                <div class="flex flex-col gap-8 pt-2">
                  <p class="body-text">
                    Sample text provides enough length to demonstrate this animated content layout.
                  </p>
                  <p class="body-text">When you remove the unnecessary, the necessary speaks.</p>
                </div>
              </interact-element>
            </div>
          </div>
        </div>
      </interact-element>

      <!-- SECTION 3 — DETAIL -->
      <interact-element data-interact-key="slide-3">
        <div class="slide slide-3">
          <interact-element data-interact-key="s3-bg">
            <div class="bg-glyph" style="top: -8%;left: -6%">Detail</div>
          </interact-element>

          <div class="relative z-10 w-full max-w-5xl px-5 md:px-10">
            <interact-element data-interact-key="s3-header">
              <div class="text-center mb-12 md:mb-20">
                <div class="label mb-8">The Craft</div>
                <h2 class="section-title">Obsessed<br />with detail.</h2>
              </div>
            </interact-element>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <interact-element data-interact-key="s3-card-1">
                <div class="glass-card p-6 md:p-10 h-full">
                  <div class="text-4xl md:text-6xl mb-6 md:mb-10 leading-none">01</div>
                  <h3 class="text-lg mb-4">Space</h3>
                  <p class="text-sm leading-relaxed">
                    Sample text provides enough length to demonstrate this animated content layout.
                  </p>
                </div>
              </interact-element>
              <interact-element data-interact-key="s3-card-2">
                <div class="glass-card p-6 md:p-10 h-full">
                  <div class="text-4xl md:text-6xl mb-6 md:mb-10 leading-none">02</div>
                  <h3 class="text-lg mb-4">Rhythm</h3>
                  <p class="text-sm leading-relaxed">
                    Typography, spacing, motion. The invisible grid that makes everything feel
                    inevitable.
                  </p>
                </div>
              </interact-element>
              <interact-element data-interact-key="s3-card-3">
                <div class="glass-card p-6 md:p-10 h-full">
                  <div class="text-4xl md:text-6xl mb-6 md:mb-10 leading-none">03</div>
                  <h3 class="text-lg mb-4">Finish</h3>
                  <p class="text-sm leading-relaxed">
                    Sample text provides enough length to demonstrate this animated content layout.
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

.hero-text {
  font-size: clamp(3.5rem, 18vw, 20rem);
  line-height: 1;
}

.section-title {
  font-size: clamp(2.5rem, 10vw, 10rem);
  line-height: 1.05;
}

.sub-headline {
  font-size: clamp(1.2rem, 3vw, 3rem);
  line-height: 1.2;
}

.label {
  font-size: 0.65rem;
}

.body-text {
  font-size: 1.05rem;
  line-height: 1.7;
}

.thin-rule {
  height: 1px;
}

.bg-glyph {
  position: absolute;
  font-size: 42vw;
  line-height: 1;
  pointer-events: none;
}
```

## Interact config

```js
const R = (v, u = 'percentage') => ({ value: v, unit: u });
const fullRange = {
  rangeStart: { name: 'entry', offset: R(100) },
  rangeEnd: { name: 'exit', offset: R(0) },
};

const config = {
  interactions: [
    {
      key: 'scroll-trigger',
      trigger: 'viewProgress',
      effects: [
        // SECTION 1 — 3D tilt exit
        {
          key: 'slide-1',
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: 's1-exit',
            keyframes: [
              {
                offset: 0,
                transform: 'perspective(1400px) rotateX(0deg)   translateY(0)     scale(1)',
                opacity: 1,
              },
              {
                offset: 0.15,
                transform: 'perspective(1400px) rotateX(0deg)   translateY(0)     scale(1)',
                opacity: 1,
              },
              {
                offset: 0.28,
                transform: 'perspective(1400px) rotateX(-12deg) translateY(-80px) scale(0.88)',
                opacity: 0,
              },
              {
                offset: 1,
                transform: 'perspective(1400px) rotateX(-12deg) translateY(-80px) scale(0.88)',
                opacity: 0,
              },
            ],
          },
        },
        {
          key: 's1-content',
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: 's1-depth',
            keyframes: [
              {
                offset: 0,
                transform: 'perspective(1000px) translateZ(0)     translateY(0)     rotateX(0deg)',
                opacity: 1,
              },
              {
                offset: 0.15,
                transform: 'perspective(1000px) translateZ(0)     translateY(0)     rotateX(0deg)',
                opacity: 1,
              },
              {
                offset: 0.28,
                transform: 'perspective(1000px) translateZ(-40px) translateY(-30px) rotateX(-3deg)',
                opacity: 0,
              },
              {
                offset: 1,
                transform: 'perspective(1000px) translateZ(-40px) translateY(-30px) rotateX(-3deg)',
                opacity: 0,
              },
            ],
          },
        },

        // SECTION 2 — 3D perspective enter + exit
        {
          key: 'slide-2',
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: 's2-lifecycle',
            keyframes: [
              {
                offset: 0,
                transform: 'perspective(1400px) rotateX(12deg)  translateY(120px) scale(0.88)',
                opacity: 0,
              },
              {
                offset: 0.18,
                transform: 'perspective(1400px) rotateX(12deg)  translateY(120px) scale(0.88)',
                opacity: 0,
              },
              {
                offset: 0.34,
                transform: 'perspective(1400px) rotateX(0deg)   translateY(0)     scale(1)',
                opacity: 1,
              },
              {
                offset: 0.54,
                transform: 'perspective(1400px) rotateX(0deg)   translateY(0)     scale(1)',
                opacity: 1,
              },
              {
                offset: 0.7,
                transform: 'perspective(1400px) rotateX(-12deg) translateY(-80px) scale(0.88)',
                opacity: 0,
              },
              {
                offset: 1,
                transform: 'perspective(1400px) rotateX(-12deg) translateY(-80px) scale(0.88)',
                opacity: 0,
              },
            ],
          },
        },
        ...['s2-header', 's2-left', 's2-right'].map((id, i) => ({
          key: id,
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: `${id}-reveal`,
            keyframes: [
              {
                offset: 0.24 + i * 0.05,
                transform: 'perspective(1000px) translateZ(-60px) translateY(60px) rotateX(4deg)',
                opacity: 0,
              },
              {
                offset: 0.38 + i * 0.05,
                transform: 'perspective(1000px) translateZ(0)     translateY(0)    rotateX(0deg)',
                opacity: 1,
              },
              {
                offset: 0.52,
                transform: 'perspective(1000px) translateZ(0)     translateY(0)    rotateX(0deg)',
                opacity: 1,
              },
              {
                offset: 0.64,
                transform: 'perspective(1000px) translateZ(-40px) translateY(-30px) rotateX(-3deg)',
                opacity: 0,
              },
              { offset: 1, opacity: 0 },
            ],
          },
        })),
        {
          key: 's2-bg',
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: 's2-bg-drift',
            keyframes: [
              {
                offset: 0.2,
                transform: 'perspective(600px) translateZ(-100px) translateY(100px)',
                opacity: 0,
              },
              {
                offset: 0.36,
                transform: 'perspective(600px) translateZ(0)      translateY(0)',
                opacity: 1,
              },
              {
                offset: 0.56,
                transform: 'perspective(600px) translateZ(0)      translateY(-40px)',
                opacity: 1,
              },
              {
                offset: 0.68,
                transform: 'perspective(600px) translateZ(-80px)  translateY(-80px)',
                opacity: 0,
              },
            ],
          },
        },

        // SECTION 3 — 3D perspective enter
        {
          key: 'slide-3',
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: 's3-lifecycle',
            keyframes: [
              {
                offset: 0,
                transform: 'perspective(1400px) rotateX(12deg) translateY(120px) scale(0.88)',
                opacity: 0,
              },
              {
                offset: 0.62,
                transform: 'perspective(1400px) rotateX(12deg) translateY(120px) scale(0.88)',
                opacity: 0,
              },
              {
                offset: 0.8,
                transform: 'perspective(1400px) rotateX(0deg)  translateY(0)     scale(1)',
                opacity: 1,
              },
              {
                offset: 1,
                transform: 'perspective(1400px) rotateX(0deg)  translateY(0)     scale(1)',
                opacity: 1,
              },
            ],
          },
        },
        {
          key: 's3-header',
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: 's3-header-depth',
            keyframes: [
              {
                offset: 0.68,
                transform: 'perspective(1000px) translateZ(-60px) translateY(40px) rotateX(4deg)',
                opacity: 0,
              },
              {
                offset: 0.82,
                transform: 'perspective(1000px) translateZ(0)     translateY(0)    rotateX(0deg)',
                opacity: 1,
              },
              { offset: 1, opacity: 1 },
            ],
          },
        },
        ...['s3-card-1', 's3-card-2', 's3-card-3'].map((id, i) => ({
          key: id,
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: `${id}-fan`,
            keyframes: [
              {
                offset: 0.74 + i * 0.02,
                transform: `perspective(1000px) rotateY(${(i - 1) * 12}deg) rotateX(6deg) translateZ(-80px) translateY(60px)`,
                opacity: 0,
              },
              {
                offset: 0.9,
                transform:
                  'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0) translateY(0)',
                opacity: 1,
              },
              { offset: 1, opacity: 1 },
            ],
          },
        })),
        {
          key: 's3-bg',
          ...fullRange,
          fill: 'both',
          keyframeEffect: {
            name: 's3-bg-drift',
            keyframes: [
              {
                offset: 0.64,
                transform: 'perspective(600px) translateZ(-100px) translateY(80px)',
                opacity: 0,
              },
              {
                offset: 0.8,
                transform: 'perspective(600px) translateZ(0)      translateY(0)',
                opacity: 1,
              },
              {
                offset: 1,
                transform: 'perspective(600px) translateZ(0)      translateY(-20px)',
                opacity: 1,
              },
            ],
          },
        },
      ],
    },
  ],
};
```
