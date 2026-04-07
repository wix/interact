import type { InteractConfig } from '@wix/interact';
import { cssEasings } from '@wix/motion';
import { getAllPresets } from '../interact/preset-registry';

const cssEasingMap = cssEasings as Record<string, string>;

function resolveCssEasing(easing: string | undefined): string {
  if (!easing) return 'ease';
  if (cssEasingMap[easing]) return cssEasingMap[easing];
  if (
    easing === 'linear' ||
    easing.startsWith('cubic-bezier') ||
    easing.startsWith('ease') ||
    easing.startsWith('steps')
  ) {
    return easing;
  }
  return 'ease';
}

export interface TrackInfo {
  trackId: string;
  effectId: string;
  label: string;
  targetElement: Element | null;
  delay: number;
  duration: number;
  keyframes: Keyframe[];
  easing: string;
  iterations: number;
  fill: FillMode;
  isScrub: boolean;
  type: 'time' | 'scrub' | 'transition';
  group?: string;
}

type TickCallback = (timeMs: number) => void;

const SCRUB_DEFAULT_DURATION = 1000;

interface ResolvedAnimData {
  keyframes: Keyframe[];
  label: string;
  easing?: string;
  duration?: number;
  delay?: number;
}

function resolveNamedEffect(effect: Record<string, any>): ResolvedAnimData[] {
  const named = effect.namedEffect;
  if (!named?.type) return [{ keyframes: [{ opacity: 0 }, { opacity: 1 }], label: 'unknown' }];

  const presets = getAllPresets() as Record<string, any>;
  const presetModule = presets[named.type];
  if (!presetModule?.web && !presetModule?.style) {
    return [{ keyframes: [{ opacity: 0 }, { opacity: 1 }], label: named.type }];
  }

  try {
    const options: Record<string, any> = {
      namedEffect: named,
      duration: effect.duration ?? SCRUB_DEFAULT_DURATION,
      delay: effect.delay ?? 0,
      easing: effect.easing,
      fill: effect.fill,
      iterations: effect.iterations,
    };

    const factory = presetModule.web ?? presetModule.style;
    const animDataArray: any[] = factory(options);

    if (!Array.isArray(animDataArray) || animDataArray.length === 0) {
      return [{ keyframes: [{ opacity: 0 }, { opacity: 1 }], label: named.type }];
    }

    const resolved = animDataArray
      .filter((animData: any) => animData.keyframes?.length > 0)
      .map((animData: any) => ({
        keyframes: (animData.keyframes ?? []) as Keyframe[],
        label: animData.name ?? named.type,
        easing: resolveCssEasing(animData.easing),
        duration: typeof animData.duration === 'number' ? animData.duration : undefined,
        delay: typeof animData.delay === 'number' ? animData.delay : undefined,
      }));

    return resolved.length > 0
      ? resolved
      : [{ keyframes: [{ opacity: 0 }, { opacity: 1 }], label: named.type }];
  } catch {
    return [{ keyframes: [{ opacity: 0 }, { opacity: 1 }], label: named.type }];
  }
}

function resolveKeyframes(effect: Record<string, any>): Keyframe[] {
  if (effect.keyframeEffect?.keyframes?.length) {
    return effect.keyframeEffect.keyframes;
  }
  if (effect.transitionProperties?.length) {
    const from: Record<string, string> = {};
    const to: Record<string, string> = {};
    for (const prop of effect.transitionProperties) {
      from[prop.name] = 'initial';
      to[prop.name] = prop.value;
    }
    return [from, to];
  }
  return [{ opacity: 0 }, { opacity: 1 }];
}

function resolveLabel(effect: Record<string, any>, effectId: string): string {
  if (effect.keyframeEffect?.name) return effect.keyframeEffect.name;
  if (effect.namedEffect?.type) return effect.namedEffect.type;
  if (effect.transitionProperties?.length) {
    return effect.transitionProperties.map((p: any) => p.name).join(', ');
  }
  return effectId;
}

