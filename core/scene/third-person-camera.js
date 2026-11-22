import * as ThirdPersonCameraConstants from '../constants/third-person-camera.js';
import { PersonCamera }                from './person-camera.js';

/**
 * Options used by {@link ThirdPersonCamera}.
 *
 * @typedef {Object} ThirdPersonCameraOptions
 * @property {number} [fieldOfViewRadians = Math.PI / 4] - Vertical field of view in radians.
 * @property {number} [aspectRatio = 1.0]                - Viewport aspect ratio (width / height).
 * @property {number} [near = 0.1]                       - Distance to the near clipping plane.
 * @property {number} [far = 200.0]                      - Distance to the far clipping plane.
 * @property {PersonCameraMode} [mode = 0]               - Camera mode, see `ThirdPersonCamera.Modes`.
 */

/**
 * Perspective camera intended for observing a character from an external viewpoint.
 *
 * Stores the selected mode used by third-person controls.
 * Camera distance, target offset and camera placement are managed by the controls.
 * Projection calculation and caching are inherited from `PerspectiveCamera`.
 */
export class ThirdPersonCamera extends PersonCamera {
    /**
     * Creates a third-person perspective camera.
     *
     * @param {ThirdPersonCameraOptions} [options = {}] - Camera options.
     * @throws {TypeError}                              - If options are not a plain object or a numeric value is not finite.
     * @throws {RangeError}                             - If projection parameters or camera mode are invalid.
     */
    constructor(options = {}) {
        super(options, ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_DEFAULTS);
    }

    /**
     * Validation messages for third-person camera parameters.
     *
     * @protected
     * @returns {Object} - Camera-specific validation messages.
     */
    static get validationMessages() {
        return ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    }

    /**
     * Supported third-person camera modes.
     *
     * @returns {{ NORMAL: PersonCameraMode, BOBBING: PersonCameraMode }} - Supported mode values.
     */
    static get Modes() {
        return super.Modes;
    }
}
