import * as SharedMaterialConstants from './material.js';

// Uniforms used by 'TexturedMaterial'
export const TEXTURED_MATERIAL_UNIFORMS = Object.freeze({ DIFFUSE_TEXTURE : 'u_diffuseTexture' });

// GLSL sources
export const TEXTURED_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.POSITION}) in vec3 a_position;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.UV}) in vec2 a_uv;
uniform mat4 ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX};
out vec2 v_uv;

void main() {
    gl_Position = ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX} * vec4(a_position, 1.0);
    v_uv        = a_uv;
}
`,

    FRAGMENT :
`#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D ${TEXTURED_MATERIAL_UNIFORMS.DIFFUSE_TEXTURE};
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec4 sampledColor = texture(${TEXTURED_MATERIAL_UNIFORMS.DIFFUSE_TEXTURE}, v_uv);
    outColor          = vec4(sampledColor.rgb, sampledColor.a * ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY});
}
`

});
