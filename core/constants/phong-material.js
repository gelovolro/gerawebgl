import * as SharedMaterialConstants      from './material.js';
import * as DirectionalMaterialConstants from './directional-light-material.js';

// GLSL sources
export const PHONG_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX};
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
out vec3 v_worldPosition;
out vec3 v_normal;

void main() {
    gl_Position     = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(a_position, 1.0);
    v_worldPosition = (${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX} * vec4(a_position, 1.0)).xyz;
    v_normal        = (${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
}
`,

    FRAGMENT : `
#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
uniform vec3  ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3  ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_COLOR};
uniform vec3  ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform vec3  ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_STRENGTH};
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.SHININESS};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);

    if (!gl_FrontFacing) {
        surface_normal = -surface_normal;
    }

    vec3 light_direction     = normalize(${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    vec3 view_direction      = normalize(${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION} - v_worldPosition);
    float lighting_enabled   = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
    float diffuse_intensity  = max(dot(surface_normal, light_direction), 0.0) * ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
    float specular_intensity = 0.0;

    if (diffuse_intensity > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, surface_normal);
        float specular_base       = max(dot(view_direction, reflection_direction), 0.0);
        specular_intensity        = pow(specular_base, ${SharedMaterialConstants.MATERIAL_UNIFORMS.SHININESS});
    }

    vec3 ambient  = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
    vec3 diffuse  = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * (diffuse_intensity * lighting_enabled);
    vec3 specular = ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_COLOR}
        * (specular_intensity * ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_STRENGTH}
        * ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH} * lighting_enabled);

    vec3 rgb = ambient + diffuse + specular;
    outColor = vec4(rgb, ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY});
}
`

});

// Method name used by the shared RGB validation
export const PHONG_MATERIAL_COLOR_CONTEXT = '`PhongMaterial.setSpecularColor`';
