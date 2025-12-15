/**
 * String identifier passed to canvas.getContext to request a WebGL2 context.
 * @type {string}
 */
const WEBGL2_CONTEXT_TYPE = 'webgl2';

/**
 * Fallback device pixel ratio used when window.devicePixelRatio is not set.
 * @type {number}
 */
const DEFAULT_DEVICE_PIXEL_RATIO = 1;

/**
 * X coordinate of the viewport origin.
 * @type {number}
 */
const VIEWPORT_ORIGIN_X = 0;

/**
 * Y coordinate of the viewport origin.
 * @type {number}
 */
const VIEWPORT_ORIGIN_Y = 0;

/**
 * Minimum drawing buffer size (in pixels) for `canvas.width/canvas.height`.
 * Used as a safeguard, when the canvas CSS size is 0.
 *
 * @type {number}
 */
const MIN_DRAWING_BUFFER_DIMENSION = 1;

/**
 * Minimum allowed value for an RGBA color component.
 * Used to validate clear color inputs in the range [0 -> 1].
 *
 * @type {number}
 */
const MIN_COLOR_COMPONENT = 0.0;

/**
 * Maximum allowed value for an RGBA color component.
 * Used to validate clear color inputs in the range [0 -> 1].
 *
 * @type {number}
 */
const MAX_COLOR_COMPONENT = 1.0;

/**
 * RGBA color represented as [red, green, blue, alpha],
 * each component in the range [0 -> 1].
 * @typedef {number[]} RGBAColor
 */

/**
 * Options used by resizeToDisplaySize.
 *
 * @typedef {Object} ResizeToDisplaySizeOptions
 * @property {boolean} [fitToWindow=false] - When true, uses `window.innerWidth/innerHeight`.
 * When false, uses the canvas CSS size (client size) and updates the drawing buffer accordingly.
 */

/**
 * Wrapper around a WebGL2 rendering context and its canvas.
 *
 * Responsible for:
 * - creating and validating the WebGL2 context
 * - managing the canvas size and viewport
 * - clearing the color and depth buffers
 */
export class WebGLContext {
    /** @type {HTMLCanvasElement} */
    #canvas;

    /** @type {WebGL2RenderingContext} */
    #webglContext;

    /** @type {RGBAColor} */
    static #DEFAULT_CLEAR_COLOR = [0.0, 0.0, 0.0, 1.0];

    /** @type {boolean} */
    static #ENABLE_DEPTH_TEST = true;

