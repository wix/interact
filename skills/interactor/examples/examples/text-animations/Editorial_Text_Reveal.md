# Editorial Text Reveal

Three editorial slides sequence through a sticky viewport as the user scrolls — the cover scales and blurs out while subsequent slides push in horizontally from the right, with internal content and staggered columns rising up driven by scroll progress.

**Tags:** viewProgress, sticky, opacity, transform, filter, reveal, stagger, fade, scale, blur

## Markup

```html
<interact-element data-interact-key="scroll-container">
    <div class="relative h-[350vh]">

        <div class="sticky top-0 h-screen overflow-hidden bg-black">
            <div class="slides-stack">

                <interact-element data-interact-key="slide-1">
                    <div class="slide slide-1">
                        <div class="absolute top-8 left-8 label-text">Vol. 01</div>
                        <div class="absolute top-8 right-8 label-text">Display</div>
                        <div class="absolute bottom-8 left-8 label-text">2025</div>
                        <div class="absolute bottom-8 right-8 label-text">Interact</div>
                        <h1 class="mega-text text-center tracking-tighter">
                            Origin.
                        </h1>
                        <div class="mt-8 px-5 py-2 border border-white/30 rounded-full label-text backdrop-blur-md">
                            The Beginning of Motion
                        </div>
                    </div>
                </interact-element>

                <interact-element data-interact-key="slide-2">
                    <div class="slide slide-2">
                        <div class="bg-number">02</div>
                        <interact-element data-interact-key="s2-content">
                            <div class="relative z-10 w-full max-w-7xl px-4 md:px-8 flex flex-col gap-12">
                                <div class="border-b border-[#1d1d1f]/20 pb-8">
                                    <div class="flex justify-between items-end mb-4">
                                        <span class="label-text text-[#86868b]">Design Philosophy</span>
                                        <span class="label-text text-[#86868b]">Fig. A</span>
                                    </div>
                                    <h2 class="text-7xl md:text-9xl font-semibold tracking-tighter text-[#1d1d1f] leading-[0.9]">
                                        Essentialism.
                                    </h2>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
                                    <div>
                                        <p class="text-3xl md:text-4xl font-medium leading-tight text-[#1d1d1f] tracking-tight">
                                            We believe in the power of restraint. By removing the non-essential, we amplify what remains.
                                        </p>
                                    </div>
                                    <div class="flex flex-col gap-6 text-[#1d1d1f]/80 text-lg leading-relaxed font-normal">
                                        <p>
                                            Every element on the screen must serve a distinct purpose. Decoration is distraction. We strip away the layers of noise to reveal the core function, ensuring that the user's focus is never divided.
                                        </p>
                                        <p>
                                            This is not minimalism for the sake of style, but for the sake of clarity. It is an intentional curation of experience where typography becomes the interface itself.
                                        </p>
                                        <div class="mt-6 flex items-center gap-3 opacity-60">
                                            <div class="w-8 h-px bg-[#1d1d1f]"></div>
                                            <span class="text-xs font-bold uppercase tracking-wider">Read the Manifesto</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </interact-element>
                    </div>
                </interact-element>

                <interact-element data-interact-key="slide-3">
                    <div class="slide slide-3">
                        <div class="typo-columns">
                            <interact-element data-interact-key="col-1">
                                <div class="typo-col">
                                    <div class="col-number">01</div>
                                    <div>
                                        <div class="col-title">Structure</div>
                                        <div class="col-desc">The underlying grid defines the rhythm of the page.</div>
                                    </div>
                                </div>
                            </interact-element>
                            <interact-element data-interact-key="col-2">
                                <div class="typo-col" style="border-top-color: #86868b;">
                                    <div class="col-number">02</div>
                                    <div>
                                        <div class="col-title">Scale</div>
                                        <div class="col-desc">Contrast in size creates immediate focal points.</div>
                                    </div>
                                </div>
                            </interact-element>
                            <interact-element data-interact-key="col-3">
                                <div class="typo-col" style="border-top-color: #d2d2d7;">
                                    <div class="col-number">03</div>
                                    <div>
                                        <div class="col-title">Space</div>
                                        <div class="col-desc">Negative space breathes life into the composition.</div>
                                    </div>
                                </div>
                            </interact-element>
                        </div>
                    </div>
                </interact-element>

            </div>
        </div>
    </div>
</interact-element>

<footer class="h-[50vh] bg-white flex items-center justify-center border-t border-[#d2d2d7]">
    <p class="label-text text-[#86868b]">End of Sequence</p>
</footer>
```

## Essential styles

