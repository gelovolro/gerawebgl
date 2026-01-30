import { Light } from './light.js';

/**
 * Number of components in a direction vector.
 *
 * @type {number}
 */
const VECTOR3_ELEMENT_COUNT = 3;

/**
 * Index of the X component in a vector.
 *
 * @type {number}
 */
const VECTOR_X_INDEX = 0;

/**
 * Index of the Y component in a vector.
 *
 * @type {number}
 */
const VECTOR_Y_INDEX = 1;

/**
 * Index of the Z component in a vector.
 *
 * @type {number}
 */
const VECTOR_Z_INDEX = 2;

/**
 * Default light direction (world space).
 * Matches the engine's historical default.
 *
 * @type {Float32Array}
 */
const DEFAULT_DIRECTION = new Float32Array([0.5, 0.7, 1.0]);

/**
 * Default directional light strength.
 *
 * @type {number}
 */
const DEFAULT_DIRECTIONAL_STRENGTH = 1.0;

/**
 * Minimum directional light strength.
 *
 * @type {number}
 */
const MIN_DIRECTIONAL_STRENGTH = 0.0;

/**
 * Maximum directional light strength.
 *
 * @type {number}
 */
const MAX_DIRECTIONAL_STRENGTH = 3.0;

/**
 * Minimum allowed squared length for a direction vector.
 *
 * @type {number}
 */
const MIN_DIRECTION_LENGTH_SQUARED = 0.0;

/**
 * Numerator used for inverse length computations.
 *
 * @type {number}
 */
const INVERSE_LENGTH_NUMERATOR = 1.0;

/**
 * Default roll angle (rotation around the Z axis).
 *
 * @type {number}
 */
const DEFAULT_ROLL_RADIANS = 0.0;

/**
 * Minimum clamp value for asin.
 *
 * @type {number}
 */
const ASIN_CLAMP_MIN = -1.0;

/**
 * Maximum clamp value for asin.
 *
 * @type {number}
 */
const ASIN_CLAMP_MAX = 1.0;

/**
 * World matrix index for Z axis X component.
 *
 * @type {number}
 */
const WORLD_Z_AXIS_X_INDEX = 8;

/**
 * World matrix index for Z axis Y component.
 *
 * @type {number}
 */
const WORLD_Z_AXIS_Y_INDEX = 9;

/**
 * World matrix index for Z axis Z component.
 *
 * @type {number}
 */
const WORLD_Z_AXIS_Z_INDEX = 10;

/**
 * Error message for invalid direction type.
 *
 * @type {string}
 */
const ERROR_DIRECTION_TYPE = '`DirectionalLight.setDirection` expects a number[] or `Float32Array`.';

/**
 * Error message for invalid direction component count.
 *
 * @type {string}
 */
const ERROR_DIRECTION_COMPONENTS = '`DirectionalLight.setDirection` expects exactly 3 components.';

/**
 * Error message for invalid direction component values.
 *
 * @type {string}
 */
const ERROR_DIRECTION_COMPONENTS_FINITE = '`DirectionalLight.setDirection` expects finite components.';

/**
 * Error message for invalid direction length.
 *
 * @type {string}
 */
const ERROR_DIRECTION_LENGTH = '`DirectionalLight.setDirection` expects a non-zero direction vector.';

/**
 * Error message for invalid strength values.
 *
 * @type {string}
 */
const ERROR_STRENGTH_TYPE = '`DirectionalLight.setStrength` expects a finite number.';

/**
 * Directional light source.
 */
export class DirectionalLight extends Light {

    /**
     * Cached normalized direction buffer.
     *
     * @type {Float32Array}
     * @private
     */
    #direction = new Float32Array(VECTOR3_ELEMENT_COUNT);

    /**
     * Directional light strength multiplier.
     *
     * @type {number}
     * @private
     */
    #strength = DEFAULT_DIRECTIONAL_STRENGTH;

    /**
     * Creates a new directional light with the default direction.
     */
    constructor() {
        super();
        this.setDirection(DEFAULT_DIRECTION);
        this.#strength = DEFAULT_DIRECTIONAL_STRENGTH;
    }

