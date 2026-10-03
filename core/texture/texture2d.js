import { ECMASCRIPT_TYPEOF_RESULTS }    from '../constants/ecmascript-types.js';
import { MATH_COMMON_VALUES }           from '../constants/math.js';
import { TEXTURE2D_EXCEPTION_MESSAGES } from '../exception-messages/texture2d.js';
import * as Texture2DConstants          from '../constants/texture2d.js';

/**
 * Texture2D creation/update options.
 *
 * @typedef {Object} Texture2DOptions
 * @property {boolean} [flipY = true]     - Flip image data vertically on upload.
 * @property {number}  [wrapS]            - WebGL wrap mode for S (REPEAT/CLAMP_TO_EDGE/MIRRORED_REPEAT).
 * @property {number}  [wrapT]            - WebGL wrap mode for T (REPEAT/CLAMP_TO_EDGE/MIRRORED_REPEAT).
 * @property {(number|null)} [minFilter]  - WebGL min filter (including the mipmap variants). Use 'null' to clear explicit override and return to auto behavior.
 * @property {number}  [magFilter]        - WebGL mag filter (NEAREST/LINEAR).
 * @property {number}  [mipmapPolicy = 2] - Mipmap policy: 0 = none, 1 = always, 2 = 'power-of-two' images only.
 */

/**
 * Texture2D load options, used by 'loadFromUrl'.
 *
 * @typedef {Object} Texture2DLoadOptions
 * @property {("anonymous"|"use-credentials"|null)} [crossOrigin] - Optional cross-origin mode.
 */

/**
 * Resolved sampler settings, used internally before updating the texture.
 *
 * @typedef {Object} Texture2DSamplerParams
 * @property {number} wrapS                 - Horizontal wrap mode.
 * @property {number} wrapT                 - Vertical wrap mode.
 * @property {number} minFilter             - Minification filter.
 * @property {number} magFilter             - Magnification filter.
 * @property {number} mipmapPolicy          - Mipmap generation policy.
 * @property {boolean} hasExplicitMinFilter - Whether the min filter overrides automatic selection.
 * @private
 */

/**
 * 'Texture2D' is a thin wrapper around a 'WebGLTexture'.
 * It supports a placeholder pixel (1x1), and can asynchronously upload the image from URL.
 */
export class Texture2D {

    /**
     * WebGL2 rendering context, used to: create, upload and dispose the underlying WebGL texture.
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
     * When true, uploaded images are flipped vertically during upload. Applied via 'UNPACK_FLIP_Y_WEBGL'.
     *
     * @type {boolean}
     * @private
     */
    #flipY;

    /**
     * Current wrap mode for S-coordinate.
     *
     * @type {number}
     * @private
     */
    #wrapS;

    /**
     * Current wrap mode for T-coordinate.
     *
     * @type {number}
     * @private
     */
    #wrapT;

    /**
     * Current minification filter.
     *
     * @type {number}
     * @private
     */
    #minFilter;

    /**
     * Current magnification filter.
     *
     * @type {number}
     * @private
     */
    #magFilter;

    /**
     * Current mipmap generation policy.
     *
     * @type {number}
     * @private
     */
    #mipmapPolicy;

    /**
     * Indicates whether the min filter was explicitly set by the user.
     *
     * @type {boolean}
     * @private
     */
    #hasExplicitMinFilter = false;

    /**
     * Current texture width in pixels. Initialized to placeholder size and updated after a successful upload.
     *
     * @type {number}
     * @private
     */
    #width = Texture2DConstants.TEXTURE2D_PLACEHOLDER.WIDTH;

