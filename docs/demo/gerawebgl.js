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
   * Notes: out must not be the same object as matrix.
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
   * Copies components from another Vector3.
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
var Geometry = class {
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
   * Indicates whether this geometry instance has been disposed.
   * Disposed geometries must not be used for rendering.
   *
   * @type {boolean}
   * @private
   */
  #isDisposed = false;
  /**
   * @param {WebGL2RenderingContext} webglContext  - WebGL2 rendering context used to create and manage GPU resources.
   * @param {Float32Array} positions               - [x, y, z] triples.
   * @param {Float32Array | null} colors           - [red, green, blue] triples or null.
   * @param {Uint16Array} indicesSolid             - Indices for solid triangles.
   * @param {Uint16Array} indicesWireframe         - Indices for wireframe lines.
   * @param {Float32Array | null} [uvs = null]     - [u, v] pairs or null.
   * @param {Float32Array | null} [normals = null] - [x, y, z] triples or null.
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
    if (!(indicesSolid instanceof Uint16Array) || !(indicesWireframe instanceof Uint16Array)) {
      throw new TypeError("`Geometry` expects indices as `Uint16Array`.");
    }
    this.#validateAttributeSizes(positions, colors, uvs, normals);
    this.#validateIndexSizes(indicesSolid, indicesWireframe);
    this.#webglContext = webglContext;
    this.#solidIndexCount = indicesSolid.length;
    this.#wireframeIndexCount = indicesWireframe.length;
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
   * @param {Uint16Array} indices - Index data referencing vertices in the associated vertex buffers.
   * @returns {WebGLBuffer}
   * @private
   */
  #createIndexBuffer(indices) {
    const buffer = this.#webglContext.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create `ELEMENT_ARRAY_BUFFER`.");
    }
    this.#webglContext.bindBuffer(this.#webglContext.ELEMENT_ARRAY_BUFFER, buffer);
    this.#webglContext.bufferData(this.#webglContext.ELEMENT_ARRAY_BUFFER, indices, this.#webglContext.STATIC_DRAW);
    return buffer;
  }
  /**
   * Validates vertex attribute array sizes (positions, colors, uvs, normals).
   *
   * @param {Float32Array} positions      - Flat array of vec3 positions: [x, y, z] * vertexCount.
   * @param {Float32Array | null} colors  - Optional flat array of vec3 colors: [red, green, blue] * vertexCount.
   * @param {Float32Array | null} uvs     - Optional flat array of vec2 UVs: [u, v] * vertexCount.
   * @param {Float32Array | null} normals - Optional flat array of vec3 normals: [x, y, z] * vertexCount.
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
   * @param {Uint16Array} indicesSolid     - Triangle index buffer data (3 indices per triangle).
   * @param {Uint16Array} indicesWireframe - Line index buffer data (2 indices per line segment).
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

// core/geometry/box-geometry.js
var DEFAULT_BOX_SIZE = 1;
var BOX_HALF_SIZE_DIVISOR = 2;
var DEFAULT_VERTEX_COLOR = new Float32Array([1, 1, 1]);
var BOX_FACE_COUNT = 6;
var VERTICES_PER_FACE = 4;
var BOX_VERTEX_COUNT = BOX_FACE_COUNT * VERTICES_PER_FACE;
var COLOR_COMPONENT_COUNT2 = DEFAULT_VERTEX_COLOR.length;
var COLORS_UNIFORM_LENGTH = COLOR_COMPONENT_COUNT2;
var COLORS_PER_FACE_LENGTH = BOX_FACE_COUNT * COLOR_COMPONENT_COUNT2;
var COLORS_PER_VERTEX_LENGTH = BOX_VERTEX_COUNT * COLOR_COMPONENT_COUNT2;
var COLOR_COMPONENT_INDEX_RED = 0;
var COLOR_COMPONENT_INDEX_GREEN = 1;
var COLOR_COMPONENT_INDEX_BLUE = 2;
var TRIANGLE_INDEX_COUNT_PER_FACE = 6;
var BOX_TRIANGLE_INDEX_COUNT = BOX_FACE_COUNT * TRIANGLE_INDEX_COUNT_PER_FACE;
var UNIT_POSITIONS = new Float32Array([
  /* eslint-disable indent */
  // Front (+Z):
  -1,
  -1,
  1,
  1,
  -1,
  1,
  1,
  1,
  1,
  -1,
  1,
  1,
  // Back (-Z):
  1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  1,
  -1,
  1,
  1,
  -1,
  // Top (+Y):
  -1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  -1,
  -1,
  1,
  -1,
  // Bottom (-Y):
  -1,
  -1,
  -1,
  1,
  -1,
  -1,
  1,
  -1,
  1,
  -1,
  -1,
  1,
  // Right (+X):
  1,
  -1,
  1,
  1,
  -1,
  -1,
  1,
  1,
  -1,
  1,
  1,
  1,
  // Left (-X):
  -1,
  -1,
  -1,
  -1,
  -1,
  1,
  -1,
  1,
  1,
  -1,
  1,
  -1
  /* eslint-enable indent */
]);
var BOX_FACE_UVS = new Float32Array([
  // Front:
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1,
  // Back (flip `U` to avoid the mirrored appearance):
  1,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  // Top:
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1,
  // Bottom:
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1,
  // Right:
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1,
  // Left:
  0,
  0,
  1,
  0,
  1,
  1,
  0,
  1
]);
var BOX_FACE_NORMALS = new Float32Array([
  // Front (+Z):
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  // Back (-Z):
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  // Top (+Y):
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  // Bottom (-Y):
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  // Right (+X):
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  1,
  0,
  0,
  // Left (-X):
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0,
  -1,
  0,
  0
]);
var INDICES_SOLID = new Uint16Array([
  // Front (0-3):
  0,
  1,
  2,
  2,
  3,
  0,
  // Back (4-7):
  4,
  5,
  6,
  6,
  7,
  4,
  // Top (8-11):
  8,
  9,
  10,
  10,
  11,
  8,
  // Bottom (12-15):
  12,
  13,
  14,
  14,
  15,
  12,
  // Right (16-19):
  16,
  17,
  18,
  18,
  19,
  16,
  // Left (20-23):
  20,
  21,
  22,
  22,
  23,
  20
]);
var INDICES_WIREFRAME = new Uint16Array([
  // Front edges:
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  0,
  // Back edges:
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  4,
  // Side edges:
  0,
  5,
  1,
  4,
  2,
  7,
  3,
  6
]);
var BoxGeometry = class _BoxGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext         - WebGL2 rendering context.
   * @param {BoxGeometryOptions | number} [optionsOrSize] - Options object or numeric size.
   */
  constructor(webglContext, optionsOrSize = {}) {
    const options = _BoxGeometry.#normalizeOptions(optionsOrSize);
    const { size, colors: colorsSpec } = options;
    const halfSize = size / BOX_HALF_SIZE_DIVISOR;
    const positions = _BoxGeometry.#createPositions(halfSize);
    const colors = _BoxGeometry.#createColors(colorsSpec);
    const uvs = BOX_FACE_UVS;
    const normals = BOX_FACE_NORMALS;
    if (INDICES_SOLID.length !== BOX_TRIANGLE_INDEX_COUNT) {
      throw new Error("`BoxGeometry` internal error: unexpected triangle index count.");
    }
    super(webglContext, positions, colors, INDICES_SOLID, INDICES_WIREFRAME, uvs, normals);
  }
  /**
   * Normalizes constructor input to a `BoxGeometryOptions` object.
   *
   * @param {BoxGeometryOptions | number} optionsOrSize - Options object or numeric size.
   * @returns {{ size: number, colors: Float32Array }}  - Normalized options.
   * @private
   */
  static #normalizeOptions(optionsOrSize) {
    if (typeof optionsOrSize === "number") {
      return { size: optionsOrSize, colors: DEFAULT_VERTEX_COLOR };
    }
    if (optionsOrSize === null || typeof optionsOrSize !== "object") {
      throw new TypeError("`BoxGeometry` expects options as an object or a number.");
    }
    const { size = DEFAULT_BOX_SIZE, colors = DEFAULT_VERTEX_COLOR } = optionsOrSize;
    if (typeof size !== "number") {
      throw new TypeError("`BoxGeometry` expects size as a number.");
    }
    if (!(colors instanceof Float32Array)) {
      throw new TypeError("`BoxGeometry` expects colors as a `Float32Array`.");
    }
    if (colors.length !== COLORS_UNIFORM_LENGTH && colors.length !== COLORS_PER_FACE_LENGTH && colors.length !== COLORS_PER_VERTEX_LENGTH) {
      throw new TypeError(
        "`BoxGeometry` expects `colors` length to be `{uniform}` (uniform), `{face}` (per-face), or `{vertex}` (per-vertex).".replace("{uniform}", String(COLORS_UNIFORM_LENGTH)).replace("{face}", String(COLORS_PER_FACE_LENGTH)).replace("{vertex}", String(COLORS_PER_VERTEX_LENGTH))
      );
    }
    return { size, colors };
  }
  /**
   * Creates scaled positions for the box.
   * `UNIT_POSITIONS` contains `-1/+1` cube coordinates, scaling them by `halfSize`.
   *
   * @param {number} halfSize - Half of the cube edge size.
   * @returns {Float32Array}  - Scaled positions buffer.
   * @private
   */
  static #createPositions(halfSize) {
    const positions = new Float32Array(UNIT_POSITIONS.length);
    for (let i = 0; i < UNIT_POSITIONS.length; i += 1) {
      positions[i] = UNIT_POSITIONS[i] * halfSize;
    }
    return positions;
  }
  /**
   * Converts `colors` input (uniform/per-face/per-vertex) into a per-vertex RGB buffer.
   *
   * @param {Float32Array} colorsSpec - Color buffer that follows 3/18/72 proportion length.
   * @returns {Float32Array}          - Per-vertex RGB colors buffer (length = 72).
   * @private
   */
  static #createColors(colorsSpec) {
    if (colorsSpec.length === COLORS_PER_VERTEX_LENGTH) {
      return new Float32Array(colorsSpec);
    }
    if (colorsSpec.length === COLORS_UNIFORM_LENGTH) {
      return _BoxGeometry.#createUniformColors(colorsSpec);
    }
    return _BoxGeometry.#createPerFaceColors(colorsSpec);
  }
  /**
   * Creates a uniform per-vertex color buffer from a single RGB triplet.
   *
   * @param {Float32Array} uniformColor - Float32Array([red, green, blue]).
   * @returns {Float32Array}            - Per-vertex RGB buffer.
   * @private
   */
  static #createUniformColors(uniformColor) {
    const colors = new Float32Array(COLORS_PER_VERTEX_LENGTH);
    for (let vertexIndex = 0; vertexIndex < BOX_VERTEX_COUNT; vertexIndex += 1) {
      const baseIndex = vertexIndex * COLOR_COMPONENT_COUNT2;
      colors[baseIndex + COLOR_COMPONENT_INDEX_RED] = uniformColor[COLOR_COMPONENT_INDEX_RED];
      colors[baseIndex + COLOR_COMPONENT_INDEX_GREEN] = uniformColor[COLOR_COMPONENT_INDEX_GREEN];
      colors[baseIndex + COLOR_COMPONENT_INDEX_BLUE] = uniformColor[COLOR_COMPONENT_INDEX_BLUE];
    }
    return colors;
  }
  /**
   * Creates a per-vertex color buffer from per-face RGB colors.
   * Each face color is applied to all 4 vertices of that face.
   *
   * @param {Float32Array} perFaceColors - Float32Array length = 18 (6 faces * 3 RGB).
   * @returns {Float32Array}             - Per-vertex RGB buffer (length = 72).
   * @private
   */
  static #createPerFaceColors(perFaceColors) {
    const colors = new Float32Array(COLORS_PER_VERTEX_LENGTH);
    for (let faceIndex = 0; faceIndex < BOX_FACE_COUNT; faceIndex += 1) {
      const faceColorBaseIndex = faceIndex * COLOR_COMPONENT_COUNT2;
      const faceRed = perFaceColors[faceColorBaseIndex + COLOR_COMPONENT_INDEX_RED];
      const faceGreen = perFaceColors[faceColorBaseIndex + COLOR_COMPONENT_INDEX_GREEN];
      const faceBlue = perFaceColors[faceColorBaseIndex + COLOR_COMPONENT_INDEX_BLUE];
      for (let vertexOnFace = 0; vertexOnFace < VERTICES_PER_FACE; vertexOnFace += 1) {
        const vertexIndex = faceIndex * VERTICES_PER_FACE + vertexOnFace;
        const vertexBaseIndex = vertexIndex * COLOR_COMPONENT_COUNT2;
        colors[vertexBaseIndex + COLOR_COMPONENT_INDEX_RED] = faceRed;
        colors[vertexBaseIndex + COLOR_COMPONENT_INDEX_GREEN] = faceGreen;
        colors[vertexBaseIndex + COLOR_COMPONENT_INDEX_BLUE] = faceBlue;
      }
    }
    return colors;
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
var MIN_REQUIRED_STRING_LENGTH = 1;
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
    if (typeof url !== "string" || url.length < MIN_REQUIRED_STRING_LENGTH) {
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
out vec4 outColor;

void main() {
    outColor = vec4(v_color, 1.0);
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
  }
};

