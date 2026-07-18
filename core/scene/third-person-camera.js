import * as MathConstants from '../constants/math.js';
import { Camera }         from './camera.js';
import { Matrix4 }        from '../math/matrix4.js';

/**
 * Default camera field of view divisor used for computing FOV in radians.
 *
 * @type {number}
 */
const DEFAULT_FIELD_OF_VIEW_DIVISOR = 4;

/**
 * Default camera field of view in radians.
 *
 * @type {number}
 */
const DEFAULT_FIELD_OF_VIEW_RADIANS = Math.PI / DEFAULT_FIELD_OF_VIEW_DIVISOR;

/**
 * Default viewport aspect ratio.
 *
 * @type {number}
 */
const DEFAULT_ASPECT_RATIO = 1.0;

/**
 * Default near clipping plane distance.
 *
 * @type {number}
 */
const DEFAULT_NEAR = 0.1;

/**
 * Default far clipping plane distance.
 *
 * @type {number}
 */
const DEFAULT_FAR = 200.0;

/**
 * Third-person camera mode - normal (no bobbing).
 *
 * @type {string}
 */
const THIRD_PERSON_CAMERA_MODE_NORMAL = 'NORMAL';

/**
 * Third-person camera mode - bobbing (walking sway).
 *
 * @type {string}
 */
const THIRD_PERSON_CAMERA_MODE_BOBBING = 'BOBBING';

/**
 * Enum-like dictionary of supported third-person camera modes.
 *
 * @type {{ NORMAL: string, BOBBING: string }}
 */
const THIRD_PERSON_CAMERA_MODES = Object.freeze({
    NORMAL  : THIRD_PERSON_CAMERA_MODE_NORMAL,
    BOBBING : THIRD_PERSON_CAMERA_MODE_BOBBING
});

/**
 * Supported third-person camera mode values.
 *
 * @type {Set<string>}
 */
const THIRD_PERSON_CAMERA_MODE_SET = new Set(Object.values(THIRD_PERSON_CAMERA_MODES));

/**
 * Options used by {@link ThirdPersonCamera}.
 *
 * @typedef {Object} ThirdPersonCameraOptions
 * @property {number} [fieldOfViewRadians = Math.PI / 4] - Vertical field of view in radians.
 * @property {number} [aspectRatio = 1.0]                - Viewport aspect ratio (width / height).
 * @property {number} [near = 0.1]                       - Distance to the near clipping plane.
 * @property {number} [far = 200.0]                      - Distance to the far clipping plane.
 * @property {string} [mode = 'NORMAL']                  - Camera mode, see `ThirdPersonCamera.Modes`.
 */

/**
 * Perspective third-person camera with adjustable mode for camera bobbing.
 */
export class ThirdPersonCamera extends Camera {

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
     * Cached projection matrix buffer.
     * The buffer is reused between frames to avoid allocations.
     *
     * @type {Float32Array}
     * @private
     */
    #projectionMatrix;

    /**
     * When true, projection matrix must be recomputed.
     *
     * @type {boolean}
     * @private
     */
    #isProjectionMatrixDirty = true;

    /**
     * Current third-person camera mode.
     *
     * @type {string}
     * @private
     */
    #mode = THIRD_PERSON_CAMERA_MODE_NORMAL;

    /**
     * @param {ThirdPersonCameraOptions} [options = {}] - Camera options.
     */
    constructor(options = {}) {
        super();

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`ThirdPersonCamera` expects `options` as a plain object.');
        }

        const {
            fieldOfViewRadians = DEFAULT_FIELD_OF_VIEW_RADIANS,
            aspectRatio        = DEFAULT_ASPECT_RATIO,
            near               = DEFAULT_NEAR,
            far                = DEFAULT_FAR,
            mode               = THIRD_PERSON_CAMERA_MODE_NORMAL
        } = options;

        if (typeof fieldOfViewRadians !== 'number') {
            throw new TypeError('`ThirdPersonCamera` expects `fieldOfViewRadians` as a number.');
        }

        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`ThirdPersonCamera` expects `aspectRatio` as a number.');
        }

        if (typeof near !== 'number') {
            throw new TypeError('`ThirdPersonCamera` expects `near` as a number.');
        }

        if (typeof far !== 'number') {
            throw new TypeError('`ThirdPersonCamera` expects `far` as a number.');
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`ThirdPersonCamera` expects `aspectRatio` to be a positive number.');
        }

        if (near <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError('`ThirdPersonCamera` expects `0 < near < far`.');
        }

        if (!THIRD_PERSON_CAMERA_MODE_SET.has(mode)) {
            throw new RangeError('`ThirdPersonCamera` expects `mode` to be a valid value from `ThirdPersonCamera.Modes`.');
        }

        this.#fieldOfViewRadians = fieldOfViewRadians;
        this.#aspectRatio        = aspectRatio;
        this.#near               = near;
        this.#far                = far;
        this.#projectionMatrix   = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
        this.#mode               = mode;
    }

    /**
     * Supported third-person camera modes.
     *
     * @returns {{ NORMAL: string, BOBBING: string }} - Supported mode labels.
     */
    static get Modes() {
        return THIRD_PERSON_CAMERA_MODES;
    }

    /**
     * Current camera mode.
     *
     * @returns {string}
     */
    get mode() {
        return this.#mode;
    }

    /**
     * Updates the camera mode.
     *
     * @param {string} mode - New camera mode.
     */
    setMode(mode) {
        if (!THIRD_PERSON_CAMERA_MODE_SET.has(mode)) {
            throw new RangeError('`ThirdPersonCamera.setMode` expects a valid mode from `ThirdPersonCamera.Modes`.');
        }

        this.#mode = mode;
    }

    /**
     * Updates the aspect ratio and marks projection cache as dirty.
     *
     * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`ThirdPersonCamera.setAspectRatio` expects `aspectRatio` as a number.');
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`ThirdPersonCamera.setAspectRatio` expects a positive number.');
        }

        if (aspectRatio === this.#aspectRatio) {
            return;
        }

        this.#aspectRatio             = aspectRatio;
        this.#isProjectionMatrixDirty = true;
    }

    /**
     * Returns the projection matrix for this camera. The returned matrix is cached and reused between calls.
     *
     * @returns {Float32Array} - Cached projection matrix.
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
}