    /**
     * Current texture height in pixels. Initialized to placeholder size and updated after a successful upload.
     *
     * @type {number}
     * @private
     */
    #height = Texture2DConstants.TEXTURE2D_PLACEHOLDER.HEIGHT;

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
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context, used to create and manage the GPU resources.
     * @param {Texture2DOptions} [options]          - Optional texture creation options.
     * @throws {TypeError}                            When provided arguments do not match expected types or supported enums.
     */
    constructor(webglContext, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_WEBGL2_CONTEXT);
        }

        Texture2D.#assertOptionsObject(options, TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_OPTIONS_OBJECT);
        this.#webglContext = webglContext;
        this.#initializeOptions(options);
        this.#createTexture();
    }

    /**
     * Returns the underlying 'WebGLTexture' object.
     *
     * @returns {WebGLTexture}
     */
    get texture() {
        this.#assertNotDisposed();
        return this.#texture;
    }

    /**
     * Returns the width of the uploaded image (or the placeholder width until loaded).
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
     * @param {number} textureUnitIndex - Index of the texture unit.
     */
    bind(textureUnitIndex) {
        this.#assertNotDisposed();

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < Texture2DConstants.TEXTURE2D_LIMITS.MIN_TEXTURE_UNIT_INDEX) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_TEXTURE_UNIT_INDEX);
        }

        const webglContext = this.#webglContext;
        const maxUnits     = webglContext.getParameter(webglContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        if (!Number.isInteger(maxUnits) || maxUnits <= Texture2DConstants.TEXTURE2D_LIMITS.MIN_TEXTURE_UNIT_INDEX) {
            throw new Error(TEXTURE2D_EXCEPTION_MESSAGES.FAILED_READ_MAX_TEXTURE_UNITS);
        }

        if (textureUnitIndex >= maxUnits) {
            throw new RangeError(TEXTURE2D_EXCEPTION_MESSAGES.TEXTURE_UNIT_INDEX_OUT_OF_RANGE(maxUnits - MATH_COMMON_VALUES.UNIT));
        }

        webglContext.activeTexture(webglContext.TEXTURE0 + textureUnitIndex);
        webglContext.bindTexture(webglContext.TEXTURE_2D, this.#texture);
    }

    /**
     * Updates sampler parameters for this texture.
     *
     * @param {Texture2DOptions} [options] - Sampler options to update.
     * @throws {TypeError}                   When provided arguments do not match expected types or supported enums.
     */
    setSamplerParams(options = {}) {
        this.#assertNotDisposed();
        Texture2D.#assertOptionsObject(options, TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_SAMPLER_OPTIONS_OBJECT);

        const hasMipmapPolicy = Object.prototype.hasOwnProperty.call(options, 'mipmapPolicy');
        const mipmapPolicy    = hasMipmapPolicy ? options.mipmapPolicy : this.#mipmapPolicy;
        const sampler         = this.#resolveSamplerParams(options, mipmapPolicy);

        this.#assertSamplerParams(sampler);
        this.#assignSamplerParams(sampler);
        this.#bindTexture();

        try {
            if (this.#isLoaded) {
                const mipmapsGenerated = this.#maybeGenerateMipmaps();
                this.#syncMinFilterWithMipmaps(mipmapsGenerated);
            }

            this.#applySamplerParams();
        } finally {
            this.#unbindTexture();
        }
    }

    /**
     * Loads an image from the given URL and uploads it into this WebGL texture.
     *
     * @param {string} url                     - Image URL (relative or absolute).
     * @param {Texture2DLoadOptions} [options] - Optional load options.
     * @returns {Promise<void>}                - Promise, that resolves after successful GPU upload, or rejects on 'load/decode/upload' error.
     * @throws {TypeError}                       When arguments are invalid.
     */
    async loadFromUrl(url, options = {}) {
        this.#assertNotDisposed();

        if (typeof url !== ECMASCRIPT_TYPEOF_RESULTS.STRING || url.length < Texture2DConstants.TEXTURE2D_LIMITS.MIN_URL_LENGTH) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_URL_STRING);
        }

        Texture2D.#assertOptionsObject(options, TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_LOAD_OPTIONS_OBJECT);
        const crossOrigin = Texture2D.#resolveCrossOrigin(options);
        const image       = await this.#loadImage(url, crossOrigin);
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
     * Checks the options container before reading individual properties.
     *
     * @param {Object} options - Options to validate.
     * @param {string} message - Error message for the calling method.
     * @private
     */
    static #assertOptionsObject(options, message) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(message);
        }
    }

    /**
     * Resolves creation defaults before allocating the WebGL texture.
     *
     * @param {Texture2DOptions} options - Texture creation options.
     * @private
     */
    #initializeOptions(options) {
        const {
            flipY        = Texture2DConstants.TEXTURE2D_DEFAULTS.FLIP_Y,
            mipmapPolicy = Texture2DConstants.TEXTURE2D_DEFAULTS.MIPMAP_POLICY
        } = options;

        if (typeof flipY !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_FLIPY_BOOLEAN);
        }

        if (!this.#isValidMipmapPolicy(mipmapPolicy)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_MIPMAP_POLICY);
        }

        this.#flipY     = flipY;
        this.#wrapS     = this.#webglContext.REPEAT;
        this.#wrapT     = this.#webglContext.REPEAT;
        this.#minFilter = this.#webglContext.LINEAR;
        this.#magFilter = this.#webglContext.LINEAR;

        const sampler = this.#resolveSamplerParams(options, mipmapPolicy);
        this.#assertSamplerParams(sampler);
        this.#assignSamplerParams(sampler);
    }

    /**
     * Combines explicitly supplied sampler values with the current settings.
     * Inherited sampler properties are ignored.
     * Setting 'minFilter' to 'null' restores automatic filter selection.
     *
     * @param {Texture2DOptions} options - Sampler overrides.
     * @param {number} mipmapPolicy      - Resolved mipmap policy.
     * @returns {Texture2DSamplerParams} - Sampler values and the explicit min filter flag.
     * @private
     */
    #resolveSamplerParams(options, mipmapPolicy) {
        const hasWrapS     = Object.prototype.hasOwnProperty.call(options, 'wrapS');
        const hasWrapT     = Object.prototype.hasOwnProperty.call(options, 'wrapT');
        const hasMagFilter = Object.prototype.hasOwnProperty.call(options, 'magFilter');
        const minFilter    = this.#resolveMinFilter(options);

        return {
            wrapS     : hasWrapS ? options.wrapS : this.#wrapS,
            wrapT     : hasWrapT ? options.wrapT : this.#wrapT,
            minFilter : minFilter.value,
            magFilter : hasMagFilter ? options.magFilter : this.#magFilter,
            mipmapPolicy,
            hasExplicitMinFilter : minFilter.isExplicit
        };
    }

    /**
     * Distinguishes an omitted min filter, an explicit override and a null reset.
     *
     * @param {Texture2DOptions} options               - Sampler overrides.
     * @returns {{value: number, isExplicit: boolean}} - Min filter value and its explicit override flag.
     * @private
     */
    #resolveMinFilter(options) {
        if (!Object.prototype.hasOwnProperty.call(options, 'minFilter')) {
            return { value: this.#minFilter, isExplicit: this.#hasExplicitMinFilter };
        }

        if (options.minFilter === null) {
            return { value: this.#webglContext.LINEAR, isExplicit: false };
        }

        return { value: options.minFilter, isExplicit: true };
    }

    /**
     * Validates all resolved sampler values before changing the current settings.
     *
     * @param {Texture2DSamplerParams} sampler - Resolved sampler values.
     * @private
     */
    #assertSamplerParams(sampler) {
        if (!this.#isValidWrapMode(sampler.wrapS)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_WRAP_S_ENUM);
        }

        if (!this.#isValidWrapMode(sampler.wrapT)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_WRAP_T_ENUM);
        }

        if (!this.#isValidMinFilter(sampler.minFilter)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_MIN_FILTER_ENUM);
        }

        if (!this.#isValidMagFilter(sampler.magFilter)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_MAG_FILTER_ENUM);
        }

        if (!this.#isValidMipmapPolicy(sampler.mipmapPolicy)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_MIPMAP_POLICY);
        }

        if (sampler.mipmapPolicy === Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.NONE
            && sampler.hasExplicitMinFilter
            && this.#isMipmapMinFilter(sampler.minFilter)) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.MIPMAP_POLICY_CONFLICT);
        }
    }

    /**
     * Stores validated sampler settings together.
     *
     * @param {Texture2DSamplerParams} sampler - Validated sampler values.
     * @private
     */
    #assignSamplerParams(sampler) {
        this.#wrapS                = sampler.wrapS;
        this.#wrapT                = sampler.wrapT;
        this.#minFilter            = sampler.minFilter;
        this.#magFilter            = sampler.magFilter;
        this.#mipmapPolicy         = sampler.mipmapPolicy;
        this.#hasExplicitMinFilter = sampler.hasExplicitMinFilter;
    }

    /**
     * Creates the placeholder texture and releases it, if initialization fails.
     *
     * @private
     */
    #createTexture() {
        const texture = this.#webglContext.createTexture();

        if (!texture) {
            throw new Error(TEXTURE2D_EXCEPTION_MESSAGES.FAILED_CREATE_TEXTURE);
        }

        this.#texture = texture;

        try {
            this.#bindTexture();
            this.#uploadPlaceholder();
            this.#applySamplerParams();
        } catch (error) {
            this.#webglContext.deleteTexture(texture);
            throw error;
        } finally {
            this.#unbindTexture();
        }
    }

    /**
     * Uploads the placeholder pixel before a URL image is available.
     *
     * @private
     */
    #uploadPlaceholder() {
        const context     = this.#webglContext;
        const upload      = Texture2DConstants.TEXTURE2D_UPLOAD;
        const placeholder = Texture2DConstants.TEXTURE2D_PLACEHOLDER;

        context.texImage2D(
            context.TEXTURE_2D,
            upload.BASE_MIPMAP_LEVEL,
            context.RGBA,
            placeholder.WIDTH,
            placeholder.HEIGHT,
            upload.BORDER,
            context.RGBA,
            context.UNSIGNED_BYTE,
            Texture2DConstants.TEXTURE2D_PLACEHOLDER_PIXEL
        );
    }

    /**
     * Resolves and validates the optional cross-origin mode.
     *
     * @param {Texture2DLoadOptions} options - Image request options.
     * @returns {string | null}              - Cross-origin mode for the image request.
     * @private
     */
    static #resolveCrossOrigin(options) {
        const hasCrossOrigin = Object.prototype.hasOwnProperty.call(options, 'crossOrigin');
        const crossOrigin    = hasCrossOrigin ? options.crossOrigin : null;

        if (crossOrigin !== null
            && crossOrigin !== Texture2DConstants.TEXTURE2D_CROSS_ORIGIN.ANONYMOUS
            && crossOrigin !== Texture2DConstants.TEXTURE2D_CROSS_ORIGIN.USE_CREDENTIALS) {
            throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_CROSS_ORIGIN);
        }

        return crossOrigin;
    }

    /**
     * Loads an 'HTMLImageElement' from a URL.
     *
     * @param {string} url                  - Image URL.
     * @param {(string|null)} crossOrigin   - Optional CORS mode: 'anonymous/use-credentials'.
     * @returns {Promise<HTMLImageElement>} - Promise, that resolves with a decoded image on 'load', or rejects on 'error'.
     * @private
     */
    #loadImage(url, crossOrigin) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            if (typeof crossOrigin === ECMASCRIPT_TYPEOF_RESULTS.STRING) {
                image.crossOrigin = crossOrigin;
            }

            image.onload  = () => resolve(image);
            image.onerror = () => reject(new Error(TEXTURE2D_EXCEPTION_MESSAGES.FAILED_LOAD_IMAGE(url)));
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
        const webglContext  = this.#webglContext;
        const previousFlipY = webglContext.getParameter(webglContext.UNPACK_FLIP_Y_WEBGL);
        this.#bindTexture();

        try {
            this.#setFlipY(this.#flipY);

            webglContext.texImage2D(
                webglContext.TEXTURE_2D,
                Texture2DConstants.TEXTURE2D_UPLOAD.BASE_MIPMAP_LEVEL,
                webglContext.RGBA,
                webglContext.RGBA,
                webglContext.UNSIGNED_BYTE,
                image
            );

            this.#width    = image.width;
            this.#height   = image.height;
            this.#isLoaded = true;

            const mipmapsGenerated = this.#maybeGenerateMipmaps();
            this.#syncMinFilterWithMipmaps(mipmapsGenerated);
            this.#applySamplerParams();
        } finally {
            this.#setFlipY(previousFlipY);
            this.#unbindTexture();
        }
    }

    /**
     * Applies the upload orientation using the integer values expected by WebGL.
     *
     * @param {boolean} flipY - Vertical image orientation.
     * @private
     */
    #setFlipY(flipY) {
        const webglContext = this.#webglContext;
        const upload       = Texture2DConstants.TEXTURE2D_UPLOAD;
        const value        = flipY ? upload.TRUE_AS_INTEGER : upload.FALSE_AS_INTEGER;
        webglContext.pixelStorei(webglContext.UNPACK_FLIP_Y_WEBGL, value);
    }

    /**
     * Applies current sampler parameters to the bound texture.
     *
     * @private
     */
    #applySamplerParams() {
        const webglContext = this.#webglContext;
        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_WRAP_S, this.#wrapS);
        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_WRAP_T, this.#wrapT);
        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_MIN_FILTER, this.#minFilter);
        webglContext.texParameteri(webglContext.TEXTURE_2D, webglContext.TEXTURE_MAG_FILTER, this.#magFilter);
    }

    /**
     * Generates mipmaps, when the policy allows it.
     *
     * @returns {boolean} True, when mipmaps were generated.
     * @private
     */
    #maybeGenerateMipmaps() {
        if (this.#mipmapPolicy === Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.NONE) {
            return false;
        }

        if (this.#mipmapPolicy === Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.AUTO
            && !(this.#isPowerOfTwo(this.#width)
            && this.#isPowerOfTwo(this.#height))) {

            if (this.#hasExplicitMinFilter && this.#isMipmapMinFilter(this.#minFilter)) {
                throw new TypeError(TEXTURE2D_EXCEPTION_MESSAGES.MIPMAP_AUTO_POT_REQUIRED_FOR_MIPMAP_FILTER);
            }

            return false;
        }

        this.#webglContext.generateMipmap(this.#webglContext.TEXTURE_2D);
        return true;
    }

    /**
     * Updates minification filter, based on mipmap availability and explicit overrides.
     *
     * @param {boolean} mipmapsGenerated - True, when mipmaps were generated.
     * @private
     */
    #syncMinFilterWithMipmaps(mipmapsGenerated) {
        if (this.#hasExplicitMinFilter) {
            return;
        }

        this.#minFilter = mipmapsGenerated
            ? this.#webglContext.LINEAR_MIPMAP_LINEAR
            : this.#webglContext.LINEAR;
    }

    /**
     * Checks whether a value is a valid wrap mode.
     *
     * @param {number} value - Wrap mode value to validate.
     * @returns {boolean}      True, when value is a supported wrap mode.
     * @private
     */
    #isValidWrapMode(value) {
        const webglContext = this.#webglContext;
        return value === webglContext.REPEAT
            || value === webglContext.CLAMP_TO_EDGE
            || value === webglContext.MIRRORED_REPEAT;
    }

    /**
     * Checks whether a value is a valid minification filter.
     *
     * @param {number} value - Filter value to validate.
     * @returns {boolean}      True, when value is a supported min filter.
     * @private
     */
    #isValidMinFilter(value) {
        const webglContext = this.#webglContext;
        return value === webglContext.NEAREST
            || value === webglContext.LINEAR
            || value === webglContext.NEAREST_MIPMAP_NEAREST
            || value === webglContext.LINEAR_MIPMAP_NEAREST
            || value === webglContext.NEAREST_MIPMAP_LINEAR
            || value === webglContext.LINEAR_MIPMAP_LINEAR;
    }

    /**
     * Checks whether a value is a valid magnification filter.
     *
     * @param {number} value - Filter value to validate.
     * @returns {boolean}      True, when value is a supported mag filter.
     * @private
     */
    #isValidMagFilter(value) {
        const webglContext = this.#webglContext;
        return value === webglContext.NEAREST || value === webglContext.LINEAR;
    }

    /**
     * Checks whether a value is a valid mipmap policy.
     *
     * @param {number} value - Policy value to validate.
     * @returns {boolean}      True, when value is a supported policy.
     * @private
     */
    #isValidMipmapPolicy(value) {
        return value === Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.NONE
            || value === Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.ALWAYS
            || value === Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.AUTO;
    }

    /**
     * Checks whether a min filter value uses mipmaps.
     *
     * @param {number} value - Filter value to validate.
     * @returns {boolean}      True, when the filter expects mipmaps.
     * @private
     */
    #isMipmapMinFilter(value) {
        const webglContext = this.#webglContext;
        return value === webglContext.NEAREST_MIPMAP_NEAREST
            || value === webglContext.LINEAR_MIPMAP_NEAREST
            || value === webglContext.NEAREST_MIPMAP_LINEAR
            || value === webglContext.LINEAR_MIPMAP_LINEAR;
    }

    /**
     * Checks whether an integer value is a 'power-of-two'.
     *
     * @param {number} value - Value to check.
     * @returns {boolean}    - True, if value is a 'power-of-two' (e.g.: 2, 4, 8, ...), otherwise false.
     * @private
     */
    #isPowerOfTwo(value) {
        return Number.isInteger(value)
            && value >= MATH_COMMON_VALUES.UNIT
            && (value & (value - MATH_COMMON_VALUES.UNIT)) === MATH_COMMON_VALUES.ZERO;
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
            throw new Error(TEXTURE2D_EXCEPTION_MESSAGES.INSTANCE_DISPOSED);
        }
    }
}
