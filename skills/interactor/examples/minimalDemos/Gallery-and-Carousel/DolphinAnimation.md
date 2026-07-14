# DolphinAnimation

A page-load and pointer-driven animation for pointer-responsive visual elements in a flex/carousel, layered composition, 3D scene layout. It uses width, height to create the motion and transition between visual states.

**Tags:** trigger: pageVisible, mousemove; layout: flex/carousel, layered composition, 3D scene; motion: width, height

## Markup

```html
<wix-interact-element data-wix-path="page-container">
        <div id="page-container">
            <div class="info-text" id="infoText">Move your cursor to start the animation.</div>
        </div>
    </wix-interact-element>
```

## Essential styles

```css
:root {
            --particle-lifespan: 80;
            --base-particle-width: 180;
            --size-variation: 0.2;
            --particle-spacing: 100;
            --hop-height: 100;
            --hop-width: 40;
            --density: 1;
            --particle-radius: 0;
        }

        
        body {
            margin: 0;
            padding: 0;
            overflow: hidden; 
            background-color: #f0f0f0;
            font-family: 'Inter', sans-serif;
            height: 100vh;
            cursor: crosshair; 
        }

        
        #page-container {
            width: 100%;
            height: 100%;
            position: relative;
        }

        
        .info-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #aaa;
            font-size: 1.5rem;
            text-align: center;
            pointer-events: none; 
            z-index: 1000;
            transition: opacity 0.5s ease;
        }

        
        .particle {
            position: absolute;
             
             
            will-change: transform;
            pointer-events: none;
            overflow: hidden; 
            border-radius: calc(var(--particle-radius, 0) * 1px);
            
            
            transform-origin: bottom center;
        }

        
        .particle-image {
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            border-radius: calc(var(--particle-radius, 0) * 1px);
            will-change: transform;
        }
```

## Interact config

