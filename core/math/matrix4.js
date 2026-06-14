import * as MathConstants from '../constants/math.js';

/**
 * Utility class for 4x4 transformation matrices.
 *
 * Matrices are stored as flat 'Float32Array' values in column-major order.
 *
 * A matrix can be flattened into an array in two common ways:
 * 1). row-major stores it row by row
 * 2). column-major stores it column by column
 *
 * Example:
 *
 * [ m00 m01 m02 m03 ]
 * [ m10 m11 m12 m13 ]
 * [ m20 m21 m22 m23 ]
 * [ m30 m31 m32 m33 ]
 *
 * Row-major    : [ m00, m01, m02, m03, m10, m11, m12, m13, ... ]
 * Column-major : [ m00, m10, m20, m30, m01, m11, m21, m31, ... ]
 *
 * To read or write a matrix cell in this flat array,
 * convert its column and row position into an array index.
 *
 * 'row count'                - is always '4', because each column of a 4x4 matrix contains 4 row values
 * 'column index * row count' - gives the start index of the target column
 * 'row index'                - selects the value inside the target column
 *
 * The resulting formula is:
 * 'cell index = column index * row count + row index'
 *
 * So:
 * m20 -> cell index = 0 * 4 + 2 = 2
 * m01 -> cell index = 1 * 4 + 0 = 4
 *
 * It is also important to highlight that, when a 4x4 matrix represents
 * an 'affine transform', its translation part is stored in the last column.
 *
 * Conceptually, this translation column is multiplied
 * by the input 'homogeneous' coordinate called 'w':
 *
 * [ ... ... ... tx ]
 * [ ... ... ... ty ]
 * [ ... ... ... tz ]
 * [ ... ... ...  w ]
 *
 * Here, 'tx, ty and tz' are 'x, y, z' translation components.
 *
 * When a transform is applied as 'transformed value = matrix * input value',
 * the translation part contributes to the result through input 'w':
 *
 * 'new x = ... + tx * w'
 * 'new y = ... + ty * w'
 * 'new z = ... + tz * w'
 *
 * So, if 'w = 1', translation is added to the result.
 * If 'w = 0', translation becomes zero and is ignored.
 *
 * Since 'tx', 'ty' and 'tz' are stored in the last column,
 * their flat array indices are calculated by the same formula:
 *
 * tx -> m03 -> cell index = 3 * 4 + 0 = 12
 * ty -> m13 -> cell index = 3 * 4 + 1 = 13
 * tz -> m23 -> cell index = 3 * 4 + 2 = 14
 *
 * For a usual affine transform, the last row is: [ 0, 0, 0, 1 ]
 * It keeps the input 'w' unchanged during multiplication.
 *
 * Matrix multiplication is ordered: 'left * right' is not the same as 'right * left'.
 * When the result is applied to a column vector, the right matrix is applied first.
 */
