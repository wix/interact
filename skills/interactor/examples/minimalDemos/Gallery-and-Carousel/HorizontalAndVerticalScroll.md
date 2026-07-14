# HorizontalAndVerticalScroll

A scroll-driven animation for layered visual elements in a sticky scroll section, flex/carousel, layered composition layout. It uses transform to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, flex/carousel, layered composition; motion: transform

## Markup

```html
<wix-interact-element data-wix-path="#scroll-section">
        <section id="scroll-section" class="relative" style="height: 900vh;">

            <div class="sticky-wrap">

                <wix-interact-element data-wix-path="#stack">
                    <div id="stack" class="flex w-max">

                        <wix-interact-element data-wix-path="#card-1">
                            <div id="card-1" class="card relative flex flex-col justify-end text-white overflow-hidden">
                                <img>
                                <div class="card-content p-6 md:p-8">
                                    <h2 class="text-3xl md:text-4xl font-bold">Discovery</h2>
                                    <p class="text-base md:text-lg">Every scroll reveals something new.</p>
                                </div>
                            </div>
                        </wix-interact-element>

                        <wix-interact-element data-wix-path="#card-2">
                            <div id="card-2" class="card relative flex flex-col justify-end text-white overflow-hidden">
                                <img>
                                <div class="card-content p-6 md:p-8">
                                    <h2 class="text-3xl md:text-4xl font-bold">Progression</h2>
                                    <p class="text-base md:text-lg">Building momentum with each frame.</p>
                                </div>
                            </div>
                        </wix-interact-element>

                        <wix-interact-element data-wix-path="#card-3">
                            <div id="card-3" class="card relative flex flex-col justify-end text-white overflow-hidden">
                                <img>
                                <div class="card-content p-6 md:p-8">
                                    <h2 class="text-3xl md:text-4xl font-bold">Harmony</h2>
                                    <p class="text-base md:text-lg">Where design and motion align.</p>
                                </div>
                            </div>
                        </wix-interact-element>

                        <wix-interact-element data-wix-path="#card-4">
                            <div id="card-4" class="card relative flex flex-col justify-end text-white overflow-hidden">
                                    <img>
                                <div class="card-content p-6 md:p-8">
                                    <h2 class="text-3xl md:text-4xl font-bold">Energy</h2>
                                    <p class="text-base md:text-lg">A dynamic visual experience.</p>
                                </div>
                            </div>
                        </wix-interact-element>

                        <wix-interact-element data-wix-path="#card-5">
                            <div id="card-5" class="card relative flex flex-col justify-end text-white overflow-hidden">
                                <img>
                                <div class="card-content p-6 md:p-8">
                                    <h2 class="text-3xl md:text-4xl font-bold">Clarity</h2>
                                    <p class="text-base md:text-lg">The story becomes clear.</p>
                                </div>
                            </div>
                        </wix-interact-element>

                        <wix-interact-element data-wix-path="#card-6">
                            <div id="card-6" class="card relative flex flex-col justify-end text-white overflow-hidden">
                                <img>
                                <div class="card-content p-6 md:p-8">
                                    <h2 class="text-3xl md:text-4xl font-bold">Finale</h2>
                                    <p class="text-base md:text-lg">The final view unfolds.</p>
                                </div>
                            </div>
                        </wix-interact-element>
                    </div>
                </wix-interact-element>
            </div>

        </section>
    </wix-interact-element>
```

## Essential styles

```css
:root {
            --hvs-gap: 4;
            --hvs-card-w: 33.3;
            --hvs-card-h: 75;
            --hvs-radius: 16;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
            color: #1a202c;
        }
        html {
            scroll-behavior: smooth;
        }

        
        .sticky-wrap {
            position: sticky;
            top: calc((100 - var(--hvs-card-h)) / 2 * 1vh);
            height: calc(var(--hvs-card-h) * 1vh);
            width: 100%;
            overflow: hidden;
        }

        
        #stack {
            gap: calc(var(--hvs-gap) * 1px);
        }

        .card {
            
            transform: translateY(100vh);
            will-change: transform;
            border: 1px solid #e2e8f0;
            
            width: 80vw;
            height: calc(var(--hvs-card-h) * 1vh);
            border-radius: calc(var(--hvs-radius) * 1px);
        }

        @media (min-width: 768px) {
            .card {
                width: calc(var(--hvs-card-w) * 1vw);
            }
        }

        .card img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
        }
        .card .card-content {
            position: relative;
            z-index: 2;
            background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
        }
```

