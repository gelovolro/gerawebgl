import { ShaderProgram } from '../shader/shader-program.js';

/**
 * Options used by Material.
 *
 * @typedef {Object} MaterialOptions
 * @property {boolean} [ownsShaderProgram=false] - Whether this material owns and disposes the shader program.
 */

/**
 * Base material that owns a shader program and wireframe flag.
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
     * When enabled, the renderer should draw geometry using wireframe indices (lines) instead of solid triangles.
     *
     * @type {boolean}
     * @private
     */
    #wireframeEnabled = false;

    /**
     * Ownership flag. When true, this material is responsible for disposing the shader program.
     *
     * @type {boolean}
     * @private
     */
    #ownsShaderProgram = false;

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
            throw new TypeError('Material expects a WebGL2RenderingContext.');
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('Material expects an options object (plain object).');
        }

        const { ownsShaderProgram = false } = options;

        if (typeof ownsShaderProgram !== 'boolean') {
            throw new TypeError('Material option "ownsShaderProgram" must be a boolean.');
        }

        if (!(shaderProgram instanceof ShaderProgram)) {
            throw new TypeError('Material expects a ShaderProgram instance.');
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
            throw new Error('Material has been disposed and can no longer be used.');
        }
    }
}
