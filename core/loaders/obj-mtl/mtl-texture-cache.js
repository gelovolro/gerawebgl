import { ECMASCRIPT_TYPEOF_RESULTS } from '../../constants/ecmascript-types.js';
import { Texture2D }                 from '../../texture/texture2d.js';

/**
 * Error message for invalid WebGL context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`MtlTextureCache` expects a `WebGL2RenderingContext`.';

/**
 * Error message for invalid texture URL.
 *
 * @type {string}
 */
const ERROR_TEXTURE_URL_TYPE = '`MtlTextureCache.getTexture` expects `url` as a string.';

/**
 * Error message for invalid output list.
 *
 * @type {string}
 */
const ERROR_OUTPUT_LIST_TYPE = '`MtlTextureCache.getTexture` expects `output` as an array.';

/**
 * Error message for invalid texture options.
 *
 * @type {string}
 */
const ERROR_OPTIONS_TYPE = '`MtlTextureCache.getTexture` expects `options` as a plain object.';

/**
 * Error message for invalid clamp option.
 *
 * @type {string}
 */
const ERROR_CLAMP_OPTION_TYPE = '`MtlTextureCache.getTexture` expects `options.clamp` as a boolean.';

/**
 * Error message for invalid wrapS option.
 *
 * @type {string}
 */
const ERROR_WRAP_S_OPTION_TYPE = '`MtlTextureCache.getTexture` expects `options.wrapS` as a number.';

/**
 * Error message for invalid wrapT option.
 *
 * @type {string}
 */
const ERROR_WRAP_T_OPTION_TYPE = '`MtlTextureCache.getTexture` expects `options.wrapT` as a number.';

/**
 * Separator used to build cache keys.
 *
 * @type {string}
 */
const CACHE_KEY_SEPARATOR = '|';

/**
 * Caches the textures by the normalized URL.
 */
export class MtlTextureCache {

    /**
     * WebGL2 rendering context, used to create the textures.
     *
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglContext;

    /**
     * Cache map of textures by URL.
     *
     * @type {Map<string, Texture2D>}
     * @private
     */
    #cache = new Map();

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @throws {TypeError} When `webglContext` is not `WebGL2RenderingContext`.
     */
    constructor(webglContext) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE);
        }

        this.#webglContext = webglContext;
    }

    /**
     * Returns cached or newly loaded texture.
     *
     * @param {string} url                      - Texture URL.
     * @param {Texture2D[]} output              - Output list of created textures.
     * @param {Object} [options]                - Texture options.
     * @param {boolean} [options.clamp = false] - When true, uses `clamp-to-edge` on both S and T-axes.
     * @param {number} [options.wrapS]          - Optional wrap mode for S-axis.
     * @param {number} [options.wrapT]          - Optional wrap mode for T-axis.
     * @returns {Promise<Texture2D>}            - Promise, that resolves with the cached or newly created `Texture2D` instance for the given URL.
     * @throws {TypeError} When url or output are invalid.
     */
    async getTexture(url, output, options = {}) {
        if (typeof url !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_TEXTURE_URL_TYPE);
        }

        if (!Array.isArray(output)) {
            throw new TypeError(ERROR_OUTPUT_LIST_TYPE);
        }

        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(ERROR_OPTIONS_TYPE);
        }

        const { clamp = false, wrapS, wrapT } = options;

        if (typeof clamp !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(ERROR_CLAMP_OPTION_TYPE);
        }

        if (wrapS !== undefined && typeof wrapS !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError(ERROR_WRAP_S_OPTION_TYPE);
        }

        if (wrapT !== undefined && typeof wrapT !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError(ERROR_WRAP_T_OPTION_TYPE);
        }

        const resolvedWrapS = wrapS !== undefined ? wrapS : (clamp ? this.#webglContext.CLAMP_TO_EDGE : this.#webglContext.REPEAT);
        const resolvedWrapT = wrapT !== undefined ? wrapT : (clamp ? this.#webglContext.CLAMP_TO_EDGE : this.#webglContext.REPEAT);
        const cacheKey      = MtlTextureCache.#buildCacheKey(url, resolvedWrapS, resolvedWrapT);

        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey);
        }

        const texture = new Texture2D(this.#webglContext, {
            wrapS : resolvedWrapS,
            wrapT : resolvedWrapT
        });

        await texture.loadFromUrl(url);
        this.#cache.set(cacheKey, texture);
        output.push(texture);
        return texture;
    }

    /**
     * Builds a cache key for texture lookup.
     *
     * @param {string} url   - Texture URL.
     * @param {number} wrapS - Wrap mode for S-axis.
     * @param {number} wrapT - Wrap mode for T-axis.
     * @returns {string}     - Cache key.
     * @private
     */
    static #buildCacheKey(url, wrapS, wrapT) {
        return String(url) + CACHE_KEY_SEPARATOR + String(wrapS) + CACHE_KEY_SEPARATOR + String(wrapT);
    }
}
