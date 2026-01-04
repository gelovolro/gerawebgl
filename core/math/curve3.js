import { Vector3 } from './vector3.js';

/**
 * Default segment count for curve sampling.
 *
 * @type {number}
 */
const DEFAULT_SAMPLE_SEGMENTS = 32;

/**
 * Minimum allowed segment count.
 *
 * @type {number}
 */
const MIN_SAMPLE_SEGMENTS = 1;

/**
 * Start value for the sampling loop.
 *
 * @type {number}
 */
const SAMPLE_START_INDEX = 0;

/**
 * Step to increment the sample index.
 *
 * @type {number}
 */
const SAMPLE_INDEX_INCREMENT = 1;

/**
 * First sample value.
 *
 * @type {number}
 */
const SAMPLE_START_PARAMETER = 0;

/**
 * End sample value.
 *
 * @type {number}
 */
const SAMPLE_END_PARAMETER = 1;

/**
 * Base class for 3D curves.
 */
export class Curve3 {

    /**
     * Abstract curve base.
     *
     * @throws {Error} When instantiated directly.
     */
    constructor() {
        if (new.target === Curve3) {
            throw new Error('`Curve3` is abstract and must be subclassed.');
        }
    }

    /* eslint-disable */

    /**
     * Computes a point on the curve at normalized parameter.
     *
     * @param {number} normalizedParameter - Parameter in [0..1].
     * @param {Vector3} [out]              - Optional output vector.
     * @returns {Vector3}
     * @throws {Error} When not implemented by subclass.
     */
    getPoint(normalizedParameter, out = new Vector3()) {
        throw new Error('`Curve3.getPoint` must be implemented in subclasses.');
    }

    /**
     * Computes a tangent on the curve at normalized parameter.
     *
     * @param {number} normalizedParameter - Parameter in [0..1].
     * @param {Vector3} [out]              - Optional output vector.
     * @returns {Vector3}
     * @throws {Error} When not implemented by subclass.
     */
    getTangent(normalizedParameter, out = new Vector3()) {
        throw new Error('`Curve3.getTangent` must be implemented in subclasses.');
    }

    /* eslint-enable */

    /**
     * Returns a point on the curve at normalized parameter.
     *
     * @param {number} normalizedParameter - Parameter in [0..1].
     * @param {Vector3} [out]              - Optional output vector.
     * @returns {Vector3}
     * @throws {Error} When not implemented by subclass.
     */
    getPointAt(normalizedParameter, out = new Vector3()) {
        return this.getPoint(normalizedParameter, out);
    }

    /**
     * Returns a tangent on the curve at normalized parameter.
     *
     * @param {number} normalizedParameter - Parameter in [0..1].
     * @param {Vector3} [out]              - Optional output vector.
     * @returns {Vector3}
     * @throws {Error} When not implemented by subclass.
     */
    getTangentAt(normalizedParameter, out = new Vector3()) {
        return this.getTangent(normalizedParameter, out);
    }

    /**
     * Samples the curve into the polyline.
     *
     * @param {number} [segments = 32] - Sample segment count.
     * @returns {Vector3[]}
     * @throws {TypeError}  When segments is not a finite number.
     * @throws {RangeError} When segments is not an `integer >= 1`.
     */
    getPoints(segments = DEFAULT_SAMPLE_SEGMENTS) {
        if (typeof segments !== 'number' || !Number.isFinite(segments)) {
            throw new TypeError('`Curve3.getPoints` expects `segments` as a finite number.');
        }

        if (!Number.isInteger(segments) || segments < MIN_SAMPLE_SEGMENTS) {
            throw new RangeError('`Curve3.getPoints` expects `segments` as an integer >= 1.');
        }

        const points       = [];
        const segmentCount = segments;
        const maxIndex     = segmentCount;

        for (let index = SAMPLE_START_INDEX; index <= maxIndex; index += SAMPLE_INDEX_INCREMENT) {
            const sampleParameter = SAMPLE_START_PARAMETER + (SAMPLE_END_PARAMETER - SAMPLE_START_PARAMETER) * (index / segmentCount);
            points.push(this.getPoint(sampleParameter, new Vector3()));
        }

        return points;
    }
}
