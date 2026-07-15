# Small Carousel

A 3D perspective carousel of space nebula cards arranged in depth with rotateY offsets; hovering any card scales its image and fades in a text overlay, while clicking the front card expands it fullscreen over a blurred backdrop that dismisses on click.

**Tags:** hover, click, carousel, 3d, scale, opacity, transform, rotate, fade, blur

## Markup

```html
<div class="carousel-container" id="carousel-container">
    <div class="carousel" id="carousel">
        <interact-element data-interact-key="#card-0">
            <div class="card active" id="card-0">
                <img src="" class="card-image" draggable="false">
                <div class="card-content">
                    <div class="card-artist font-cinzel">Orion Nebula</div>
                    <div class="card-keywords">Stellar Nursery • Cosmic Clouds • New Stars</div>
                </div>
            </div>
        </interact-element>
        <interact-element data-interact-key="#card-1">
            <div class="card right-1" id="card-1">
                <img src="" class="card-image" draggable="false">
                <div class="card-content">
                    <div class="card-artist font-cinzel">Carina Nebula</div>
                    <div class="card-keywords">Cosmic Reef • Massive Stars • Destruction</div>
                </div>
            </div>
        </interact-element>
        <interact-element data-interact-key="#card-2">
            <div class="card right-2" id="card-2">
                <img src="" class="card-image" draggable="false">
                <div class="card-content">
                    <div class="card-artist font-cinzel">Eagle Nebula</div>
                    <div class="card-keywords">Creation • Destruction • Pillars of Gas</div>
                </div>
            </div>
        </interact-element>
        <interact-element data-interact-key="#card-3">
            <div class="card right-3" id="card-3">
                <img src="" class="card-image" draggable="false">
                <div class="card-content">
                    <div class="card-artist font-cinzel">Veil Nebula</div>
                    <div class="card-keywords">Supernova Remnant • Wisps • Ethereal</div>
                </div>
            </div>
        </interact-element>
        <interact-element data-interact-key="#card-4">
            <div class="card left-2" id="card-4">
                <img src="" class="card-image" draggable="false">
                <div class="card-content">
                    <div class="card-artist font-cinzel">Rosette Nebula</div>
                    <div class="card-keywords">Stellar Cluster • Rose • Ionized Hydrogen</div>
                </div>
            </div>
        </interact-element>
        <interact-element data-interact-key="#card-5">
            <div class="card left-1" id="card-5">
                <img src="" class="card-image" draggable="false">
                <div class="card-content">
                    <div class="card-artist font-cinzel">Horsehead Nebula</div>
                    <div class="card-keywords">Dark Nebula • Cosmic Dust • Silhouette</div>
                </div>
            </div>
        </interact-element>
    </div>
</div>
<div class="backdrop" id="backdrop"></div>
```

## Essential styles

```css
body {
    font-family: 'Inter', sans-serif;
    background-color: #110f1a;
    color: #f0eefc;
    overflow: hidden;
}

.font-cinzel {
    font-family: 'Cinzel', serif;
}

.carousel-container {
    perspective: 1500px;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.carousel {
    position: relative;
    width: 300px;
    height: 500px;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1);
}

.card {
    position: absolute;
    width: 300px;
    height: 500px;
    background: #1a1a2e;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 0;
    transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1), filter 0.5s ease, box-shadow 0.5s ease;
    cursor: pointer;
    user-select: none;
    border: 2px solid rgba(120, 120, 180, 0.4);
    will-change: transform, filter;
}

.card-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
}

.card-content {
    position: relative;
    z-index: 2;
    width: 100%;
    text-align: center;
    padding: 2rem 1.25rem 1.5rem;
    color: white;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
    opacity: 0;
}

.card-artist {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 0.35rem;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
}

.card-keywords {
    font-size: 0.75rem;
    font-weight: 300;
    letter-spacing: 0.03em;
    opacity: 0.8;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.card.active {
    transform: translateX(0) translateZ(0) rotateY(0deg) scale(1);
    filter: brightness(1);
    z-index: 10;
    box-shadow: 0 12px 40px rgba(80, 80, 200, 0.25), 0 0 60px rgba(100, 100, 220, 0.1);
}
.card.left-1  { transform: translateX(-60%)  translateZ(-200px) rotateY(35deg)  scale(0.9); filter: brightness(0.75); z-index: 5; }
.card.right-1 { transform: translateX(60%)   translateZ(-200px) rotateY(-35deg) scale(0.9); filter: brightness(0.75); z-index: 5; }
.card.left-2  { transform: translateX(-110%) translateZ(-400px) rotateY(45deg)  scale(0.8); filter: brightness(0.55); z-index: 2; }
.card.right-2 { transform: translateX(110%)  translateZ(-400px) rotateY(-45deg) scale(0.8); filter: brightness(0.55); z-index: 2; }
.card.left-3  { transform: translateX(-150%) translateZ(-600px) rotateY(55deg)  scale(0.7); filter: brightness(0.35); z-index: 1; }
.card.right-3 { transform: translateX(150%)  translateZ(-600px) rotateY(-55deg) scale(0.7); filter: brightness(0.35); z-index: 1; }
.card.hidden  { transform: translateX(0) translateZ(-800px) scale(0.5); opacity: 0; z-index: 0; }

.card.fly-out {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 1001;
    cursor: default;
    filter: brightness(1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}
.card.fly-out .card-content {
    opacity: 1;
}

.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    backdrop-filter: blur(4px);
}
.backdrop.visible {
    pointer-events: auto;
}
```

