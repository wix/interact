# Mouse Track Infinite Gallery

A hover-triggered animation for gallery items in a grid/gallery, flex/carousel, layered composition layout. It uses layered transforms to create the motion and transition between visual states.

**Tags:** trigger: hover; layout: grid/gallery, flex/carousel, layered composition; motion: custom animation

## Markup

```html
<div id="loading">Initializing Gallery...</div>

<div id="gallery-viewport">
    <div id="gallery-content">

    </div>
</div>
```

## Essential styles

```css
:root {
            
            --item-size: 40vh; 
        }

        body {
            margin: 0;
            overflow: hidden; 
            background-color: #ffffff; 
            color: black; 
            font-family: 'Helvetica Neue', sans-serif;
            user-select: none; 
        }

        
        #gallery-viewport {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            cursor: grab;
            position: relative;
        }

        #gallery-viewport:active {
            cursor: grabbing;
        }

        
        #gallery-content {
            position: relative;
            width: 100%;
            height: 100%;
        }

        
        .gallery-item {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: var(--item-size); 
            will-change: transform; 
        }

        
        .img-wrapper {
            width: 100%;
            height: var(--item-size);
            border-radius: 4px;
            overflow: hidden;
            background: #1a1a1a;
            position: relative;
            box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.2);
        }

        .parallax-layer {
            width: 100%;
            height: 100%;
            will-change: transform;
            transform: scale(3.0); 
            transform-origin: center;
        }

        .gallery-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transform-origin: center;
        }

        
        .text-wrapper {
            position: absolute;
            top: 100%; 
            padding-top: 5px; 
            left: 0;
            width: 100%;
            pointer-events: none; 
        }

        .gallery-text {
            font-size: 14px;
            font-weight: 500;
            color: #111111;
            letter-spacing: 0.5px;
            transform-origin: top left;
            display: inline-block;
            white-space: nowrap;
        }

        
        @media (max-width: 768px) {
            .gallery-text {
                font-size: 12px;
            }
        }

        #loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #666;
            z-index: 100;
        }
```

## Interact config

```js
const container = document.getElementById('gallery-content');

const totalItems = 40;

const interactions = [];

const HOVER_BLUR = 8;

const GRID_COLS = 8;

const layout = {
        itemSize: 0,
        gap: 0,
        colPitch: 0,
        rowPitch: 0,
        worldWidth: 0,
        worldHeight: 0
    };

const imageTitles = [
        "NEON VOID", "URBAN ECHO", "SILENT FORM", "LIQUID TIME", "GLASS SOUL",
        "CONCRETE SKY", "VELVET HAZE", "IRON PULSE", "SOLAR DRIFT", "LUNAR EDGE",
        "PRISM CORE", "STATIC FLOW", "ECHO CHAMBER", "NIGHT BLOOM", "WHITE NOISE",
        "SHADOW PLAY", "METAL HEART", "OCEAN DUST", "WINTER SUN", "DESERT ICE",
        "CYBER MIST", "RAPID EYE", "ZERO GRAVITY", "BLIND SPOT", "DEEP FOCUS",
        "RAW MATTER", "PURE LOGIC", "LOST SIGNAL", "DARK MATTER", "LIGHT WAVE",
        "AUTO PILOT", "BLUE STEEL", "RED SHIFT", "GREEN ZONE", "GOLD RUSH",
        "SILVER LINE", "COPPER TONE", "CHROME LIFE", "CARBON COPY", "FINAL CUT"
    ];

for (let i = 0; i < totalItems; i++) {
        const itemKey = `item-${i}`;
        const imgKey = `img-${i}`;
        const txtKey = `txt-${i}`;
        
        
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);
        const baseX = col * layout.colPitch;
        const baseY = row * layout.rowPitch;

        const imageUrl = `IMAGE_URL`;
        const title = imageTitles[i % imageTitles.length];

        const div = document.createElement('div');
        div.className = 'gallery-item';
        
        div.innerHTML = `
            <interact-element data-interact-key="${itemKey}">
                <div class="cursor-pointer">
                    <div class="img-wrapper">
                        <div class="parallax-layer" id="parallax-${i}">
                            <interact-element data-interact-key="${imgKey}">
                                <img 
                                    class="gallery-img"
                                />
                            </interact-element>
                        </div>
                    </div>
                    <div class="text-wrapper">
                        <interact-element data-interact-key="${txtKey}">
                            <div class="gallery-text">
                                ${title}
                            </div>
                        </interact-element>
                    </div>
                </div>
            </interact-element>
        `;
        
        container.appendChild(div);
        
        
        window.galleryItems.push({
            container: div,
            parallax: document.getElementById(`parallax-${i}`),
            baseX: baseX,
            baseY: baseY
        });

        
        
        
        interactions.push({
            key: itemKey,
            trigger: 'hover',
            effects: [
                {
                    key: imgKey,
                    transition: {
                        duration: 600,
                        easing: 'ease-out',
                        styleProperties: [
                            { name: 'filter', value: 'blur(' + HOVER_BLUR + 'px)' },
                            { name: 'transform', value: 'scale(0.95)' }
                        ]
                    },
                    fill: 'both',
                    composite: 'add'
                },
                {
                    key: txtKey,
                    transition: {
                        duration: 500,
                        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', 
                        styleProperties: [
                            { name: 'opacity', value: '0.4' } 
                        ]
                    },
                    fill: 'both',
                    composite: 'replace'
                }
            ]
        });
    }

const config = { interactions: interactions };
```
