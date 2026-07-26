import * as MathConstants from '../constants/math.js';
import { Camera }         from './camera.js';
import { Matrix4 }        from '../math/matrix4.js';

/**
 * Minimum allowed view size (height in world units).
 *
 * @type {number}
 */
const MINIMUM_VIEW_SIZE = 0.0;

/**
 * Multiplier used to compute half of a value.
 *
 * @type {number}
 */
const HALF_MULTIPLIER = 0.5;

/**
 * Orthographic camera. Supports two configuration modes:
 *
 * 1) Explicit bounds: (left, right, bottom, top, near, far).
 *
 * 2) View-size mode: `viewSize + aspectRatio` => bounds are computed automatically.
 *
 * Notes:
 * - `viewSize` represents the height of the view volume in world units.
 * - In view-size mode `setAspectRatio()` updates bounds automatically.
 */
export class OrthographicCamera extends Camera {

    /**
     * Projection bounds: left plane.
     *
     * @type {number}
     * @private
     */
    #left;

    /**
     * Projection bounds: right plane.
     *
     * @type {number}
     * @private
     */
    #right;

    /**
     * Projection bounds: bottom plane.
     *
     * @type {number}
     * @private
     */
    #bottom;

    /**
     * Projection bounds: top plane.
     *
     * @type {number}
     * @private
     */
    #top;

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
     * When not null, camera uses view-size mode.
     * Represents the height of the orthographic volume in world units.
     *
     * @type {number | null}
     * @private
     */
    #viewSize = null;

    /**
     * Aspect ratio used in view-size mode (width / height).
     *
     * @type {number}
     * @private
     */
    #aspectRatio = 1.0;

    /**
     * Cached projection matrix buffer.
     * Reused between frames to avoid allocations.
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
     * Creates an orthographic camera.
     *
     * @param {number | Object} leftOrOptions - Either left bound (number) or an options object.
     * @param {number} [right]                - Right bound (explicit bounds mode).
     * @param {number} [bottom]               - Bottom bound (explicit bounds mode).
     * @param {number} [top]                  - Top bound (explicit bounds mode).
     * @param {number} [near]                 - Near clipping plane distance.
     * @param {number} [far]                  - Far clipping plane distance.
     */
    constructor(leftOrOptions, right, bottom, top, near, far) {
        super();
        this.#projectionMatrix = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);

        if (leftOrOptions !== null && typeof leftOrOptions === 'object') {
            if (Array.isArray(leftOrOptions) === true) {
                throw new TypeError('`OrthographicCamera` expects options as a plain object, not an array.');
            }

            this.#initFromOptions(leftOrOptions);
            return;
        }

        this.#initFromBounds(
            leftOrOptions,
            right,
            bottom,
            top,
            near,
            far
        );
    }

    /**
     * Updates the aspect ratio (width / height). Only affects the camera in view-size mode.
     *
     * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`OrthographicCamera.setAspectRatio` expects `aspectRatio` as a number.');
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`OrthographicCamera.setAspectRatio` expects `aspectRatio` to be a positive number.');
        }

        if (this.#viewSize === null) {
            return;
        }

        if (aspectRatio === this.#aspectRatio) {
            return;
        }

        this.#aspectRatio = aspectRatio;
        this.#recomputeBoundsFromViewSize();
        this.#isProjectionMatrixDirty = true;
    }

    /**
     * Returns the projection matrix for this camera.
     * The returned matrix is cached and reused between calls.
     *
     * @returns {Float32Array} - Cached projection matrix.
     */
    getProjectionMatrix() {
        if (this.#isProjectionMatrixDirty === true) {
            Matrix4.writeOrthographicTo(
                this.#projectionMatrix,
                this.#left,
                this.#right,
                this.#bottom,
                this.#top,
                this.#near,
                this.#far
            );

            this.#isProjectionMatrixDirty = false;
        }

        return this.#projectionMatrix;
    }

    /**
     * @param {Object} options - Initialization options.
     * @private
     */
    #initFromOptions(options) {
        const hasViewSize = Object.prototype.hasOwnProperty.call(options, 'viewSize');

        if (hasViewSize === true) {
            this.#initFromViewSize(
                options.viewSize,
                options.aspectRatio,
                options.near,
                options.far
            );

            return;
        }

        this.#initFromBounds(
            options.left,
            options.right,
            options.bottom,
            options.top,
            options.near,
            options.far
        );
    }

    /**
     * @param {number} left   - Left plane.
     * @param {number} right  - Right plane.
     * @param {number} bottom - Bottom plane.
     * @param {number} top    - Top plane.
     * @param {number} near   - Near clipping plane distance.
     * @param {number} far    - Far clipping plane distance.
     * @private
     */
    #initFromBounds(left, right, bottom, top, near, far) {
        if (typeof left      !== 'number'
            || typeof right  !== 'number'
            || typeof bottom !== 'number'
            || typeof top    !== 'number'
            || typeof near   !== 'number'
            || typeof far    !== 'number') {
            throw new TypeError('`OrthographicCamera` expects numeric arguments in bounds mode.');
        }

        if (left === right) {
            throw new RangeError('`OrthographicCamera` expects `left !== right`.');
        }

        if (bottom === top) {
            throw new RangeError('`OrthographicCamera` expects `bottom !== top`.');
        }

        if (far <= near) {
            throw new RangeError('`OrthographicCamera` expects `near < far`.');
        }

        this.#viewSize = null;
        this.#left     = left;
        this.#right    = right;
        this.#bottom   = bottom;
        this.#top      = top;
        this.#near     = near;
        this.#far      = far;
        this.#isProjectionMatrixDirty = true;
    }

    /**
     * @param {number} viewSize    - Height of the view volume in world units.
     * @param {number} aspectRatio - Viewport aspect ratio (width / height).
     * @param {number} near        - Near clipping plane distance.
     * @param {number} far         - Far clipping plane distance.
     * @private
     */
    #initFromViewSize(viewSize, aspectRatio, near, far) {
        if (typeof viewSize       !== 'number'
            || typeof aspectRatio !== 'number'
            || typeof near        !== 'number'
            || typeof far         !== 'number') {
            throw new TypeError('`OrthographicCamera` expects numeric arguments in view-size mode.');
        }

        if (viewSize <= MINIMUM_VIEW_SIZE) {
            throw new RangeError('`OrthographicCamera` expects `viewSize` to be a positive number.');
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError('`OrthographicCamera` expects `aspectRatio` to be a positive number.');
        }

        if (far <= near) {
            throw new RangeError('`OrthographicCamera` expects `near < far`.');
        }

        this.#viewSize    = viewSize;
        this.#aspectRatio = aspectRatio;
        this.#near        = near;
        this.#far         = far;
        this.#recomputeBoundsFromViewSize();
        this.#isProjectionMatrixDirty = true;
    }

    /**
     * Recomputes `left/right/top/bottom` based on current `viewSize` and `aspectRatio`.
     *
     * @private
     */
    #recomputeBoundsFromViewSize() {
        if (this.#viewSize === null) {
            throw new Error('`OrthographicCamera` internal error: `viewSize` is null in view-size mode.');
        }

        const halfHeight = this.#viewSize * HALF_MULTIPLIER;
        const halfWidth  = halfHeight * this.#aspectRatio;
        this.#left       = -halfWidth;
        this.#right      =  halfWidth;
        this.#bottom     = -halfHeight;
        this.#top        =  halfHeight;
    }
}