```js
const interactConfig = {
            interactions: [
                {
                    key: 'page-container', 
                    trigger: 'pageVisible', 
                    params: {
                        type: 'once'
                    },
                    effects: [
                        {
                            key: 'page-container', 
                            
                            
                            
                            
                            customEffect: (element) => {
                                

                                
                                function getCssVarNumber(name, fallback) {
                                    const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
                                    const parsed = parseFloat(raw);
                                    return Number.isFinite(parsed) ? parsed : fallback;
                                }

                                function getParticleLifespan() {
                                    return Math.max(10, getCssVarNumber('--particle-lifespan', 80));
                                }

                                function getBaseParticleWidth() {
                                    return Math.max(20, getCssVarNumber('--base-particle-width', 180));
                                }

                                function getSizeVariation() {
                                    return Math.max(0, getCssVarNumber('--size-variation', 0.2));
                                }

                                function getParticleSpacing() {
                                    const spacing = Math.max(5, getCssVarNumber('--particle-spacing', 100));
                                    const density = Math.max(0.1, getCssVarNumber('--density', 1));
                                    return spacing / density;
                                }

                                function getHopHeight() {
                                    return getCssVarNumber('--hop-height', 100);
                                }

                                function getHopWidth() {
                                    return getCssVarNumber('--hop-width', 40);
                                }

                                const IMAGE_SOURCES = [
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                    'IMAGE_URL',
                                     'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL',
                'IMAGE_URL'
                                ];

                                
                                const particles = [];
                                let currentMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
                                let lastDrawnMousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
                                let hasMoved = false;
                                const infoText = document.getElementById('infoText');
                                
                                
                                function easeOutCubic(t) {
                                    return 1 - Math.pow(1 - t, 3);
                                }

                                
                                function createParticle(x, y) {
                                    const particleLifespan = getParticleLifespan();
                                    const baseParticleWidth = getBaseParticleWidth();
                                    const sizeVariation = getSizeVariation();
                                    const particleContainer = document.createElement('div');
                                    particleContainer.classList.add('particle');
                                    

                                    const particleImage = document.createElement('div');
                                    particleImage.classList.add('particle-image');
                                    
                                    const randomImageSrc = IMAGE_SOURCES[Math.floor(Math.random() * IMAGE_SOURCES.length)];
                                    
                                    
                                    const img = new Image();
                                    
                                    const hopDirection = (Math.random() - 0.5) * 2;
                                    
                                    
                                    const particle = {
                                        container: particleContainer,
                                        image: particleImage,
                                        startX: x,
                                        startY: y,
                                        hopWidth: getHopWidth() * hopDirection,
                                        angle: hopDirection * 10,
                                        life: particleLifespan,
                                        initialLife: particleLifespan,
                                        width: baseParticleWidth, 
                                        height: baseParticleWidth * 1.625 
                                    };

                                    img.onload = () => {
                                        
                                        const ratio = img.naturalHeight / img.naturalWidth;
                                        const variation = (Math.random() - 0.5) * sizeVariation + 1.0; 
                                        const finalWidth = baseParticleWidth * variation;
                                        const finalHeight = finalWidth * ratio;

                                        
                                        particle.width = finalWidth;
                                        particle.height = finalHeight;

                                        
                                        particleContainer.style.width = finalWidth + 'px';
                                        particleContainer.style.height = finalHeight + 'px';
                                        

                                        particleImage.style.backgroundImage = `url(${randomImageSrc})`;
                                        particleContainer.appendChild(particleImage);
                                        
                                        
                                        
                                        element.appendChild(particleContainer);
                                        
                                        particles.push(particle);
                                    };

                                }

                                
                                function animate() {
                                    const particleSpacing = getParticleSpacing();
                                    const hopHeight = getHopHeight();
                                    
                                    const dx = currentMousePos.x - lastDrawnMousePos.x;
                                    const dy = currentMousePos.y - lastDrawnMousePos.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);

                                    if (distance >= particleSpacing) {
                                        const numParticles = Math.floor(distance / particleSpacing);
                                        const angle = Math.atan2(dy, dx);

                                        for (let i = 1; i <= numParticles; i++) {
                                            const newX = lastDrawnMousePos.x + Math.cos(angle) * particleSpacing * i;
                                            const newY = lastDrawnMousePos.y + Math.sin(angle) * particleSpacing * i;
                                            createParticle(newX, newY);
                                        }
                                        
                                        lastDrawnMousePos = {
                                            x: lastDrawnMousePos.x + Math.cos(angle) * particleSpacing * numParticles,
                                            y: lastDrawnMousePos.y + Math.sin(angle) * particleSpacing * numParticles
                                        };
                                    }

                                    
                                    for (let i = particles.length - 1; i >= 0; i--) {
                                        const p = particles[i];
                                        p.life--;

                                        const lifeProgress = (p.initialLife - p.life) / p.initialLife;
                                        const sinProgress = Math.sin(lifeProgress * Math.PI);
                                        const hopArc = easeOutCubic(sinProgress);

                                        const targetX = p.startX + lifeProgress * p.hopWidth;
                                        const targetY = p.startY - hopArc * hopHeight;
                                        
                                        
                                        const translateX = targetX - (p.width / 2);
                                        const translateY = targetY - p.height;
                                        const imageTranslateY = p.height * (1 - hopArc);
                                        

                                        if (p.life <= 0) {
                                            p.container.remove();
                                            particles.splice(i, 1);
                                            continue;
                                        }

                                        p.container.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${p.angle}deg)`;
                                        p.container.style.boxShadow = `0 8px 25px rgba(0,0,0,${(0.15 * hopArc * hopArc).toFixed(3)})`;
                                        p.image.style.transform = `translateY(${imageTranslateY}px)`;
                                    }

                                    
                                    requestAnimationFrame(animate);
                                }
                                
                                
                                function handleMovement(x, y) {
                                    if (!hasMoved) {
                                        hasMoved = true;
                                        if (infoText) {
                                          infoText.style.opacity = '0';
                                        }
                                        
                                        lastDrawnMousePos = { x, y };
                                    }
                                    currentMousePos = { x, y };
                                }

                                
                                
                                document.addEventListener('mousemove', (e) => handleMovement(e.clientX, e.clientY));
                                document.addEventListener('touchmove', (e) => {
                                    if (e.touches.length > 0) handleMovement(e.touches[0].clientX, e.touches[0].clientY);
                                });

                                
                                animate();

                                
                            }
                        }
                    ]
                }
            ]
        };
```
