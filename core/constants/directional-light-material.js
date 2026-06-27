// Vertex attribute locations, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES = Object.freeze({
    POSITION_LOCATION : 0,
    NORMAL_LOCATION   : 3
});

// Shader uniform names, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS = Object.freeze({
    FINAL_MATRIX                   : 'u_matrix',
    WORLD_INVERSE_TRANSPOSE_MATRIX : 'u_worldInverseTranspose',
    WORLD_MATRIX                   : 'u_worldMatrix',
    COLOR                          : 'u_color',
    LIGHT_DIRECTION                : 'u_lightDirection',
    CAMERA_POSITION                : 'u_cameraPosition',
    AMBIENT_STRENGTH               : 'u_ambientStrength',
    DIRECTIONAL_STRENGTH           : 'u_directionalStrength',
    LIGHTING_ENABLED               : 'u_lightingEnabled',
    OPACITY                        : 'u_opacity'
});

// Default RGB color, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR = Object.freeze([0.85, 0.85, 0.85]);

// Lighting control values, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_LIGHTING = Object.freeze({
    DEFAULT_LIGHTING_ENABLED    : 1.0,
    FLOAT_FALSE                 : 0.0,
    FLOAT_TRUE                  : 1.0,
    MIN_LIGHTING_ENABLED        : 0.0,
    MAX_LIGHTING_ENABLED        : 1.0,
    LIGHTING_ENABLED_THRESHOLD  : 0.5
});

// 'Vector3' element count, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT = 3;
