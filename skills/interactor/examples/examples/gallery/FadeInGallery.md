# Fade In Gallery

Full-screen background images scale in sequentially at two-second intervals when the gallery enters the viewport; hovering the bottom half of the screen fades in a text overlay.

**Tags:** hover, viewEnter, gallery, opacity, transform, fade, scale, loop

## Markup

```html
<interact-element data-interact-key="collage">
  <div id="collage-container">
    <div class="collage-fragment-wrapper">
      <div class="fragment">
        <div class="content-image"></div>
      </div>
    </div>

    <div class="collage-fragment-wrapper">
      <div class="fragment">
        <div class="content-image"></div>
      </div>
    </div>

    <div class="collage-fragment-wrapper">
      <div class="fragment">
        <div class="content-image"></div>
      </div>
    </div>

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
</interact-element>
```

## Essential styles

```css
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: clip;
}

#collage-container {
  width: 100%;
  height: 100%;
  position: relative;
}

interact-element {
  display: contents;
}

.fragment {
  position: absolute;
  overflow: clip;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.fragment .content-image {
  width: 100%;
  height: 100%;
}

.text-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: max(20px, 4vw);
  box-sizing: border-box;
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
}

.text-overlay p {
  margin: 0;
}
```

## Interact config

```js
const config = {
  effects: {
    'fragment-scale-in': {
      keyframeEffect: {
        name: 'fragment-scale-in',
        keyframes: [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
      },
      duration: 1000,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      fill: 'backwards',
    },
    'text-fade': {
      namedEffect: { type: 'FadeIn' },
      duration: 400,
      easing: 'ease-in-out',
      fill: 'both',
      triggerType: 'alternate',
    },
  },
  interactions: [
    {
      key: 'collage',
      trigger: 'viewEnter',
      sequences: [
        {
          offset: 2000,
          triggerType: 'once',
          effects: [
            {
              selector: '.collage-fragment-wrapper .fragment',
              effectId: 'fragment-scale-in',
            },
          ],
        },
      ],
    },
    {
      key: '#hover-hotspot',
      trigger: 'hover',
      effects: [{ key: '#text-overlay', effectId: 'text-fade' }],
    },
  ],
};
```
