import test                            from 'node:test';
import assert                          from 'node:assert/strict';
import * as MathConstants              from '../../../core/constants/math.js';
import * as FirstPersonCameraConstants from '../../../core/constants/first-person-camera.js';

class FirstPersonCameraConstantTestFixtures {
    static EXPECTED_DEFAULTS = Object.freeze({
        FIELD_OF_VIEW_RADIANS : Math.PI / 4,
        ASPECT_RATIO          : 1,
        NEAR                  : 0.1,
        FAR                   : 200,
        MODE                  : 0,
        DIRTY                 : true
    });

    static EXPECTED_ERRORS = Object.freeze({
        OPTIONS_TYPE        : '`FirstPersonCamera` expects `options` as a plain object.',
        FIELD_OF_VIEW_TYPE  : '`FirstPersonCamera` expects `fieldOfViewRadians` as a number.',
        ASPECT_RATIO_TYPE   : '`FirstPersonCamera` expects `aspectRatio` as a number.',
        NEAR_TYPE           : '`FirstPersonCamera` expects `near` as a number.',
        FAR_TYPE            : '`FirstPersonCamera` expects `far` as a number.',
        FIELD_OF_VIEW_RANGE : '`FirstPersonCamera` expects `0 < fieldOfViewRadians < Math.PI`.',
        ASPECT_RATIO_RANGE  : '`FirstPersonCamera` expects `aspectRatio` to be a positive number.',
        CLIPPING_PLANES     : '`FirstPersonCamera` expects `0 < near < far`.',
        MODE                : '`FirstPersonCamera` expects `mode` to be a valid value from `FirstPersonCamera.Modes`.',
        SET_MODE            : '`FirstPersonCamera.setMode` expects a valid mode from `FirstPersonCamera.Modes`.',
        SET_ASPECT_TYPE     : '`FirstPersonCamera.setAspectRatio` expects `aspectRatio` as a number.',
        SET_ASPECT_RANGE    : '`FirstPersonCamera.setAspectRatio` expects a positive number.'
    });
}

test("'FirstPersonCamera' constant groups should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const groups           = Object.values(FirstPersonCameraConstants);

    // Act
    const actualIsFrozen = groups.every((group) => Object.isFrozen(group));

    // Assert
    assert.equal(actualIsFrozen, expectedIsFrozen);
});

test("'FirstPersonCamera' projection defaults should preserve their numeric contracts", () => {
    // Arrange
    const expectedDefaults = FirstPersonCameraConstantTestFixtures.EXPECTED_DEFAULTS;

    // Act
    const actualDefaults = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_DEFAULTS;

    // Assert
    assert.deepEqual(actualDefaults, expectedDefaults);
    assert.equal(actualDefaults.ASPECT_RATIO, MathConstants.MATH_COMMON_VALUES.UNIT);
});

test("'FirstPersonCamera' error messages should preserve the validation contract", () => {
    // Arrange
    const expectedErrors = FirstPersonCameraConstantTestFixtures.EXPECTED_ERRORS;

    // Act
    const actualErrors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;

    // Assert
    assert.deepEqual(actualErrors, expectedErrors);
});
