# Scroll Tilt Reveal

A split-screen layout where text elements (heading, paragraph, button) fade up with staggered delays on viewEnter, while the hero image tilts through a 3D Y-axis rotation driven by scroll progress.

**Tags:** viewProgress, viewEnter, sticky, flex, opacity, transform, 3d, reveal, stagger, fade

## Markup

```html
<interact-element data-interact-key="scroll-driver" class="scroll-driver">
  <div class="sticky-stage">

    <div class="text-block">
      <interact-element data-interact-key="text-title">
        <h1>Built By<br>Real People</h1>
      </interact-element>
      <interact-element data-interact-key="text-desc">
        <p>I'm a designer and creative thinker with a passion for crafting visual experiences that leave an impression. My work lives at the intersection of bold ideas and refined execution — always exploring, always evolving. With over a decade of experience across branding, digital products, and art direction, I bring a unique perspective to every project I touch.</p>
      </interact-element>
      <interact-element data-interact-key="text-btn">
        <div><a href="#" class="btn">Learn More</a></div>
      </interact-element>
    </div>

    <div class="image-area">
      <interact-element data-interact-key="hero-image" class="hero-image">
        <img src="IMAGE_URL" alt="Landscape">
      </interact-element>
    </div>

  </div>
</interact-element>
```

## Essential styles

```css
body {
  margin: 0;
  background: black;
  color: white;
  font-family: 'Inter', sans-serif;
  overflow-x: clip;
}

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
  background: white;
  color: #111;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 6%;
}

.image-area {
  flex: 0 0 50%;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-block h1 {
  font-size: clamp(3.5rem, 7vw, 6rem);
  font-weight: 900;
  line-height: 1.02;
  margin-bottom: 2.2rem;
  letter-spacing: -0.03em;
  color: #000;
}

.text-block p {
  font-size: clamp(0.9rem, 1.1vw, 1.05rem);
  line-height: 1.8;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 300;
  margin-bottom: 3rem;
}

.text-block .btn {
  display: inline-block;
  padding: 0.9rem 2.2rem;
  background: #000;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.text-block .btn:hover {
  background: #333;
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

[data-interact-key="text-title"] > *,
[data-interact-key="text-desc"] > *,
[data-interact-key="text-btn"] > * {
  opacity: 0;
  transform: translateY(40px);
}

@media (max-width: 1024px) {
  .text-block {
    padding: 3rem 5%;
  }
  .text-block h1 {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
  }
}

@media (max-width: 768px) {
  .sticky-stage {
    flex-direction: column-reverse;
  }
  .text-block {
    flex: 0 0 55%;
    background: white;
    text-align: left;
    padding: 2rem 1.5rem 2.5rem;
    justify-content: center;
  }
  .image-area {
    flex: 0 0 45%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .text-block h1 {
    font-size: clamp(2rem, 8vw, 3rem);
    margin-bottom: 0.8rem;
  }
  .text-block p {
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    line-height: 1.7;
  }
  .text-block .btn {
    padding: 0.75rem 1.8rem;
    font-size: 0.8rem;
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
{
  interactions: [
    {
      key: 'text-title',
      trigger: 'viewEnter',
      effects: [{
        triggerType: 'once',
        keyframeEffect: {
          name: 'float-in-title',
          keyframes: [
            { opacity: 0, transform: 'translateY(50px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ]
        },
        duration: 800,
        delay: 500,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }]
    },
    {
      key: 'text-desc',
      trigger: 'viewEnter',
      effects: [{
        triggerType: 'once',
        keyframeEffect: {
          name: 'float-in-desc',
          keyframes: [
            { opacity: 0, transform: 'translateY(40px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ]
        },
        duration: 800,
        delay: 800,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }]
    },
    {
      key: 'text-btn',
      trigger: 'viewEnter',
      effects: [{
        triggerType: 'once',
        keyframeEffect: {
          name: 'float-in-btn',
          keyframes: [
            { opacity: 0, transform: 'translateY(40px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ]
        },
        duration: 800,
        delay: 1100,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      }]
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
              { transform: 'perspective(350px) rotateY(-55deg)' }
            ]
          },
          rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' }},
          rangeEnd:   { name: 'cover', offset: { value: 100, unit: 'percentage' }},
          easing: 'linear',
          fill: 'both'
        }
      ]
    }
  ]
}
```
