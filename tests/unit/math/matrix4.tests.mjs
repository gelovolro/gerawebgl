import test               from 'node:test';
import assert             from 'node:assert/strict';
import * as MathConstants from '../../../core/constants/math.js';
import { Matrix4 }        from '../../../core/math/matrix4.js';
import { TestAssertions } from '../../helpers/test-assertions.mjs';

class Matrix4TestFixtures {
    static PERSPECTIVE_FIELD_OF_VIEW_RADIANS = Math.PI / 2;
    static ROTATION_ANGLE_RADIANS            = Math.PI / 2;
    static PERSPECTIVE_ASPECT_RATIO          = 2;
    static NEAR_CLIPPING_PLANE               = 1;
    static FAR_CLIPPING_PLANE                = 11;
    static ORTHOGRAPHIC_LEFT_PLANE           = -2;
    static ORTHOGRAPHIC_RIGHT_PLANE          = 2;
    static ORTHOGRAPHIC_BOTTOM_PLANE         = -4;
    static ORTHOGRAPHIC_TOP_PLANE            = 4;
    static ZERO_ASPECT_RATIO                 = 0;
    static ZERO_NEAR_CLIPPING_PLANE          = 0;
    static TRANSFORMATION_TRANSLATE_X        = 3;
    static TRANSFORMATION_TRANSLATE_Y        = -4;
    static TRANSFORMATION_TRANSLATE_Z        = 5;
    static TRANSFORMATION_ROTATION_X         = Math.PI / 6;
    static TRANSFORMATION_ROTATION_Y         = Math.PI / 4;
    static TRANSFORMATION_ROTATION_Z         = Math.PI / 3;
    static TRANSFORMATION_SCALE_X            = 2;
    static TRANSFORMATION_SCALE_Y            = 3;
    static TRANSFORMATION_SCALE_Z            = 4;

    static createExpectedIdentity() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static createTransposeInput() {
        return new Float32Array([
            1,   2,  3,  4,
            5,   6,  7,  8,
            9,  10, 11, 12,
            13, 14, 15, 16
        ]);
    }

    static createExpectedTranspose() {
        return new Float32Array([
            1, 5,  9, 13,
            2, 6, 10, 14,
            3, 7, 11, 15,
            4, 8, 12, 16
        ]);
    }

    static createEmptyMatrix() {
        return new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    }

    static createInvalidLengthMatrix() {
        return new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT - 1);
    }

    static createExpectedPerspectiveMatrix() {
        return new Float32Array([
            0.5, 0,    0,  0,
            0,   1,    0,  0,
            0,   0, -1.2, -1,
            0,   0, -2.2,  0
        ]);
    }

    static createExpectedOrthographicMatrix() {
        return new Float32Array([
            0.5, 0,    0,   0,
            0,   0.25, 0,   0,
            0,   0,   -0.2, 0,
            0,   0,   -1.2, 1
        ]);
    }
}

