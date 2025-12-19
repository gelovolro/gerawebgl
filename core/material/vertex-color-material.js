import { Material }      from './material.js';
import { ShaderProgram } from '../shader/shader-program.js';

/**
 * Attribute location used by `vec3` position.
 *
 * @type {number}
 */
const POSITION_ATTRIBUTE_LOCATION = 0;

/**
 * Attribute location used by `vec3` color.
 *
 * @type {number}
 */
const COLOR_ATTRIBUTE_LOCATION = 1;

/**
 * Name of the matrix uniform in the shader.
 *
 * @type {string}
 */
const MATRIX_UNIFORM_NAME = 'u_matrix';

/** @type {string} */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
layout(location = ${COLOR_ATTRIBUTE_LOCATION}) in vec3 a_color;
uniform mat4 ${MATRIX_UNIFORM_NAME};
out vec3 v_color;

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_color = a_color;
}
`;

/** @type {string} */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_color;
out vec4 outColor;

void main() {
    outColor = vec4(v_color, 1.0);
}
`;

/**
 * `VertexColorMaterial` renders geometry using vertex colors.
 */
export class VertexColorMaterial extends Material {
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
    }
}
