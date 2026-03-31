import { BaseComponent } from '../base/BaseComponent';
import type { PlaygroundState } from '../../types';
import { getPresetsByCategory } from '../../interact/preset-registry';

const FOUR_DIRECTIONS = ['top', 'right', 'bottom', 'left'];
const TWO_SIDES = ['left', 'right'];
const FOUR_CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const ROTATE_DIRS = ['clockwise', 'counter-clockwise'];
const ORIENTATIONS = ['vertical', 'horizontal'];
const SHAPES = ['circle', 'ellipse', 'rectangle', 'diamond', 'window'];
const EIGHT_DIRECTIONS = [...FOUR_DIRECTIONS, ...FOUR_CORNERS];
const NINE_DIRECTIONS = ['center', ...FOUR_DIRECTIONS, ...FOUR_CORNERS];
const SCROLL_RANGE = ['in', 'out', 'continuous'];
const MOUSE_AXIS = ['both', 'horizontal', 'vertical'];
const PIVOT_AXIS = ['top', 'bottom', 'right', 'left', 'center-horizontal', 'center-vertical'];
const CURVE_DIRECTIONS = ['left', 'right', 'pseudoLeft', 'pseudoRight'];
const UNIT_OPTIONS = ['px', 'percentage', 'em', 'rem', 'vh', 'vw'];

interface OptionDef {
  name: string;
  label: string;
  type: 'select' | 'number' | 'boolean' | 'unit-value';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | boolean | { value: number; type: string };
  units?: string[];
}