export class Matrix4 {
    /**
     * Creates a new 4x4 identity matrix:
     *
     * column 0: [ 1, 0, 0, 0 ]
     * column 1: [ 0, 1, 0, 0 ]
     * column 2: [ 0, 0, 1, 0 ]
     * column 3: [ 0, 0, 0, 1 ]
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
     * Creates a scale matrix:
     *
     * column 0: [ scaleX, 0,      0,      0 ]
     * column 1: [ 0,      scaleY, 0,      0 ]
     * column 2: [ 0,      0,      scaleZ, 0 ]
     * column 3: [ 0,      0,      0,      1 ]
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
     * Creates a perspective projection matrix:
     *
     * column 0: [ projectionScale / aspectRatio, 0,               0,           0 ]
     * column 1: [ 0,                             projectionScale, 0,           0 ]
     * column 2: [ 0,                             0,               depthScale, -1 ]
     * column 3: [ 0,                             0,               depthOffset, 0 ]
     *
     * Perspective projection:
     * - makes farther objects appear smaller and closer objects appear larger
     * - unlike the orthographic projection, object size depends on distance from the camera
     *
     * How the matrix is applied to a 3D point?
     * - the matrix stores projection coefficients, not a projected point
     * - a view-space 3D point [x, y, z] is used as a homogeneous input [x, y, z, 1]
     * - homogeneous input means a 3D point, stored with a helper 'w-component', not a point in 4D space
     * - 'w = 1' means a position, 'w = 0' means a direction, so the translation/depth offset wouldn't apply
     *
     * Multiplying this homogeneous form of the 3D point by the matrix produces the clip-space coordinates:
     *
     * clip x: [ x * projectionScale / aspectRatio ]
     * clip y: [ y * projectionScale               ]
     * clip z: [ z * depthScale + 1 * depthOffset  ]
     * clip w: [ z * (-1) + 1 * 0 = -z             ]
     *
     * About spaces:
     * - world-space describes where an object is in the scene
     * - view-space describes the same object relative to the camera, before the projection
     * - the perspective projection matrix converts the 'view-space' coordinates into the 'clip-space' coordinates
     * - clip-space stores 4 components: [clip x, clip y, clip z, clip w]
     * - clip-space is where projected coordinates are checked against the visible camera volume
     * - after clipping, the perspective divide ('/ clip w') converts clip-space coordinates into NDC coordinates
     *
     * Notes about the projection scale:
     * - the scale uses the half-angle between the camera center line and the vertical view boundary (that's why tangent is used)
     * - tangent describes how wide the vertical view opens from this half-angle
     * - the inverse is used, because tangent gives the view opening, while the matrix needs a scale, that brings this opening back to the unit boundary
     * - the final scale value is the inverse of that opening value (tangent of half of the vertical FOV)
     *
     * Depth mapping:
     * - depth scale controls how the view-space z value is scaled for clip-space z
     * - depth offset shifts the scaled z value so 'near' and 'far' can be mapped to the clip-space depth limits
     *
     * Formulas:
     * - aspect ratio                = viewport width / viewport height
     * - vertical projection scale   = inverse of tangent(half vertical field of view)
     * - horizontal projection scale = vertical projection scale / aspect ratio
     * - depth scale                 = (far + near) / (near - far)
     * - depth offset                = 2 * far * near / (near - far)
     *
     * @param {number} fieldOfViewRadians - Vertical field of view in radians.
     * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
     * @param {number} near               - Near clipping plane, must be '> 0'.
     * @param {number} far                - Far clipping plane, must be '> near'.
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

        const out                    = Matrix4.#createEmpty();
        const inverseDepthRange      = MathConstants.MATH_PERSPECTIVE.DEPTH_RANGE_NUMERATOR / (near - far);
        const halfFieldOfViewRadians = fieldOfViewRadians / MathConstants.MATH_PERSPECTIVE.HALF_FIELD_OF_VIEW_DIVISOR;
        const projectionScale        = MathConstants.MATH_PERSPECTIVE.PROJECTION_SCALE_NUMERATOR / Math.tan(halfFieldOfViewRadians);

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
        out[11] = MathConstants.MATH_PERSPECTIVE.W_COMPONENT_SCALE;

        out[12] = 0;
        out[13] = 0;
        out[14] = (MathConstants.MATH_PERSPECTIVE.Z_RANGE_MULTIPLIER * far * near) * inverseDepthRange;
        out[15] = 0;

        return out;
    }

    /**
     * Creates a translation matrix:
     *
     * [ 1 0 0 translateX ]
     * [ 0 1 0 translateY ]
     * [ 0 0 1 translateZ ]
     * [ 0 0 0 1          ]
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
     * Creates a rotation matrix around the X axis:
     *
     * [ 1 0         0        0 ]
     * [ 0 cosAngle -sinAngle 0 ]
     * [ 0 sinAngle  cosAngle 0 ]
     * [ 0 0         0        1 ]
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
     * Creates a rotation matrix around the Y axis:
     *
     * [  cosAngle 0 sinAngle 0 ]
     * [  0        1 0        0 ]
     * [ -sinAngle 0 cosAngle 0 ]
     * [  0        0 0        1 ]
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
     * Creates a rotation matrix around the Z axis:
     *
     * [ cosAngle -sinAngle 0 0 ]
     * [ sinAngle  cosAngle 0 0 ]
     * [ 0         0        1 0 ]
     * [ 0         0        0 1 ]
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
     * Multiplies two 4x4 matrices: 'result = leftMatrix * rightMatrix'.
     *
     * Order matters. With column-vector style, right matrix is applied first.
     *
     * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
     * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
     * @returns {Float32Array}           - A new matrix containing the product.
     */
    static multiply(leftMatrix, rightMatrix) {
        if (!(leftMatrix instanceof Float32Array)
            || leftMatrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT
            || !(rightMatrix instanceof Float32Array)
            || rightMatrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError('Matrix4.multiply expects two 4x4 Float32Array matrices.');
        }

        const out = Matrix4.#createEmpty();
        return Matrix4.#multiplyIntoUnchecked(out, leftMatrix, rightMatrix);
    }

