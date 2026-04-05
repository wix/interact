import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState, Action } from '../../types';
import { selectEffect } from '../../store/actions';
import { TimelineEngine, type TrackInfo } from '../../timeline/TimelineEngine';
import { getStageElement, pauseInteract, resumeInteract } from '../../interact/InteractManager';

function formatTime(ms: number): string {
  const totalSecs = ms / 1000;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
}

function pickTickInterval(totalMs: number): number {
  const candidates = [50, 100, 250, 500, 1000, 2000, 5000];
  for (const c of candidates) {
    if (totalMs / c <= 14 && totalMs / c >= 4) return c;
  }
  if (totalMs <= 500) return 100;
  return 1000;
}

const TRACK_COLORS: Record<string, string> = {
  time: 'var(--pg-color-accent)',
  scrub: 'var(--pg-color-success)',
  transition: 'var(--pg-color-accent-hover)',
};

export class PgTimelinePanel extends BaseComponent {
  private _engine: TimelineEngine | null = null;
  private _tracks: TrackInfo[] = [];
  private _active = false;
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: none;
        flex-direction: column;
        background: var(--pg-color-bg-secondary);
        border-top: var(--pg-border-width) solid var(--pg-color-border);
        height: var(--pg-json-panel-height);
        overflow: hidden;
      }

      :host(.open) {
        display: flex;
      }

      .transport {
        display: flex;
        align-items: center;
        gap: var(--pg-space-2);
        padding: var(--pg-space-1) var(--pg-panel-padding);
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
        flex-shrink: 0;
      }

      .transport-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--pg-color-bg-tertiary);
        border: var(--pg-border-width) solid var(--pg-color-border);
        border-radius: var(--pg-radius-sm);
        color: var(--pg-color-text-primary);
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        padding: 0;
        transition: background var(--pg-transition-fast);
      }

      .transport-btn:hover {
        background: var(--pg-color-bg-hover);
      }

      .transport-btn.active {
        background: var(--pg-color-accent-muted);
        border-color: var(--pg-color-accent);
      }

      .time-display {
        font-family: var(--pg-font-mono);
        font-size: var(--pg-font-size-sm);
        color: var(--pg-color-text-secondary);
        margin-left: var(--pg-space-2);
        min-width: 180px;
      }

      .track-area {
        flex: 1;
        display: grid;
        grid-template-columns: 120px 1fr;
        overflow: auto;
        position: relative;
      }

      .labels-column {
        display: flex;
        flex-direction: column;
        border-right: var(--pg-border-width) solid var(--pg-color-border);
        background: var(--pg-color-bg-secondary);
        z-index: 1;
      }

      .ruler-spacer {
        height: 24px;
        flex-shrink: 0;
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
      }

      .label-row {
        height: 32px;
        display: flex;
        align-items: center;
        padding: 0 var(--pg-space-2);
        font-size: var(--pg-font-size-xs);
        color: var(--pg-color-text-secondary);
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: background var(--pg-transition-fast);
      }

      .label-row:hover {
        background: var(--pg-color-bg-hover);
        color: var(--pg-color-text-primary);
      }

      .timeline-column {
        position: relative;
        min-width: 0;
      }

      .ruler {
        height: 24px;
        position: relative;
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
        cursor: pointer;
      }

      .ruler-tick {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--pg-color-border);
      }

      .ruler-tick-label {
        position: absolute;
        top: 2px;
        font-size: 9px;
        font-family: var(--pg-font-mono);
        color: var(--pg-color-text-muted);
        white-space: nowrap;
        transform: translateX(3px);
      }

      .tracks-container {
        position: relative;
      }

      .track-lane {
        height: 32px;
        position: relative;
        border-bottom: var(--pg-border-width) solid var(--pg-color-border);
      }

      .track-bar {
        position: absolute;
        top: 4px;
        height: 24px;
        border-radius: var(--pg-radius-sm);
        opacity: 0.7;
        transition: opacity var(--pg-transition-fast);
        overflow: hidden;
      }

      .track-bar:hover {
        opacity: 1;
      }

      .track-bar-fill {
        height: 100%;
        width: 0%;
        background: rgba(255, 255, 255, 0.15);
        transition: none;
      }

      .playhead {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--pg-color-danger);
        z-index: 2;
        pointer-events: none;
        left: 0%;
      }

      .playhead-handle {
        position: absolute;
        top: -2px;
        left: -5px;
        width: 12px;
        height: 12px;
        background: var(--pg-color-danger);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        cursor: ew-resize;
        pointer-events: all;
        z-index: 3;
      }

      .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
      }
    `;
  }

  protected render(state: PlaygroundState): void {
    const isOpen = state.bottomPanel === 'timeline';
    this.classList.toggle('open', isOpen);

    if (isOpen && !this._active) {
      this._activate(state);
    } else if (!isOpen && this._active) {
      this._deactivate();
    }
  }

  protected onStateChange(state: PlaygroundState, action: Action): void {
    const isOpen = state.bottomPanel === 'timeline';
    this.classList.toggle('open', isOpen);

    if (isOpen && !this._active) {
      this._activate(state);
      return;
    }

    if (!isOpen && this._active) {
      this._deactivate();
      return;
    }

    if (isOpen && this._active) {
      const configActions = new Set([
        'ADD_EFFECT',
        'UPDATE_EFFECT',
        'REMOVE_EFFECT',
        'ADD_INTERACTION',
        'UPDATE_INTERACTION',
        'REMOVE_INTERACTION',
        'SET_CONFIG',
        'RESET_CONFIG',
        'SELECT_COMPONENT',
        'ADD_SEQUENCE',
        'UPDATE_SEQUENCE',
        'REMOVE_SEQUENCE',
        'SELECT_INTERACTION',
        'UNDO',
      ]);
      if (configActions.has(action.type)) {
        this._debouncedRebuild(state);
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._deactivate();
  }

  private _activate(state: PlaygroundState): void {
    this._active = true;
    pauseInteract();
    this._ensureEngine();
    this._buildAndRender(state);
  }

  private _deactivate(): void {
    if (!this._active) return;
    this._active = false;
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._engine?.destroyAnimations();
    this._engine = null;
    resumeInteract();
  }

  private _ensureEngine(): void {
    const stage = getStageElement();
    if (!stage?.shadowRoot) return;
    this._engine = new TimelineEngine(stage.shadowRoot);
  }

  private _debouncedRebuild(state: PlaygroundState): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._buildAndRender(state), 120);
  }

  private _buildAndRender(state: PlaygroundState): void {
    if (!this._engine) {
      this._ensureEngine();
      if (!this._engine) return;
    }

    this._engine.destroyAnimations();
    this._tracks = this._engine.buildTracks(state.config, state.selectedInteractionIndex);
    this._engine.createAnimations(this._tracks);
    this._engine.onTick((ms) => this._onTick(ms));
    this._renderTimeline(state);
  }

  private _renderTimeline(state?: PlaygroundState): void {
    const sr = this.shadowRoot!;
    sr.innerHTML = '';

    const hasInteraction = state?.selectedInteractionIndex != null;

    // Transport bar
    const transport = document.createElement('div');
    transport.className = 'transport';

    const playBtn = this._createTransportBtn('\u25B6', 'play-btn');
    const pauseBtn = this._createTransportBtn('\u23F8', 'pause-btn');
    const stopBtn = this._createTransportBtn('\u23F9', 'stop-btn');

    const timeDisplay = document.createElement('span');
    timeDisplay.className = 'time-display';
    timeDisplay.id = 'time-display';
    const total = this._engine?.totalDuration ?? 0;
    timeDisplay.textContent = `${formatTime(0)} / ${formatTime(total)}`;

    transport.append(playBtn, pauseBtn, stopBtn, timeDisplay);
    sr.appendChild(transport);

    if (!hasInteraction) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Select an interaction to preview its timeline';
      sr.appendChild(empty);
      return;
    }

    if (this._tracks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Add effects or sequences to see the timeline';
      sr.appendChild(empty);
      return;
    }

    const trackArea = document.createElement('div');
    trackArea.className = 'track-area';

    // Labels column
    const labelsCol = document.createElement('div');
    labelsCol.className = 'labels-column';
    const rulerSpacer = document.createElement('div');
    rulerSpacer.className = 'ruler-spacer';
    labelsCol.appendChild(rulerSpacer);

    for (const track of this._tracks) {
      const row = document.createElement('div');
      row.className = 'label-row';
      row.textContent = track.label;
      row.title = `${track.effectId} (${track.type})`;
      row.addEventListener('click', () => {
        this.store.dispatch(selectEffect(track.effectId, { source: 'interaction' }));
      });
      labelsCol.appendChild(row);
    }

    // Timeline column
    const timelineCol = document.createElement('div');
    timelineCol.className = 'timeline-column';
    timelineCol.id = 'timeline-col';

    const totalDuration = this._engine?.totalDuration ?? 1;

    // Ruler
    const ruler = document.createElement('div');
    ruler.className = 'ruler';
    const interval = pickTickInterval(totalDuration);
    for (let t = 0; t <= totalDuration; t += interval) {
      const pct = (t / totalDuration) * 100;
      const tick = document.createElement('div');
      tick.className = 'ruler-tick';
      tick.style.left = `${pct}%`;
      const label = document.createElement('span');
      label.className = 'ruler-tick-label';
      label.style.left = `${pct}%`;
      label.textContent = t >= 1000 ? `${(t / 1000).toFixed(1)}s` : `${t}ms`;
      ruler.append(tick, label);
    }
    ruler.addEventListener('click', (e) => this._onRulerClick(e));
    timelineCol.appendChild(ruler);

    // Tracks container (holds track lanes + playhead)
    const tracksContainer = document.createElement('div');
    tracksContainer.className = 'tracks-container';
    tracksContainer.id = 'tracks-container';

    for (const track of this._tracks) {
      const lane = document.createElement('div');
      lane.className = 'track-lane';

      const bar = document.createElement('div');
      bar.className = 'track-bar';
      bar.dataset.trackId = track.trackId;
      const color = track.group
        ? 'var(--pg-color-success)'
        : (TRACK_COLORS[track.type] ?? TRACK_COLORS.time);
      bar.style.background = color;
      bar.style.left = `${(track.delay / totalDuration) * 100}%`;
      bar.style.width = `${((track.duration * track.iterations) / totalDuration) * 100}%`;

      const fill = document.createElement('div');
      fill.className = 'track-bar-fill';
      bar.appendChild(fill);
      lane.appendChild(bar);
      tracksContainer.appendChild(lane);
    }

    // Playhead
    const playhead = document.createElement('div');
    playhead.className = 'playhead';
    playhead.id = 'playhead';
    playhead.style.left = '0%';

    const playheadHandle = document.createElement('div');
    playheadHandle.className = 'playhead-handle';
    playhead.appendChild(playheadHandle);
    tracksContainer.appendChild(playhead);

    timelineCol.appendChild(tracksContainer);

    trackArea.append(labelsCol, timelineCol);
    sr.appendChild(trackArea);

    this._initPlayheadDrag(playheadHandle, tracksContainer);
    this._initTimelineClick(tracksContainer);
  }

  private _createTransportBtn(icon: string, id: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'transport-btn';
    btn.id = id;
    btn.textContent = icon;
    btn.addEventListener('click', () => this._onTransport(id));
    return btn;
  }

  private _onTransport(action: string): void {
    if (!this._engine) return;
    switch (action) {
      case 'play-btn':
        this._engine.play();
        this._syncTransportState();
        break;
      case 'pause-btn':
        this._engine.pause();
        this._syncTransportState();
        break;
      case 'stop-btn':
        this._engine.stop();
        this._syncTransportState();
        break;
    }
  }

  private _syncTransportState(): void {
    const playBtn = this.shadowRoot?.getElementById('play-btn');
    const pauseBtn = this.shadowRoot?.getElementById('pause-btn');
    const playing = this._engine?.isPlaying ?? false;
    playBtn?.classList.toggle('active', playing);
    pauseBtn?.classList.toggle('active', !playing && (this._engine?.currentTime ?? 0) > 0);
  }

  private _onTick(timeMs: number): void {
    const total = this._engine?.totalDuration ?? 1;
    const pct = total > 0 ? (timeMs / total) * 100 : 0;

    const playhead = this.shadowRoot?.getElementById('playhead');
    if (playhead) playhead.style.left = `${pct}%`;

    const timeDisplay = this.shadowRoot?.getElementById('time-display');
    if (timeDisplay) {
      timeDisplay.textContent = `${formatTime(timeMs)} / ${formatTime(total)}`;
    }

    this._tracks.forEach((track) => {
      const bar = this.shadowRoot?.querySelector(`.track-bar[data-track-id="${track.trackId}"]`);
      if (!bar) return;
      const fillEl = bar.querySelector('.track-bar-fill') as HTMLElement | null;
      if (!fillEl) return;

      const trackEnd = track.delay + track.duration * track.iterations;
      if (timeMs <= track.delay) {
        fillEl.style.width = '0%';
      } else if (timeMs >= trackEnd) {
        fillEl.style.width = '100%';
      } else {
        const elapsed = timeMs - track.delay;
        const totalTrackDuration = track.duration * track.iterations;
        fillEl.style.width = `${(elapsed / totalTrackDuration) * 100}%`;
      }
    });

    if (!this._engine?.isPlaying) {
      this._syncTransportState();
    }
  }

  private _onRulerClick(e: MouseEvent): void {
    const ruler = e.currentTarget as HTMLElement;
    const rect = ruler.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const total = this._engine?.totalDuration ?? 0;
    this._engine?.seekTo(pct * total);
  }

  private _initPlayheadDrag(handle: HTMLElement, container: HTMLElement): void {
    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handle.setPointerCapture(e.pointerId);

      const wasPaused = !this._engine?.isPlaying;
      if (!wasPaused) this._engine?.pause();

      const onMove = (me: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
        const total = this._engine?.totalDuration ?? 0;
        this._engine?.seekTo(pct * total);
      };

      const onUp = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  }

  private _initTimelineClick(container: HTMLElement): void {
    container.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.playhead-handle')) return;
      const rect = container.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const total = this._engine?.totalDuration ?? 0;
      this._engine?.seekTo(pct * total);
    });
  }
}

customElements.define('pg-timeline-panel', PgTimelinePanel);
