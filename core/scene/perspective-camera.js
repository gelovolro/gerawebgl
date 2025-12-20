import { Camera }     from './camera.js';
import { CameraMath } from '../math/camera-math.js';

/**
 * Minimum allowed near clipping plane distance.
 *
 * @type {number}
 */
const MINIMUM_NEAR_CLIP_DISTANCE = 0.0;

/**
 * Minimum allowed aspect ratio.
 *
 * @type {number}
 */
const MINIMUM_ASPECT_RATIO = 0.0;

/**
 * Element count for a 4x4 matrix stored in a flat array.
 *
 * @type {number}
 */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Perspective camera with field of view, aspect ratio and clipping planes.
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
     * @param {number} fieldOfViewRadians - Vertical field of view in radians.
     * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
     * @param {number} near               - Distance to the near clipping plane (must be greater, than 0).
     * @param {number} far                - Distance to the far clipping plane (must be greater, than near).
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

        if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`PerspectiveCamera` expects a positive `aspect ratio`.');
        }

        if (near <= MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError('`PerspectiveCamera` expects `0 < near < far`.');
        }

        this.#fieldOfViewRadians = fieldOfViewRadians;
        this.#aspectRatio        = aspectRatio;
        this.#near               = near;
        this.#far                = far;
        this.#projectionMatrix   = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
    }

    /**
     * Updates the aspect ratio and marks projection cache as dirty.
     *
     * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`PerspectiveCamera.setAspectRatio` expects `aspectRatio` as a number.');
        }

        if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`PerspectiveCamera.setAspectRatio` expects a positive number.');
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
}
