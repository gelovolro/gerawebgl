import { Vector3 } from './vector3.js';

/**
 * Number of components in a 3D vector.
 *
 * @type {number}
 */
const VECTOR3_COMPONENT_COUNT = 3;

/**
 * Component index for X.
 *
 * @type {number}
 */
const VECTOR3_X_INDEX = 0;

/**
 * Component index for Y.
 *
 * @type {number}
 */
const VECTOR3_Y_INDEX = 1;

/**
 * Component index for Z.
 *
 * @type {number}
 */
const VECTOR3_Z_INDEX = 2;

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
 * Default epsilon for approximate comparisons.
 *
 * @type {number}
 */
const DEFAULT_EPSILON = 1e-6;

/**
 * Minimum length for safe normalization.
 *
 * @type {number}
 */
const MIN_NORMALIZE_LENGTH = 1e-8;

/**
 * 3D vector math utilities.
 */
export class Vector3Math {

    /**
     * Adds two vectors.
     *
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {Vector3 | Float32Array} firstVector  - First vector.
     * @param {Vector3 | Float32Array} secondVector - Second vector.
     * @returns {Vector3 | Float32Array}
     * @throws {TypeError}  When any vector is invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static add(outputVector, firstVector, secondVector) {
        Vector3Math.#assertVector3Like(outputVector, 'outputVector');
        Vector3Math.#assertVector3Like(firstVector, 'firstVector');
        Vector3Math.#assertVector3Like(secondVector, 'secondVector');

        const x = Vector3Math.#getX(firstVector) + Vector3Math.#getX(secondVector);
        const y = Vector3Math.#getY(firstVector) + Vector3Math.#getY(secondVector);
        const z = Vector3Math.#getZ(firstVector) + Vector3Math.#getZ(secondVector);
        return Vector3Math.#write(outputVector, x, y, z);
    }

    /**
     * Subtracts the second vector from the first vector.
     *
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {Vector3 | Float32Array} firstVector  - First vector.
     * @param {Vector3 | Float32Array} secondVector - Second vector.
     * @returns {Vector3 | Float32Array}
     * @throws {TypeError}  When any vector is invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static sub(outputVector, firstVector, secondVector) {
        Vector3Math.#assertVector3Like(outputVector, 'outputVector');
        Vector3Math.#assertVector3Like(firstVector, 'firstVector');
        Vector3Math.#assertVector3Like(secondVector, 'secondVector');

        const x = Vector3Math.#getX(firstVector) - Vector3Math.#getX(secondVector);
        const y = Vector3Math.#getY(firstVector) - Vector3Math.#getY(secondVector);
        const z = Vector3Math.#getZ(firstVector) - Vector3Math.#getZ(secondVector);
        return Vector3Math.#write(outputVector, x, y, z);
    }

    /**
     * Scales a vector by a scalar.
     *
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {Vector3 | Float32Array} inputVector  - Input vector.
     * @param {number} scalar                       - Scalar multiplier.
     * @returns {Vector3 | Float32Array}
     * @throws {TypeError}  When vectors or scalar are invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static scale(outputVector, inputVector, scalar) {
        Vector3Math.#assertVector3Like(outputVector, 'outputVector');
        Vector3Math.#assertVector3Like(inputVector, 'inputVector');

        if (typeof scalar !== 'number' || !Number.isFinite(scalar)) {
            throw new TypeError('`Vector3Math.scale` expects `scalar` as a finite number.');
        }

        const x = Vector3Math.#getX(inputVector) * scalar;
        const y = Vector3Math.#getY(inputVector) * scalar;
        const z = Vector3Math.#getZ(inputVector) * scalar;
        return Vector3Math.#write(outputVector, x, y, z);
    }

    /**
     * Computes vector length.
     *
     * @param {Vector3 | Float32Array} inputVector - Input vector.
     * @returns {number}
     * @throws {TypeError}  When vector is invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static length(inputVector) {
        Vector3Math.#assertVector3Like(inputVector, 'inputVector');

        const x = Vector3Math.#getX(inputVector);
        const y = Vector3Math.#getY(inputVector);
        const z = Vector3Math.#getZ(inputVector);
        return Math.sqrt((x * x) + (y * y) + (z * z));
    }

    /**
     * Computes distance between two vectors.
     *
     * @param {Vector3 | Float32Array} firstVector  - First vector.
     * @param {Vector3 | Float32Array} secondVector - Second vector.
     * @returns {number}
     * @throws {TypeError}  When vectors are invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static distance(firstVector, secondVector) {
        Vector3Math.#assertVector3Like(firstVector, 'firstVector');
        Vector3Math.#assertVector3Like(secondVector, 'secondVector');

        const deltaX = Vector3Math.#getX(firstVector) - Vector3Math.#getX(secondVector);
        const deltaY = Vector3Math.#getY(firstVector) - Vector3Math.#getY(secondVector);
        const deltaZ = Vector3Math.#getZ(firstVector) - Vector3Math.#getZ(secondVector);
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
    }

    /**
     * Normalizes a vector.
     *
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {Vector3 | Float32Array} inputVector  - Input vector.
     * @returns {Vector3 | Float32Array}
     * @throws {TypeError}  When vectors are invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static normalize(outputVector, inputVector) {
        Vector3Math.#assertVector3Like(outputVector, 'outputVector');
        Vector3Math.#assertVector3Like(inputVector, 'inputVector');

        const vectorLength = Vector3Math.length(inputVector);

        if (vectorLength <= MIN_NORMALIZE_LENGTH) {
            return Vector3Math.#write(outputVector, ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
        }

        const inverseLength = ONE_VALUE / vectorLength;
        return Vector3Math.scale(outputVector, inputVector, inverseLength);
    }

    /**
     * Computes dot product.
     *
     * @param {Vector3 | Float32Array} firstVector  - First vector.
     * @param {Vector3 | Float32Array} secondVector - Second vector.
     * @returns {number}
     * @throws {TypeError}  When vectors are invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static dot(firstVector, secondVector) {
        Vector3Math.#assertVector3Like(firstVector, 'firstVector');
        Vector3Math.#assertVector3Like(secondVector, 'secondVector');

        return (Vector3Math.#getX(firstVector) * Vector3Math.#getX(secondVector))
            + (Vector3Math.#getY(firstVector) * Vector3Math.#getY(secondVector))
            + (Vector3Math.#getZ(firstVector) * Vector3Math.#getZ(secondVector));
    }

    /**
     * Computes cross product.
     *
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {Vector3 | Float32Array} firstVector  - First vector.
     * @param {Vector3 | Float32Array} secondVector - Second vector.
     * @returns {Vector3 | Float32Array}
     * @throws {TypeError}  When vectors are invalid.
     * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
     */
    static cross(outputVector, firstVector, secondVector) {
        Vector3Math.#assertVector3Like(outputVector, 'outputVector');
        Vector3Math.#assertVector3Like(firstVector, 'firstVector');
        Vector3Math.#assertVector3Like(secondVector, 'secondVector');

        const firstX  = Vector3Math.#getX(firstVector);
        const firstY  = Vector3Math.#getY(firstVector);
        const firstZ  = Vector3Math.#getZ(firstVector);
        const secondX = Vector3Math.#getX(secondVector);
        const secondY = Vector3Math.#getY(secondVector);
        const secondZ = Vector3Math.#getZ(secondVector);

        const x = (firstY * secondZ) - (firstZ * secondY);
        const y = (firstZ * secondX) - (firstX * secondZ);
        const z = (firstX * secondY) - (firstY * secondX);
        return Vector3Math.#write(outputVector, x, y, z);
    }

