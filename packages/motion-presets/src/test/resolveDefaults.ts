type Animation = {
  custom?: Record<string, string | number | undefined>;
  keyframes: Record<string, unknown>[];
};

// undeclared custom properties resolve to the fallback their keyframes read them with
// cssAnimations - the same animations built for CSS, when `animations` were built for WAAPI (values inlined)
export function resolveDefaults<T extends Animation>(
  animations: T[],
  cssAnimations: Animation[] = animations,
): T[] {
  const text = JSON.stringify(cssAnimations.map(({ custom, keyframes }) => [custom, keyframes]));
  const fallbackOf = (name: string) => {
    const match = text.match(new RegExp(`var\\(${name.replace(/[-]/g, '\\-')},\\s*([^)]*?)\\)`));
    if (!match) {
      return undefined;
    }
    const value = match[1].trim();
    return /^-?\d*\.?\d+$/.test(value) ? Number(value) : value;
  };
  return animations.map((animation) => {
    if (!animation.custom) {
      return animation;
    }
    const custom = Object.fromEntries(
      Object.entries(animation.custom).map(([name, value]) => [name, value ?? fallbackOf(name)]),
    );
    return Object.assign(Object.create(Object.getPrototypeOf(animation)), animation, { custom });
  });
}
