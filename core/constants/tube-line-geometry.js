// Supported cap types, used by 'TubeLineGeometry'
export const TUBE_LINE_CAP_TYPES = Object.freeze({
    NONE : 'none',
    FLAT : 'flat'
});

// Minimum accepted counts and values, used by 'TubeLineGeometry'
export const TUBE_LINE_LIMITS = Object.freeze({
    MIN_POINT_COUNT     : 2,
    MIN_RADIAL_SEGMENTS : 3
});

// Default options, used by 'TubeLineGeometry'
export const TUBE_LINE_DEFAULTS = Object.freeze({
    RADIUS          : 0.05,
    WIDTH           : null,
    RADIAL_SEGMENTS : 8,
    CLOSED          : false,
    CAP_TYPE        : TUBE_LINE_CAP_TYPES.NONE
});

// Validation and resource error messages, used by 'TubeLineGeometry'
export const TUBE_LINE_ERRORS = Object.freeze({
    INVALID_CAP_TYPE : 'TubeLineGeometry expects capType to be "none" or "flat".'
});

// Buffer layout and geometry construction values, used by 'TubeLineGeometry'
export const TUBE_LINE_LAYOUT = Object.freeze({
    NORMALIZE_EPSILON : 1e-8,
    CAP_CENTER_COUNT  : 2
});

// Normal components and fallback axes, used by 'TubeLineGeometry'
export const TUBE_LINE_NORMALS = Object.freeze({
    UP_AXIS_X              : 0,
    UP_AXIS_Y              : 1,
    UP_AXIS_Z              : 0,
    FALLBACK_AXIS_X        : 1,
    FALLBACK_AXIS_Y        : 0,
    FALLBACK_AXIS_Z        : 0,
    SECOND_FALLBACK_AXIS_X : 0,
    SECOND_FALLBACK_AXIS_Y : 0,
    SECOND_FALLBACK_AXIS_Z : 1
});
