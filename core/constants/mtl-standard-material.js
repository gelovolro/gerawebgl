import * as SharedMaterialConstants      from './material.js';
import * as DirectionalMaterialConstants from './directional-light-material.js';

// Defaults used by 'MtlStandardMaterial'
export const MTL_STANDARD_MATERIAL_DEFAULTS = Object.freeze({
    EMISSIVE_COLOR            : Object.freeze([0.0, 0.0, 0.0]),
    OPTICAL_DENSITY           : 1.0,
    BUMP_MULTIPLIER           : 1.0,
    DISPLACEMENT_SCALE        : 0.1,
    UV_OFFSET                 : Object.freeze([0.0, 0.0]),
    UV_SCALE                  : Object.freeze([1.0, 1.0]),
    DIFFUSE_TEXTURE_UNIT      : 0,
    AMBIENT_TEXTURE_UNIT      : 1,
    SPECULAR_TEXTURE_UNIT     : 2,
    ALPHA_TEXTURE_UNIT        : 3,
    BUMP_TEXTURE_UNIT         : 4,
    DISPLACEMENT_TEXTURE_UNIT : 5,
    REFLECTION_TEXTURE_UNIT   : 6
});

// Uniforms used by 'MtlStandardMaterial'
export const MTL_STANDARD_MATERIAL_UNIFORMS = Object.freeze({
    DIFFUSE_MAP            : 'u_diffuseMap',
    AMBIENT_MAP            : 'u_ambientMap',
    SPECULAR_MAP           : 'u_specularMap',
    ALPHA_MAP              : 'u_alphaMap',
    BUMP_MAP               : 'u_bumpMap',
    DISPLACEMENT_MAP       : 'u_displacementMap',
    REFLECTION_MAP         : 'u_reflectionMap',
    AMBIENT_COLOR          : 'u_ambientColor',
    EMISSIVE_COLOR         : 'u_emissiveColor',
    SPECULAR_ENABLED       : 'u_useSpecular',
    OPTICAL_DENSITY        : 'u_opticalDensity',
    BUMP_MULTIPLIER        : 'u_bumpMultiplier',
    DISPLACEMENT_SCALE     : 'u_displacementScale',
    DIFFUSE_UV_OFFSET      : 'u_diffuseUvOffset',
    DIFFUSE_UV_SCALE       : 'u_diffuseUvScale',
    AMBIENT_UV_OFFSET      : 'u_ambientUvOffset',
    AMBIENT_UV_SCALE       : 'u_ambientUvScale',
    SPECULAR_UV_OFFSET     : 'u_specularUvOffset',
    SPECULAR_UV_SCALE      : 'u_specularUvScale',
    ALPHA_UV_OFFSET        : 'u_alphaUvOffset',
    ALPHA_UV_SCALE         : 'u_alphaUvScale',
    BUMP_UV_OFFSET         : 'u_bumpUvOffset',
    BUMP_UV_SCALE          : 'u_bumpUvScale',
    DISPLACEMENT_UV_OFFSET : 'u_displacementUvOffset',
    DISPLACEMENT_UV_SCALE  : 'u_displacementUvScale',
    REFLECTION_UV_OFFSET   : 'u_reflectionUvOffset',
    REFLECTION_UV_SCALE    : 'u_reflectionUvScale',
    USE_DIFFUSE_MAP        : 'u_useDiffuseMap',
    USE_AMBIENT_MAP        : 'u_useAmbientMap',
    USE_SPECULAR_MAP       : 'u_useSpecularMap',
    USE_ALPHA_MAP          : 'u_useAlphaMap',
    USE_BUMP_MAP           : 'u_useBumpMap',
    USE_DISPLACEMENT_MAP   : 'u_useDisplacementMap',
    USE_REFLECTION_MAP     : 'u_useReflectionMap'
});

// GLSL sources
export const MTL_STANDARD_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.UV}) in vec2 a_uv;
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX};
uniform mat4 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
uniform sampler2D ${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_MAP};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.USE_DISPLACEMENT_MAP};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_SCALE};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_UV_OFFSET};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_UV_SCALE};
out vec3 v_worldPosition;
out vec3 v_normal;
out vec2 v_uv;

