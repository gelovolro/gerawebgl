/**
 * Default width of a placeholder texture (in pixels).
 *
 * @type {number}
 */
const PLACEHOLDER_TEXTURE_WIDTH = 1;

/**
 * Default height of a placeholder texture (in pixels).
 *
 * @type {number}
 */
const PLACEHOLDER_TEXTURE_HEIGHT = 1;

/**
 * WebGL expects the border parameter of `texImage2D` to be `0`.
 *
 * @type {number}
 */
const TEXTURE_BORDER_VALUE = 0;

/**
 * Default mipmap level used by `texImage2D`.
 *
 * @type {number}
 */
const BASE_MIPMAP_LEVEL = 0;

/**
 * Placeholder pixel color (magenta).
 *
 * @type {Uint8Array}
 */
const PLACEHOLDER_PIXEL_RGBA = new Uint8Array([255, 0, 255, 255]);

/**
 * Integer value, used to represent boolean true in WebGL `pixelStorei` calls.
 *
 * @type {number}
 */
const WEBGL_TRUE_AS_INTEGER = 1;

/**
 * Integer value, used to represent boolean false in WebGL `pixelStorei` calls.
 *
 * @type {number}
 */
const WEBGL_FALSE_AS_INTEGER = 0;

/**
 * Minimum allowed texture unit index.
 *
 * @type {number}
 */
const MIN_TEXTURE_UNIT_INDEX = 0;

/**
 * Minimal allowed string length for required string parameters.
 *
 * @type {number}
 */
const MIN_REQUIRED_STRING_LENGTH = 1;

/**
 * Minimal allowed value for `power-of-two` checks.
 *
 * @type {number}
 */
const MIN_POWER_OF_TWO_VALUE = 1;

/**
 * Bit mask helper value used by the `power-of-two` check.
 *
 * @type {number}
 */
const BIT_MASK_ONE = 1;

/**
 * Bitwise `zero` value used in bit-mask comparisons.
 *
 * @type {number}
 */
const BITWISE_ZERO = 0;

/**
 * `Texture2D` is a thin wrapper around a `WebGLTexture`.
 * It supports a placeholder 1x1 pixel, and can asynchronously upload an image from URL.
 */
export class Texture2D {

    /**
     * WebGL2 rendering context used to create, upload and dispose the underlying WebGL texture.
     *
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglContext;

    /**
     * Underlying WebGL texture handle.
     *
     * @type {WebGLTexture}
     * @private
     */
    #texture;

    /**
     * When true, uploaded images are flipped vertically during upload. Applied via `UNPACK_FLIP_Y_WEBGL`.
     *
     * @type {boolean}
     * @private
     */
    #flipY;

    /**
     * Current texture width in pixels. Initialized to placeholder size and updated after a successful upload.
     *
     * @type {number}
     * @private
     */
    #width = PLACEHOLDER_TEXTURE_WIDTH;

    /**
     * Current texture height in pixels. Initialized to placeholder size and updated after a successful upload.
     *
     * @type {number}
     * @private
     */
    #height = PLACEHOLDER_TEXTURE_HEIGHT;

    /**
     * Indicates whether the image has been successfully loaded and uploaded to GPU.
     *
     * @type {boolean}
     * @private
     */
    #isLoaded = false;

    /**
     * Indicates whether this texture instance has been disposed. Disposed textures must not be bound or updated.
     *
     * @type {boolean}
     * @private
     */
    #isDisposed = false;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
     * @param {Object} [options]                    - Optional texture creation options.
     * @param {boolean} [options.flipY = true]      - Whether to flip the image data vertically on upload.
     */
    constructor(webglContext, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError('`Texture2D` expects `WebGL2RenderingContext`.');
        }

        if (options === null || typeof options !== 'object') {
            throw new TypeError('`Texture2D` expects options as an object.');
        }

        const { flipY = true } = options;

        if (typeof flipY !== 'boolean') {
            throw new TypeError('`Texture2D` expects `options.flipY` as boolean.');
        }

        this.#webglContext = webglContext;
        this.#flipY        = flipY;
        const texture      = webglContext.createTexture();

        if (!texture) {
            throw new Error('Failed to create `WebGLTexture`.');
        }

