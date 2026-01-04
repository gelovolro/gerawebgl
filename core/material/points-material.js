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

/**
 * Name of the color uniform in the shader.
 *
 * @type {string}
 */
const COLOR_UNIFORM_NAME = 'u_color';

/**
 * Name of point size uniform.
 *
 * @type {string}
 */
const POINT_SIZE_UNIFORM_NAME = 'u_pointSize';

/**
 * Name of opacity uniform.
 *
 * @type {string}
 */
const OPACITY_UNIFORM_NAME = 'u_opacity';

/**
 * Name of the use vertex colors usage uniform.
 *
 * @type {string}
 */
const USE_VERTEX_COLOR_UNIFORM_NAME = 'u_useVertexColor';

/**
 * Number of components in a RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Red component index.
 *
 * @type {number}
 */
const COLOR_COMPONENT_RED_INDEX = 0;

/**
 * Green component index.
 *
 * @type {number}
 */
const COLOR_COMPONENT_GREEN_INDEX = 1;

/**
 * Blue component index.
 *
 * @type {number}
 */
const COLOR_COMPONENT_BLUE_INDEX = 2;

/**
 * Default color for points.
 *
 * @type {Float32Array}
 */
const DEFAULT_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default point size in pixels.
 *
 * @type {number}
 */
const DEFAULT_POINT_SIZE = 6.0;

/**
 * Minimum allowed point size.
 *
 * @type {number}
 */
const MIN_POINT_SIZE = 0.0;

/**
 * Default vertex colors usage flag.
 *
 * @type {boolean}
 */
const DEFAULT_USE_VERTEX_COLORS = false;

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
 * Point sprite UV center, used for round points.
 *
 * @type {number}
 */
const POINT_COORD_CENTER = 0.5;

/**
 * Point sprite radius, used for round points.
 *
 * @type {number}
 */
const POINT_COORD_RADIUS = 0.5;

/**
 * Position W component, used in vertex shader.
 *
 * @type {number}
 */
const POSITION_W_COMPONENT = 1.0;

/**
 * GLSL vertex shader source code.
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
layout(location = ${COLOR_ATTRIBUTE_LOCATION}) in vec3 a_color;
uniform mat4 ${MATRIX_UNIFORM_NAME};
uniform vec3 ${COLOR_UNIFORM_NAME};
uniform float ${POINT_SIZE_UNIFORM_NAME};
uniform float ${USE_VERTEX_COLOR_UNIFORM_NAME};
out vec3 v_color;

void main() {
    gl_Position  = ${MATRIX_UNIFORM_NAME} * vec4(a_position, ${POSITION_W_COMPONENT});
    gl_PointSize = ${POINT_SIZE_UNIFORM_NAME};
    v_color      = mix(${COLOR_UNIFORM_NAME}, a_color, ${USE_VERTEX_COLOR_UNIFORM_NAME});
}
`;

/**
 * GLSL fragment shader source code.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_color;
uniform float ${OPACITY_UNIFORM_NAME};
out vec4 outColor;

void main() {
    vec2 centered = gl_PointCoord - vec2(${POINT_COORD_CENTER}, ${POINT_COORD_CENTER});
    float dist    = length(centered);

    if (dist > ${POINT_COORD_RADIUS}) {
        discard;
    }

    outColor = vec4(v_color, ${OPACITY_UNIFORM_NAME});
}
`;

/**
 * Options used by `PointsMaterial`.
 *
 * @typedef {Object} PointsMaterialOptions
 * @property {Float32Array | number[]} [color]   - RGB color [red, green, blue] in [0..1] range.
 * @property {number} [pointSize = 6.0]          - Point size in pixels.
 * @property {boolean} [useVertexColors = false] - When true, uses vertex colors.
 */

/**
 * Material for rendering point clouds.
 */
export class PointsMaterial extends Material {

