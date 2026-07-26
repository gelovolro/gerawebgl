import { ECMASCRIPT_TYPEOF_RESULTS } from '../constants/ecmascript-types.js';
import * as LightConstants           from '../constants/light.js';
import * as LightExceptionMessages   from '../exception-messages/light.js';
import { Object3D }                  from '../scene/object3d.js';

/**
 * Abstract base class for light sources.
 */
export class Light extends Object3D {

    /**
     * Whether this light is enabled.
     *
     * @type {boolean}
     * @private
     */
    #enabled = LightConstants.LIGHT_DEFAULTS.ENABLED;

    /**
     * Creates a new light. This class is abstract and cannot be instantiated directly.
     *
     * @throws {Error} When attempting to instantiate the abstract `Light` class.
     */
    constructor() {
        super();

        if (new.target === Light) {
            throw new Error(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.ABSTRACT_CONSTRUCTOR);
        }
    }

    /**
     * Enables or disables this light.
     *
     * @param {boolean} enabled - When true, the light contributes to rendering.
     * @returns {void}
     * @throws {TypeError} When the value is not a boolean.
     */
    setEnabled(enabled) {
        if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.ENABLED_TYPE);
        }

        this.#enabled = enabled;
    }

    /**
     * Returns true when the light is enabled.
     *
     * @returns {boolean}
     */
    isEnabled() {
        return this.#enabled;
    }
}
