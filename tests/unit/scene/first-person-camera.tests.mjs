import test                            from 'node:test';
import assert                          from 'node:assert/strict';
import * as MathTestConstants          from '../../test-constants/math.js';
import * as PersonCameraConstants      from '../../../core/constants/person-camera.js';
import * as FirstPersonCameraConstants from '../../../core/constants/first-person-camera.js';
import { Matrix4 }                     from '../../../core/math/matrix4.js';
import { Camera }                      from '../../../core/scene/camera.js';
import { FirstPersonCamera }           from '../../../core/scene/first-person-camera.js';
import { TestAssertions }              from '../../helpers/test-assertions.mjs';

class FirstPersonCameraTestFixtures {
    static INITIAL_PROJECTION_WRITES = 1;
    static UPDATED_PROJECTION_WRITES = 2;
    static ASPECT_RATIO              = 2;
    static UPDATED_ASPECT_RATIO      = 4;
    static NEAR                      = 1;
    static FAR                       = 11;
    static ZERO                      = 0;
    static NEGATIVE_VALUE            = -1;
    static NULL_PROTOTYPE            = null;
    static UNDEFINED_OPTIONS         = undefined;
    static UNDEFINED_OPTION_VALUE    = undefined;
    static FIELD_OF_VIEW_RADIANS     = Math.PI / 2;
    static FIELD_OF_VIEW_MAXIMUM     = Math.PI;
    static FIELD_OF_VIEW_OVERFLOW    = MathTestConstants.PERSPECTIVE_FLOAT32_OVERFLOW_FOV_RADIANS;
    static NON_FINITE_VALUES         = MathTestConstants.MATH_NON_FINITE_VALUES;
    static INVALID_NUMERIC_TYPES     = Object.freeze([null, false, 'invalid', [], {}]);
    static INVALID_CONSTRUCTOR_MODES = Object.freeze([null, false, 'NORMAL', 'BOBBING', 'normal', 'UNKNOWN', 2, [], {}]);
    static INVALID_SETTER_MODES      = Object.freeze([undefined, ...this.INVALID_CONSTRUCTOR_MODES]);
    static CAMERA_POSITION           = Object.freeze([2, -3, 5]);

    static NUMERIC_KEYS = Object.freeze({
        FIELD_OF_VIEW_RADIANS : 'fieldOfViewRadians',
        ASPECT_RATIO          : 'aspectRatio',
        NEAR                  : 'near',
        FAR                   : 'far'
    });

    static CUSTOM_OPTIONS = Object.freeze({
        fieldOfViewRadians : this.FIELD_OF_VIEW_RADIANS,
        aspectRatio        : this.ASPECT_RATIO,
        near               : this.NEAR,
        far                : this.FAR
    });

    /* eslint-disable indent */
    static EXPECTED_DEFAULT_MATRIX = Object.freeze([
         2.414213657, 0,           0,            0,
         0,           2.414213657, 0,            0,
         0,           0,          -1.001000524, -1,
         0,           0,          -0.200100049,  0
    ]);

    static EXPECTED_CUSTOM_MATRIX = Object.freeze([
        0.5, 0,  0,    0,
        0,   1,  0,    0,
        0,   0, -1.2, -1,
        0,   0, -2.2,  0
    ]);

    static EXPECTED_UPDATED_MATRIX = Object.freeze([
        0.25, 0,  0,    0,
        0,    1,  0,    0,
        0,    0, -1.2, -1,
        0,    0, -2.2,  0
    ]);

    static EXPECTED_VIEW_MATRIX = Object.freeze([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
       -2, 3,-5, 1
    ]);
    /* eslint-enable indent */

    static createCamera(options = this.CUSTOM_OPTIONS) {
        return new FirstPersonCamera(options);
    }

    static assertMatrix(actual, expected) {
        assert.ok(actual instanceof Float32Array);
        assert.equal(actual.every(Number.isFinite), true);
        TestAssertions.assertFloat32ArrayApproximatelyEquals(actual, new Float32Array(expected));
    }

    static assertError(call, errorClass, message) {
        assert.throws(call, { name: errorClass.name, message });
    }
}

