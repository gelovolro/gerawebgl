import { Material }      from './material.js';
import { ShaderProgram } from '../shader/shader-program.js';

/**
 * Attribute location used by `vec3` position.
 * Must match geometry's `POSITION_ATTRIBUTE_LOCATION`.
 *
 * @type {number}
 */
const POSITION_ATTRIBUTE_LOCATION = 0;

/**
 * Attribute location used by `vec3` normal.
 * Must match geometry's `NORMAL_ATTRIBUTE_LOCATION`.
 *
 * @type {number}
 */
const NORMAL_ATTRIBUTE_LOCATION = 3;

/**
 * Name of the final transformation matrix uniform (view projection * World).
 *
 * @type {string}
 */
const FINAL_MATRIX_UNIFORM_NAME = 'u_matrix';

/**
 * Name of the world inverse transpose matrix uniform ((world ^ -1) ^ T).
 * Used to correctly transform normals into world space.
 *
 * @type {string}
 */
const WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME = 'u_worldInverseTranspose';

/**
 * Diffuse color uniform name.
 *
 * @type {string}
 */
const COLOR_UNIFORM_NAME = 'u_color';

/**
 * Directional light direction uniform name (world space).
 * Vector points from surface to the light (towards the light).
 *
 * @type {string}
 */
const LIGHT_DIRECTION_UNIFORM_NAME = 'u_lightDirection';

/**
 * Ambient strength uniform name.
 *
 * @type {string}
 */
const AMBIENT_STRENGTH_UNIFORM_NAME = 'u_ambientStrength';

/**
 * Vector3 length (component count).
 *
 * @type {number}
 */
const VECTOR3_ELEMENT_COUNT = 3;

/**
 * Default diffuse color (RGB).
 *
 * @type {Float32Array}
 */
const DEFAULT_COLOR = new Float32Array([0.85, 0.85, 0.85]);

/**
 * Default directional light direction in world space (points from surface to light).
 *
 * @type {Float32Array}
 */
const DEFAULT_LIGHT_DIRECTION = new Float32Array([0.5, 0.7, 1.0]);

/**
 * Default ambient term strength [0..1].
 *
 * @type {number}
 */
const DEFAULT_AMBIENT_STRENGTH = 0.2;

/**
 * Minimum allowed squared length for a direction vector.
 * Used to reject a zero-length direction.
 *
 * @type {number}
 */
const MIN_DIRECTION_LENGTH_SQUARED = 0.0;

/**
 * Numerator used, when computing inverse vector length: `1 / sqrt(lengthSquared)`.
 *
 * @type {number}
 */
const INVERSE_LENGTH_NUMERATOR = 1.0;

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
    v_normal = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME} * vec4(a_normal, 0.0)).xyz;
}
`;

/**
 * GLSL fragment shader source code.
 *
 * Implements Lambert diffuse lighting: `ambient + diffuse`
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3  ${COLOR_UNIFORM_NAME};
uniform vec3  ${LIGHT_DIRECTION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);
    vec3 light_direction = normalize(${LIGHT_DIRECTION_UNIFORM_NAME});
    float diffuse = max(dot(surface_normal, light_direction), 0.0);
    float light = clamp(${AMBIENT_STRENGTH_UNIFORM_NAME} + diffuse, 0.0, 1.0);
    outColor = vec4(${COLOR_UNIFORM_NAME} * light, 1.0);
}
`;

/**
 * Options used by `LambertMaterial`.
 *
 * @typedef {Object} LambertMaterialOptions
 * @property {Float32Array | number[]} [color]          - Diffuse RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space), will be normalized.
 * @property {number} [ambientStrength]                 - Ambient term multiplier.
 */

/**
 * Simple Lambert (diffuse) material with one directional light.
 * This material expects geometry to provide normals (attribute location 3).
 */
export class LambertMaterial extends Material {

    /**
     * Diffuse color (RGB).
     *
     * @type {Float32Array}
     * @private
     */
    #color = new Float32Array(VECTOR3_ELEMENT_COUNT);

    /**
     * Directional light direction (world space, normalized).
     *
     * @type {Float32Array}
     * @private
     */
    #lightDirection = new Float32Array(VECTOR3_ELEMENT_COUNT);

