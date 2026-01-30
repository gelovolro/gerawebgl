import { ShaderProgram } from '../shader/shader-program.js';
import { Texture2D }     from '../texture/texture2d.js';
import {
    DirectionalLightMaterial,
    POSITION_ATTRIBUTE_LOCATION,
    NORMAL_ATTRIBUTE_LOCATION,
    FINAL_MATRIX_UNIFORM_NAME,
    WORLD_MATRIX_UNIFORM_NAME,
    WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME,
    COLOR_UNIFORM_NAME,
    LIGHT_DIRECTION_UNIFORM_NAME,
    CAMERA_POSITION_UNIFORM_NAME,
    AMBIENT_STRENGTH_UNIFORM_NAME,
    DIRECTIONAL_STRENGTH_UNIFORM_NAME,
    LIGHTING_ENABLED_UNIFORM_NAME,
    OPACITY_UNIFORM_NAME,
    VECTOR3_ELEMENT_COUNT
} from './directional-light-material.js';

/**
 * Attribute location used by `vec2` UV-coordinates.
 *
 * @type {number}
 */
const UV_ATTRIBUTE_LOCATION = 2;

/**
 * String literal for `typeof object` checks.
 *
 * @type {string}
 */
const TYPEOF_OBJECT = 'object';

/**
 * String literal for `typeof boolean` checks.
 *
 * @type {string}
 */
const TYPEOF_BOOLEAN = 'boolean';

/**
 * String literal for `typeof number` checks.
 *
 * @type {string}
 */
const TYPEOF_NUMBER = 'number';

/**
 * Diffuse map sampler uniform name.
 *
 * @type {string}
 */
const DIFFUSE_MAP_UNIFORM_NAME = 'u_diffuseMap';

/**
 * Ambient map sampler uniform name.
 *
 * @type {string}
 */
const AMBIENT_MAP_UNIFORM_NAME = 'u_ambientMap';

/**
 * Specular map sampler uniform name.
 *
 * @type {string}
 */
const SPECULAR_MAP_UNIFORM_NAME = 'u_specularMap';

/**
 * Alpha map sampler uniform name.
 *
 * @type {string}
 */
const ALPHA_MAP_UNIFORM_NAME = 'u_alphaMap';

/**
 * Bump map sampler uniform name.
 *
 * @type {string}
 */
const BUMP_MAP_UNIFORM_NAME = 'u_bumpMap';

/**
 * Displacement map sampler uniform name.
 *
 * @type {string}
 */
const DISPLACEMENT_MAP_UNIFORM_NAME = 'u_displacementMap';

/**
 * Reflection map sampler uniform name.
 *
 * @type {string}
 */
const REFLECTION_MAP_UNIFORM_NAME = 'u_reflectionMap';

/**
 * Ambient color uniform name.
 *
 * @type {string}
 */
const AMBIENT_COLOR_UNIFORM_NAME = 'u_ambientColor';

/**
 * Specular color uniform name.
 *
 * @type {string}
 */
const SPECULAR_COLOR_UNIFORM_NAME = 'u_specularColor';

/**
 * Emissive color uniform name.
 *
 * @type {string}
 */
const EMISSIVE_COLOR_UNIFORM_NAME = 'u_emissiveColor';

/**
 * Specular strength uniform name.
 *
 * @type {string}
 */
const SPECULAR_STRENGTH_UNIFORM_NAME = 'u_specularStrength';

/**
 * Shininess uniform name.
 *
 * @type {string}
 */
const SHININESS_UNIFORM_NAME = 'u_shininess';

/**
 * Specular enable uniform name.
 *
 * @type {string}
 */
const SPECULAR_ENABLED_UNIFORM_NAME = 'u_useSpecular';

/**
 * Optical density uniform name.
 *
 * @type {string}
 */
const OPTICAL_DENSITY_UNIFORM_NAME = 'u_opticalDensity';

/**
 * Bump multiplier uniform name.
 *
 * @type {string}
 */
const BUMP_MULTIPLIER_UNIFORM_NAME = 'u_bumpMultiplier';

/**
 * Displacement scale uniform name.
 *
 * @type {string}
 */
const DISPLACEMENT_SCALE_UNIFORM_NAME = 'u_displacementScale';

/**
 * Diffuse UV-offset uniform name.
 *
 * @type {string}
 */
const DIFFUSE_UV_OFFSET_UNIFORM_NAME = 'u_diffuseUvOffset';

/**
 * Diffuse UV-scale uniform name.
 *
 * @type {string}
 */
const DIFFUSE_UV_SCALE_UNIFORM_NAME = 'u_diffuseUvScale';

/**
 * Ambient UV-offset uniform name.
 *
 * @type {string}
 */
const AMBIENT_UV_OFFSET_UNIFORM_NAME = 'u_ambientUvOffset';

/**
 * Ambient UV-scale uniform name.
 *
 * @type {string}
 */
const AMBIENT_UV_SCALE_UNIFORM_NAME = 'u_ambientUvScale';

/**
 * Specular UV-offset uniform name.
 *
 * @type {string}
 */
const SPECULAR_UV_OFFSET_UNIFORM_NAME = 'u_specularUvOffset';

/**
 * Specular UV-scale uniform name.
 *
 * @type {string}
 */
const SPECULAR_UV_SCALE_UNIFORM_NAME = 'u_specularUvScale';

/**
 * Alpha UV-offset uniform name.
 *
 * @type {string}
 */
const ALPHA_UV_OFFSET_UNIFORM_NAME = 'u_alphaUvOffset';

/**
 * Alpha UV-scale uniform name.
 *
 * @type {string}
 */
const ALPHA_UV_SCALE_UNIFORM_NAME = 'u_alphaUvScale';

/**
 * Bump UV-offset uniform name.
 *
 * @type {string}
 */
const BUMP_UV_OFFSET_UNIFORM_NAME = 'u_bumpUvOffset';

/**
 * Bump UV-scale uniform name.
 *
 * @type {string}
 */
const BUMP_UV_SCALE_UNIFORM_NAME = 'u_bumpUvScale';

/**
 * Displacement UV-offset uniform name.
 *
 * @type {string}
 */
const DISPLACEMENT_UV_OFFSET_UNIFORM_NAME = 'u_displacementUvOffset';

/**
 * Displacement UV-scale uniform name.
 *
 * @type {string}
 */