void main() {
    vec2 disp_uv = (a_uv * ${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_UV_SCALE}) + ${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_UV_OFFSET};
    float displacement = 0.0;

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_DISPLACEMENT_MAP} > 0.5) {
        displacement = texture(${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_MAP}, disp_uv).r * ${MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_SCALE};
    }

    vec3 displaced_position = a_position + (a_normal * displacement);
    gl_Position             = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(displaced_position, 1.0);
    v_worldPosition         = (${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX} * vec4(displaced_position, 1.0)).xyz;
    v_normal                = (${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
    v_uv                    = a_uv;
}
`,


    FRAGMENT : `
#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
in vec2 v_uv;
uniform vec3 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3 ${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_COLOR};
uniform vec3 ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_COLOR};
uniform vec3 ${MTL_STANDARD_MATERIAL_UNIFORMS.EMISSIVE_COLOR};
uniform vec3 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform vec3 ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_STRENGTH};
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.SHININESS};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_ENABLED};
uniform float ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.OPTICAL_DENSITY};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_MULTIPLIER};
uniform sampler2D ${MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_MAP};
uniform sampler2D ${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_MAP};
uniform sampler2D ${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_MAP};
uniform sampler2D ${MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_MAP};
uniform sampler2D ${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_MAP};
uniform sampler2D ${MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_MAP};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_UV_OFFSET};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_UV_SCALE};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_UV_OFFSET};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_UV_SCALE};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_UV_OFFSET};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_UV_SCALE};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_UV_OFFSET};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_UV_SCALE};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_UV_OFFSET};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_UV_SCALE};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_UV_OFFSET};
uniform vec2 ${MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_UV_SCALE};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.USE_DIFFUSE_MAP};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.USE_AMBIENT_MAP};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.USE_SPECULAR_MAP};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.USE_ALPHA_MAP};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.USE_BUMP_MAP};
uniform float ${MTL_STANDARD_MATERIAL_UNIFORMS.USE_REFLECTION_MAP};
out vec4 outColor;

vec2 apply_uv(vec2 base_uv, vec2 offset, vec2 scale) {
    return (base_uv * scale) + offset;
}

vec3 compute_bump_normal(vec3 normal, vec2 uv) {
    vec3 tangent_normal = texture(${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_MAP}, uv).xyz * 2.0 - 1.0;
    tangent_normal.xy  *= ${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_MULTIPLIER};
    tangent_normal      = normalize(tangent_normal);

    vec3 dp1       = dFdx(v_worldPosition);
    vec3 dp2       = dFdy(v_worldPosition);
    vec2 duv1      = dFdx(uv);
    vec2 duv2      = dFdy(uv);
    vec3 tangent   = normalize(dp1 * duv2.y - dp2 * duv1.y);
    vec3 bitangent = normalize(-dp1 * duv2.x + dp2 * duv1.x);

    mat3 tbn = mat3(tangent, bitangent, normal);
    return normalize(tbn * tangent_normal);
}

vec2 compute_reflection_uv(vec3 normal, vec3 view_dir) {
    vec3 reflect_dir = reflect(-view_dir, normal);
    float uv_scale   = 2.0 * sqrt(
          reflect_dir.x * reflect_dir.x
        + reflect_dir.y * reflect_dir.y
        + (reflect_dir.z + 1.0) * (reflect_dir.z + 1.0)
    );

    return (reflect_dir.xy / uv_scale) + vec2(0.5, 0.5);
}

