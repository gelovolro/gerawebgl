import * as SharedMaterialConstants from './material.js';

// GLSL sources
export const SOLID_COLOR_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.POSITION}) in vec3 a_position;
uniform mat4 ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX};

void main() {
    gl_Position = ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX} * vec4(a_position, 1.0);
}
`,

    FRAGMENT : `
#version 300 es
precision mediump float;
uniform vec3  ${SharedMaterialConstants.MATERIAL_UNIFORMS.COLOR};
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    outColor = vec4(${SharedMaterialConstants.MATERIAL_UNIFORMS.COLOR}, ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY});
}
`

});
