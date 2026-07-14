# FadeInGallery

A viewport-entry and hover-triggered animation for gallery items in a grid/gallery, layered composition layout. It uses FadeIn, transform to create the motion and transition between visual states.

**Tags:** trigger: viewEnter, hover; layout: grid/gallery, layered composition; motion: FadeIn, transform

## Markup

```html
<div id="collage-container">

        <wix-interact-element data-wix-path="#text-overlay">
            <div class="text-overlay">
                <h1>Explore the View</h1>
                <p>Hover to pause and discover more about this moment.</p>
            </div>
        </wix-interact-element>

        <wix-interact-element data-wix-path="#hover-hotspot">
            <div id="hover-hotspot"></div>
        </wix-interact-element>
    </div>
```

## Essential styles

```css
html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden; 
            background-color: #000; 
            font-family: 'Inter', sans-serif;
        }

        
        #collage-container {
            width: 100%;
            height: 100%;
            position: relative;
            cursor: pointer; 
        }

        
        wix-interact-element {
            display: contents; 
        }

        
        .fragment {
            position: absolute;
            overflow: hidden;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            background-color: #111;
            
        }

        
        .fragment .content-image {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }

        
        .text-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            padding: max(20px, 4vw);
            box-sizing: border-box;
            color: #fff;
            opacity: 0; 
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            z-index: 5; 
        }

        
        #hover-hotspot {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 50%; 
            z-index: 10; 
        }

        .text-overlay h1 {
            margin: 0 0 5px 0;
            font-size: clamp(1.8rem, 5vw, 2.5rem);
        }

        .text-overlay p {
            margin: 0;
            font-size: clamp(1rem, 2.5vw, 1.2rem);
            font-weight: 400;
        }
```

## Interact config

```js
const interactConfig = {
                effects: {
                    'fragment-scale-in': {
                        keyframeEffect: {
                            name: 'fragment-scale-in',
                            keyframes: [
                                { transform: 'scale(0)' },
                                { transform: 'scale(1)' }
                            ]
                        },
                        duration: 1000,
                        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
                        fill: 'backwards' 
                    },
                    'text-fade': {
                        namedEffect: { type: 'FadeIn' },
                        duration: 400,
                        easing: 'ease-in-out',
                        fill: 'both'
                    }
                },
                interactions: [
                    {
                        key: '.collage-fragment-wrapper',
                        trigger: 'viewEnter',
                        params: { type: 'once' },
                        effects: [{ effectId: 'fragment-scale-in' }]
                    },
                    {
                        key: '#hover-hotspot',
                        trigger: 'hover',
                        params: { type: 'alternate' },
                        effects: [{ key: '#text-overlay', effectId: 'text-fade' }]
                    }
                ]
            };
```
