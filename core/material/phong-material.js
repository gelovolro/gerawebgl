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
 * Name of the final transformation matrix uniform (view projection * world).
 *
 * @type {string}
 */
const FINAL_MATRIX_UNIFORM_NAME = 'u_matrix';

/**
 * Name of the world matrix uniform (world).
 *
 * @type {string}
 */
const WORLD_MATRIX_UNIFORM_NAME = 'u_worldMatrix';

/**
 * Name of the world inverse transpose matrix uniform ((world ^ -1) ^ T).
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
 * Specular color uniform name.
 *
 * @type {string}
 */
const SPECULAR_COLOR_UNIFORM_NAME = 'u_specularColor';

/**
 * Directional light direction uniform name (world space).
 * Vector points from surface to the light (towards the light).
 *
 * @type {string}
 */
const LIGHT_DIRECTION_UNIFORM_NAME = 'u_lightDirection';

/**
 * Camera position uniform name (world space).
 *
 * @type {string}
 */
const CAMERA_POSITION_UNIFORM_NAME = 'u_cameraPosition';

/**
 * Ambient strength uniform name.
 *
 * @type {string}
 */
const AMBIENT_STRENGTH_UNIFORM_NAME = 'u_ambientStrength';

/**
 * Specular strength uniform name.
 *
 * @type {string}
 */
const SPECULAR_STRENGTH_UNIFORM_NAME = 'u_specularStrength';

/**
 * Shininess (specular exponent) uniform name.
 *
 * @type {string}
 */
const SHININESS_UNIFORM_NAME = 'u_shininess';

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
 * Default specular color (RGB).
 *
 * @type {Float32Array}
 */
const DEFAULT_SPECULAR_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default directional light direction in world space. Points from surface to light.
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
 * Default specular intensity multiplier [0..1+].
 *
 * @type {number}
 */
const DEFAULT_SPECULAR_STRENGTH = 0.6;

/**
 * Default shininess exponent.
 *
 * @type {number}
 */
const DEFAULT_SHININESS = 32.0;

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
 * Provides:
 * - v_worldPosition (world space)
 * - v_normal (world space, not normalized in fragment yet)
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION}) in vec3 a_normal;
uniform mat4 ${FINAL_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME};
out vec3 v_worldPosition;
out vec3 v_normal;

void main() {
    vec4 worldPosition = ${WORLD_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_worldPosition = worldPosition.xyz;
    // Normal is transformed by inverse-transpose of the world matrix.
    v_normal = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME} * vec4(a_normal, 0.0)).xyz;
    gl_Position = ${FINAL_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
}
`;

/**
 * GLSL fragment shader source code.
 *
 * Implements classic Phong lighting: ambient + diffuse + specular
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
uniform vec3  ${COLOR_UNIFORM_NAME};
uniform vec3  ${SPECULAR_COLOR_UNIFORM_NAME};
uniform vec3  ${LIGHT_DIRECTION_UNIFORM_NAME};
uniform vec3  ${CAMERA_POSITION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME};
uniform float ${SPECULAR_STRENGTH_UNIFORM_NAME};
uniform float ${SHININESS_UNIFORM_NAME};
out vec4 outColor;

void main() {
    vec3 n = normalize(v_normal);
    vec3 l = normalize(${LIGHT_DIRECTION_UNIFORM_NAME});
    vec3 v = normalize(${CAMERA_POSITION_UNIFORM_NAME} - v_worldPosition);

    // Diffuse term:
    float diff = max(dot(n, l), 0.0);

    // Specular term:
    float spec = 0.0;

    if (diff > 0.0) {
        vec3 r = reflect(-l, n);
        float specBase = max(dot(v, r), 0.0);
        spec = pow(specBase, ${SHININESS_UNIFORM_NAME});
    }

    vec3 ambient  = ${COLOR_UNIFORM_NAME} * ${AMBIENT_STRENGTH_UNIFORM_NAME};
    vec3 diffuse  = ${COLOR_UNIFORM_NAME} * diff;
    vec3 specular = ${SPECULAR_COLOR_UNIFORM_NAME} * (spec * ${SPECULAR_STRENGTH_UNIFORM_NAME});
    vec3 rgb      = ambient + diffuse + specular;
    outColor      = vec4(rgb, 1.0);
}
`;

/**
 * Options used by `PhongMaterial`.
 *
 * @typedef {Object} PhongMaterialOptions
 * @property {Float32Array | number[]} [color]          - Diffuse RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [specularColor]  - Specular RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space), will be normalized.
 * @property {number} [ambientStrength]                 - Ambient term multiplier.
 * @property {number} [specularStrength]                - Specular term multiplier.
 * @property {number} [shininess]                       - Specular exponent.
 */

/**
 * Classic Phong shading material with a single directional light.
 * This material expects geometry to provide normals (attribute location 3).
 */
export class PhongMaterial extends Material {

    /**
     * Diffuse color (RGB).
     *
     * @type {Float32Array}
     * @private
     */
    #color = new Float32Array(VECTOR3_ELEMENT_COUNT);

    /**
     * Specular color (RGB).
     *
     * @type {Float32Array}
     * @private
     */
    #specularColor = new Float32Array(VECTOR3_ELEMENT_COUNT);

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
     * Specular term multiplier.
     *
     * @type {number}
     * @private
     */
    #specularStrength = DEFAULT_SPECULAR_STRENGTH;

