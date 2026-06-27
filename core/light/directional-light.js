import { ECMASCRIPT_TYPEOF_RESULTS } from '../constants/ecmascript-types.js';
import * as MathConstants            from '../constants/math.js';
import * as LightConstants           from '../constants/light.js';
import * as LightExceptionMessages   from '../exception-messages/light.js';
import { Light }                     from './light.js';

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
    #direction = new Float32Array(MathConstants.MATH_LAYOUT.VECTOR3_ELEMENT_COUNT);

    /**
     * Directional light strength multiplier.
     *
     * @type {number}
     * @private
     */
    #strength = LightConstants.LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;

    /**
     * Creates a new directional light with the default direction.
     */
    constructor() {
        super();
        this.setDirection(LightConstants.LIGHT_DIRECTIONAL_DEFAULT_DIRECTION);
        this.#strength = LightConstants.LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;
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
        const directionX    = direction[MathConstants.MATH_VECTOR3_INDEXES.X];
        const directionY    = direction[MathConstants.MATH_VECTOR3_INDEXES.Y];
        const directionZ    = direction[MathConstants.MATH_VECTOR3_INDEXES.Z];
        const lengthSquared = (directionX * directionX) + (directionY * directionY) + (directionZ * directionZ);

        // Reject the zero-length and non-finite vectors (can't be normalized safely):
        if (!Number.isFinite(lengthSquared) || lengthSquared <= LightConstants.LIGHT_DIRECTIONAL.MIN_DIRECTION_LENGTH_SQUARED) {
            throw new TypeError(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_LENGTH);
        }

        // Normalize the direction to unit the length for stable trigonometry:
        const inverseLength = LightConstants.LIGHT_DIRECTIONAL.INVERSE_LENGTH_NUMERATOR / Math.sqrt(lengthSquared);
        const normalizedX   = directionX * inverseLength;
        const normalizedY   = directionY * inverseLength;
        const normalizedZ   = directionZ * inverseLength;

        // Convert the normalized direction to Euler angles (pitch/yaw), with `asin` clamping for numeric safety:
        const clampedY  = Math.min(LightConstants.LIGHT_DIRECTIONAL.ASIN_CLAMP_MAX, Math.max(LightConstants.LIGHT_DIRECTIONAL.ASIN_CLAMP_MIN, normalizedY));
        const rotationX = -Math.asin(clampedY);
        const rotationY = Math.atan2(normalizedX, normalizedZ);

        this.rotation.x = rotationX;
        this.rotation.y = rotationY;
        this.rotation.z = LightConstants.LIGHT_DIRECTIONAL.DEFAULT_ROLL_RADIANS;
    }

    /**
     * Returns the normalized light direction in world space.
     *
     * @returns {Float32Array}
     */
    getDirection() {
        const worldMatrix   = this.worldMatrix;
        const axisX         = worldMatrix[MathConstants.MATH_MATRIX4_INDEXES.WORLD_Z_AXIS_X];
        const axisY         = worldMatrix[MathConstants.MATH_MATRIX4_INDEXES.WORLD_Z_AXIS_Y];
        const axisZ         = worldMatrix[MathConstants.MATH_MATRIX4_INDEXES.WORLD_Z_AXIS_Z];
        const lengthSquared = (axisX * axisX) + (axisY * axisY) + (axisZ * axisZ);

        if (!Number.isFinite(lengthSquared) || lengthSquared <= LightConstants.LIGHT_DIRECTIONAL.MIN_DIRECTION_LENGTH_SQUARED) {
            this.#direction.set(LightConstants.LIGHT_DIRECTIONAL_DEFAULT_NORMALIZED_DIRECTION);
            return this.#direction;
        }

        const inverseLength = LightConstants.LIGHT_DIRECTIONAL.INVERSE_LENGTH_NUMERATOR / Math.sqrt(lengthSquared);
        this.#direction[MathConstants.MATH_VECTOR3_INDEXES.X] = axisX * inverseLength;
        this.#direction[MathConstants.MATH_VECTOR3_INDEXES.Y] = axisY * inverseLength;
        this.#direction[MathConstants.MATH_VECTOR3_INDEXES.Z] = axisZ * inverseLength;
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
        if (typeof strength !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(strength)) {
            throw new TypeError(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTIONAL_STRENGTH_TYPE);
        }

        this.#strength = Math.min(LightConstants.LIGHT_DIRECTIONAL.MAX_DIRECTIONAL_STRENGTH, Math.max(LightConstants.LIGHT_DIRECTIONAL.MIN_DIRECTIONAL_STRENGTH, strength));
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
            throw new TypeError(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_TYPE);
        }

        if (vector.length !== MathConstants.MATH_LAYOUT.VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_COMPONENTS);
        }

        if (!Number.isFinite(vector[MathConstants.MATH_VECTOR3_INDEXES.X])
            || !Number.isFinite(vector[MathConstants.MATH_VECTOR3_INDEXES.Y])
            || !Number.isFinite(vector[MathConstants.MATH_VECTOR3_INDEXES.Z])) {
            throw new TypeError(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_COMPONENTS_FINITE);
        }
    }
}