const PRESET_OPTIONS: Record<string, OptionDef[]> = {
  // ── Entrance ──
  ArcIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'right',
    },
    {
      name: 'depth',
      label: 'Depth',
      type: 'unit-value',
      defaultValue: { value: 200, type: 'px' },
      step: 10,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  BlurIn: [
    { name: 'blur', label: 'Blur (px)', type: 'number', min: 1, max: 50, step: 1, defaultValue: 6 },
  ],
  BounceIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: [...FOUR_DIRECTIONS, 'center'],
      defaultValue: 'bottom',
    },
    {
      name: 'distanceFactor',
      label: 'Distance Factor',
      type: 'number',
      min: 0.1,
      max: 5,
      step: 0.1,
      defaultValue: 1,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  CurveIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: CURVE_DIRECTIONS,
      defaultValue: 'right',
    },
    {
      name: 'depth',
      label: 'Depth',
      type: 'unit-value',
      defaultValue: { value: 300, type: 'px' },
      step: 10,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 1000,
      step: 50,
      defaultValue: 200,
    },
  ],
  DropIn: [
    {
      name: 'initialScale',
      label: 'Initial Scale',
      type: 'number',
      min: 0.1,
      max: 5,
      step: 0.1,
      defaultValue: 1.6,
    },
  ],
  ExpandIn: [
    {
      name: 'initialScale',
      label: 'Initial Scale',
      type: 'number',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 0,
    },
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'top',
    },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 120, type: 'percentage' },
      step: 10,
    },
  ],
  FlipIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'top',
    },
    {
      name: 'initialRotate',
      label: 'Rotation (deg)',
      type: 'number',
      min: 0,
      max: 360,
      step: 5,
      defaultValue: 90,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  FloatIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'left',
    },
  ],
  FoldIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'top',
    },
    {
      name: 'initialRotate',
      label: 'Rotation (deg)',
      type: 'number',
      min: 0,
      max: 180,
      step: 5,
      defaultValue: 90,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  GlideIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'left',
    },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 100, type: 'percentage' },
      step: 10,
    },
  ],
  RevealIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'left',
    },
  ],
  ShapeIn: [
    { name: 'shape', label: 'Shape', type: 'select', options: SHAPES, defaultValue: 'rectangle' },
  ],
  ShuttersIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'right',
    },
    {
      name: 'shutters',
      label: 'Shutters',
      type: 'number',
      min: 2,
      max: 24,
      step: 1,
      defaultValue: 12,
    },
    { name: 'staggered', label: 'Staggered', type: 'boolean', defaultValue: true },
  ],
  SlideIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'left',
    },
    {
      name: 'initialTranslate',
      label: 'Translate (0-1)',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 1,
    },
  ],
  SpinIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: ROTATE_DIRS,
      defaultValue: 'clockwise',
    },
    {
      name: 'spins',
      label: 'Spins',
      type: 'number',
      min: 0.1,
      max: 10,
      step: 0.1,
      defaultValue: 0.5,
    },
    {
      name: 'initialScale',
      label: 'Initial Scale',
      type: 'number',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 0,
    },
  ],
  TiltIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: TWO_SIDES,
      defaultValue: 'left',
    },
    {
      name: 'depth',
      label: 'Depth',
      type: 'unit-value',
      defaultValue: { value: 200, type: 'px' },
      step: 10,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  TurnIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_CORNERS,
      defaultValue: 'top-left',
    },
  ],
  WinkIn: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: ORIENTATIONS,
      defaultValue: 'horizontal',
    },
  ],

  // ── Ongoing ──
  Bounce: [
    {
      name: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0,
    },
  ],
  Breathe: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: [...ORIENTATIONS, 'center'],
      defaultValue: 'vertical',
    },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 25, type: 'px' },
      step: 5,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  Cross: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: EIGHT_DIRECTIONS,
      defaultValue: 'right',
    },
  ],
  Flip: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: ORIENTATIONS,
      defaultValue: 'horizontal',
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  Fold: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'top',
    },
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 1,
      max: 90,
      step: 1,
      defaultValue: 15,
    },
  ],
  Jello: [
    {
      name: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.25,
    },
  ],
  Poke: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'right',
    },
    {
      name: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
    },
  ],
  Pulse: [
    {
      name: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0,
    },
  ],
  Rubber: [
    {
      name: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
    },
  ],
  Spin: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: ROTATE_DIRS,
      defaultValue: 'clockwise',
    },
  ],
  Swing: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'top',
    },
    {
      name: 'swing',
      label: 'Swing (deg)',
      type: 'number',
      min: 1,
      max: 90,
      step: 1,
      defaultValue: 20,
    },
  ],
  Wiggle: [
    {
      name: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
    },
  ],

  // ── Scroll ──
  ArcScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: ORIENTATIONS,
      defaultValue: 'horizontal',
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 500,
    },
  ],
  BlurScroll: [
    { name: 'blur', label: 'Blur (px)', type: 'number', min: 1, max: 50, step: 1, defaultValue: 6 },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  FadeScroll: [
    {
      name: 'opacity',
      label: 'Opacity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0,
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  FlipScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: ORIENTATIONS,
      defaultValue: 'horizontal',
    },
    {
      name: 'rotate',
      label: 'Rotation (deg)',
      type: 'number',
      min: 0,
      max: 720,
      step: 10,
      defaultValue: 240,
    },
    {
      name: 'range',
      label: 'Range',
      type: 'select',
      options: SCROLL_RANGE,
      defaultValue: 'continuous',
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  GrowScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: NINE_DIRECTIONS,
      defaultValue: 'center',
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
    { name: 'scale', label: 'Scale', type: 'number', min: 0, max: 5, step: 0.1, defaultValue: 0 },
    { name: 'speed', label: 'Speed', type: 'number', min: 0, max: 5, step: 0.1, defaultValue: 0 },
  ],
  MoveScroll: [
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 0,
      max: 360,
      step: 5,
      defaultValue: 120,
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 400, type: 'px' },
      step: 10,
    },
  ],
  PanScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: TWO_SIDES,
      defaultValue: 'left',
    },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 400, type: 'px' },
      step: 10,
    },
    { name: 'startFromOffScreen', label: 'Start Off-Screen', type: 'boolean', defaultValue: true },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  ParallaxScroll: [
    {
      name: 'parallaxFactor',
      label: 'Parallax Factor',
      type: 'number',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 0.5,
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  RevealScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'bottom',
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  ShapeScroll: [
    { name: 'shape', label: 'Shape', type: 'select', options: SHAPES, defaultValue: 'circle' },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
    {
      name: 'intensity',
      label: 'Intensity',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.5,
    },
  ],
  ShrinkScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: NINE_DIRECTIONS,
      defaultValue: 'center',
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
    { name: 'scale', label: 'Scale', type: 'number', min: 0, max: 3, step: 0.1, defaultValue: 1.2 },
    { name: 'speed', label: 'Speed', type: 'number', min: 0, max: 5, step: 0.1, defaultValue: 0 },
  ],
  ShuttersScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'right',
    },
    {
      name: 'shutters',
      label: 'Shutters',
      type: 'number',
      min: 2,
      max: 24,
      step: 1,
      defaultValue: 12,
    },
    { name: 'staggered', label: 'Staggered', type: 'boolean', defaultValue: true },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  SkewPanScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: TWO_SIDES,
      defaultValue: 'right',
    },
    {
      name: 'skew',
      label: 'Skew (deg)',
      type: 'number',
      min: 0,
      max: 45,
      step: 1,
      defaultValue: 10,
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  SlideScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: FOUR_DIRECTIONS,
      defaultValue: 'bottom',
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  Spin3dScroll: [
    {
      name: 'rotate',
      label: 'Rotation (deg)',
      type: 'number',
      min: -360,
      max: 360,
      step: 10,
      defaultValue: -100,
    },
    { name: 'speed', label: 'Speed', type: 'number', min: 0, max: 5, step: 0.1, defaultValue: 0 },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 1000,
    },
  ],
  SpinScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: ROTATE_DIRS,
      defaultValue: 'clockwise',
    },
    {
      name: 'spins',
      label: 'Spins',
      type: 'number',
      min: 0.05,
      max: 5,
      step: 0.05,
      defaultValue: 0.15,
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
    { name: 'scale', label: 'Scale', type: 'number', min: 0, max: 3, step: 0.1, defaultValue: 1 },
  ],
  StretchScroll: [
    {
      name: 'stretch',
      label: 'Stretch',
      type: 'number',
      min: 0,
      max: 3,
      step: 0.1,
      defaultValue: 0.6,
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'out' },
  ],
  TiltScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: TWO_SIDES,
      defaultValue: 'right',
    },
    {
      name: 'parallaxFactor',
      label: 'Parallax Factor',
      type: 'number',
      min: 0,
      max: 2,
      step: 0.1,
      defaultValue: 0,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 400,
    },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],
  TurnScroll: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      options: TWO_SIDES,
      defaultValue: 'right',
    },
    {
      name: 'spin',
      label: 'Spin',
      type: 'select',
      options: ROTATE_DIRS,
      defaultValue: 'clockwise',
    },
    { name: 'scale', label: 'Scale', type: 'number', min: 0, max: 3, step: 0.1, defaultValue: 1 },
    { name: 'range', label: 'Range', type: 'select', options: SCROLL_RANGE, defaultValue: 'in' },
  ],

  // ── Mouse ──
  AiryMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 200, type: 'px' },
      step: 10,
    },
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 0,
      max: 90,
      step: 1,
      defaultValue: 30,
    },
    { name: 'axis', label: 'Axis', type: 'select', options: MOUSE_AXIS, defaultValue: 'both' },
  ],
  BlobMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 200, type: 'px' },
      step: 10,
    },
    {
      name: 'scale',
      label: 'Scale',
      type: 'number',
      min: 0.1,
      max: 5,
      step: 0.1,
      defaultValue: 1.4,
    },
  ],
  BlurMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 80, type: 'px' },
      step: 10,
    },
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 0,
      max: 90,
      step: 1,
      defaultValue: 5,
    },
    { name: 'scale', label: 'Scale', type: 'number', min: 0, max: 3, step: 0.1, defaultValue: 0.3 },
    {
      name: 'blur',
      label: 'Blur (px)',
      type: 'number',
      min: 0,
      max: 50,
      step: 1,
      defaultValue: 20,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 600,
    },
  ],
  ScaleMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 80, type: 'px' },
      step: 10,
    },
    { name: 'scale', label: 'Scale', type: 'number', min: 0, max: 5, step: 0.1, defaultValue: 1.4 },
    { name: 'axis', label: 'Axis', type: 'select', options: MOUSE_AXIS, defaultValue: 'both' },
  ],
  SkewMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 200, type: 'px' },
      step: 10,
    },
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 0,
      max: 90,
      step: 1,
      defaultValue: 25,
    },
    { name: 'axis', label: 'Axis', type: 'select', options: MOUSE_AXIS, defaultValue: 'both' },
  ],
  SwivelMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 0,
      max: 90,
      step: 1,
      defaultValue: 5,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
    {
      name: 'pivotAxis',
      label: 'Pivot Axis',
      type: 'select',
      options: PIVOT_AXIS,
      defaultValue: 'center-horizontal',
    },
  ],
  Tilt3DMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 0,
      max: 90,
      step: 1,
      defaultValue: 5,
    },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  Track3DMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 200, type: 'px' },
      step: 10,
    },
    {
      name: 'angle',
      label: 'Angle (deg)',
      type: 'number',
      min: 0,
      max: 90,
      step: 1,
      defaultValue: 5,
    },
    { name: 'axis', label: 'Axis', type: 'select', options: MOUSE_AXIS, defaultValue: 'both' },
    {
      name: 'perspective',
      label: 'Perspective (px)',
      type: 'number',
      min: 100,
      max: 2000,
      step: 50,
      defaultValue: 800,
    },
  ],
  TrackMouse: [
    { name: 'inverted', label: 'Inverted', type: 'boolean', defaultValue: false },
    {
      name: 'distance',
      label: 'Distance',
      type: 'unit-value',
      defaultValue: { value: 200, type: 'px' },
      step: 10,
    },
    { name: 'axis', label: 'Axis', type: 'select', options: MOUSE_AXIS, defaultValue: 'both' },
  ],

  // ── Background Scroll ──
  BgPan: [{ name: 'direction', label: 'Direction', type: 'select', options: TWO_SIDES }],
  BgRotate: [{ name: 'direction', label: 'Direction', type: 'select', options: ROTATE_DIRS }],
  BgSkew: [{ name: 'direction', label: 'Direction', type: 'select', options: ROTATE_DIRS }],
  BgZoom: [{ name: 'direction', label: 'Direction', type: 'select', options: ['in', 'out'] }],
  BgFade: [{ name: 'range', label: 'Range', type: 'select', options: ['in', 'out'] }],
};

