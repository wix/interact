export type CssAnimationData = ReturnType<
  (typeof import('@wix/motion'))['getCSSAnimation']
>[number];

export type CustomEffectLogEntry = {
  elementId: string | null;
  tagName: string | null;
  progress: number | null;
};