    /**
     * Sets the light direction by updating the light rotation.
     *
     * @param {Float32Array | number[]} direction - Direction vector (world space).
     * @returns {void}
     * @throws {TypeError} When the direction is invalid.
     */
    setDirection(direction) {
        DirectionalLight.#assertVector3(direction);

        // Read the direction components and compute the squared length (avoids the premature `sqrt`):
        const directionX    = direction[VECTOR_X_INDEX];
        const directionY    = direction[VECTOR_Y_INDEX];
        const directionZ    = direction[VECTOR_Z_INDEX];
        const lengthSquared = (directionX * directionX) + (directionY * directionY) + (directionZ * directionZ);

        // Reject the zero-length and non-finite vectors (can't be normalized safely):
        if (!Number.isFinite(lengthSquared) || lengthSquared <= MIN_DIRECTION_LENGTH_SQUARED) {
            throw new TypeError(ERROR_DIRECTION_LENGTH);
        }

        // Normalize the direction to unit the length for stable trigonometry:
        const inverseLength = INVERSE_LENGTH_NUMERATOR / Math.sqrt(lengthSquared);
        const normalizedX   = directionX * inverseLength;
        const normalizedY   = directionY * inverseLength;
        const normalizedZ   = directionZ * inverseLength;

        // Convert the normalized direction to Euler angles (pitch/yaw), with `asin` clamping for numeric safety:
        const clampedY  = Math.min(ASIN_CLAMP_MAX, Math.max(ASIN_CLAMP_MIN, normalizedY));
        const rotationX = -Math.asin(clampedY);
        const rotationY = Math.atan2(normalizedX, normalizedZ);

        this.rotation.x = rotationX;
        this.rotation.y = rotationY;
        this.rotation.z = DEFAULT_ROLL_RADIANS;
    }

    /**
     * Returns the normalized light direction in world space.
     *
     * @returns {Float32Array}
     */
    getDirection() {
        const worldMatrix   = this.worldMatrix;
        const axisX         = worldMatrix[WORLD_Z_AXIS_X_INDEX];
        const axisY         = worldMatrix[WORLD_Z_AXIS_Y_INDEX];
        const axisZ         = worldMatrix[WORLD_Z_AXIS_Z_INDEX];
        const lengthSquared = (axisX * axisX) + (axisY * axisY) + (axisZ * axisZ);

        if (!Number.isFinite(lengthSquared) || lengthSquared <= MIN_DIRECTION_LENGTH_SQUARED) {
            this.#direction.set(DEFAULT_DIRECTION);
            return this.#direction;
        }

        const inverseLength = INVERSE_LENGTH_NUMERATOR / Math.sqrt(lengthSquared);
        this.#direction[VECTOR_X_INDEX] = axisX * inverseLength;
        this.#direction[VECTOR_Y_INDEX] = axisY * inverseLength;
        this.#direction[VECTOR_Z_INDEX] = axisZ * inverseLength;
        return this.#direction;
    }

    /**
     * Sets the directional light strength multiplier.
     *
     * @param {number} strength - Directional strength multiplier.
     * @returns {void}
     * @throws {TypeError} When the strength is invalid.
     */
    setStrength(strength) {
        if (typeof strength !== 'number' || !Number.isFinite(strength)) {
            throw new TypeError(ERROR_STRENGTH_TYPE);
        }

        this.#strength = Math.min(MAX_DIRECTIONAL_STRENGTH, Math.max(MIN_DIRECTIONAL_STRENGTH, strength));
    }

    /**
     * Returns the directional light strength multiplier.
     *
     * @returns {number}
     */
    getStrength() {
        return this.#strength;
    }

    /**
     * Validates a vector3-like input.
     *
     * @param {Float32Array | number[]} vector - Vector to validate.
     * @returns {void}
     * @throws {TypeError} When the vector is invalid.
     * @private
     */
    static #assertVector3(vector) {
        if (!Array.isArray(vector) && !(vector instanceof Float32Array)) {
            throw new TypeError(ERROR_DIRECTION_TYPE);
        }

        if (vector.length !== VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(ERROR_DIRECTION_COMPONENTS);
        }

        if (!Number.isFinite(vector[VECTOR_X_INDEX])
            || !Number.isFinite(vector[VECTOR_Y_INDEX])
            || !Number.isFinite(vector[VECTOR_Z_INDEX])) {
            throw new TypeError(ERROR_DIRECTION_COMPONENTS_FINITE);
        }
    }
}
