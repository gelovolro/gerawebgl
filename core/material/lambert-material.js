import { ShaderProgram } from '../shader/shader-program.js';
import {
    DirectionalLightMaterial,
    POSITION_ATTRIBUTE_LOCATION,
    NORMAL_ATTRIBUTE_LOCATION,
    FINAL_MATRIX_UNIFORM_NAME,
    WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME,
    COLOR_UNIFORM_NAME,
    LIGHT_DIRECTION_UNIFORM_NAME,
    AMBIENT_STRENGTH_UNIFORM_NAME,
    DIRECTIONAL_STRENGTH_UNIFORM_NAME,
    LIGHTING_ENABLED_UNIFORM_NAME,
    OPACITY_UNIFORM_NAME
} from './directional-light-material.js';

/**
 * GLSL vertex shader source code.
 *
 * Requires:
 * - position attribute at location 0
 * - normal attribute at location 3
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION}) in vec3 a_normal;
uniform mat4 ${FINAL_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME};
out vec3 v_normal;

void main() {
    gl_Position = ${FINAL_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_normal    = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME} * vec4(a_normal, 0.0)).xyz;
}
`;

/**
 * GLSL fragment shader source code.
 *
 * Implements Lambert diffuse lighting: `ambient + diffuse`.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3  ${COLOR_UNIFORM_NAME};
uniform vec3  ${LIGHT_DIRECTION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME};
uniform float ${DIRECTIONAL_STRENGTH_UNIFORM_NAME};
uniform float ${LIGHTING_ENABLED_UNIFORM_NAME};
uniform float ${OPACITY_UNIFORM_NAME};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);

    if (!gl_FrontFacing) {
        surface_normal = -surface_normal;
    }

    vec3 light_direction    = normalize(${LIGHT_DIRECTION_UNIFORM_NAME});
    float diffuse_intensity = max(dot(surface_normal, light_direction), 0.0) * ${DIRECTIONAL_STRENGTH_UNIFORM_NAME};
    float lit_intensity     = clamp(${AMBIENT_STRENGTH_UNIFORM_NAME} + diffuse_intensity, 0.0, 1.0);
    float light_intensity   = mix(1.0, lit_intensity, ${LIGHTING_ENABLED_UNIFORM_NAME});
    outColor                = vec4(${COLOR_UNIFORM_NAME} * light_intensity, ${OPACITY_UNIFORM_NAME});
}
`;

/**
 * Options used by `LambertMaterial`.
 *
 * @typedef {Object} LambertMaterialOptions
 * @property {Float32Array | number[]} [color]          - Diffuse RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space), normalized internally.
 * @property {number} [ambientStrength]                 - Ambient term multiplier.
 */

/**
 * Simple Lambert (diffuse) material with one directional light.
 *
 * This material expects geometry to provide normals at attribute location 3.
 */
export class LambertMaterial extends DirectionalLightMaterial {

    /**
     * Creates a new `LambertMaterial`.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     * @param {LambertMaterialOptions} [options]    - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`LambertMaterial` expects an options object (plain object).');
        }

        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram, options, { ownsShaderProgram: true });
    }
}
