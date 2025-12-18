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
const MATRIX_COLUMN_COUNT = 4;

/** @type {number} */
const MATRIX_ROW_COUNT = 4;

/** @type {number} */
const MATRIX_STRIDE = 4;

/** @type {number} */
const MIN_INVERTIBLE_DETERMINANT_ABS = 1e-12;

/** @type {number} */
const INVERSE_DETERMINANT_NUMERATOR = 1.0;

/**
 * Utility class for working with 4x4 matrices in column-major order.
 *
 * Most methods return new 'Float32Array' instances.
 * Methods ending with "To" write results into an existing output matrix.
 */
export class Matrix4 {
    /**
     * Creates a new 4x4 identity matrix.
     *
     * @returns {Float32Array} - A new identity matrix.
     */
    static createIdentity() {
        const out = Matrix4.#createEmpty();
        out[0]  = 1;
        out[5]  = 1;
        out[10] = 1;
        out[15] = 1;
        return out;
    }

    /**
     * Creates a scale matrix.
     *
     * @param {number} scaleX  - Scale along X.
     * @param {number} scaleY  - Scale along Y.
     * @param {number} scaleZ  - Scale along Z.
     * @returns {Float32Array} - A new scale matrix.
     */
    static createScale(scaleX, scaleY, scaleZ) {
        if (typeof scaleX    !== 'number'
            || typeof scaleY !== 'number'
            || typeof scaleZ !== 'number') {
            throw new TypeError('Matrix4.createScale expects numeric arguments.');
        }

        const out = Matrix4.#createEmpty();
        out[0]  = scaleX;
        out[5]  = scaleY;
        out[10] = scaleZ;
        out[15] = 1;
        return out;
    }

