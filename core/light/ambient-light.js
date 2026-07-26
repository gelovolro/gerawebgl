import { ECMASCRIPT_TYPEOF_RESULTS } from '../constants/ecmascript-types.js';
import * as LightConstants           from '../constants/light.js';
import * as LightExceptionMessages   from '../exception-messages/light.js';
import { Light }                     from './light.js';

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
    #strength = LightConstants.LIGHT_AMBIENT.DEFAULT_STRENGTH;

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
        if (typeof strength !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(strength)) {
            throw new TypeError(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.AMBIENT_STRENGTH_TYPE);
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
