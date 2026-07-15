# Fade In Gallery

Full-screen background images cycle in every 2 seconds with a scale-from-zero entrance on viewEnter; hovering the bottom half of the screen fades in a text overlay and pauses the cycling.

**Tags:** hover, viewEnter, gallery, opacity, transform, fade, scale, loop

## Markup

```html
<div id="collage-container">
  <interact-element data-interact-key="collage-fragment-wrapper" class="collage-fragment-wrapper">
    <div class="fragment">
      <div class="content-image" style="background-image: url(IMAGE_URL)"></div>
    </div>
  </interact-element>

  <interact-element data-interact-key="collage-fragment-wrapper" class="collage-fragment-wrapper">
    <div class="fragment">
      <div class="content-image" style="background-image: url(IMAGE_URL)"></div>
    </div>
  </interact-element>

  <interact-element data-interact-key="collage-fragment-wrapper" class="collage-fragment-wrapper">
    <div class="fragment">
      <div class="content-image" style="background-image: url(IMAGE_URL)"></div>
    </div>
  </interact-element>

  <interact-element data-interact-key="#text-overlay">
    <div class="text-overlay">
      <h1>Explore the View</h1>
      <p>Hover to pause and discover more about this moment.</p>
    </div>
  </interact-element>

  <interact-element data-interact-key="#hover-hotspot">
    <div id="hover-hotspot"></div>
  </interact-element>
</div>
```

## Essential styles

```css
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
  font-family: 'Inter', sans-serif;
}

#collage-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

interact-element {
  display: contents;
}

.fragment {
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: #111;
}

.fragment .content-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.text-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: max(20px, 4vw);
  box-sizing: border-box;
  color: #fff;
  opacity: 0;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
  z-index: 5;
}

#hover-hotspot {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  z-index: 10;
}

.text-overlay h1 {
  margin: 0 0 5px 0;
  font-size: clamp(1.8rem, 5vw, 2.5rem);
}

.text-overlay p {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: 400;
}
```

## Interact config

```js
{
  effects: {
    'fragment-scale-in': {
      keyframeEffect: {
        name: 'fragment-scale-in',
        keyframes: [
          { transform: 'scale(0)' },
          { transform: 'scale(1)' }
        ]
      },
      duration: 1000,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      fill: 'backwards',
      triggerType: 'once'
    },
    'text-fade': {
      namedEffect: { type: 'FadeIn' },
      duration: 400,
      easing: 'ease-in-out',
      fill: 'both',
      triggerType: 'alternate'
    }
  },
  interactions: [
    {
      key: 'collage-fragment-wrapper',
      trigger: 'viewEnter',
      effects: [{ effectId: 'fragment-scale-in' }]
    },
    {
      key: '#hover-hotspot',
      trigger: 'hover',
      effects: [{ key: '#text-overlay', effectId: 'text-fade' }]
    }
  ]
}
```