    /**
     * Multiplies two 4x4 matrices into an existing output matrix:
     * 'out = leftMatrix * rightMatrix'.
     *
     * Notes:
     * - order matters, with column-vector style the right matrix is applied first
     * - out must not be the same object as 'leftMatrix' or 'rightMatrix'
     *
     * @param {Float32Array} out         - Output 4x4 matrix.
     * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
     * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
     * @returns {Float32Array}           - The output matrix (out).
     */
    static multiplyTo(out, leftMatrix, rightMatrix) {
        if (!(out instanceof Float32Array)
            || out.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT
            || !(leftMatrix instanceof Float32Array)
            || leftMatrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT
            || !(rightMatrix instanceof Float32Array)
            || rightMatrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError('Matrix4.multiplyTo expects three 4x4 Float32Array matrices.');
        }

        if (out === leftMatrix || out === rightMatrix) {
            throw new Error('Matrix4.multiplyTo does not support in-place multiplication. Use a separate output matrix.');
        }

        return Matrix4.#multiplyIntoUnchecked(out, leftMatrix, rightMatrix);
    }

    /**
     * Multiplies several matrices in sequence:
     * 'result = m0 * m1 * m2 * ... * mn'
     *
     * Notes:
     * - order matters, with column-vector style, the last matrix is applied first
     * - if no matrices are provided, returns a new identity matrix
     * - if exactly one matrix is provided, returns the same matrix instance (no copy)
     *
     * @param {...Float32Array} matrices - Matrices to multiply, in order.
     * @returns {Float32Array}           - The resulting matrix.
     */
    static multiplyMany(...matrices) {
        if (matrices.length === 0) {
            return Matrix4.createIdentity();
        }

        for (const matrix of matrices) {
            if (!(matrix instanceof Float32Array) || matrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
                throw new TypeError('`Matrix4.multiplyMany` expects the 4x4 `Float32Array` matrices.');
            }
        }

        let result = matrices[0];

        for (let index = 1; index < matrices.length; index += 1) {
            result = Matrix4.multiply(result, matrices[index]);
        }

        return result;
    }

    /**
     * Transposes a 4x4 matrix by swapping its rows and columns.
     *
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - A new transposed matrix.
     */
    static transpose(matrix) {
        if (!(matrix instanceof Float32Array) || matrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.transpose` expects a 4x4 `Float32Array` matrix.');
        }

        const out = Matrix4.#createEmpty();
        return Matrix4.#transposeIntoUnchecked(out, matrix);
    }

    /**
     * Transposes a 4x4 matrix into an existing output matrix by swapping rows and columns.
     *
     * Note: out must not be the same object as matrix.
     *
     * @param {Float32Array} out    - Output 4x4 matrix.
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - The output matrix (out).
     */
    static transposeTo(out, matrix) {
        if (!(out instanceof Float32Array)
            || out.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT
            || !(matrix instanceof Float32Array)
            || matrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.transposeTo` expects two 4x4 `Float32Array` matrices.');
        }

        if (out === matrix) {
            throw new Error('`Matrix4.transposeTo` does not support in-place transpose. Use a separate output matrix.');
        }

        return Matrix4.#transposeIntoUnchecked(out, matrix);
    }

