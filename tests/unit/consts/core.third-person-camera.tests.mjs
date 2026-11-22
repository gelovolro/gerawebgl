import test                            from 'node:test';
import assert                          from 'node:assert/strict';
import * as MathConstants              from '../../../core/constants/math.js';
import * as ThirdPersonCameraConstants from '../../../core/constants/third-person-camera.js';

class ThirdPersonCameraConstantTestFixtures {
    static EXPECTED_DEFAULTS = Object.freeze({
        FIELD_OF_VIEW_RADIANS : Math.PI / 4,
        ASPECT_RATIO          : 1,
        NEAR                  : 0.1,
        FAR                   : 200,
        MODE                  : 0
    });

    static EXPECTED_ERRORS = Object.freeze({
        OPTIONS_TYPE        : '`ThirdPersonCamera` expects `options` as a plain object.',
        FIELD_OF_VIEW_TYPE  : '`ThirdPersonCamera` expects `fieldOfViewRadians` as a number.',
        ASPECT_RATIO_TYPE   : '`ThirdPersonCamera` expects `aspectRatio` as a number.',
        NEAR_TYPE           : '`ThirdPersonCamera` expects `near` as a number.',
        FAR_TYPE            : '`ThirdPersonCamera` expects `far` as a number.',
        FIELD_OF_VIEW_RANGE : '`ThirdPersonCamera` expects `0 < fieldOfViewRadians < Math.PI`.',
        ASPECT_RATIO_RANGE  : '`ThirdPersonCamera` expects `aspectRatio` to be a positive number.',
        CLIPPING_PLANES     : '`ThirdPersonCamera` expects `0 < near < far`.',
        MODE                : '`ThirdPersonCamera` expects `mode` to be a valid value from `ThirdPersonCamera.Modes`.',
        SET_MODE            : '`ThirdPersonCamera.setMode` expects a valid mode from `ThirdPersonCamera.Modes`.',
        SET_ASPECT_TYPE     : '`ThirdPersonCamera.setAspectRatio` expects `aspectRatio` as a number.',
        SET_ASPECT_RANGE    : '`ThirdPersonCamera.setAspectRatio` expects a positive number.'
    });
}

test("'ThirdPersonCamera' constant groups should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const groups           = Object.values(ThirdPersonCameraConstants);

    // Act
    const actualIsFrozen = groups.every((group) => Object.isFrozen(group));

    // Assert
    assert.equal(actualIsFrozen, expectedIsFrozen);
});

test("'ThirdPersonCamera' projection defaults should preserve their numeric contracts", () => {
    // Arrange
    const expectedDefaults = ThirdPersonCameraConstantTestFixtures.EXPECTED_DEFAULTS;

    // Act
    const actualDefaults = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_DEFAULTS;

    // Assert
    assert.deepEqual(actualDefaults, expectedDefaults);
    assert.equal(actualDefaults.ASPECT_RATIO, MathConstants.MATH_COMMON_VALUES.UNIT);
});

test("'ThirdPersonCamera' error messages should preserve the validation contract", () => {
    // Arrange
    const expectedErrors = ThirdPersonCameraConstantTestFixtures.EXPECTED_ERRORS;

    // Act
    const actualErrors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;

    // Assert
    assert.deepEqual(actualErrors, expectedErrors);
});
