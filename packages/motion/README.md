# Wix Motion

A comprehensive animation library featuring 82+ carefully crafted presets, designed for modern web applications, built on native browser technology.

## ✨ Features

- **Web Platform First** - Built on native browser technology for smooth 60fps animations
- **82+ Animation Presets** - Professionally designed animations ready to use
- **5 Animation Categories** - Entrance, Ongoing, Scroll, Mouse, and Background Scroll effects
- **TypeScript Support** - Complete type definitions with IntelliSense support
- **Dual Rendering** - Both Web Animations API and CSS-based rendering
- **Scroll Integration** - Advanced scroll-driven animations with ViewTimeline API support
- **Mouse Parallax** - Interactive pointer-based animations
- **Performance Optimized** - Uses fastdom to minimize layout thrashing

## 🚀 Quick Start

### Installation

```bash
npm install @wix/motion
```

### Basic Usage

```typescript
import { getWebAnimation } from '@wix/motion';

// Create a fade-in entrance animation
const animation = getWebAnimation(document.getElementById('myElement'), {
  namedEffect: { type: 'FadeIn' },
  duration: 1000,
  easing: 'easeOut',
});

// Play the animation
await animation.play();
```

### Named Easings

`@wix/motion` exports the `cssEasings` map for reusable CSS easing strings, plus `CssEasingName` and `CssEasing` types for typed pickers and animation config.

```typescript
import { cssEasings, type CssEasingName } from '@wix/motion';

const easingName: CssEasingName = 'sineInOut';
const easing = cssEasings[easingName];
```

Available names: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, `sineIn`, `sineOut`, `sineInOut`, `quadIn`, `quadOut`, `quadInOut`, `cubicIn`, `cubicOut`, `cubicInOut`, `quartIn`, `quartOut`, `quartInOut`, `quintIn`, `quintOut`, `quintInOut`, `expoIn`, `expoOut`, `expoInOut`, `circIn`, `circOut`, `circInOut`, `backIn`, `backOut`, `backInOut`.

### Scroll-Driven Animation

```typescript
import { getScrubScene } from '@wix/motion';

// Create a scroll-driven parallax effect
const scene = getScrubScene(
  document.getElementById('scrollElement'),
  {
    namedEffect: {
      type: 'ParallaxScroll',
      speed: 0.5,
    },
  },
  { trigger: 'view-progress', element: document.getElementById('viewport') },
);
```

## 📚 Animation Categories

### 🎭 Entrance Animations (24 presets)

Perfect for element reveals and page transitions:

- **FadeIn** - Simple opacity transition
- **ArcIn** - Curved motion with 3D rotation
- **BounceIn** - Spring-based entrance with bounce effect
- **SlideIn** - Directional slides from off-screen
- **FlipIn** - 3D flip transitions
- [See all entrance animations →](docs/categories/entrance-animations.md)

### 🔄 Ongoing Animations (16 presets)

Continuous looping animations for attention and delight:

- **Pulse** - Rhythmic scaling effect
- **Breathe** - Organic scaling animation
- **Spin** - Smooth rotation loops
- **Wiggle** - Playful shake motions
- **Float** - Gentle floating movement
- [See all ongoing animations →](docs/categories/ongoing-animations.md)

### 📜 Scroll Animations (19 presets)

Scroll-synchronized effects that respond to viewport position:

- **ParallaxScroll** - Classic parallax movement
- **FadeScroll** - Opacity changes on scroll
- **GrowScroll** - Scale transformations
- **RevealScroll** - Clip-path reveals
- **TiltScroll** - 3D perspective tilting
- [See all scroll animations →](docs/categories/scroll-animations.md)

### 🖱️ Mouse Animations (12 presets)

Interactive pointer-driven effects:

- **TrackMouse** - Element follows cursor
- **Tilt3DMouse** - 3D tilt based on pointer position
- **ScaleMouse** - Dynamic scaling on hover
- **BlurMouse** - Motion blur effects
- [See all mouse animations →](docs/categories/mouse-animations.md)

### 🖼️ Background Scroll Animations (12 presets)

Specialized effects for background media elements:

- **BgParallax** - Background parallax scrolling
- **BgZoom** - Dynamic background scaling
- **BgFade** - Background opacity transitions
- **BgRotate** - Background rotation effects
- [See all background animations →](docs/categories/background-scroll-animations.md)

## 🛠️ Core APIs

### Animation Creation

- `getWebAnimation()` - Create Web Animations API instances
- `getScrubScene()` - Generate scroll/pointer-driven scenes
- `prepareAnimation()` - Pre-calculate measurements for performance

### CSS Integration

- CSS custom properties for dynamic values
- CSS Animation API for stylesheet-based animations
- Automatic vendor prefixing and fallbacks

### TypeScript Support

Complete type definitions for all animation options:

```typescript
interface TimeAnimationOptions {
  namedEffect: EntranceAnimation | OngoingAnimation;
  duration?: number;
  easing?: string;
  // ... more options
}
```

## 📖 Documentation

- **[Getting Started](docs/getting-started.md)** - Setup and first animation
- **[Core Concepts](docs/core-concepts.md)** - Understanding the animation system
- **[API Reference](docs/api/)** - Complete function documentation
- **[Category Guides](docs/categories/)** - Detailed category overviews
- **[Preset Reference](docs/presets/)** - Individual animation documentation
- **[Advanced Usage](docs/guides/)** - Performance tips and patterns

## 🎮 Interactive Playground

Explore animations interactively in our Storybook playground:

```bash
yarn start  # Opens interactive documentation
```

## 🔧 Framework Integration

Works seamlessly with popular frameworks:

- React/Vue/Angular components
- GSAP and Framer Motion compatibility
- CSS-in-JS libraries
- Server-side rendering support

## 🌐 Browser Support

- **Modern browsers** with Web Animations API
- **Progressive enhancement** with CSS fallbacks
- **ViewTimeline API** for advanced scroll effects (with polyfill)

## 🤝 Contributing

This package is part of the Wix wow-libs monorepo. See [contributing guidelines](../../CONTRIBUTING.md) for development setup and contribution process.

## 📄 License

UNLICENSED - Internal Wix package

---

**Built with ❤️ by the Wix wow!Team**
