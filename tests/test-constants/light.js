export const LIGHT_INVALID_STRENGTH_VALUES = Object.freeze([
    '1',
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY
]);

export const LIGHT_INVALID_ENABLED_VALUE = 1;

export const DIRECTIONAL_LIGHT_INVALID_DIRECTION_OBJECT = Object.freeze({ x: 1, y: 0, z: 0 });
export const DIRECTIONAL_LIGHT_INVALID_DIRECTION_LENGTH = Object.freeze([1, 0]);
export const DIRECTIONAL_LIGHT_INVALID_DIRECTION_COMPONENTS = Object.freeze([1, Number.NaN, 0]);
export const DIRECTIONAL_LIGHT_INVALID_DIRECTION_INFINITY = Object.freeze([1, Number.POSITIVE_INFINITY, 0]);
export const DIRECTIONAL_LIGHT_INVALID_ZERO_DIRECTION = Object.freeze([0, 0, 0]);

export const DIRECTIONAL_LIGHT_ARRAY_DIRECTION_FIXTURE = Object.freeze([3, 4, 0]);
export const DIRECTIONAL_LIGHT_ARRAY_NORMALIZED_DIRECTION_FIXTURE = Object.freeze([0.6, 0.8, 0.0]);
export const DIRECTIONAL_LIGHT_TYPED_DIRECTION_FIXTURE = Object.freeze([0, 0, 5]);
export const DIRECTIONAL_LIGHT_TYPED_NORMALIZED_DIRECTION_FIXTURE = Object.freeze([0.0, 0.0, 1.0]);
