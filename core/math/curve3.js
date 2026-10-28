import { CURVE3_SAMPLING } from '../constants/curve3.js';
import { Vector3 }         from './vector3.js';

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
    getPoints(segments = CURVE3_SAMPLING.DEFAULT_SEGMENTS) {
        if (typeof segments !== 'number' || !Number.isFinite(segments)) {
            throw new TypeError('`Curve3.getPoints` expects `segments` as a finite number.');
        }

        if (!Number.isInteger(segments) || segments < CURVE3_SAMPLING.MIN_SEGMENTS) {
            throw new RangeError('Curve3.getPoints: `segments` must be a positive integer.');
        }

        const points = [];

        for (let index = CURVE3_SAMPLING.START_INDEX; index <= segments; index += CURVE3_SAMPLING.INDEX_INCREMENT) {
            const sampleParameter =
                CURVE3_SAMPLING.START_PARAMETER +
                (CURVE3_SAMPLING.END_PARAMETER - CURVE3_SAMPLING.START_PARAMETER) *
                (index / segments);

            points.push(this.getPoint(sampleParameter, new Vector3()));
        }

        return points;
    }
}
