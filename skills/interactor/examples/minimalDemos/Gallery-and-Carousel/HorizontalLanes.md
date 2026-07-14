# HorizontalLanes

A viewport-entry animation for gallery items in a grid/gallery, flex/carousel, layered composition layout. It uses transform to create the motion and transition between visual states.

**Tags:** trigger: viewEnter; layout: grid/gallery, flex/carousel, layered composition; motion: transform

## Markup

```html
<div class="gallery-container" id="gallery-container">
       <div class="gallery-row">
           <wix-interact-element data-wix-path="#wrapper-1">
               <div class="animation-wrapper" id="wrapper-1">
                   <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Spiral Staircase</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Geometric Facade</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Atrium View</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Interior</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Spiral Staircase</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Geometric Facade</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Atrium View</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Interior</div>
                       </div>
                   </div>
                    <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Spiral Staircase</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Geometric Facade</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Atrium View</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Interior</div>
                       </div>
                        <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Spiral Staircase</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Geometric Facade</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Atrium View</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Interior</div>
                       </div>
                   </div>
               </div>
           </wix-interact-element>
       </div>

       <div class="gallery-row">
           <wix-interact-element data-wix-path="#wrapper-2">
               <div class="animation-wrapper" id="wrapper-2">
                   <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Night Cityscape</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Flowing Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Abstract Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Bright Living Room</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Night Cityscape</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Flowing Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Abstract Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Bright Living Room</div>
                       </div>
                   </div>
                   <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Night Cityscape</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Flowing Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Abstract Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Bright Living Room</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Night Cityscape</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Flowing Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Abstract Lines</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Bright Living Room</div>
                       </div>
                   </div>
               </div>
           </wix-interact-element>
       </div>

       <div class="gallery-row">
            <wix-interact-element data-wix-path="#wrapper-3">
               <div class="animation-wrapper" id="wrapper-3">
                   <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Symmetrical Hallway</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Glass Ceiling</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Industrial Interior</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Suspension Bridge</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Symmetrical Hallway</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Glass Ceiling</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Industrial Interior</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Suspension Bridge</div>
                       </div>
                   </div>
                   <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Symmetrical Hallway</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Glass Ceiling</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Industrial Interior</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Suspension Bridge</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Symmetrical Hallway</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Glass Ceiling</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Industrial Interior</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Suspension Bridge</div>
                       </div>
                   </div>
               </div>
           </wix-interact-element>
       </div>

       <div class="gallery-row">
           <wix-interact-element data-wix-path="#wrapper-4">
               <div class="animation-wrapper" id="wrapper-4">
                   <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Museum</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Skyscraper Reflection</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Cozy Nook</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Library Rows</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Museum</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Skyscraper Reflection</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Cozy Nook</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Library Rows</div>
                       </div>
                   </div>
                   <div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Museum</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Skyscraper Reflection</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Cozy Nook</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Library Rows</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Modern Museum</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Skyscraper Reflection</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Cozy Nook</div>
                       </div>
                       <div class="image-container">
                           <img class="gallery-image">
                           <div class="image-title">Library Rows</div>
                       </div>
                   </div>
               </div>
           </wix-interact-element>
       </div>
   </div>

   <div id="lightbox" class="lightbox">
       <span class="close-btn">&times;</span>
       <div class="lightbox-container">
           <img class="lightbox-content" id="lightbox-img">
           <div class="lightbox-text-content">
               <h3 id="lightbox-title" class="lightbox-title"></h3>
               <p id="lightbox-description" class="lightbox-description"></p>
           </div>
       </div>
   </div>
```

## Essential styles

