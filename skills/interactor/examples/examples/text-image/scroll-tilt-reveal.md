# Scroll Tilt Reveal

A split-screen layout where text elements (heading, paragraph, button) fade up with staggered delays on viewEnter, while the hero image tilts through a 3D Y-axis rotation driven by scroll progress.

**Tags:** viewProgress, viewEnter, sticky, flex, opacity, transform, 3d, reveal, stagger, fade

## Markup

```html
<interact-element data-interact-key="scroll-driver" class="scroll-driver">
  <div class="sticky-stage">
    <div class="text-block">
      <interact-element data-interact-key="text-title">
        <h1>Built By<br />Real People</h1>
      </interact-element>
      <interact-element data-interact-key="text-desc">
        <p>Sample text provides enough length to demonstrate this animated content layout.</p>
      </interact-element>
      <interact-element data-interact-key="text-btn">
        <div><a href="#" class="btn">Learn More</a></div>
      </interact-element>
    </div>

    <div class="image-area">
      <interact-element data-interact-key="hero-image" class="hero-image">
        <img src="" alt="" />
      </interact-element>
    </div>
  </div>
</interact-element>
```

## Essential styles

```css
interact-element {
  display: block;
}

.scroll-driver {
  height: 300vh;
}

.sticky-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: stretch;
}

.text-block {
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6%;
}

.image-area {
  flex: 0 0 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-block .btn {
  display: inline-flex;
  align-items: center;
  min-width: 44px;
  min-height: 44px;
}

.text-block .btn:focus-visible {
  outline: 2px solid;
  outline-offset: 3px;
}

.hero-image {
  height: 60vh;
  aspect-ratio: 3 / 4;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

[data-interact-key='text-title'] > *,
[data-interact-key='text-desc'] > *,
[data-interact-key='text-btn'] > * {
  opacity: 0;
  transform: translateY(40px);
}

@media (max-width: 1024px) {
  .text-block {
    padding: 5%;
  }
}

@media (max-width: 768px) {
  .sticky-stage {
    flex-direction: column-reverse;
  }
  .text-block {
    flex: 0 0 55%;
    padding: 1.5rem;
    justify-content: center;
  }

  .image-area {
    flex: 0 0 45%;
  }

  .hero-image {
    height: 38vh;
    width: 35%;
    aspect-ratio: auto;
  }
}
```

## Interact config

```js
const config = {
  interactions: [
    {
      key: 'scroll-driver',
      trigger: 'viewEnter',
      sequences: [
        {
          delay: 500,
          offset: 300,
          triggerType: 'once',
          effects: [
            {
              key: 'text-title',
              keyframeEffect: {
                name: 'float-in-title',
                keyframes: [
                  { opacity: 0, transform: 'translateY(50px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
              },
              duration: 800,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            },
            {
              key: 'text-desc',
              keyframeEffect: {
                name: 'float-in-desc',
                keyframes: [
                  { opacity: 0, transform: 'translateY(40px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
              },
              duration: 800,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            },
            {
              key: 'text-btn',
              keyframeEffect: {
                name: 'float-in-btn',
                keyframes: [
                  { opacity: 0, transform: 'translateY(40px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
              },
              duration: 800,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'both',
            },
          ],
        },
      ],
    },
    {
      key: 'scroll-driver',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'hero-image',
          keyframeEffect: {
            name: 'image-tilt',
            keyframes: [
              { transform: 'perspective(350px) rotateY(55deg)' },
              { transform: 'perspective(350px) rotateY(0deg)' },
              { transform: 'perspective(350px) rotateY(-55deg)' },
            ],
          },
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
          easing: 'linear',
          fill: 'both',
        },
      ],
    },
  ],
};
```
