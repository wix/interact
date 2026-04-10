import { Playground } from './components/Playground';
import { ScrollShowcase } from './components/ScrollShowcase';
import { ResponsiveDemo } from './components/ResponsiveDemo';
import { SelectorConditionDemo } from './components/SelectorConditionDemo';
import { PointerMoveDemo } from './components/PointerMoveDemo';
import { SequencePlayground } from './components/SequencePlayground';
import { SequenceEntranceDemo } from './components/SequenceEntranceDemo';
import { SequenceClickDemo } from './components/SequenceClickDemo';
import { SequenceEasingComparison } from './components/SequenceEasingComparison';

const heroCopy = [
  'Tune triggers, easings, and delays in real time.',
  'Preview viewProgress and hover behaviors without leaving the repo.',
  'Copy the JSON config directly into CMS or product experiments.',
];

function App() {
  return (
    <div className="demo-shell">
      <header className="demo-hero">
        <a href="/" className="back-link">
          ← Back to integrations
        </a>
        <span className="integration-badge integration-badge--react">React Integration</span>
        <h1 className="demo-hero-title">Experiment faster</h1>
        <p className="demo-hero-body">
          Using the <code>&lt;Interaction&gt;</code> component with ref-based element tracking. A
          playground focused on validating motion recipes, stress-testing new triggers, and
          exporting configs that production surfaces can consume immediately.
        </p>

        <div className="stacked-scenes demo-hero-scenes">
          {heroCopy.map((line) => (
            <div className="panel" key={line}>
              <p className="panel-text">{line}</p>
            </div>
          ))}
        </div>
      </header>

      <Playground />
      <SelectorConditionDemo />
      <div className="scroll-showcase-wrapper">
        <ResponsiveDemo />
        <ScrollShowcase />
      </div>
      <PointerMoveDemo />

      <div className="seq-section-divider">
        <h2>Sequences</h2>
        <p>Coordinated multi-element animations with staggered timing.</p>
      </div>
      <SequencePlayground />
      <SequenceEntranceDemo />
      <SequenceClickDemo />
      <SequenceEasingComparison />
    </div>
  );
}

export default App;
