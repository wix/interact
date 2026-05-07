// Code Snippet Logic
// Define specific snippets for each interaction
const snippets = {
  hover: `[{
  trigger: 'hover',
  effects: [{
    keyframeEffect: {
      keyframes: [
        { transform: 'scale(1)', offset: 0 },
        { transform: 'scale(1.02)', offset: 1 }
      ]
    },
    duration: 400,
    easing: 'ease-out',
    fill: 'both'
  }]
}]`,
  click: `[{
  trigger: 'click',
  effects: [
    { 
      selector: '.fill-circle', 
      transition: { 
        duration: 500,
        easing: 'ease-out', 
        styleProperties: [{ name: 'transform', value: 'scale(1)' }] 
      } 
    },
    { 
      key: 'click-ripple-1',
      transition: { 
        duration: 800, 
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        styleProperties: [
          { name: 'opacity', value: '1' },
          { name: 'transform', value: 'scale(1.7)' }
        ] 
      } 
    }
  ]
}]`,
  entrance: `[{
  trigger: 'viewEnter',
  effects: [{
    triggerType: 'alternate',
    keyframeEffect: {
      name: 'slideFromLeft',
      keyframes: [
        { opacity: 0, transform: 'translate(-120px, -50px)' },
        { opacity: 1, transform: 'translate(0, -50px)' }
      ]
    },
    duration: 1000,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    fill: 'both'
  }]
}]`,
  mouseTrack: `[{
  trigger: 'pointerMove',
  params: { hitArea: 'self' },
  effects: [
    {
      key: 'card-target',
      namedEffect: {
        type: 'Tilt3DMouse',
        maxAngle: 25,
        perspective: 600
      }
    },
    {
      key: 'content-target',
      namedEffect: {
        type: 'Tilt3DMouse',
        maxAngle: 60,
        perspective: 300
      }
    }
  ]
}]`,
  scrollytelling: `[{
  trigger: 'viewProgress', 
  effects: [
    // 1. Vertical Spin
    {
        key: 'orbit-y',
        fill: 'both',
        // Updated range to cover full entry to exit
        rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
        rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
        keyframeEffect: {
            name: 'rotateY',
            keyframes: [
                { transform: 'rotateY(0deg)' },
                { transform: 'rotateY(360deg)' }
            ]
        }
    },
    // 2. Horizontal Spin
    {
        key: 'orbit-x',
        fill: 'both',
        rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
        rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
        keyframeEffect: {
            name: 'rotateX',
            keyframes: [
                // Added slight wobble to make rotation visible on flat plane
                { transform: 'rotateX(90deg) rotateZ(0deg)' },
                { transform: 'rotateX(90deg) rotateZ(360deg)' }
            ]
        }
    },
    // 3. Diagonal 1 (+45)
    {
        key: 'orbit-diag-1',
        fill: 'both',
        rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
        rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
        keyframeEffect: {
            name: 'rotateDiag1',
            keyframes: [
                { transform: 'rotateZ(45deg) rotateY(0deg)' },
                { transform: 'rotateZ(45deg) rotateY(360deg)' }
            ]
        }
    },
    // 4. Diagonal 2 (-45)
    {
        key: 'orbit-diag-2',
        fill: 'both',
        rangeStart: { name: 'entry', offset: { value: 0, unit: 'percentage' } },
        rangeEnd: { name: 'exit', offset: { value: 100, unit: 'percentage' } },
        keyframeEffect: {
            name: 'rotateDiag2',
            keyframes: [
                { transform: 'rotateZ(-45deg) rotateY(0deg)' },
                { transform: 'rotateZ(-45deg) rotateY(-360deg)' }
            ]
        }
    }
  ]         
}]`,
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Populate code blocks with plain text
  const displays = document.querySelectorAll('.codeDisplay');
  displays.forEach((d) => {
    const id = d.getAttribute('data-snippet');
    if (snippets[id]) {
      d.textContent = snippets[id];
      // Syntax highlight (highlight.js) after injecting text
      d.classList.add('language-javascript', 'whitespace-pre');
      if (window.hljs) window.hljs.highlightElement(d);
    }
  });

  // 2. Updated Copy Logic: Copies the specific code for the card
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Find the sibling code block
      const container = btn.closest('.group'); // Find parent container
      const codeElement = container.querySelector('.codeDisplay');

      if (codeElement) {
        const codeText = codeElement.textContent;

        // Create temp element to copy
        const textArea = document.createElement('textarea');
        textArea.value = codeText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          const textSpan = btn.querySelector('.copy-text');
          const originalText = textSpan.innerText;
          textSpan.innerText = 'COPIED!';
          setTimeout(() => {
            textSpan.innerText = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy', err);
        }
        document.body.removeChild(textArea);
      }
    });
  });
});
