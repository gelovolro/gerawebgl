import test                    from 'node:test';
import assert                  from 'node:assert/strict';
import * as Path3DConstants    from '../../../core/constants/path3d.js';
import * as MathTestConstants  from '../../test-constants/math.js';
import { MATH_COMMON_VALUES }  from '../../../core/constants/math.js';

test("'Path3D' constant groups should be frozen", () => {
    // Arrange
    const actualConstants = [
        Path3DConstants.PATH3D_DEFAULTS,
        Path3DConstants.PATH3D_SEGMENTS,
        Path3DConstants.PATH3D_TANGENT
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'Path3D' defaults should preserve the minimum point count and open state", () => {
    // Arrange
    const actualDefaults   = Path3DConstants.PATH3D_DEFAULTS;
    const expectedDefaults = MathTestConstants.PATH3D_EXPECTED_DEFAULTS;

    // Act & Assert
    assert.deepEqual(actualDefaults, expectedDefaults);
});

test("'Path3D' segment constants should reuse common math values", () => {
    // Arrange
    const actualSegments = Path3DConstants.PATH3D_SEGMENTS;

    // Act & Assert
    assert.equal(actualSegments.START_INDEX, MATH_COMMON_VALUES.ZERO);
    assert.equal(actualSegments.INDEX_INCREMENT, MATH_COMMON_VALUES.UNIT);
});

test("'Path3D' tangent tolerance should preserve the normalization threshold", () => {
    // Arrange
    const actualEpsilon   = Path3DConstants.PATH3D_TANGENT.EPSILON;
    const expectedEpsilon = MathTestConstants.PATH3D_EXPECTED_TANGENT_EPSILON;

    // Act & Assert
    assert.equal(actualEpsilon, expectedEpsilon);
});
