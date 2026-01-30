import { Light } from './light.js';

/**
 * Default ambient strength.
 *
 * @type {number}
 */
const DEFAULT_STRENGTH = 0.2;

/**
 * Error message for invalid ambient strength.
 *
 * @type {string}
 */
const ERROR_STRENGTH_TYPE = '`AmbientLight.setStrength` expects a finite number.';

/**
 * Ambient light source.
 */
export class AmbientLight extends Light {

    /**
     * Ambient strength multiplier.
     *
     * @type {number}
     * @private
     */
    #strength = DEFAULT_STRENGTH;

    /**
     * Creates a new ambient light.
     */
    constructor() {
        super();
    }

    /**
     * Sets the ambient strength multiplier.
     *
     * @param {number} strength - Ambient strength.
     * @returns {void}
     * @throws {TypeError} When the strength is invalid.
     */
    setStrength(strength) {
        if (typeof strength !== 'number' || !Number.isFinite(strength)) {
            throw new TypeError(ERROR_STRENGTH_TYPE);
        }

        this.#strength = strength;
    }

    /**
     * Returns the ambient strength multiplier.
     *
     * @returns {number}
     */
    getStrength() {
        return this.#strength;
    }
}
