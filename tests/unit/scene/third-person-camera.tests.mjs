import test                            from 'node:test';
import assert                          from 'node:assert/strict';
import * as MathTestConstants          from '../../test-constants/math.js';
import * as PersonCameraConstants      from '../../../core/constants/person-camera.js';
import * as ThirdPersonCameraConstants from '../../../core/constants/third-person-camera.js';
import { Matrix4 }                     from '../../../core/math/matrix4.js';
import { Camera }                      from '../../../core/scene/camera.js';
import { ThirdPersonCamera }           from '../../../core/scene/third-person-camera.js';
import { TestAssertions }              from '../../helpers/test-assertions.mjs';

class ThirdPersonCameraTestFixtures {
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
        return new ThirdPersonCamera(options);
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

test("'ThirdPersonCamera' constructor should use the documented default projection and mode", () => {
    // Arrange
    const expectedMatrix = ThirdPersonCameraTestFixtures.EXPECTED_DEFAULT_MATRIX;

    // Act
    const camera       = new ThirdPersonCamera();
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.ok(camera instanceof Camera);
    assert.equal(camera.mode, ThirdPersonCamera.Modes.NORMAL);
    ThirdPersonCameraTestFixtures.assertMatrix(actualMatrix, expectedMatrix);
});

test("'ThirdPersonCamera' constructor should honor explicitly configured projection values", () => {
    // Arrange
    const expectedMatrix = ThirdPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX;

    // Act
    const camera       = ThirdPersonCameraTestFixtures.createCamera();
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    ThirdPersonCameraTestFixtures.assertMatrix(actualMatrix, expectedMatrix);
});

test("'ThirdPersonCamera' constructor should accept explicitly undefined options", () => {
    // Arrange
    const options = ThirdPersonCameraTestFixtures.UNDEFINED_OPTIONS;

    // Act
    const camera = new ThirdPersonCamera(options);

    // Assert
    assert.equal(camera.mode, ThirdPersonCamera.Modes.NORMAL);
    ThirdPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), ThirdPersonCameraTestFixtures.EXPECTED_DEFAULT_MATRIX);
});

test("'ThirdPersonCamera' constructor should use defaults for explicitly undefined option values", () => {
    // Arrange
    const options = {
        fieldOfViewRadians : ThirdPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        aspectRatio        : ThirdPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        near               : ThirdPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        far                : ThirdPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE,
        mode               : ThirdPersonCameraTestFixtures.UNDEFINED_OPTION_VALUE
    };

    // Act
    const camera = ThirdPersonCameraTestFixtures.createCamera(options);

    // Assert
    assert.equal(camera.mode, ThirdPersonCamera.Modes.NORMAL);
    ThirdPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), ThirdPersonCameraTestFixtures.EXPECTED_DEFAULT_MATRIX);
});

test("'ThirdPersonCamera' constructor should support a null-prototype options object", () => {
    // Arrange
    const options = Object.assign(
        Object.create(ThirdPersonCameraTestFixtures.NULL_PROTOTYPE),
        ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS
    );

    // Act
    const camera = ThirdPersonCameraTestFixtures.createCamera(options);

    // Assert
    ThirdPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), ThirdPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX);
});

test("'ThirdPersonCamera' constructor should reject invalid options containers", () => {
    // Arrange
    class CameraOptions {}
    const errors         = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const invalidOptions = [null, false, 'options', [], 1, new Date(), new Map(), new CameraOptions()];

    // Act & Assert
    invalidOptions.forEach((value) => {
        ThirdPersonCameraTestFixtures.assertError(
            () => new ThirdPersonCamera(value),
            TypeError,
            errors.OPTIONS_TYPE
        );
    });
});

test("'ThirdPersonCamera' constructor should reject invalid numeric option types", () => {
    // Arrange
    const errors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const cases  = [
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.FIELD_OF_VIEW_RADIANS, message: errors.FIELD_OF_VIEW_TYPE },
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.ASPECT_RATIO, message: errors.ASPECT_RATIO_TYPE },
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.NEAR, message: errors.NEAR_TYPE },
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.FAR, message: errors.FAR_TYPE }
    ];

    // Act & Assert
    cases.forEach(({ key, message }) => {
        ThirdPersonCameraTestFixtures.INVALID_NUMERIC_TYPES.forEach((value) => {
            const options = { ...ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS, [key]: value };

            ThirdPersonCameraTestFixtures.assertError(
                () => ThirdPersonCameraTestFixtures.createCamera(options),
                TypeError,
                message
            );
        });
    });
});

