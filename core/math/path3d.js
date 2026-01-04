import { Vector3 } from './vector3.js';

/**
 * Minimum point count for a path.
 *
 * @type {number}
 */
const MIN_POINT_COUNT = 2;

/**
 * Default loop flag.
 *
 * @type {boolean}
 */
const DEFAULT_LOOP = false;

/**
 * Start index for segment traversal.
 *
 * @type {number}
 */
const SEGMENT_START_INDEX = 0;

/**
 * Segment index increment.
 *
 * @type {number}
 */
const SEGMENT_INDEX_INCREMENT = 1;

/**
 * Zero value constant.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * One value constant.
 *
 * @type {number}
 */
const ONE_VALUE = 1;

/**
 * Epsilon used for safe normalization.
 *
 * @type {number}
 */
const NORMALIZE_EPSILON = 1e-8;

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
     * @param {Vector3[]} points             - Path points.
     * @param {Object} [options]             - Optional options.
     * @param {boolean} [options.loop=false] - Whether the path is looped.
     * @throws {TypeError}  When inputs are invalid.
     * @throws {RangeError} When points are insufficient.
     */
    constructor(points, options = {}) {
        if (!Array.isArray(points)) {
            throw new TypeError('`Path3D` expects `points` as an array of `Vector3`.');
        }

        if (points.length < MIN_POINT_COUNT) {
            throw new RangeError('`Path3D` expects at least the 2 points.');
        }

        for (const point of points) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('`Path3D` expects all points to be `Vector3` instances.');
            }
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`Path3D` expects options as a plain object.');
        }

        const { loop = DEFAULT_LOOP } = options;

        if (typeof loop !== 'boolean') {
            throw new TypeError('`Path3D` option `loop` must be a boolean.');
        }

        this.#points            = points.slice();
        this.#loop              = loop;
        this.#segmentLengths    = new Float32Array(this.#getSegmentCount());
        this.#cumulativeLengths = new Float32Array(this.#segmentLengths.length + ONE_VALUE);
        this.#totalLength       = ZERO_VALUE;
        this.#recalculateLengths();
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
    get loop() {
        return this.#loop;
    }

    /**
     * @returns {number}
     */
    get totalLength() {
        return this.#totalLength;
    }

    /**
     * Returns a point at normalized position along the path (arc-length parameterization).
     *
     * @param {number} pathParameter - Normalized path parameter in [0..1].
     * @param {Vector3} [out]        - Optional output vector.
     * @returns {Vector3}
     * @throws {TypeError} When inputs are invalid.
     */
    getPointAt(pathParameter, out = new Vector3()) {
        if (typeof pathParameter !== 'number' || !Number.isFinite(pathParameter)) {
            throw new TypeError('`Path3D.getPointAt` expects `pathParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`Path3D.getPointAt` expects `out` as a `Vector3`.');
        }

        if (this.#totalLength <= ZERO_VALUE) {
            return out.copyFrom(this.#points[ZERO_VALUE]);
        }

        const normalizedPathParameter = this.#normalizePathParameter(pathParameter);
        const targetLength            = normalizedPathParameter * this.#totalLength;
        const segmentData             = this.#findSegmentAtLength(targetLength);
        const pointA                  = this.#points[segmentData.index];
        const pointB                  = this.#getNextPoint(segmentData.index);

        const segmentParameter = segmentData.length <= ZERO_VALUE
            ? ZERO_VALUE
            : (targetLength - segmentData.cumulativeLength) / segmentData.length;

        const x = pointA.x + (pointB.x - pointA.x) * segmentParameter;
        const y = pointA.y + (pointB.y - pointA.y) * segmentParameter;
        const z = pointA.z + (pointB.z - pointA.z) * segmentParameter;
        return out.set(x, y, z);
    }

    /**
     * Returns a normalized tangent at normalized position along the path (arc-length parameterization).
     *
     * @param {number} pathParameter - Normalized path parameter in [0..1].
     * @param {Vector3} [out]        - Optional output vector.
     * @returns {Vector3}
     * @throws {TypeError} When inputs are invalid.
     */
    getTangentAt(pathParameter, out = new Vector3()) {
        if (typeof pathParameter !== 'number' || !Number.isFinite(pathParameter)) {
            throw new TypeError('`Path3D.getTangentAt` expects `pathParameter` as a finite number.');
        }

        if (!(out instanceof Vector3)) {
            throw new TypeError('`Path3D.getTangentAt` expects `out` as a `Vector3`.');
        }

        // Normalize the path parameter and resolve the corresponding segment by arc-length:
        const normalizedPathParameter = this.#normalizePathParameter(pathParameter);
        const targetLength            = normalizedPathParameter * this.#totalLength;
        const segmentData             = this.#findSegmentAtLength(targetLength);
        const pointA                  = this.#points[segmentData.index];
        const pointB                  = this.#getNextPoint(segmentData.index);

        // Compute the raw segment direction vector as a delta between the segment endpoints:
        const deltaX = pointB.x - pointA.x;
        const deltaY = pointB.y - pointA.y;
        const deltaZ = pointB.z - pointA.z;

        // Normalize the direction vector to produce a unit tangent:
        const tangentLength = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));

        if (tangentLength <= NORMALIZE_EPSILON) {
            return out.set(ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
        }

        return out.set(deltaX / tangentLength, deltaY / tangentLength, deltaZ / tangentLength);
    }

    /**
     * @returns {number}
     * @private
     */
    #getSegmentCount() {
        return this.#loop ? this.#points.length : (this.#points.length - ONE_VALUE);
    }

    /**
     * @param {number} length - Target length along the path.
     * @returns {{index: number, length: number, cumulativeLength: number}}
     * @private
     */
    #findSegmentAtLength(length) {
        const segmentCount = this.#segmentLengths.length;

        for (let index = SEGMENT_START_INDEX; index < segmentCount; index += SEGMENT_INDEX_INCREMENT) {
            const segmentLength    = this.#segmentLengths[index];
            const cumulativeLength = this.#cumulativeLengths[index];

            if (length <= cumulativeLength + segmentLength) {
                return {
                    index,
                    length : segmentLength,
                    cumulativeLength
                };
            }
        }

        const lastIndex = segmentCount - ONE_VALUE;

        return {
            index            : lastIndex,
            length           : this.#segmentLengths[lastIndex],
            cumulativeLength : this.#cumulativeLengths[lastIndex]
        };
    }

    /**
     * @param {number} index - Segment start index.
     * @returns {Vector3}
     * @private
     */
    #getNextPoint(index) {
        if (this.#loop) {
            const nextIndex = (index + ONE_VALUE) % this.#points.length;
            return this.#points[nextIndex];
        }

        return this.#points[Math.min(index + ONE_VALUE, this.#points.length - ONE_VALUE)];
    }

    /**
     * @param {number} pathParameter - Path parameter to normalize.
     * @returns {number}
     * @private
     */
    #normalizePathParameter(pathParameter) {
        if (this.#loop) {
            const wrapped = pathParameter - Math.floor(pathParameter);
            return wrapped < ZERO_VALUE ? wrapped + ONE_VALUE : wrapped;
        }

        if (pathParameter <= ZERO_VALUE) {
            return ZERO_VALUE;
        }

        if (pathParameter >= ONE_VALUE) {
            return ONE_VALUE;
        }

        return pathParameter;
    }

    /**
     * @private
     */
    #recalculateLengths() {
        const segmentCount                  = this.#segmentLengths.length;
        let cumulativeLength                = ZERO_VALUE;
        this.#cumulativeLengths[ZERO_VALUE] = cumulativeLength;

        for (let index = SEGMENT_START_INDEX; index < segmentCount; index += SEGMENT_INDEX_INCREMENT) {
            const pointA = this.#points[index];
            const pointB = this.#getNextPoint(index);
            const length = Path3D.#distance(pointA, pointB);

            this.#segmentLengths[index] = length;
            cumulativeLength += length;
            this.#cumulativeLengths[index + ONE_VALUE] = cumulativeLength;
        }

        this.#totalLength = cumulativeLength;
    }

    /**
     * @param {Vector3} pointA - First point.
     * @param {Vector3} pointB - Second point.
     * @returns {number}
     * @private
     */
    static #distance(pointA, pointB) {
        const deltaX = pointB.x - pointA.x;
        const deltaY = pointB.y - pointA.y;
        const deltaZ = pointB.z - pointA.z;
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
    }
}
