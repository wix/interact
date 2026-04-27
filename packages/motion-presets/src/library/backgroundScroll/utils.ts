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
