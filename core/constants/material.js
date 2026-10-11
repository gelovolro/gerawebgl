import { MATH_COMMON_VALUES }                                    from './math.js';
import { TEXTURE2D_LIMITS }                                      from './texture2d.js';
import { GEOMETRY_BUFFER_LAYOUT, GEOMETRY_DEFAULT_VERTEX_COLOR } from './geometry.js';

// Shared attribute locations kept in sync with the geometry buffer layout
export const MATERIAL_ATTRIBUTES = Object.freeze({
    POSITION : GEOMETRY_BUFFER_LAYOUT.POSITION_ATTRIBUTE_LOCATION,
    COLOR    : GEOMETRY_BUFFER_LAYOUT.COLOR_ATTRIBUTE_LOCATION,
    UV       : GEOMETRY_BUFFER_LAYOUT.UV_ATTRIBUTE_LOCATION,
    NORMAL   : GEOMETRY_BUFFER_LAYOUT.NORMAL_ATTRIBUTE_LOCATION
});

// Shared uniform names used by the material shaders and their upload methods
export const MATERIAL_UNIFORMS = Object.freeze({
    MATRIX            : 'u_matrix',
    COLOR             : 'u_color',
    OPACITY           : 'u_opacity',
    SPECULAR_COLOR    : 'u_specularColor',
    SPECULAR_STRENGTH : 'u_specularStrength',
    SHININESS         : 'u_shininess'
});

// Opacity limits and initial value, shared by all materials
export const MATERIAL_OPACITY = Object.freeze({
    MIN     : MATH_COMMON_VALUES.ZERO,
    MAX     : MATH_COMMON_VALUES.UNIT,
    DEFAULT : MATH_COMMON_VALUES.UNIT
});

// Shared ownership and wireframe defaults
export const MATERIAL_DEFAULTS = Object.freeze({
    OWNS_SHADER_PROGRAM           : false,
    OWNS_GENERATED_SHADER_PROGRAM : true,
    OWNS_TEXTURE                  : false,
    WIREFRAME_ENABLED             : false
});

// Shared boolean values uploaded to float uniforms
export const MATERIAL_BOOLEAN_FLOATS = Object.freeze({
    FALSE : MATH_COMMON_VALUES.ZERO,
    TRUE  : MATH_COMMON_VALUES.UNIT
});

// Shared specular settings used by 'PhongMaterial' and 'MtlStandardMaterial'
export const MATERIAL_SPECULAR_DEFAULTS = Object.freeze({
    STRENGTH  : MATH_COMMON_VALUES.UNIT,
    SHININESS : 16.0
});

// Shared texture unit defaults and the existing texture unit lower bound
export const MATERIAL_TEXTURE_UNITS = Object.freeze({
    DEFAULT : MATH_COMMON_VALUES.ZERO,
    MIN     : TEXTURE2D_LIMITS.MIN_TEXTURE_UNIT_INDEX
});

// Shared white RGB values copied into each material instance
export const MATERIAL_DEFAULT_COLOR = GEOMETRY_DEFAULT_VERTEX_COLOR;
