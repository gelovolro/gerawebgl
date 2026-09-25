import { MATH_LAYOUT } from './math.js';

// Axis directions shared by box faces and pyramid side normals
export const GEOMETRY_DIRECTIONS = Object.freeze({
    POSITIVE_X : Object.freeze([ 1.0,  0.0,  0.0]),
    NEGATIVE_X : Object.freeze([-1.0,  0.0,  0.0]),
    POSITIVE_Y : Object.freeze([ 0.0,  1.0,  0.0]),
    NEGATIVE_Y : Object.freeze([ 0.0, -1.0,  0.0]),
    POSITIVE_Z : Object.freeze([ 0.0,  0.0,  1.0]),
    NEGATIVE_Z : Object.freeze([ 0.0,  0.0, -1.0])
});

// Component counts for geometry buffers and primitive index lists
export const GEOMETRY_LAYOUT = Object.freeze({
    POSITION_COMPONENT_COUNT : MATH_LAYOUT.VECTOR3_ELEMENT_COUNT,
    NORMAL_COMPONENT_COUNT   : MATH_LAYOUT.VECTOR3_ELEMENT_COUNT,
    COLOR_COMPONENT_COUNT    : 3,
    UV_COMPONENT_COUNT       : 2,
    TRIANGLE_INDEX_COUNT     : 3,
    LINE_INDEX_COUNT         : 2
});

// RGB-component indexes, used when copying vertex colors
export const GEOMETRY_COLOR_INDEXES = Object.freeze({
    RED   : 0,
    GREEN : 1,
    BLUE  : 2
});

// Texture coordinate indexes in a UV-pair
export const GEOMETRY_UV_INDEXES = Object.freeze({ U: 0, V: 1 });

// Vertex positions within each triangle in a solid index buffer
export const GEOMETRY_TRIANGLE_INDEXES = Object.freeze({
    FIRST  : 0,
    SECOND : 1,
    THIRD  : 2
});

// Grid vertex counts, neighboring vertices and centering around the origin
export const GEOMETRY_GRID = Object.freeze({
    VERTEX_INCREMENT   : 1,
    NEXT_VERTEX_OFFSET : 1,
    CENTER_OFFSET      : 0.5
});

// UV-center and the upper bound, used to flip the V-coordinate
export const GEOMETRY_UV = Object.freeze({ CENTER: 0.5, V_FLIP_BASE: 1.0 });

// Conversion between full and half geometry dimensions
export const GEOMETRY_SIZES = Object.freeze({
    HALF_SIZE_DIVISOR      : 2.0,
    DOUBLE_SIZE_MULTIPLIER : 2.0
});

// Full rotation in radians, used by circular geometry generators
export const GEOMETRY_ANGLES = Object.freeze({ FULL_TURN: Math.PI * 2.0 });

// Shared optional buffer defaults and cap state for geometry generators
export const GEOMETRY_DEFAULTS = Object.freeze({
    COLORS            : null,
    UVS               : null,
    NORMALS           : null,
    WIREFRAME_INDICES : null,
    CAPPED            : true
});

// Initial RGB-components for the shared default vertex color
export const GEOMETRY_DEFAULT_VERTEX_COLOR = Object.freeze([1.0, 1.0, 1.0]);

// Shared white color, used when no explicit vertex colors are provided
export const DEFAULT_VERTEX_COLOR = new Float32Array(GEOMETRY_DEFAULT_VERTEX_COLOR);

// Buffer layout and geometry construction values, used by 'Geometry'
export const GEOMETRY_BUFFER_LAYOUT = Object.freeze({
    POSITION_ATTRIBUTE_LOCATION : 0,
    COLOR_ATTRIBUTE_LOCATION    : 1,
    UV_ATTRIBUTE_LOCATION       : 2,
    ATTRIBUTE_NORMALIZED        : false,
    ATTRIBUTE_NO_STRIDE         : 0,
    ATTRIBUTE_NO_OFFSET         : 0,
    NORMAL_ATTRIBUTE_LOCATION   : 3,
    MODULO_ALIGNED_VALUE        : 0,
    POSITION_START_INDEX        : 0,
    EMPTY_BOUND_COMPONENT       : 0.0,
    BOUND_MIN_INIT              : Number.POSITIVE_INFINITY,
    BOUND_MAX_INIT              : Number.NEGATIVE_INFINITY
});

// Validation and resource error messages, used by 'Geometry'
export const GEOMETRY_ERRORS = Object.freeze({
    INVALID_PRIMITIVE : 'Geometry expects the primitive options to use known primitive constants.'
});

// Triangle meshes
export const PRIMITIVE_TRIANGLES = 'triangles';

// Independent line segments
export const PRIMITIVE_LINES = 'lines';

// Connected line strips
export const PRIMITIVE_LINE_STRIP = 'line_strip';

// Closed line loops
export const PRIMITIVE_LINE_LOOP = 'line_loop';

// Point clouds
export const PRIMITIVE_POINTS = 'points';

// Default options, used by 'Geometry'
export const GEOMETRY_PRIMITIVE_DEFAULTS = Object.freeze({
    SOLID_PRIMITIVE     : PRIMITIVE_TRIANGLES,
    WIREFRAME_PRIMITIVE : PRIMITIVE_LINES
});

// Minimum accepted counts and values, used by 'Geometry'
export const GEOMETRY_LIMITS = Object.freeze({ MIN_LINE_STRIP_INDEX_COUNT: 2 });

// Primitive names accepted by geometry validation
export const SUPPORTED_PRIMITIVES = new Set([
    PRIMITIVE_TRIANGLES,
    PRIMITIVE_LINES,
    PRIMITIVE_LINE_STRIP,
    PRIMITIVE_LINE_LOOP,
    PRIMITIVE_POINTS
]);