## Interact config

```js
const isMobile = window.innerWidth < 768;

const numCards = 6;

const root = getComputedStyle(document.documentElement);

const gap = parseFloat(root.getPropertyValue('--hvs-gap'));

const cardH = parseFloat(root.getPropertyValue('--hvs-card-h'));

let horizontalScrollEnd;

if (isMobile) {
                const mobileCardW = 80; 
                const scrollVW = numCards * mobileCardW - 100;
                const scrollGapPX = (numCards - 1) * gap;
                horizontalScrollEnd = `translateX(calc(-${scrollVW}vw - ${scrollGapPX}px))`;
            } else {
                const cardW = parseFloat(root.getPropertyValue('--hvs-card-w'));
                const scrollVW = numCards * cardW - 100;
                const scrollGapPX = (numCards - 1) * gap;
                horizontalScrollEnd = `translateX(calc(-${scrollVW}vw - ${scrollGapPX}px))`;
            }

const entryOffset = Math.max(cardH + 10, 100);

const config = {
                interactions: [
                    {
                        key: '#scroll-section',
                        trigger: 'viewProgress',
                        effects: [
                            
                            {
                                key: '#stack',
                                keyframeEffect: {
                                    name: 'stack-scroll-effect',
                                    keyframes: [
                                        { transform: 'translateX(0vw)' },
                                        { transform: horizontalScrollEnd }
                                    ],
                                },
                                rangeStart: { name: 'cover', offset: { type: 'percentage', value: 50 } },
                                rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 90 } },
                                easing: 'linear',
                                fill: 'both'
                            },
                            
                            {
                                key: '#card-1',
                                keyframeEffect: {
                                    name: 'card-1-scroll-effect',
                                    keyframes: [
                                        { transform: `translateY(${entryOffset}vh)` },
                                        { transform: 'translateY(0vh)' }
                                    ],
                                },
                                rangeStart: { name: 'cover', offset: { type: 'percentage', value: 10 } },
                                rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 40 } },
                                easing: 'linear',
                                fill: 'both'
                            },
                            
                            {
                                key: '#card-2',
                                keyframeEffect: {
                                    name: 'card-2-scroll-effect',
                                    keyframes: [
                                        { transform: `translateY(${entryOffset}vh)` },
                                        { transform: 'translateY(0vh)' }
                                    ],
                                },
                                rangeStart: { name: 'cover', offset: { type: 'percentage', value: 10 } },
                                rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 50 } },
                                easing: 'linear',
                                fill: 'both'
                            },
                            
                            {
                                key: '#card-3',
                                keyframeEffect: {
                                    name: 'card-3-scroll-effect',
                                    keyframes: [
                                        { transform: `translateY(${entryOffset}vh)` },
                                        { transform: 'translateY(0vh)' }
                                    ],
                                },
                                rangeStart: { name: 'cover', offset: { type: 'percentage', value: 10 } },
                                rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 60 } },
                                easing: 'linear',
                                fill: 'both'
                            },
                            
                            {
                                key: '#card-4',
                                keyframeEffect: {
                                    name: 'card-4-scroll-effect',
                                    keyframes: [
                                        { transform: `translateY(${entryOffset}vh)` },
                                        { transform: 'translateY(0vh)' }
                                    ],
                                },
                                rangeStart: { name: 'cover', offset: { type: 'percentage', value: 40 } },
                                rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 70 } },
                                easing: 'linear',
                                fill: 'both'
                            },
                            
                            {
                                key: '#card-5',
                                keyframeEffect: {
                                    name: 'card-5-scroll-effect',
                                    keyframes: [
                                        { transform: `translateY(${entryOffset}vh)` },
                                        { transform: 'translateY(0vh)' }
                                    ],
                                },
                                rangeStart: { name: 'cover', offset: { type: 'percentage', value: 50 } },
                                rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 80 } },
                                easing: 'linear',
                                fill: 'both'
                            },
                            
                            {
                                key: '#card-6',
                                keyframeEffect: {
                                    name: 'card-6-scroll-effect',
                                    keyframes: [
                                        { transform: `translateY(${entryOffset}vh)` },
                                        { transform: 'translateY(0vh)' }
                                    ],
                                },
                                rangeStart: { name: 'cover', offset: { type: 'percentage', value: 60 } },
                                rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 90 } },
                                easing: 'linear',
                                fill: 'both'
                            }
                        ]
                    }
                ]
            };
```
