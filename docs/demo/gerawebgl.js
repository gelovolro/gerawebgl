// core/webgl-context.js
var WEBGL2_CONTEXT_TYPE = "webgl2";
var DEFAULT_DEVICE_PIXEL_RATIO = 1;
var VIEWPORT_ORIGIN_X = 0;
var VIEWPORT_ORIGIN_Y = 0;
var MIN_DRAWING_BUFFER_DIMENSION = 1;
var MIN_COLOR_COMPONENT = 0;
var MAX_COLOR_COMPONENT = 1;
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
  constructor(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError("WebGLContext constructor expects an HTMLCanvasElement.");
    }
    this.#canvas = canvas;
    const webglContext = this.#canvas.getContext(WEBGL2_CONTEXT_TYPE);
    if (!webglContext) {
      throw new Error("WebGL2 is not supported in this browser.");
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
    if (_WebGLContext.#ENABLE_DEPTH_TEST) {
      webglContext.enable(webglContext.DEPTH_TEST);
      webglContext.depthFunc(webglContext.LEQUAL);
    }
    const [red, green, blue, alpha] = _WebGLContext.#DEFAULT_CLEAR_COLOR;
    webglContext.clearColor(red, green, blue, alpha);
  }
  /**
   * Returns the underlying `WebGL2RenderingContext` for direct low-level access.
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
    if (options !== void 0 && (options === null || typeof options !== "object" || Array.isArray(options))) {
      throw new TypeError("WebGLContext.resizeToDisplaySize expects an options object or undefined.");
    }
    const fitToWindow = options !== void 0 && options.fitToWindow === true;
    if (options !== void 0 && "fitToWindow" in options && typeof options.fitToWindow !== "boolean") {
      throw new TypeError("WebGLContext.resizeToDisplaySize option `fitToWindow` must be a boolean.");
    }
    const pixelRatio = window.devicePixelRatio || DEFAULT_DEVICE_PIXEL_RATIO;
    const cssWidth = fitToWindow ? window.innerWidth : this.#canvas.clientWidth;
    const cssHeight = fitToWindow ? window.innerHeight : this.#canvas.clientHeight;
    const targetWidth = Math.max(MIN_DRAWING_BUFFER_DIMENSION, Math.floor(cssWidth * pixelRatio));
    const targetHeight = Math.max(MIN_DRAWING_BUFFER_DIMENSION, Math.floor(cssHeight * pixelRatio));
    const isResized = this.#canvas.width !== targetWidth || this.#canvas.height !== targetHeight;
    if (isResized === true) {
      this.#canvas.width = targetWidth;
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
      this.#webglContext.COLOR_BUFFER_BIT | this.#webglContext.DEPTH_BUFFER_BIT
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
   * @param {number} value         - Component value to validate.
   * @throws {TypeError}  If value is not a number.
   * @throws {RangeError} If value is outside the [0, 1] range.
   * @private
   */
  static #validateColorComponent(componentName, value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError(`Color component "${componentName}" must be a valid number.`);
    }
    if (value < MIN_COLOR_COMPONENT || value > MAX_COLOR_COMPONENT) {
      throw new RangeError(`Color component "${componentName}" must be in the range [0, 1].`);
    }
  }
};

// core/math/matrix4.js
var HALF_FIELD_OF_VIEW_DIVISOR = 2;
var PROJECTION_SCALE_NUMERATOR = 1;
var DEPTH_RANGE_NUMERATOR = 1;
var PERSPECTIVE_Z_RANGE_MULTIPLIER = 2;
var PERSPECTIVE_W_COMPONENT_SCALE = -1;
var MATRIX_4x4_ELEMENT_COUNT = 16;
var MATRIX_COLUMN_COUNT = 4;
var MATRIX_ROW_COUNT = 4;
var MATRIX_STRIDE = 4;
var MIN_INVERTIBLE_DETERMINANT_ABS = 1e-12;
var INVERSE_DETERMINANT_NUMERATOR = 1;
var Matrix4 = class _Matrix4 {
  /**
   * Creates a new 4x4 identity matrix.
   *
   * @returns {Float32Array} - A new identity matrix.
   */
  static createIdentity() {
    const out = _Matrix4.#createEmpty();
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  }
  /**
   * Creates a scale matrix.
   *
   * @param {number} scaleX  - Scale along X.
   * @param {number} scaleY  - Scale along Y.
   * @param {number} scaleZ  - Scale along Z.
   * @returns {Float32Array} - A new scale matrix.
   */
  static createScale(scaleX, scaleY, scaleZ) {
    if (typeof scaleX !== "number" || typeof scaleY !== "number" || typeof scaleZ !== "number") {
      throw new TypeError("Matrix4.createScale expects numeric arguments.");
    }
    const out = _Matrix4.#createEmpty();
    out[0] = scaleX;
    out[5] = scaleY;
    out[10] = scaleZ;
    out[15] = 1;
    return out;
  }
  /**
   * Creates a perspective projection matrix.
   *
   * @param {number} fieldOfViewRadians - Vertical field of view in radians.
   * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
   * @param {number} near               - Near clipping plane, must be > 0.
   * @param {number} far                - Far clipping plane, must be > near.
   * @returns {Float32Array}            - A new perspective projection matrix.
   */
  static createPerspective(fieldOfViewRadians, aspectRatio, near, far) {
    if (typeof fieldOfViewRadians !== "number" || typeof aspectRatio !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("Matrix4.createPerspective expects numeric arguments.");
    }
    if (near <= 0 || far <= near) {
      throw new RangeError("Matrix4.createPerspective expects 0 < near < far.");
    }
    const out = _Matrix4.#createEmpty();
    const projectionScale = PROJECTION_SCALE_NUMERATOR / Math.tan(fieldOfViewRadians / HALF_FIELD_OF_VIEW_DIVISOR);
    const inverseDepthRange = DEPTH_RANGE_NUMERATOR / (near - far);
    out[0] = projectionScale / aspectRatio;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = projectionScale;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * inverseDepthRange;
    out[11] = PERSPECTIVE_W_COMPONENT_SCALE;
    out[12] = 0;
    out[13] = 0;
    out[14] = PERSPECTIVE_Z_RANGE_MULTIPLIER * far * near * inverseDepthRange;
    out[15] = 0;
    return out;
  }
  /**
   * Creates a translation matrix.
   *
   * @param {number} translateX - Translation along X axis.
   * @param {number} translateY - Translation along Y axis.
   * @param {number} translateZ - Translation along Z axis.
   * @returns {Float32Array}    - A new translation matrix.
   */
  static createTranslation(translateX, translateY, translateZ) {
    if (typeof translateX !== "number" || typeof translateY !== "number" || typeof translateZ !== "number") {
      throw new TypeError("Matrix4.createTranslation expects numeric arguments.");
    }
    const out = _Matrix4.createIdentity();
    out[12] = translateX;
    out[13] = translateY;
    out[14] = translateZ;
    return out;
  }
  /**
   * Creates a rotation matrix around the X axis.
   *
   * @param {number} angleRadians - Angle in radians.
   * @returns {Float32Array}      - A new rotation matrix.
   */
  static createRotationX(angleRadians) {
    if (typeof angleRadians !== "number") {
      throw new TypeError("Matrix4.createRotationX expects a numeric argument.");
    }
    const cosAngle = Math.cos(angleRadians);
    const sinAngle = Math.sin(angleRadians);
    const out = _Matrix4.#createEmpty();
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = cosAngle;
    out[6] = sinAngle;
    out[7] = 0;
    out[8] = 0;
    out[9] = -sinAngle;
    out[10] = cosAngle;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Creates a rotation matrix around the Y axis.
   *
   * @param {number} angleRadians - Angle in radians.
   * @returns {Float32Array}      - A new rotation matrix.
   */
  static createRotationY(angleRadians) {
    if (typeof angleRadians !== "number") {
      throw new TypeError("Matrix4.createRotationY expects a numeric argument.");
    }
    const cosAngle = Math.cos(angleRadians);
    const sinAngle = Math.sin(angleRadians);
    const out = _Matrix4.#createEmpty();
    out[0] = cosAngle;
    out[1] = 0;
    out[2] = -sinAngle;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = sinAngle;
    out[9] = 0;
    out[10] = cosAngle;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Creates a rotation matrix around the Z axis.
   *
   * @param {number} angleRadians - Angle in radians.
   * @returns {Float32Array}      - A new rotation matrix.
   */
  static createRotationZ(angleRadians) {
    if (typeof angleRadians !== "number") {
      throw new TypeError("Matrix4.createRotationZ expects a numeric argument.");
    }
    const cosAngle = Math.cos(angleRadians);
    const sinAngle = Math.sin(angleRadians);
    const out = _Matrix4.#createEmpty();
    out[0] = cosAngle;
    out[1] = sinAngle;
    out[2] = 0;
    out[3] = 0;
    out[4] = -sinAngle;
    out[5] = cosAngle;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }
  /**
   * Multiplies two 4x4 matrices: result = leftMatrix * rightMatrix.
   *
   * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
   * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
   * @returns {Float32Array}           - A new matrix containing the product.
   */
  static multiply(leftMatrix, rightMatrix) {
    if (!(leftMatrix instanceof Float32Array) || leftMatrix.length !== MATRIX_4x4_ELEMENT_COUNT || !(rightMatrix instanceof Float32Array) || rightMatrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
      throw new TypeError("Matrix4.multiply expects two 4x4 Float32Array matrices.");
    }
    const out = _Matrix4.#createEmpty();
    return _Matrix4.#multiplyIntoUnchecked(out, leftMatrix, rightMatrix);
  }
  /**
   * Multiplies two 4x4 matrices into an existing output matrix:
   * out = leftMatrix * rightMatrix.
   *
   * Notes: out must not be the same object as leftMatrix or rightMatrix.
   *
   * @param {Float32Array} out         - Output 4x4 matrix.
   * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
   * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
   * @returns {Float32Array}           - The output matrix (out).
   */
  static multiplyTo(out, leftMatrix, rightMatrix) {
    if (!(out instanceof Float32Array) || out.length !== MATRIX_4x4_ELEMENT_COUNT || !(leftMatrix instanceof Float32Array) || leftMatrix.length !== MATRIX_4x4_ELEMENT_COUNT || !(rightMatrix instanceof Float32Array) || rightMatrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
      throw new TypeError("Matrix4.multiplyTo expects three 4x4 Float32Array matrices.");
    }
    if (out === leftMatrix || out === rightMatrix) {
      throw new Error("Matrix4.multiplyTo does not support in-place multiplication. Use a separate output matrix.");
    }
    return _Matrix4.#multiplyIntoUnchecked(out, leftMatrix, rightMatrix);
  }
  /**
   * Multiplies several matrices in sequence:
   * result = m0 * m1 * m2 * ... * mn
   *
   * Notes: If no matrices are provided, returns a new identity matrix. If exactly one matrix is provided, returns the same matrix instance (no copy).
   *
   * @param {...Float32Array} matrices - Matrices to multiply, in order.
   * @returns {Float32Array}           - The resulting matrix.
   */
  static multiplyMany(...matrices) {
    if (matrices.length === 0) {
      return _Matrix4.createIdentity();
    }
    let result = matrices[0];
    for (let index = 1; index < matrices.length; index += 1) {
      result = _Matrix4.multiply(result, matrices[index]);
    }
    return result;
  }
  /**
   * Transposes a 4x4 matrix.
   *
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - A new transposed matrix.
   */
  static transpose(matrix) {
    if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.transpose` expects a 4x4 `Float32Array` matrix.");
    }
    const out = _Matrix4.#createEmpty();
    return _Matrix4.#transposeIntoUnchecked(out, matrix);
  }
  /**
   * Transposes a 4x4 matrix into an existing output matrix.
   *
   * Notes: out must not be the same object as matrix.
   *
   * @param {Float32Array} out    - Output 4x4 matrix.
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - The output matrix (out).
   */
  static transposeTo(out, matrix) {
    if (!(out instanceof Float32Array) || out.length !== MATRIX_4x4_ELEMENT_COUNT || !(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.transposeTo` expects two 4x4 `Float32Array` matrices.");
    }
    if (out === matrix) {
      throw new Error("`Matrix4.transposeTo` does not support in-place transpose. Use a separate output matrix.");
    }
    return _Matrix4.#transposeIntoUnchecked(out, matrix);
  }
  /**
   * Inverts a 4x4 matrix.
   *
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - A new inverted matrix.
   */
  static invert(matrix) {
    if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.invert` expects a 4x4 `Float32Array` matrix.");
    }
    const out = _Matrix4.#createEmpty();
    return _Matrix4.#invertIntoUnchecked(out, matrix);
  }
  /**
   * Inverts a 4x4 matrix into an existing output matrix.
   *
   * @param {Float32Array} out    - Output 4x4 matrix.
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - The output matrix (out).
   */
  static invertTo(out, matrix) {
    if (!(out instanceof Float32Array) || out.length !== MATRIX_4x4_ELEMENT_COUNT || !(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.invertTo` expects two 4x4 `Float32Array` matrices.");
    }
    if (out === matrix) {
      throw new Error("`Matrix4.invertTo` does not support in-place inversion.");
    }
    return _Matrix4.#invertIntoUnchecked(out, matrix);
  }
  /**
   * Multiplies two 4x4 matrices into out without validation.
   *
   * @param {Float32Array} out         - Output 4x4 matrix that will receive the result.
   * @param {Float32Array} leftMatrix  - Left-hand 4x4 matrix.
   * @param {Float32Array} rightMatrix - Right-hand 4x4 matrix.
   * @returns {Float32Array}           - The output matrix (out).
   * @private
   */
  static #multiplyIntoUnchecked(out, leftMatrix, rightMatrix) {
    for (let columnIndex = 0; columnIndex < MATRIX_COLUMN_COUNT; columnIndex += 1) {
      const rightColumnOffset = columnIndex * MATRIX_STRIDE;
      for (let rowIndex = 0; rowIndex < MATRIX_ROW_COUNT; rowIndex += 1) {
        const resultIndex = rightColumnOffset + rowIndex;
        out[resultIndex] = leftMatrix[0 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 0] + leftMatrix[1 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 1] + leftMatrix[2 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 2] + leftMatrix[3 * MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 3];
      }
    }
    return out;
  }
  /**
   * Transposes a 4x4 matrix into out without validation.
   *
   * @param {Float32Array} out    - Output 4x4 matrix, that will receive the result.
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - The output matrix (out).
   * @private
   */
  static #transposeIntoUnchecked(out, matrix) {
    out[0] = matrix[0];
    out[1] = matrix[4];
    out[2] = matrix[8];
    out[3] = matrix[12];
    out[4] = matrix[1];
    out[5] = matrix[5];
    out[6] = matrix[9];
    out[7] = matrix[13];
    out[8] = matrix[2];
    out[9] = matrix[6];
    out[10] = matrix[10];
    out[11] = matrix[14];
    out[12] = matrix[3];
    out[13] = matrix[7];
    out[14] = matrix[11];
    out[15] = matrix[15];
    return out;
  }
  /**
   * Inverts a 4x4 matrix into out without validation. Throws when the matrix is not invertible.
   *
   * @param {Float32Array} out    - Output 4x4 matrix, that will receive the result.
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - The output matrix (out).
   * @private
   */
  static #invertIntoUnchecked(out, matrix) {
    const a00 = matrix[0];
    const a01 = matrix[1];
    const a02 = matrix[2];
    const a03 = matrix[3];
    const a10 = matrix[4];
    const a11 = matrix[5];
    const a12 = matrix[6];
    const a13 = matrix[7];
    const a20 = matrix[8];
    const a21 = matrix[9];
    const a22 = matrix[10];
    const a23 = matrix[11];
    const a30 = matrix[12];
    const a31 = matrix[13];
    const a32 = matrix[14];
    const a33 = matrix[15];
    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;
    const determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (Math.abs(determinant) < MIN_INVERTIBLE_DETERMINANT_ABS) {
      throw new Error("`Matrix4.invertTo`: matrix is not invertible.");
    }
    const inverseDeterminant = INVERSE_DETERMINANT_NUMERATOR / determinant;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * inverseDeterminant;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * inverseDeterminant;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * inverseDeterminant;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * inverseDeterminant;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * inverseDeterminant;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * inverseDeterminant;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * inverseDeterminant;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * inverseDeterminant;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * inverseDeterminant;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * inverseDeterminant;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * inverseDeterminant;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * inverseDeterminant;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * inverseDeterminant;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * inverseDeterminant;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * inverseDeterminant;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * inverseDeterminant;
    return out;
  }
  /**
   * Internal helper to create a zero-filled 4x4 matrix.
   *
   * @returns {Float32Array} - A new zero-filled 4x4 matrix (length 16).
   * @private
   */
  static #createEmpty() {
    return new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
  }
};

// core/math/vector3.js
var ZERO_COMPONENT = 0;
var UNIT_COMPONENT = 1;
var Vector3 = class _Vector3 {
  /** @type {number} */
  #x;
  /** @type {number} */
  #y;
  /** @type {number} */
  #z;
  /** @type {Function | null} */
  #onChange;
  /**
   * @param {number} [x = 0] - X component.
   * @param {number} [y = 0] - Y component.
   * @param {number} [z = 0] - Z component.
   * @param {Function | null} [onChange = null] - Called when any component changes.
   */
  constructor(x = ZERO_COMPONENT, y = ZERO_COMPONENT, z = ZERO_COMPONENT, onChange = null) {
    if (onChange !== null && typeof onChange !== "function") {
      throw new TypeError("Vector3 constructor expects `onChange` as a function or null.");
    }
    this.#x = ZERO_COMPONENT;
    this.#y = ZERO_COMPONENT;
    this.#z = ZERO_COMPONENT;
    this.#onChange = onChange;
    this.set(x, y, z);
  }
  /**
   * Creates a new (0, 0, 0) vector.
   *
   * @param {Function | null} [onChange=null] - Optional callback invoked when the vector changes, or null to disable change notifications.
   * @returns {Vector3}                       - A new Vector3 instance with all components set to zero (0, 0, 0).
   */
  static createZero(onChange = null) {
    return new _Vector3(
      ZERO_COMPONENT,
      ZERO_COMPONENT,
      ZERO_COMPONENT,
      onChange
    );
  }
  /**
   * Creates a new (1, 1, 1) vector (unit scale vector).
   *
   * @param {Function | null} [onChange=null] - Optional callback invoked when the vector changes, or null to disable change notifications.
   * @returns {Vector3}                       - A new Vector3 instance with all components set to one (1, 1, 1).
   */
  static createUnitScale(onChange = null) {
    return new _Vector3(
      UNIT_COMPONENT,
      UNIT_COMPONENT,
      UNIT_COMPONENT,
      onChange
    );
  }
  /**
   * @returns {number} - The current X component value.
   */
  get x() {
    return this.#x;
  }
  /**
   * @param {number} value - New X component value.
   */
  set x(value) {
    _Vector3.#assertNumber(value, "x");
    if (value === this.#x) {
      return;
    }
    this.#x = value;
    this.#emitChange();
  }
  /**
   * @returns {number} - The current Y component value.
   */
  get y() {
    return this.#y;
  }
  /**
   * @param {number} value - New Y component value.
   */
  set y(value) {
    _Vector3.#assertNumber(value, "y");
    if (value === this.#y) {
      return;
    }
    this.#y = value;
    this.#emitChange();
  }
  /**
   * @returns {number} - The current Z component value.
   */
  get z() {
    return this.#z;
  }
  /**
   * @param {number} value - New Z component value.
   */
  set z(value) {
    _Vector3.#assertNumber(value, "z");
    if (value === this.#z) {
      return;
    }
    this.#z = value;
    this.#emitChange();
  }
  /**
   * Sets all components at once.
   * Calls onChange at most once.
   *
   * @param {number} x  - New X component value.
   * @param {number} y  - New Y component value.
   * @param {number} z  - New Z component value.
   * @returns {Vector3} - This vector instance (for chaining).
   */
  set(x, y, z) {
    _Vector3.#assertNumber(x, "x");
    _Vector3.#assertNumber(y, "y");
    _Vector3.#assertNumber(z, "z");
    const changed = x !== this.#x || y !== this.#y || z !== this.#z;
    this.#x = x;
    this.#y = y;
    this.#z = z;
    if (changed) {
      this.#emitChange();
    }
    return this;
  }
  /**
   * Copies components from another `Vector3`.
   *
   * @param {Vector3} other - Source vector to copy components from.
   * @returns {Vector3}     - This vector instance after copying components from the source vector (for chaining).
   */
  copyFrom(other) {
    if (!(other instanceof _Vector3)) {
      throw new TypeError("Vector3.copyFrom expects a Vector3 instance.");
    }
    return this.set(other.x, other.y, other.z);
  }
  /**
   * Sets/updates the onChange callback.
   *
   * @param {Function | null} onChange - Callback invoked when any component changes, or null to disable change notifications.
   * @returns {Vector3}                - This vector instance (for chaining).
   */
  setOnChange(onChange) {
    if (onChange !== null && typeof onChange !== "function") {
      throw new TypeError("Vector3.setOnChange expects a function or null.");
    }
    this.#onChange = onChange;
    return this;
  }
  /**
   * @private
   */
  #emitChange() {
    if (this.#onChange) {
      this.#onChange();
    }
  }
  /**
   * @param {number} value - Value to validate (must be a number and not NaN).
   * @param {string} name  - Component name used in error messages.
   * @private
   */
  static #assertNumber(value, name) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError(`Vector3 component "${name}" must be a valid number.`);
    }
  }
};

// core/math/camera-math.js
var HALF_FIELD_OF_VIEW_DIVISOR2 = 2;
var PROJECTION_SCALE_NUMERATOR2 = 1;
var DEPTH_RANGE_NUMERATOR2 = 1;
var PERSPECTIVE_Z_RANGE_MULTIPLIER2 = 2;
var PERSPECTIVE_W_COMPONENT_SCALE2 = -1;
var ORTHOGRAPHIC_SCALE_NUMERATOR = 2;
var MATRIX_4x4_ELEMENT_COUNT2 = 16;
var MINIMUM_ASPECT_RATIO = 0;
var MINIMUM_NEAR_CLIP_DISTANCE = 0;
var SCALE_INVERSE_NUMERATOR = 1;
var CameraMath = class _CameraMath {
  /**
   * Writes a perspective projection matrix into an existing output matrix.
   *
   * @param {Float32Array} out          - Output 4x4 matrix (length 16), that will receive the projection matrix.
   * @param {number} fieldOfViewRadians - Vertical field of view in radians.
   * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
   * @param {number} near               - Near clipping plane distance (must be > 0).
   * @param {number} far                - Far clipping plane distance (must be > near).
   * @returns {Float32Array}            - The output matrix (out).
   */
  static writePerspectiveMatrixTo(out, fieldOfViewRadians, aspectRatio, near, far) {
    _CameraMath.#assertMatrix4(out);
    if (typeof fieldOfViewRadians !== "number" || typeof aspectRatio !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("CameraMath.writePerspectiveMatrixTo expects numeric arguments.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
      throw new RangeError("CameraMath.writePerspectiveMatrixTo expects a positive aspect ratio.");
    }
    if (near <= MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
      throw new RangeError("CameraMath.writePerspectiveMatrixTo expects 0 < near < far.");
    }
    const projectionScale = PROJECTION_SCALE_NUMERATOR2 / Math.tan(fieldOfViewRadians / HALF_FIELD_OF_VIEW_DIVISOR2);
    const inverseDepthRange = DEPTH_RANGE_NUMERATOR2 / (near - far);
    out[0] = projectionScale / aspectRatio;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = projectionScale;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * inverseDepthRange;
    out[11] = PERSPECTIVE_W_COMPONENT_SCALE2;
    out[12] = 0;
    out[13] = 0;
    out[14] = PERSPECTIVE_Z_RANGE_MULTIPLIER2 * far * near * inverseDepthRange;
    out[15] = 0;
    return out;
  }
  /**
   * Writes an orthographic projection matrix into an existing output matrix.
   *
   * This uses the same clip-space depth convention as `writePerspectiveMatrixTo`.
   *
   * @param {Float32Array} out - Output 4x4 matrix (length 16), that will receive the projection matrix.
   * @param {number} left      - Left plane.
   * @param {number} right     - Right plane.
   * @param {number} bottom    - Bottom plane.
   * @param {number} top       - Top plane.
   * @param {number} near      - Near clipping plane distance.
   * @param {number} far       - Far clipping plane distance.
   * @returns {Float32Array}   - The output matrix.
   */
  static writeOrthographicMatrixTo(out, left, right, bottom, top, near, far) {
    _CameraMath.#assertMatrix4(out);
    if (typeof left !== "number" || typeof right !== "number" || typeof bottom !== "number" || typeof top !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("`CameraMath.writeOrthographicMatrixTo` expects numeric arguments.");
    }
    if (left === right) {
      throw new RangeError("`CameraMath.writeOrthographicMatrixTo` expects `left !== right`.");
    }
    if (bottom === top) {
      throw new RangeError("`CameraMath.writeOrthographicMatrixTo` expects `bottom !== top`.");
    }
    if (far <= near) {
      throw new RangeError("`CameraMath.writeOrthographicMatrixTo` expects `near < far`.");
    }
    const inverseWidth = DEPTH_RANGE_NUMERATOR2 / (right - left);
    const inverseHeight = DEPTH_RANGE_NUMERATOR2 / (top - bottom);
    const inverseDepth = DEPTH_RANGE_NUMERATOR2 / (near - far);
    out[0] = ORTHOGRAPHIC_SCALE_NUMERATOR * inverseWidth;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = ORTHOGRAPHIC_SCALE_NUMERATOR * inverseHeight;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = ORTHOGRAPHIC_SCALE_NUMERATOR * inverseDepth;
    out[11] = 0;
    out[12] = -(right + left) * inverseWidth;
    out[13] = -(top + bottom) * inverseHeight;
    out[14] = (far + near) * inverseDepth;
    out[15] = 1;
    return out;
  }
  /**
   * Writes a view matrix (inverse of camera, TRS) into an existing output matrix.
   *
   * Assumes camera local transform order matches Object3D:
   * local = T * (Rz * Ry * Rx) * S
   * view  = inv(S) * inv(R) * inv(T)
   *
   * @param {Float32Array} out - Output 4x4 matrix (length 16), that will receive the view matrix.
   * @param {Vector3} position - Camera position.
   * @param {Vector3} rotation - Camera rotation in radians.
   * @param {Vector3} scale    - Camera scale (must be non-zero on all axes).
   * @returns {Float32Array}   - The output matrix (out).
   */
  static writeViewMatrixTo(out, position, rotation, scale) {
    _CameraMath.#assertMatrix4(out);
    if (!(position instanceof Vector3) || !(rotation instanceof Vector3) || !(scale instanceof Vector3)) {
      throw new TypeError("CameraMath.writeViewMatrixTo expects Vector3 arguments (position, rotation, scale).");
    }
    if (scale.x === 0 || scale.y === 0 || scale.z === 0) {
      throw new RangeError("CameraMath.writeViewMatrixTo cannot invert a zero scale.");
    }
    const positionX = position.x;
    const positionY = position.y;
    const positionZ = position.z;
    const rotationX = rotation.x;
    const rotationY = rotation.y;
    const rotationZ = rotation.z;
    const inverseScaleX = SCALE_INVERSE_NUMERATOR / scale.x;
    const inverseScaleY = SCALE_INVERSE_NUMERATOR / scale.y;
    const inverseScaleZ = SCALE_INVERSE_NUMERATOR / scale.z;
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);
    const rot00 = cosZ * cosY;
    const rot01 = cosZ * sinY * sinX - sinZ * cosX;
    const rot02 = cosZ * sinY * cosX + sinZ * sinX;
    const rot10 = sinZ * cosY;
    const rot11 = sinZ * sinY * sinX + cosZ * cosX;
    const rot12 = sinZ * sinY * cosX - cosZ * sinX;
    const rot20 = -sinY;
    const rot21 = cosY * sinX;
    const rot22 = cosY * cosX;
    const a00 = rot00 * inverseScaleX;
    const a01 = rot10 * inverseScaleX;
    const a02 = rot20 * inverseScaleX;
    const a10 = rot01 * inverseScaleY;
    const a11 = rot11 * inverseScaleY;
    const a12 = rot21 * inverseScaleY;
    const a20 = rot02 * inverseScaleZ;
    const a21 = rot12 * inverseScaleZ;
    const a22 = rot22 * inverseScaleZ;
    const translateX = -(a00 * positionX + a01 * positionY + a02 * positionZ);
    const translateY = -(a10 * positionX + a11 * positionY + a12 * positionZ);
    const translateZ = -(a20 * positionX + a21 * positionY + a22 * positionZ);
    out[0] = a00;
    out[1] = a10;
    out[2] = a20;
    out[3] = 0;
    out[4] = a01;
    out[5] = a11;
    out[6] = a21;
    out[7] = 0;
    out[8] = a02;
    out[9] = a12;
    out[10] = a22;
    out[11] = 0;
    out[12] = translateX;
    out[13] = translateY;
    out[14] = translateZ;
    out[15] = 1;
    return out;
  }
  /**
   * @param {Float32Array} out - Output matrix to validate.
   * @private
   */
  static #assertMatrix4(out) {
    if (!(out instanceof Float32Array) || out.length !== MATRIX_4x4_ELEMENT_COUNT2) {
      throw new TypeError("Expected out to be a Float32Array(16).");
    }
  }
};

// core/geometry/geometry.js
var POSITION_ATTRIBUTE_LOCATION = 0;
var POSITION_COMPONENT_COUNT = 3;
var COLOR_ATTRIBUTE_LOCATION = 1;
var COLOR_COMPONENT_COUNT = 3;
var UV_ATTRIBUTE_LOCATION = 2;
var UV_COMPONENT_COUNT = 2;
var NORMAL_ATTRIBUTE_LOCATION = 3;
var NORMAL_COMPONENT_COUNT = 3;
var ATTRIBUTE_NORMALIZED = false;
var ATTRIBUTE_NO_STRIDE = 0;
var ATTRIBUTE_NO_OFFSET = 0;
var MODULO_ALIGNED_VALUE = 0;
var TRIANGLE_INDEX_COMPONENT_COUNT = 3;
var LINE_INDEX_COMPONENT_COUNT = 2;
var Geometry = class _Geometry {
  /**
   * WebGL2 rendering context used to create and manage GPU resources.
   *
   * @type {WebGL2RenderingContext}
   * @private
   */
  #webglContext;
  /**
   * Vertex Array Object (VAO) that stores vertex attribute bindings for this geometry.
   *
   * @type {WebGLVertexArrayObject}
   * @private
   */
  #vertexArrayObject;
  /**
   * GPU buffer that stores vertex positions.
   *
   * @type {WebGLBuffer}
   * @private
   */
  #positionBuffer;
  /**
   * Optional GPU buffer, that stores vertex colors.
   * Used by materials that read `a_color` attribute.
   *
   * @type {WebGLBuffer | null}
   * @private
   */
  #colorBuffer;
  /**
   * Optional GPU buffer that stores texture coordinates.
   * Used by textured materials, that read `a_uv` attribute.
   *
   * @type {WebGLBuffer | null}
   * @private
   */
  #uvBuffer;
  /**
   * Optional GPU buffer, that stores the vertex normals.
   * Used by lit materials, that read `a_normal` attribute.
   *
   * @type {WebGLBuffer | null}
   * @private
   */
  #normalBuffer;
  /**
   * Index buffer for solid rendering mode (triangles).
   *
   * @type {WebGLBuffer}
   * @private
   */
  #indexBufferSolid;
  /**
   * Index buffer for wireframe rendering mode (lines).
   *
   * @type {WebGLBuffer}
   * @private
   */
  #indexBufferWireframe;
  /**
   * Number of indices in the solid index buffer.
   *
   * @type {number}
   * @private
   */
  #solidIndexCount;
  /**
   * Number of indices in the wireframe index buffer.
   *
   * @type {number}
   * @private
   */
  #wireframeIndexCount;
  /**
   * Index component type used for solid rendering.
   *
   * @type {number}
   * @private
   */
  #solidIndexComponentType;
  /**
   * Index component type used for wireframe rendering.
   *
   * @type {number}
   * @private
   */
  #wireframeIndexComponentType;
  /**
   * Indicates whether this geometry instance has been disposed.
   * Disposed geometries must not be used for rendering.
   *
   * @type {boolean}
   * @private
   */
  #isDisposed = false;
  /**
   * @param {WebGL2RenderingContext} webglContext        - WebGL2 rendering context used to create and manage GPU resources.
   * @param {Float32Array} positions                     - [x, y, z] triples.
   * @param {Float32Array | null} colors                 - [red, green, blue] triples or null.
   * @param {Uint16Array | Uint32Array} indicesSolid     - Indices for solid triangles.
   * @param {Uint16Array | Uint32Array} indicesWireframe - Indices for wireframe lines.
   * @param {Float32Array | null} [uvs = null]           - [u, v] pairs or null.
   * @param {Float32Array | null} [normals = null]       - [x, y, z] triples or null.
   */
  constructor(webglContext, positions, colors, indicesSolid, indicesWireframe, uvs = null, normals = null) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError("`Geometry` expects a `WebGL2RenderingContext`.");
    }
    if (!(positions instanceof Float32Array)) {
      throw new TypeError("`Geometry` expects positions as `Float32Array`.");
    }
    if (colors !== null && !(colors instanceof Float32Array)) {
      throw new TypeError("`Geometry` expects colors as `Float32Array` or null.");
    }
    if (uvs !== null && !(uvs instanceof Float32Array)) {
      throw new TypeError("`Geometry` expects uvs as `Float32Array` or null.");
    }
    if (normals !== null && !(normals instanceof Float32Array)) {
      throw new TypeError("`Geometry` expects normals as `Float32Array` or null.");
    }
    if (!_Geometry.#isSupportedIndexArray(indicesSolid) || !_Geometry.#isSupportedIndexArray(indicesWireframe)) {
      throw new TypeError("`Geometry` expects indices as `Uint16Array` or `Uint32Array`.");
    }
    this.#validateAttributeSizes(positions, colors, uvs, normals);
    this.#validateIndexSizes(indicesSolid, indicesWireframe);
    this.#webglContext = webglContext;
    this.#solidIndexCount = indicesSolid.length;
    this.#wireframeIndexCount = indicesWireframe.length;
    this.#solidIndexComponentType = _Geometry.#resolveIndexComponentType(webglContext, indicesSolid);
    this.#wireframeIndexComponentType = _Geometry.#resolveIndexComponentType(webglContext, indicesWireframe);
    this.#vertexArrayObject = this.#createVertexArrayObject();
    this.#positionBuffer = this.#createStaticArrayBuffer(positions);
    this.#colorBuffer = colors ? this.#createStaticArrayBuffer(colors) : null;
    this.#uvBuffer = uvs ? this.#createStaticArrayBuffer(uvs) : null;
    this.#normalBuffer = normals ? this.#createStaticArrayBuffer(normals) : null;
    this.#indexBufferSolid = this.#createIndexBuffer(indicesSolid);
    this.#indexBufferWireframe = this.#createIndexBuffer(indicesWireframe);
    this.#configureVertexArray();
  }
  /**
   * Binds the VAO of this geometry.
   */
  bind() {
    this.#assertNotDisposed();
    this.#webglContext.bindVertexArray(this.#vertexArrayObject);
  }
  /**
   * Binds the appropriate index buffer depending on the wireframe flag.
   *
   * @param {boolean} wireframe - Flag indicating whether the geometry should be drawn in wireframe mode.
   */
  bindIndexBuffer(wireframe) {
    this.#assertNotDisposed();
    const buffer = wireframe ? this.#indexBufferWireframe : this.#indexBufferSolid;
    this.#webglContext.bindBuffer(this.#webglContext.ELEMENT_ARRAY_BUFFER, buffer);
  }
  /**
   * Returns the index count depending on the wireframe flag.
   *
   * @param {boolean} wireframe - Flag indicating whether the geometry should be drawn in wireframe mode.
   * @returns {number}
   */
  getIndexCount(wireframe) {
    this.#assertNotDisposed();
    return wireframe ? this.#wireframeIndexCount : this.#solidIndexCount;
  }
  /**
   * Returns index component type constant used by `drawElements()`.
   * This depends on whether the index buffer is `Uint16Array` or `Uint32Array`.
   *
   * @param {boolean} wireframe - When true, returns wireframe index component type.
   * @returns {number}          - WebGL component type constant.
   */
  getIndexComponentType(wireframe) {
    this.#assertNotDisposed();
    return wireframe ? this.#wireframeIndexComponentType : this.#solidIndexComponentType;
  }
  /**
   * Releases all GPU resources owned by this geometry (VAO and buffers).
   * After calling dispose, this geometry instance must not be used for rendering.
   */
  dispose() {
    if (this.#isDisposed) {
      return;
    }
    const webglContext = this.#webglContext;
    webglContext.deleteBuffer(this.#positionBuffer);
    if (this.#colorBuffer) {
      webglContext.deleteBuffer(this.#colorBuffer);
      this.#colorBuffer = null;
    }
    if (this.#uvBuffer) {
      webglContext.deleteBuffer(this.#uvBuffer);
      this.#uvBuffer = null;
    }
    if (this.#normalBuffer) {
      webglContext.deleteBuffer(this.#normalBuffer);
      this.#normalBuffer = null;
    }
    webglContext.deleteBuffer(this.#indexBufferSolid);
    webglContext.deleteBuffer(this.#indexBufferWireframe);
    webglContext.deleteVertexArray(this.#vertexArrayObject);
    this.#isDisposed = true;
  }
  /**
   * Creates a vertex array object (VAO).
   *
   * @returns {WebGLVertexArrayObject}
   * @private
   */
  #createVertexArrayObject() {
    const vao = this.#webglContext.createVertexArray();
    if (!vao) {
      throw new Error("Failed to create vertex array object (VAO).");
    }
    return vao;
  }
  /**
   * Creates a static `ARRAY_BUFFER` and uploads the given data.
   *
   * @param {Float32Array} data - Vertex attribute data stored as a flat array of numeric components.
   * @returns {WebGLBuffer}
   * @private
   */
  #createStaticArrayBuffer(data) {
    const buffer = this.#webglContext.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create `ARRAY_BUFFER`.");
    }
    this.#webglContext.bindBuffer(this.#webglContext.ARRAY_BUFFER, buffer);
    this.#webglContext.bufferData(this.#webglContext.ARRAY_BUFFER, data, this.#webglContext.STATIC_DRAW);
    return buffer;
  }
  /**
   * Creates an `ELEMENT_ARRAY_BUFFER` and uploads the given index data.
   *
   * @param {Uint16Array | Uint32Array} indices - Index data referencing vertices in the associated vertex buffers.
   * @returns {WebGLBuffer}
   * @private
   */
  #createIndexBuffer(indices) {
    const buffer = this.#webglContext.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create `ELEMENT_ARRAY_BUFFER`.");
    }
    if (!_Geometry.#isSupportedIndexArray(indices)) {
      throw new TypeError("`Geometry` expects indices as `Uint16Array` or `Uint32Array`.");
    }
    this.#webglContext.bindBuffer(this.#webglContext.ELEMENT_ARRAY_BUFFER, buffer);
    this.#webglContext.bufferData(this.#webglContext.ELEMENT_ARRAY_BUFFER, indices, this.#webglContext.STATIC_DRAW);
    return buffer;
  }
  /**
   * Checks whether an index array type is supported by `Geometry`.
   *
   * @param {unknown} indices - Value to test.
   * @returns {boolean}       - True if indices is `Uint16Array` or `Uint32Array`.
   * @private
   */
  static #isSupportedIndexArray(indices) {
    return indices instanceof Uint16Array || indices instanceof Uint32Array;
  }
  /**
   * Resolves WebGL index component type constant for the given index array.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 context, that provides constants.
   * @param {Uint16Array | Uint32Array} indices   - Index buffer array.
   * @returns {number}                            - `UNSIGNED_SHORT` or `UNSIGNED_INT`.
   * @private
   */
  static #resolveIndexComponentType(webglContext, indices) {
    return indices instanceof Uint32Array ? webglContext.UNSIGNED_INT : webglContext.UNSIGNED_SHORT;
  }
  /**
   * Validates vertex attribute array sizes (positions, colors, uvs, normals).
   *
   * @param {Float32Array} positions      - Flat array of positions: `[x, y, z] * vertexCount`.
   * @param {Float32Array | null} colors  - Optional flat array of colors: `[red, green, blue] * vertexCount`.
   * @param {Float32Array | null} uvs     - Optional flat array of UVs: `[u, v] * vertexCount`.
   * @param {Float32Array | null} normals - Optional flat array of normals: `[x, y, z] * vertexCount`.
   * @private
   */
  #validateAttributeSizes(positions, colors, uvs, normals) {
    if (positions.length % POSITION_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
      throw new Error("Geometry positions length must be a multiple of `POSITION_COMPONENT_COUNT`.");
    }
    const vertexCount = positions.length / POSITION_COMPONENT_COUNT;
    if (colors !== null) {
      if (colors.length % COLOR_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
        throw new Error("Geometry colors length must be a multiple of `COLOR_COMPONENT_COUNT`.");
      }
      const colorVertexCount = colors.length / COLOR_COMPONENT_COUNT;
      if (colorVertexCount !== vertexCount) {
        throw new Error("Geometry colors vertex count must match positions vertex count.");
      }
    }
    if (uvs !== null) {
      if (uvs.length % UV_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
        throw new Error("Geometry uvs length must be a multiple of `UV_COMPONENT_COUNT`.");
      }
      const uvVertexCount = uvs.length / UV_COMPONENT_COUNT;
      if (uvVertexCount !== vertexCount) {
        throw new Error("Geometry uvs vertex count must match positions vertex count.");
      }
    }
    if (normals !== null) {
      if (normals.length % NORMAL_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
        throw new Error("Geometry normals length must be a multiple of `NORMAL_COMPONENT_COUNT`.");
      }
      const normalVertexCount = normals.length / NORMAL_COMPONENT_COUNT;
      if (normalVertexCount !== vertexCount) {
        throw new Error("Geometry normals vertex count must match positions vertex count.");
      }
    }
  }
  /**
   * Validates basic index array structure (triangles + lines).
   *
   * @param {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer data (3 indices per triangle).
   * @param {Uint16Array | Uint32Array} indicesWireframe - Line index buffer data (2 indices per line segment).
   * @private
   */
  #validateIndexSizes(indicesSolid, indicesWireframe) {
    if (indicesSolid.length % TRIANGLE_INDEX_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
      throw new Error("Geometry solid indices length must be a multiple of `TRIANGLE_INDEX_COMPONENT_COUNT`.");
    }
    if (indicesWireframe.length % LINE_INDEX_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
      throw new Error("Geometry wireframe indices length must be a multiple of `LINE_INDEX_COMPONENT_COUNT`.");
    }
  }
  /**
   * Configures the VAO with position (and optional color/uv) attribute pointers.
   *
   * @private
   */
  #configureVertexArray() {
    const webglContext = this.#webglContext;
    webglContext.bindVertexArray(this.#vertexArrayObject);
    webglContext.bindBuffer(webglContext.ARRAY_BUFFER, this.#positionBuffer);
    webglContext.enableVertexAttribArray(POSITION_ATTRIBUTE_LOCATION);
    webglContext.vertexAttribPointer(
      POSITION_ATTRIBUTE_LOCATION,
      POSITION_COMPONENT_COUNT,
      webglContext.FLOAT,
      ATTRIBUTE_NORMALIZED,
      ATTRIBUTE_NO_STRIDE,
      ATTRIBUTE_NO_OFFSET
    );
    if (this.#colorBuffer) {
      webglContext.bindBuffer(webglContext.ARRAY_BUFFER, this.#colorBuffer);
      webglContext.enableVertexAttribArray(COLOR_ATTRIBUTE_LOCATION);
      webglContext.vertexAttribPointer(
        COLOR_ATTRIBUTE_LOCATION,
        COLOR_COMPONENT_COUNT,
        webglContext.FLOAT,
        ATTRIBUTE_NORMALIZED,
        ATTRIBUTE_NO_STRIDE,
        ATTRIBUTE_NO_OFFSET
      );
    }
    if (this.#uvBuffer) {
      webglContext.bindBuffer(webglContext.ARRAY_BUFFER, this.#uvBuffer);
      webglContext.enableVertexAttribArray(UV_ATTRIBUTE_LOCATION);
      webglContext.vertexAttribPointer(
        UV_ATTRIBUTE_LOCATION,
        UV_COMPONENT_COUNT,
        webglContext.FLOAT,
        ATTRIBUTE_NORMALIZED,
        ATTRIBUTE_NO_STRIDE,
        ATTRIBUTE_NO_OFFSET
      );
    }
    if (this.#normalBuffer) {
      webglContext.bindBuffer(webglContext.ARRAY_BUFFER, this.#normalBuffer);
      webglContext.enableVertexAttribArray(NORMAL_ATTRIBUTE_LOCATION);
      webglContext.vertexAttribPointer(
        NORMAL_ATTRIBUTE_LOCATION,
        NORMAL_COMPONENT_COUNT,
        webglContext.FLOAT,
        ATTRIBUTE_NORMALIZED,
        ATTRIBUTE_NO_STRIDE,
        ATTRIBUTE_NO_OFFSET
      );
    }
    webglContext.bindBuffer(webglContext.ELEMENT_ARRAY_BUFFER, this.#indexBufferSolid);
    webglContext.bindVertexArray(null);
  }
  /**
   * @private
   */
  #assertNotDisposed() {
    if (this.#isDisposed) {
      throw new Error("Geometry has been disposed and can no longer be used.");
    }
  }
};

// core/geometry/geometry-utils.js
var DEFAULT_VERTEX_COLOR = new Float32Array([1, 1, 1]);
var COLOR_COMPONENT_COUNT2 = 3;
var DEFAULT_EXPECTED_PER_VERTEX_COLOR_LENGTH = 0;
var AUTO_EXPECTED_PER_VERTEX_COLOR_LENGTH = 0;
var MAX_UINT16_INDEX_VALUE = 65535;
var VERTEX_COUNT_TO_MAX_INDEX_OFFSET = 1;
var TRIANGLE_INDEX_STRIDE = 3;
var EDGE_KEY_SEPARATOR = ",";
function createColorsFromSpec(vertexCount, colors, expectedPerVertexLength = DEFAULT_EXPECTED_PER_VERTEX_COLOR_LENGTH) {
  if (!(colors instanceof Float32Array)) {
    throw new TypeError("`createColorsFromSpec` expects colors as a `Float32Array`.");
  }
  const perVertexLength = expectedPerVertexLength > AUTO_EXPECTED_PER_VERTEX_COLOR_LENGTH ? expectedPerVertexLength : vertexCount * COLOR_COMPONENT_COUNT2;
  if (colors.length === COLOR_COMPONENT_COUNT2) {
    const colorBuffer = new Float32Array(perVertexLength);
    for (let i = 0; i < vertexCount; i += 1) {
      const baseIndex = i * COLOR_COMPONENT_COUNT2;
      colorBuffer[baseIndex + 0] = colors[0];
      colorBuffer[baseIndex + 1] = colors[1];
      colorBuffer[baseIndex + 2] = colors[2];
    }
    return colorBuffer;
  }
  if (colors.length === perVertexLength) {
    return colors;
  }
  throw new TypeError(
    "`createColorsFromSpec` expects `colors` length to be `{uniform}` (uniform) or `{vertex}` (per-vertex).".replace("{uniform}", String(COLOR_COMPONENT_COUNT2)).replace("{vertex}", String(perVertexLength))
  );
}
function createIndexArray(vertexCount, indices) {
  if (!Array.isArray(indices)) {
    throw new TypeError("`createIndexArray` expects indices as an array of numbers.");
  }
  const requiresUint32 = vertexCount - VERTEX_COUNT_TO_MAX_INDEX_OFFSET > MAX_UINT16_INDEX_VALUE;
  if (requiresUint32) {
    return new Uint32Array(indices);
  }
  return new Uint16Array(indices);
}
function createWireframeIndicesFromSolidIndices(vertexCount, triangleIndices) {
  if (!(triangleIndices instanceof Uint16Array) && !(triangleIndices instanceof Uint32Array)) {
    throw new TypeError("`createWireframeIndicesFromSolidIndices` expects indices as `Uint16Array` or `Uint32Array`.");
  }
  const edgeSet = /* @__PURE__ */ new Set();
  const lines = [];
  for (let i = 0; i < triangleIndices.length; i += TRIANGLE_INDEX_STRIDE) {
    const firstVertexIndex = triangleIndices[i + 0];
    const secondVertexIndex = triangleIndices[i + 1];
    const thirdVertexIndex = triangleIndices[i + 2];
    addEdge(edgeSet, lines, firstVertexIndex, secondVertexIndex);
    addEdge(edgeSet, lines, secondVertexIndex, thirdVertexIndex);
    addEdge(edgeSet, lines, thirdVertexIndex, firstVertexIndex);
  }
  return createIndexArray(vertexCount, lines);
}
function addEdge(edgeSet, lines, indexA, indexB) {
  const minVertexIndex = Math.min(indexA, indexB);
  const maxVertexIndex = Math.max(indexA, indexB);
  const edgeKey = String(minVertexIndex) + EDGE_KEY_SEPARATOR + String(maxVertexIndex);
  if (edgeSet.has(edgeKey)) {
    return;
  }
  edgeSet.add(edgeKey);
  lines.push(minVertexIndex, maxVertexIndex);
}

// core/geometry/custom-geometry.js
var DEFAULT_WIREFRAME_INDICES = null;
var DEFAULT_COLORS = null;
var DEFAULT_UVS = null;
var DEFAULT_NORMALS = null;
var POSITION_COMPONENT_COUNT2 = 3;
var ZERO_VALUE = 0;
var CustomGeometry = class _CustomGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {CustomGeometryOptions} options       - Geometry buffers.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`CustomGeometry` expects options as a plain object.");
    }
    const {
      positions,
      indices,
      wireframeIndices = DEFAULT_WIREFRAME_INDICES,
      colors = DEFAULT_COLORS,
      uvs = DEFAULT_UVS,
      normals = DEFAULT_NORMALS
    } = options;
    if (!(positions instanceof Float32Array)) {
      throw new TypeError("`CustomGeometry` expects `positions` as `Float32Array`.");
    }
    if (positions.length % POSITION_COMPONENT_COUNT2 !== ZERO_VALUE) {
      throw new RangeError("`CustomGeometry` expects `positions` length to be a multiple of 3.");
    }
    const vertexCount = positions.length / POSITION_COMPONENT_COUNT2;
    const solidIndexBuffer = _CustomGeometry.#normalizeIndices(vertexCount, indices, "indices");
    const wireIndexBuffer = _CustomGeometry.#normalizeWireframeIndices(vertexCount, solidIndexBuffer, wireframeIndices);
    const colorBuffer = _CustomGeometry.#normalizeColors(vertexCount, colors);
    const uvBuffer = _CustomGeometry.#normalizeOptionalFloat32Array(uvs, "uvs");
    const normalBuffer = _CustomGeometry.#normalizeOptionalFloat32Array(normals, "normals");
    super(
      webglContext,
      positions,
      colorBuffer,
      solidIndexBuffer,
      wireIndexBuffer,
      uvBuffer,
      normalBuffer
    );
  }
  /**
   * Normalizes solid indices input to a typed array.
   *
   * @param {number} vertexCount                           - Total vertex count.
   * @param {number[] | Uint16Array | Uint32Array} indices - Input indices.
   * @param {string} optionName                            - Option name for error reporting.
   * @returns {Uint16Array | Uint32Array}
   * @private
   */
  static #normalizeIndices(vertexCount, indices, optionName) {
    if (Array.isArray(indices)) {
      return createIndexArray(vertexCount, indices);
    }
    if (indices instanceof Uint16Array || indices instanceof Uint32Array) {
      return indices;
    }
    throw new TypeError(`\`CustomGeometry\` expects \`${optionName}\` as an array, Uint16Array or Uint32Array.`);
  }
  /**
   * Normalizes wireframe indices input.
   *
   * @param {number} vertexCount                                           - Total vertex count.
   * @param {Uint16Array | Uint32Array} solidIndices                       - Solid triangle indices.
   * @param {number[] | Uint16Array | Uint32Array | null} wireframeIndices - Wireframe indices.
   * @returns {Uint16Array | Uint32Array}
   * @private
   */
  static #normalizeWireframeIndices(vertexCount, solidIndices, wireframeIndices) {
    if (wireframeIndices === null || wireframeIndices === void 0) {
      return createWireframeIndicesFromSolidIndices(vertexCount, solidIndices);
    }
    if (Array.isArray(wireframeIndices)) {
      return createIndexArray(vertexCount, wireframeIndices);
    }
    if (wireframeIndices instanceof Uint16Array || wireframeIndices instanceof Uint32Array) {
      return wireframeIndices;
    }
    throw new TypeError("`CustomGeometry` expects `wireframeIndices` as an array, `Uint16Array`, `Uint32Array` or null.");
  }
  /**
   * Normalizes optional colors input.
   *
   * @param {number} vertexCount         - Total vertex count.
   * @param {Float32Array | null} colors - Colors input.
   * @returns {Float32Array | null}
   * @private
   */
  static #normalizeColors(vertexCount, colors) {
    if (colors === null || colors === void 0) {
      return null;
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`CustomGeometry` expects `colors` as `Float32Array` or null.");
    }
    return createColorsFromSpec(vertexCount, colors);
  }
  /**
   * Normalizes optional float arrays.
   *
   * @param {Float32Array | null} value - Buffer value.
   * @param {string} optionName         - Option name for error reporting.
   * @returns {Float32Array | null}
   * @private
   */
  static #normalizeOptionalFloat32Array(value, optionName) {
    if (value === null || value === void 0) {
      return null;
    }
    if (!(value instanceof Float32Array)) {
      throw new TypeError(`\`CustomGeometry\` expects \`${optionName}\` as \`Float32Array\` or null.`);
    }
    return value;
  }
};

// core/geometry/box-geometry.js
var DEFAULT_BOX_SIZE = 1;
var DEFAULT_SEGMENT_COUNT = 1;
var HALF_SIZE_DIVISOR = 2;
var VEC3_COMPONENT_COUNT = 3;
var BOX_FACE_COUNT = 6;
var COLORS_PER_FACE_LENGTH = BOX_FACE_COUNT * VEC3_COMPONENT_COUNT;
var MIN_SEGMENT_COUNT = 1;
var VERTICES_PER_SEGMENT_INCREMENT = 1;
var CENTER_T_OFFSET = 0.5;
var UV_V_FLIP_BASE = 1;
var DEFAULT_T_VALUE = 0;
var ZERO_SEGMENT_COUNT = 0;
var NEXT_VERTEX_OFFSET = 1;
var BoxGeometry = class _BoxGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext         - WebGL2 rendering context.
   * @param {BoxGeometryOptions | number} [optionsOrSize] - Options object or numeric size.
   */
  constructor(webglContext, optionsOrSize = {}) {
    const options = _BoxGeometry.#normalizeOptions(optionsOrSize);
    const data = _BoxGeometry.#createGeometryData(options);
    super(
      webglContext,
      data.positions,
      data.colors,
      data.indicesSolid,
      data.indicesWireframe,
      data.uvs,
      data.normals
    );
  }
  /**
   * Normalizes constructor input to a `BoxGeometryOptions` object.
   *
   * @param {BoxGeometryOptions | number} optionsOrSize - Options object or numeric size.
   * @returns {Required<BoxGeometryOptions>}            - Normalized options.
   * @private
   */
  static #normalizeOptions(optionsOrSize) {
    if (typeof optionsOrSize === "number") {
      return {
        size: optionsOrSize,
        width: optionsOrSize,
        height: optionsOrSize,
        depth: optionsOrSize,
        widthSegments: DEFAULT_SEGMENT_COUNT,
        heightSegments: DEFAULT_SEGMENT_COUNT,
        depthSegments: DEFAULT_SEGMENT_COUNT,
        colors: DEFAULT_VERTEX_COLOR
      };
    }
    if (optionsOrSize === null || typeof optionsOrSize !== "object") {
      throw new TypeError("`BoxGeometry` expects options as an object or a number.");
    }
    const {
      size = DEFAULT_BOX_SIZE,
      width = size,
      height = size,
      depth = size,
      widthSegments = DEFAULT_SEGMENT_COUNT,
      heightSegments = DEFAULT_SEGMENT_COUNT,
      depthSegments = DEFAULT_SEGMENT_COUNT,
      colors = DEFAULT_VERTEX_COLOR
    } = optionsOrSize;
    if (typeof width !== "number" || typeof height !== "number" || typeof depth !== "number") {
      throw new TypeError("`BoxGeometry` expects `width/height/depth` as numbers.");
    }
    if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
      throw new RangeError("`BoxGeometry` expects finite `width/height/depth`.");
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`BoxGeometry` expects colors as a `Float32Array`.");
    }
    return {
      size,
      width,
      height,
      depth,
      widthSegments: _BoxGeometry.#normalizeSegmentCount(widthSegments, "widthSegments"),
      heightSegments: _BoxGeometry.#normalizeSegmentCount(heightSegments, "heightSegments"),
      depthSegments: _BoxGeometry.#normalizeSegmentCount(depthSegments, "depthSegments"),
      colors
    };
  }
  /**
   * Normalizes and validates a segment count parameter.
   *
   * @param {number} value      - Segment count value.
   * @param {string} optionName - Name of the option for error messages.
   * @returns {number}          - Normalized integer `>= 1`.
   * @private
   */
  static #normalizeSegmentCount(value, optionName) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`BoxGeometry` expects `{name}` as a finite number.".replace("{name}", optionName));
    }
    const intValue = Math.floor(value);
    if (intValue < MIN_SEGMENT_COUNT) {
      throw new RangeError(
        "`BoxGeometry` expects `{name}` to be `>= {min}`.".replace("{name}", optionName).replace("{min}", String(MIN_SEGMENT_COUNT))
      );
    }
    return intValue;
  }
  /**
   * Creates full geometry data for a segmented box.
   *
   * @param {Required<BoxGeometryOptions>} options - Normalized options.
   * @returns {BoxGeometryData}                    - Geometry buffers.
   *
   * @private
   */
  static #createGeometryData(options) {
    const halfWidth = options.width / HALF_SIZE_DIVISOR;
    const halfHeight = options.height / HALF_SIZE_DIVISOR;
    const halfDepth = options.depth / HALF_SIZE_DIVISOR;
    const positions = [];
    const normals = [];
    const uvs = [];
    const faceVertexCounts = [];
    const indicesSolid = [];
    let vertexOffset = 0;
    const faces = [
      // Front (+Z)
      {
        axisU: [1, 0, 0],
        axisV: [0, 1, 0],
        normal: [0, 0, 1],
        fixed: halfDepth,
        sizeU: options.width,
        sizeV: options.height,
        segmentsU: options.widthSegments,
        segmentsV: options.heightSegments
      },
      // Back (-Z)
      {
        axisU: [-1, 0, 0],
        axisV: [0, 1, 0],
        normal: [0, 0, -1],
        fixed: halfDepth,
        sizeU: options.width,
        sizeV: options.height,
        segmentsU: options.widthSegments,
        segmentsV: options.heightSegments
      },
      // Top (+Y)
      {
        axisU: [1, 0, 0],
        axisV: [0, 0, -1],
        normal: [0, 1, 0],
        fixed: halfHeight,
        sizeU: options.width,
        sizeV: options.depth,
        segmentsU: options.widthSegments,
        segmentsV: options.depthSegments
      },
      // Bottom (-Y)
      {
        axisU: [1, 0, 0],
        axisV: [0, 0, 1],
        normal: [0, -1, 0],
        fixed: halfHeight,
        sizeU: options.width,
        sizeV: options.depth,
        segmentsU: options.widthSegments,
        segmentsV: options.depthSegments
      },
      // Right (+X)
      {
        axisU: [0, 0, -1],
        axisV: [0, 1, 0],
        normal: [1, 0, 0],
        fixed: halfWidth,
        sizeU: options.depth,
        sizeV: options.height,
        segmentsU: options.depthSegments,
        segmentsV: options.heightSegments
      },
      // Left (-X)
      {
        axisU: [0, 0, 1],
        axisV: [0, 1, 0],
        normal: [-1, 0, 0],
        fixed: halfWidth,
        sizeU: options.depth,
        sizeV: options.height,
        segmentsU: options.depthSegments,
        segmentsV: options.heightSegments
      }
    ];
    for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
      const face = faces[faceIndex];
      const localVertexCount = _BoxGeometry.#appendFaceGrid(
        positions,
        normals,
        uvs,
        indicesSolid,
        vertexOffset,
        face
      );
      faceVertexCounts.push(localVertexCount);
      vertexOffset += localVertexCount;
    }
    const vertexCount = vertexOffset;
    const colors = _BoxGeometry.#createColors(options.colors, vertexCount, faceVertexCounts);
    const indicesSolidTyped = createIndexArray(vertexCount, indicesSolid);
    const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolidTyped);
    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      colors,
      indicesSolid: indicesSolidTyped,
      indicesWireframe
    };
  }
  /**
   * Appends a single face grid to the output buffers.
   *
   * @param {number[]} positions     - Output positions.
   * @param {number[]} normals       - Output normals.
   * @param {number[]} uvs           - Output UVs.
   * @param {number[]} indicesSolid  - Output solid indices (triangles).
   * @param {number} vertexOffset    - Starting vertex index for this face.
   * @param {BoxFaceDefinition} face - Face definition.
   * @returns {number}               - Number of vertices appended for this face.
   * @private
   */
  static #appendFaceGrid(positions, normals, uvs, indicesSolid, vertexOffset, face) {
    const segmentsU = face.segmentsU;
    const segmentsV = face.segmentsV;
    const uVertexCount = segmentsU + VERTICES_PER_SEGMENT_INCREMENT;
    const vVertexCount = segmentsV + VERTICES_PER_SEGMENT_INCREMENT;
    for (let vIndex = 0; vIndex < vVertexCount; vIndex += 1) {
      const vNormalized = segmentsV === ZERO_SEGMENT_COUNT ? DEFAULT_T_VALUE : vIndex / segmentsV;
      const vLocalOffset = (vNormalized - CENTER_T_OFFSET) * face.sizeV;
      for (let uIndex = 0; uIndex < uVertexCount; uIndex += 1) {
        const uNormalized = segmentsU === ZERO_SEGMENT_COUNT ? DEFAULT_T_VALUE : uIndex / segmentsU;
        const uLocalOffset = (uNormalized - CENTER_T_OFFSET) * face.sizeU;
        const positionX = face.axisU[0] * uLocalOffset + face.axisV[0] * vLocalOffset + face.normal[0] * face.fixed;
        const positionY = face.axisU[1] * uLocalOffset + face.axisV[1] * vLocalOffset + face.normal[1] * face.fixed;
        const positionZ = face.axisU[2] * uLocalOffset + face.axisV[2] * vLocalOffset + face.normal[2] * face.fixed;
        positions.push(positionX, positionY, positionZ);
        normals.push(face.normal[0], face.normal[1], face.normal[2]);
        uvs.push(uNormalized, UV_V_FLIP_BASE - vNormalized);
      }
    }
    for (let vIndex = 0; vIndex < segmentsV; vIndex += 1) {
      for (let uIndex = 0; uIndex < segmentsU; uIndex += 1) {
        const topLeftVertexIndex = vertexOffset + vIndex * uVertexCount + uIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET;
        const bottomLeftVertexIndex = topLeftVertexIndex + uVertexCount;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
        indicesSolid.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
        indicesSolid.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
      }
    }
    return uVertexCount * vVertexCount;
  }
  /**
   * Creates a per-vertex color buffer for the final vertex count.
   *
   * @param {Float32Array} colorsSpec   - Color specification.
   * @param {number} vertexCount        - Total vertex count.
   * @param {number[]} faceVertexCounts - Vertex count for each face, in face order.
   * @returns {Float32Array}            - Per-vertex RGB buffer.
   * @private
   */
  static #createColors(colorsSpec, vertexCount, faceVertexCounts) {
    if (colorsSpec.length === COLORS_PER_FACE_LENGTH) {
      const colorBuffer = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
      let vertexBase = 0;
      for (let faceIndex = 0; faceIndex < BOX_FACE_COUNT; faceIndex += 1) {
        const faceVertexCount = faceVertexCounts[faceIndex];
        const faceColorBase = faceIndex * VEC3_COMPONENT_COUNT;
        const red = colorsSpec[faceColorBase + 0];
        const green = colorsSpec[faceColorBase + 1];
        const blue = colorsSpec[faceColorBase + 2];
        for (let i = 0; i < faceVertexCount; i += 1) {
          const destinationComponentOffset = (vertexBase + i) * VEC3_COMPONENT_COUNT;
          colorBuffer[destinationComponentOffset + 0] = red;
          colorBuffer[destinationComponentOffset + 1] = green;
          colorBuffer[destinationComponentOffset + 2] = blue;
        }
        vertexBase += faceVertexCount;
      }
      return colorBuffer;
    }
    return createColorsFromSpec(vertexCount, colorsSpec);
  }
};

// core/geometry/plane-geometry.js
var DEFAULT_PLANE_WIDTH = 1;
var DEFAULT_PLANE_HEIGHT = 1;
var DEFAULT_SEGMENT_COUNT2 = 1;
var MIN_SEGMENT_COUNT2 = 1;
var VERTICES_PER_SEGMENT_INCREMENT2 = 1;
var NEXT_VERTEX_OFFSET2 = 1;
var CENTER_T_OFFSET2 = 0.5;
var UV_V_FLIP_BASE2 = 1;
var PLANE_Z_POSITION = 0;
var VEC3_COMPONENT_COUNT2 = 3;
var VEC2_COMPONENT_COUNT = 2;
var PLANE_NORMAL_X = 0;
var PLANE_NORMAL_Y = 0;
var PLANE_NORMAL_Z = 1;
var PlaneGeometry = class _PlaneGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {PlaneGeometryOptions} [options = {}] - Geometry options.
   */
  constructor(webglContext, options = {}) {
    const normalized = _PlaneGeometry.#normalizeOptions(options);
    const data = _PlaneGeometry.#createGeometryData(normalized);
    super(
      webglContext,
      data.positions,
      data.colors,
      data.indicesSolid,
      data.indicesWireframe,
      data.uvs,
      data.normals
    );
  }
  /**
   * Normalizes constructor input to a `PlaneGeometryOptions` object.
   *
   * @param {PlaneGeometryOptions} options     - Options object.
   * @returns {Required<PlaneGeometryOptions>} - Normalized options.
   * @private
   */
  static #normalizeOptions(options) {
    if (options === null || typeof options !== "object") {
      throw new TypeError("`PlaneGeometry` expects options as an object.");
    }
    const {
      width = DEFAULT_PLANE_WIDTH,
      height = DEFAULT_PLANE_HEIGHT,
      widthSegments = DEFAULT_SEGMENT_COUNT2,
      heightSegments = DEFAULT_SEGMENT_COUNT2,
      colors = DEFAULT_VERTEX_COLOR
    } = options;
    if (typeof width !== "number" || typeof height !== "number") {
      throw new TypeError("`PlaneGeometry` expects `width/height` as numbers.");
    }
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new RangeError("`PlaneGeometry` expects finite `width/height`.");
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`PlaneGeometry` expects colors as a `Float32Array`.");
    }
    return {
      width,
      height,
      widthSegments: _PlaneGeometry.#normalizeSegmentCount(widthSegments, "widthSegments"),
      heightSegments: _PlaneGeometry.#normalizeSegmentCount(heightSegments, "heightSegments"),
      colors
    };
  }
  /**
   * Normalizes and validates a segment count parameter.
   *
   * @param {number} value      - Segment count value.
   * @param {string} optionName - Name of the option for error messages.
   * @returns {number}          - Normalized integer `>= 1`.
   * @private
   */
  static #normalizeSegmentCount(value, optionName) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`PlaneGeometry` expects `{name}` as a finite number.".replace("{name}", optionName));
    }
    const intValue = Math.floor(value);
    if (intValue < MIN_SEGMENT_COUNT2) {
      throw new RangeError(
        "`PlaneGeometry` expects `{name}` to be `>= {min}`.".replace("{name}", optionName).replace("{min}", String(MIN_SEGMENT_COUNT2))
      );
    }
    return intValue;
  }
  /**
   * Creates full geometry data for a segmented plane.
   *
   * @param {Required<PlaneGeometryOptions>} options - Normalized options.
   * @returns {PlaneGeometryData}                    - Geometry buffers.
   * @private
   */
  static #createGeometryData(options) {
    const widthSegments = options.widthSegments;
    const heightSegments = options.heightSegments;
    const widthVertexCount = widthSegments + VERTICES_PER_SEGMENT_INCREMENT2;
    const heightVertexCount = heightSegments + VERTICES_PER_SEGMENT_INCREMENT2;
    const vertexCount = widthVertexCount * heightVertexCount;
    const positions = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT2);
    const normals = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT2);
    const uvs = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT);
    let vertexIndex = 0;
    for (let rowIndex = 0; rowIndex < heightVertexCount; rowIndex += 1) {
      const vNormalized = rowIndex / heightSegments;
      const positionY = (vNormalized - CENTER_T_OFFSET2) * options.height;
      for (let columnIndex = 0; columnIndex < widthVertexCount; columnIndex += 1) {
        const uNormalized = columnIndex / widthSegments;
        const positionX = (uNormalized - CENTER_T_OFFSET2) * options.width;
        const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT2;
        positions[positionBaseOffset + 0] = positionX;
        positions[positionBaseOffset + 1] = positionY;
        positions[positionBaseOffset + 2] = PLANE_Z_POSITION;
        normals[positionBaseOffset + 0] = PLANE_NORMAL_X;
        normals[positionBaseOffset + 1] = PLANE_NORMAL_Y;
        normals[positionBaseOffset + 2] = PLANE_NORMAL_Z;
        const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT;
        uvs[uvBaseOffset + 0] = uNormalized;
        uvs[uvBaseOffset + 1] = UV_V_FLIP_BASE2 - vNormalized;
        vertexIndex += 1;
      }
    }
    const solidTriangleIndices = [];
    for (let rowIndex = 0; rowIndex < heightSegments; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < widthSegments; columnIndex += 1) {
        const topLeftVertexIndex = rowIndex * widthVertexCount + columnIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET2;
        const bottomLeftVertexIndex = topLeftVertexIndex + widthVertexCount;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET2;
        solidTriangleIndices.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
        solidTriangleIndices.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
      }
    }
    const indicesSolid = createIndexArray(vertexCount, solidTriangleIndices);
    const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
    const colors = createColorsFromSpec(vertexCount, options.colors);
    return {
      positions,
      normals,
      uvs,
      colors,
      indicesSolid,
      indicesWireframe
    };
  }
};

// core/geometry/sphere-geometry.js
var DEFAULT_SPHERE_WIDTH = 1;
var DEFAULT_SPHERE_HEIGHT = 1;
var DEFAULT_SPHERE_DEPTH = 1;
var DEFAULT_WIDTH_SEGMENTS = 24;
var DEFAULT_HEIGHT_SEGMENTS = 16;
var MIN_WIDTH_SEGMENT_COUNT = 3;
var MIN_HEIGHT_SEGMENT_COUNT = 2;
var HALF_SIZE_DIVISOR2 = 2;
var VERTICES_PER_SEGMENT_INCREMENT3 = 1;
var NEXT_VERTEX_OFFSET3 = 1;
var UV_V_FLIP_BASE3 = 1;
var ZERO_VALUE2 = 0;
var ONE_VALUE = 1;
var VEC3_COMPONENT_COUNT3 = 3;
var VEC2_COMPONENT_COUNT2 = 2;
var TWO_PI = Math.PI * 2;
var SphereGeometry = class _SphereGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext  - WebGL2 rendering context.
   * @param {SphereGeometryOptions} [options = {}] - Geometry options.
   */
  constructor(webglContext, options = {}) {
    const normalized = _SphereGeometry.#normalizeOptions(options);
    const data = _SphereGeometry.#createGeometryData(normalized);
    super(
      webglContext,
      data.positions,
      data.colors,
      data.indicesSolid,
      data.indicesWireframe,
      data.uvs,
      data.normals
    );
  }
  /**
   * Normalizes constructor input to a `SphereGeometryOptions` object.
   *
   * @param {SphereGeometryOptions} options     - Options object.
   * @returns {Required<SphereGeometryOptions>} - Normalized options.
   * @private
   */
  static #normalizeOptions(options) {
    if (options === null || typeof options !== "object") {
      throw new TypeError("`SphereGeometry` expects options as an object.");
    }
    const {
      width = DEFAULT_SPHERE_WIDTH,
      height = DEFAULT_SPHERE_HEIGHT,
      depth = DEFAULT_SPHERE_DEPTH,
      widthSegments = DEFAULT_WIDTH_SEGMENTS,
      heightSegments = DEFAULT_HEIGHT_SEGMENTS,
      colors = DEFAULT_VERTEX_COLOR
    } = options;
    if (typeof width !== "number" || typeof height !== "number" || typeof depth !== "number") {
      throw new TypeError("`SphereGeometry` expects `width/height/depth` as numbers.");
    }
    if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
      throw new RangeError("`SphereGeometry` expects finite `width/height/depth`.");
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`SphereGeometry` expects colors as a `Float32Array`.");
    }
    return {
      width,
      height,
      depth,
      widthSegments: _SphereGeometry.#normalizeSegmentCount(widthSegments, "widthSegments", MIN_WIDTH_SEGMENT_COUNT),
      heightSegments: _SphereGeometry.#normalizeSegmentCount(heightSegments, "heightSegments", MIN_HEIGHT_SEGMENT_COUNT),
      colors
    };
  }
  /**
   * Normalizes and validates a segment count parameter.
   *
   * @param {number} value      - Segment count value.
   * @param {string} optionName - Name of the option for error messages.
   * @param {number} minValue   - Minimal allowed value.
   * @returns {number}          - Normalized integer segment count.
   * @private
   */
  static #normalizeSegmentCount(value, optionName, minValue) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`SphereGeometry` expects `{name}` as a finite number.".replace("{name}", optionName));
    }
    const intValue = Math.floor(value);
    if (intValue < minValue) {
      throw new RangeError(
        "`SphereGeometry` expects `{name}` to be `>= {min}`.".replace("{name}", optionName).replace("{min}", String(minValue))
      );
    }
    return intValue;
  }
  /**
   * Creates full geometry data for a segmented UV sphere.
   *
   * @param {Required<SphereGeometryOptions>} options - Normalized options.
   * @returns {SphereGeometryData}                    - Geometry buffers.
   * @private
   */
  static #createGeometryData(options) {
    const radiusX = options.width / HALF_SIZE_DIVISOR2;
    const radiusY = options.height / HALF_SIZE_DIVISOR2;
    const radiusZ = options.depth / HALF_SIZE_DIVISOR2;
    const widthSegments = options.widthSegments;
    const heightSegments = options.heightSegments;
    const widthVertexCount = widthSegments + VERTICES_PER_SEGMENT_INCREMENT3;
    const heightVertexCount = heightSegments + VERTICES_PER_SEGMENT_INCREMENT3;
    const vertexCount = widthVertexCount * heightVertexCount;
    const positions = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT3);
    const normals = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT3);
    const uvs = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT2);
    let vertexIndex = 0;
    for (let latitudeIndex = 0; latitudeIndex < heightVertexCount; latitudeIndex += 1) {
      const vNormalized = latitudeIndex / heightSegments;
      const phiRadians = vNormalized * Math.PI;
      const sinPhi = Math.sin(phiRadians);
      const cosPhi = Math.cos(phiRadians);
      for (let longitudeIndex = 0; longitudeIndex < widthVertexCount; longitudeIndex += 1) {
        const uNormalized = longitudeIndex / widthSegments;
        const thetaRadians = uNormalized * TWO_PI;
        const sinTheta = Math.sin(thetaRadians);
        const cosTheta = Math.cos(thetaRadians);
        const positionX = cosTheta * sinPhi * radiusX;
        const positionY = cosPhi * radiusY;
        const positionZ = sinTheta * sinPhi * radiusZ;
        const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT3;
        positions[positionBaseOffset + 0] = positionX;
        positions[positionBaseOffset + 1] = positionY;
        positions[positionBaseOffset + 2] = positionZ;
        const normalX0 = radiusX !== ZERO_VALUE2 ? positionX / (radiusX * radiusX) : ZERO_VALUE2;
        const normalY0 = radiusY !== ZERO_VALUE2 ? positionY / (radiusY * radiusY) : ZERO_VALUE2;
        const normalZ0 = radiusZ !== ZERO_VALUE2 ? positionZ / (radiusZ * radiusZ) : ZERO_VALUE2;
        const inverseNormalLength = _SphereGeometry.#inverseLength(normalX0, normalY0, normalZ0);
        normals[positionBaseOffset + 0] = normalX0 * inverseNormalLength;
        normals[positionBaseOffset + 1] = normalY0 * inverseNormalLength;
        normals[positionBaseOffset + 2] = normalZ0 * inverseNormalLength;
        const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT2;
        uvs[uvBaseOffset + 0] = uNormalized;
        uvs[uvBaseOffset + 1] = UV_V_FLIP_BASE3 - vNormalized;
        vertexIndex += 1;
      }
    }
    const solidTriangleIndices = [];
    for (let latitudeIndex = 0; latitudeIndex < heightSegments; latitudeIndex += 1) {
      for (let longitudeIndex = 0; longitudeIndex < widthSegments; longitudeIndex += 1) {
        const topLeftVertexIndex = latitudeIndex * widthVertexCount + longitudeIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET3;
        const bottomLeftVertexIndex = topLeftVertexIndex + widthVertexCount;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET3;
        solidTriangleIndices.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
        solidTriangleIndices.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
      }
    }
    const indicesSolid = createIndexArray(vertexCount, solidTriangleIndices);
    const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
    const colors = createColorsFromSpec(vertexCount, options.colors);
    return {
      positions,
      normals,
      uvs,
      colors,
      indicesSolid,
      indicesWireframe
    };
  }
  /**
   * Computes inverse vector length `(1 / sqrt(x ^ 2 + y ^ 2 + z ^ 2))`.
   * Returns 0 when the input vector is zero-length.
   *
   * @param {number} x - X component.
   * @param {number} y - Y component.
   * @param {number} z - Z component.
   * @returns {number} - Inverse length.
   * @private
   */
  static #inverseLength(x, y, z) {
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length === ZERO_VALUE2) {
      return ZERO_VALUE2;
    }
    return ONE_VALUE / length;
  }
};

// core/geometry/torus-geometry.js
var DEFAULT_MAJOR_DIAMETER = 1.5;
var DEFAULT_TUBE_DIAMETER = 0.5;
var DEFAULT_RADIAL_SEGMENTS = 16;
var DEFAULT_TUBULAR_SEGMENTS = 32;
var MIN_SEGMENT_COUNT3 = 3;
var HALF_SIZE_DIVISOR3 = 2;
var VERTICES_PER_SEGMENT_INCREMENT4 = 1;
var UV_V_FLIP_BASE4 = 1;
var VEC3_COMPONENT_COUNT4 = 3;
var VEC2_COMPONENT_COUNT3 = 2;
var TWO_PI2 = Math.PI * 2;
var NEXT_VERTEX_OFFSET4 = 1;
var TorusGeometry = class _TorusGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {TorusGeometryOptions} [options = {}] - Geometry options.
   */
  constructor(webglContext, options = {}) {
    const normalized = _TorusGeometry.#normalizeOptions(options);
    const data = _TorusGeometry.#createGeometryData(normalized);
    super(
      webglContext,
      data.positions,
      data.colors,
      data.indicesSolid,
      data.indicesWireframe,
      data.uvs,
      data.normals
    );
  }
  /**
   * Normalizes constructor input to a `TorusGeometryOptions` object.
   *
   * @param {TorusGeometryOptions} options     - Options object.
   * @returns {Required<TorusGeometryOptions>} - Normalized options.
   * @private
   */
  static #normalizeOptions(options) {
    if (options === null || typeof options !== "object") {
      throw new TypeError("`TorusGeometry` expects options as an object.");
    }
    const {
      width = DEFAULT_MAJOR_DIAMETER,
      height = DEFAULT_TUBE_DIAMETER,
      tubularSegments = DEFAULT_TUBULAR_SEGMENTS,
      radialSegments = DEFAULT_RADIAL_SEGMENTS,
      colors = DEFAULT_VERTEX_COLOR
    } = options;
    if (typeof width !== "number" || typeof height !== "number") {
      throw new TypeError("`TorusGeometry` expects `width/height` as numbers.");
    }
    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new RangeError("`TorusGeometry` expects finite `width/height`.");
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`TorusGeometry` expects colors as a `Float32Array`.");
    }
    return {
      width,
      height,
      tubularSegments: _TorusGeometry.#normalizeSegmentCount(tubularSegments, "tubularSegments"),
      radialSegments: _TorusGeometry.#normalizeSegmentCount(radialSegments, "radialSegments"),
      colors
    };
  }
  /**
   * Normalizes and validates a segment count parameter.
   *
   * @param {number} value      - Segment count value.
   * @param {string} optionName - Name of the option for error messages.
   * @returns {number}          - Normalized integer `>= 3`.
   * @private
   */
  static #normalizeSegmentCount(value, optionName) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`TorusGeometry` expects `{name}` as a finite number.".replace("{name}", optionName));
    }
    const intValue = Math.floor(value);
    if (intValue < MIN_SEGMENT_COUNT3) {
      throw new RangeError(
        "`TorusGeometry` expects `{name}` to be `>= {min}`.".replace("{name}", optionName).replace("{min}", String(MIN_SEGMENT_COUNT3))
      );
    }
    return intValue;
  }
  /**
   * Creates full geometry data for a torus.
   *
   * @param {Required<TorusGeometryOptions>} options - Normalized options.
   * @returns {TorusGeometryData}                    - Geometry buffers.
   * @private
   */
  static #createGeometryData(options) {
    const majorRadius = options.width / HALF_SIZE_DIVISOR3;
    const tubeRadius = options.height / HALF_SIZE_DIVISOR3;
    const tubularSegments = options.tubularSegments;
    const radialSegments = options.radialSegments;
    const tubularVertexCount = tubularSegments + VERTICES_PER_SEGMENT_INCREMENT4;
    const radialVertexCount = radialSegments + VERTICES_PER_SEGMENT_INCREMENT4;
    const vertexCount = tubularVertexCount * radialVertexCount;
    const positions = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT4);
    const normals = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT4);
    const uvs = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT3);
    let vertexIndex = 0;
    for (let radialIndex = 0; radialIndex < radialVertexCount; radialIndex += 1) {
      const vNormalized = radialIndex / radialSegments;
      const phi = vNormalized * TWO_PI2;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      for (let tubularIndex = 0; tubularIndex < tubularVertexCount; tubularIndex += 1) {
        const uNormalized = tubularIndex / tubularSegments;
        const theta = uNormalized * TWO_PI2;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const ringRadius = majorRadius + tubeRadius * cosPhi;
        const positionX = ringRadius * cosTheta;
        const positionY = tubeRadius * sinPhi;
        const positionZ = ringRadius * sinTheta;
        const positionBase = vertexIndex * VEC3_COMPONENT_COUNT4;
        positions[positionBase + 0] = positionX;
        positions[positionBase + 1] = positionY;
        positions[positionBase + 2] = positionZ;
        normals[positionBase + 0] = cosTheta * cosPhi;
        normals[positionBase + 1] = sinPhi;
        normals[positionBase + 2] = sinTheta * cosPhi;
        const uvBase = vertexIndex * VEC2_COMPONENT_COUNT3;
        uvs[uvBase + 0] = uNormalized;
        uvs[uvBase + 1] = UV_V_FLIP_BASE4 - vNormalized;
        vertexIndex += 1;
      }
    }
    const indicesSolidList = [];
    for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
      for (let tubularIndex = 0; tubularIndex < tubularSegments; tubularIndex += 1) {
        const topLeftVertexIndex = radialIndex * tubularVertexCount + tubularIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET4;
        const bottomLeftVertexIndex = topLeftVertexIndex + tubularVertexCount;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET4;
        indicesSolidList.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
        indicesSolidList.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
      }
    }
    const indicesSolid = createIndexArray(vertexCount, indicesSolidList);
    const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
    const colors = createColorsFromSpec(vertexCount, options.colors);
    return {
      positions,
      normals,
      uvs,
      colors,
      indicesSolid,
      indicesWireframe
    };
  }
};

// core/geometry/cone-geometry.js
var DEFAULT_CONE_WIDTH = 1;
var DEFAULT_CONE_HEIGHT = 1.5;
var DEFAULT_RADIAL_SEGMENTS2 = 24;
var DEFAULT_HEIGHT_SEGMENTS2 = 1;
var MIN_RADIAL_SEGMENT_COUNT = 3;
var MIN_HEIGHT_SEGMENT_COUNT2 = 1;
var HALF_SIZE_DIVISOR4 = 2;
var VERTICES_PER_SEGMENT_INCREMENT5 = 1;
var NEXT_INDEX_OFFSET = 1;
var UV_V_FLIP_BASE5 = 1;
var UV_CENTER = 0.5;
var TWO_PI3 = Math.PI * 2;
var NORMAL_X_ZERO = 0;
var NORMAL_Z_ZERO = 0;
var NORMAL_Y_UP = 1;
var NORMAL_Y_DOWN = -1;
var ORIGIN = 0;
var DOUBLE_SIZE_MULTIPLIER = 2;
var ZERO_VALUE3 = 0;
var VEC3_COMPONENT_COUNT5 = 3;
var VEC2_COMPONENT_COUNT4 = 2;
var ZERO_VERTEX_COUNT = 0;
var ConeGeometry = class _ConeGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {ConeGeometryOptions} [options = {}]  - Geometry options.
   */
  constructor(webglContext, options = {}) {
    const normalized = _ConeGeometry.#normalizeOptions(options);
    const data = _ConeGeometry.#createGeometryData(normalized);
    super(
      webglContext,
      data.positions,
      data.colors,
      data.indicesSolid,
      data.indicesWireframe,
      data.uvs,
      data.normals
    );
  }
  /**
   * Normalizes constructor input to a `ConeGeometryOptions` object.
   *
   * @param {ConeGeometryOptions} options     - Options object.
   * @returns {Required<ConeGeometryOptions>} - Normalized options.
   * @private
   */
  static #normalizeOptions(options) {
    if (options === null || typeof options !== "object") {
      throw new TypeError("`ConeGeometry` expects options as an object.");
    }
    const {
      width = DEFAULT_CONE_WIDTH,
      height = DEFAULT_CONE_HEIGHT,
      depth = width,
      radialSegments = DEFAULT_RADIAL_SEGMENTS2,
      heightSegments = DEFAULT_HEIGHT_SEGMENTS2,
      capped = true,
      colors = DEFAULT_VERTEX_COLOR
    } = options;
    if (typeof width !== "number" || typeof height !== "number" || typeof depth !== "number") {
      throw new TypeError("`ConeGeometry` expects `width/height/depth` as numbers.");
    }
    if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
      throw new RangeError("`ConeGeometry` expects finite `width/height/depth`.");
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`ConeGeometry` expects colors as a `Float32Array`.");
    }
    return {
      width,
      height,
      depth,
      radialSegments: _ConeGeometry.#normalizeSegmentCount(radialSegments, "radialSegments", MIN_RADIAL_SEGMENT_COUNT),
      heightSegments: _ConeGeometry.#normalizeSegmentCount(heightSegments, "heightSegments", MIN_HEIGHT_SEGMENT_COUNT2),
      capped: Boolean(capped),
      colors
    };
  }
  /**
   * Normalizes and validates a segment count parameter.
   *
   * @param {number} value      - Segment count.
   * @param {string} optionName - Option name.
   * @param {number} minValue   - Minimal allowed value.
   * @returns {number}          - Normalized integer segment count.
   * @private
   */
  static #normalizeSegmentCount(value, optionName, minValue) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`ConeGeometry` expects `{name}` as a finite number.".replace("{name}", optionName));
    }
    const intValue = Math.floor(value);
    if (intValue < minValue) {
      throw new RangeError(
        "`ConeGeometry` expects `{name}` to be `>= {min}`.".replace("{name}", optionName).replace("{min}", String(minValue))
      );
    }
    return intValue;
  }
  /**
   * Creates full geometry data for a segmented cone.
   *
   * @param {Required<ConeGeometryOptions>} options - Normalized options.
   * @returns {ConeGeometryData}                    - Geometry buffers.
   * @private
   */
  static #createGeometryData(options) {
    const radiusX = options.width / HALF_SIZE_DIVISOR4;
    const radiusZ = options.depth / HALF_SIZE_DIVISOR4;
    const height = options.height;
    const radialSegments = options.radialSegments;
    const heightSegments = options.heightSegments;
    const ringVertexCount = radialSegments + VERTICES_PER_SEGMENT_INCREMENT5;
    const sideRingCount = heightSegments;
    const sideVertexCount = sideRingCount * ringVertexCount;
    const hasCap = options.capped;
    const capVertexCount = hasCap ? ringVertexCount + VERTICES_PER_SEGMENT_INCREMENT5 : ZERO_VERTEX_COUNT;
    const vertexCount = sideVertexCount + VERTICES_PER_SEGMENT_INCREMENT5 + capVertexCount;
    const positions = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT5);
    const normals = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT5);
    const uvs = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT4);
    let vertexIndex = 0;
    for (let heightRingIndex = 0; heightRingIndex < sideRingCount; heightRingIndex += 1) {
      const heightNormalized = heightRingIndex / heightSegments;
      const radiusFactor = UV_V_FLIP_BASE5 - heightNormalized;
      const positionY = -height / HALF_SIZE_DIVISOR4 + heightNormalized * height;
      const currentRadiusX = radiusX * radiusFactor;
      const currentRadiusZ = radiusZ * radiusFactor;
      for (let radialVertexIndex = 0; radialVertexIndex < ringVertexCount; radialVertexIndex += 1) {
        const uNormalized = radialVertexIndex / radialSegments;
        const angleRadians = uNormalized * TWO_PI3;
        const cosTheta = Math.cos(angleRadians);
        const sinTheta = Math.sin(angleRadians);
        const positionX = cosTheta * currentRadiusX;
        const positionZ = sinTheta * currentRadiusZ;
        const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT5;
        positions[positionBaseOffset + 0] = positionX;
        positions[positionBaseOffset + 1] = positionY;
        positions[positionBaseOffset + 2] = positionZ;
        const normalX0 = radiusZ * height * cosTheta;
        const normalY0 = radiusX * radiusZ;
        const normalZ0 = radiusX * height * sinTheta;
        const inverseNormalLength = _ConeGeometry.#inverseLength(normalX0, normalY0, normalZ0);
        normals[positionBaseOffset + 0] = normalX0 * inverseNormalLength;
        normals[positionBaseOffset + 1] = normalY0 * inverseNormalLength;
        normals[positionBaseOffset + 2] = normalZ0 * inverseNormalLength;
        const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT4;
        uvs[uvBaseOffset + 0] = uNormalized;
        uvs[uvBaseOffset + 1] = UV_V_FLIP_BASE5 - heightNormalized;
        vertexIndex += 1;
      }
    }
    const apexIndex = vertexIndex;
    {
      const apexBaseOffset = apexIndex * VEC3_COMPONENT_COUNT5;
      positions[apexBaseOffset + 0] = ORIGIN;
      positions[apexBaseOffset + 1] = height / HALF_SIZE_DIVISOR4;
      positions[apexBaseOffset + 2] = ORIGIN;
      normals[apexBaseOffset + 0] = NORMAL_X_ZERO;
      normals[apexBaseOffset + 1] = NORMAL_Y_UP;
      normals[apexBaseOffset + 2] = NORMAL_Z_ZERO;
      const apexUvOffset = apexIndex * VEC2_COMPONENT_COUNT4;
      uvs[apexUvOffset + 0] = UV_CENTER;
      uvs[apexUvOffset + 1] = ORIGIN;
    }
    vertexIndex += 1;
    const capCenterIndex = vertexIndex;
    if (hasCap) {
      {
        const capCenterBaseOffset = capCenterIndex * VEC3_COMPONENT_COUNT5;
        positions[capCenterBaseOffset + 0] = ORIGIN;
        positions[capCenterBaseOffset + 1] = -height / HALF_SIZE_DIVISOR4;
        positions[capCenterBaseOffset + 2] = ORIGIN;
        normals[capCenterBaseOffset + 0] = NORMAL_X_ZERO;
        normals[capCenterBaseOffset + 1] = NORMAL_Y_DOWN;
        normals[capCenterBaseOffset + 2] = NORMAL_Z_ZERO;
        const capCenterUvOffset = capCenterIndex * VEC2_COMPONENT_COUNT4;
        uvs[capCenterUvOffset + 0] = UV_CENTER;
        uvs[capCenterUvOffset + 1] = UV_CENTER;
      }
      vertexIndex += 1;
      for (let radialVertexIndex = 0; radialVertexIndex < ringVertexCount; radialVertexIndex += 1) {
        const uNormalized = radialVertexIndex / radialSegments;
        const angleRadians = uNormalized * TWO_PI3;
        const cosTheta = Math.cos(angleRadians);
        const sinTheta = Math.sin(angleRadians);
        const positionX = cosTheta * radiusX;
        const positionZ = sinTheta * radiusZ;
        const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT5;
        positions[positionBaseOffset + 0] = positionX;
        positions[positionBaseOffset + 1] = -height / HALF_SIZE_DIVISOR4;
        positions[positionBaseOffset + 2] = positionZ;
        normals[positionBaseOffset + 0] = NORMAL_X_ZERO;
        normals[positionBaseOffset + 1] = NORMAL_Y_DOWN;
        normals[positionBaseOffset + 2] = NORMAL_Z_ZERO;
        const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT4;
        uvs[uvBaseOffset + 0] = radiusX === ZERO_VALUE3 ? UV_CENTER : positionX / (radiusX * DOUBLE_SIZE_MULTIPLIER) + UV_CENTER;
        uvs[uvBaseOffset + 1] = radiusZ === ZERO_VALUE3 ? UV_CENTER : positionZ / (radiusZ * DOUBLE_SIZE_MULTIPLIER) + UV_CENTER;
        vertexIndex += 1;
      }
    }
    const solidTriangleIndices = [];
    for (let heightRingIndex = 0; heightRingIndex < sideRingCount - VERTICES_PER_SEGMENT_INCREMENT5; heightRingIndex += 1) {
      const currentRingStartIndex = heightRingIndex * ringVertexCount;
      const nextRingStartIndex = (heightRingIndex + VERTICES_PER_SEGMENT_INCREMENT5) * ringVertexCount;
      for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
        const topLeftVertexIndex = currentRingStartIndex + radialIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_INDEX_OFFSET;
        const bottomLeftVertexIndex = nextRingStartIndex + radialIndex;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_INDEX_OFFSET;
        solidTriangleIndices.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
        solidTriangleIndices.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
      }
    }
    const topRingStartIndex = (sideRingCount - VERTICES_PER_SEGMENT_INCREMENT5) * ringVertexCount;
    for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
      const topLeftVertexIndex = topRingStartIndex + radialIndex;
      const topRightVertexIndex = topLeftVertexIndex + NEXT_INDEX_OFFSET;
      solidTriangleIndices.push(topLeftVertexIndex, apexIndex, topRightVertexIndex);
    }
    if (hasCap) {
      const capRingStartIndex = capCenterIndex + VERTICES_PER_SEGMENT_INCREMENT5;
      for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
        const capLeftVertexIndex = capRingStartIndex + radialIndex;
        const capRightVertexIndex = capRingStartIndex + radialIndex + VERTICES_PER_SEGMENT_INCREMENT5;
        solidTriangleIndices.push(capCenterIndex, capRightVertexIndex, capLeftVertexIndex);
      }
    }
    const indicesSolid = createIndexArray(vertexCount, solidTriangleIndices);
    const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
    const colors = createColorsFromSpec(vertexCount, options.colors);
    return {
      positions,
      normals,
      uvs,
      colors,
      indicesSolid,
      indicesWireframe
    };
  }
  /**
   * Computes inverse vector length `(1 / sqrt(x ^ 2 + y ^ 2 + z ^ 2))`.
   * Returns `0`, when the input vector is zero-length.
   *
   * @param {number} x - X component.
   * @param {number} y - Y component.
   * @param {number} z - Z component.
   * @returns {number} - Inverse length.
   * @private
   */
  static #inverseLength(x, y, z) {
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length === ZERO_VALUE3) {
      return ZERO_VALUE3;
    }
    return UV_V_FLIP_BASE5 / length;
  }
};

// core/geometry/pyramid-geometry.js
var DEFAULT_PYRAMID_WIDTH = 1;
var DEFAULT_PYRAMID_HEIGHT = 1.5;
var DEFAULT_BASE_SEGMENT_COUNT = 1;
var DEFAULT_HEIGHT_SEGMENT_COUNT = 1;
var MIN_SEGMENT_COUNT4 = 1;
var HALF_SIZE_DIVISOR5 = 2;
var CENTER_T_OFFSET3 = 0.5;
var UV_V_FLIP_BASE6 = 1;
var VERTICES_PER_SEGMENT_INCREMENT6 = 1;
var NEXT_VERTEX_OFFSET5 = 1;
var ZERO_VALUE4 = 0;
var ONE_VALUE2 = 1;
var NEGATIVE_ONE_VALUE = -1;
var APEX_UV_U = 0.5;
var APEX_UV_V = 0;
var OUTWARD_HINT_FRONT = [0, 0, 1];
var OUTWARD_HINT_RIGHT = [1, 0, 0];
var OUTWARD_HINT_BACK = [0, 0, -1];
var OUTWARD_HINT_LEFT = [-1, 0, 0];
var PyramidGeometry = class _PyramidGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext   - WebGL2 rendering context.
   * @param {PyramidGeometryOptions} [options = {}] - Geometry options.
   */
  constructor(webglContext, options = {}) {
    const normalized = _PyramidGeometry.#normalizeOptions(options);
    const data = _PyramidGeometry.#createGeometryData(normalized);
    super(
      webglContext,
      data.positions,
      data.colors,
      data.indicesSolid,
      data.indicesWireframe,
      data.uvs,
      data.normals
    );
  }
  /**
   * Normalizes constructor input to a `PyramidGeometryOptions` object.
   *
   * @param {PyramidGeometryOptions} options     - Options object.
   * @returns {Required<PyramidGeometryOptions>} - Normalized options.
   * @private
   */
  static #normalizeOptions(options) {
    if (options === null || typeof options !== "object") {
      throw new TypeError("`PyramidGeometry` expects options as an object.");
    }
    const {
      width = DEFAULT_PYRAMID_WIDTH,
      height = DEFAULT_PYRAMID_HEIGHT,
      depth = width,
      widthSegments = DEFAULT_BASE_SEGMENT_COUNT,
      depthSegments = widthSegments,
      heightSegments = DEFAULT_HEIGHT_SEGMENT_COUNT,
      capped = true,
      colors = DEFAULT_VERTEX_COLOR
    } = options;
    if (typeof width !== "number" || typeof height !== "number" || typeof depth !== "number") {
      throw new TypeError("`PyramidGeometry` expects `width/height/depth` as numbers.");
    }
    if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
      throw new RangeError("`PyramidGeometry` expects finite `width/height/depth`.");
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`PyramidGeometry` expects colors as a `Float32Array`.");
    }
    return {
      width,
      height,
      depth,
      widthSegments: _PyramidGeometry.#normalizeSegmentCount(widthSegments, "widthSegments", MIN_SEGMENT_COUNT4),
      depthSegments: _PyramidGeometry.#normalizeSegmentCount(depthSegments, "depthSegments", MIN_SEGMENT_COUNT4),
      heightSegments: _PyramidGeometry.#normalizeSegmentCount(heightSegments, "heightSegments", MIN_SEGMENT_COUNT4),
      capped: Boolean(capped),
      colors
    };
  }
  /**
   * Normalizes and validates a segment count parameter.
   *
   * @param {number} value      - Segment count.
   * @param {string} optionName - Option name.
   * @param {number} minValue   - Minimal allowed value.
   * @returns {number}          - Integer segment count.
   * @private
   */
  static #normalizeSegmentCount(value, optionName, minValue) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`PyramidGeometry` expects `{name}` as a finite number.".replace("{name}", optionName));
    }
    const intValue = Math.floor(value);
    if (intValue < minValue) {
      throw new RangeError(
        "`PyramidGeometry` expects `{name}` to be `>= {min}`.".replace("{name}", optionName).replace("{min}", String(minValue))
      );
    }
    return intValue;
  }
  /**
   * Creates full geometry data for a segmented pyramid.
   *
   * @param {Required<PyramidGeometryOptions>} options - Normalized options.
   * @returns {PyramidGeometryData}                    - Geometry buffers.
   * @private
   */
  static #createGeometryData(options) {
    const halfWidth = options.width / HALF_SIZE_DIVISOR5;
    const halfDepth = options.depth / HALF_SIZE_DIVISOR5;
    const halfHeight = options.height / HALF_SIZE_DIVISOR5;
    const apexPoint = [ZERO_VALUE4, halfHeight, ZERO_VALUE4];
    const positions = [];
    const normals = [];
    const uvs = [];
    const indicesSolidList = [];
    let vertexOffset = 0;
    if (options.capped) {
      const baseAppendResult = _PyramidGeometry.#appendBase(
        positions,
        normals,
        uvs,
        indicesSolidList,
        vertexOffset,
        halfWidth,
        halfDepth,
        halfHeight,
        options.widthSegments,
        options.depthSegments
      );
      vertexOffset += baseAppendResult.vertexCount;
    }
    const baseY = -halfHeight;
    const corners = {
      frontLeft: [-halfWidth, baseY, halfDepth],
      frontRight: [halfWidth, baseY, halfDepth],
      backRight: [halfWidth, baseY, -halfDepth],
      backLeft: [-halfWidth, baseY, -halfDepth]
    };
    vertexOffset += _PyramidGeometry.#appendSideFace(
      positions,
      normals,
      uvs,
      indicesSolidList,
      vertexOffset,
      corners.frontLeft,
      corners.frontRight,
      apexPoint,
      options.widthSegments,
      options.heightSegments,
      OUTWARD_HINT_FRONT
    );
    vertexOffset += _PyramidGeometry.#appendSideFace(
      positions,
      normals,
      uvs,
      indicesSolidList,
      vertexOffset,
      corners.frontRight,
      corners.backRight,
      apexPoint,
      options.depthSegments,
      options.heightSegments,
      OUTWARD_HINT_RIGHT
    );
    vertexOffset += _PyramidGeometry.#appendSideFace(
      positions,
      normals,
      uvs,
      indicesSolidList,
      vertexOffset,
      corners.backRight,
      corners.backLeft,
      apexPoint,
      options.widthSegments,
      options.heightSegments,
      OUTWARD_HINT_BACK
    );
    vertexOffset += _PyramidGeometry.#appendSideFace(
      positions,
      normals,
      uvs,
      indicesSolidList,
      vertexOffset,
      corners.backLeft,
      corners.frontLeft,
      apexPoint,
      options.depthSegments,
      options.heightSegments,
      OUTWARD_HINT_LEFT
    );
    const vertexCount = vertexOffset;
    const indicesSolid = createIndexArray(vertexCount, indicesSolidList);
    const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
    const colors = createColorsFromSpec(vertexCount, options.colors);
    return {
      positions: new Float32Array(positions),
      normals: new Float32Array(normals),
      uvs: new Float32Array(uvs),
      colors,
      indicesSolid,
      indicesWireframe
    };
  }
  /**
   * Appends a bottom base grid `XZ plane` with a `-Y` normal.
   *
   * @param {number[]} positions        - Output positions (flat vec3).
   * @param {number[]} normals          - Output normals (flat vec3).
   * @param {number[]} uvs              - Output UVs (flat vec2).
   * @param {number[]} indicesSolid     - Output solid indices.
   * @param {number} vertexOffset       - Starting vertex index.
   * @param {number} halfWidth          - Half base width.
   * @param {number} halfDepth          - Half base depth.
   * @param {number} halfHeight         - Half pyramid height.
   * @param {number} widthSegments      - Base subdivisions along X.
   * @param {number} depthSegments      - Base subdivisions along Z.
   * @returns {PyramidBaseAppendResult} - Base append result.
   * @private
   */
  static #appendBase(positions, normals, uvs, indicesSolid, vertexOffset, halfWidth, halfDepth, halfHeight, widthSegments, depthSegments) {
    const xSegments = widthSegments;
    const zSegments = depthSegments;
    const xVertexCount = xSegments + VERTICES_PER_SEGMENT_INCREMENT6;
    const zVertexCount = zSegments + VERTICES_PER_SEGMENT_INCREMENT6;
    const baseY = -halfHeight;
    const fullWidth = halfWidth * HALF_SIZE_DIVISOR5;
    const fullDepth = halfDepth * HALF_SIZE_DIVISOR5;
    for (let zIndex = 0; zIndex < zVertexCount; zIndex += 1) {
      const vNormalized = zIndex / zSegments;
      const positionZ = (vNormalized - CENTER_T_OFFSET3) * fullDepth;
      for (let xIndex = 0; xIndex < xVertexCount; xIndex += 1) {
        const uNormalized = xIndex / xSegments;
        const positionX = (uNormalized - CENTER_T_OFFSET3) * fullWidth;
        positions.push(positionX, baseY, positionZ);
        normals.push(ZERO_VALUE4, NEGATIVE_ONE_VALUE, ZERO_VALUE4);
        uvs.push(uNormalized, UV_V_FLIP_BASE6 - vNormalized);
      }
    }
    for (let zIndex = 0; zIndex < zSegments; zIndex += 1) {
      for (let xIndex = 0; xIndex < xSegments; xIndex += 1) {
        const topLeftVertexIndex = vertexOffset + zIndex * xVertexCount + xIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET5;
        const bottomLeftVertexIndex = topLeftVertexIndex + xVertexCount;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET5;
        indicesSolid.push(topLeftVertexIndex, topRightVertexIndex, bottomLeftVertexIndex);
        indicesSolid.push(topRightVertexIndex, bottomRightVertexIndex, bottomLeftVertexIndex);
      }
    }
    return { vertexCount: xVertexCount * zVertexCount };
  }
  /**
   * Appends a single planar side face subdivided into a grid.
   * The face uses a flat normal (sharp edges).
   *
   * @param {number[]} positions    - Output positions.
   * @param {number[]} normals      - Output normals.
   * @param {number[]} uvs          - Output UVs.
   * @param {number[]} indicesSolid - Output solid indices.
   * @param {number} vertexOffset   - Starting vertex index.
   * @param {number[]} baseStart    - Base edge start point [x, y, z].
   * @param {number[]} baseEnd      - Base edge end point [x, y, z].
   * @param {number[]} apex         - Apex point [x, y, z].
   * @param {number} edgeSegments   - Subdivisions along the base edge.
   * @param {number} heightSegments - Subdivisions along the face height.
   * @param {number[]} outwardHint  - Expected outward direction hint.
   * @returns {number}              - Number of vertices appended.
   * @private
   */
  static #appendSideFace(positions, normals, uvs, indicesSolid, vertexOffset, baseStart, baseEnd, apex, edgeSegments, heightSegments, outwardHint) {
    let edgeStart = baseStart;
    let edgeEnd = baseEnd;
    let faceNormal = _PyramidGeometry.#computeFaceNormal(edgeStart, edgeEnd, apex);
    if (_PyramidGeometry.#dot(faceNormal, outwardHint) < ZERO_VALUE4) {
      edgeStart = baseEnd;
      edgeEnd = baseStart;
      faceNormal = _PyramidGeometry.#computeFaceNormal(edgeStart, edgeEnd, apex);
    }
    const edgeVertexCount = edgeSegments + VERTICES_PER_SEGMENT_INCREMENT6;
    const ringCount = heightSegments;
    const faceVertexCount = ringCount * edgeVertexCount + VERTICES_PER_SEGMENT_INCREMENT6;
    for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      const heightNormalized = ringIndex / heightSegments;
      const rowStart = _PyramidGeometry.#lerp3(edgeStart, apex, heightNormalized);
      const rowEnd = _PyramidGeometry.#lerp3(edgeEnd, apex, heightNormalized);
      for (let edgeIndex = 0; edgeIndex < edgeVertexCount; edgeIndex += 1) {
        const edgeNormalized = edgeIndex / edgeSegments;
        const point = _PyramidGeometry.#lerp3(rowStart, rowEnd, edgeNormalized);
        positions.push(point[0], point[1], point[2]);
        normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
        uvs.push(edgeNormalized, UV_V_FLIP_BASE6 - heightNormalized);
      }
    }
    positions.push(apex[0], apex[1], apex[2]);
    normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
    uvs.push(APEX_UV_U, APEX_UV_V);
    const apexVertexIndex = vertexOffset + faceVertexCount - VERTICES_PER_SEGMENT_INCREMENT6;
    for (let ringIndex = 0; ringIndex < ringCount - VERTICES_PER_SEGMENT_INCREMENT6; ringIndex += 1) {
      const ringStartVertexIndex = vertexOffset + ringIndex * edgeVertexCount;
      const nextRingVertexIndex = vertexOffset + (ringIndex + VERTICES_PER_SEGMENT_INCREMENT6) * edgeVertexCount;
      for (let edgeIndex = 0; edgeIndex < edgeSegments; edgeIndex += 1) {
        const topLeftVertexIndex = ringStartVertexIndex + edgeIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET5;
        const bottomLeftVertexIndex = nextRingVertexIndex + edgeIndex;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET5;
        indicesSolid.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
        indicesSolid.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
      }
    }
    const topRingStartVertexIndex = vertexOffset + (ringCount - VERTICES_PER_SEGMENT_INCREMENT6) * edgeVertexCount;
    for (let edgeIndex = 0; edgeIndex < edgeSegments; edgeIndex += 1) {
      const topLeftVertexIndex = topRingStartVertexIndex + edgeIndex;
      const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET5;
      indicesSolid.push(topLeftVertexIndex, apexVertexIndex, topRightVertexIndex);
    }
    return faceVertexCount;
  }
  /**
   * Computes a normalized face normal from 3 points.
   *
   * @param {number[]} pointA - Point A [x, y, z].
   * @param {number[]} pointB - Point B [x, y, z].
   * @param {number[]} pointC - Point C [x, y, z].
   * @returns {number[]}      - Normalized normal vector [x, y, z].
   * @private
   */
  static #computeFaceNormal(pointA, pointB, pointC) {
    const vectorAB = [
      pointB[0] - pointA[0],
      pointB[1] - pointA[1],
      pointB[2] - pointA[2]
    ];
    const vectorAC = [
      pointC[0] - pointA[0],
      pointC[1] - pointA[1],
      pointC[2] - pointA[2]
    ];
    const normalX0 = vectorAB[1] * vectorAC[2] - vectorAB[2] * vectorAC[1];
    const normalY0 = vectorAB[2] * vectorAC[0] - vectorAB[0] * vectorAC[2];
    const normalZ0 = vectorAB[0] * vectorAC[1] - vectorAB[1] * vectorAC[0];
    const inverseNormalLength = _PyramidGeometry.#inverseLength(normalX0, normalY0, normalZ0);
    return [normalX0 * inverseNormalLength, normalY0 * inverseNormalLength, normalZ0 * inverseNormalLength];
  }
  /**
   * Linear interpolation between points A and B.
   *
   * @param {number[]} pointA            - Point A [x, y, z].
   * @param {number[]} pointB            - Point B [x, y, z].
   * @param {number} interpolationFactor - Interpolation factor.
   * @returns {number[]}                 - Interpolated point [x, y, z].
   * @private
   */
  static #lerp3(pointA, pointB, interpolationFactor) {
    return [
      pointA[0] + (pointB[0] - pointA[0]) * interpolationFactor,
      pointA[1] + (pointB[1] - pointA[1]) * interpolationFactor,
      pointA[2] + (pointB[2] - pointA[2]) * interpolationFactor
    ];
  }
  /**
   * Dot product of two `vec3` arrays.
   *
   * @param {number[]} vectorA - Vector A.
   * @param {number[]} vectorB - Vector B.
   * @returns {number}         - Dot product.
   * @private
   */
  static #dot(vectorA, vectorB) {
    return vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2];
  }
  /**
   * Computes inverse vector length `(1 / sqrt(x ^ 2 + y ^ 2 + z ^ 2))`.
   * Returns 0 when the input vector is zero-length.
   *
   * @param {number} x - X component.
   * @param {number} y - Y component.
   * @param {number} z - Z component.
   * @returns {number} - Inverse length.
   * @private
   */
  static #inverseLength(x, y, z) {
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length === ZERO_VALUE4) {
      return ZERO_VALUE4;
    }
    return ONE_VALUE2 / length;
  }
};

// core/geometry/heightmap-geometry.js
var DEFAULT_HEIGHTMAP_WIDTH = 1;
var DEFAULT_HEIGHTMAP_DEPTH = 1;
var DEFAULT_HEIGHT_SCALE = 1;
var DEFAULT_HEIGHT_OFFSET = 0;
var DEFAULT_SEGMENTS_X = 1;
var DEFAULT_SEGMENTS_Z = 1;
var MIN_SEGMENT_COUNT5 = 1;
var MIN_POSITIVE_VALUE = 0;
var DEFAULT_WIREFRAME_STATE = false;
var DEFAULT_FLIP_Y = true;
var SAMPLING_NEAREST = "nearest";
var SAMPLING_BILINEAR = "bilinear";
var DEFAULT_SAMPLING = SAMPLING_NEAREST;
var DEFAULT_TERRAIN_COLOR_RED = 0.18;
var DEFAULT_TERRAIN_COLOR_GREEN = 0.65;
var DEFAULT_TERRAIN_COLOR_BLUE = 0.28;
var DEFAULT_TERRAIN_COLOR = new Float32Array([
  DEFAULT_TERRAIN_COLOR_RED,
  DEFAULT_TERRAIN_COLOR_GREEN,
  DEFAULT_TERRAIN_COLOR_BLUE
]);
var VERTICES_PER_SEGMENT_INCREMENT7 = 1;
var NEXT_VERTEX_OFFSET6 = 1;
var CENTER_T_OFFSET4 = 0.5;
var VECTOR_COMPONENTS_3 = 3;
var UV_COMPONENTS_2 = 2;
var X_INDEX = 0;
var Y_INDEX = 1;
var Z_INDEX = 2;
var U_INDEX = 0;
var V_INDEX = 1;
var TRIANGLE_INDEX_STRIDE2 = 3;
var BYTES_PER_PIXEL = 4;
var RED_CHANNEL_OFFSET = 0;
var MAX_CHANNEL_VALUE = 255;
var CANVAS_TAG_NAME = "canvas";
var CANVAS_CONTEXT_2D = "2d";
var MIN_REQUIRED_STRING_LENGTH = 1;
var ZERO_VALUE5 = 0;
var ONE_VALUE3 = 1;
var ERROR_OPTIONS_PLAIN_OBJECT = "`HeightmapGeometry` expects options as a plain object.";
var ERROR_WEBGL_CONTEXT = "`HeightmapGeometry` expects `webglContext` as a `WebGL2RenderingContext`.";
var ERROR_HEIGHTMAP_IMAGE_DATA = "`HeightmapGeometry` expects `heightmapImageData` as an `ImageData` instance or a `HeightmapSource` with `imageData`.";
var HEIGHTMAP_SOURCE_IMAGE_DATA_FIELD = "imageData";
var ERROR_SIZE_VALUES = "`HeightmapGeometry` expects `width` and `depth` as positive numbers.";
var ERROR_HEIGHT_SCALE_VALUE = "`HeightmapGeometry` expects `heightScale` as a positive number.";
var ERROR_HEIGHT_OFFSET_VALUE = "`HeightmapGeometry` expects `heightOffset` as a finite number.";
var ERROR_COLORS_BUFFER = "`HeightmapGeometry` expects `colors` as a `Float32Array`.";
var ERROR_FLIP_Y_VALUE = "`HeightmapGeometry` expects `flipY` as a boolean.";
var ERROR_WIREFRAME_VALUE = "`HeightmapGeometry` expects `isWireframe` as a boolean.";
var ERROR_SAMPLING_VALUE = "`HeightmapGeometry` expects `sampling` to be a supported string value.";
var ERROR_SEGMENT_VALUE = "`HeightmapGeometry` expects `{name}` to be a finite number.";
var ERROR_SEGMENT_RANGE = "`HeightmapGeometry` expects `{name}` to be `>= {min}`.";
var ERROR_LOAD_URL = "`HeightmapGeometry.loadFromUrl` expects url as a non-empty string.";
var ERROR_LOAD_OPTIONS = "`HeightmapGeometry.loadFromUrl` expects options as a plain object.";
var ERROR_CANVAS_CONTEXT = "`HeightmapGeometry.loadFromUrl` failed to acquire a 2D canvas context.";
var ERROR_LOAD_IMAGE_PREFIX = "Failed to load the heightmap image: ";
var SEGMENTS_X_OPTION_NAME = "segmentsX";
var SEGMENTS_Z_OPTION_NAME = "segmentsZ";
var IMAGE_CROSS_ORIGIN_ANON = "anonymous";
var HeightmapGeometry = class _HeightmapGeometry extends Geometry {
  /**
   * Wireframe hint for consumers.
   *
   * @type {boolean}
   * @private
   */
  #isWireframe;
  /**
   * @param {WebGL2RenderingContext} webglContext          - WebGL2 rendering context.
   * @param {ImageData|HeightmapSource} heightmapImageData - Heightmap image data (grayscale) or a wrapped source.
   * @param {HeightmapGeometryOptions} [options={}]        - Geometry options.
   */
  constructor(webglContext, heightmapImageData, options = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_WEBGL_CONTEXT);
    }
    const imageData = _HeightmapGeometry.#normalizeHeightmapImageData(heightmapImageData);
    const normalized = _HeightmapGeometry.#normalizeOptions(options);
    const data = _HeightmapGeometry.#createGeometryData(imageData, normalized);
    super(
      webglContext,
      data.positions,
      data.colors,
      data.indicesSolid,
      data.indicesWireframe,
      data.uvs,
      data.normals
    );
    this.#isWireframe = normalized.isWireframe;
  }
  /**
   * Returns the wireframe hint value from construction options.
   *
   * @returns {boolean}
   */
  get isWireframe() {
    return this.#isWireframe;
  }
  /**
   * Loads heightmap image data from a URL and returns a new `HeightmapGeometry`.
   *
   * @param {WebGL2RenderingContext} webglContext   - WebGL2 rendering context.
   * @param {string} url                            - Image URL (relative or absolute).
   * @param {HeightmapGeometryOptions} [options={}] - Geometry options.
   * @returns {Promise<HeightmapGeometry>}          - Promise, that resolves with created geometry.
   */
  static async loadFromUrl(webglContext, url, options = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_WEBGL_CONTEXT);
    }
    if (typeof url !== "string" || url.length < MIN_REQUIRED_STRING_LENGTH) {
      throw new TypeError(ERROR_LOAD_URL);
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(ERROR_LOAD_OPTIONS);
    }
    const image = await _HeightmapGeometry.#loadImage(url);
    const imageData = _HeightmapGeometry.#createImageData(image);
    return new _HeightmapGeometry(webglContext, imageData, options);
  }
  /**
   * Normalizes constructor input to a `HeightmapGeometryOptions` object.
   *
   * @param {HeightmapGeometryOptions} options     - Options object.
   * @returns {Required<HeightmapGeometryOptions>} - Normalized options.
   * @private
   */
  static #normalizeOptions(options) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(ERROR_OPTIONS_PLAIN_OBJECT);
    }
    const {
      width = DEFAULT_HEIGHTMAP_WIDTH,
      depth = DEFAULT_HEIGHTMAP_DEPTH,
      heightScale = DEFAULT_HEIGHT_SCALE,
      heightOffset = DEFAULT_HEIGHT_OFFSET,
      segmentsX = DEFAULT_SEGMENTS_X,
      segmentsZ = DEFAULT_SEGMENTS_Z,
      isWireframe = DEFAULT_WIREFRAME_STATE,
      colors = DEFAULT_TERRAIN_COLOR,
      flipY = DEFAULT_FLIP_Y,
      sampling = DEFAULT_SAMPLING
    } = options;
    if (typeof width !== "number" || typeof depth !== "number" || !Number.isFinite(width) || !Number.isFinite(depth) || width <= MIN_POSITIVE_VALUE || depth <= MIN_POSITIVE_VALUE) {
      throw new RangeError(ERROR_SIZE_VALUES);
    }
    if (typeof heightScale !== "number" || !Number.isFinite(heightScale) || heightScale <= MIN_POSITIVE_VALUE) {
      throw new RangeError(ERROR_HEIGHT_SCALE_VALUE);
    }
    if (typeof heightOffset !== "number" || !Number.isFinite(heightOffset)) {
      throw new RangeError(ERROR_HEIGHT_OFFSET_VALUE);
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError(ERROR_COLORS_BUFFER);
    }
    if (typeof flipY !== "boolean") {
      throw new TypeError(ERROR_FLIP_Y_VALUE);
    }
    if (typeof isWireframe !== "boolean") {
      throw new TypeError(ERROR_WIREFRAME_VALUE);
    }
    const normalizedSampling = _HeightmapGeometry.#normalizeSampling(sampling);
    return {
      width,
      depth,
      heightScale,
      heightOffset,
      segmentsX: _HeightmapGeometry.#normalizeSegmentCount(segmentsX, SEGMENTS_X_OPTION_NAME),
      segmentsZ: _HeightmapGeometry.#normalizeSegmentCount(segmentsZ, SEGMENTS_Z_OPTION_NAME),
      isWireframe,
      colors,
      flipY,
      sampling: normalizedSampling
    };
  }
  /**
   * Normalizes and validates a segment count parameter.
   *
   * @param {number} value      - Segment count value.
   * @param {string} optionName - Name of the option for error messages.
   * @returns {number}          - Normalized integer `>= 1`.
   * @private
   */
  static #normalizeSegmentCount(value, optionName) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(ERROR_SEGMENT_VALUE.replace("{name}", optionName));
    }
    const intValue = Math.floor(value);
    if (intValue < MIN_SEGMENT_COUNT5) {
      throw new RangeError(
        ERROR_SEGMENT_RANGE.replace("{name}", optionName).replace("{min}", String(MIN_SEGMENT_COUNT5))
      );
    }
    return intValue;
  }
  /**
   * Normalizes sampling mode.
   *
   * @param {string} sampling - Sampling mode input.
   * @returns {string}        - Normalized sampling mode.
   * @private
   */
  static #normalizeSampling(sampling) {
    if (typeof sampling !== "string") {
      throw new TypeError(ERROR_SAMPLING_VALUE);
    }
    if (sampling === SAMPLING_NEAREST || sampling === SAMPLING_BILINEAR) {
      return sampling;
    }
    throw new RangeError(ERROR_SAMPLING_VALUE);
  }
  /**
   * Creates full geometry data for a heightmap terrain.
   *
   * @param {ImageData} heightmapImageData               - Heightmap source image data.
   * @param {Required<HeightmapGeometryOptions>} options - Normalized options.
   * @returns {HeightmapGeometryData}                    - Geometry buffers.
   * @private
   */
  static #createGeometryData(heightmapImageData, options) {
    const widthSegments = options.segmentsX;
    const depthSegments = options.segmentsZ;
    const widthVertexCount = widthSegments + VERTICES_PER_SEGMENT_INCREMENT7;
    const depthVertexCount = depthSegments + VERTICES_PER_SEGMENT_INCREMENT7;
    const vertexCount = widthVertexCount * depthVertexCount;
    const positions = new Float32Array(vertexCount * VECTOR_COMPONENTS_3);
    const uvs = new Float32Array(vertexCount * UV_COMPONENTS_2);
    let vertexIndex = ZERO_VALUE5;
    for (let zIndex = ZERO_VALUE5; zIndex < depthVertexCount; zIndex += ONE_VALUE3) {
      const vNormalized = zIndex / depthSegments;
      const positionZ = (vNormalized - CENTER_T_OFFSET4) * options.depth;
      for (let xIndex = ZERO_VALUE5; xIndex < widthVertexCount; xIndex += ONE_VALUE3) {
        const uNormalized = xIndex / widthSegments;
        const positionX = (uNormalized - CENTER_T_OFFSET4) * options.width;
        const height = _HeightmapGeometry.#sampleHeight(
          heightmapImageData,
          uNormalized,
          vNormalized,
          options
        );
        const positionY = height * options.heightScale + options.heightOffset;
        const positionBaseOffset = vertexIndex * VECTOR_COMPONENTS_3;
        positions[positionBaseOffset + X_INDEX] = positionX;
        positions[positionBaseOffset + Y_INDEX] = positionY;
        positions[positionBaseOffset + Z_INDEX] = positionZ;
        const uvBaseOffset = vertexIndex * UV_COMPONENTS_2;
        uvs[uvBaseOffset + U_INDEX] = uNormalized;
        uvs[uvBaseOffset + V_INDEX] = vNormalized;
        vertexIndex += ONE_VALUE3;
      }
    }
    const solidTriangleIndices = [];
    for (let zIndex = ZERO_VALUE5; zIndex < depthSegments; zIndex += ONE_VALUE3) {
      for (let xIndex = ZERO_VALUE5; xIndex < widthSegments; xIndex += ONE_VALUE3) {
        const topLeftVertexIndex = zIndex * widthVertexCount + xIndex;
        const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET6;
        const bottomLeftVertexIndex = topLeftVertexIndex + widthVertexCount;
        const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET6;
        solidTriangleIndices.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
        solidTriangleIndices.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
      }
    }
    const indicesSolid = createIndexArray(vertexCount, solidTriangleIndices);
    const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
    const normals = _HeightmapGeometry.#computeVertexNormals(positions, indicesSolid, vertexCount);
    const colors = createColorsFromSpec(vertexCount, options.colors);
    return {
      positions,
      normals,
      uvs,
      colors,
      indicesSolid,
      indicesWireframe
    };
  }
  /**
   * Samples the heightmap at the given normalized UV coordinate.
   *
   * @param {ImageData} heightmapImageData               - Heightmap image data.
   * @param {number} uNormalized                         - Normalized U coordinate [0..1].
   * @param {number} vNormalized                         - Normalized V coordinate [0..1].
   * @param {Required<HeightmapGeometryOptions>} options - Normalized options.
   * @returns {number}                                   - Height value in [0..1].
   * @private
   */
  static #sampleHeight(heightmapImageData, uNormalized, vNormalized, options) {
    const heightmapWidth = heightmapImageData.width;
    const heightmapHeight = heightmapImageData.height;
    const vSample = options.flipY ? ONE_VALUE3 - vNormalized : vNormalized;
    if (options.sampling === SAMPLING_BILINEAR) {
      const xFloat = uNormalized * (heightmapWidth - ONE_VALUE3);
      const yFloat = vSample * (heightmapHeight - ONE_VALUE3);
      const x0 = Math.floor(xFloat);
      const y0 = Math.floor(yFloat);
      const x1 = Math.min(x0 + ONE_VALUE3, heightmapWidth - ONE_VALUE3);
      const y1 = Math.min(y0 + ONE_VALUE3, heightmapHeight - ONE_VALUE3);
      const tx = xFloat - x0;
      const ty = yFloat - y0;
      const h00 = _HeightmapGeometry.#getHeightAt(heightmapImageData, x0, y0);
      const h10 = _HeightmapGeometry.#getHeightAt(heightmapImageData, x1, y0);
      const h01 = _HeightmapGeometry.#getHeightAt(heightmapImageData, x0, y1);
      const h11 = _HeightmapGeometry.#getHeightAt(heightmapImageData, x1, y1);
      const h0 = h00 + (h10 - h00) * tx;
      const h1 = h01 + (h11 - h01) * tx;
      return h0 + (h1 - h0) * ty;
    }
    const xIndex = Math.round(uNormalized * (heightmapWidth - ONE_VALUE3));
    const yIndex = Math.round(vSample * (heightmapHeight - ONE_VALUE3));
    return _HeightmapGeometry.#getHeightAt(heightmapImageData, xIndex, yIndex);
  }
  /**
   * Reads normalized height from image data at a pixel coordinate.
   *
   * @param {ImageData} heightmapImageData - Heightmap image data.
   * @param {number} xIndex                - Pixel X coordinate.
   * @param {number} yIndex                - Pixel Y coordinate.
   * @returns {number}                     - Height value in [0..1].
   * @private
   */
  static #getHeightAt(heightmapImageData, xIndex, yIndex) {
    const width = heightmapImageData.width;
    const data = heightmapImageData.data;
    const pixelIndex = (yIndex * width + xIndex) * BYTES_PER_PIXEL;
    const redValue = data[pixelIndex + RED_CHANNEL_OFFSET];
    return redValue / MAX_CHANNEL_VALUE;
  }
  /**
   * Computes per-vertex normals from positions and indices.
   *
   * @param {Float32Array} positions            - Vertex positions.
   * @param {Uint16Array | Uint32Array} indices - Triangle indices.
   * @param {number} vertexCount                - Total vertex count.
   * @returns {Float32Array}                    - Vertex normals.
   * @private
   */
  static #computeVertexNormals(positions, indices, vertexCount) {
    const normals = new Float32Array(vertexCount * VECTOR_COMPONENTS_3);
    for (let i = ZERO_VALUE5; i < indices.length; i += TRIANGLE_INDEX_STRIDE2) {
      const indexA = indices[i + X_INDEX] * VECTOR_COMPONENTS_3;
      const indexB = indices[i + Y_INDEX] * VECTOR_COMPONENTS_3;
      const indexC = indices[i + Z_INDEX] * VECTOR_COMPONENTS_3;
      const ax = positions[indexA + X_INDEX];
      const ay = positions[indexA + Y_INDEX];
      const az = positions[indexA + Z_INDEX];
      const bx = positions[indexB + X_INDEX];
      const by = positions[indexB + Y_INDEX];
      const bz = positions[indexB + Z_INDEX];
      const cx = positions[indexC + X_INDEX];
      const cy = positions[indexC + Y_INDEX];
      const cz = positions[indexC + Z_INDEX];
      const abx = bx - ax;
      const aby = by - ay;
      const abz = bz - az;
      const acx = cx - ax;
      const acy = cy - ay;
      const acz = cz - az;
      const crossX = aby * acz - abz * acy;
      const crossY = abz * acx - abx * acz;
      const crossZ = abx * acy - aby * acx;
      normals[indexA + X_INDEX] += crossX;
      normals[indexA + Y_INDEX] += crossY;
      normals[indexA + Z_INDEX] += crossZ;
      normals[indexB + X_INDEX] += crossX;
      normals[indexB + Y_INDEX] += crossY;
      normals[indexB + Z_INDEX] += crossZ;
      normals[indexC + X_INDEX] += crossX;
      normals[indexC + Y_INDEX] += crossY;
      normals[indexC + Z_INDEX] += crossZ;
    }
    for (let vertexIndex = ZERO_VALUE5; vertexIndex < vertexCount; vertexIndex += ONE_VALUE3) {
      const baseIndex = vertexIndex * VECTOR_COMPONENTS_3;
      const nx = normals[baseIndex + X_INDEX];
      const ny = normals[baseIndex + Y_INDEX];
      const nz = normals[baseIndex + Z_INDEX];
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (length > ZERO_VALUE5) {
        const invLength = ONE_VALUE3 / length;
        normals[baseIndex + X_INDEX] = nx * invLength;
        normals[baseIndex + Y_INDEX] = ny * invLength;
        normals[baseIndex + Z_INDEX] = nz * invLength;
      }
    }
    return normals;
  }
  /**
   * Extracts `ImageData` from supported heightmap source formats.
   *
   * @param {ImageData|HeightmapSource} source - Heightmap source.
   * @returns {ImageData}                      - Extracted image data.
   * @private
   */
  static #normalizeHeightmapImageData(source) {
    if (source instanceof ImageData) {
      return source;
    }
    if (source === null || typeof source !== "object" || Array.isArray(source)) {
      throw new TypeError(ERROR_HEIGHTMAP_IMAGE_DATA);
    }
    const imageData = source[HEIGHTMAP_SOURCE_IMAGE_DATA_FIELD];
    if (!(imageData instanceof ImageData)) {
      throw new TypeError(ERROR_HEIGHTMAP_IMAGE_DATA);
    }
    return imageData;
  }
  /**
   * Loads an `HTMLImageElement` from a URL.
   *
   * @param {string} url                  - Image URL.
   * @returns {Promise<HTMLImageElement>} - Promise, that resolves with a decoded image on `load`, or rejects on `error`.
   * @private
   */
  static #loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = IMAGE_CROSS_ORIGIN_ANON;
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(ERROR_LOAD_IMAGE_PREFIX + url));
      image.src = url;
    });
  }
  /**
   * Creates ImageData from a loaded image.
   *
   * @param {HTMLImageElement} image - Loaded image element.
   * @returns {ImageData}            - Extracted image data.
   * @private
   */
  static #createImageData(image) {
    const canvas = document.createElement(CANVAS_TAG_NAME);
    const context = canvas.getContext(CANVAS_CONTEXT_2D);
    if (!context) {
      throw new Error(ERROR_CANVAS_CONTEXT);
    }
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, ZERO_VALUE5, ZERO_VALUE5);
    return context.getImageData(ZERO_VALUE5, ZERO_VALUE5, image.width, image.height);
  }
  /**
   * Heightmap sampling modes.
   *
   * @returns {{ NEAREST: string, BILINEAR: string }}
   */
  static get Sampling() {
    return Object.freeze({
      NEAREST: SAMPLING_NEAREST,
      BILINEAR: SAMPLING_BILINEAR
    });
  }
};

// core/texture/texture2d.js
var PLACEHOLDER_TEXTURE_WIDTH = 1;
var PLACEHOLDER_TEXTURE_HEIGHT = 1;
var TEXTURE_BORDER_VALUE = 0;
var BASE_MIPMAP_LEVEL = 0;
var PLACEHOLDER_PIXEL_RGBA = new Uint8Array([255, 0, 255, 255]);
var WEBGL_TRUE_AS_INTEGER = 1;
var WEBGL_FALSE_AS_INTEGER = 0;
var MIN_TEXTURE_UNIT_INDEX = 0;
var MIN_REQUIRED_STRING_LENGTH2 = 1;
var MIN_POWER_OF_TWO_VALUE = 1;
var BIT_MASK_ONE = 1;
var BITWISE_ZERO = 0;
var Texture2D = class {
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
      throw new TypeError("`Texture2D` expects `WebGL2RenderingContext`.");
    }
    if (options === null || typeof options !== "object") {
      throw new TypeError("`Texture2D` expects options as an object.");
    }
    const { flipY = true } = options;
    if (typeof flipY !== "boolean") {
      throw new TypeError("`Texture2D` expects `options.flipY` as boolean.");
    }
    this.#webglContext = webglContext;
    this.#flipY = flipY;
    const texture = webglContext.createTexture();
    if (!texture) {
      throw new Error("Failed to create `WebGLTexture`.");
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
      throw new TypeError("`Texture2D.bind` expects `textureUnitIndex` as a non-negative integer.");
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
    if (typeof url !== "string" || url.length < MIN_REQUIRED_STRING_LENGTH2) {
      throw new TypeError("`Texture2D.loadFromUrl` expects url as a non-empty string.");
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
      image.onload = () => resolve(image);
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
    this.#width = image.width;
    this.#height = image.height;
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
    return Number.isInteger(value) && value >= MIN_POWER_OF_TWO_VALUE && (value & value - BIT_MASK_ONE) === BITWISE_ZERO;
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
      throw new Error("`Texture2D` instance is disposed.");
    }
  }
};

// core/shader/shader-program.js
var MATRIX_4x4_ELEMENT_COUNT3 = 16;
var VECTOR_2_ELEMENT_COUNT = 2;
var VECTOR_3_ELEMENT_COUNT = 3;
var VECTOR_4_ELEMENT_COUNT = 4;
var ATTRIBUTE_LOCATION_NOT_FOUND_VALUE = -1;
var MIN_TEXTURE_UNIT_INDEX2 = 0;
var DEFAULT_TEXTURE_UNIT_INDEX = 0;
var ShaderProgram = class {
  /**
   * Raw WebGL2 rendering context.
   * Used for all shader program operations (e.g.: compile/link/use, uniforms, attributes).
   *
   * @type {WebGL2RenderingContext}
   * @private
   */
  #webglRenderingContext;
  /**
   * Linked WebGL program instance.
   *
   * @type {WebGLProgram | null}
   * @private
   */
  #program;
  /**
   * Cache of uniform locations by uniform name.
   * Avoids repeated calls to getUniformLocation for the same program.
   *
   * @type {Map<string, WebGLUniformLocation>}
   * @private
   */
  #uniformLocations;
  /**
   * Indicates whether this shader program has been disposed.
   *
   * @type {boolean}
   * @private
   */
  #isDisposed = false;
  /**
   * @param {WebGL2RenderingContext} webglRenderingContext - WebGL2 rendering context used to create shaders and the program.
   * @param {string} vertexSource                          - GLSL source code of the vertex shader.
   * @param {string} fragmentSource                        - GLSL source code of the fragment shader.
   */
  constructor(webglRenderingContext, vertexSource, fragmentSource) {
    if (!(webglRenderingContext instanceof WebGL2RenderingContext)) {
      throw new TypeError("`ShaderProgram` expects a `WebGL2RenderingContext`.");
    }
    if (typeof vertexSource !== "string" || typeof fragmentSource !== "string") {
      throw new TypeError("`ShaderProgram` expects vertex and fragment source as strings.");
    }
    this.#webglRenderingContext = webglRenderingContext;
    this.#uniformLocations = /* @__PURE__ */ new Map();
    const vertexShader = this.#compileShader(this.#webglRenderingContext.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.#compileShader(this.#webglRenderingContext.FRAGMENT_SHADER, fragmentSource);
    const program = this.#webglRenderingContext.createProgram();
    if (!program) {
      this.#webglRenderingContext.deleteShader(vertexShader);
      this.#webglRenderingContext.deleteShader(fragmentShader);
      throw new Error("Failed to create WebGL program.");
    }
    this.#webglRenderingContext.attachShader(program, vertexShader);
    this.#webglRenderingContext.attachShader(program, fragmentShader);
    this.#webglRenderingContext.linkProgram(program);
    const linkStatus = this.#webglRenderingContext.getProgramParameter(
      program,
      this.#webglRenderingContext.LINK_STATUS
    );
    this.#webglRenderingContext.deleteShader(vertexShader);
    this.#webglRenderingContext.deleteShader(fragmentShader);
    if (!linkStatus) {
      const infoLog = this.#webglRenderingContext.getProgramInfoLog(program) || "Unknown program link error";
      this.#webglRenderingContext.deleteProgram(program);
      throw new Error(`Failed to link program: ${infoLog}`);
    }
    this.#program = program;
  }
  /**
   * Returns the underlying WebGL program object.
   *
   * @returns {WebGLProgram}
   */
  get program() {
    this.#assertNotDisposed();
    return this.#program;
  }
  /**
   * Makes this program active for subsequent draw calls.
   */
  use() {
    this.#assertNotDisposed();
    this.#webglRenderingContext.useProgram(this.#program);
  }
  /**
   * Returns the attribute location for the given attribute name.
   * This is useful for manual `vertexAttribPointer` setups.
   *
   * @param {string} name - Attribute name in the linked shader program.
   * @returns {number}    - Attribute location (0+).
   */
  getAttribLocation(name) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.getAttribLocation` expects attribute name as a string.");
    }
    const location = this.#webglRenderingContext.getAttribLocation(this.#program, name);
    if (location === ATTRIBUTE_LOCATION_NOT_FOUND_VALUE) {
      throw new Error(`Attribute "${name}" not found in shader program.`);
    }
    return location;
  }
  /**
   * Returns a cached uniform location.
   * This can be used for manual `gl.uniform*` calls.
   *
   * @param {string} name - Uniform name in the linked shader program.
   * @returns {WebGLUniformLocation}
   */
  getUniformLocation(name) {
    return this.#getUniformLocation(name);
  }
  /**
   * Sets a float uniform.
   *
   * @param {string} name  - Name of the uniform variable.
   * @param {number} value - Float value to upload.
   */
  setFloat(name, value) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.setFloat` expects uniform name as a string.");
    }
    if (typeof value !== "number") {
      throw new TypeError("`ShaderProgram.setFloat` expects value as a number.");
    }
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniform1f(location, value);
  }
  /**
   * Sets an integer uniform.
   *
   * @param {string} name  - Name of the uniform variable.
   * @param {number} value - Integer value to upload.
   */
  setInt(name, value) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.setInt` expects uniform name as a string.");
    }
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new TypeError("`ShaderProgram.setInt` expects an integer value.");
    }
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniform1i(location, value);
  }
  /**
   * Sets a `sampler2D` uniform and binds a `Texture2D` to the specified texture unit.
   *
   * @param {string} name                   - Name of the uniform variable.
   * @param {Texture2D} texture             - `Texture2D` instance to bind.
   * @param {number} [textureUnitIndex = 0] - Texture unit index (0 => N).
   */
  setTexture2D(name, texture, textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.setTexture2D` expects uniform name as a string.");
    }
    if (!(texture instanceof Texture2D)) {
      throw new TypeError("`ShaderProgram.setTexture2D` expects texture as Texture2D.");
    }
    if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < MIN_TEXTURE_UNIT_INDEX2) {
      throw new TypeError("`ShaderProgram.setTexture2D` expects textureUnitIndex as a non-negative integer.");
    }
    texture.bind(textureUnitIndex);
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniform1i(location, textureUnitIndex);
  }
  /**
   * Sets a vec2 uniform.
   *
   * @param {string} name                   - Name of the uniform variable.
   * @param {Float32Array | number[]} value - Two numeric components.
   */
  setVector2(name, value) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.setVector2` expects uniform name as a string.");
    }
    if (!Array.isArray(value) && !(value instanceof Float32Array)) {
      throw new TypeError("`ShaderProgram.setVector2` expects a number[] or Float32Array.");
    }
    if (value.length !== VECTOR_2_ELEMENT_COUNT) {
      throw new TypeError("`ShaderProgram.setVector2` expects exactly 2 components.");
    }
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniform2fv(location, value);
  }
  /**
   * Sets a vec3 uniform.
   *
   * @param {string} name                   - Name of the uniform variable.
   * @param {Float32Array | number[]} value - Three numeric components.
   */
  setVector3(name, value) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.setVector3` expects uniform name as a string.");
    }
    if (!Array.isArray(value) && !(value instanceof Float32Array)) {
      throw new TypeError("`ShaderProgram.setVector3` expects a number[] or Float32Array.");
    }
    if (value.length !== VECTOR_3_ELEMENT_COUNT) {
      throw new TypeError("`ShaderProgram.setVector3` expects exactly 3 components.");
    }
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniform3fv(location, value);
  }
  /**
   * Sets a `vec4` uniform.
   *
   * @param {string} name                   - Name of the uniform variable.
   * @param {Float32Array | number[]} value - Four numeric components.
   */
  setVector4(name, value) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.setVector4` expects uniform name as a string.");
    }
    if (!Array.isArray(value) && !(value instanceof Float32Array)) {
      throw new TypeError("`ShaderProgram.setVector4` expects a number[] or `Float32Array`.");
    }
    if (value.length !== VECTOR_4_ELEMENT_COUNT) {
      throw new TypeError("`ShaderProgram.setVector4` expects exactly 4 components.");
    }
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniform4fv(location, value);
  }
  /**
   * Sets a 4x4 matrix uniform.
   *
   * @param {string} name         - Name of the uniform variable in the GLSL program.
   * @param {Float32Array} matrix - 4x4 matrix in column-major order to upload to the uniform.
   */
  setMatrix4(name, matrix) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.setMatrix4` expects uniform name as a string.");
    }
    if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT3) {
      throw new TypeError("`ShaderProgram.setMatrix4` expects a 4x4 Float32Array.");
    }
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniformMatrix4fv(location, false, matrix);
  }
  /**
   * Releases the underlying WebGL program. After calling dispose, this instance must not be used.
   */
  dispose() {
    if (this.#isDisposed) {
      return;
    }
    if (this.#program) {
      this.#webglRenderingContext.deleteProgram(this.#program);
    }
    this.#uniformLocations.clear();
    this.#program = null;
    this.#isDisposed = true;
  }
  /**
   * @private
   */
  #assertNotDisposed() {
    if (this.#isDisposed || this.#program === null) {
      throw new Error("`ShaderProgram` has been disposed and can no longer be used.");
    }
  }
  /**
   * Looks up a uniform location with caching.
   *
   * @param {string} name - Name of the uniform variable in the linked shader program.
   * @returns {WebGLUniformLocation}
   * @private
   */
  #getUniformLocation(name) {
    this.#assertNotDisposed();
    if (typeof name !== "string") {
      throw new TypeError("`ShaderProgram.#getUniformLocation` expects a string name.");
    }
    if (this.#uniformLocations.has(name)) {
      const cachedLocation = this.#uniformLocations.get(name);
      return cachedLocation;
    }
    const location = this.#webglRenderingContext.getUniformLocation(this.#program, name);
    if (location === null) {
      throw new Error(`Uniform "${name}" not found in shader program.`);
    }
    this.#uniformLocations.set(name, location);
    return location;
  }
  /**
   * Compiles a shader of the given type.
   *
   * @param {number} type   - Shader type constant (e.g. gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
   * @param {string} source - GLSL source code for the shader.
   * @returns {WebGLShader}
   * @private
   */
  #compileShader(type, source) {
    if (typeof type !== "number") {
      throw new TypeError("`ShaderProgram.#compileShader` expects a numeric shader type.");
    }
    if (typeof source !== "string") {
      throw new TypeError("`ShaderProgram.#compileShader` expects shader source as a string.");
    }
    const shader = this.#webglRenderingContext.createShader(type);
    if (!shader) {
      throw new Error("Failed to create the WebGL shader.");
    }
    this.#webglRenderingContext.shaderSource(shader, source);
    this.#webglRenderingContext.compileShader(shader);
    const compileStatus = this.#webglRenderingContext.getShaderParameter(shader, this.#webglRenderingContext.COMPILE_STATUS);
    if (!compileStatus) {
      const infoLog = this.#webglRenderingContext.getShaderInfoLog(shader) || "Unknown shader compilation error";
      this.#webglRenderingContext.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${infoLog}`);
    }
    return shader;
  }
};

// core/material/material.js
var MIN_OPACITY = 0;
var MAX_OPACITY = 1;
var DEFAULT_OPACITY = 1;
var Material = class {
  /**
   * WebGL2 rendering context used to create and manage GPU resources.
   *
   * @type {WebGL2RenderingContext}
   * @private
   */
  #webglContext;
  /**
   * Shader program used by this material to render geometry.
   *
   * @type {ShaderProgram}
   * @private
   */
  #shaderProgram;
  /**
   * Opacity multiplier (alpha) in [0..1].
   *
   * @type {number}
   * @private
   */
  #opacity = DEFAULT_OPACITY;
  /**
   * When enabled, the renderer should draw geometry using wireframe indices (lines) instead of solid triangles.
   *
   * @type {boolean}
   * @private
   */
  #wireframeEnabled = false;
  /**
   * Ownership flag. When true, this material is responsible for disposing the shader program.
   *
   * @type {boolean}
   * @private
   */
  #ownsShaderProgram = false;
  /**
   * Indicates whether the material has been disposed and can no longer be used.
   *
   * @type {boolean}
   * @private
   */
  #isDisposed = false;
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
   * @param {ShaderProgram} shaderProgram         - Compiled and linked shader program used by this material for rendering.
   * @param {MaterialOptions} [options]           - Material options.
   */
  constructor(webglContext, shaderProgram, options = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError("Material expects a WebGL2RenderingContext.");
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("Material expects an options object (plain object).");
    }
    const { ownsShaderProgram = false } = options;
    if (typeof ownsShaderProgram !== "boolean") {
      throw new TypeError('Material option "ownsShaderProgram" must be a boolean.');
    }
    if (!(shaderProgram instanceof ShaderProgram)) {
      throw new TypeError("Material expects a ShaderProgram instance.");
    }
    this.#webglContext = webglContext;
    this.#shaderProgram = shaderProgram;
    this.#ownsShaderProgram = ownsShaderProgram;
  }
  /**
   * @returns {WebGL2RenderingContext} - WebGL2 rendering context used by this material.
   */
  get webglContext() {
    this.#assertNotDisposed();
    return this.#webglContext;
  }
  /**
   * @returns {ShaderProgram} - Shader program used by this material for rendering.
   */
  get shaderProgram() {
    this.#assertNotDisposed();
    return this.#shaderProgram;
  }
  /**
   * Returns the current opacity multiplier.
   *
   * @returns {number}
   */
  get opacity() {
    this.#assertNotDisposed();
    return this.#opacity;
  }
  /**
   * Sets opacity multiplier (alpha).
   *
   * @param {number} value - Opacity multiplier in [0..1].
   */
  setOpacity(value) {
    this.#assertNotDisposed();
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`Material.setOpacity` expects a finite number.");
    }
    if (value < MIN_OPACITY || value > MAX_OPACITY) {
      throw new RangeError(`Material.setOpacity expects a value in [${MIN_OPACITY}..${MAX_OPACITY}].`);
    }
    this.#opacity = value;
  }
  /**
   * @returns {boolean} True, when opacity is lower than `1.0`.
   */
  isTransparent() {
    this.#assertNotDisposed();
    return this.#opacity < MAX_OPACITY;
  }
  /**
   * Indicates whether this material has been disposed.
   *
   * @returns {boolean} - True, when this material has been disposed and can no longer be used.
   */
  get isDisposed() {
    return this.#isDisposed;
  }
  /**
   * Makes this material's shader program active.
   */
  use() {
    this.#assertNotDisposed();
    this.#shaderProgram.use();
  }
  /**
   * Enables or disables wireframe rendering.
   *
   * @param {boolean} enabled - When true, switches material to wireframe mode. When false, uses solid rendering.
   */
  setWireframeEnabled(enabled) {
    this.#assertNotDisposed();
    this.#wireframeEnabled = Boolean(enabled);
  }
  /**
   * Toggles wireframe mode.
   */
  toggleWireframe() {
    this.#assertNotDisposed();
    this.#wireframeEnabled = !this.#wireframeEnabled;
  }
  /**
   * @returns {boolean} - True, when wireframe rendering is enabled and false for solid rendering.
   */
  isWireframeEnabled() {
    this.#assertNotDisposed();
    return this.#wireframeEnabled;
  }
  /**
   * Releases GPU resources owned by this material.
   * If ownsShaderProgram is true, the underlying shader program will be disposed as well.
   */
  dispose() {
    if (this.#isDisposed) {
      return;
    }
    if (this.#ownsShaderProgram) {
      this.#shaderProgram.dispose();
    }
    this.#isDisposed = true;
  }
  /**
   * @private
   */
  #assertNotDisposed() {
    if (this.#isDisposed) {
      throw new Error("Material has been disposed and can no longer be used.");
    }
  }
};

// core/material/vertex-color-material.js
var POSITION_ATTRIBUTE_LOCATION2 = 0;
var COLOR_ATTRIBUTE_LOCATION2 = 1;
var MATRIX_UNIFORM_NAME = "u_matrix";
var OPACITY_UNIFORM_NAME = "u_opacity";
var VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION2}) in vec3 a_position;
layout(location = ${COLOR_ATTRIBUTE_LOCATION2}) in vec3 a_color;
uniform mat4 ${MATRIX_UNIFORM_NAME};
out vec3 v_color;

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_color = a_color;
}
`;
var FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_color;
uniform float ${OPACITY_UNIFORM_NAME};
out vec4 outColor;

void main() {
    outColor = vec4(v_color, ${OPACITY_UNIFORM_NAME});
}
`;
var VertexColorMaterial = class extends Material {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
   */
  constructor(webglContext) {
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    super(webglContext, shaderProgram, { ownsShaderProgram: true });
  }
  /**
   * Applies per-object uniforms.
   *
   * @param {Float32Array} matrix4 - Transformation matrix passed as `u_matrix`.
   */
  apply(matrix4) {
    this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME, matrix4);
    this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME, this.opacity);
  }
};

// core/material/solid-color-material.js
var POSITION_ATTRIBUTE_LOCATION3 = 0;
var MATRIX_UNIFORM_NAME2 = "u_matrix";
var COLOR_UNIFORM_NAME = "u_color";
var OPACITY_UNIFORM_NAME2 = "u_opacity";
var COLOR_COMPONENT_COUNT3 = 3;
var DEFAULT_COLOR = new Float32Array([1, 1, 1]);
var VERTEX_SHADER_SOURCE2 = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION3}) in vec3 a_position;
uniform mat4 ${MATRIX_UNIFORM_NAME2};

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME2} * vec4(a_position, 1.0);
}
`;
var FRAGMENT_SHADER_SOURCE2 = `#version 300 es
precision mediump float;
uniform vec3  ${COLOR_UNIFORM_NAME};
uniform float ${OPACITY_UNIFORM_NAME2};
out vec4 outColor;

void main() {
    outColor = vec4(${COLOR_UNIFORM_NAME}, ${OPACITY_UNIFORM_NAME2});
}
`;
var SolidColorMaterial = class extends Material {
  /**
   * Current RGB color stored as Float32Array([r, g, b]).
   *
   * @type {Float32Array}
   * @private
   */
  #color = new Float32Array(DEFAULT_COLOR);
  /**
   * @param {WebGL2RenderingContext} webglContext         - WebGL2 rendering context used to compile shaders.
   * @param {SolidColorMaterialOptions} [options]         - Material options.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("SolidColorMaterial expects an options object (plain object).");
    }
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE2, FRAGMENT_SHADER_SOURCE2);
    super(webglContext, shaderProgram, { ownsShaderProgram: true });
    const { color } = options;
    if (color !== void 0) {
      this.setColor(color);
    }
  }
  /**
   * Applies per-object uniforms.
   *
   * @param {Float32Array} matrix4 - Transformation matrix passed as u_matrix.
   */
  apply(matrix4) {
    this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME2, matrix4);
    this.shaderProgram.setVector3(COLOR_UNIFORM_NAME, this.#color);
    this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME2, this.opacity);
  }
  /**
   * Sets the RGB color.
   *
   * @param {Float32Array | number[]} color - [r, g, b] in 0..1 range.
   */
  setColor(color) {
    if (!Array.isArray(color) && !(color instanceof Float32Array)) {
      throw new TypeError("SolidColorMaterial.setColor expects a number[] or Float32Array.");
    }
    if (color.length !== COLOR_COMPONENT_COUNT3) {
      throw new TypeError("SolidColorMaterial.setColor expects exactly 3 components [r, g, b].");
    }
    this.#color[0] = color[0];
    this.#color[1] = color[1];
    this.#color[2] = color[2];
  }
  /**
   * Returns the internal color buffer.
   * Note: returned Float32Array is mutable.
   *
   * @returns {Float32Array}
   */
  get color() {
    return this.#color;
  }
};

// core/material/textured-material.js
var POSITION_ATTRIBUTE_LOCATION4 = 0;
var UV_ATTRIBUTE_LOCATION2 = 2;
var DEFAULT_TEXTURE_UNIT_INDEX2 = 0;
var MIN_TEXTURE_UNIT_INDEX3 = 0;
var MATRIX_UNIFORM_NAME3 = "u_matrix";
var DIFFUSE_TEXTURE_UNIFORM_NAME = "u_diffuseTexture";
var OPACITY_UNIFORM_NAME3 = "u_opacity";
var VERTEX_SHADER_SOURCE3 = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION4}) in vec3 a_position;
layout(location = ${UV_ATTRIBUTE_LOCATION2}) in vec2 a_uv;
uniform mat4 ${MATRIX_UNIFORM_NAME3};
out vec2 v_uv;

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME3} * vec4(a_position, 1.0);
    v_uv = a_uv;
}
`;
var FRAGMENT_SHADER_SOURCE3 = `#version 300 es
precision mediump float;
in vec2 v_uv;
uniform sampler2D ${DIFFUSE_TEXTURE_UNIFORM_NAME};
uniform float ${OPACITY_UNIFORM_NAME3};
out vec4 outColor;

void main() {
    vec4 sampledColor = texture(${DIFFUSE_TEXTURE_UNIFORM_NAME}, v_uv);
    outColor = vec4(sampledColor.rgb, sampledColor.a * ${OPACITY_UNIFORM_NAME3});
}
`;
var TexturedMaterial = class extends Material {
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
    if (options === null || typeof options !== "object") {
      throw new TypeError("TexturedMaterial expects options as an object.");
    }
    const {
      texture,
      textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX2,
      ownsTexture = false,
      ownsShaderProgram = true
    } = options;
    if (texture !== void 0 && !(texture instanceof Texture2D)) {
      throw new TypeError("`TexturedMaterial` expects `options.texture` as `Texture2D`.");
    }
    if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < MIN_TEXTURE_UNIT_INDEX3) {
      throw new TypeError("`TexturedMaterial` expects `options.textureUnitIndex` as a non-negative integer.");
    }
    if (typeof ownsTexture !== "boolean") {
      throw new TypeError("`TexturedMaterial` expects `options.ownsTexture` as boolean.");
    }
    if (typeof ownsShaderProgram !== "boolean") {
      throw new TypeError("`TexturedMaterial` expects `options.ownsShaderProgram` as boolean.");
    }
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE3, FRAGMENT_SHADER_SOURCE3);
    super(webglContext, shaderProgram, { ownsShaderProgram });
    this.#diffuseTexture = texture || new Texture2D(webglContext);
    this.#textureUnitIndex = textureUnitIndex;
    this.#ownsDiffuseTexture = ownsTexture || !texture;
  }
  /**
   * Uploads uniforms and binds the texture for a draw call.
   *
   * @param {Float32Array} matrix4 - Model-View-Projection matrix (4x4).
   */
  apply(matrix4) {
    this.use();
    this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME3, matrix4);
    this.shaderProgram.setTexture2D(DIFFUSE_TEXTURE_UNIFORM_NAME, this.#diffuseTexture, this.#textureUnitIndex);
    this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME3, this.opacity);
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
      throw new TypeError("`TexturedMaterial.setDiffuseTexture` expects texture as `Texture2D`.");
    }
    if (options === null || typeof options !== "object") {
      throw new TypeError("`TexturedMaterial.setDiffuseTexture` expects options as an object.");
    }
    const { ownsTexture = false } = options;
    if (typeof ownsTexture !== "boolean") {
      throw new TypeError("`TexturedMaterial.setDiffuseTexture` expects options.ownsTexture as boolean.");
    }
    if (this.#ownsDiffuseTexture) {
      this.#diffuseTexture.dispose();
    }
    this.#diffuseTexture = texture;
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
};

// core/material/normal-material.js
var POSITION_ATTRIBUTE_LOCATION5 = 0;
var NORMAL_ATTRIBUTE_LOCATION2 = 3;
var MATRIX_UNIFORM_NAME4 = "u_matrix";
var OPACITY_UNIFORM_NAME4 = "u_opacity";
var NORMAL_COLOR_SCALE = 0.5;
var NORMAL_COLOR_BIAS = 0.5;
var VERTEX_SHADER_SOURCE4 = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION5}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION2}) in vec3 a_normal;
uniform mat4 ${MATRIX_UNIFORM_NAME4};
out vec3 v_normal;

void main() {
    gl_Position = ${MATRIX_UNIFORM_NAME4} * vec4(a_position, 1.0);
    v_normal = a_normal;
}
`;
var FRAGMENT_SHADER_SOURCE4 = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform float ${OPACITY_UNIFORM_NAME4};
out vec4 outColor;

void main() {
    vec3 normalizedNormal = normalize(v_normal);
    vec3 normalColor = (normalizedNormal * ${NORMAL_COLOR_SCALE}) + ${NORMAL_COLOR_BIAS};
    outColor = vec4(normalColor, ${OPACITY_UNIFORM_NAME4});
}
`;
var NormalMaterial = class extends Material {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
   */
  constructor(webglContext) {
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE4, FRAGMENT_SHADER_SOURCE4);
    super(webglContext, shaderProgram, { ownsShaderProgram: true });
  }
  /**
   * Applies per-object uniforms.
   *
   * @param {Float32Array} matrix4 - Transformation matrix passed as `u_matrix`.
   */
  apply(matrix4) {
    this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME4, matrix4);
    this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME4, this.opacity);
  }
};

// core/material/directional-light-material.js
var POSITION_ATTRIBUTE_LOCATION6 = 0;
var NORMAL_ATTRIBUTE_LOCATION3 = 3;
var FINAL_MATRIX_UNIFORM_NAME = "u_matrix";
var WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME = "u_worldInverseTranspose";
var WORLD_MATRIX_UNIFORM_NAME = "u_worldMatrix";
var COLOR_UNIFORM_NAME2 = "u_color";
var LIGHT_DIRECTION_UNIFORM_NAME = "u_lightDirection";
var CAMERA_POSITION_UNIFORM_NAME = "u_cameraPosition";
var AMBIENT_STRENGTH_UNIFORM_NAME = "u_ambientStrength";
var OPACITY_UNIFORM_NAME5 = "u_opacity";
var VECTOR3_ELEMENT_COUNT = 3;
var DEFAULT_COLOR2 = new Float32Array([0.85, 0.85, 0.85]);
var DEFAULT_LIGHT_DIRECTION = new Float32Array([0.5, 0.7, 1]);
var DEFAULT_AMBIENT_STRENGTH = 0.2;
var MIN_DIRECTION_LENGTH_SQUARED = 0;
var INVERSE_LENGTH_NUMERATOR = 1;
var DirectionalLightMaterial = class _DirectionalLightMaterial extends Material {
  /**
   * Diffuse/base color (RGB).
   *
   * @type {Float32Array}
   * @private
   */
  #color = new Float32Array(VECTOR3_ELEMENT_COUNT);
  /**
   * Directional light direction (world space, normalized).
   *
   * @type {Float32Array}
   * @private
   */
  #lightDirection = new Float32Array(VECTOR3_ELEMENT_COUNT);
  /**
   * Ambient term multiplier.
   *
   * @type {number}
   * @private
   */
  #ambientStrength = DEFAULT_AMBIENT_STRENGTH;
  /**
   * Creates a new directional-light material.
   *
   * @param {WebGL2RenderingContext} webglContext                   - WebGL2 rendering context used to create GPU resources.
   * @param {ShaderProgram} shaderProgram                           - Compiled shader program instance.
   * @param {DirectionalLightMaterialOptions} [options]             - Common material options.
   * @param {DirectionalLightMaterialBaseOptions} [materialOptions] - Material base options.
   */
  constructor(webglContext, shaderProgram, options = {}, materialOptions = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError("`DirectionalLightMaterial` expects a WebGL2RenderingContext.");
    }
    if (!(shaderProgram instanceof ShaderProgram)) {
      throw new TypeError("`DirectionalLightMaterial` expects a ShaderProgram instance.");
    }
    _DirectionalLightMaterial.#assertPlainObject("`DirectionalLightMaterial`", options);
    _DirectionalLightMaterial.#assertPlainObject("`DirectionalLightMaterial`", materialOptions);
    const { ownsShaderProgram = true } = materialOptions;
    if (typeof ownsShaderProgram !== "boolean") {
      throw new TypeError('`DirectionalLightMaterial` option "ownsShaderProgram" must be a boolean.');
    }
    super(webglContext, shaderProgram, { ownsShaderProgram });
    this.#color.set(DEFAULT_COLOR2);
    this.setLightDirection(DEFAULT_LIGHT_DIRECTION);
    this.#ambientStrength = DEFAULT_AMBIENT_STRENGTH;
    const { color, lightDirection, ambientStrength } = options;
    if (color !== void 0) {
      this.setColor(color);
    }
    if (lightDirection !== void 0) {
      this.setLightDirection(lightDirection);
    }
    if (ambientStrength !== void 0) {
      this.setAmbientStrength(ambientStrength);
    }
  }
  /**
   * Uploads per-object uniforms for a draw call. Unified contract for directional-light materials.
   *
   * Renderer passes:
   * - finalMatrix (view projection * world)
   * - worldMatrix
   * - worldInverseTransposeMatrix
   * - cameraPosition
   *
   * @param {Float32Array} finalMatrix                 - View projection * world matrix.
   * @param {Float32Array} worldMatrix                 - World matrix.
   * @param {Float32Array} worldInverseTransposeMatrix - `(world ^ -1) ^ T` used to transform normals.
   * @param {Float32Array} cameraPosition              - Camera position, world space.
   */
  apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition) {
    this.shaderProgram.setMatrix4(FINAL_MATRIX_UNIFORM_NAME, finalMatrix);
    this.shaderProgram.setMatrix4(WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME, worldInverseTransposeMatrix);
    this.shaderProgram.setVector3(COLOR_UNIFORM_NAME2, this.#color);
    this.shaderProgram.setVector3(LIGHT_DIRECTION_UNIFORM_NAME, this.#lightDirection);
    this.shaderProgram.setFloat(AMBIENT_STRENGTH_UNIFORM_NAME, this.#ambientStrength);
    this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME5, this.opacity);
    this.applyAdditionalUniforms(worldMatrix, cameraPosition);
  }
  /**
   * Hook for subclasses to upload additional per-object uniforms.
   * Default implementation in this class does nothing.
   *
   * @param {Float32Array} worldMatrix    - World matrix.
   * @param {Float32Array} cameraPosition - Camera position, world space.
   * @protected
   */
  applyAdditionalUniforms(worldMatrix, cameraPosition) {
    void worldMatrix;
    void cameraPosition;
  }
  /**
   * Sets the diffuse/base RGB color.
   *
   * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
   */
  setColor(color) {
    _DirectionalLightMaterial.assertVector3("`DirectionalLightMaterial.setColor`", color);
    this.#color[0] = color[0];
    this.#color[1] = color[1];
    this.#color[2] = color[2];
  }
  /**
   * Sets the light direction (world space). The direction is normalized internally.
   *
   * @param {Float32Array | number[]} direction - [x, y, z] direction vector (non-zero).
   */
  setLightDirection(direction) {
    _DirectionalLightMaterial.assertVector3("`DirectionalLightMaterial.setLightDirection`", direction);
    const directionX = direction[0];
    const directionY = direction[1];
    const directionZ = direction[2];
    const directionLengthSquared = directionX * directionX + directionY * directionY + directionZ * directionZ;
    if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= MIN_DIRECTION_LENGTH_SQUARED) {
      throw new TypeError("`DirectionalLightMaterial.setLightDirection` expects a non-zero finite vector.");
    }
    const inverseDirectionLength = INVERSE_LENGTH_NUMERATOR / Math.sqrt(directionLengthSquared);
    this.#lightDirection[0] = directionX * inverseDirectionLength;
    this.#lightDirection[1] = directionY * inverseDirectionLength;
    this.#lightDirection[2] = directionZ * inverseDirectionLength;
  }
  /**
   * Sets ambient strength multiplier.
   *
   * @param {number} value - Ambient multiplier.
   */
  setAmbientStrength(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`DirectionalLightMaterial.setAmbientStrength` expects a finite number.");
    }
    this.#ambientStrength = value;
  }
  /**
   * Returns the internal diffuse/base color buffer.
   *
   * @returns {Float32Array}
   */
  get color() {
    return this.#color;
  }
  /**
   * Returns the internal normalized light direction buffer.
   *
   * @returns {Float32Array}
   */
  get lightDirection() {
    return this.#lightDirection;
  }
  /**
   * @returns {number} Ambient strength multiplier.
   */
  get ambientStrength() {
    return this.#ambientStrength;
  }
  /**
   * Validates a vector3-like input.
   *
   * @param {string} methodName               - Method name for error messages.
   * @param {Float32Array | number[]} vector3 - Vector to validate.
   */
  static assertVector3(methodName, vector3) {
    if (!Array.isArray(vector3) && !(vector3 instanceof Float32Array)) {
      throw new TypeError(`${methodName} expects a number[] or Float32Array.`);
    }
    if (vector3.length !== VECTOR3_ELEMENT_COUNT) {
      throw new TypeError(`${methodName} expects exactly 3 components [x, y, z].`);
    }
    if (!Number.isFinite(vector3[0]) || !Number.isFinite(vector3[1]) || !Number.isFinite(vector3[2])) {
      throw new TypeError(`${methodName} expects all components to be finite numbers.`);
    }
  }
  /**
   * Validates a plain options object.
   *
   * @param {string} methodName - Method or class name for error messages.
   * @param {Object} object     - Object to validate.
   * @private
   */
  static #assertPlainObject(methodName, object) {
    if (object === null || typeof object !== "object" || Array.isArray(object)) {
      throw new TypeError(`${methodName} expects an options object (plain object).`);
    }
  }
};

// core/material/lambert-material.js
var VERTEX_SHADER_SOURCE5 = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION6}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION3}) in vec3 a_normal;
uniform mat4 ${FINAL_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME};
out vec3 v_normal;

void main() {
    gl_Position = ${FINAL_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_normal    = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME} * vec4(a_normal, 0.0)).xyz;
}
`;
var FRAGMENT_SHADER_SOURCE5 = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3  ${COLOR_UNIFORM_NAME2};
uniform vec3  ${LIGHT_DIRECTION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME};
uniform float ${OPACITY_UNIFORM_NAME5};
out vec4 outColor;

void main() {
    vec3 surface_normal     = normalize(v_normal);
    vec3 light_direction    = normalize(${LIGHT_DIRECTION_UNIFORM_NAME});
    float diffuse_intensity = max(dot(surface_normal, light_direction), 0.0);
    float light_intensity   = clamp(${AMBIENT_STRENGTH_UNIFORM_NAME} + diffuse_intensity, 0.0, 1.0);
    outColor                = vec4(${COLOR_UNIFORM_NAME2} * light_intensity, ${OPACITY_UNIFORM_NAME5});
}
`;
var LambertMaterial = class extends DirectionalLightMaterial {
  /**
   * Creates a new `LambertMaterial`.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
   * @param {LambertMaterialOptions} [options]    - Material options.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`LambertMaterial` expects an options object (plain object).");
    }
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE5, FRAGMENT_SHADER_SOURCE5);
    super(webglContext, shaderProgram, options, { ownsShaderProgram: true });
  }
};

// core/material/phong-material.js
var SPECULAR_COLOR_UNIFORM_NAME = "u_specularColor";
var SPECULAR_STRENGTH_UNIFORM_NAME = "u_specularStrength";
var SHININESS_UNIFORM_NAME = "u_shininess";
var DEFAULT_SPECULAR_COLOR = new Float32Array([1, 1, 1]);
var DEFAULT_SPECULAR_STRENGTH = 1;
var DEFAULT_SHININESS = 16;
var VERTEX_SHADER_SOURCE6 = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION6}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION3}) in vec3 a_normal;
uniform mat4 ${FINAL_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME};
out vec3 v_worldPosition;
out vec3 v_normal;

void main() {
    gl_Position     = ${FINAL_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_worldPosition = (${WORLD_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0)).xyz;
    v_normal        = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME} * vec4(a_normal, 0.0)).xyz;
}
`;
var FRAGMENT_SHADER_SOURCE6 = `#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
uniform vec3  ${COLOR_UNIFORM_NAME2};
uniform vec3  ${SPECULAR_COLOR_UNIFORM_NAME};
uniform vec3  ${LIGHT_DIRECTION_UNIFORM_NAME};
uniform vec3  ${CAMERA_POSITION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME};
uniform float ${SPECULAR_STRENGTH_UNIFORM_NAME};
uniform float ${SHININESS_UNIFORM_NAME};
uniform float ${OPACITY_UNIFORM_NAME5};
out vec4 outColor;

void main() {
    vec3 surface_normal      = normalize(v_normal);
    vec3 light_direction     = normalize(${LIGHT_DIRECTION_UNIFORM_NAME});
    vec3 view_direction      = normalize(${CAMERA_POSITION_UNIFORM_NAME} - v_worldPosition);
    float diffuse_intensity  = max(dot(surface_normal, light_direction), 0.0);
    float specular_intensity = 0.0;

    if (diffuse_intensity > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, surface_normal);
        float specular_base = max(dot(view_direction, reflection_direction), 0.0);
        specular_intensity  = pow(specular_base, ${SHININESS_UNIFORM_NAME});
    }

    vec3 ambient  = ${COLOR_UNIFORM_NAME2} * ${AMBIENT_STRENGTH_UNIFORM_NAME};
    vec3 diffuse  = ${COLOR_UNIFORM_NAME2} * diffuse_intensity;
    vec3 specular = ${SPECULAR_COLOR_UNIFORM_NAME} * (specular_intensity * ${SPECULAR_STRENGTH_UNIFORM_NAME});
    vec3 rgb = ambient + diffuse + specular;
    outColor = vec4(rgb, ${OPACITY_UNIFORM_NAME5});
}
`;
var PhongMaterial = class extends DirectionalLightMaterial {
  /**
   * Specular color (RGB).
   *
   * @type {Float32Array}
   * @private
   */
  #specularColor = new Float32Array(VECTOR3_ELEMENT_COUNT);
  /**
   * Specular strength multiplier.
   *
   * @type {number}
   * @private
   */
  #specularStrength = DEFAULT_SPECULAR_STRENGTH;
  /**
   * Shininess exponent (specular power).
   *
   * @type {number}
   * @private
   */
  #shininess = DEFAULT_SHININESS;
  /**
   * Creates a new `PhongMaterial`.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
   * @param {PhongMaterialOptions} [options]      - Material options.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`PhongMaterial` expects an options object (plain object).");
    }
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE6, FRAGMENT_SHADER_SOURCE6);
    super(webglContext, shaderProgram, options, { ownsShaderProgram: true });
    this.#specularColor.set(DEFAULT_SPECULAR_COLOR);
    this.#specularStrength = DEFAULT_SPECULAR_STRENGTH;
    this.#shininess = DEFAULT_SHININESS;
    const { specularColor, specularStrength, shininess } = options;
    if (specularColor !== void 0) {
      this.setSpecularColor(specularColor);
    }
    if (specularStrength !== void 0) {
      this.setSpecularStrength(specularStrength);
    }
    if (shininess !== void 0) {
      this.setShininess(shininess);
    }
  }
  /**
   * Uploads Phong-specific uniforms (world matrix, camera position and specular settings).
   *
   * @param {Float32Array} worldMatrix    - World matrix.
   * @param {Float32Array} cameraPosition - Camera position, world space.
   * @protected
   */
  applyAdditionalUniforms(worldMatrix, cameraPosition) {
    this.shaderProgram.setMatrix4(WORLD_MATRIX_UNIFORM_NAME, worldMatrix);
    this.shaderProgram.setVector3(CAMERA_POSITION_UNIFORM_NAME, cameraPosition);
    this.shaderProgram.setVector3(SPECULAR_COLOR_UNIFORM_NAME, this.#specularColor);
    this.shaderProgram.setFloat(SPECULAR_STRENGTH_UNIFORM_NAME, this.#specularStrength);
    this.shaderProgram.setFloat(SHININESS_UNIFORM_NAME, this.#shininess);
  }
  /**
   * Sets the specular RGB color.
   *
   * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
   */
  setSpecularColor(color) {
    DirectionalLightMaterial.assertVector3("`PhongMaterial.setSpecularColor`", color);
    this.#specularColor[0] = color[0];
    this.#specularColor[1] = color[1];
    this.#specularColor[2] = color[2];
  }
  /**
   * Sets specular strength multiplier.
   *
   * @param {number} value - Specular multiplier.
   */
  setSpecularStrength(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`PhongMaterial.setSpecularStrength` expects a finite number.");
    }
    this.#specularStrength = value;
  }
  /**
   * Sets shininess exponent for the specular highlight.
   *
   * @param {number} value - Shininess exponent.
   */
  setShininess(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("`PhongMaterial.setShininess` expects a finite number.");
    }
    this.#shininess = value;
  }
  /**
   * Returns the internal specular color buffer.
   *
   * @returns {Float32Array}
   */
  get specularColor() {
    return this.#specularColor;
  }
  /**
   * @returns {number} Specular strength multiplier.
   */
  get specularStrength() {
    return this.#specularStrength;
  }
  /**
   * @returns {number} Shininess exponent.
   */
  get shininess() {
    return this.#shininess;
  }
};

// core/scene/object3d.js
var CHILD_NOT_FOUND_INDEX = -1;
var SINGLE_CHILD_REMOVE_COUNT = 1;
var MATRIX_4x4_ELEMENT_COUNT4 = 16;
var Object3D = class _Object3D {
  /** @type {Vector3} */
  #position;
  /** @type {Vector3} */
  #rotation;
  /** @type {Vector3} */
  #scale;
  /** @type {Object3D | null} */
  #parent;
  /** @type {Object3D[]} */
  #children;
  /** @type {Float32Array} */
  #localMatrix;
  /** @type {Float32Array} */
  #worldMatrix;
  /** @type {boolean} */
  #isLocalMatrixDirty = true;
  /** @type {boolean} */
  #isWorldMatrixDirty = true;
  constructor() {
    this.#parent = null;
    this.#children = [];
    this.#localMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT4);
    this.#worldMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT4);
    _Object3D.#setIdentityMatrix(this.#localMatrix);
    _Object3D.#setIdentityMatrix(this.#worldMatrix);
    this.#position = Vector3.createZero(() => this.#markTransformDirty());
    this.#rotation = Vector3.createZero(() => this.#markTransformDirty());
    this.#scale = Vector3.createUnitScale(() => this.#markTransformDirty());
  }
  /** @returns {Vector3} */
  get position() {
    return this.#position;
  }
  /** @returns {Vector3} */
  get rotation() {
    return this.#rotation;
  }
  /** @returns {Vector3} */
  get scale() {
    return this.#scale;
  }
  /** @returns {Object3D | null} */
  get parent() {
    return this.#parent;
  }
  /** @returns {Object3D[]} */
  get children() {
    return this.#children;
  }
  /** @returns {Float32Array} */
  get worldMatrix() {
    return this.#worldMatrix;
  }
  /**
   * @param {Object3D} child - Child node to attach to this object (re-parented if it already has a parent).
   */
  add(child) {
    if (!(child instanceof _Object3D)) {
      throw new TypeError("Object3D.add expects an Object3D instance.");
    }
    if (child.#parent === this) {
      return;
    }
    if (child.#parent) {
      child.#parent.remove(child);
    }
    child.#parent = this;
    child.#isWorldMatrixDirty = true;
    this.#children.push(child);
  }
  /**
   * @param {Object3D} child - Child node to detach from this object (no-op if the child is not attached here).
   */
  remove(child) {
    if (!(child instanceof _Object3D)) {
      throw new TypeError("Object3D.remove expects an Object3D instance.");
    }
    const index = this.#children.indexOf(child);
    if (index === CHILD_NOT_FOUND_INDEX) {
      return;
    }
    this.#children.splice(index, SINGLE_CHILD_REMOVE_COUNT);
    child.#parent = null;
    child.#isWorldMatrixDirty = true;
  }
  /**
   * @param {Float32Array | null} parentWorldMatrix - Parent world matrix, or null when updating a root node.
   */
  updateWorldMatrix(parentWorldMatrix) {
    if (parentWorldMatrix !== null && !(parentWorldMatrix instanceof Float32Array)) {
      throw new TypeError("Object3D.updateWorldMatrix expects a Float32Array or null.");
    }
    this.#updateWorldMatrixRecursive(parentWorldMatrix, false);
  }
  /**
   * @param {function(Object3D): void} callback - Visitor function called for this object and all descendants (depth-first).
   */
  traverse(callback) {
    if (typeof callback !== "function") {
      throw new TypeError("Object3D.traverse expects a function callback.");
    }
    callback(this);
    for (let index = 0; index < this.#children.length; index += 1) {
      this.#children[index].traverse(callback);
    }
  }
  /** @private */
  #markTransformDirty() {
    this.#isLocalMatrixDirty = true;
    this.#isWorldMatrixDirty = true;
  }
  /**
   * @param {Float32Array | null} parentWorldMatrix - Parent world matrix, or null for the root.
   * @param {boolean} parentWorldDirty              - Whether the parent world matrix was recomputed in this update pass.
   * @private
   */
  #updateWorldMatrixRecursive(parentWorldMatrix, parentWorldDirty) {
    if (this.#isLocalMatrixDirty) {
      this.#updateLocalMatrix();
      this.#isLocalMatrixDirty = false;
      this.#isWorldMatrixDirty = true;
    }
    const shouldUpdateWorld = this.#isWorldMatrixDirty || parentWorldDirty;
    if (shouldUpdateWorld) {
      if (parentWorldMatrix !== null) {
        Matrix4.multiplyTo(this.#worldMatrix, parentWorldMatrix, this.#localMatrix);
      } else {
        this.#worldMatrix.set(this.#localMatrix);
      }
      this.#isWorldMatrixDirty = false;
    }
    for (let index = 0; index < this.#children.length; index += 1) {
      this.#children[index].#updateWorldMatrixRecursive(this.#worldMatrix, shouldUpdateWorld);
    }
  }
  /**
   * Recomputes local matrix into existing buffer (no allocations).
   *
   * @private
   */
  #updateLocalMatrix() {
    const positionX = this.#position.x;
    const positionY = this.#position.y;
    const positionZ = this.#position.z;
    const rotationX = this.#rotation.x;
    const rotationY = this.#rotation.y;
    const rotationZ = this.#rotation.z;
    const scaleX = this.#scale.x;
    const scaleY = this.#scale.y;
    const scaleZ = this.#scale.z;
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);
    const rot00 = cosZ * cosY;
    const rot01 = cosZ * sinY * sinX - sinZ * cosX;
    const rot02 = cosZ * sinY * cosX + sinZ * sinX;
    const rot10 = sinZ * cosY;
    const rot11 = sinZ * sinY * sinX + cosZ * cosX;
    const rot12 = sinZ * sinY * cosX - cosZ * sinX;
    const rot20 = -sinY;
    const rot21 = cosY * sinX;
    const rot22 = cosY * cosX;
    const out = this.#localMatrix;
    out[0] = rot00 * scaleX;
    out[1] = rot10 * scaleX;
    out[2] = rot20 * scaleX;
    out[3] = 0;
    out[4] = rot01 * scaleY;
    out[5] = rot11 * scaleY;
    out[6] = rot21 * scaleY;
    out[7] = 0;
    out[8] = rot02 * scaleZ;
    out[9] = rot12 * scaleZ;
    out[10] = rot22 * scaleZ;
    out[11] = 0;
    out[12] = positionX;
    out[13] = positionY;
    out[14] = positionZ;
    out[15] = 1;
  }
  /**
   * @param {Float32Array} out - Output 4x4 matrix buffer that will be overwritten with the identity matrix.
   * @private
   */
  static #setIdentityMatrix(out) {
    for (let index = 0; index < MATRIX_4x4_ELEMENT_COUNT4; index += 1) {
      out[index] = 0;
    }
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
  }
};

// core/scene/mesh.js
var DEFAULT_OWNS_GEOMETRY = true;
var DEFAULT_OWNS_MATERIAL = true;
var Mesh = class extends Object3D {
  /**
   * Geometry used by this mesh (vertex/index buffers, VAO).
   *
   * @type {Geometry}
   * @private
   */
  #geometry;
  /**
   * Material used by this mesh (shader program + render state + uniforms).
   *
   * @type {Material}
   * @private
   */
  #material;
  /**
   * When true, `Mesh.dispose()` will dispose the geometry. Use false for shared geometries.
   *
   * @type {boolean}
   * @private
   */
  #ownsGeometry;
  /**
   * When true, `Mesh.dispose()` will dispose the material.
   * Use false when material (and its textures) is shared between meshes.
   *
   * @type {boolean}
   * @private
   */
  #ownsMaterial;
  /**
   * Indicates whether this mesh has been disposed. Disposed meshes should not be rendered.
   *
   * @type {boolean}
   * @private
   */
  #isDisposed = false;
  /**
   * @param {Geometry} geometry                       - Geometry, that provides vertex and index buffers for this mesh.
   * @param {Material} material                       - Material, that defines how the geometry should be shaded and rendered.
   * @param {MeshOwnershipOptions} [ownershipOptions] - Ownership flags for geometry/material.
   */
  constructor(geometry, material, ownershipOptions = {}) {
    super();
    if (!(geometry instanceof Geometry)) {
      throw new TypeError("Mesh constructor expects a Geometry instance.");
    }
    if (!(material instanceof Material)) {
      throw new TypeError("Mesh constructor expects a Material instance.");
    }
    if (ownershipOptions === null || typeof ownershipOptions !== "object" || Array.isArray(ownershipOptions)) {
      throw new TypeError("Mesh constructor expects `ownershipOptions` as a plain object.");
    }
    const {
      ownsGeometry = DEFAULT_OWNS_GEOMETRY,
      ownsMaterial = DEFAULT_OWNS_MATERIAL
    } = ownershipOptions;
    if (typeof ownsGeometry !== "boolean") {
      throw new TypeError("Mesh constructor option `ownsGeometry` must be a boolean.");
    }
    if (typeof ownsMaterial !== "boolean") {
      throw new TypeError("Mesh constructor option `ownsMaterial` must be a boolean.");
    }
    this.#geometry = geometry;
    this.#material = material;
    this.#ownsGeometry = ownsGeometry;
    this.#ownsMaterial = ownsMaterial;
  }
  /**
   * Releases GPU resources owned by this mesh (geometry and/or material).
   * After dispose, the mesh can remain as a scene object, but it should not be rendered.
   * Important ownership rule, if `ownsMaterial=false`, `Mesh.dispose()` must NOT dispose the material (and its textures).
   */
  dispose() {
    if (this.#isDisposed) {
      return;
    }
    if (this.#ownsGeometry) {
      this.#geometry.dispose();
    }
    if (this.#ownsMaterial) {
      this.#material.dispose();
    }
    this.#isDisposed = true;
  }
  /**
   * @returns {Geometry}
   */
  get geometry() {
    return this.#geometry;
  }
  /**
   * @returns {Material}
   */
  get material() {
    return this.#material;
  }
  /**
   * @returns {boolean}
   */
  get ownsGeometry() {
    return this.#ownsGeometry;
  }
  /**
   * @returns {boolean}
   */
  get ownsMaterial() {
    return this.#ownsMaterial;
  }
  /**
   * @returns {boolean}
   */
  get isDisposed() {
    return this.#isDisposed;
  }
};

// core/scene/scene.js
var Scene = class extends Object3D {
  constructor() {
    super();
  }
};

// core/scene/camera.js
var MATRIX_4x4_ELEMENT_COUNT5 = 16;
var Camera = class extends Object3D {
  /**
   * Cached view matrix buffer. Reused between frames to avoid allocations.
   *
   * @type {Float32Array}
   * @private
   */
  #viewMatrix;
  /**
   * Cached local `position X` component used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedPositionX = Number.NaN;
  /**
   * Cached local `position Y` component used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedPositionY = Number.NaN;
  /**
   * Cached local `position Z` component used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedPositionZ = Number.NaN;
  /**
   * Cached local `rotation X` component (radians) used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedRotationX = Number.NaN;
  /**
   * Cached local `rotation Y` component (radians) used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedRotationY = Number.NaN;
  /**
   * Cached local `rotation Z` component (radians) used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedRotationZ = Number.NaN;
  /**
   * Cached local `scale X` component used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedScaleX = Number.NaN;
  /**
   * Cached local `scale Y` component used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedScaleY = Number.NaN;
  /**
   * Cached local `scale Z` component used to detect transform changes.
   *
   * @type {number}
   * @private
   */
  #cachedScaleZ = Number.NaN;
  constructor() {
    super();
    this.#viewMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT5);
  }
  /**
   * Returns the view matrix (inverse of camera local TRS transform).
   * The returned matrix is cached and reused between calls.
   *
   * @returns {Float32Array} - Cached view matrix.
   */
  getViewMatrix() {
    this.#updateViewMatrixIfRequired();
    return this.#viewMatrix;
  }
  /**
   * Returns the projection matrix for this camera.
   * Derived camera classes must implement this method.
   *
   * @throws {Error} Always throws in the base class.
   * @returns {Float32Array} - Projection matrix.
   */
  getProjectionMatrix() {
    throw new Error("`Camera.getProjectionMatrix` must be implemented in a derived camera class.");
  }
  /**
   * Updates the camera aspect ratio (width/height).
   * Base camera class does not define, how aspect ratio affects the projection.
   *
   * @param {number} aspectRatio - New viewport aspect ratio.
   */
  setAspectRatio(aspectRatio) {
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`Camera.setAspectRatio` expects `aspectRatio` as a number.");
    }
    throw new Error("`Camera.setAspectRatio` must be implemented in a derived camera class.");
  }
  /**
   * Recomputes the view matrix only, when local transform changes since the last call.
   *
   * @private
   */
  #updateViewMatrixIfRequired() {
    const position = this.position;
    const rotation = this.rotation;
    const scale = this.scale;
    const isViewDirty = this.#isTransformChanged(position, rotation, scale);
    if (isViewDirty === true) {
      CameraMath.writeViewMatrixTo(this.#viewMatrix, position, rotation, scale);
      this.#cacheTransform(position, rotation, scale);
    }
  }
  /**
   * Checks whether the local transform has changed, since the last cached snapshot.
   *
   * @param {Object} position - Camera position vector.
   * @param {Object} rotation - Camera rotation vector in radians.
   * @param {Object} scale    - Camera scale vector.
   * @returns {boolean}       - True, when local transform differs from cached snapshot.
   * @private
   */
  #isTransformChanged(position, rotation, scale) {
    if (this.#isPositionChanged(position) === true) {
      return true;
    }
    if (this.#isRotationChanged(rotation) === true) {
      return true;
    }
    if (this.#isScaleChanged(scale) === true) {
      return true;
    }
    return false;
  }
  /* eslint-disable indent */
  /**
   * @param {Object} position - Position vector.
   * @returns {boolean}       - True, when local position differs from the cached snapshot.
   * @private
   */
  #isPositionChanged(position) {
    return position.x !== this.#cachedPositionX || position.y !== this.#cachedPositionY || position.z !== this.#cachedPositionZ;
  }
  /**
   * @param {Object} rotation - Rotation vector.
   * @returns {boolean}       - True, when local rotation differs from the cached snapshot.
   * @private
   */
  #isRotationChanged(rotation) {
    return rotation.x !== this.#cachedRotationX || rotation.y !== this.#cachedRotationY || rotation.z !== this.#cachedRotationZ;
  }
  /**
   * @param {Object} scale - Scale vector.
   * @returns {boolean}    - True, when local scale differs from the cached snapshot.
   * @private
   */
  #isScaleChanged(scale) {
    return scale.x !== this.#cachedScaleX || scale.y !== this.#cachedScaleY || scale.z !== this.#cachedScaleZ;
  }
  /* eslint-enable indent */
  /**
   * Stores the current local transform components as a cached snapshot for future comparisons.
   *
   * @param {Object} position - Position vector.
   * @param {Object} rotation - Rotation vector.
   * @param {Object} scale    - Scale vector.
   * @private
   */
  #cacheTransform(position, rotation, scale) {
    this.#cachedPositionX = position.x;
    this.#cachedPositionY = position.y;
    this.#cachedPositionZ = position.z;
    this.#cachedRotationX = rotation.x;
    this.#cachedRotationY = rotation.y;
    this.#cachedRotationZ = rotation.z;
    this.#cachedScaleX = scale.x;
    this.#cachedScaleY = scale.y;
    this.#cachedScaleZ = scale.z;
  }
};

// core/scene/perspective-camera.js
var MINIMUM_NEAR_CLIP_DISTANCE2 = 0;
var MINIMUM_ASPECT_RATIO2 = 0;
var MATRIX_4x4_ELEMENT_COUNT6 = 16;
var PerspectiveCamera = class extends Camera {
  /**
   * Vertical field of view in radians.
   *
   * @type {number}
   * @private
   */
  #fieldOfViewRadians;
  /**
   * Viewport aspect ratio (width / height).
   *
   * @type {number}
   * @private
   */
  #aspectRatio;
  /**
   * Distance to the near clipping plane.
   *
   * @type {number}
   * @private
   */
  #near;
  /**
   * Distance to the far clipping plane.
   *
   * @type {number}
   * @private
   */
  #far;
  /**
   * Cached projection matrix buffer.
   * The buffer is reused between frames to avoid allocations.
   *
   * @type {Float32Array}
   * @private
   */
  #projectionMatrix;
  /**
   * When true, projection matrix must be recomputed.
   *
   * @type {boolean}
   * @private
   */
  #isProjectionMatrixDirty = true;
  /**
   * @param {number} fieldOfViewRadians - Vertical field of view in radians.
   * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
   * @param {number} near               - Distance to the near clipping plane (must be greater, than 0).
   * @param {number} far                - Distance to the far clipping plane (must be greater, than near).
   */
  constructor(fieldOfViewRadians, aspectRatio, near, far) {
    super();
    if (typeof fieldOfViewRadians !== "number") {
      throw new TypeError("`PerspectiveCamera` expects `fieldOfViewRadians` as a number.");
    }
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`PerspectiveCamera` expects `aspectRatio` as a number.");
    }
    if (typeof near !== "number") {
      throw new TypeError("`PerspectiveCamera` expects `near` as a number.");
    }
    if (typeof far !== "number") {
      throw new TypeError("`PerspectiveCamera` expects `far` as a number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO2) {
      throw new RangeError("`PerspectiveCamera` expects a positive `aspect ratio`.");
    }
    if (near <= MINIMUM_NEAR_CLIP_DISTANCE2 || far <= near) {
      throw new RangeError("`PerspectiveCamera` expects `0 < near < far`.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#projectionMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT6);
  }
  /**
   * Updates the aspect ratio and marks projection cache as dirty.
   *
   * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
   */
  setAspectRatio(aspectRatio) {
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`PerspectiveCamera.setAspectRatio` expects `aspectRatio` as a number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO2) {
      throw new RangeError("`PerspectiveCamera.setAspectRatio` expects a positive number.");
    }
    if (aspectRatio === this.#aspectRatio) {
      return;
    }
    this.#aspectRatio = aspectRatio;
    this.#isProjectionMatrixDirty = true;
  }
  /**
   * Returns the projection matrix for this camera. The returned matrix is cached and reused between calls.
   *
   * @returns {Float32Array} - Cached projection matrix.
   */
  getProjectionMatrix() {
    if (this.#isProjectionMatrixDirty === true) {
      CameraMath.writePerspectiveMatrixTo(
        this.#projectionMatrix,
        this.#fieldOfViewRadians,
        this.#aspectRatio,
        this.#near,
        this.#far
      );
      this.#isProjectionMatrixDirty = false;
    }
    return this.#projectionMatrix;
  }
};

// core/scene/orthographic-camera.js
var MATRIX_4x4_ELEMENT_COUNT7 = 16;
var MINIMUM_ASPECT_RATIO3 = 0;
var MINIMUM_VIEW_SIZE = 0;
var HALF_MULTIPLIER = 0.5;
var OrthographicCamera = class extends Camera {
  /**
   * Projection bounds: left plane.
   *
   * @type {number}
   * @private
   */
  #left;
  /**
   * Projection bounds: right plane.
   *
   * @type {number}
   * @private
   */
  #right;
  /**
   * Projection bounds: bottom plane.
   *
   * @type {number}
   * @private
   */
  #bottom;
  /**
   * Projection bounds: top plane.
   *
   * @type {number}
   * @private
   */
  #top;
  /**
   * Near clipping plane distance.
   *
   * @type {number}
   * @private
   */
  #near;
  /**
   * Far clipping plane distance.
   *
   * @type {number}
   * @private
   */
  #far;
  /**
   * When not null, camera uses view-size mode.
   * Represents the height of the orthographic volume in world units.
   *
   * @type {number | null}
   * @private
   */
  #viewSize = null;
  /**
   * Aspect ratio used in view-size mode (width / height).
   *
   * @type {number}
   * @private
   */
  #aspectRatio = 1;
  /**
   * Cached projection matrix buffer.
   * Reused between frames to avoid allocations.
   *
   * @type {Float32Array}
   * @private
   */
  #projectionMatrix;
  /**
   * When true, projection matrix must be recomputed.
   *
   * @type {boolean}
   * @private
   */
  #isProjectionMatrixDirty = true;
  /**
   * Creates an orthographic camera.
   *
   * @param {number | Object} leftOrOptions - Either left bound (number) or an options object.
   * @param {number} [right]                - Right bound (explicit bounds mode).
   * @param {number} [bottom]               - Bottom bound (explicit bounds mode).
   * @param {number} [top]                  - Top bound (explicit bounds mode).
   * @param {number} [near]                 - Near clipping plane distance.
   * @param {number} [far]                  - Far clipping plane distance.
   */
  constructor(leftOrOptions, right, bottom, top, near, far) {
    super();
    this.#projectionMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT7);
    if (leftOrOptions !== null && typeof leftOrOptions === "object") {
      if (Array.isArray(leftOrOptions) === true) {
        throw new TypeError("`OrthographicCamera` expects options as a plain object, not an array.");
      }
      this.#initFromOptions(leftOrOptions);
      return;
    }
    this.#initFromBounds(
      leftOrOptions,
      right,
      bottom,
      top,
      near,
      far
    );
  }
  /**
   * Updates the aspect ratio (width / height). Only affects the camera in view-size mode.
   *
   * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
   */
  setAspectRatio(aspectRatio) {
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`OrthographicCamera.setAspectRatio` expects `aspectRatio` as a number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO3) {
      throw new RangeError("`OrthographicCamera.setAspectRatio` expects `aspectRatio` to be a positive number.");
    }
    if (this.#viewSize === null) {
      return;
    }
    if (aspectRatio === this.#aspectRatio) {
      return;
    }
    this.#aspectRatio = aspectRatio;
    this.#recomputeBoundsFromViewSize();
    this.#isProjectionMatrixDirty = true;
  }
  /**
   * Returns the projection matrix for this camera.
   * The returned matrix is cached and reused between calls.
   *
   * @returns {Float32Array} - Cached projection matrix.
   */
  getProjectionMatrix() {
    if (this.#isProjectionMatrixDirty === true) {
      CameraMath.writeOrthographicMatrixTo(
        this.#projectionMatrix,
        this.#left,
        this.#right,
        this.#bottom,
        this.#top,
        this.#near,
        this.#far
      );
      this.#isProjectionMatrixDirty = false;
    }
    return this.#projectionMatrix;
  }
  /**
   * @param {Object} options - Initialization options.
   * @private
   */
  #initFromOptions(options) {
    const hasViewSize = Object.prototype.hasOwnProperty.call(options, "viewSize");
    if (hasViewSize === true) {
      this.#initFromViewSize(
        options.viewSize,
        options.aspectRatio,
        options.near,
        options.far
      );
      return;
    }
    this.#initFromBounds(
      options.left,
      options.right,
      options.bottom,
      options.top,
      options.near,
      options.far
    );
  }
  /**
   * @param {number} left   - Left plane.
   * @param {number} right  - Right plane.
   * @param {number} bottom - Bottom plane.
   * @param {number} top    - Top plane.
   * @param {number} near   - Near clipping plane distance.
   * @param {number} far    - Far clipping plane distance.
   * @private
   */
  #initFromBounds(left, right, bottom, top, near, far) {
    if (typeof left !== "number" || typeof right !== "number" || typeof bottom !== "number" || typeof top !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("`OrthographicCamera` expects numeric arguments in bounds mode.");
    }
    if (left === right) {
      throw new RangeError("`OrthographicCamera` expects `left !== right`.");
    }
    if (bottom === top) {
      throw new RangeError("`OrthographicCamera` expects `bottom !== top`.");
    }
    if (far <= near) {
      throw new RangeError("`OrthographicCamera` expects `near < far`.");
    }
    this.#viewSize = null;
    this.#left = left;
    this.#right = right;
    this.#bottom = bottom;
    this.#top = top;
    this.#near = near;
    this.#far = far;
    this.#isProjectionMatrixDirty = true;
  }
  /**
   * @param {number} viewSize    - Height of the view volume in world units.
   * @param {number} aspectRatio - Viewport aspect ratio (width / height).
   * @param {number} near        - Near clipping plane distance.
   * @param {number} far         - Far clipping plane distance.
   * @private
   */
  #initFromViewSize(viewSize, aspectRatio, near, far) {
    if (typeof viewSize !== "number" || typeof aspectRatio !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("`OrthographicCamera` expects numeric arguments in view-size mode.");
    }
    if (viewSize <= MINIMUM_VIEW_SIZE) {
      throw new RangeError("`OrthographicCamera` expects `viewSize` to be a positive number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO3) {
      throw new RangeError("`OrthographicCamera` expects `aspectRatio` to be a positive number.");
    }
    if (far <= near) {
      throw new RangeError("`OrthographicCamera` expects `near < far`.");
    }
    this.#viewSize = viewSize;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#recomputeBoundsFromViewSize();
    this.#isProjectionMatrixDirty = true;
  }
  /**
   * Recomputes `left/right/top/bottom` based on current `viewSize` and `aspectRatio`.
   *
   * @private
   */
  #recomputeBoundsFromViewSize() {
    if (this.#viewSize === null) {
      throw new Error("`OrthographicCamera` internal error: `viewSize` is null in view-size mode.");
    }
    const halfHeight = this.#viewSize * HALF_MULTIPLIER;
    const halfWidth = halfHeight * this.#aspectRatio;
    this.#left = -halfWidth;
    this.#right = halfWidth;
    this.#bottom = -halfHeight;
    this.#top = halfHeight;
  }
};

// core/scene/first-person-camera.js
var DEFAULT_FIELD_OF_VIEW_DIVISOR = 4;
var DEFAULT_FIELD_OF_VIEW_RADIANS = Math.PI / DEFAULT_FIELD_OF_VIEW_DIVISOR;
var DEFAULT_ASPECT_RATIO = 1;
var DEFAULT_NEAR = 0.1;
var DEFAULT_FAR = 200;
var MINIMUM_ASPECT_RATIO4 = 0;
var MINIMUM_NEAR_CLIP_DISTANCE3 = 0;
var MATRIX_4x4_ELEMENT_COUNT8 = 16;
var FIRST_PERSON_CAMERA_MODE_NORMAL = "NORMAL";
var FIRST_PERSON_CAMERA_MODE_BOBBING = "BOBBING";
var FIRST_PERSON_CAMERA_MODES = Object.freeze({
  NORMAL: FIRST_PERSON_CAMERA_MODE_NORMAL,
  BOBBING: FIRST_PERSON_CAMERA_MODE_BOBBING
});
var FIRST_PERSON_CAMERA_MODE_SET = new Set(Object.values(FIRST_PERSON_CAMERA_MODES));
var FirstPersonCamera = class extends Camera {
  /**
   * Vertical field of view in radians.
   *
   * @type {number}
   * @private
   */
  #fieldOfViewRadians;
  /**
   * Viewport aspect ratio (width / height).
   *
   * @type {number}
   * @private
   */
  #aspectRatio;
  /**
   * Near clipping plane distance.
   *
   * @type {number}
   * @private
   */
  #near;
  /**
   * Far clipping plane distance.
   *
   * @type {number}
   * @private
   */
  #far;
  /**
   * Cached projection matrix buffer.
   * The buffer is reused between frames to avoid allocations.
   *
   * @type {Float32Array}
   * @private
   */
  #projectionMatrix;
  /**
   * When true, projection matrix must be recomputed.
   *
   * @type {boolean}
   * @private
   */
  #isProjectionMatrixDirty = true;
  /**
   * Current first-person camera mode.
   *
   * @type {string}
   * @private
   */
  #mode = FIRST_PERSON_CAMERA_MODE_NORMAL;
  /**
   * @param {FirstPersonCameraOptions} [options = {}] - Camera options.
   */
  constructor(options = {}) {
    super();
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`FirstPersonCamera` expects `options` as a plain object.");
    }
    const {
      fieldOfViewRadians = DEFAULT_FIELD_OF_VIEW_RADIANS,
      aspectRatio = DEFAULT_ASPECT_RATIO,
      near = DEFAULT_NEAR,
      far = DEFAULT_FAR,
      mode = FIRST_PERSON_CAMERA_MODE_NORMAL
    } = options;
    if (typeof fieldOfViewRadians !== "number") {
      throw new TypeError("`FirstPersonCamera` expects `fieldOfViewRadians` as a number.");
    }
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`FirstPersonCamera` expects `aspectRatio` as a number.");
    }
    if (typeof near !== "number") {
      throw new TypeError("`FirstPersonCamera` expects `near` as a number.");
    }
    if (typeof far !== "number") {
      throw new TypeError("`FirstPersonCamera` expects `far` as a number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO4) {
      throw new RangeError("`FirstPersonCamera` expects `aspectRatio` to be a positive number.");
    }
    if (near <= MINIMUM_NEAR_CLIP_DISTANCE3 || far <= near) {
      throw new RangeError("`FirstPersonCamera` expects `0 < near < far`.");
    }
    if (!FIRST_PERSON_CAMERA_MODE_SET.has(mode)) {
      throw new RangeError("`FirstPersonCamera` expects `mode` to be a valid value from `FirstPersonCamera.Modes`.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#projectionMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT8);
    this.#mode = mode;
  }
  /**
   * Supported first-person camera modes.
   *
   * @returns {{ NORMAL: string, BOBBING: string }} - Supported mode labels.
   */
  static get Modes() {
    return FIRST_PERSON_CAMERA_MODES;
  }
  /**
   * Current camera mode.
   *
   * @returns {string}
   */
  get mode() {
    return this.#mode;
  }
  /**
   * Updates the camera mode.
   *
   * @param {string} mode - New camera mode.
   */
  setMode(mode) {
    if (!FIRST_PERSON_CAMERA_MODE_SET.has(mode)) {
      throw new RangeError("`FirstPersonCamera.setMode` expects a valid mode from `FirstPersonCamera.Modes`.");
    }
    this.#mode = mode;
  }
  /**
   * @inheritdoc
   */
  getProjectionMatrix() {
    if (this.#isProjectionMatrixDirty) {
      CameraMath.writePerspectiveMatrixTo(
        this.#projectionMatrix,
        this.#fieldOfViewRadians,
        this.#aspectRatio,
        this.#near,
        this.#far
      );
      this.#isProjectionMatrixDirty = false;
    }
    return this.#projectionMatrix;
  }
  /**
   * Updates the camera aspect ratio.
   *
   * @param {number} aspectRatio - New aspect ratio.
   */
  setAspectRatio(aspectRatio) {
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`FirstPersonCamera.setAspectRatio` expects `aspectRatio` as a number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO4) {
      throw new RangeError("`FirstPersonCamera.setAspectRatio` expects a positive number.");
    }
    this.#aspectRatio = aspectRatio;
    this.#isProjectionMatrixDirty = true;
  }
};

// core/scene/third-person-camera.js
var DEFAULT_FIELD_OF_VIEW_DIVISOR2 = 4;
var DEFAULT_FIELD_OF_VIEW_RADIANS2 = Math.PI / DEFAULT_FIELD_OF_VIEW_DIVISOR2;
var DEFAULT_ASPECT_RATIO2 = 1;
var DEFAULT_NEAR2 = 0.1;
var DEFAULT_FAR2 = 200;
var MINIMUM_ASPECT_RATIO5 = 0;
var MINIMUM_NEAR_CLIP_DISTANCE4 = 0;
var MATRIX_4x4_ELEMENT_COUNT9 = 16;
var THIRD_PERSON_CAMERA_MODE_NORMAL = "NORMAL";
var THIRD_PERSON_CAMERA_MODE_BOBBING = "BOBBING";
var THIRD_PERSON_CAMERA_MODES = Object.freeze({
  NORMAL: THIRD_PERSON_CAMERA_MODE_NORMAL,
  BOBBING: THIRD_PERSON_CAMERA_MODE_BOBBING
});
var THIRD_PERSON_CAMERA_MODE_SET = new Set(Object.values(THIRD_PERSON_CAMERA_MODES));
var ThirdPersonCamera = class extends Camera {
  /**
   * Vertical field of view in radians.
   *
   * @type {number}
   * @private
   */
  #fieldOfViewRadians;
  /**
   * Viewport aspect ratio (width / height).
   *
   * @type {number}
   * @private
   */
  #aspectRatio;
  /**
   * Near clipping plane distance.
   *
   * @type {number}
   * @private
   */
  #near;
  /**
   * Far clipping plane distance.
   *
   * @type {number}
   * @private
   */
  #far;
  /**
   * Cached projection matrix buffer.
   * The buffer is reused between frames to avoid allocations.
   *
   * @type {Float32Array}
   * @private
   */
  #projectionMatrix;
  /**
   * When true, projection matrix must be recomputed.
   *
   * @type {boolean}
   * @private
   */
  #isProjectionMatrixDirty = true;
  /**
   * Current third-person camera mode.
   *
   * @type {string}
   * @private
   */
  #mode = THIRD_PERSON_CAMERA_MODE_NORMAL;
  /**
   * @param {ThirdPersonCameraOptions} [options = {}] - Camera options.
   */
  constructor(options = {}) {
    super();
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`ThirdPersonCamera` expects `options` as a plain object.");
    }
    const {
      fieldOfViewRadians = DEFAULT_FIELD_OF_VIEW_RADIANS2,
      aspectRatio = DEFAULT_ASPECT_RATIO2,
      near = DEFAULT_NEAR2,
      far = DEFAULT_FAR2,
      mode = THIRD_PERSON_CAMERA_MODE_NORMAL
    } = options;
    if (typeof fieldOfViewRadians !== "number") {
      throw new TypeError("`ThirdPersonCamera` expects `fieldOfViewRadians` as a number.");
    }
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`ThirdPersonCamera` expects `aspectRatio` as a number.");
    }
    if (typeof near !== "number") {
      throw new TypeError("`ThirdPersonCamera` expects `near` as a number.");
    }
    if (typeof far !== "number") {
      throw new TypeError("`ThirdPersonCamera` expects `far` as a number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO5) {
      throw new RangeError("`ThirdPersonCamera` expects `aspectRatio` to be a positive number.");
    }
    if (near <= MINIMUM_NEAR_CLIP_DISTANCE4 || far <= near) {
      throw new RangeError("`ThirdPersonCamera` expects `0 < near < far`.");
    }
    if (!THIRD_PERSON_CAMERA_MODE_SET.has(mode)) {
      throw new RangeError("`ThirdPersonCamera` expects `mode` to be a valid value from `ThirdPersonCamera.Modes`.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#projectionMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT9);
    this.#mode = mode;
  }
  /**
   * Supported third-person camera modes.
   *
   * @returns {{ NORMAL: string, BOBBING: string }} - Supported mode labels.
   */
  static get Modes() {
    return THIRD_PERSON_CAMERA_MODES;
  }
  /**
   * Current camera mode.
   *
   * @returns {string}
   */
  get mode() {
    return this.#mode;
  }
  /**
   * Updates the camera mode.
   *
   * @param {string} mode - New camera mode.
   */
  setMode(mode) {
    if (!THIRD_PERSON_CAMERA_MODE_SET.has(mode)) {
      throw new RangeError("`ThirdPersonCamera.setMode` expects a valid mode from `ThirdPersonCamera.Modes`.");
    }
    this.#mode = mode;
  }
  /**
   * Updates the aspect ratio and marks projection cache as dirty.
   *
   * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
   */
  setAspectRatio(aspectRatio) {
    if (typeof aspectRatio !== "number") {
      throw new TypeError("`ThirdPersonCamera.setAspectRatio` expects `aspectRatio` as a number.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO5) {
      throw new RangeError("`ThirdPersonCamera.setAspectRatio` expects a positive number.");
    }
    if (aspectRatio === this.#aspectRatio) {
      return;
    }
    this.#aspectRatio = aspectRatio;
    this.#isProjectionMatrixDirty = true;
  }
  /**
   * Returns the projection matrix for this camera. The returned matrix is cached and reused between calls.
   *
   * @returns {Float32Array} - Cached projection matrix.
   */
  getProjectionMatrix() {
    if (this.#isProjectionMatrixDirty === true) {
      CameraMath.writePerspectiveMatrixTo(
        this.#projectionMatrix,
        this.#fieldOfViewRadians,
        this.#aspectRatio,
        this.#near,
        this.#far
      );
      this.#isProjectionMatrixDirty = false;
    }
    return this.#projectionMatrix;
  }
};

// core/render/renderer.js
var INDEX_BUFFER_OFFSET_BYTES = 0;
var MATRIX_4x4_ELEMENT_COUNT10 = 16;
var VECTOR3_ELEMENT_COUNT2 = 3;
var OPAQUE_OPACITY = 1;
var MATERIAL_APPLY_WORLD_MATRIX_PARAM_COUNT = 2;
var MATERIAL_APPLY_WORLD_INVERSE_TRANSPOSE_PARAM_COUNT = 3;
var MATERIAL_APPLY_CAMERA_POSITION_PARAM_COUNT = 4;
var Renderer = class {
  /**
   * Wrapper around the underlying WebGL2 rendering context.
   * @type {WebGLContext}
   * @private
   */
  #contextWrapper;
  /**
   * Raw WebGL2 rendering context.
   * @type {WebGL2RenderingContext}
   * @private
   */
  #webglRenderingContext;
  /**
   * Reused buffer for the view-projection matrix.
   * @type {Float32Array}
   * @private
   */
  #viewProjectionMatrix;
  /**
   * Reused buffer for the per-mesh final matrix (viewProjection * world).
   * @type {Float32Array}
   * @private
   */
  #finalMatrix;
  /**
   * Reused buffer for per-mesh inverse world matrix (world ^ -1).
   * Only computed when the current material requires normal-matrix support.
   *
   * @type {Float32Array}
   * @private
   */
  #worldMatrixInverse;
  /**
   * Reused buffer for per-mesh world inverse transpose matrix ((world ^ -1) ^ T).
   * Used for correct normal transformation under non-uniform scale.
   * Only computed when the current material requires normal-matrix support.
   *
   * @type {Float32Array}
   * @private
   */
  #worldInverseTransposeMatrix;
  /**
   * Reused buffer for the camera position of the current frame.
   *
   * @type {Float32Array}
   * @private
   */
  #cameraPosition;
  /**
   * Reference to the view-projection matrix of the current frame.
   * This is a pointer to a reused `Float32Array`.
   *
   * @type {Float32Array}
   * @private
   */
  #frameViewProjectionMatrix;
  /**
   * Reference to the camera position of the current frame.
   * This is a pointer to a reused `Float32Array`.
   *
   * @type {Float32Array}
   * @private
   */
  #frameCameraPosition;
  /**
   * Cached traversal callback to avoid allocating an inline function every frame.
   *
   * @type {function(Object3D): void}
   * @private
   */
  #traverseCallback;
  /**
   * @param {WebGLContext} webglContext - Wrapper around the underlying WebGL2 rendering context.
   */
  constructor(webglContext) {
    if (!(webglContext instanceof WebGLContext)) {
      throw new TypeError("Renderer expects a WebGLContext instance.");
    }
    this.#contextWrapper = webglContext;
    this.#webglRenderingContext = webglContext.context;
    this.#viewProjectionMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT10);
    this.#finalMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT10);
    this.#worldMatrixInverse = new Float32Array(MATRIX_4x4_ELEMENT_COUNT10);
    this.#worldInverseTransposeMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT10);
    this.#cameraPosition = new Float32Array(VECTOR3_ELEMENT_COUNT2);
    this.#frameViewProjectionMatrix = this.#viewProjectionMatrix;
    this.#frameCameraPosition = this.#cameraPosition;
    this.#traverseCallback = (x) => this.#renderVisitedObject(x);
  }
  /**
   * Renders the given scene from the point of view of the given camera.
   *
   * @param {Scene} scene                                - Scene graph containing all objects that should be rendered.
   * @param {Camera} camera                              - Camera defining view and projection used for rendering.
   * @param {ResizeToDisplaySizeOptions} [resizeOptions] - Optional canvas resize options.
   */
  render(scene, camera, resizeOptions) {
    if (!(scene instanceof Scene)) {
      throw new TypeError("`Renderer.render` expects a `Scene` instance.");
    }
    if (!(camera instanceof Camera)) {
      throw new TypeError("`Renderer.render` expects a `Camera` derived-instance.");
    }
    const renderingContext = this.#webglRenderingContext;
    this.#contextWrapper.resizeToDisplaySize(resizeOptions);
    this.#contextWrapper.clear();
    const canvas = renderingContext.canvas;
    const aspectRatio = canvas.width / canvas.height;
    camera.setAspectRatio(aspectRatio);
    const projectionMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    this.#frameViewProjectionMatrix = Matrix4.multiplyTo(
      this.#viewProjectionMatrix,
      projectionMatrix,
      viewMatrix
    );
    const cameraPosition = camera.position;
    this.#cameraPosition[0] = cameraPosition.x;
    this.#cameraPosition[1] = cameraPosition.y;
    this.#cameraPosition[2] = cameraPosition.z;
    this.#frameCameraPosition = this.#cameraPosition;
    scene.updateWorldMatrix(null);
    scene.traverse(this.#traverseCallback);
  }
  /**
   * Renders a single visited scene node during traversal.
   *
   * @param {Object3D} visitedObject - Visited scene node (only `Mesh` instances are rendered, they're childs from `Object3D`).
   * @private
   */
  #renderVisitedObject(visitedObject) {
    if (!(visitedObject instanceof Object3D)) {
      return;
    }
    if (!(visitedObject instanceof Mesh)) {
      return;
    }
    const mesh = visitedObject;
    if (mesh.isDisposed) {
      return;
    }
    const renderingContext = this.#webglRenderingContext;
    const geometry = mesh.geometry;
    const material = mesh.material;
    const worldMatrix = mesh.worldMatrix;
    Matrix4.multiplyTo(
      this.#finalMatrix,
      this.#frameViewProjectionMatrix,
      worldMatrix
    );
    material.use();
    const materialOpacity = material.opacity;
    const isTransparent = materialOpacity < OPAQUE_OPACITY;
    if (isTransparent) {
      renderingContext.enable(renderingContext.BLEND);
      renderingContext.blendFunc(renderingContext.SRC_ALPHA, renderingContext.ONE_MINUS_SRC_ALPHA);
      renderingContext.depthMask(false);
    } else {
      renderingContext.disable(renderingContext.BLEND);
      renderingContext.depthMask(true);
    }
    const applyParameterCount = material.apply.length;
    const wantsWorldMatrix = applyParameterCount >= MATERIAL_APPLY_WORLD_MATRIX_PARAM_COUNT;
    const wantsNormalMatrix = applyParameterCount >= MATERIAL_APPLY_WORLD_INVERSE_TRANSPOSE_PARAM_COUNT;
    const wantsCameraPosition = applyParameterCount >= MATERIAL_APPLY_CAMERA_POSITION_PARAM_COUNT;
    if (!wantsWorldMatrix) {
      material.apply(this.#finalMatrix);
    } else if (!wantsNormalMatrix) {
      material.apply(this.#finalMatrix, worldMatrix);
    } else {
      Matrix4.invertTo(this.#worldMatrixInverse, worldMatrix);
      Matrix4.transposeTo(this.#worldInverseTransposeMatrix, this.#worldMatrixInverse);
      if (!wantsCameraPosition) {
        material.apply(this.#finalMatrix, worldMatrix, this.#worldInverseTransposeMatrix);
      } else {
        material.apply(this.#finalMatrix, worldMatrix, this.#worldInverseTransposeMatrix, this.#frameCameraPosition);
      }
    }
    geometry.bind();
    const isWireframeEnabled = material.isWireframeEnabled();
    geometry.bindIndexBuffer(isWireframeEnabled);
    const mode = isWireframeEnabled ? renderingContext.LINES : renderingContext.TRIANGLES;
    const indexCount = geometry.getIndexCount(isWireframeEnabled);
    renderingContext.drawElements(
      mode,
      indexCount,
      geometry.getIndexComponentType(isWireframeEnabled),
      INDEX_BUFFER_OFFSET_BYTES
    );
  }
};

// core/engine/engine.js
var DEFAULT_FIELD_OF_VIEW_RADIANS3 = Math.PI / 4;
var DEFAULT_NEAR3 = 0.1;
var DEFAULT_FAR3 = 100;
var DEFAULT_INITIAL_CAMERA_Z = 5;
var MILLISECONDS_TO_SECONDS = 1e-3;
var DEFAULT_BOX_SIZE2 = 1;
var MIN_BOX_SIZE = 0;
var ENGINE_ANIMATION_FRAME_ID_RESET_VALUE = 0;
var ENGINE_TIME_SECONDS_RESET_VALUE = 0;
var INITIAL_CAMERA_ASPECT_RATIO = 1;
var MIN_EXCLUSIVE_NUMBER = 0;
var Engine = class {
  /**
   * WebGL context wrapper used by the engine.
   *
   * @type {WebGLContext}
   * @private
   */
  #contextWrapper;
  /**
   * Renderer instance used to draw the scene.
   *
   * @type {Renderer}
   * @private
   */
  #renderer;
  /**
   * Root scene node used by the engine.
   *
   * @type {Scene}
   * @private
   */
  #scene;
  /**
   * Active camera used by the engine renderer.
   *
   * @type {Camera}
   * @private
   */
  #camera;
  /**
   * When true, the engine uses the browser window size as the render target size source.
   * This is passed to the renderer via resize options on each frame.
   *
   * @type {boolean}
   * @private
   */
  #fitToWindow;
  /**
   * Indicates whether the `requestAnimationFrame` loop is currently running.
   *
   * @type {boolean}
   * @private
   */
  #isRunning = false;
  /**
   * Stores the active requestAnimationFrame id.
   * A reset value (usually `0`) indicates, that no frame is currently scheduled.
   *
   * @type {number}
   * @private
   */
  #requestAnimationFrameId = ENGINE_ANIMATION_FRAME_ID_RESET_VALUE;
  /**
   * Timestamp (in seconds) of the previous frame.
   * Used to compute deltaTimeSeconds.
   *
   * @type {number}
   * @private
   */
  #lastTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;
  /**
   * Start timestamp (in seconds) of the engine loop.
   * Used to compute `engineTimeSeconds`.
   *
   * @type {number}
   * @private
   */
  #startTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;
  /**
   * Optional per-frame callback invoked by `Engine.start(callback)`.
   *
   * @type {EngineFrameCallback | null}
   * @private
   */
  #frameCallback = null;
  /**
   * Cached resize options object passed to the renderer.
   * Reused between frames to avoid unnecessary allocations.
   *
   * @type {{ fitToWindow: boolean }}
   * @private
   */
  #resizeOptions = { fitToWindow: false };
  /**
   * @param {HTMLCanvasElement} canvas - Canvas used for rendering.
   * @param {EngineOptions} [options]  - Engine options.
   */
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError("Engine expects an HTMLCanvasElement.");
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("Engine expects an options object (plain object).");
    }
    const {
      fieldOfViewRadians = DEFAULT_FIELD_OF_VIEW_RADIANS3,
      near = DEFAULT_NEAR3,
      far = DEFAULT_FAR3,
      initialCameraZ = DEFAULT_INITIAL_CAMERA_Z,
      fitToWindow = false
    } = options;
    if (typeof fieldOfViewRadians !== "number" || fieldOfViewRadians <= MIN_EXCLUSIVE_NUMBER) {
      throw new RangeError("Engine option `fieldOfViewRadians` must be a positive number.");
    }
    if (typeof near !== "number" || typeof far !== "number" || near <= MIN_EXCLUSIVE_NUMBER || far <= MIN_EXCLUSIVE_NUMBER || near >= far) {
      throw new RangeError("Engine options `near` and `far` must be positive numbers and near < far.");
    }
    if (typeof initialCameraZ !== "number") {
      throw new TypeError("Engine option `initialCameraZ` must be a number.");
    }
    if (typeof fitToWindow !== "boolean") {
      throw new TypeError("Engine option `fitToWindow` must be a boolean.");
    }
    this.#fitToWindow = fitToWindow;
    this.#contextWrapper = new WebGLContext(canvas);
    this.#renderer = new Renderer(this.#contextWrapper);
    this.#scene = new Scene();
    this.#camera = new PerspectiveCamera(fieldOfViewRadians, INITIAL_CAMERA_ASPECT_RATIO, near, far);
    this.#camera.position.z = initialCameraZ;
  }
  /** @returns {WebGLContext} */
  get context() {
    return this.#contextWrapper;
  }
  /** @returns {WebGL2RenderingContext} */
  get webglRenderingContext() {
    return this.#contextWrapper.context;
  }
  /** @returns {Renderer} */
  get renderer() {
    return this.#renderer;
  }
  /** @returns {Scene} */
  get scene() {
    return this.#scene;
  }
  /** @returns {Camera} */
  get camera() {
    return this.#camera;
  }
  /**
   * Creates a box mesh using: `BoxGeometry` + `VertexColorMaterial` by default.
   *
   * Ownership rules: geometry is created internally => mesh owns geometry.
   * Material: if not provided then Mesh owns created `VertexColorMaterial`,
   * if provided then Mesh does NOT own the material (shared user resource).
   *
   * @param {CreateBoxMeshOptions} [options] - Box mesh options.
   * @returns {Mesh}
   */
  createBoxMesh(options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`Engine.createBoxMesh` expects an options object (plain object).");
    }
    const { size = DEFAULT_BOX_SIZE2, material } = options;
    if (typeof size !== "number" || size <= MIN_BOX_SIZE) {
      throw new RangeError("`Engine.createBoxMesh` option `size` must be a positive number.");
    }
    if (material !== void 0 && !(material instanceof Material)) {
      throw new TypeError("`Engine.createBoxMesh` option `material` must be a `Material` instance.");
    }
    const geometry = new BoxGeometry(this.webglRenderingContext, { size });
    const isUserMaterial = material !== void 0;
    const usedMaterial = isUserMaterial ? material : new VertexColorMaterial(this.webglRenderingContext);
    const meshOwnershipFlags = { ownsGeometry: true, ownsMaterial: !isUserMaterial };
    return new Mesh(geometry, usedMaterial, meshOwnershipFlags);
  }
  /**
   * Renders a single frame.
   */
  render() {
    this.#resizeOptions.fitToWindow = this.#fitToWindow;
    this.#renderer.render(this.#scene, this.#camera, this.#resizeOptions);
  }
  /**
   * Starts the `requestAnimationFrame` loop.
   *
   * @param {EngineFrameCallback} [frameCallback] - Optional per-frame callback.
   */
  start(frameCallback) {
    if (frameCallback !== void 0 && typeof frameCallback !== "function") {
      throw new TypeError("Engine.start expects a function callback or undefined.");
    }
    if (this.#isRunning) {
      return;
    }
    this.#isRunning = true;
    this.#frameCallback = frameCallback || null;
    this.#lastTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;
    this.#startTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;
    this.#requestAnimationFrameId = window.requestAnimationFrame((timeMs) => this.#renderFrame(timeMs));
  }
  /**
   * Stops the `requestAnimationFrame` loop.
   */
  stop() {
    if (!this.#isRunning) {
      return;
    }
    window.cancelAnimationFrame(this.#requestAnimationFrameId);
    this.#requestAnimationFrameId = ENGINE_ANIMATION_FRAME_ID_RESET_VALUE;
    this.#isRunning = false;
    this.#frameCallback = null;
  }
  /**
   * Sets the active camera used by the engine renderer.
   *
   * @param {Camera} camera - New active camera instance.
   */
  setCamera(camera) {
    if (!(camera instanceof Camera)) {
      throw new TypeError("`Engine.setCamera` expects a `Camera` instance (including the derived types).");
    }
    this.#camera = camera;
  }
  /**
   * @param {number} timeMs - `requestAnimationFrame` timestamp in milliseconds.
   * @private
   */
  #renderFrame(timeMs) {
    const timeSeconds = timeMs * MILLISECONDS_TO_SECONDS;
    if (this.#startTimeSeconds === ENGINE_TIME_SECONDS_RESET_VALUE) {
      this.#startTimeSeconds = timeSeconds;
      this.#lastTimeSeconds = timeSeconds;
    }
    const engineTimeSeconds = timeSeconds - this.#startTimeSeconds;
    const deltaTimeSeconds = timeSeconds - this.#lastTimeSeconds;
    this.#lastTimeSeconds = timeSeconds;
    if (this.#frameCallback) {
      this.#frameCallback(deltaTimeSeconds, engineTimeSeconds, this);
    }
    if (!this.#isRunning) {
      return;
    }
    this.render();
    this.#requestAnimationFrameId = window.requestAnimationFrame((nextTimeMs) => this.#renderFrame(nextTimeMs));
  }
};
function createEngine(canvas, options) {
  return new Engine(canvas, options);
}

// core/debug/fps-counter.js
var DEFAULT_LABEL = "performance";
var DEFAULT_UPDATE_INTERVAL_MS = 250;
var DEFAULT_SMOOTHING_FACTOR = 0.15;
var MIN_UPDATE_INTERVAL_MS = 16;
var MIN_NORMALIZED = 0;
var MAX_NORMALIZED = 1;
var DEFAULT_GOOD_FPS_THRESHOLD = 55;
var DEFAULT_OK_FPS_THRESHOLD = 30;
var DIV_TAG_NAME = "div";
var PLACEHOLDER_TEXT = "--";
var FPS_ROW_LABEL = "FPS";
var FRAME_TIME_ROW_LABEL = "MS";
var MILLISECONDS_PER_SECOND = 1e3;
var MIN_DENOMINATOR = 1;
var NON_NEGATIVE_MIN = 0;
var INITIAL_FRAMES_SINCE_LAST_UPDATE = 0;
var INITIAL_ACCUMULATED_FRAME_TIME_MS = 0;
var FRAMES_INCREMENT = 1;
var FPS_FALLBACK_VALUE = 0;
var FRAME_TIME_DECIMAL_PLACES = 1;
var ARIA_ROLE_STATUS = "status";
var ARIA_LIVE_POLITE = "polite";
var ROOT_CLASS = "gwFpsCounter";
var STATE_CLASS_GOOD = "gwFpsCounter-good";
var STATE_CLASS_OK = "gwFpsCounter-ok";
var STATE_CLASS_BAD = "gwFpsCounter-bad";
var HEADER_CLASS = "gwFpsCounterHeader";
var ROW_CLASS = "gwFpsCounterRow";
var ROW_LABEL_CLASS = "gwFpsCounterRowLabel";
var ROW_VALUE_CLASS = "gwFpsCounterRowValue";
var UNINITIALIZED_NUMBER = -1;
var DEFAULT_SHOW_FRAME_TIME = true;
var FpsCounter = class _FpsCounter {
  /**
   * Root DOM element.
   *
   * @type {HTMLElement}
   * @private
   */
  #domElement;
  /**
   * DOM element, that shows the FPS value.
   *
   * @type {HTMLElement}
   * @private
   */
  #fpsValueElement;
  /**
   * DOM element, that shows the frame time value (ms).
   *
   * @type {HTMLElement | null}
   * @private
   */
  #frameTimeValueElement;
  /**
   * DOM refresh interval in milliseconds.
   *
   * @type {number}
   * @private
   */
  #updateIntervalMs;
  /**
   * Exponential smoothing factor in [0..1].
   *
   * @type {number}
   * @private
   */
  #smoothingFactor;
  /**
   * When true, frame time (ms) is displayed.
   *
   * @type {boolean}
   * @private
   */
  #showFrameTime;
  /**
   * FPS value considered `good`.
   *
   * @type {number}
   * @private
   */
  #goodFpsThreshold;
  /**
   * FPS value considered `ok`.
   *
   * @type {number}
   * @private
   */
  #okFpsThreshold;
  /**
   * Frame start timestamp (ms).
   *
   * @type {number}
   * @private
   */
  #frameStartTimeMs = UNINITIALIZED_NUMBER;
  /**
   * Timestamp (ms) of the last DOM refresh.
   *
   * @type {number}
   * @private
   */
  #lastUpdateTimeMs = UNINITIALIZED_NUMBER;
  /**
   * Number of frames since the last DOM refresh.
   *
   * @type {number}
   * @private
   */
  #framesSinceLastUpdate = INITIAL_FRAMES_SINCE_LAST_UPDATE;
  /**
   * Accumulated frame time in milliseconds since the last DOM refresh.
   *
   * @type {number}
   * @private
   */
  #accumulatedFrameTimeMs = INITIAL_ACCUMULATED_FRAME_TIME_MS;
  /**
   * Smoothed FPS value.
   *
   * @type {number}
   * @private
   */
  #smoothedFps = UNINITIALIZED_NUMBER;
  /**
   * Smoothed frame time (ms).
   *
   * @type {number}
   * @private
   */
  #smoothedFrameTimeMs = UNINITIALIZED_NUMBER;
  /**
   * @param {FpsCounterOptions} [options] - Counter options.
   */
  constructor(options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`FpsCounter` expects an options object (plain object).");
    }
    const {
      label = DEFAULT_LABEL,
      updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
      smoothingFactor = DEFAULT_SMOOTHING_FACTOR,
      showFrameTime = DEFAULT_SHOW_FRAME_TIME,
      goodFpsThreshold = DEFAULT_GOOD_FPS_THRESHOLD,
      okFpsThreshold = DEFAULT_OK_FPS_THRESHOLD
    } = options;
    if (typeof label !== "string") {
      throw new TypeError("`FpsCounter` option `label` must be a string.");
    }
    if (typeof updateIntervalMs !== "number" || updateIntervalMs < MIN_UPDATE_INTERVAL_MS) {
      throw new RangeError(`\`FpsCounter\` option \`updateIntervalMs\` must be a number >= ${MIN_UPDATE_INTERVAL_MS}.`);
    }
    if (typeof smoothingFactor !== "number" || smoothingFactor < MIN_NORMALIZED || smoothingFactor > MAX_NORMALIZED) {
      throw new RangeError("`FpsCounter` option `smoothingFactor` must be a number in [0..1].");
    }
    if (typeof showFrameTime !== "boolean") {
      throw new TypeError("`FpsCounter` option `showFrameTime` must be a boolean.");
    }
    if (typeof goodFpsThreshold !== "number" || goodFpsThreshold <= NON_NEGATIVE_MIN) {
      throw new RangeError("`FpsCounter` option `goodFpsThreshold` must be a positive number.");
    }
    if (typeof okFpsThreshold !== "number" || okFpsThreshold <= NON_NEGATIVE_MIN) {
      throw new RangeError("`FpsCounter` option `okFpsThreshold` must be a positive number.");
    }
    if (okFpsThreshold > goodFpsThreshold) {
      throw new RangeError("`FpsCounter` options must satisfy: `okFpsThreshold <= goodFpsThreshold`.");
    }
    if (typeof document === "undefined") {
      throw new Error("`FpsCounter` requires a browser environment with `document` available.");
    }
    this.#updateIntervalMs = updateIntervalMs;
    this.#smoothingFactor = smoothingFactor;
    this.#showFrameTime = showFrameTime;
    this.#goodFpsThreshold = goodFpsThreshold;
    this.#okFpsThreshold = okFpsThreshold;
    this.#domElement = document.createElement(DIV_TAG_NAME);
    this.#domElement.className = `${ROOT_CLASS} ${STATE_CLASS_GOOD}`;
    this.#domElement.setAttribute("role", ARIA_ROLE_STATUS);
    this.#domElement.setAttribute("aria-live", ARIA_LIVE_POLITE);
    const headerElement = document.createElement(DIV_TAG_NAME);
    headerElement.className = HEADER_CLASS;
    headerElement.textContent = label;
    this.#domElement.appendChild(headerElement);
    const fpsRow = _FpsCounter.#createRow(FPS_ROW_LABEL, PLACEHOLDER_TEXT);
    this.#fpsValueElement = fpsRow.valueElement;
    this.#domElement.appendChild(fpsRow.rowElement);
    if (this.#showFrameTime) {
      const frameTimeRow = _FpsCounter.#createRow(FRAME_TIME_ROW_LABEL, PLACEHOLDER_TEXT);
      this.#frameTimeValueElement = frameTimeRow.valueElement;
      this.#domElement.appendChild(frameTimeRow.rowElement);
    } else {
      this.#frameTimeValueElement = null;
    }
  }
  /** @returns {HTMLElement} */
  get domElement() {
    return this.#domElement;
  }
  /**
   * Marks the beginning of a frame.
   */
  begin() {
    this.#frameStartTimeMs = performance.now();
  }
  /**
   * Marks the end of a frame.
   *
   * @returns {number} - Latest smoothed FPS value.
   */
  end() {
    const nowMs = performance.now();
    const frameStartTimeMs = this.#frameStartTimeMs === UNINITIALIZED_NUMBER ? nowMs : this.#frameStartTimeMs;
    const frameTimeMs = Math.max(NON_NEGATIVE_MIN, nowMs - frameStartTimeMs);
    this.#recordFrame(frameTimeMs, nowMs);
    this.#frameStartTimeMs = nowMs;
    return this.#smoothedFps === UNINITIALIZED_NUMBER ? FPS_FALLBACK_VALUE : this.#smoothedFps;
  }
  /**
   * Updates the counter using a known delta time.
   *
   * @param {number} deltaTimeSeconds - Time since previous frame in seconds.
   */
  update(deltaTimeSeconds) {
    if (typeof deltaTimeSeconds !== "number" || !Number.isFinite(deltaTimeSeconds) || deltaTimeSeconds < NON_NEGATIVE_MIN) {
      throw new TypeError("`FpsCounter.update` expects a non-negative finite number (seconds).");
    }
    const deltaTimeMs = deltaTimeSeconds * MILLISECONDS_PER_SECOND;
    this.#recordFrame(deltaTimeMs, performance.now());
  }
  /**
   * Resets internal counters and UI.
   */
  reset() {
    this.#frameStartTimeMs = UNINITIALIZED_NUMBER;
    this.#lastUpdateTimeMs = UNINITIALIZED_NUMBER;
    this.#framesSinceLastUpdate = INITIAL_FRAMES_SINCE_LAST_UPDATE;
    this.#accumulatedFrameTimeMs = INITIAL_ACCUMULATED_FRAME_TIME_MS;
    this.#smoothedFps = UNINITIALIZED_NUMBER;
    this.#smoothedFrameTimeMs = UNINITIALIZED_NUMBER;
    this.#fpsValueElement.textContent = PLACEHOLDER_TEXT;
    if (this.#frameTimeValueElement) {
      this.#frameTimeValueElement.textContent = PLACEHOLDER_TEXT;
    }
    this.#applyStateClass(STATE_CLASS_GOOD);
  }
  /**
   * Records a single frame measurement.
   *
   * @param {number} frameTimeMs - Frame time in milliseconds.
   * @param {number} nowMs       - Current timestamp in milliseconds.
   * @private
   */
  #recordFrame(frameTimeMs, nowMs) {
    if (this.#lastUpdateTimeMs === UNINITIALIZED_NUMBER) {
      this.#lastUpdateTimeMs = nowMs;
    }
    this.#framesSinceLastUpdate += FRAMES_INCREMENT;
    this.#accumulatedFrameTimeMs += frameTimeMs;
    const elapsedMs = nowMs - this.#lastUpdateTimeMs;
    if (elapsedMs < this.#updateIntervalMs) {
      return;
    }
    const fps = this.#framesSinceLastUpdate * MILLISECONDS_PER_SECOND / Math.max(MIN_DENOMINATOR, elapsedMs);
    const avgFrameTimeMs = this.#accumulatedFrameTimeMs / Math.max(MIN_DENOMINATOR, this.#framesSinceLastUpdate);
    this.#smoothedFps = this.#smoothValue(this.#smoothedFps, fps);
    this.#smoothedFrameTimeMs = this.#smoothValue(this.#smoothedFrameTimeMs, avgFrameTimeMs);
    this.#updateDom();
    this.#lastUpdateTimeMs = nowMs;
    this.#framesSinceLastUpdate = INITIAL_FRAMES_SINCE_LAST_UPDATE;
    this.#accumulatedFrameTimeMs = INITIAL_ACCUMULATED_FRAME_TIME_MS;
  }
  /**
   * @param {number} currentValue - Current smoothed value or `UNINITIALIZED_NUMBER`.
   * @param {number} nextValue    - New measurement.
   * @returns {number}            - Smoothed value computed using exponential moving average.
   * @private
   */
  #smoothValue(currentValue, nextValue) {
    if (currentValue === UNINITIALIZED_NUMBER) {
      return nextValue;
    }
    return currentValue + (nextValue - currentValue) * this.#smoothingFactor;
  }
  /**
   * Updates the UI using current smoothed values.
   *
   * @private
   */
  #updateDom() {
    const fps = this.#smoothedFps;
    const frameTimeMs = this.#smoothedFrameTimeMs;
    this.#fpsValueElement.textContent = String(Math.round(fps));
    if (this.#frameTimeValueElement) {
      this.#frameTimeValueElement.textContent = frameTimeMs.toFixed(FRAME_TIME_DECIMAL_PLACES);
    }
    if (fps >= this.#goodFpsThreshold) {
      this.#applyStateClass(STATE_CLASS_GOOD);
    } else if (fps >= this.#okFpsThreshold) {
      this.#applyStateClass(STATE_CLASS_OK);
    } else {
      this.#applyStateClass(STATE_CLASS_BAD);
    }
  }
  /**
   * Applies one of the state classes to the root element.
   *
   * @param {string} nextStateClass - One of: `STATE_CLASS_GOOD/OK/BAD`.
   * @private
   */
  #applyStateClass(nextStateClass) {
    this.#domElement.classList.remove(STATE_CLASS_GOOD, STATE_CLASS_OK, STATE_CLASS_BAD);
    this.#domElement.classList.add(ROOT_CLASS, nextStateClass);
  }
  /**
   * @param {string} labelText        - Left label string.
   * @param {string} initialValueText - Initial value text.
   * @returns {{ rowElement: HTMLElement, valueElement: HTMLElement }}
   * @private
   */
  static #createRow(labelText, initialValueText) {
    const rowElement = document.createElement(DIV_TAG_NAME);
    rowElement.className = ROW_CLASS;
    const labelElement = document.createElement(DIV_TAG_NAME);
    labelElement.className = ROW_LABEL_CLASS;
    labelElement.textContent = labelText;
    const valueElement = document.createElement(DIV_TAG_NAME);
    valueElement.className = ROW_VALUE_CLASS;
    valueElement.textContent = initialValueText;
    rowElement.appendChild(labelElement);
    rowElement.appendChild(valueElement);
    return { rowElement, valueElement };
  }
};

// core/loader/obj-mtl-loader.js
var COMMENT_TOKEN = "#";
var OBJ_VERTEX_TOKEN = "v";
var OBJ_TEXCOORD_TOKEN = "vt";
var OBJ_NORMAL_TOKEN = "vn";
var OBJ_FACE_TOKEN = "f";
var OBJ_MATERIAL_LIB_TOKEN = "mtllib";
var OBJ_USE_MATERIAL_TOKEN = "usemtl";
var MTL_NEW_MATERIAL_TOKEN = "newmtl";
var MTL_DIFFUSE_COLOR_TOKEN = "Kd";
var MTL_DIFFUSE_MAP_TOKEN = "map_Kd";
var MTL_OPACITY_TOKEN = "d";
var MTL_TRANSPARENCY_TOKEN = "Tr";
var OBJ_FACE_ATTRIBUTE_SEPARATOR = "/";
var DEFAULT_MATERIAL_NAME = "default";
var DEFAULT_TEXTURE_UNIT_INDEX3 = 0;
var DEFAULT_OPACITY2 = 1;
var DEFAULT_DIFFUSE_COLOR = new Float32Array([1, 1, 1]);
var DEFAULT_UV = [0, 0];
var DEFAULT_NORMAL = [0, 0, 1];
var DEFAULT_BASE_URL = "";
var SPACE_SEPARATOR = " ";
var PATH_SEPARATOR = "/";
var LINE_SPLIT_REGEX = /\s+/u;
var ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/u;
var FACE_MIN_VERTEX_COUNT = 3;
var OBJ_INDEX_OFFSET = 1;
var OBJ_INDEX_NOT_PROVIDED = -1;
var OBJ_INDEX_ZERO = 0;
var POSITION_COMPONENT_COUNT3 = 3;
var UV_COMPONENT_COUNT2 = 2;
var NORMAL_COMPONENT_COUNT2 = 3;
var FAN_FIRST_VERTEX_INDEX = 0;
var NEXT_FACE_VERTEX_OFFSET = 1;
var BASE_PATH_SLICE_OFFSET = 1;
var COLOR_COMPONENT_COUNT4 = 3;
var COMPONENT_INDEX_X = 0;
var COMPONENT_INDEX_Y = 1;
var COMPONENT_INDEX_Z = 2;
var ZERO_VALUE6 = 0;
var FIRST_INDEX = 0;
var SECOND_INDEX = 1;
var THIRD_INDEX = 2;
var FOURTH_INDEX = 3;
var NOT_FOUND_INDEX = -1;
var VERTEX_KEY_SEPARATOR = "|";
var ERROR_MISSING_POSITION_INDEX = "OBJ face vertex is missing position index.";
var DECIMAL_RADIX = 10;
var ObjMtlLoader = class _ObjMtlLoader {
  /**
   * WebGL2 rendering context used to create GPU resources.
   *
   * @type {WebGL2RenderingContext}
   * @private
   */
  #webglContext;
  /**
   * Texture unit index for textured materials.
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
   * Cache of loaded textures by URL.
   *
   * @type {Map<string, Texture2D>}
   * @private
   */
  #textureCache = /* @__PURE__ */ new Map();
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {ObjMtlLoaderOptions} [options]       - Loader options.
   */
  constructor(webglContext, options = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError("`ObjMtlLoader` expects a `WebGL2RenderingContext`.");
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`ObjMtlLoader` expects options as a plain object.");
    }
    const {
      textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX3,
      defaultColor
    } = options;
    if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE6) {
      throw new TypeError("`ObjMtlLoader` expects `textureUnitIndex` as a non-negative integer.");
    }
    if (defaultColor !== void 0) {
      if (!Array.isArray(defaultColor) && !(defaultColor instanceof Float32Array)) {
        throw new TypeError("`ObjMtlLoader` expects `defaultColor` as `number[]` or `Float32Array`.");
      }
      if (defaultColor.length !== COLOR_COMPONENT_COUNT4) {
        throw new TypeError("`ObjMtlLoader` expects `defaultColor` to have 3 components.");
      }
      this.#defaultColor.set(defaultColor);
    }
    this.#webglContext = webglContext;
    this.#textureUnitIndex = textureUnitIndex;
  }
  /**
   * Loads OBJ/MTL assets from URLs and creates meshes.
   *
   * @param {ObjMtlLoadFromUrlsOptions} options - Load options.
   * @returns {Promise<ObjMtlLoadResult>}
   */
  async loadFromUrls(options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`ObjMtlLoader.loadFromUrls` expects options as a plain object.");
    }
    const {
      objUrl,
      mtlUrl,
      baseUrl = DEFAULT_BASE_URL,
      textureBaseUrl
    } = options;
    if (typeof objUrl !== "string") {
      throw new TypeError("`ObjMtlLoader.loadFromUrls` expects `objUrl` as a string.");
    }
    if (mtlUrl !== void 0 && typeof mtlUrl !== "string") {
      throw new TypeError("`ObjMtlLoader.loadFromUrls` expects `mtlUrl` as a string, when provided.");
    }
    if (typeof baseUrl !== "string") {
      throw new TypeError("`ObjMtlLoader.loadFromUrls` expects `baseUrl` as a string.");
    }
    if (textureBaseUrl !== void 0 && typeof textureBaseUrl !== "string") {
      throw new TypeError("`ObjMtlLoader.loadFromUrls` expects `textureBaseUrl` as a string, when provided.");
    }
    const objText = await _ObjMtlLoader.#fetchText(objUrl);
    const objData = _ObjMtlLoader.#parseObj(objText);
    const resolvedBaseUrl = baseUrl || _ObjMtlLoader.#getBasePath(objUrl);
    const mtlLibrary = mtlUrl || objData.materialLibraries[FIRST_INDEX];
    let mtlData = /* @__PURE__ */ new Map();
    if (mtlLibrary) {
      const mtlBaseUrl = baseUrl || resolvedBaseUrl;
      const resolvedMtlUrl = mtlUrl ? ABSOLUTE_URL_REGEX.test(mtlLibrary) || mtlLibrary.startsWith(PATH_SEPARATOR) || mtlLibrary.startsWith(mtlBaseUrl) ? mtlLibrary : _ObjMtlLoader.#resolvePath(mtlBaseUrl, mtlLibrary) : _ObjMtlLoader.#resolvePath(resolvedBaseUrl, mtlLibrary);
      const mtlText = await _ObjMtlLoader.#fetchText(resolvedMtlUrl);
      mtlData = _ObjMtlLoader.#parseMtl(mtlText);
    }
    const resolvedTextureBase = textureBaseUrl || resolvedBaseUrl;
    return this.#buildMeshes(objData, mtlData, resolvedTextureBase);
  }
  /**
   * Fetches text content by URL.
   *
   * @param {string} url - URL to fetch.
   * @returns {Promise<string>}
   * @private
   */
  static async #fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource: ${url}`);
    }
    return response.text();
  }
  /**
   * Parses OBJ text into structured data.
   *
   * @param {string} objText - OBJ file contents.
   * @returns {{ materialLibraries: string[], groups: Map<string, ObjGroupData> }}
   * @private
   */
  static #parseObj(objText) {
    const positions = [];
    const uvs = [];
    const normals = [];
    const materialLibraries = [];
    const groups = /* @__PURE__ */ new Map();
    let currentMaterial = DEFAULT_MATERIAL_NAME;
    _ObjMtlLoader.#getOrCreateGroup(groups, currentMaterial);
    const lines = objText.split(/\r?\n/u);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
        continue;
      }
      const parts = trimmed.split(LINE_SPLIT_REGEX);
      const keyword = parts[FIRST_INDEX];
      switch (keyword) {
        case OBJ_VERTEX_TOKEN: {
          const vertex = _ObjMtlLoader.#parseFloatTriplet(parts, POSITION_COMPONENT_COUNT3);
          positions.push(...vertex);
          break;
        }
        case OBJ_TEXCOORD_TOKEN: {
          const uv = _ObjMtlLoader.#parseFloatPair(parts);
          uvs.push(...uv);
          break;
        }
        case OBJ_NORMAL_TOKEN: {
          const normal = _ObjMtlLoader.#parseFloatTriplet(parts, NORMAL_COMPONENT_COUNT2);
          normals.push(...normal);
          break;
        }
        case OBJ_MATERIAL_LIB_TOKEN: {
          const libName = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR);
          if (libName) {
            materialLibraries.push(libName);
          }
          break;
        }
        case OBJ_USE_MATERIAL_TOKEN: {
          const materialName = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR) || DEFAULT_MATERIAL_NAME;
          currentMaterial = materialName;
          _ObjMtlLoader.#getOrCreateGroup(groups, currentMaterial);
          break;
        }
        case OBJ_FACE_TOKEN: {
          _ObjMtlLoader.#parseFace(parts, positions, uvs, normals, groups.get(currentMaterial));
          break;
        }
        default:
          break;
      }
    }
    return { materialLibraries, groups };
  }
  /**
   * Parses MTL text into material definitions.
   *
   * @param {string} mtlText - MTL file contents.
   * @returns {Map<string, ParsedMtlMaterial>}
   * @private
   */
  static #parseMtl(mtlText) {
    const materials = /* @__PURE__ */ new Map();
    const lines = mtlText.split(/\r?\n/u);
    let currentMaterial = null;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
        continue;
      }
      const parts = trimmed.split(LINE_SPLIT_REGEX);
      const keyword = parts[FIRST_INDEX];
      switch (keyword) {
        case MTL_NEW_MATERIAL_TOKEN: {
          const name = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR);
          if (!name) {
            currentMaterial = null;
            break;
          }
          currentMaterial = {
            name,
            diffuseColor: new Float32Array(DEFAULT_DIFFUSE_COLOR),
            diffuseMap: null,
            opacity: DEFAULT_OPACITY2
          };
          materials.set(name, currentMaterial);
          break;
        }
        case MTL_DIFFUSE_COLOR_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const color = _ObjMtlLoader.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT4);
          currentMaterial.diffuseColor.set(color);
          break;
        }
        case MTL_DIFFUSE_MAP_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapPath = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR);
          currentMaterial.diffuseMap = mapPath || null;
          break;
        }
        case MTL_OPACITY_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const value = _ObjMtlLoader.#parseFloatValue(parts[SECOND_INDEX]);
          if (value !== null) {
            currentMaterial.opacity = value;
          }
          break;
        }
        case MTL_TRANSPARENCY_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const value = _ObjMtlLoader.#parseFloatValue(parts[SECOND_INDEX]);
          if (value !== null) {
            currentMaterial.opacity = DEFAULT_OPACITY2 - value;
          }
          break;
        }
        default:
          break;
      }
    }
    return materials;
  }
  /**
   * Creates meshes for parsed OBJ/MTL data.
   *
   * @param {{ groups: Map<string, ObjGroupData> }} objData - Parsed OBJ data.
   * @param {Map<string, ParsedMtlMaterial>} mtlData        - Parsed MTL data.
   * @param {string} textureBaseUrl                         - Base URL for textures.
   * @returns {Promise<ObjMtlLoadResult>}
   * @private
   */
  async #buildMeshes(objData, mtlData, textureBaseUrl) {
    const root = new Object3D();
    const meshes = [];
    const geometries = [];
    const materials = [];
    const textures = [];
    for (const group of objData.groups.values()) {
      if (group.indices.length === ZERO_VALUE6) {
        continue;
      }
      const positions = new Float32Array(group.positions);
      const uvs = group.hasUvs ? new Float32Array(group.uvs) : null;
      const normals = group.needsNormals ? _ObjMtlLoader.#generateNormals(positions, group.indices) : new Float32Array(group.normals);
      const geometry = new CustomGeometry(this.#webglContext, {
        positions,
        indices: group.indices,
        uvs,
        normals
      });
      const materialDefinition = mtlData.get(group.materialName) || null;
      const material = await this.#createMaterial(materialDefinition, textureBaseUrl, textures);
      const mesh = new Mesh(geometry, material);
      root.add(mesh);
      meshes.push(mesh);
      geometries.push(geometry);
      materials.push(material);
    }
    return {
      root,
      meshes,
      geometries,
      materials,
      textures
    };
  }
  /**
   * Creates a material instance based on MTL data.
   *
   * @param {ParsedMtlMaterial | null} definition - Parsed material definition.
   * @param {string} textureBaseUrl               - Base URL used for resolving textures.
   * @param {Texture2D[]} textures                - Output list of created textures.
   * @returns {Promise<SolidColorMaterial | TexturedMaterial>}
   * @private
   */
  async #createMaterial(definition, textureBaseUrl, textures) {
    const opacity = definition ? definition.opacity : DEFAULT_OPACITY2;
    if (definition && definition.diffuseMap) {
      const textureUrl = _ObjMtlLoader.#resolvePath(textureBaseUrl, definition.diffuseMap);
      const texture = await this.#getTexture(textureUrl, textures);
      const material2 = new TexturedMaterial(this.#webglContext, {
        texture,
        ownsTexture: false,
        textureUnitIndex: this.#textureUnitIndex
      });
      material2.setOpacity(opacity);
      return material2;
    }
    const color = definition ? definition.diffuseColor : this.#defaultColor;
    const material = new SolidColorMaterial(this.#webglContext, { color });
    material.setOpacity(opacity);
    return material;
  }
  /**
   * Returns cached or newly loaded texture.
   *
   * @param {string} url         - Texture URL.
   * @param {Texture2D[]} output - Output list of created textures.
   * @returns {Promise<Texture2D>}
   * @private
   */
  async #getTexture(url, output) {
    if (this.#textureCache.has(url)) {
      return this.#textureCache.get(url);
    }
    const texture = new Texture2D(this.#webglContext);
    await texture.loadFromUrl(url);
    this.#textureCache.set(url, texture);
    output.push(texture);
    return texture;
  }
  /**
   * Parses a face and appends data to the current group.
   *
   * @param {string[]} parts     - Face line parts.
   * @param {number[]} positions - Source positions.
   * @param {number[]} uvs       - Source uvs.
   * @param {number[]} normals   - Source normals.
   * @param {ObjGroupData} group - Target group data.
   * @private
   */
  static #parseFace(parts, positions, uvs, normals, group) {
    const faceVertices = parts.slice(SECOND_INDEX);
    if (faceVertices.length < FACE_MIN_VERTEX_COUNT) {
      return;
    }
    const vertexIndices = faceVertices.map(
      (vertex) => _ObjMtlLoader.#resolveFaceVertex(vertex, positions, uvs, normals, group)
    );
    for (let index = SECOND_INDEX; index < vertexIndices.length - NEXT_FACE_VERTEX_OFFSET; index += NEXT_FACE_VERTEX_OFFSET) {
      const firstIndex = vertexIndices[FAN_FIRST_VERTEX_INDEX];
      const secondIndex = vertexIndices[index];
      const thirdIndex = vertexIndices[index + NEXT_FACE_VERTEX_OFFSET];
      group.indices.push(firstIndex, secondIndex, thirdIndex);
    }
  }
  /**
   * Resolves a face vertex and appends data to group buffers.
   *
   * @param {string} vertexData  - Face vertex string.
   * @param {number[]} positions - Source positions.
   * @param {number[]} uvs       - Source uvs.
   * @param {number[]} normals   - Source normals.
   * @param {ObjGroupData} group - Target group data.
   * @returns {number}           - Index of the resolved vertex.
   * @private
   */
  static #resolveFaceVertex(vertexData, positions, uvs, normals, group) {
    const indices = vertexData.split(OBJ_FACE_ATTRIBUTE_SEPARATOR);
    const positionIndex = _ObjMtlLoader.#parseIndex(indices[FIRST_INDEX], positions.length / POSITION_COMPONENT_COUNT3);
    const uvIndex = _ObjMtlLoader.#parseIndex(indices[SECOND_INDEX], uvs.length / UV_COMPONENT_COUNT2);
    const normalIndex = _ObjMtlLoader.#parseIndex(indices[THIRD_INDEX], normals.length / NORMAL_COMPONENT_COUNT2);
    if (positionIndex === OBJ_INDEX_NOT_PROVIDED) {
      throw new Error(ERROR_MISSING_POSITION_INDEX);
    }
    const vertexKey = _ObjMtlLoader.#buildVertexKey(positionIndex, uvIndex, normalIndex);
    if (group.vertexMap.has(vertexKey)) {
      return group.vertexMap.get(vertexKey);
    }
    const vertexIndex = group.positions.length / POSITION_COMPONENT_COUNT3;
    group.vertexMap.set(vertexKey, vertexIndex);
    _ObjMtlLoader.#appendPosition(positions, positionIndex, group.positions);
    _ObjMtlLoader.#appendUv(uvs, uvIndex, group);
    _ObjMtlLoader.#appendNormal(normals, normalIndex, group);
    return vertexIndex;
  }
  /**
   * Parses an OBJ index string into a zero-based index.
   *
   * @param {string} value     - OBJ index string.
   * @param {number} maxLength - Maximum element count.
   * @returns {number}
   * @private
   */
  static #parseIndex(value, maxLength) {
    if (!value) {
      return OBJ_INDEX_NOT_PROVIDED;
    }
    const indexValue = Number.parseInt(value, DECIMAL_RADIX);
    if (maxLength === ZERO_VALUE6) {
      return OBJ_INDEX_NOT_PROVIDED;
    }
    if (Number.isNaN(indexValue) || indexValue === OBJ_INDEX_ZERO) {
      return OBJ_INDEX_NOT_PROVIDED;
    }
    if (indexValue > ZERO_VALUE6) {
      return indexValue - OBJ_INDEX_OFFSET;
    }
    return maxLength + indexValue;
  }
  /**
   * Appends a position to the target buffer.
   *
   * @param {number[]} sourcePositions - Source positions.
   * @param {number} index             - Position index.
   * @param {number[]} target          - Target positions buffer.
   * @private
   */
  static #appendPosition(sourcePositions, index, target) {
    const baseIndex = index * POSITION_COMPONENT_COUNT3;
    target.push(
      sourcePositions[baseIndex + COMPONENT_INDEX_X],
      sourcePositions[baseIndex + COMPONENT_INDEX_Y],
      sourcePositions[baseIndex + COMPONENT_INDEX_Z]
    );
  }
  /**
   * Appends a UV to the target buffer.
   *
   * @param {number[]} sourceUvs - Source UVs.
   * @param {number} index       - UV index.
   * @param {ObjGroupData} group - Group data.
   * @private
   */
  static #appendUv(sourceUvs, index, group) {
    if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE6 && index * UV_COMPONENT_COUNT2 < sourceUvs.length) {
      const baseIndex = index * UV_COMPONENT_COUNT2;
      group.uvs.push(sourceUvs[baseIndex + COMPONENT_INDEX_X], sourceUvs[baseIndex + COMPONENT_INDEX_Y]);
      group.hasUvs = true;
      return;
    }
    group.uvs.push(DEFAULT_UV[COMPONENT_INDEX_X], DEFAULT_UV[COMPONENT_INDEX_Y]);
  }
  /**
   * Appends a normal to the target buffer.
   *
   * @param {number[]} sourceNormals - Source normals.
   * @param {number} index           - Normal index.
   * @param {ObjGroupData} group     - Group data.
   * @private
   */
  static #appendNormal(sourceNormals, index, group) {
    if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE6 && index * NORMAL_COMPONENT_COUNT2 < sourceNormals.length) {
      const baseIndex = index * NORMAL_COMPONENT_COUNT2;
      group.normals.push(
        sourceNormals[baseIndex + COMPONENT_INDEX_X],
        sourceNormals[baseIndex + COMPONENT_INDEX_Y],
        sourceNormals[baseIndex + COMPONENT_INDEX_Z]
      );
      return;
    }
    group.needsNormals = true;
    group.normals.push(DEFAULT_NORMAL[COMPONENT_INDEX_X], DEFAULT_NORMAL[COMPONENT_INDEX_Y], DEFAULT_NORMAL[COMPONENT_INDEX_Z]);
  }
  /**
   * Generates vertex normals, when missing.
   *
   * @param {Float32Array} positions - Vertex positions.
   * @param {number[]} indices       - Triangle indices.
   * @returns {Float32Array}
   * @private
   */
  static #generateNormals(positions, indices) {
    const normalBuffer = new Float32Array(positions.length);
    for (let index = ZERO_VALUE6; index < indices.length; index += NORMAL_COMPONENT_COUNT2) {
      const indexA = indices[index + COMPONENT_INDEX_X] * POSITION_COMPONENT_COUNT3;
      const indexB = indices[index + COMPONENT_INDEX_Y] * POSITION_COMPONENT_COUNT3;
      const indexC = indices[index + COMPONENT_INDEX_Z] * POSITION_COMPONENT_COUNT3;
      const ax = positions[indexA + COMPONENT_INDEX_X];
      const ay = positions[indexA + COMPONENT_INDEX_Y];
      const az = positions[indexA + COMPONENT_INDEX_Z];
      const bx = positions[indexB + COMPONENT_INDEX_X];
      const by = positions[indexB + COMPONENT_INDEX_Y];
      const bz = positions[indexB + COMPONENT_INDEX_Z];
      const cx = positions[indexC + COMPONENT_INDEX_X];
      const cy = positions[indexC + COMPONENT_INDEX_Y];
      const cz = positions[indexC + COMPONENT_INDEX_Z];
      const abx = bx - ax;
      const aby = by - ay;
      const abz = bz - az;
      const acx = cx - ax;
      const acy = cy - ay;
      const acz = cz - az;
      const nx = aby * acz - abz * acy;
      const ny = abz * acx - abx * acz;
      const nz = abx * acy - aby * acx;
      normalBuffer[indexA + COMPONENT_INDEX_X] += nx;
      normalBuffer[indexA + COMPONENT_INDEX_Y] += ny;
      normalBuffer[indexA + COMPONENT_INDEX_Z] += nz;
      normalBuffer[indexB + COMPONENT_INDEX_X] += nx;
      normalBuffer[indexB + COMPONENT_INDEX_Y] += ny;
      normalBuffer[indexB + COMPONENT_INDEX_Z] += nz;
      normalBuffer[indexC + COMPONENT_INDEX_X] += nx;
      normalBuffer[indexC + COMPONENT_INDEX_Y] += ny;
      normalBuffer[indexC + COMPONENT_INDEX_Z] += nz;
    }
    for (let index = ZERO_VALUE6; index < normalBuffer.length; index += NORMAL_COMPONENT_COUNT2) {
      const nx = normalBuffer[index + COMPONENT_INDEX_X];
      const ny = normalBuffer[index + COMPONENT_INDEX_Y];
      const nz = normalBuffer[index + COMPONENT_INDEX_Z];
      const length = Math.hypot(nx, ny, nz);
      if (length > ZERO_VALUE6) {
        normalBuffer[index + COMPONENT_INDEX_X] = nx / length;
        normalBuffer[index + COMPONENT_INDEX_Y] = ny / length;
        normalBuffer[index + COMPONENT_INDEX_Z] = nz / length;
      }
    }
    return normalBuffer;
  }
  /**
   * Builds a unique vertex key from indices.
   *
   * @param {number} positionIndex - Position index.
   * @param {number} uvIndex       - UV index.
   * @param {number} normalIndex   - Normal index.
   * @returns {string}
   * @private
   */
  static #buildVertexKey(positionIndex, uvIndex, normalIndex) {
    return String(positionIndex) + VERTEX_KEY_SEPARATOR + String(uvIndex) + VERTEX_KEY_SEPARATOR + String(normalIndex);
  }
  /**
   * Creates or returns a group entry for a material.
   *
   * @param {Map<string, ObjGroupData>} groups - Group map.
   * @param {string} materialName              - Material name.
   * @returns {ObjGroupData}
   * @private
   */
  static #getOrCreateGroup(groups, materialName) {
    if (groups.has(materialName)) {
      return groups.get(materialName);
    }
    const group = {
      materialName,
      positions: [],
      uvs: [],
      normals: [],
      indices: [],
      vertexMap: /* @__PURE__ */ new Map(),
      hasUvs: false,
      needsNormals: false
    };
    groups.set(materialName, group);
    return group;
  }
  /**
   * Parses a float triplet from line parts.
   *
   * @param {string[]} parts  - Line parts.
   * @param {number} expected - Expected component count.
   * @returns {number[]}
   * @private
   */
  static #parseFloatTriplet(parts, expected) {
    if (parts.length <= expected) {
      return [ZERO_VALUE6, ZERO_VALUE6, ZERO_VALUE6];
    }
    return [
      Number.parseFloat(parts[SECOND_INDEX]),
      Number.parseFloat(parts[THIRD_INDEX]),
      Number.parseFloat(parts[FOURTH_INDEX])
    ];
  }
  /**
   * Parses a float pair from line parts.
   *
   * @param {string[]} parts - Line parts.
   * @returns {number[]}
   * @private
   */
  static #parseFloatPair(parts) {
    if (parts.length <= THIRD_INDEX) {
      return [ZERO_VALUE6, ZERO_VALUE6];
    }
    return [
      Number.parseFloat(parts[SECOND_INDEX]),
      Number.parseFloat(parts[THIRD_INDEX])
    ];
  }
  /**
   * Parses a float value from string.
   *
   * @param {string} value - String value.
   * @returns {number | null}
   * @private
   */
  static #parseFloatValue(value) {
    if (!value) {
      return null;
    }
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  /**
   * Resolves a base path from a URL string.
   *
   * @param {string} url - Input URL.
   * @returns {string}
   * @private
   */
  static #getBasePath(url) {
    const lastSlashIndex = url.lastIndexOf(PATH_SEPARATOR);
    if (lastSlashIndex === NOT_FOUND_INDEX) {
      return DEFAULT_BASE_URL;
    }
    return url.slice(FIRST_INDEX, lastSlashIndex + BASE_PATH_SLICE_OFFSET);
  }
  /**
   * Resolves a relative path against a base URL.
   *
   * @param {string} baseUrl - Base URL.
   * @param {string} path    - Path to resolve.
   * @returns {string}
   * @private
   */
  static #resolvePath(baseUrl, path) {
    if (!path) {
      return baseUrl;
    }
    if (ABSOLUTE_URL_REGEX.test(path) || path.startsWith(PATH_SEPARATOR)) {
      return path;
    }
    if (!baseUrl) {
      return path;
    }
    return baseUrl + path;
  }
};

// core/controls/orbit-controls.js
var DEFAULT_TARGET_X = 0;
var DEFAULT_TARGET_Y = 0;
var DEFAULT_TARGET_Z = 0;
var DEFAULT_DISTANCE = 6;
var DEFAULT_MIN_DISTANCE = 0.1;
var DEFAULT_MAX_DISTANCE = 1e3;
var DEFAULT_AZIMUTH_RADIANS = 0.7;
var DEFAULT_CAMERA_ROLL_RADIANS = 0;
var DEFAULT_POLAR_RADIANS = -0.6;
var DEFAULT_MIN_POLAR_RADIANS = -1.5;
var DEFAULT_MAX_POLAR_RADIANS = 1.5;
var DEFAULT_ROTATION_SPEED = 1;
var DEFAULT_ZOOM_SPEED = 1;
var ROTATE_BUTTON = 0;
var ROTATION_RADIANS_PER_PIXEL = 5e-3;
var WHEEL_DISTANCE_MULTIPLIER = 0.01;
var WHEEL_LISTENER_OPTIONS = { passive: false };
var POINTER_ID_RESET_VALUE = -1;
var OrbitControls = class _OrbitControls {
  /**
   * Controlled camera instance.
   *
   * @type {Camera}
   * @private
   */
  #camera;
  /**
   * DOM element that receives pointer/wheel input (usually the canvas).
   *
   * @type {HTMLElement}
   * @private
   */
  #element;
  /**
   * Orbit target (point in world space that the camera looks at).
   *
   * Changing the returned vector via `.target.x = ...` will automatically mark controls as dirty.
   *
   * @type {Vector3}
   * @private
   */
  #target;
  /**
   * Orbit distance from the target.
   *
   * @type {number}
   * @private
   */
  #distance;
  /**
   * Minimum orbit distance.
   *
   * @type {number}
   * @private
   */
  #minDistance;
  /**
   * Maximum orbit distance.
   *
   * @type {number}
   * @private
   */
  #maxDistance;
  /**
   * Azimuth angle (yaw) in radians.
   *
   * @type {number}
   * @private
   */
  #azimuthRadians;
  /**
   * Polar angle (pitch) in radians.
   *
   * @type {number}
   * @private
   */
  #polarRadians;
  /**
   * Minimum allowed polar angle (pitch) in radians.
   *
   * @type {number}
   * @private
   */
  #minPolarRadians;
  /**
   * Maximum allowed polar angle (pitch) in radians.
   *
   * @type {number}
   * @private
   */
  #maxPolarRadians;
  /**
   * Rotation speed multiplier.
   *
   * @type {number}
   * @private
   */
  #rotationSpeed;
  /**
   * Zoom speed multiplier.
   *
   * @type {number}
   * @private
   */
  #zoomSpeed;
  /**
   * True when controls need to recompute camera transform.
   *
   * @type {boolean}
   * @private
   */
  #isDirty = true;
  /**
   * Captured pointer id used during dragging.
   *
   * @type {number}
   * @private
   */
  #capturedPointerId = POINTER_ID_RESET_VALUE;
  /**
   * Previous pointer X position in client pixels.
   *
   * @type {number}
   * @private
   */
  #previousPointerX = 0;
  /**
   * Previous pointer Y position in client pixels.
   *
   * @type {number}
   * @private
   */
  #previousPointerY = 0;
  /**
   * Cached pointerdown handler reference used for `removeEventListener`.
   *
   * @type {function(PointerEvent): void}
   * @private
   */
  #onPointerDown;
  /**
   * Cached pointermove handler reference used for `removeEventListener`.
   *
   * @type {function(PointerEvent): void}
   * @private
   */
  #onPointerMove;
  /**
   * Cached pointerup handler reference used for `removeEventListener`.
   *
   * @type {function(PointerEvent): void}
   * @private
   */
  #onPointerUp;
  /**
   * Cached wheel handler reference used for `removeEventListener`.
   *
   * @type {function(WheelEvent): void}
   * @private
   */
  #onWheel;
  /**
   * Cached contextmenu handler reference used for `removeEventListener`.
   *
   * @type {function(MouseEvent): void}
   * @private
   */
  #onContextMenu;
  /**
   * @param {Camera}      camera                         - Controlled camera instance.
   * @param {HTMLElement} element                        - DOM element that receives input (usually the canvas).
   * @param {Object}      [options]                      - Orbit options (plain object).
   * @param {number}      [options.targetX=0]            - Orbit target X component.
   * @param {number}      [options.targetY=0]            - Orbit target Y component.
   * @param {number}      [options.targetZ=0]            - Orbit target Z component.
   * @param {number}      [options.distance=6]           - Orbit distance from the target.
   * @param {number}      [options.minDistance=0.1]      - Minimum orbit distance.
   * @param {number}      [options.maxDistance=1000]     - Maximum orbit distance.
   * @param {number}      [options.azimuthRadians=0.7]   - Initial yaw angle in radians.
   * @param {number}      [options.polarRadians=-0.6]    - Initial pitch angle in radians.
   * @param {number}      [options.minPolarRadians=-1.5] - Minimum pitch angle in radians.
   * @param {number}      [options.maxPolarRadians=1.5]  - Maximum pitch angle in radians.
   * @param {number}      [options.rotationSpeed=1.0]    - Rotation speed multiplier.
   * @param {number}      [options.zoomSpeed=1.0]        - Zoom speed multiplier.
   */
  constructor(camera, element, options = {}) {
    if (!(camera instanceof Camera)) {
      throw new TypeError("`OrbitControls` expects `camera` as a `Camera` derived-instance.");
    }
    if (!(element instanceof HTMLElement)) {
      throw new TypeError("`OrbitControls` expects `element` as an `HTMLElement`.");
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`OrbitControls` expects `options` as a plain object.");
    }
    const {
      targetX = DEFAULT_TARGET_X,
      targetY = DEFAULT_TARGET_Y,
      targetZ = DEFAULT_TARGET_Z,
      distance = DEFAULT_DISTANCE,
      minDistance = DEFAULT_MIN_DISTANCE,
      maxDistance = DEFAULT_MAX_DISTANCE,
      azimuthRadians = DEFAULT_AZIMUTH_RADIANS,
      polarRadians = DEFAULT_POLAR_RADIANS,
      minPolarRadians = DEFAULT_MIN_POLAR_RADIANS,
      maxPolarRadians = DEFAULT_MAX_POLAR_RADIANS,
      rotationSpeed = DEFAULT_ROTATION_SPEED,
      zoomSpeed = DEFAULT_ZOOM_SPEED
    } = options;
    if (typeof targetX !== "number" || typeof targetY !== "number" || typeof targetZ !== "number") {
      throw new TypeError("`OrbitControls` options: `targetX/Y/Z` must be numbers.");
    }
    if (typeof distance !== "number" || typeof minDistance !== "number" || typeof maxDistance !== "number") {
      throw new TypeError("`OrbitControls` options: `distance/minDistance/maxDistance` must be numbers.");
    }
    if (distance <= 0 || minDistance <= 0 || maxDistance <= 0) {
      throw new RangeError("`OrbitControls` options: `distance/minDistance/maxDistance` must be positive numbers.");
    }
    if (minDistance > maxDistance) {
      throw new RangeError("`OrbitControls` options: `minDistance` must be less or equal to `maxDistance`.");
    }
    if (typeof azimuthRadians !== "number" || typeof polarRadians !== "number" || typeof minPolarRadians !== "number" || typeof maxPolarRadians !== "number") {
      throw new TypeError("`OrbitControls` options: angle values must be numbers.");
    }
    if (minPolarRadians > maxPolarRadians) {
      throw new RangeError("`OrbitControls` options: `minPolarRadians` must be less or equal to `maxPolarRadians`.");
    }
    if (typeof rotationSpeed !== "number" || rotationSpeed <= 0) {
      throw new RangeError("`OrbitControls` options: `rotationSpeed` must be a positive number.");
    }
    if (typeof zoomSpeed !== "number" || zoomSpeed <= 0) {
      throw new RangeError("`OrbitControls` options: `zoomSpeed` must be a positive number.");
    }
    this.#camera = camera;
    this.#element = element;
    this.#target = new Vector3(targetX, targetY, targetZ, () => this.#markDirty());
    this.#distance = _OrbitControls.#clamp(distance, minDistance, maxDistance);
    this.#minDistance = minDistance;
    this.#maxDistance = maxDistance;
    this.#azimuthRadians = azimuthRadians;
    this.#polarRadians = _OrbitControls.#clamp(polarRadians, minPolarRadians, maxPolarRadians);
    this.#minPolarRadians = minPolarRadians;
    this.#maxPolarRadians = maxPolarRadians;
    this.#rotationSpeed = rotationSpeed;
    this.#zoomSpeed = zoomSpeed;
    this.#element.style.touchAction = "none";
    this.#onPointerDown = (event) => this.#handlePointerDown(event);
    this.#onPointerMove = (event) => this.#handlePointerMove(event);
    this.#onPointerUp = (event) => this.#handlePointerUp(event);
    this.#onWheel = (event) => this.#handleWheel(event);
    this.#onContextMenu = (event) => event.preventDefault();
    this.#element.addEventListener("pointerdown", this.#onPointerDown);
    window.addEventListener("pointermove", this.#onPointerMove);
    window.addEventListener("pointerup", this.#onPointerUp);
    this.#element.addEventListener("wheel", this.#onWheel, WHEEL_LISTENER_OPTIONS);
    this.#element.addEventListener("contextmenu", this.#onContextMenu);
  }
  /**
   * Orbit target (the point camera looks at).
   *
   * @returns {Vector3} - Mutable target vector (changes mark controls as dirty).
   */
  get target() {
    return this.#target;
  }
  /**
   * Current orbit distance.
   *
   * @returns {number} - Distance value in world units.
   */
  get distance() {
    return this.#distance;
  }
  /**
   * Sets orbit target components.
   *
   * @param {number} x - Target X component.
   * @param {number} y - Target Y component.
   * @param {number} z - Target Z component.
   */
  setTarget(x, y, z) {
    if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") {
      throw new TypeError("`OrbitControls.setTarget` expects numeric `x/y/z` components.");
    }
    this.#target.set(x, y, z);
    this.#markDirty();
  }
  /**
   * Replaces the controlled camera.
   *
   * @param {Camera} camera - New controlled camera instance.
   */
  setCamera(camera) {
    if (!(camera instanceof Camera)) {
      throw new TypeError("`OrbitControls.setCamera` expects a `Camera` derived-instance.");
    }
    this.#camera = camera;
    this.#markDirty();
  }
  /**
   * Applies the current orbit state to the camera (position + rotation).
   */
  update() {
    if (this.#isDirty !== true) {
      return;
    }
    const target = this.#target;
    const distance = this.#distance;
    const azimuth = this.#azimuthRadians;
    const polar = this.#polarRadians;
    const cosPolar = Math.cos(polar);
    const sinPolar = Math.sin(polar);
    const sinAzimuth = Math.sin(azimuth);
    const cosAzimuth = Math.cos(azimuth);
    const cameraX = target.x + sinAzimuth * cosPolar * distance;
    const cameraY = target.y - sinPolar * distance;
    const cameraZ = target.z + cosAzimuth * cosPolar * distance;
    const camera = this.#camera;
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.rotation.set(polar, azimuth, DEFAULT_CAMERA_ROLL_RADIANS);
    this.#isDirty = false;
  }
  /**
   * Sets orbit distance (useful for UI sliders).
   *
   * @param {number} distance - New distance value.
   */
  setDistance(distance) {
    if (!Number.isFinite(distance)) {
      return;
    }
    this.#distance = _OrbitControls.#clamp(distance, this.#minDistance, this.#maxDistance);
    this.#markDirty();
  }
  /**
   * Disposes the controller by removing all event listeners.
   */
  dispose() {
    this.#element.removeEventListener("pointerdown", this.#onPointerDown);
    window.removeEventListener("pointermove", this.#onPointerMove);
    window.removeEventListener("pointerup", this.#onPointerUp);
    this.#element.removeEventListener("wheel", this.#onWheel, WHEEL_LISTENER_OPTIONS);
    this.#element.removeEventListener("contextmenu", this.#onContextMenu);
    this.#capturedPointerId = POINTER_ID_RESET_VALUE;
  }
  /**
   * @private
   */
  #markDirty() {
    this.#isDirty = true;
  }
  /**
   * @param {PointerEvent} event - Pointer event.
   * @private
   */
  #handlePointerDown(event) {
    if (event.button !== ROTATE_BUTTON) {
      return;
    }
    if (this.#capturedPointerId !== POINTER_ID_RESET_VALUE) {
      return;
    }
    this.#capturedPointerId = event.pointerId;
    this.#previousPointerX = event.clientX;
    this.#previousPointerY = event.clientY;
    this.#element.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  /**
   * @param {PointerEvent} event - Pointer event.
   * @private
   */
  #handlePointerMove(event) {
    if (event.pointerId !== this.#capturedPointerId) {
      return;
    }
    const deltaX = event.clientX - this.#previousPointerX;
    const deltaY = event.clientY - this.#previousPointerY;
    this.#previousPointerX = event.clientX;
    this.#previousPointerY = event.clientY;
    const rotationStep = ROTATION_RADIANS_PER_PIXEL * this.#rotationSpeed;
    this.#azimuthRadians -= deltaX * rotationStep;
    this.#polarRadians -= deltaY * rotationStep;
    this.#polarRadians = _OrbitControls.#clamp(
      this.#polarRadians,
      this.#minPolarRadians,
      this.#maxPolarRadians
    );
    this.#markDirty();
    event.preventDefault();
  }
  /**
   * @param {PointerEvent} event - Pointer event.
   * @private
   */
  #handlePointerUp(event) {
    if (event.pointerId !== this.#capturedPointerId) {
      return;
    }
    this.#capturedPointerId = POINTER_ID_RESET_VALUE;
    event.preventDefault();
  }
  /**
   * @param {WheelEvent} event - Wheel event.
   * @private
   */
  #handleWheel(event) {
    const delta = event.deltaY;
    if (typeof delta !== "number") {
      return;
    }
    const distanceDelta = delta * this.#zoomSpeed * WHEEL_DISTANCE_MULTIPLIER;
    const nextDistance = this.#distance + distanceDelta;
    this.#distance = _OrbitControls.#clamp(nextDistance, this.#minDistance, this.#maxDistance);
    this.#markDirty();
    event.preventDefault();
  }
  /**
   * @param {number} value - Value to clamp.
   * @param {number} min   - Inclusive lower bound.
   * @param {number} max   - Inclusive upper bound.
   * @returns {number}     - Clamped value.
   * @private
   */
  static #clamp(value, min, max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
};

// core/controls/keyboard-controls.js
var DEFAULT_GROUND_Y = 0;
var DEFAULT_AZIMUTH_RADIANS2 = 0;
var DEFAULT_POLAR_RADIANS2 = -0.35;
var DEFAULT_MIN_POLAR_RADIANS2 = -1.25;
var DEFAULT_MAX_POLAR_RADIANS2 = 0.55;
var DEFAULT_ROTATION_SPEED2 = 1;
var DEFAULT_MOVE_SPEED = 3;
var DEFAULT_RUN_SPEED_MULTIPLIER = 1.8;
var DEFAULT_JUMP_SPEED = 4.2;
var DEFAULT_GRAVITY_ACCELERATION = 9.8;
var ROTATION_RADIANS_PER_PIXEL2 = 5e-3;
var DEFAULT_BOBBING_AMPLITUDE_WALK = 0.05;
var DEFAULT_BOBBING_AMPLITUDE_RUN = 0.09;
var DEFAULT_BOBBING_FREQUENCY_WALK = 9;
var DEFAULT_BOBBING_FREQUENCY_RUN = 13;
var DEFAULT_BOBBING_PITCH_AMPLITUDE_RADIANS = 0.02;
var ROTATE_POINTER_BUTTON = 0;
var POINTER_ID_RESET_VALUE2 = -1;
var ACTION_FORWARD = "forward";
var ACTION_BACKWARD = "backward";
var ACTION_LEFT = "left";
var ACTION_RIGHT = "right";
var ACTION_RUN = "run";
var ACTION_JUMP = "jump";
var ACTIONS = Object.freeze({
  FORWARD: ACTION_FORWARD,
  BACKWARD: ACTION_BACKWARD,
  LEFT: ACTION_LEFT,
  RIGHT: ACTION_RIGHT,
  RUN: ACTION_RUN,
  JUMP: ACTION_JUMP
});
var KEY_CODES = Object.freeze({
  FORWARD: "KeyW",
  BACKWARD: "KeyS",
  LEFT: "KeyA",
  RIGHT: "KeyD",
  RUN: "ShiftLeft",
  JUMP: "Space"
});
var EVENT_KEYDOWN = "keydown";
var EVENT_KEYUP = "keyup";
var EVENT_POINTERDOWN = "pointerdown";
var EVENT_POINTERMOVE = "pointermove";
var EVENT_POINTERUP = "pointerup";
var EVENT_CONTEXT_MENU = "contextmenu";
var EVENT_WINDOW_BLUR = "blur";
var TOUCH_ACTION_NONE = "none";
var INPUT_FORWARD = 1;
var INPUT_BACKWARD = -1;
var INPUT_NONE = 0;
var SPEED_SCALE_DEFAULT = 1;
var INPUT_EPSILON = 1e-4;
var LOOP_START_INDEX = 0;
var LOOP_INDEX_INCREMENT = 1;
var MINIMUM_NON_NEGATIVE_VALUE = 0;
var MINIMUM_POSITIVE_VALUE = 0;
var EMPTY_STRING_LENGTH = 0;
var KEY_VALUES = Object.freeze({
  FORWARD: "w",
  BACKWARD: "s",
  LEFT: "a",
  RIGHT: "d",
  RUN: "shift",
  JUMP: " ",
  SPACEBAR: "spacebar"
});
var KeyboardControls = class _KeyboardControls {
  /**
   * Controlled camera instance.
   *
   * @type {Camera}
   * @private
   */
  #camera;
  /**
   * Controlled target object (player).
   *
   * @type {Object3D}
   * @private
   */
  #target;
  /**
   * DOM element, that receives pointer input (usually the canvas).
   *
   * @type {HTMLElement}
   * @private
   */
  #element;
  /**
   * Controls class name for error messages.
   *
   * @type {string}
   * @private
   */
  #controlsName;
  /**
   * Required camera constructor for validation.
   *
   * @type {Function}
   * @private
   */
  #cameraConstructor;
  /**
   * Camera mode value, that enables bobbing.
   *
   * @type {string | null}
   * @private
   */
  #bobbingMode;
  /**
   * Ground Y coordinate for landing.
   *
   * @type {number}
   * @private
   */
  #groundY;
  /**
   * Azimuth angle (yaw) in radians.
   *
   * @type {number}
   * @private
   */
  #azimuthRadians;
  /**
   * Polar angle (pitch) in radians.
   *
   * @type {number}
   * @private
   */
  #polarRadians;
  /**
   * Minimum allowed polar angle in radians.
   *
   * @type {number}
   * @private
   */
  #minPolarRadians;
  /**
   * Maximum allowed polar angle in radians.
   *
   * @type {number}
   * @private
   */
  #maxPolarRadians;
  /**
   * Rotation speed multiplier.
   *
   * @type {number}
   * @private
   */
  #rotationSpeed;
  /**
   * Base movement speed (walking).
   *
   * @type {number}
   * @private
   */
  #moveSpeed;
  /**
   * Running speed multiplier.
   *
   * @type {number}
   * @private
   */
  #runSpeedMultiplier;
  /**
   * Jump velocity.
   *
   * @type {number}
   * @private
   */
  #jumpSpeed;
  /**
   * Gravity acceleration magnitude.
   *
   * @type {number}
   * @private
   */
  #gravity;
  /**
   * Current vertical velocity.
   *
   * @type {number}
   * @private
   */
  #verticalVelocity = INPUT_NONE;
  /**
   * True when the target is grounded.
   *
   * @type {boolean}
   * @private
   */
  #isGrounded = true;
  /**
   * Camera bobbing height while walking.
   *
   * @type {number}
   * @private
   */
  #bobbingAmplitudeWalk;
  /**
   * Camera bobbing height while running.
   *
   * @type {number}
   * @private
   */
  #bobbingAmplitudeRun;
  /**
   * Camera bobbing angular speed while walking.
   *
   * @type {number}
   * @private
   */
  #bobbingFrequencyWalk;
  /**
   * Camera bobbing angular speed while running.
   *
   * @type {number}
   * @private
   */
  #bobbingFrequencyRun;
  /**
   * Camera pitch bobbing amplitude in radians.
   *
   * @type {number}
   * @private
   */
  #bobbingPitchAmplitude;
  /**
   * Current bobbing phase in radians.
   *
   * @type {number}
   * @private
   */
  #bobbingPhase = INPUT_NONE;
  /**
   * Current camera bobbing offset.
   *
   * @type {number}
   * @private
   */
  #bobbingOffset = INPUT_NONE;
  /**
   * Action states map.
   *
   * @type {Map<string, boolean>}
   * @private
   */
  #actionStates = /* @__PURE__ */ new Map();
  /**
   * Captured pointer id used during dragging.
   *
   * @type {number}
   * @private
   */
  #capturedPointerId = POINTER_ID_RESET_VALUE2;
  /**
   * Previous pointer X position in client pixels.
   *
   * @type {number}
   * @private
   */
  #previousPointerX = INPUT_NONE;
  /**
   * Previous pointer Y position in client pixels.
   *
   * @type {number}
   * @private
   */
  #previousPointerY = INPUT_NONE;
  /**
   * True when input listeners are enabled.
   *
   * @type {boolean}
   * @private
   */
  #isEnabled = true;
  /**
   * Cached pointerdown handler reference used for `removeEventListener`.
   *
   * @type {function(PointerEvent): void}
   * @private
   */
  #onPointerDown;
  /**
   * Cached pointermove handler reference used for `removeEventListener`.
   *
   * @type {function(PointerEvent): void}
   * @private
   */
  #onPointerMove;
  /**
   * Cached pointerup handler reference used for `removeEventListener`.
   *
   * @type {function(PointerEvent): void}
   * @private
   */
  #onPointerUp;
  /**
   * Cached keydown handler reference used for `removeEventListener`.
   *
   * @type {function(KeyboardEvent): void}
   * @private
   */
  #onKeyDown;
  /**
   * Cached keyup handler reference used for `removeEventListener`.
   *
   * @type {function(KeyboardEvent): void}
   * @private
   */
  #onKeyUp;
  /**
   * Cached contextmenu handler reference used for `removeEventListener`.
   *
   * @type {function(MouseEvent): void}
   * @private
   */
  #onContextMenu;
  /**
   * Cached blur handler reference used for `removeEventListener`.
   *
   * @type {function(): void}
   * @private
   */
  #onBlur;
  /**
   * @param {Camera} camera                                     - Controlled camera.
   * @param {Object3D} target                                   - Target object, that the camera follows.
   * @param {HTMLElement} element                               - DOM element, that receives pointer input.
   * @param {KeyboardControlsOptions} [options]                 - Optional controls configuration.
   * @param {Object} [config]                                   - Internal configuration for derived controls.
   * @param {Function} [config.cameraConstructor = Camera]      - Expected camera constructor for validation.
   * @param {string} [config.controlsName = 'KeyboardControls'] - Controls class name for error messages.
   * @param {(string|null)} [config.bobbingMode = null]         - Camera mode, that enables bobbing (or null to disable).
   */
  constructor(camera, target, element, options = {}, config = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`KeyboardControls` expects `options` as a plain object.");
    }
    const {
      cameraConstructor = Camera,
      controlsName = "KeyboardControls",
      bobbingMode = null
    } = config;
    if (typeof cameraConstructor !== "function") {
      throw new TypeError("`KeyboardControls` expects `cameraConstructor` as a function.");
    }
    if (typeof controlsName !== "string" || controlsName.length === 0) {
      throw new TypeError("`KeyboardControls` expects `controlsName` as a non-empty string.");
    }
    if (!(camera instanceof cameraConstructor)) {
      throw new TypeError(`\`${controlsName}\` expects \`camera\` as a \`${cameraConstructor.name}\` instance.`);
    }
    if (!(target instanceof Object3D)) {
      throw new TypeError(`\`${controlsName}\` expects \`target\` as an \`Object3D\` instance.`);
    }
    if (!(element instanceof HTMLElement)) {
      throw new TypeError(`\`${controlsName}\` expects \`element\` as an \`HTMLElement\`.`);
    }
    if (bobbingMode !== null && typeof bobbingMode !== "string") {
      throw new TypeError("`KeyboardControls` expects `bobbingMode` as a string or null.");
    }
    const {
      groundY = DEFAULT_GROUND_Y,
      azimuthRadians = DEFAULT_AZIMUTH_RADIANS2,
      polarRadians = DEFAULT_POLAR_RADIANS2,
      minPolarRadians = DEFAULT_MIN_POLAR_RADIANS2,
      maxPolarRadians = DEFAULT_MAX_POLAR_RADIANS2,
      rotationSpeed = DEFAULT_ROTATION_SPEED2,
      moveSpeed = DEFAULT_MOVE_SPEED,
      runSpeedMultiplier = DEFAULT_RUN_SPEED_MULTIPLIER,
      jumpSpeed = DEFAULT_JUMP_SPEED,
      gravity = DEFAULT_GRAVITY_ACCELERATION,
      bobbingAmplitudeWalk = DEFAULT_BOBBING_AMPLITUDE_WALK,
      bobbingAmplitudeRun = DEFAULT_BOBBING_AMPLITUDE_RUN,
      bobbingFrequencyWalk = DEFAULT_BOBBING_FREQUENCY_WALK,
      bobbingFrequencyRun = DEFAULT_BOBBING_FREQUENCY_RUN,
      bobbingPitchAmplitudeRadians = DEFAULT_BOBBING_PITCH_AMPLITUDE_RADIANS
    } = options;
    if (typeof groundY !== "number") {
      throw new TypeError(`\`${controlsName}\` expects \`groundY\` as a number.`);
    }
    if (typeof azimuthRadians !== "number" || typeof polarRadians !== "number") {
      throw new TypeError(`\`${controlsName}\` expects \`azimuthRadians\` and \`polarRadians\` as numbers.`);
    }
    if (typeof minPolarRadians !== "number" || typeof maxPolarRadians !== "number") {
      throw new TypeError(`\`${controlsName}\` expects \`minPolarRadians\` and \`maxPolarRadians\` as numbers.`);
    }
    if (minPolarRadians > maxPolarRadians) {
      throw new RangeError(`\`${controlsName}\` expects \`minPolarRadians\` to be <= \`maxPolarRadians\`.`);
    }
    if (typeof rotationSpeed !== "number" || rotationSpeed <= MINIMUM_POSITIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`rotationSpeed\` as a positive number.`);
    }
    if (typeof moveSpeed !== "number" || moveSpeed <= MINIMUM_POSITIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`moveSpeed\` as a positive number.`);
    }
    if (typeof runSpeedMultiplier !== "number" || runSpeedMultiplier <= MINIMUM_POSITIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`runSpeedMultiplier\` as a positive number.`);
    }
    if (typeof jumpSpeed !== "number" || jumpSpeed <= MINIMUM_POSITIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`jumpSpeed\` as a positive number.`);
    }
    if (typeof gravity !== "number" || gravity <= MINIMUM_POSITIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`gravity\` as a positive number.`);
    }
    if (typeof bobbingAmplitudeWalk !== "number" || bobbingAmplitudeWalk < MINIMUM_NON_NEGATIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`bobbingAmplitudeWalk\` as a non-negative number.`);
    }
    if (typeof bobbingAmplitudeRun !== "number" || bobbingAmplitudeRun < MINIMUM_NON_NEGATIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`bobbingAmplitudeRun\` as a non-negative number.`);
    }
    if (typeof bobbingFrequencyWalk !== "number" || bobbingFrequencyWalk <= MINIMUM_POSITIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`bobbingFrequencyWalk\` as a positive number.`);
    }
    if (typeof bobbingFrequencyRun !== "number" || bobbingFrequencyRun <= MINIMUM_POSITIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`bobbingFrequencyRun\` as a positive number.`);
    }
    if (typeof bobbingPitchAmplitudeRadians !== "number" || bobbingPitchAmplitudeRadians < MINIMUM_NON_NEGATIVE_VALUE) {
      throw new RangeError(`\`${controlsName}\` expects \`bobbingPitchAmplitudeRadians\` as a non-negative number.`);
    }
    this.#camera = camera;
    this.#target = target;
    this.#element = element;
    this.#controlsName = controlsName;
    this.#cameraConstructor = cameraConstructor;
    this.#bobbingMode = bobbingMode;
    this.#groundY = groundY;
    this.#azimuthRadians = azimuthRadians;
    this.#polarRadians = _KeyboardControls.#clamp(polarRadians, minPolarRadians, maxPolarRadians);
    this.#minPolarRadians = minPolarRadians;
    this.#maxPolarRadians = maxPolarRadians;
    this.#rotationSpeed = rotationSpeed;
    this.#moveSpeed = moveSpeed;
    this.#runSpeedMultiplier = runSpeedMultiplier;
    this.#jumpSpeed = jumpSpeed;
    this.#gravity = gravity;
    this.#bobbingAmplitudeWalk = bobbingAmplitudeWalk;
    this.#bobbingAmplitudeRun = bobbingAmplitudeRun;
    this.#bobbingFrequencyWalk = bobbingFrequencyWalk;
    this.#bobbingFrequencyRun = bobbingFrequencyRun;
    this.#bobbingPitchAmplitude = bobbingPitchAmplitudeRadians;
    this.#element.style.touchAction = TOUCH_ACTION_NONE;
    this.#initActionStates();
    this.#onPointerDown = (event) => this.#handlePointerDown(event);
    this.#onPointerMove = (event) => this.#handlePointerMove(event);
    this.#onPointerUp = (event) => this.#handlePointerUp(event);
    this.#onKeyDown = (event) => this.#handleKeyDown(event);
    this.#onKeyUp = (event) => this.#handleKeyUp(event);
    this.#onContextMenu = (event) => event.preventDefault();
    this.#onBlur = () => this.#resetInputStates();
    this.#addEventListeners();
  }
  /**
   * Updates the controlled camera and target based on input and time delta.
   *
   * @param {number} deltaSeconds - Time delta in seconds.
   */
  update(deltaSeconds) {
    if (typeof deltaSeconds !== "number" || Number.isFinite(deltaSeconds) !== true) {
      throw new TypeError(`\`${this.#controlsName}.update\` expects \`deltaSeconds\` as a finite number.`);
    }
    const movement = this.#computeMovement(deltaSeconds);
    this.#applyMovement(movement, deltaSeconds);
    const cameraState = this.#computeCameraState(deltaSeconds, movement.isMoving);
    this.applyCameraTransform(movement, cameraState, this.#camera, this.#target);
  }
  /**
   * Enables or disables input listeners without destroying the controls.
   *
   * @param {boolean} enabled - True to enable input, false to disable.
   */
  setEnabled(enabled) {
    if (typeof enabled !== "boolean") {
      throw new TypeError(`\`${this.#controlsName}.setEnabled\` expects \`enabled\` as a boolean.`);
    }
    if (this.#isEnabled === enabled) {
      return;
    }
    this.#isEnabled = enabled;
    if (enabled) {
      this.#addEventListeners();
      return;
    }
    this.#removeEventListeners();
    this.#capturedPointerId = POINTER_ID_RESET_VALUE2;
    this.#resetInputStates();
  }
  /**
   * Replaces the controlled camera.
   *
   * @param {Camera} camera - New controlled camera instance.
   */
  setCamera(camera) {
    if (!(camera instanceof this.#cameraConstructor)) {
      throw new TypeError(`\`${this.#controlsName}.setCamera\` expects a \`${this.#cameraConstructor.name}\` instance.`);
    }
    this.#camera = camera;
  }
  /**
   * Replaces the target object.
   *
   * @param {Object3D} target - New target object.
   */
  setTarget(target) {
    if (!(target instanceof Object3D)) {
      throw new TypeError(`\`${this.#controlsName}.setTarget\` expects an \`Object3D\` instance.`);
    }
    this.#target = target;
  }
  /**
   * Disposes the controller by removing all event listeners.
   */
  dispose() {
    this.#removeEventListeners();
    this.#capturedPointerId = POINTER_ID_RESET_VALUE2;
    this.#resetInputStates();
    this.#isEnabled = false;
  }
  /**
   * Updates target rotation based on movement and orientation.
   *
   * @param {Object3D} target       - Controlled target.
   * @param {MovementData} movement - Movement data.
   * @param {number} azimuthRadians - Current yaw angle in radians.
   */
  updateTargetRotation(target, movement, azimuthRadians) {
    if (!(target instanceof Object3D)) {
      throw new TypeError(`\`${this.#controlsName}.updateTargetRotation\` expects \`target\` as an \`Object3D\` instance.`);
    }
    _KeyboardControls.assertMovementData(movement, `${this.#controlsName}.updateTargetRotation`);
    if (typeof azimuthRadians !== "number") {
      throw new TypeError(`\`${this.#controlsName}.updateTargetRotation\` expects \`azimuthRadians\` as a number.`);
    }
  }
  /**
   * Applies camera transforms for the active camera type.
   *
   * @param {MovementData} movement   - Movement data.
   * @param {CameraState} cameraState - Derived camera state.
   * @param {Camera} camera           - Controlled camera.
   * @param {Object3D} target         - Controlled target.
   */
  applyCameraTransform(movement, cameraState, camera, target) {
    _KeyboardControls.assertMovementData(movement, `${this.#controlsName}.applyCameraTransform`);
    _KeyboardControls.assertCameraState(cameraState, `${this.#controlsName}.applyCameraTransform`);
    if (!(camera instanceof this.#cameraConstructor)) {
      throw new TypeError(`\`${this.#controlsName}.applyCameraTransform\` expects \`camera\` as a \`${this.#cameraConstructor.name}\` instance.`);
    }
    if (!(target instanceof Object3D)) {
      throw new TypeError(`\`${this.#controlsName}.applyCameraTransform\` expects \`target\` as an \`Object3D\` instance.`);
    }
    throw new Error("`KeyboardControls.applyCameraTransform` must be implemented in a derived class.");
  }
  /**
   * Initializes action state registry.
   *
   * @private
   */
  #initActionStates() {
    const actionValues = Object.values(ACTIONS);
    for (let index = LOOP_START_INDEX; index < actionValues.length; index += LOOP_INDEX_INCREMENT) {
      this.#actionStates.set(actionValues[index], false);
    }
  }
  /**
   * Clears all action states.
   *
   * @private
   */
  #resetInputStates() {
    const entries = this.#actionStates.entries();
    for (const [action] of entries) {
      this.#actionStates.set(action, false);
    }
  }
  /**
   * Adds input event listeners.
   *
   * @private
   */
  #addEventListeners() {
    this.#element.addEventListener(EVENT_POINTERDOWN, this.#onPointerDown);
    window.addEventListener(EVENT_POINTERMOVE, this.#onPointerMove);
    window.addEventListener(EVENT_POINTERUP, this.#onPointerUp);
    window.addEventListener(EVENT_KEYDOWN, this.#onKeyDown);
    window.addEventListener(EVENT_KEYUP, this.#onKeyUp);
    this.#element.addEventListener(EVENT_CONTEXT_MENU, this.#onContextMenu);
    window.addEventListener(EVENT_WINDOW_BLUR, this.#onBlur);
  }
  /**
   * Removes input event listeners.
   *
   * @private
   */
  #removeEventListeners() {
    this.#element.removeEventListener(EVENT_POINTERDOWN, this.#onPointerDown);
    window.removeEventListener(EVENT_POINTERMOVE, this.#onPointerMove);
    window.removeEventListener(EVENT_POINTERUP, this.#onPointerUp);
    window.removeEventListener(EVENT_KEYDOWN, this.#onKeyDown);
    window.removeEventListener(EVENT_KEYUP, this.#onKeyUp);
    this.#element.removeEventListener(EVENT_CONTEXT_MENU, this.#onContextMenu);
    window.removeEventListener(EVENT_WINDOW_BLUR, this.#onBlur);
  }
  /**
   * Computes movement intent from the current action states.
   *
   * @param {number} deltaSeconds - Time delta in seconds.
   * @returns {MovementData}
   * @private
   */
  #computeMovement(deltaSeconds) {
    const forwardInput = this.#getActionValue(ACTIONS.FORWARD, ACTIONS.BACKWARD);
    const rightInput = this.#getActionValue(ACTIONS.RIGHT, ACTIONS.LEFT);
    const inputLength = Math.hypot(forwardInput, rightInput);
    const isMoving = inputLength > INPUT_EPSILON;
    const speedScale = this.#actionStates.get(ACTIONS.RUN) ? this.#runSpeedMultiplier : SPEED_SCALE_DEFAULT;
    const speed = this.#moveSpeed * speedScale * deltaSeconds;
    if (!isMoving) {
      return {
        moveX: INPUT_NONE,
        moveZ: INPUT_NONE,
        isMoving: false,
        speed
      };
    }
    const normalizedForward = forwardInput / inputLength;
    const normalizedRight = rightInput / inputLength;
    const yawSin = Math.sin(this.#azimuthRadians);
    const yawCos = Math.cos(this.#azimuthRadians);
    const forwardX = -yawSin;
    const forwardZ = -yawCos;
    const rightX = yawCos;
    const rightZ = -yawSin;
    const moveX = (forwardX * normalizedForward + rightX * normalizedRight) * speed;
    const moveZ = (forwardZ * normalizedForward + rightZ * normalizedRight) * speed;
    return {
      moveX,
      moveZ,
      isMoving: true,
      speed
    };
  }
  /**
   * Applies movement and jump physics to the target.
   *
   * @param {MovementData} movement - Movement data.
   * @param {number} deltaSeconds   - Time delta in seconds.
   * @private
   */
  #applyMovement(movement, deltaSeconds) {
    _KeyboardControls.assertMovementData(movement, `${this.#controlsName}.#applyMovement`);
    if (typeof deltaSeconds !== "number" || Number.isFinite(deltaSeconds) !== true) {
      throw new TypeError(`\`${this.#controlsName}.#applyMovement\` expects \`deltaSeconds\` as a finite number.`);
    }
    const targetPosition = this.#target.position;
    targetPosition.x += movement.moveX;
    targetPosition.z += movement.moveZ;
    this.updateTargetRotation(this.#target, movement, this.#azimuthRadians);
    if (this.#actionStates.get(ACTIONS.JUMP) && this.#isGrounded) {
      this.#verticalVelocity = this.#jumpSpeed;
      this.#isGrounded = false;
    }
    if (!this.#isGrounded) {
      this.#verticalVelocity -= this.#gravity * deltaSeconds;
      targetPosition.y += this.#verticalVelocity * deltaSeconds;
      if (targetPosition.y <= this.#groundY) {
        targetPosition.y = this.#groundY;
        this.#verticalVelocity = INPUT_NONE;
        this.#isGrounded = true;
      }
    }
  }
  /**
   * Computes bobbing offsets and pitch for the current frame.
   *
   * @param {number} deltaSeconds - Time delta in seconds.
   * @param {boolean} isMoving    - True when target is moving.
   * @returns {CameraState}
   * @private
   */
  #computeCameraState(deltaSeconds, isMoving) {
    if (typeof deltaSeconds !== "number" || Number.isFinite(deltaSeconds) !== true) {
      throw new TypeError(`\`${this.#controlsName}.#computeCameraState\` expects \`deltaSeconds\` as a finite number.`);
    }
    if (typeof isMoving !== "boolean") {
      throw new TypeError(`\`${this.#controlsName}.#computeCameraState\` expects \`isMoving\` as a boolean.`);
    }
    let bobbingOffset = INPUT_NONE;
    let bobbingPitch = INPUT_NONE;
    if (this.#bobbingMode && this.#camera.mode === this.#bobbingMode && isMoving) {
      const isRunning = this.#actionStates.get(ACTIONS.RUN);
      const frequency = isRunning ? this.#bobbingFrequencyRun : this.#bobbingFrequencyWalk;
      const amplitude = isRunning ? this.#bobbingAmplitudeRun : this.#bobbingAmplitudeWalk;
      this.#bobbingPhase += frequency * deltaSeconds;
      this.#bobbingOffset = Math.sin(this.#bobbingPhase) * amplitude;
      bobbingOffset = this.#bobbingOffset;
      bobbingPitch = Math.sin(this.#bobbingPhase) * this.#bobbingPitchAmplitude;
    } else {
      this.#bobbingPhase = INPUT_NONE;
      this.#bobbingOffset = INPUT_NONE;
    }
    return {
      azimuthRadians: this.#azimuthRadians,
      polarRadians: this.#polarRadians,
      bobbingOffset,
      bobbingPitch
    };
  }
  /**
   * Returns a signed input value based on forward/backward action states.
   *
   * @param {string} positiveAction - Action mapped to `+1`.
   * @param {string} negativeAction - Action mapped to `-1`.
   * @returns {number}              - Input value in range [-1, 1].
   * @private
   */
  #getActionValue(positiveAction, negativeAction) {
    const positive = this.#actionStates.get(positiveAction) ? INPUT_FORWARD : INPUT_NONE;
    const negative = this.#actionStates.get(negativeAction) ? INPUT_BACKWARD : INPUT_NONE;
    return positive + negative;
  }
  /**
   * @param {PointerEvent} event - Pointer event.
   * @private
   */
  #handlePointerDown(event) {
    if (event === null || typeof event !== "object") {
      throw new TypeError(`\`${this.#controlsName}.#handlePointerDown\` expects \`event\` as an object.`);
    }
    if (event.button !== ROTATE_POINTER_BUTTON) {
      return;
    }
    if (this.#capturedPointerId !== POINTER_ID_RESET_VALUE2) {
      return;
    }
    this.#capturedPointerId = event.pointerId;
    this.#previousPointerX = event.clientX;
    this.#previousPointerY = event.clientY;
    this.#element.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  /**
   * @param {PointerEvent} event - Pointer event.
   * @private
   */
  #handlePointerMove(event) {
    if (event === null || typeof event !== "object") {
      throw new TypeError(`\`${this.#controlsName}.#handlePointerMove\` expects \`event\` as an object.`);
    }
    if (event.pointerId !== this.#capturedPointerId) {
      return;
    }
    const deltaX = event.clientX - this.#previousPointerX;
    const deltaY = event.clientY - this.#previousPointerY;
    this.#previousPointerX = event.clientX;
    this.#previousPointerY = event.clientY;
    const rotationStep = ROTATION_RADIANS_PER_PIXEL2 * this.#rotationSpeed;
    this.#azimuthRadians -= deltaX * rotationStep;
    this.#polarRadians -= deltaY * rotationStep;
    this.#polarRadians = _KeyboardControls.#clamp(
      this.#polarRadians,
      this.#minPolarRadians,
      this.#maxPolarRadians
    );
    event.preventDefault();
  }
  /**
   * @param {PointerEvent} event - Pointer event.
   * @private
   */
  #handlePointerUp(event) {
    if (event === null || typeof event !== "object") {
      throw new TypeError(`\`${this.#controlsName}.#handlePointerUp\` expects \`event\` as an object.`);
    }
    if (event.pointerId !== this.#capturedPointerId) {
      return;
    }
    this.#capturedPointerId = POINTER_ID_RESET_VALUE2;
    event.preventDefault();
  }
  /**
   * @param {KeyboardEvent} event - Keyboard event.
   * @private
   */
  #handleKeyDown(event) {
    if (event === null || typeof event !== "object") {
      throw new TypeError(`\`${this.#controlsName}.#handleKeyDown\` expects \`event\` as an object.`);
    }
    const action = _KeyboardControls.#mapEventToAction(event);
    if (!action) {
      return;
    }
    this.#actionStates.set(action, true);
    event.preventDefault();
  }
  /**
   * @param {KeyboardEvent} event - Keyboard event.
   * @private
   */
  #handleKeyUp(event) {
    if (event === null || typeof event !== "object") {
      throw new TypeError(`\`${this.#controlsName}.#handleKeyUp\` expects \`event\` as an object.`);
    }
    const action = _KeyboardControls.#mapEventToAction(event);
    if (!action) {
      return;
    }
    this.#actionStates.set(action, false);
    event.preventDefault();
  }
  /**
   * Maps keyboard events to action constants.
   *
   * @param {KeyboardEvent} event - Keyboard event.
   * @returns {string | null}     - Action id or null if not mapped.
   * @private
   */
  static #mapEventToAction(event) {
    if (event === null || typeof event !== "object") {
      throw new TypeError("`KeyboardControls.#mapEventToAction` expects `event` as an object.");
    }
    if (typeof event.code === "string" && event.code.length > EMPTY_STRING_LENGTH) {
      return _KeyboardControls.#mapCodeToAction(event.code);
    }
    if (typeof event.key === "string" && event.key.length > EMPTY_STRING_LENGTH) {
      return _KeyboardControls.#mapKeyToAction(event.key);
    }
    return null;
  }
  /**
   * Maps `KeyboardEvent.key` values to actions.
   *
   * @param {string} key      - `KeyboardEvent.key` value.
   * @returns {string | null} - Action id or null, if not mapped.
   * @private
   */
  static #mapKeyToAction(key) {
    if (typeof key !== "string") {
      throw new TypeError("`KeyboardControls.#mapKeyToAction` expects `key` as a string.");
    }
    switch (key.toLowerCase()) {
      case KEY_VALUES.FORWARD:
        return ACTIONS.FORWARD;
      case KEY_VALUES.BACKWARD:
        return ACTIONS.BACKWARD;
      case KEY_VALUES.LEFT:
        return ACTIONS.LEFT;
      case KEY_VALUES.RIGHT:
        return ACTIONS.RIGHT;
      case KEY_VALUES.RUN:
        return ACTIONS.RUN;
      case KEY_VALUES.JUMP:
      case KEY_VALUES.SPACEBAR:
        return ACTIONS.JUMP;
      default:
        return null;
    }
  }
  /**
   * Maps `KeyboardEvent.code` values to actions.
   *
   * @param {string} code - KeyboardEvent.code value.
   * @returns {string | null}
   * @private
   */
  static #mapCodeToAction(code) {
    if (typeof code !== "string") {
      throw new TypeError("`KeyboardControls.#mapCodeToAction` expects `code` as a string.");
    }
    switch (code) {
      case KEY_CODES.FORWARD:
        return ACTIONS.FORWARD;
      case KEY_CODES.BACKWARD:
        return ACTIONS.BACKWARD;
      case KEY_CODES.LEFT:
        return ACTIONS.LEFT;
      case KEY_CODES.RIGHT:
        return ACTIONS.RIGHT;
      case KEY_CODES.RUN:
        return ACTIONS.RUN;
      case KEY_CODES.JUMP:
        return ACTIONS.JUMP;
      default:
        return null;
    }
  }
  /**
   * @param {number} value - Value to clamp.
   * @param {number} min   - Inclusive lower bound.
   * @param {number} max   - Inclusive upper bound.
   * @returns {number}     - Clamped value.
   * @private
   */
  static #clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  /**
   * @param {unknown} movement - Candidate movement data.
   * @param {string} context   - Error message context.
   * @returns {void}
   * @throws {TypeError} When `movement` does not match {@link MovementData}.
   */
  static assertMovementData(movement, context) {
    if (movement === null || typeof movement !== "object" || Array.isArray(movement)) {
      throw new TypeError(`\`${context}\` expects \`movement\` as an object.`);
    }
    if (typeof movement.moveX !== "number" || typeof movement.moveZ !== "number") {
      throw new TypeError(`\`${context}\` expects \`movement.moveX\` and \`movement.moveZ\` as numbers.`);
    }
    if (typeof movement.isMoving !== "boolean") {
      throw new TypeError(`\`${context}\` expects \`movement.isMoving\` as a boolean.`);
    }
    if (typeof movement.speed !== "number") {
      throw new TypeError(`\`${context}\` expects \`movement.speed\` as a number.`);
    }
  }
  /**
   * @param {unknown} cameraState - Candidate camera state.
   * @param {string} context      - Error message context.
   * @returns {void}
   * @throws {TypeError} When `cameraState` does not match {@link CameraState}.
   */
  static assertCameraState(cameraState, context) {
    if (cameraState === null || typeof cameraState !== "object" || Array.isArray(cameraState)) {
      throw new TypeError(`\`${context}\` expects \`cameraState\` as an object.`);
    }
    if (typeof cameraState.azimuthRadians !== "number" || typeof cameraState.polarRadians !== "number") {
      throw new TypeError(`\`${context}\` expects \`cameraState.azimuthRadians\` and \`cameraState.polarRadians\` as numbers.`);
    }
    if (typeof cameraState.bobbingOffset !== "number" || typeof cameraState.bobbingPitch !== "number") {
      throw new TypeError(`\`${context}\` expects \`cameraState.bobbingOffset\` and \`cameraState.bobbingPitch\` as numbers.`);
    }
  }
};

// core/controls/first-person-controls.js
var DEFAULT_EYE_HEIGHT = 1.6;
var DEFAULT_FIRST_PERSON_POLAR_RADIANS = 0;
var DEFAULT_FIRST_PERSON_MIN_POLAR_RADIANS = -1.35;
var DEFAULT_FIRST_PERSON_MAX_POLAR_RADIANS = 1.35;
var DEFAULT_CAMERA_ROLL_RADIANS2 = 0;
var DEFAULT_CONTROLS_NAME = "FirstPersonControls";
var FirstPersonControls = class extends KeyboardControls {
  /**
   * Eye height above the target.
   *
   * @type {number}
   * @private
   */
  #eyeHeight;
  /**
   * @param {FirstPersonCamera} camera                                       - Controlled first-person camera.
   * @param {Object3D} target                                                - Target object, that the camera follows.
   * @param {HTMLElement} element                                            - DOM element, that receives pointer input.
   * @param {(KeyboardControlsOptions|FirstPersonControlsOptions)} [options] - Optional controls configuration.
   */
  constructor(camera, target, element, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`FirstPersonControls` expects `options` as a plain object.");
    }
    if (!(camera instanceof FirstPersonCamera)) {
      throw new TypeError("`FirstPersonControls` expects `camera` as a `FirstPersonCamera` instance.");
    }
    if (!(target instanceof Object3D)) {
      throw new TypeError("`FirstPersonControls` expects `target` as an `Object3D` instance.");
    }
    if (!(element instanceof HTMLElement)) {
      throw new TypeError("`FirstPersonControls` expects `element` as an `HTMLElement`.");
    }
    const {
      eyeHeight = DEFAULT_EYE_HEIGHT,
      polarRadians = DEFAULT_FIRST_PERSON_POLAR_RADIANS,
      minPolarRadians = DEFAULT_FIRST_PERSON_MIN_POLAR_RADIANS,
      maxPolarRadians = DEFAULT_FIRST_PERSON_MAX_POLAR_RADIANS
    } = options;
    if (typeof eyeHeight !== "number" || eyeHeight <= 0) {
      throw new RangeError("`FirstPersonControls` expects `eyeHeight` as a positive number.");
    }
    if (typeof polarRadians !== "number") {
      throw new TypeError("`FirstPersonControls` expects `polarRadians` as a number.");
    }
    if (typeof minPolarRadians !== "number" || typeof maxPolarRadians !== "number") {
      throw new TypeError("`FirstPersonControls` expects `minPolarRadians` and `maxPolarRadians` as numbers.");
    }
    if (minPolarRadians > maxPolarRadians) {
      throw new RangeError("`FirstPersonControls` expects `minPolarRadians` to be <= `maxPolarRadians`.");
    }
    super(camera, target, element, {
      ...options,
      polarRadians,
      minPolarRadians,
      maxPolarRadians
    }, {
      cameraConstructor: FirstPersonCamera,
      controlsName: DEFAULT_CONTROLS_NAME,
      bobbingMode: FirstPersonCamera.Modes.BOBBING
    });
    this.#eyeHeight = eyeHeight;
  }
  /**
   * @override
   * @param {Object3D} target       - Controlled target.
   * @param {MovementData} movement - Movement data.
   * @param {number} azimuthRadians - Current yaw angle in radians.
   */
  updateTargetRotation(target, movement, azimuthRadians) {
    if (!(target instanceof Object3D)) {
      throw new TypeError("`FirstPersonControls.updateTargetRotation` expects `target` as an `Object3D` instance.");
    }
    KeyboardControls.assertMovementData(movement);
    if (typeof azimuthRadians !== "number") {
      throw new TypeError("`FirstPersonControls.updateTargetRotation` expects `azimuthRadians` as a number.");
    }
    target.rotation.y = azimuthRadians;
  }
  /**
   * @override
   * @param {MovementData} movement    - Movement data.
   * @param {CameraState} cameraState  - Derived camera state.
   * @param {FirstPersonCamera} camera - Controlled camera.
   * @param {Object3D} target          - Controlled target.
   */
  applyCameraTransform(movement, cameraState, camera, target) {
    KeyboardControls.assertMovementData(movement);
    KeyboardControls.assertCameraState(cameraState);
    if (!(camera instanceof FirstPersonCamera)) {
      throw new TypeError("`FirstPersonControls.applyCameraTransform` expects `camera` as a `FirstPersonCamera` instance.");
    }
    if (!(target instanceof Object3D)) {
      throw new TypeError("`FirstPersonControls.applyCameraTransform` expects `target` as an `Object3D` instance.");
    }
    const targetPosition = target.position;
    camera.position.set(
      targetPosition.x,
      targetPosition.y + this.#eyeHeight + cameraState.bobbingOffset,
      targetPosition.z
    );
    camera.rotation.set(
      cameraState.polarRadians + cameraState.bobbingPitch,
      cameraState.azimuthRadians,
      DEFAULT_CAMERA_ROLL_RADIANS2
    );
  }
};

// core/controls/third-person-controls.js
var DEFAULT_DISTANCE2 = 6;
var DEFAULT_TARGET_HEIGHT = 1.4;
var DEFAULT_CAMERA_ROLL_RADIANS3 = 0;
var MINIMUM_POSITIVE_VALUE2 = 0;
var DEFAULT_CONTROLS_NAME2 = "ThirdPersonControls";
var ThirdPersonControls = class extends KeyboardControls {
  /**
   * Camera follow distance.
   *
   * @type {number}
   * @private
   */
  #distance;
  /**
   * Look-at height offset from the target.
   *
   * @type {number}
   * @private
   */
  #targetHeight;
  /**
   * @param {ThirdPersonCamera} camera                                       - Controlled third-person camera.
   * @param {Object3D} target                                                - Target object, that the camera follows.
   * @param {HTMLElement} element                                            - DOM element, that receives pointer input.
   * @param {(KeyboardControlsOptions|ThirdPersonControlsOptions)} [options] - Optional controls configuration.
   */
  constructor(camera, target, element, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`ThirdPersonControls` expects `options` as a plain object.");
    }
    if (!(camera instanceof ThirdPersonCamera)) {
      throw new TypeError("`ThirdPersonControls` expects `camera` as a `ThirdPersonCamera` instance.");
    }
    if (!(target instanceof Object3D)) {
      throw new TypeError("`ThirdPersonControls` expects `target` as an `Object3D` instance.");
    }
    if (!(element instanceof HTMLElement)) {
      throw new TypeError("`ThirdPersonControls` expects `element` as an `HTMLElement`.");
    }
    const {
      distance = DEFAULT_DISTANCE2,
      targetHeight = DEFAULT_TARGET_HEIGHT
    } = options;
    if (typeof distance !== "number" || distance <= MINIMUM_POSITIVE_VALUE2) {
      throw new RangeError("`ThirdPersonControls` expects `distance` as a positive number.");
    }
    if (typeof targetHeight !== "number") {
      throw new TypeError("`ThirdPersonControls` expects `targetHeight` as a number.");
    }
    super(camera, target, element, options, {
      cameraConstructor: ThirdPersonCamera,
      controlsName: DEFAULT_CONTROLS_NAME2,
      bobbingMode: ThirdPersonCamera.Modes.BOBBING
    });
    this.#distance = distance;
    this.#targetHeight = targetHeight;
  }
  /**
   * @override
   * @param {Object3D} target       - Controlled target.
   * @param {MovementData} movement - Movement data.
   * @param {number} azimuthRadians - Current yaw angle in radians.
   */
  updateTargetRotation(target, movement, azimuthRadians) {
    if (!(target instanceof Object3D)) {
      throw new TypeError("`ThirdPersonControls.updateTargetRotation` expects `target` as an `Object3D` instance.");
    }
    KeyboardControls.assertMovementData(movement);
    if (typeof azimuthRadians !== "number") {
      throw new TypeError("`ThirdPersonControls.updateTargetRotation` expects `azimuthRadians` as a number.");
    }
    if (!movement.isMoving) {
      return;
    }
    const rotationY = Math.atan2(movement.moveX, movement.moveZ);
    target.rotation.y = rotationY;
  }
  /**
   * @override
   * @param {MovementData} movement    - Movement data.
   * @param {CameraState} cameraState  - Derived camera state.
   * @param {ThirdPersonCamera} camera - Controlled camera.
   * @param {Object3D} target          - Controlled target.
   */
  applyCameraTransform(movement, cameraState, camera, target) {
    KeyboardControls.assertMovementData(movement);
    KeyboardControls.assertCameraState(cameraState);
    if (!(camera instanceof ThirdPersonCamera)) {
      throw new TypeError("`ThirdPersonControls.applyCameraTransform` expects `camera` as a `ThirdPersonCamera` instance.");
    }
    if (!(target instanceof Object3D)) {
      throw new TypeError("`ThirdPersonControls.applyCameraTransform` expects `target` as an `Object3D` instance.");
    }
    const targetPosition = target.position;
    const targetX = targetPosition.x;
    const targetY = targetPosition.y + this.#targetHeight;
    const targetZ = targetPosition.z;
    const cosPolar = Math.cos(cameraState.polarRadians);
    const sinPolar = Math.sin(cameraState.polarRadians);
    const sinAzimuth = Math.sin(cameraState.azimuthRadians);
    const cosAzimuth = Math.cos(cameraState.azimuthRadians);
    const cameraX = targetX + sinAzimuth * cosPolar * this.#distance;
    const cameraY = targetY - sinPolar * this.#distance + cameraState.bobbingOffset;
    const cameraZ = targetZ + cosAzimuth * cosPolar * this.#distance;
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.rotation.set(
      cameraState.polarRadians + cameraState.bobbingPitch,
      cameraState.azimuthRadians,
      DEFAULT_CAMERA_ROLL_RADIANS3
    );
  }
};

// core/library.js
var GeraWebGL = Object.freeze({
  Engine,
  createEngine,
  // High-level building blocks:
  WebGLContext,
  Renderer,
  Scene,
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
  FirstPersonCamera,
  ThirdPersonCamera,
  Object3D,
  Mesh,
  // Grouped namespaces:
  Math: Object.freeze({
    Matrix4,
    Vector3,
    CameraMath
  }),
  Geometries: Object.freeze({
    Geometry,
    BoxGeometry,
    PlaneGeometry,
    SphereGeometry,
    TorusGeometry,
    ConeGeometry,
    PyramidGeometry,
    CustomGeometry,
    HeightmapGeometry
  }),
  Textures: Object.freeze({
    Texture2D
  }),
  Materials: Object.freeze({
    Material,
    VertexColorMaterial,
    SolidColorMaterial,
    TexturedMaterial,
    NormalMaterial,
    DirectionalLightMaterial,
    LambertMaterial,
    PhongMaterial
  }),
  Controls: Object.freeze({
    OrbitControls,
    KeyboardControls,
    ThirdPersonControls,
    FirstPersonControls
  }),
  Loaders: Object.freeze({
    ObjMtlLoader
  }),
  Debug: Object.freeze({
    FpsCounter
  }),
  // Low-level access (shaders, manual uniforms/attributes):
  LowLevel: Object.freeze({
    ShaderProgram
  })
});
var library_default = GeraWebGL;
export {
  GeraWebGL,
  library_default as default
};
//# sourceMappingURL=gerawebgl.js.map