export class PgNamedEffectPicker extends BaseComponent {
  private _currentPreset = '';
  private _currentOptions: Record<string, unknown> = {};
  private _allowedCategories: string[] | undefined;
  private _rendered = false;

  protected get componentStyles(): string {
    return /* css */ `
      :host {
        display: block;
      }

      .section-title {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-bold);
        color: var(--pg-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--pg-space-2);
      }

      .preset-select {
        margin-bottom: var(--pg-space-3);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: var(--pg-space-1);
        margin-bottom: var(--pg-space-2);
      }

      .field label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .options-section {
        padding: var(--pg-space-2);
        background: var(--pg-color-bg-tertiary);
        border-radius: var(--pg-radius-md);
        overflow: hidden;
      }

      .options-title {
        font-size: var(--pg-font-size-xs);
        color: var(--pg-color-text-muted);
        margin-bottom: var(--pg-space-2);
      }

      .no-preset {
        color: var(--pg-color-text-muted);
        font-size: var(--pg-font-size-sm);
        font-style: italic;
      }

      .unit-value-row {
        display: flex;
        gap: var(--pg-space-1);
      }

      .unit-value-input {
        flex: 1;
        min-width: 0;
      }

      .unit-value-select {
        width: 80px;
        flex-shrink: 0;
      }

      .toggle-row-option {
        display: flex;
        align-items: center;
        gap: var(--pg-space-2);
        margin-bottom: var(--pg-space-2);
      }

      .toggle-row-option label {
        font-size: var(--pg-font-size-xs);
        font-weight: var(--pg-font-weight-medium);
        color: var(--pg-color-text-secondary);
        cursor: pointer;
      }
    `;
  }

