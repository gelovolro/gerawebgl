// Typed array layout sizes, used by math and rendering modules
export const MATH_LAYOUT = Object.freeze({
    MATRIX_4X4_ELEMENT_COUNT : 16,
    MATRIX_COLUMN_COUNT      : 4,
    MATRIX_ROW_COUNT         : 4,
    MATRIX_STRIDE            : 4,
    VECTOR3_ELEMENT_COUNT    : 3
});

// Shared zero and unit values reused across math constant groups
export const MATH_COMMON_VALUES = Object.freeze({
    ZERO : 0.0,
    UNIT : 1.0
});

// Default component values, used by 'Vector3'
export const MATH_VECTOR3_COMPONENTS = Object.freeze({
    ZERO : MATH_COMMON_VALUES.ZERO,
    UNIT : MATH_COMMON_VALUES.UNIT
});

// 'Vector3' component indexes for related math operations
export const MATH_VECTOR3_INDEXES = Object.freeze({
    X : 0,
    Y : 1,
    Z : 2
});

// World Z-axis element indexes in a flat 'Matrix4' buffer
export const MATH_MATRIX4_INDEXES = Object.freeze({
    WORLD_Z_AXIS_X : 8,
    WORLD_Z_AXIS_Y : 9,
    WORLD_Z_AXIS_Z : 10
});

// Shared values reused across matrix operations
export const MATH_MATRIX_VALUES = Object.freeze({
    ZERO : MATH_COMMON_VALUES.ZERO,
    UNIT : MATH_COMMON_VALUES.UNIT
});

// Perspective projection constants, used by 'Matrix4'
export const MATH_PERSPECTIVE = Object.freeze({
    HALF_FIELD_OF_VIEW_DIVISOR :  2.0,
    PROJECTION_SCALE_NUMERATOR :  1.0,
    DEPTH_RANGE_NUMERATOR      :  1.0,
    Z_RANGE_MULTIPLIER         :  2.0,
    W_COMPONENT_SCALE          : -1.0
});

// Orthographic projection constants, used by 'Matrix4'
export const MATH_ORTHOGRAPHIC = Object.freeze({ SCALE_NUMERATOR: 2.0 });

// Camera projection validation limits, used by camera classes and 'Matrix4'
export const MATH_CAMERA_LIMITS = Object.freeze({
    MINIMUM_ASPECT_RATIO       : 0.0,
    MINIMUM_NEAR_CLIP_DISTANCE : 0.0
});

// View matrix constants, used by 'Camera'
export const MATH_VIEW_MATRIX = Object.freeze({ SCALE_INVERSE_NUMERATOR: 1.0 });

// Matrix inversion constants, used by 'Matrix4'
export const MATH_MATRIX_INVERSION = Object.freeze({
    MIN_INVERTIBLE_DETERMINANT_ABS : 1e-12,
    INVERSE_DETERMINANT_NUMERATOR  : 1.0
});
