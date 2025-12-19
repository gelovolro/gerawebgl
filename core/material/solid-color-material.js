import { Material }      from './material.js';
import { ShaderProgram } from '../shader/shader-program.js';

/**
 * Attribute location used by vec3 position.
 *
 * @type {number}
 */
const POSITION_ATTRIBUTE_LOCATION = 0;

/**
 * Name of the matrix uniform in the shader.
 *
 * @type {string}
 */
const MATRIX_UNIFORM_NAME = 'u_matrix';

/**
 * Name of the color uniform in the shader.
 *
 * @type {string}
 */
const COLOR_UNIFORM_NAME = 'u_color';

/**
 * Opacity uniform name.
 *
 * @type {string}
 */
const OPACITY_UNIFORM_NAME = 'u_opacity';

/**
 * Number of components in a RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Default solid color (white).
 *
 * @type {Float32Array}
 */
const DEFAULT_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * GLSL vertex shader source code.
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
uniform mat4 ${MATRIX_UNIFORM_NAME};

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
}
`;

/**
 * GLSL fragment shader source code.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
uniform vec3  ${COLOR_UNIFORM_NAME};
uniform float ${OPACITY_UNIFORM_NAME};
out vec4 outColor;

void main() {
    outColor = vec4(${COLOR_UNIFORM_NAME}, ${OPACITY_UNIFORM_NAME});
}
`;

/**
 * Options used by SolidColorMaterial.
 *
 * @typedef {Object} SolidColorMaterialOptions
 * @property {Float32Array | number[]} [color] - RGB color [r,g,b] in 0..1 range.
 */

/**
 * SolidColorMaterial renders geometry using a single uniform color.
 */
export class SolidColorMaterial extends Material {
    /**
     * Current RGB color stored as Float32Array([r, g, b]).
     *
     * @type {Float32Array}
     * @private
     */
    #color = new Float32Array(DEFAULT_COLOR);

    /**
     * @param {WebGL2RenderingContext} webglContext         - WebGL2 rendering context used to compile shaders.
     * @param {SolidColorMaterialOptions} [options]         - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('SolidColorMaterial expects an options object (plain object).');
        }

        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram, { ownsShaderProgram: true });
        const { color } = options;

        if (color !== undefined) {
            this.setColor(color);
        }
    }

    /**
     * Applies per-object uniforms.
     *
     * @param {Float32Array} matrix4 - Transformation matrix passed as u_matrix.
     */
    apply(matrix4) {
        this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME, matrix4);
        this.shaderProgram.setVector3(COLOR_UNIFORM_NAME, this.#color);
        this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME, this.opacity);
    }

    /**
     * Sets the RGB color.
     *
     * @param {Float32Array | number[]} color - [r, g, b] in 0..1 range.
     */
    setColor(color) {
        if (!Array.isArray(color) && !(color instanceof Float32Array)) {
            throw new TypeError('SolidColorMaterial.setColor expects a number[] or Float32Array.');
        }

        if (color.length !== COLOR_COMPONENT_COUNT) {
            throw new TypeError('SolidColorMaterial.setColor expects exactly 3 components [r, g, b].');
        }

        this.#color[0] = color[0];
        this.#color[1] = color[1];
        this.#color[2] = color[2];
    }

    /**
     * Returns the internal color buffer.
     * Note: returned Float32Array is mutable.
     *
     * @returns {Float32Array}
     */
    get color() {
        return this.#color;
    }
}
