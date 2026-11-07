import { MATH_COMMON_VALUES, MATH_LAYOUT, MATH_VECTOR3_INDEXES } from './math.js';

// Vector layout and component indexes used by 'Vector3Math'
export const VECTOR3_MATH_LAYOUT = Object.freeze({
    COMPONENT_COUNT : MATH_LAYOUT.VECTOR3_ELEMENT_COUNT,
    X_INDEX         : MATH_VECTOR3_INDEXES.X,
    Y_INDEX         : MATH_VECTOR3_INDEXES.Y,
    Z_INDEX         : MATH_VECTOR3_INDEXES.Z
});

// Shared numeric values used by 'Vector3Math'
export const VECTOR3_MATH_VALUES = Object.freeze({
    ZERO : MATH_COMMON_VALUES.ZERO,
    ONE  : MATH_COMMON_VALUES.UNIT
});

// Comparison and normalization tolerances used by 'Vector3Math'
export const VECTOR3_MATH_TOLERANCES = Object.freeze({
    DEFAULT_EPSILON      : 1e-6,
    MIN_NORMALIZE_LENGTH : 1e-8
});