void main() {
    vec3 diffuse_color     = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
    vec3 diffuse_map_color = vec3(1.0);

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_DIFFUSE_MAP} > 0.5) {
        vec2 diff_uv      = apply_uv(v_uv, ${MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_UV_OFFSET}, ${MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_UV_SCALE});
        diffuse_map_color = texture(${MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_MAP}, diff_uv).rgb;
        diffuse_color    *= diffuse_map_color;
    }

    float alpha = ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_ALPHA_MAP} > 0.5) {
        vec2 alpha_uv = apply_uv(v_uv, ${MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_UV_OFFSET}, ${MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_UV_SCALE});
        alpha        *= texture(${MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_MAP}, alpha_uv).r;
    }

    if (${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED} <= ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.LIGHTING_ENABLED_THRESHOLD}) {
        vec3 unlit_color = diffuse_color;

        if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_DIFFUSE_MAP} > 0.5) {
            unlit_color = diffuse_map_color;
        }

        vec3 rgb = unlit_color + ${MTL_STANDARD_MATERIAL_UNIFORMS.EMISSIVE_COLOR};
        outColor = vec4(rgb, alpha);
        return;
    }

    vec3 normal         = normalize(v_normal);
    vec3 view_dir       = normalize(${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION} - v_worldPosition);
    vec3 ambient_tint   = ${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_COLOR};
    vec3 specular_color = ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_COLOR};

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_BUMP_MAP} > 0.5) {
        vec2 bump_uv = apply_uv(v_uv, ${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_UV_OFFSET}, ${MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_UV_SCALE});
        normal = compute_bump_normal(normal, bump_uv);
    }

    if (!gl_FrontFacing) {
        normal = -normal;
    }

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_AMBIENT_MAP} > 0.5) {
        vec2 amb_uv   = apply_uv(v_uv, ${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_UV_OFFSET}, ${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_UV_SCALE});
        ambient_tint *= texture(${MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_MAP}, amb_uv).rgb;
    }

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_SPECULAR_MAP} > 0.5) {
        vec2 spec_uv    = apply_uv(v_uv, ${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_UV_OFFSET}, ${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_UV_SCALE});
        specular_color *= texture(${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_MAP}, spec_uv).rgb;
    }

    float specular_intensity = 0.0;
    vec3 light_direction     = normalize(${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    float diffuse_intensity  = max(dot(normal, light_direction), 0.0);

    vec3 ambient = diffuse_color * ambient_tint * ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
    vec3 diffuse = diffuse_color * (diffuse_intensity * ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH});

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_ENABLED} > 0.5 && diffuse_intensity > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, normal);
        float specular_base       = max(dot(view_dir, reflection_direction), 0.0);
        specular_intensity        = pow(specular_base, ${SharedMaterialConstants.MATERIAL_UNIFORMS.SHININESS});
    }

    vec3 specular = specular_color
        * (specular_intensity * ${SharedMaterialConstants.MATERIAL_UNIFORMS.SPECULAR_STRENGTH}
        * ${DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH});

    vec3 emissive = ${MTL_STANDARD_MATERIAL_UNIFORMS.EMISSIVE_COLOR};
    vec3 rgb      = ambient + diffuse + specular + emissive;

    if (${MTL_STANDARD_MATERIAL_UNIFORMS.USE_REFLECTION_MAP} > 0.5) {
        vec2 refl_uv        = compute_reflection_uv(normal, view_dir);
        vec2 refl_uv_scaled = apply_uv(refl_uv, ${MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_UV_OFFSET}, ${MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_UV_SCALE});
        vec3 refl_color     = texture(${MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_MAP}, refl_uv_scaled).rgb;
        float refl_strength = clamp(${MTL_STANDARD_MATERIAL_UNIFORMS.OPTICAL_DENSITY} - 1.0, 0.0, 1.0);
        rgb                 = mix(rgb, refl_color, refl_strength);
    }

    outColor = vec4(rgb, alpha);
}
`

});

// Stable slots used to address each material-owned map state
export const MTL_STANDARD_MATERIAL_MAP_INDEXES = Object.freeze({
    DIFFUSE      : 0,
    AMBIENT      : 1,
    SPECULAR     : 2,
    ALPHA        : 3,
    BUMP         : 4,
    DISPLACEMENT : 5,
    REFLECTION   : 6
});

// Shared map layout used by initialization, validation and uniform uploads
export const MTL_STANDARD_MATERIAL_MAPS = Object.freeze([
    Object.freeze({
        CONTEXT      : '`MtlStandardMaterial.setDiffuseMap`',
        TEXTURE_UNIT : MTL_STANDARD_MATERIAL_DEFAULTS.DIFFUSE_TEXTURE_UNIT,
        SAMPLER      : MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_MAP,
        UV_OFFSET    : MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_UV_OFFSET,
        UV_SCALE     : MTL_STANDARD_MATERIAL_UNIFORMS.DIFFUSE_UV_SCALE,
        ENABLED      : MTL_STANDARD_MATERIAL_UNIFORMS.USE_DIFFUSE_MAP
    }),

    Object.freeze({
        CONTEXT      : '`MtlStandardMaterial.setAmbientMap`',
        TEXTURE_UNIT : MTL_STANDARD_MATERIAL_DEFAULTS.AMBIENT_TEXTURE_UNIT,
        SAMPLER      : MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_MAP,
        UV_OFFSET    : MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_UV_OFFSET,
        UV_SCALE     : MTL_STANDARD_MATERIAL_UNIFORMS.AMBIENT_UV_SCALE,
        ENABLED      : MTL_STANDARD_MATERIAL_UNIFORMS.USE_AMBIENT_MAP
    }),

    Object.freeze({
        CONTEXT      : '`MtlStandardMaterial.setSpecularMap`',
        TEXTURE_UNIT : MTL_STANDARD_MATERIAL_DEFAULTS.SPECULAR_TEXTURE_UNIT,
        SAMPLER      : MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_MAP,
        UV_OFFSET    : MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_UV_OFFSET,
        UV_SCALE     : MTL_STANDARD_MATERIAL_UNIFORMS.SPECULAR_UV_SCALE,
        ENABLED      : MTL_STANDARD_MATERIAL_UNIFORMS.USE_SPECULAR_MAP
    }),

    Object.freeze({
        CONTEXT      : '`MtlStandardMaterial.setAlphaMap`',
        TEXTURE_UNIT : MTL_STANDARD_MATERIAL_DEFAULTS.ALPHA_TEXTURE_UNIT,
        SAMPLER      : MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_MAP,
        UV_OFFSET    : MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_UV_OFFSET,
        UV_SCALE     : MTL_STANDARD_MATERIAL_UNIFORMS.ALPHA_UV_SCALE,
        ENABLED      : MTL_STANDARD_MATERIAL_UNIFORMS.USE_ALPHA_MAP
    }),

    Object.freeze({
        CONTEXT      : '`MtlStandardMaterial.setBumpMap`',
        TEXTURE_UNIT : MTL_STANDARD_MATERIAL_DEFAULTS.BUMP_TEXTURE_UNIT,
        SAMPLER      : MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_MAP,
        UV_OFFSET    : MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_UV_OFFSET,
        UV_SCALE     : MTL_STANDARD_MATERIAL_UNIFORMS.BUMP_UV_SCALE,
        ENABLED      : MTL_STANDARD_MATERIAL_UNIFORMS.USE_BUMP_MAP
    }),

    Object.freeze({
        CONTEXT      : '`MtlStandardMaterial.setDisplacementMap`',
        TEXTURE_UNIT : MTL_STANDARD_MATERIAL_DEFAULTS.DISPLACEMENT_TEXTURE_UNIT,
        SAMPLER      : MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_MAP,
        UV_OFFSET    : MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_UV_OFFSET,
        UV_SCALE     : MTL_STANDARD_MATERIAL_UNIFORMS.DISPLACEMENT_UV_SCALE,
        ENABLED      : MTL_STANDARD_MATERIAL_UNIFORMS.USE_DISPLACEMENT_MAP
    }),

    Object.freeze({
        CONTEXT      : '`MtlStandardMaterial.setReflectionMap`',
        TEXTURE_UNIT : MTL_STANDARD_MATERIAL_DEFAULTS.REFLECTION_TEXTURE_UNIT,
        SAMPLER      : MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_MAP,
        UV_OFFSET    : MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_UV_OFFSET,
        UV_SCALE     : MTL_STANDARD_MATERIAL_UNIFORMS.REFLECTION_UV_SCALE,
        ENABLED      : MTL_STANDARD_MATERIAL_UNIFORMS.USE_REFLECTION_MAP
    })
]);

// Labels used by color and UV validation errors
export const MTL_STANDARD_MATERIAL_CONTEXTS = Object.freeze({
    AMBIENT_COLOR  : '`MtlStandardMaterial.setAmbientColor`',
    SPECULAR_COLOR : '`MtlStandardMaterial.setSpecularColor`',
    EMISSIVE_COLOR : '`MtlStandardMaterial.setEmissiveColor`',
    UV_OFFSET      : ' options.uvOffset',
    UV_SCALE       : ' options.uvScale'
});