function detectEffectType(effect: Record<string, any>): 'time' | 'scrub' | 'transition' {
  if ('transitionProperties' in effect || 'transition' in effect) return 'transition';
  if ('duration' in effect) return 'time';
  return 'scrub';
}

function resolveRefTargetKey(
  ref: Record<string, any>,
  effect: Record<string, any>,
  interactionKey: string,
): string | null {
  if (ref.key) return ref.key;
  if (effect.key) return effect.key;
  return interactionKey || null;
}

export class TimelineEngine {
  private _stageRoot: ShadowRoot;
  private _animations: Animation[] = [];
  private _tracks: TrackInfo[] = [];
  private _rafId: number | null = null;
  private _tickCallback: TickCallback | null = null;
  private _playing = false;

  constructor(stageRoot: ShadowRoot) {
    this._stageRoot = stageRoot;
  }

  buildTracks(config: InteractConfig, interactionIndex: number | null): TrackInfo[] {
    const tracks: TrackInfo[] = [];

    if (interactionIndex == null) {
      this._tracks = tracks;
      return tracks;
    }

    const interaction = config.interactions[interactionIndex];
    if (!interaction) {
      this._tracks = tracks;
      return tracks;
    }

    let trackCounter = 0;

    const effectRefs = (interaction.effects ?? []) as Record<string, any>[];
    for (const ref of effectRefs) {
      const effectId = ref.effectId as string | undefined;
      if (!effectId) continue;
      const effect = config.effects[effectId];
      if (!effect) continue;

      const subTracks = this._buildEffectTracks(
        effectId,
        effect as Record<string, any>,
        ref,
        interaction.key,
        0,
        trackCounter,
      );
      tracks.push(...subTracks);
      trackCounter += subTracks.length;
    }

    const sequenceRefs = (interaction.sequences ?? []) as Record<string, any>[];
    for (const seqRef of sequenceRefs) {
      const seqId = seqRef.sequenceId as string | undefined;
      if (!seqId) continue;
      const seq = config.sequences?.[seqId];
      if (!seq) continue;

      const seqDelay = seq.delay ?? 0;
      const seqOffset = seq.offset ?? 0;
      const seqEffects = seq.effects as Record<string, any>[];

      for (let i = 0; i < seqEffects.length; i++) {
        const effRef = seqEffects[i];
        const effectId = effRef.effectId as string | undefined;
        if (!effectId) continue;
        const effect = config.effects[effectId];
        if (!effect) continue;

        const staggerDelay = seqDelay + i * seqOffset;
        const seqLabel = `Seq #${seqId.replace(/^seq-/, '')}`;

        const subTracks = this._buildEffectTracks(
          effectId,
          effect as Record<string, any>,
          effRef,
          interaction.key,
          staggerDelay,
          trackCounter,
          seqLabel,
        );
        tracks.push(...subTracks);
        trackCounter += subTracks.length;
      }
    }

    this._tracks = tracks;
    return tracks;
  }

