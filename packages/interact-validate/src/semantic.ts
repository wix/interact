// Static semantic checks derived from the documented constraints in
// `packages/interact/rules/*.md`. These run with no DOM and no runtime — they
// inspect the parsed config shape only. Warning/info checks are collected by
// `collectSemanticWarnings` (consumed by the schema `transform`); the single
// error-level graph check (animationEnd deadlock) is exposed via
// `findAnimationEndCycles` (consumed by the schema `superRefine`).

export type Path = (string | number)[];

export type SemanticIssue = {
  code: 'custom';
  path: Path;
  message: string;
  params: { domainCode: string };
};

type AnyEffect = {
  key?: string;
  effectId?: string;
  selector?: string;
  listContainer?: string;
  listItemSelector?: string;
  triggerType?: string;
  stateAction?: string;
  fill?: string;
  namedEffect?: { type?: string; range?: unknown; [k: string]: unknown };
  keyframeEffect?: { name?: string; keyframes?: Array<Record<string, unknown>> };
  transition?: { styleProperties?: unknown[] };
  transitionProperties?: unknown[];
  rangeStart?: { offset?: { value?: number; unit?: string } };
  rangeEnd?: { offset?: { value?: number; unit?: string } };
  conditions?: string[];
};

type AnySequence = {
  triggerType?: string;
  sequenceId?: string;
  effects?: AnyEffect[];
  conditions?: string[];
};

type AnyInteraction = {
  key?: string;
  trigger?: string;
  selector?: string;
  listContainer?: string;
  listItemSelector?: string;
  params?: { hitArea?: string; axis?: string; inset?: string; effectId?: string };
  effects?: AnyEffect[];
  sequences?: AnySequence[];
  conditions?: string[];
};

type AnyConfig = {
  effects?: Record<string, AnyEffect>;
  sequences?: Record<string, AnySequence>;
  interactions: AnyInteraction[];
};

type Visitors = {
  onInteraction?: (path: Path, interaction: AnyInteraction) => void;
  // `owner` is the parent interaction (carrying trigger/key/selector/params), or
  // `undefined` for top-level registry effects/sequences whose trigger context is
  // unknown until their reference site. Trigger-aware checks skip `owner === undefined`.
  onEffect: (path: Path, effect: AnyEffect, isTopLevel: boolean, owner?: AnyInteraction) => void;
  onSequence: (
    path: Path,
    sequence: AnySequence,
    isTopLevel: boolean,
    owner?: AnyInteraction,
  ) => void;
};

// Single traversal of top-level registry effects/sequences and per-interaction
// effects/sequences, supplying each node's `path`, whether it is a top-level
// registry definition, and its owning interaction (when known).
export function walkConfig(config: AnyConfig, visitors: Visitors): void {
  const { onInteraction, onEffect, onSequence } = visitors;

  Object.entries(config.effects ?? {}).forEach(([id, effect]) => {
    onEffect(['effects', id], effect, true, undefined);
  });

  Object.entries(config.sequences ?? {}).forEach(([id, sequence]) => {
    onSequence(['sequences', id], sequence, true, undefined);
    sequence.effects?.forEach((effect, ei) => {
      onEffect(['sequences', id, 'effects', ei], effect, false, undefined);
    });
  });

  config.interactions.forEach((interaction, i) => {
    onInteraction?.(['interactions', i], interaction);
    interaction.effects?.forEach((effect, ei) => {
      onEffect(['interactions', i, 'effects', ei], effect, false, interaction);
    });
    interaction.sequences?.forEach((sequence, si) => {
      const seqPath: Path = ['interactions', i, 'sequences', si];
      onSequence(seqPath, sequence, false, interaction);
      sequence.effects?.forEach((effect, ei) => {
        onEffect([...seqPath, 'effects', ei], effect, false, interaction);
      });
    });
  });
}

