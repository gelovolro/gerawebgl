import { MATH_COMMON_VALUES, MATH_LAYOUT, MATH_VECTOR3_INDEXES } from './math.js';

// Default raycast options
export const RAYCASTER_DEFAULTS = Object.freeze({
    RECURSIVE : true,
    FILTER    : null,
    SORT      : true
});

// Raycast option names
export const RAYCASTER_OPTION_KEYS = Object.freeze({
    RECURSIVE : 'recursive',
    FILTER    : 'filter',
    SORT      : 'sort'
});

// Near and far clip-space coordinates used to construct the ray
export const RAYCASTER_NDC = Object.freeze({
    NEAR : -1.0,
    FAR  : MATH_COMMON_VALUES.UNIT,
    W    : MATH_COMMON_VALUES.UNIT
});

// Ray and axis-aligned bounding box intersection values
export const RAYCASTER_RAY = Object.freeze({
    MIN_PARAMETER     : MATH_COMMON_VALUES.ZERO,
    MAX_PARAMETER     : Number.POSITIVE_INFINITY,
    DIRECTION_EPSILON : 1e-8,
    INVERSE_NUMERATOR : MATH_COMMON_VALUES.UNIT
});

// Component names and array indexes for the three spatial axes
export const RAYCASTER_AXES = Object.freeze([
    Object.freeze({ name: 'x', index: MATH_VECTOR3_INDEXES.X }),
    Object.freeze({ name: 'y', index: MATH_VECTOR3_INDEXES.Y }),
    Object.freeze({ name: 'z', index: MATH_VECTOR3_INDEXES.Z })
]);

// Column-major matrix indexes used for homogeneous point transformations
export const RAYCASTER_MATRIX_INDEXES = Object.freeze({
    XX : MATH_VECTOR3_INDEXES.X,
    XY : MATH_LAYOUT.MATRIX_STRIDE + MATH_VECTOR3_INDEXES.X,
    XZ : (MATH_LAYOUT.MATRIX_STRIDE * MATH_VECTOR3_INDEXES.Z) + MATH_VECTOR3_INDEXES.X,
    XW : (MATH_LAYOUT.MATRIX_STRIDE * MATH_LAYOUT.VECTOR3_ELEMENT_COUNT) + MATH_VECTOR3_INDEXES.X,
    YX : MATH_VECTOR3_INDEXES.Y,
    YY : MATH_LAYOUT.MATRIX_STRIDE + MATH_VECTOR3_INDEXES.Y,
    YZ : (MATH_LAYOUT.MATRIX_STRIDE * MATH_VECTOR3_INDEXES.Z) + MATH_VECTOR3_INDEXES.Y,
    YW : (MATH_LAYOUT.MATRIX_STRIDE * MATH_LAYOUT.VECTOR3_ELEMENT_COUNT) + MATH_VECTOR3_INDEXES.Y,
    ZX : MATH_VECTOR3_INDEXES.Z,
    ZY : MATH_LAYOUT.MATRIX_STRIDE + MATH_VECTOR3_INDEXES.Z,
    ZZ : (MATH_LAYOUT.MATRIX_STRIDE * MATH_VECTOR3_INDEXES.Z) + MATH_VECTOR3_INDEXES.Z,
    ZW : (MATH_LAYOUT.MATRIX_STRIDE * MATH_LAYOUT.VECTOR3_ELEMENT_COUNT) + MATH_VECTOR3_INDEXES.Z,
    WX : MATH_LAYOUT.MATRIX_ROW_COUNT - MATH_COMMON_VALUES.UNIT,
    WY : MATH_LAYOUT.MATRIX_STRIDE + MATH_LAYOUT.MATRIX_ROW_COUNT - MATH_COMMON_VALUES.UNIT,
    WZ : (MATH_LAYOUT.MATRIX_STRIDE * MATH_VECTOR3_INDEXES.Z) + MATH_LAYOUT.MATRIX_ROW_COUNT - MATH_COMMON_VALUES.UNIT,
    WW : MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT - MATH_COMMON_VALUES.UNIT
});

// Public validation and unprojection errors
export const RAYCASTER_ERRORS = Object.freeze({
    SCENE_TYPE       : '`Raycaster.raycast` expects scene as a `Scene` instance.',
    CAMERA_TYPE      : '`Raycaster.raycast` expects camera as a `Camera` instance.',
    MOUSE_NDC_TYPE   : '`Raycaster.raycast` expects `mouseNdc` as an object with numeric x/y.',
    OPTIONS_TYPE     : '`Raycaster.raycast` expects options as a plain object.',
    RECURSIVE_TYPE   : '`Raycaster.raycast` option recursive must be a boolean.',
    FILTER_TYPE      : '`Raycaster.raycast` option filter must be a function or null.',
    SORT_TYPE        : '`Raycaster.raycast` option sort must be a boolean.',
    UNPROJECT_W_ZERO : '`Raycaster.raycast` failed to unproject, `W component` is zero.'
});