// core/material/solid-color-material.js
var POSITION_ATTRIBUTE_LOCATION3 = 0;
var MATRIX_UNIFORM_NAME2 = "u_matrix";
var COLOR_UNIFORM_NAME = "u_color";
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
uniform vec3 ${COLOR_UNIFORM_NAME};
out vec4 outColor;

void main() {
    outColor = vec4(${COLOR_UNIFORM_NAME}, 1.0);
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
out vec4 outColor;

void main() {
    outColor = texture(${DIFFUSE_TEXTURE_UNIFORM_NAME}, v_uv);
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
var NORMAL_COLOR_SCALE = 0.5;
var NORMAL_COLOR_BIAS = 0.5;
var OUTPUT_ALPHA = 1;
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
out vec4 outColor;

void main() {
    vec3 normalizedNormal = normalize(v_normal);
    vec3 normalColor = (normalizedNormal * ${NORMAL_COLOR_SCALE}) + ${NORMAL_COLOR_BIAS};
    outColor = vec4(normalColor, ${OUTPUT_ALPHA});
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
  }
};

// core/material/lambert-material.js
var POSITION_ATTRIBUTE_LOCATION6 = 0;
var NORMAL_ATTRIBUTE_LOCATION3 = 3;
var FINAL_MATRIX_UNIFORM_NAME = "u_matrix";
var WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME = "u_worldInverseTranspose";
var COLOR_UNIFORM_NAME2 = "u_color";
var LIGHT_DIRECTION_UNIFORM_NAME = "u_lightDirection";
var AMBIENT_STRENGTH_UNIFORM_NAME = "u_ambientStrength";
var VECTOR3_ELEMENT_COUNT = 3;
var DEFAULT_COLOR2 = new Float32Array([0.85, 0.85, 0.85]);
var DEFAULT_LIGHT_DIRECTION = new Float32Array([0.5, 0.7, 1]);
var DEFAULT_AMBIENT_STRENGTH = 0.2;
var MIN_DIRECTION_LENGTH_SQUARED = 0;
var INVERSE_LENGTH_NUMERATOR = 1;
var VERTEX_SHADER_SOURCE5 = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION6}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION3}) in vec3 a_normal;
uniform mat4 ${FINAL_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME};
out vec3 v_normal;

