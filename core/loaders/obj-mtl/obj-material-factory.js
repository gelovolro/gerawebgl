import { LambertMaterial }     from '../../material/lambert-material.js';
import { PhongMaterial }       from '../../material/phong-material.js';
import { TexturedMaterial }    from '../../material/textured-material.js';
import { VertexColorMaterial } from '../../material/vertex-color-material.js';
import { MtlTextureCache }     from './mtl-texture-cache.js';

/**
 * Default texture unit index.
 *
 * @type {number}
 */
const DEFAULT_TEXTURE_UNIT_INDEX = 0;

/**
 * Default opacity for materials.
 *
 * @type {number}
 */
const DEFAULT_OPACITY = 1.0;

/**
 * Number of components for RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Default diffuse color for materials (white color).
 *
 * @type {Float32Array}
 */
const DEFAULT_DIFFUSE_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default shininess, when `Ns` is missing.
 *
 * @type {number}
 */
const DEFAULT_SHININESS = 16.0;

/**
 * Minimum shininess value.
 *
 * @type {number}
 */
const MIN_SHININESS = 1.0;

/**
 * Maximum shininess value.
 *
 * @type {number}
 */
const MAX_SHININESS = 128.0;

/**
 * Zero value, used for the numeric comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Index, used to reference the first element in arrays.
 *
 * @type {number}
 */
const FIRST_INDEX = 0;

/**
 * Index, used to reference the second element in arrays.
 *
 * @type {number}
 */
const SECOND_INDEX = 1;

/**
 * Index, used to reference the third element in arrays.
 *
 * @type {number}
 */
const THIRD_INDEX = 2;

/**
 * Error message for invalid WebGL context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`ObjMaterialFactory` expects a `WebGL2RenderingContext`.';

/**
 * Error message for invalid options.
 *
 * @type {string}
 */
const ERROR_OPTIONS_TYPE = '`ObjMaterialFactory` expects options as a plain object.';

/**
 * Error message for invalid texture unit index.
 *
 * @type {string}
 */
const ERROR_TEXTURE_UNIT_INDEX_TYPE = '`ObjMaterialFactory` expects `textureUnitIndex` as a non-negative integer.';

/**
 * Error message for invalid default color.
 *
 * @type {string}
 */
const ERROR_DEFAULT_COLOR_TYPE = '`ObjMaterialFactory` expects `defaultColor` as `number[]` or `Float32Array`.';

/**
 * Error message for invalid default color length.
 *
 * @type {string}
 */
const ERROR_DEFAULT_COLOR_LENGTH = '`ObjMaterialFactory` expects `defaultColor` to have 3 components.';

/**
 * Error message for invalid texture cache.
 *
 * @type {string}
 */
const ERROR_TEXTURE_CACHE_TYPE = '`ObjMaterialFactory` expects `textureCache` as `MtlTextureCache`.';

/**
 * Error message for invalid textures output.
 *
 * @type {string}
 */
const ERROR_TEXTURES_OUTPUT_TYPE = '`ObjMaterialFactory.createMaterial` expects `textures` as an array.';

/**
 * String literal for typeof checks.
 *
 * @type {string}
 */
const TYPEOF_OBJECT = 'object';

/**
 * String literal for typeof checks (number).
 *
 * @type {string}
 */
const TYPEOF_NUMBER = 'number';

/**
 * Type definition for options used by `ObjMaterialFactory`.
 *
 * @typedef {Object} ObjMaterialFactoryOptions
 * @property {number} [textureUnitIndex = 0]          - Texture unit index for the textured materials.
 * @property {Float32Array | number[]} [defaultColor] - Default diffuse color.
 * @property {MtlTextureCache} [textureCache]         - Optional shared texture cache.
 */

/**
 * Factory, that creates the engine materials from the parsed MTL data.
 */
export class ObjMaterialFactory {

    /**
     * WebGL2 rendering context used to create the materials.
     *
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglContext;

    /**
     * Texture unit index, used for the textured materials.
     *
     * @type {number}
     * @private
     */
    #textureUnitIndex;

    /**
     * Default diffuse color used, when no material info is available.
     *
     * @type {Float32Array}
     * @private
     */
    #defaultColor = new Float32Array(DEFAULT_DIFFUSE_COLOR);

