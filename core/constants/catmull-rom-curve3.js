import { MATH_COMMON_VALUES } from './math.js';

// Default options and minimum point count for 'CatmullRomCurve3'
export const CATMULL_ROM_DEFAULTS = Object.freeze({
    MIN_CONTROL_POINTS : 2,
    CLOSED             : false
});

// Shared numeric values and polynomial coefficients for 'CatmullRomCurve3'
export const CATMULL_ROM_VALUES = Object.freeze({
    ZERO    : MATH_COMMON_VALUES.ZERO,
    ONE     : MATH_COMMON_VALUES.UNIT,
    TWO     : 2,
    THREE   : 3,
    FOUR    : 4,
    FIVE    : 5,
    TENSION : 0.5
});

// Tangent normalization tolerance for 'CatmullRomCurve3'
export const CATMULL_ROM_TANGENT = Object.freeze({ EPSILON: 1e-8 });
