// NOT PRODUCTION READY — background-scroll presets are experimental and excluded from public documentation.
import type { ScrubAnimationOptions, DomApi } from '../../types';
import { measureCompHeight, withPartStyles, FIXED_STYLES } from './utils';

export function getNames(_: ScrubAnimationOptions) {
  return [];
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  const measures = { '--motion-comp-height': '0px' };
  if (dom) {
    measureCompHeight(measures, dom, true);
  }
  return measures;
}

export function web(options: ScrubAnimationOptions, dom?: DomApi) {
  prepare(options, dom);

  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  return withPartStyles([], options, FIXED_STYLES, asWeb);
}
