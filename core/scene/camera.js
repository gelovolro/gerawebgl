import { Object3D }   from './object3d.js';
import { CameraMath } from '../math/camera-math.js';

/** @type {number} */
const MINIMUM_NEAR_CLIP_DISTANCE = 0.0;

/** @type {number} */
const MINIMUM_ASPECT_RATIO = 0.0;

/** @type {number} */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Perspective camera with field of view, aspect ratio and clipping planes.
 * Uses cached matrices to avoid per-frame allocations.
 */
export class PerspectiveCamera extends Object3D {
    /** @type {number} */
    #fieldOfViewRadians;

    /** @type {number} */
    #aspectRatio;

    /** @type {number} */
    #near;

    /** @type {number} */
    #far;

    /** @type {Float32Array} */
    #projectionMatrix;

    /** @type {Float32Array} */
    #viewMatrix;

    /** @type {boolean} */
    #isProjectionMatrixDirty = true;

    /** @type {number} */
    #cachedPositionX = Number.NaN;

    /** @type {number} */
    #cachedPositionY = Number.NaN;

    /** @type {number} */
    #cachedPositionZ = Number.NaN;

    /** @type {number} */
    #cachedRotationX = Number.NaN;

    /** @type {number} */
    #cachedRotationY = Number.NaN;

    /** @type {number} */
    #cachedRotationZ = Number.NaN;

    /** @type {number} */
    #cachedScaleX = Number.NaN;

    /** @type {number} */
    #cachedScaleY = Number.NaN;

    /** @type {number} */
    #cachedScaleZ = Number.NaN;

    /**
     * @param {number} fieldOfViewRadians - Vertical field of view in radians.
     * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
     * @param {number} near               - Distance to the near clipping plane (must be greater than 0).
     * @param {number} far                - Distance to the far clipping plane (must be greater than near).
     */
    constructor(fieldOfViewRadians, aspectRatio, near, far) {
        super();

        if (typeof fieldOfViewRadians !== 'number'
            || typeof aspectRatio     !== 'number'
            || typeof near            !== 'number'
            || typeof far             !== 'number') {
            throw new TypeError('PerspectiveCamera expects numeric constructor arguments.');
        }

        if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
            throw new RangeError('PerspectiveCamera expects a positive aspect ratio.');
        }

        if (near <= MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError('PerspectiveCamera expects 0 < near < far.');
        }

        this.#fieldOfViewRadians = fieldOfViewRadians;
        this.#aspectRatio        = aspectRatio;
        this.#near               = near;
        this.#far                = far;
        this.#projectionMatrix   = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#viewMatrix         = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
    }

    /**
     * Updates the aspect ratio.
     *
     * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== 'number' || aspectRatio <= MINIMUM_ASPECT_RATIO) {
            throw new RangeError('PerspectiveCamera.setAspectRatio expects a positive number.');
        }

        if (aspectRatio === this.#aspectRatio) {
            return;
        }

        this.#aspectRatio = aspectRatio;
        this.#isProjectionMatrixDirty = true;
    }

    /**
     * Returns the projection matrix for this camera. The returned matrix is cached and reused between calls.
     *
     * @returns {Float32Array} - Cached projection matrix.
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
     * Returns the view matrix for this camera (inverse of its local TRS transform).
     * The returned matrix is cached and reused between calls.
     *
     * @returns {Float32Array} - Cached view matrix.
     */
    getViewMatrix() {
        const position = this.position;
        const rotation = this.rotation;
        const scale    = this.scale;

        const positionX = position.x;
        const positionY = position.y;
        const positionZ = position.z;

        const rotationX = rotation.x;
        const rotationY = rotation.y;
        const rotationZ = rotation.z;

        const scaleX = scale.x;
        const scaleY = scale.y;
        const scaleZ = scale.z;

        const hasTransformChanged =
           positionX !== this.#cachedPositionX
        || positionY !== this.#cachedPositionY
        || positionZ !== this.#cachedPositionZ
        || rotationX !== this.#cachedRotationX
        || rotationY !== this.#cachedRotationY
        || rotationZ !== this.#cachedRotationZ
        || scaleX    !== this.#cachedScaleX
        || scaleY    !== this.#cachedScaleY
        || scaleZ    !== this.#cachedScaleZ;

        if (hasTransformChanged) {
            CameraMath.writeViewMatrixTo(this.#viewMatrix, position, rotation, scale);

            this.#cachedPositionX = positionX;
            this.#cachedPositionY = positionY;
            this.#cachedPositionZ = positionZ;

            this.#cachedRotationX = rotationX;
            this.#cachedRotationY = rotationY;
            this.#cachedRotationZ = rotationZ;

            this.#cachedScaleX = scaleX;
            this.#cachedScaleY = scaleY;
            this.#cachedScaleZ = scaleZ;
        }

        return this.#viewMatrix;
    }
}
