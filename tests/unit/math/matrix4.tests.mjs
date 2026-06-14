import test               from 'node:test';
import assert             from 'node:assert/strict';
import { Matrix4 }        from '../../../core/math/matrix4.js';
import { TestAssertions } from '../../helpers/test-assertions.mjs';

class Matrix4TestFixtures {
    static createExpectedIdentity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static createTransposeInput() {
        return new Float32Array([
            1,   2,  3,  4,
            5,   6,  7,  8,
            9,  10, 11, 12,
            13, 14, 15, 16
        ]);
    }

    static createExpectedTranspose() {
        return new Float32Array([
            1, 5,  9, 13,
            2, 6, 10, 14,
            3, 7, 11, 15,
            4, 8, 12, 16
        ]);
    }
}

test("'Matrix4.createIdentity' should create an identity matrix", () => {
    // Arrange
    const expectedMatrix = Matrix4TestFixtures.createExpectedIdentity();

    // Act
    const actualMatrix = Matrix4.createIdentity();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createScale' should create a scale matrix", () => {
    // Arrange
    const expectedMatrix = new Float32Array([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createScale(2, 3, 4);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createScale' should reject non-numeric arguments", () => {
    // Arrange
    const invalidScaleX      = '1';
    const invalidScaleY      = '2';
    const invalidScaleZ      = '3';
    const expectedErrorMatch = /numeric arguments/;

    // Act
    const actualScaleXCall = () => Matrix4.createScale(invalidScaleX, 2, 3);
    const actualScaleYCall = () => Matrix4.createScale(1, invalidScaleY, 3);
    const actualScaleZCall = () => Matrix4.createScale(1, 2, invalidScaleZ);

    // Assert
    assert.throws(actualScaleXCall, expectedErrorMatch);
    assert.throws(actualScaleYCall, expectedErrorMatch);
    assert.throws(actualScaleZCall, expectedErrorMatch);
});

test("'Matrix4.createPerspective' should create a perspective projection matrix", () => {
    // Arrange
    const fieldOfViewRadians = Math.PI / 2;
    const aspectRatio        = 1;
    const near               = 1;
    const far                = 11;
    const expectedMatrix     = new Float32Array([
        1, 0,    0,  0,
        0, 1,    0,  0,
        0, 0, -1.2, -1,
        0, 0, -2.2,  0
    ]);

    // Act
    const actualMatrix = Matrix4.createPerspective(fieldOfViewRadians, aspectRatio, near, far);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createPerspective' should reject non-numeric arguments", () => {
    // Arrange
    const invalidFieldOfViewRadians = '1';
    const invalidAspectRatio        = '2';
    const invalidNear               = '3';
    const invalidFar                = '4';
    const expectedErrorMatch        = /numeric arguments/;

    // Act
    const actualFieldOfViewRadiansCall = () => Matrix4.createPerspective(invalidFieldOfViewRadians, 1, 1, 2);
    const actualAspectRatioCall        = () => Matrix4.createPerspective(1, invalidAspectRatio, 1, 2);
    const actualNearCall               = () => Matrix4.createPerspective(1, 1, invalidNear, 2);
    const actualFarCall                = () => Matrix4.createPerspective(1, 1, 1, invalidFar);

    // Assert
    assert.throws(actualFieldOfViewRadiansCall, expectedErrorMatch);
    assert.throws(actualAspectRatioCall, expectedErrorMatch);
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'Matrix4.createPerspective' should reject invalid clipping planes", () => {
    // Arrange
    const invalidNear        = 0;
    const invalidFar         = 1;
    const expectedErrorMatch = /0 < near < far/;

    // Act
    const actualNearCall = () => Matrix4.createPerspective(1, 1, invalidNear, 2);
    const actualFarCall  = () => Matrix4.createPerspective(1, 1, 1, invalidFar);

    // Assert
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'Matrix4.createTranslation' should place translation into the last column", () => {
    // Arrange
    const expectedMatrix = new Float32Array([
        1,   0,  0, 0,
        0,   1,  0, 0,
        0,   0,  1, 0,
        10, 20, 30, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createTranslation(10, 20, 30);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createTranslation' should reject non-numeric arguments", () => {
    // Arrange
    const invalidTranslateX  = '1';
    const invalidTranslateY  = '2';
    const invalidTranslateZ  = '3';
    const expectedErrorMatch = /numeric arguments/;

    // Act
    const actualTranslateXCall = () => Matrix4.createTranslation(invalidTranslateX, 2, 3);
    const actualTranslateYCall = () => Matrix4.createTranslation(1, invalidTranslateY, 3);
    const actualTranslateZCall = () => Matrix4.createTranslation(1, 2, invalidTranslateZ);

    // Assert
    assert.throws(actualTranslateXCall, expectedErrorMatch);
    assert.throws(actualTranslateYCall, expectedErrorMatch);
    assert.throws(actualTranslateZCall, expectedErrorMatch);
});

test("'Matrix4.createRotationX' should create a rotation matrix around X axis", () => {
    // Arrange
    const angleRadians   = Math.PI / 2;
    const expectedMatrix = new Float32Array([
        1,  0, 0, 0,
        0,  0, 1, 0,
        0, -1, 0, 0,
        0,  0, 0, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createRotationX(angleRadians);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createRotationX' should reject a non-numeric angle", () => {
    // Arrange
    const invalidAngleRadians = '1';
    const expectedErrorMatch  = /numeric argument/;

    // Act
    const actualCall = () => Matrix4.createRotationX(invalidAngleRadians);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.createRotationY' should create a rotation matrix around Y axis", () => {
    // Arrange
    const angleRadians   = Math.PI / 2;
    const expectedMatrix = new Float32Array([
        0, 0, -1, 0,
        0, 1,  0, 0,
        1, 0,  0, 0,
        0, 0,  0, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createRotationY(angleRadians);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createRotationY' should reject a non-numeric angle", () => {
    // Arrange
    const invalidAngleRadians = '1';
    const expectedErrorMatch  = /numeric argument/;

    // Act
    const actualCall = () => Matrix4.createRotationY(invalidAngleRadians);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.createRotationZ' should create a rotation matrix around Z axis", () => {
    // Arrange
    const angleRadians   = Math.PI / 2;
    const expectedMatrix = new Float32Array([
         0, 1, 0, 0,
        -1, 0, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createRotationZ(angleRadians);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createRotationZ' should reject a non-numeric angle", () => {
    // Arrange
    const invalidAngleRadians = '1';
    const expectedErrorMatch  = /numeric argument/;

    // Act
    const actualCall = () => Matrix4.createRotationZ(invalidAngleRadians);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.multiply' should preserve a matrix, when multiplied by identity", () => {
    // Arrange
    const leftMatrix  = Matrix4.createIdentity();
    const rightMatrix = Matrix4.createTranslation(5, 6, 7);

    // Act
    const actualMatrix = Matrix4.multiply(leftMatrix, rightMatrix);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, rightMatrix);
});

test("'Matrix4.multiply' should reject invalid matrix arguments", () => {
    // Arrange
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = new Float32Array(15);
    const expectedErrorMatch = /two 4x4 Float32Array matrices/;

    // Act
    const actualInvalidLeftMatrixCall      = () => Matrix4.multiply(invalidMatrix, validMatrix);
    const actualWrongLengthLeftMatrixCall  = () => Matrix4.multiply(wrongLengthMatrix, validMatrix);
    const actualInvalidRightMatrixCall     = () => Matrix4.multiply(validMatrix, invalidMatrix);
    const actualWrongLengthRightMatrixCall = () => Matrix4.multiply(validMatrix, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidLeftMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthLeftMatrixCall, expectedErrorMatch);
    assert.throws(actualInvalidRightMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthRightMatrixCall, expectedErrorMatch);
});

test("'Matrix4.multiplyTo' should write multiplication result into output matrix", () => {
    // Arrange
    const out            = new Float32Array(16);
    const leftMatrix     = Matrix4.createTranslation(1, 2, 3);
    const rightMatrix    = Matrix4.createScale(2, 3, 4);
    const expectedMatrix = Matrix4.multiply(leftMatrix, rightMatrix);

    // Act
    const actualMatrix = Matrix4.multiplyTo(out, leftMatrix, rightMatrix);

    // Assert
    assert.equal(actualMatrix, out);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(out, expectedMatrix);
});

test("'Matrix4.multiplyTo' should reject invalid matrix arguments", () => {
    // Arrange
    const out                = new Float32Array(16);
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = new Float32Array(15);
    const expectedErrorMatch = /three 4x4 Float32Array matrices/;

    // Act
    const actualInvalidOutCall     = () => Matrix4.multiplyTo(invalidMatrix, validMatrix, validMatrix);
    const actualWrongLengthOutCall = () => Matrix4.multiplyTo(wrongLengthMatrix, validMatrix, validMatrix);
    const actualInvalidLeftCall    = () => Matrix4.multiplyTo(out, invalidMatrix, validMatrix);
    const actualInvalidRightCall   = () => Matrix4.multiplyTo(out, validMatrix, invalidMatrix);

    // Assert
    assert.throws(actualInvalidOutCall, expectedErrorMatch);
    assert.throws(actualWrongLengthOutCall, expectedErrorMatch);
    assert.throws(actualInvalidLeftCall, expectedErrorMatch);
    assert.throws(actualInvalidRightCall, expectedErrorMatch);
});

test("'Matrix4.multiplyMany' with one matrix should return the same matrix instance", () => {
    // Arrange
    const matrix = Matrix4.createTranslation(1, 2, 3);

    // Act
    const actualMatrix = Matrix4.multiplyMany(matrix);

    // Assert
    assert.equal(actualMatrix, matrix);
});

test("'Matrix4.multiplyMany' should multiply matrices in order", () => {
    // Arrange
    const firstMatrix    = Matrix4.createTranslation(1, 2, 3);
    const secondMatrix   = Matrix4.createScale(2, 3, 4);
    const thirdMatrix    = Matrix4.createTranslation(5, 6, 7);
    const expectedMatrix = Matrix4.multiply(Matrix4.multiply(firstMatrix, secondMatrix), thirdMatrix);

    // Act
    const actualMatrix = Matrix4.multiplyMany(firstMatrix, secondMatrix, thirdMatrix);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.multiplyMany' should reject invalid matrix arguments", () => {
    // Arrange
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = new Float32Array(15);
    const expectedErrorMatch = /4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidMatrixCall     = () => Matrix4.multiplyMany(invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.multiplyMany(validMatrix, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.multiplyMany' with no arguments should return identity", () => {
    // Arrange
    const expectedMatrix = Matrix4TestFixtures.createExpectedIdentity();

    // Act
    const actualMatrix = Matrix4.multiplyMany();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.transposeTo' should write transposed matrix into output matrix", () => {
    // Arrange
    const out            = new Float32Array(16);
    const inputMatrix    = Matrix4TestFixtures.createTransposeInput();
    const expectedMatrix = Matrix4TestFixtures.createExpectedTranspose();

    // Act
    const actualMatrix = Matrix4.transposeTo(out, inputMatrix);

    // Assert
    assert.equal(actualMatrix, out);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(out, expectedMatrix);
});

test("'Matrix4.transpose' should reject invalid matrix", () => {
    // Arrange
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = new Float32Array(15);
    const expectedErrorMatch = /4x4 `Float32Array` matrix/;

    // Act
    const actualInvalidMatrixCall     = () => Matrix4.transpose(invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.transpose(wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.transposeTo' should reject invalid matrix arguments", () => {
    // Arrange
    const out                = new Float32Array(16);
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = new Float32Array(15);
    const expectedErrorMatch = /two 4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidOutCall        = () => Matrix4.transposeTo(invalidMatrix, validMatrix);
    const actualWrongLengthOutCall    = () => Matrix4.transposeTo(wrongLengthMatrix, validMatrix);
    const actualInvalidMatrixCall     = () => Matrix4.transposeTo(out, invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.transposeTo(out, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidOutCall, expectedErrorMatch);
    assert.throws(actualWrongLengthOutCall, expectedErrorMatch);
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.transposeTo' should reject in-place transpose", () => {
    // Arrange
    const matrix             = Matrix4.createIdentity();
    const expectedErrorMatch = /does not support in-place transpose/;

    // Act
    const actualCall = () => Matrix4.transposeTo(matrix, matrix);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.transpose' should swap rows and columns", () => {
    // Arrange
    const inputMatrix    = Matrix4TestFixtures.createTransposeInput();
    const expectedMatrix = Matrix4TestFixtures.createExpectedTranspose();

    // Act
    const actualMatrix = Matrix4.transpose(inputMatrix);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.invert' should reject invalid matrix", () => {
    // Arrange
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = new Float32Array(15);
    const expectedErrorMatch = /4x4 `Float32Array` matrix/;

    // Act
    const actualInvalidMatrixCall     = () => Matrix4.invert(invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.invert(wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.invertTo' should write inverted matrix into output matrix", () => {
    // Arrange
    const out             = new Float32Array(16);
    const matrix          = Matrix4.createTranslation(3, 4, 5);
    const expectedInverse = Matrix4.createTranslation(-3, -4, -5);

    // Act
    const actualInverse = Matrix4.invertTo(out, matrix);

    // Assert
    assert.equal(actualInverse, out);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(out, expectedInverse);
});

test("'Matrix4.invertTo' should reject invalid matrix arguments", () => {
    // Arrange
    const out                = new Float32Array(16);
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = new Float32Array(15);
    const expectedErrorMatch = /two 4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidOutCall        = () => Matrix4.invertTo(invalidMatrix, validMatrix);
    const actualWrongLengthOutCall    = () => Matrix4.invertTo(wrongLengthMatrix, validMatrix);
    const actualInvalidMatrixCall     = () => Matrix4.invertTo(out, invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.invertTo(out, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidOutCall, expectedErrorMatch);
    assert.throws(actualWrongLengthOutCall, expectedErrorMatch);
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.invertTo' should reject in-place inversion", () => {
    // Arrange
    const matrix             = Matrix4.createIdentity();
    const expectedErrorMatch = /does not support in-place inversion/;

    // Act
    const actualCall = () => Matrix4.invertTo(matrix, matrix);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.invert' should produce an inverse for a translation matrix", () => {
    // Arrange
    const matrix          = Matrix4.createTranslation(3, 4, 5);
    const expectedInverse = Matrix4.createTranslation(-3, -4, -5);

    // Act
    const actualInverse  = Matrix4.invert(matrix);
    const actualIdentity = Matrix4.multiply(matrix, actualInverse);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualInverse, expectedInverse);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(
        actualIdentity,
        Matrix4TestFixtures.createExpectedIdentity()
    );
});

test("'Matrix4.invert' should reject a non-invertible matrix", () => {
    // Arrange
    const matrix = Matrix4.createScale(0, 1, 1);

    // Act
    const actualCall = () => Matrix4.invert(matrix);

    // Assert
    assert.throws(actualCall, /not invertible/);
});

test("'Matrix4.multiplyTo' should reject in-place multiplication", () => {
    // Arrange
    const matrix = Matrix4.createIdentity();

    // Act
    const actualCall = () => Matrix4.multiplyTo(matrix, matrix, Matrix4.createIdentity());

    // Assert
    assert.throws(actualCall, /does not support in-place multiplication/);
});
