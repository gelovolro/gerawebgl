import { ShaderProgram } from '../shader/shader-program.js';

/**
 * Base material that owns a shader program and wireframe flag.
 */
export class Material {
    /** @type {WebGL2RenderingContext} */
    #webglContext;

    /** @type {ShaderProgram} */
    #shaderProgram;

    /** @type {boolean} */
    #wireframeEnabled = false;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
     * @param {ShaderProgram} shaderProgram - Compiled and linked shader program used by this material for rendering.
     */
    constructor(webglContext, shaderProgram) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError('Material expects a WebGL2RenderingContext.');
        }

        if (!(shaderProgram instanceof ShaderProgram)) {
            throw new TypeError('Material expects a ShaderProgram instance.');
        }

        this.#webglContext  = webglContext;
        this.#shaderProgram = shaderProgram;
    }

    /**
     * @returns {WebGL2RenderingContext}
     */
    get webglContext() {
        return this.#webglContext;
    }

    /**
     * @returns {ShaderProgram}
     */
    get shaderProgram() {
        return this.#shaderProgram;
    }

    /**
     * Makes this material's shader program active.
     */
    use() {
        this.#shaderProgram.use();
    }

    /**
     * Enables or disables wireframe rendering.
     *
     * @param {boolean} enabled - When true, switches material to wireframe mode. When false, uses solid rendering.
     */
    setWireframeEnabled(enabled) {
        this.#wireframeEnabled = Boolean(enabled);
    }

    /**
     * Toggles wireframe mode.
     */
    toggleWireframe() {
        this.#wireframeEnabled = !this.#wireframeEnabled;
    }

    /**
     * @returns {boolean}
     */
    isWireframeEnabled() {
        return this.#wireframeEnabled;
    }
}
