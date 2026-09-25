import { GEOMETRY_DIRECTIONS } from './geometry.js';

// Default options, used by 'PyramidGeometry'
export const PYRAMID_DEFAULTS = Object.freeze({
    WIDTH                : 1.0,
    HEIGHT               : 1.5,
    BASE_SEGMENT_COUNT   : 1,
    HEIGHT_SEGMENT_COUNT : 1
});

// Minimum accepted counts and values, used by 'PyramidGeometry'
export const PYRAMID_LIMITS = Object.freeze({ MIN_SEGMENT_COUNT: 1 });

// Buffer layout and geometry construction values, used by 'PyramidGeometry'
export const PYRAMID_LAYOUT = Object.freeze({
    NEGATIVE_ONE_VALUE : -1.0,
    APEX_UV_U          : 0.5,
    APEX_UV_V          : 0.0
});

// Outward directions for the side faces, used by 'PyramidGeometry'
export const PYRAMID_DIRECTIONS = Object.freeze({
    FRONT : GEOMETRY_DIRECTIONS.POSITIVE_Z,
    RIGHT : GEOMETRY_DIRECTIONS.POSITIVE_X,
    BACK  : GEOMETRY_DIRECTIONS.NEGATIVE_Z,
    LEFT  : GEOMETRY_DIRECTIONS.NEGATIVE_X
});