  setAllowedCategories(categories: string[] | undefined): void {
    this._allowedCategories = categories;
    this._renderContent();
  }

  setPreset(name: string, options: Record<string, unknown> = {}): void {
    this._currentPreset = name;
    this._currentOptions = { ...options };
    this._renderContent();
  }

  protected render(_state: PlaygroundState): void {
    if (this._rendered) return;
    this._rendered = true;
    this._renderContent();
  }

  private _renderContent(): void {
    const byCategory = getPresetsByCategory(this._allowedCategories);

    const optgroups: string[] = [];
    for (const [category, entries] of byCategory) {
      const opts = entries
        .map(
          (e) =>
            `<option value="${e.name}" ${e.name === this._currentPreset ? 'selected' : ''}>${e.name}</option>`,
        )
        .join('');
      optgroups.push(`<optgroup label="${category}">${opts}</optgroup>`);
    }

    const presetDefs = PRESET_OPTIONS[this._currentPreset];
    let optionsHtml = '';
    if (presetDefs && presetDefs.length > 0) {
      const fields = presetDefs.map((def) => this._renderOption(def)).join('');
      optionsHtml = `
        <div class="options-section">
          <div class="options-title">Preset Options</div>
          ${fields}
        </div>
      `;
    }

    this.shadowRoot!.innerHTML = `
      <div class="section-title">Named Effect</div>
      <div class="preset-select">
        <div class="field">
          <label>Preset</label>
          <select class="pg-select" id="preset-select">
            <option value="">-- none --</option>
            ${optgroups.join('')}
          </select>
        </div>
      </div>
      <div id="options-container">${optionsHtml}</div>
    `;

    this._attachListeners();
  }

