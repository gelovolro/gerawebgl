import { Material }      from './material.js';
import { ShaderProgram } from '../shader/shader-program.js';

/** @type {string} */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_color;
uniform mat4 u_matrix;
out vec3 v_color;

void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);
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
 * Simple material that uses per-vertex colors and a single
 * transformation matrix uniform (u_matrix).
 */
export class BasicMaterial extends Material {
    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
     */
    constructor(webglContext) {
        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram);
    }

    /**
     * Applies per-object uniforms.
     *
     * @param {Float32Array} matrix4 - Transformation matrix passed as u_matrix.
     */
    apply(matrix4) {
        this.shaderProgram.setMatrix4('u_matrix', matrix4);
    }
}
