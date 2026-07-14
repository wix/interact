# SnakeAnimation

A custom JavaScript-driven animation for pointer-responsive visual elements in a grid/gallery, layered composition, 3D scene layout. It uses opacity, transform to create the motion and transition between visual states.

**Tags:** trigger: custom; layout: grid/gallery, layered composition, 3D scene; motion: opacity, transform

## Markup

```html
<div id="image-snake" class="absolute inset-0 w-full h-full"></div>

  <wix-interact-element data-wix-path="#backdrop" id="backdrop-wrapper">
    <div id="backdrop"></div>
  </wix-interact-element>

  <wix-interact-element data-wix-path="#main-image-container" id="main-image-wrapper">
    <div id="main-image-container">
      </div>
  </wix-interact-element>

  <div class="absolute inset-0 flex items-center justify-start pointer-events-none">
    <wix-interact-element data-wix-path="#text-container">
      <div id="text-container" class="w-full max-w-2xl px-8 md:px-16 text-left flex flex-col justify-center" style="height: 20rem; z-index: 110;">
        <h1 id="main-title" class="text-3xl md:text-5xl font-bold text-white mb-2" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.7);"></h1>
        <h2 id="main-subtitle" class="text-lg md:text-xl font-light text-white" style="text-shadow: 1px 1px 4px rgba(0,0,0,0.7);"></h2>
      </div>
    </wix-interact-element>
  </div>
```

## Essential styles

```css
body {
      font-family: 'Assistant', sans-serif;
      overflow: hidden;
    }
    .snake-image {
      position: absolute;
      border-radius: 0.75rem; 
      transition: all 0.6s ease-in-out;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      background-color: #333; 
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
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
    }

    
    #text-container {
      opacity: 0;
    }
    
    
    #backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      opacity: 0;
      z-index: 50;
      pointer-events: none;
    }

    
    wix-interact-element {
      display: contents;
    }
    #main-image-wrapper, #backdrop-wrapper {
      display: block; 
      position: absolute;
      inset: 0;
    }
```

## Interact config

```js
const interactConfig = {
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
      
    };
```
