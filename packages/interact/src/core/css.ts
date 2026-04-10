import { getSelectorCondition, applySelectorCondition } from '../utils';
import { Effect, InteractConfig, ViewEnterParams } from '../types';
import { getSelector } from './Interact';

const buildSelector = (
  key: string,
  effect: Effect,
  conditionSelector: string | undefined,
  useFirstChild: boolean,
): string => {
  const escapedKey = key.replace(/"/g, "'");

  let baseSelector = `[data-interact-key="${escapedKey}"]`;

  const elementSelector = getSelector(effect, { asCombinator: true, useFirstChild });

  if (elementSelector) {
    baseSelector = `${baseSelector} ${elementSelector}`;
  }

  if (conditionSelector) {
    baseSelector = applySelectorCondition(baseSelector, conditionSelector);
  }

  return baseSelector;
};

export function generate(_config: InteractConfig, useFirstChild: boolean = false): string {
  const css: string[] = [];
  const processedSelectors = new Set<string>();

  _config.interactions.forEach(
    ({
      key: interactionKey,
      selector: interactionSelector,
      listContainer: interactionListContainer,
      listItemSelector: interactionListItemSelector,
      trigger,
      params,
      effects,
      conditions: interactionConditions,
    }) => {
      const isViewEnter = trigger === 'viewEnter';
      if (isViewEnter) {
        const interactionParams = params as ViewEnterParams;
        const isOnce = !interactionParams?.type || interactionParams.type === 'once';

        if (isOnce) {
          effects?.forEach((effect) => {
            const effectData = effect?.effectId
              ? _config.effects[effect.effectId] || effect
              : effect;
            const {
              key: effectKey,
              selector: effectSelector,
              listContainer: effectListContainer,
              listItemSelector: effectListItemSelector,
              conditions: effectConditions,
            } = effectData;

            const sameKey = !effectKey || effectKey === interactionKey;
            if (!sameKey) return;

            const sameSelector =
              (!effectSelector && !interactionSelector) || effectSelector === interactionSelector;
            if (!sameSelector) return;

            const sameListcontainer =
              (!effectListContainer && !interactionListContainer) ||
              effectListContainer === interactionListContainer;
            if (!sameListcontainer) return;

            const sameListItemSelector =
              (!effectListItemSelector && !interactionListItemSelector) ||
              effectListItemSelector === interactionListItemSelector;
            if (!sameListItemSelector) return;

            const configConditions = _config.conditions || {};
            const effectConditionSelector = getSelectorCondition(
              effectConditions,
              configConditions,
            );
            const interactionConditionSelector = getSelectorCondition(
              interactionConditions,
              configConditions,
            );
            const sameConditionSelector =
              (!effectConditionSelector && !interactionConditionSelector) ||
              effectConditionSelector === interactionConditionSelector;
            if (!sameConditionSelector) return;

            const selector = buildSelector(
              interactionKey,
              effectData,
              interactionConditionSelector,
              useFirstChild,
            );

            if (!processedSelectors.has(selector)) {
              processedSelectors.add(selector);
              css.push(`@media (prefers-reduced-motion: no-preference) {
              ${selector}:not([data-interact-enter]) {
                visibility: hidden;
                transform: none;
                translate: none;
                scale: none;
                rotate: none;
              }
            }`);
            }
          });
        }
      }
    },
  );

  return css.join('\n');
}
