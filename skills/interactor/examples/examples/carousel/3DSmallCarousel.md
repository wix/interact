# 3D Small Carousel

A sticky 3D carousel of 8 photo cards arranged in a circular ring spins 720° around the Y-axis as the user scrolls, with each card's brightness driven by its angular proximity to the front face.

**Tags:** viewProgress, scroll, carousel, sticky, 3d, rotate, transform, filter, opacity

## Markup

```html
<interact-element data-interact-key="scroll-section">
    <div class="scroll-section">
        <div class="sticky-wrapper">
            <div class="bg-glow"></div>
            <div class="carousel-viewport">
                <interact-element data-interact-key="carousel">
                    <div class="carousel">

                        <interact-element data-interact-key="card-0">
                            <div class="card" style="transform: rotateY(0deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Yosemite Valley</div>
                                    <div class="card-subtitle">California &#8226; Dawn &#8226; Granite</div>
                                </div>
                            </div>
                        </interact-element>

                        <interact-element data-interact-key="card-1">
                            <div class="card" style="transform: rotateY(45deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Alpine Sunrise</div>
                                    <div class="card-subtitle">Mountains &#8226; Light &#8226; Silence</div>
                                </div>
                            </div>
                        </interact-element>

                        <interact-element data-interact-key="card-2">
                            <div class="card" style="transform: rotateY(90deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Mirror Lake</div>
                                    <div class="card-subtitle">Reflection &#8226; Sunset &#8226; Stillness</div>
                                </div>
                            </div>
                        </interact-element>

                        <interact-element data-interact-key="card-3">
                            <div class="card" style="transform: rotateY(135deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Forest Mist</div>
                                    <div class="card-subtitle">Fog &#8226; Evergreen &#8226; Mystery</div>
                                </div>
                            </div>
                        </interact-element>

                        <interact-element data-interact-key="card-4">
                            <div class="card" style="transform: rotateY(180deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Starry Peaks</div>
                                    <div class="card-subtitle">Night Sky &#8226; Snow &#8226; Wonder</div>
                                </div>
                            </div>
                        </interact-element>

                        <interact-element data-interact-key="card-5">
                            <div class="card" style="transform: rotateY(225deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Hidden Falls</div>
                                    <div class="card-subtitle">Water &#8226; Moss &#8226; Tranquility</div>
                                </div>
                            </div>
                        </interact-element>

                        <interact-element data-interact-key="card-6">
                            <div class="card" style="transform: rotateY(270deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Golden Hour</div>
                                    <div class="card-subtitle">Fields &#8226; Warmth &#8226; Horizon</div>
                                </div>
                            </div>
                        </interact-element>

                        <interact-element data-interact-key="card-7">
                            <div class="card" style="transform: rotateY(315deg) translateZ(380px)">
                                <img class="card-image" src="" draggable="false">
                                <div class="card-overlay"></div>
                                <div class="card-content">
                                    <div class="card-title">Coastal Dusk</div>
                                    <div class="card-subtitle">Ocean &#8226; Sand &#8226; Serenity</div>
                                </div>
                            </div>
                        </interact-element>

                    </div>
                </interact-element>
            </div>
            <interact-element data-interact-key="hint">
                <div class="scroll-hint">Scroll to explore</div>
            </interact-element>
        </div>
    </div>
</interact-element>
```

## Essential styles

```css
* { margin: 0; box-sizing: border-box; }

body {
    overflow-x: hidden;
}

interact-element { display: contents; }

.scroll-section {
    height: 400vh;
    position: relative;
}

.sticky-wrapper {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: clip;
}

.bg-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.carousel-viewport {
    perspective: 1200px;
    perspective-origin: 50% 45%;
}

.carousel {
    position: relative;
    width: 280px;
    height: 420px;
    transform-style: preserve-3d;
}

.card {
    position: absolute;
    width: 280px;
    height: 420px;
    border-radius: 20px;
    overflow: hidden;
    user-select: none;
}

.card-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 5s ease-out;
}

.card:hover .card-image {
    transform: scale(1.06);
}

.card-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
}

.card-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    padding: 1.5rem 1.25rem;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.card:hover .card-content {
    opacity: 1;
    transform: translateY(0);
}

.card-title {
    font-size: 1.25rem;
    line-height: 1.3;
}

.card-subtitle {
    font-size: 0.65rem;
    font-weight: 300;
    margin-top: 0.35rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
}

.scroll-hint {
    position: absolute;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    z-index: 2;
    text-align: center;
}

.scroll-hint::after {
    content: '';
    display: block;
    width: 1px;
    height: 20px;
    margin: 0.6rem auto 0;
    animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {
    0%, 100% { opacity: 0.15; transform: scaleY(0.5); }
    50% { opacity: 0.5; transform: scaleY(1); }
}
```

## Interact config

```js
const NUM = 8;
const STEP_DEG = 15;
const STEPS = (720 / 15) + 1;

function dimKeyframes(cardIndex) {
    const kf = [];
    for (let s = 0; s < STEPS; s++) {
        const rotation = (s * STEP_DEG) % 360;
        const cardAngle = cardIndex * 45;
        const worldAngle = (rotation + cardAngle) % 360;
        const diff = Math.min(worldAngle, 360 - worldAngle);
        const proximity = (Math.cos(diff * Math.PI / 180) + 1) / 2;
        const b = 0.3 + 0.8 * proximity;
        kf.push({ offset: s / (STEPS - 1), filter: `brightness(${b.toFixed(2)})` });
    }
    return kf;
}

const range = {
    rangeStart: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    rangeEnd:   { name: 'cover', offset: { value: 100, unit: 'percentage' } }
};

const cardEffects = [];
for (let i = 0; i < NUM; i++) {
    cardEffects.push({
        key: `card-${i}`,
        keyframeEffect: { name: `card-${i}-dim`, keyframes: dimKeyframes(i) },
        ...range,
        fill: 'both',
        easing: 'linear'
    });
}

{
    effects: {
        'carousel-spin': {
            keyframeEffect: {
                name: 'carousel-spin-kf',
                keyframes: [
                    { transform: 'rotateY(0deg)' },
                    { transform: 'rotateY(720deg)' }
                ]
            },
            ...range,
            fill: 'both',
            easing: 'linear'
        }
    },
    interactions: [{
        key: 'scroll-section',
        trigger: 'viewProgress',
        effects: [
            { key: 'carousel', effectId: 'carousel-spin' },
            ...cardEffects,
            {
                key: 'hint',
                keyframeEffect: {
                    name: 'hint-fade',
                    keyframes: [
                        { offset: 0, opacity: 1 },
                        { offset: 0.03, opacity: 0 },
                        { offset: 1, opacity: 0 }
                    ]
                },
                ...range,
                fill: 'both',
                easing: 'linear'
            }
        ]
    }]
}
```
