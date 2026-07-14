# DigitalJukebox

A scroll-driven animation for gallery items in a flex/carousel, list/repeater, layered composition layout. It uses opacity, transform to create the motion and transition between visual states.

**Tags:** trigger: viewProgress; layout: flex/carousel, list/repeater, layered composition; motion: opacity, transform

## Markup

```html
<div class="screen">
        <wix-interact-element data-wix-path="scroll-container">
            <div class="scroll-view" id="scroll-view">
                <div class="item-list" id="item-list">

                    <wix-interact-element data-wix-path="item-0">
                         <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-1">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-2">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-3">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-4">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-5">
                       <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-6">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-7">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-8">
                       <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-9">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                     <wix-interact-element data-wix-path="item-10">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                    <wix-interact-element data-wix-path="item-11">
                        <div class="list-item" style="background-image: none"></div>
                    </wix-interact-element>
                </div>
            </div>
        </wix-interact-element>

        <div class="info-panel">
            <h2 id="artist-name">Teebs</h2>
            <p id="song-title">The Tropics</p>
        </div>
    </div>
```

## Essential styles

```css
:root {
            --item-width: 800px;
            --item-height: 512px;
            --item-radius: 12px;
            --item-gap: 32px;
        }

        
        body {
            margin: 0;
            background-color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden; 
        }

        
        .screen {
            width: 100vw;
            height: 100vh;
            background-color: #ffffff;
            position: relative;
            display: flex;
            justify-content: center;
        }

        
        .scroll-view {
            width: 100%;
            height: 100%;
            overflow-y: scroll;
            perspective: 500px; 
            position: relative;
            
            scroll-snap-type: y proximity;
        }

        
        .scroll-view::-webkit-scrollbar {
            display: none; 
        }
        .scroll-view {
            -ms-overflow-style: none;  
            scrollbar-width: none;  
        }

        
        .item-list {
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform-style: preserve-3d; 
            
            padding: calc(50vh - var(--item-height) / 2) 0;
        }

        
        .list-item {
            width: var(--item-width);
            max-width: 90vw; 
            height: var(--item-height);
            background-color: #f0f0f0;
            border-radius: var(--item-radius);
            background-size: cover;
            background-position: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            margin: 0 auto var(--item-gap); 
            
            scroll-snap-align: center;
            
            will-change: transform, opacity;
        }

        
        .info-panel {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 60px 20px 30px;
            text-align: center;
            color: #333;
            background: linear-gradient(to top, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0));
            pointer-events: none;
            z-index: 10;
        }

        .info-panel h2 {
            margin: 0 0 6px 0;
            font-size: 32px;
            font-weight: 600;
        }

        .info-panel p {
            margin: 0;
            font-size: 16px;
            color: #666;
        }
```

## Interact config

```js
const itemsData = [
            { artist: "Teebs", title: "The Tropics" },
            { artist: "Astrid Sonne", title: "Boost" },
            { artist: "ML Buch", title: "Boarding" },
            { artist: "Burial", title: "Archangel" },
            { artist: "Aphex Twin", title: "Avril 14th" },
            { artist: "Four Tet", title: "Two Thousand and Seventeen" },
            { artist: "Bonobo", title: "Cirrus" },
            { artist: "Tycho", title: "Awake" },
            { artist: "Floating Points", title: "Nespole" },
            { artist: "Caribou", title: "Odessa" },
            { artist: "Jon Hopkins", title: "Emerald Rush" },
            { artist: "Boards of Canada", title: "Roygbiv" },
        ];

const scroll3DEffect = {
            name: 'scroll-3d-transform',
            keyframes: [
                { offset: 0, opacity: 0.2, transform: 'perspective(500px) rotateX(25deg) translateZ(-350px)' },
                { offset: 0.5, opacity: 1, transform: 'perspective(500px) rotateX(0deg) translateZ(0px)' },
                { offset: 1, opacity: 0.2, transform: 'perspective(500px) rotateX(-25deg) translateZ(-350px)' }
            ]
        };

const itemInteractions = itemsData.map((_, index) => ({
            key: `item-${index}`,
            trigger: 'viewProgress',
            effects: [
                {
                    key: `item-${index}`,
                    keyframeEffect: scroll3DEffect,
                    
                    
                    easing: 'linear',
                    fill: 'both'
                }
            ]
        }));

const infoPanelInteraction = {
            key: 'scroll-container',
            trigger: 'viewProgress',
            effects: [
                {
                    key: 'scroll-container', 
                    customEffect: (element, progress) => {
                        const artistEl = document.getElementById('artist-name');
                        const songEl = document.getElementById('song-title');
                        
                        
                        const totalItems = itemsData.length;
                        let closestIndex = Math.round(progress * (totalItems - 1));
                        closestIndex = Math.max(0, Math.min(totalItems - 1, closestIndex));

                        const currentData = itemsData[closestIndex];

                        
                        if (artistEl.textContent !== currentData.artist) {
                            artistEl.textContent = currentData.artist;
                        }
                        if (songEl.textContent !== currentData.title) {
                            songEl.textContent = currentData.title;
                        }
                    },
                    
                    rangeStart: { name: 'contain', offset: { type: 'percentage', value: 0 } },
                    rangeEnd: { name: 'contain', offset: { type: 'percentage', value: 100 } }
                }
            ]
        };

const config = {
            interactions: [
                ...itemInteractions,
                infoPanelInteraction
            ]
        };
```
