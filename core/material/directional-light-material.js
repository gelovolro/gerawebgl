import { Material }      from './material.js';
import { ShaderProgram } from '../shader/shader-program.js';

/**
 * Attribute location used by `vec3` position.
 * Must match geometry's `POSITION_ATTRIBUTE_LOCATION`.
 *
 * @type {number}
 */
export const POSITION_ATTRIBUTE_LOCATION = 0;

/**
 * Attribute location used by `vec3` normal.
 * Must match geometry's `NORMAL_ATTRIBUTE_LOCATION`.
 *
 * @type {number}
 */
export const NORMAL_ATTRIBUTE_LOCATION = 3;

/**
 * Name of the final transformation matrix uniform: `view projection * world`.
 *
 * @type {string}
 */
export const FINAL_MATRIX_UNIFORM_NAME = 'u_matrix';

/**
 * Name of the world inverse transpose matrix uniform: `(world ^ -1) ^ T`.
 * Used to correctly transform normals into world space under non-uniform scale.
 *
 * @type {string}
 */
export const WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME = 'u_worldInverseTranspose';

/**
 * Name of the world matrix uniform.
 * Used by materials, that require world-space position reconstruction in shaders.
 *
 * @type {string}
 */
export const WORLD_MATRIX_UNIFORM_NAME = 'u_worldMatrix';

/**
 * Diffuse/base color uniform name.
 *
 * @type {string}
 */
export const COLOR_UNIFORM_NAME = 'u_color';

/**
 * Directional light direction uniform name (world space).
 * Vector points from surface to the light (towards the light).
 *
 * @type {string}
 */
export const LIGHT_DIRECTION_UNIFORM_NAME = 'u_lightDirection';

/**
 * Camera position uniform name (world space).
 *
 * @type {string}
 */
export const CAMERA_POSITION_UNIFORM_NAME = 'u_cameraPosition';

/**
 * Ambient strength uniform name.
 *
 * @type {string}
 */
export const AMBIENT_STRENGTH_UNIFORM_NAME = 'u_ambientStrength';

/**
 * Opacity uniform name.
 *
 * @type {string}
 */
export const OPACITY_UNIFORM_NAME = 'u_opacity';

/**
 * Vector3 length (component count).
 *
 * @type {number}
 */
export const VECTOR3_ELEMENT_COUNT = 3;

/**
 * Default diffuse/base color (RGB).
 *
 * @type {Float32Array}
 */
export const DEFAULT_COLOR = new Float32Array([0.85, 0.85, 0.85]);

/**
 * Default directional light direction in world space (points from surface to light).
 *
 * @type {Float32Array}
 */
export const DEFAULT_LIGHT_DIRECTION = new Float32Array([0.5, 0.7, 1.0]);

/**
 * Default ambient term strength.
 *
 * @type {number}
 */
export const DEFAULT_AMBIENT_STRENGTH = 0.2;

/**
 * Minimum allowed squared length for a direction vector. Used to reject a zero-length direction.
 *
 * @type {number}
 */
const MIN_DIRECTION_LENGTH_SQUARED = 0.0;

/**
 * Numerator used when computing inverse vector length: `1 / sqrt(lengthSquared)`.
 *
 * @type {number}
 */
const INVERSE_LENGTH_NUMERATOR = 1.0;

/**
 * Options common to directional-light materials.
 *
 * @typedef {Object} DirectionalLightMaterialOptions
 * @property {Float32Array | number[]} [color]          - Diffuse RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space), normalized internally.
 * @property {number} [ambientStrength]                 - Ambient term multiplier.
 */

/**
 * Material base options used by `DirectionalLightMaterial`.
 *
 * @typedef {Object} DirectionalLightMaterialBaseOptions
 * @property {boolean} [ownsShaderProgram=true] - Whether this material owns and disposes the shader program.
 */

/**
 * Base class for materials that use a single directional light and require normals.
 *
 * Provides:
 * - shared constants (attribute locations, common uniform names)
 * - shared option parsing (color, lightDirection, ambientStrength)
 * - shared setters with validation
 * - a unified `apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition)` contract
 *
 * Subclasses may override `applyAdditionalUniforms(worldMatrix, cameraPosition)`.
 */
export class DirectionalLightMaterial extends Material {

