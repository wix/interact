import type { Path, SemanticIssue, AnyEffect, AnyInteraction } from '../types';

// camelCase guidance: a keyframe property containing `-` is invalid for WAAPI
// (e.g. `background-color`). CSS custom properties (`--*`) are allowed as-is.
const INSET_TOKEN = /^(auto|[+-]?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]{1,5})?)$/i;

function kebabToCamel(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// keyframe property names must be camelCase (WAAPI)
export function checkKeyframePropCamelCase(path: Path, effect: AnyEffect): SemanticIssue[] {
  const keyframes = effect.keyframeEffect?.keyframes;
  if (!Array.isArray(keyframes)) return [];
  const result: SemanticIssue[] = [];
  keyframes.forEach((frame, ki) => {
    if (!frame || typeof frame !== 'object') return;
    Object.keys(frame).forEach((prop) => {
      if (!prop.startsWith('--') && prop.includes('-')) {
        result.push({
          code: 'custom',
          params: { domainCode: 'KEYFRAME_PROP_NOT_CAMEL_CASE' },
          path: [...path, 'keyframeEffect', 'keyframes', ki, prop],
          message: `Keyframe property '${prop}' must be camelCase for WAAPI; use '${kebabToCamel(prop)}'.`,
        });
      }
    });
  });
  return result;
}

// viewEnter `inset` must be 1–4 CSS lengths/percentages
export function checkInvalidInset(path: Path, interaction: AnyInteraction): SemanticIssue[] {
  const inset = interaction.params?.inset;
  if (typeof inset !== 'string') return [];
  const tokens = inset.trim().split(/\s+/).filter(Boolean);
  const ok = tokens.length >= 1 && tokens.length <= 4 && tokens.every((t) => INSET_TOKEN.test(t));
  return ok
    ? []
    : [
        {
          code: 'custom',
          params: { domainCode: 'INVALID_INSET' },
          path: [...path, 'params', 'inset'],
          message: `\`inset\` should be 1–4 whitespace-separated CSS lengths/percentages (like view-timeline-inset); got ${JSON.stringify(inset)}.`,
        },
      ];
}