        this.#texture = texture;
        this.#bindTexture();
        webglContext.texImage2D(
            webglContext.TEXTURE_2D,
            BASE_MIPMAP_LEVEL,
            webglContext.RGBA,
            PLACEHOLDER_TEXTURE_WIDTH,
            PLACEHOLDER_TEXTURE_HEIGHT,
            TEXTURE_BORDER_VALUE,
            webglContext.RGBA,
            webglContext.UNSIGNED_BYTE,
            PLACEHOLDER_PIXEL_RGBA
        );

        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_WRAP_S, webglContext.CLAMP_TO_EDGE);
        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_WRAP_T, webglContext.CLAMP_TO_EDGE);
        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_MIN_FILTER, webglContext.LINEAR);
        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_MAG_FILTER, webglContext.LINEAR);
        this.#unbindTexture();
    }

    /**
     * Returns the underlying `WebGLTexture` object.
     *
     * @returns {WebGLTexture}
     */
    get texture() {
        this.#assertNotDisposed();
        return this.#texture;
    }

    /**
     * Returns the width of the uploaded image (or placeholder width until loaded).
     *
     * @returns {number}
     */
    get width() {
        this.#assertNotDisposed();
        return this.#width;
    }

    /**
     * Returns the height of the uploaded image (or placeholder height until loaded).
     *
     * @returns {number}
     */
    get height() {
        this.#assertNotDisposed();
        return this.#height;
    }

    /**
     * Indicates whether the image has been uploaded.
     *
     * @returns {boolean}
     */
    get isLoaded() {
        this.#assertNotDisposed();
        return this.#isLoaded;
    }

    /**
     * Indicates whether this instance has been disposed.
     *
     * @returns {boolean}
     */
    get isDisposed() {
        return this.#isDisposed;
    }

    /**
     * Binds this texture to a texture unit.
     *
     * @param {number} textureUnitIndex - Index of the texture unit (0 => N).
     */
    bind(textureUnitIndex) {
        this.#assertNotDisposed();

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < MIN_TEXTURE_UNIT_INDEX) {
            throw new TypeError('`Texture2D.bind` expects `textureUnitIndex` as a non-negative integer.');
        }

        const webglContext = this.#webglContext;
        webglContext.activeTexture(webglContext.TEXTURE0 + textureUnitIndex);
        webglContext.bindTexture(webglContext.TEXTURE_2D, this.#texture);
    }

    /**
     * Loads an image from the given URL and uploads it into this WebGL texture.
     *
     * @param {string} url      - Image URL (relative or absolute).
     * @returns {Promise<void>} - Promise that resolves after successful GPU upload, or rejects on `load/decode/upload` error.
     */
    async loadFromUrl(url) {
        this.#assertNotDisposed();

        if (typeof url !== 'string' || url.length === MIN_REQUIRED_STRING_LENGTH) {
            throw new TypeError('`Texture2D.loadFromUrl` expects url as a non-empty string.');
        }

        const image = await this.#loadImage(url);
        this.#assertNotDisposed();
        this.#uploadImage(image);
    }

    /**
     * Releases the WebGL texture.
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        this.#webglContext.deleteTexture(this.#texture);
        this.#isDisposed = true;
    }

    /**
     * Loads an `HTMLImageElement` from a URL.
     *
     * @param {string} url                  - Image URL.
     * @returns {Promise<HTMLImageElement>} - Promise, that resolves with a decoded image on `load`, or rejects on `error`.
     * @private
     */
    #loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload  = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load texture image: ${url}`));
            image.src = url;
        });
    }

    /**
     * Uploads the given image into the GPU texture.
     *
     * @param {HTMLImageElement} image - Loaded image element.
     * @private
     */
    #uploadImage(image) {
        const webglContext = this.#webglContext;

        this.#bindTexture();
        webglContext.pixelStorei(
            webglContext.UNPACK_FLIP_Y_WEBGL,
            this.#flipY ? WEBGL_TRUE_AS_INTEGER : WEBGL_FALSE_AS_INTEGER
        );

        webglContext.texImage2D(
            webglContext.TEXTURE_2D,
            BASE_MIPMAP_LEVEL,
            webglContext.RGBA,
            webglContext.RGBA,
            webglContext.UNSIGNED_BYTE,
            image
        );

        this.#width    = image.width;
        this.#height   = image.height;
        this.#isLoaded = true;

        if (this.#isPowerOfTwo(this.#width) && this.#isPowerOfTwo(this.#height)) {
            webglContext.generateMipmap(webglContext.TEXTURE_2D);
            webglContext.texParameteri(
                webglContext.TEXTURE_2D,
                webglContext.TEXTURE_MIN_FILTER,
                webglContext.LINEAR_MIPMAP_LINEAR
            );
        }

        this.#unbindTexture();
    }

    /**
     * Checks whether an integer value is a `power-of-two`.
     *
     * @param {number} value - Value to check.
     * @returns {boolean}    - True if value is a `power-of-two` (e.g.: 2, 4, 8, ...), otherwise false.
     * @private
     */
    #isPowerOfTwo(value) {
        return Number.isInteger(value)
        && value >= MIN_POWER_OF_TWO_VALUE
        && (value & (value - BIT_MASK_ONE)) === BITWISE_ZERO;
    }

    /**
     * @private
     */
    #bindTexture() {
        this.#webglContext.bindTexture(this.#webglContext.TEXTURE_2D, this.#texture);
    }

    /**
     * @private
     */
    #unbindTexture() {
        this.#webglContext.bindTexture(this.#webglContext.TEXTURE_2D, null);
    }

    /**
     * @private
     */
    #assertNotDisposed() {
        if (this.#isDisposed) {
            throw new Error('`Texture2D` instance is disposed.');
        }
    }
}
