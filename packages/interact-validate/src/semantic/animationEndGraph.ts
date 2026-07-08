import type { SemanticIssue, AnyConfig } from '../types';

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

export function findAnimationEndWarnings(config: AnyConfig): SemanticIssue[] {
  const { cycles, selfRefs } = analyzeAnimationEndGraph(config);
  const issues: SemanticIssue[] = [];
  cycles.forEach((cycle) => {
    cycle.forEach((i) => {
      issues.push({
        code: 'custom',
        params: { domainCode: 'ANIMATION_END_CYCLE' },
        path: ['interactions', i, 'params', 'effectId'],
        message: `animationEnd dependency cycle detected (interactions ${cycle.join(' → ')} → ${cycle[0]}); these effects wait on each other and can never start.`,
      });
    });
  });
  selfRefs.forEach((i) => {
    issues.push({
      code: 'custom',
      params: { domainCode: 'ANIMATION_END_SELF_REFERENCE' },
      path: ['interactions', i, 'params', 'effectId'],
      message: `animationEnd interaction waits for effect "${config.interactions[i]?.params?.effectId}" which it also produces; it can never start. Wait on an effect produced by a different interaction.`,
    });
  });
  return issues;
}