## Interact config

```js
const FLY_OUT_DURATION = 500;

const interactions = [];

const cardCount = 6;

for (let index = 0; index < cardCount; index++) {
    interactions.push(
        {
            trigger: 'mouseenter',
            key: `#card-${index}`,
            effects: [
                {
                    key: `#card-${index} .card-image`,
                    keyframeEffect: {
                        name: 'scale-up',
                        keyframes: [{ transform: 'scale(1.0)' }, { transform: 'scale(1.08)' }],
                        duration: 600,
                        easing: 'ease-out',
                        fill: 'forwards'
                    }
                },
                {
                    key: `#card-${index} .card-content`,
                    keyframeEffect: {
                        name: 'fade-in',
                        keyframes: [{ opacity: 0 }, { opacity: 1 }],
                        duration: 350,
                        easing: 'ease-out',
                        fill: 'forwards'
                    }
                }
            ]
        },
        {
            trigger: 'mouseleave',
            key: `#card-${index}`,
            effects: [
                {
                    key: `#card-${index} .card-image`,
                    keyframeEffect: {
                        name: 'scale-down',
                        keyframes: [{ transform: 'scale(1.08)' }, { transform: 'scale(1.0)' }],
                        duration: 500,
                        easing: 'ease-out',
                        fill: 'forwards'
                    }
                },
                {
                    key: `#card-${index} .card-content`,
                    keyframeEffect: {
                        name: 'fade-out',
                        keyframes: [{ opacity: 1 }, { opacity: 0 }],
                        duration: 300,
                        easing: 'ease-in',
                        fill: 'forwards'
                    }
                }
            ]
        }
    );
}

interactions.push(
    {
        trigger: 'click',
        key: '.card.active',
        effects: [
            {
                key: '.card.fly-out',
                keyframeEffect: {
                    name: 'fly-out',
                    keyframes: [
                        { transform: 'translate(-50%, -50%) scale(1)' },
                        { transform: 'translate(-50%, -50%) scale(1.35)' }
                    ],
                    duration: FLY_OUT_DURATION,
                    easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
                    fill: 'forwards'
                }
            },
            {
                key: '#backdrop',
                keyframeEffect: {
                    name: 'backdrop-in',
                    keyframes: [{ opacity: 0 }, { opacity: 1 }],
                    duration: FLY_OUT_DURATION,
                    easing: 'ease-out',
                    fill: 'forwards'
                }
            }
        ]
    },
    {
        trigger: 'click',
        key: '#backdrop',
        effects: [
            {
                key: '.card.fly-out',
                keyframeEffect: {
                    name: 'fly-in',
                    keyframes: [
                        { transform: 'translate(-50%, -50%) scale(1.35)' },
                        { transform: 'translate(-50%, -50%) scale(1)' }
                    ],
                    duration: FLY_OUT_DURATION,
                    easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
                    fill: 'forwards'
                }
            },
            {
                key: '#backdrop',
                keyframeEffect: {
                    name: 'backdrop-out',
                    keyframes: [{ opacity: 1 }, { opacity: 0 }],
                    duration: FLY_OUT_DURATION,
                    easing: 'ease-in',
                    fill: 'forwards'
                }
            }
        ]
    }
);

const config = { interactions };
```
