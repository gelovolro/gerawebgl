import * as MathConstants              from '../constants/math.js';
import * as PerspectiveCameraConstants from '../constants/perspective-camera.js';
import { ECMASCRIPT_TYPEOF_RESULTS }   from '../constants/ecmascript-types.js';
import { Matrix4 }                     from '../math/matrix4.js';
import { Camera }                      from './camera.js';

/**
 * Perspective camera with a vertical field of view, viewport aspect ratio and near/far clipping planes.
 *
 * The projection matrix is computed on demand, cached and recomputed after the aspect ratio changes.
 */
export class PerspectiveCamera extends Camera {

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
     * Distance to the near clipping plane.
     *
     * @type {number}
     * @private
     */
    #near;

    /**
     * Distance to the far clipping plane.
     *
     * @type {number}
     * @private
     */
    #far;

    /**
     * Cached perspective projection matrix.
     *
     * Reused between calls to avoid allocations.
     *
     * @type {Float32Array}
     * @private
     */
    #projectionMatrix;

    /**
     * Indicates that the cached projection matrix must be rebuilt.
     *
     * @type {boolean}
     * @private
     */
    #isProjectionMatrixDirty = PerspectiveCameraConstants.PERSPECTIVE_CAMERA_DEFAULTS.DIRTY;

    /**
     * Validation messages selected by the concrete camera class.
     *
     * @type {Object}
     * @private
     */
    #validationMessages;

    /**
     * Creates a perspective camera.
     *
     * @param {number} fieldOfViewRadians - Vertical field of view in radians.
     * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
     * @param {number} near               - Distance to the near clipping plane, must be greater than 0.
     * @param {number} far                - Distance to the far clipping plane, must be greater than near.
     * @throws {TypeError}                - If any argument is not a finite number.
     * @throws {RangeError}               - If the field of view, aspect ratio or clipping distances are invalid.
     */
    constructor(fieldOfViewRadians, aspectRatio, near, far) {
        super();

        this.#validationMessages = new.target.validationMessages;

        if (typeof fieldOfViewRadians !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(fieldOfViewRadians)) {
            throw new TypeError(this.#validationMessages.FIELD_OF_VIEW_TYPE);
        }

        if (typeof aspectRatio !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(aspectRatio)) {
            throw new TypeError(this.#validationMessages.ASPECT_RATIO_TYPE);
        }

        if (typeof near !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(near)) {
            throw new TypeError(this.#validationMessages.NEAR_TYPE);
        }

        if (typeof far !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(far)) {
            throw new TypeError(this.#validationMessages.FAR_TYPE);
        }

        if (fieldOfViewRadians <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_FIELD_OF_VIEW_RADIANS ||
            fieldOfViewRadians >= MathConstants.MATH_CAMERA_LIMITS.MAXIMUM_FIELD_OF_VIEW_RADIANS) {
            throw new RangeError(this.#validationMessages.FIELD_OF_VIEW_RANGE);
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError(this.#validationMessages.ASPECT_RATIO_RANGE);
        }

        if (near <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError(this.#validationMessages.CLIPPING_PLANES);
        }

        this.#fieldOfViewRadians = fieldOfViewRadians;
        this.#aspectRatio        = aspectRatio;
        this.#near               = near;
        this.#far                = far;
        this.#projectionMatrix   = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    }

    /**
     * Validation messages for the concrete perspective camera type.
     *
     * @protected
     * @returns {Object} - Camera-specific validation messages.
     */
    static get validationMessages() {
        return PerspectiveCameraConstants.PERSPECTIVE_CAMERA_ERRORS;
    }

    /**
     * Updates the viewport aspect ratio and invalidates the projection cache, when the value changes.
     *
     * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
     * @returns {void}
     * @throws {TypeError}         - If the aspect ratio is not a finite number.
     * @throws {RangeError}        - If the aspect ratio is not positive.
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(aspectRatio)) {
            throw new TypeError(this.#validationMessages.SET_ASPECT_TYPE);
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError(this.#validationMessages.SET_ASPECT_RANGE);
        }

        if (aspectRatio === this.#aspectRatio) {
            return;
        }

        this.#aspectRatio             = aspectRatio;
        this.#isProjectionMatrixDirty = true;
    }

    /**
     * Returns the cached projection matrix, rebuilding it when needed.
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
