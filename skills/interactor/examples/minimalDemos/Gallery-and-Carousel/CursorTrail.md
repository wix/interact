# CursorTrail

A page-load animation for pointer-responsive visual elements in a layered composition, 3D scene layout. It uses opacity to create the motion and transition between visual states.

**Tags:** trigger: pageVisible; layout: layered composition, 3D scene; motion: opacity

## Markup

```html
<div id="effect-container" class="relative w-full h-full">

        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">

            <wix-interact-element data-wix-path="helper-text">
                <p class="text-gray-400 text-lg">
                    Move your mouse around the screen
                </p>
            </wix-interact-element>
        </div>
    </div>
```

## Essential styles

```css
:root {
            --trigger-distance: 85;
            --spawn-count: 1;
            --base-size: 210;
            --border-radius: 0;
        }

        
        html, body {
            font-family: 'Inter', sans-serif;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden; 
        }

        
        .popup-wrapper {
            position: absolute;
            
            transform: translate(-50%, -50%);
            
            pointer-events: none;
            
            animation: popAndFade 0.55s ease-out forwards;
            will-change: transform, opacity;
        }

        
        .popup-wrapper img {
            display: block;
            
            width: auto;
            height: auto;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        

        
        @keyframes popAndFade {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            32% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            80% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0;
            }
        }
```

## Interact config

```js
const config = {
            interactions: [
                {
                    
                    key: 'helper-text',
                    trigger: 'pageVisible',
                    params: {
                        type: 'once'
                    },
                    effects: [
                        {
                            key: 'helper-text',
                            
                            keyframeEffect: {
                                name: 'gentleFadeOut',
                                
                                keyframes: [
                                    { opacity: 1, offset: 0 },
                                    { opacity: 1, offset: 0.8 }, 
                                    { opacity: 0, offset: 1.0 }  
                                ]
                            },
                            duration: 4000, 
                            fill: 'forwards' 
                        }
                    ]
                }
            ]
        };
```