// Mirrors the documented Element-Resolution priority (full-lean.md "Element
// Resolution"): the effect targets the source element when it does NOT introduce
// its own distinct target — `effect.key` is absent or equal to the interaction's
// `key`, and the effect adds no `selector` / `listContainer` / `listItemSelector`
// that the source doesn't already have. When in doubt, returns `false` to avoid
// false positives (e.g. registry effects with no owning interaction).
export function targetsSameElementAsSource(
  owner: AnyInteraction | undefined,
  effect: AnyEffect,
): boolean {
  if (!owner) return false;
  if (effect.key !== undefined && effect.key !== owner.key) return false;
  const refiners = ['selector', 'listContainer', 'listItemSelector'] as const;
  for (const field of refiners) {
    const effectValue = effect[field];
    if (effectValue !== undefined && effectValue !== owner[field]) return false;
  }
  return true;
}

// Scroll presets (the `*Scroll` motion-presets) all end with `Scroll`; no other
// preset category does. Used to flag a missing/invalid `range` on `viewProgress`.
export function isScrollPresetType(type: unknown): boolean {
  return typeof type === 'string' && /Scroll$/.test(type);
}

const SCROLL_RANGE_VALUES = ['in', 'out', 'continuous'];
const RETRIGGER_TYPES = ['repeat', 'alternate', 'state'];
const DISCRETE_TRIGGERS = ['hover', 'click', 'interest', 'activate'];
const HIT_AREA_TRANSFORM = /(translate|scale|matrix)/;
// camelCase guidance: a keyframe property containing `-` is invalid for WAAPI
// (e.g. `background-color`). CSS custom properties (`--*`) are allowed as-is.
const INSET_TOKEN = /^(auto|[+-]?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]{1,5})?)$/i;

