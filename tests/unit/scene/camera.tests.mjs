import test               from 'node:test';
import assert             from 'node:assert/strict';
import { Camera }         from '../../../core/scene/camera.js';
import { TestAssertions } from '../../helpers/test-assertions.mjs';

class CameraTestFixtures {
    static VIEW_MATRIX_ROTATION_Z_RADIANS = Math.PI / 2;

    static createExpectedIdentityViewMatrix() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /* eslint-disable indent */
    static createExpectedTranslationViewMatrix() {
        return new Float32Array([
              1,   0,   0,  0,
              0,   1,   0,  0,
              0,   0,   1,  0,
            -10, -20, -30,  1
        ]);
    }

    static createExpectedRotationZViewMatrix() {
        return new Float32Array([
             0, -1,  0,  0,
             1,  0,  0,  0,
             0,  0,  1,  0,
             0,  0,  0,  1
        ]);
    }
    /* eslint-enable indent */

    static createExpectedScaleViewMatrix() {
        return new Float32Array([
            0.5, 0,    0,     0,
            0,   0.25, 0,     0,
            0,   0,    0.125, 0,
            0,   0,    0,     1
        ]);
    }

    static createExpectedCombinedViewMatrix() {
        const zero                  = 0;
        const unit                  = 1;
        const inverseScaleX         = 0.5;
        const negativeInverseScaleY = -0.25;
        const translatedX           = -10;
        const translatedY           = 2.5;

        return new Float32Array([
            zero,          negativeInverseScaleY, zero, zero,
            inverseScaleX, zero,                  zero, zero,
            zero,          zero,                  unit, zero,
            translatedX,   translatedY,           zero, unit
        ]);
    }
}

test("'Camera.getProjectionMatrix' should throw for base camera class", () => {
    // Arrange
    const actualCamera       = new Camera();
    const expectedErrorMatch = /derived camera class/;

    // Act
    const actualCall = () => actualCamera.getProjectionMatrix();

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Camera.setAspectRatio' should reject the non-number values", () => {
    // Arrange
    const actualCamera       = new Camera();
    const invalidAspectRatio = '1';
    const expectedErrorMatch = /expects `aspectRatio` as a number/;

    // Act
    const actualCall = () => actualCamera.setAspectRatio(invalidAspectRatio);

    // Assert
    assert.throws(actualCall, TypeError);
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Camera.setAspectRatio' should throw for valid number in base camera", () => {
    // Arrange
    const actualCamera       = new Camera();
    const validAspectRatio   = 1;
    const expectedErrorMatch = /derived camera class/;

    // Act
    const actualCall = () => actualCamera.setAspectRatio(validAspectRatio);

    // Assert
    assert.throws(actualCall, Error);
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Camera.getViewMatrix' should return the identity matrix for default camera", () => {
    // Arrange
    const actualCamera         = new Camera();
    const expectedMatrix       = CameraTestFixtures.createExpectedIdentityViewMatrix();
    const expectedMatrixLength = expectedMatrix.length;

    // Act
    const actualViewMatrix = actualCamera.getViewMatrix();

    // Assert
    assert.ok(actualViewMatrix instanceof Float32Array);
    assert.equal(actualViewMatrix.length, expectedMatrixLength);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualViewMatrix, expectedMatrix);
});

test("'Camera.getViewMatrix' should reuse cached matrix when transform is unchanged", () => {
    // Arrange
    const actualCamera = new Camera();

    // Act
    const firstViewMatrix  = actualCamera.getViewMatrix();
    const secondViewMatrix = actualCamera.getViewMatrix();

    // Assert
    assert.equal(secondViewMatrix, firstViewMatrix);
});

test("'Camera.getViewMatrix' should update matrix after position changes", () => {
    // Arrange
    const actualCamera   = new Camera();
    const expectedMatrix = CameraTestFixtures.createExpectedTranslationViewMatrix();
    actualCamera.getViewMatrix();

    // Act
    actualCamera.position.set(10, 20, 30);
    const actualViewMatrix = actualCamera.getViewMatrix();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualViewMatrix, expectedMatrix);
});

test("'Camera.getViewMatrix' should update matrix after rotation changes", () => {
    // Arrange
    const actualCamera   = new Camera();
    const expectedMatrix = CameraTestFixtures.createExpectedRotationZViewMatrix();

    // Act
    actualCamera.getViewMatrix();
    actualCamera.rotation.z = CameraTestFixtures.VIEW_MATRIX_ROTATION_Z_RADIANS;

    const actualViewMatrix = actualCamera.getViewMatrix();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualViewMatrix, expectedMatrix);
});

test("'Camera.getViewMatrix' should update matrix after scale changes", () => {
    // Arrange
    const actualCamera   = new Camera();
    const expectedMatrix = CameraTestFixtures.createExpectedScaleViewMatrix();

    // Act
    actualCamera.getViewMatrix();
    actualCamera.rotation.z = CameraTestFixtures.VIEW_MATRIX_ROTATION_Z_RADIANS;

    actualCamera.getViewMatrix();
    actualCamera.rotation.z = 0;

    actualCamera.getViewMatrix();
    actualCamera.scale.set(2, 4, 8);

    const actualViewMatrix = actualCamera.getViewMatrix();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualViewMatrix, expectedMatrix);
});

test("'Camera.getViewMatrix' should combine translation, rotation and non-uniform scale", () => {
    // Arrange
    const actualCamera   = new Camera();
    const expectedMatrix = CameraTestFixtures.createExpectedCombinedViewMatrix();
    const positionX      = 10;
    const positionY      = 20;
    const positionZ      = 0;
    const scaleX         = 2;
    const scaleY         = 4;
    const scaleZ         = 1;

    // Act
    actualCamera.getViewMatrix();
    actualCamera.position.set(positionX, positionY, positionZ);
    actualCamera.rotation.z = CameraTestFixtures.VIEW_MATRIX_ROTATION_Z_RADIANS;
    actualCamera.scale.set(scaleX, scaleY, scaleZ);

    const actualViewMatrix = actualCamera.getViewMatrix();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualViewMatrix, expectedMatrix);
});

test("'Camera.getViewMatrix' should reject zero scale", () => {
    // Arrange
    const actualScaleXCamera = new Camera();
    const actualScaleYCamera = new Camera();
    const actualScaleZCamera = new Camera();
    const zeroScale          = 0;
    const unitScale          = 1;
    const expectedErrorMatch = /zero scale/;

    // Act
    actualScaleXCamera.scale.set(zeroScale, unitScale, unitScale);
    actualScaleYCamera.scale.set(unitScale, zeroScale, unitScale);
    actualScaleZCamera.scale.set(unitScale, unitScale, zeroScale);

    const actualScaleXCall = () => actualScaleXCamera.getViewMatrix();
    const actualScaleYCall = () => actualScaleYCamera.getViewMatrix();
    const actualScaleZCall = () => actualScaleZCamera.getViewMatrix();

    // Assert
    const isExpectedError = (error) => error instanceof RangeError && expectedErrorMatch.test(error.message);
    [actualScaleXCall, actualScaleYCall, actualScaleZCall].forEach((actualCall) => assert.throws(actualCall, isExpectedError));
});
