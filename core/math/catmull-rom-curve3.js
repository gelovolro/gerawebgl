import { Curve3 }  from './curve3.js';
import { Vector3 } from './vector3.js';

/**
 * Minimum control point count for Catmull-Rom curve.
 *
 * @type {number}
 */
const MIN_CONTROL_POINT_COUNT = 2;

/**
 * Default closed flag for Catmull-Rom curve.
 *
 * @type {boolean}
 */
const DEFAULT_CLOSED = false;

/**
 * Clamp minimum for the curve parameter.
 *
 * @type {number}
 */
const CURVE_PARAMETER_MIN = 0;

/**
 * Clamp maximum for the curve parameter.
 *
 * @type {number}
 */
const CURVE_PARAMETER_MAX = 1;

/**
 * Zero value constant.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Segment offset for the last segment in open curves.
 *
 * @type {number}
 */
const OPEN_CURVE_LAST_SEGMENT_OFFSET = 1;

/**
 * One value used in math formulas.
 *
 * @type {number}
 */
const ONE_VALUE = 1;

/**
 * Two value used in math formulas.
 *
 * @type {number}
 */
const TWO_VALUE = 2;

/**
 * Three value used in math formulas.
 *
 * @type {number}
 */
const THREE_VALUE = 3;

/**
 * Four value used in math formulas.
 *
 * @type {number}
 */
const FOUR_VALUE = 4;

/**
 * Five value used in math formulas.
 *
 * @type {number}
 */
const FIVE_VALUE = 5;

/**
 * Catmull-Rom tension multiplier.
 *
 * @type {number}
 */
const CATMULL_ROM_TENSION = 0.5;

/**
 * Small epsilon used for tangent normalization.
 *
 * @type {number}
 */
const TANGENT_EPSILON = 1e-8;

/**
 * Catmull-Rom curve in 3D.
 */
export class CatmullRomCurve3 extends Curve3 {

    /**
     * Control points used to build the curve.
     *
     * @type {Vector3[]}
     * @private
     */
    #points;

    /**
     * Whether the curve is closed (wraps around to the first point).
     *
     * @type {boolean}
     * @private
     */
    #closed;

