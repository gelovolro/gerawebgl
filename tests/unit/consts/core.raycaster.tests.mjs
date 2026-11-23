import test                    from 'node:test';
import assert                  from 'node:assert/strict';
import * as MathConstants      from '../../../core/constants/math.js';
import * as RaycasterConstants from '../../../core/constants/raycaster.js';

class RaycasterConstantTestFixtures {
    static EXPECTED_DEFAULTS    = Object.freeze({ RECURSIVE: true, FILTER: null, SORT: true });
    static EXPECTED_OPTION_KEYS = Object.freeze({ RECURSIVE: 'recursive', FILTER: 'filter', SORT: 'sort' });
    static EXPECTED_NDC         = Object.freeze({ NEAR: -1, FAR: 1, W: 1 });
    static EXPECTED_RAY         = Object.freeze({ MIN_PARAMETER: 0, MAX_PARAMETER: Infinity, DIRECTION_EPSILON: 1e-8, INVERSE_NUMERATOR: 1 });

    static EXPECTED_AXES = Object.freeze([
        Object.freeze({ name: 'x', index: 0 }),
        Object.freeze({ name: 'y', index: 1 }),
        Object.freeze({ name: 'z', index: 2 })
    ]);

    static EXPECTED_INDEXES = Object.freeze({
        XX: 0, XY: 4, XZ: 8,  XW: 12,
        YX: 1, YY: 5, YZ: 9,  YW: 13,
        ZX: 2, ZY: 6, ZZ: 10, ZW: 14,
        WX: 3, WY: 7, WZ: 11, WW: 15
    });

    static EXPECTED_ERROR_KEYS = Object.freeze([
        'SCENE_TYPE',
        'CAMERA_TYPE',
        'MOUSE_NDC_TYPE',
        'OPTIONS_TYPE',
        'RECURSIVE_TYPE',
        'FILTER_TYPE',
        'SORT_TYPE',
        'UNPROJECT_W_ZERO'
    ]);
}

test("'Raycaster' constant groups and axis definitions should be frozen", () => {
    // Arrange
    const constantGroups = Object.values(RaycasterConstants);
    const axes           = RaycasterConstants.RAYCASTER_AXES;

    // Act
    const frozenGroups = constantGroups.every((group) => Object.isFrozen(group));
    const frozenAxes   = axes.every((axis) => Object.isFrozen(axis));

    // Assert
    assert.equal(frozenGroups, true);
    assert.equal(frozenAxes, true);
});

test("'Raycaster' option and clip-space defaults should preserve existing values", () => {
    // Arrange
    const expectedDefaults   = RaycasterConstantTestFixtures.EXPECTED_DEFAULTS;
    const expectedOptionKeys = RaycasterConstantTestFixtures.EXPECTED_OPTION_KEYS;
    const expectedNdc        = RaycasterConstantTestFixtures.EXPECTED_NDC;

    // Act
    const actualDefaults   = RaycasterConstants.RAYCASTER_DEFAULTS;
    const actualOptionKeys = RaycasterConstants.RAYCASTER_OPTION_KEYS;
    const actualNdc        = RaycasterConstants.RAYCASTER_NDC;

    // Assert
    assert.deepEqual(actualDefaults, expectedDefaults);
    assert.deepEqual(actualOptionKeys, expectedOptionKeys);
    assert.deepEqual(actualNdc, expectedNdc);
    assert.equal(actualNdc.FAR, MathConstants.MATH_COMMON_VALUES.UNIT);
    assert.equal(actualNdc.W, MathConstants.MATH_COMMON_VALUES.UNIT);
});

test("'Raycaster' ray tolerances and axis indexes should preserve existing values", () => {
    // Arrange
    const expectedRay  = RaycasterConstantTestFixtures.EXPECTED_RAY;
    const expectedAxes = RaycasterConstantTestFixtures.EXPECTED_AXES;

    // Act
    const actualRay  = RaycasterConstants.RAYCASTER_RAY;
    const actualAxes = RaycasterConstants.RAYCASTER_AXES;

    // Assert
    assert.deepEqual(actualRay, expectedRay);
    assert.deepEqual(actualAxes, expectedAxes);
    assert.equal(actualRay.MIN_PARAMETER, MathConstants.MATH_COMMON_VALUES.ZERO);
    assert.equal(actualRay.INVERSE_NUMERATOR, MathConstants.MATH_COMMON_VALUES.UNIT);
    assert.deepEqual(actualAxes.map((axis) => axis.index), Object.values(MathConstants.MATH_VECTOR3_INDEXES));
});

test("'Raycaster' matrix indexes should match the column-major 4x4 layout", () => {
    // Arrange
    const expectedIndexes = RaycasterConstantTestFixtures.EXPECTED_INDEXES;
    const expectedStride  = MathConstants.MATH_LAYOUT.MATRIX_STRIDE;

    // Act
    const actualIndexes = RaycasterConstants.RAYCASTER_MATRIX_INDEXES;

    // Assert
    assert.deepEqual(actualIndexes, expectedIndexes);
    assert.equal(actualIndexes.XY - actualIndexes.XX, expectedStride);
    assert.equal(actualIndexes.WW, MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT - MathConstants.MATH_COMMON_VALUES.UNIT);
});

test("'Raycaster' error messages should preserve the public validation contract", () => {
    // Arrange
    const errors       = RaycasterConstants.RAYCASTER_ERRORS;
    const expectedKeys = RaycasterConstantTestFixtures.EXPECTED_ERROR_KEYS;

    // Act
    const actualKeys = Object.keys(errors);

    // Assert
    assert.deepEqual(actualKeys, expectedKeys);
    actualKeys.forEach((key) => assert.match(errors[key], /^`Raycaster\.raycast`/u));
});
