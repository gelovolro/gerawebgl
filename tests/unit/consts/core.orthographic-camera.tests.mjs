import test                             from 'node:test';
import assert                           from 'node:assert/strict';
import * as MathConstants               from '../../../core/constants/math.js';
import * as OrthographicCameraConstants from '../../../core/constants/orthographic-camera.js';

class OrthographicCameraConstantTestFixtures {
    static EXPECTED_DEFAULTS    = Object.freeze({ VIEW_SIZE: null, ASPECT_RATIO: 1, DIRTY: true });
    static EXPECTED_VALUES      = Object.freeze({ MINIMUM_VIEW_SIZE: 0, HALF_MULTIPLIER: 0.5 });
    static EXPECTED_OPTION_KEYS = Object.freeze({ VIEW_SIZE: 'viewSize' });
    static EXPECTED_ERRORS      = Object.freeze({
        OPTIONS_ARRAY        : '`OrthographicCamera` expects options as a plain object, not an array.',
        OPTIONS_TYPE         : '`OrthographicCamera` expects options as a plain object.',
        BOUNDS_TYPE          : '`OrthographicCamera` expects numeric arguments in bounds mode.',
        BOUNDS_WIDTH         : '`OrthographicCamera` expects `left !== right`.',
        BOUNDS_HEIGHT        : '`OrthographicCamera` expects `bottom !== top`.',
        BOUNDS_DEPTH         : '`OrthographicCamera` expects `near < far`.',
        VIEW_SIZE_TYPE       : '`OrthographicCamera` expects numeric arguments in view-size mode.',
        VIEW_SIZE            : '`OrthographicCamera` expects `viewSize` to be a positive number.',
        ASPECT_RATIO         : '`OrthographicCamera` expects `aspectRatio` to be a positive number.',
        VIEW_SIZE_DEPTH      : '`OrthographicCamera` expects `near < far`.',
        VIEW_SIZE_EXTENTS    : '`OrthographicCamera` expects finite view-size bounds.',
        SET_ASPECT_TYPE      : '`OrthographicCamera.setAspectRatio` expects `aspectRatio` as a number.',
        SET_ASPECT_RANGE     : '`OrthographicCamera.setAspectRatio` expects `aspectRatio` to be a positive number.',
        PROJECTION_NONFINITE : '`OrthographicCamera.getProjectionMatrix` expects a finite projection matrix.'
    });
}

test("'OrthographicCamera' constant groups should be frozen", () => {
    // Arrange
    const groups = Object.values(OrthographicCameraConstants);

    // Act
    const frozen = groups.every((group) => Object.isFrozen(group));

    // Assert
    assert.equal(frozen, true);
});

test("'OrthographicCamera' defaults and view-size values should preserve numeric contracts", () => {
    // Arrange
    const expectedDefaults = OrthographicCameraConstantTestFixtures.EXPECTED_DEFAULTS;
    const expectedValues   = OrthographicCameraConstantTestFixtures.EXPECTED_VALUES;

    // Act
    const actualDefaults = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_DEFAULTS;
    const actualValues   = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_VALUES;

    // Assert
    assert.deepEqual(actualDefaults, expectedDefaults);
    assert.deepEqual(actualValues, expectedValues);
    assert.equal(actualDefaults.ASPECT_RATIO, MathConstants.MATH_COMMON_VALUES.UNIT);
    assert.equal(actualValues.MINIMUM_VIEW_SIZE, MathConstants.MATH_COMMON_VALUES.ZERO);
});

test("'OrthographicCamera' option key should match the existing public constructor contract", () => {
    // Arrange
    const expectedKeys = OrthographicCameraConstantTestFixtures.EXPECTED_OPTION_KEYS;

    // Act
    const actualKeys = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_OPTION_KEYS;

    // Assert
    assert.deepEqual(actualKeys, expectedKeys);
});

test("'OrthographicCamera' error messages should preserve the validation contract", () => {
    // Arrange
    const expectedErrors = OrthographicCameraConstantTestFixtures.EXPECTED_ERRORS;

    // Act
    const actualErrors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;

    // Assert
    assert.deepEqual(actualErrors, expectedErrors);
});