    /**
     * Ambient term multiplier.
     *
     * @type {number}
     * @private
     */
    #ambientStrength = DEFAULT_AMBIENT_STRENGTH;

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
        super(webglContext, shaderProgram, { ownsShaderProgram: true });

        this.#color.set(DEFAULT_COLOR);
        this.setLightDirection(DEFAULT_LIGHT_DIRECTION);
        this.#ambientStrength = DEFAULT_AMBIENT_STRENGTH;
        const { color, lightDirection, ambientStrength } = options;

        if (color !== undefined) {
            this.setColor(color);
        }

        if (lightDirection !== undefined) {
            this.setLightDirection(lightDirection);
        }

        if (ambientStrength !== undefined) {
            this.setAmbientStrength(ambientStrength);
        }
    }

    /**
     * Uploads per-object uniforms for a draw call.
     *
     * @param {Float32Array} finalMatrix                 - view projection * world matrix.
     * @param {Float32Array} worldInverseTransposeMatrix - (world ^ -1) ^ T, used to transform normals.
     */
    apply(finalMatrix, worldInverseTransposeMatrix) {
        this.shaderProgram.setMatrix4(FINAL_MATRIX_UNIFORM_NAME, finalMatrix);
        this.shaderProgram.setMatrix4(WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME, worldInverseTransposeMatrix);
        this.shaderProgram.setVector3(COLOR_UNIFORM_NAME, this.#color);
        this.shaderProgram.setVector3(LIGHT_DIRECTION_UNIFORM_NAME, this.#lightDirection);
        this.shaderProgram.setFloat(AMBIENT_STRENGTH_UNIFORM_NAME, this.#ambientStrength);
    }

    /**
     * Sets the diffuse RGB color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     */
    setColor(color) {
        LambertMaterial.#assertVector3('`LambertMaterial.setColor`', color);
        this.#color[0] = color[0];
        this.#color[1] = color[1];
        this.#color[2] = color[2];
    }

    /**
     * Sets the light direction (world space). The direction is normalized internally.
     *
     * @param {Float32Array | number[]} direction - [x, y, z] direction vector (non-zero).
     */
    setLightDirection(direction) {
        LambertMaterial.#assertVector3('`LambertMaterial.setLightDirection`', direction);
        const directionX = direction[0];
        const directionY = direction[1];
        const directionZ = direction[2];

        const directionLengthSquared =
            directionX * directionX +
            directionY * directionY +
            directionZ * directionZ;

        if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= MIN_DIRECTION_LENGTH_SQUARED) {
            throw new TypeError('`LambertMaterial.setLightDirection` expects a non-zero finite vector.');
        }

        const inverseDirectionLength = INVERSE_LENGTH_NUMERATOR / Math.sqrt(directionLengthSquared);
        this.#lightDirection[0] = directionX * inverseDirectionLength;
        this.#lightDirection[1] = directionY * inverseDirectionLength;
        this.#lightDirection[2] = directionZ * inverseDirectionLength;
    }

    /**
     * Sets ambient strength multiplier.
     *
     * @param {number} value - Ambient multiplier.
     */
    setAmbientStrength(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`LambertMaterial.setAmbientStrength` expects a finite number.');
        }

        this.#ambientStrength = value;
    }

    /**
     * Returns the internal diffuse color buffer.
     *
     * @returns {Float32Array}
     */
    get color() {
        return this.#color;
    }

    /**
     * Returns the internal normalized light direction buffer.
     *
     * @returns {Float32Array}
     */
    get lightDirection() {
        return this.#lightDirection;
    }

    /**
     * @returns {number} Ambient strength multiplier.
     */
    get ambientStrength() {
        return this.#ambientStrength;
    }

    /**
     * Validates a vector3-like input.
     *
     * @param {string} methodName               - Method name for error messages.
     * @param {Float32Array | number[]} vector3 - Vector to validate.
     * @private
     */
    static #assertVector3(methodName, vector3) {
        if (!Array.isArray(vector3) && !(vector3 instanceof Float32Array)) {
            throw new TypeError(`${methodName} expects a number[] or Float32Array.`);
        }

        if (vector3.length !== VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(`${methodName} expects exactly 3 components [x, y, z].`);
        }

        if (!Number.isFinite(vector3[0]) || !Number.isFinite(vector3[1]) || !Number.isFinite(vector3[2])) {
            throw new TypeError(`${methodName} expects all components to be finite numbers.`);
        }
    }
}
