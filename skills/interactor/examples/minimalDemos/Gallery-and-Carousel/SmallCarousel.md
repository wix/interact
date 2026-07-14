# SmallCarousel

A hover-triggered, mouseleave-triggered and click-triggered animation for gallery items in a flex/carousel, layered composition, 3D scene layout. It uses transform, opacity to create the motion and transition between visual states.

**Tags:** trigger: mouseenter, mouseleave, click; layout: flex/carousel, layered composition, 3D scene; motion: transform, opacity

## Markup

```html
<div class="carousel-container" id="carousel-container">
        <div class="carousel" id="carousel"></div>
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
        .card.left-1 { transform: translateX(-60%) translateZ(-200px) rotateY(35deg) scale(0.9); filter: brightness(0.75); z-index: 5; }
        .card.right-1 { transform: translateX(60%) translateZ(-200px) rotateY(-35deg) scale(0.9); filter: brightness(0.75); z-index: 5; }
        .card.left-2 { transform: translateX(-110%) translateZ(-400px) rotateY(45deg) scale(0.8); filter: brightness(0.55); z-index: 2; }
        .card.right-2 { transform: translateX(110%) translateZ(-400px) rotateY(-45deg) scale(0.8); filter: brightness(0.55); z-index: 2; }
        .card.left-3 { transform: translateX(-150%) translateZ(-600px) rotateY(55deg) scale(0.7); filter: brightness(0.35); z-index: 1; }
        .card.right-3 { transform: translateX(150%) translateZ(-600px) rotateY(-55deg) scale(0.7); filter: brightness(0.35); z-index: 1; }
        .card.hidden { transform: translateX(0) translateZ(-800px) scale(0.5); opacity: 0; z-index: 0; }

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
const cardData = [
                { artist: 'Orion Nebula',    keywords: 'Stellar Nursery • Cosmic Clouds • New Stars',      imageUrl: 'IMAGE_URL' },
                { artist: 'Carina Nebula',   keywords: 'Cosmic Reef • Massive Stars • Destruction',        imageUrl: 'IMAGE_URL' },
                { artist: 'Eagle Nebula',    keywords: 'Creation • Destruction • Pillars of Gas',          imageUrl: 'IMAGE_URL' },
                { artist: 'Veil Nebula',     keywords: 'Supernova Remnant • Wisps • Ethereal',             imageUrl: 'IMAGE_URL' },
                { artist: 'Rosette Nebula',  keywords: 'Stellar Cluster • Rose • Ionized Hydrogen',       imageUrl: 'IMAGE_URL' },
                { artist: 'Horsehead Nebula',keywords: 'Dark Nebula • Cosmic Dust • Silhouette',          imageUrl: 'IMAGE_URL' },
                { artist: 'Helix Nebula',    keywords: 'Planetary Nebula • Dying Star • The Eye',         imageUrl: 'IMAGE_URL' },
                { artist: 'Lagoon Nebula',   keywords: 'Emission Nebula • Star Formation • H II Region',  imageUrl: 'IMAGE_URL' }
            ];

const carousel = document.getElementById('carousel');

const backdrop = document.getElementById('backdrop');

let currentIndex = 0;

let isCardFlownOut = false;

let isAnimating = false;

const interactConfig = { interactions: [] };

const FLY_OUT_DURATION = 500;

cardData.forEach((data, index) => {
                    const wixWrapper = document.createElement('wix-interact-element');
                    wixWrapper.dataset.wixPath = `#card-${index}`;

                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.id = `card-${index}`;
                    card.dataset.index = index;
                    card.innerHTML = `
                        <img class="card-image">
                        <div class="card-content">
                            <div class="card-artist font-cinzel">${data.artist}</div>
                            <div class="card-keywords">${data.keywords}</div>
                        </div>
                    `;
                    card.addEventListener('click', () => handleCardClick(card));

                    wixWrapper.appendChild(card);
                    carousel.appendChild(wixWrapper);

                    interactConfig.interactions.push(
                        {
                            trigger: 'mouseenter',
                            key: `#card-${index}`,
                            effects: [{
                                key: `#card-${index} .card-image`,
                                keyframeEffect: { name: 'scale-up', keyframes: [{ transform: 'scale(1.0)' }, { transform: 'scale(1.08)' }], duration: 600, easing: 'ease-out', fill: 'forwards' }
                            }, {
                                key: `#card-${index} .card-content`,
                                keyframeEffect: { name: 'fade-in', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 350, easing: 'ease-out', fill: 'forwards' }
                            }]
                        },
                        {
                            trigger: 'mouseleave',
                            key: `#card-${index}`,
                            effects: [{
                                key: `#card-${index} .card-image`,
                                keyframeEffect: { name: 'scale-down', keyframes: [{ transform: 'scale(1.08)' }, { transform: 'scale(1.0)' }], duration: 500, easing: 'ease-out', fill: 'forwards' }
                            }, {
                                key: `#card-${index} .card-content`,
                                keyframeEffect: { name: 'fade-out', keyframes: [{ opacity: 1 }, { opacity: 0 }], duration: 300, easing: 'ease-in', fill: 'forwards' }
                            }]
                        }
                    );
                });

