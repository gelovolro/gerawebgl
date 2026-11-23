import test                             from 'node:test';
import assert                           from 'node:assert/strict';
import * as MathTestConstants           from '../../test-constants/math.js';
import * as OrthographicCameraConstants from '../../../core/constants/orthographic-camera.js';
import { OrthographicCamera }           from '../../../core/scene/orthographic-camera.js';
import { TestAssertions }               from '../../helpers/test-assertions.mjs';

class OrthographicCameraTestFixtures {
    static LEFT                    = -3;
    static RIGHT                   = 5;
    static BOTTOM                  = -1;
    static TOP                     = 3;
    static NEAR                    = 1;
    static FAR                     = 11;
    static VIEW_SIZE               = 4;
    static ASPECT_RATIO            = 2;
    static UPDATED_ASPECT_RATIO    = 3;
    static ZERO                    = 0;
    static NEGATIVE_VIEW_SIZE      = -4;
    static NEGATIVE_ASPECT_RATIO   = -2;
    static NEGATIVE_NEAR           = -3;
    static SMALL_NONZERO_VIEW_SIZE = 1e-200;
    static NULL_PROTOTYPE          = null;
    static UNDEFINED_BOUND_VALUE   = undefined;
    static UNDEFINED_VIEW_SIZE     = undefined;
    static NON_FINITE_VALUES       = MathTestConstants.MATH_NON_FINITE_VALUES;
    static NARROW_WIDTH            = Number.MIN_VALUE;
    static SMALL_VIEW_SIZE         = Number.MIN_VALUE;
    static SMALL_ASPECT_RATIO      = Number.MIN_VALUE;
    static EXTREME_VALUE           = Number.MAX_VALUE;
    static BOUNDS_KEYS             = Object.freeze(['left', 'right', 'bottom', 'top', 'near', 'far']);
    static VIEW_KEYS               = Object.freeze(['viewSize', 'aspectRatio', 'near', 'far']);
    static INVALID_NUMERIC_TYPES   = Object.freeze([undefined, null, false, 'invalid', [], {}]);
    static INVALID_FIRST_BOUNDS    = Object.freeze([undefined, null, false, 'invalid']);
    static BOUNDS                  = Object.freeze({
        left   : this.LEFT,
        right  : this.RIGHT,
        bottom : this.BOTTOM,
        top    : this.TOP,
        near   : this.NEAR,
        far    : this.FAR
    });

    static VIEW_OPTIONS = Object.freeze({
        viewSize    : this.VIEW_SIZE,
        aspectRatio : this.ASPECT_RATIO,
        near        : this.NEAR,
        far         : this.FAR
    });

    /* eslint-disable indent */
    static EXPECTED_BOUNDS_MATRIX = Object.freeze([
         0.25,  0,    0,    0,
         0,     0.5,  0,    0,
         0,     0,   -0.2,  0,
        -0.25, -0.5, -1.2,  1
    ]);

    static EXPECTED_VIEW_MATRIX = Object.freeze([
        0.25, 0,   0,    0,
        0,    0.5, 0,    0,
        0,    0,  -0.2,  0,
        0,    0,  -1.2,  1
    ]);

    static EXPECTED_UPDATED_MATRIX = Object.freeze([
        (1 / 6), 0,   0,   0,
        0,       0.5, 0,   0,
        0,       0,  -0.2, 0,
        0,       0,  -1.2, 1
    ]);
    /* eslint-enable indent */

    static createBoundsCamera(bounds = this.BOUNDS) {
        return new OrthographicCamera(
            bounds.left,
            bounds.right,
            bounds.bottom,
            bounds.top,
            bounds.near,
            bounds.far
        );
    }

    static createViewCamera(options = this.VIEW_OPTIONS) {
        return new OrthographicCamera(options);
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

test("'OrthographicCamera' constructor should create an off-center projection from numeric bounds", () => {
    // Arrange
    const expectedMatrix = OrthographicCameraTestFixtures.EXPECTED_BOUNDS_MATRIX;

    // Act
    const camera = OrthographicCameraTestFixtures.createBoundsCamera();
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    OrthographicCameraTestFixtures.assertMatrix(actualMatrix, expectedMatrix);
});

test("'OrthographicCamera' constructor should accept explicit bounds as an options object", () => {
    // Arrange
    const bounds = OrthographicCameraTestFixtures.BOUNDS;

    // Act
    const camera = new OrthographicCamera(bounds);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    OrthographicCameraTestFixtures.assertMatrix(actualMatrix, OrthographicCameraTestFixtures.EXPECTED_BOUNDS_MATRIX);
});

test("'OrthographicCamera' constructor should compute symmetric bounds from view size and aspect ratio", () => {
    // Arrange
    const expectedMatrix = OrthographicCameraTestFixtures.EXPECTED_VIEW_MATRIX;

    // Act
    const camera = OrthographicCameraTestFixtures.createViewCamera();
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    OrthographicCameraTestFixtures.assertMatrix(actualMatrix, expectedMatrix);
});

test("'OrthographicCamera' constructor should support a null-prototype options object", () => {
    // Arrange
    const options = Object.assign(Object.create(OrthographicCameraTestFixtures.NULL_PROTOTYPE), OrthographicCameraTestFixtures.VIEW_OPTIONS);

    // Act
    const camera = OrthographicCameraTestFixtures.createViewCamera(options);

    // Assert
    OrthographicCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), OrthographicCameraTestFixtures.EXPECTED_VIEW_MATRIX);
});