  private _renderOption(def: OptionDef): string {
    if (def.type === 'boolean') {
      const checked = this._currentOptions[def.name] ?? def.defaultValue;
      return `
        <div class="toggle-row-option">
          <input type="checkbox" data-option="${def.name}" ${checked ? 'checked' : ''}>
          <label>${def.label}</label>
        </div>
      `;
    }

    if (def.type === 'unit-value') {
      const current = this._currentOptions[def.name] as
        | { value?: number; type?: string }
        | undefined;
      const defaults = def.defaultValue as { value: number; type: string } | undefined;
      const numVal = current?.value ?? defaults?.value ?? 0;
      const unitVal = current?.type ?? defaults?.type ?? 'px';
      const units = def.units ?? UNIT_OPTIONS;
      const unitOpts = units
        .map(
          (u) =>
            `<option value="${u}" ${u === unitVal ? 'selected' : ''}>${u === 'percentage' ? '%' : u}</option>`,
        )
        .join('');
      return `
        <div class="field">
          <label>${def.label}</label>
          <div class="unit-value-row">
            <input type="number" class="pg-input unit-value-input" data-unit-option="${def.name}"
              data-unit-part="value" min="${def.min ?? ''}" max="${def.max ?? ''}"
              step="${def.step ?? 1}" value="${numVal}">
            <select class="pg-select unit-value-select" data-unit-option="${def.name}"
              data-unit-part="type">
              ${unitOpts}
            </select>
          </div>
        </div>
      `;
    }

    const currentVal = this._currentOptions[def.name] ?? def.defaultValue ?? '';
    if (def.type === 'select' && def.options) {
      const opts = def.options
        .map(
          (o) => `<option value="${o}" ${String(currentVal) === o ? 'selected' : ''}>${o}</option>`,
        )
        .join('');
      return `
        <div class="field">
          <label>${def.label}</label>
          <select class="pg-select" data-option="${def.name}">
            ${opts}
          </select>
        </div>
      `;
    }
    return `
      <div class="field">
        <label>${def.label}</label>
        <input type="number" class="pg-input" data-option="${def.name}"
          min="${def.min ?? ''}" max="${def.max ?? ''}" step="${def.step ?? 1}"
          value="${currentVal}">
      </div>
    `;
  }

