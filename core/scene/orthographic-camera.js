import * as MathConstants               from '../constants/math.js';
import * as OrthographicCameraConstants from '../constants/orthographic-camera.js';
import { Matrix4 }                      from '../math/matrix4.js';
import { Camera }                       from './camera.js';

/**
 * Orthographic camera supporting two projection configuration modes.
 *
 * 1). In explicit bounds mode, the projection volume is defined by six values:
 * `left`, `right`, `bottom`, `top`, `near` and `far`.
 *
 * 2). In view-size mode, the projection bounds are calculated automatically
 * from `viewSize` and `aspectRatio`. The `viewSize` specifies the vertical
 * extent in world units, while `aspectRatio` determines the horizontal extent.
 *
 * The `setAspectRatio()` method updates the projection bounds only in
 * view-size mode, leaving explicitly configured bounds unchanged.
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
    #viewSize = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_DEFAULTS.VIEW_SIZE;

    /**
     * Aspect ratio used in view-size mode (width / height).
     *
     * @type {number}
     * @private
     */
    #aspectRatio = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_DEFAULTS.ASPECT_RATIO;

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
    #isProjectionMatrixDirty = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_DEFAULTS.DIRTY;

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
                throw new TypeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.OPTIONS_ARRAY);
            }

            const optionsPrototype = Object.getPrototypeOf(leftOrOptions);

            if (optionsPrototype !== Object.prototype && optionsPrototype !== null) {
                throw new TypeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.OPTIONS_TYPE);
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
        if (!Number.isFinite(aspectRatio)) {
            throw new TypeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.SET_ASPECT_TYPE);
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.SET_ASPECT_RANGE);
        }

        if (this.#viewSize === OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_DEFAULTS.VIEW_SIZE) {
            return;
        }

        if (aspectRatio === this.#aspectRatio) {
            return;
        }

        this.#validateViewExtents(this.#viewSize, aspectRatio);
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

            if (!this.#projectionMatrix.every(Number.isFinite)) {
                throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.PROJECTION_NONFINITE);
            }

            this.#isProjectionMatrixDirty = false;
        }

        return this.#projectionMatrix;
    }

    /**
     * @param {Object} options - Initialization options.
     * @private
     */
    #initFromOptions(options) {
        const hasViewSize = Object.prototype.hasOwnProperty.call(options, OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_OPTION_KEYS.VIEW_SIZE);

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
        if (!Number.isFinite(left)
            || !Number.isFinite(right)
            || !Number.isFinite(bottom)
            || !Number.isFinite(top)
            || !Number.isFinite(near)
            || !Number.isFinite(far)) {
            throw new TypeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.BOUNDS_TYPE);
        }

        if (left === right) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.BOUNDS_WIDTH);
        }

        if (bottom === top) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.BOUNDS_HEIGHT);
        }

        if (far <= near) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.BOUNDS_DEPTH);
        }

        this.#viewSize = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_DEFAULTS.VIEW_SIZE;
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
        if (!Number.isFinite(viewSize)
            || !Number.isFinite(aspectRatio)
            || !Number.isFinite(near)
            || !Number.isFinite(far)) {
            throw new TypeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.VIEW_SIZE_TYPE);
        }

        if (viewSize <= OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_VALUES.MINIMUM_VIEW_SIZE) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.VIEW_SIZE);
        }

        if (aspectRatio <= MathConstants.MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.ASPECT_RATIO);
        }

        if (far <= near) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.VIEW_SIZE_DEPTH);
        }

        this.#validateViewExtents(viewSize, aspectRatio);
        this.#viewSize    = viewSize;
        this.#aspectRatio = aspectRatio;
        this.#near        = near;
        this.#far         = far;

        this.#recomputeBoundsFromViewSize();
        this.#isProjectionMatrixDirty = true;
    }

    /**
     * Validates that the view-size mode produces finite horizontal and vertical extents.
     *
     * @param {number} viewSize    - View height in world units.
     * @param {number} aspectRatio - View width-to-height ratio.
     * @returns {void}
     * @private
     */
    #validateViewExtents(viewSize, aspectRatio) {
        const halfHeight = viewSize * OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_VALUES.HALF_MULTIPLIER;
        const halfWidth  = halfHeight * aspectRatio;

        if (!Number.isFinite(halfWidth)
            || halfHeight <= OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_VALUES.MINIMUM_VIEW_SIZE
            || halfWidth <= OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_VALUES.MINIMUM_VIEW_SIZE) {
            throw new RangeError(OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS.VIEW_SIZE_EXTENTS);
        }
    }

    /**
     * Recomputes `left/right/top/bottom` based on current `viewSize` and `aspectRatio`.
     *
     * @returns {void}
     * @private
     */
    #recomputeBoundsFromViewSize() {
        const halfHeight = this.#viewSize * OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_VALUES.HALF_MULTIPLIER;
        const halfWidth  = halfHeight * this.#aspectRatio;
        this.#left       = -halfWidth;
        this.#right      =  halfWidth;
        this.#bottom     = -halfHeight;
        this.#top        =  halfHeight;
    }
}
