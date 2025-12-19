import { Material }      from './material.js';
import { ShaderProgram } from '../shader/shader-program.js';

/**
 * Attribute location used by `vec3` position.
 *
 * @type {number}
 */
const POSITION_ATTRIBUTE_LOCATION = 0;

/**
 * Attribute location used by `vec3` normal.
 *
 * @type {number}
 */
const NORMAL_ATTRIBUTE_LOCATION = 3;

/**
 * Name of the matrix uniform in the shader.
 *
 * @type {string}
 */
const MATRIX_UNIFORM_NAME = 'u_matrix';

/**
 * Opacity uniform name.
 *
 * @type {string}
 */
const OPACITY_UNIFORM_NAME = 'u_opacity';

/**
 * Scale factor used to remap normal vector from [-1..1] into [0..1] range.
 *
 * @type {number}
 */
const NORMAL_COLOR_SCALE = 0.5;

/**
 * Bias used to remap normal vector from [-1..1] into [0..1] range.
 *
 * @type {number}
 */
const NORMAL_COLOR_BIAS = 0.5;

/**
 * GLSL vertex shader source code.
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION}) in vec3 a_normal;
uniform mat4 ${MATRIX_UNIFORM_NAME};
out vec3 v_normal;

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_normal = a_normal;
}
`;

/**
 * GLSL fragment shader source code.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform float ${OPACITY_UNIFORM_NAME};
out vec4 outColor;

void main() {
    vec3 normalizedNormal = normalize(v_normal);
    vec3 normalColor = (normalizedNormal * ${NORMAL_COLOR_SCALE}) + ${NORMAL_COLOR_BIAS};
    outColor = vec4(normalColor, ${OPACITY_UNIFORM_NAME});
}
`;

/**
 * `NormalMaterial` visualizes vertex normals as RGB colors.
 * Useful as a diagnostic material to validate normal buffers and attribute bindings.
 */
export class NormalMaterial extends Material {
    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     */
    constructor(webglContext) {
        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram, { ownsShaderProgram: true });
    }

    /**
     * Applies per-object uniforms.
     *
     * @param {Float32Array} matrix4 - Transformation matrix passed as `u_matrix`.
     */
    apply(matrix4) {
        this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME, matrix4);
        this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME, this.opacity);
    }
}