    /**
     * Creates a new WebGLContext bound to the provided canvas element.
     *
     * @param {HTMLCanvasElement} canvas - Target canvas element used for WebGL rendering.
     * @throws {TypeError} If the provided value is not an HTMLCanvasElement.
     * @throws {Error} If WebGL2 is not supported by the browser.
     */
    constructor(canvas) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError('WebGLContext constructor expects an HTMLCanvasElement.');
        }

        this.#canvas = canvas;
        const webglContext = this.#canvas.getContext(WEBGL2_CONTEXT_TYPE);

        if (!webglContext) {
            throw new Error('WebGL2 is not supported in this browser.');
        }

        this.#webglContext = webglContext;
        this.#initializeDefaults();
    }

    /**
     * Initializes default WebGL state for this context instance (depth testing and clear color).
     *
     * @private
     */
    #initializeDefaults() {
        const webglContext = this.#webglContext;

        if (WebGLContext.#ENABLE_DEPTH_TEST) {
            webglContext.enable(webglContext.DEPTH_TEST);
            webglContext.depthFunc(webglContext.LEQUAL);
        }

        const [red, green, blue, alpha] = WebGLContext.#DEFAULT_CLEAR_COLOR;
        webglContext.clearColor(red, green, blue, alpha);
    }

    /**
     * Returns the underlying WebGL2RenderingContext for direct low-level access.
     *
     * @returns {WebGL2RenderingContext}
     */
    get context() {
        return this.#webglContext;
    }

    /**
     * Resizes the underlying canvas drawing buffer to match its display size and updates the viewport.
     *
     * @param {ResizeToDisplaySizeOptions} [options] - Optional resize options.
     * @returns {boolean}                            - True if the canvas was resized, false otherwise.
     */
    resizeToDisplaySize(options) {
        if (options !== undefined && (options === null || typeof options !== 'object' || Array.isArray(options))) {
            throw new TypeError('WebGLContext.resizeToDisplaySize expects an options object or undefined.');
        }

        const fitToWindow = options !== undefined && options.fitToWindow === true;

        if (options !== undefined && 'fitToWindow' in options && typeof options.fitToWindow !== 'boolean') {
            throw new TypeError('WebGLContext.resizeToDisplaySize option `fitToWindow` must be a boolean.');
        }

        const pixelRatio   = window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO;
        const cssWidth     = fitToWindow ? window.innerWidth  : this.#canvas.clientWidth;
        const cssHeight    = fitToWindow ? window.innerHeight : this.#canvas.clientHeight;
        const targetWidth  = Math.max(MIN_DRAWING_BUFFER_DIMENSION, Math.floor(cssWidth  * pixelRatio));
        const targetHeight = Math.max(MIN_DRAWING_BUFFER_DIMENSION, Math.floor(cssHeight * pixelRatio));
        const isResized    = (this.#canvas.width !== targetWidth) || (this.#canvas.height !== targetHeight);

        if (isResized === true) {
            this.#canvas.width  = targetWidth;
            this.#canvas.height = targetHeight;
            this.#webglContext.viewport(
                VIEWPORT_ORIGIN_X,
                VIEWPORT_ORIGIN_Y,
                this.#canvas.width,
                this.#canvas.height
            );
        }

        return isResized;
    }

    /**
     * Clears both the color and depth buffers using the current clear color.
     */
    clear() {
        this.#webglContext.clear(
            this.#webglContext.COLOR_BUFFER_BIT |
            this.#webglContext.DEPTH_BUFFER_BIT
        );
    }

    /**
     * Sets the default clear color used when initializing new WebGLContext instances.
     *
     * @param {number} red   - Red component   , from 0 to 1.
     * @param {number} green - Green component , from 0 to 1.
     * @param {number} blue  - Blue component  , from 0 to 1.
     * @param {number} alpha - Alpha component , from 0 to 1.
     * @throws {TypeError}  If any component is not a number.
     * @throws {RangeError} If any component is outside the [0, 1] range.
     */
    static setDefaultClearColor(red, green, blue, alpha) {
        WebGLContext.#validateColorComponent('red', red);
        WebGLContext.#validateColorComponent('green', green);
        WebGLContext.#validateColorComponent('blue', blue);
        WebGLContext.#validateColorComponent('alpha', alpha);
        WebGLContext.#DEFAULT_CLEAR_COLOR = [red, green, blue, alpha];
    }

    /**
     * Enables or disables depth testing for all future WebGLContext instances.
     *
     * @param {boolean} enabled - Whether depth testing should be enabled.
     * @throws {TypeError} If the provided value is not a boolean.
     */
    static setDepthTestEnabled(enabled) {
        if (typeof enabled !== 'boolean') {
            throw new TypeError('setDepthTestEnabled expects a boolean value.');
        }

        WebGLContext.#ENABLE_DEPTH_TEST = enabled;
    }

    /**
     * Validates that a color component is a number in the [0, 1] range.
     *
     * @param {string} componentName - Name of the component (for error messages).
     * @param {number} value         - Component value to validate.
     * @throws {TypeError}  If value is not a number.
     * @throws {RangeError} If value is outside the [0, 1] range.
     * @private
     */
    static #validateColorComponent(componentName, value) {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            throw new TypeError(`Color component "${componentName}" must be a valid number.`);
        }

        if (value < MIN_COLOR_COMPONENT || value > MAX_COLOR_COMPONENT) {
            throw new RangeError(`Color component "${componentName}" must be in the range [0, 1].`);
        }
    }
}
