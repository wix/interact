import type { Path, SemanticIssue, AnyEffect, AnyInteraction } from '../types';

// Property names may be authored in camelCase (`backgroundColor`) or kebab-case
// (`background-color`) - Interact normalizes either form to what the consuming
// API needs. What cannot be normalized is a name that is neither, e.g.
// `background-Color` or `BackgroundColor`. CSS custom properties (`--*`) are
// case-sensitive and used verbatim.
const INSET_TOKEN = /^(auto|[+-]?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]{1,5})?)$/i;
const CAMEL_CASE_PROPERTY = /^[a-z][a-zA-Z0-9]*$/;
const KEBAB_CASE_PROPERTY = /^-?[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// WAAPI keyframe keys that are not CSS property names
const KEYFRAME_KEYWORDS = ['offset', 'easing', 'composite'];

function isNormalizableProperty(name: string): boolean {
  return name.startsWith('--') || CAMEL_CASE_PROPERTY.test(name) || KEBAB_CASE_PROPERTY.test(name);
}

function invalidPropertyName(path: Path, name: string): SemanticIssue {
  return {
    code: 'custom',
    params: { domainCode: 'INVALID_CSS_PROPERTY_NAME' },
    path,
    message: `CSS property '${name}' is neither camelCase (\`backgroundColor\`) nor kebab-case (\`background-color\`); both forms are accepted, this one is not.`,
  };
}

// keyframe and state-effect property names must be resolvable to a CSS property
export function checkCSSPropertyNames(path: Path, effect: AnyEffect): SemanticIssue[] {
  const result: SemanticIssue[] = [];
  const keyframes = effect.keyframeEffect?.keyframes;

  if (Array.isArray(keyframes)) {
    keyframes.forEach((frame, ki) => {
      if (!frame || typeof frame !== 'object') return;
      Object.keys(frame).forEach((prop) => {
        if (KEYFRAME_KEYWORDS.includes(prop) || isNormalizableProperty(prop)) return;
        result.push(invalidPropertyName([...path, 'keyframeEffect', 'keyframes', ki, prop], prop));
      });
    });
  }

  const stateProperties: [Path, unknown][] = [
    [[...path, 'transition', 'styleProperties'], effect.transition?.styleProperties],
    [[...path, 'transitionProperties'], effect.transitionProperties],
  ];

  stateProperties.forEach(([propertiesPath, properties]) => {
    if (!Array.isArray(properties)) return;
    properties.forEach((property, pi) => {
      const name = (property as { name?: unknown })?.name;
      if (typeof name !== 'string' || isNormalizableProperty(name)) return;
      result.push(invalidPropertyName([...propertiesPath, pi, 'name'], name));
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
