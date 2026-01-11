import { Texture2D } from '../../texture/texture2d.js';

/**
 * Error message for invalid WebGL context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`TextureCache` expects a `WebGL2RenderingContext`.';

/**
 * Error message for invalid texture URL.
 *
 * @type {string}
 */
const ERROR_TEXTURE_URL_TYPE = '`TextureCache.getTexture` expects `url` as a string.';

/**
 * Error message for invalid output list.
 *
 * @type {string}
 */
const ERROR_OUTPUT_LIST_TYPE = '`TextureCache.getTexture` expects `output` as an array.';

/**
 * String literal for typeof checks.
 *
 * @type {string}
 */
const TYPEOF_STRING = 'string';

/**
 * Caches textures by normalized URL.
 */
export class MtlTextureCache {

    /**
     * WebGL2 rendering context, used to create textures.
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
     * @param {string} url           - Texture URL.
     * @param {Texture2D[]} output   - Output list of created textures.
     * @returns {Promise<Texture2D>} - Promise, that resolves with the cached or newly created `Texture2D` instance for the given URL.
     * @throws {TypeError} When url or output are invalid.
     */
    async getTexture(url, output) {
        if (typeof url !== TYPEOF_STRING) {
            throw new TypeError(ERROR_TEXTURE_URL_TYPE);
        }

        if (!Array.isArray(output)) {
            throw new TypeError(ERROR_OUTPUT_LIST_TYPE);
        }

        if (this.#cache.has(url)) {
            return this.#cache.get(url);
        }

        const texture = new Texture2D(this.#webglContext);
        await texture.loadFromUrl(url);
        this.#cache.set(url, texture);
        output.push(texture);
        return texture;
    }
}
