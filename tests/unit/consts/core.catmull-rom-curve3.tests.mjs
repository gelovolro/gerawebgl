import test                     from 'node:test';
import assert                   from 'node:assert/strict';
import * as MathTestConstants   from '../../test-constants/math.js';
import * as CatmullRomConstants from '../../../core/constants/catmull-rom-curve3.js';
import { MATH_COMMON_VALUES }   from '../../../core/constants/math.js';

test("'CatmullRomCurve3' constant groups should be frozen", () => {
    // Arrange
    const actualConstants = [
        CatmullRomConstants.CATMULL_ROM_DEFAULTS,
        CatmullRomConstants.CATMULL_ROM_VALUES,
        CatmullRomConstants.CATMULL_ROM_TANGENT
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'CatmullRomCurve3' default options should preserve minimum point count and closed state", () => {
    // Arrange
    const actualDefaults   = CatmullRomConstants.CATMULL_ROM_DEFAULTS;
    const expectedDefaults = MathTestConstants.CATMULL_ROM_EXPECTED_DEFAULTS;

    // Act & Assert
    assert.deepEqual(actualDefaults, expectedDefaults);
});

test("'CatmullRomCurve3' interpolation coefficients should preserve expected values and reuse common math constants", () => {
    // Arrange
    const actualValues   = CatmullRomConstants.CATMULL_ROM_VALUES;
    const expectedValues = MathTestConstants.CATMULL_ROM_EXPECTED_VALUES;

    // Act & Assert
    assert.deepEqual(actualValues, expectedValues);
    assert.equal(actualValues.ZERO, MATH_COMMON_VALUES.ZERO);
    assert.equal(actualValues.ONE, MATH_COMMON_VALUES.UNIT);
});

test("'CatmullRomCurve3' tangent tolerance should keep the normalization threshold", () => {
    // Arrange
    const actualEpsilon   = CatmullRomConstants.CATMULL_ROM_TANGENT.EPSILON;
    const expectedEpsilon = MathTestConstants.CATMULL_ROM_EXPECTED_TANGENT_EPSILON;

    // Act & Assert
    assert.equal(actualEpsilon, expectedEpsilon);
});
