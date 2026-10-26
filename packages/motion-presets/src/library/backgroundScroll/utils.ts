import type { DomApi } from '../../types';

export function measureCompHeight(
  measures: {
    '--motion-comp-height': string;
    // TODO: (ameerf) - remove this once we support scalar multiplication in values passed to fizban or once SDA is widely available
    '--motion-comp-half-height'?: string;
  },
  dom: DomApi,
  assignToCss?: boolean,
) {
  dom.measure((target) => {
    if (!target) {
      return;
    }
    measures['--motion-comp-height'] = `${target.offsetHeight}px`;
    if (measures['--motion-comp-half-height']) {
      measures['--motion-comp-half-height'] = `${Math.round(0.5 * target.offsetHeight)}px`;
    }
  });
  if (assignToCss) {
    dom.mutate((target) => {
      target?.style.setProperty('--motion-comp-height', measures['--motion-comp-height']);
      if (measures['--motion-comp-half-height']) {
        target?.style.setProperty(
          '--motion-comp-half-height',
          measures['--motion-comp-half-height'],
        );
      }
    });
  }
}

const getMasterPage = (): HTMLElement | null => window!.document.getElementById('masterPage');

const getWixAdsHeight = () => {
  const wixAds = window!.document.getElementById('WIX_ADS');
  return wixAds ? wixAds.offsetHeight : 0;
};

const getSiteHeight = (): number => {
  const masterPage = getMasterPage();
  return masterPage ? masterPage.offsetHeight + getWixAdsHeight() : 0; // probably tests that don't have masterPage created
};

export function measureSiteHeight(
  measures: { '--motion-site-height': string },
  dom: DomApi,
  assignToCss?: boolean,
) {
  dom.measure(() => {
    measures['--motion-site-height'] = `${getSiteHeight()}px`;
  });
  if (assignToCss) {
    dom.mutate((target) => {
      target?.style.setProperty('--motion-site-height', measures['--motion-site-height']);
    });
  }
}

export function getScaleFromPerspectiveAndZ(z: number, perspective: number) {
  return z > perspective ? 0 : 1.0 / (1 - z / perspective);
}

type PartStyles = Partial<Record<'MEDIA_CLIP' | 'MEDIA_WRAPPER' | 'MEDIA', Record<string, string>>>;

/*
 * Mimics `position: fixed` with sticky positioning and negative margins, since a fixed element breaks inside a
 * transformed or clipping ancestor. Firefox needs `will-change: transform` on the wrapper
 * (https://bugzilla.mozilla.org/show_bug.cgi?id=1791232), set through `--motion-bgreveal-will-change`.
 */
export const FIXED_STYLES: PartStyles = {
  MEDIA_WRAPPER: {
    willChange: 'var(--motion-bgreveal-will-change)',
    height: 'calc(100% + 200lvh)',
    marginTop: '-100lvh',
    overflow: 'clip',
    // media rendered as a background image needs its own stacking context in some browsers
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

/**
 * Adds the static styles of the parts as animations without a name. Only `style()` adds them, since `web()` animates
 * every animation it returns, and the runtime applies the static styles from `style()` too.
 */
export function withPartStyles<T>(
  animations: T[],
  options: object,
  { MEDIA_CLIP, ...partStyles }: PartStyles,
  asWeb: boolean,
) {
  if (asWeb) {
    return animations;
  }

  const styles = {
    MEDIA_CLIP: { overflow: 'clip', contain: 'layout', ...MEDIA_CLIP },
    ...partStyles,
  };
  return [
    ...animations,
    ...Object.entries(styles).map(([part, style]) => ({ ...options, part, style, keyframes: [] })),
  ];
}
