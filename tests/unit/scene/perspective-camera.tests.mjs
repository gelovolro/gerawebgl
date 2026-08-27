import test                  from 'node:test';
import assert                from 'node:assert/strict';
import { Matrix4 }           from '../../../core/math/matrix4.js';
import { PerspectiveCamera } from '../../../core/scene/perspective-camera.js';
import { TestAssertions }    from '../../helpers/test-assertions.mjs';

class PerspectiveCameraTestFixtures {
    static FIELD_OF_VIEW_RADIANS = Math.PI / 2;
    static ASPECT_RATIO          = 2;
    static UPDATED_ASPECT_RATIO  = 4;
    static NEAR_CLIPPING_PLANE   = 1;
    static FAR_CLIPPING_PLANE    = 11;
    static ZERO_ASPECT_RATIO     = 0;
    static ZERO_NEAR_PLANE       = 0;

    static createCamera() {
        return new PerspectiveCamera(
            PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
            PerspectiveCameraTestFixtures.ASPECT_RATIO,
            PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
            PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
        );
    }

    static createExpectedProjectionMatrix(aspectRatio = PerspectiveCameraTestFixtures.ASPECT_RATIO) {
        return Matrix4.createPerspective(
            PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
            aspectRatio,
            PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
            PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
        );
    }
}