    /**
     * Inverts a 4x4 matrix using its adjugate and determinant.
     *
     * A near-zero determinant means the matrix is singular or unsafe to invert.
     *
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - A new inverted matrix.
     */
    static invert(matrix) {
        if (!(matrix instanceof Float32Array) || matrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.invert` expects a 4x4 `Float32Array` matrix.');
        }

        const out = Matrix4.#createEmpty();
        return Matrix4.#invertIntoUnchecked(out, matrix);
    }

    /**
     * Inverts a 4x4 matrix into an existing output matrix using its adjugate and determinant.
     *
     * A near-zero determinant means the matrix is singular or unsafe to invert.
     *
     * @param {Float32Array} out    - Output 4x4 matrix.
     * @param {Float32Array} matrix - Input 4x4 matrix.
     * @returns {Float32Array}      - The output matrix (out).
     */
    static invertTo(out, matrix) {
        if (!(out instanceof Float32Array)
            || out.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT
            || !(matrix instanceof Float32Array)
            || matrix.length !== MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError('`Matrix4.invertTo` expects two 4x4 `Float32Array` matrices.');
        }

        if (out === matrix) {
            throw new Error('`Matrix4.invertTo` does not support in-place inversion.');
        }

        return Matrix4.#invertIntoUnchecked(out, matrix);
    }

    /**
     * Multiplies two validated 4x4 matrices into out.
     *
     * Assumes public validation already checked matrix types, sizes, and output aliasing.
     *
     * @param {Float32Array} out         - Output 4x4 matrix that will receive the result.
     * @param {Float32Array} leftMatrix  - Left-hand 4x4 matrix.
     * @param {Float32Array} rightMatrix - Right-hand 4x4 matrix.
     * @returns {Float32Array}           - The output matrix (out).
     * @private
     */
    static #multiplyIntoUnchecked(out, leftMatrix, rightMatrix) {
        for (let columnIndex = 0; columnIndex < MathConstants.MATH_LAYOUT.MATRIX_COLUMN_COUNT; columnIndex += 1) {
            const rightColumnOffset = columnIndex * MathConstants.MATH_LAYOUT.MATRIX_STRIDE;

            for (let rowIndex = 0; rowIndex < MathConstants.MATH_LAYOUT.MATRIX_ROW_COUNT; rowIndex += 1) {
                const resultIndex = rightColumnOffset + rowIndex;

                out[resultIndex] =
                  leftMatrix[0 * MathConstants.MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 0]
                + leftMatrix[1 * MathConstants.MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 1]
                + leftMatrix[2 * MathConstants.MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 2]
                + leftMatrix[3 * MathConstants.MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 3];
            }
        }

        return out;
    }

    /**
     * Transposes a validated 4x4 matrix into out.
     *
     * Assumes public validation already checked matrix types, sizes, and output aliasing.
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
     * Inverts a validated 4x4 matrix into out.
     *
     * Uses the adjugate and determinant, throws when the determinant is too close to zero.
     * Assumes public validation already checked matrix types, sizes, and output aliasing.
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

        if (Math.abs(determinant) < MathConstants.MATH_MATRIX_INVERSION.MIN_INVERTIBLE_DETERMINANT_ABS) {
            throw new Error('`Matrix4.#invertIntoUnchecked` matrix is not invertible.');
        }

        const inverseDeterminant = MathConstants.MATH_MATRIX_INVERSION.INVERSE_DETERMINANT_NUMERATOR / determinant;

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
        return new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    }
}