const DISPLACEMENT_UV_SCALE_UNIFORM_NAME = 'u_displacementUvScale';

/**
 * Reflection UV-offset uniform name.
 *
 * @type {string}
 */
const REFLECTION_UV_OFFSET_UNIFORM_NAME = 'u_reflectionUvOffset';

/**
 * Reflection UV-scale uniform name.
 *
 * @type {string}
 */
const REFLECTION_UV_SCALE_UNIFORM_NAME = 'u_reflectionUvScale';

/**
 * Diffuse map usage uniform name.
 *
 * @type {string}
 */
const USE_DIFFUSE_MAP_UNIFORM_NAME = 'u_useDiffuseMap';

/**
 * Ambient map usage uniform name.
 *
 * @type {string}
 */
const USE_AMBIENT_MAP_UNIFORM_NAME = 'u_useAmbientMap';

/**
 * Specular map usage uniform name.
 *
 * @type {string}
 */
const USE_SPECULAR_MAP_UNIFORM_NAME = 'u_useSpecularMap';

/**
 * Alpha map usage uniform name.
 *
 * @type {string}
 */
const USE_ALPHA_MAP_UNIFORM_NAME = 'u_useAlphaMap';

/**
 * Bump map usage uniform name.
 *
 * @type {string}
 */
const USE_BUMP_MAP_UNIFORM_NAME = 'u_useBumpMap';

/**
 * Displacement map usage uniform name.
 *
 * @type {string}
 */
const USE_DISPLACEMENT_MAP_UNIFORM_NAME = 'u_useDisplacementMap';

/**
 * Reflection map usage uniform name.
 *
 * @type {string}
 */
const USE_REFLECTION_MAP_UNIFORM_NAME = 'u_useReflectionMap';

/**
 * Threshold used to interpret lighting enabled values in shaders.
 *
 * @type {number}
 */
const LIGHTING_ENABLED_THRESHOLD = 0.5;

/**
 * Default diffuse color.
 *
 * @type {Float32Array}
 */
const DEFAULT_DIFFUSE_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default ambient color.
 *
 * @type {Float32Array}
 */
const DEFAULT_AMBIENT_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default specular color.
 *
 * @type {Float32Array}
 */
const DEFAULT_SPECULAR_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default emissive color.
 *
 * @type {Float32Array}
 */
const DEFAULT_EMISSIVE_COLOR = new Float32Array([0.0, 0.0, 0.0]);

/**
 * Default shininess value.
 *
 * @type {number}
 */
const DEFAULT_SHININESS = 16.0;

/**
 * Default specular strength multiplier.
 *
 * @type {number}
 */
const DEFAULT_SPECULAR_STRENGTH = 1.0;

/**
 * Default optical density value.
 *
 * @type {number}
 */
const DEFAULT_OPTICAL_DENSITY = 1.0;

/**
 * Default bump multiplier.
 *
 * @type {number}
 */
const DEFAULT_BUMP_MULTIPLIER = 1.0;

/**
 * Default displacement scale factor.
 *
 * @type {number}
 */
const DEFAULT_DISPLACEMENT_SCALE = 0.1;

/**
 * Default UV offset.
 *
 * @type {Float32Array}
 */
const DEFAULT_UV_OFFSET = new Float32Array([0.0, 0.0]);

/**
 * Default UV scale.
 *
 * @type {Float32Array}
 */
const DEFAULT_UV_SCALE = new Float32Array([1.0, 1.0]);

/**
 * Boolean-as-float value for false.
 *
 * @type {number}
 */
const FLOAT_FALSE = 0.0;

/**
 * Boolean-as-float value for true.
 *
 * @type {number}
 */
const FLOAT_TRUE = 1.0;

/**
 * Default texture unit for diffuse map.
 *
 * @type {number}
 */
const DEFAULT_DIFFUSE_TEXTURE_UNIT = 0;

/**
 * Default texture unit for ambient map.
 *
 * @type {number}
 */
const DEFAULT_AMBIENT_TEXTURE_UNIT = 1;

/**
 * Default texture unit for specular map.
 *
 * @type {number}
 */
const DEFAULT_SPECULAR_TEXTURE_UNIT = 2;

/**
 * Default texture unit for alpha map.
 *
 * @type {number}
 */
const DEFAULT_ALPHA_TEXTURE_UNIT = 3;

/**
 * Default texture unit for bump map.
 *
 * @type {number}
 */
const DEFAULT_BUMP_TEXTURE_UNIT = 4;

/**
 * Default texture unit for displacement map.
 *
 * @type {number}
 */
const DEFAULT_DISPLACEMENT_TEXTURE_UNIT = 5;

/**
 * Default texture unit for reflection map.
 *
 * @type {number}
 */
const DEFAULT_REFLECTION_TEXTURE_UNIT = 6;

/**
 * Zero value used for comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0.0;

/**
 * Error message for invalid material options.
 *
 * @type {string}
 */
const ERROR_OPTIONS_OBJECT = '`MtlStandardMaterial` expects an options object (plain object).';

/**
 * Error message for invalid shininess value.
 *
 * @type {string}
 */
const ERROR_SHININESS_TYPE = '`MtlStandardMaterial.setShininess` expects a finite number.';

/**
 * Error message for invalid specular strength value.
 *
 * @type {string}
 */
const ERROR_SPECULAR_STRENGTH_TYPE = '`MtlStandardMaterial.setSpecularStrength` expects a finite number.';

/**
 * Error message for invalid specular enabled flag.
 *
 * @type {string}
 */
const ERROR_SPECULAR_ENABLED_TYPE = '`MtlStandardMaterial.setSpecularEnabled` expects a boolean.';

/**
 * Error message for invalid optical density value.
 *
 * @type {string}
 */
const ERROR_OPTICAL_DENSITY_TYPE = '`MtlStandardMaterial.setOpticalDensity` expects a finite number.';

/**
 * Error message for invalid bump multiplier value.
 *
 * @type {string}
 */
const ERROR_BUMP_MULTIPLIER_TYPE = '`MtlStandardMaterial.setBumpMultiplier` expects a finite number.';

/**
 * Error message for invalid displacement scale value.
 *
 * @type {string}
 */
const ERROR_DISPLACEMENT_SCALE_TYPE = '`MtlStandardMaterial.setDisplacementScale` expects a finite number.';

