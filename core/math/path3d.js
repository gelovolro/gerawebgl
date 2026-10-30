import * as Path3DConstants   from '../constants/path3d.js';
import { MATH_COMMON_VALUES } from '../constants/math.js';
import { Vector3 }            from './vector3.js';

/**
 * Reusable data for the current path segment.
 *
 * @typedef {Object} Path3DSegment
 * @property {Vector3} start     - Segment start point.
 * @property {Vector3} end       - Segment end point.
 * @property {number}  parameter - Local segment parameter.
 */

/**
 * Path built from 3D points.
 * Provides arc-length parameterization with cached segment lengths.
 */
export class Path3D {

    /**
     * Internal copy of path points, used for sampling and interpolation.
     *
     * @type {Vector3[]}
     * @private
     */
    #points;

    /**
     * Cached per-segment lengths (distance between consecutive points).
     *
     * @type {Float32Array}
     * @private
     */
    #segmentLengths;

    /**
     * Cached cumulative segment lengths where index stores the length up to point.
     *
     * @type {Float32Array}
     * @private
     */
    #cumulativeLengths;

    /**
     * Total path length (sum of all segment lengths).
     *
     * @type {number}
     * @private
     */
    #totalLength;

    /**
     * Whether the path is looped (wraps from the last point back to the first).
     *
     * @type {boolean}
     * @private
     */
    #loop;

    /**
     * Reusable segment data, avoiding allocations during animation updates.
     *
     * @type {Path3DSegment}
     * @private
     */
    #segment;

