import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import { cssEasings } from '@wix/motion';
import {
  parseCubicBezier,
  formatCubicBezier,
  matchPreset,
  sampleBezierCurve,
  type BezierPoints,
} from '../../utils/bezier';

type EasingKey = keyof typeof cssEasings;

const GROUPS: { label: string; keys: EasingKey[] }[] = [
  { label: 'Standard', keys: ['linear', 'ease', 'easeIn', 'easeOut', 'easeInOut'] },
  { label: 'Sine', keys: ['sineIn', 'sineOut', 'sineInOut'] },
  { label: 'Quad', keys: ['quadIn', 'quadOut', 'quadInOut'] },
  { label: 'Cubic', keys: ['cubicIn', 'cubicOut', 'cubicInOut'] },
  { label: 'Quart', keys: ['quartIn', 'quartOut', 'quartInOut'] },
  { label: 'Quint', keys: ['quintIn', 'quintOut', 'quintInOut'] },
  { label: 'Expo', keys: ['expoIn', 'expoOut', 'expoInOut'] },
  { label: 'Circ', keys: ['circIn', 'circOut', 'circInOut'] },
  { label: 'Back', keys: ['backIn', 'backOut', 'backInOut'] },
];

const easingsByValue = new Map<string, string>();
for (const [key, value] of Object.entries(cssEasings)) {
  easingsByValue.set(value, key);
}

function findPresetKey(value: string): string {
  // Direct lookup by CSS value
  const direct = easingsByValue.get(value);
  if (direct) return direct;

  // Parse and match by control points
  const points = parseCubicBezier(value);
  if (points) {
    const matched = matchPreset(...points);
    if (matched) return matched;
  }

  return 'custom';
}

// SVG constants
const SVG_SIZE = 200;
const SVG_PAD = 20;
const HANDLE_R = 6;

function bezierToSvg(bx: number, by: number): { x: number; y: number } {
  return { x: bx * SVG_SIZE, y: SVG_SIZE - by * SVG_SIZE };
}

function svgToBezier(sx: number, sy: number): { x: number; y: number } {
  return { x: sx / SVG_SIZE, y: (SVG_SIZE - sy) / SVG_SIZE };
}