    /**
     * Texture cache, used for loading the textures.
     *
     * @type {MtlTextureCache}
     * @private
     */
    #textureCache;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {ObjMaterialFactoryOptions} [options] - Factory options.
     * @throws {TypeError} When the inputs are invalid.
     */
    constructor(webglContext, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE);
        }

        if (options === null || typeof options !== TYPEOF_OBJECT || Array.isArray(options)) {
            throw new TypeError(ERROR_OPTIONS_TYPE);
        }

        const {
            textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX,
            defaultColor,
            textureCache
        } = options;

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE) {
            throw new TypeError(ERROR_TEXTURE_UNIT_INDEX_TYPE);
        }

        if (defaultColor !== undefined) {
            if (!Array.isArray(defaultColor) && !(defaultColor instanceof Float32Array)) {
                throw new TypeError(ERROR_DEFAULT_COLOR_TYPE);
            }

            if (defaultColor.length !== COLOR_COMPONENT_COUNT) {
                throw new TypeError(ERROR_DEFAULT_COLOR_LENGTH);
            }

            this.#defaultColor.set(defaultColor);
        }

        if (textureCache !== undefined && !(textureCache instanceof MtlTextureCache)) {
            throw new TypeError(ERROR_TEXTURE_CACHE_TYPE);
        }

        this.#webglContext     = webglContext;
        this.#textureUnitIndex = textureUnitIndex;
        this.#textureCache     = textureCache || new MtlTextureCache(webglContext);
    }

    /**
     * Creates a material instance, based on MTL data.
     *
     * @param {Object | null} definition          - Parsed material definition.
     * @param {string | null} textureUrl          - Resolved diffuse texture URL.
     * @param {Array} textures                    - Output list of created textures.
     * @param {boolean} [useVertexColors = false] - Whether the vertex colors are available.
     * @returns {Promise<LambertMaterial | PhongMaterial | TexturedMaterial | VertexColorMaterial>} - Promise, that resolves with the created material instance, based on the parsed MTL definition and the available inputs.
     * @throws {TypeError} When textures output is invalid.
     */
    async createMaterial(definition, textureUrl, textures, useVertexColors = false) {
        if (!Array.isArray(textures)) {
            throw new TypeError(ERROR_TEXTURES_OUTPUT_TYPE);
        }

        const opacity = definition ? definition.opacity : DEFAULT_OPACITY;

        if (definition && definition.diffuseMap && textureUrl) {
            const texture  = await this.#textureCache.getTexture(textureUrl, textures);
            const material = new TexturedMaterial(this.#webglContext, {
                texture,
                ownsTexture      : false,
                textureUnitIndex : this.#textureUnitIndex
            });

            material.setOpacity(opacity);
            return material;
        }

        if (useVertexColors && !this.#hasSpecularInfo(definition)) {
            const material = new VertexColorMaterial(this.#webglContext);
            material.setOpacity(opacity);
            return material;
        }

        if (this.#hasSpecularInfo(definition)) {
            const diffuseColor  = definition ? definition.diffuseColor : this.#defaultColor;
            const specularColor = definition ? definition.specularColor : new Float32Array(COLOR_COMPONENT_COUNT);
            const shininess     = ObjMaterialFactory.#clampShininess(definition ? definition.specularExponent : null);
            const material      = new PhongMaterial(this.#webglContext, {
                color : diffuseColor,
                specularColor,
                shininess
            });

            material.setOpacity(opacity);
            return material;
        }

        if (definition) {
            const material = new LambertMaterial(this.#webglContext, { color: definition.diffuseColor });
            material.setOpacity(opacity);
            return material;
        }

        const fallbackMaterial = new LambertMaterial(this.#webglContext, { color: this.#defaultColor });
        fallbackMaterial.setOpacity(opacity);
        return fallbackMaterial;
    }

    /**
     * Determines whether the material has specular data.
     *
     * @param {Object | null} definition - Parsed material definition.
     * @returns {boolean}                - True, when the definition contains the specular exponent or the non-zero specular color.
     * @private
     */
    #hasSpecularInfo(definition) {
        if (!definition) {
            return false;
        }

        if (definition.specularExponent !== null) {
            return true;
        }

        const specular = definition.specularColor;
        return Boolean(specular && (specular[FIRST_INDEX] > ZERO_VALUE
            || specular[SECOND_INDEX] > ZERO_VALUE
            || specular[THIRD_INDEX] > ZERO_VALUE));
    }

    /**
     * Clamps the shininess value into the allowed range.
     *
     * @param {number | null} value - Specular exponent.
     * @returns {number}            - Clamped shininess value within the allowed range (falls back to the default, when input is invalid).
     * @private
     */
    static #clampShininess(value) {
        if (typeof value !== TYPEOF_NUMBER || !Number.isFinite(value)) {
            return DEFAULT_SHININESS;
        }

        return Math.min(Math.max(value, MIN_SHININESS), MAX_SHININESS);
    }
}
