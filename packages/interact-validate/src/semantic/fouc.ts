import type { Path, SemanticIssue } from '../errors';
import type { AnyEffect, AnySequence, AnyInteraction } from '../types';
import { RETRIGGER_TYPES } from '../types';

// Mirrors the documented Element-Resolution priority (full-lean.md "Element
// Resolution"): the effect targets the source element when it does NOT introduce
// its own distinct target — `effect.key` is absent or equal to the interaction's
// `key`, and the effect adds no `selector` / `listContainer` / `listItemSelector`
// that the source doesn't already have. When in doubt, returns `false` to avoid
// false positives (e.g. registry effects with no owning interaction).

const DISCRETE_TRIGGERS = ['hover', 'click', 'interest', 'activate'];
const HIT_AREA_TRANSFORM = /(translate|scale|matrix)/;

function targetsSameElementAsSource(owner: AnyInteraction, effect: AnyEffect): boolean {
  if (effect.key !== undefined && effect.key !== owner.key) return false;
  const refiners = ['selector', 'listContainer', 'listItemSelector'] as const;
  for (const field of refiners) {
    if ((effect[field] || owner[field]) && effect[field] !== owner[field]) return false;
  }
  return true;
}

// viewEnter same source+target with a re-triggering type (effect or sequence)
export function checkSameElementRetrigger(
  path: Path,
  item: AnyEffect | AnySequence,
  owner?: AnyInteraction,
): SemanticIssue[] {
  if (!owner || owner.trigger !== 'viewEnter') return [];
  if (!item.triggerType || !RETRIGGER_TYPES.includes(item.triggerType)) return [];
  const items = (item as AnySequence).effects || [item];
  if (items.some((i: AnyEffect) => targetsSameElementAsSource(owner, i))) {
    return [
      {
        code: 'custom',
        params: { domainCode: 'SAME_ELEMENT_RETRIGGER' },
        path: [...path, 'triggerType'],
        message: `viewEnter with triggerType '${item.triggerType}' must use a separate source/target element; same-element observation causes re-trigger loops. Use a different \`key\`/\`selector\` or \`triggerType: 'once'\`.`,
      },
    ];
  }
  return [];
}

// hover/pointerMove same source+target with size/position transforms
export function checkHitAreaShift(
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): SemanticIssue[] {
  if (!owner) return [];
  const isDiscrete = DISCRETE_TRIGGERS.includes(owner.trigger ?? '');
  const isPointer = owner.trigger === 'pointerMove';
  if (!isDiscrete && !isPointer) return [];
  // `hitArea: 'root'` tracks the viewport, so a transform on the source cannot
  // shift the hit area. Default (`'self'`) and explicit `'self'` are at risk.
  if (isPointer && owner.params?.hitArea === 'root') return [];
  if (!targetsSameElementAsSource(owner, effect)) return [];
  const keyframes = effect.keyframeEffect?.keyframes;
  if (!Array.isArray(keyframes)) return [];
  const shifts = keyframes.some(
    (frame) =>
      typeof frame?.transform === 'string' && HIT_AREA_TRANSFORM.test(frame.transform as string),
  );
  if (!shifts) return [];
  return [
    {
      code: 'custom',
      params: { domainCode: 'HIT_AREA_SHIFT' },
      path: [...path],
      message: `${owner.trigger} effect changes size/position (transform) on the same element used as the source; the shifting hit area causes jittery re-entry. Target a child via \`selector\` or set a different \`key\`.`,
    },
  ];
}