    /**
     * Creates a perspective projection matrix.
     *
     * @param {number} fieldOfViewRadians - Vertical field of view in radians.
     * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
     * @param {number} near               - Near clipping plane, must be > 0.
     * @param {number} far                - Far clipping plane, must be > near.
     * @returns {Float32Array}            - A new perspective projection matrix.
     */
    static createPerspective(fieldOfViewRadians, aspectRatio, near, far) {
        if (typeof fieldOfViewRadians !== 'number'
            || typeof aspectRatio     !== 'number'
            || typeof near            !== 'number'
            || typeof far             !== 'number') {
            throw new TypeError('Matrix4.createPerspective expects numeric arguments.');
        }

        if (near <= 0 || far <= near) {
            throw new RangeError('Matrix4.createPerspective expects 0 < near < far.');
        }

        const out               = Matrix4.#createEmpty();
        const projectionScale   = PROJECTION_SCALE_NUMERATOR / Math.tan(fieldOfViewRadians / HALF_FIELD_OF_VIEW_DIVISOR);
        const inverseDepthRange = DEPTH_RANGE_NUMERATOR / (near - far);

        // Column-major layout:
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
     * Creates a translation matrix.
     *
     * @param {number} translateX - Translation along X axis.
     * @param {number} translateY - Translation along Y axis.
     * @param {number} translateZ - Translation along Z axis.
     * @returns {Float32Array}    - A new translation matrix.
     */
    static createTranslation(translateX, translateY, translateZ) {
        if (typeof translateX    !== 'number'
            || typeof translateY !== 'number'
            || typeof translateZ !== 'number') {
            throw new TypeError('Matrix4.createTranslation expects numeric arguments.');
        }

        const out = Matrix4.createIdentity();
        out[12]   = translateX;
        out[13]   = translateY;
        out[14]   = translateZ;
        return out;
    }

    /**
     * Creates a rotation matrix around the X axis.
     *
     * @param {number} angleRadians - Angle in radians.
     * @returns {Float32Array}      - A new rotation matrix.
     */
    static createRotationX(angleRadians) {
        if (typeof angleRadians !== 'number') {
            throw new TypeError('Matrix4.createRotationX expects a numeric argument.');
        }

        const cosAngle = Math.cos(angleRadians);
        const sinAngle = Math.sin(angleRadians);
        const out      = Matrix4.#createEmpty();

        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;

        out[4] = 0;
        out[5] = cosAngle;
        out[6] = sinAngle;
        out[7] = 0;

        out[8]  = 0;
        out[9]  = -sinAngle;
        out[10] = cosAngle;
        out[11] = 0;

        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;

        return out;
    }

    /**
     * Creates a rotation matrix around the Y axis.
     *
     * @param {number} angleRadians - Angle in radians.
     * @returns {Float32Array}      - A new rotation matrix.
     */
    static createRotationY(angleRadians) {
        if (typeof angleRadians !== 'number') {
            throw new TypeError('Matrix4.createRotationY expects a numeric argument.');
        }

        const cosAngle = Math.cos(angleRadians);
        const sinAngle = Math.sin(angleRadians);
        const out      = Matrix4.#createEmpty();

        out[0] = cosAngle;
        out[1] = 0;
        out[2] = -sinAngle;
        out[3] = 0;

        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;

        out[8]  = sinAngle;
        out[9]  = 0;
        out[10] = cosAngle;
        out[11] = 0;

        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;

        return out;
    }

    /**
     * Creates a rotation matrix around the Z axis.
     *
     * @param {number} angleRadians - Angle in radians.
     * @returns {Float32Array}      - A new rotation matrix.
     */
    static createRotationZ(angleRadians) {
        if (typeof angleRadians !== 'number') {
            throw new TypeError('Matrix4.createRotationZ expects a numeric argument.');
        }

        const cosAngle = Math.cos(angleRadians);
        const sinAngle = Math.sin(angleRadians);
        const out      = Matrix4.#createEmpty();

        out[0]  = cosAngle;
        out[1]  = sinAngle;
        out[2]  = 0;
        out[3]  = 0;

        out[4]  = -sinAngle;
        out[5]  = cosAngle;
        out[6]  = 0;
        out[7]  = 0;

        out[8]  = 0;
        out[9]  = 0;
        out[10] = 1;
        out[11] = 0;

        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;

        return out;
    }

    /**
     * Multiplies two 4x4 matrices: result = leftMatrix * rightMatrix.
     *
     * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
     * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
     * @returns {Float32Array}           - A new matrix containing the product.
     */
    static multiply(leftMatrix, rightMatrix) {
        if (!(leftMatrix instanceof Float32Array)
            || leftMatrix.length !== MATRIX_4x4_ELEMENT_COUNT
            || !(rightMatrix instanceof Float32Array)
            || rightMatrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('Matrix4.multiply expects two 4x4 Float32Array matrices.');
        }

        const out = Matrix4.#createEmpty();
        return Matrix4.#multiplyIntoUnchecked(out, leftMatrix, rightMatrix);
    }

    /**
     * Multiplies two 4x4 matrices into an existing output matrix:
     * out = leftMatrix * rightMatrix.
     *
     * Notes: out must not be the same object as leftMatrix or rightMatrix.
     *
     * @param {Float32Array} out         - Output 4x4 matrix.
     * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
     * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
     * @returns {Float32Array}           - The output matrix (out).
     */
    static multiplyTo(out, leftMatrix, rightMatrix) {
        if (!(out instanceof Float32Array)
            || out.length !== MATRIX_4x4_ELEMENT_COUNT
            || !(leftMatrix instanceof Float32Array)
            || leftMatrix.length !== MATRIX_4x4_ELEMENT_COUNT
            || !(rightMatrix instanceof Float32Array)
            || rightMatrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('Matrix4.multiplyTo expects three 4x4 Float32Array matrices.');
        }

        if (out === leftMatrix || out === rightMatrix) {
            throw new Error('Matrix4.multiplyTo does not support in-place multiplication. Use a separate output matrix.');
        }

        return Matrix4.#multiplyIntoUnchecked(out, leftMatrix, rightMatrix);
    }

    /**
     * Multiplies several matrices in sequence:
     * result = m0 * m1 * m2 * ... * mn
     *
     * Notes: If no matrices are provided, returns a new identity matrix. If exactly one matrix is provided, returns the same matrix instance (no copy).
     *
     * @param {...Float32Array} matrices - Matrices to multiply, in order.
     * @returns {Float32Array}           - The resulting matrix.
     */
    static multiplyMany(...matrices) {
        if (matrices.length === 0) {
            return Matrix4.createIdentity();
        }

        let result = matrices[0];

        for (let index = 1; index < matrices.length; index += 1) {
            result = Matrix4.multiply(result, matrices[index]);
        }

        return result;
    }

    /**
     * Transposes a 4x4 matrix.
     *
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - A new transposed matrix.
     */
    static transpose(matrix) {
        if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.transpose` expects a 4x4 `Float32Array` matrix.');
        }

        const out = Matrix4.#createEmpty();
        return Matrix4.#transposeIntoUnchecked(out, matrix);
    }

    /**
     * Transposes a 4x4 matrix into an existing output matrix.
     *
     * Notes: out must not be the same object as matrix.
     *
     * @param {Float32Array} out    - Output 4x4 matrix.
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - The output matrix (out).
     */
    static transposeTo(out, matrix) {
        if (!(out instanceof Float32Array)
            || out.length !== MATRIX_4x4_ELEMENT_COUNT
            || !(matrix instanceof Float32Array)
            || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.transposeTo` expects two 4x4 `Float32Array` matrices.');
        }

        if (out === matrix) {
            throw new Error('`Matrix4.transposeTo` does not support in-place transpose. Use a separate output matrix.');
        }

        return Matrix4.#transposeIntoUnchecked(out, matrix);
    }

    /**
     * Inverts a 4x4 matrix.
     *
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - A new inverted matrix.
     */
    static invert(matrix) {
        if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.invert` expects a 4x4 `Float32Array` matrix.');
        }

        const out = Matrix4.#createEmpty();
        return Matrix4.#invertIntoUnchecked(out, matrix);
    }

    /**
     * Inverts a 4x4 matrix into an existing output matrix.
     *
     * Notes: out must not be the same object as matrix.
     *
     * @param {Float32Array} out    - Output 4x4 matrix.
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - The output matrix (out).
     */
    static invertTo(out, matrix) {
        if (!(out instanceof Float32Array)
            || out.length !== MATRIX_4x4_ELEMENT_COUNT
            || !(matrix instanceof Float32Array)
            || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.invertTo` expects two 4x4 `Float32Array` matrices.');
        }

