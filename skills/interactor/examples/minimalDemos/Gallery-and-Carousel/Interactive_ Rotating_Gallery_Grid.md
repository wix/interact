# Interactive Rotating Gallery Grid

A hover-triggered and pointer-driven animation for gallery items in a grid/gallery, flex/carousel, layered composition layout. It uses opacity, transform to create the motion and transition between visual states.

**Tags:** trigger: hover, pointerMove; layout: grid/gallery, flex/carousel, layered composition; motion: opacity, transform

## Markup

```html
<wix-interact-element data-wix-path="grid-wrapper">
        <div class="grid-container" id="grid-container">

        </div>
    </wix-interact-element>
```

## Essential styles

```css
:root {
            --max-rotate-z: 15;
            --max-move: 40;
            --pointer-latency: 50ms;
            --pointer-direction: 1;
        }
        body {
            margin: 0;
            padding: 40px;
            background: #111;
            font-family: 'Inter', sans-serif;
            perspective: 1000px;
        }

        .grid-container {
            display: grid;
            gap: 40px;
            grid-template-columns: repeat(8, 1fr);
        }

        
        wix-interact-element {
            display: contents;
        }

        .card-component {
            position: relative;
            cursor: pointer;
            width: 100%;
            height: 100%;
        }

        .card-inner {
            width: 100%;
            aspect-ratio: 1/1;
            border-radius: 20px;
            background-size: cover;
            background-position: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 32px;
            box-sizing: border-box;
            color: white;
            font-weight: 500;
            transition: transform var(--pointer-latency) ease-out;
            transform-style: preserve-3d;
        }

        .card-content {
            opacity: 0;
            transform: translateY(12px);
        }

        .card-content h3 {
            margin: 0 0 4px 0;
        }

        .card-content p {
            margin: 0;
        }
        
        
        @media(max-width: 1200px) {
            .grid-container {
                grid-template-columns: repeat(4, 1fr);
            }
        }

        @media(max-width: 900px) {
            .grid-container {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media(max-width: 750px) {
            .grid-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }
```

## Interact config

```js
const numCards = 32;

let columns = 8;

function getPositionFactor(index, currentColumns) {
            const numRows = Math.ceil(numCards / currentColumns);
            const row = Math.floor(index / currentColumns);
            const col = index % currentColumns;
            const centerCol = (currentColumns - 1) / 2;
            const centerRow = (numRows - 1) / 2;

            const offsetX = centerCol !== 0 ? (col - centerCol) / centerCol : 0;
            const offsetY = centerRow !== 0 ? (row - centerRow) / centerRow : 0;

            const factor = Math.min(1, Math.sqrt(offsetX * offsetX + offsetY * offsetY));
            return { factor, offsetX, offsetY };
        }

const interactions = [];

const pointerMoveEffects = [];

for (let i = 0; i < numCards; i++) {
                
                interactions.push({
                    key: `card-${i}`,
                    trigger: 'hover',
                    params: { type: 'alternate' },
                    effects: [{ 
                        key: `card-content-${i}`,
                        effectId: 'content-reveal' 
                    }]
                });

                
                pointerMoveEffects.push({
                    key: `card-inner-${i}`,
                    customEffect: (element, progress) => {
                        const style = getComputedStyle(document.documentElement);
                        const rz = parseFloat(style.getPropertyValue('--max-rotate-z'));
                        const mv = parseFloat(style.getPropertyValue('--max-move'));
                        const dr = parseFloat(style.getPropertyValue('--pointer-direction'));
                        const maxRotateZ = isNaN(rz) ? 15 : rz;
                        const maxMove = isNaN(mv) ? 40 : mv;
                        const direction = isNaN(dr) ? 1 : dr;

                        const normalizedX = (progress.x - 0.5) * 2 * direction;
                        const normalizedY = (progress.y - 0.5) * 2 * direction;

                        const pos = getPositionFactor(i, columns);
                        const factor = pos.factor;
                        const offsetX = pos.offsetX;
                        const offsetY = pos.offsetY;

                        const rotateZ = (factor * maxRotateZ) * -Math.sign(offsetX || 1) * normalizedX;
                        const moveX = (factor * maxMove) * -offsetX * normalizedX;
                        const moveY = (factor * maxMove) * -offsetY * normalizedY;
                        
                        element.style.transform = `translate(${moveX}px, ${moveY}px) rotateZ(${rotateZ}deg)`;
                    }
                });
            }

interactions.push({
                key: 'grid-wrapper',
                trigger: 'pointerMove',
                effects: pointerMoveEffects
            });

const config = {
                effects: {
                    'content-reveal': {
                        keyframeEffect: {
                            name: 'content-reveal-anim',
                            keyframes: [
                                { opacity: 0, transform: 'translateY(12px)' },
                                { opacity: 1, transform: 'translateY(0px)' }
                            ]
                        },
                        duration: 300,
                        easing: 'ease-out',
                        fill: 'both'
                    }
                },
                interactions: interactions
            };
```