/**
 * Error suffix for texture type validation.
 *
 * @type {string}
 */
const ERROR_EXPECTS_TEXTURE_SUFFIX = ' expects texture as Texture2D.';

/**
 * Error suffix for options object validation.
 *
 * @type {string}
 */
const ERROR_EXPECTS_OPTIONS_OBJECT_SUFFIX = ' expects options as a plain object.';

/**
 * Error suffix for texture unit index validation.
 *
 * @type {string}
 */
const ERROR_EXPECTS_TEXTURE_UNIT_INDEX_SUFFIX = ' expects options.textureUnitIndex as a non-negative integer.';

/**
 * Error suffix for vector2 type validation.
 *
 * @type {string}
 */
const ERROR_EXPECTS_VECTOR2_TYPE_SUFFIX = ' expects a number[] or Float32Array.';

/**
 * Error suffix for vector2 component validation.
 *
 * @type {string}
 */
const ERROR_EXPECTS_VECTOR2_COMPONENTS_SUFFIX = ' expects exactly 2 components.';

/**
 * Error suffix for vector3 component validation.
 *
 * @type {string}
 */
const ERROR_EXPECTS_VECTOR3_COMPONENTS_SUFFIX = ' expects exactly 3 components.';

/**
 * GLSL vertex shader source code.
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION}) in vec3 a_normal;
layout(location = ${UV_ATTRIBUTE_LOCATION}) in vec2 a_uv;
uniform mat4 ${FINAL_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME};
uniform sampler2D ${DISPLACEMENT_MAP_UNIFORM_NAME};
uniform float ${USE_DISPLACEMENT_MAP_UNIFORM_NAME};
uniform float ${DISPLACEMENT_SCALE_UNIFORM_NAME};
uniform vec2 ${DISPLACEMENT_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${DISPLACEMENT_UV_SCALE_UNIFORM_NAME};
out vec3 v_worldPosition;
out vec3 v_normal;
out vec2 v_uv;

void main() {
    vec2 disp_uv = (a_uv * ${DISPLACEMENT_UV_SCALE_UNIFORM_NAME}) + ${DISPLACEMENT_UV_OFFSET_UNIFORM_NAME};
    float displacement = 0.0;

    if (${USE_DISPLACEMENT_MAP_UNIFORM_NAME} > 0.5) {
        displacement = texture(${DISPLACEMENT_MAP_UNIFORM_NAME}, disp_uv).r * ${DISPLACEMENT_SCALE_UNIFORM_NAME};
    }

    vec3 displaced_position = a_position + (a_normal * displacement);
    gl_Position = ${FINAL_MATRIX_UNIFORM_NAME} * vec4(displaced_position, 1.0);
    v_worldPosition = (${WORLD_MATRIX_UNIFORM_NAME} * vec4(displaced_position, 1.0)).xyz;
    v_normal = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME} * vec4(a_normal, 0.0)).xyz;
    v_uv = a_uv;
}
`;

/**
 * GLSL fragment shader source code.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
in vec2 v_uv;
uniform vec3 ${COLOR_UNIFORM_NAME};
uniform vec3 ${AMBIENT_COLOR_UNIFORM_NAME};
uniform vec3 ${SPECULAR_COLOR_UNIFORM_NAME};
uniform vec3 ${EMISSIVE_COLOR_UNIFORM_NAME};
uniform vec3 ${LIGHT_DIRECTION_UNIFORM_NAME};
uniform vec3 ${CAMERA_POSITION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME};
uniform float ${DIRECTIONAL_STRENGTH_UNIFORM_NAME};
uniform float ${LIGHTING_ENABLED_UNIFORM_NAME};
uniform float ${SPECULAR_STRENGTH_UNIFORM_NAME};
uniform float ${SHININESS_UNIFORM_NAME};
uniform float ${SPECULAR_ENABLED_UNIFORM_NAME};
uniform float ${OPACITY_UNIFORM_NAME};
uniform float ${OPTICAL_DENSITY_UNIFORM_NAME};
uniform float ${BUMP_MULTIPLIER_UNIFORM_NAME};
uniform sampler2D ${DIFFUSE_MAP_UNIFORM_NAME};
uniform sampler2D ${AMBIENT_MAP_UNIFORM_NAME};
uniform sampler2D ${SPECULAR_MAP_UNIFORM_NAME};
uniform sampler2D ${ALPHA_MAP_UNIFORM_NAME};
uniform sampler2D ${BUMP_MAP_UNIFORM_NAME};
uniform sampler2D ${REFLECTION_MAP_UNIFORM_NAME};
uniform vec2 ${DIFFUSE_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${DIFFUSE_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${AMBIENT_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${AMBIENT_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${SPECULAR_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${SPECULAR_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${ALPHA_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${ALPHA_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${BUMP_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${BUMP_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${REFLECTION_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${REFLECTION_UV_SCALE_UNIFORM_NAME};
uniform float ${USE_DIFFUSE_MAP_UNIFORM_NAME};
uniform float ${USE_AMBIENT_MAP_UNIFORM_NAME};
uniform float ${USE_SPECULAR_MAP_UNIFORM_NAME};
uniform float ${USE_ALPHA_MAP_UNIFORM_NAME};
uniform float ${USE_BUMP_MAP_UNIFORM_NAME};
uniform float ${USE_REFLECTION_MAP_UNIFORM_NAME};
out vec4 outColor;

vec2 apply_uv(vec2 base_uv, vec2 offset, vec2 scale) {
    return (base_uv * scale) + offset;
}

vec3 compute_bump_normal(vec3 normal, vec2 uv) {
    vec3 tangent_normal = texture(${BUMP_MAP_UNIFORM_NAME}, uv).xyz * 2.0 - 1.0;
    tangent_normal.xy *= ${BUMP_MULTIPLIER_UNIFORM_NAME};
    tangent_normal = normalize(tangent_normal);

    vec3 dp1 = dFdx(v_worldPosition);
    vec3 dp2 = dFdy(v_worldPosition);
    vec2 duv1 = dFdx(uv);
    vec2 duv2 = dFdy(uv);
    vec3 tangent = normalize(dp1 * duv2.y - dp2 * duv1.y);
    vec3 bitangent = normalize(-dp1 * duv2.x + dp2 * duv1.x);
    mat3 tbn = mat3(tangent, bitangent, normal);
    return normalize(tbn * tangent_normal);
}

vec2 compute_reflection_uv(vec3 normal, vec3 view_dir) {
    vec3 reflect_dir = reflect(-view_dir, normal);
    float m = 2.0 * sqrt(reflect_dir.x * reflect_dir.x
        + reflect_dir.y * reflect_dir.y
        + (reflect_dir.z + 1.0) * (reflect_dir.z + 1.0));
    return (reflect_dir.xy / m) + vec2(0.5, 0.5);
}

void main() {
    vec3 diffuse_color = ${COLOR_UNIFORM_NAME};
    vec3 diffuse_map_color = vec3(1.0);
    if (${USE_DIFFUSE_MAP_UNIFORM_NAME} > 0.5) {
        vec2 diff_uv = apply_uv(v_uv, ${DIFFUSE_UV_OFFSET_UNIFORM_NAME}, ${DIFFUSE_UV_SCALE_UNIFORM_NAME});
        diffuse_map_color = texture(${DIFFUSE_MAP_UNIFORM_NAME}, diff_uv).rgb;
        diffuse_color *= diffuse_map_color;
    }

    float alpha = ${OPACITY_UNIFORM_NAME};
    if (${USE_ALPHA_MAP_UNIFORM_NAME} > 0.5) {
        vec2 alpha_uv = apply_uv(v_uv, ${ALPHA_UV_OFFSET_UNIFORM_NAME}, ${ALPHA_UV_SCALE_UNIFORM_NAME});
        alpha *= texture(${ALPHA_MAP_UNIFORM_NAME}, alpha_uv).r;
    }

    if (${LIGHTING_ENABLED_UNIFORM_NAME} <= ${LIGHTING_ENABLED_THRESHOLD}) {
        vec3 unlit_color = diffuse_color;
        if (${USE_DIFFUSE_MAP_UNIFORM_NAME} > 0.5) {
            unlit_color = diffuse_map_color;
        }
        vec3 rgb = unlit_color + ${EMISSIVE_COLOR_UNIFORM_NAME};
        outColor = vec4(rgb, alpha);
        return;
    }

    vec3 normal = normalize(v_normal);
    vec3 view_dir = normalize(${CAMERA_POSITION_UNIFORM_NAME} - v_worldPosition);

    if (${USE_BUMP_MAP_UNIFORM_NAME} > 0.5) {
        vec2 bump_uv = apply_uv(v_uv, ${BUMP_UV_OFFSET_UNIFORM_NAME}, ${BUMP_UV_SCALE_UNIFORM_NAME});
        normal = compute_bump_normal(normal, bump_uv);
    }

    if (!gl_FrontFacing) {
        normal = -normal;
    }

    vec3 ambient_tint = ${AMBIENT_COLOR_UNIFORM_NAME};
    if (${USE_AMBIENT_MAP_UNIFORM_NAME} > 0.5) {
        vec2 amb_uv = apply_uv(v_uv, ${AMBIENT_UV_OFFSET_UNIFORM_NAME}, ${AMBIENT_UV_SCALE_UNIFORM_NAME});
        ambient_tint *= texture(${AMBIENT_MAP_UNIFORM_NAME}, amb_uv).rgb;
    }

    vec3 specular_color = ${SPECULAR_COLOR_UNIFORM_NAME};
    if (${USE_SPECULAR_MAP_UNIFORM_NAME} > 0.5) {
        vec2 spec_uv = apply_uv(v_uv, ${SPECULAR_UV_OFFSET_UNIFORM_NAME}, ${SPECULAR_UV_SCALE_UNIFORM_NAME});
        specular_color *= texture(${SPECULAR_MAP_UNIFORM_NAME}, spec_uv).rgb;
    }

    vec3 light_direction = normalize(${LIGHT_DIRECTION_UNIFORM_NAME});
    float diffuse_intensity = max(dot(normal, light_direction), 0.0);
    vec3 ambient = diffuse_color * ambient_tint * ${AMBIENT_STRENGTH_UNIFORM_NAME};
    vec3 diffuse = diffuse_color * (diffuse_intensity * ${DIRECTIONAL_STRENGTH_UNIFORM_NAME});

    float specular_intensity = 0.0;
    if (${SPECULAR_ENABLED_UNIFORM_NAME} > 0.5 && diffuse_intensity > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, normal);
        float specular_base = max(dot(view_dir, reflection_direction), 0.0);
        specular_intensity = pow(specular_base, ${SHININESS_UNIFORM_NAME});
    }

    vec3 specular = specular_color * (specular_intensity * ${SPECULAR_STRENGTH_UNIFORM_NAME}
        * ${DIRECTIONAL_STRENGTH_UNIFORM_NAME});
    vec3 emissive = ${EMISSIVE_COLOR_UNIFORM_NAME};
    vec3 rgb = ambient + diffuse + specular + emissive;

    if (${USE_REFLECTION_MAP_UNIFORM_NAME} > 0.5) {
        vec2 refl_uv = compute_reflection_uv(normal, view_dir);
        vec2 refl_uv_scaled = apply_uv(refl_uv, ${REFLECTION_UV_OFFSET_UNIFORM_NAME}, ${REFLECTION_UV_SCALE_UNIFORM_NAME});
        vec3 refl_color = texture(${REFLECTION_MAP_UNIFORM_NAME}, refl_uv_scaled).rgb;
        float refl_strength = clamp(${OPTICAL_DENSITY_UNIFORM_NAME} - 1.0, 0.0, 1.0);
        rgb = mix(rgb, refl_color, refl_strength);
    }

    outColor = vec4(rgb, alpha);
}
`;

/**
 * Options used by `MtlStandardMaterial`.
 *
 * @typedef {Object} MtlStandardMaterialOptions
 * @property {Float32Array | number[]} [diffuseColor]  - Diffuse RGB color in 0..1 range.
 * @property {Float32Array | number[]} [ambientColor]  - Ambient RGB color in 0..1 range.
 * @property {Float32Array | number[]} [specularColor] - Specular RGB color in 0..1 range.
 * @property {Float32Array | number[]} [emissiveColor] - Emissive RGB color in 0..1 range.
 * @property {Float32Array | number[]} [lightDirection]- Directional light direction (world space).
 * @property {number} [ambientStrength]                - Ambient strength multiplier.
 * @property {number} [shininess]                       - Specular exponent.
 * @property {number} [specularStrength]                - Specular strength multiplier.
 * @property {number} [opticalDensity]                  - Optical density used for reflection blending.
 */