test("'ThirdPersonCamera' constructor should reject non-finite projection parameters", () => {
    // Arrange
    const errors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const cases  = [
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.FIELD_OF_VIEW_RADIANS, message: errors.FIELD_OF_VIEW_TYPE },
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.ASPECT_RATIO, message: errors.ASPECT_RATIO_TYPE },
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.NEAR, message: errors.NEAR_TYPE },
        { key: ThirdPersonCameraTestFixtures.NUMERIC_KEYS.FAR, message: errors.FAR_TYPE }
    ];

    // Act & Assert
    cases.forEach(({ key, message }) => {
        ThirdPersonCameraTestFixtures.NON_FINITE_VALUES.forEach((value) => {
            const options = { ...ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS, [key]: value };

            ThirdPersonCameraTestFixtures.assertError(
                () => ThirdPersonCameraTestFixtures.createCamera(options),
                TypeError,
                message
            );
        });
    });
});

test("'ThirdPersonCamera' constructor should reject out-of-range fields of view", () => {
    // Arrange
    const errors        = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const invalidValues = [
        ThirdPersonCameraTestFixtures.ZERO,
        ThirdPersonCameraTestFixtures.NEGATIVE_VALUE,
        ThirdPersonCameraTestFixtures.FIELD_OF_VIEW_MAXIMUM,
        ThirdPersonCameraTestFixtures.FIELD_OF_VIEW_MAXIMUM + ThirdPersonCameraTestFixtures.FIELD_OF_VIEW_RADIANS
    ];

    // Act & Assert
    invalidValues.forEach((fieldOfViewRadians) => {
        const options = { ...ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS, fieldOfViewRadians };

        ThirdPersonCameraTestFixtures.assertError(
            () => ThirdPersonCameraTestFixtures.createCamera(options),
            RangeError,
            errors.FIELD_OF_VIEW_RANGE
        );
    });
});

test("'ThirdPersonCamera' constructor should reject non-positive aspect ratios", () => {
    // Arrange
    const errors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;

    // Act & Assert
    [
        ThirdPersonCameraTestFixtures.ZERO,
        ThirdPersonCameraTestFixtures.NEGATIVE_VALUE
    ].forEach((aspectRatio) => {
        const options = { ...ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS, aspectRatio };

        ThirdPersonCameraTestFixtures.assertError(
            () => ThirdPersonCameraTestFixtures.createCamera(options),
            RangeError,
            errors.ASPECT_RATIO_RANGE
        );
    });
});

test("'ThirdPersonCamera' constructor should reject invalid near and far clipping distances", () => {
    // Arrange
    const errors  = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const options = ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS;

    // Act & Assert
    [
        ThirdPersonCameraTestFixtures.ZERO,
        ThirdPersonCameraTestFixtures.NEGATIVE_VALUE
    ].forEach((near) => {
        ThirdPersonCameraTestFixtures.assertError(
            () => ThirdPersonCameraTestFixtures.createCamera({ ...options, near }),
            RangeError,
            errors.CLIPPING_PLANES
        );
    });

    [
        options.near,
        ThirdPersonCameraTestFixtures.ZERO
    ].forEach((far) => {
        ThirdPersonCameraTestFixtures.assertError(
            () => ThirdPersonCameraTestFixtures.createCamera({ ...options, far }),
            RangeError,
            errors.CLIPPING_PLANES
        );
    });
});

test("'ThirdPersonCamera' constructor should reject unsupported camera modes", () => {
    // Arrange
    const errors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;

    // Act & Assert
    ThirdPersonCameraTestFixtures.INVALID_CONSTRUCTOR_MODES.forEach((mode) => {
        const options = { ...ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS, mode };

        ThirdPersonCameraTestFixtures.assertError(
            () => ThirdPersonCameraTestFixtures.createCamera(options),
            RangeError,
            errors.MODE
        );
    });
});

