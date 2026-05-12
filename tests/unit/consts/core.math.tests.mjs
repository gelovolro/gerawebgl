import test               from 'node:test';
import assert             from 'node:assert/strict';
import * as MathConstants from '../../../core/constants/math.js';

test("'Math' constants objects should be frozen", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_LAYOUT;

    // Act & Assert
    assert.equal(Object.isFrozen(actualConstants), true);
});

test("'Math' layout constants should keep existing values", () => {
    // Arrange
    const actualConstants = MathConstants.MATH_LAYOUT;

    // Act & Assert
    assert.equal(actualConstants.MATRIX_4X4_ELEMENT_COUNT, 16);
    assert.equal(actualConstants.VECTOR3_ELEMENT_COUNT, 3);
});
