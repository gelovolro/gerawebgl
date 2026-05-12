import test               from 'node:test';
import assert             from 'node:assert/strict';
import * as MathConstants from '../../../core/constants/math.js';

test("'Common math' constants objects should be frozen", () => {
    // Arrange
    const actualConstants = [
        MathConstants.MATH_LAYOUT,
        MathConstants.MATH_VECTOR3_COMPONENTS
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'Common math' layout constants should keep existing values", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_LAYOUT;

    // Act & Assert
    assert.equal(actualConstants.MATRIX_4X4_ELEMENT_COUNT, 16);
    assert.equal(actualConstants.VECTOR3_ELEMENT_COUNT, 3);
});

test("'Common math' should keep 'Vector3' component constants values", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_VECTOR3_COMPONENTS;

    // Act & Assert
    assert.equal(actualConstants.ZERO, 0);
    assert.equal(actualConstants.UNIT, 1);
});
