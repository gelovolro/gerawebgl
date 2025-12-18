import { Material }      from './material.js';
import { ShaderProgram } from '../shader/shader-program.js';
import { Texture2D }     from '../texture/texture2d.js';

/**
 * Attribute location used by vec3 position.
 *
 * @type {number}
 */
const POSITION_ATTRIBUTE_LOCATION = 0;

/**
 * Attribute location used by vec2 UV coordinates.
 *
 * @type {number}
 */
const UV_ATTRIBUTE_LOCATION = 2;

/**
 * Default texture unit index used for binding the diffuse texture.
 *
 * @type {number}
 */
const DEFAULT_TEXTURE_UNIT_INDEX = 0;

/**
 * Minimal allowed texture unit index.
 * Zero corresponds to `TEXTURE0`.
 *
 * @type {number}
 */
const MIN_TEXTURE_UNIT_INDEX = 0;

/**
 * Name of the matrix uniform in the shader.
 *
 * @type {string}
 */
const MATRIX_UNIFORM_NAME = 'u_matrix';

/**
 * Name of the `sampler2D` uniform in the shader.
 *
 * @type {string}
 */
const DIFFUSE_TEXTURE_UNIFORM_NAME = 'u_diffuseTexture';

/**
 * GLSL vertex shader source code.
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION}) in vec3 a_position;
layout(location = ${UV_ATTRIBUTE_LOCATION}) in vec2 a_uv;
uniform mat4 ${MATRIX_UNIFORM_NAME};
out vec2 v_uv;

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_uv = a_uv;
}
`;

/**
 * GLSL fragment shader source code.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D ${DIFFUSE_TEXTURE_UNIFORM_NAME};
out vec4 outColor;

void main() {
    outColor = texture(${DIFFUSE_TEXTURE_UNIFORM_NAME}, v_uv);
}
`;

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
    #ownsDiffuseTexture = false;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create shaders and upload uniforms.
     * @param {TexturedMaterialOptions} [options]   - Optional configuration for the material.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('TexturedMaterial expects options as an object.');
        }

        const {
            texture,
            textureUnitIndex  = DEFAULT_TEXTURE_UNIT_INDEX,
            ownsTexture       = false,
            ownsShaderProgram = true
        } = options;

        if (texture !== undefined && !(texture instanceof Texture2D)) {
            throw new TypeError('`TexturedMaterial` expects `options.texture` as `Texture2D`.');
        }

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < MIN_TEXTURE_UNIT_INDEX) {
            throw new TypeError('`TexturedMaterial` expects `options.textureUnitIndex` as a non-negative integer.');
        }

        if (typeof ownsTexture !== 'boolean') {
            throw new TypeError('`TexturedMaterial` expects `options.ownsTexture` as boolean.');
        }

        if (typeof ownsShaderProgram !== 'boolean') {
            throw new TypeError('`TexturedMaterial` expects `options.ownsShaderProgram` as boolean.');
        }

        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram, { ownsShaderProgram });

        this.#diffuseTexture     = texture || new Texture2D(webglContext);
        this.#textureUnitIndex   = textureUnitIndex;
        this.#ownsDiffuseTexture = ownsTexture || !texture;
    }

    /**
     * Uploads uniforms and binds the texture for a draw call.
     *
     * @param {Float32Array} matrix4 - Model-View-Projection matrix (4x4).
     */
    apply(matrix4) {
        this.use();
        this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME, matrix4);
        this.shaderProgram.setTexture2D(DIFFUSE_TEXTURE_UNIFORM_NAME, this.#diffuseTexture, this.#textureUnitIndex);
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
            throw new TypeError('`TexturedMaterial.setDiffuseTexture` expects texture as `Texture2D`.');
        }

        if (options === null || typeof options !== 'object') {
            throw new TypeError('`TexturedMaterial.setDiffuseTexture` expects options as an object.');
        }

        const { ownsTexture = false } = options;

        if (typeof ownsTexture !== 'boolean') {
            throw new TypeError('`TexturedMaterial.setDiffuseTexture` expects options.ownsTexture as boolean.');
        }

        if (this.#ownsDiffuseTexture) {
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
}
