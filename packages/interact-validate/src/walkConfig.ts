import type { Path, AnyConfig, Visitors } from './types';

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
