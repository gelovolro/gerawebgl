import { MATH_LAYOUT } from './math.js';
import {
    MATERIAL_ATTRIBUTES,
    MATERIAL_UNIFORMS,
    MATERIAL_BOOLEAN_FLOATS
} from './material.js';

// Vertex attribute locations, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES = Object.freeze({
    POSITION_LOCATION : MATERIAL_ATTRIBUTES.POSITION,
    NORMAL_LOCATION   : MATERIAL_ATTRIBUTES.NORMAL
});

// Shader uniform names, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS = Object.freeze({
    FINAL_MATRIX                   : MATERIAL_UNIFORMS.MATRIX,
    WORLD_INVERSE_TRANSPOSE_MATRIX : 'u_worldInverseTranspose',
    WORLD_MATRIX                   : 'u_worldMatrix',
    COLOR                          : MATERIAL_UNIFORMS.COLOR,
    LIGHT_DIRECTION                : 'u_lightDirection',
    CAMERA_POSITION                : 'u_cameraPosition',
    AMBIENT_STRENGTH               : 'u_ambientStrength',
    DIRECTIONAL_STRENGTH           : 'u_directionalStrength',
    LIGHTING_ENABLED               : 'u_lightingEnabled',
    OPACITY                        : MATERIAL_UNIFORMS.OPACITY
});

// Default RGB color, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR = Object.freeze([0.85, 0.85, 0.85]);

// Lighting control values, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_LIGHTING = Object.freeze({
    DEFAULT_LIGHTING_ENABLED   : MATERIAL_BOOLEAN_FLOATS.TRUE,
    FLOAT_FALSE                : MATERIAL_BOOLEAN_FLOATS.FALSE,
    FLOAT_TRUE                 : MATERIAL_BOOLEAN_FLOATS.TRUE,
    MIN_LIGHTING_ENABLED       : MATERIAL_BOOLEAN_FLOATS.FALSE,
    MAX_LIGHTING_ENABLED       : MATERIAL_BOOLEAN_FLOATS.TRUE,
    LIGHTING_ENABLED_THRESHOLD : 0.5
});

// 'Vector3' element count, used by 'DirectionalLightMaterial'
export const DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT = MATH_LAYOUT.VECTOR3_ELEMENT_COUNT;

// Method names used in directional material validation messages
export const DIRECTIONAL_LIGHT_MATERIAL_CONTEXTS = Object.freeze({
    CONSTRUCTOR     : '`DirectionalLightMaterial`',
    COLOR           : '`DirectionalLightMaterial.setColor`',
    LIGHT_DIRECTION : '`DirectionalLightMaterial.setLightDirection`'
});

// Placeholder used by the existing directional message templates
export const DIRECTIONAL_LIGHT_MATERIAL_METHOD_TOKEN = '{methodName}';