/**
 * Texture map setter options.
 *
 * @typedef {Object} MtlStandardMaterialMapOptions
 * @property {number} [textureUnitIndex]          - Texture unit index.
 * @property {Float32Array | number[]} [uvOffset] - UV-offset vector.
 * @property {Float32Array | number[]} [uvScale]  - UV-scale vector.
 */

/**
 * Material for MTL assets with multiple texture maps and Phong lighting.
 */
export class MtlStandardMaterial extends DirectionalLightMaterial {

    /**
     * Fallback texture used, when a map is not assigned.
     *
     * @type {Texture2D}
     * @private
     */
    #fallbackTexture;

    /**
     * Diffuse texture.
     *
     * @type {Texture2D}
     * @private
     */
    #diffuseTexture;

    /**
     * Ambient texture.
     *
     * @type {Texture2D}
     * @private
     */
    #ambientTexture;

    /**
     * Specular texture.
     *
     * @type {Texture2D}
     * @private
     */
    #specularTexture;

    /**
     * Alpha texture.
     *
     * @type {Texture2D}
     * @private
     */
    #alphaTexture;

    /**
     * Bump texture.
     *
     * @type {Texture2D}
     * @private
     */
    #bumpTexture;

    /**
     * Displacement texture.
     *
     * @type {Texture2D}
     * @private
     */
    #displacementTexture;

