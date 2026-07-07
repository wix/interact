import type { Path, SemanticIssue } from '../errors';
import type { AnyEffect, AnyInteraction } from '../types';

// listItemSelector without listContainer (interaction or effect)
export function checkListItemSelectorWithoutContainer(
  path: Path,
  node: { listContainer?: string; listItemSelector?: string },
): SemanticIssue[] {
  if (node.listItemSelector !== undefined && node.listContainer === undefined) {
    return [
      {
        code: 'custom',
        params: { domainCode: 'LIST_ITEM_SELECTOR_WITHOUT_CONTAINER' },
        path: [...path, 'listItemSelector'],
        message:
          '`listItemSelector` is ignored without `listContainer`; add a `listContainer` or remove `listItemSelector`.',
      },
    ];
  }
  return [];
}

// selector ignored when listContainer + listItemSelector are present
export function checkRedundantSelector(
  path: Path,
  node: { listContainer?: string; listItemSelector?: string; selector?: string },
): SemanticIssue[] {
  if (
    node.listContainer !== undefined &&
    node.listItemSelector !== undefined &&
    node.selector !== undefined
  ) {
    return [
      {
        code: 'custom',
        params: { domainCode: 'REDUNDANT_SELECTOR_WITH_LIST_ITEM' },
        path: [...path, 'selector'],
        message:
          '`selector` is ignored when both `listContainer` and `listItemSelector` are present (element resolution uses the list path).',
      },
    ];
  }
  return [];
}

// pointerMove `axis` ignored by namedEffect/customEffect
export function checkPointerAxisIgnored(
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): SemanticIssue[] {
  if (!owner || owner.trigger !== 'pointerMove' || owner.params?.axis === undefined) return [];
  if (
    effect.namedEffect !== undefined ||
    (effect as { customEffect?: unknown }).customEffect !== undefined
  ) {
    return [
      {
        code: 'custom',
        params: { domainCode: 'POINTER_AXIS_IGNORED' },
        path: [...path],
        message:
          'pointerMove `params.axis` is ignored for `namedEffect`/`customEffect` (both axes are available); it only applies to `keyframeEffect`.',
      },
    ];
  }
  return [];
}
