// core/webgl-context.js
var WEBGL2_CONTEXT_TYPE = "webgl2";
var DEFAULT_DEVICE_PIXEL_RATIO = 1;
var VIEWPORT_ORIGIN_X = 0;
var VIEWPORT_ORIGIN_Y = 0;
var WebGLContext = class _WebGLContext {
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {WebGL2RenderingContext} */
  #webglContext;
  /** @type {RGBAColor} */
  static #DEFAULT_CLEAR_COLOR = [0, 0, 0, 1];
  /** @type {boolean} */
  static #ENABLE_DEPTH_TEST = true;
  /**
   * Creates a new WebGLContext bound to the provided canvas element.
   *
   * @param {HTMLCanvasElement} canvas - Target canvas element used for WebGL rendering.
   * @throws {TypeError} If the provided value is not an HTMLCanvasElement.
   * @throws {Error} If WebGL2 is not supported by the browser.
   */
  constructor(canvas2) {
    if (!(canvas2 instanceof HTMLCanvasElement)) {
      throw new TypeError("WebGLContext constructor expects an HTMLCanvasElement.");
    }
    this.#canvas = canvas2;
    const webglContext2 = this.#canvas.getContext(WEBGL2_CONTEXT_TYPE);
    if (!webglContext2) {
      throw new Error("WebGL2 is not supported in this browser.");
    }
    this.#webglContext = webglContext2;
    this.#initializeDefaults();
  }
  /**
   * Initializes default WebGL state for this context instance (depth testing and clear color).
   *
   * @private
   */
  #initializeDefaults() {
    const webglContext2 = this.#webglContext;
    if (_WebGLContext.#ENABLE_DEPTH_TEST) {
      webglContext2.enable(webglContext2.DEPTH_TEST);
      webglContext2.depthFunc(webglContext2.LEQUAL);
    }
    const [red, green, blue, alpha] = _WebGLContext.#DEFAULT_CLEAR_COLOR;
    webglContext2.clearColor(red, green, blue, alpha);
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
   * Resizes the underlying canvas to match the current window size
   * (taking into account device pixel ratio) and updates the WebGL viewport.
   */
  resizeToDisplaySize() {
    const pixelRatio = window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO;
    const targetWidth = Math.floor(window.innerWidth * pixelRatio);
    const targetHeight = Math.floor(window.innerHeight * pixelRatio);
    if (this.#canvas.width !== targetWidth || this.#canvas.height !== targetHeight) {
      this.#canvas.width = targetWidth;
      this.#canvas.height = targetHeight;
    }
    this.#webglContext.viewport(
      VIEWPORT_ORIGIN_X,
      VIEWPORT_ORIGIN_Y,
      this.#canvas.width,
      this.#canvas.height
    );
  }
  /**
   * Clears both the color and depth buffers using the current clear color.
   */
  clear() {
    this.#webglContext.clear(
      this.#webglContext.COLOR_BUFFER_BIT | this.#webglContext.DEPTH_BUFFER_BIT
    );
  }
  /**
   * Sets the default clear color used when initializing new WebGLContext instances.
   *
   * @param {number} red   - Red component, from 0 to 1.
   * @param {number} green - Green component, from 0 to 1.
   * @param {number} blue  - Blue component, from 0 to 1.
   * @param {number} alpha - Alpha component, from 0 to 1.
   * @throws {TypeError} If any component is not a number.
   * @throws {RangeError} If any component is outside the [0, 1] range.
   */
  static setDefaultClearColor(red, green, blue, alpha) {
    _WebGLContext.#validateColorComponent("red", red);
    _WebGLContext.#validateColorComponent("green", green);
    _WebGLContext.#validateColorComponent("blue", blue);
    _WebGLContext.#validateColorComponent("alpha", alpha);
    _WebGLContext.#DEFAULT_CLEAR_COLOR = [red, green, blue, alpha];
  }
  /**
   * Enables or disables depth testing for all future WebGLContext instances.
   *
   * @param {boolean} enabled - Whether depth testing should be enabled.
   * @throws {TypeError} If the provided value is not a boolean.
   */
  static setDepthTestEnabled(enabled) {
    if (typeof enabled !== "boolean") {
      throw new TypeError("setDepthTestEnabled expects a boolean value.");
    }
    _WebGLContext.#ENABLE_DEPTH_TEST = enabled;
  }
  /**
   * Validates that a color component is a number in the [0, 1] range.
   *
   * @param {string} componentName - Name of the component (for error messages).
   * @param {number} value - Component value to validate.
   * @throws {TypeError} If value is not a number.
   * @throws {RangeError} If value is outside the [0, 1] range.
   * @private
   */
  static #validateColorComponent(componentName, value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError(`Color component "${componentName}" must be a valid number.`);
    }
    if (value < 0 || value > 1) {
      throw new RangeError(`Color component "${componentName}" must be in the range [0, 1].`);
    }
  }
};

// demo/stub.js
var canvas = document.getElementById("glcanvas");
if (!canvas) {
  throw new Error('Canvas element with id "glcanvas" not found.');
}
var webglContext = new WebGLContext(canvas);
function renderFrame() {
  webglContext.resizeToDisplaySize();
  webglContext.clear();
  requestAnimationFrame(renderFrame);
}
renderFrame();
//# sourceMappingURL=gerawebgl.js.map
