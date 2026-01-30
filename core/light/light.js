import { Object3D } from '../scene/object3d.js';

/**
 * Default enabled state for lights.
 *
 * @type {boolean}
 */
const DEFAULT_ENABLED = true;

/**
 * String literal for `typeof boolean` checks.
 *
 * @type {string}
 */
const TYPEOF_BOOLEAN = 'boolean';

/**
 * Error message used, when instantiating Light directly.
 *
 * @type {string}
 */
const ERROR_ABSTRACT_CONSTRUCTOR = '`Light` is an abstract class and cannot be instantiated directly.';

/**
 * Error message for invalid enabled flag.
 *
 * @type {string}
 */
const ERROR_ENABLED_TYPE = '`Light.setEnabled` expects a boolean.';

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
    #enabled = DEFAULT_ENABLED;

    /**
     * Creates a new light. This class is abstract and cannot be instantiated directly.
     *
     * @throws {Error} When attempting to instantiate the abstract `Light` class.
     */
    constructor() {
        super();

        if (new.target === Light) {
            throw new Error(ERROR_ABSTRACT_CONSTRUCTOR);
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
        if (typeof enabled !== TYPEOF_BOOLEAN) {
            throw new TypeError(ERROR_ENABLED_TYPE);
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
