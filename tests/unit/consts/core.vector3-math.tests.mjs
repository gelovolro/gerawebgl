import test                      from 'node:test';
import assert                    from 'node:assert/strict';
import * as Vector3MathConstants from '../../../core/constants/vector3-math.js';
import * as MathTestConstants    from '../../test-constants/math.js';
import * as MathConstants        from '../../../core/constants/math.js';

test("'Vector3Math' constant groups should be frozen", () => {
    // Arrange
    const actualConstants = [
        Vector3MathConstants.VECTOR3_MATH_LAYOUT,
        Vector3MathConstants.VECTOR3_MATH_VALUES,
        Vector3MathConstants.VECTOR3_MATH_TOLERANCES
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'Vector3Math' layout should preserve component count and indexes", () => {
    // Arrange
    const actualLayout   = Vector3MathConstants.VECTOR3_MATH_LAYOUT;
    const expectedLayout = MathTestConstants.VECTOR3_MATH_EXPECTED_LAYOUT;

    // Act & Assert
    assert.deepEqual(actualLayout, expectedLayout);
    assert.equal(actualLayout.COMPONENT_COUNT, MathConstants.MATH_LAYOUT.VECTOR3_ELEMENT_COUNT);
    assert.equal(actualLayout.X_INDEX, MathConstants.MATH_VECTOR3_INDEXES.X);
    assert.equal(actualLayout.Y_INDEX, MathConstants.MATH_VECTOR3_INDEXES.Y);
    assert.equal(actualLayout.Z_INDEX, MathConstants.MATH_VECTOR3_INDEXES.Z);
});

test("'Vector3Math' numeric values should reuse shared math constants", () => {
    // Arrange
    const actualValues   = Vector3MathConstants.VECTOR3_MATH_VALUES;
    const expectedValues = MathTestConstants.VECTOR3_MATH_EXPECTED_VALUES;

    // Act & Assert
    assert.deepEqual(actualValues, expectedValues);
    assert.equal(actualValues.ZERO, MathConstants.MATH_COMMON_VALUES.ZERO);
    assert.equal(actualValues.ONE, MathConstants.MATH_COMMON_VALUES.UNIT);
});

test("'Vector3Math' tolerances should preserve comparison and normalization defaults", () => {
    // Arrange
    const actualTolerances   = Vector3MathConstants.VECTOR3_MATH_TOLERANCES;
    const expectedTolerances = MathTestConstants.VECTOR3_MATH_EXPECTED_TOLERANCES;

    // Act & Assert
    assert.deepEqual(actualTolerances, expectedTolerances);
});
