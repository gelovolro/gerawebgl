import * as SharedMaterialConstants                      from '../constants/material.js';
import * as LightConstants                               from '../constants/light.js';
import * as MaterialConstants                            from '../constants/directional-light-material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                     from '../constants/ecmascript-types.js';
import { MATH_VECTOR3_INDEXES }                          from '../constants/math.js';
import { DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/directional-light-material.js';
import { ShaderProgram }                                 from '../shader/shader-program.js';
import { Material }                                      from './material.js';

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

        DirectionalLightMaterial.#assertPlainObject(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_CONTEXTS.CONSTRUCTOR, options);
        DirectionalLightMaterial.#assertPlainObject(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_CONTEXTS.CONSTRUCTOR, materialOptions);
        const { ownsShaderProgram = SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_GENERATED_SHADER_PROGRAM } = materialOptions;

        if (typeof ownsShaderProgram !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.OWNS_SHADER_PROGRAM_TYPE);
        }

        super(webglContext, shaderProgram, { ownsShaderProgram });

        try {
            this.#initialize(options);
        } catch (error) {
            if (ownsShaderProgram) {
                shaderProgram.dispose();
            }

            throw error;
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
        const shaderProgram = this.shaderProgram;
        const uniforms      = MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS;

        shaderProgram.setMatrix4(uniforms.FINAL_MATRIX, finalMatrix);
        shaderProgram.setMatrix4(uniforms.WORLD_INVERSE_TRANSPOSE_MATRIX, worldInverseTransposeMatrix);
        shaderProgram.setVector3(uniforms.COLOR, this.#color);
        shaderProgram.setVector3(uniforms.LIGHT_DIRECTION, this.#lightDirection);
        shaderProgram.setFloat(uniforms.AMBIENT_STRENGTH, this.#ambientStrength);
        shaderProgram.setFloat(uniforms.DIRECTIONAL_STRENGTH, this.#directionalStrength);
        shaderProgram.setFloat(uniforms.LIGHTING_ENABLED, this.#lightingEnabled);
        shaderProgram.setFloat(uniforms.OPACITY, this.opacity);

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
        DirectionalLightMaterial.assertVector3(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_CONTEXTS.COLOR, color);
        this.#color.set(color);
    }

    /**
     * Sets the light direction (world space). The direction is normalized internally.
     *
     * @param {Float32Array | number[]} direction - [x, y, z] direction vector (non-zero).
     */
    setLightDirection(direction) {
        DirectionalLightMaterial.assertVector3(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_CONTEXTS.LIGHT_DIRECTION, direction);
        const directionX = direction[MATH_VECTOR3_INDEXES.X];
        const directionY = direction[MATH_VECTOR3_INDEXES.Y];
        const directionZ = direction[MATH_VECTOR3_INDEXES.Z];

        const directionLengthSquared =
            directionX * directionX +
            directionY * directionY +
            directionZ * directionZ;

        if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= LightConstants.LIGHT_DIRECTIONAL.MIN_DIRECTION_LENGTH_SQUARED) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHT_DIRECTION_LENGTH);
        }

        const inverseDirectionLength = LightConstants.LIGHT_DIRECTIONAL.INVERSE_LENGTH_NUMERATOR / Math.sqrt(directionLengthSquared);
        this.#lightDirection[MATH_VECTOR3_INDEXES.X] = directionX * inverseDirectionLength;
        this.#lightDirection[MATH_VECTOR3_INDEXES.Y] = directionY * inverseDirectionLength;
        this.#lightDirection[MATH_VECTOR3_INDEXES.Z] = directionZ * inverseDirectionLength;
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
     * @throws {TypeError}     When the value is invalid.
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
     * @throws {TypeError}        When the value is invalid.
     */
    setDirectionalEnabled(enabled) {
        if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.DIRECTIONAL_ENABLED_TYPE);
        }

        const light = LightConstants.LIGHT_DIRECTIONAL;
        this.#directionalStrength = enabled ? light.DEFAULT_DIRECTIONAL_STRENGTH : light.MIN_DIRECTIONAL_STRENGTH;
    }

    /**
     * Sets lighting enabled state.
     *
     * @param {boolean | number} enabled - Boolean or a [0..1] numeric flag.
     * @returns {void}
     * @throws {TypeError}                 When the value type is invalid.
     * @throws {RangeError}                When the value is outside [0..1].
     */
    setLightingEnabled(enabled) {
        if (typeof enabled === ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            const floatFlags = SharedMaterialConstants.MATERIAL_BOOLEAN_FLOATS;
            this.#lightingEnabled = enabled ? floatFlags.TRUE : floatFlags.FALSE;
            return;
        }

        if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(enabled)) {
            throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHTING_ENABLED_TYPE);
        }

        if (enabled < MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.MIN_LIGHTING_ENABLED ||
            enabled > MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.MAX_LIGHTING_ENABLED) {
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
        return messageTemplate.replace(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_METHOD_TOKEN, () => methodName);
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

        if (!Number.isFinite(vector3[MATH_VECTOR3_INDEXES.X]) ||
            !Number.isFinite(vector3[MATH_VECTOR3_INDEXES.Y]) ||
            !Number.isFinite(vector3[MATH_VECTOR3_INDEXES.Z])) {
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

    /**
     * Initializes common colors and lighting before applying option overrides.
     *
     * @param {DirectionalLightMaterialOptions} options - Initial lighting settings.
     * @private
     */
    #initialize(options) {
        this.#color.set(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR);
        this.setLightDirection(LightConstants.LIGHT_DIRECTIONAL_DEFAULT_DIRECTION);
        this.#applyOptions(options);
    }

    /**
     * Applies only the lighting values supplied by the caller.
     *
     * @param {DirectionalLightMaterialOptions} options - Initial lighting settings.
     * @private
     */
    #applyOptions(options) {
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
}
