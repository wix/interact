# ExpandingHorizontalScroll

A viewport-entry and scroll-driven animation for layered visual elements in a sticky scroll section, flex/carousel, layered composition layout. It uses opacity, transform, left to create the motion and transition between visual states.

**Tags:** trigger: viewEnter, viewProgress; layout: sticky scroll section, flex/carousel, layered composition; motion: opacity, transform, left

## Markup

```html
<div
     class="h-screen w-full flex items-center justify-center text-center flex-col px-4"
   >
     <h1 class="text-5xl md:text-7xl font-bold text-white">Scroll Down</h1>
     <p class="text-xl text-gray-300 mt-4">An animation will begin.</p>
   </div>

   <wix-interact-element data-wix-path="#scroll-section">
     <div id="scroll-section">
       <div id="sticky-container">

         <h1 class="static-title">
           <wix-interact-element data-wix-path=".title-letter-0"
             ><span class="title-letter title-letter-0">T</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-1"
             ><span class="title-letter title-letter-1">h</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-2"
             ><span class="title-letter title-letter-2">e</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-3"
             ><span class="title-letter title-letter-3">&nbsp;</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-4"
             ><span class="title-letter title-letter-4">S</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-5"
             ><span class="title-letter title-letter-5">t</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-6"
             ><span class="title-letter title-letter-6">o</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-7"
             ><span class="title-letter title-letter-7">r</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-8"
             ><span class="title-letter title-letter-8">y</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-9"
             ><span class="title-letter title-letter-9">&nbsp;</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-10"
             ><span class="title-letter title-letter-10">o</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-11"
             ><span class="title-letter title-letter-11">f</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-12"
             ><span class="title-letter title-letter-12">&nbsp;</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-13"
             ><span class="title-letter title-letter-13">P</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-14"
             ><span class="title-letter title-letter-14">a</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-15"
             ><span class="title-letter title-letter-15">n</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-16"
             ><span class="title-letter title-letter-16">e</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-17"
             ><span class="title-letter title-letter-17">l</span></wix-interact-element
           ><wix-interact-element data-wix-path=".title-letter-18"
             ><span class="title-letter title-letter-18">s</span></wix-interact-element
           >
         </h1>

         <wix-interact-element data-wix-path="#dynamic-paragraph">
            <p id="dynamic-paragraph" class="dynamic-paragraph"></p>
         </wix-interact-element>

         <wix-interact-element data-wix-path="#box4">
           <div id="box4" class="box bg-indigo-600" style="left: 90vw; z-index: 40;">
             <wix-interact-element data-wix-path="#image4">
               <img id="image4" class="panel-image">
             </wix-interact-element>
           </div>
         </wix-interact-element>

         <wix-interact-element data-wix-path="#box3">
           <div id="box3" class="box bg-purple-600" style="left: 80vw; z-index: 30;">
             <wix-interact-element data-wix-path="#image3">
               <img id="image3" class="panel-image">
             </wix-interact-element>
           </div>
         </wix-interact-element>

         <wix-interact-element data-wix-path="#box2">
           <div id="box2" class="box bg-pink-600" style="left: 70vw; z-index: 20;">
             <wix-interact-element data-wix-path="#image2">
               <img id="image2" class="panel-image">
             </wix-interact-element>
           </div>
         </wix-interact-element>

         <wix-interact-element data-wix-path="#box1">
           <div id="box1" class="box bg-red-600" style="left: 60vw; z-index: 10;">
             <wix-interact-element data-wix-path="#image1">
               <img id="image1" class="panel-image">
             </wix-interact-element>
           </div>
         </wix-interact-element>
       </div>
     </div>
   </wix-interact-element>

   <div
     class="h-screen w-full flex items-center justify-center text-center flex-col px-4"
   >
     <h2 class="text-5xl md:text-7xl font-bold text-white">
       Animation Complete
     </h2>
     <p class="text-xl text-gray-300 mt-4">
       You have scrolled through 600vh.
     </p>
   </div>
```

## Essential styles

```css
body {
       margin: 0;
       font-family: "Inter", sans-serif;
       overflow-x: hidden;
       background-color: #111827;
       color: #f3f4f6;
     }
     
     #scroll-section {
       position: relative;
       width: 100%;
       height: 700vh;
     }
     
     #sticky-container {
       position: sticky;
       top: 0;
       height: 100vh;
       width: 100vw;
       overflow: hidden;
     }
     
     .box {
       position: absolute;
       width: 100vw;
       height: 100vh;
       display: flex;
       flex-direction: column;
       justify-content: flex-end;
       align-items: flex-start;
       padding-bottom: 10vh;
       font-size: 6rem;
       font-weight: 700;
       color: white;
     }
     
     .panel-image {
       position: absolute; 
       bottom: 10vh;
       left: 0;
       width: 10vw;
       aspect-ratio: 4 / 3;
       object-fit: cover;
       box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3),
         0 4px 6px -4px rgb(0 0 0 / 0.3);
       transform-origin: left bottom;
       
     }
     
     .static-title {
       position: absolute;
       top: 10vh;
       left: 5vw;
       font-size: 2.5rem;
       font-weight: 700;
       color: white;
       z-index: 50;
     }
     
     .title-letter {
       display: inline-block;
       
       opacity: 0;
       transform: translateY(20px);
     }
     
     .dynamic-paragraph {
       position: absolute;
       top: 20vh;
       left: 5vw;
       font-size: 1.25rem;
       color: #d1d5db;
       z-index: 50;
       max-width: 300px;
       opacity: 1; 
     }
```

## Interact config