```css
body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background-color: #000;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #1d1d1f;
}

.slides-stack {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000;
    perspective: 1000px;
}

.slide {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    will-change: transform;
}

.slide-1 {
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #000;
    color: #f5f5f7;
}

.mega-text {
    font-size: clamp(5rem, 18vw, 20rem);
    line-height: 1;
    letter-spacing: -0.04em;
    font-weight: 600;
}

.slide-2 {
    z-index: 2;
    background: #f5f5f7;
    box-shadow: -40px 0 80px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4vw;
    box-sizing: border-box;
    overflow: hidden;
}

.bg-number {
    position: absolute;
    bottom: -10%;
    right: -5%;
    font-size: 35vw;
    font-weight: 700;
    color: #ffffff;
    line-height: 1;
    z-index: 0;
    pointer-events: none;
    letter-spacing: -0.05em;
}

.slide-3 {
    z-index: 2;
    background: #ffffff;
    border-left: 1px solid #d2d2d7;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5vw;
}

.typo-columns {
    display: flex;
    width: 100%;
    height: 80%;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2vw;
}

.typo-col {
    flex: 1;
    height: 100%;
    border-top: 1px solid #1d1d1f;
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: transparent;
    transition: transform 0.3s ease;
}

.col-number {
    font-size: 5rem;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
}

.col-title {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 0.5rem;
}

.col-desc {
    font-size: 1.05rem;
    line-height: 1.5;
    font-weight: 400;
    max-width: 240px;
    color: #86868b;
}

.label-text {
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.7;
}
```

## Interact config

```js
{
    interactions: [
        {
            key: 'scroll-container',
            trigger: 'viewProgress',
            effects: [
                {
                    key: 'slide-1',
                    rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
                    rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
                    fill: 'both',
                    keyframeEffect: {
                        name: 's1-exit',
                        keyframes: [
                            { offset: 0, transform: 'scale(1)', filter: 'brightness(1) blur(0px)' },
                            { offset: 0.5, transform: 'scale(0.94)', filter: 'brightness(0.5) blur(10px)' },
                            { offset: 1, transform: 'scale(0.94)', filter: 'brightness(0.5) blur(10px)' }
                        ]
                    }
                },
                {
                    key: 'slide-2',
                    rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
                    rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
                    fill: 'both',
                    keyframeEffect: {
                        name: 's2-enter',
                        keyframes: [
                            { offset: 0, transform: 'translateX(100%)' },
                            { offset: 0.5, transform: 'translateX(0%)' },
                            { offset: 1, transform: 'translateX(-100%)' }
                        ]
                    }
                },
                {
                    key: 's2-content',
                    rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
                    rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
                    fill: 'both',
                    keyframeEffect: {
                        name: 's2-fade',
                        keyframes: [
                            { offset: 0.15, transform: 'translateY(40px)', opacity: 0 },
                            { offset: 0.5, transform: 'translateY(0)', opacity: 1 },
                            { offset: 1, transform: 'translateY(0)', opacity: 1 }
                        ]
                    }
                },
                {
                    key: 'slide-3',
                    rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
                    rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
                    fill: 'both',
                    keyframeEffect: {
                        name: 's3-enter',
                        keyframes: [
                            { offset: 0, transform: 'translateX(100%)' },
                            { offset: 0.5, transform: 'translateX(100%)' },
                            { offset: 1, transform: 'translateX(0%)' }
                        ]
                    }
                },
                {
                    key: 'col-1',
                    rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
                    rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
                    fill: 'both',
                    keyframeEffect: {
                        name: 'col-1-rise',
                        keyframes: [
                            { offset: 0.5, transform: 'translateY(100%)', opacity: 0 },
                            { offset: 0.8, transform: 'translateY(0)', opacity: 1 },
                            { offset: 1, transform: 'translateY(0)', opacity: 1 }
                        ]
                    }
                },
                {
                    key: 'col-2',
                    rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
                    rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
                    fill: 'both',
                    keyframeEffect: {
                        name: 'col-2-rise',
                        keyframes: [
                            { offset: 0.6, transform: 'translateY(100%)', opacity: 0 },
                            { offset: 0.9, transform: 'translateY(0)', opacity: 1 },
                            { offset: 1, transform: 'translateY(0)', opacity: 1 }
                        ]
                    }
                },
                {
                    key: 'col-3',
                    rangeStart: { name: 'entry', offset: { value: 100, unit: 'percentage' } },
                    rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } },
                    fill: 'both',
                    keyframeEffect: {
                        name: 'col-3-rise',
                        keyframes: [
                            { offset: 0.7, transform: 'translateY(100%)', opacity: 0 },
                            { offset: 1, transform: 'translateY(0)', opacity: 1 }
                        ]
                    }
                }
            ]
        }
    ]
}
```
