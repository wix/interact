# MantaRay

A viewport-entry, hover-triggered, hover-triggered and mouseleave-triggered animation for pointer-responsive visual elements in a grid/gallery, layered composition, 3D scene layout. It uses transform to create the motion and transition between visual states.

**Tags:** trigger: viewEnter, hover, mouseenter, mouseleave; layout: grid/gallery, layered composition, 3D scene; motion: transform

## Markup

```html
<section class="min-h-screen flex items-center justify-center py-12 px-[10px] overflow-hidden">
        <div id="gallery-container" class="flex flex-nowrap justify-center items-center w-full gallery-wrapper">
            </div>
    </section>

    <wix-interact-element data-wix-path="tooltip-wrapper" class="fixed bottom-4 left-4 pointer-events-none z-[99999]">
        <div id="image-tooltip" class="text-black opacity-0 transform translate-y-4 transition-all duration-300 ease-out">
            <h3 id="tooltip-title" class="font-extrabold text-2xl text-gray-900"></h3>
            <p id="tooltip-subtitle" class="text-lg text-gray-600"></p>
        </div>
    </wix-interact-element>
```

## Essential styles

```css
body { font-family: 'Inter', sans-serif; }
        
        wix-interact-element:not(:defined) { opacity: 0; }
        
        :root {
            --base-size: 12;
            --size-variation: 0;
            --overlap-ratio: 0.67;
        }

        
        .gallery-wrapper {
            perspective: 1000px;
        }

        wix-interact-element[data-wix-path^="img-wrapper-"] {
            width: max(
                calc(var(--base-size) * 0.3 * 1vw),
                calc((var(--base-size) + var(--rnd-off, 0) * var(--size-variation) * var(--base-size) * 1.5) * 1vw)
            );
            flex-shrink: 0;
        }

        #gallery-container > wix-interact-element + wix-interact-element {
            margin-left: calc(var(--base-size) * var(--overlap-ratio) * -1vw);
        }

        
        wix-interact-element {
            position: relative;
            z-index: 1; 
            transition: z-index 0s; 
        }
        wix-interact-element:hover {
            z-index: 9999 !important; 
        }

        
        .tooltip-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .tooltip-hidden { opacity: 0 !important; transform: translateY(16px) !important; }
```

## Interact config