```js
const storyTexts = [
       "The story begins with a blank canvas, a space of pure potential before the first element arrives.",
       "This is the first panel. It introduces our journey with a bold statement.",
       "The second panel builds on the first, adding complexity and a new layer of color.",
       "Our third panel shifts the mood, introducing a cooler, more introspective tone.",
       "Finally, the fourth panel concludes the story, bringing all the elements into a final, cohesive view.",
     ];

let currentText = "";

const paragraph = document.getElementById("dynamic-paragraph");

const pauseStartPercent = 16.67;

const panelDurationPercent = 16.67;

const maxScale = 4;

const imageWidthVW = 10;

const box1Left = (100 - 4 * imageWidthVW) + 'vw';

const box2Left = (100 - 3 * imageWidthVW) + 'vw';

const box3Left = (100 - 2 * imageWidthVW) + 'vw';

const box4Left = (100 - imageWidthVW) + 'vw';

const finalImageLeftVW = Math.max(5, 45 - (imageWidthVW * maxScale));

function updateText(newText) {
       if (newText !== currentText) {
         paragraph.style.transition = 'opacity 0.3s ease-in-out';
         paragraph.style.opacity = '0';
         setTimeout(() => {
           paragraph.textContent = newText;
           currentText = newText;
           paragraph.style.opacity = '1';
         }, 300);
       }
     }

function buildStaggeredTitle() {
       const letterCount = 19;
       const interactions = [];
       for (let i = 0; i < letterCount; i++) {
         interactions.push({
           key: '#scroll-section',
           trigger: 'viewEnter',
           params: { type: 'once', threshold: 0.05 },
           effects: [{
             key: `.title-letter-${i}`,
             keyframeEffect: {
               name: `title-letter-in-${i}`,
               keyframes: [
                 { opacity: 0, transform: 'translateY(20px)' },
                 { opacity: 1, transform: 'translateY(0px)' }
               ]
             },
             duration: 400,
             easing: 'ease-out',
             delay: i * 50,
             fill: 'both'
           }]
         });
       }
       return interactions;
     }

const config = {
       interactions: [
         
         ...buildStaggeredTitle(),

         
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
            key: '#box1',
            keyframeEffect: { name: 'box1-move', keyframes: [{ left: box1Left }, { left: '0vw' }] },
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent, type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + panelDurationPercent, type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
            key: '#box2',
            keyframeEffect: { name: 'box2-move', keyframes: [{ left: box2Left }, { left: '0vw' }] },
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent + panelDurationPercent, type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },
          {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
            key: '#box3',
            keyframeEffect: { name: 'box3-move', keyframes: [{ left: box3Left }, { left: '0vw' }] },
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
            key: '#box4',
            keyframeEffect: { name: 'box4-move', keyframes: [{ left: box4Left }, { left: '0vw' }] },
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (4 * panelDurationPercent), type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },

         
         
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
             key: '#image1',
             keyframeEffect: {
               name: 'image1-lifecycle',
               keyframes: [
                 { transform: 'translateX(0vw) scale(1)' },
                 { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
                 { transform: `translateX(${finalImageLeftVW}vw) scale(0)`}
             ]},
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent, type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },
         
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
             key: '#image2',
             keyframeEffect: {
               name: 'image2-lifecycle',
               keyframes: [
                 { transform: 'translateX(0vw) scale(1)' },
                 { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
                 { transform: `translateX(${finalImageLeftVW}vw) scale(0)`}
             ]},
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent + panelDurationPercent, type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },
         
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
             key: '#image3',
             keyframeEffect: {
               name: 'image3-lifecycle',
               keyframes: [
                 { transform: 'translateX(0vw) scale(1)' },
                 { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` },
                 { transform: `translateX(${finalImageLeftVW}vw) scale(0)`}
             ]},
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (2 * panelDurationPercent), type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (4 * panelDurationPercent), type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },
         
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
             key: '#image4',
             keyframeEffect: { name: 'image4-scale-up', keyframes: [
                 { transform: 'translateX(0vw) scale(1)' },
                 { transform: `translateX(${finalImageLeftVW}vw) scale(${maxScale})` }
             ]},
             rangeStart: { name: 'cover', offset: { value: pauseStartPercent + (3 * panelDurationPercent), type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: pauseStartPercent + (4 * panelDurationPercent), type: 'percentage' } },
             easing: 'linear', fill: 'both'
           }]
         },

         
         {
           key: '#scroll-section',
           trigger: 'viewProgress',
           effects: [{
             key: '#dynamic-paragraph',
             customEffect: (el, progress) => {
               const p1End = (pauseStartPercent + panelDurationPercent) / 100;
               const p2End = (pauseStartPercent + 2 * panelDurationPercent) / 100;
               const p3End = (pauseStartPercent + 3 * panelDurationPercent) / 100;
               const p4End = (pauseStartPercent + 4 * panelDurationPercent) / 100;

               let textIndex;
               if (progress >= p4End) {
                   textIndex = 4;
               } else if (progress >= p3End) {
                   textIndex = 3;
               } else if (progress >= p2End) {
                   textIndex = 2;
               } else if (progress >= p1End) {
                   textIndex = 1;
               } else {
                   textIndex = 0;
               }
               updateText(storyTexts[textIndex]);
             },
             rangeStart: { name: 'cover', offset: { value: 0, type: 'percentage' } },
             rangeEnd: { name: 'cover', offset: { value: 100, type: 'percentage' } },
             fill: 'both'
           }]
         }
       ]
     };

document.getElementById('box1').style.left = box1Left;

document.getElementById('box2').style.left = box2Left;

document.getElementById('box3').style.left = box3Left;

document.getElementById('box4').style.left = box4Left;

document.querySelectorAll('.panel-image').forEach(el => {
         el.style.width = imageWidthVW + 'vw';
       });
```
