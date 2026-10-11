import * as DirectionalMaterialConstants from './directional-light-material.js';

// GLSL sources
export const LAMBERT_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
out vec3 v_normal;

void main() {
    gl_Position = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(a_position, 1.0);
    v_normal    = (${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
}
`,


    FRAGMENT : `
#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3  ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3  ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);

    if (!gl_FrontFacing) {
        surface_normal = -surface_normal;
    }

    vec3 light_direction    = normalize(${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    float diffuse_intensity = max(dot(surface_normal, light_direction), 0.0) * ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
    float lit_intensity     = clamp(${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH} + diffuse_intensity, 0.0, 1.0);
    float light_intensity   = mix(1.0, lit_intensity, ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED});
    outColor                = vec4(${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * light_intensity, ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY});
}
`

});
