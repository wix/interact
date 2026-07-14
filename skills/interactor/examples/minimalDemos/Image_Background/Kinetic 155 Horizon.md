# Kinetic 155 Horizon

A scroll-driven, pointer-driven and hover-triggered animation for layered visual elements in a sticky scroll section, flex/carousel, layered composition layout. It uses Tilt3DMouse, transform, opacity to create the motion and transition between visual states.

**Tags:** trigger: viewProgress, pointerMove, hover; layout: sticky scroll section, flex/carousel, layered composition; motion: Tilt3DMouse, transform, opacity

## Markup

```html
<div class="fixed inset-0 z-0 pointer-events-none">
        <img
            class="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.75]"
        />
        <div class="absolute inset-0 bg-black/5"></div>
    </div>

    <interact-element data-interact-key="scroll-trigger" class="relative z-10 block h-[500vh]">

        <interact-element data-interact-key="sticky-scene" class="sticky top-0 h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 scene-container pointer-events-auto">

            <interact-element data-interact-key="scroll-layer" class="preserve-3d">

                <interact-element data-interact-key="mouse-layer" class="preserve-3d">

                    <interact-element data-interact-key="hover-layer" class="preserve-3d">

                        <div class="beauty-card-ui p-12 md:p-24 w-[85vw] md:w-full max-w-lg aspect-[4/5] md:aspect-square">
                            <h3 class="text-4xl md:text-7xl font-bold leading-[1.05] mb-4 md:mb-8 text-[#1d1d1f] tracking-tighter">
                                Untamed<br/>Beauty.
                            </h3>
                            <p class="text-lg md:text-2xl font-medium leading-relaxed text-[#86868b] max-w-[280px] md:max-w-xs mx-auto">
                                In every walk with nature one receives far more than he seeks.
                            </p>
                        </div>
                    </interact-element>

                </interact-element>
            </interact-element>

        </interact-element>
    </interact-element>

    <div class="h-[20vh] bg-transparent"></div>
```

## Essential styles

```css
body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: black;
            margin: 0;
            overflow-x: clip;
        }
        
        
        body::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }

        
        .preserve-3d {
            transform-style: preserve-3d;
            backface-visibility: hidden;
        }

        .scene-container {
            overflow: clip;
            perspective: 2500px;
        }
        
        interact-element {
            display: block;
        }

        .beauty-card-ui {
            background-color: white;
            box-shadow: 0 100px 200px -50px rgba(0,0,0,0.85);
            border: 1px solid rgba(255,255,255,0.05);
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            user-select: none;
        }
```

## Interact config

```js
const config = {
            interactions: [
                
                {
                    key: 'scroll-trigger',
                    trigger: 'viewProgress',
                    effects: [
                        {
                            key: 'scroll-layer',
                            rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
                            rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
                            fill: 'both',
                            keyframeEffect: {
                                name: 'kinetic-155-horizon-scroll',
                                keyframes: [
                                    { offset: 0, transform: 'rotateY(155deg) scale(0.75)', opacity: 1 },
                                    { offset: 0.4, transform: 'rotateY(0deg) scale(1)', opacity: 1 },
                                    { offset: 0.6, transform: 'rotateY(0deg) scale(1)', opacity: 1 },
                                    { offset: 1, transform: 'rotateY(-155deg) scale(0.75)', opacity: 1 }
                                ]
                            }
                        }
                    ]
                },
                
                {
                    key: 'sticky-scene',
                    trigger: 'pointerMove',
                    params: { hitArea: 'root' },
                    effects: [
                        {
                            key: 'mouse-layer',
                            namedEffect: { type: 'Tilt3DMouse' },
                            transitionDuration: 600,
                            easing: 'ease-out'
                        }
                    ]
                },
                
                {
                    key: 'hover-layer',
                    trigger: 'hover',
                    params: { method: 'toggle' },
                    effects: [
                        {
                            transition: {
                                duration: 400,
                                easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
                                styleProperties: [
                                    { name: 'transform', value: 'scale(1.05)' }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
```
