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
}

test("'Matrix4.createIdentity' should create an identity matrix", () => {
    // Arrange
    const expectedMatrix = Matrix4TestFixtures.createExpectedIdentity();

    // Act
    const actualMatrix = Matrix4.createIdentity();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createTranslation' should place translation into the last column", () => {
    // Arrange
    const expectedMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        10, 20, 30, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createTranslation(10, 20, 30);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
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

test("'Matrix4.multiplyMany' with no arguments should return identity", () => {
    // Arrange
    const expectedMatrix = Matrix4TestFixtures.createExpectedIdentity();

    // Act
    const actualMatrix = Matrix4.multiplyMany();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.transpose' should swap rows and columns", () => {
    // Arrange
    const inputMatrix = new Float32Array([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
    ]);

    const expectedMatrix = new Float32Array([
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16
    ]);

    // Act
    const actualMatrix = Matrix4.transpose(inputMatrix);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
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
