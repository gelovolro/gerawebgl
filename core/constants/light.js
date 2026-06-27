import * as MathConstants from './math.js';

// Default enabled state for all light types
export const LIGHT_DEFAULTS = Object.freeze({ ENABLED: true });

// Default strength value for 'AmbientLight'
export const LIGHT_AMBIENT = Object.freeze({ DEFAULT_STRENGTH: 0.2 });

// Default values and limits for 'DirectionalLight'
export const LIGHT_DIRECTIONAL = Object.freeze({
    DEFAULT_DIRECTIONAL_STRENGTH :  1.0,
    MIN_DIRECTIONAL_STRENGTH     :  0.0,
    MAX_DIRECTIONAL_STRENGTH     :  3.0,
    MIN_DIRECTION_LENGTH_SQUARED :  0.0,
    INVERSE_LENGTH_NUMERATOR     :  1.0,
    DEFAULT_ROLL_RADIANS         :  0.0,
    ASIN_CLAMP_MIN               : -1.0,
    ASIN_CLAMP_MAX               :  1.0
});

// Default direction vector for 'DirectionalLight'
export const LIGHT_DIRECTIONAL_DEFAULT_DIRECTION = Object.freeze([0.5, 0.7, 1.0]);

// Length of the default direction vector, used to precompute the normalized direction
const DEFAULT_DIRECTION_LENGTH = Math.hypot(
    LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MathConstants.MATH_VECTOR3_INDEXES.X],
    LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MathConstants.MATH_VECTOR3_INDEXES.Y],
    LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MathConstants.MATH_VECTOR3_INDEXES.Z]
);

// Normalized default direction vector for 'DirectionalLight'
export const LIGHT_DIRECTIONAL_DEFAULT_NORMALIZED_DIRECTION = Object.freeze([
    LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MathConstants.MATH_VECTOR3_INDEXES.X] / DEFAULT_DIRECTION_LENGTH,
    LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MathConstants.MATH_VECTOR3_INDEXES.Y] / DEFAULT_DIRECTION_LENGTH,
    LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MathConstants.MATH_VECTOR3_INDEXES.Z] / DEFAULT_DIRECTION_LENGTH
]);
