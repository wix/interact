// Modal Logic
const modal = document.getElementById('code-modal');
const modalCode = document.getElementById('modal-code');

const codeSnippets = {
  spread: `const mobileEasing = 'cubic-bezier(0.25, 1, 0.5, 1)';
...
...
const config = {
  interactions: [
    {
      key: 'spread-section',
      trigger: 'viewProgress',
      effects: [
        {
          key: 'spread-card-0',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'stayCenter',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(-50%, -50%) scale(1.3)' },
            ],
          },
        },
        {
          key: 'spread-card-1',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadLeftInner',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% - 16vw), -50%) scale(1.15)' },
            ],
          },
        },
        {
          key: 'spread-card-2',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadRightInner',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% + 16vw), -50%) scale(1.15)' },
            ],
          },
        },
        {
          key: 'spread-card-3',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadLeftOuter',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% - 32vw), -50%) scale(0.9)' },
            ],
          },
        },
        {
          key: 'spread-card-4',
          conditions: ['Desktop'],
          fill: 'both',
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'spreadRightOuter',
            keyframes: [
              { transform: 'translate(-50%, -50%) scale(1)' },
              { transform: 'translate(calc(-50% + 32vw), -50%) scale(0.9)' },
            ],
          },
        },
        {
          key: 'spread-card-0',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 25, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-0-scaleDown',
            keyframes: [
              { transform: 'translateX(-50%) translateY(0) scale(1)' },
              { transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-1',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 0, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 40, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-1-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-2',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 20, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 60, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-2-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-3',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 40, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 80, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-3-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
        {
          key: 'spread-card-4',
          conditions: ['Mobile'],
          fill: 'both',
          easing: mobileEasing,
          rangeStart: { name: 'contain', offset: { value: 60, unit: 'percentage' } },
          rangeEnd: { name: 'contain', offset: { value: 100, unit: 'percentage' } },
          keyframeEffect: {
            name: 'card-4-slideUp-scaleDown',
            keyframes: [
              { offset: 0, transform: 'translateX(-50%) translateY(100vh) scale(1)' },
              { offset: 0.5, transform: 'translateX(-50%) translateY(0) scale(1)' },
              { offset: 1, transform: 'translateX(-50%) translateY(0) scale(0.85)' },
            ],
          },
        },
      ],
    },
  ],
};
...
...
Interact.create(config);
 `,
};

function openModal(type) {
  modalCode.textContent = codeSnippets[type];
  // Syntax highlight (highlight.js) after injecting text
  modalCode.classList.add('language-javascript');
  if (window.hljs) window.hljs.highlightElement(modalCode);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Export for global access
window.openModal = openModal;
window.closeModal = closeModal;
