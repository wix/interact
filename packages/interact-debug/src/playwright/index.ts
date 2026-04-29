// Fixture server
export { serveArtifact } from './fixtureServer';

// Helpers
export {
  waitForAnimationState,
  getAnimationCount,
  getComputedStyleProp,
  waitForStyleChange,
} from './animationHelpers';
export { scrollToKey, scrollBy, scrollToProgress } from './scrollHelpers';
export {
  hoverElement,
  unhoverElement,
  clickElement,
  movePointerWithinElement,
} from './pointerHelpers';
export { fireTrigger, reverseTrigger } from './triggerHelpers';

// Assertions
export { expect } from './assertions';

// Runtime verifier
export { verifyAll, verifyInteraction, verifyKey } from './runtimeVerifier';
export type { VerificationResult, VerificationCheck } from './runtimeVerifier';

// Runtime scorers
export { scorePerformance } from './performanceScorer';
export { scoreAnimationFidelity } from './animationFidelityScorer';

// Aggregate runtime scoring
export { scoreRuntime, scoreAll } from './aggregate';
