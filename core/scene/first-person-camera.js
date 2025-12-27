import { Camera }     from './camera.js';
import { CameraMath } from '../math/camera-math.js';

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
 * Minimum allowed aspect ratio.
 *
 * @type {number}
 */
const MINIMUM_ASPECT_RATIO = 0.0;

/**
 * Minimum allowed near clipping plane distance.
 *
 * @type {number}
 */
const MINIMUM_NEAR_CLIP_DISTANCE = 0.0;

/**
 * Element count for a 4x4 matrix stored in a flat array.
 *
 * @type {number}
 */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * First-person camera mode - normal (no bobbing).
 *
 * @type {string}
 */
const FIRST_PERSON_CAMERA_MODE_NORMAL = 'NORMAL';

/**
 * First-person camera mode - bobbing (walking sway).
 *
 * @type {string}
 */
const FIRST_PERSON_CAMERA_MODE_BOBBING = 'BOBBING';

/**
 * Enum-like dictionary of supported first-person camera modes.
 *
 * @type {{ NORMAL: string, BOBBING: string }}
 */
const FIRST_PERSON_CAMERA_MODES = Object.freeze({
    NORMAL  : FIRST_PERSON_CAMERA_MODE_NORMAL,
    BOBBING : FIRST_PERSON_CAMERA_MODE_BOBBING
});

/**
 * Supported first-person camera mode values.
 *
 * @type {Set<string>}
 */
const FIRST_PERSON_CAMERA_MODE_SET = new Set(Object.values(FIRST_PERSON_CAMERA_MODES));

/**
 * Options used by {@link FirstPersonCamera}.
 *
 * @typedef {Object} FirstPersonCameraOptions
 * @property {number} [fieldOfViewRadians = Math.PI / 4] - Vertical field of view in radians.
 * @property {number} [aspectRatio = 1.0]                - Viewport aspect ratio (width / height).
 * @property {number} [near = 0.1]                       - Distance to the near clipping plane.
 * @property {number} [far = 200.0]                      - Distance to the far clipping plane.
 * @property {string} [mode = 'NORMAL']                  - Camera mode, see `FirstPersonCamera.Modes`.
 */

/**
 * Perspective first-person camera with adjustable mode for camera bobbing.
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
     * Current first-person camera mode.
     *
     * @type {string}
     * @private
     */
    #mode = FIRST_PERSON_CAMERA_MODE_NORMAL;

    /**
     * @param {FirstPersonCameraOptions} [options = {}] - Camera options.
     */
    constructor(options = {}) {
        super();

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`FirstPersonCamera` expects `options` as a plain object.');
        }

        const {
            fieldOfViewRadians = DEFAULT_FIELD_OF_VIEW_RADIANS,
            aspectRatio        = DEFAULT_ASPECT_RATIO,
            near               = DEFAULT_NEAR,
            far                = DEFAULT_FAR,
            mode               = FIRST_PERSON_CAMERA_MODE_NORMAL
        } = options;

        if (typeof fieldOfViewRadians !== 'number') {
            throw new TypeError('`FirstPersonCamera` expects `fieldOfViewRadians` as a number.');
        }

        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`FirstPersonCamera` expects `aspectRatio` as a number.');
        }

        if (typeof near !== 'number') {
            throw new TypeError('`FirstPersonCamera` expects `near` as a number.');
        }

        if (typeof far !== 'number') {
            throw new TypeError('`FirstPersonCamera` expects `far` as a number.');
        }

        if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`FirstPersonCamera` expects `aspectRatio` to be a positive number.');
        }

        if (near <= MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError('`FirstPersonCamera` expects `0 < near < far`.');
        }

        if (!FIRST_PERSON_CAMERA_MODE_SET.has(mode)) {
            throw new RangeError('`FirstPersonCamera` expects `mode` to be a valid value from `FirstPersonCamera.Modes`.');
        }

        this.#fieldOfViewRadians = fieldOfViewRadians;
        this.#aspectRatio        = aspectRatio;
        this.#near               = near;
        this.#far                = far;
        this.#projectionMatrix   = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#mode               = mode;
    }

    /**
     * Supported first-person camera modes.
     *
     * @returns {{ NORMAL: string, BOBBING: string }} - Supported mode labels.
     */
    static get Modes() {
        return FIRST_PERSON_CAMERA_MODES;
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
        if (!FIRST_PERSON_CAMERA_MODE_SET.has(mode)) {
            throw new RangeError('`FirstPersonCamera.setMode` expects a valid mode from `FirstPersonCamera.Modes`.');
        }

        this.#mode = mode;
    }

    /**
     * @inheritdoc
     */
    getProjectionMatrix() {
        if (this.#isProjectionMatrixDirty) {
            CameraMath.writePerspectiveMatrixTo(
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
     * Updates the camera aspect ratio.
     *
     * @param {number} aspectRatio - New aspect ratio.
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`FirstPersonCamera.setAspectRatio` expects `aspectRatio` as a number.');
        }

        if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`FirstPersonCamera.setAspectRatio` expects a positive number.');
        }

        this.#aspectRatio = aspectRatio;
        this.#isProjectionMatrixDirty = true;
    }
}
