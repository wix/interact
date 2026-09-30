import type { Shape } from './types';
import type { MotionRange } from './utils';
import { SHAPES } from './consts';
import { declareCustom, getEasing, mapRange, stripCalc, toKeyframeValue } from './utils';

export const MOTION_REVEAL_NAME = 'motion-reveal';
export const MOTION_SHAPE_NAME = 'motion-shape';
export const MOTION_SHUTTERS_NAME = 'motion-shutters';
export const MOTION_WINK_NAME = 'motion-wink';

const SHUTTERS_CONTINUOUS_STAGGERED_HOLD = 0.1;
const SHUTTERS_CONTINUOUS_EASING = 'sineOut';


function polygon(polygon: string[], polygonParams?: string, geometryBox: string = 'border-box') {
	return `${geometryBox} polygon(${polygonParams ? `${polygonParams}, ` : ''}${polygon.join(', ')})`;
}

function inset(inset: string, round?: string[], geometryBox: string = 'border-box') {
	return `${geometryBox} inset(${inset}${round ? ` round ${round.join(' ')}` : ''})`;
}

// string inputs allow using calc for parameterized shapes
function lerpPercentage(from: number, to: number, factor: number | string) {
	if (typeof factor === 'number') {
		return `${mapRange(0, 1, from, to, factor)}%`;
	}
	const delta = to - from;
	return `calc((${from} ${delta < 0 ? '-' : '+'} ${Math.abs(delta)} * ${stripCalc(factor)}) * 1%)`;
}

// shape to function that returns the clip-path string factored lineraly from 0 to 1
const SHAPES_MAP: Record<Shape, (factor: number | string) => string> = {
	diamond: (factor) => {
		const minPoint = lerpPercentage(50, -50, factor);
		const maxPoint = lerpPercentage(50, 150, factor);
		return polygon([`50% ${minPoint}`, `${maxPoint} 50%`, `50% ${maxPoint}`, `${minPoint} 50%`]);
	},
	window: (factor) => inset(lerpPercentage(50, -20, factor), ['50%', '50%', '0%', '0%']),
	rectangle: (factor) => inset(lerpPercentage(50, 0, factor)),
	circle: (factor) => `border-box circle(${lerpPercentage(0, 75, factor)})`,
	ellipse: (factor) => `border-box ellipse(${lerpPercentage(0, 75, factor)} ${lerpPercentage(0, 75, factor)})`,
};

// signed sizes (width and height can be negative) allow starting from any corner
// string inputs allow using calc for parameterized rectangles
// x, y, w, h => [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
function getClipRect(
	x: number | string,
	y: number | string,
	signedWidth: number | string,
	signedHeight: number | string,
	closePath: boolean = false,
) {
	const inputs = [x, y, signedWidth, signedHeight];
	const isNumber = inputs.map((input) => typeof input === 'number');
	let stringInputs = inputs.map((input, index) => 
		`${input}${isNumber[index] ? '%' : ''}`
	);

	const [x1, y1] = stringInputs;
	stringInputs = stringInputs.map(stripCalc);

	const [x2, y2] = [0, 1].map((isY) => 
		isNumber[isY] && isNumber[isY + 2]
			? `${(inputs[isY] as number) + (inputs[isY + 2] as number)}%`
			: `calc(${stringInputs[isY]} + ${stringInputs[isY + 2]})`
	);

	const rect = [
		`${x1} ${y1}`,
		`${x2} ${y1}`,
		`${x2} ${y2}`,
		`${x1} ${y2}`,
	]
	if (closePath) {
		rect.push(rect[0]);
	}

	return rect;
}

// compute offset parallel to one axis using a dynamic direction variable
function getDirectionalOffset(
	isVertical: number | string,
	offset: number | string,
) {
	const offsetStr = stripCalc(`${offset}`);
	return {
		x: `calc((1 - ${isVertical}) * ${offsetStr} * 100%)`,
		y: `calc(${isVertical} * ${offsetStr} * 100%)`,
	};
}

// compute full-span strip's sizes parallel to one axis using a dynamic direction variable
// vertical movement => full width; horizontal movement => full height
// w = vertical * 100% + (1 - vertical) * shortSide * 100%
// h = (1 - vertical) * 100% + vertical * shortSide * 100%
function getDirectionalStripSizes(
	isVerticalMovement: number | string,
	shortSide?: number | string,
) {
	if (!shortSide) {
		return {
			width: `calc(${isVerticalMovement} * 100%)`,
			height: `calc((1 - ${isVerticalMovement}) * 100%)`,
		};
	}

	const shortSideStr = stripCalc(`${shortSide}`);
	return {
		width: `calc((${isVerticalMovement} + (1 - ${isVerticalMovement}) * ${shortSideStr}) * 100%)`,
		height: `calc((1 - ${isVerticalMovement} + ${isVerticalMovement} * ${shortSideStr}) * 100%)`,
	};
}

