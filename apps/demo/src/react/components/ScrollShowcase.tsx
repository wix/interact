import { useMemo } from 'react';
import type { InteractConfig } from '@wix/interact/react';
import { Interaction } from '@wix/interact/react';
import { useInteractInstance } from '../hooks/useInteractInstance';

const cards = [
  {
    key: 'scroll-card-1',
    title: 'View progress',
    description: 'Drive progress-based animation tied to scroll offsets.',
  },
  {
    key: 'scroll-card-2',
    title: 'List choreography',
    description: 'Chain staggered reveals with listContainer targeting.',
  },
  {
    key: 'scroll-card-3',
    title: 'Pointer reactivity',
    description: 'Blend pointer and scroll triggers for hybrid scenes.',
  },
];

export const ScrollShowcase = () => {
  const config = useMemo<InteractConfig>(() => {
    const interactions = cards.map((card, index) => ({
      key: card.key,
      trigger: 'viewProgress' as const,
      params: { type: 'repeat' as const, threshold: 0.4 },
      effects: [{ effectId: `scroll-effect-${index}` }],
    }));

    const effects = cards.reduce<InteractConfig['effects']>((acc, card, index) => {
      acc[`scroll-effect-${index}`] = {
        key: card.key,
        easing: 'linear',
        keyframeEffect: {
          name: `scroll-${index}`,
          keyframes: [
            { transform: 'translateY(40px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
          ],
        },
        rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
        rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
      };
      return acc;
    }, {});

    return { interactions, effects };
  }, []);

  useInteractInstance(config);

  return (
    <section className="panel">
      <p className="scroll-label">Scroll driven</p>
      <div className="scroll-scene">
        {cards.map((card) => (
          <Interaction tagName="div" interactKey={card.key} key={card.key} className="scroll-item">
            <p className="scroll-label">{card.title}</p>
            <strong>{card.description}</strong>
          </Interaction>
        ))}
      </div>
    </section>
  );
};