    /**
     * Diffuse/base color (RGB).
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
     * Creates a new directional-light material.
     *
     * @param {WebGL2RenderingContext} webglContext                   - WebGL2 rendering context used to create GPU resources.
     * @param {ShaderProgram} shaderProgram                           - Compiled shader program instance.
     * @param {DirectionalLightMaterialOptions} [options]             - Common material options.
     * @param {DirectionalLightMaterialBaseOptions} [materialOptions] - Material base options.
     */
    constructor(webglContext, shaderProgram, options = {}, materialOptions = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError('`DirectionalLightMaterial` expects a WebGL2RenderingContext.');
        }

        if (!(shaderProgram instanceof ShaderProgram)) {
            throw new TypeError('`DirectionalLightMaterial` expects a ShaderProgram instance.');
        }

        DirectionalLightMaterial.#assertPlainObject('`DirectionalLightMaterial`', options);
        DirectionalLightMaterial.#assertPlainObject('`DirectionalLightMaterial`', materialOptions);
        const { ownsShaderProgram = true } = materialOptions;

        if (typeof ownsShaderProgram !== 'boolean') {
            throw new TypeError('`DirectionalLightMaterial` option "ownsShaderProgram" must be a boolean.');
        }

        super(webglContext, shaderProgram, { ownsShaderProgram });

        // Defaults:
        this.#color.set(DEFAULT_COLOR);
        this.setLightDirection(DEFAULT_LIGHT_DIRECTION);
        this.#ambientStrength = DEFAULT_AMBIENT_STRENGTH;

        // Options:
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
     * Uploads per-object uniforms for a draw call. Unified contract for directional-light materials.
     *
     * Renderer passes:
     * - finalMatrix (view projection * world)
     * - worldMatrix
     * - worldInverseTransposeMatrix
     * - cameraPosition
     *
     * @param {Float32Array} finalMatrix                 - View projection * world matrix.
     * @param {Float32Array} worldMatrix                 - World matrix.
     * @param {Float32Array} worldInverseTransposeMatrix - `(world ^ -1) ^ T` used to transform normals.
     * @param {Float32Array} cameraPosition              - Camera position, world space.
     */
    apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition) {
        this.shaderProgram.setMatrix4(FINAL_MATRIX_UNIFORM_NAME, finalMatrix);
        this.shaderProgram.setMatrix4(WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME, worldInverseTransposeMatrix);
        this.shaderProgram.setVector3(COLOR_UNIFORM_NAME, this.#color);
        this.shaderProgram.setVector3(LIGHT_DIRECTION_UNIFORM_NAME, this.#lightDirection);
        this.shaderProgram.setFloat(AMBIENT_STRENGTH_UNIFORM_NAME, this.#ambientStrength);
        this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME, this.opacity);
        this.applyAdditionalUniforms(worldMatrix, cameraPosition);
    }

    /**
     * Hook for subclasses to upload additional per-object uniforms.
     * Default implementation in this class does nothing.
     *
     * @param {Float32Array} worldMatrix    - World matrix.
     * @param {Float32Array} cameraPosition - Camera position, world space.
     * @protected
     */
    applyAdditionalUniforms(worldMatrix, cameraPosition) {
        void worldMatrix;
        void cameraPosition;
    }

    /**
     * Sets the diffuse/base RGB color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     */
    setColor(color) {
        DirectionalLightMaterial.assertVector3('`DirectionalLightMaterial.setColor`', color);
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
        DirectionalLightMaterial.assertVector3('`DirectionalLightMaterial.setLightDirection`', direction);
        const directionX = direction[0];
        const directionY = direction[1];
        const directionZ = direction[2];

        const directionLengthSquared =
            directionX * directionX +
            directionY * directionY +
            directionZ * directionZ;

        if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= MIN_DIRECTION_LENGTH_SQUARED) {
            throw new TypeError('`DirectionalLightMaterial.setLightDirection` expects a non-zero finite vector.');
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
            throw new TypeError('`DirectionalLightMaterial.setAmbientStrength` expects a finite number.');
        }

        this.#ambientStrength = value;
    }

    /**
     * Returns the internal diffuse/base color buffer.
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
     */
    static assertVector3(methodName, vector3) {
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

    /**
     * Validates a plain options object.
     *
     * @param {string} methodName - Method or class name for error messages.
     * @param {Object} object     - Object to validate.
     * @private
     */
    static #assertPlainObject(methodName, object) {
        if (object === null || typeof object !== 'object' || Array.isArray(object)) {
            throw new TypeError(`${methodName} expects an options object (plain object).`);
        }
    }
}