// sets up custom properties for building directional moving rectangles
function prepareBasicRevealVars(
	motionRange: MotionRange,
	offset: number,
	prefix: string,
  asWeb: boolean = false,
) {
	const { fromSign, toSign, vertical } = motionRange;

	const { custom, vars } = declareCustom(prefix, {
		'is-vertical': [vertical ? 1 : 0, '0'],
		from: [fromSign * offset, '-1'],
		to: [toSign * offset, '0'],
	}, asWeb);

	return { custom, isVertical: vars['is-vertical'], from: vars.from, to: vars.to };
}

// clips an element using a rectangle shaped running window in the size of the element
// fixed-size window instead of "opening" the window allows simple continuous movement
// fixed-size window also allows future expansion to accept any angle as direction
export function getMotionReveal(
	motionRange: MotionRange,
	params: { minimum?: number },
  asWeb: boolean = false,
	suffix: string = '',
) {
	const { minimum = 0 } = params;

	const { custom, isVertical, from, to } =
		prepareBasicRevealVars(motionRange, 1 - minimum, `--motion-reveal${suffix}`, asWeb);

	const { x: fromLeft, y: fromTop } = getDirectionalOffset(isVertical, from);
	const { x: toLeft, y: toTop } = getDirectionalOffset(isVertical, to);

  return {
    name: `${MOTION_REVEAL_NAME}${suffix}`,
    custom,
    keyframes: [
      {
        clipPath: polygon(getClipRect(fromLeft, fromTop, 100, 100)),
      },
      {
        clipPath: polygon(getClipRect(toLeft, toTop, 100, 100)),
      },
    ],
  };
};

// clips an element horizontally or vertically from the middle
export function getMotionWink(
	motionRange: MotionRange,
	_params: any,
  asWeb: boolean = false,
	suffix: string = '',
) {
	const { custom, vars } = declareCustom(`--motion-wink${suffix}`, {
		'is-vertical': [motionRange.vertical ? 1 : 0, '0'],
	}, asWeb);
	const isVertical = vars['is-vertical'];

	const { x, y } = getDirectionalOffset(isVertical, 0.5);
	const { width, height } = getDirectionalStripSizes(isVertical);

  return {
    name: `${MOTION_WINK_NAME}${suffix}`,
    custom,
    keyframes: [
      {
        clipPath: polygon(getClipRect(x, y, width, height)),
      },
      {
        clipPath: polygon(getClipRect(0, 0, 100, 100)),
      },
    ],
  };
};

// scales a clip pattern of one of few selected shapes
// no continuous motion - scroll defaults to back-and-forth (2 iterations with alternate)
// uses space toggles in order to use a single keyframe for the entire preset and allow east dynamic control
// shape can be changed by toggling custom-properties
// TODO - check whether the benefits justify the space-toggle complication
export function getMotionShape(
	params: { minimum?: number; shape: Shape; },
  asWeb: boolean = false,
	suffix: string = '',
) {
	const { minimum = 0, shape } = params;

	const { custom, vars } = declareCustom(`--motion-shape${suffix}`, {
		from: [minimum, '0'],
	}, asWeb);

	// setting all but the correct shape to initial
	SHAPES.forEach((s) => {
		custom[`--motion-shape${suffix}-${s}-start`] = s === shape ? SHAPES_MAP[shape](vars.from) : 'initial';
		custom[`--motion-shape${suffix}-${s}-end`] = s === shape ? SHAPES_MAP[shape](1) : 'initial';
	});

	const keyframes = ['start', 'end'].map((frame) => ({
		// clip-path value is the concatenated vars with space fallbacks
		clipPath: asWeb ? custom[`--motion-shape${suffix}-${shape}-${frame}`] : SHAPES.map(
			(s) => toKeyframeValue({}, `--motion-shape${suffix}-${s}-${frame}`, false, '')
		).join(' '),
	}));

  return { name: `${MOTION_SHAPE_NAME}${suffix}`, custom, keyframes };
}