    /**
     * Current RGB color stored as Float32Array([red, green, blue]).
     *
     * @type {Float32Array}
     * @private
     */
    #color = new Float32Array(DEFAULT_COLOR);

    /**
     * Point size in pixels.
     *
     * @type {number}
     * @private
     */
    #pointSize = DEFAULT_POINT_SIZE;

    /**
     * Flag controlling vertex color usage.
     *
     * @type {boolean}
     * @private
     */
    #useVertexColors = DEFAULT_USE_VERTEX_COLORS;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     * @param {PointsMaterialOptions} [options]     - Material options.
     * @throws {TypeError}  When inputs are invalid.
     * @throws {RangeError} When numeric inputs are out of range.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`PointsMaterial` expects an options object (plain object).');
        }

        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram, { ownsShaderProgram: true });

        const {
            color,
            pointSize       = DEFAULT_POINT_SIZE,
            useVertexColors = DEFAULT_USE_VERTEX_COLORS
        } = options;

        if (color !== undefined) {
            this.setColor(color);
        }

        this.setPointSize(pointSize);
        this.setUseVertexColors(useVertexColors);
    }

    /**
     * Applies per-object uniforms.
     *
     * @param {Float32Array} matrix4 - Transformation matrix passed as `u_matrix`.
     */
    apply(matrix4) {
        this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME, matrix4);
        this.shaderProgram.setVector3(COLOR_UNIFORM_NAME, this.#color);
        this.shaderProgram.setFloat(POINT_SIZE_UNIFORM_NAME, this.#pointSize);
        this.shaderProgram.setFloat(USE_VERTEX_COLOR_UNIFORM_NAME, this.#useVertexColors ? FLOAT_TRUE : FLOAT_FALSE);
        this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME, this.opacity);
    }

    /**
     * Sets the RGB color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     * @throws {TypeError} When color is invalid.
     */
    setColor(color) {
        if (!Array.isArray(color) && !(color instanceof Float32Array)) {
            throw new TypeError('`PointsMaterial.setColor` expects a number[] or `Float32Array`.');
        }

        if (color.length !== COLOR_COMPONENT_COUNT) {
            throw new TypeError('`PointsMaterial.setColor` expects exactly 3 components [red, green, blue].');
        }

        this.#color[COLOR_COMPONENT_RED_INDEX]   = color[COLOR_COMPONENT_RED_INDEX];
        this.#color[COLOR_COMPONENT_GREEN_INDEX] = color[COLOR_COMPONENT_GREEN_INDEX];
        this.#color[COLOR_COMPONENT_BLUE_INDEX]  = color[COLOR_COMPONENT_BLUE_INDEX];
    }

    /**
     * Sets point size in pixels.
     *
     * @param {number} size - Point size (> 0).
     * @throws {TypeError}  When size is not a finite number.
     * @throws {RangeError} When size is not positive.
     */
    setPointSize(size) {
        if (typeof size !== 'number' || !Number.isFinite(size)) {
            throw new TypeError('`PointsMaterial.setPointSize` expects a finite number.');
        }

        if (size <= MIN_POINT_SIZE) {
            throw new RangeError('`PointsMaterial.setPointSize` expects a positive size.');
        }

        this.#pointSize = size;
    }

    /**
     * Enables or disables vertex colors.
     *
     * @param {boolean} enabled - When true, uses vertex colors.
     * @throws {TypeError} When enabled is not a boolean.
     */
    setUseVertexColors(enabled) {
        if (typeof enabled !== 'boolean') {
            throw new TypeError('`PointsMaterial.setUseVertexColors` expects a boolean.');
        }

        this.#useVertexColors = enabled;
    }

    /**
     * @returns {Float32Array}
     */
    get color() {
        return this.#color;
    }

    /**
     * @returns {number}
     */
    get pointSize() {
        return this.#pointSize;
    }

    /**
     * @returns {boolean}
     */
    get useVertexColors() {
        return this.#useVertexColors;
    }
}
