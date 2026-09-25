// Default options, used by 'ConeGeometry'
export const CONE_DEFAULTS = Object.freeze({
    WIDTH           : 1.0,
    HEIGHT          : 1.5,
    RADIAL_SEGMENTS : 24,
    HEIGHT_SEGMENTS : 1
});

// Minimum accepted counts and values, used by 'ConeGeometry'
export const CONE_LIMITS = Object.freeze({
    MIN_RADIAL_SEGMENT_COUNT : 3,
    MIN_HEIGHT_SEGMENT_COUNT : 1
});

// Normal components and fallback axes, used by 'ConeGeometry'
export const CONE_NORMALS = Object.freeze({
    X_ZERO : 0.0,
    Z_ZERO : 0.0,
    Y_UP   : 1.0,
    Y_DOWN : -1.0
});

// Buffer layout and geometry construction values, used by 'ConeGeometry'
export const CONE_LAYOUT = Object.freeze({
    ORIGIN            : 0.0,
    ZERO_VERTEX_COUNT : 0
});
