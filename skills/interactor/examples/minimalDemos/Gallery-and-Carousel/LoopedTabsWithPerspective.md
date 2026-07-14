# LoopedTabsWithPerspective

A hover-triggered and page-load animation for gallery items in a flex/carousel, layered composition, 3D scene layout. It uses transform to create the motion and transition between visual states.

**Tags:** trigger: hover, pageVisible; layout: flex/carousel, layered composition, 3D scene; motion: transform

## Markup

```html
<div class="carousel-wrapper py-8">

        <wix-interact-element data-wix-path="#carousel-container">
            <div id="carousel-container" class="carousel">

                <wix-interact-element data-wix-path="card-1">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Alpha</h3>
                            <p class="text-gray-600">An innovative approach to modern web design.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-2">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Beta</h3>
                            <p class="text-gray-600">Exploring the future of user interfaces.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-3">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Gamma</h3>
                            <p class="text-gray-600">Data visualization and interactive charts.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-4">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Delta</h3>
                            <p class="text-gray-600">Mobile-first development strategies.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-5">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Epsilon</h3>
                            <p class="text-gray-600">Backend architecture and scalability.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-6">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Zeta</h3>
                            <p class="text-gray-600">Cloud integration and deployment.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-7">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Eta</h3>
                            <p class="text-gray-600">AI-powered user personalization.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-8">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Theta</h3>
                            <p class="text-gray-600">Cybersecurity and data protection.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-9">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Iota</h3>
                            <p class="text-gray-600">Cross-platform application frameworks.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-10">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Kappa</h3>
                            <p class="text-gray-600">User experience and journey mapping.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-11">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Lambda</h3>
                            <p class="text-gray-600">Serverless functions and microservices.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-12">
                     <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Mu</h3>
                            <p class="text-gray-600">Augmented reality integrations.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-13">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Nu</h3>
                            <p class="text-gray-600">Blockchain and decentralized apps.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-14">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Xi</h3>
                            <p class="text-gray-600">API design and documentation.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-15">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Omicron</h3>
                            <p class="text-gray-600">Performance optimization and testing.</p>
                        </div>
                    </div>
                </wix-interact-element>

                 <wix-interact-element data-wix-path="card-16">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Alpha</h3>
                            <p class="text-gray-600">An innovative approach to modern web design.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-17">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Beta</h3>
                            <p class="text-gray-600">Exploring the future of user interfaces.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-18">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Gamma</h3>
                            <p class="text-gray-600">Data visualization and interactive charts.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-19">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Delta</h3>
                            <p class="text-gray-600">Mobile-first development strategies.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-20">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Epsilon</h3>
                            <p class="text-gray-600">Backend architecture and scalability.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-21">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Zeta</h3>
                            <p class="text-gray-600">Cloud integration and deployment.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-22">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Eta</h3>
                            <p class="text-gray-600">AI-powered user personalization.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-23">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Theta</h3>
                            <p class="text-gray-600">Cybersecurity and data protection.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-24">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Iota</h3>
                            <p class="text-gray-600">Cross-platform application frameworks.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-25">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Kappa</h3>
                            <p class="text-gray-600">User experience and journey mapping.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-26">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Lambda</h3>
                            <p class="text-gray-600">Serverless functions and microservices.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-27">
                     <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Mu</h3>
                            <p class="text-gray-600">Augmented reality integrations.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-28">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Nu</h3>
                            <p class="text-gray-600">Blockchain and decentralized apps.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-29">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Xi</h3>
                            <p class="text-gray-600">API design and documentation.</p>
                        </div>
                    </div>
                </wix-interact-element>
                <wix-interact-element data-wix-path="card-30">
                    <div class="perspective-container">
                        <div class="card bg-white shadow-xl rounded-2xl p-4">
                            <img class="rounded-lg mb-4 w-full h-40 object-cover">
                            <h3 class="text-lg font-bold mb-2 text-gray-800">Project Omicron</h3>
                            <p class="text-gray-600">Performance optimization and testing.</p>
                        </div>
                    </div>
                </wix-interact-element>

            </div>
        </wix-interact-element>
    </div>
```

## Essential styles

```css
body {
            font-family: 'Inter', sans-serif;
            overflow-x: hidden; 
        }

        
        .carousel-wrapper {
            width: 100%;
            overflow: hidden;
            
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .carousel {
            display: flex;
            gap: 2rem; 
            width: 540rem; 
        }

        .perspective-container {
            perspective: 1000px;
            flex-shrink: 0; 
        }

        .card {
            width: 16rem; 
            position: relative; 
            transform: rotateY(25deg);
            z-index: 1; 
            
            transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
```

## Interact config

```js
const cardInteractions = [];

const totalCards = 30;

for (let i = 1; i <= totalCards; i++) {
            const cardKey = `card-${i}`;
            
            cardInteractions.push({
                key: cardKey, 
                trigger: 'hover',
                params: {
                    type: 'alternate' 
                },
                effects: [
                    
                    {
                        key: cardKey, 
                        selector: '.card', 
                        keyframeEffect: {
                            name: `card-hover-effect-${i}`,
                            keyframes: [
                                
                                { transform: 'rotateY(25deg) scale(1)', zIndex: '1' },
                                
                                { transform: 'rotateY(0deg) scale(1.05)', zIndex: '10' }
                            ]
                        },
                        duration: 300,
                        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
                        fill: 'both' 
                    },
                    
                    {
                        key: '#carousel-container', 
                        transition: {
                            duration: 1, 
                            styleProperties: [
                                { name: 'animationPlayState', value: 'paused' }
                            ]
                        }
                    }
                ]
            });
        }

const config = {
            interactions: [
                
                {
                    key: '#carousel-container', 
                    trigger: 'pageVisible',   
                    effects: [{
                        key: '#carousel-container',
                        keyframeEffect: {
                            name: 'marquee-scroll',
                            keyframes: [
                                { transform: 'translateX(0)' },
                                { transform: 'translateX(-270rem)' }
                            ]
                        },
                        duration: 60000, 
                        easing: 'linear',
                        iterations: Infinity 
                    }]
                },
                
                ...cardInteractions
            ]
        };
```
