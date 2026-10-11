import * as SharedMaterialConstants from './material.js';

// Values used by 'NormalMaterial'
export const NORMAL_MATERIAL_VALUES = Object.freeze({
    NORMAL_COLOR_SCALE : 0.5,
    NORMAL_COLOR_BIAS  : 0.5
});

// GLSL sources
export const NORMAL_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.POSITION}) in vec3 a_position;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.NORMAL}) in vec3 a_normal;
uniform mat4 ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX};
out vec3 v_normal;

void main() {
    gl_Position = ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX} * vec4(a_position, 1.0);
    v_normal    = a_normal;
}
`,

    FRAGMENT : `
#version 300 es
precision mediump float;
in vec3 v_normal;
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec3 normalizedNormal = normalize(v_normal);
    vec3 normalColor      = (normalizedNormal * ${NORMAL_MATERIAL_VALUES.NORMAL_COLOR_SCALE}) + ${NORMAL_MATERIAL_VALUES.NORMAL_COLOR_BIAS};
    outColor              = vec4(normalColor, ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY});
}
`

});
