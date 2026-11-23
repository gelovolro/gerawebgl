import test                            from 'node:test';
import assert                          from 'node:assert/strict';
import * as PerspectiveCameraConstants from '../../../core/constants/perspective-camera.js';

class PerspectiveCameraConstantTestFixtures {
    static EXPECTED_DEFAULTS = Object.freeze({ DIRTY: true });

    static EXPECTED_ERRORS = Object.freeze({
        FIELD_OF_VIEW_TYPE  : '`PerspectiveCamera` expects `fieldOfViewRadians` as a number.',
        ASPECT_RATIO_TYPE   : '`PerspectiveCamera` expects `aspectRatio` as a number.',
        NEAR_TYPE           : '`PerspectiveCamera` expects `near` as a number.',
        FAR_TYPE            : '`PerspectiveCamera` expects `far` as a number.',
        FIELD_OF_VIEW_RANGE : '`PerspectiveCamera` expects `0 < fieldOfViewRadians < Math.PI`.',
        ASPECT_RATIO_RANGE  : '`PerspectiveCamera` expects a positive `aspect ratio`.',
        CLIPPING_PLANES     : '`PerspectiveCamera` expects `0 < near < far`.',
        SET_ASPECT_TYPE     : '`PerspectiveCamera.setAspectRatio` expects `aspectRatio` as a number.',
        SET_ASPECT_RANGE    : '`PerspectiveCamera.setAspectRatio` expects a positive number.'
    });
}

test("'PerspectiveCamera' constant groups should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const groups           = Object.values(PerspectiveCameraConstants);

    // Act
    const actualIsFrozen = groups.every((group) => Object.isFrozen(group));

    // Assert
    assert.equal(actualIsFrozen, expectedIsFrozen);
});

test("'PerspectiveCamera' projection defaults should preserve their contracts", () => {
    // Arrange
    const expectedDefaults = PerspectiveCameraConstantTestFixtures.EXPECTED_DEFAULTS;

    // Act
    const actualDefaults = PerspectiveCameraConstants.PERSPECTIVE_CAMERA_DEFAULTS;

    // Assert
    assert.deepEqual(actualDefaults, expectedDefaults);
});

test("'PerspectiveCamera' validation errors should preserve their contracts", () => {
    // Arrange
    const expectedErrors = PerspectiveCameraConstantTestFixtures.EXPECTED_ERRORS;

    // Act
    const actualErrors = PerspectiveCameraConstants.PERSPECTIVE_CAMERA_ERRORS;

    // Assert
    assert.deepEqual(actualErrors, expectedErrors);
});