test("'OrthographicCamera' constructor should reject arrays and non-plain options objects", () => {
    // Arrange
    class CameraOptions {}
    const invalidItems = [new Date(), new Map(), new CameraOptions()];
    const errors       = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;

    // Act & Assert
    OrthographicCameraTestFixtures.assertError(() => new OrthographicCamera([]), TypeError, errors.OPTIONS_ARRAY);
    invalidItems.forEach((value) => OrthographicCameraTestFixtures.assertError(() => new OrthographicCamera(value), TypeError, errors.OPTIONS_TYPE));
});

test("'OrthographicCamera' constructor should reject missing or non-numeric bounds", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const values = OrthographicCameraTestFixtures.BOUNDS_KEYS.map((key) => OrthographicCameraTestFixtures.BOUNDS[key]);

    // Act & Assert
    OrthographicCameraTestFixtures.BOUNDS_KEYS.forEach((key, index) => {
        const invalidValues = index === OrthographicCameraTestFixtures.ZERO
            ? OrthographicCameraTestFixtures.INVALID_FIRST_BOUNDS
            : OrthographicCameraTestFixtures.INVALID_NUMERIC_TYPES;

        invalidValues.forEach((value) => {
            const invalidArguments  = [...values];
            invalidArguments[index] = value;

            OrthographicCameraTestFixtures.assertError(
                () => new OrthographicCamera(...invalidArguments),
                TypeError,
                errors.BOUNDS_TYPE
            );
        });

        OrthographicCameraTestFixtures.assertError(
            () => new OrthographicCamera({
                ...OrthographicCameraTestFixtures.BOUNDS,
                [key]: OrthographicCameraTestFixtures.UNDEFINED_BOUND_VALUE
            }),
            TypeError,
            errors.BOUNDS_TYPE
        );
    });
});

test("'OrthographicCamera' constructor should reject non-finite bounds", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;

    // Act & Assert
    OrthographicCameraTestFixtures.BOUNDS_KEYS.forEach((key) => {
        OrthographicCameraTestFixtures.NON_FINITE_VALUES.forEach((value) => {
            const invalidBounds = { ...OrthographicCameraTestFixtures.BOUNDS, [key]: value };

            OrthographicCameraTestFixtures.assertError(
                () => new OrthographicCamera(invalidBounds),
                TypeError,
                errors.BOUNDS_TYPE
            );
        });
    });
});

test("'OrthographicCamera' constructor should reject zero-width and zero-height bounds", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const bounds = OrthographicCameraTestFixtures.BOUNDS;

    // Act & Assert
    OrthographicCameraTestFixtures.assertError(
        () => OrthographicCameraTestFixtures.createBoundsCamera({ ...bounds, right: bounds.left }),
        RangeError,
        errors.BOUNDS_WIDTH
    );

    OrthographicCameraTestFixtures.assertError(
        () => OrthographicCameraTestFixtures.createBoundsCamera({ ...bounds, top: bounds.bottom }),
        RangeError,
        errors.BOUNDS_HEIGHT
    );
});

test("'OrthographicCamera' constructor should reject near/far bounds in the wrong order", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const bounds = OrthographicCameraTestFixtures.BOUNDS;

    // Act & Assert
    [bounds.near, bounds.near - OrthographicCameraTestFixtures.NEAR].forEach((far) => {
        OrthographicCameraTestFixtures.assertError(
            () => OrthographicCameraTestFixtures.createBoundsCamera({ ...bounds, far }),
            RangeError,
            errors.BOUNDS_DEPTH
        );
    });
});

