import { MATH_COMMON_VALUES } from './math.js';

// Default options and minimum control point count, used by 'Path3D'
export const PATH3D_DEFAULTS = Object.freeze({
    MIN_POINTS : 2,
    LOOP       : false
});

// Segment traversal indexes, reused by 'Path3D'
export const PATH3D_SEGMENTS = Object.freeze({
    START_INDEX     : MATH_COMMON_VALUES.ZERO,
    INDEX_INCREMENT : MATH_COMMON_VALUES.UNIT
});

// Minimum tangent length required for normalization, used by 'Path3D'
export const PATH3D_TANGENT = Object.freeze({ EPSILON: 1e-8 });
