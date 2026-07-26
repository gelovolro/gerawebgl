import * as MathConstants from '../constants/math.js';
import { Object3D }       from './object3d.js';

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
        this.#viewMatrix = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
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
            this.#writeViewMatrixTo(this.#viewMatrix, position, rotation, scale);
            this.#cacheTransform(position, rotation, scale);
        }
    }

    /**
     * Writes a view matrix into an existing output matrix.
     *
     * A view matrix is the inverse of the camera transform.
     * It moves the world-space coordinates into the camera-relative view-space.
     *
     * 'Object3D' builds local transforms in this order:
     *
     * local = T * (Rz * Ry * Rx) * S
     *
     * Therefore the inverse view transform is applied in reverse order:
     *
     * view = inv(S) * inv(R) * inv(T)
     *
     * The inverse of the rotation block is its transpose, because the rotation
     * matrix is orthonormal. The inverse scale is applied to the rows of that
     * transposed rotation block, forming matrix:
     *
     * A = inv(S) * R^T
     *
     * Camera translation is then inverted as '-A * position', because the world must be
     * shifted by the opposite camera position after the inverse rotation/scale basis is known.
     *
     * Scale components must be non-zero. A zero scale would have no reciprocal,
     * so the camera transform could not be inverted into a valid view matrix.
     *
     * The method writes the matrix into 'out' and returns that same 'out' buffer.
     *
     * @private
     * @param {Float32Array} out      - Output 4x4 matrix (length 16), that will receive the view matrix.
     * @param {Vector3}      position - Camera position.
     * @param {Vector3}      rotation - Camera rotation in radians.
     * @param {Vector3}      scale    - Camera scale (must be non-zero on all axes).
     * @returns {Float32Array}        - The output matrix (out).
     */
    #writeViewMatrixTo(out, position, rotation, scale) {
        if (scale.x === MathConstants.MATH_MATRIX_VALUES.ZERO
            || scale.y === MathConstants.MATH_MATRIX_VALUES.ZERO
            || scale.z === MathConstants.MATH_MATRIX_VALUES.ZERO) {
            throw new RangeError('Private method `Camera.#writeViewMatrixTo` cannot invert a zero scale.');
        }

        const positionX = position.x;
        const positionY = position.y;
        const positionZ = position.z;

        const rotationX = rotation.x;
        const rotationY = rotation.y;
        const rotationZ = rotation.z;

        const inverseScaleX = MathConstants.MATH_VIEW_MATRIX.SCALE_INVERSE_NUMERATOR / scale.x;
        const inverseScaleY = MathConstants.MATH_VIEW_MATRIX.SCALE_INVERSE_NUMERATOR / scale.y;
        const inverseScaleZ = MathConstants.MATH_VIEW_MATRIX.SCALE_INVERSE_NUMERATOR / scale.z;

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosZ = Math.cos(rotationZ);
        const sinZ = Math.sin(rotationZ);

        // Rotation matrix, R = Rz * Ry * Rx
        const rot00 = cosZ * cosY;
        const rot01 = (cosZ * sinY * sinX) - (sinZ * cosX);
        const rot02 = (cosZ * sinY * cosX) + (sinZ * sinX);

        const rot10 = sinZ * cosY;
        const rot11 = (sinZ * sinY * sinX) + (cosZ * cosX);
        const rot12 = (sinZ * sinY * cosX) - (cosZ * sinX);

        const rot20 = -sinY;
        const rot21 = cosY * sinX;
        const rot22 = cosY * cosX;

        // view = invS * R^T * invT
        // A    = invS * R^T (invS scales rows of R^T)
        const a00 = rot00 * inverseScaleX;
        const a01 = rot10 * inverseScaleX;
        const a02 = rot20 * inverseScaleX;

        const a10 = rot01 * inverseScaleY;
        const a11 = rot11 * inverseScaleY;
        const a12 = rot21 * inverseScaleY;

        const a20 = rot02 * inverseScaleZ;
        const a21 = rot12 * inverseScaleZ;
        const a22 = rot22 * inverseScaleZ;

        // t' = -A * position
        const translateX = -(a00 * positionX + a01 * positionY + a02 * positionZ);
        const translateY = -(a10 * positionX + a11 * positionY + a12 * positionZ);
        const translateZ = -(a20 * positionX + a21 * positionY + a22 * positionZ);

        out[0]  = a00;
        out[1]  = a10;
        out[2]  = a20;
        out[3]  = MathConstants.MATH_MATRIX_VALUES.ZERO;

        out[4]  = a01;
        out[5]  = a11;
        out[6]  = a21;
        out[7]  = MathConstants.MATH_MATRIX_VALUES.ZERO;

        out[8]  = a02;
        out[9]  = a12;
        out[10] = a22;
        out[11] = MathConstants.MATH_MATRIX_VALUES.ZERO;
        out[12] = translateX;
        out[13] = translateY;
        out[14] = translateZ;
        out[15] = MathConstants.MATH_MATRIX_VALUES.UNIT;

        return out;
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
