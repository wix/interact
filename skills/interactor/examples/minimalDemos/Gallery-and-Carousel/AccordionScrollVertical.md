# AccordionScrollVertical

A hover-triggered animation for expandable panels in a grid/gallery, flex/carousel, layered composition layout. It uses opacity, transform to create the motion and transition between visual states.

**Tags:** trigger: hover; layout: grid/gallery, flex/carousel, layered composition; motion: opacity, transform

## Markup

```html
<div class="w-full mx-auto">
       <div id="feature-container" class="feature-container">

           <div id="column-1" class="feature-column">
               <div id="text-1" class="feature-text-group">
                   <p class="feature-bottom-subtitle">Italian Alps</p>
                   <h2 class="feature-bottom-title">Serene Lakes</h2>
               </div>
               <img class="feature-image">
           </div>
           <div id="column-2" class="feature-column">
               <div id="text-2" class="feature-text-group">
                   <p class="feature-bottom-subtitle">Arid Climate</p>
                   <h2 class="feature-bottom-title">Vast Deserts</h2>
               </div>
               <img class="feature-image">
           </div>
           <div id="column-3" class="feature-column">
               <div id="text-3" class="feature-text-group">
                   <p class="feature-bottom-subtitle">Tropical Paradise</p>
                   <h2 class="feature-bottom-title">Lush Rainforests</h2>
               </div>
               <img class="feature-image">
           </div>
            <div id="column-4" class="feature-column">
               <div id="text-4" class="feature-text-group">
                   <p class="feature-bottom-subtitle">Coastal Views</p>
                   <h2 class="feature-bottom-title">Ocean Cliffs</h2>
               </div>
               <img class="feature-image">
           </div>
       </div>
   </div>
```

## Essential styles

```css
:root {
           --panel-default-height: 20vh;
           --panel-open-height: 50vh;
           --panel-speed: 1;
           --panel-gap: 1.5rem;
       }

       
       body {
           font-family: 'Inter', sans-serif;
           background-color: #ffffff;
           
           overscroll-behavior-y: contain;
           min-height: 100vh;
           display: flex;
           align-items: center;
           justify-content: center;
       }

       
       .feature-container {
           display: flex;
           flex-direction: column;
           gap: var(--panel-gap, 1.5rem);
           width: 100%;
           margin: 0 auto;
       }

       
       .feature-column {
           width: 100%;
           
           max-height: var(--panel-default-height, 20vh); 
           overflow: hidden;
           position: relative; 
           z-index: 1; 
           cursor: pointer;
           box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
           border-radius: 1rem;
           
           
       }

       
       .feature-column .feature-image {
           width: 100%;
           height: 100%;
           object-fit: cover;
       }

       
       .feature-text-group {
           position: absolute;
           bottom: 1.25rem;
           left: 1.25rem;
           opacity: 0;
           transform: translateY(20px);
           z-index: 10;
           text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.6);
           line-height: 1.2;
           
           user-select: none;
           
           pointer-events: none;
       }

       
       .feature-bottom-subtitle {
           font-size: 0.875rem;
           font-weight: 400;
           color: rgba(255, 255, 255, 0.9);
           white-space: nowrap;
       }

       
       .feature-bottom-title {
           font-size: 1.875rem;
           font-weight: 700;
           color: white;
           white-space: nowrap;
       }

       
       @media (max-width: 768px) {
           .feature-column {
               max-height: 25vh; 
           }

           .feature-bottom-title {
               font-size: 1.5rem; 
           }

           .feature-bottom-subtitle {
               font-size: 0.8rem; 
           }
       }
```

## Interact config

```js
const columns = document.querySelectorAll('.feature-column');

const columnIds = Array.from(columns).map(col => `#${col.id}`);

columns.forEach(column => {
               const wrapper = document.createElement('wix-interact-element');
               wrapper.dataset.wixPath = `#${column.id}`;
               column.parentNode.insertBefore(wrapper, column);
               wrapper.appendChild(column);
           });

const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

const rootStyle = getComputedStyle(document.documentElement);

const panelDefaultHeight = rootStyle.getPropertyValue('--panel-default-height').trim() || '20vh';

const panelOpenHeight = rootStyle.getPropertyValue('--panel-open-height').trim() || '50vh';

const panelSpeed = parseFloat(rootStyle.getPropertyValue('--panel-speed')) || 1;

const panelGap = rootStyle.getPropertyValue('--panel-gap').trim() || '1.5rem';

const initialHeight = isMobile ? '25vh' : panelDefaultHeight;

const expandedHeight = isMobile ? '45vh' : panelOpenHeight;

const negativeMargin = `calc(-(${expandedHeight} - ${initialHeight}) - ${panelGap})`;

const config = {
               effects: {
                   'expand-column': {
                       keyframeEffect: {
                           name: 'expand-collapse',
                           
                           
                           
                           keyframes: [
                               { maxHeight: initialHeight, marginBottom: '0rem', zIndex: 1 },
                               { maxHeight: expandedHeight, marginBottom: negativeMargin, zIndex: 10 }
                           ],
                       },
                       duration: Math.round(500 / panelSpeed),
                       easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                       fill: 'both'
                   },
                   'show-text': {
                       keyframeEffect: {
                           name: 'show-hide-text',
                           keyframes: [
                               { opacity: 0, transform: 'translateY(20px)' },
                               { opacity: 1, transform: 'translateY(0)' }
                           ],
                       },
                       duration: Math.round(400 / panelSpeed),
                       delay: Math.round(200 / panelSpeed),
                       easing: 'ease-out',
                       fill: 'both'
                   }
               },
               interactions: [] 
           };

config.interactions = columnIds.map(currentId => ({
                   key: currentId,
                   trigger: 'hover', 
                   params: {
                       type: 'alternate' 
                   },
                   effects: [
                       
                       {
                           key: currentId,
                           effectId: 'expand-column' 
                           
                       },
                       
                       {
                           key: currentId.replace('column', 'text'), 
                           effectId: 'show-text' 
                           
                       }
                   ]
               }));
```