test("'OrthographicCamera' constructor should allow reversed horizontal bounds and negative clipping distance", () => {
    // Arrange
    const bounds = OrthographicCameraTestFixtures.BOUNDS;

    // Act
    const camera = OrthographicCameraTestFixtures.createBoundsCamera({
        ...bounds,
        left  : bounds.right,
        right : bounds.left,
        near  : OrthographicCameraTestFixtures.NEGATIVE_NEAR
    });

    // Assert
    assert.equal(camera.getProjectionMatrix().every(Number.isFinite), true);
    assert.ok(camera.getProjectionMatrix()[OrthographicCameraTestFixtures.ZERO] < OrthographicCameraTestFixtures.ZERO);
});

test("'OrthographicCamera' constructor should reject missing, non-numeric and non-finite view-size options", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;

    // Act & Assert
    OrthographicCameraTestFixtures.VIEW_KEYS.forEach((key) => {
        [...OrthographicCameraTestFixtures.INVALID_NUMERIC_TYPES, ...OrthographicCameraTestFixtures.NON_FINITE_VALUES].forEach((value) => {
            const invalidOptions = { ...OrthographicCameraTestFixtures.VIEW_OPTIONS, [key]: value };

            OrthographicCameraTestFixtures.assertError(
                () => OrthographicCameraTestFixtures.createViewCamera(invalidOptions),
                TypeError,
                errors.VIEW_SIZE_TYPE
            );
        });
    });
});

test("'OrthographicCamera' constructor should distinguish present undefined viewSize from absent viewSize", () => {
    // Arrange
    const errors  = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const options = {
        ...OrthographicCameraTestFixtures.BOUNDS,
        viewSize: OrthographicCameraTestFixtures.UNDEFINED_VIEW_SIZE
    };

    // Act & Assert
    OrthographicCameraTestFixtures.assertError(
        () => OrthographicCameraTestFixtures.createViewCamera(options),
        TypeError,
        errors.VIEW_SIZE_TYPE
    );
});

test("'OrthographicCamera' constructor should reject non-positive view size and aspect ratio", () => {
    // Arrange
    const errors  = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const options = OrthographicCameraTestFixtures.VIEW_OPTIONS;

    // Act & Assert
    [OrthographicCameraTestFixtures.ZERO, OrthographicCameraTestFixtures.NEGATIVE_VIEW_SIZE].forEach((viewSize) => {
        OrthographicCameraTestFixtures.assertError(
            () => OrthographicCameraTestFixtures.createViewCamera({ ...options, viewSize }),
            RangeError,
            errors.VIEW_SIZE
        );
    });

    [OrthographicCameraTestFixtures.ZERO, OrthographicCameraTestFixtures.NEGATIVE_ASPECT_RATIO].forEach((aspectRatio) => {
        OrthographicCameraTestFixtures.assertError(
            () => OrthographicCameraTestFixtures.createViewCamera({ ...options, aspectRatio }),
            RangeError,
            errors.ASPECT_RATIO
        );
    });
});

test("'OrthographicCamera' constructor should reject near/far in the wrong order in view-size mode", () => {
    // Arrange
    const errors  = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const options = OrthographicCameraTestFixtures.VIEW_OPTIONS;

    // Act & Assert
    [options.near, options.near - OrthographicCameraTestFixtures.NEAR].forEach((far) => {
        OrthographicCameraTestFixtures.assertError(
            () => OrthographicCameraTestFixtures.createViewCamera({ ...options, far }),
            RangeError,
            errors.VIEW_SIZE_DEPTH
        );
    });
});

test("'OrthographicCamera' constructor should reject overflowing and underflowing view-size extents", () => {
    // Arrange
    const errors  = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const options = OrthographicCameraTestFixtures.VIEW_OPTIONS;

    // Act & Assert
    const invalidOptions = [
        { ...options, viewSize: OrthographicCameraTestFixtures.EXTREME_VALUE, aspectRatio: OrthographicCameraTestFixtures.EXTREME_VALUE },
        { ...options, viewSize: OrthographicCameraTestFixtures.SMALL_VIEW_SIZE },
        { ...options, viewSize: OrthographicCameraTestFixtures.SMALL_NONZERO_VIEW_SIZE, aspectRatio: OrthographicCameraTestFixtures.SMALL_ASPECT_RATIO }
    ];

    invalidOptions.forEach((invalidValue) => {
        OrthographicCameraTestFixtures.assertError(
            () => OrthographicCameraTestFixtures.createViewCamera(invalidValue),
            RangeError,
            errors.VIEW_SIZE_EXTENTS
        );
    });
});

