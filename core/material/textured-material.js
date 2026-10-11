import * as SharedMaterialConstants             from '../constants/material.js';
import * as MaterialConstants                   from '../constants/textured-material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }            from '../constants/ecmascript-types.js';
import { TEXTURED_MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/textured-material.js';
import { ShaderProgram }                        from '../shader/shader-program.js';
import { Texture2D }                            from '../texture/texture2d.js';
import { Material }                             from './material.js';

/**
 * Options used by `TexturedMaterial` constructor.
 *
 * @typedef {Object} TexturedMaterialOptions
 * @property {Texture2D} [texture]                - Optional `Texture2D` instance.
 * @property {number} [textureUnitIndex = 0]      - Texture unit index used for binding.
 * @property {boolean} [ownsTexture = false]      - If true, dispose will dispose the texture.
 * @property {boolean} [ownsShaderProgram = true] - If true, dispose will dispose the shader program.
 */

/**
 * `TexturedMaterial` renders geometry using a single diffuse texture (sampler2D) and UV coordinates.
 */
export class TexturedMaterial extends Material {

    /**
     * Diffuse texture bound to the shader sampler.
     *
     * @type {Texture2D}
     * @private
     */
    #diffuseTexture;

    /**
     * WebGL texture unit index used to bind the diffuse texture (TEXTURE0 + unitIndex).
     *
     * @type {number}
     * @private
     */
    #textureUnitIndex;

    /**
     * Indicates whether this material owns the diffuse texture resource.
     * When true, `TexturedMaterial.dispose()` will dispose the texture.
     *
     * @type {boolean}
     * @private
     */
    #ownsDiffuseTexture = SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_TEXTURE;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create shaders and upload uniforms.
     * @param {TexturedMaterialOptions} [options]   - Optional configuration for the material.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT);
        }

        const sources       = MaterialConstants.TEXTURED_MATERIAL_SHADERS;
        const settings      = TexturedMaterial.#resolveOptions(options);
        const shaderProgram = new ShaderProgram(webglContext, sources.VERTEX, sources.FRAGMENT);
        const { texture, textureUnitIndex, ownsTexture, ownsShaderProgram } = settings;

        super(webglContext, shaderProgram, { ownsShaderProgram });

        try {
            this.#diffuseTexture     = texture || new Texture2D(webglContext);
            this.#textureUnitIndex   = textureUnitIndex;
            this.#ownsDiffuseTexture = ownsTexture || !texture;
        } catch (error) {
            // Construction failed, so even a non-owning material cannot return this program.
            shaderProgram.dispose();
            throw error;
        }
    }

    /**
     * Uploads uniforms and binds the texture for a draw call.
     *
     * @param {Float32Array} matrix4 - 'Model-View-Projection' matrix (4x4).
     */
    apply(matrix4) {
        this.use();
        const shaderProgram = this.shaderProgram;
        const uniforms      = SharedMaterialConstants.MATERIAL_UNIFORMS;
        shaderProgram.setMatrix4(uniforms.MATRIX, matrix4);
        shaderProgram.setTexture2D(MaterialConstants.TEXTURED_MATERIAL_UNIFORMS.DIFFUSE_TEXTURE, this.#diffuseTexture, this.#textureUnitIndex);
        shaderProgram.setFloat(uniforms.OPACITY, this.opacity);
    }

    /**
     * Returns the current diffuse texture.
     *
     * @returns {Texture2D}
     */
    get diffuseTexture() {
        return this.#diffuseTexture;
    }

    /**
     * Replaces the diffuse texture.
     *
     * @param {Texture2D} texture                     - New texture instance.
     * @param {Object} [options]                      - Optional ownership configuration.
     * @param {boolean} [options.ownsTexture = false] - If true, dispose will dispose the texture.
     */
    setDiffuseTexture(texture, options = {}) {
        if (!(texture instanceof Texture2D)) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.REPLACEMENT_TEXTURE_TYPE);
        }

        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.REPLACEMENT_OPTIONS_OBJECT);
        }

        const { ownsTexture = SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_TEXTURE } = options;

        if (typeof ownsTexture !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.REPLACEMENT_OWNERSHIP_TYPE);
        }

        if (this.#ownsDiffuseTexture && texture !== this.#diffuseTexture) {
            this.#diffuseTexture.dispose();
        }

        this.#diffuseTexture     = texture;
        this.#ownsDiffuseTexture = ownsTexture;
    }

    /**
     * Disposes GPU resources owned by the material.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }

        if (this.#ownsDiffuseTexture) {
            this.#diffuseTexture.dispose();
            this.#ownsDiffuseTexture = false;
        }

        super.dispose();
    }

    /**
     * Resolves and validates ownership and texture options before allocation.
     *
     * @param {TexturedMaterialOptions} options - Material options.
     * @returns {TexturedMaterialOptions}       - Resolved settings.
     * @private
     */
    static #resolveOptions(options) {
        const {
            texture,
            textureUnitIndex  = SharedMaterialConstants.MATERIAL_TEXTURE_UNITS.DEFAULT,
            ownsTexture       = SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_TEXTURE,
            ownsShaderProgram = SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_GENERATED_SHADER_PROGRAM
        } = options;

        if (texture !== undefined && !(texture instanceof Texture2D)) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.TEXTURE_TYPE);
        }

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < SharedMaterialConstants.MATERIAL_TEXTURE_UNITS.MIN) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.TEXTURE_UNIT_TYPE);
        }

        if (typeof ownsTexture !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.TEXTURE_OWNERSHIP_TYPE);
        }

        if (typeof ownsShaderProgram !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(TEXTURED_MATERIAL_EXCEPTION_MESSAGES.PROGRAM_OWNERSHIP_TYPE);
        }

        return { texture, textureUnitIndex, ownsTexture, ownsShaderProgram };
    }
}
