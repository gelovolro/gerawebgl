import * as MathConstants              from '../constants/math.js';
import * as FirstPersonCameraConstants from '../constants/first-person-camera.js';
import * as PersonCameraConstants      from '../constants/person-camera.js';
import { Matrix4 }                     from '../math/matrix4.js';
import { Camera }                      from './camera.js';

/**
 * Supported person camera mode.
 *
 * @typedef {PersonCameraConstants.PERSON_CAMERA_MODES} PersonCameraMode
 */

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
 * Perspective first-person camera supporting normal and bobbing modes.
 *
 * The camera stores the selected mode for controls that apply movement-related
 * effects. Changing the mode does not change the projection or view transform.
 * The perspective matrix is cached and updated when the aspect ratio changes.
 */
export class FirstPersonCamera extends Camera {

    /**
     * Vertical field of view in radians.
     *
     * @type {number}
     * @private
     */
    #fieldOfViewRadians;

    /**
     * Viewport aspect ratio (width / height).
     *
     * @type {number}
     * @private
     */
    #aspectRatio;

    /**
     * Near clipping plane distance.
     *
     * @type {number}
     * @private
     */
    #near;

    /**
     * Far clipping plane distance.
     *
     * @type {number}
     * @private
     */
    #far;

    /**
     * Cached projection matrix buffer reused between calls.
     *
     * @type {Float32Array}
     * @private
     */
    #projectionMatrix;

    /**
     * Indicates whether the projection matrix needs to be recomputed.
     *
     * @type {boolean}
     * @private
     */
    #isProjectionMatrixDirty = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS.DIRTY;

    /**
     * Current first-person camera mode.
     *
     * @type {PersonCameraMode}
     * @private
     */
    #mode;

    /**
     * Creates a first-person perspective camera.
     *
     * @param {FirstPersonCameraOptions} [options = {}] - Camera options.
     * @throws {TypeError}                              - If options are not a plain object or a numeric value is not finite.
     * @throws {RangeError}                             - If projection parameters or camera mode are invalid.
     */
    constructor(options = {}) {
        super();

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.OPTIONS_TYPE);
        }

        const optionsPrototype = Object.getPrototypeOf(options);

        if (optionsPrototype !== Object.prototype && optionsPrototype !== null) {
            throw new TypeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.OPTIONS_TYPE);
        }

        const {
            fieldOfViewRadians = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS.FIELD_OF_VIEW_RADIANS,
            aspectRatio        = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS.ASPECT_RATIO,
            near               = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS.NEAR,
            far                = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS.FAR,
            mode               = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS.MODE
        } = options;

        if (!Number.isFinite(fieldOfViewRadians)) {
            throw new TypeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.FIELD_OF_VIEW_TYPE);
        }

        if (!Number.isFinite(aspectRatio)) {
            throw new TypeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.ASPECT_RATIO_TYPE);
        }

        if (!Number.isFinite(near)) {
            throw new TypeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.NEAR_TYPE);
        }

        if (!Number.isFinite(far)) {
            throw new TypeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.FAR_TYPE);
        }

        if (fieldOfViewRadians <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_FIELD_OF_VIEW_RADIANS ||
            fieldOfViewRadians >= MathConstants.MATH_CAMERA_LIMITS.MAXIMUM_FIELD_OF_VIEW_RADIANS) {
            throw new RangeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.FIELD_OF_VIEW_RANGE);
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.ASPECT_RATIO_RANGE);
        }

        if (near <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.CLIPPING_PLANES);
        }

        if (!PersonCameraConstants.PERSON_CAMERA_ALLOWED_MODES.includes(mode)) {
            throw new RangeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.MODE);
        }

        this.#fieldOfViewRadians = fieldOfViewRadians;
        this.#aspectRatio        = aspectRatio;
        this.#near               = near;
        this.#far                = far;
        this.#projectionMatrix   = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
        this.#mode               = mode;
    }

    /**
     * Supported first-person camera modes.
     *
     * @returns {{ NORMAL: PersonCameraMode, BOBBING: PersonCameraMode }} - Supported mode values.
     */
    static get Modes() {
        return PersonCameraConstants.PERSON_CAMERA_MODES;
    }

    /**
     * Current camera mode.
     *
     * @returns {PersonCameraMode} - Current mode.
     */
    get mode() {
        return this.#mode;
    }

    /**
     * Updates the camera mode without changing its projection.
     *
     * @param {PersonCameraMode} mode - New camera mode.
     * @returns {void}
     * @throws {RangeError}           - If the mode is unsupported.
     */
    setMode(mode) {
        if (!PersonCameraConstants.PERSON_CAMERA_ALLOWED_MODES.includes(mode)) {
            throw new RangeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.SET_MODE);
        }

        this.#mode = mode;
    }

    /**
     * Returns the cached perspective projection matrix.
     *
     * @returns {Float32Array} - Projection matrix buffer.
     */
    getProjectionMatrix() {
        if (this.#isProjectionMatrixDirty === true) {
            Matrix4.writePerspectiveTo(
                this.#projectionMatrix,
                this.#fieldOfViewRadians,
                this.#aspectRatio,
                this.#near,
                this.#far
            );

            this.#isProjectionMatrixDirty = false;
        }

        return this.#projectionMatrix;
    }

    /**
     * Updates the camera aspect ratio and invalidates the projection when needed.
     *
     * @param {number} aspectRatio - New viewport aspect ratio.
     * @returns {void}
     * @throws {TypeError}         - If the aspect ratio is not a finite number.
     * @throws {RangeError}        - If the aspect ratio is not positive.
     */
    setAspectRatio(aspectRatio) {
        if (!Number.isFinite(aspectRatio)) {
            throw new TypeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.SET_ASPECT_TYPE);
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError(FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS.SET_ASPECT_RANGE);
        }

        if (aspectRatio === this.#aspectRatio) {
            return;
        }

        this.#aspectRatio = aspectRatio;
        this.#isProjectionMatrixDirty = true;
    }
}