test("'ThirdPersonCamera.Modes' should expose stable frozen numeric modes", () => {
    // Arrange
    const expectedModes           = Object.freeze({ NORMAL: 0, BOBBING: 1 });
    const expectedSharedModes     = PersonCameraConstants.PERSON_CAMERA_MODES;
    const expectedIsFrozen        = true;
    const expectedIsSameReference = true;

    // Act
    const actualModes           = ThirdPersonCamera.Modes;
    const modesAfterSecondRead  = ThirdPersonCamera.Modes;
    const actualIsFrozen        = Object.isFrozen(actualModes);
    const actualIsSameReference = actualModes === modesAfterSecondRead;

    // Assert
    assert.deepEqual(actualModes, expectedModes);
    assert.equal(actualModes, expectedSharedModes);
    assert.equal(actualIsFrozen, expectedIsFrozen);
    assert.equal(actualIsSameReference, expectedIsSameReference);
});

test("'ThirdPersonCamera' constructor should support bobbing mode", () => {
    // Arrange
    const options = {
        ...ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS,
        mode: ThirdPersonCamera.Modes.BOBBING
    };

    // Act
    const camera = ThirdPersonCameraTestFixtures.createCamera(options);

    // Assert
    assert.equal(camera.mode, ThirdPersonCamera.Modes.BOBBING);
    ThirdPersonCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), ThirdPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX);
});

test("'ThirdPersonCamera.setMode' should switch modes without modifying projection or view", () => {
    // Arrange
    const camera                  = ThirdPersonCameraTestFixtures.createCamera();
    const initialProjection       = camera.getProjectionMatrix();
    const initialProjectionValues = [...initialProjection];
    const initialView             = camera.getViewMatrix();
    const initialViewValues       = [...initialView];

    // Act
    camera.setMode(ThirdPersonCamera.Modes.BOBBING);
    const bobbingMode = camera.mode;
    camera.setMode(ThirdPersonCamera.Modes.NORMAL);

    // Assert
    assert.equal(bobbingMode, ThirdPersonCamera.Modes.BOBBING);
    assert.equal(camera.mode, ThirdPersonCamera.Modes.NORMAL);
    assert.equal(camera.getProjectionMatrix(), initialProjection);
    assert.deepEqual([...initialProjection], initialProjectionValues);
    assert.equal(camera.getViewMatrix(), initialView);
    assert.deepEqual([...initialView], initialViewValues);
});

test("'ThirdPersonCamera.setMode' should reject invalid modes without changing the current mode", () => {
    // Arrange
    const errors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const camera = ThirdPersonCameraTestFixtures.createCamera();

    // Act & Assert
    ThirdPersonCameraTestFixtures.INVALID_SETTER_MODES.forEach((mode) => {
        ThirdPersonCameraTestFixtures.assertError(
            () => camera.setMode(mode),
            RangeError,
            errors.SET_MODE
        );

        assert.equal(camera.mode, ThirdPersonCamera.Modes.NORMAL);
    });
});

test("'ThirdPersonCamera.getProjectionMatrix' should reuse the cached matrix", () => {
    // Arrange
    const camera = ThirdPersonCameraTestFixtures.createCamera();

    // Act
    const firstMatrix  = camera.getProjectionMatrix();
    const secondMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(secondMatrix, firstMatrix);
    ThirdPersonCameraTestFixtures.assertMatrix(secondMatrix, ThirdPersonCameraTestFixtures.EXPECTED_CUSTOM_MATRIX);
});

test("'ThirdPersonCamera.getProjectionMatrix' should avoid redundant projection writes", (context) => {
    // Arrange
    const camera = ThirdPersonCameraTestFixtures.createCamera();
    const writer = context.mock.method(Matrix4, 'writePerspectiveTo');

    // Act & Assert
    camera.getProjectionMatrix();
    camera.getProjectionMatrix();
    camera.setAspectRatio(ThirdPersonCameraTestFixtures.ASPECT_RATIO);
    camera.getProjectionMatrix();

    const writesBeforeUpdate = writer.mock.callCount();
    camera.setAspectRatio(ThirdPersonCameraTestFixtures.UPDATED_ASPECT_RATIO);
    camera.getProjectionMatrix();

    assert.equal(writesBeforeUpdate, ThirdPersonCameraTestFixtures.INITIAL_PROJECTION_WRITES);
    assert.equal(writer.mock.callCount(), ThirdPersonCameraTestFixtures.UPDATED_PROJECTION_WRITES);
});

test("'ThirdPersonCamera.getProjectionMatrix' should reject values that overflow Float32", () => {
    // Arrange
    const options = {
        ...ThirdPersonCameraTestFixtures.CUSTOM_OPTIONS,
        fieldOfViewRadians: ThirdPersonCameraTestFixtures.FIELD_OF_VIEW_OVERFLOW
    };

    const camera = ThirdPersonCameraTestFixtures.createCamera(options);

    // Act
    const projection = () => camera.getProjectionMatrix();

    // Assert
    assert.throws(projection, { name: 'RangeError', message: /remain finite after conversion to `Float32Array`/u });
    assert.throws(projection, RangeError);
});

