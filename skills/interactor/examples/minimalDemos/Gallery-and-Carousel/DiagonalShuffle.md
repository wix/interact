# DiagonalShuffle

A scroll-driven animation for layered visual elements in a sticky scroll section, layered composition, 3D scene layout. It uses transform, opacity to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, layered composition, 3D scene; motion: transform, opacity

## Markup

```html
<div class="h-[100vh]"></div>

    <wix-interact-element data-wix-path="#scroll-section">
        <div id="scroll-section">
            <div class="sticky-wrapper">

                <wix-interact-element data-wix-path="#card-1">
                    <div id="card-1" class="card">
                        <img
                             class="absolute inset-0 w-full h-full object-cover">
                        <div class="card-content z-10">
                            <h2 class="card-title">Misty Mountains</h2>
                            <p class="card-description">A journey through ethereal landscapes.</p>
                        </div>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#card-2">
                    <div id="card-2" class="card">
                        <img
                             class="absolute inset-0 w-full h-full object-cover">
                         <div class="card-content z-10">
                            <h2 class="card-title">Forest Canopy</h2>
                            <p class="card-description">Overhead view of a dense, green forest.</p>
                        </div>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#card-3">
                    <div id="card-3" class="card">
                        <img
                             class="absolute inset-0 w-full h-full object-cover">
                         <div class="card-content z-10">
                            <h2 class="card-title">Alpine Lake</h2>
                            <p class="card-description">Crystal clear water reflecting the peaks.</p>
                        </div>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#card-4">
                    <div id="card-4" class="card">
                        <img
                             class="absolute inset-0 w-full h-full object-cover">
                         <div class="card-content z-10">
                            <h2 class="card-title">Hidden Waterfall</h2>
                            <p class="card-description">Nature's raw and untamed power.</p>
                        </div>
                    </div>
                </wix-interact-element>

                <wix-interact-element data-wix-path="#card-5">
                    <div id="card-5" class="card">
                        <img
                             class="absolute inset-0 w-full h-full object-cover">
                         <div class="card-content z-10">
                            <h2 class="card-title">Rolling Hills</h2>
                            <p class="card-description">Endless green fields under a summer sky.</p>
                        </div>
                    </div>
                </wix-interact-element>

            </div>
        </div>
    </wix-interact-element>
```

## Essential styles

```css
body {
            font-family: 'Inter', sans-serif;
            background-color: #fffff; 
            color: #000;
            overflow-x: hidden;
        }

        
        #scroll-section {
            position: relative;
            height: 450vh; 
        }

        
        .sticky-wrapper {
            position: sticky;
            top: 0;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            perspective: 1200px; 
        }

        .card {
            position: absolute;
            top: 50%;
            left: 50%;
            
            
            width: 90vw; 
            max-width: 400px; 
            
            
            aspect-ratio: 3 / 4; 
            
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            
            opacity: 0;
            will-change: transform, opacity;
            transform-style: preserve-3d;
            overflow: hidden; 
        }

        .card-content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1rem; 
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            color: white;
        }

        .card-title {
            font-size: 1.25rem; 
            font-weight: 700;
        }

        .card-description {
            font-size: 0.875rem; 
            opacity: 0.8;
            margin-top: 0.25rem;
        }

        
        @media (min-width: 768px) {
            .card {
                
                aspect-ratio: 4 / 3;
            }
            .card-content {
                padding: 1.5rem; 
            }
            .card-title {
                font-size: 1.5rem; 
            }
            .card-description {
                font-size: 0.9rem; 
            }
        }
```

## Interact config

```js
const interactions = [
            
            {
                key: '#scroll-section',
                trigger: 'viewProgress',
                effects: [{
                    key: '#card-1',
                    keyframeEffect: {
                        name: 'card-1-fly-in',
                        keyframes: [
                            { transform: 'translate(-50%, -50%) translate(-80vw, 50vh) rotate(-45deg) scale(0.7)', opacity: 1 },
                            { transform: 'translate(-50%, -50%) translate(0, 0) rotate(-4deg) scale(1)', opacity: 1 }
                        ]
                    },
                    rangeStart: { name: 'cover', offset: { type: 'percentage', value: 5 } },
                    rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 25 } },
                    easing: 'ease-out',
                    fill: 'both'
                }]
            },
            
            {
                key: '#scroll-section',
                trigger: 'viewProgress',
                effects: [{
                    key: '#card-2',
                    keyframeEffect: {
                        name: 'card-2-fly-in',
                        keyframes: [
                            { transform: 'translate(-50%, -50%) translate(80vw, 50vh) rotate(45deg) scale(0.7)', opacity: 1 },
                            { transform: 'translate(-50%, -50%) translate(0, 0) rotate(3deg) scale(1)', opacity: 1 }
                        ]
                    },
                    rangeStart: { name: 'cover', offset: { type: 'percentage', value: 20 } },
                    rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 40 } },
                    easing: 'ease-out',
                    fill: 'both'
                }]
            },
            
            {
                key: '#scroll-section',
                trigger: 'viewProgress',
                effects: [{
                    key: '#card-3',
                    keyframeEffect: {
                        name: 'card-3-fly-in',
                        keyframes: [
                            { transform: 'translate(-50%, -50%) translate(-80vw, 50vh) rotate(-45deg) scale(0.7)', opacity: 1 },
                            { transform: 'translate(-50%, -50%) translate(0, 0) rotate(-2deg) scale(1)', opacity: 1 }
                        ]
                    },
                    rangeStart: { name: 'cover', offset: { type: 'percentage', value: 35 } },
                    rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 55 } },
                    easing: 'ease-out',
                    fill: 'both'
                }]
            },
            
            {
                key: '#scroll-section',
                trigger: 'viewProgress',
                effects: [{
                    key: '#card-4',
                    keyframeEffect: {
                        name: 'card-4-fly-in',
                        keyframes: [
                            { transform: 'translate(-50%, -50%) translate(80vw, 50vh) rotate(45deg) scale(0.7)', opacity: 1 },
                            { transform: 'translate(-50%, -50%) translate(0, 0) rotate(1deg) scale(1)', opacity: 1 }
                        ]
                    },
                    rangeStart: { name: 'cover', offset: { type: 'percentage', value: 50 } },
                    rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 70 } },
                    easing: 'ease-out',
                    fill: 'both'
                }]
            },
            
            {
                key: '#scroll-section',
                trigger: 'viewProgress',
                effects: [{
                    key: '#card-5',
                    keyframeEffect: {
                        name: 'card-5-fly-in',
                        keyframes: [
                            { transform: 'translate(-50%, -50%) translate(-80vw, 50vh) rotate(-45deg) scale(0.7)', opacity: 1 },
                            { transform: 'translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1)', opacity: 1 }
                        ]
                    },
                    rangeStart: { name: 'cover', offset: { type: 'percentage', value: 65 } },
                    rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 85 } },
                    easing: 'ease-out',
                    fill: 'both'
                }]
            }
        ];

const config = { interactions };
```
