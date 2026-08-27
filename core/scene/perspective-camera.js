import * as MathConstants from '../constants/math.js';
import { Camera }         from './camera.js';
import { Matrix4 }        from '../math/matrix4.js';

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
    #isProjectionMatrixDirty = true;

    /**
     * Creates a perspective camera.
     *
     * @param {number} fieldOfViewRadians - Vertical field of view in radians.
     * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
     * @param {number} near               - Distance to the near clipping plane, must be greater than 0.
     * @param {number} far                - Distance to the far clipping plane, must be greater than near.
     * @throws {TypeError}                - If any argument is not a number.
     * @throws {RangeError}               - If the aspect ratio or clipping distances are invalid.
     */
    constructor(fieldOfViewRadians, aspectRatio, near, far) {
        super();

        if (typeof fieldOfViewRadians !== 'number') {
            throw new TypeError('`PerspectiveCamera` expects `fieldOfViewRadians` as a number.');
        }

        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`PerspectiveCamera` expects `aspectRatio` as a number.');
        }

        if (typeof near !== 'number') {
            throw new TypeError('`PerspectiveCamera` expects `near` as a number.');
        }

        if (typeof far !== 'number') {
            throw new TypeError('`PerspectiveCamera` expects `far` as a number.');
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`PerspectiveCamera` expects a positive `aspect ratio`.');
        }

        if (near <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError('`PerspectiveCamera` expects `0 < near < far`.');
        }

        this.#fieldOfViewRadians = fieldOfViewRadians;
        this.#aspectRatio        = aspectRatio;
        this.#near               = near;
        this.#far                = far;
        this.#projectionMatrix   = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    }

    /**
     * Updates the viewport aspect ratio and invalidates the projection cache, when the value changes.
     *
     * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
     * @returns {void}
     * @throws {TypeError}  - If the aspect ratio is not a number.
     * @throws {RangeError} - If the aspect ratio is not positive.
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`PerspectiveCamera.setAspectRatio` expects `aspectRatio` as a number.');
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`PerspectiveCamera.setAspectRatio` expects a positive number.');
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