    /**
     * @param {Vector3[]} points               - Control points.
     * @param {Object} [options]               - Optional options.
     * @param {boolean} [options.closed=false] - Whether the curve is closed.
     * @throws {TypeError}  When inputs are invalid.
     * @throws {RangeError} When points are insufficient.
     */
    constructor(points, options = {}) {
        super();

        if (!Array.isArray(points)) {
            throw new TypeError('`CatmullRomCurve3` expects `points` as an array of `Vector3`.');
        }

        if (points.length < MIN_CONTROL_POINT_COUNT) {
            throw new RangeError('`CatmullRomCurve3` expects at least 2 control points.');
        }

        for (const point of points) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('`CatmullRomCurve3` expects all points to be `Vector3` instances.');
            }
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`CatmullRomCurve3` expects options as a plain object.');
        }

        const { closed = DEFAULT_CLOSED } = options;

        if (typeof closed !== 'boolean') {
            throw new TypeError('`CatmullRomCurve3` option `closed` must be a boolean.');
        }

        this.#points = points.slice();
        this.#closed = closed;
    }

    /**
     * @returns {Vector3[]}
     */
    get points() {
        return this.#points;
    }

    /**
     * @returns {boolean}
     */
    get closed() {
        return this.#closed;
    }

    /**
     * @param {number} curveParameter - Parameter in [0..1].
     * @param {Vector3} [out]         - Optional output vector.
     * @returns {Vector3}
     * @throws {TypeError} When inputs are invalid.
     */
    getPoint(curveParameter, out = new Vector3()) {
        if (typeof curveParameter !== 'number' || !Number.isFinite(curveParameter)) {
            throw new TypeError('`CatmullRomCurve3.getPoint` expects `curveParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`CatmullRomCurve3.getPoint` expects `out` as a Vector3.');
        }

        // Clamp curve parameter and map it to the `segment index + local` segment parameter:
        const clampedCurveParameter = CatmullRomCurve3.#clampCurveParameter(curveParameter);
        const segmentCount          = this.#closed ? this.#points.length : (this.#points.length - OPEN_CURVE_LAST_SEGMENT_OFFSET);
        const scaledCurveParameter  = clampedCurveParameter * segmentCount;
        const segmentIndex          = Math.min(Math.floor(scaledCurveParameter), segmentCount - OPEN_CURVE_LAST_SEGMENT_OFFSET);
        const segmentParameter      = scaledCurveParameter - segmentIndex;

        // Resolve the four control points, affecting the current segment:
        const previousControlPoint = this.#getPointForSegment(segmentIndex - ONE_VALUE);
        const startControlPoint    = this.#getPointForSegment(segmentIndex);
        const endControlPoint      = this.#getPointForSegment(segmentIndex + ONE_VALUE);
        const nextControlPoint     = this.#getPointForSegment(segmentIndex + TWO_VALUE);

        // Evaluate the Catmull-Rom spline polynomial (per-axis) using the local segment parameter powers:
        const segmentParameterSquared = segmentParameter * segmentParameter;
        const segmentParameterCubed   = segmentParameterSquared * segmentParameter;

        const x = CATMULL_ROM_TENSION * (
            (TWO_VALUE * startControlPoint.x)
            + (-previousControlPoint.x + endControlPoint.x) * segmentParameter
            + (TWO_VALUE * previousControlPoint.x - FIVE_VALUE * startControlPoint.x + FOUR_VALUE * endControlPoint.x - nextControlPoint.x) * segmentParameterSquared
            + (-previousControlPoint.x + THREE_VALUE * startControlPoint.x - THREE_VALUE * endControlPoint.x + nextControlPoint.x) * segmentParameterCubed
        );

        const y = CATMULL_ROM_TENSION * (
            (TWO_VALUE * startControlPoint.y)
            + (-previousControlPoint.y + endControlPoint.y) * segmentParameter
            + (TWO_VALUE * previousControlPoint.y - FIVE_VALUE * startControlPoint.y + FOUR_VALUE * endControlPoint.y - nextControlPoint.y) * segmentParameterSquared
            + (-previousControlPoint.y + THREE_VALUE * startControlPoint.y - THREE_VALUE * endControlPoint.y + nextControlPoint.y) * segmentParameterCubed
        );

        const z = CATMULL_ROM_TENSION * (
            (TWO_VALUE * startControlPoint.z)
            + (-previousControlPoint.z + endControlPoint.z) * segmentParameter
            + (TWO_VALUE * previousControlPoint.z - FIVE_VALUE * startControlPoint.z + FOUR_VALUE * endControlPoint.z - nextControlPoint.z) * segmentParameterSquared
            + (-previousControlPoint.z + THREE_VALUE * startControlPoint.z - THREE_VALUE * endControlPoint.z + nextControlPoint.z) * segmentParameterCubed
        );

        return out.set(x, y, z);
    }

    /**
     * @param {number} curveParameter - Parameter in [0..1].
     * @param {Vector3} [out]         - Optional output vector.
     * @returns {Vector3}
     * @throws {TypeError} When inputs are invalid.
     */
    getTangent(curveParameter, out = new Vector3()) {
        if (typeof curveParameter !== 'number' || !Number.isFinite(curveParameter)) {
            throw new TypeError('`CatmullRomCurve3.getTangent` expects `curveParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`CatmullRomCurve3.getTangent` expects `out` as a Vector3.');
        }

        // Clamp curve parameter and map it to the `segment index + local` segment parameter:
        const clampedCurveParameter = CatmullRomCurve3.#clampCurveParameter(curveParameter);
        const segmentCount          = this.#closed ? this.#points.length : (this.#points.length - OPEN_CURVE_LAST_SEGMENT_OFFSET);
        const scaledCurveParameter  = clampedCurveParameter * segmentCount;
        const segmentIndex          = Math.min(Math.floor(scaledCurveParameter), segmentCount - OPEN_CURVE_LAST_SEGMENT_OFFSET);
        const segmentParameter      = scaledCurveParameter - segmentIndex;

        // Resolve the four control points, affecting the current segment:
        const previousControlPoint = this.#getPointForSegment(segmentIndex - ONE_VALUE);
        const startControlPoint    = this.#getPointForSegment(segmentIndex);
        const endControlPoint      = this.#getPointForSegment(segmentIndex + ONE_VALUE);
        const nextControlPoint     = this.#getPointForSegment(segmentIndex + TWO_VALUE);

        // Evaluate the Catmull-Rom tangent polynomial (per-axis), then normalize it to a unit direction vector:
        const segmentParameterSquared = segmentParameter * segmentParameter;

        const x = CATMULL_ROM_TENSION * (
            (-previousControlPoint.x + endControlPoint.x)
            + (TWO_VALUE * (TWO_VALUE * previousControlPoint.x - FIVE_VALUE * startControlPoint.x + FOUR_VALUE * endControlPoint.x - nextControlPoint.x)) * segmentParameter
            + (THREE_VALUE * (-previousControlPoint.x + THREE_VALUE * startControlPoint.x - THREE_VALUE * endControlPoint.x + nextControlPoint.x)) * segmentParameterSquared
        );

        const y = CATMULL_ROM_TENSION * (
            (-previousControlPoint.y + endControlPoint.y)
            + (TWO_VALUE * (TWO_VALUE * previousControlPoint.y - FIVE_VALUE * startControlPoint.y + FOUR_VALUE * endControlPoint.y - nextControlPoint.y)) * segmentParameter
            + (THREE_VALUE * (-previousControlPoint.y + THREE_VALUE * startControlPoint.y - THREE_VALUE * endControlPoint.y + nextControlPoint.y)) * segmentParameterSquared
        );

        const z = CATMULL_ROM_TENSION * (
            (-previousControlPoint.z + endControlPoint.z)
            + (TWO_VALUE * (TWO_VALUE * previousControlPoint.z - FIVE_VALUE * startControlPoint.z + FOUR_VALUE * endControlPoint.z - nextControlPoint.z)) * segmentParameter
            + (THREE_VALUE * (-previousControlPoint.z + THREE_VALUE * startControlPoint.z - THREE_VALUE * endControlPoint.z + nextControlPoint.z)) * segmentParameterSquared
        );

        const length = Math.sqrt((x * x) + (y * y) + (z * z));

        if (length <= TANGENT_EPSILON) {
            return out.set(ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
        }

        return out.set(x / length, y / length, z / length);
    }

    /**
     * @param {number} index - Segment index.
     * @returns {Vector3}
     * @private
     */
    #getPointForSegment(index) {
        const pointCount = this.#points.length;

        if (this.#closed) {
            const wrappedIndex = ((index % pointCount) + pointCount) % pointCount;
            return this.#points[wrappedIndex];
        }

        if (index < ZERO_VALUE) {
            return this.#points[ZERO_VALUE];
        }

        if (index >= pointCount) {
            return this.#points[pointCount - ONE_VALUE];
        }

        return this.#points[index];
    }

    /**
     * @param {number} curveParameter - Parameter value.
     * @returns {number}
     * @private
     */
    static #clampCurveParameter(curveParameter) {
        if (curveParameter <= CURVE_PARAMETER_MIN) {
            return CURVE_PARAMETER_MIN;
        }

        if (curveParameter >= CURVE_PARAMETER_MAX) {
            return CURVE_PARAMETER_MAX;
        }

        return curveParameter;
    }
}