test("'OrthographicCamera.getProjectionMatrix' should reuse a cached matrix", () => {
    // Arrange
    const camera = OrthographicCameraTestFixtures.createBoundsCamera();

    // Act
    const firstMatrix  = camera.getProjectionMatrix();
    const secondMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(secondMatrix, firstMatrix);
    OrthographicCameraTestFixtures.assertMatrix(secondMatrix, OrthographicCameraTestFixtures.EXPECTED_BOUNDS_MATRIX);
});

test("'OrthographicCamera.getProjectionMatrix' should reject a projection that overflows Float32", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const camera = OrthographicCameraTestFixtures.createBoundsCamera({
        ...OrthographicCameraTestFixtures.BOUNDS,
        left  : OrthographicCameraTestFixtures.ZERO,
        right : OrthographicCameraTestFixtures.NARROW_WIDTH
    });

    // Act & Assert
    OrthographicCameraTestFixtures.assertError(() => camera.getProjectionMatrix(), RangeError, errors.PROJECTION_NONFINITE);
});

test("'OrthographicCamera.setAspectRatio' should reject non-numeric and non-finite values", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const camera = OrthographicCameraTestFixtures.createViewCamera();

    // Act & Assert
    [...OrthographicCameraTestFixtures.INVALID_NUMERIC_TYPES, ...OrthographicCameraTestFixtures.NON_FINITE_VALUES].forEach((value) => {
        OrthographicCameraTestFixtures.assertError(
            () => camera.setAspectRatio(value),
            TypeError,
            errors.SET_ASPECT_TYPE
        );
    });
});

test("'OrthographicCamera.setAspectRatio' should reject non-positive values", () => {
    // Arrange
    const errors = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const camera = OrthographicCameraTestFixtures.createViewCamera();

    // Act & Assert
    [OrthographicCameraTestFixtures.ZERO, OrthographicCameraTestFixtures.NEGATIVE_ASPECT_RATIO].forEach((value) => {
        OrthographicCameraTestFixtures.assertError(() => camera.setAspectRatio(value), RangeError, errors.SET_ASPECT_RANGE);
    });
});

test("'OrthographicCamera.setAspectRatio' should preserve explicit-bound projections", () => {
    // Arrange
    const camera        = OrthographicCameraTestFixtures.createBoundsCamera();
    const initialMatrix = camera.getProjectionMatrix();
    const initialValues = [...initialMatrix];

    // Act
    camera.setAspectRatio(OrthographicCameraTestFixtures.UPDATED_ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialMatrix);
    assert.deepEqual([...actualMatrix], initialValues);
});

test("'OrthographicCamera.setAspectRatio' should reuse the projection matrix when aspect ratio is unchanged", () => {
    // Arrange
    const camera        = OrthographicCameraTestFixtures.createViewCamera();
    const initialMatrix = camera.getProjectionMatrix();
    const initialValues = [...initialMatrix];

    // Act
    camera.setAspectRatio(OrthographicCameraTestFixtures.ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialMatrix);
    assert.deepEqual([...actualMatrix], initialValues);
});

test("'OrthographicCamera.setAspectRatio' should update view bounds without replacing the cached matrix", () => {
    // Arrange
    const camera        = OrthographicCameraTestFixtures.createViewCamera();
    const initialMatrix = camera.getProjectionMatrix();

    // Act
    camera.setAspectRatio(OrthographicCameraTestFixtures.UPDATED_ASPECT_RATIO);
    const actualMatrix = camera.getProjectionMatrix();

    // Assert
    assert.equal(actualMatrix, initialMatrix);
    OrthographicCameraTestFixtures.assertMatrix(actualMatrix, OrthographicCameraTestFixtures.EXPECTED_UPDATED_MATRIX);
});

test("'OrthographicCamera.setAspectRatio' should reject overflowing extents without changing the cached projection", () => {
    // Arrange
    const errors        = OrthographicCameraConstants.ORTHOGRAPHIC_CAMERA_ERRORS;
    const camera        = OrthographicCameraTestFixtures.createViewCamera();
    const initialMatrix = camera.getProjectionMatrix();
    const initialValues = [...initialMatrix];

    // Act & Assert
    OrthographicCameraTestFixtures.assertError(
        () => camera.setAspectRatio(OrthographicCameraTestFixtures.EXTREME_VALUE),
        RangeError,
        errors.VIEW_SIZE_EXTENTS
    );

    assert.equal(camera.getProjectionMatrix(), initialMatrix);
    assert.deepEqual([...initialMatrix], initialValues);

    camera.setAspectRatio(OrthographicCameraTestFixtures.UPDATED_ASPECT_RATIO);
    OrthographicCameraTestFixtures.assertMatrix(camera.getProjectionMatrix(), OrthographicCameraTestFixtures.EXPECTED_UPDATED_MATRIX);
});