    /**
     * Reflection texture.
     *
     * @type {Texture2D}
     * @private
     */
    #reflectionTexture;

    /**
     * Diffuse texture unit index.
     *
     * @type {number}
     * @private
     */
    #diffuseTextureUnit = DEFAULT_DIFFUSE_TEXTURE_UNIT;

    /**
     * Ambient texture unit index.
     *
     * @type {number}
     * @private
     */
    #ambientTextureUnit = DEFAULT_AMBIENT_TEXTURE_UNIT;

    /**
     * Specular texture unit index.
     *
     * @type {number}
     * @private
     */
    #specularTextureUnit = DEFAULT_SPECULAR_TEXTURE_UNIT;

    /**
     * Alpha texture unit index.
     *
     * @type {number}
     * @private
     */
    #alphaTextureUnit = DEFAULT_ALPHA_TEXTURE_UNIT;

    /**
     * Bump texture unit index.
     *
     * @type {number}
     * @private
     */
    #bumpTextureUnit = DEFAULT_BUMP_TEXTURE_UNIT;

    /**
     * Displacement texture unit index.
     *
     * @type {number}
     * @private
     */
    #displacementTextureUnit = DEFAULT_DISPLACEMENT_TEXTURE_UNIT;

    /**
     * Reflection texture unit index.
     *
     * @type {number}
     * @private
     */
    #reflectionTextureUnit = DEFAULT_REFLECTION_TEXTURE_UNIT;

    /**
     * Ambient color.
     *
     * @type {Float32Array}
     * @private
     */
    #ambientColor = new Float32Array(DEFAULT_AMBIENT_COLOR);

    /**
     * Specular color.
     *
     * @type {Float32Array}
     * @private
     */
    #specularColor = new Float32Array(DEFAULT_SPECULAR_COLOR);

    /**
     * Emissive color.
     *
     * @type {Float32Array}
     * @private
     */
    #emissiveColor = new Float32Array(DEFAULT_EMISSIVE_COLOR);

    /**
     * Shininess exponent.
     *
     * @type {number}
     * @private
     */
    #shininess = DEFAULT_SHININESS;

    /**
     * Specular strength multiplier.
     *
     * @type {number}
     * @private
     */
    #specularStrength = DEFAULT_SPECULAR_STRENGTH;

    /**
     * Optical density value.
     *
     * @type {number}
     * @private
     */
    #opticalDensity = DEFAULT_OPTICAL_DENSITY;

    /**
     * Bump multiplier.
     *
     * @type {number}
     * @private
     */
    #bumpMultiplier = DEFAULT_BUMP_MULTIPLIER;

    /**
     * Displacement scale factor.
     *
     * @type {number}
     * @private
     */
    #displacementScale = DEFAULT_DISPLACEMENT_SCALE;

    /**
     * Flag, controlling the specular lighting.
     *
     * @type {boolean}
     * @private
     */
    #specularEnabled = true;

    /**
     * Diffuse UV-offset.
     *
     * @type {Float32Array}
     * @private
     */
    #diffuseUvOffset = new Float32Array(DEFAULT_UV_OFFSET);

    /**
     * Diffuse UV-scale.
     *
     * @type {Float32Array}
     * @private
     */
    #diffuseUvScale = new Float32Array(DEFAULT_UV_SCALE);

    /**
     * Ambient UV-offset.
     *
     * @type {Float32Array}
     * @private
     */
    #ambientUvOffset = new Float32Array(DEFAULT_UV_OFFSET);

    /**
     * Ambient UV-scale.
     *
     * @type {Float32Array}
     * @private
     */
    #ambientUvScale = new Float32Array(DEFAULT_UV_SCALE);

    /**
     * Specular UV-offset.
     *
     * @type {Float32Array}
     * @private
     */
    #specularUvOffset = new Float32Array(DEFAULT_UV_OFFSET);

    /**
     * Specular UV-scale.
     *
     * @type {Float32Array}
     * @private
     */
    #specularUvScale = new Float32Array(DEFAULT_UV_SCALE);

    /**
     * Alpha UV-offset.
     *
     * @type {Float32Array}
     * @private
     */
    #alphaUvOffset = new Float32Array(DEFAULT_UV_OFFSET);

    /**
     * Alpha UV-scale.
     *
     * @type {Float32Array}
     * @private
     */
    #alphaUvScale = new Float32Array(DEFAULT_UV_SCALE);

    /**
     * Bump UV-offset.
     *
     * @type {Float32Array}
     * @private
     */
    #bumpUvOffset = new Float32Array(DEFAULT_UV_OFFSET);

    /**
     * Bump UV-scale.
     *
     * @type {Float32Array}
     * @private
     */
    #bumpUvScale = new Float32Array(DEFAULT_UV_SCALE);

    /**
     * Displacement UV-offset.
     *
     * @type {Float32Array}
     * @private
     */
    #displacementUvOffset = new Float32Array(DEFAULT_UV_OFFSET);