export class PgEasingPicker extends BaseComponent {
  private _points: BezierPoints = [0.25, 0.1, 0.25, 1]; // default: ease
  private _dragging: 1 | 2 | null = null;
  private _built = false;

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
      }

      .easing-picker {
        display: flex;
        flex-direction: column;
        gap: var(--pg-space-2);
      }

      label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .svg-wrapper {
        background: var(--pg-color-bg-tertiary);
        border: var(--pg-border-width) solid var(--pg-color-border);
        border-radius: var(--pg-radius-md);
        padding: var(--pg-space-2);
        display: flex;
        justify-content: center;
      }

      svg {
        width: 100%;
        max-width: 200px;
        aspect-ratio: 1;
        cursor: default;
        touch-action: none;
      }

      .bg {
        fill: var(--pg-color-bg-primary);
        rx: 2;
      }

      .grid-line {
        stroke: var(--pg-color-border);
        stroke-width: 0.5;
      }

      .reference {
        stroke: var(--pg-color-text-muted);
        stroke-width: 1;
        stroke-dasharray: 4 4;
        opacity: 0.4;
      }

      .curve {
        fill: none;
        stroke: var(--pg-color-accent);
        stroke-width: 2.5;
        stroke-linecap: round;
      }

      .handle-line {
        stroke: var(--pg-color-accent-hover);
        stroke-width: 1;
        stroke-dasharray: 3 2;
        opacity: 0.6;
      }

      .handle {
        fill: var(--pg-color-accent);
        stroke: var(--pg-color-bg-primary);
        stroke-width: 2;
        cursor: grab;
        transition: r var(--pg-transition-fast);
      }

      .handle:hover, .handle.dragging {
        r: 8;
        fill: var(--pg-color-accent-hover);
        cursor: grabbing;
      }

      .text-input {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-color-text-primary);
        font-family: var(--pg-font-mono);
        background: var(--pg-color-bg-tertiary);
        border: var(--pg-border-width) solid var(--pg-color-border);
        border-radius: var(--pg-radius-sm);
        padding: var(--pg-space-1) var(--pg-space-2);
        width: 100%;
        box-sizing: border-box;
      }

      .text-input:focus-visible {
        outline: none;
        border-color: var(--pg-color-border-focus);
        box-shadow: 0 0 0 2px var(--pg-color-accent-muted);
      }
    `;
  }

  static get observedAttributes(): string[] {
    return ['label', 'value'];
  }

  protected render(_state: PlaygroundState): void {
    if (this._built) return;
    this._built = true;

    const label = this.getAttribute('label') || 'Easing';
    const value = this.getAttribute('value') || 'ease';
    const parsed = parseCubicBezier(value);
    if (parsed) this._points = parsed;

    const presetKey = findPresetKey(value);

    const optgroups = GROUPS.map((g) => {
      const opts = g.keys
        .map((k) => `<option value="${k}" ${k === presetKey ? 'selected' : ''}>${k}</option>`)
        .join('');
      return `<optgroup label="${g.label}">${opts}</optgroup>`;
    }).join('');

    this.shadowRoot!.innerHTML = `
      <div class="easing-picker">
        ${label ? `<label>${label}</label>` : ''}
        <select class="pg-select" id="easing-select">
          ${optgroups}
          <optgroup label="Custom">
            <option value="custom" ${presetKey === 'custom' ? 'selected' : ''}>custom</option>
          </optgroup>
        </select>
        <div class="svg-wrapper">
          <svg id="bezier-svg" viewBox="${-SVG_PAD} ${-SVG_PAD} ${SVG_SIZE + SVG_PAD * 2} ${SVG_SIZE + SVG_PAD * 2}">
            <rect class="bg" x="0" y="0" width="${SVG_SIZE}" height="${SVG_SIZE}" />
            ${this._gridLines()}
            <line class="reference" x1="0" y1="${SVG_SIZE}" x2="${SVG_SIZE}" y2="0" />
            <path class="curve" id="curve-path" />
            <line class="handle-line" id="line1" />
            <line class="handle-line" id="line2" />
            <circle class="handle" id="handle1" r="${HANDLE_R}" />
            <circle class="handle" id="handle2" r="${HANDLE_R}" />
          </svg>
        </div>
        <input class="text-input" id="text-input" type="text" spellcheck="false" />
      </div>
    `;

    this._updateSvg();
    this._updateTextInput();
    this._bindEvents();
  }

  private _gridLines(): string {
    const lines: string[] = [];
    for (let i = 1; i < 4; i++) {
      const pos = (i / 4) * SVG_SIZE;
      lines.push(`<line class="grid-line" x1="${pos}" y1="0" x2="${pos}" y2="${SVG_SIZE}" />`);
      lines.push(`<line class="grid-line" x1="0" y1="${pos}" x2="${SVG_SIZE}" y2="${pos}" />`);
    }
    return lines.join('');
  }

  private _bindEvents(): void {
    const select = this.shadowRoot!.getElementById('easing-select') as HTMLSelectElement;
    const textInput = this.shadowRoot!.getElementById('text-input') as HTMLInputElement;
    const svg = this.shadowRoot!.getElementById('bezier-svg') as unknown as SVGSVGElement;
    const handle1 = this.shadowRoot!.getElementById('handle1') as unknown as SVGCircleElement;
    const handle2 = this.shadowRoot!.getElementById('handle2') as unknown as SVGCircleElement;

    // Dropdown change
    select.addEventListener('change', () => {
      const key = select.value;
      if (key === 'custom') return;
      const cssValue = cssEasings[key as EasingKey];
      if (!cssValue) return;
      const parsed = parseCubicBezier(cssValue);
      if (parsed) {
        this._points = parsed;
        this._updateSvg();
        this._updateTextInput();
        this._emitChange();
      }
    });

    // Text input blur
    textInput.addEventListener('change', () => {
      const parsed = parseCubicBezier(textInput.value);
      if (parsed) {
        this._points = parsed;
        this._updateSvg();
        this._syncDropdown();
        this._emitChange();
      } else {
        // Revert to current value
        this._updateTextInput();
      }
    });

    // Handle drag
    const startDrag = (handleIdx: 1 | 2, e: PointerEvent) => {
      this._dragging = handleIdx;
      const handle = handleIdx === 1 ? handle1 : handle2;
      handle.setPointerCapture(e.pointerId);
      handle.classList.add('dragging');
    };

    handle1.addEventListener('pointerdown', (e) => startDrag(1, e));
    handle2.addEventListener('pointerdown', (e) => startDrag(2, e));

    svg.addEventListener('pointermove', (e) => {
      if (!this._dragging) return;
      const pt = this._screenToSvg(svg, e.clientX, e.clientY);
      const bezier = svgToBezier(pt.x, pt.y);

      // Clamp x to [0, 1], allow y overshoot [-0.5, 1.5]
      const x = Math.max(0, Math.min(1, bezier.x));
      const y = Math.max(-0.5, Math.min(1.5, bezier.y));

      if (this._dragging === 1) {
        this._points[0] = x;
        this._points[1] = y;
      } else {
        this._points[2] = x;
        this._points[3] = y;
      }

      this._updateSvg();
      this._updateTextInput();
      this._syncDropdown();
    });

    const endDrag = (e: PointerEvent) => {
      if (!this._dragging) return;
      const handle = this._dragging === 1 ? handle1 : handle2;
      handle.releasePointerCapture(e.pointerId);
      handle.classList.remove('dragging');
      this._dragging = null;
      this._emitChange();
    };

    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
  }

  private _screenToSvg(
    svg: SVGSVGElement,
    clientX: number,
    clientY: number,
  ): { x: number; y: number } {
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const inv = ctm.inverse();
    const pt = new DOMPoint(clientX, clientY).matrixTransform(inv);
    return { x: pt.x, y: pt.y };
  }

  private _updateSvg(): void {
    const [x1, y1, x2, y2] = this._points;
    const p1 = bezierToSvg(x1, y1);
    const p2 = bezierToSvg(x2, y2);
    const start = bezierToSvg(0, 0);
    const end = bezierToSvg(1, 1);

    // Curve path
    const curvePath = this.shadowRoot!.getElementById('curve-path');
    if (curvePath) {
      const samples = sampleBezierCurve(x1, y1, x2, y2, 64);
      const d = samples
        .map((pt, i) => {
          const sx = pt.x * SVG_SIZE;
          const sy = SVG_SIZE - pt.y * SVG_SIZE;
          return i === 0 ? `M ${sx},${sy}` : `L ${sx},${sy}`;
        })
        .join(' ');
      curvePath.setAttribute('d', d);
    }

    // Handle 1
    const handle1 = this.shadowRoot!.getElementById('handle1');
    if (handle1) {
      handle1.setAttribute('cx', String(p1.x));
      handle1.setAttribute('cy', String(p1.y));
    }

    // Handle 2
    const handle2 = this.shadowRoot!.getElementById('handle2');
    if (handle2) {
      handle2.setAttribute('cx', String(p2.x));
      handle2.setAttribute('cy', String(p2.y));
    }

    // Line from start to handle1
    const line1 = this.shadowRoot!.getElementById('line1');
    if (line1) {
      line1.setAttribute('x1', String(start.x));
      line1.setAttribute('y1', String(start.y));
      line1.setAttribute('x2', String(p1.x));
      line1.setAttribute('y2', String(p1.y));
    }

    // Line from end to handle2
    const line2 = this.shadowRoot!.getElementById('line2');
    if (line2) {
      line2.setAttribute('x1', String(end.x));
      line2.setAttribute('y1', String(end.y));
      line2.setAttribute('x2', String(p2.x));
      line2.setAttribute('y2', String(p2.y));
    }
  }

  private _updateTextInput(): void {
    const input = this.shadowRoot?.getElementById('text-input') as HTMLInputElement | null;
    if (input && !input.matches(':focus')) {
      input.value = formatCubicBezier(...this._points);
    }
  }

  private _syncDropdown(): void {
    const select = this.shadowRoot?.getElementById('easing-select') as HTMLSelectElement | null;
    if (!select) return;
    const matched = matchPreset(...this._points);
    select.value = matched ?? 'custom';
  }

  private _emitChange(): void {
    const matched = matchPreset(...this._points);
    const cssValue = matched
      ? (cssEasings[matched as EasingKey] ?? formatCubicBezier(...this._points))
      : formatCubicBezier(...this._points);
    this.dispatchEvent(
      new CustomEvent('change', { detail: cssValue, bubbles: true, composed: true }),
    );
  }

  attributeChangedCallback(name: string, _old: string | null, newVal: string | null): void {
    if (name === 'value' && newVal != null) {
      const parsed = parseCubicBezier(newVal);
      if (parsed) {
        this._points = parsed;
        this._updateSvg();
        this._updateTextInput();
        this._syncDropdown();
      }
    }
  }

  get value(): string {
    const matched = matchPreset(...this._points);
    if (matched) {
      return cssEasings[matched as EasingKey] ?? formatCubicBezier(...this._points);
    }
    return formatCubicBezier(...this._points);
  }

  set value(v: string) {
    this.setAttribute('value', v);
  }
}

customElements.define('pg-easing-picker', PgEasingPicker);
