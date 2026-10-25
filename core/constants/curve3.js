import { MATH_COMMON_VALUES } from './math.js';

// Default and minimum segment counts for 'Curve3' sampling
export const CURVE3_SAMPLING = Object.freeze({
    DEFAULT_SEGMENTS : 32,
    MIN_SEGMENTS     : MATH_COMMON_VALUES.UNIT,
    START_INDEX      : MATH_COMMON_VALUES.ZERO,
    INDEX_INCREMENT  : MATH_COMMON_VALUES.UNIT,
    START_PARAMETER  : MATH_COMMON_VALUES.ZERO,
    END_PARAMETER    : MATH_COMMON_VALUES.UNIT
});
