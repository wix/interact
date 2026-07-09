import { Interact, generate } from '@wix/interact/web';
import { FadeIn } from '@wix/motion-presets';

Interact.registerEffects({ FadeIn });

/** Product data — config is built at runtime from this array, not a static literal. */
const products = [
  { id: 'alpha', title: 'Alpha', description: 'First product.' },
  { id: 'beta', title: 'Beta', description: 'Second product.' },
  { id: 'gamma', title: 'Gamma', description: 'Third product.' },
];

function buildConfig(items) {
  const effects = {};
  const interactions = items.map((item) => {
    const effectId = `${item.id}-in`;
    effects[effectId] = {
      duration: 600,
      easing: 'ease-out',
      namedEffect: { type: 'FadeIn' },
      triggerType: 'once',
    };
    return {
      key: item.id,
      trigger: 'viewEnter',
      effects: [{ effectId }],
    };
  });
  return { interactions, effects };
}

const config = buildConfig(products);

const grid = document.getElementById('card-grid');
for (const item of products) {
  const wrapper = document.createElement('interact-element');
  wrapper.setAttribute('data-interact-key', item.id);
  wrapper.innerHTML = `
    <article class="card">
      <h2>${item.title}</h2>
      <p>${item.description}</p>
    </article>
  `;
  grid.appendChild(wrapper);
}

const style = document.createElement('style');
style.textContent = generate(config, true);
document.head.appendChild(style);

Interact.create(config);