void main() {
    gl_Position = ${FINAL_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_normal = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME} * vec4(a_normal, 0.0)).xyz;
}
`;
var FRAGMENT_SHADER_SOURCE5 = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3  ${COLOR_UNIFORM_NAME2};
uniform vec3  ${LIGHT_DIRECTION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);
    vec3 light_direction = normalize(${LIGHT_DIRECTION_UNIFORM_NAME});
    float diffuse = max(dot(surface_normal, light_direction), 0.0);
    float light = clamp(${AMBIENT_STRENGTH_UNIFORM_NAME} + diffuse, 0.0, 1.0);
    outColor = vec4(${COLOR_UNIFORM_NAME2} * light, 1.0);
}
`;
var LambertMaterial = class _LambertMaterial extends Material {
  /**
   * Diffuse color (RGB).
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
    super(webglContext, shaderProgram, { ownsShaderProgram: true });
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
   * Uploads per-object uniforms for a draw call.
   *
   * @param {Float32Array} finalMatrix                 - view projection * world matrix.
   * @param {Float32Array} worldMatrix                 - world matrix (stub).
   * @param {Float32Array} worldInverseTransposeMatrix - (world ^ -1) ^ T, used to transform normals.
   */
  apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix) {
    void worldMatrix;
    this.shaderProgram.setMatrix4(FINAL_MATRIX_UNIFORM_NAME, finalMatrix);
    this.shaderProgram.setMatrix4(WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME, worldInverseTransposeMatrix);
    this.shaderProgram.setVector3(COLOR_UNIFORM_NAME2, this.#color);
    this.shaderProgram.setVector3(LIGHT_DIRECTION_UNIFORM_NAME, this.#lightDirection);
    this.shaderProgram.setFloat(AMBIENT_STRENGTH_UNIFORM_NAME, this.#ambientStrength);
  }
  /**
   * Sets the diffuse RGB color.
   *
   * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
   */
  setColor(color) {
    _LambertMaterial.#assertVector3("`LambertMaterial.setColor`", color);
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
    _LambertMaterial.#assertVector3("`LambertMaterial.setLightDirection`", direction);
    const directionX = direction[0];
    const directionY = direction[1];
    const directionZ = direction[2];
    const directionLengthSquared = directionX * directionX + directionY * directionY + directionZ * directionZ;
    if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= MIN_DIRECTION_LENGTH_SQUARED) {
      throw new TypeError("`LambertMaterial.setLightDirection` expects a non-zero finite vector.");
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
      throw new TypeError("`LambertMaterial.setAmbientStrength` expects a finite number.");
    }
    this.#ambientStrength = value;
  }
  /**
   * Returns the internal diffuse color buffer.
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
   * @private
   */
  static #assertVector3(methodName, vector3) {
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
};

// core/material/phong-material.js
var POSITION_ATTRIBUTE_LOCATION7 = 0;
var NORMAL_ATTRIBUTE_LOCATION4 = 3;
var FINAL_MATRIX_UNIFORM_NAME2 = "u_matrix";
var WORLD_MATRIX_UNIFORM_NAME = "u_worldMatrix";
var WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME2 = "u_worldInverseTranspose";
var COLOR_UNIFORM_NAME3 = "u_color";
var SPECULAR_COLOR_UNIFORM_NAME = "u_specularColor";
var LIGHT_DIRECTION_UNIFORM_NAME2 = "u_lightDirection";
var CAMERA_POSITION_UNIFORM_NAME = "u_cameraPosition";
var AMBIENT_STRENGTH_UNIFORM_NAME2 = "u_ambientStrength";
var SPECULAR_STRENGTH_UNIFORM_NAME = "u_specularStrength";
var SHININESS_UNIFORM_NAME = "u_shininess";
var VECTOR3_ELEMENT_COUNT2 = 3;
var DEFAULT_COLOR3 = new Float32Array([0.85, 0.85, 0.85]);
var DEFAULT_SPECULAR_COLOR = new Float32Array([1, 1, 1]);
var DEFAULT_LIGHT_DIRECTION2 = new Float32Array([0.5, 0.7, 1]);
var DEFAULT_AMBIENT_STRENGTH2 = 0.2;
var DEFAULT_SPECULAR_STRENGTH = 0.6;
var DEFAULT_SHININESS = 32;
var MIN_DIRECTION_LENGTH_SQUARED2 = 0;
var INVERSE_LENGTH_NUMERATOR2 = 1;
var VERTEX_SHADER_SOURCE6 = `#version 300 es
layout(location = ${POSITION_ATTRIBUTE_LOCATION7}) in vec3 a_position;
layout(location = ${NORMAL_ATTRIBUTE_LOCATION4}) in vec3 a_normal;
uniform mat4 ${FINAL_MATRIX_UNIFORM_NAME2};
uniform mat4 ${WORLD_MATRIX_UNIFORM_NAME};
uniform mat4 ${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME2};
out vec3 v_worldPosition;
out vec3 v_normal;

void main() {
    vec4 worldPosition = ${WORLD_MATRIX_UNIFORM_NAME} * vec4(a_position, 1.0);
    v_worldPosition = worldPosition.xyz;
    // Normal is transformed by inverse-transpose of the world matrix.
    v_normal = (${WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME2} * vec4(a_normal, 0.0)).xyz;
    gl_Position = ${FINAL_MATRIX_UNIFORM_NAME2} * vec4(a_position, 1.0);
}
`;
var FRAGMENT_SHADER_SOURCE6 = `#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
uniform vec3  ${COLOR_UNIFORM_NAME3};
uniform vec3  ${SPECULAR_COLOR_UNIFORM_NAME};
uniform vec3  ${LIGHT_DIRECTION_UNIFORM_NAME2};
uniform vec3  ${CAMERA_POSITION_UNIFORM_NAME};
uniform float ${AMBIENT_STRENGTH_UNIFORM_NAME2};
uniform float ${SPECULAR_STRENGTH_UNIFORM_NAME};
uniform float ${SHININESS_UNIFORM_NAME};
out vec4 outColor;

void main() {
    vec3 surface_normal  = normalize(v_normal);
    vec3 light_direction = normalize(${LIGHT_DIRECTION_UNIFORM_NAME2});
    vec3 view_direction  = normalize(${CAMERA_POSITION_UNIFORM_NAME} - v_worldPosition);

    // Diffuse term:
    float diff = max(dot(surface_normal, light_direction), 0.0);

    // Specular term:
    float spec = 0.0;

    if (diff > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, surface_normal);
        float specBase = max(dot(view_direction, reflection_direction), 0.0);
        spec = pow(specBase, ${SHININESS_UNIFORM_NAME});
    }

    vec3 ambient  = ${COLOR_UNIFORM_NAME3} * ${AMBIENT_STRENGTH_UNIFORM_NAME2};
    vec3 diffuse  = ${COLOR_UNIFORM_NAME3} * diff;
    vec3 specular = ${SPECULAR_COLOR_UNIFORM_NAME} * (spec * ${SPECULAR_STRENGTH_UNIFORM_NAME});
    vec3 rgb      = ambient + diffuse + specular;
    outColor      = vec4(rgb, 1.0);
}
`;
var PhongMaterial = class _PhongMaterial extends Material {
  /**
   * Diffuse color (RGB).
   *
   * @type {Float32Array}
   * @private
   */
  #color = new Float32Array(VECTOR3_ELEMENT_COUNT2);
  /**
   * Specular color (RGB).
   *
   * @type {Float32Array}
   * @private
   */
  #specularColor = new Float32Array(VECTOR3_ELEMENT_COUNT2);
  /**
   * Directional light direction (world space, normalized).
   *
   * @type {Float32Array}
   * @private
   */
  #lightDirection = new Float32Array(VECTOR3_ELEMENT_COUNT2);
  /**
   * Ambient term multiplier.
   *
   * @type {number}
   * @private
   */
  #ambientStrength = DEFAULT_AMBIENT_STRENGTH2;
  /**
   * Specular term multiplier.
   *
   * @type {number}
   * @private
   */
  #specularStrength = DEFAULT_SPECULAR_STRENGTH;
  /**
   * Specular exponent.
   *
   * @type {number}
   * @private
   */
  #shininess = DEFAULT_SHININESS;
  /**
   * Creates a new `PhongMaterial`.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile the shaders.
   * @param {PhongMaterialOptions} [options]      - Material options.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`PhongMaterial` expects an options object (plain object).");
    }
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE6, FRAGMENT_SHADER_SOURCE6);
    super(webglContext, shaderProgram, { ownsShaderProgram: true });
    this.#color.set(DEFAULT_COLOR3);
    this.#specularColor.set(DEFAULT_SPECULAR_COLOR);
    this.setLightDirection(DEFAULT_LIGHT_DIRECTION2);
    this.#ambientStrength = DEFAULT_AMBIENT_STRENGTH2;
    this.#specularStrength = DEFAULT_SPECULAR_STRENGTH;
    this.#shininess = DEFAULT_SHININESS;
    const {
      color,
      specularColor,
      lightDirection,
      ambientStrength,
      specularStrength,
      shininess
    } = options;
    if (color !== void 0) {
      this.setColor(color);
    }
    if (specularColor !== void 0) {
      this.setSpecularColor(specularColor);
    }
    if (lightDirection !== void 0) {
      this.setLightDirection(lightDirection);
    }
    if (ambientStrength !== void 0) {
      this.setAmbientStrength(ambientStrength);
    }
    if (specularStrength !== void 0) {
      this.setSpecularStrength(specularStrength);
    }
    if (shininess !== void 0) {
      this.setShininess(shininess);
    }
  }
  /**
   * Uploads per-object uniforms for a draw call.
   *
   * @param {Float32Array} finalMatrix                 - view projection * world matrix.
   * @param {Float32Array} worldMatrix                 - world matrix.
   * @param {Float32Array} worldInverseTransposeMatrix - (world ^ -1) ^ T, used to transform normals.
   * @param {Float32Array} cameraPosition              - Camera position (vec3), world space.
   */
  apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition) {
    this.shaderProgram.setMatrix4(FINAL_MATRIX_UNIFORM_NAME2, finalMatrix);
    this.shaderProgram.setMatrix4(WORLD_MATRIX_UNIFORM_NAME, worldMatrix);
    this.shaderProgram.setMatrix4(WORLD_INVERSE_TRANSPOSE_MATRIX_UNIFORM_NAME2, worldInverseTransposeMatrix);
    this.shaderProgram.setVector3(COLOR_UNIFORM_NAME3, this.#color);
    this.shaderProgram.setVector3(SPECULAR_COLOR_UNIFORM_NAME, this.#specularColor);
    this.shaderProgram.setVector3(LIGHT_DIRECTION_UNIFORM_NAME2, this.#lightDirection);
    this.shaderProgram.setVector3(CAMERA_POSITION_UNIFORM_NAME, cameraPosition);
    this.shaderProgram.setFloat(AMBIENT_STRENGTH_UNIFORM_NAME2, this.#ambientStrength);
    this.shaderProgram.setFloat(SPECULAR_STRENGTH_UNIFORM_NAME, this.#specularStrength);
    this.shaderProgram.setFloat(SHININESS_UNIFORM_NAME, this.#shininess);
  }
  /**
   * Sets the diffuse RGB color.
   *
   * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
   */
  setColor(color) {
    _PhongMaterial.#assertVector3("`PhongMaterial.setColor`", color);
    this.#color[0] = color[0];
    this.#color[1] = color[1];
    this.#color[2] = color[2];
  }
  /**
   * Sets the specular RGB color.
   *
   * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
   */
  setSpecularColor(color) {
    _PhongMaterial.#assertVector3("`PhongMaterial.setSpecularColor`", color);
    this.#specularColor[0] = color[0];
    this.#specularColor[1] = color[1];
    this.#specularColor[2] = color[2];
  }
  /**
   * Sets the light direction (world space). The direction is normalized internally.
   *
   * @param {Float32Array | number[]} direction - [x, y, z] direction vector (non-zero).
   */
  setLightDirection(direction) {
    _PhongMaterial.#assertVector3("`PhongMaterial.setLightDirection`", direction);
    const directionX = direction[0];
    const directionY = direction[1];
    const directionZ = direction[2];
    const directionLengthSquared = directionX * directionX + directionY * directionY + directionZ * directionZ;
    if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= MIN_DIRECTION_LENGTH_SQUARED2) {
      throw new TypeError("`PhongMaterial.setLightDirection` expects a non-zero finite vector.");
    }
    const inverseDirectionLength = INVERSE_LENGTH_NUMERATOR2 / Math.sqrt(directionLengthSquared);
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
      throw new TypeError("`PhongMaterial.setAmbientStrength` expects a finite number.");
    }
    this.#ambientStrength = value;
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
   * Sets shininess exponent.
   *
   * @param {number} value - Specular exponent.
   */
  setShininess(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("PhongMaterial.setShininess` expects a finite number.");
    }
    this.#shininess = value;
  }
  /**
   * Returns the internal diffuse color buffer.
   *
   * @returns {Float32Array}
   */
  get color() {
    return this.#color;
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
  /**
   * Validates a vector3-like input.
   *
   * @param {string} methodName               - Method name for error messages.
   * @param {Float32Array | number[]} vector3 - Vector to validate.
   * @private
   */
  static #assertVector3(methodName, vector3) {
    if (!Array.isArray(vector3) && !(vector3 instanceof Float32Array)) {
      throw new TypeError(`${methodName} expects a number[] or Float32Array.`);
    }
    if (vector3.length !== VECTOR3_ELEMENT_COUNT2) {
      throw new TypeError(`${methodName} expects exactly 3 components [x, y, z].`);
    }
    if (!Number.isFinite(vector3[0]) || !Number.isFinite(vector3[1]) || !Number.isFinite(vector3[2])) {
      throw new TypeError(`${methodName} expects all components to be finite numbers.`);
    }
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

// core/scene/perspective-camera.js
var MINIMUM_NEAR_CLIP_DISTANCE2 = 0;
var MINIMUM_ASPECT_RATIO2 = 0;
var MATRIX_4x4_ELEMENT_COUNT5 = 16;
var PerspectiveCamera = class extends Object3D {
  /** @type {number} */
  #fieldOfViewRadians;
  /** @type {number} */
  #aspectRatio;
  /** @type {number} */
  #near;
  /** @type {number} */
  #far;
  /** @type {Float32Array} */
  #projectionMatrix;
  /** @type {Float32Array} */
  #viewMatrix;
  /** @type {boolean} */
  #isProjectionMatrixDirty = true;
  /** @type {number} */
  #cachedPositionX = Number.NaN;
  /** @type {number} */
  #cachedPositionY = Number.NaN;
  /** @type {number} */
  #cachedPositionZ = Number.NaN;
  /** @type {number} */
  #cachedRotationX = Number.NaN;
  /** @type {number} */
  #cachedRotationY = Number.NaN;
  /** @type {number} */
  #cachedRotationZ = Number.NaN;
  /** @type {number} */
  #cachedScaleX = Number.NaN;
  /** @type {number} */
  #cachedScaleY = Number.NaN;
  /** @type {number} */
  #cachedScaleZ = Number.NaN;
  /**
   * @param {number} fieldOfViewRadians - Vertical field of view in radians.
   * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
   * @param {number} near               - Distance to the near clipping plane (must be greater than 0).
   * @param {number} far                - Distance to the far clipping plane (must be greater than near).
   */
  constructor(fieldOfViewRadians, aspectRatio, near, far) {
    super();
    if (typeof fieldOfViewRadians !== "number" || typeof aspectRatio !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("PerspectiveCamera expects numeric constructor arguments.");
    }
    if (aspectRatio <= MINIMUM_ASPECT_RATIO2) {
      throw new RangeError("PerspectiveCamera expects a positive aspect ratio.");
    }
    if (near <= MINIMUM_NEAR_CLIP_DISTANCE2 || far <= near) {
      throw new RangeError("PerspectiveCamera expects 0 < near < far.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#projectionMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT5);
    this.#viewMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT5);
  }
  /**
   * Updates the aspect ratio.
   *
   * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
   */
  setAspectRatio(aspectRatio) {
    if (typeof aspectRatio !== "number" || aspectRatio <= MINIMUM_ASPECT_RATIO2) {
      throw new RangeError("PerspectiveCamera.setAspectRatio expects a positive number.");
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
   * Returns the view matrix for this camera (inverse of its local TRS transform).
   * The returned matrix is cached and reused between calls.
   *
   * @returns {Float32Array} - Cached view matrix.
   */
  getViewMatrix() {
    const position = this.position;
    const rotation = this.rotation;
    const scale = this.scale;
    const positionX = position.x;
    const positionY = position.y;
    const positionZ = position.z;
    const rotationX = rotation.x;
    const rotationY = rotation.y;
    const rotationZ = rotation.z;
    const scaleX = scale.x;
    const scaleY = scale.y;
    const scaleZ = scale.z;
    const hasTransformChanged = positionX !== this.#cachedPositionX || positionY !== this.#cachedPositionY || positionZ !== this.#cachedPositionZ || rotationX !== this.#cachedRotationX || rotationY !== this.#cachedRotationY || rotationZ !== this.#cachedRotationZ || scaleX !== this.#cachedScaleX || scaleY !== this.#cachedScaleY || scaleZ !== this.#cachedScaleZ;
    if (hasTransformChanged) {
      CameraMath.writeViewMatrixTo(this.#viewMatrix, position, rotation, scale);
      this.#cachedPositionX = positionX;
      this.#cachedPositionY = positionY;
      this.#cachedPositionZ = positionZ;
      this.#cachedRotationX = rotationX;
      this.#cachedRotationY = rotationY;
      this.#cachedRotationZ = rotationZ;
      this.#cachedScaleX = scaleX;
      this.#cachedScaleY = scaleY;
      this.#cachedScaleZ = scaleZ;
    }
    return this.#viewMatrix;
  }
};

// core/render/renderer.js
var INDEX_BUFFER_OFFSET_BYTES = 0;
var MATRIX_4x4_ELEMENT_COUNT6 = 16;
var VECTOR3_ELEMENT_COUNT3 = 3;
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
    this.#viewProjectionMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT6);
    this.#finalMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT6);
    this.#worldMatrixInverse = new Float32Array(MATRIX_4x4_ELEMENT_COUNT6);
    this.#worldInverseTransposeMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT6);
    this.#cameraPosition = new Float32Array(VECTOR3_ELEMENT_COUNT3);
    this.#frameViewProjectionMatrix = this.#viewProjectionMatrix;
    this.#frameCameraPosition = this.#cameraPosition;
    this.#traverseCallback = (x) => this.#renderVisitedObject(x);
  }
  /**
   * Renders the given scene from the point of view of the given camera.
   *
   * @param {Scene} scene                                - Scene graph containing all objects that should be rendered.
   * @param {PerspectiveCamera} camera                   - Camera defining view and projection used for rendering.
   * @param {ResizeToDisplaySizeOptions} [resizeOptions] - Optional canvas resize options.
   */
  render(scene, camera, resizeOptions) {
    if (!(scene instanceof Scene)) {
      throw new TypeError("Renderer.render expects a Scene instance.");
    }
    if (!(camera instanceof PerspectiveCamera)) {
      throw new TypeError("Renderer.render expects a PerspectiveCamera instance.");
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
      renderingContext.UNSIGNED_SHORT,
      INDEX_BUFFER_OFFSET_BYTES
    );
  }
};

// core/engine/engine.js
var DEFAULT_FIELD_OF_VIEW_RADIANS = Math.PI / 4;
var DEFAULT_NEAR = 0.1;
var DEFAULT_FAR = 100;
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
   * @type {PerspectiveCamera}
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
      fieldOfViewRadians = DEFAULT_FIELD_OF_VIEW_RADIANS,
      near = DEFAULT_NEAR,
      far = DEFAULT_FAR,
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
  /** @returns {PerspectiveCamera} */
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

// core/library.js
var GeraWebGL = Object.freeze({
  Engine,
  createEngine,
  // High-level building blocks:
  WebGLContext,
  Renderer,
  Scene,
  PerspectiveCamera,
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
    BoxGeometry
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
    LambertMaterial,
    PhongMaterial
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
