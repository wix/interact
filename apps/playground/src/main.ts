// CSS layers — import order matters
import './styles/layers.css';
import './styles/base.css';
import './styles/theme.css';
import './styles/layout.css';
import './styles/controls.css';
import './styles/utilities.css';
import './styles/states.css';

// Shared controls
import './components/shared/pg-select';
import './components/shared/pg-number-input';
import './components/shared/pg-text-input';
import './components/shared/pg-toggle';
import './components/shared/pg-easing-picker';

// Components
import './components/app/pg-app';
import './components/toolbar/pg-toolbar';
import './components/toolbar/pg-component-selector';
import './components/sidebar/pg-sidebar';
import './components/sidebar/pg-interaction-list';
import './components/stage/pg-stage';
import './components/inspector/pg-inspector';
import './components/inspector/pg-interaction-editor';
import './components/inspector/pg-trigger-editor';
import './components/inspector/pg-effect-editor';
import './components/inspector/pg-time-effect-editor';
import './components/inspector/pg-scrub-effect-editor';
import './components/inspector/pg-transition-effect-editor';
import './components/inspector/pg-named-effect-picker';
import './components/inspector/pg-keyframe-editor';
import './components/inspector/pg-sequence-editor';
import './components/inspector/pg-condition-editor';
import './components/json-panel/pg-json-panel';

// Interact integration
import { initInteractManager, setStageElement } from './interact/InteractManager';

// Mount the app
const app = document.createElement('pg-app');
app.innerHTML = `
  <pg-toolbar>
    <pg-component-selector slot="component-selector"></pg-component-selector>
  </pg-toolbar>
  <pg-sidebar>
    <pg-interaction-list></pg-interaction-list>
  </pg-sidebar>
  <pg-stage></pg-stage>
  <pg-inspector>
    <pg-interaction-editor></pg-interaction-editor>
    <pg-effect-editor></pg-effect-editor>
    <pg-sequence-editor></pg-sequence-editor>
    <pg-condition-editor></pg-condition-editor>
  </pg-inspector>
  <pg-json-panel></pg-json-panel>
`;
document.body.appendChild(app);

const stage = app.querySelector('pg-stage') as HTMLElement | null;
if (stage) setStageElement(stage);

// Start the Interact manager
initInteractManager();
