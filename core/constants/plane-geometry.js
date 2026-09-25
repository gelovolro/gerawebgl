// Default options, used by 'PlaneGeometry'
export const PLANE_DEFAULTS = Object.freeze({
    WIDTH         : 1.0,
    HEIGHT        : 1.0,
    SEGMENT_COUNT : 1
});

// Minimum accepted counts and values, used by 'PlaneGeometry'
export const PLANE_LIMITS = Object.freeze({ MIN_SEGMENT_COUNT: 1 });

// Buffer layout and geometry construction values, used by 'PlaneGeometry'
export const PLANE_LAYOUT = Object.freeze({ Z_POSITION: 0.0 });

// Normal components and fallback axes, used by 'PlaneGeometry'
export const PLANE_NORMALS = Object.freeze({
    X : 0.0,
    Y : 0.0,
    Z : 1.0
});
