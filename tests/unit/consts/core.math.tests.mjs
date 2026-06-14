import test               from 'node:test';
import assert             from 'node:assert/strict';
import * as MathConstants from '../../../core/constants/math.js';

test("'Common math' constants objects should be frozen", () => {
    // Arrange
    const actualConstants = [
        MathConstants.MATH_LAYOUT,
        MathConstants.MATH_VECTOR3_COMPONENTS,
        MathConstants.MATH_PERSPECTIVE,
        MathConstants.MATH_MATRIX_INVERSION
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'Common math' layout constants should keep existing values", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_LAYOUT;

    // Act & Assert
    assert.equal(actualConstants.MATRIX_4X4_ELEMENT_COUNT, 16);
    assert.equal(actualConstants.MATRIX_COLUMN_COUNT, 4);
    assert.equal(actualConstants.MATRIX_ROW_COUNT, 4);
    assert.equal(actualConstants.MATRIX_STRIDE, 4);
    assert.equal(actualConstants.VECTOR3_ELEMENT_COUNT, 3);
});

test("'Common math' should keep 'Vector3' component constants values", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_VECTOR3_COMPONENTS;

    // Act & Assert
    assert.equal(actualConstants.ZERO, 0);
    assert.equal(actualConstants.UNIT, 1);
});

test("'Matrix4' perspective constants should keep existing values", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_PERSPECTIVE;

    // Act & Assert
    assert.equal(actualConstants.HALF_FIELD_OF_VIEW_DIVISOR, 2.0);
    assert.equal(actualConstants.PROJECTION_SCALE_NUMERATOR, 1.0);
    assert.equal(actualConstants.DEPTH_RANGE_NUMERATOR, 1.0);
    assert.equal(actualConstants.Z_RANGE_MULTIPLIER, 2.0);
    assert.equal(actualConstants.W_COMPONENT_SCALE, -1.0);
});

test("'Matrix4' inversion constants should keep existing values", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_MATRIX_INVERSION;

    // Act & Assert
    assert.equal(actualConstants.MIN_INVERTIBLE_DETERMINANT_ABS, 1e-12);
    assert.equal(actualConstants.INVERSE_DETERMINANT_NUMERATOR, 1.0);
});