test("'ThirdPersonCamera.setAspectRatio' should reject invalid types and non-finite values", () => {
    // Arrange
    const errors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const camera = ThirdPersonCameraTestFixtures.createCamera();

    // Act & Assert
    [
        ...ThirdPersonCameraTestFixtures.INVALID_NUMERIC_TYPES,
        ...ThirdPersonCameraTestFixtures.NON_FINITE_VALUES
    ].forEach((aspectRatio) => {
        ThirdPersonCameraTestFixtures.assertError(
            () => camera.setAspectRatio(aspectRatio),
            TypeError,
            errors.SET_ASPECT_TYPE
        );
    });
});

test("'ThirdPersonCamera.setAspectRatio' should reject non-positive values", () => {
    // Arrange
    const errors = ThirdPersonCameraConstants.THIRD_PERSON_CAMERA_ERRORS;
    const camera = ThirdPersonCameraTestFixtures.createCamera();

    // Act & Assert
    [
        ThirdPersonCameraTestFixtures.ZERO,
        ThirdPersonCameraTestFixtures.NEGATIVE_VALUE
    ].forEach((aspectRatio) => {
        ThirdPersonCameraTestFixtures.assertError(
            () => camera.setAspectRatio(aspectRatio),
            RangeError,
            errors.SET_ASPECT_RANGE
        );
    });
});

test("'ThirdPersonCamera.setAspectRatio' should preserve cached projection after an invalid update", () => {
    // Arrange
    const camera        = ThirdPersonCameraTestFixtures.createCamera();
    const initialMatrix = camera.getProjectionMatrix();
    const initialValues = [...initialMatrix];

    // Act
    const update = () => camera.setAspectRatio(ThirdPersonCameraTestFixtures.NEGATIVE_VALUE);

    // Assert
    assert.throws(update, RangeError);
    assert.equal(camera.getProjectionMatrix(), initialMatrix);
    assert.deepEqual([...initialMatrix], initialValues);
});

test("'ThirdPersonCamera.setAspectRatio' should preserve projection when aspect ratio is unchanged", () => {
    // Arrange
    const camera        = ThirdPersonCameraTestFixtures.createCamera();
    const initialMatrix = camera.getProjectionMatrix();
    const initialValues = [...initialMatrix];

    // Act
    camera.setAspectRatio(ThirdPersonCameraTestFixtures.ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialMatrix);
    assert.deepEqual([...actualMatrix], initialValues);
});

test("'ThirdPersonCamera.setAspectRatio' should update the cached projection in place", () => {
    // Arrange
    const camera        = ThirdPersonCameraTestFixtures.createCamera();
    const initialMatrix = camera.getProjectionMatrix();

    // Act
    camera.setAspectRatio(ThirdPersonCameraTestFixtures.UPDATED_ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialMatrix);
    ThirdPersonCameraTestFixtures.assertMatrix(actualMatrix, ThirdPersonCameraTestFixtures.EXPECTED_UPDATED_MATRIX);
});

test("'ThirdPersonCamera.setAspectRatio' should apply an update before the first projection read", () => {
    // Arrange
    const camera = ThirdPersonCameraTestFixtures.createCamera();

    // Act
    camera.setAspectRatio(ThirdPersonCameraTestFixtures.UPDATED_ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    ThirdPersonCameraTestFixtures.assertMatrix(actualMatrix, ThirdPersonCameraTestFixtures.EXPECTED_UPDATED_MATRIX);
});

test("'ThirdPersonCamera' should inherit the cached view matrix behavior from 'Camera'", () => {
    // Arrange
    const camera = ThirdPersonCameraTestFixtures.createCamera();
    camera.position.set(...ThirdPersonCameraTestFixtures.CAMERA_POSITION);

    // Act
    const firstMatrix  = camera.getViewMatrix();
    const secondMatrix = camera.getViewMatrix();

    // Assert
    assert.equal(secondMatrix, firstMatrix);
    ThirdPersonCameraTestFixtures.assertMatrix(firstMatrix, ThirdPersonCameraTestFixtures.EXPECTED_VIEW_MATRIX);
});