test("'Matrix4.createIdentity' should create an identity matrix", () => {
    // Arrange
    const expectedMatrix = Matrix4TestFixtures.createExpectedIdentity();

    // Act
    const actualMatrix = Matrix4.createIdentity();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createScale' should create a scale matrix", () => {
    // Arrange
    const expectedMatrix = new Float32Array([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createScale(2, 3, 4);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createScale' should reject non-numeric arguments", () => {
    // Arrange
    const invalidScaleX      = '1';
    const invalidScaleY      = '2';
    const invalidScaleZ      = '3';
    const expectedErrorMatch = /numeric arguments/;

    // Act
    const actualScaleXCall = () => Matrix4.createScale(invalidScaleX, 2, 3);
    const actualScaleYCall = () => Matrix4.createScale(1, invalidScaleY, 3);
    const actualScaleZCall = () => Matrix4.createScale(1, 2, invalidScaleZ);

    // Assert
    assert.throws(actualScaleXCall, expectedErrorMatch);
    assert.throws(actualScaleYCall, expectedErrorMatch);
    assert.throws(actualScaleZCall, expectedErrorMatch);
});

test("'Matrix4.createPerspective' should create a perspective projection matrix", () => {
    // Arrange
    const expectedMatrix = Matrix4TestFixtures.createExpectedPerspectiveMatrix();

    // Act
    const actualMatrix = Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createPerspective' should reject non-numeric arguments", () => {
    // Arrange
    const invalidFieldOfViewRadians = '1';
    const invalidAspectRatio        = '2';
    const invalidNear               = '3';
    const invalidFar                = '4';
    const expectedErrorMatch        = /numeric arguments/;

    // Act
    const actualFieldOfViewRadiansCall = () => Matrix4.createPerspective(
        invalidFieldOfViewRadians,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualAspectRatioCall = () => Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        invalidAspectRatio,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNearCall = () => Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        invalidNear,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualFarCall = () => Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualFieldOfViewRadiansCall, expectedErrorMatch);
    assert.throws(actualAspectRatioCall, expectedErrorMatch);
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'Matrix4.createPerspective' should reject invalid aspect ratio", () => {
    // Arrange
    const zeroAspectRatio     = Matrix4TestFixtures.ZERO_ASPECT_RATIO;
    const negativeAspectRatio = -Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO;
    const expectedErrorMatch  = /positive aspect ratio/;

    // Act
    const actualZeroAspectRatioCall = () => Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        zeroAspectRatio,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNegativeAspectRatioCall = () => Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        negativeAspectRatio,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    assert.throws(actualZeroAspectRatioCall, expectedErrorMatch);
    assert.throws(actualNegativeAspectRatioCall, expectedErrorMatch);
});

test("'Matrix4.createPerspective' should reject invalid clipping planes", () => {
    // Arrange
    const invalidNear        = Matrix4TestFixtures.ZERO_NEAR_CLIPPING_PLANE;
    const invalidFar         = Matrix4TestFixtures.NEAR_CLIPPING_PLANE;
    const expectedErrorMatch = /0 < near < far/;

    // Act
    const actualNearCall = () => Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        invalidNear,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualFarCall = () => Matrix4.createPerspective(
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'Matrix4.writePerspectiveTo' should write a perspective projection matrix", () => {
    // Arrange
    const actualMatrix   = Matrix4TestFixtures.createEmptyMatrix();
    const expectedMatrix = Matrix4TestFixtures.createExpectedPerspectiveMatrix();

    // Act
    Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.writePerspectiveTo' should return the provided output matrix", () => {
    // Arrange
    const actualMatrix = Matrix4TestFixtures.createEmptyMatrix();

    // Act
    const returnedMatrix = Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    assert.equal(returnedMatrix, actualMatrix);
});

test("'Matrix4.writePerspectiveTo' should reject invalid output matrices", () => {
    // Arrange
    const invalidMatrixType   = [];
    const invalidMatrixLength = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch  = /Float32Array\(16\)/;

    // Act
    const actualTypeCall = () => Matrix4.writePerspectiveTo(
        invalidMatrixType,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualLengthCall = () => Matrix4.writePerspectiveTo(
        invalidMatrixLength,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    assert.throws(actualTypeCall, expectedErrorMatch);
    assert.throws(actualLengthCall, expectedErrorMatch);
});

test("'Matrix4.writePerspectiveTo' should reject non-numeric arguments", () => {
    // Arrange
    const actualMatrix              = Matrix4TestFixtures.createEmptyMatrix();
    const invalidFieldOfViewRadians = '1';
    const invalidAspectRatio        = '2';
    const invalidNear               = '3';
    const invalidFar                = '4';
    const expectedErrorMatch        = /numeric arguments/;

    // Act
    const actualFieldOfViewRadiansCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        invalidFieldOfViewRadians,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualAspectRatioCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        invalidAspectRatio,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNearCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        invalidNear,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualFarCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualFieldOfViewRadiansCall, expectedErrorMatch);
    assert.throws(actualAspectRatioCall, expectedErrorMatch);
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'Matrix4.writePerspectiveTo' should reject invalid aspect ratio", () => {
    // Arrange
    const actualMatrix        = Matrix4TestFixtures.createEmptyMatrix();
    const zeroAspectRatio     = Matrix4TestFixtures.ZERO_ASPECT_RATIO;
    const negativeAspectRatio = -Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO;
    const expectedErrorMatch  = /positive aspect ratio/;

    // Act
    const actualZeroAspectRatioCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        zeroAspectRatio,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNegativeAspectRatioCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        negativeAspectRatio,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    assert.throws(actualZeroAspectRatioCall, expectedErrorMatch);
    assert.throws(actualNegativeAspectRatioCall, expectedErrorMatch);
});

test("'Matrix4.writePerspectiveTo' should reject invalid clipping planes", () => {
    // Arrange
    const actualMatrix       = Matrix4TestFixtures.createEmptyMatrix();
    const invalidNear        = Matrix4TestFixtures.ZERO_NEAR_CLIPPING_PLANE;
    const invalidFar         = Matrix4TestFixtures.NEAR_CLIPPING_PLANE;
    const expectedErrorMatch = /0 < near < far/;

    // Act
    const actualNearCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        invalidNear,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualFarCall = () => Matrix4.writePerspectiveTo(
        actualMatrix,
        Matrix4TestFixtures.PERSPECTIVE_FIELD_OF_VIEW_RADIANS,
        Matrix4TestFixtures.PERSPECTIVE_ASPECT_RATIO,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'Matrix4.writeOrthographicTo' should write an orthographic projection matrix", () => {
    // Arrange
    const actualMatrix   = Matrix4TestFixtures.createEmptyMatrix();
    const expectedMatrix = Matrix4TestFixtures.createExpectedOrthographicMatrix();

    // Act
    Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.writeOrthographicTo' should return the provided output matrix", () => {
    // Arrange
    const actualMatrix = Matrix4TestFixtures.createEmptyMatrix();

    // Act
    const returnedMatrix = Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    assert.equal(returnedMatrix, actualMatrix);
});

test("'Matrix4.writeOrthographicTo' should reject invalid output matrices", () => {
    // Arrange
    const invalidMatrixType   = [];
    const invalidMatrixLength = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch  = /Float32Array\(16\)/;

    // Act
    const actualTypeCall = () => Matrix4.writeOrthographicTo(
        invalidMatrixType,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualLengthCall = () => Matrix4.writeOrthographicTo(
        invalidMatrixLength,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    // Assert
    assert.throws(actualTypeCall, expectedErrorMatch);
    assert.throws(actualLengthCall, expectedErrorMatch);
});

test("'Matrix4.writeOrthographicTo' should reject non-numeric arguments", () => {
    // Arrange
    const actualMatrix       = Matrix4TestFixtures.createEmptyMatrix();
    const invalidLeft        = '-2';
    const invalidRight       = '2';
    const invalidBottom      = '-4';
    const invalidTop         = '4';
    const invalidNear        = '1';
    const invalidFar         = '11';
    const expectedErrorMatch = /numeric arguments/;

    // Act
    const actualLeftCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        invalidLeft,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualRightCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        invalidRight,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualBottomCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        invalidBottom,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualTopCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        invalidTop,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNearCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        invalidNear,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualFarCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualLeftCall, expectedErrorMatch);
    assert.throws(actualRightCall, expectedErrorMatch);
    assert.throws(actualBottomCall, expectedErrorMatch);
    assert.throws(actualTopCall, expectedErrorMatch);
    assert.throws(actualNearCall, expectedErrorMatch);
    assert.throws(actualFarCall, expectedErrorMatch);
});

test("'Matrix4.writeOrthographicTo' should reject invalid planes", () => {
    // Arrange
    const actualMatrix = Matrix4TestFixtures.createEmptyMatrix();
    const invalidRight = Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE;
    const invalidTop   = Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE;
    const invalidFar   = Matrix4TestFixtures.NEAR_CLIPPING_PLANE;

    // Act
    const actualLeftRightCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        invalidRight,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualBottomTopCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        invalidTop,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        Matrix4TestFixtures.FAR_CLIPPING_PLANE
    );

    const actualNearFarCall = () => Matrix4.writeOrthographicTo(
        actualMatrix,
        Matrix4TestFixtures.ORTHOGRAPHIC_LEFT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_RIGHT_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_BOTTOM_PLANE,
        Matrix4TestFixtures.ORTHOGRAPHIC_TOP_PLANE,
        Matrix4TestFixtures.NEAR_CLIPPING_PLANE,
        invalidFar
    );

    // Assert
    assert.throws(actualLeftRightCall, /left !== right/);
    assert.throws(actualBottomTopCall, /bottom !== top/);
    assert.throws(actualNearFarCall, /near < far/);
});

test("'Matrix4.createTranslation' should place translation into the last column", () => {
    // Arrange
    const expectedMatrix = new Float32Array([
        1,   0,  0, 0,
        0,   1,  0, 0,
        0,   0,  1, 0,
        10, 20, 30, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createTranslation(10, 20, 30);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createTranslation' should reject non-numeric arguments", () => {
    // Arrange
    const invalidTranslateX  = '1';
    const invalidTranslateY  = '2';
    const invalidTranslateZ  = '3';
    const expectedErrorMatch = /numeric arguments/;

    // Act
    const actualTranslateXCall = () => Matrix4.createTranslation(invalidTranslateX, 2, 3);
    const actualTranslateYCall = () => Matrix4.createTranslation(1, invalidTranslateY, 3);
    const actualTranslateZCall = () => Matrix4.createTranslation(1, 2, invalidTranslateZ);

    // Assert
    assert.throws(actualTranslateXCall, expectedErrorMatch);
    assert.throws(actualTranslateYCall, expectedErrorMatch);
    assert.throws(actualTranslateZCall, expectedErrorMatch);
});

test("'Matrix4.createRotationX' should create a rotation matrix around X axis", () => {
    // Arrange
    const angleRadians   = Matrix4TestFixtures.ROTATION_ANGLE_RADIANS;
    const expectedMatrix = new Float32Array([
        1,  0, 0, 0,
        0,  0, 1, 0,
        0, -1, 0, 0,
        0,  0, 0, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createRotationX(angleRadians);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createRotationX' should reject a non-numeric angle", () => {
    // Arrange
    const invalidAngleRadians = '1';
    const expectedErrorMatch  = /numeric argument/;

    // Act
    const actualCall = () => Matrix4.createRotationX(invalidAngleRadians);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.createRotationY' should create a rotation matrix around Y axis", () => {
    // Arrange
    const angleRadians   = Matrix4TestFixtures.ROTATION_ANGLE_RADIANS;
    const expectedMatrix = new Float32Array([
        0, 0, -1, 0,
        0, 1,  0, 0,
        1, 0,  0, 0,
        0, 0,  0, 1
    ]);

    // Act
    const actualMatrix = Matrix4.createRotationY(angleRadians);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createRotationY' should reject a non-numeric angle", () => {
    // Arrange
    const invalidAngleRadians = '1';
    const expectedErrorMatch  = /numeric argument/;

    // Act
    const actualCall = () => Matrix4.createRotationY(invalidAngleRadians);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.createRotationZ' should create a rotation matrix around Z axis", () => {
    // Arrange
    const angleRadians = Matrix4TestFixtures.ROTATION_ANGLE_RADIANS;

    /* eslint-disable indent */
    const expectedMatrix = new Float32Array([
         0, 1, 0, 0,
        -1, 0, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1
    ]);
    /* eslint-enable indent */

    // Act
    const actualMatrix = Matrix4.createRotationZ(angleRadians);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.createRotationZ' should reject a non-numeric angle", () => {
    // Arrange
    const invalidAngleRadians = '1';
    const expectedErrorMatch  = /numeric argument/;

    // Act
    const actualCall = () => Matrix4.createRotationZ(invalidAngleRadians);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.writeTransformationTo' should compose translation, rotation and scale into the output matrix", () => {
    // Arrange
    const actualMatrix      = Matrix4TestFixtures.createEmptyMatrix();
    const translationMatrix = Matrix4.createTranslation(
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_X,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Y,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Z
    );

    const rotationZMatrix = Matrix4.createRotationZ(Matrix4TestFixtures.TRANSFORMATION_ROTATION_Z);
    const rotationYMatrix = Matrix4.createRotationY(Matrix4TestFixtures.TRANSFORMATION_ROTATION_Y);
    const rotationXMatrix = Matrix4.createRotationX(Matrix4TestFixtures.TRANSFORMATION_ROTATION_X);
    const scaleMatrix     = Matrix4.createScale(
        Matrix4TestFixtures.TRANSFORMATION_SCALE_X,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Y,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Z
    );

    const expectedMatrix = Matrix4.multiplyMany(
        translationMatrix,
        rotationZMatrix,
        rotationYMatrix,
        rotationXMatrix,
        scaleMatrix
    );

    // Act
    const returnedMatrix = Matrix4.writeTransformationTo(
        actualMatrix,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_X,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Y,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Z,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_X,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_Y,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_Z,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_X,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Y,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Z
    );

    // Assert
    assert.equal(returnedMatrix, actualMatrix);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.writeTransformationTo' should reject invalid output matrices", () => {
    // Arrange
    const invalidMatrixType   = [];
    const invalidMatrixLength = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch  = /Float32Array\(16\)/;
    const validArguments      = [
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_X,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Y,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Z,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_X,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_Y,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_Z,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_X,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Y,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Z
    ];

    // Act
    const actualTypeCall   = () => Matrix4.writeTransformationTo(invalidMatrixType, ...validArguments);
    const actualLengthCall = () => Matrix4.writeTransformationTo(invalidMatrixLength, ...validArguments);

    // Assert
    assert.throws(actualTypeCall, expectedErrorMatch);
    assert.throws(actualLengthCall, expectedErrorMatch);
});

test("'Matrix4.writeTransformationTo' should reject non-numeric transformation arguments", () => {
    // Arrange
    const actualMatrix       = Matrix4TestFixtures.createEmptyMatrix();
    const invalidValue       = 'invalid';
    const expectedErrorMatch = /numeric arguments/;
    const validArguments     = [
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_X,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Y,
        Matrix4TestFixtures.TRANSFORMATION_TRANSLATE_Z,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_X,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_Y,
        Matrix4TestFixtures.TRANSFORMATION_ROTATION_Z,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_X,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Y,
        Matrix4TestFixtures.TRANSFORMATION_SCALE_Z
    ];

    // Act & Assert
    for (let argumentIndex = 0; argumentIndex < validArguments.length; argumentIndex += 1) {
        const invalidArguments = [...validArguments];
        invalidArguments[argumentIndex] = invalidValue;

        const actualCall = () => Matrix4.writeTransformationTo(actualMatrix, ...invalidArguments);
        assert.throws(actualCall, expectedErrorMatch);
    }
});

test("'Matrix4.multiply' should preserve a matrix, when multiplied by identity", () => {
    // Arrange
    const leftMatrix  = Matrix4.createIdentity();
    const rightMatrix = Matrix4.createTranslation(5, 6, 7);

    // Act
    const actualMatrix = Matrix4.multiply(leftMatrix, rightMatrix);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, rightMatrix);
});

test("'Matrix4.multiply' should reject invalid matrix arguments", () => {
    // Arrange
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch = /two 4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidLeftMatrixCall      = () => Matrix4.multiply(invalidMatrix, validMatrix);
    const actualWrongLengthLeftMatrixCall  = () => Matrix4.multiply(wrongLengthMatrix, validMatrix);
    const actualInvalidRightMatrixCall     = () => Matrix4.multiply(validMatrix, invalidMatrix);
    const actualWrongLengthRightMatrixCall = () => Matrix4.multiply(validMatrix, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidLeftMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthLeftMatrixCall, expectedErrorMatch);
    assert.throws(actualInvalidRightMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthRightMatrixCall, expectedErrorMatch);
});

test("'Matrix4.multiplyTo' should write multiplication result into output matrix", () => {
    // Arrange
    const out            = Matrix4TestFixtures.createEmptyMatrix();
    const leftMatrix     = Matrix4.createTranslation(1, 2, 3);
    const rightMatrix    = Matrix4.createScale(2, 3, 4);
    const expectedMatrix = Matrix4.multiply(leftMatrix, rightMatrix);

    // Act
    const actualMatrix = Matrix4.multiplyTo(out, leftMatrix, rightMatrix);

    // Assert
    assert.equal(actualMatrix, out);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(out, expectedMatrix);
});

test("'Matrix4.multiplyTo' should reject invalid matrix arguments", () => {
    // Arrange
    const out                = Matrix4TestFixtures.createEmptyMatrix();
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch = /three 4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidOutCall     = () => Matrix4.multiplyTo(invalidMatrix, validMatrix, validMatrix);
    const actualWrongLengthOutCall = () => Matrix4.multiplyTo(wrongLengthMatrix, validMatrix, validMatrix);
    const actualInvalidLeftCall    = () => Matrix4.multiplyTo(out, invalidMatrix, validMatrix);
    const actualInvalidRightCall   = () => Matrix4.multiplyTo(out, validMatrix, invalidMatrix);

    // Assert
    assert.throws(actualInvalidOutCall, expectedErrorMatch);
    assert.throws(actualWrongLengthOutCall, expectedErrorMatch);
    assert.throws(actualInvalidLeftCall, expectedErrorMatch);
    assert.throws(actualInvalidRightCall, expectedErrorMatch);
});

test("'Matrix4.multiplyMany' with one matrix should return the same matrix instance", () => {
    // Arrange
    const matrix = Matrix4.createTranslation(1, 2, 3);

    // Act
    const actualMatrix = Matrix4.multiplyMany(matrix);

    // Assert
    assert.equal(actualMatrix, matrix);
});

test("'Matrix4.multiplyMany' should multiply matrices in order", () => {
    // Arrange
    const firstMatrix    = Matrix4.createTranslation(1, 2, 3);
    const secondMatrix   = Matrix4.createScale(2, 3, 4);
    const thirdMatrix    = Matrix4.createTranslation(5, 6, 7);
    const expectedMatrix = Matrix4.multiply(Matrix4.multiply(firstMatrix, secondMatrix), thirdMatrix);

    // Act
    const actualMatrix = Matrix4.multiplyMany(firstMatrix, secondMatrix, thirdMatrix);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.multiplyMany' should reject invalid matrix arguments", () => {
    // Arrange
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch = /4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidMatrixCall     = () => Matrix4.multiplyMany(invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.multiplyMany(validMatrix, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.multiplyMany' with no arguments should return identity", () => {
    // Arrange
    const expectedMatrix = Matrix4TestFixtures.createExpectedIdentity();

    // Act
    const actualMatrix = Matrix4.multiplyMany();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.transposeTo' should write transposed matrix into output matrix", () => {
    // Arrange
    const out            = Matrix4TestFixtures.createEmptyMatrix();
    const inputMatrix    = Matrix4TestFixtures.createTransposeInput();
    const expectedMatrix = Matrix4TestFixtures.createExpectedTranspose();

    // Act
    const actualMatrix = Matrix4.transposeTo(out, inputMatrix);

    // Assert
    assert.equal(actualMatrix, out);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(out, expectedMatrix);
});

test("'Matrix4.transpose' should reject invalid matrix", () => {
    // Arrange
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch = /4x4 `Float32Array` matrix/;

    // Act
    const actualInvalidMatrixCall     = () => Matrix4.transpose(invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.transpose(wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.transposeTo' should reject invalid matrix arguments", () => {
    // Arrange
    const out                = Matrix4TestFixtures.createEmptyMatrix();
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch = /two 4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidOutCall        = () => Matrix4.transposeTo(invalidMatrix, validMatrix);
    const actualWrongLengthOutCall    = () => Matrix4.transposeTo(wrongLengthMatrix, validMatrix);
    const actualInvalidMatrixCall     = () => Matrix4.transposeTo(out, invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.transposeTo(out, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidOutCall, expectedErrorMatch);
    assert.throws(actualWrongLengthOutCall, expectedErrorMatch);
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.transposeTo' should reject in-place transpose", () => {
    // Arrange
    const matrix             = Matrix4.createIdentity();
    const expectedErrorMatch = /does not support in-place transpose/;

    // Act
    const actualCall = () => Matrix4.transposeTo(matrix, matrix);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.transpose' should swap rows and columns", () => {
    // Arrange
    const inputMatrix    = Matrix4TestFixtures.createTransposeInput();
    const expectedMatrix = Matrix4TestFixtures.createExpectedTranspose();

    // Act
    const actualMatrix = Matrix4.transpose(inputMatrix);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualMatrix, expectedMatrix);
});

test("'Matrix4.invert' should reject invalid matrix", () => {
    // Arrange
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch = /4x4 `Float32Array` matrix/;

    // Act
    const actualInvalidMatrixCall     = () => Matrix4.invert(invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.invert(wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.invertTo' should write inverted matrix into output matrix", () => {
    // Arrange
    const out             = Matrix4TestFixtures.createEmptyMatrix();
    const matrix          = Matrix4.createTranslation(3, 4, 5);
    const expectedInverse = Matrix4.createTranslation(-3, -4, -5);

    // Act
    const actualInverse = Matrix4.invertTo(out, matrix);

    // Assert
    assert.equal(actualInverse, out);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(out, expectedInverse);
});

test("'Matrix4.invertTo' should reject invalid matrix arguments", () => {
    // Arrange
    const out                = Matrix4TestFixtures.createEmptyMatrix();
    const validMatrix        = Matrix4.createIdentity();
    const invalidMatrix      = [1, 0, 0, 0];
    const wrongLengthMatrix  = Matrix4TestFixtures.createInvalidLengthMatrix();
    const expectedErrorMatch = /two 4x4 `Float32Array` matrices/;

    // Act
    const actualInvalidOutCall        = () => Matrix4.invertTo(invalidMatrix, validMatrix);
    const actualWrongLengthOutCall    = () => Matrix4.invertTo(wrongLengthMatrix, validMatrix);
    const actualInvalidMatrixCall     = () => Matrix4.invertTo(out, invalidMatrix);
    const actualWrongLengthMatrixCall = () => Matrix4.invertTo(out, wrongLengthMatrix);

    // Assert
    assert.throws(actualInvalidOutCall, expectedErrorMatch);
    assert.throws(actualWrongLengthOutCall, expectedErrorMatch);
    assert.throws(actualInvalidMatrixCall, expectedErrorMatch);
    assert.throws(actualWrongLengthMatrixCall, expectedErrorMatch);
});

test("'Matrix4.invertTo' should reject in-place inversion", () => {
    // Arrange
    const matrix             = Matrix4.createIdentity();
    const expectedErrorMatch = /does not support in-place inversion/;

    // Act
    const actualCall = () => Matrix4.invertTo(matrix, matrix);

    // Assert
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Matrix4.invert' should produce an inverse for a translation matrix", () => {
    // Arrange
    const matrix          = Matrix4.createTranslation(3, 4, 5);
    const expectedInverse = Matrix4.createTranslation(-3, -4, -5);

    // Act
    const actualInverse  = Matrix4.invert(matrix);
    const actualIdentity = Matrix4.multiply(matrix, actualInverse);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualInverse, expectedInverse);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(
        actualIdentity,
        Matrix4TestFixtures.createExpectedIdentity()
    );
});

test("'Matrix4.invert' should reject a non-invertible matrix", () => {
    // Arrange
    const matrix = Matrix4.createScale(0, 1, 1);

    // Act
    const actualCall = () => Matrix4.invert(matrix);

    // Assert
    assert.throws(actualCall, /not invertible/);
});

test("'Matrix4.multiplyTo' should reject in-place multiplication", () => {
    // Arrange
    const matrix = Matrix4.createIdentity();

    // Act
    const actualCall = () => Matrix4.multiplyTo(matrix, matrix, Matrix4.createIdentity());

    // Assert
    assert.throws(actualCall, /does not support in-place multiplication/);
});
