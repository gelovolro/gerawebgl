import { Object3D } from './object3d.js';
import { Matrix4 }  from '../math/matrix4.js';

/** @type {number} */
const MINIMUM_NEAR_CLIP_DISTANCE = 0.0;

/** @type {number} */
const MINIMUM_ASPECT_RATIO = 0.0; // Aspect ratio must be greater than this value.

/**
 * Perspective camera with field of view, aspect ratio and clipping planes.
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

        this.#aspectRatio = aspectRatio;
    }

    /**
     * Returns the projection matrix for this camera.
     *
     * @returns {Float32Array}
     */
    getProjectionMatrix() {
        return Matrix4.createPerspective(
            this.#fieldOfViewRadians,
            this.#aspectRatio,
            this.#near,
            this.#far
        );
    }
}
