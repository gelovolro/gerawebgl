import * as SharedMaterialConstants from './material.js';

// GLSL sources
export const VERTEX_COLOR_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.POSITION}) in vec3 a_position;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.COLOR}) in vec3 a_color;
uniform mat4 ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX};
out vec3 v_color;

void main() {
    gl_Position = ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX} * vec4(a_position, 1.0);
    v_color     = a_color;
}
`,

    FRAGMENT : `
#version 300 es
precision mediump float;
in vec3 v_color;
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    outColor = vec4(v_color, ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY});
}
`

});