interactConfig.interactions.push(
                    {
                        trigger: 'click',
                        key: '.card.active',
                        effects: [
                            { keyframeEffect: { name: 'fly-out', keyframes: [{ transform: 'translate(-50%, -50%) scale(1)' }, { transform: 'translate(-50%, -50%) scale(1.35)' }], duration: FLY_OUT_DURATION, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', fill: 'forwards' }, key: '.card.fly-out' },
                            { keyframeEffect: { name: 'backdrop-in', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: FLY_OUT_DURATION, easing: 'ease-out', fill: 'forwards' }, key: '#backdrop' }
                        ]
                    },
                    {
                        trigger: 'click',
                        key: '#backdrop',
                        effects: [
                            { keyframeEffect: { name: 'fly-in', keyframes: [{ transform: 'translate(-50%, -50%) scale(1.35)' }, { transform: 'translate(-50%, -50%) scale(1)' }], duration: FLY_OUT_DURATION, easing: 'cubic-bezier(0.33, 1, 0.68, 1)', fill: 'forwards' }, key: '.card.fly-out' },
                            { keyframeEffect: { name: 'backdrop-out', keyframes: [{ opacity: 1 }, { opacity: 0 }], duration: FLY_OUT_DURATION, easing: 'ease-in', fill: 'forwards' }, key: '#backdrop' }
                        ]
                    }
                );

function updateCarousel() {
                if (isCardFlownOut) return;
                const cards = document.querySelectorAll('.card');
                cards.forEach((card, index) => {
                    let diff = index - currentIndex;
                    if (Math.abs(diff) > cardData.length / 2) {
                        diff = diff > 0 ? diff - cardData.length : diff + cardData.length;
                    }
                    card.className = 'card';
                    switch (diff) {
                        case 0: card.classList.add('active'); break;
                        case 1: card.classList.add('right-1'); break;
                        case -1: card.classList.add('left-1'); break;
                        case 2: card.classList.add('right-2'); break;
                        case -2: card.classList.add('left-2'); break;
                        case 3: card.classList.add('right-3'); break;
                        case -3: card.classList.add('left-3'); break;
                        default: card.classList.add('hidden'); break;
                    }
                });
            }

function navigateNext() {
                if (isCardFlownOut || isAnimating) return;
                currentIndex = (currentIndex + 1) % cardData.length;
                updateCarousel();
            }

function navigatePrev() {
                if (isCardFlownOut || isAnimating) return;
                currentIndex = (currentIndex - 1 + cardData.length) % cardData.length;
                updateCarousel();
            }

function handleCardClick(card) {
                if (isCardFlownOut || isAnimating) return;

                if (card.classList.contains('active')) {
                    isCardFlownOut = true;
                    card.classList.add('fly-out');
                    backdrop.classList.add('visible');
                } else {
                    const newIndex = parseInt(card.dataset.index, 10);
                    let diff = newIndex - currentIndex;
                    const numCards = cardData.length;

                    if (Math.abs(diff) > numCards / 2) {
                        diff = diff > 0 ? diff - numCards : diff + numCards;
                    }

                    isAnimating = true;
                    const stepDuration = 150;
                    const direction = diff > 0 ? navigateNext : navigatePrev;
                    const steps = Math.abs(diff);

                    for (let i = 0; i < steps; i++) {
                        setTimeout(() => direction(), i * stepDuration);
                    }
                    setTimeout(() => { isAnimating = false; }, steps * stepDuration);
                }
            }
```