    /**
     * Linearly interpolates between vectors.
     *
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {Vector3 | Float32Array} startVector  - Start vector.
     * @param {Vector3 | Float32Array} endVector    - End vector.
     * @param {number} interpolationFactor          - Interpolation factor in [0..1].
     * @returns {Vector3 | Float32Array}
     * @throws {TypeError}  When vectors or interpolation factor are invalid.
     * @throws {RangeError} When Float32Array vectors are not `length 3`.
     */
    static lerp(outputVector, startVector, endVector, interpolationFactor) {
        Vector3Math.#assertVector3Like(outputVector, 'outputVector');
        Vector3Math.#assertVector3Like(startVector, 'startVector');
        Vector3Math.#assertVector3Like(endVector, 'endVector');

        if (typeof interpolationFactor !== 'number' || !Number.isFinite(interpolationFactor)) {
            throw new TypeError('`Vector3Math.lerp` expects `interpolationFactor` as a finite number.');
        }

        const x = Vector3Math.#getX(startVector) + (Vector3Math.#getX(endVector) - Vector3Math.#getX(startVector)) * interpolationFactor;
        const y = Vector3Math.#getY(startVector) + (Vector3Math.#getY(endVector) - Vector3Math.#getY(startVector)) * interpolationFactor;
        const z = Vector3Math.#getZ(startVector) + (Vector3Math.#getZ(endVector) - Vector3Math.#getZ(startVector)) * interpolationFactor;
        return Vector3Math.#write(outputVector, x, y, z);
    }