    /**
     * Displacement UV-scale.
     *
     * @type {Float32Array}
     * @private
     */
    #displacementUvScale = new Float32Array(DEFAULT_UV_SCALE);

    /**
     * Reflection UV-offset.
     *
     * @type {Float32Array}
     * @private
     */
    #reflectionUvOffset = new Float32Array(DEFAULT_UV_OFFSET);

    /**
     * Reflection UV-scale.
     *
     * @type {Float32Array}
     * @private
     */
    #reflectionUvScale = new Float32Array(DEFAULT_UV_SCALE);

    /**
     * Flag, indicating the diffuse map usage.
     *
     * @type {boolean}
     * @private
     */
    #useDiffuseMap = false;

    /**
     * Flag, indicating the ambient map usage.
     *
     * @type {boolean}
     * @private
     */
    #useAmbientMap = false;

    /**
     * Flag, indicating the specular map usage.
     *
     * @type {boolean}
     * @private
     */
    #useSpecularMap = false;

    /**
     * Flag, indicating the alpha map usage.
     *
     * @type {boolean}
     * @private
     */
    #useAlphaMap = false;

    /**
     * Flag, indicating the bump map usage.
     *
     * @type {boolean}
     * @private
     */
    #useBumpMap = false;

    /**
     * Flag, indicating the displacement map usage.
     *
     * @type {boolean}
     * @private
     */
    #useDisplacementMap = false;

    /**
     * Flag, indicating the reflection map usage.
     *
     * @type {boolean}
     * @private
     */
    #useReflectionMap = false;

