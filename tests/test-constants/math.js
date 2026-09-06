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
