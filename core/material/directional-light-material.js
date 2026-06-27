import { ECMASCRIPT_TYPEOF_RESULTS }
    from '../constants/ecmascript-types.js';

import { DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES }
    from '../exception-messages/directional-light-material.js';

import * as LightConstants    from '../constants/light.js';
import * as MaterialConstants from '../constants/directional-light-material.js';
import { Material }           from './material.js';
import { ShaderProgram }      from '../shader/shader-program.js';

/**
 * Options common to directional-light materials.
 *
 * @typedef {Object} DirectionalLightMaterialOptions
 * @property {Float32Array | number[]} [color]          - Diffuse RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space), normalized internally.
 * @property {number} [ambientStrength]                 - Ambient term multiplier.
 * @property {number} [directionalStrength]             - Directional light strength multiplier.
 * @property {boolean | number} [lightingEnabled]       - Lighting enabled flag (boolean or 0..1 float).
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
    #color = new Float32Array(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT);

    /**
     * Directional light direction (world space, normalized).
     *
     * @type {Float32Array}
     * @private
     */
    #lightDirection = new Float32Array(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT);

    /**
     * Ambient term multiplier.
     *
     * @type {number}
     * @private
     */
    #ambientStrength = LightConstants.LIGHT_AMBIENT.DEFAULT_STRENGTH;

    /**
     * Directional strength multiplier.
     *
     * @type {number}
     * @private
     */
    #directionalStrength = LightConstants.LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;

    /**
     * Lighting enabled flag stored as a float.
     *
     * @type {number}
     * @private
     */
    #lightingEnabled = MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.DEFAULT_LIGHTING_ENABLED;

    /**
     * Creates a new directional-light material.
     *
     * @param {WebGL2RenderingContext} webglContext                   - WebGL2 rendering context used to create the GPU resources.
     * @param {ShaderProgram} shaderProgram                           - Compiled shader program instance.
     * @param {DirectionalLightMaterialOptions} [options]             - Common material options.
     * @param {DirectionalLightMaterialBaseOptions} [materialOptions] - Material base options.
     */
    constructor(webglContext, shaderProgram, options = {}, materialOptions = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.WEBGL_CONTEXT_TYPE);
        }

        if (!(shaderProgram instanceof ShaderProgram)) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.SHADER_PROGRAM_TYPE);
        }

        DirectionalLightMaterial.#assertPlainObject('`DirectionalLightMaterial`', options);
        DirectionalLightMaterial.#assertPlainObject('`DirectionalLightMaterial`', materialOptions);
        const { ownsShaderProgram = true } = materialOptions;

        if (typeof ownsShaderProgram !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.OWNS_SHADER_PROGRAM_TYPE);
        }

        super(webglContext, shaderProgram, { ownsShaderProgram });

        this.#color.set(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR);
        this.setLightDirection(LightConstants.LIGHT_DIRECTIONAL_DEFAULT_DIRECTION);
        this.#ambientStrength     = LightConstants.LIGHT_AMBIENT.DEFAULT_STRENGTH;
        this.#directionalStrength = LightConstants.LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;

        const {
            color,
            lightDirection,
            ambientStrength,
            directionalStrength,
            lightingEnabled
        } = options;

        if (color !== undefined) {
            this.setColor(color);
        }

        if (lightDirection !== undefined) {
            this.setLightDirection(lightDirection);
        }

        if (ambientStrength !== undefined) {
            this.setAmbientStrength(ambientStrength);
        }

        if (directionalStrength !== undefined) {
            this.setDirectionalStrength(directionalStrength);
        }

        if (lightingEnabled !== undefined) {
            this.setLightingEnabled(lightingEnabled);
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
        this.shaderProgram.setMatrix4(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX, finalMatrix);
        this.shaderProgram.setMatrix4(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX, worldInverseTransposeMatrix);
        this.shaderProgram.setVector3(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR, this.#color);
        this.shaderProgram.setVector3(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION, this.#lightDirection);
        this.shaderProgram.setFloat(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH, this.#ambientStrength);
        this.shaderProgram.setFloat(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH, this.#directionalStrength);
        this.shaderProgram.setFloat(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED, this.#lightingEnabled);
        this.shaderProgram.setFloat(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY, this.opacity);
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

        if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= LightConstants.LIGHT_DIRECTIONAL.MIN_DIRECTION_LENGTH_SQUARED) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHT_DIRECTION_LENGTH);
        }

        const inverseDirectionLength = LightConstants.LIGHT_DIRECTIONAL.INVERSE_LENGTH_NUMERATOR / Math.sqrt(directionLengthSquared);
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
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.AMBIENT_STRENGTH_TYPE);
        }

        this.#ambientStrength = value;
    }

    /**
     * Sets directional strength multiplier.
     *
     * @param {number} value - Directional strength multiplier.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     */
    setDirectionalStrength(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.DIRECTIONAL_STRENGTH_TYPE);
        }

        this.#directionalStrength = value;
    }

    /**
     * Enables or disables the directional light contribution.
     *
     * @param {boolean} enabled - Whether directional lighting should be enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     */
    setDirectionalEnabled(enabled) {
        if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.DIRECTIONAL_ENABLED_TYPE);
        }

        this.#directionalStrength = enabled ? LightConstants.LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH : LightConstants.LIGHT_DIRECTIONAL.MIN_DIRECTIONAL_STRENGTH;
    }

    /**
     * Sets lighting enabled state.
     *
     * @param {boolean | number} enabled - Boolean or a [0..1] numeric flag.
     * @returns {void}
     * @throws {TypeError}  When the value type is invalid.
     * @throws {RangeError} When the value is outside [0..1].
     */
    setLightingEnabled(enabled) {
        if (typeof enabled === ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            this.#lightingEnabled = enabled ? MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.FLOAT_TRUE : MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.FLOAT_FALSE;
            return;
        }

        if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(enabled)) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHTING_ENABLED_TYPE);
        }

        if (enabled < MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.MIN_LIGHTING_ENABLED || enabled > MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.MAX_LIGHTING_ENABLED) {
            throw new RangeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHTING_ENABLED_RANGE);
        }

        this.#lightingEnabled = enabled;
    }

    /**
     * @returns {boolean} - Returns current lighting enabled state.
     */
    isLightingEnabled() {
        return this.#lightingEnabled > MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.LIGHTING_ENABLED_THRESHOLD;
    }

    /**
     * @returns {Float32Array} - Returns the internal diffuse/base color buffer.
     */
    get color() {
        return this.#color;
    }

    /**
     * @returns {Float32Array} - Returns the internal normalized light direction buffer.
     */
    get lightDirection() {
        return this.#lightDirection;
    }

    /**
     * @returns {number} - Ambient strength multiplier.
     */
    get ambientStrength() {
        return this.#ambientStrength;
    }

    /**
     * @returns {number} - Returns the directional strength multiplier value.
     */
    getDirectionalStrength() {
        return this.#directionalStrength;
    }

    /**
     * @returns {number} - Getter for the directional strength multiplier.
     */
    get directionalStrength() {
        return this.#directionalStrength;
    }

    /**
     * Formats a directional-light material exception message template.
     *
     * @param {string} messageTemplate - Message template with a `{methodName}` token.
     * @param {string} methodName      - Method name to inject.
     * @returns {string}               - Formatted exception message.
     * @private
     */
    static #formatExceptionMessage(messageTemplate, methodName) {
        return messageTemplate.replace('{methodName}', methodName);
    }

    /**
     * Validates a vector3-like input.
     *
     * @param {string} methodName               - Method name for error messages.
     * @param {Float32Array | number[]} vector3 - Vector to validate.
     */
    static assertVector3(methodName, vector3) {
        if (!Array.isArray(vector3) && !(vector3 instanceof Float32Array)) {
            throw new TypeError(DirectionalLightMaterial.#formatExceptionMessage(
                DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.VECTOR3_TYPE,
                methodName
            ));
        }

        if (vector3.length !== MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(DirectionalLightMaterial.#formatExceptionMessage(
                DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.VECTOR3_COMPONENTS,
                methodName
            ));
        }

        if (!Number.isFinite(vector3[0]) || !Number.isFinite(vector3[1]) || !Number.isFinite(vector3[2])) {
            throw new TypeError(DirectionalLightMaterial.#formatExceptionMessage(
                DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.VECTOR3_COMPONENTS_FINITE,
                methodName
            ));
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
        if (object === null || typeof object !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(object)) {
            throw new TypeError(DirectionalLightMaterial.#formatExceptionMessage(
                DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT,
                methodName
            ));
        }
    }
}