    /**
     * @param {Vector3[]} points             - Path points.
     * @param {Object} [options]             - Optional options.
     * @param {boolean} [options.loop=false] - Whether the path is looped.
     * @throws {TypeError}                     When inputs are invalid.
     * @throws {RangeError}                    When points are insufficient.
     */
    constructor(points, options = {}) {
        if (!Array.isArray(points)) {
            throw new TypeError('`Path3D` expects `points` as an array of `Vector3`.');
        }

        if (points.length < Path3DConstants.PATH3D_DEFAULTS.MIN_POINTS) {
            throw new RangeError('`Path3D` expects at least two points.');
        }

        for (const point of points) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('`Path3D` expects all points to be `Vector3` instances.');
            }
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`Path3D` expects options as a plain object.');
        }

        const { loop = Path3DConstants.PATH3D_DEFAULTS.LOOP } = options;

        if (typeof loop !== 'boolean') {
            throw new TypeError('`Path3D` option `loop` must be a boolean.');
        }

        this.#points            = points.slice();
        this.#loop              = loop;
        this.#segmentLengths    = new Float32Array(this.#getSegmentCount());
        this.#cumulativeLengths = new Float32Array(this.#segmentLengths.length + MATH_COMMON_VALUES.UNIT);
        this.#totalLength       = MATH_COMMON_VALUES.ZERO;
        this.#segment           = {
            start     : this.#points[MATH_COMMON_VALUES.ZERO],
            end       : this.#points[MATH_COMMON_VALUES.UNIT],
            parameter : MATH_COMMON_VALUES.ZERO
        };

        this.#recalculateLengths();
    }

    /**
     * @returns {Vector3[]} - Control point references used by the path.
     */
    get points() {
        return this.#points;
    }

    /**
     * @returns {boolean} - Whether the path connects its last point to the first.
     */
    get loop() {
        return this.#loop;
    }

    /**
     * @returns {number} - Cached total length of the path.
     */
    get totalLength() {
        return this.#totalLength;
    }

    /**
     * Returns an interpolated point at a normalized distance along the path.
     *
     * @param {number} pathParameter - Normalized path parameter in [0..1].
     * @param {Vector3} [out]        - Optional output vector.
     * @returns {Vector3}            - Interpolated point written to `out`.
     * @throws {TypeError}             When inputs are invalid.
     */
    getPointAt(pathParameter, out = new Vector3()) {
        if (typeof pathParameter !== 'number' || !Number.isFinite(pathParameter)) {
            throw new TypeError('`Path3D.getPointAt` expects `pathParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`Path3D.getPointAt` expects `out` as a `Vector3`.');
        }

        if (this.#totalLength <= MATH_COMMON_VALUES.ZERO) {
            return out.copyFrom(this.#points[MATH_COMMON_VALUES.ZERO]);
        }

        const { start, end, parameter } = this.#resolveSegment(pathParameter);
        const x = start.x + (end.x - start.x) * parameter;
        const y = start.y + (end.y - start.y) * parameter;
        const z = start.z + (end.z - start.z) * parameter;
        return out.set(x, y, z);
    }

    /**
     * Returns a normalized tangent at a normalized distance along the path.
     *
     * @param {number} pathParameter - Normalized path parameter in [0..1].
     * @param {Vector3} [out]        - Optional output vector.
     * @returns {Vector3}            - Normalized tangent written to `out`, or zero for a degenerate segment.
     * @throws {TypeError}             When inputs are invalid.
     */
    getTangentAt(pathParameter, out = new Vector3()) {
        if (typeof pathParameter !== 'number' || !Number.isFinite(pathParameter)) {
            throw new TypeError('`Path3D.getTangentAt` expects `pathParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`Path3D.getTangentAt` expects `out` as a `Vector3`.');
        }

        const { start, end } = this.#resolveSegment(pathParameter);
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        const deltaZ = end.z - start.z;
        const length = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));

        if (length <= Path3DConstants.PATH3D_TANGENT.EPSILON) {
            return out.set(MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);
        }

        return out.set(deltaX / length, deltaY / length, deltaZ / length);
    }

    /**
     * Resolves the segment at the normalized path parameter.
     *
     * @param {number} pathParameter - Finite path parameter.
     * @returns {Path3DSegment}      - Reused segment data with local interpolation parameter.
     * @private
     */
    #resolveSegment(pathParameter) {
        const normalizedParameter = this.#normalizePathParameter(pathParameter);
        const targetLength        = normalizedParameter * this.#totalLength;
        const segmentIndex        = this.#findSegmentAtLength(targetLength);
        const segmentLength       = this.#segmentLengths[segmentIndex];
        const cumulativeLength    = this.#cumulativeLengths[segmentIndex];

        const segmentParameter = segmentLength <= MATH_COMMON_VALUES.ZERO
            ? MATH_COMMON_VALUES.ZERO
            : (targetLength - cumulativeLength) / segmentLength;

        const segment = this.#segment;
        segment.start     = this.#points[segmentIndex];
        segment.end       = this.#getNextPoint(segmentIndex);
        segment.parameter = segmentParameter;
        return segment;
    }

    /**
     * @returns {number} - Number of segments in the path.
     * @private
     */
    #getSegmentCount() {
        return this.#loop ? this.#points.length : (this.#points.length - MATH_COMMON_VALUES.UNIT);
    }

    /**
     * Resolves the segment containing the specified cumulative length.
     *
     * @param {number} length - Target distance along the path.
     * @returns {number}      - Index of the containing segment.
     * @private
     */
    #findSegmentAtLength(length) {
        const segmentCount = this.#segmentLengths.length;

        for (
            let index = Path3DConstants.PATH3D_SEGMENTS.START_INDEX;
            index < segmentCount;
            index += Path3DConstants.PATH3D_SEGMENTS.INDEX_INCREMENT
        ) {
            const segmentLength    = this.#segmentLengths[index];
            const cumulativeLength = this.#cumulativeLengths[index];

            if (length <= cumulativeLength + segmentLength) {
                return index;
            }
        }

        return segmentCount - MATH_COMMON_VALUES.UNIT;
    }

    /**
     * Returns the next control point, wrapping for closed paths.
     *
     * @param {number} index - Segment start index.
     * @returns {Vector3}    - Next point for the selected segment.
     * @private
     */
    #getNextPoint(index) {
        if (this.#loop) {
            const nextIndex = (index + MATH_COMMON_VALUES.UNIT) % this.#points.length;
            return this.#points[nextIndex];
        }

        return this.#points[Math.min(index + MATH_COMMON_VALUES.UNIT, this.#points.length - MATH_COMMON_VALUES.UNIT)];
    }

    /**
     * Clamps or wraps the normalized path parameter.
     *
     * @param {number} pathParameter - Finite path parameter.
     * @returns {number}             - Normalized parameter in [0..1].
     * @private
     */
    #normalizePathParameter(pathParameter) {
        if (this.#loop) {
            return pathParameter - Math.floor(pathParameter);
        }

        if (pathParameter <= MATH_COMMON_VALUES.ZERO) {
            return MATH_COMMON_VALUES.ZERO;
        }

        if (pathParameter >= MATH_COMMON_VALUES.UNIT) {
            return MATH_COMMON_VALUES.UNIT;
        }

        return pathParameter;
    }

    /**
     * Rebuilds the cached segment lengths and total path length.
     *
     * @returns {void}
     * @private
     */
    #recalculateLengths() {
        const segmentCount   = this.#segmentLengths.length;
        let cumulativeLength = MATH_COMMON_VALUES.ZERO;
        this.#cumulativeLengths[MATH_COMMON_VALUES.ZERO] = cumulativeLength;

        for (
            let index = Path3DConstants.PATH3D_SEGMENTS.START_INDEX;
            index < segmentCount;
            index += Path3DConstants.PATH3D_SEGMENTS.INDEX_INCREMENT
        ) {
            const pointA = this.#points[index];
            const pointB = this.#getNextPoint(index);
            const length = Path3D.#distance(pointA, pointB);

            this.#segmentLengths[index] = length;
            cumulativeLength += length;
            this.#cumulativeLengths[index + MATH_COMMON_VALUES.UNIT] = cumulativeLength;
        }

        this.#totalLength = cumulativeLength;
    }

    /**
     * Computes the Euclidean distance without extra vector allocations.
     *
     * @param {Vector3} pointA - First point.
     * @param {Vector3} pointB - Second point.
     * @returns {number}       - Distance between the points.
     * @private
     */
    static #distance(pointA, pointB) {
        const deltaX = pointB.x - pointA.x;
        const deltaY = pointB.y - pointA.y;
        const deltaZ = pointB.z - pointA.z;
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
    }
}
