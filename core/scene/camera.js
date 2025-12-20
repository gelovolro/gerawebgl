import { Object3D }   from './object3d.js';
import { CameraMath } from '../math/camera-math.js';

/**
 * Element count for a 4x4 matrix stored in a flat array.
 *
 * @type {number}
 */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Base camera class. Responsibilities:
 * - Caches view matrix (inverse of local TRS transform).
 * - Defines a common camera contract for derived camera types.
 */
export class Camera extends Object3D {

    /**
     * Cached view matrix buffer. Reused between frames to avoid allocations.
     *
     * @type {Float32Array}
     * @private
     */
    #viewMatrix;

    /**
     * Cached local `position X` component used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedPositionX = Number.NaN;

    /**
     * Cached local `position Y` component used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedPositionY = Number.NaN;

    /**
     * Cached local `position Z` component used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedPositionZ = Number.NaN;

    /**
     * Cached local `rotation X` component (radians) used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedRotationX = Number.NaN;

    /**
     * Cached local `rotation Y` component (radians) used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedRotationY = Number.NaN;

    /**
     * Cached local `rotation Z` component (radians) used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedRotationZ = Number.NaN;

    /**
     * Cached local `scale X` component used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedScaleX = Number.NaN;

    /**
     * Cached local `scale Y` component used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedScaleY = Number.NaN;

    /**
     * Cached local `scale Z` component used to detect transform changes.
     *
     * @type {number}
     * @private
     */
    #cachedScaleZ = Number.NaN;

    constructor() {
        super();
        this.#viewMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
    }

    /**
     * Returns the view matrix (inverse of camera local TRS transform).
     * The returned matrix is cached and reused between calls.
     *
     * @returns {Float32Array} - Cached view matrix.
     */
    getViewMatrix() {
        this.#updateViewMatrixIfRequired();
        return this.#viewMatrix;
    }

    /**
     * Returns the projection matrix for this camera.
     * Derived camera classes must implement this method.
     *
     * @throws {Error} Always throws in the base class.
     * @returns {Float32Array} - Projection matrix.
     */
    getProjectionMatrix() {
        throw new Error('`Camera.getProjectionMatrix` must be implemented in a derived camera class.');
    }

    /**
     * Updates the camera aspect ratio (width/height).
     * Base camera class does not define, how aspect ratio affects the projection.
     *
     * @param {number} aspectRatio - New viewport aspect ratio.
     */
    setAspectRatio(aspectRatio) {
        if (typeof aspectRatio !== 'number') {
            throw new TypeError('`Camera.setAspectRatio` expects `aspectRatio` as a number.');
        }

        throw new Error('`Camera.setAspectRatio` must be implemented in a derived camera class.');
    }

    /**
     * Recomputes the view matrix only, when local transform changes since the last call.
     *
     * @private
     */
    #updateViewMatrixIfRequired() {
        const position    = this.position;
        const rotation    = this.rotation;
        const scale       = this.scale;
        const isViewDirty = this.#isTransformChanged(position, rotation, scale);

        if (isViewDirty === true) {
            CameraMath.writeViewMatrixTo(this.#viewMatrix, position, rotation, scale);
            this.#cacheTransform(position, rotation, scale);
        }
    }

    /**
     * Checks whether the local transform has changed, since the last cached snapshot.
     *
     * @param {Object} position - Camera position vector.
     * @param {Object} rotation - Camera rotation vector in radians.
     * @param {Object} scale    - Camera scale vector.
     * @returns {boolean}       - True, when local transform differs from cached snapshot.
     * @private
     */
    #isTransformChanged(position, rotation, scale) {
        if (this.#isPositionChanged(position) === true) {
            return true;
        }

        if (this.#isRotationChanged(rotation) === true) {
            return true;
        }

        if (this.#isScaleChanged(scale) === true) {
            return true;
        }

        return false;
    }

    /* eslint-disable indent */

    /**
     * @param {Object} position - Position vector.
     * @returns {boolean}       - True, when local position differs from the cached snapshot.
     * @private
     */
    #isPositionChanged(position) {
        return (
               position.x !== this.#cachedPositionX
            || position.y !== this.#cachedPositionY
            || position.z !== this.#cachedPositionZ
        );
    }

    /**
     * @param {Object} rotation - Rotation vector.
     * @returns {boolean}       - True, when local rotation differs from the cached snapshot.
     * @private
     */
    #isRotationChanged(rotation) {
        return (
               rotation.x !== this.#cachedRotationX
            || rotation.y !== this.#cachedRotationY
            || rotation.z !== this.#cachedRotationZ
        );
    }

    /**
     * @param {Object} scale - Scale vector.
     * @returns {boolean}    - True, when local scale differs from the cached snapshot.
     * @private
     */
    #isScaleChanged(scale) {
        return (
               scale.x !== this.#cachedScaleX
            || scale.y !== this.#cachedScaleY
            || scale.z !== this.#cachedScaleZ
        );
    }

    /* eslint-enable indent */

    /**
     * Stores the current local transform components as a cached snapshot for future comparisons.
     *
     * @param {Object} position - Position vector.
     * @param {Object} rotation - Rotation vector.
     * @param {Object} scale    - Scale vector.
     * @private
     */
    #cacheTransform(position, rotation, scale) {
        this.#cachedPositionX = position.x;
        this.#cachedPositionY = position.y;
        this.#cachedPositionZ = position.z;

        this.#cachedRotationX = rotation.x;
        this.#cachedRotationY = rotation.y;
        this.#cachedRotationZ = rotation.z;

        this.#cachedScaleX = scale.x;
        this.#cachedScaleY = scale.y;
        this.#cachedScaleZ = scale.z;
    }
}