test("'PerspectiveCamera' constructor should create a valid perspective projection", () => {
    // Arrange
    const expectedMatrix = PerspectiveCameraTestFixtures.createExpectedProjectionMatrix();

    // Act
    const actualCamera = PerspectiveCameraTestFixtures.createCamera();
    const actualMatrix = actualCamera.getProjectionMatrix();

    // Assert
    assert.ok(actualMatrix instanceof Float32Array);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'PerspectiveCamera' constructor should reject non-numeric arguments", () => {
    // Arrange
    const invalidFieldOfViewRadians = '1';
    const invalidAspectRatio        = '2';
    const invalidNear               = '3';
    const invalidFar                = '4';

    // Act
    const actualFieldOfViewRadiansCall = () => new PerspectiveCamera(
        invalidFieldOfViewRadians,
        PerspectiveCameraTestFixtures.ASPECT_RATIO,
        PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
        PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
    );

    const actualAspectRatioCall = () => new PerspectiveCamera(
        PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
        invalidAspectRatio,
        PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
        PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNearCall = () => new PerspectiveCamera(
        PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
        PerspectiveCameraTestFixtures.ASPECT_RATIO,
        invalidNear,
        PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
    );

    const actualFarCall = () => new PerspectiveCamera(
        PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
        PerspectiveCameraTestFixtures.ASPECT_RATIO,
        PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualFieldOfViewRadiansCall, TypeError);
    assert.throws(actualFieldOfViewRadiansCall, /expects `fieldOfViewRadians` as a number/);
    assert.throws(actualAspectRatioCall, TypeError);
    assert.throws(actualAspectRatioCall, /expects `aspectRatio` as a number/);
    assert.throws(actualNearCall, TypeError);
    assert.throws(actualNearCall, /expects `near` as a number/);
    assert.throws(actualFarCall, TypeError);
    assert.throws(actualFarCall, /expects `far` as a number/);
});

test("'PerspectiveCamera' constructor should reject invalid aspect ratio", () => {
    // Arrange
    const zeroAspectRatio     = PerspectiveCameraTestFixtures.ZERO_ASPECT_RATIO;
    const negativeAspectRatio = -PerspectiveCameraTestFixtures.ASPECT_RATIO;
    const expectedErrorMatch  = /positive `aspect ratio`/;

    // Act
    const actualZeroAspectRatioCall = () => new PerspectiveCamera(
        PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
        zeroAspectRatio,
        PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
        PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNegativeAspectRatioCall = () => new PerspectiveCamera(
        PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
        negativeAspectRatio,
        PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
        PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    assert.throws(actualZeroAspectRatioCall, RangeError);
    assert.throws(actualZeroAspectRatioCall, expectedErrorMatch);
    assert.throws(actualNegativeAspectRatioCall, RangeError);
    assert.throws(actualNegativeAspectRatioCall, expectedErrorMatch);
});

test("'PerspectiveCamera' constructor should reject invalid clipping planes", () => {
    // Arrange
    const invalidNear        = PerspectiveCameraTestFixtures.ZERO_NEAR_PLANE;
    const invalidFar         = PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE;
    const expectedErrorMatch = /0 < near < far/;

    // Act
    const actualNearCall = () => new PerspectiveCamera(
        PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
        PerspectiveCameraTestFixtures.ASPECT_RATIO,
        invalidNear,
        PerspectiveCameraTestFixtures.FAR_CLIPPING_PLANE
    );

    const actualFarCall = () => new PerspectiveCamera(
        PerspectiveCameraTestFixtures.FIELD_OF_VIEW_RADIANS,
        PerspectiveCameraTestFixtures.ASPECT_RATIO,
        PerspectiveCameraTestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualNearCall, RangeError);
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, RangeError);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'PerspectiveCamera.getProjectionMatrix' should reuse the cached matrix, when projection is unchanged", () => {
    // Arrange
    const actualCamera = PerspectiveCameraTestFixtures.createCamera();

    // Act
    const firstProjectionMatrix  = actualCamera.getProjectionMatrix();
    const secondProjectionMatrix = actualCamera.getProjectionMatrix();

    // Assert
    assert.equal(secondProjectionMatrix, firstProjectionMatrix);
});

test("'PerspectiveCamera.setAspectRatio' should reject a non-number value", () => {
    // Arrange
    const actualCamera       = PerspectiveCameraTestFixtures.createCamera();
    const invalidAspectRatio = '2';
    const expectedErrorMatch = /expects `aspectRatio` as a number/;

    // Act
    const actualCall = () => actualCamera.setAspectRatio(invalidAspectRatio);

    // Assert
    assert.throws(actualCall, TypeError);
    assert.throws(actualCall, expectedErrorMatch);
});

test("'PerspectiveCamera.setAspectRatio' should reject non-positive values", () => {
    // Arrange
    const actualCamera        = PerspectiveCameraTestFixtures.createCamera();
    const zeroAspectRatio     = PerspectiveCameraTestFixtures.ZERO_ASPECT_RATIO;
    const negativeAspectRatio = -PerspectiveCameraTestFixtures.ASPECT_RATIO;
    const expectedErrorMatch  = /positive number/;

    // Act
    const actualZeroAspectRatioCall     = () => actualCamera.setAspectRatio(zeroAspectRatio);
    const actualNegativeAspectRatioCall = () => actualCamera.setAspectRatio(negativeAspectRatio);

    // Assert
    assert.throws(actualZeroAspectRatioCall, RangeError);
    assert.throws(actualZeroAspectRatioCall, expectedErrorMatch);
    assert.throws(actualNegativeAspectRatioCall, RangeError);
    assert.throws(actualNegativeAspectRatioCall, expectedErrorMatch);
});

test("'PerspectiveCamera.setAspectRatio' should keep cached projection, when aspect ratio is unchanged", () => {
    // Arrange
    const actualCamera          = PerspectiveCameraTestFixtures.createCamera();
    const expectedMatrix        = PerspectiveCameraTestFixtures.createExpectedProjectionMatrix();
    const firstProjectionMatrix = actualCamera.getProjectionMatrix();

    // Act
    actualCamera.setAspectRatio(PerspectiveCameraTestFixtures.ASPECT_RATIO);
    const secondProjectionMatrix = actualCamera.getProjectionMatrix();

    // Assert
    assert.equal(secondProjectionMatrix, firstProjectionMatrix);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(secondProjectionMatrix, expectedMatrix);
});

test("'PerspectiveCamera.setAspectRatio' should rebuild cached projection, when aspect ratio changes", () => {
    // Arrange
    const actualCamera            = PerspectiveCameraTestFixtures.createCamera();
    const initialProjectionMatrix = actualCamera.getProjectionMatrix();
    const expectedMatrix          = PerspectiveCameraTestFixtures.createExpectedProjectionMatrix(
        PerspectiveCameraTestFixtures.UPDATED_ASPECT_RATIO
    );

    // Act
    actualCamera.setAspectRatio(PerspectiveCameraTestFixtures.UPDATED_ASPECT_RATIO);
    const actualMatrix = actualCamera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialProjectionMatrix);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});
