import * as MaterialConstants       from '../constants/directional-light-material.js';
import { ShaderProgram }            from '../shader/shader-program.js';
import { DirectionalLightMaterial } from './directional-light-material.js';

/**
 * GLSL vertex shader source code.
 *
 * Requires:
 * - position attribute at 'location 0'
 * - normal attribute at 'location 3'
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
uniform mat4 ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
out vec3 v_normal;

void main() {
    gl_Position = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(a_position, 1.0);
    v_normal    = (${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
}
`;

/**
 * GLSL fragment shader source code.
 *
 * Implements Lambert diffuse lighting: 'ambient + diffuse'.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3  ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3  ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);

    if (!gl_FrontFacing) {
        surface_normal = -surface_normal;
    }

    vec3 light_direction    = normalize(${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    float diffuse_intensity = max(dot(surface_normal, light_direction), 0.0) * ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
    float lit_intensity     = clamp(${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH} + diffuse_intensity, 0.0, 1.0);
    float light_intensity   = mix(1.0, lit_intensity, ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED});
    outColor                = vec4(${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * light_intensity, ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY});
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
 * This material expects geometry to provide normals at attribute 'location 3'.
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
