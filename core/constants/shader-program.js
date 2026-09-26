// Uniform vector sizes that are not already defined in the shared math layout
export const SHADER_PROGRAM_LAYOUT = Object.freeze({
    VECTOR2_ELEMENT_COUNT : 2,
    VECTOR4_ELEMENT_COUNT : 4
});

// Default texture unit and matrix upload order, used by 'ShaderProgram'
export const SHADER_PROGRAM_DEFAULTS = Object.freeze({
    TEXTURE_UNIT_INDEX : 0,
    MATRIX_TRANSPOSE   : false
});

// Attribute lookup sentinel and minimum accepted texture unit index
export const SHADER_PROGRAM_LIMITS = Object.freeze({
    ATTRIBUTE_LOCATION_NOT_FOUND : -1,
    MIN_TEXTURE_UNIT_INDEX       :  0
});