test("'FirstPersonCamera' constructor should use the documented default projection and mode", () => {
    // Arrange
    const expectedMatrix = FirstPersonCameraTestFixtures.EXPECTED_DEFAULT_MATRIX;

    // Act
    const camera       = new FirstPersonCamera();
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.ok(camera instanceof Camera);
    assert.equal(camera.mode, FirstPersonCamera.Modes.NORMAL);
    FirstPersonCameraTestFixtures.assertMatrix(actualMatrix, expectedMatrix);
});

test("'FirstPersonCamera' constructor should honor explicitly configured projection values", () => {
    // Arrange
    const expectedMatrix = FirstPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX;

    // Act
    const camera       = FirstPersonCameraTestFixtures.createCamera();
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    FirstPersonCameraTestFixtures.assertMatrix(actualMatrix, expectedMatrix);
});

test("'FirstPersonCamera' constructor should accept explicitly undefined options", () => {
    // Arrange
    const options = FirstPersonCameraTestFixtures.UNDEFINED_OPTIONS;

    // Act
    const camera = new FirstPersonCamera(options);

    // Assert
    assert.equal(camera.mode, FirstPersonCamera.Modes.NORMAL);
    FirstPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), FirstPersonCameraTestFixtures.EXPECTED_DEFAULT_MATRIX);
});

test("'FirstPersonCamera' constructor should use defaults for explicitly undefined option values", () => {
    // Arrange
    const options = {
        fieldOfViewRadians : FirstPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        aspectRatio        : FirstPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        near               : FirstPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        far                : FirstPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        mode               : FirstPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE
    };

    // Act
    const camera = FirstPersonCameraTestFixtures.createCamera(options);

    // Assert
    assert.equal(camera.mode, FirstPersonCamera.Modes.NORMAL);
    FirstPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), FirstPersonCameraTestFixtures.EXPECTED_DEFAULT_MATRIX);
});

test("'FirstPersonCamera' constructor should support a null-prototype options object", () => {
    // Arrange
    const options = Object.assign(
        Object.create(FirstPersonCameraTestFixtures.NULL_PROTOTYPE),
        FirstPersonCameraTestFixtures.CUSTOM_OPTIONS
    );

    // Act
    const camera = FirstPersonCameraTestFixtures.createCamera(options);

    // Assert
    FirstPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), FirstPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX);
});

test("'FirstPersonCamera' constructor should reject invalid options containers", () => {
    // Arrange
    class CameraOptions {}
    const errors         = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const invalidOptions = [null, false, 'options', [], 1, new Date(), new Map(), new CameraOptions()];

    // Act & Assert
    invalidOptions.forEach((value) => {
        FirstPersonCameraTestFixtures.assertError(
            () => new FirstPersonCamera(value),
            TypeError,
            errors.OPTIONS_TYPE
        );
    });
});

test("'FirstPersonCamera' constructor should reject invalid numeric option types", () => {
    // Arrange
    const errors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const cases  = [
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.FIELD_OF_VIEW_RADIANS, message: errors.FIELD_OF_VIEW_TYPE },
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.ASPECT_RATIO, message: errors.ASPECT_RATIO_TYPE },
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.NEAR, message: errors.NEAR_TYPE },
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.FAR, message: errors.FAR_TYPE }
    ];

    // Act & Assert
    cases.forEach(({ key, message }) => {
        FirstPersonCameraTestFixtures.INVALID_NUMERIC_TYPES.forEach((value) => {
            const options = { ...FirstPersonCameraTestFixtures.CUSTOM_OPTIONS, [key]: value };

            FirstPersonCameraTestFixtures.assertError(
                () => FirstPersonCameraTestFixtures.createCamera(options),
                TypeError,
                message
            );
        });
    });
});

test("'FirstPersonCamera' constructor should reject non-finite projection parameters", () => {
    // Arrange
    const errors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const cases  = [
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.FIELD_OF_VIEW_RADIANS, message: errors.FIELD_OF_VIEW_TYPE },
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.ASPECT_RATIO, message: errors.ASPECT_RATIO_TYPE },
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.NEAR, message: errors.NEAR_TYPE },
        { key: FirstPersonCameraTestFixtures.NUMERIC_KEYS.FAR, message: errors.FAR_TYPE }
    ];

    // Act & Assert
    cases.forEach(({ key, message }) => {
        FirstPersonCameraTestFixtures.NON_FINITE_VALUES.forEach((value) => {
            const options = { ...FirstPersonCameraTestFixtures.CUSTOM_OPTIONS, [key]: value };

            FirstPersonCameraTestFixtures.assertError(
                () => FirstPersonCameraTestFixtures.createCamera(options),
                TypeError,
                message
            );
        });
    });
});

