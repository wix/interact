# Corner Gallery

Fullscreen fragments reveal from different transform origins as each click advances the gallery through an Interact custom effect.

**Tags:** click, gallery, transform, scale, sequential, reveal

## Markup

```html
<interact-element data-interact-key="container">
  <div id="collage-container">
    <div class="fragment" style="transform-origin:0 0;">
      <div class="content-image"></div>
      <div class="text-overlay">
        <h1>Explore Vistas</h1>
        <p>Click to discover new images.</p>
      </div>
    </div>
    <div class="fragment" style="transform-origin:100% 100%;">
      <div class="content-image"></div>
      <div class="text-overlay">
        <h1>Explore Vistas</h1>
        <p>Click to discover new images.</p>
      </div>
    </div>
    <div class="fragment" style="transform-origin:50% 0;">
      <div class="content-image"></div>
      <div class="text-overlay">
        <h1>Explore Vistas</h1>
        <p>Click to discover new images.</p>
      </div>
    </div>
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
  width: 100%;
  padding: 20px 40px;
  box-sizing: border-box;
  pointer-events: none;
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
const fragments = Array.from(document.querySelectorAll('.fragment'));
let activeIndex = 0;

function initializeExistingGallery() {
  fragments.forEach((fragment, index) => {
    fragment.style.transform = `scale(${index === 0 ? 1 : 0})`;
  });
}

function showNextExistingFragment() {
  fragments[activeIndex].style.transform = 'scale(0)';
  activeIndex = (activeIndex + 1) % fragments.length;
  fragments[activeIndex].style.transform = 'scale(1)';
}

const config = {
  interactions: [
    {
      key: 'container',
      trigger: 'viewEnter',
      effects: [
        {
          triggerType: 'once',
          duration: 0,
          customEffect: initializeExistingGallery,
        },
      ],
    },
    {
      key: 'container',
      trigger: 'click',
      effects: [
        {
          triggerType: 'repeat',
          duration: 0,
          fill: 'both',
          customEffect: showNextExistingFragment,
        },
      ],
    },
  ],
};
```