function kebabToCamel(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

type Push = (domainCode: string, path: Path, message: string) => void;

// --- A1: viewEnter same source+target with a re-triggering type ---
function checkSameElementRetrigger(
  push: Push,
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): void {
  if (!owner || owner.trigger !== 'viewEnter') return;
  if (!effect.triggerType || !RETRIGGER_TYPES.includes(effect.triggerType)) return;
  if (!targetsSameElementAsSource(owner, effect)) return;
  push(
    'SAME_ELEMENT_RETRIGGER',
    [...path, 'triggerType'],
    `viewEnter with triggerType '${effect.triggerType}' must use a separate source/target element; same-element observation causes re-trigger loops. Use a different \`key\`/\`selector\` or \`triggerType: 'once'\`.`,
  );
}

function checkSequenceRetrigger(
  push: Push,
  path: Path,
  sequence: AnySequence,
  owner?: AnyInteraction,
): void {
  if (!owner || owner.trigger !== 'viewEnter') return;
  if (!sequence.triggerType || !RETRIGGER_TYPES.includes(sequence.triggerType)) return;
  const targetsSource = (sequence.effects ?? []).some((e) => targetsSameElementAsSource(owner, e));
  if (!targetsSource) return;
  push(
    'SAME_ELEMENT_RETRIGGER',
    [...path, 'triggerType'],
    `viewEnter sequence with triggerType '${sequence.triggerType}' targets the source element; same-element observation causes re-trigger loops. Use a separate target element or \`triggerType: 'once'\`.`,
  );
}

// --- A2: hover/pointerMove same source+target with size/position transforms ---
function checkHitAreaShift(
  push: Push,
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): void {
  if (!owner) return;
  const isDiscrete = DISCRETE_TRIGGERS.includes(owner.trigger ?? '');
  const isPointer = owner.trigger === 'pointerMove';
  if (!isDiscrete && !isPointer) return;
  // `hitArea: 'root'` tracks the viewport, so a transform on the source cannot
  // shift the hit area. Default (`'self'`) and explicit `'self'` are at risk.
  if (isPointer && owner.params?.hitArea === 'root') return;
  if (!targetsSameElementAsSource(owner, effect)) return;
  const keyframes = effect.keyframeEffect?.keyframes;
  if (!Array.isArray(keyframes)) return;
  const shifts = keyframes.some(
    (frame) =>
      typeof frame?.transform === 'string' && HIT_AREA_TRANSFORM.test(frame.transform as string),
  );
  if (!shifts) return;
  push(
    'HIT_AREA_SHIFT',
    [...path],
    `${owner.trigger} effect changes size/position (transform) on the same element used as the source; the shifting hit area causes jittery re-entry. Target a child via \`selector\` or set a different \`key\`.`,
  );
}

// --- A3: `*Scroll` namedEffect on viewProgress without a valid `range` ---
function checkScrollPresetRange(
  push: Push,
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): void {
  if (!owner || owner.trigger !== 'viewProgress') return;
  const named = effect.namedEffect;
  if (!named || !isScrollPresetType(named.type)) return;
  if (named.range === undefined) {
    push(
      'SCROLL_PRESET_MISSING_RANGE',
      [...path, 'namedEffect', 'range'],
      `Scroll preset '${named.type}' on viewProgress requires \`range: 'in' | 'out' | 'continuous'\` (prefer 'continuous').`,
    );
  } else if (typeof named.range !== 'string' || !SCROLL_RANGE_VALUES.includes(named.range)) {
    push(
      'SCROLL_PRESET_BAD_RANGE',
      [...path, 'namedEffect', 'range'],
      `Scroll preset \`range\` must be 'in', 'out', or 'continuous' (prefer 'continuous'); got ${JSON.stringify(named.range)}.`,
    );
  }
}

// --- C6: listItemSelector without listContainer (interaction or effect) ---
function checkListItemSelectorWithoutContainer(
  push: Push,
  path: Path,
  node: { listContainer?: string; listItemSelector?: string },
): void {
  if (node.listItemSelector !== undefined && node.listContainer === undefined) {
    push(
      'LIST_ITEM_SELECTOR_WITHOUT_CONTAINER',
      [...path, 'listItemSelector'],
      '`listItemSelector` is inert without `listContainer`; add a `listContainer` or remove `listItemSelector`.',
    );
  }
}

// --- C7: selector ignored when listContainer + listItemSelector are present ---
function checkRedundantSelector(
  push: Push,
  path: Path,
  node: { listContainer?: string; listItemSelector?: string; selector?: string },
): void {
  if (
    node.listContainer !== undefined &&
    node.listItemSelector !== undefined &&
    node.selector !== undefined
  ) {
    push(
      'REDUNDANT_SELECTOR_WITH_LIST_ITEM',
      [...path, 'selector'],
      '`selector` is ignored when both `listContainer` and `listItemSelector` are present (element resolution uses the list path).',
    );
  }
}

// --- C8: state effect that toggles nothing (empty style arrays) ---
function checkEmptyStyleProperties(push: Push, path: Path, effect: AnyEffect): void {
  if (
    Array.isArray(effect.transition?.styleProperties) &&
    effect.transition.styleProperties.length === 0
  ) {
    push(
      'EMPTY_STYLE_PROPERTIES',
      [...path, 'transition', 'styleProperties'],
      '`transition.styleProperties` is empty; this state effect toggles nothing.',
    );
  }
  if (Array.isArray(effect.transitionProperties) && effect.transitionProperties.length === 0) {
    push(
      'EMPTY_STYLE_PROPERTIES',
      [...path, 'transitionProperties'],
      '`transitionProperties` is empty; this state effect toggles nothing.',
    );
  }
}

// --- C9: stateAction 'remove' with no effectId to pair with ---
function checkStateRemoveWithoutEffectId(push: Push, path: Path, effect: AnyEffect): void {
  if (effect.stateAction === 'remove' && effect.effectId === undefined) {
    push(
      'STATE_REMOVE_WITHOUT_EFFECT_ID',
      [...path, 'stateAction'],
      "stateAction 'remove' has no `effectId` to pair with a matching 'add'; the removal has nothing to target.",
    );
  }
}

// --- D10: recommended `fill: 'both'` for scrubbed and toggling effects ---
function checkRecommendedFill(
  push: Push,
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): void {
  if (effect.fill === 'both') return;
  const isScrubbed = owner?.trigger === 'viewProgress' || owner?.trigger === 'pointerMove';
  const isToggling =
    effect.triggerType !== undefined && RETRIGGER_TYPES.includes(effect.triggerType);
  if (!isScrubbed && !isToggling) return;
  const reason = isScrubbed
    ? `${owner?.trigger} (scrubbed) effects`
    : `triggerType '${effect.triggerType}' effects`;
  push(
    'RECOMMENDED_FILL_BOTH',
    [...path, 'fill'],
    `Include \`fill: 'both'\` for ${reason} so the effect stays applied and is not garbage-collected.`,
  );
}

// --- D12: pointerMove `axis` ignored by namedEffect/customEffect ---
function checkPointerAxisIgnored(
  push: Push,
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): void {
  if (!owner || owner.trigger !== 'pointerMove' || owner.params?.axis === undefined) return;
  if (
    effect.namedEffect !== undefined ||
    (effect as { customEffect?: unknown }).customEffect !== undefined
  ) {
    push(
      'POINTER_AXIS_IGNORED',
      [...path],
      'pointerMove `params.axis` is ignored for `namedEffect`/`customEffect` (both axes are available); it only applies to `keyframeEffect`.',
    );
  }
}

// --- D13: percentage RangeOffset value outside 0–100 ---
function checkRangeOffsetOutOfRange(push: Push, path: Path, effect: AnyEffect): void {
  (['rangeStart', 'rangeEnd'] as const).forEach((field) => {
    const offset = effect[field]?.offset;
    if (
      offset &&
      offset.unit === 'percentage' &&
      typeof offset.value === 'number' &&
      (offset.value < 0 || offset.value > 100)
    ) {
      push(
        'RANGE_OFFSET_OUT_OF_RANGE',
        [...path, field, 'offset', 'value'],
        `Percentage \`${field}.offset.value\` should be within 0–100; got ${offset.value}.`,
      );
    }
  });
}

// --- D14: keyframe property names must be camelCase (WAAPI) ---
function checkKeyframePropCamelCase(push: Push, path: Path, effect: AnyEffect): void {
  const keyframes = effect.keyframeEffect?.keyframes;
  if (!Array.isArray(keyframes)) return;
  keyframes.forEach((frame, ki) => {
    if (!frame || typeof frame !== 'object') return;
    Object.keys(frame).forEach((prop) => {
      if (prop.startsWith('--') || !prop.includes('-')) return;
      push(
        'KEYFRAME_PROP_NOT_CAMEL_CASE',
        [...path, 'keyframeEffect', 'keyframes', ki, prop],
        `Keyframe property '${prop}' must be camelCase for WAAPI; use '${kebabToCamel(prop)}'.`,
      );
    });
  });
}

// --- D15: viewEnter `inset` must be 1–4 CSS lengths/percentages ---
function checkInvalidInset(push: Push, path: Path, interaction: AnyInteraction): void {
  const inset = interaction.params?.inset;
  if (typeof inset !== 'string') return;
  const tokens = inset.trim().split(/\s+/).filter(Boolean);
  const ok = tokens.length >= 1 && tokens.length <= 4 && tokens.every((t) => INSET_TOKEN.test(t));
  if (!ok) {
    push(
      'INVALID_INSET',
      [...path, 'params', 'inset'],
      `\`inset\` should be 1–4 whitespace-separated CSS lengths/percentages (like view-timeline-inset); got ${JSON.stringify(inset)}.`,
    );
  }
}

// Build the animationEnd waits-for graph and find self-references and cycles.
// An animationEnd interaction A "waits-for" the effect named by `params.effectId`;
// any interaction that lists an effect with that `effectId` "produces" it. A cannot
// start until every producer of its awaited effect has completed.
function analyzeAnimationEndGraph(config: AnyConfig): {
  selfRefs: number[];
  cycles: number[][];
} {
  const interactions = config.interactions ?? [];

  // effectId -> indices of interactions that produce (run) that effect
  const producers = new Map<string, number[]>();
  interactions.forEach((interaction, i) => {
    interaction.effects?.forEach((effect) => {
      if (effect.effectId) {
        const list = producers.get(effect.effectId) ?? [];
        list.push(i);
        producers.set(effect.effectId, list);
      }
    });
  });

  const selfRefs: number[] = [];
  // adjacency: animationEnd interaction index -> producers it waits for
  const waitsFor = new Map<number, number[]>();
  interactions.forEach((interaction, i) => {
    if (interaction.trigger !== 'animationEnd') return;
    const awaited = interaction.params?.effectId;
    if (!awaited) return;
    const producerIndices = producers.get(awaited) ?? [];
    if (producerIndices.includes(i)) selfRefs.push(i);
    waitsFor.set(
      i,
      producerIndices.filter((p) => p !== i),
    );
  });

  // Detect cycles of length >= 2 via DFS with a recursion stack.
  const cycles: number[][] = [];
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<number, number>();
  const stack: number[] = [];
  const seenCycles = new Set<string>();

  const visit = (node: number): void => {
    color.set(node, GRAY);
    stack.push(node);
    for (const next of waitsFor.get(node) ?? []) {
      const c = color.get(next) ?? WHITE;
      if (c === GRAY) {
        // back-edge → cycle from `next` to current top of stack
        const start = stack.indexOf(next);
        if (start !== -1) {
          const cycle = stack.slice(start);
          const fingerprint = [...cycle].sort((a, b) => a - b).join(',');
          if (!seenCycles.has(fingerprint)) {
            seenCycles.add(fingerprint);
            cycles.push(cycle);
          }
        }
      } else if (c === WHITE && waitsFor.has(next)) {
        visit(next);
      }
    }
    stack.pop();
    color.set(node, BLACK);
  };

  for (const node of waitsFor.keys()) {
    if ((color.get(node) ?? WHITE) === WHITE) visit(node);
  }

  return { selfRefs, cycles };
}

// Error-level graph check (consumed by `superRefine`): each interaction in a
// waits-for cycle can never start (deadlock). Anchored at each cycle member's
// `params.effectId`.
export function findAnimationEndCycles(config: AnyConfig): Array<{ path: Path; message: string }> {
  const { cycles } = analyzeAnimationEndGraph(config);
  const issues: Array<{ path: Path; message: string }> = [];
  cycles.forEach((cycle) => {
    cycle.forEach((i) => {
      issues.push({
        path: ['interactions', i, 'params', 'effectId'],
        message: `animationEnd dependency cycle detected (interactions ${cycle.join(' → ')} → ${cycle[0]}); these effects wait on each other and can never start.`,
      });
    });
  });
  return issues;
}

// Collect every warning/info-level semantic issue (consumed by `transform`).
export function collectSemanticWarnings(config: AnyConfig): SemanticIssue[] {
  const warnings: SemanticIssue[] = [];
  const push: Push = (domainCode, path, message) =>
    warnings.push({ code: 'custom', path, message, params: { domainCode } });

  // B4 (warning side): animationEnd self-reference.
  const { selfRefs } = analyzeAnimationEndGraph(config);
  selfRefs.forEach((i) => {
    const awaited = config.interactions[i]?.params?.effectId;
    push(
      'ANIMATION_END_SELF_REFERENCE',
      ['interactions', i, 'params', 'effectId'],
      `animationEnd interaction waits for effect "${awaited}" which it also produces; it can never start. Wait on an effect produced by a different interaction.`,
    );
  });

  walkConfig(config, {
    onInteraction: (path, interaction) => {
      checkListItemSelectorWithoutContainer(push, path, interaction);
      checkRedundantSelector(push, path, interaction);
      checkInvalidInset(push, path, interaction);
    },
    onEffect: (path, effect, _isTopLevel, owner) => {
      checkSameElementRetrigger(push, path, effect, owner);
      checkHitAreaShift(push, path, effect, owner);
      checkScrollPresetRange(push, path, effect, owner);
      checkListItemSelectorWithoutContainer(push, path, effect);
      checkRedundantSelector(push, path, effect);
      checkEmptyStyleProperties(push, path, effect);
      checkStateRemoveWithoutEffectId(push, path, effect);
      checkRecommendedFill(push, path, effect, owner);
      checkPointerAxisIgnored(push, path, effect, owner);
      checkRangeOffsetOutOfRange(push, path, effect);
      checkKeyframePropCamelCase(push, path, effect);
    },
    onSequence: (path, sequence, _isTopLevel, owner) => {
      checkSequenceRetrigger(push, path, sequence, owner);
    },
  });

  return warnings;
}