test("'FirstPersonCamera' constructor should reject out-of-range fields of view", () => {
    // Arrange
    const errors        = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const invalidValues = [
        FirstPersonCameraTestFixtures.ZERO,
        FirstPersonCameraTestFixtures.NEGATIVE_VALUE,
        FirstPersonCameraTestFixtures.FIELD_OF_VIEW_MAXIMUM,
        FirstPersonCameraTestFixtures.FIELD_OF_VIEW_MAXIMUM + FirstPersonCameraTestFixtures.FIELD_OF_VIEW_RADIANS
    ];

    // Act & Assert
    invalidValues.forEach((fieldOfViewRadians) => {
        const options = { ...FirstPersonCameraTestFixtures.CUSTOM_OPTIONS, fieldOfViewRadians };

        FirstPersonCameraTestFixtures.assertError(
            () => FirstPersonCameraTestFixtures.createCamera(options),
            RangeError,
            errors.FIELD_OF_VIEW_RANGE
        );
    });
});

test("'FirstPersonCamera' constructor should reject non-positive aspect ratios", () => {
    // Arrange
    const errors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;

    // Act & Assert
    [
        FirstPersonCameraTestFixtures.ZERO,
        FirstPersonCameraTestFixtures.NEGATIVE_VALUE
    ].forEach((aspectRatio) => {
        const options = { ...FirstPersonCameraTestFixtures.CUSTOM_OPTIONS, aspectRatio };

        FirstPersonCameraTestFixtures.assertError(
            () => FirstPersonCameraTestFixtures.createCamera(options),
            RangeError,
            errors.ASPECT_RATIO_RANGE
        );
    });
});

test("'FirstPersonCamera' constructor should reject invalid near and far clipping distances", () => {
    // Arrange
    const errors  = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const options = FirstPersonCameraTestFixtures.CUSTOM_OPTIONS;

    // Act & Assert
    [
        FirstPersonCameraTestFixtures.ZERO,
        FirstPersonCameraTestFixtures.NEGATIVE_VALUE
    ].forEach((near) => {
        FirstPersonCameraTestFixtures.assertError(
            () => FirstPersonCameraTestFixtures.createCamera({ ...options, near }),
            RangeError,
            errors.CLIPPING_PLANES
        );
    });

    [
        options.near,
        FirstPersonCameraTestFixtures.ZERO
    ].forEach((far) => {
        FirstPersonCameraTestFixtures.assertError(
            () => FirstPersonCameraTestFixtures.createCamera({ ...options, far }),
            RangeError,
            errors.CLIPPING_PLANES
        );
    });
});

test("'FirstPersonCamera' constructor should reject unsupported camera modes", () => {
    // Arrange
    const errors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;

    // Act & Assert
    FirstPersonCameraTestFixtures.INVALID_CONSTRUCTOR_MODES.forEach((mode) => {
        const options = { ...FirstPersonCameraTestFixtures.CUSTOM_OPTIONS, mode };

        FirstPersonCameraTestFixtures.assertError(
            () => FirstPersonCameraTestFixtures.createCamera(options),
            RangeError,
            errors.MODE
        );
    });
});

test("'FirstPersonCamera.Modes' should expose stable frozen numeric modes", () => {
    // Arrange
    const expectedSharedModes     = PersonCameraConstants.PERSON_CAMERA_MODES;
    const expectedModes           = Object.freeze({ NORMAL: 0, BOBBING: 1 });
    const expectedIsFrozen        = true;
    const expectedIsSameReference = true;

    // Act
    const actualModes           = FirstPersonCamera.Modes;
    const modesAfterSecondRead  = FirstPersonCamera.Modes;
    const actualIsFrozen        = Object.isFrozen(actualModes);
    const actualIsSameReference = actualModes === modesAfterSecondRead;

    // Assert
    assert.deepEqual(actualModes, expectedModes);
    assert.equal(actualModes, expectedSharedModes);
    assert.equal(actualIsFrozen, expectedIsFrozen);
    assert.equal(actualIsSameReference, expectedIsSameReference);
});