    /**
     * Clamps vector components to the [min..max] range.
     *
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {Vector3 | Float32Array} inputVector  - Input vector.
     * @param {number} min                          - Minimum component value.
     * @param {number} max                          - Maximum component value.
     * @returns {Vector3 | Float32Array}
     * @throws {TypeError}  When vectors or bounds are invalid.
     * @throws {RangeError} When Float32Array vectors are not `length 3`.
     */
    static clamp(outputVector, inputVector, min, max) {
        Vector3Math.#assertVector3Like(outputVector, 'outputVector');
        Vector3Math.#assertVector3Like(inputVector, 'inputVector');

        if (typeof min !== 'number' || typeof max !== 'number' || !Number.isFinite(min) || !Number.isFinite(max)) {
            throw new TypeError('`Vector3Math.clamp` expects `min` and `max` as finite numbers.');
        }

        const x = Math.max(min, Math.min(max, Vector3Math.#getX(inputVector)));
        const y = Math.max(min, Math.min(max, Vector3Math.#getY(inputVector)));
        const z = Math.max(min, Math.min(max, Vector3Math.#getZ(inputVector)));
        return Vector3Math.#write(outputVector, x, y, z);
    }

    /**
     * Compares two vectors with a tolerance.
     *
     * @param {Vector3 | Float32Array} firstVector  - First vector.
     * @param {Vector3 | Float32Array} secondVector - Second vector.
     * @param {number} [epsilon = 1e-6]             - Tolerance.
     * @returns {boolean}
     * @throws {TypeError}  When vectors or epsilon are invalid.
     * @throws {RangeError} When Float32Array vectors are not `length 3`.
     */
    static approxEquals(firstVector, secondVector, epsilon = DEFAULT_EPSILON) {
        Vector3Math.#assertVector3Like(firstVector, 'firstVector');
        Vector3Math.#assertVector3Like(secondVector, 'secondVector');

        if (typeof epsilon !== 'number' || !Number.isFinite(epsilon)) {
            throw new TypeError('`Vector3Math.approxEquals` expects `epsilon` as a finite number.');
        }

        return Math.abs(Vector3Math.#getX(firstVector) - Vector3Math.#getX(secondVector)) <= epsilon
            && Math.abs(Vector3Math.#getY(firstVector) - Vector3Math.#getY(secondVector)) <= epsilon
            && Math.abs(Vector3Math.#getZ(firstVector) - Vector3Math.#getZ(secondVector)) <= epsilon;
    }

    /**
     * @param {Vector3 | Float32Array} vector - Vector to validate.
     * @param {string} argumentName           - Argument name for error message.
     * @private
     */
    static #assertVector3Like(vector, argumentName) {
        if (!(vector instanceof Vector3) && !(vector instanceof Float32Array)) {
            throw new TypeError(`\`Vector3Math\` expects \`${argumentName}\` as Vector3 or Float32Array.`);
        }

        if (vector instanceof Float32Array && vector.length !== VECTOR3_COMPONENT_COUNT) {
            throw new RangeError('`Vector3Math` expects Float32Array(3) vectors.');
        }
    }

    /**
     * @param {Vector3 | Float32Array} vector - Input vector.
     * @returns {number}
     * @private
     */
    static #getX(vector) {
        return vector instanceof Vector3 ? vector.x : vector[VECTOR3_X_INDEX];
    }

    /**
     * @param {Vector3 | Float32Array} vector - Input vector.
     * @returns {number}
     * @private
     */
    static #getY(vector) {
        return vector instanceof Vector3 ? vector.y : vector[VECTOR3_Y_INDEX];
    }

    /**
     * @param {Vector3 | Float32Array} vector - Input vector.
     * @returns {number}
     * @private
     */
    static #getZ(vector) {
        return vector instanceof Vector3 ? vector.z : vector[VECTOR3_Z_INDEX];
    }

    /**
     * @param {Vector3 | Float32Array} outputVector - Output vector.
     * @param {number} x                            - X component.
     * @param {number} y                            - Y component.
     * @param {number} z                            - Z component.
     * @returns {Vector3 | Float32Array}
     * @private
     */
    static #write(outputVector, x, y, z) {
        if (outputVector instanceof Vector3) {
            outputVector.set(x, y, z);
            return outputVector;
        }

        outputVector[VECTOR3_X_INDEX] = x;
        outputVector[VECTOR3_Y_INDEX] = y;
        outputVector[VECTOR3_Z_INDEX] = z;
        return outputVector;
    }
}
