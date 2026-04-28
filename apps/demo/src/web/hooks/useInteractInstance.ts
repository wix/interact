import { useEffect } from 'react';
import { Interact, type InteractConfig } from '@wix/interact/web';

export const useInteractInstance = (
  config: InteractConfig,
  options?: { useCustomElement?: boolean },
) => {
  useEffect(() => {
    const instance = Interact.create(config, options);

    return () => {
      instance.destroy();
    };
  }, [config, options]);
};
