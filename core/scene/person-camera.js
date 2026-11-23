import * as PersonCameraConstants    from '../constants/person-camera.js';
import { ECMASCRIPT_TYPEOF_RESULTS } from '../constants/ecmascript-types.js';
import { PerspectiveCamera }         from './perspective-camera.js';

/**
 * Supported operating mode for first-person and third-person cameras.
 *
 * @typedef {PersonCameraConstants.PERSON_CAMERA_MODES} PersonCameraMode
 */

/**
 * Common perspective camera behavior for first-person and third-person views.
 *
 * The perspective projection is inherited from {@link PerspectiveCamera}.
 * The current mode is consumed by the corresponding controls.
 *
 * @abstract
 * @extends PerspectiveCamera
 */
export class PersonCamera extends PerspectiveCamera {

    /**
     * Current operating mode.
     *
     * @type {PersonCameraMode}
     * @private
     */
    #mode;

    /**
     * Error message for invalid updates of the camera mode.
     *
     * @type {string}
     * @private
     */
    #setModeError;

    /**
     * Initializes a perspective camera with shared mode handling.
     *
     * @param {Object} options  - Camera options.
     * @param {Object} defaults - Defaults for the concrete camera class.
     * @throws {TypeError}      - If options or projection parameters are invalid.
     * @throws {RangeError}     - If projection parameters or the mode are out of range.
     */
    constructor(options, defaults) {
        const errors = new.target.validationMessages;

        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(errors.OPTIONS_TYPE);
        }

        const optionsPrototype = Object.getPrototypeOf(options);

        if (optionsPrototype !== Object.prototype && optionsPrototype !== null) {
            throw new TypeError(errors.OPTIONS_TYPE);
        }

        const {
            fieldOfViewRadians = defaults.FIELD_OF_VIEW_RADIANS,
            aspectRatio        = defaults.ASPECT_RATIO,
            near               = defaults.NEAR,
            far                = defaults.FAR,
            mode               = defaults.MODE
        } = options;

        super(fieldOfViewRadians, aspectRatio, near, far);

        if (!PersonCameraConstants.PERSON_CAMERA_ALLOWED_MODES.includes(mode)) {
            throw new RangeError(errors.MODE);
        }

        this.#mode         = mode;
        this.#setModeError = errors.SET_MODE;
    }

    /**
     * Supported first-person and third-person camera modes.
     *
     * @returns {{ NORMAL: PersonCameraMode, BOBBING: PersonCameraMode }} - Shared mode values.
     */
    static get Modes() {
        return PersonCameraConstants.PERSON_CAMERA_MODES;
    }

    /**
     * Returns the current operating mode.
     *
     * @returns {PersonCameraMode} - Current camera mode.
     */
    get mode() {
        return this.#mode;
    }

    /**
     * Updates the operating mode without affecting projection or view matrices.
     *
     * @param {PersonCameraMode} mode - New camera mode.
     * @returns {void}
     * @throws {RangeError}           - If the mode is unsupported.
     */
    setMode(mode) {
        if (!PersonCameraConstants.PERSON_CAMERA_ALLOWED_MODES.includes(mode)) {
            throw new RangeError(this.#setModeError);
        }

        this.#mode = mode;
    }
}
