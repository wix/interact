# Snake Animation

Images arranged in a sinusoidal wave across the screen animate sequentially into view, converge to a full-screen lightbox on click, and cycle through the gallery with @wix/interact fade transitions; clicking the backdrop returns to the snake layout.

**Tags:** click, gallery, opacity, transform, scale, fade, stagger, backdrop

## Markup

```html
<div id="image-snake" class="absolute inset-0 w-full h-full">
  <img src="" class="snake-image" style="width:190px;height:143px;left:8px;top:289px" />
  <img src="" class="snake-image" style="width:210px;height:158px;left:195px;top:353px" />
  <img src="" class="snake-image" style="width:175px;height:131px;left:388px;top:368px" />
  <img src="" class="snake-image" style="width:200px;height:150px;left:582px;top:298px" />
  <img src="" class="snake-image" style="width:185px;height:139px;left:778px;top:219px" />
  <img src="" class="snake-image" style="width:220px;height:165px;left:960px;top:204px" />
</div>

<interact-element data-interact-key="#backdrop" id="backdrop-wrapper">
  <div id="backdrop"></div>
</interact-element>

<interact-element data-interact-key="#main-image-container" id="main-image-wrapper">
  <div id="main-image-container">
    <img src="" />
  </div>
</interact-element>

<div class="absolute inset-0 flex items-center justify-start pointer-events-none">
  <interact-element data-interact-key="#text-container">
    <div id="text-container" class="w-full max-w-2xl px-8 text-left flex flex-col justify-center" style="height:20rem;z-index:110">
      <h1 id="main-title" class="text-3xl font-bold mb-2"></h1>
      <h2 id="main-subtitle" class="text-lg font-light"></h2>
    </div>
  </interact-element>
</div>
```

## Essential styles

```css
body {
  overflow: hidden;
}
.snake-image {
  position: absolute;
  border-radius: 0.75rem;
  transition: all 0.6s ease-in-out;
  object-fit: cover;
  cursor: pointer;
}
#main-image-container {
  position: absolute;
  opacity: 0;
  z-index: 100;
  cursor: pointer;
}
#main-image-container img {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  object-fit: cover;
}
#text-container {
  opacity: 0;
}
#backdrop {
  position: fixed;
  inset: 0;
  opacity: 0;
  z-index: 50;
  pointer-events: none;
}
interact-element {
  display: contents;
}
#main-image-wrapper,
#backdrop-wrapper {
  display: block;
  position: absolute;
  inset: 0;
}
```

## Interact config

```js
{
  effects: {
    'text-fade-in': {
      keyframeEffect: {
        name: 'text-in',
        keyframes: [{ opacity: 0 }, { opacity: 1 }]
      },
      duration: 900,
      easing: 'ease-out',
      fill: 'both'
    },
    'text-fade-out': {
      keyframeEffect: {
        name: 'text-out',
        keyframes: [{ opacity: 1 }, { opacity: 0 }]
      },
      duration: 400,
      easing: 'ease-in-out',
      fill: 'both'
    },
    'image-cycle-out': {
      keyframeEffect: {
        name: 'img-cycle-out',
        keyframes: [
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' }
        ]
      },
      duration: 400,
      easing: 'ease-in-out',
      fill: 'both'
    },
    'image-cycle-in': {
      keyframeEffect: {
        name: 'img-cycle-in',
        keyframes: [
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.95)' },
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        ]
      },
      duration: 400,
      easing: 'ease-in-out',
      fill: 'both'
    },
    'image-dismiss': {
      keyframeEffect: {
        name: 'img-dismiss',
        keyframes: [
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }
        ]
      },
      duration: 600,
      easing: 'ease-out',
      fill: 'both'
    },
    'backdrop-fade-in': {
      keyframeEffect: {
        name: 'backdrop-in',
        keyframes: [{ opacity: 0, pointerEvents: 'none' }, { opacity: 1, pointerEvents: 'auto' }]
      },
      duration: 600,
      easing: 'ease-out',
      fill: 'both'
    },
    'backdrop-fade-out': {
      keyframeEffect: {
        name: 'backdrop-out',
        keyframes: [{ opacity: 1, pointerEvents: 'auto' }, { opacity: 0, pointerEvents: 'none' }]
      },
      duration: 600,
      easing: 'ease-out',
      fill: 'both'
    }
  }
}
```
