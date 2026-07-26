import test               from 'node:test';
import assert             from 'node:assert/strict';
import * as MathConstants from '../../../core/constants/math.js';

test("'Common math' constants objects should be frozen", () => {
    // Arrange
    const actualConstants = [
        MathConstants.MATH_LAYOUT,
        MathConstants.MATH_COMMON_VALUES,
        MathConstants.MATH_VECTOR3_COMPONENTS,
        MathConstants.MATH_VECTOR3_INDEXES,
        MathConstants.MATH_MATRIX4_INDEXES,
        MathConstants.MATH_MATRIX_VALUES,
        MathConstants.MATH_PERSPECTIVE,
        MathConstants.MATH_ORTHOGRAPHIC,
        MathConstants.MATH_CAMERA_LIMITS,
        MathConstants.MATH_VIEW_MATRIX,
        MathConstants.MATH_MATRIX_INVERSION
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'Common math' layout constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_LAYOUT;
    const expectedConstants = {
        MATRIX_4X4_ELEMENT_COUNT : 16,
        MATRIX_COLUMN_COUNT      : 4,
        MATRIX_ROW_COUNT         : 4,
        MATRIX_STRIDE            : 4,
        VECTOR3_ELEMENT_COUNT    : 3
    };

    // Act & Assert
    assert.equal(actualConstants.MATRIX_4X4_ELEMENT_COUNT , expectedConstants.MATRIX_4X4_ELEMENT_COUNT);
    assert.equal(actualConstants.MATRIX_COLUMN_COUNT      , expectedConstants.MATRIX_COLUMN_COUNT);
    assert.equal(actualConstants.MATRIX_ROW_COUNT         , expectedConstants.MATRIX_ROW_COUNT);
    assert.equal(actualConstants.MATRIX_STRIDE            , expectedConstants.MATRIX_STRIDE);
    assert.equal(actualConstants.VECTOR3_ELEMENT_COUNT    , expectedConstants.VECTOR3_ELEMENT_COUNT);
});

test("'Common math' common value constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_COMMON_VALUES;
    const expectedConstants = {
        ZERO : MathConstants.MATH_COMMON_VALUES.ZERO,
        UNIT : MathConstants.MATH_COMMON_VALUES.UNIT
    };

    // Act & Assert
    assert.equal(actualConstants.ZERO, expectedConstants.ZERO);
    assert.equal(actualConstants.UNIT, expectedConstants.UNIT);
});

test("'Common math' should keep 'Vector3' component constants values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_VECTOR3_COMPONENTS;
    const expectedConstants = {
        ZERO : MathConstants.MATH_COMMON_VALUES.ZERO,
        UNIT : MathConstants.MATH_COMMON_VALUES.UNIT
    };

    // Act & Assert
    assert.equal(actualConstants.ZERO, expectedConstants.ZERO);
    assert.equal(actualConstants.UNIT, expectedConstants.UNIT);
});

test("'Common math' should keep 'Vector3' index constants values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_VECTOR3_INDEXES;
    const expectedConstants = { X : 0, Y : 1, Z : 2 };

    // Act & Assert
    assert.equal(actualConstants.X, expectedConstants.X);
    assert.equal(actualConstants.Y, expectedConstants.Y);
    assert.equal(actualConstants.Z, expectedConstants.Z);
});

test("'Common math' should keep 'Matrix4' index constants values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_MATRIX4_INDEXES;
    const expectedConstants = {
        WORLD_Z_AXIS_X : 8,
        WORLD_Z_AXIS_Y : 9,
        WORLD_Z_AXIS_Z : 10
    };

    // Act & Assert
    assert.equal(actualConstants.WORLD_Z_AXIS_X, expectedConstants.WORLD_Z_AXIS_X);
    assert.equal(actualConstants.WORLD_Z_AXIS_Y, expectedConstants.WORLD_Z_AXIS_Y);
    assert.equal(actualConstants.WORLD_Z_AXIS_Z, expectedConstants.WORLD_Z_AXIS_Z);
});

test("'Common math' matrix value constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_MATRIX_VALUES;
    const expectedConstants = {
        ZERO : MathConstants.MATH_COMMON_VALUES.ZERO,
        UNIT : MathConstants.MATH_COMMON_VALUES.UNIT
    };

    // Act & Assert
    assert.equal(actualConstants.ZERO, expectedConstants.ZERO);
    assert.equal(actualConstants.UNIT, expectedConstants.UNIT);
});

test("'Matrix4' perspective constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_PERSPECTIVE;
    const expectedConstants = {
        HALF_FIELD_OF_VIEW_DIVISOR :  2.0,
        PROJECTION_SCALE_NUMERATOR :  1.0,
        DEPTH_RANGE_NUMERATOR      :  1.0,
        Z_RANGE_MULTIPLIER         :  2.0,
        W_COMPONENT_SCALE          : -1.0
    };

    // Act & Assert
    assert.equal(actualConstants.HALF_FIELD_OF_VIEW_DIVISOR , expectedConstants.HALF_FIELD_OF_VIEW_DIVISOR);
    assert.equal(actualConstants.PROJECTION_SCALE_NUMERATOR , expectedConstants.PROJECTION_SCALE_NUMERATOR);
    assert.equal(actualConstants.DEPTH_RANGE_NUMERATOR      , expectedConstants.DEPTH_RANGE_NUMERATOR);
    assert.equal(actualConstants.Z_RANGE_MULTIPLIER         , expectedConstants.Z_RANGE_MULTIPLIER);
    assert.equal(actualConstants.W_COMPONENT_SCALE          , expectedConstants.W_COMPONENT_SCALE);
});

test("'Matrix4' orthographic constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_ORTHOGRAPHIC;
    const expectedConstants = { SCALE_NUMERATOR: 2.0 };

    // Act & Assert
    assert.equal(actualConstants.SCALE_NUMERATOR, expectedConstants.SCALE_NUMERATOR);
});

test("Camera and projection validation limit constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_CAMERA_LIMITS;
    const expectedConstants = {
        MINIMUM_ASPECT_RATIO       : 0.0,
        MINIMUM_NEAR_CLIP_DISTANCE : 0.0
    };

    // Act & Assert
    assert.equal(actualConstants.MINIMUM_ASPECT_RATIO       , expectedConstants.MINIMUM_ASPECT_RATIO);
    assert.equal(actualConstants.MINIMUM_NEAR_CLIP_DISTANCE , expectedConstants.MINIMUM_NEAR_CLIP_DISTANCE);
});

test("'Camera' view matrix constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_VIEW_MATRIX;
    const expectedConstants = { SCALE_INVERSE_NUMERATOR: 1.0 };

    // Act & Assert
    assert.equal(actualConstants.SCALE_INVERSE_NUMERATOR, expectedConstants.SCALE_INVERSE_NUMERATOR);
});

test("'Matrix4' inversion constants should keep existing values", () => {
    // Arrange
    const actualConstants   = MathConstants.MATH_MATRIX_INVERSION;
    const expectedConstants = {
        MIN_INVERTIBLE_DETERMINANT_ABS : 1e-12,
        INVERSE_DETERMINANT_NUMERATOR  : 1.0
    };

    // Act & Assert
    assert.equal(actualConstants.MIN_INVERTIBLE_DETERMINANT_ABS , expectedConstants.MIN_INVERTIBLE_DETERMINANT_ABS);
    assert.equal(actualConstants.INVERSE_DETERMINANT_NUMERATOR  , expectedConstants.INVERSE_DETERMINANT_NUMERATOR);
});
