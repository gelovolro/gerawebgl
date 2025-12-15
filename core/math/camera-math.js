import { Vector3 } from './vector3.js';

/** @type {number} */
const HALF_FIELD_OF_VIEW_DIVISOR = 2.0;

/** @type {number} */
const PROJECTION_SCALE_NUMERATOR = 1.0;

/** @type {number} */
const DEPTH_RANGE_NUMERATOR = 1.0;

/** @type {number} */
const PERSPECTIVE_Z_RANGE_MULTIPLIER = 2.0;

/** @type {number} */
const PERSPECTIVE_W_COMPONENT_SCALE = -1.0;

/** @type {number} */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/** @type {number} */
const MINIMUM_ASPECT_RATIO = 0.0;

/** @type {number} */
const MINIMUM_NEAR_CLIP_DISTANCE = 0.0;

/** @type {number} */
const SCALE_INVERSE_NUMERATOR = 1.0;

/**
 * Camera-related matrix computations. Writes results into preallocated output buffers.
 */
export class CameraMath {
    /**
     * Writes a perspective projection matrix into an existing output matrix.
     *
     * @param {Float32Array} out          - Output 4x4 matrix (length 16), that will receive the projection matrix.
     * @param {number} fieldOfViewRadians - Vertical field of view in radians.
     * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
     * @param {number} near               - Near clipping plane distance (must be > 0).
     * @param {number} far                - Far clipping plane distance (must be > near).
     * @returns {Float32Array}            - The output matrix (out).
     */
    static writePerspectiveMatrixTo(out, fieldOfViewRadians, aspectRatio, near, far) {
        CameraMath.#assertMatrix4(out);

        if (typeof fieldOfViewRadians !== 'number'
            || typeof aspectRatio     !== 'number'
            || typeof near            !== 'number'
            || typeof far             !== 'number') {
            throw new TypeError('CameraMath.writePerspectiveMatrixTo expects numeric arguments.');
        }

        if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
            throw new RangeError('CameraMath.writePerspectiveMatrixTo expects a positive aspect ratio.');
        }

        if (near <= MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
            throw new RangeError('CameraMath.writePerspectiveMatrixTo expects 0 < near < far.');
        }

        const projectionScale   = PROJECTION_SCALE_NUMERATOR / Math.tan(fieldOfViewRadians / HALF_FIELD_OF_VIEW_DIVISOR);
        const inverseDepthRange = DEPTH_RANGE_NUMERATOR / (near - far);

        out[0]  = projectionScale / aspectRatio;
        out[1]  = 0;
        out[2]  = 0;
        out[3]  = 0;

        out[4]  = 0;
        out[5]  = projectionScale;
        out[6]  = 0;
        out[7]  = 0;

        out[8]  = 0;
        out[9]  = 0;
        out[10] = (far + near) * inverseDepthRange;
        out[11] = PERSPECTIVE_W_COMPONENT_SCALE;

        out[12] = 0;
        out[13] = 0;
        out[14] = (PERSPECTIVE_Z_RANGE_MULTIPLIER * far * near) * inverseDepthRange;
        out[15] = 0;

        return out;
    }

    /**
     * Writes a view matrix (inverse of camera, TRS) into an existing output matrix.
     *
     * Assumes camera local transform order matches Object3D:
     * local = T * (Rz * Ry * Rx) * S
     * view  = inv(S) * inv(R) * inv(T)
     *
     * @param {Float32Array} out - Output 4x4 matrix (length 16), that will receive the view matrix.
     * @param {Vector3} position - Camera position.
     * @param {Vector3} rotation - Camera rotation in radians.
     * @param {Vector3} scale    - Camera scale (must be non-zero on all axes).
     * @returns {Float32Array}   - The output matrix (out).
     */
    static writeViewMatrixTo(out, position, rotation, scale) {
        CameraMath.#assertMatrix4(out);

        if (!(position    instanceof Vector3)
            || !(rotation instanceof Vector3)
            || !(scale    instanceof Vector3)) {
            throw new TypeError('CameraMath.writeViewMatrixTo expects Vector3 arguments (position, rotation, scale).');
        }

        if (scale.x === 0 || scale.y === 0 || scale.z === 0) {
            throw new RangeError('CameraMath.writeViewMatrixTo cannot invert a zero scale.');
        }

        const positionX = position.x;
        const positionY = position.y;
        const positionZ = position.z;

        const rotationX = rotation.x;
        const rotationY = rotation.y;
        const rotationZ = rotation.z;

        const inverseScaleX = SCALE_INVERSE_NUMERATOR / scale.x;
        const inverseScaleY = SCALE_INVERSE_NUMERATOR / scale.y;
        const inverseScaleZ = SCALE_INVERSE_NUMERATOR / scale.z;

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosZ = Math.cos(rotationZ);
        const sinZ = Math.sin(rotationZ);

        // Rotation matrix, R = Rz * Ry * Rx:
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
        // A    = invS * R^T (invS scales rows of R^T):
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

        out[0]  = a00; out[1] = a10; out[2]  = a20; out[3]  = 0;
        out[4]  = a01; out[5] = a11; out[6]  = a21; out[7]  = 0;
        out[8]  = a02; out[9] = a12; out[10] = a22; out[11] = 0;
        out[12] = translateX;
        out[13] = translateY;
        out[14] = translateZ;
        out[15] = 1;

        return out;
    }

    /**
     * @param {Float32Array} out - Output matrix to validate.
     * @private
     */
    static #assertMatrix4(out) {
        if (!(out instanceof Float32Array) || out.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('Expected out to be a Float32Array(16).');
        }
    }
}
