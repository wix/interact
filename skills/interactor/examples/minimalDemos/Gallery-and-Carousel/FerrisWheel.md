# FerrisWheel

A page-load animation for gallery items in a flex/carousel, list/repeater, layered composition layout. It uses transform to create the motion and transition between visual states.

**Tags:** trigger: pageVisible; layout: flex/carousel, list/repeater, layered composition; motion: transform

## Markup

```html
<div class="content">
        <h1 class="main-title">Brand Showcase</h1>
        <h2 class="sub-title">Dynamic Circular Tile Animation</h2>

        <wix-interact-element data-wix-path="#tile-ring">
            <div id="tile-ring" class="tile-ring">

                <wix-interact-element data-wix-path="#tile-1">
                    <div id="tile-1" class="tile">
                        <img>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#tile-2">
                    <div id="tile-2" class="tile">
                        <img>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#tile-3">
                    <div id="tile-3" class="tile">
                        <img>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#tile-4">
                    <div id="tile-4" class="tile">
                        <img>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#tile-5">
                    <div id="tile-5" class="tile">
                        <img>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#tile-6">
                    <div id="tile-6" class="tile">
                        <img>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#tile-7">
                    <div id="tile-7" class="tile">
                        <img>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#tile-8">
                    <div id="tile-8" class="tile">
                        <img>
                    </div>
                </wix-interact-element>
            </div>
        </wix-interact-element>
    </div>
```

## Essential styles

```css
:root {
            --r: 20;
            --ts: 17;
        }

        
        body {
            margin: 0;
            background-color: #f4f4f4;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #111;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            height: 100vh;
        }

        
        .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 4vh;
        }

        
        .main-title {
            font-size: 3rem;
            margin: 0.4em 0 0.1em;
        }

        
        .sub-title {
            font-size: 1.4rem;
            margin-bottom: 3em;
            font-weight: 400;
            color: #444;
        }

        
        .tile-ring {
            position: relative;
            width:  69vmin;
            height: 69vmin;
            transform-origin: center center;
        }

        
        .tile {
            position: absolute;
            width:  calc(var(--ts) * 1vmin);
            height: calc(var(--ts) * 1vmin);
            left: 50%;
            top: 50%;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 14px rgba(0,0,0,0.2);
            transform-origin: center center;
        }

        
        #tile-1 { margin-left: calc((var(--r) * 1       - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * 0       - var(--ts) / 2) * 1vmin); z-index: 100; }
        #tile-2 { margin-left: calc((var(--r) * 0.7071  - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * 0.7071  - var(--ts) / 2) * 1vmin); z-index: 171; }
        #tile-3 { margin-left: calc((var(--r) * 0       - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * 1       - var(--ts) / 2) * 1vmin); z-index: 200; }
        #tile-4 { margin-left: calc((var(--r) * -0.7071 - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * 0.7071  - var(--ts) / 2) * 1vmin); z-index: 171; }
        #tile-5 { margin-left: calc((var(--r) * -1      - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * 0       - var(--ts) / 2) * 1vmin); z-index: 100; }
        #tile-6 { margin-left: calc((var(--r) * -0.7071 - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * -0.7071 - var(--ts) / 2) * 1vmin); z-index: 29;  }
        #tile-7 { margin-left: calc((var(--r) * 0       - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * -1      - var(--ts) / 2) * 1vmin); z-index: 0;   }
        #tile-8 { margin-left: calc((var(--r) * 0.7071  - var(--ts) / 2) * 1vmin); margin-top: calc((var(--r) * -0.7071 - var(--ts) / 2) * 1vmin); z-index: 29;  }

        
        .tile img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        
        wix-interact-element {
            display: contents;
        }
```

## Interact config

```js
const config = {
            
            effects: {
                'ring-rotation': {
                    keyframeEffect: {
                        name: 'ring-rotation-kf',
                        keyframes: [
                            { transform: 'rotate(0deg)' },
                            { transform: 'rotate(360deg)' }
                        ]
                    },
                    duration: 25000,
                    iterations: Infinity,
                    easing: 'linear'
                },
                'tile-counter-rotation': {
                    keyframeEffect: {
                        name: 'tile-counter-rotation-kf',
                        keyframes: [
                            { transform: 'rotate(0deg)' },
                            { transform: 'rotate(-360deg)' }
                        ]
                    },
                    duration: 25000,
                    iterations: Infinity,
                    easing: 'linear'
                }
            },
            
            interactions: [
                {
                    
                    key: '#tile-ring',
                    
                    trigger: 'pageVisible',
                    params: { type: 'once' },
                    
                    effects: [
                        
                        {
                            key: '#tile-ring',
                            effectId: 'ring-rotation'
                        },
                        
                        { key: '#tile-1', effectId: 'tile-counter-rotation' },
                        { key: '#tile-2', effectId: 'tile-counter-rotation' },
                        { key: '#tile-3', effectId: 'tile-counter-rotation' },
                        { key: '#tile-4', effectId: 'tile-counter-rotation' },
                        { key: '#tile-5', effectId: 'tile-counter-rotation' },
                        { key: '#tile-6', effectId: 'tile-counter-rotation' },
                        { key: '#tile-7', effectId: 'tile-counter-rotation' },
                        { key: '#tile-8', effectId: 'tile-counter-rotation' }
                    ]
                }
            ]
        };
```
