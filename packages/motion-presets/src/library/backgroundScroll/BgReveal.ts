import type { ScrubAnimationOptions, DomApi } from '../../types';
import { measureCompHeight } from './utils';

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

  return style(options);
}

export function style(_options: ScrubAnimationOptions) {
  return [];
}