    /**
     * Creates a new MTL standard material.
     *
     * @param {WebGL2RenderingContext} webglContext  - WebGL2 rendering context, used to compile the shaders.
     * @param {MtlStandardMaterialOptions} [options] - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== TYPEOF_OBJECT || Array.isArray(options)) {
            throw new TypeError(ERROR_OPTIONS_OBJECT);
        }

        const {
            diffuseColor,
            ambientColor,
            specularColor,
            emissiveColor,
            lightDirection,
            ambientStrength,
            shininess,
            specularStrength,
            opticalDensity
        } = options;

        super(
            webglContext,
            new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE),
            {
                color           : diffuseColor || DEFAULT_DIFFUSE_COLOR,
                lightDirection  : lightDirection,
                ambientStrength : ambientStrength
            },
            { ownsShaderProgram: true }
        );

        this.#fallbackTexture     = new Texture2D(webglContext);
        this.#diffuseTexture      = this.#fallbackTexture;
        this.#ambientTexture      = this.#fallbackTexture;
        this.#specularTexture     = this.#fallbackTexture;
        this.#alphaTexture        = this.#fallbackTexture;
        this.#bumpTexture         = this.#fallbackTexture;
        this.#displacementTexture = this.#fallbackTexture;
        this.#reflectionTexture   = this.#fallbackTexture;
        this.setAmbientColor(ambientColor   || DEFAULT_AMBIENT_COLOR);
        this.setSpecularColor(specularColor || DEFAULT_SPECULAR_COLOR);
        this.setEmissiveColor(emissiveColor || DEFAULT_EMISSIVE_COLOR);

        if (shininess !== undefined) {
            this.setShininess(shininess);
        }

        if (specularStrength !== undefined) {
            this.setSpecularStrength(specularStrength);
        }

        if (opticalDensity !== undefined) {
            this.setOpticalDensity(opticalDensity);
        }
    }

    /**
     * Uploads per-object uniforms specific to the standard material.
     *
     * @param {Float32Array} worldMatrix    - World matrix.
     * @param {Float32Array} cameraPosition - Camera position.
     * @protected
     */
    applyAdditionalUniforms(worldMatrix, cameraPosition) {
        // Transform & camera uniforms:
        this.shaderProgram.setMatrix4(WORLD_MATRIX_UNIFORM_NAME, worldMatrix);
        this.shaderProgram.setVector3(CAMERA_POSITION_UNIFORM_NAME, cameraPosition);

        // Material colors & shading parameters:
        this.shaderProgram.setVector3(AMBIENT_COLOR_UNIFORM_NAME, this.#ambientColor);
        this.shaderProgram.setVector3(SPECULAR_COLOR_UNIFORM_NAME, this.#specularColor);
        this.shaderProgram.setVector3(EMISSIVE_COLOR_UNIFORM_NAME, this.#emissiveColor);
        this.shaderProgram.setFloat(SPECULAR_STRENGTH_UNIFORM_NAME, this.#specularStrength);
        this.shaderProgram.setFloat(SHININESS_UNIFORM_NAME, this.#shininess);
        this.shaderProgram.setFloat(SPECULAR_ENABLED_UNIFORM_NAME, this.#specularEnabled ? FLOAT_TRUE : FLOAT_FALSE);

        // Optical & surface detail parameters:
        this.shaderProgram.setFloat(OPTICAL_DENSITY_UNIFORM_NAME, this.#opticalDensity);
        this.shaderProgram.setFloat(BUMP_MULTIPLIER_UNIFORM_NAME, this.#bumpMultiplier);
        this.shaderProgram.setFloat(DISPLACEMENT_SCALE_UNIFORM_NAME, this.#displacementScale);

        // Per-map UV transforms (offset/scale):
        this.shaderProgram.setVector2(DIFFUSE_UV_OFFSET_UNIFORM_NAME, this.#diffuseUvOffset);
        this.shaderProgram.setVector2(DIFFUSE_UV_SCALE_UNIFORM_NAME, this.#diffuseUvScale);
        this.shaderProgram.setVector2(AMBIENT_UV_OFFSET_UNIFORM_NAME, this.#ambientUvOffset);
        this.shaderProgram.setVector2(AMBIENT_UV_SCALE_UNIFORM_NAME, this.#ambientUvScale);
        this.shaderProgram.setVector2(SPECULAR_UV_OFFSET_UNIFORM_NAME, this.#specularUvOffset);
        this.shaderProgram.setVector2(SPECULAR_UV_SCALE_UNIFORM_NAME, this.#specularUvScale);
        this.shaderProgram.setVector2(ALPHA_UV_OFFSET_UNIFORM_NAME, this.#alphaUvOffset);
        this.shaderProgram.setVector2(ALPHA_UV_SCALE_UNIFORM_NAME, this.#alphaUvScale);
        this.shaderProgram.setVector2(BUMP_UV_OFFSET_UNIFORM_NAME, this.#bumpUvOffset);
        this.shaderProgram.setVector2(BUMP_UV_SCALE_UNIFORM_NAME, this.#bumpUvScale);
        this.shaderProgram.setVector2(DISPLACEMENT_UV_OFFSET_UNIFORM_NAME, this.#displacementUvOffset);
        this.shaderProgram.setVector2(DISPLACEMENT_UV_SCALE_UNIFORM_NAME, this.#displacementUvScale);
        this.shaderProgram.setVector2(REFLECTION_UV_OFFSET_UNIFORM_NAME, this.#reflectionUvOffset);
        this.shaderProgram.setVector2(REFLECTION_UV_SCALE_UNIFORM_NAME, this.#reflectionUvScale);

        // Per-map usage flags (as float booleans for GLSL):
        this.shaderProgram.setFloat(USE_DIFFUSE_MAP_UNIFORM_NAME, this.#useDiffuseMap ? FLOAT_TRUE : FLOAT_FALSE);
        this.shaderProgram.setFloat(USE_AMBIENT_MAP_UNIFORM_NAME, this.#useAmbientMap ? FLOAT_TRUE : FLOAT_FALSE);
        this.shaderProgram.setFloat(USE_SPECULAR_MAP_UNIFORM_NAME, this.#useSpecularMap ? FLOAT_TRUE : FLOAT_FALSE);
        this.shaderProgram.setFloat(USE_ALPHA_MAP_UNIFORM_NAME, this.#useAlphaMap ? FLOAT_TRUE : FLOAT_FALSE);
        this.shaderProgram.setFloat(USE_BUMP_MAP_UNIFORM_NAME, this.#useBumpMap ? FLOAT_TRUE : FLOAT_FALSE);
        this.shaderProgram.setFloat(USE_DISPLACEMENT_MAP_UNIFORM_NAME, this.#useDisplacementMap ? FLOAT_TRUE : FLOAT_FALSE);
        this.shaderProgram.setFloat(USE_REFLECTION_MAP_UNIFORM_NAME, this.#useReflectionMap ? FLOAT_TRUE : FLOAT_FALSE);

        // Texture bindings (samplers + texture units):
        this.shaderProgram.setTexture2D(DIFFUSE_MAP_UNIFORM_NAME, this.#diffuseTexture, this.#diffuseTextureUnit);
        this.shaderProgram.setTexture2D(AMBIENT_MAP_UNIFORM_NAME, this.#ambientTexture, this.#ambientTextureUnit);
        this.shaderProgram.setTexture2D(SPECULAR_MAP_UNIFORM_NAME, this.#specularTexture, this.#specularTextureUnit);
        this.shaderProgram.setTexture2D(ALPHA_MAP_UNIFORM_NAME, this.#alphaTexture, this.#alphaTextureUnit);
        this.shaderProgram.setTexture2D(BUMP_MAP_UNIFORM_NAME, this.#bumpTexture, this.#bumpTextureUnit);
        this.shaderProgram.setTexture2D(DISPLACEMENT_MAP_UNIFORM_NAME, this.#displacementTexture, this.#displacementTextureUnit);
        this.shaderProgram.setTexture2D(REFLECTION_MAP_UNIFORM_NAME, this.#reflectionTexture, this.#reflectionTextureUnit);
    }

    /**
     * Sets the ambient color.
     *
     * @param {Float32Array | number[]} color - RGB color in [0..1] range.
     */
    setAmbientColor(color) {
        MtlStandardMaterial.#assertVector3('`MtlStandardMaterial.setAmbientColor`', color);
        this.#ambientColor.set(color);
    }

    /**
     * Sets the specular color.
     *
     * @param {Float32Array | number[]} color - RGB color in [0..1] range.
     */
    setSpecularColor(color) {
        MtlStandardMaterial.#assertVector3('`MtlStandardMaterial.setSpecularColor`', color);
        this.#specularColor.set(color);
    }

    /**
     * Sets the emissive color.
     *
     * @param {Float32Array | number[]} color - RGB color in [0..1] range.
     */
    setEmissiveColor(color) {
        MtlStandardMaterial.#assertVector3('`MtlStandardMaterial.setEmissiveColor`', color);
        this.#emissiveColor.set(color);
    }

    /**
     * Sets the shininess exponent.
     *
     * @param {number} value - Shininess exponent.
     */
    setShininess(value) {
        if (typeof value !== TYPEOF_NUMBER || !Number.isFinite(value)) {
            throw new TypeError(ERROR_SHININESS_TYPE);
        }

        this.#shininess = value;
    }

    /**
     * Sets the specular strength multiplier.
     *
     * @param {number} value - Specular strength.
     */
    setSpecularStrength(value) {
        if (typeof value !== TYPEOF_NUMBER || !Number.isFinite(value)) {
            throw new TypeError(ERROR_SPECULAR_STRENGTH_TYPE);
        }

        this.#specularStrength = value;
    }

    /**
     * Enables or disables specular term.
     *
     * @param {boolean} enabled - Specular usage flag.
     */
    setSpecularEnabled(enabled) {
        if (typeof enabled !== TYPEOF_BOOLEAN) {
            throw new TypeError(ERROR_SPECULAR_ENABLED_TYPE);
        }

        this.#specularEnabled = enabled;
    }

    /**
     * Sets optical density value.
     *
     * @param {number} value - Optical density.
     */
    setOpticalDensity(value) {
        if (typeof value !== TYPEOF_NUMBER || !Number.isFinite(value)) {
            throw new TypeError(ERROR_OPTICAL_DENSITY_TYPE);
        }

        this.#opticalDensity = value;
    }

    /**
     * Sets bump multiplier value.
     *
     * @param {number} value - Bump multiplier.
     */
    setBumpMultiplier(value) {
        if (typeof value !== TYPEOF_NUMBER || !Number.isFinite(value)) {
            throw new TypeError(ERROR_BUMP_MULTIPLIER_TYPE);
        }

        this.#bumpMultiplier = value;
    }

    /**
     * Sets displacement scale.
     *
     * @param {number} value - Displacement scale factor.
     */
    setDisplacementScale(value) {
        if (typeof value !== TYPEOF_NUMBER || !Number.isFinite(value)) {
            throw new TypeError(ERROR_DISPLACEMENT_SCALE_TYPE);
        }

        this.#displacementScale = value;
    }

    /**
     * Sets a diffuse texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Diffuse texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setDiffuseMap(texture, options = {}) {
        this.#setMap(
            '`MtlStandardMaterial.setDiffuseMap`',
            texture,
            options,
            (map) => {
                this.#diffuseTexture     = map.texture;
                this.#diffuseTextureUnit = map.textureUnitIndex;
                this.#useDiffuseMap      = true;
                this.#diffuseUvOffset.set(map.uvOffset);
                this.#diffuseUvScale.set(map.uvScale);
            }
        );
    }

    /**
     * Sets an ambient texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Ambient texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setAmbientMap(texture, options = {}) {
        this.#setMap(
            '`MtlStandardMaterial.setAmbientMap`',
            texture,
            options,
            (map) => {
                this.#ambientTexture     = map.texture;
                this.#ambientTextureUnit = map.textureUnitIndex;
                this.#useAmbientMap      = true;
                this.#ambientUvOffset.set(map.uvOffset);
                this.#ambientUvScale.set(map.uvScale);
            }
        );
    }

    /**
     * Sets a specular texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Specular texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setSpecularMap(texture, options = {}) {
        this.#setMap(
            '`MtlStandardMaterial.setSpecularMap`',
            texture,
            options,
            (map) => {
                this.#specularTexture     = map.texture;
                this.#specularTextureUnit = map.textureUnitIndex;
                this.#useSpecularMap      = true;
                this.#specularUvOffset.set(map.uvOffset);
                this.#specularUvScale.set(map.uvScale);
            }
        );
    }

    /**
     * Sets an alpha texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Alpha texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setAlphaMap(texture, options = {}) {
        this.#setMap(
            '`MtlStandardMaterial.setAlphaMap`',
            texture,
            options,
            (map) => {
                this.#alphaTexture     = map.texture;
                this.#alphaTextureUnit = map.textureUnitIndex;
                this.#useAlphaMap      = true;
                this.#alphaUvOffset.set(map.uvOffset);
                this.#alphaUvScale.set(map.uvScale);
            }
        );
    }

    /**
     * Sets a bump texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Bump texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setBumpMap(texture, options = {}) {
        this.#setMap(
            '`MtlStandardMaterial.setBumpMap`',
            texture,
            options,
            (map) => {
                this.#bumpTexture     = map.texture;
                this.#bumpTextureUnit = map.textureUnitIndex;
                this.#useBumpMap      = true;
                this.#bumpUvOffset.set(map.uvOffset);
                this.#bumpUvScale.set(map.uvScale);
            }
        );
    }

    /**
     * Sets a displacement texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Displacement texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setDisplacementMap(texture, options = {}) {
        this.#setMap(
            '`MtlStandardMaterial.setDisplacementMap`',
            texture,
            options,
            (map) => {
                this.#displacementTexture     = map.texture;
                this.#displacementTextureUnit = map.textureUnitIndex;
                this.#useDisplacementMap      = true;
                this.#displacementUvOffset.set(map.uvOffset);
                this.#displacementUvScale.set(map.uvScale);
            }
        );
    }

    /**
     * Sets a reflection texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Reflection texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setReflectionMap(texture, options = {}) {
        this.#setMap(
            '`MtlStandardMaterial.setReflectionMap`',
            texture,
            options,
            (map) => {
                this.#reflectionTexture     = map.texture;
                this.#reflectionTextureUnit = map.textureUnitIndex;
                this.#useReflectionMap      = true;
                this.#reflectionUvOffset.set(map.uvOffset);
                this.#reflectionUvScale.set(map.uvScale);
            }
        );
    }

    /**
     * Disposes resources, owned by this material.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }

        if (this.#fallbackTexture) {
            this.#fallbackTexture.dispose();
        }

        super.dispose();
    }

    /**
     * Validates and applies the map options for a texture assignment.
     *
     * @param {string} context                        - Error context.
     * @param {Texture2D} texture                     - Map texture.
     * @param {MtlStandardMaterialMapOptions} options - Map options.
     * @param {function(Object): void} apply          - Apply callback.
     * @returns {void}
     * @private
     */
    #setMap(context, texture, options, apply) {
        if (!(texture instanceof Texture2D)) {
            throw new TypeError(context + ERROR_EXPECTS_TEXTURE_SUFFIX);
        }

        if (options === null || typeof options !== TYPEOF_OBJECT || Array.isArray(options)) {
            throw new TypeError(context + ERROR_EXPECTS_OPTIONS_OBJECT_SUFFIX);
        }

        const {
            textureUnitIndex = DEFAULT_DIFFUSE_TEXTURE_UNIT,
            uvOffset         = DEFAULT_UV_OFFSET,
            uvScale          = DEFAULT_UV_SCALE
        } = options;

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE) {
            throw new TypeError(context + ERROR_EXPECTS_TEXTURE_UNIT_INDEX_SUFFIX);
        }

        MtlStandardMaterial.#assertVector2(`${context} options.uvOffset` , uvOffset);
        MtlStandardMaterial.#assertVector2(`${context} options.uvScale`  ,  uvScale);

        apply({
            texture,
            textureUnitIndex,
            uvOffset,
            uvScale
        });
    }

    /**
     * Validates the `vector2` arrays.
     *
     * @param {string} context                - Error context.
     * @param {Float32Array | number[]} value - Vector to validate.
     * @returns {void}
     * @private
     */
    static #assertVector2(context, value) {
        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError(context + ERROR_EXPECTS_VECTOR2_TYPE_SUFFIX);
        }

        if (value.length !== DEFAULT_UV_OFFSET.length) {
            throw new TypeError(context + ERROR_EXPECTS_VECTOR2_COMPONENTS_SUFFIX);
        }
    }

    /**
     * Validates the `vector3` arrays.
     *
     * @param {string} context                - Error context.
     * @param {Float32Array | number[]} value - Vector to validate.
     * @returns {void}
     * @private
     */
    static #assertVector3(context, value) {
        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError(context + ERROR_EXPECTS_VECTOR2_TYPE_SUFFIX);
        }

        if (value.length !== VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(context + ERROR_EXPECTS_VECTOR3_COMPONENTS_SUFFIX);
        }
    }
}
