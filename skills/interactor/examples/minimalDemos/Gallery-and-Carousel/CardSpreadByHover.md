# CardSpreadByHover

A hover-triggered animation for cards in a grid/gallery, flex/carousel, layered composition layout. It uses transform to create the motion and transition between visual states.

**Tags:** trigger: hover; layout: grid/gallery, flex/carousel, layered composition; motion: transform

## Markup

```html
<wix-interact-element data-wix-path="#cards-collection">
        <div id="cards-collection">
            <wix-interact-element data-wix-path="#card-1">
                <div id="card-1" class="card">
                    <img>
                    <div class="card-content">
                        <h2>Serene Peaks</h2>
                        <p>Find your calm</p>
                    </div>
                </div>
            </wix-interact-element>
            <wix-interact-element data-wix-path="#card-2">
                <div id="card-2" class="card">
                    <img>
                    <div class="card-content">
                        <h2>Rolling Hills</h2>
                        <p>Explore the landscape</p>
                    </div>
                </div>
            </wix-interact-element>
            <wix-interact-element data-wix-path="#card-3">
                <div id="card-3" class="card">
                    <img>
                    <div class="card-content">
                        <h2>Alpine Lake</h2>
                        <p>Reflect and relax</p>
                    </div>
                </div>
            </wix-interact-element>
            <wix-interact-element data-wix-path="#card-4">
                <div id="card-4" class="card">
                    <img>
                    <div class="card-content">
                        <h2>Hidden Falls</h2>
                        <p>Discover nature's power</p>
                    </div>
                </div>
            </wix-interact-element>
            <wix-interact-element data-wix-path="#card-5">
                <div id="card-5" class="card">
                    <img>
                    <div class="card-content">
                        <h2>Forest Canopy</h2>
                        <p>Breathe the fresh air</p>
                    </div>
                </div>
            </wix-interact-element>
        </div>
    </wix-interact-element>
```

## Essential styles

```css
:root {
            --bg-color: #f0f0f0;
            --text-color: #111;
            --card-title-color: #ffffff;
        }
        
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            height: 100%;
            width: 100%;
        }

        
        body {
            display: grid;
            place-items: center;
            overflow: hidden; 
        }

        
        #cards-collection {
            position: relative;
            
            width: 25vw;
            height: 70vh;
            margin: 0;
            
            cursor: pointer;  
        }

        .card {
            position: absolute;
            
            width: 25vw;
            height: 70vh;
            border-radius: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 5rem;
            font-weight: bold;
            overflow: hidden;
            color: rgba(255, 255, 255, 0.8);
            will-change: transform; 
            
            transform: translateX(0);  
        }

        .card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }
        
        .card-content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 2rem;
            z-index: 2;
            text-align: center;
            color: var(--card-title-color);
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        }

        .card-content h2 {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
        }

        .card-content p {
            font-size: 1rem;
            font-weight: 400;
            margin: 0;
        }

        
        #card-1 { z-index: 3; }
        #card-2 { z-index: 4; }
        #card-3 { z-index: 5; }
        #card-4 { z-index: 2; }
        #card-5 { z-index: 1; }

        
        @media (max-width: 768px) {
            #cards-collection {
                
                width: 25vw;
                height: 70vh;
            }

            .card {
                width: 100%; 
                height: 70vh; 
                left: 0;
                top: 0;
                transform: translateX(0);  
            }

            .card-content {
                text-align: left;
                padding: 1.5rem;
            }
            .card-content h2 {
                font-size: 1.5rem;
            }
            .card-content p {
                font-size: 0.9rem;
            }
            
            
            #card-1 { z-index: 1; }
            #card-2 { z-index: 2; }
            #card-3 { z-index: 3; }
            #card-4 { z-index: 4; }
            #card-5 { z-index: 5; }
        }

        @media (prefers-reduced-motion: reduce) {
            .card {
                
                transition: none;
            }
            
            @media (min-width: 769px) {
                
                .card { height: 70vh !important; }
                #card-1 { transform: translateX(calc(-50vw - 20px)) !important; }
                #card-2 { transform: translateX(calc(-25vw - 10px)) !important; }
                #card-3 { transform: translateX(0) !important; }
                #card-4 { transform: translateX(calc(25vw + 10px)) !important; }
                #card-5 { transform: translateX(calc(50vw + 20px)) !important; }
            }
            
            @media (max-width: 768px) {
                
                .card { height: 70vh !important; }
                #card-1 { transform: translateX(-10vw) !important; }
                #card-2 { transform: translateX(-5vw) !important; }
                #card-3 { transform: translateX(0) !important; }
                #card-4 { transform: translateX(5vw) !important; }
                #card-5 { transform: translateX(10vw) !important; }
            }
        }
```

## Interact config

```js
const desktopConfig = {
                interactions: [
                    {
                        key: '#cards-collection', 
                        trigger: 'hover',
                        params: { 
                            type: 'alternate' 
                        },
                        effects: [
                            {
                                key: '#card-1',
                                
                                
                                keyframeEffect: { 
                                    name: 'card-1-move', 
                                    keyframes: [
                                        { transform: 'translateX(0)' }, 
                                        
                                        
                                        { transform: 'translateX(calc(-50vw - 20px))' } 
                                    ] 
                                },
                                duration: 600, 
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)', 
                                fill: 'both' 
                            },
                            {
                                key: '#card-2',
                                
                                keyframeEffect: { name: 'card-2-move', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(calc(-25vw - 10px))' }] },
                                duration: 600,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            },
                            {
                                key: '#card-3',
                                
                                keyframeEffect: { name: 'card-3-move', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(0)' }] },
                                duration: 600,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            },
                            {
                                key: '#card-4',
                                
                                keyframeEffect: { name: 'card-4-move', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(calc(25vw + 10px))' }] },
                                duration: 600,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            },
                            {
                                key: '#card-5',
                                
                                
                                keyframeEffect: { name: 'card-5-move', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(calc(50vw + 20px))' }] },
                                duration: 600,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            }
                        ]
                    }
                ]
            };

const mobileConfig = {
                interactions: [
                    {
                        key: '#cards-collection',
                        trigger: 'hover', 
                        params: { 
                            type: 'alternate' 
                        },
                        effects: [
                            
                            {
                                key: '#card-1',
                                keyframeEffect: { name: 'card-1-move-mob', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-10vw)' }] },
                                duration: 500,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            },
                            {
                                key: '#card-2',
                                keyframeEffect: { name: 'card-2-move-mob', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(-5vw)' }] },
                                duration: 500,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            },
                            {
                                key: '#card-3',
                                keyframeEffect: { name: 'card-3-move-mob', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(0)' }] },
                                duration: 500,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            },
                            {
                                key: '#card-4',
                                keyframeEffect: { name: 'card-4-move-mob', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(5vw)' }] },
                                duration: 500,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            },
                            {
                                key: '#card-5',
                                keyframeEffect: { name: 'card-5-move-mob', keyframes: [{ transform: 'translateX(0)' }, { transform: 'translateX(10vw)' }] },
                                duration: 500,
                                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                fill: 'both'
                            }
                        ]
                    }
                ]
            };
```
