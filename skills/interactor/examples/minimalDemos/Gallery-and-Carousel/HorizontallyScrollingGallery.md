# HorizontallyScrollingGallery

A hover-triggered animation for gallery items in a grid/gallery, flex/carousel, layered composition layout. It uses layered transforms to create the motion and transition between visual states.

**Tags:** trigger: hover; layout: grid/gallery, flex/carousel, layered composition; motion: custom animation

## Markup

```html
<div class="gallery-container">
        <div class="gallery-grid">

            <interact-element data-interact-key="item-1">
                <div class="gallery-item">
                    <interact-element data-interact-key="clip-1">
                        <div class="image-clipper">
                            <interact-element data-interact-key="img-1">
                                <img>
                            </interact-element>
                        </div>
                    </interact-element>
                    <interact-element data-interact-key="text-1">
                        <div class="gallery-item-text">
                            <h3 class="gallery-item-title">Serene Lake</h3>
                        </div>
                    </interact-element>
                </div>
            </interact-element>

            <interact-element data-interact-key="item-2">
                <div class="gallery-item">
                    <interact-element data-interact-key="clip-2">
                        <div class="image-clipper">
                            <interact-element data-interact-key="img-2">
                                <img>
                            </interact-element>
                        </div>
                    </interact-element>
                    <interact-element data-interact-key="text-2">
                        <div class="gallery-item-text">
                            <h3 class="gallery-item-title">Mountain Majesty</h3>
                        </div>
                    </interact-element>
                </div>
            </interact-element>

            <interact-element data-interact-key="item-3">
                <div class="gallery-item">
                    <interact-element data-interact-key="clip-3">
                        <div class="image-clipper">
                            <interact-element data-interact-key="img-3">
                                <img>
                            </interact-element>
                        </div>
                    </interact-element>
                    <interact-element data-interact-key="text-3">
                        <div class="gallery-item-text">
                            <h3 class="gallery-item-title">Coastal Drive</h3>
                        </div>
                    </interact-element>
                </div>
            </interact-element>

            <interact-element data-interact-key="item-4">
                <div class="gallery-item">
                    <interact-element data-interact-key="clip-4">
                        <div class="image-clipper">
                            <interact-element data-interact-key="img-4">
                                <img>
                            </interact-element>
                        </div>
                    </interact-element>
                    <interact-element data-interact-key="text-4">
                        <div class="gallery-item-text">
                            <h3 class="gallery-item-title">Forest Path</h3>
                        </div>
                    </interact-element>
                </div>
            </interact-element>

            <interact-element data-interact-key="item-5">
                <div class="gallery-item">
                    <interact-element data-interact-key="clip-5">
                        <div class="image-clipper">
                            <interact-element data-interact-key="img-5">
                                <img>
                            </interact-element>
                        </div>
                    </interact-element>
                    <interact-element data-interact-key="text-5">
                        <div class="gallery-item-text">
                            <h3 class="gallery-item-title">Desert Dunes</h3>
                        </div>
                    </interact-element>
                </div>
            </interact-element>

            <interact-element data-interact-key="item-6">
                <div class="gallery-item">
                    <interact-element data-interact-key="clip-6">
                        <div class="image-clipper">
                            <interact-element data-interact-key="img-6">
                                <img>
                            </interact-element>
                        </div>
                    </interact-element>
                    <interact-element data-interact-key="text-6">
                        <div class="gallery-item-text">
                            <h3 class="gallery-item-title">City Lights</h3>
                        </div>
                    </interact-element>
                </div>
            </interact-element>

        </div>
    </div>
```

## Essential styles

```css
body {
            font-family: 'Inter', sans-serif;
            background-color: #000;
            color: white;
            overflow: hidden;
            margin: 0;
        }
        .gallery-container {
            display: flex;
            align-items: center;
            height: 100vh;
            width: 100vw;
            position: relative;
        }
        .gallery-grid {
            display: flex;
            overflow-x: auto;
            padding: 0 1.5vw;
            -ms-overflow-style: none;
            scrollbar-width: none;
            
            scroll-behavior: auto; 
        }
        .gallery-grid::-webkit-scrollbar { display: none; }
        
        .gallery-item {
            cursor: pointer;
            position: relative;
            flex-shrink: 0;
            height: 50vh;
            width: 30vw;
            margin: 0 1.5vw;
            background-color: #000;
            overflow: hidden;
            border-radius: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            
        }
        
        .image-clipper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            
            clip-path: ellipse(142% 142% at 50% 50%);
            transform: rotate(0deg);
            will-change: transform, clip-path;
        }

        .gallery-item img {
            height: 100%;
            width: 100%;
            object-fit: cover;
            display: block;
            
            transform: scale(1) rotate(0deg);
            will-change: transform;
        }

        .gallery-item-text {
            position: relative; 
            z-index: 5;
            color: white;
            text-align: center;
            
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
            text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        }

        .gallery-item-title {
            font-size: clamp(0.8rem, 2vw, 1.2rem);
            font-weight: 700;
            text-transform: uppercase;
        }
```

## Interact config

```js
const itemCount = 6;

const interactions = [];

for (let i = 1; i <= itemCount; i++) {
            interactions.push({
                key: `item-${i}`,       
                trigger: 'hover',       
                
                effects: [
                    
                    {
                        key: `clip-${i}`,
                        transition: {
                            duration: 600,
                            easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
                            
                            styleProperties: [
                                { name: 'transform', value: 'rotate(45deg)' },
                                { name: 'clip-path', value: 'ellipse(35% 45% at 50% 50%)' }
                            ]
                        }
                    },
                    
                    {
                        key: `img-${i}`,
                        transition: {
                            duration: 600,
                            easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
                            styleProperties: [
                                { name: 'transform', value: 'rotate(-45deg) scale(1.5)' }
                            ]
                        }
                    },
                    
                    {
                        key: `text-${i}`,
                        transition: {
                            duration: 500,
                            easing: 'ease-out',
                            styleProperties: [
                                { name: 'opacity', value: '1' },
                                { name: 'transform', value: 'translateY(0)' }
                            ]
                        }
                    }
                ]
            });
        }

const config = { interactions };
```
