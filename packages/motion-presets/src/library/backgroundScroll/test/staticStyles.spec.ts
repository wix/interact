import { describe, expect, test } from 'vitest';

import * as backgroundScroll from '../index';
import { baseMockOptions } from './testUtils';

type Preset = {
  style: (options: any) => { name?: string; part?: string; style?: Record<string, unknown> }[];
};

const stylesOf = (name: keyof typeof backgroundScroll, namedEffect: object = {}) =>
  Object.fromEntries(
    (backgroundScroll[name] as unknown as Preset)
      .style({ ...baseMockOptions, namedEffect })
      .filter(({ name: animationName }) => !animationName)
      .map(({ part, style }) => [part, style]),
  );

const LAYER = { overflow: 'clip', contain: 'layout' };
const FIXED = {
  MEDIA_CLIP: LAYER,
  MEDIA_WRAPPER: {
    willChange: 'var(--motion-bgreveal-will-change)',
    height: 'calc(100% + 200lvh)',
    marginTop: '-100lvh',
    overflow: 'clip',
    isolation: 'isolate',
  },
  MEDIA: {
    position: 'sticky',
    height: 'max(100lvh, calc(100% - 200lvh))',
    width: '100%',
    top: '0px',
    marginBottom: 'calc(100lvh - max(100lvh, var(--motion-comp-height, 100%)))',
    display: 'block',
    padding: '0px',
  },
};

describe('background scroll static styles', () => {
  test.each(['BgCloseUp', 'BgFade', 'BgFadeBack', 'BgPullBack'] as const)(
    '%s only clips its media to its layer',
    (name) => {
      expect(stylesOf(name)).toEqual({ MEDIA_CLIP: LAYER });
    },
  );

  test.each(['BgParallax', 'BgReveal', 'BgFake3D'] as const)('%s keeps its media fixed', (name) => {
    expect(stylesOf(name)).toEqual(FIXED);
  });

  test('BgZoom keeps its media fixed when zooming in', () => {
    expect(stylesOf('BgZoom')).toEqual(FIXED);
    expect(stylesOf('BgZoom', { direction: 'in' })).toEqual(FIXED);
  });

  test('BgZoom oversizes its media when zooming out', () => {
    expect(stylesOf('BgZoom', { direction: 'out' })).toEqual({
      MEDIA_CLIP: LAYER,
      MEDIA_WRAPPER: {
        position: 'relative',
        width: '115%',
        height: '115%',
        left: '-7.5%',
        top: '-7.5%',
      },
    });
  });

  test.each([
    [undefined, '36.397%', '-18.199%'],
    [35, '70.021%', '-35.010%'],
  ])(
    'BgSkew extends its media to cover its skew of %s degrees',
    (angle, paddingBottom, marginTop) => {
      expect(stylesOf('BgSkew', { angle })).toEqual({
        MEDIA_CLIP: LAYER,
        MEDIA_WRAPPER: { paddingBottom, marginTop },
        MEDIA: { height: '100%', width: '100%', position: 'absolute' },
      });
    },
  );

  test.each([
    [undefined, 'max(100%, calc(92.718cqw + 37.461cqh))', 'max(100%, calc(37.461cqw + 92.718cqh))'],
    [45, 'max(100%, calc(70.711cqw + 70.711cqh))', 'max(100%, calc(70.711cqw + 70.711cqh))'],
  ])('BgRotate extends its media to cover its rotation of %s degrees', (angle, width, height) => {
    expect(stylesOf('BgRotate', { angle })).toEqual({
      MEDIA_CLIP: { ...LAYER, containerType: 'size' },
      MEDIA_WRAPPER: { width, height, translate: 'calc(50cqw - 50%) calc(50cqh - 50%)' },
    });
  });

  test.each([
    [undefined, '120%', '-10%'],
    [0.5, '150%', '-25%'],
  ])('BgPan widens its media by its speed of %s', (speed, width, left) => {
    expect(stylesOf('BgPan', { speed })).toEqual({
      MEDIA_CLIP: LAYER,
      MEDIA_WRAPPER: { position: 'relative', width, left },
    });
  });

  test.each([
    [undefined, '150%'],
    [2, '200%'],
  ])('ImageParallax heightens its media by its speed of %s', (speed, height) => {
    expect(stylesOf('ImageParallax', { speed })).toEqual({
      MEDIA_CLIP: LAYER,
      MEDIA_WRAPPER: { height, position: 'relative' },
      MEDIA: { height: '100%', width: '100%', position: 'absolute' },
    });
  });
});
