import test                       from 'node:test';
import assert                     from 'node:assert/strict';
import * as PersonCameraConstants from '../../../core/constants/person-camera.js';

class PersonCameraConstantTestFixtures {
    static EXPECTED_MODES         = Object.freeze({ NORMAL: 0, BOBBING: 1 });
    static EXPECTED_ALLOWED_MODES = Object.freeze([0, 1]);
}

test("'PersonCamera' shared mode constants should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const groups           = Object.values(PersonCameraConstants);

    // Act
    const actualIsFrozen = groups.every((group) => Object.isFrozen(group));

    // Assert
    assert.equal(actualIsFrozen, expectedIsFrozen);
});

test("'PersonCamera' shared mode constants should preserve numeric contracts", () => {
    // Arrange
    const expectedModes        = PersonCameraConstantTestFixtures.EXPECTED_MODES;
    const expectedAllowedModes = PersonCameraConstantTestFixtures.EXPECTED_ALLOWED_MODES;

    // Act
    const actualModes        = PersonCameraConstants.PERSON_CAMERA_MODES;
    const actualAllowedModes = PersonCameraConstants.PERSON_CAMERA_ALLOWED_MODES;

    // Assert
    assert.deepEqual(actualModes, expectedModes);
    assert.deepEqual(actualAllowedModes, expectedAllowedModes);
});
