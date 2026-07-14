# EndlessParallax

A click-triggered and animationEnd-triggered animation for layered visual elements in a grid/gallery, flex/carousel, layered composition layout. It uses opacity, transform, filter to create the motion and transition between visual states.

**Tags:** trigger: click, animationEnd; layout: grid/gallery, flex/carousel, layered composition; motion: opacity, transform, filter

## Markup

```html
<wix-interact-element data-wix-path="#page-container">
   <div id="page-container">
     <div id="gallery-container"></div>

     <div id="modal">
       <button class="modal-close" id="modalClose">&times;</button>
       <div class="modal-content">
         <img id="modalImage">
         <div class="modal-text-overlay">
           <h1 id="modalTitle"></h1>
           <p id="modalDescription"></p>
         </div>
       </div>
     </div>

     <button id="openModalTrigger" style="display:none;"></button>
     <button id="closeModalTrigger" style="display:none;"></button>
   </div>
 </wix-interact-element>
```

## Essential styles

```css
:root {
    --drift-speed: 1;
    --tile-scale: 1;
    --num-tiles: 100;
  }

  
   html, body {
     margin: 0; padding: 0;
     width: 100%; height: 100%;
     overflow: hidden;
     background: #f8f5ee;
     font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
   }
  
   
   #gallery-container{
     position: fixed;
     inset: 0;
     overflow: hidden;
     cursor: grab;
     
     transition: filter 0.4s ease-out;
   }

   
   .gallery-tile{
     position: absolute;
     top: 0; left: 0;
     opacity: 0;              
     border-radius: 8px;
     box-shadow: 0 5px 25px rgba(0,0,0,0.2);
     will-change: transform, opacity;
     backface-visibility: hidden; 
     contain: layout paint;       
     overflow: hidden; 
     cursor: pointer;
   }
   .gallery-tile:focus-visible{
     outline: 3px solid #007bff;
     outline-offset: 4px;
     border-radius: 8px;
   }
   .gallery-tile img{
     display: block;
     width: 100%; height: 100%;
     object-fit: cover;
     border-radius: 8px;
     pointer-events: none; 
     transition: transform 0.3s ease-out;
   }
  
   .gallery-tile:hover img {
       transform: scale(1.05);
   }

   .gallery-tile-title {
       position: absolute;
       bottom: 0;
       left: 0;
       right: 0;
       padding: 2rem 1rem 1rem;
       color: white;
       text-align: center;
       font-weight: 700;
       font-size: 1rem;
       background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
       opacity: 0;
       transform: translateY(10px);
       transition: opacity 0.3s ease-out, transform 0.3s ease-out;
       pointer-events: none;
   }

   .gallery-tile:hover .gallery-tile-title {
       opacity: 1;
       transform: translateY(0);
   }

   
   #modal{
     position: fixed;
     inset: 0;
     display: flex;
     align-items: center;
     justify-content: center;
     background: rgba(0,0,0,0.7);
     z-index: 1000;
     opacity: 0;
     visibility: hidden;
   }
   .modal-content{
     position: relative;
     background: transparent;
     max-width: 90vw; max-height: 90vh;
     border-radius: 8px;
     box-shadow: 0 20px 50px rgba(0,0,0,0.4);
     transform: scale(0.8);
   }
   .modal-content img{
     display: block;
     max-width: 100%;
     max-height: 90vh;
     border-radius: 8px;
   }
   .modal-text-overlay{
     position: absolute;
     left: 0; right: 0; bottom: 0;
     padding: 60px 30px 30px;
     color: #fff;
     background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
     border-radius: 0 0 8px 8px;
     box-sizing: border-box;
   }
   .modal-text-overlay h1{
     margin: 0 0 10px;
     font-size: 2rem; font-weight: 700;
     text-shadow: 0 2px 5px rgba(0,0,0,0.5);
   }
   .modal-text-overlay p{
     margin: 0; font-size: 1.1rem;
     text-shadow: 0 1px 4px rgba(0,0,0,0.5);
     opacity: 0.9;
   }
   .modal-close{
     background: none; border: none; padding: 0; font: inherit;
     position: absolute; top: 20px; right: 20px;
     font-size: 2rem; color: #fff; cursor: pointer; line-height: 1;
     text-shadow: 0 1px 3px rgba(0,0,0,0.5);
     z-index: 1001; border-radius: 50%;
   }
   .modal-close:focus-visible{ outline: 3px solid #fff; outline-offset: 2px; }
```

## Interact config

```js
const interactConfig = {
         interactions: [
           { 
             key: '#openModalTrigger', trigger: 'click',
             effects: [
               { key: '#modal', keyframeEffect: { name: 'modal-show',
                   keyframes: [{ offset:0, visibility:'visible', opacity:0 }, { offset:1, opacity:1 }],
                   duration: 400, easing: 'ease-out', fill: 'forwards' } },
               { key: '.modal-content', keyframeEffect: { name: 'modal-content-scale-in',
                   keyframes: [{ transform:'scale(0.8)' }, { transform:'scale(1)' }],
                   duration: 400, easing: 'cubic-bezier(0.175,0.885,0.32,1.275)', fill: 'forwards' } },
               { key: '#gallery-container', keyframeEffect: { name: 'canvas-blur-in',
                   keyframes: [{ filter:'blur(0px)' }, { filter:'blur(8px)' }],
                   duration: 400, easing: 'ease-out', fill: 'forwards' } },
             ]
           },
           { 
             key: '#closeModalTrigger', trigger: 'click',
             effects: [
               { key: '#modal', effectId: 'modal-fade-out', keyframeEffect: { name: 'modal-hide',
                   keyframes: [{ opacity:1 }, { opacity:0 }],
                   duration: 400, easing: 'ease-out', fill: 'forwards' } },
               { key: '.modal-content', keyframeEffect: { name: 'modal-content-scale-out',
                   keyframes: [{ transform:'scale(1)' }, { transform:'scale(0.8)' }],
                   duration: 400, easing: 'ease-out', fill: 'forwards' } },
               { key: '#gallery-container', effectId: 'canvas-unblur', keyframeEffect: { name: 'canvas-blur-out',
                   keyframes: [{ filter:'blur(8px)' }, { filter:'blur(0px)' }],
                   duration: 400, easing: 'ease-out', fill: 'forwards' } },
             ]
           },
           { 
             key: '#modal', trigger: 'animationEnd', params: { effectId: 'modal-fade-out' },
             effects: [{ keyframeEffect: { name: 'set-modal-hidden',
               keyframes: [{ visibility:'hidden' }], duration: 0, fill: 'forwards' }}]
           },
         ]
       };
```
