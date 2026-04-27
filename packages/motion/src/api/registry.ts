import type { EffectModule } from '../types';

const registry: Record<string, EffectModule> = {};

export function registerEffects(effects: Record<string, EffectModule>) {
  Object.assign(registry, effects);
}

export function getRegisteredEffect(name: string) {
  if (name in registry) {
    return registry[name];
  } else {
    console.warn(
      `${name} not found in registry. Please make sure to import and register the preset.`,
    );
    return null;
  }
}