```js
const HOVER_SCALE = 2.5;

function seededRandom(seed) {
            const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
            return x - Math.floor(x);
        }

const imageData = [
            { title: "Crimson Bloom", sub: "By Artist Name 1", src: 'IMAGE_URL' },
            { title: "Azure Waves", sub: "By Artist Name 2", src: 'IMAGE_URL' },
            { title: "Golden Fields", sub: "By Artist Name 3", src: 'IMAGE_URL' },
            { title: "Forest Deep", sub: "By Artist Name 4", src: 'IMAGE_URL' },
            { title: "Urban Lines", sub: "By Artist Name 5", src: 'IMAGE_URL' },
            { title: "Pastel Sky", sub: "By Artist Name 6", src: 'IMAGE_URL' },
            { title: "Desert Warmth", sub: "By Artist Name 7", src: 'IMAGE_URL' },
            { title: "Monochrome", sub: "By Artist Name 8", src: 'IMAGE_URL' },
            { title: "River Bend", sub: "By Artist Name 9", src: 'IMAGE_URL' },
            { title: "Mountain Peak", sub: "By Artist Name 10", src: 'IMAGE_URL' },
            { title: "Ocean Spray", sub: "By Artist Name 11", src: 'IMAGE_URL' },
            { title: "Autumn Leaves", sub: "By Artist Name 12", src: 'IMAGE_URL' },
            { title: "Winter's Touch", sub: "By Artist Name 13", src: 'IMAGE_URL' },
            { title: "Spring Fling", sub: "By Artist Name 14", src: 'IMAGE_URL' },
            { title: "Summer Haze", sub: "By Artist Name 15", src: 'IMAGE_URL' },
            { title: "City Lights", sub: "By Artist Name 16", src: 'IMAGE_URL' },
            { title: "Country Road", sub: "By Artist Name 17", src: 'IMAGE_URL' },
            { title: "Starry Night", sub: "By Artist Name 18", src: 'IMAGE_URL' },
            { title: "Calm Waters", sub: "By Artist Name 19", src: 'IMAGE_URL' },
            { title: "Wild Flower", sub: "By Artist Name 20", src: 'IMAGE_URL' },
            { title: "Ancient Stone", sub: "By Artist Name 21", src: 'IMAGE_URL' },
            { title: "Blue Hue", sub: "By Artist Name 22", src: 'IMAGE_URL' },
            { title: "Red Barn", sub: "By Artist Name 23", src: 'IMAGE_URL' },
            { title: "Morning Mist", sub: "By Artist Name 24", src: 'IMAGE_URL' },
            { title: "Evening Glow", sub: "By Artist Name 25", src: 'IMAGE_URL' },
            { title: "Final Piece", sub: "By Artist Name 26", src: 'IMAGE_URL' }
        ];

const container = document.getElementById('gallery-container');

const interactConfig = {
            effects: {
                
                'breathe-vertical': {
                    keyframeEffect: {
                        name: 'breathe',
                        keyframes: [
                            { transform: 'translateY(-62px)' },
                            { transform: 'translateY(262px)' }
                        ]
                    },
                    duration: 2000,
                    easing: 'ease-in-out',
                    iterations: Infinity,
                    alternate: true
                },
                'scale-up-image': {
                    keyframeEffect: {
                        name: 'scale-up',
                        keyframes: [
                            { transform: 'scale(1)' },
                            { transform: 'scale(' + HOVER_SCALE + ')' }
                        ]
                    },
                    duration: 300,
                    easing: 'ease-out',
                    fill: 'both'
                }
            },
            interactions: []
        };

const tooltipEl = document.getElementById('image-tooltip');

const tooltipTitle = document.getElementById('tooltip-title');

const tooltipSub = document.getElementById('tooltip-subtitle');

imageData.forEach((data, index) => {
            const wrapperId = `img-wrapper-${index}`;
            const randomOffset = (seededRandom(index + 1) - 0.5) * 2;

            const wrapper = document.createElement('wix-interact-element');
            wrapper.setAttribute('data-wix-path', wrapperId);
            wrapper.className = 'pointer-events-auto cursor-pointer';
            wrapper.style.setProperty('--rnd-off', randomOffset.toFixed(4));
            
            
            const img = document.createElement('img');

            img.className = 'w-full h-auto shadow-md rounded-sm';

            
            
            wrapper.addEventListener('mouseenter', () => {
                tooltipTitle.textContent = data.title;
                tooltipSub.textContent = data.sub;
                tooltipEl.classList.remove('opacity-0', 'translate-y-4');
                tooltipEl.classList.add('opacity-100', 'translate-y-0');
            });
            
            wrapper.addEventListener('mouseleave', () => {
                tooltipEl.classList.remove('opacity-100', 'translate-y-0');
                tooltipEl.classList.add('opacity-0', 'translate-y-4');
            });

            wrapper.appendChild(img);
            container.appendChild(wrapper);

            

            
            interactConfig.interactions.push({
                key: wrapperId,
                trigger: 'viewEnter',
                params: { type: 'once', threshold: 0 },
                effects: [
                    {
                        key: wrapperId,
                        effectId: 'breathe-vertical',
                        delay: index * 150,
                        composite: 'add'
                    }
                ]
            });

            
            interactConfig.interactions.push({
                key: wrapperId,
                trigger: 'hover',
                params: { type: 'alternate' },
                effects: [
                    {
                        key: wrapperId,
                        selector: 'img',
                        effectId: 'scale-up-image',
                        composite: 'add'
                    }
                ]
            });
        });
```
