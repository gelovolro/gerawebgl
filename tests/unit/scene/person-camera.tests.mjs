import test                       from 'node:test';
import assert                     from 'node:assert/strict';
import { Camera }                 from '../../../core/scene/camera.js';
import { PerspectiveCamera }      from '../../../core/scene/perspective-camera.js';
import { PersonCamera }           from '../../../core/scene/person-camera.js';
import { FirstPersonCamera }      from '../../../core/scene/first-person-camera.js';
import { ThirdPersonCamera }      from '../../../core/scene/third-person-camera.js';
import * as PersonCameraConstants from '../../../core/constants/person-camera.js';

class PersonCameraTestFixtures {
    static EXPECTED_IS_INSTANCE              = true;
    static EXPECTED_IS_FROZEN                = true;
    static EXPECTED_DEFAULT_MODE             = 0;
    static EXPECTED_BOBBING_MODE             = 1;
    static UPDATED_THIRD_CAMERA_ASPECT_RATIO = 2;
}

test("'PersonCamera' derived cameras should share the perspective implementation", () => {
    // Arrange
    const firstCamera         = new FirstPersonCamera();
    const thirdCamera         = new ThirdPersonCamera();
    const expectedIsInstance  = PersonCameraTestFixtures.EXPECTED_IS_INSTANCE;
    const expectedProjection  = PerspectiveCamera.prototype.getProjectionMatrix;
    const expectedAspectRatio = PerspectiveCamera.prototype.setAspectRatio;

    // Act
    const firstIsPerspective  = firstCamera instanceof PerspectiveCamera;
    const thirdIsPerspective  = thirdCamera instanceof PerspectiveCamera;
    const firstIsPerson       = firstCamera instanceof PersonCamera;
    const thirdIsPerson       = thirdCamera instanceof PersonCamera;
    const firstIsCamera       = firstCamera instanceof Camera;
    const thirdIsCamera       = thirdCamera instanceof Camera;

    // Assert
    assert.equal(firstIsPerspective, expectedIsInstance);
    assert.equal(thirdIsPerspective, expectedIsInstance);
    assert.equal(firstIsPerson, expectedIsInstance);
    assert.equal(thirdIsPerson, expectedIsInstance);
    assert.equal(firstIsCamera, expectedIsInstance);
    assert.equal(thirdIsCamera, expectedIsInstance);

    assert.equal(firstCamera.getProjectionMatrix, expectedProjection);
    assert.equal(thirdCamera.getProjectionMatrix, expectedProjection);
    assert.equal(firstCamera.setAspectRatio, expectedAspectRatio);
    assert.equal(thirdCamera.setAspectRatio, expectedAspectRatio);
});

test("'PersonCamera' derived cameras should share the same mode dictionary", () => {
    // Arrange
    const expectedModes    = PersonCameraConstants.PERSON_CAMERA_MODES;
    const expectedIsFrozen = PersonCameraTestFixtures.EXPECTED_IS_FROZEN;

    // Act
    const firstModes   = FirstPersonCamera.Modes;
    const thirdModes   = ThirdPersonCamera.Modes;
    const actualFrozen = Object.isFrozen(firstModes);

    // Assert
    assert.equal(firstModes, expectedModes);
    assert.equal(thirdModes, expectedModes);
    assert.equal(firstModes, thirdModes);
    assert.equal(actualFrozen, expectedIsFrozen);
});

test("'PersonCamera' derived instances should keep their state separate", () => {
    // Arrange
    const firstCamera       = new FirstPersonCamera();
    const thirdCamera       = new ThirdPersonCamera();
    const expectedFirstMode = PersonCameraTestFixtures.EXPECTED_DEFAULT_MODE;
    const expectedThirdMode = PersonCameraTestFixtures.EXPECTED_BOBBING_MODE;

    // Act
    const firstProjection    = firstCamera.getProjectionMatrix();
    const thirdProjection    = thirdCamera.getProjectionMatrix();
    const initialFirstValues = [...firstProjection];
    const initialThirdValues = [...thirdProjection];
    const updatedThirdAspect = PersonCameraTestFixtures.UPDATED_THIRD_CAMERA_ASPECT_RATIO;

    thirdCamera.setAspectRatio(updatedThirdAspect);
    thirdCamera.setMode(ThirdPersonCamera.Modes.BOBBING);
    const updatedThirdProjection = thirdCamera.getProjectionMatrix();

    // Assert
    assert.notEqual(firstProjection, thirdProjection);
    assert.equal(updatedThirdProjection, thirdProjection);
    assert.deepEqual([...firstProjection], initialFirstValues);
    assert.notDeepEqual([...updatedThirdProjection], initialThirdValues);
    assert.equal(firstCamera.mode, expectedFirstMode);
    assert.equal(thirdCamera.mode, expectedThirdMode);
});
