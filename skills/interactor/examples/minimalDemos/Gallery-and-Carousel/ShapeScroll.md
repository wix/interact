# ShapeScroll

A scroll-driven animation for image and background layers in a sticky scroll section, flex/carousel, layered composition layout. It uses clip-path to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: sticky scroll section, flex/carousel, layered composition; motion: clip-path

## Markup

```html
<div class="fixed top-5 left-5 bg-black bg-opacity-50 p-3 rounded-lg z-50 text-sm">
        <p>Scroll down to experience the animation.</p>
    </div>

    <main class="animation-section">

        <wix-interact-element data-wix-path="#trigger-2">
            <div id="trigger-2" class="trigger-area" style="top: 25%; height: 6.25%;"></div>
        </wix-interact-element>
        <wix-interact-element data-wix-path="#trigger-3">
             <div id="trigger-3" class="trigger-area" style="top: 37.5%; height: 6.25%;"></div>
        </wix-interact-element>
        <wix-interact-element data-wix-path="#trigger-4">
             <div id="trigger-4" class="trigger-area" style="top: 50%; height: 6.25%;"></div>
        </wix-interact-element>
        <wix-interact-element data-wix-path="#trigger-5">
            <div id="trigger-5" class="trigger-area" style="top: 62.5%; height: 6.25%;"></div>
        </wix-interact-element>
        <wix-interact-element data-wix-path="#trigger-6">
            <div id="trigger-6" class="trigger-area" style="top: 75%; height: 6.25%;"></div>
        </wix-interact-element>

        <wix-interact-element data-wix-path="#container-1">

            <div id="container-1" class="content-panel" style="background-image: none;">

                <div class="text-center w-full pt-32 pb-20 bg-gradient-to-t from-black/70 to-transparent z-10">
                    <h1 class="text-5xl md:text-8xl font-black tracking-tighter text-white">Container 1</h1>
                    <p class="mt-2 text-lg md:text-xl text-gray-200">This is the starting point.</p>
                </div>
            </div>
        </wix-interact-element>

        <wix-interact-element data-wix-path="#container-2">

            <div id="container-2" class="content-panel" style="background-image: none;">

                 <div class="text-center w-full pt-32 pb-20 bg-gradient-to-t from-black/70 to-transparent z-10">
                    <h1 class="text-5xl md:text-8xl font-black tracking-tighter text-white">Container 2</h1>
                    <p class="mt-2 text-lg md:text-xl text-gray-200">Revealed by scrolling.</p>
                </div>
            </div>
        </wix-interact-element>

        <wix-interact-element data-wix-path="#container-3">

            <div id="container-3" class="content-panel" style="background-image: none;">

                 <div class="text-center w-full pt-32 pb-20 bg-gradient-to-t from-black/70 to-transparent z-10">
                    <h1 class="text-5xl md:text-8xl font-black tracking-tighter text-white">Container 3</h1>
                    <p class="mt-2 text-lg md:text-xl text-gray-200">And another one.</p>
                </div>
            </div>
        </wix-interact-element>

        <wix-interact-element data-wix-path="#container-4">

            <div id="container-4" class="content-panel" style="background-image: none;">

                 <div class="text-center w-full pt-32 pb-20 bg-gradient-to-t from-black/70 to-transparent z-10">
                    <h1 class="text-5xl md:text-8xl font-black tracking-tighter text-white">Container 4</h1>
                    <p class="mt-2 text-lg md:text-xl text-gray-200">Keep scrolling...</p>
                </div>
            </div>
        </wix-interact-element>

        <wix-interact-element data-wix-path="#container-5">

            <div id="container-5" class="content-panel" style="background-image: none;">

                 <div class="text-center w-full pt-32 pb-20 bg-gradient-to-t from-black/70 to-transparent z-10">
                    <h1 class="text-5xl md:text-8xl font-black tracking-tighter text-white">Container 5</h1>
                    <p class="mt-2 text-lg md:text-xl text-gray-200">Almost there.</p>
                </div>
            </div>
        </wix-interact-element>

        <wix-interact-element data-wix-path="#container-6">

            <div id="container-6" class="content-panel" style="background-image: none;">

                 <div class="text-center w-full pt-32 pb-20 bg-gradient-to-t from-black/70 to-transparent z-10">
                    <h1 class="text-5xl md:text-8xl font-black tracking-tighter text-white">Container 6</h1>
                    <p class="mt-2 text-lg md:text-xl text-gray-200">The final reveal.</p>
                </div>
            </div>
        </wix-interact-element>
    </main>
```

