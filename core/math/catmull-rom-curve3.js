import * as CatmullRomConstants from '../constants/catmull-rom-curve3.js';
import { Curve3 }               from './curve3.js';
import { Vector3 }              from './vector3.js';

/**
 * Catmull-Rom curve segment data.
 *
 * @typedef {Object} CatmullRomSegment
 * @property {Vector3} previous  - Previous control point.
 * @property {Vector3} start     - Segment start control point.
 * @property {Vector3} end       - Segment end control point.
 * @property {Vector3} next      - Next control point.
 * @property {number}  parameter - Local segment parameter.
 */

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
     * Reusable segment data, avoiding allocations during animation updates.
     *
     * @type {CatmullRomSegment}
     * @private
     */
    #segment;

    /**
     * @param {Vector3[]} points               - Control points.
     * @param {Object} [options]               - Optional options.
     * @param {boolean} [options.closed=false] - Whether the curve is closed.
     * @throws {TypeError}                       When inputs are invalid.
     * @throws {RangeError}                      When points are insufficient.
     */
    constructor(points, options = {}) {
        super();

        if (!Array.isArray(points)) {
            throw new TypeError('`CatmullRomCurve3` expects `points` as an array of `Vector3`.');
        }

        if (points.length < CatmullRomConstants.CATMULL_ROM_DEFAULTS.MIN_CONTROL_POINTS) {
            throw new RangeError('`CatmullRomCurve3` expects at least two control points.');
        }

        for (const point of points) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('`CatmullRomCurve3` expects all points to be `Vector3` instances.');
            }
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`CatmullRomCurve3` expects options as a plain object.');
        }

        const { closed = CatmullRomConstants.CATMULL_ROM_DEFAULTS.CLOSED } = options;

        if (typeof closed !== 'boolean') {
            throw new TypeError('`CatmullRomCurve3` option `closed` must be a boolean.');
        }

        this.#points  = points.slice();
        this.#closed  = closed;
        this.#segment = {
            previous  : this.#points[CatmullRomConstants.CATMULL_ROM_VALUES.ZERO],
            start     : this.#points[CatmullRomConstants.CATMULL_ROM_VALUES.ZERO],
            end       : this.#points[CatmullRomConstants.CATMULL_ROM_VALUES.ZERO],
            next      : this.#points[CatmullRomConstants.CATMULL_ROM_VALUES.ZERO],
            parameter : CatmullRomConstants.CATMULL_ROM_VALUES.ZERO
        };
    }

    /**
     * @returns {Vector3[]} - Control points defining the curve.
     */
    get points() {
        return this.#points;
    }

    /**
     * @returns {boolean} - Whether the curve is closed.
     */
    get closed() {
        return this.#closed;
    }

    /**
     * Returns an interpolated point on the curve.
     *
     * @param {number} curveParameter - Parameter in [0..1].
     * @param {Vector3} [out]         - Optional output vector.
     * @returns {Vector3}             - Interpolated point written to `out`.
     * @throws {TypeError}              When inputs are invalid.
     */
    getPoint(curveParameter, out = new Vector3()) {
        if (typeof curveParameter !== 'number' || !Number.isFinite(curveParameter)) {
            throw new TypeError('`CatmullRomCurve3.getPoint` expects `curveParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`CatmullRomCurve3.getPoint` expects `out` as a Vector3.');
        }

        const { previous, start, end, next, parameter } = this.#resolveSegment(curveParameter);
        const x = CatmullRomCurve3.#interpolateCoordinate(previous.x, start.x, end.x, next.x, parameter);
        const y = CatmullRomCurve3.#interpolateCoordinate(previous.y, start.y, end.y, next.y, parameter);
        const z = CatmullRomCurve3.#interpolateCoordinate(previous.z, start.z, end.z, next.z, parameter);
        return out.set(x, y, z);
    }

    /**
     * Returns a normalized tangent direction at the given curve parameter.
     *
     * @param {number} curveParameter - Parameter in [0..1].
     * @param {Vector3} [out]         - Optional output vector.
     * @returns {Vector3}             - Normalized tangent written to `out`, or a zero vector for a degenerate tangent.
     * @throws {TypeError}              When inputs are invalid.
     */
    getTangent(curveParameter, out = new Vector3()) {
        if (typeof curveParameter !== 'number' || !Number.isFinite(curveParameter)) {
            throw new TypeError('`CatmullRomCurve3.getTangent` expects `curveParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`CatmullRomCurve3.getTangent` expects `out` as a Vector3.');
        }

        const { previous, start, end, next, parameter } = this.#resolveSegment(curveParameter);
        const x      = CatmullRomCurve3.#calculateTangentCoordinate(previous.x, start.x, end.x, next.x, parameter);
        const y      = CatmullRomCurve3.#calculateTangentCoordinate(previous.y, start.y, end.y, next.y, parameter);
        const z      = CatmullRomCurve3.#calculateTangentCoordinate(previous.z, start.z, end.z, next.z, parameter);
        const length = Math.sqrt((x * x) + (y * y) + (z * z));

        if (length <= CatmullRomConstants.CATMULL_ROM_TANGENT.EPSILON) {
            return out.set(
                CatmullRomConstants.CATMULL_ROM_VALUES.ZERO,
                CatmullRomConstants.CATMULL_ROM_VALUES.ZERO,
                CatmullRomConstants.CATMULL_ROM_VALUES.ZERO
            );
        }

        return out.set(x / length, y / length, z / length);
    }

    /**
     * Resolves the segment and reuses its four control point references.
     *
     * @param {number} curveParameter - Finite curve parameter.
     * @returns {CatmullRomSegment}   - Resolved segment data.
     * @private
     */
    #resolveSegment(curveParameter) {
        // Clamp the curve parameter and convert it to a local segment parameter:
        const clampedCurveParameter = CatmullRomCurve3.#clampCurveParameter(curveParameter);
        const segmentCount          = this.#closed ? this.#points.length : (this.#points.length - CatmullRomConstants.CATMULL_ROM_VALUES.ONE);
        const scaledCurveParameter  = clampedCurveParameter * segmentCount;
        const segmentIndex          = Math.min(Math.floor(scaledCurveParameter), segmentCount - CatmullRomConstants.CATMULL_ROM_VALUES.ONE);
        const parameter             = scaledCurveParameter - segmentIndex;

        const segment     = this.#segment;
        segment.previous  = this.#getPointForSegment(segmentIndex - CatmullRomConstants.CATMULL_ROM_VALUES.ONE);
        segment.start     = this.#getPointForSegment(segmentIndex);
        segment.end       = this.#getPointForSegment(segmentIndex + CatmullRomConstants.CATMULL_ROM_VALUES.ONE);
        segment.next      = this.#getPointForSegment(segmentIndex + CatmullRomConstants.CATMULL_ROM_VALUES.TWO);
        segment.parameter = parameter;
        return segment;
    }

    /**
     * Interpolates one coordinate using the Catmull-Rom polynomial.
     *
     * @param {number} previous  - Previous control point coordinate.
     * @param {number} start     - Segment start coordinate.
     * @param {number} end       - Segment end coordinate.
     * @param {number} next      - Next control point coordinate.
     * @param {number} parameter - Local segment parameter.
     * @returns {number}         - Interpolated coordinate value.
     * @private
     */
    static #interpolateCoordinate(previous, start, end, next, parameter) {
        const polynomial = CatmullRomConstants.CATMULL_ROM_VALUES;
        const squared    = parameter * parameter;
        const cubed      = squared * parameter;

        return polynomial.TENSION * (
            (polynomial.TWO * start)
            + (-previous + end) * parameter
            + (polynomial.TWO * previous - polynomial.FIVE * start + polynomial.FOUR * end - next) * squared
            + (-previous + polynomial.THREE * start - polynomial.THREE * end + next) * cubed
        );
    }

    /**
     * Evaluates the derivative of one Catmull-Rom coordinate.
     *
     * @param {number} previous  - Previous control point coordinate.
     * @param {number} start     - Segment start coordinate.
     * @param {number} end       - Segment end coordinate.
     * @param {number} next      - Next control point coordinate.
     * @param {number} parameter - Local segment parameter.
     * @returns {number}         - Unnormalized tangent coordinate.
     * @private
     */
    static #calculateTangentCoordinate(previous, start, end, next, parameter) {
        const polynomial = CatmullRomConstants.CATMULL_ROM_VALUES;
        const squared    = parameter * parameter;

        return polynomial.TENSION * (
            (-previous + end)
            + (polynomial.TWO * (polynomial.TWO * previous - polynomial.FIVE * start + polynomial.FOUR * end - next)) * parameter
            + (polynomial.THREE * (-previous + polynomial.THREE * start - polynomial.THREE * end + next)) * squared
        );
    }

    /**
     * Resolves a control point index for open or closed curves.
     *
     * @param {number} index - Control point index.
     * @returns {Vector3}    - Control point at the clamped or wrapped index.
     * @private
     */
    #getPointForSegment(index) {
        const pointCount = this.#points.length;

        if (this.#closed) {
            const wrappedIndex = ((index % pointCount) + pointCount) % pointCount;
            return this.#points[wrappedIndex];
        }

        if (index < CatmullRomConstants.CATMULL_ROM_VALUES.ZERO) {
            return this.#points[CatmullRomConstants.CATMULL_ROM_VALUES.ZERO];
        }

        if (index >= pointCount) {
            return this.#points[pointCount - CatmullRomConstants.CATMULL_ROM_VALUES.ONE];
        }

        return this.#points[index];
    }

    /**
     * Clamps a curve parameter to the valid interval.
     *
     * @param {number} curveParameter - Curve parameter.
     * @returns {number}              - Parameter clamped to [0..1].
     * @private
     */
    static #clampCurveParameter(curveParameter) {
        if (curveParameter <= CatmullRomConstants.CATMULL_ROM_VALUES.ZERO) {
            return CatmullRomConstants.CATMULL_ROM_VALUES.ZERO;
        }

        if (curveParameter >= CatmullRomConstants.CATMULL_ROM_VALUES.ONE) {
            return CatmullRomConstants.CATMULL_ROM_VALUES.ONE;
        }

        return curveParameter;
    }
}
