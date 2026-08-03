/**
 * Demo-side glue for the reusable `@wix/splittext` Interact plugin.
 *
 * The plugin itself now lives in `@wix/splittext/plugin`, which ships WITHOUT a dependency on
 * `@wix/interact` so the two packages stay decoupled. This file is where the demo — the one place
 * that depends on BOTH — "resolves the typing":
 *
 *  1. It binds the package's structurally-typed callbacks to Interact's real `InteractPlugin` /
 *     `InteractPluginStyleGenerator` contract. The assignments below double as a compile-time
 *     check that `@wix/splittext/plugin` stays compatible with `@wix/interact`.
 *  2. It ties the `$splitText` config field to {@link SplitTextPluginConfig} via declaration
 *     merging on `InteractPluginConfigMap`, so demo configs get autocomplete + checking.
 */
import type { InteractPlugin, InteractPluginStyleGenerator } from '@wix/interact';
import {
  splitTextPlugin as splitTextPluginImpl,
  splitTextStyle as splitTextStyleImpl,
  type SplitTextPluginConfig,
} from '@wix/splittext/plugin';

export const splitTextPlugin: InteractPlugin = splitTextPluginImpl;
export const splitTextStyle: InteractPluginStyleGenerator = splitTextStyleImpl;
export type { SplitTextPluginConfig };

declare module '@wix/interact' {
  interface InteractPluginConfigMap {
    splitText: SplitTextPluginConfig;
  }
}