    /**
     * Specular exponent.
     *
     * @type {number}
     * @private
     */
    #shininess = DEFAULT_SHININESS;

    /**
     * Creates a new `PhongMaterial`.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile the shaders.
     * @param {PhongMaterialOptions} [options]      - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`PhongMaterial` expects an options object (plain object).');
        }

        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram, { ownsShaderProgram: true });

        this.#color.set(DEFAULT_COLOR);
        this.#specularColor.set(DEFAULT_SPECULAR_COLOR);
        this.setLightDirection(DEFAULT_LIGHT_DIRECTION);
        this.#ambientStrength  = DEFAULT_AMBIENT_STRENGTH;
        this.#specularStrength = DEFAULT_SPECULAR_STRENGTH;
        this.#shininess        = DEFAULT_SHININESS;

        const {
            color,
            specularColor,
            lightDirection,
            ambientStrength,
            specularStrength,
            shininess,
        } = options;

        if (color !== undefined) {
            this.setColor(color);
        }

        if (specularColor !== undefined) {
            this.setSpecularColor(specularColor);
        }

        if (lightDirection !== undefined) {
            this.setLightDirection(lightDirection);
        }

        if (ambientStrength !== undefined) {
            this.setAmbientStrength(ambientStrength);
        }

        if (specularStrength !== undefined) {
            this.setSpecularStrength(specularStrength);
        }

        if (shininess !== undefined) {
            this.setShininess(shininess);
        }
    }

    /**
     * Uploads per-object uniforms for a draw call.
     *
     * @param {Float32Array} finalMatrix                 - view projection * world matrix.
     * @param {Float32Array} worldMatrix                 - world matrix.
     * @param {Float32Array} worldInverseTransposeMatrix - (world ^ -1) ^ T, used to transform normals.
     * @param {Float32Array} cameraPosition              - Camera position (vec3), world space.
     */
    apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition) {
        this.shaderProgram.setMatrix4(FINAL_MATRIX_UNIFORM_NAME, finalMatrix);
        this.shaderProgram.setMatrix4(WORLD_MATRIX_UNIFORM_NAME, worldMatrix);
        this.shaderProgram.setMatrix4(WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME, worldInverseTransposeMatrix);
        this.shaderProgram.setVector3(COLOR_UNIFORM_NAME, this.#color);
        this.shaderProgram.setVector3(SPECULAR_COLOR_UNIFORM_NAME, this.#specularColor);
        this.shaderProgram.setVector3(LIGHT_DIRECTION_UNIFORM_NAME, this.#lightDirection);
        this.shaderProgram.setVector3(CAMERA_POSITION_UNIFORM_NAME, cameraPosition);
        this.shaderProgram.setFloat(AMBIENT_STRENGTH_UNIFORM_NAME, this.#ambientStrength);
        this.shaderProgram.setFloat(SPECULAR_STRENGTH_UNIFORM_NAME, this.#specularStrength);
        this.shaderProgram.setFloat(SHININESS_UNIFORM_NAME, this.#shininess);
    }

    /**
     * Sets the diffuse RGB color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     */
    setColor(color) {
        PhongMaterial.#assertVector3('`PhongMaterial.setColor`', color);
        this.#color[0] = color[0];
        this.#color[1] = color[1];
        this.#color[2] = color[2];
    }

    /**
     * Sets the specular RGB color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     */
    setSpecularColor(color) {
        PhongMaterial.#assertVector3('`PhongMaterial.setSpecularColor`', color);
        this.#specularColor[0] = color[0];
        this.#specularColor[1] = color[1];
        this.#specularColor[2] = color[2];
    }

    /**
     * Sets the light direction (world space). The direction is normalized internally.
     *
     * @param {Float32Array | number[]} direction - [x, y, z] direction vector (non-zero).
     */
    setLightDirection(direction) {
        PhongMaterial.#assertVector3('`PhongMaterial.setLightDirection`', direction);
        const directionX = direction[0];
        const directionY = direction[1];
        const directionZ = direction[2];

        const directionLengthSquared =
            directionX * directionX +
            directionY * directionY +
            directionZ * directionZ;

        if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= MIN_DIRECTION_LENGTH_SQUARED) {
            throw new TypeError('`PhongMaterial.setLightDirection` expects a non-zero finite vector.');
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
            throw new TypeError('`PhongMaterial.setAmbientStrength` expects a finite number.');
        }

        this.#ambientStrength = value;
    }

    /**
     * Sets specular strength multiplier.
     *
     * @param {number} value - Specular multiplier.
     */
    setSpecularStrength(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`PhongMaterial.setSpecularStrength` expects a finite number.');
        }

        this.#specularStrength = value;
    }

    /**
     * Sets shininess exponent.
     *
     * @param {number} value - Specular exponent.
     */
    setShininess(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('PhongMaterial.setShininess` expects a finite number.');
        }

        this.#shininess = value;
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
     * Returns the internal specular color buffer.
     *
     * @returns {Float32Array}
     */
    get specularColor() {
        return this.#specularColor;
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
     * @returns {number} Specular strength multiplier.
     */
    get specularStrength() {
        return this.#specularStrength;
    }

    /**
     * @returns {number} Shininess exponent.
     */
    get shininess() {
        return this.#shininess;
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