        if (out === matrix) {
            throw new Error('`Matrix4.invertTo` does not support in-place inversion.');
        }

        return Matrix4.#invertIntoUnchecked(out, matrix);
    }

    /**
     * Multiplies two 4x4 matrices into out without validation.
     *
     * @param {Float32Array} out         - Output 4x4 matrix that will receive the result.
     * @param {Float32Array} leftMatrix  - Left-hand 4x4 matrix.
     * @param {Float32Array} rightMatrix - Right-hand 4x4 matrix.
     * @returns {Float32Array}           - The output matrix (out).
     * @private
     */
    static #multiplyIntoUnchecked(out, leftMatrix, rightMatrix) {
        for (let columnIndex = 0; columnIndex < MATRIX_COLUMN_COUNT; columnIndex += 1) {
            const rightColumnOffset = columnIndex * MATRIX_STRIDE;

            for (let rowIndex = 0; rowIndex < MATRIX_ROW_COUNT; rowIndex += 1) {
                const resultIndex = rightColumnOffset + rowIndex;

                out[resultIndex] =
                  leftMatrix[0 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 0]
                + leftMatrix[1 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 1]
                + leftMatrix[2 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 2]
                + leftMatrix[3 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 3];
            }
        }

        return out;
    }

    /**
     * Transposes a 4x4 matrix into out without validation.
     *
     * @param {Float32Array} out    - Output 4x4 matrix, that will receive the result.
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - The output matrix (out).
     * @private
     */
    static #transposeIntoUnchecked(out, matrix) {
        out[0]  = matrix[0];
        out[1]  = matrix[4];
        out[2]  = matrix[8];
        out[3]  = matrix[12];

        out[4]  = matrix[1];
        out[5]  = matrix[5];
        out[6]  = matrix[9];
        out[7]  = matrix[13];

        out[8]  = matrix[2];
        out[9]  = matrix[6];
        out[10] = matrix[10];
        out[11] = matrix[14];

        out[12] = matrix[3];
        out[13] = matrix[7];
        out[14] = matrix[11];
        out[15] = matrix[15];

        return out;
    }

    /**
     * Inverts a 4x4 matrix into out without validation. Throws when the matrix is not invertible.
     *
     * @param {Float32Array} out    - Output 4x4 matrix, that will receive the result.
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - The output matrix (out).
     * @private
     */
    static #invertIntoUnchecked(out, matrix) {
        const a00 = matrix[0];
        const a01 = matrix[1];
        const a02 = matrix[2];
        const a03 = matrix[3];

        const a10 = matrix[4];
        const a11 = matrix[5];
        const a12 = matrix[6];
        const a13 = matrix[7];

        const a20 = matrix[8];
        const a21 = matrix[9];
        const a22 = matrix[10];
        const a23 = matrix[11];

        const a30 = matrix[12];
        const a31 = matrix[13];
        const a32 = matrix[14];
        const a33 = matrix[15];

        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        const determinant =
          b00 * b11
        - b01 * b10
        + b02 * b09
        + b03 * b08
        - b04 * b07
        + b05 * b06;

        if (Math.abs(determinant) < MIN_INVERTIBLE_DETERMINANT_ABS) {
            throw new Error('`Matrix4.invertTo`: matrix is not invertible.');
        }

        const inverseDeterminant = INVERSE_DETERMINANT_NUMERATOR / determinant;

        out[0]  = (a11 * b11 - a12 * b10 + a13 * b09) * inverseDeterminant;
        out[1]  = (a02 * b10 - a01 * b11 - a03 * b09) * inverseDeterminant;
        out[2]  = (a31 * b05 - a32 * b04 + a33 * b03) * inverseDeterminant;
        out[3]  = (a22 * b04 - a21 * b05 - a23 * b03) * inverseDeterminant;

        out[4]  = (a12 * b08 - a10 * b11 - a13 * b07) * inverseDeterminant;
        out[5]  = (a00 * b11 - a02 * b08 + a03 * b07) * inverseDeterminant;
        out[6]  = (a32 * b02 - a30 * b05 - a33 * b01) * inverseDeterminant;
        out[7]  = (a20 * b05 - a22 * b02 + a23 * b01) * inverseDeterminant;

        out[8]  = (a10 * b10 - a11 * b08 + a13 * b06) * inverseDeterminant;
        out[9]  = (a01 * b08 - a00 * b10 - a03 * b06) * inverseDeterminant;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * inverseDeterminant;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * inverseDeterminant;

        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * inverseDeterminant;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * inverseDeterminant;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * inverseDeterminant;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * inverseDeterminant;

        return out;
    }

    /**
     * Internal helper to create a zero-filled 4x4 matrix.
     *
     * @returns {Float32Array} - A new zero-filled 4x4 matrix (length 16).
     * @private
     */
    static #createEmpty() {
        return new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
    }
}
