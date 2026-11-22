import * as FirstPersonCameraConstants from '../constants/first-person-camera.js';
import { PersonCamera }                from './person-camera.js';

/**
 * Options used by {@link FirstPersonCamera}.
 *
 * @typedef {Object} FirstPersonCameraOptions
 * @property {number} [fieldOfViewRadians = Math.PI / 4] - Vertical field of view in radians.
 * @property {number} [aspectRatio = 1.0]                - Viewport aspect ratio (width / height).
 * @property {number} [near = 0.1]                       - Distance to the near clipping plane.
 * @property {number} [far = 200.0]                      - Distance to the far clipping plane.
 * @property {PersonCameraMode} [mode = 0]               - Camera mode, see `FirstPersonCamera.Modes`.
 */

/**
 * Perspective camera intended for viewing a scene from a character's point of view.
 *
 * Stores the selected normal or bobbing mode for first-person controls.
 * Camera positioning and orientation are handled by the controls,
 * while perspective projection is inherited from `PerspectiveCamera`.
 */
export class FirstPersonCamera extends PersonCamera {
    /**
     * Creates a first-person perspective camera.
     *
     * @param {FirstPersonCameraOptions} [options = {}] - Camera options.
     * @throws {TypeError}                              - If options are not a plain object or a numeric value is not finite.
     * @throws {RangeError}                             - If projection parameters or camera mode are invalid.
     */
    constructor(options = {}) {
        super(options, FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS);
    }

    /**
     * Validation messages for first-person camera parameters.
     *
     * @protected
     * @returns {Object} - Camera-specific validation messages.
     */
    static get validationMessages() {
        return FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    }

    /**
     * Supported first-person camera modes.
     *
     * @returns {{ NORMAL: PersonCameraMode, BOBBING: PersonCameraMode }} - Supported mode values.
     */
    static get Modes() {
        return super.Modes;
    }
}