  private _buildEffectTracks(
    effectId: string,
    effect: Record<string, any>,
    ref: Record<string, any>,
    interactionKey: string,
    extraDelay: number,
    startIndex: number,
    group?: string,
  ): TrackInfo[] {
    const tracks: TrackInfo[] = [];
    const type = detectEffectType(effect);
    const isScrub = type === 'scrub';
    const baseDuration = isScrub
      ? SCRUB_DEFAULT_DURATION
      : (effect.duration ??
        (type === 'transition' ? (effect.transitionProperties?.[0]?.duration ?? 300) : 300));

    const targetKey = resolveRefTargetKey(ref, effect, interactionKey);
    let targetElement: Element | null = null;
    if (targetKey) {
      const wrapper = this._stageRoot.querySelector(
        `interact-element[data-interact-key="${targetKey}"]`,
      );
      targetElement = wrapper?.firstElementChild ?? wrapper;
    }

    if (effect.namedEffect) {
      const animTracks = resolveNamedEffect(effect);
      for (const animTrack of animTracks) {
        tracks.push({
          trackId: `track-${startIndex + tracks.length}`,
          effectId,
          label: group ? `${group}: ${animTrack.label}` : animTrack.label,
          targetElement,
          delay: extraDelay + (animTrack.delay ?? effect.delay ?? 0),
          duration: animTrack.duration ?? baseDuration,
          keyframes: animTrack.keyframes,
          easing: resolveCssEasing(animTrack.easing ?? effect.easing),
          iterations: effect.iterations ?? 1,
          fill: (effect.fill as FillMode) ?? 'both',
          isScrub,
          type,
          group,
        });
      }
    } else {
      tracks.push({
        trackId: `track-${startIndex + tracks.length}`,
        effectId,
        label: group
          ? `${group}: ${resolveLabel(effect, effectId)}`
          : resolveLabel(effect, effectId),
        targetElement,
        delay: extraDelay + (effect.delay ?? 0),
        duration: baseDuration,
        keyframes: resolveKeyframes(effect),
        easing: resolveCssEasing(effect.easing),
        iterations: effect.iterations ?? 1,
        fill: (effect.fill as FillMode) ?? 'both',
        isScrub,
        type,
        group,
      });
    }

    return tracks;
  }

  createAnimations(tracks: TrackInfo[]): void {
    this.destroyAnimations();
    this._tracks = tracks;

    for (const track of tracks) {
      if (!track.targetElement || track.keyframes.length === 0) continue;

      try {
        const anim = track.targetElement.animate(track.keyframes, {
          duration: track.duration,
          delay: track.delay,
          easing: track.easing,
          iterations: track.iterations,
          fill: track.fill,
          direction: 'normal',
        });
        anim.pause();
        this._animations.push(anim);
      } catch {
        // Skip invalid keyframes
      }
    }
  }

  destroyAnimations(): void {
    this._stopLoop();
    for (const anim of this._animations) {
      try {
        anim.cancel();
      } catch {
        /* already cancelled */
      }
    }
    this._animations = [];
    this._playing = false;
  }

  play(): void {
    if (this._animations.length === 0) return;
    this._playing = true;

    for (const anim of this._animations) {
      anim.play();
    }

    this._startLoop();
  }

  pause(): void {
    this._playing = false;
    this._stopLoop();
    for (const anim of this._animations) {
      anim.pause();
    }
  }

  stop(): void {
    this._playing = false;
    this._stopLoop();
    this.seekTo(0);
    for (const anim of this._animations) {
      anim.pause();
    }
    this._tickCallback?.(0);
  }

  seekTo(timeMs: number): void {
    const clamped = Math.max(0, Math.min(timeMs, this.totalDuration));
    for (const anim of this._animations) {
      anim.currentTime = clamped;
    }
    this._tickCallback?.(clamped);
  }

  get currentTime(): number {
    if (this._animations.length === 0) return 0;
    const first = this._animations[0];
    return typeof first.currentTime === 'number' ? first.currentTime : 0;
  }

  get totalDuration(): number {
    if (this._tracks.length === 0) return 0;
    return Math.max(...this._tracks.map((t) => t.delay + t.duration * t.iterations));
  }

  get isPlaying(): boolean {
    return this._playing;
  }

  onTick(callback: TickCallback): void {
    this._tickCallback = callback;
  }

  private _startLoop(): void {
    this._stopLoop();
    const tick = () => {
      if (!this._playing) return;

      const time = this.currentTime;
      this._tickCallback?.(time);

      const allFinished = this._animations.every((a) => a.playState === 'finished');
      if (allFinished || time >= this.totalDuration) {
        this._playing = false;
        this._tickCallback?.(this.totalDuration);
        return;
      }

      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  private _stopLoop(): void {
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