test("'FirstPersonCamera' constructor should support bobbing mode", () => {
    // Arrange
    const options = {
        ...FirstPersonCameraTestFixtures.CUSTOM_OPTIONS,
        mode: FirstPersonCamera.Modes.BOBBING
    };

    // Act
    const camera = FirstPersonCameraTestFixtures.createCamera(options);

    // Assert
    assert.equal(camera.mode, FirstPersonCamera.Modes.BOBBING);
    FirstPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), FirstPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX);
});

test("'FirstPersonCamera.setMode' should switch modes without modifying projection or view", () => {
    // Arrange
    const camera                  = FirstPersonCameraTestFixtures.createCamera();
    const initialProjection       = camera.getProjectionMatrix();
    const initialProjectionValues = [...initialProjection];
    const initialView             = camera.getViewMatrix();
    const initialViewValues       = [...initialView];

    // Act
    camera.setMode(FirstPersonCamera.Modes.BOBBING);
    const bobbingMode = camera.mode;
    camera.setMode(FirstPersonCamera.Modes.NORMAL);

    // Assert
    assert.equal(bobbingMode, FirstPersonCamera.Modes.BOBBING);
    assert.equal(camera.mode, FirstPersonCamera.Modes.NORMAL);
    assert.equal(camera.getProjectionMatrix(), initialProjection);
    assert.deepEqual([...initialProjection], initialProjectionValues);
    assert.equal(camera.getViewMatrix(), initialView);
    assert.deepEqual([...initialView], initialViewValues);
});

test("'FirstPersonCamera.setMode' should reject invalid modes without changing the current mode", () => {
    // Arrange
    const errors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const camera = FirstPersonCameraTestFixtures.createCamera();

    // Act & Assert
    FirstPersonCameraTestFixtures.INVALID_SETTER_MODES.forEach((mode) => {
        FirstPersonCameraTestFixtures.assertError(
            () => camera.setMode(mode),
            RangeError,
            errors.SET_MODE
        );

        assert.equal(camera.mode, FirstPersonCamera.Modes.NORMAL);
    });
});

test("'FirstPersonCamera.getProjectionMatrix' should reuse the cached matrix", () => {
    // Arrange
    const camera = FirstPersonCameraTestFixtures.createCamera();

    // Act
    const firstMatrix  = camera.getProjectionMatrix();
    const secondMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(secondMatrix, firstMatrix);
    FirstPersonCameraTestFixtures.assertMatrix(secondMatrix, FirstPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX);
});

test("'FirstPersonCamera.getProjectionMatrix' should avoid redundant projection writes", (context) => {
    // Arrange
    const camera = FirstPersonCameraTestFixtures.createCamera();
    const writer = context.mock.method(Matrix4, 'writePerspectiveTo');

    // Act & Assert
    camera.getProjectionMatrix();
    camera.getProjectionMatrix();
    camera.setAspectRatio(FirstPersonCameraTestFixtures.ASPECT_RATIO);
    camera.getProjectionMatrix();

    const writesBeforeUpdate = writer.mock.callCount();
    camera.setAspectRatio(FirstPersonCameraTestFixtures.UPDATED_ASPECT_RATIO);
    camera.getProjectionMatrix();
    assert.equal(writesBeforeUpdate, FirstPersonCameraTestFixtures.INITIAL_PROJECTION_WRITES);
    assert.equal(writer.mock.callCount(), FirstPersonCameraTestFixtures.UPDATED_PROJECTION_WRITES);
});

test("'FirstPersonCamera.getProjectionMatrix' should reject values that overflow Float32", () => {
    // Arrange
    const options = {
        ...FirstPersonCameraTestFixtures.CUSTOM_OPTIONS,
        fieldOfViewRadians: FirstPersonCameraTestFixtures.FIELD_OF_VIEW_OVERFLOW
    };

    const camera = FirstPersonCameraTestFixtures.createCamera(options);

    // Act
    const projection = () => camera.getProjectionMatrix();

    // Assert
    assert.throws(projection, { name: 'RangeError', message: /remain finite after conversion to `Float32Array`/u });
    assert.throws(projection, RangeError);
});