// creates <shutters> amount of vertical or horizontal strips with each having an effect similar to reveal
// adjancy of the strips/shutters does not allow running windows like reveal, as each will cover the next one clipped area
// instead, continuous motion is done using clip-path polygon's fill option, that could be changed to 'evenodd'
// overlapping areas then are clipped by pairity of coverage -
// making every shutter clip its neighbor when they are doubled in size
// stagger cannot use the same continuous motion as varying speeds within 2 keyframes can only be done by varying distances
// continuous stagger must then still use the default 'nonzero' to hide the overlap and use more keyframes for the out frames
export function getMotionShutters(
	motionRange: MotionRange,
	params: { shutters: number, staggered: boolean },
  asWeb: boolean = false,
	suffix: string = '',
) {
	const { shutters, staggered } = params;
	if (shutters < 1) {
		return { keyframes: [] };
	}

	// staggered + continuous cannot be done without altering the keyframes
	// we keep memory of this for later push the extra keyframes, but temporarily revert to "in" animation
	const staggerContinuous = motionRange.toSign && staggered;
	const name = `${MOTION_SHUTTERS_NAME}${suffix}-${shutters}${staggerContinuous ? '-cont-stagger' : ''}`;
	if (staggerContinuous) {
		motionRange.toSign = 0;
	}

	// we avoid using 1/shutters as offset to write the computation itself in the CSS and avoid rounding errors
	const { custom, isVertical, from, to } = prepareBasicRevealVars(motionRange, 1, `--motion-shutters${suffix}`, asWeb);

	// continuous motion requires evenodd fill in order to be implemented as a single motion between 2 frames
	custom[`--motion-shutters${suffix}-fill`] = motionRange.toSign ? 'evenodd' : 'nonzero';
	custom[`--motion-shutters${suffix}-stagger`] = staggered ? 1 : 0;
	const pathFill_ = toKeyframeValue(custom, `--motion-shutters${suffix}-fill`, asWeb, 'nonzero') as string;
	const stagger_ = toKeyframeValue(custom, `--motion-shutters${suffix}-stagger`, asWeb, '0');

	// from short size 0
	const { width: fromWidth, height: fromHeight } = getDirectionalStripSizes(isVertical);

	const fromPolygon = [];
	const toPolygon = [];
	const oppStaggerPolygon = [];
	// since amount of shutters changes the keyframes anyway, we do not need to set it as custom-property
	// however, we use calc(i / s) to get accurate computation without writing long decimals in the CSS
	for (let i = 0; i <= shutters; i++) {
		// moving the whole pattern back a single shutter size if we need to keep the motion for 2 shutter sizes
		// to = 0 => offset = i / s; to = +-1 => offset = (i -+ 1) / s
		const offset = `calc((${i} - ${to}) / ${shutters})`;

		const { x, y } = getDirectionalOffset(isVertical, offset);
		fromPolygon.push(...getClipRect(x, y, fromWidth, fromHeight, true));

		// "from" is 1 or -1 depending on the direction - we use that to flip the stagger direction
		// from = +-1 => 1 - from = 0 or 2; 1 + from = 2 or 0 => ((1 - from) * a + (1 + from) * b) / 2 = a or b
		// factor grows in same direction as movement
		const staggerFactor = `(((1 - ${from}) * ${i} + (1 + ${from}) * ${shutters - i}) / ${2 * shutters})`;
		// TODO - simplify stagger formula - currently from old implementation
		const staggerOffset = `${stagger_} * ${from} * ${staggerFactor} * (${staggerFactor} + 1 / ${shutters})`;
		// to short size +-1 (+-stagger) or +-2 depending on direction and whether it is continuous
		const shortSide = `calc((${to} - ${from}) / ${shutters} - ${staggerOffset})`;

		const { width: toWidth, height: toHeight } = getDirectionalStripSizes(isVertical, shortSide);
		toPolygon.push(...getClipRect(x, y, toWidth, toHeight, true));

		if (staggerContinuous) {
			// we prepare the end polygon of the stagger in the other direction
			// same computation only simplified because here: from = -from; to = 0; stagger_ = 1
			const oppStaggerFactor = `(((1 + ${from}) * ${i} + (1 - ${from}) * ${shutters - i}) / ${2 * shutters})`;
			const oppStaggerOffset = `${from} * ${oppStaggerFactor} * (${oppStaggerFactor} + 1 / ${shutters})`;
			const oppShortSide = `calc(${from} / ${shutters} + ${oppStaggerOffset})`;

			const { width: oppWidth, height: oppHeight } = getDirectionalStripSizes(isVertical, oppShortSide);
			oppStaggerPolygon.push(...getClipRect(x, y, oppWidth, oppHeight, true))
		}
	}

	const keyframes: Record<string, string | number>[] = [
		{ clipPath: polygon(fromPolygon, pathFill_) },
		{ clipPath: polygon(toPolygon, pathFill_) },
	];
	if (staggerContinuous) {
		// the fully revealed state is held in the middle of the range, before closing towards the other side
		// timing is set per keyframe since CSS applies animation-timing-function per keyframe segment
		const move = (1 - SHUTTERS_CONTINUOUS_STAGGERED_HOLD) / 2;
		const easing = getEasing(SHUTTERS_CONTINUOUS_EASING);
		Object.assign(keyframes[0], { offset: 0, easing });
		Object.assign(keyframes[1], { offset: move, easing: 'linear' });
		keyframes.push(
			{ clipPath: polygon(oppStaggerPolygon, pathFill_), offset: 1 - move, easing },
			{ clipPath: keyframes[0].clipPath, offset: 1 },
		);
	}

  return { name, custom, keyframes };
};
