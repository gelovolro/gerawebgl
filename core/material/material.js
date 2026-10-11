import * as SharedMaterialConstants    from '../constants/material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }   from '../constants/ecmascript-types.js';
import { MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/material.js';
import { ShaderProgram }               from '../shader/shader-program.js';

/**
 * Options used by Material.
 *
 * @typedef {Object} MaterialOptions
 * @property {boolean} [ownsShaderProgram=false] - Whether this material owns and disposes the shader program.
 */

/**
 * Base material that owns a shader program, opacity and wireframe flag.
 */
export class Material {

    /**
     * WebGL2 rendering context used to create and manage GPU resources.
     *
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglContext;

    /**
     * Shader program used by this material to render geometry.
     *
     * @type {ShaderProgram}
     * @private
     */
    #shaderProgram;

    /**
     * Opacity multiplier (alpha) in [0..1].
     *
     * @type {number}
     * @private
     */
    #opacity = SharedMaterialConstants.MATERIAL_OPACITY.DEFAULT;

    /**
     * When enabled, the renderer should draw geometry using wireframe indices (lines) instead of solid triangles.
     *
     * @type {boolean}
     * @private
     */
    #wireframeEnabled = SharedMaterialConstants.MATERIAL_DEFAULTS.WIREFRAME_ENABLED;

    /**
     * Ownership flag. When true, this material is responsible for disposing the shader program.
     *
     * @type {boolean}
     * @private
     */
    #ownsShaderProgram = SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_SHADER_PROGRAM;

    /**
     * Indicates whether the material has been disposed and can no longer be used.
     *
     * @type {boolean}
     * @private
     */
    #isDisposed = false;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
     * @param {ShaderProgram} shaderProgram         - Compiled and linked shader program used by this material for rendering.
     * @param {MaterialOptions} [options]           - Material options.
     */
    constructor(webglContext, shaderProgram, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(MATERIAL_EXCEPTION_MESSAGES.WEBGL_CONTEXT_TYPE);
        }

        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT);
        }

        const { ownsShaderProgram = SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_SHADER_PROGRAM } = options;

        if (typeof ownsShaderProgram !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(MATERIAL_EXCEPTION_MESSAGES.OWNERSHIP_TYPE);
        }

        if (!(shaderProgram instanceof ShaderProgram)) {
            throw new TypeError(MATERIAL_EXCEPTION_MESSAGES.SHADER_PROGRAM_TYPE);
        }

        this.#webglContext      = webglContext;
        this.#shaderProgram     = shaderProgram;
        this.#ownsShaderProgram = ownsShaderProgram;
    }

    /**
     * @returns {WebGL2RenderingContext} - WebGL2 rendering context used by this material.
     */
    get webglContext() {
        this.#assertNotDisposed();
        return this.#webglContext;
    }

    /**
     * @returns {ShaderProgram} - Shader program used by this material for rendering.
     */
    get shaderProgram() {
        this.#assertNotDisposed();
        return this.#shaderProgram;
    }

    /**
     * Returns the current opacity multiplier.
     *
     * @returns {number}
     */
    get opacity() {
        this.#assertNotDisposed();
        return this.#opacity;
    }

    /**
     * Sets opacity multiplier (alpha).
     *
     * @param {number} value - Opacity multiplier in [0..1].
     */
    setOpacity(value) {
        this.#assertNotDisposed();

        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(MATERIAL_EXCEPTION_MESSAGES.OPACITY_TYPE);
        }

        if (value < SharedMaterialConstants.MATERIAL_OPACITY.MIN || value > SharedMaterialConstants.MATERIAL_OPACITY.MAX) {
            throw new RangeError(MATERIAL_EXCEPTION_MESSAGES.OPACITY_RANGE);
        }

        this.#opacity = value;
    }

    /**
     * @returns {boolean} True, when opacity is lower than `1.0`.
     */
    isTransparent() {
        this.#assertNotDisposed();
        return this.#opacity < SharedMaterialConstants.MATERIAL_OPACITY.MAX;
    }

    /**
     * Indicates whether this material has been disposed.
     *
     * @returns {boolean} - True, when this material has been disposed and can no longer be used.
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Makes this material's shader program active.
     */
    use() {
        this.#assertNotDisposed();
        this.#shaderProgram.use();
    }

    /**
     * Enables or disables wireframe rendering.
     *
     * @param {boolean} enabled - When true, switches material to wireframe mode. When false, uses solid rendering.
     */
    setWireframeEnabled(enabled) {
        this.#assertNotDisposed();
        this.#wireframeEnabled = Boolean(enabled);
    }

    /**
     * Toggles wireframe mode.
     */
    toggleWireframe() {
        this.#assertNotDisposed();
        this.#wireframeEnabled = !this.#wireframeEnabled;
    }

    /**
     * @returns {boolean} - True, when wireframe rendering is enabled and false for solid rendering.
     */
    isWireframeEnabled() {
        this.#assertNotDisposed();
        return this.#wireframeEnabled;
    }

    /**
     * Releases GPU resources owned by this material.
     * If ownsShaderProgram is true, the underlying shader program will be disposed as well.
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        if (this.#ownsShaderProgram) {
            this.#shaderProgram.dispose();
        }

        this.#isDisposed = true;
    }

    /**
     * @private
     */
    #assertNotDisposed() {
        if (this.#isDisposed) {
            throw new Error(MATERIAL_EXCEPTION_MESSAGES.INSTANCE_DISPOSED);
        }
    }
}