test("'FirstPersonCamera.setAspectRatio' should reject invalid types and non-finite values", () => {
    // Arrange
    const errors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const camera = FirstPersonCameraTestFixtures.createCamera();

    // Act & Assert
    [
        ...FirstPersonCameraTestFixtures.INVALID_NUMERIC_TYPES,
        ...FirstPersonCameraTestFixtures.NON_FINITE_VALUES
    ].forEach((aspectRatio) => {
        FirstPersonCameraTestFixtures.assertError(
            () => camera.setAspectRatio(aspectRatio),
            TypeError,
            errors.SET_ASPECT_TYPE
        );
    });
});

test("'FirstPersonCamera.setAspectRatio' should reject non-positive values", () => {
    // Arrange
    const errors = FirstPersonCameraConstants.FIRST_PERSON_CAMERA_ERRORS;
    const camera = FirstPersonCameraTestFixtures.createCamera();

    // Act & Assert
    [
        FirstPersonCameraTestFixtures.ZERO,
        FirstPersonCameraTestFixtures.NEGATIVE_VALUE
    ].forEach((aspectRatio) => {
        FirstPersonCameraTestFixtures.assertError(
            () => camera.setAspectRatio(aspectRatio),
            RangeError,
            errors.SET_ASPECT_RANGE
        );
    });
});

test("'FirstPersonCamera.setAspectRatio' should preserve cached projection after an invalid update", () => {
    // Arrange
    const camera        = FirstPersonCameraTestFixtures.createCamera();
    const initialMatrix = camera.getProjectionMatrix();
    const initialValues = [...initialMatrix];

    // Act
    const update = () => camera.setAspectRatio(FirstPersonCameraTestFixtures.NEGATIVE_VALUE);

    // Assert
    assert.throws(update, RangeError);
    assert.equal(camera.getProjectionMatrix(), initialMatrix);
    assert.deepEqual([...initialMatrix], initialValues);
});

test("'FirstPersonCamera.setAspectRatio' should preserve projection when aspect ratio is unchanged", () => {
    // Arrange
    const camera        = FirstPersonCameraTestFixtures.createCamera();
    const initialMatrix = camera.getProjectionMatrix();
    const initialValues = [...initialMatrix];

    // Act
    camera.setAspectRatio(FirstPersonCameraTestFixtures.ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialMatrix);
    assert.deepEqual([...actualMatrix], initialValues);
});

test("'FirstPersonCamera.setAspectRatio' should update the cached projection in place", () => {
    // Arrange
    const camera        = FirstPersonCameraTestFixtures.createCamera();
    const initialMatrix = camera.getProjectionMatrix();

    // Act
    camera.setAspectRatio(FirstPersonCameraTestFixtures.UPDATED_ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialMatrix);
    FirstPersonCameraTestFixtures.assertMatrix(actualMatrix, FirstPersonCameraTestFixtures.EXPECTED_UPDATED_MATRIX);
});

test("'FirstPersonCamera.setAspectRatio' should apply an update before the first projection read", () => {
    // Arrange
    const camera = FirstPersonCameraTestFixtures.createCamera();

    // Act
    camera.setAspectRatio(FirstPersonCameraTestFixtures.UPDATED_ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    FirstPersonCameraTestFixtures.assertMatrix(actualMatrix, FirstPersonCameraTestFixtures.EXPECTED_UPDATED_MATRIX);
});

test("'FirstPersonCamera' should inherit the cached view matrix behavior from Camera", () => {
    // Arrange
    const camera = FirstPersonCameraTestFixtures.createCamera();
    camera.position.set(...FirstPersonCameraTestFixtures.CAMERA_POSITION);

    // Act
    const firstMatrix  = camera.getViewMatrix();
    const secondMatrix = camera.getViewMatrix();

    // Assert
    assert.equal(secondMatrix, firstMatrix);
    FirstPersonCameraTestFixtures.assertMatrix(firstMatrix, FirstPersonCameraTestFixtures.EXPECTED_VIEW_MATRIX);
});