```css
:root {
           --row-height: 25vh;
           --img-padding: 15px;
           --img-border-radius: 24px;
       }

       body {
           margin: 0;
           padding: 0;
           font-family: 'Inter', sans-serif;
           background-color: #f4f1eb;
           overflow: hidden;
       }

       .gallery-container {
           display: flex;
           flex-direction: column;
           width: 100%;
       }

       .gallery-row {
           height: var(--row-height);
           position: relative;
           overflow: hidden;
       }

       
       .animation-wrapper {
           display: flex;
           flex-direction: row; 
           height: 100%;
           width: max-content; 
           will-change: transform; 
       }

       
       .animation-wrapper > div {
           display: flex;
           flex-direction: row;
           height: 100%;
       }
      
       
       #wrapper-1, #wrapper-3 {
           transform: translateX(-50%);
       }

       
       .image-container {
           position: relative;
           height: 100%;
           flex-shrink: 0; 
           cursor: pointer;
       }

       .gallery-image {
           height: 100%;
           width: auto;
           object-fit: cover;
           padding: var(--img-padding);
           box-sizing: border-box;
           border-radius: var(--img-border-radius);
           display: block;
       }

       .image-title {
           position: absolute;
           bottom: calc(var(--img-padding) + 15px);
           left: calc(var(--img-padding) + 15px);
           right: calc(var(--img-padding) + 15px);
           color: white;
           text-align: center;
           font-size: clamp(0.5rem, calc((var(--row-height) - 2 * var(--img-padding)) * 0.12), 1.5rem);
           line-height: 1.2;
           opacity: 0;
           transition: opacity 0.3s ease;
           pointer-events: none;
           z-index: 2;
       }

       .image-container::after {
           content: '';
           position: absolute;
           bottom: var(--img-padding);
           left: var(--img-padding);
           right: var(--img-padding);
           height: 50%;
           background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
           border-radius: 0 0 calc(var(--img-border-radius) - var(--img-padding)) calc(var(--img-border-radius) - var(--img-padding));
           opacity: 0;
           transition: opacity 0.3s ease;
           pointer-events: none;
           z-index: 1;
       }

       
       .image-container:hover .image-title,
       .image-container:hover::after {
           opacity: 1;
       }

       
       .lightbox {
           display: none;
           position: fixed;
           z-index: 1000;
           left: 0;
           top: 0;
           width: 100%;
           height: 100%;
           background-color: rgba(0, 0, 0, 0.85);
           justify-content: center;
           align-items: center;
           opacity: 0;
           transition: opacity 0.4s ease;
       }

       .lightbox.active {
           display: flex;
           opacity: 1;
       }
      
       .lightbox-container {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 1rem; 
           max-width: 90%;
           max-height: 90%;
       }
      
       .lightbox-text-content {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 0.25rem; 
       }

       .lightbox-content {
           max-width: 100%;
           max-height: 70vh; 
           object-fit: contain;
           border-radius: 12px;
       }
      
       .lightbox-title {
           font-size: 1.5rem;
           font-weight: bold;
           color: white;
           text-align: center;
           margin: 0;
       }

       .lightbox-description {
           font-size: 1rem;
           color: #ccc;
           text-align: center;
           margin: 0;
           max-width: 60ch;
       }

       .close-btn {
           position: absolute;
           top: 20px;
           right: 35px;
           color: #fff;
           font-size: 40px;
           font-weight: bold;
           cursor: pointer;
           transition: color 0.3s ease;
       }

       .close-btn:hover {
           color: #bbb;
       }

       
       @media (max-width: 768px) {
           
           .gallery-row:nth-child(3), .gallery-row:nth-child(4) {
               display: none;
           }
       }
```

## Interact config

```js
const config = {
               interactions: [
                   {
                       key: '#wrapper-1',
                       trigger: 'viewEnter',
                       params: { type: 'state' },
                       effects: [{
                           key: '#wrapper-1',
                           keyframeEffect: {
                               keyframes: [{ transform: 'translateX(-50%)' }, { transform: 'translateX(0)' }]
                           },
                           duration: 40000,
                           easing: 'linear',
                           iterations: Infinity
                       }]
                   },
                   {
                       key: '#wrapper-2',
                       trigger: 'viewEnter',
                       params: { type: 'state' },
                       effects: [{
                           key: '#wrapper-2',
                           keyframeEffect: {
                               name: 'scroll-left',
                               keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
                           },
                           duration: 50000,
                           easing: 'linear',
                           iterations: Infinity,
                       }]
                   },
                   {
                       key: '#wrapper-3',
                       trigger: 'viewEnter',
                       params: { type: 'state' },
                       effects: [{
                           key: '#wrapper-3',
                           keyframeEffect: {
                               name: 'scroll-right-fast',
                               keyframes: [{ transform: 'translateX(-50%)' }, { transform: 'translateX(0)' }],
                           },
                           duration: 45000,
                           easing: 'linear',
                           iterations: Infinity,
                       }]
                   },
                   {
                       key: '#wrapper-4',
                       trigger: 'viewEnter',
                       params: { type: 'state' },
                       effects: [{
                           key: '#wrapper-4',
                           keyframeEffect: {
                               name: 'scroll-left-fast',
                               keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
                           },
                           duration: 55000,
                           easing: 'linear',
                           iterations: Infinity
                       }]
                   }
               ]
           };
```
