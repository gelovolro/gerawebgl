// Field of view, that produces a projection scale outside the finite 'Float32' range
export const PERSPECTIVE_FLOAT32_OVERFLOW_FOV_RADIANS = 1e-39;

// Non-finite numbers, used by 'Matrix4' and 'PerspectiveCamera' tests
export const MATH_NON_FINITE_VALUES = Object.freeze([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY
]);

// Invalid FOV-values, used by 'Matrix4' and 'PerspectiveCamera' tests
export const PERSPECTIVE_INVALID_FIELD_OF_VIEW_VALUES = Object.freeze([
    0,
    -1,
    Math.PI,
    Math.PI + 1
]);

// Default segment count, expected by 'Curve3' tests
export const CURVE3_EXPECTED_DEFAULT_SEGMENT_COUNT = 32;

// Expected default options, used by 'CatmullRomCurve3' tests
export const CATMULL_ROM_EXPECTED_DEFAULTS = Object.freeze({
    MIN_CONTROL_POINTS : 2,
    CLOSED             : false
});

// Expected polynomial coefficients, used by 'CatmullRomCurve3' tests
export const CATMULL_ROM_EXPECTED_VALUES = Object.freeze({
    ZERO    : 0.0,
    ONE     : 1.0,
    TWO     : 2.0,
    THREE   : 3.0,
    FOUR    : 4.0,
    FIVE    : 5.0,
    TENSION : 0.5
});

// Expected tangent normalization threshold, used by 'CatmullRomCurve3' tests
export const CATMULL_ROM_EXPECTED_TANGENT_EPSILON = 1e-8;