## Essential styles

```css
:root {
            --pw: 100;
            --ph: 100;
            --panel-radius: 0px;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #000;
            color: #fff;
        }

        #container-2, #container-3, #container-4, #container-5, #container-6 {
            clip-path: circle(0% at center);
        }

        #container-1 { z-index: 1; }
        #container-2 { z-index: 2; }
        #container-3 { z-index: 3; }
        #container-4 { z-index: 4; }
        #container-5 { z-index: 5; }
        #container-6 { z-index: 6; }

        .trigger-area {
            position: absolute;
            left: 0;
            width: 100%;
            opacity: 0;
            pointer-events: none;
        }

        .animation-section {
            position: relative;
            width: 100%;
            height: 800vh;
        }

        .content-panel {
            position: sticky;
            top: calc((100 - var(--ph)) * 0.5vh);
            width: calc(var(--pw) * 1vw);
            height: calc(var(--ph) * 1vh);
            margin: 0 auto;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
            background-size: cover;
            background-position: center;
            border-radius: var(--panel-radius);
        }

        .content-panel::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40%;
            background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
            z-index: 1;
            pointer-events: none;
        }

        .content-panel > div {
            transform: scale(calc(min(var(--pw), var(--ph)) / 100));
            transform-origin: center bottom;
            background: none !important;
        }
```

## Interact config

```js
const interactConfig = {
            interactions: [
                
                {
                    key: '#trigger-2',
                    trigger: 'viewProgress',
                    effects: [{
                        key: '#container-2',
                        keyframeEffect: {
                            name: 'reveal-circle-2',
                            keyframes: [
                                { clipPath: 'circle(0% at center)' },
                                { clipPath: 'circle(80% at center)' }
                            ]
                        },
                        rangeStart: { name: 'cover', offset: { type: 'percentage', value: 0 } },
                        rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 100 } },
                        easing: 'linear',
                        fill: 'both'
                    }]
                },
                
                {
                    key: '#trigger-3',
                    trigger: 'viewProgress',
                    effects: [{
                        key: '#container-3',
                        keyframeEffect: {
                            name: 'reveal-circle-3',
                            keyframes: [
                                { clipPath: 'circle(0% at center)' },
                                { clipPath: 'circle(80% at center)' }
                            ]
                        },
                        rangeStart: { name: 'cover', offset: { type: 'percentage', value: 0 } },
                        rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 100 } },
                        easing: 'linear',
                        fill: 'both'
                    }]
                },
                
                {
                    key: '#trigger-4',
                    trigger: 'viewProgress',
                    effects: [{
                        key: '#container-4',
                        keyframeEffect: {
                            name: 'reveal-circle-4',
                            keyframes: [
                                { clipPath: 'circle(0% at center)' },
                                { clipPath: 'circle(80% at center)' }
                            ]
                        },
                        rangeStart: { name: 'cover', offset: { type: 'percentage', value: 0 } },
                        rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 100 } },
                        easing: 'linear',
                        fill: 'both'
                    }]
                },
                
                {
                    key: '#trigger-5',
                    trigger: 'viewProgress',
                    effects: [{
                        key: '#container-5',
                        keyframeEffect: {
                            name: 'reveal-circle-5',
                            keyframes: [
                                { clipPath: 'circle(0% at center)' },
                                { clipPath: 'circle(80% at center)' }
                            ]
                        },
                        rangeStart: { name: 'cover', offset: { type: 'percentage', value: 0 } },
                        rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 100 } },
                        easing: 'linear',
                        fill: 'both'
                    }]
                },
                
                {
                    key: '#trigger-6',
                    trigger: 'viewProgress',
                    effects: [{
                        key: '#container-6',
                        keyframeEffect: {
                            name: 'reveal-circle-6',
                            keyframes: [
                                { clipPath: 'circle(0% at center)' },
                                { clipPath: 'circle(80% at center)' }
                            ]
                        },
                        rangeStart: { name: 'cover', offset: { type: 'percentage', value: 0 } },
                        rangeEnd: { name: 'cover', offset: { type: 'percentage', value: 100 } },
                        easing: 'linear',
                        fill: 'both'
                    }]
                }
            ]
        };
```
