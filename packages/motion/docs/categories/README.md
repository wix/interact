# Animation Categories

Wix Motion organizes its 82+ animation presets into 5 distinct categories, each designed for specific use cases and interaction patterns.

## 🎭 [Entrance Animations](entrance-animations.md) (24 presets)

Perfect for element reveals and page transitions. These animations bring elements into view with impact and style.

**Popular Presets**: FadeIn, ArcIn, BounceIn, SlideIn, FlipIn, GlideIn, DropIn, ExpandIn

## 🔄 [Ongoing Animations](ongoing-animations.md) (16 presets)

Continuous looping animations that add life and draw attention to elements.

**Popular Presets**: Pulse, Breathe, Spin, Wiggle, Float, Bounce, Flash, Swing

## 📜 [Scroll Animations](scroll-animations.md) (19 presets)

Scroll-driven effects that respond to viewport position for immersive storytelling.

**Popular Presets**: ParallaxScroll, FadeScroll, GrowScroll, RevealScroll, TiltScroll, MoveScroll

## 🖱️ [Mouse Animations](mouse-animations.md) (12 presets)

Interactive pointer-driven effects that respond to mouse movement and hover states.

**Popular Presets**: TrackMouse, Tilt3DMouse, ScaleMouse, BlurMouse, SwivelMouse

## 🖼️ [Background Scroll Animations](background-scroll-animations.md) (12 presets)

Specialized effects designed specifically for background media elements and hero sections.

**Popular Presets**: BgParallax, BgZoom, BgFade, BgRotate, BgPan, BgCloseUp

---

## Quick Category Comparison

| Category   | Trigger          | Duration        | Use Case                  | Target Elements            |
| ---------- | ---------------- | --------------- | ------------------------- | -------------------------- |
| Entrance   | Viewport entry   | 300-1500ms      | Reveals, transitions      | Any element                |
| Ongoing    | Manual/Auto      | 1-4s (loop)     | Attention, ambiance       | Buttons, icons, decorative |
| Scroll     | Scroll position  | Based on scroll | Storytelling, parallax    | Content blocks, media      |
| Mouse      | Pointer movement | Real-time       | Interactivity, hover      | Interactive elements       |
| Background | Scroll position  | Based on scroll | Hero effects, backgrounds | Background media only      |

## Choosing the Right Category

### For Element Introductions

Use **Entrance animations** when you want to reveal content with impact:

- Page load animations
- Modal/popup appearances
- Content that appears after user actions
- Progressive disclosure patterns

### For Continuous Effects

Use **Ongoing animations** for elements that need constant attention:

- Call-to-action buttons
- Loading indicators
- Decorative elements
- Brand/logo emphasis

### For Scroll-Driven Storytelling

Use **Scroll animations** to create engaging scroll experiences:

- Article/blog content
- Product showcases
- Landing page narratives
- Progressive content reveals

### For Interactive Feedback

Use **Mouse animations** to enhance user interactions:

- Hover effects on cards/buttons
- Cursor-following elements
- 3D interactive components
- Gaming-style interfaces

### For Background Media

Use **Background scroll animations** for immersive backgrounds:

- Hero sections
- Full-screen videos/images
- Parallax landscapes
- Cinematic effects

## Common Patterns Across Categories

### Directional Controls

Many animations support directional parameters:

- **Four directions**: `top`, `right`, `bottom`, `left`
- **Eight directions**: Includes corners like `top-right`, `bottom-left`
- **Two sides**: `left`, `right` or `horizontal`, `vertical`
- **Angles**: Numeric degrees (0° = up, 90° = right, etc.)

### Easing Functions

All categories support both CSS and JavaScript easing:

- **CSS**: `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`
- **Advanced**: `backOut`, `elasticOut`, `bounceOut`
- **Custom**: Cubic bezier curves for precise control

## Performance Guidelines

### Category-Specific Performance Tips

#### Entrance Animations

- Batch multiple entrances with staggered delays
- Consider CSS mode for simple fades/slides

#### Ongoing Animations

- Limit concurrent ongoing animations
- Reduce intensity on mobile
- Prefer CSS animations for infinite loops

#### Scroll Animations

- Leverage ViewTimeline API when available
- Use `fastdom` for scroll-dependent measurements
- Throttle scroll events appropriately

#### Mouse Animations

- Use transform-only properties when possible
- Consider disabling on touch devices

#### Background Scroll

- Pre-measure container dimensions
- Use GPU-accelerated properties
- Optimize for large viewport sizes

---

**Ready to explore?** Click on any category above to see detailed guides with all available presets, configuration options, and usage examples.