  private _attachListeners(): void {
    const shadow = this.shadowRoot!;
    const presetSelect = shadow.getElementById('preset-select') as HTMLSelectElement;

    presetSelect?.addEventListener('change', () => {
      this._currentPreset = presetSelect.value;
      this._currentOptions = {};
      this._emitChange();

      const presetDefs = PRESET_OPTIONS[this._currentPreset];
      const container = shadow.getElementById('options-container')!;
      if (presetDefs && presetDefs.length > 0) {
        const fields = presetDefs.map((def) => this._renderOption(def)).join('');
        container.innerHTML = `
          <div class="options-section">
            <div class="options-title">Preset Options</div>
            ${fields}
          </div>
        `;
        this._attachOptionListeners();
      } else {
        container.innerHTML = '';
      }
    });

    this._attachOptionListeners();
  }

  private _attachOptionListeners(): void {
    const shadow = this.shadowRoot!;

    shadow.querySelectorAll('[data-option]').forEach((el) => {
      const optName = (el as HTMLElement).dataset.option!;

      const handler = () => {
        if (el instanceof HTMLInputElement && el.type === 'checkbox') {
          this._currentOptions[optName] = el.checked;
        } else if (el instanceof HTMLSelectElement) {
          this._currentOptions[optName] = el.value;
        } else {
          this._currentOptions[optName] = parseFloat((el as HTMLInputElement).value);
        }
        this._emitChange();
      };

      el.addEventListener('change', handler);
      if (el instanceof HTMLInputElement && el.type !== 'checkbox') {
        el.addEventListener('input', handler);
      }
    });

    shadow.querySelectorAll('[data-unit-option]').forEach((el) => {
      const optName = (el as HTMLElement).dataset.unitOption!;
      const part = (el as HTMLElement).dataset.unitPart!;

      const handler = () => {
        const presetDefs = PRESET_OPTIONS[this._currentPreset];
        const def = presetDefs?.find((d) => d.name === optName);
        const defaults = def?.defaultValue as { value: number; type: string } | undefined;
        const current = (this._currentOptions[optName] as { value?: number; type?: string }) ?? {};
        const merged = {
          value: current.value ?? defaults?.value ?? 0,
          type: current.type ?? defaults?.type ?? 'px',
        };
        if (part === 'value') {
          merged.value = parseFloat((el as HTMLInputElement).value) || 0;
        } else {
          merged.type = (el as HTMLSelectElement).value;
        }
        this._currentOptions[optName] = merged;
        this._emitChange();
      };

      if (el instanceof HTMLSelectElement) {
        el.addEventListener('change', handler);
      } else {
        el.addEventListener('input', handler);
      }
    });
  }

  private _emitChange(): void {
    if (!this._currentPreset) {
      this.dispatchEvent(
        new CustomEvent('change', { detail: null, bubbles: true, composed: true }),
      );
      return;
    }

    const namedEffect: Record<string, unknown> = { type: this._currentPreset };
    for (const [key, value] of Object.entries(this._currentOptions)) {
      if (value !== '' && value !== undefined) {
        namedEffect[key] = value;
      }
    }

    this.dispatchEvent(
      new CustomEvent('change', { detail: namedEffect, bubbles: true, composed: true }),
    );
  }

  getNamedEffect(): Record<string, unknown> | null {
    if (!this._currentPreset) return null;
    const result: Record<string, unknown> = { type: this._currentPreset };
    for (const [key, value] of Object.entries(this._currentOptions)) {
      if (value !== '' && value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }
}

customElements.define('pg-named-effect-picker', PgNamedEffectPicker);
