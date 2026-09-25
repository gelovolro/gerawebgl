// Default options, used by 'SphereGeometry'
export const SPHERE_DEFAULTS = Object.freeze({
    WIDTH           : 1.0,
    HEIGHT          : 1.0,
    DEPTH           : 1.0,
    WIDTH_SEGMENTS  : 24,
    HEIGHT_SEGMENTS : 16
});

// Minimum accepted counts and values, used by 'SphereGeometry'
export const SPHERE_LIMITS = Object.freeze({
    MIN_WIDTH_SEGMENT_COUNT  : 3,
    MIN_HEIGHT_SEGMENT_COUNT : 2
});
