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

// core/constants/math.js
var MATH_LAYOUT = Object.freeze({
  MATRIX_4X4_ELEMENT_COUNT: 16,
  MATRIX_COLUMN_COUNT: 4,
  MATRIX_ROW_COUNT: 4,
  MATRIX_STRIDE: 4,
  VECTOR3_ELEMENT_COUNT: 3
});
var MATH_COMMON_VALUES = Object.freeze({
  ZERO: 0,
  UNIT: 1
});
var MATH_VECTOR3_COMPONENTS = Object.freeze({
  ZERO: MATH_COMMON_VALUES.ZERO,
  UNIT: MATH_COMMON_VALUES.UNIT
});
var MATH_VECTOR3_INDEXES = Object.freeze({
  X: 0,
  Y: 1,
  Z: 2
});
var MATH_MATRIX4_INDEXES = Object.freeze({
  WORLD_Z_AXIS_X: 8,
  WORLD_Z_AXIS_Y: 9,
  WORLD_Z_AXIS_Z: 10
});
var MATH_MATRIX_VALUES = Object.freeze({
  ZERO: MATH_COMMON_VALUES.ZERO,
  UNIT: MATH_COMMON_VALUES.UNIT
});
var MATH_PERSPECTIVE = Object.freeze({
  HALF_FIELD_OF_VIEW_DIVISOR: 2,
  PROJECTION_SCALE_NUMERATOR: 1,
  DEPTH_RANGE_NUMERATOR: 1,
  Z_RANGE_MULTIPLIER: 2,
  W_COMPONENT_SCALE: -1
});
var MATH_ORTHOGRAPHIC = Object.freeze({ SCALE_NUMERATOR: 2 });
var MATH_CAMERA_LIMITS = Object.freeze({
  MINIMUM_ASPECT_RATIO: 0,
  MINIMUM_NEAR_CLIP_DISTANCE: 0
});
var MATH_VIEW_MATRIX = Object.freeze({ SCALE_INVERSE_NUMERATOR: 1 });
var MATH_MATRIX_INVERSION = Object.freeze({
  MIN_INVERTIBLE_DETERMINANT_ABS: 1e-12,
  INVERSE_DETERMINANT_NUMERATOR: 1
});

// core/math/matrix4.js
var Matrix4 = class _Matrix4 {
  /**
   * Creates a new 4x4 identity matrix:
   *
   * column 0: [ 1, 0, 0, 0 ]
   * column 1: [ 0, 1, 0, 0 ]
   * column 2: [ 0, 0, 1, 0 ]
   * column 3: [ 0, 0, 0, 1 ]
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
   * Creates a scale matrix:
   *
   * column 0: [ scaleX, 0,      0,      0 ]
   * column 1: [ 0,      scaleY, 0,      0 ]
   * column 2: [ 0,      0,      scaleZ, 0 ]
   * column 3: [ 0,      0,      0,      1 ]
   *
   * @param {number} scaleX  - Scale along X.
   * @param {number} scaleY  - Scale along Y.
   * @param {number} scaleZ  - Scale along Z.
   * @returns {Float32Array} - A new scale matrix.
   */
  static createScale(scaleX, scaleY, scaleZ) {
    if (typeof scaleX !== "number" || typeof scaleY !== "number" || typeof scaleZ !== "number") {
      throw new TypeError("`Matrix4.createScale` expects numeric arguments.");
    }
    const out = _Matrix4.#createEmpty();
    out[0] = scaleX;
    out[5] = scaleY;
    out[10] = scaleZ;
    out[15] = 1;
    return out;
  }
  /**
   * Creates a perspective projection matrix:
   *
   * column 0: [ projectionScale / aspectRatio, 0,               0,           0 ]
   * column 1: [ 0,                             projectionScale, 0,           0 ]
   * column 2: [ 0,                             0,               depthScale, -1 ]
   * column 3: [ 0,                             0,               depthOffset, 0 ]
   *
   * Perspective projection:
   * - makes farther objects appear smaller and closer objects appear larger
   * - unlike the orthographic projection, object size depends on distance from the camera
   *
   * How the matrix is applied to a 3D point?
   * - the matrix stores projection coefficients, not a projected point
   * - a view-space 3D point [x, y, z] is used as a homogeneous input [x, y, z, 1]
   * - homogeneous input means a 3D point, stored with a helper 'w-component', not a point in 4D space
   * - 'w = 1' means a position, 'w = 0' means a direction, so the translation/depth offset wouldn't apply
   *
   * Multiplying this homogeneous form of the 3D point by the matrix produces the clip-space coordinates:
   *
   * clip x: [ x * projectionScale / aspectRatio ]
   * clip y: [ y * projectionScale               ]
   * clip z: [ z * depthScale + 1 * depthOffset  ]
   * clip w: [ z * (-1) + 1 * 0 = -z             ]
   *
   * About spaces:
   * - world-space describes where an object is in the scene
   * - view-space describes the same object relative to the camera, before the projection
   * - the perspective projection matrix converts the 'view-space' coordinates into the 'clip-space' coordinates
   * - clip-space stores 4 components: [clip x, clip y, clip z, clip w]
   * - clip-space is where projected coordinates are checked against the visible camera volume
   * - after clipping, the perspective divide ('/ clip w') converts clip-space coordinates into NDC coordinates
   *
   * Notes about the projection scale:
   * - the scale uses the half-angle between the camera center line and the vertical view boundary (that's why tangent is used)
   * - tangent describes how wide the vertical view opens from this half-angle
   * - the inverse is used, because tangent gives the view opening, while the matrix needs a scale, that brings this opening back to the unit boundary
   * - the final scale value is the inverse of that opening value (tangent of half of the vertical FOV)
   *
   * Depth mapping:
   * - depth scale controls how the view-space z value is scaled for clip-space z
   * - depth offset shifts the scaled z value so 'near' and 'far' can be mapped to the clip-space depth limits
   *
   * Formulas:
   * - aspect ratio                = viewport width / viewport height
   * - vertical projection scale   = inverse of tangent(half vertical field of view)
   * - horizontal projection scale = vertical projection scale / aspect ratio
   * - depth scale                 = (far + near) / (near - far)
   * - depth offset                = 2 * far * near / (near - far)
   *
   * @param {number} fieldOfViewRadians - Vertical field of view in radians.
   * @param {number} aspectRatio        - Viewport aspect ratio (width / height).
   * @param {number} near               - Near clipping plane, must be '> 0'.
   * @param {number} far                - Far clipping plane, must be '> near'.
   * @returns {Float32Array}            - A new perspective projection matrix.
   */
  static createPerspective(fieldOfViewRadians, aspectRatio, near, far) {
    if (typeof fieldOfViewRadians !== "number" || typeof aspectRatio !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("`Matrix4.createPerspective` expects numeric arguments.");
    }
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
      throw new RangeError("`Matrix4.createPerspective` expects a positive aspect ratio.");
    }
    if (near <= MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
      throw new RangeError("`Matrix4.createPerspective` expects `0 < near < far`.");
    }
    return _Matrix4.#writePerspectiveIntoUnchecked(
      _Matrix4.#createEmpty(),
      fieldOfViewRadians,
      aspectRatio,
      near,
      far
    );
  }
  /**
   * Writes a perspective projection matrix to the provided output buffer.
   *
   * The output buffer is updated in place and returned without allocating a new matrix.
   *
   * @param {Float32Array} out                - Output 4x4 matrix buffer.
   * @param {number}       fieldOfViewRadians - Vertical field of view in radians.
   * @param {number}       aspectRatio        - Viewport width-to-height ratio.
   * @param {number}       near               - Near clipping distance.
   * @param {number}       far                - Far clipping distance.
   * @returns {Float32Array}                  - The provided output buffer.
   * @throws {TypeError}                      - If the output buffer or arguments are invalid.
   * @throws {RangeError}                     - If the aspect ratio or clipping distances are invalid.
   */
  static writePerspectiveTo(out, fieldOfViewRadians, aspectRatio, near, far) {
    if (!(out instanceof Float32Array) || out.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.writePerspectiveTo` expects out to be `Float32Array(16)`.");
    }
    if (typeof fieldOfViewRadians !== "number" || typeof aspectRatio !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("`Matrix4.writePerspectiveTo` expects numeric arguments.");
    }
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
      throw new RangeError("`Matrix4.writePerspectiveTo` expects a positive aspect ratio.");
    }
    if (near <= MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
      throw new RangeError("`Matrix4.writePerspectiveTo` expects `0 < near < far`.");
    }
    return _Matrix4.#writePerspectiveIntoUnchecked(
      out,
      fieldOfViewRadians,
      aspectRatio,
      near,
      far
    );
  }
  /**
   * Writes an orthographic projection matrix to the provided output buffer.
   *
   * The output buffer is updated in place and returned without allocating a new matrix.
   *
   * @param {Float32Array} out    - Output 4x4 matrix buffer.
   * @param {number}       left   - Left clipping plane.
   * @param {number}       right  - Right clipping plane.
   * @param {number}       bottom - Bottom clipping plane.
   * @param {number}       top    - Top clipping plane.
   * @param {number}       near   - Near clipping distance.
   * @param {number}       far    - Far clipping distance.
   * @returns {Float32Array}      - The provided output buffer.
   * @throws {TypeError}          - If the output buffer or arguments are invalid.
   * @throws {RangeError}         - If the projection bounds or clipping distances are invalid.
   */
  static writeOrthographicTo(out, left, right, bottom, top, near, far) {
    if (!(out instanceof Float32Array) || out.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.writeOrthographicTo` expects out to be `Float32Array(16)`.");
    }
    if (typeof left !== "number" || typeof right !== "number" || typeof bottom !== "number" || typeof top !== "number" || typeof near !== "number" || typeof far !== "number") {
      throw new TypeError("`Matrix4.writeOrthographicTo` expects numeric arguments.");
    }
    if (left === right) {
      throw new RangeError("`Matrix4.writeOrthographicTo` expects `left !== right`.");
    }
    if (bottom === top) {
      throw new RangeError("`Matrix4.writeOrthographicTo` expects `bottom !== top`.");
    }
    if (far <= near) {
      throw new RangeError("`Matrix4.writeOrthographicTo` expects `near < far`.");
    }
    const inverseWidth = MATH_MATRIX_VALUES.UNIT / (right - left);
    const inverseHeight = MATH_MATRIX_VALUES.UNIT / (top - bottom);
    const inverseDepth = MATH_MATRIX_VALUES.UNIT / (near - far);
    out[0] = MATH_ORTHOGRAPHIC.SCALE_NUMERATOR * inverseWidth;
    out[1] = MATH_MATRIX_VALUES.ZERO;
    out[2] = MATH_MATRIX_VALUES.ZERO;
    out[3] = MATH_MATRIX_VALUES.ZERO;
    out[4] = MATH_MATRIX_VALUES.ZERO;
    out[5] = MATH_ORTHOGRAPHIC.SCALE_NUMERATOR * inverseHeight;
    out[6] = MATH_MATRIX_VALUES.ZERO;
    out[7] = MATH_MATRIX_VALUES.ZERO;
    out[8] = MATH_MATRIX_VALUES.ZERO;
    out[9] = MATH_MATRIX_VALUES.ZERO;
    out[10] = MATH_ORTHOGRAPHIC.SCALE_NUMERATOR * inverseDepth;
    out[11] = MATH_MATRIX_VALUES.ZERO;
    out[12] = -(right + left) * inverseWidth;
    out[13] = -(top + bottom) * inverseHeight;
    out[14] = (far + near) * inverseDepth;
    out[15] = MATH_MATRIX_VALUES.UNIT;
    return out;
  }
  /**
   * Creates a translation matrix:
   *
   * [ 1 0 0 translateX ]
   * [ 0 1 0 translateY ]
   * [ 0 0 1 translateZ ]
   * [ 0 0 0 1          ]
   *
   * @param {number} translateX - Translation along X axis.
   * @param {number} translateY - Translation along Y axis.
   * @param {number} translateZ - Translation along Z axis.
   * @returns {Float32Array}    - A new translation matrix.
   */
  static createTranslation(translateX, translateY, translateZ) {
    if (typeof translateX !== "number" || typeof translateY !== "number" || typeof translateZ !== "number") {
      throw new TypeError("`Matrix4.createTranslation` expects numeric arguments.");
    }
    const out = _Matrix4.createIdentity();
    out[12] = translateX;
    out[13] = translateY;
    out[14] = translateZ;
    return out;
  }
  /**
   * Creates a rotation matrix around the X axis:
   *
   * [ 1 0         0        0 ]
   * [ 0 cosAngle -sinAngle 0 ]
   * [ 0 sinAngle  cosAngle 0 ]
   * [ 0 0         0        1 ]
   *
   * @param {number} angleRadians - Angle in radians.
   * @returns {Float32Array}      - A new rotation matrix.
   */
  static createRotationX(angleRadians) {
    if (typeof angleRadians !== "number") {
      throw new TypeError("`Matrix4.createRotationX` expects a numeric argument.");
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
   * Creates a rotation matrix around the Y axis:
   *
   * [  cosAngle 0 sinAngle 0 ]
   * [  0        1 0        0 ]
   * [ -sinAngle 0 cosAngle 0 ]
   * [  0        0 0        1 ]
   *
   * @param {number} angleRadians - Angle in radians.
   * @returns {Float32Array}      - A new rotation matrix.
   */
  static createRotationY(angleRadians) {
    if (typeof angleRadians !== "number") {
      throw new TypeError("`Matrix4.createRotationY` expects a numeric argument.");
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
   * Creates a rotation matrix around the Z axis:
   *
   * [ cosAngle -sinAngle 0 0 ]
   * [ sinAngle  cosAngle 0 0 ]
   * [ 0         0        1 0 ]
   * [ 0         0        0 1 ]
   *
   * @param {number} angleRadians - Angle in radians.
   * @returns {Float32Array}      - A new rotation matrix.
   */
  static createRotationZ(angleRadians) {
    if (typeof angleRadians !== "number") {
      throw new TypeError("`Matrix4.createRotationZ` expects a numeric argument.");
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
   * Multiplies two 4x4 matrices: 'result = leftMatrix * rightMatrix'.
   *
   * Order matters. With column-vector style, right matrix is applied first.
   *
   * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
   * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
   * @returns {Float32Array}           - A new matrix containing the product.
   */
  static multiply(leftMatrix, rightMatrix) {
    if (!(leftMatrix instanceof Float32Array) || leftMatrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT || !(rightMatrix instanceof Float32Array) || rightMatrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.multiply` expects two 4x4 `Float32Array` matrices.");
    }
    return _Matrix4.#multiplyIntoUnchecked(_Matrix4.#createEmpty(), leftMatrix, rightMatrix);
  }
  /**
   * Multiplies two 4x4 matrices into an existing output matrix:
   * 'out = leftMatrix * rightMatrix'.
   *
   * Notes:
   * - order matters, with column-vector style the right matrix is applied first
   * - out must not be the same object as 'leftMatrix' or 'rightMatrix'
   *
   * @param {Float32Array} out         - Output 4x4 matrix.
   * @param {Float32Array} leftMatrix  - Left-hand matrix (4x4).
   * @param {Float32Array} rightMatrix - Right-hand matrix (4x4).
   * @returns {Float32Array}           - The output matrix (out).
   */
  static multiplyTo(out, leftMatrix, rightMatrix) {
    if (!(out instanceof Float32Array) || out.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT || !(leftMatrix instanceof Float32Array) || leftMatrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT || !(rightMatrix instanceof Float32Array) || rightMatrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.multiplyTo` expects three 4x4 `Float32Array` matrices.");
    }
    if (out === leftMatrix || out === rightMatrix) {
      throw new Error("`Matrix4.multiplyTo` does not support in-place multiplication. Use a separate output matrix.");
    }
    return _Matrix4.#multiplyIntoUnchecked(out, leftMatrix, rightMatrix);
  }
  /**
   * Multiplies several matrices in sequence:
   * 'result = m0 * m1 * m2 * ... * mn'
   *
   * Notes:
   * - order matters, with column-vector style, the last matrix is applied first
   * - if no matrices are provided, returns a new identity matrix
   * - if exactly one matrix is provided, returns the same matrix instance (no copy)
   *
   * @param {...Float32Array} matrices - Matrices to multiply, in order.
   * @returns {Float32Array}           - The resulting matrix.
   */
  static multiplyMany(...matrices) {
    if (matrices.length === 0) {
      return _Matrix4.createIdentity();
    }
    for (const matrix of matrices) {
      if (!(matrix instanceof Float32Array) || matrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
        throw new TypeError("`Matrix4.multiplyMany` expects the 4x4 `Float32Array` matrices.");
      }
    }
    let result = matrices[0];
    for (let index = 1; index < matrices.length; index += 1) {
      result = _Matrix4.multiply(result, matrices[index]);
    }
    return result;
  }
  /**
   * Transposes a 4x4 matrix by swapping its rows and columns.
   *
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - A new transposed matrix.
   */
  static transpose(matrix) {
    if (!(matrix instanceof Float32Array) || matrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.transpose` expects a 4x4 `Float32Array` matrix.");
    }
    return _Matrix4.#transposeIntoUnchecked(_Matrix4.#createEmpty(), matrix);
  }
  /**
   * Transposes a 4x4 matrix into an existing output matrix by swapping rows and columns.
   *
   * Note: out must not be the same object as matrix.
   *
   * @param {Float32Array} out    - Output 4x4 matrix.
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - The output matrix (out).
   */
  static transposeTo(out, matrix) {
    if (!(out instanceof Float32Array) || out.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT || !(matrix instanceof Float32Array) || matrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.transposeTo` expects two 4x4 `Float32Array` matrices.");
    }
    if (out === matrix) {
      throw new Error("`Matrix4.transposeTo` does not support in-place transpose. Use a separate output matrix.");
    }
    return _Matrix4.#transposeIntoUnchecked(out, matrix);
  }
  /**
   * Inverts a 4x4 matrix using its adjugate and determinant.
   *
   * A near-zero determinant means the matrix is singular or unsafe to invert.
   *
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - A new inverted matrix.
   */
  static invert(matrix) {
    if (!(matrix instanceof Float32Array) || matrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.invert` expects a 4x4 `Float32Array` matrix.");
    }
    return _Matrix4.#invertIntoUnchecked(_Matrix4.#createEmpty(), matrix);
  }
  /**
   * Inverts a 4x4 matrix into an existing output matrix using its adjugate and determinant.
   *
   * A near-zero determinant means the matrix is singular or unsafe to invert.
   *
   * @param {Float32Array} out    - Output 4x4 matrix.
   * @param {Float32Array} matrix - Input 4x4 matrix.
   * @returns {Float32Array}      - The output matrix (out).
   */
  static invertTo(out, matrix) {
    if (!(out instanceof Float32Array) || out.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT || !(matrix instanceof Float32Array) || matrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
      throw new TypeError("`Matrix4.invertTo` expects two 4x4 `Float32Array` matrices.");
    }
    if (out === matrix) {
      throw new Error("`Matrix4.invertTo` does not support in-place inversion.");
    }
    return _Matrix4.#invertIntoUnchecked(out, matrix);
  }
  /**
   * Multiplies two validated 4x4 matrices into out.
   *
   * Assumes public validation already checked matrix types, sizes, and output aliasing.
   *
   * @param {Float32Array} out         - Output 4x4 matrix that will receive the result.
   * @param {Float32Array} leftMatrix  - Left-hand 4x4 matrix.
   * @param {Float32Array} rightMatrix - Right-hand 4x4 matrix.
   * @returns {Float32Array}           - The output matrix (out).
   * @private
   */
  static #multiplyIntoUnchecked(out, leftMatrix, rightMatrix) {
    for (let columnIndex = 0; columnIndex < MATH_LAYOUT.MATRIX_COLUMN_COUNT; columnIndex += 1) {
      const rightColumnOffset = columnIndex * MATH_LAYOUT.MATRIX_STRIDE;
      for (let rowIndex = 0; rowIndex < MATH_LAYOUT.MATRIX_ROW_COUNT; rowIndex += 1) {
        const resultIndex = rightColumnOffset + rowIndex;
        out[resultIndex] = leftMatrix[0 * MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 0] + leftMatrix[1 * MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 1] + leftMatrix[2 * MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 2] + leftMatrix[3 * MATH_LAYOUT.MATRIX_STRIDE + rowIndex] * rightMatrix[rightColumnOffset + 3];
      }
    }
    return out;
  }
  /**
   * Writes a perspective projection matrix to the provided output buffer.
   *
   * Assumes public method validation already checked the output buffer and projection parameters.
   *
   * @param {Float32Array} out                - Output 4x4 matrix.
   * @param {number}       fieldOfViewRadians - Vertical field of view in radians.
   * @param {number}       aspectRatio        - Viewport width-to-height ratio.
   * @param {number}       near               - Near clipping distance.
   * @param {number}       far                - Far clipping distance.
   * @returns {Float32Array}                  - The output matrix (out).
   * @private
   */
  static #writePerspectiveIntoUnchecked(out, fieldOfViewRadians, aspectRatio, near, far) {
    const inverseDepthRange = MATH_PERSPECTIVE.DEPTH_RANGE_NUMERATOR / (near - far);
    const halfFieldOfViewRadians = fieldOfViewRadians / MATH_PERSPECTIVE.HALF_FIELD_OF_VIEW_DIVISOR;
    const projectionScale = MATH_PERSPECTIVE.PROJECTION_SCALE_NUMERATOR / Math.tan(halfFieldOfViewRadians);
    out[0] = projectionScale / aspectRatio;
    out[1] = MATH_MATRIX_VALUES.ZERO;
    out[2] = MATH_MATRIX_VALUES.ZERO;
    out[3] = MATH_MATRIX_VALUES.ZERO;
    out[4] = MATH_MATRIX_VALUES.ZERO;
    out[5] = projectionScale;
    out[6] = MATH_MATRIX_VALUES.ZERO;
    out[7] = MATH_MATRIX_VALUES.ZERO;
    out[8] = MATH_MATRIX_VALUES.ZERO;
    out[9] = MATH_MATRIX_VALUES.ZERO;
    out[10] = (far + near) * inverseDepthRange;
    out[11] = MATH_PERSPECTIVE.W_COMPONENT_SCALE;
    out[12] = MATH_MATRIX_VALUES.ZERO;
    out[13] = MATH_MATRIX_VALUES.ZERO;
    out[14] = MATH_PERSPECTIVE.Z_RANGE_MULTIPLIER * far * near * inverseDepthRange;
    out[15] = MATH_MATRIX_VALUES.ZERO;
    return out;
  }
  /**
   * Transposes a validated 4x4 matrix into out.
   *
   * Assumes public validation already checked matrix types, sizes, and output aliasing.
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
   * Inverts a validated 4x4 matrix into out.
   *
   * Uses the adjugate and determinant, throws when the determinant is too close to zero.
   * Assumes public validation already checked matrix types, sizes, and output aliasing.
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
    if (Math.abs(determinant) < MATH_MATRIX_INVERSION.MIN_INVERTIBLE_DETERMINANT_ABS) {
      throw new Error("`Matrix4.#invertIntoUnchecked` matrix is not invertible.");
    }
    const inverseDeterminant = MATH_MATRIX_INVERSION.INVERSE_DETERMINANT_NUMERATOR / determinant;
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
    return new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
  }
};

// core/math/vector3.js
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
   * @param {Function | null} [onChange = null] - Called, when any component changes.
   */
  constructor(x = MATH_VECTOR3_COMPONENTS.ZERO, y = MATH_VECTOR3_COMPONENTS.ZERO, z = MATH_VECTOR3_COMPONENTS.ZERO, onChange = null) {
    if (onChange !== null && typeof onChange !== "function") {
      throw new TypeError("Vector3 constructor expects `onChange` as a function or null.");
    }
    this.#x = MATH_VECTOR3_COMPONENTS.ZERO;
    this.#y = MATH_VECTOR3_COMPONENTS.ZERO;
    this.#z = MATH_VECTOR3_COMPONENTS.ZERO;
    this.#onChange = onChange;
    this.set(x, y, z);
  }
  /**
   * Creates a new (0, 0, 0) vector.
   *
   * @param {Function | null} [onChange = null] - Optional callback invoked, when the vector changes.
   * @returns {Vector3}                         - New vector with all components set to zero.
   */
  static createZero(onChange = null) {
    return new _Vector3(
      MATH_VECTOR3_COMPONENTS.ZERO,
      MATH_VECTOR3_COMPONENTS.ZERO,
      MATH_VECTOR3_COMPONENTS.ZERO,
      onChange
    );
  }
  /**
   * Creates a new (1, 1, 1) vector.
   *
   * This value is commonly used as a unit scale vector.
   *
   * @param {Function | null} [onChange = null] - Optional callback invoked, when the vector changes.
   * @returns {Vector3}                         - New vector with all components set to one.
   */
  static createUnitScale(onChange = null) {
    return new _Vector3(
      MATH_VECTOR3_COMPONENTS.UNIT,
      MATH_VECTOR3_COMPONENTS.UNIT,
      MATH_VECTOR3_COMPONENTS.UNIT,
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
   * Sets or clears the 'onChange' callback.
   *
   * @param {Function | null} onChange - Callback invoked, when any component changes or null to disable the change notifications.
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
   * Emits the change notification, when a callback is registered.
   *
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

// core/math/vector3-math.js
var VECTOR3_COMPONENT_COUNT = 3;
var VECTOR3_X_INDEX = 0;
var VECTOR3_Y_INDEX = 1;
var VECTOR3_Z_INDEX = 2;
var ZERO_VALUE = 0;
var ONE_VALUE = 1;
var DEFAULT_EPSILON = 1e-6;
var MIN_NORMALIZE_LENGTH = 1e-8;
var Vector3Math = class _Vector3Math {
  /**
   * Adds two vectors.
   *
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {Vector3 | Float32Array} firstVector  - First vector.
   * @param {Vector3 | Float32Array} secondVector - Second vector.
   * @returns {Vector3 | Float32Array}
   * @throws {TypeError}  When any vector is invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static add(outputVector, firstVector, secondVector) {
    _Vector3Math.#assertVector3Like(outputVector, "outputVector");
    _Vector3Math.#assertVector3Like(firstVector, "firstVector");
    _Vector3Math.#assertVector3Like(secondVector, "secondVector");
    const x = _Vector3Math.#getX(firstVector) + _Vector3Math.#getX(secondVector);
    const y = _Vector3Math.#getY(firstVector) + _Vector3Math.#getY(secondVector);
    const z = _Vector3Math.#getZ(firstVector) + _Vector3Math.#getZ(secondVector);
    return _Vector3Math.#write(outputVector, x, y, z);
  }
  /**
   * Subtracts the second vector from the first vector.
   *
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {Vector3 | Float32Array} firstVector  - First vector.
   * @param {Vector3 | Float32Array} secondVector - Second vector.
   * @returns {Vector3 | Float32Array}
   * @throws {TypeError}  When any vector is invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static sub(outputVector, firstVector, secondVector) {
    _Vector3Math.#assertVector3Like(outputVector, "outputVector");
    _Vector3Math.#assertVector3Like(firstVector, "firstVector");
    _Vector3Math.#assertVector3Like(secondVector, "secondVector");
    const x = _Vector3Math.#getX(firstVector) - _Vector3Math.#getX(secondVector);
    const y = _Vector3Math.#getY(firstVector) - _Vector3Math.#getY(secondVector);
    const z = _Vector3Math.#getZ(firstVector) - _Vector3Math.#getZ(secondVector);
    return _Vector3Math.#write(outputVector, x, y, z);
  }
  /**
   * Scales a vector by a scalar.
   *
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {Vector3 | Float32Array} inputVector  - Input vector.
   * @param {number} scalar                       - Scalar multiplier.
   * @returns {Vector3 | Float32Array}
   * @throws {TypeError}  When vectors or scalar are invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static scale(outputVector, inputVector, scalar) {
    _Vector3Math.#assertVector3Like(outputVector, "outputVector");
    _Vector3Math.#assertVector3Like(inputVector, "inputVector");
    if (typeof scalar !== "number" || !Number.isFinite(scalar)) {
      throw new TypeError("`Vector3Math.scale` expects `scalar` as a finite number.");
    }
    const x = _Vector3Math.#getX(inputVector) * scalar;
    const y = _Vector3Math.#getY(inputVector) * scalar;
    const z = _Vector3Math.#getZ(inputVector) * scalar;
    return _Vector3Math.#write(outputVector, x, y, z);
  }
  /**
   * Computes vector length.
   *
   * @param {Vector3 | Float32Array} inputVector - Input vector.
   * @returns {number}
   * @throws {TypeError}  When vector is invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static length(inputVector) {
    _Vector3Math.#assertVector3Like(inputVector, "inputVector");
    const x = _Vector3Math.#getX(inputVector);
    const y = _Vector3Math.#getY(inputVector);
    const z = _Vector3Math.#getZ(inputVector);
    return Math.sqrt(x * x + y * y + z * z);
  }
  /**
   * Computes distance between two vectors.
   *
   * @param {Vector3 | Float32Array} firstVector  - First vector.
   * @param {Vector3 | Float32Array} secondVector - Second vector.
   * @returns {number}
   * @throws {TypeError}  When vectors are invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static distance(firstVector, secondVector) {
    _Vector3Math.#assertVector3Like(firstVector, "firstVector");
    _Vector3Math.#assertVector3Like(secondVector, "secondVector");
    const deltaX = _Vector3Math.#getX(firstVector) - _Vector3Math.#getX(secondVector);
    const deltaY = _Vector3Math.#getY(firstVector) - _Vector3Math.#getY(secondVector);
    const deltaZ = _Vector3Math.#getZ(firstVector) - _Vector3Math.#getZ(secondVector);
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
  }
  /**
   * Normalizes a vector.
   *
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {Vector3 | Float32Array} inputVector  - Input vector.
   * @returns {Vector3 | Float32Array}
   * @throws {TypeError}  When vectors are invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static normalize(outputVector, inputVector) {
    _Vector3Math.#assertVector3Like(outputVector, "outputVector");
    _Vector3Math.#assertVector3Like(inputVector, "inputVector");
    const vectorLength = _Vector3Math.length(inputVector);
    if (vectorLength <= MIN_NORMALIZE_LENGTH) {
      return _Vector3Math.#write(outputVector, ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
    }
    const inverseLength = ONE_VALUE / vectorLength;
    return _Vector3Math.scale(outputVector, inputVector, inverseLength);
  }
  /**
   * Computes dot product.
   *
   * @param {Vector3 | Float32Array} firstVector  - First vector.
   * @param {Vector3 | Float32Array} secondVector - Second vector.
   * @returns {number}
   * @throws {TypeError}  When vectors are invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static dot(firstVector, secondVector) {
    _Vector3Math.#assertVector3Like(firstVector, "firstVector");
    _Vector3Math.#assertVector3Like(secondVector, "secondVector");
    return _Vector3Math.#getX(firstVector) * _Vector3Math.#getX(secondVector) + _Vector3Math.#getY(firstVector) * _Vector3Math.#getY(secondVector) + _Vector3Math.#getZ(firstVector) * _Vector3Math.#getZ(secondVector);
  }
  /**
   * Computes cross product.
   *
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {Vector3 | Float32Array} firstVector  - First vector.
   * @param {Vector3 | Float32Array} secondVector - Second vector.
   * @returns {Vector3 | Float32Array}
   * @throws {TypeError}  When vectors are invalid.
   * @throws {RangeError} When `Float32Array` vectors are not `length 3`.
   */
  static cross(outputVector, firstVector, secondVector) {
    _Vector3Math.#assertVector3Like(outputVector, "outputVector");
    _Vector3Math.#assertVector3Like(firstVector, "firstVector");
    _Vector3Math.#assertVector3Like(secondVector, "secondVector");
    const firstX = _Vector3Math.#getX(firstVector);
    const firstY = _Vector3Math.#getY(firstVector);
    const firstZ = _Vector3Math.#getZ(firstVector);
    const secondX = _Vector3Math.#getX(secondVector);
    const secondY = _Vector3Math.#getY(secondVector);
    const secondZ = _Vector3Math.#getZ(secondVector);
    const x = firstY * secondZ - firstZ * secondY;
    const y = firstZ * secondX - firstX * secondZ;
    const z = firstX * secondY - firstY * secondX;
    return _Vector3Math.#write(outputVector, x, y, z);
  }
  /**
   * Linearly interpolates between vectors.
   *
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {Vector3 | Float32Array} startVector  - Start vector.
   * @param {Vector3 | Float32Array} endVector    - End vector.
   * @param {number} interpolationFactor          - Interpolation factor in [0..1].
   * @returns {Vector3 | Float32Array}
   * @throws {TypeError}  When vectors or interpolation factor are invalid.
   * @throws {RangeError} When Float32Array vectors are not `length 3`.
   */
  static lerp(outputVector, startVector, endVector, interpolationFactor) {
    _Vector3Math.#assertVector3Like(outputVector, "outputVector");
    _Vector3Math.#assertVector3Like(startVector, "startVector");
    _Vector3Math.#assertVector3Like(endVector, "endVector");
    if (typeof interpolationFactor !== "number" || !Number.isFinite(interpolationFactor)) {
      throw new TypeError("`Vector3Math.lerp` expects `interpolationFactor` as a finite number.");
    }
    const x = _Vector3Math.#getX(startVector) + (_Vector3Math.#getX(endVector) - _Vector3Math.#getX(startVector)) * interpolationFactor;
    const y = _Vector3Math.#getY(startVector) + (_Vector3Math.#getY(endVector) - _Vector3Math.#getY(startVector)) * interpolationFactor;
    const z = _Vector3Math.#getZ(startVector) + (_Vector3Math.#getZ(endVector) - _Vector3Math.#getZ(startVector)) * interpolationFactor;
    return _Vector3Math.#write(outputVector, x, y, z);
  }
  /**
   * Clamps vector components to the [min..max] range.
   *
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {Vector3 | Float32Array} inputVector  - Input vector.
   * @param {number} min                          - Minimum component value.
   * @param {number} max                          - Maximum component value.
   * @returns {Vector3 | Float32Array}
   * @throws {TypeError}  When vectors or bounds are invalid.
   * @throws {RangeError} When Float32Array vectors are not `length 3`.
   */
  static clamp(outputVector, inputVector, min, max) {
    _Vector3Math.#assertVector3Like(outputVector, "outputVector");
    _Vector3Math.#assertVector3Like(inputVector, "inputVector");
    if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max)) {
      throw new TypeError("`Vector3Math.clamp` expects `min` and `max` as finite numbers.");
    }
    const x = Math.max(min, Math.min(max, _Vector3Math.#getX(inputVector)));
    const y = Math.max(min, Math.min(max, _Vector3Math.#getY(inputVector)));
    const z = Math.max(min, Math.min(max, _Vector3Math.#getZ(inputVector)));
    return _Vector3Math.#write(outputVector, x, y, z);
  }
  /**
   * Compares two vectors with a tolerance.
   *
   * @param {Vector3 | Float32Array} firstVector  - First vector.
   * @param {Vector3 | Float32Array} secondVector - Second vector.
   * @param {number} [epsilon = 1e-6]             - Tolerance.
   * @returns {boolean}
   * @throws {TypeError}  When vectors or epsilon are invalid.
   * @throws {RangeError} When Float32Array vectors are not `length 3`.
   */
  static approxEquals(firstVector, secondVector, epsilon = DEFAULT_EPSILON) {
    _Vector3Math.#assertVector3Like(firstVector, "firstVector");
    _Vector3Math.#assertVector3Like(secondVector, "secondVector");
    if (typeof epsilon !== "number" || !Number.isFinite(epsilon)) {
      throw new TypeError("`Vector3Math.approxEquals` expects `epsilon` as a finite number.");
    }
    return Math.abs(_Vector3Math.#getX(firstVector) - _Vector3Math.#getX(secondVector)) <= epsilon && Math.abs(_Vector3Math.#getY(firstVector) - _Vector3Math.#getY(secondVector)) <= epsilon && Math.abs(_Vector3Math.#getZ(firstVector) - _Vector3Math.#getZ(secondVector)) <= epsilon;
  }
  /**
   * @param {Vector3 | Float32Array} vector - Vector to validate.
   * @param {string} argumentName           - Argument name for error message.
   * @private
   */
  static #assertVector3Like(vector, argumentName) {
    if (!(vector instanceof Vector3) && !(vector instanceof Float32Array)) {
      throw new TypeError(`\`Vector3Math\` expects \`${argumentName}\` as Vector3 or Float32Array.`);
    }
    if (vector instanceof Float32Array && vector.length !== VECTOR3_COMPONENT_COUNT) {
      throw new RangeError("`Vector3Math` expects Float32Array(3) vectors.");
    }
  }
  /**
   * @param {Vector3 | Float32Array} vector - Input vector.
   * @returns {number}
   * @private
   */
  static #getX(vector) {
    return vector instanceof Vector3 ? vector.x : vector[VECTOR3_X_INDEX];
  }
  /**
   * @param {Vector3 | Float32Array} vector - Input vector.
   * @returns {number}
   * @private
   */
  static #getY(vector) {
    return vector instanceof Vector3 ? vector.y : vector[VECTOR3_Y_INDEX];
  }
  /**
   * @param {Vector3 | Float32Array} vector - Input vector.
   * @returns {number}
   * @private
   */
  static #getZ(vector) {
    return vector instanceof Vector3 ? vector.z : vector[VECTOR3_Z_INDEX];
  }
  /**
   * @param {Vector3 | Float32Array} outputVector - Output vector.
   * @param {number} x                            - X component.
   * @param {number} y                            - Y component.
   * @param {number} z                            - Z component.
   * @returns {Vector3 | Float32Array}
   * @private
   */
  static #write(outputVector, x, y, z) {
    if (outputVector instanceof Vector3) {
      outputVector.set(x, y, z);
      return outputVector;
    }
    outputVector[VECTOR3_X_INDEX] = x;
    outputVector[VECTOR3_Y_INDEX] = y;
    outputVector[VECTOR3_Z_INDEX] = z;
    return outputVector;
  }
};

// core/math/curve3.js
var DEFAULT_SAMPLE_SEGMENTS = 32;
var MIN_SAMPLE_SEGMENTS = 1;
var SAMPLE_START_INDEX = 0;
var SAMPLE_INDEX_INCREMENT = 1;
var SAMPLE_START_PARAMETER = 0;
var SAMPLE_END_PARAMETER = 1;
var Curve3 = class _Curve3 {
  /**
   * Abstract curve base.
   *
   * @throws {Error} When instantiated directly.
   */
  constructor() {
    if (new.target === _Curve3) {
      throw new Error("`Curve3` is abstract and must be subclassed.");
    }
  }
  /* eslint-disable */
  /**
   * Computes a point on the curve at normalized parameter.
   *
   * @param {number} normalizedParameter - Parameter in [0..1].
   * @param {Vector3} [out]              - Optional output vector.
   * @returns {Vector3}
   * @throws {Error} When not implemented by subclass.
   */
  getPoint(normalizedParameter, out = new Vector3()) {
    throw new Error("`Curve3.getPoint` must be implemented in subclasses.");
  }
  /**
   * Computes a tangent on the curve at normalized parameter.
   *
   * @param {number} normalizedParameter - Parameter in [0..1].
   * @param {Vector3} [out]              - Optional output vector.
   * @returns {Vector3}
   * @throws {Error} When not implemented by subclass.
   */
  getTangent(normalizedParameter, out = new Vector3()) {
    throw new Error("`Curve3.getTangent` must be implemented in subclasses.");
  }
  /* eslint-enable */
  /**
   * Returns a point on the curve at normalized parameter.
   *
   * @param {number} normalizedParameter - Parameter in [0..1].
   * @param {Vector3} [out]              - Optional output vector.
   * @returns {Vector3}
   * @throws {Error} When not implemented by subclass.
   */
  getPointAt(normalizedParameter, out = new Vector3()) {
    return this.getPoint(normalizedParameter, out);
  }
  /**
   * Returns a tangent on the curve at normalized parameter.
   *
   * @param {number} normalizedParameter - Parameter in [0..1].
   * @param {Vector3} [out]              - Optional output vector.
   * @returns {Vector3}
   * @throws {Error} When not implemented by subclass.
   */
  getTangentAt(normalizedParameter, out = new Vector3()) {
    return this.getTangent(normalizedParameter, out);
  }
  /**
   * Samples the curve into the polyline.
   *
   * @param {number} [segments = 32] - Sample segment count.
   * @returns {Vector3[]}
   * @throws {TypeError}  When segments is not a finite number.
   * @throws {RangeError} When segments is not an `integer >= 1`.
   */
  getPoints(segments = DEFAULT_SAMPLE_SEGMENTS) {
    if (typeof segments !== "number" || !Number.isFinite(segments)) {
      throw new TypeError("`Curve3.getPoints` expects `segments` as a finite number.");
    }
    if (!Number.isInteger(segments) || segments < MIN_SAMPLE_SEGMENTS) {
      throw new RangeError("`Curve3.getPoints` expects `segments` as an integer >= 1.");
    }
    const points = [];
    const segmentCount = segments;
    const maxIndex = segmentCount;
    for (let index = SAMPLE_START_INDEX; index <= maxIndex; index += SAMPLE_INDEX_INCREMENT) {
      const sampleParameter = SAMPLE_START_PARAMETER + (SAMPLE_END_PARAMETER - SAMPLE_START_PARAMETER) * (index / segmentCount);
      points.push(this.getPoint(sampleParameter, new Vector3()));
    }
    return points;
  }
};

// core/math/catmull-rom-curve3.js
var MIN_CONTROL_POINT_COUNT = 2;
var DEFAULT_CLOSED = false;
var CURVE_PARAMETER_MIN = 0;
var CURVE_PARAMETER_MAX = 1;
var ZERO_VALUE2 = 0;
var OPEN_CURVE_LAST_SEGMENT_OFFSET = 1;
var ONE_VALUE2 = 1;
var TWO_VALUE = 2;
var THREE_VALUE = 3;
var FOUR_VALUE = 4;
var FIVE_VALUE = 5;
var CATMULL_ROM_TENSION = 0.5;
var TANGENT_EPSILON = 1e-8;
var CatmullRomCurve3 = class _CatmullRomCurve3 extends Curve3 {
  /**
   * Control points used to build the curve.
   *
   * @type {Vector3[]}
   * @private
   */
  #points;
  /**
   * Whether the curve is closed (wraps around to the first point).
   *
   * @type {boolean}
   * @private
   */
  #closed;
  /**
   * @param {Vector3[]} points               - Control points.
   * @param {Object} [options]               - Optional options.
   * @param {boolean} [options.closed=false] - Whether the curve is closed.
   * @throws {TypeError}  When inputs are invalid.
   * @throws {RangeError} When points are insufficient.
   */
  constructor(points, options = {}) {
    super();
    if (!Array.isArray(points)) {
      throw new TypeError("`CatmullRomCurve3` expects `points` as an array of `Vector3`.");
    }
    if (points.length < MIN_CONTROL_POINT_COUNT) {
      throw new RangeError("`CatmullRomCurve3` expects at least 2 control points.");
    }
    for (const point of points) {
      if (!(point instanceof Vector3)) {
        throw new TypeError("`CatmullRomCurve3` expects all points to be `Vector3` instances.");
      }
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`CatmullRomCurve3` expects options as a plain object.");
    }
    const { closed = DEFAULT_CLOSED } = options;
    if (typeof closed !== "boolean") {
      throw new TypeError("`CatmullRomCurve3` option `closed` must be a boolean.");
    }
    this.#points = points.slice();
    this.#closed = closed;
  }
  /**
   * @returns {Vector3[]}
   */
  get points() {
    return this.#points;
  }
  /**
   * @returns {boolean}
   */
  get closed() {
    return this.#closed;
  }
  /**
   * @param {number} curveParameter - Parameter in [0..1].
   * @param {Vector3} [out]         - Optional output vector.
   * @returns {Vector3}
   * @throws {TypeError} When inputs are invalid.
   */
  getPoint(curveParameter, out = new Vector3()) {
    if (typeof curveParameter !== "number" || !Number.isFinite(curveParameter)) {
      throw new TypeError("`CatmullRomCurve3.getPoint` expects `curveParameter` as a finite number.");
    }
    if (!(out instanceof Vector3)) {
      throw new TypeError("`CatmullRomCurve3.getPoint` expects `out` as a Vector3.");
    }
    const clampedCurveParameter = _CatmullRomCurve3.#clampCurveParameter(curveParameter);
    const segmentCount = this.#closed ? this.#points.length : this.#points.length - OPEN_CURVE_LAST_SEGMENT_OFFSET;
    const scaledCurveParameter = clampedCurveParameter * segmentCount;
    const segmentIndex = Math.min(Math.floor(scaledCurveParameter), segmentCount - OPEN_CURVE_LAST_SEGMENT_OFFSET);
    const segmentParameter = scaledCurveParameter - segmentIndex;
    const previousControlPoint = this.#getPointForSegment(segmentIndex - ONE_VALUE2);
    const startControlPoint = this.#getPointForSegment(segmentIndex);
    const endControlPoint = this.#getPointForSegment(segmentIndex + ONE_VALUE2);
    const nextControlPoint = this.#getPointForSegment(segmentIndex + TWO_VALUE);
    const segmentParameterSquared = segmentParameter * segmentParameter;
    const segmentParameterCubed = segmentParameterSquared * segmentParameter;
    const x = CATMULL_ROM_TENSION * (TWO_VALUE * startControlPoint.x + (-previousControlPoint.x + endControlPoint.x) * segmentParameter + (TWO_VALUE * previousControlPoint.x - FIVE_VALUE * startControlPoint.x + FOUR_VALUE * endControlPoint.x - nextControlPoint.x) * segmentParameterSquared + (-previousControlPoint.x + THREE_VALUE * startControlPoint.x - THREE_VALUE * endControlPoint.x + nextControlPoint.x) * segmentParameterCubed);
    const y = CATMULL_ROM_TENSION * (TWO_VALUE * startControlPoint.y + (-previousControlPoint.y + endControlPoint.y) * segmentParameter + (TWO_VALUE * previousControlPoint.y - FIVE_VALUE * startControlPoint.y + FOUR_VALUE * endControlPoint.y - nextControlPoint.y) * segmentParameterSquared + (-previousControlPoint.y + THREE_VALUE * startControlPoint.y - THREE_VALUE * endControlPoint.y + nextControlPoint.y) * segmentParameterCubed);
    const z = CATMULL_ROM_TENSION * (TWO_VALUE * startControlPoint.z + (-previousControlPoint.z + endControlPoint.z) * segmentParameter + (TWO_VALUE * previousControlPoint.z - FIVE_VALUE * startControlPoint.z + FOUR_VALUE * endControlPoint.z - nextControlPoint.z) * segmentParameterSquared + (-previousControlPoint.z + THREE_VALUE * startControlPoint.z - THREE_VALUE * endControlPoint.z + nextControlPoint.z) * segmentParameterCubed);
    return out.set(x, y, z);
  }
  /**
   * @param {number} curveParameter - Parameter in [0..1].
   * @param {Vector3} [out]         - Optional output vector.
   * @returns {Vector3}
   * @throws {TypeError} When inputs are invalid.
   */
  getTangent(curveParameter, out = new Vector3()) {
    if (typeof curveParameter !== "number" || !Number.isFinite(curveParameter)) {
      throw new TypeError("`CatmullRomCurve3.getTangent` expects `curveParameter` as a finite number.");
    }
    if (!(out instanceof Vector3)) {
      throw new TypeError("`CatmullRomCurve3.getTangent` expects `out` as a Vector3.");
    }
    const clampedCurveParameter = _CatmullRomCurve3.#clampCurveParameter(curveParameter);
    const segmentCount = this.#closed ? this.#points.length : this.#points.length - OPEN_CURVE_LAST_SEGMENT_OFFSET;
    const scaledCurveParameter = clampedCurveParameter * segmentCount;
    const segmentIndex = Math.min(Math.floor(scaledCurveParameter), segmentCount - OPEN_CURVE_LAST_SEGMENT_OFFSET);
    const segmentParameter = scaledCurveParameter - segmentIndex;
    const previousControlPoint = this.#getPointForSegment(segmentIndex - ONE_VALUE2);
    const startControlPoint = this.#getPointForSegment(segmentIndex);
    const endControlPoint = this.#getPointForSegment(segmentIndex + ONE_VALUE2);
    const nextControlPoint = this.#getPointForSegment(segmentIndex + TWO_VALUE);
    const segmentParameterSquared = segmentParameter * segmentParameter;
    const x = CATMULL_ROM_TENSION * (-previousControlPoint.x + endControlPoint.x + TWO_VALUE * (TWO_VALUE * previousControlPoint.x - FIVE_VALUE * startControlPoint.x + FOUR_VALUE * endControlPoint.x - nextControlPoint.x) * segmentParameter + THREE_VALUE * (-previousControlPoint.x + THREE_VALUE * startControlPoint.x - THREE_VALUE * endControlPoint.x + nextControlPoint.x) * segmentParameterSquared);
    const y = CATMULL_ROM_TENSION * (-previousControlPoint.y + endControlPoint.y + TWO_VALUE * (TWO_VALUE * previousControlPoint.y - FIVE_VALUE * startControlPoint.y + FOUR_VALUE * endControlPoint.y - nextControlPoint.y) * segmentParameter + THREE_VALUE * (-previousControlPoint.y + THREE_VALUE * startControlPoint.y - THREE_VALUE * endControlPoint.y + nextControlPoint.y) * segmentParameterSquared);
    const z = CATMULL_ROM_TENSION * (-previousControlPoint.z + endControlPoint.z + TWO_VALUE * (TWO_VALUE * previousControlPoint.z - FIVE_VALUE * startControlPoint.z + FOUR_VALUE * endControlPoint.z - nextControlPoint.z) * segmentParameter + THREE_VALUE * (-previousControlPoint.z + THREE_VALUE * startControlPoint.z - THREE_VALUE * endControlPoint.z + nextControlPoint.z) * segmentParameterSquared);
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length <= TANGENT_EPSILON) {
      return out.set(ZERO_VALUE2, ZERO_VALUE2, ZERO_VALUE2);
    }
    return out.set(x / length, y / length, z / length);
  }
  /**
   * @param {number} index - Segment index.
   * @returns {Vector3}
   * @private
   */
  #getPointForSegment(index) {
    const pointCount = this.#points.length;
    if (this.#closed) {
      const wrappedIndex = (index % pointCount + pointCount) % pointCount;
      return this.#points[wrappedIndex];
    }
    if (index < ZERO_VALUE2) {
      return this.#points[ZERO_VALUE2];
    }
    if (index >= pointCount) {
      return this.#points[pointCount - ONE_VALUE2];
    }
    return this.#points[index];
  }
  /**
   * @param {number} curveParameter - Parameter value.
   * @returns {number}
   * @private
   */
  static #clampCurveParameter(curveParameter) {
    if (curveParameter <= CURVE_PARAMETER_MIN) {
      return CURVE_PARAMETER_MIN;
    }
    if (curveParameter >= CURVE_PARAMETER_MAX) {
      return CURVE_PARAMETER_MAX;
    }
    return curveParameter;
  }
};

// core/math/path3d.js
var MIN_POINT_COUNT = 2;
var DEFAULT_LOOP = false;
var SEGMENT_START_INDEX = 0;
var SEGMENT_INDEX_INCREMENT = 1;
var ZERO_VALUE3 = 0;
var ONE_VALUE3 = 1;
var NORMALIZE_EPSILON = 1e-8;
var Path3D = class _Path3D {
  /**
   * Internal copy of path points, used for sampling and interpolation.
   *
   * @type {Vector3[]}
   * @private
   */
  #points;
  /**
   * Cached per-segment lengths (distance between consecutive points).
   *
   * @type {Float32Array}
   * @private
   */
  #segmentLengths;
  /**
   * Cached cumulative segment lengths where index stores the length up to point.
   *
   * @type {Float32Array}
   * @private
   */
  #cumulativeLengths;
  /**
   * Total path length (sum of all segment lengths).
   *
   * @type {number}
   * @private
   */
  #totalLength;
  /**
   * Whether the path is looped (wraps from the last point back to the first).
   *
   * @type {boolean}
   * @private
   */
  #loop;
  /**
   * @param {Vector3[]} points             - Path points.
   * @param {Object} [options]             - Optional options.
   * @param {boolean} [options.loop=false] - Whether the path is looped.
   * @throws {TypeError}  When inputs are invalid.
   * @throws {RangeError} When points are insufficient.
   */
  constructor(points, options = {}) {
    if (!Array.isArray(points)) {
      throw new TypeError("`Path3D` expects `points` as an array of `Vector3`.");
    }
    if (points.length < MIN_POINT_COUNT) {
      throw new RangeError("`Path3D` expects at least the 2 points.");
    }
    for (const point of points) {
      if (!(point instanceof Vector3)) {
        throw new TypeError("`Path3D` expects all points to be `Vector3` instances.");
      }
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`Path3D` expects options as a plain object.");
    }
    const { loop = DEFAULT_LOOP } = options;
    if (typeof loop !== "boolean") {
      throw new TypeError("`Path3D` option `loop` must be a boolean.");
    }
    this.#points = points.slice();
    this.#loop = loop;
    this.#segmentLengths = new Float32Array(this.#getSegmentCount());
    this.#cumulativeLengths = new Float32Array(this.#segmentLengths.length + ONE_VALUE3);
    this.#totalLength = ZERO_VALUE3;
    this.#recalculateLengths();
  }
  /**
   * @returns {Vector3[]}
   */
  get points() {
    return this.#points;
  }
  /**
   * @returns {boolean}
   */
  get loop() {
    return this.#loop;
  }
  /**
   * @returns {number}
   */
  get totalLength() {
    return this.#totalLength;
  }
  /**
   * Returns a point at normalized position along the path (arc-length parameterization).
   *
   * @param {number} pathParameter - Normalized path parameter in [0..1].
   * @param {Vector3} [out]        - Optional output vector.
   * @returns {Vector3}
   * @throws {TypeError} When inputs are invalid.
   */
  getPointAt(pathParameter, out = new Vector3()) {
    if (typeof pathParameter !== "number" || !Number.isFinite(pathParameter)) {
      throw new TypeError("`Path3D.getPointAt` expects `pathParameter` as a finite number.");
    }
    if (!(out instanceof Vector3)) {
      throw new TypeError("`Path3D.getPointAt` expects `out` as a `Vector3`.");
    }
    if (this.#totalLength <= ZERO_VALUE3) {
      return out.copyFrom(this.#points[ZERO_VALUE3]);
    }
    const normalizedPathParameter = this.#normalizePathParameter(pathParameter);
    const targetLength = normalizedPathParameter * this.#totalLength;
    const segmentData = this.#findSegmentAtLength(targetLength);
    const pointA = this.#points[segmentData.index];
    const pointB = this.#getNextPoint(segmentData.index);
    const segmentParameter = segmentData.length <= ZERO_VALUE3 ? ZERO_VALUE3 : (targetLength - segmentData.cumulativeLength) / segmentData.length;
    const x = pointA.x + (pointB.x - pointA.x) * segmentParameter;
    const y = pointA.y + (pointB.y - pointA.y) * segmentParameter;
    const z = pointA.z + (pointB.z - pointA.z) * segmentParameter;
    return out.set(x, y, z);
  }
  /**
   * Returns a normalized tangent at normalized position along the path (arc-length parameterization).
   *
   * @param {number} pathParameter - Normalized path parameter in [0..1].
   * @param {Vector3} [out]        - Optional output vector.
   * @returns {Vector3}
   * @throws {TypeError} When inputs are invalid.
   */
  getTangentAt(pathParameter, out = new Vector3()) {
    if (typeof pathParameter !== "number" || !Number.isFinite(pathParameter)) {
      throw new TypeError("`Path3D.getTangentAt` expects `pathParameter` as a finite number.");
    }
    if (!(out instanceof Vector3)) {
      throw new TypeError("`Path3D.getTangentAt` expects `out` as a `Vector3`.");
    }
    const normalizedPathParameter = this.#normalizePathParameter(pathParameter);
    const targetLength = normalizedPathParameter * this.#totalLength;
    const segmentData = this.#findSegmentAtLength(targetLength);
    const pointA = this.#points[segmentData.index];
    const pointB = this.#getNextPoint(segmentData.index);
    const deltaX = pointB.x - pointA.x;
    const deltaY = pointB.y - pointA.y;
    const deltaZ = pointB.z - pointA.z;
    const tangentLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    if (tangentLength <= NORMALIZE_EPSILON) {
      return out.set(ZERO_VALUE3, ZERO_VALUE3, ZERO_VALUE3);
    }
    return out.set(deltaX / tangentLength, deltaY / tangentLength, deltaZ / tangentLength);
  }
  /**
   * @returns {number}
   * @private
   */
  #getSegmentCount() {
    return this.#loop ? this.#points.length : this.#points.length - ONE_VALUE3;
  }
  /**
   * @param {number} length - Target length along the path.
   * @returns {{index: number, length: number, cumulativeLength: number}}
   * @private
   */
  #findSegmentAtLength(length) {
    const segmentCount = this.#segmentLengths.length;
    for (let index = SEGMENT_START_INDEX; index < segmentCount; index += SEGMENT_INDEX_INCREMENT) {
      const segmentLength = this.#segmentLengths[index];
      const cumulativeLength = this.#cumulativeLengths[index];
      if (length <= cumulativeLength + segmentLength) {
        return {
          index,
          length: segmentLength,
          cumulativeLength
        };
      }
    }
    const lastIndex = segmentCount - ONE_VALUE3;
    return {
      index: lastIndex,
      length: this.#segmentLengths[lastIndex],
      cumulativeLength: this.#cumulativeLengths[lastIndex]
    };
  }
  /**
   * @param {number} index - Segment start index.
   * @returns {Vector3}
   * @private
   */
  #getNextPoint(index) {
    if (this.#loop) {
      const nextIndex = (index + ONE_VALUE3) % this.#points.length;
      return this.#points[nextIndex];
    }
    return this.#points[Math.min(index + ONE_VALUE3, this.#points.length - ONE_VALUE3)];
  }
  /**
   * @param {number} pathParameter - Path parameter to normalize.
   * @returns {number}
   * @private
   */
  #normalizePathParameter(pathParameter) {
    if (this.#loop) {
      const wrapped = pathParameter - Math.floor(pathParameter);
      return wrapped < ZERO_VALUE3 ? wrapped + ONE_VALUE3 : wrapped;
    }
    if (pathParameter <= ZERO_VALUE3) {
      return ZERO_VALUE3;
    }
    if (pathParameter >= ONE_VALUE3) {
      return ONE_VALUE3;
    }
    return pathParameter;
  }
  /**
   * @private
   */
  #recalculateLengths() {
    const segmentCount = this.#segmentLengths.length;
    let cumulativeLength = ZERO_VALUE3;
    this.#cumulativeLengths[ZERO_VALUE3] = cumulativeLength;
    for (let index = SEGMENT_START_INDEX; index < segmentCount; index += SEGMENT_INDEX_INCREMENT) {
      const pointA = this.#points[index];
      const pointB = this.#getNextPoint(index);
      const length = _Path3D.#distance(pointA, pointB);
      this.#segmentLengths[index] = length;
      cumulativeLength += length;
      this.#cumulativeLengths[index + ONE_VALUE3] = cumulativeLength;
    }
    this.#totalLength = cumulativeLength;
  }
  /**
   * @param {Vector3} pointA - First point.
   * @param {Vector3} pointB - Second point.
   * @returns {number}
   * @private
   */
  static #distance(pointA, pointB) {
    const deltaX = pointB.x - pointA.x;
    const deltaY = pointB.y - pointA.y;
    const deltaZ = pointB.z - pointA.z;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
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
var BOUNDING_BOX_COMPONENT_COUNT = 3;
var POSITION_START_INDEX = 0;
var POSITION_X_OFFSET = 0;
var POSITION_Y_OFFSET = 1;
var POSITION_Z_OFFSET = 2;
var EMPTY_BOUND_COMPONENT = 0;
var BOUND_MIN_INIT = Number.POSITIVE_INFINITY;
var BOUND_MAX_INIT = Number.NEGATIVE_INFINITY;
var ERROR_BOUNDING_BOX_POSITIONS_TYPE = "`Geometry.#writeBoundingBox` expects positions as `Float32Array`.";
var ERROR_BOUNDING_BOX_MIN_TYPE = "`Geometry.#writeBoundingBox` expects `outMin` as `Float32Array(3)`.";
var ERROR_BOUNDING_BOX_MAX_TYPE = "`Geometry.#writeBoundingBox` expects `outMax` as `Float32Array(3)`.";
var TRIANGLE_INDEX_COMPONENT_COUNT = 3;
var LINE_INDEX_COMPONENT_COUNT = 2;
var PRIMITIVE_TRIANGLES = "triangles";
var PRIMITIVE_LINES = "lines";
var PRIMITIVE_LINE_STRIP = "line_strip";
var PRIMITIVE_LINE_LOOP = "line_loop";
var PRIMITIVE_POINTS = "points";
var DEFAULT_SOLID_PRIMITIVE = PRIMITIVE_TRIANGLES;
var DEFAULT_WIREFRAME_PRIMITIVE = PRIMITIVE_LINES;
var MIN_LINE_STRIP_INDEX_COUNT = 2;
var SUPPORTED_PRIMITIVES = /* @__PURE__ */ new Set([
  PRIMITIVE_TRIANGLES,
  PRIMITIVE_LINES,
  PRIMITIVE_LINE_STRIP,
  PRIMITIVE_LINE_LOOP,
  PRIMITIVE_POINTS
]);
var ERROR_INVALID_PRIMITIVE = "`Geometry` expects the primitive options to use known primitive constants.";
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
   * Local-space AABB minimum.
   *
   * @type {Float32Array}
   * @private
   */
  #boundingBoxMin;
  /**
   * Local-space AABB maximum.
   *
   * @type {Float32Array}
   * @private
   */
  #boundingBoxMax;
  /**
   * Indicates whether this geometry instance has been disposed.
   * Disposed geometries must not be used for rendering.
   *
   * @type {boolean}
   * @private
   */
  #isDisposed = false;
  /**
   * Solid primitive type, used for rendering (triangles, lines, points, etc...).
   *
   * @type {string}
   * @private
   */
  #solidPrimitive;
  /**
   * Wireframe primitive type, used for rendering (lines, points, etc...).
   *
   * @type {string}
   * @private
   */
  #wireframePrimitive;
  /**
   * @param {WebGL2RenderingContext} webglContext        - WebGL2 rendering context used to create and manage the GPU resources.
   * @param {Float32Array} positions                     - [x, y, z] triples.
   * @param {Float32Array | null} colors                 - [red, green, blue] triples or null.
   * @param {Uint16Array | Uint32Array} indicesSolid     - Indices for solid triangles.
   * @param {Uint16Array | Uint32Array} indicesWireframe - Indices for wireframe lines.
   * @param {Float32Array | null} [uvs = null]           - [u, v] pairs or null.
   * @param {Float32Array | null} [normals = null]       - [x, y, z] triples or null.
   * @param {GeometryPrimitiveOptions | null} [options]  - Primitive overrides.
   */
  constructor(webglContext, positions, colors, indicesSolid, indicesWireframe, uvs = null, normals = null, options = null) {
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
    if (options !== null && (typeof options !== "object" || Array.isArray(options))) {
      throw new TypeError("`Geometry` expects `options` as a plain object or null.");
    }
    const {
      solidPrimitive = DEFAULT_SOLID_PRIMITIVE,
      wireframePrimitive = DEFAULT_WIREFRAME_PRIMITIVE
    } = options || {};
    _Geometry.#assertPrimitiveName(solidPrimitive);
    _Geometry.#assertPrimitiveName(wireframePrimitive);
    this.#validateAttributeSizes(positions, colors, uvs, normals);
    this.#validateIndexSizes(indicesSolid, indicesWireframe, solidPrimitive, wireframePrimitive);
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
    this.#boundingBoxMin = new Float32Array(BOUNDING_BOX_COMPONENT_COUNT);
    this.#boundingBoxMax = new Float32Array(BOUNDING_BOX_COMPONENT_COUNT);
    this.#solidPrimitive = solidPrimitive;
    this.#wireframePrimitive = wireframePrimitive;
    _Geometry.#writeBoundingBox(positions, this.#boundingBoxMin, this.#boundingBoxMax);
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
   * Returns the primitive type for solid or wireframe rendering.
   *
   * @param {boolean} wireframe - When true, returns wireframe primitive type.
   * @returns {string}
   */
  getPrimitive(wireframe) {
    this.#assertNotDisposed();
    return wireframe ? this.#wireframePrimitive : this.#solidPrimitive;
  }
  /**
   * Returns local-space AABB minimum.
   *
   * @returns {Float32Array}
   */
  getBoundingBoxMin() {
    this.#assertNotDisposed();
    return this.#boundingBoxMin;
  }
  /**
   * Returns local-space AABB maximum.
   *
   * @returns {Float32Array}
   */
  getBoundingBoxMax() {
    this.#assertNotDisposed();
    return this.#boundingBoxMax;
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
  #validateIndexSizes(indicesSolid, indicesWireframe, solidPrimitive, wireframePrimitive) {
    _Geometry.#validateIndexSizeForPrimitive(indicesSolid, solidPrimitive, "solid");
    _Geometry.#validateIndexSizeForPrimitive(indicesWireframe, wireframePrimitive, "wireframe");
  }
  /**
   * Validates the index buffer length based on the primitive type.
   *
   * @param {Uint16Array | Uint32Array} indices - Index buffer.
   * @param {string} primitive                  - Primitive type name.
   * @param {string} label                      - Buffer label for error messages.
   * @private
   */
  static #validateIndexSizeForPrimitive(indices, primitive, label) {
    switch (primitive) {
      case PRIMITIVE_TRIANGLES:
        if (indices.length % TRIANGLE_INDEX_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
          throw new Error(`Geometry ${label} indices length must be a multiple of TRIANGLE_INDEX_COMPONENT_COUNT.`);
        }
        return;
      case PRIMITIVE_LINES:
        if (indices.length % LINE_INDEX_COMPONENT_COUNT !== MODULO_ALIGNED_VALUE) {
          throw new Error(`Geometry ${label} indices length must be a multiple of LINE_INDEX_COMPONENT_COUNT.`);
        }
        return;
      case PRIMITIVE_LINE_STRIP:
      case PRIMITIVE_LINE_LOOP:
        if (indices.length < MIN_LINE_STRIP_INDEX_COUNT) {
          throw new Error(`Geometry ${label} indices length must be at least ${MIN_LINE_STRIP_INDEX_COUNT}.`);
        }
        return;
      case PRIMITIVE_POINTS:
        return;
      default:
        throw new Error(ERROR_INVALID_PRIMITIVE);
    }
  }
  /**
   * Validates primitive name.
   *
   * @param {string} value - Primitive name.
   * @private
   */
  static #assertPrimitiveName(value) {
    if (typeof value !== "string" || !SUPPORTED_PRIMITIVES.has(value)) {
      throw new TypeError(ERROR_INVALID_PRIMITIVE);
    }
  }
  /**
   * Writes local AABB bounds into the provided buffers.
   *
   * @param {Float32Array} positions - Flat vertex positions [x, y, z].
   * @param {Float32Array} outMin    - Output min buffer.
   * @param {Float32Array} outMax    - Output max buffer.
   * @private
   */
  static #writeBoundingBox(positions, outMin, outMax) {
    if (!(positions instanceof Float32Array)) {
      throw new TypeError(ERROR_BOUNDING_BOX_POSITIONS_TYPE);
    }
    if (!(outMin instanceof Float32Array) || outMin.length !== BOUNDING_BOX_COMPONENT_COUNT) {
      throw new TypeError(ERROR_BOUNDING_BOX_MIN_TYPE);
    }
    if (!(outMax instanceof Float32Array) || outMax.length !== BOUNDING_BOX_COMPONENT_COUNT) {
      throw new TypeError(ERROR_BOUNDING_BOX_MAX_TYPE);
    }
    if (positions.length === POSITION_START_INDEX) {
      outMin[POSITION_X_OFFSET] = EMPTY_BOUND_COMPONENT;
      outMin[POSITION_Y_OFFSET] = EMPTY_BOUND_COMPONENT;
      outMin[POSITION_Z_OFFSET] = EMPTY_BOUND_COMPONENT;
      outMax[POSITION_X_OFFSET] = EMPTY_BOUND_COMPONENT;
      outMax[POSITION_Y_OFFSET] = EMPTY_BOUND_COMPONENT;
      outMax[POSITION_Z_OFFSET] = EMPTY_BOUND_COMPONENT;
      return;
    }
    let minX = BOUND_MIN_INIT;
    let minY = BOUND_MIN_INIT;
    let minZ = BOUND_MIN_INIT;
    let maxX = BOUND_MAX_INIT;
    let maxY = BOUND_MAX_INIT;
    let maxZ = BOUND_MAX_INIT;
    for (let index = POSITION_START_INDEX; index < positions.length; index += POSITION_COMPONENT_COUNT) {
      const x = positions[index + POSITION_X_OFFSET];
      const y = positions[index + POSITION_Y_OFFSET];
      const z = positions[index + POSITION_Z_OFFSET];
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (z < minZ) {
        minZ = z;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
      if (z > maxZ) {
        maxZ = z;
      }
    }
    outMin[POSITION_X_OFFSET] = minX;
    outMin[POSITION_Y_OFFSET] = minY;
    outMin[POSITION_Z_OFFSET] = minZ;
    outMax[POSITION_X_OFFSET] = maxX;
    outMax[POSITION_Y_OFFSET] = maxY;
    outMax[POSITION_Z_OFFSET] = maxZ;
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
var MIN_VERTEX_COUNT = 0;
var FIRST_VERTEX_INDEX = 0;
var SEQUENTIAL_INDEX_INCREMENT = 1;
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
function createSequentialIndexArray(vertexCount) {
  if (typeof vertexCount !== "number" || !Number.isFinite(vertexCount)) {
    throw new TypeError("`createSequentialIndexArray` expects `vertexCount` as a finite number.");
  }
  if (!Number.isInteger(vertexCount) || vertexCount < MIN_VERTEX_COUNT) {
    throw new RangeError("`createSequentialIndexArray` expects `vertexCount` as a non-negative integer.");
  }
  if (vertexCount === MIN_VERTEX_COUNT) {
    return new Uint16Array(MIN_VERTEX_COUNT);
  }
  const requiresUint32 = vertexCount - VERTEX_COUNT_TO_MAX_INDEX_OFFSET > MAX_UINT16_INDEX_VALUE;
  const indexArray = requiresUint32 ? new Uint32Array(vertexCount) : new Uint16Array(vertexCount);
  for (let index = FIRST_VERTEX_INDEX; index < vertexCount; index += SEQUENTIAL_INDEX_INCREMENT) {
    indexArray[index] = index;
  }
  return indexArray;
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
var ZERO_VALUE4 = 0;
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
    if (positions.length % POSITION_COMPONENT_COUNT2 !== ZERO_VALUE4) {
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
        indicesSolid.push(topLeftVertexIndex, topRightVertexIndex, bottomLeftVertexIndex);
        indicesSolid.push(topRightVertexIndex, bottomRightVertexIndex, bottomLeftVertexIndex);
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
var ZERO_VALUE5 = 0;
var ONE_VALUE4 = 1;
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
        const normalX0 = radiusX !== ZERO_VALUE5 ? positionX / (radiusX * radiusX) : ZERO_VALUE5;
        const normalY0 = radiusY !== ZERO_VALUE5 ? positionY / (radiusY * radiusY) : ZERO_VALUE5;
        const normalZ0 = radiusZ !== ZERO_VALUE5 ? positionZ / (radiusZ * radiusZ) : ZERO_VALUE5;
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
    if (length === ZERO_VALUE5) {
      return ZERO_VALUE5;
    }
    return ONE_VALUE4 / length;
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
var ZERO_VALUE6 = 0;
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
        uvs[uvBaseOffset + 0] = radiusX === ZERO_VALUE6 ? UV_CENTER : positionX / (radiusX * DOUBLE_SIZE_MULTIPLIER) + UV_CENTER;
        uvs[uvBaseOffset + 1] = radiusZ === ZERO_VALUE6 ? UV_CENTER : positionZ / (radiusZ * DOUBLE_SIZE_MULTIPLIER) + UV_CENTER;
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
    if (length === ZERO_VALUE6) {
      return ZERO_VALUE6;
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
var ZERO_VALUE7 = 0;
var ONE_VALUE5 = 1;
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
    const apexPoint = [ZERO_VALUE7, halfHeight, ZERO_VALUE7];
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
        normals.push(ZERO_VALUE7, NEGATIVE_ONE_VALUE, ZERO_VALUE7);
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
    if (_PyramidGeometry.#dot(faceNormal, outwardHint) < ZERO_VALUE7) {
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
    if (length === ZERO_VALUE7) {
      return ZERO_VALUE7;
    }
    return ONE_VALUE5 / length;
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
var ZERO_VALUE8 = 0;
var ONE_VALUE6 = 1;
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
    let vertexIndex = ZERO_VALUE8;
    for (let zIndex = ZERO_VALUE8; zIndex < depthVertexCount; zIndex += ONE_VALUE6) {
      const vNormalized = zIndex / depthSegments;
      const positionZ = (vNormalized - CENTER_T_OFFSET4) * options.depth;
      for (let xIndex = ZERO_VALUE8; xIndex < widthVertexCount; xIndex += ONE_VALUE6) {
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
        vertexIndex += ONE_VALUE6;
      }
    }
    const solidTriangleIndices = [];
    for (let zIndex = ZERO_VALUE8; zIndex < depthSegments; zIndex += ONE_VALUE6) {
      for (let xIndex = ZERO_VALUE8; xIndex < widthSegments; xIndex += ONE_VALUE6) {
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
    const vSample = options.flipY ? ONE_VALUE6 - vNormalized : vNormalized;
    if (options.sampling === SAMPLING_BILINEAR) {
      const xFloat = uNormalized * (heightmapWidth - ONE_VALUE6);
      const yFloat = vSample * (heightmapHeight - ONE_VALUE6);
      const x0 = Math.floor(xFloat);
      const y0 = Math.floor(yFloat);
      const x1 = Math.min(x0 + ONE_VALUE6, heightmapWidth - ONE_VALUE6);
      const y1 = Math.min(y0 + ONE_VALUE6, heightmapHeight - ONE_VALUE6);
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
    const xIndex = Math.round(uNormalized * (heightmapWidth - ONE_VALUE6));
    const yIndex = Math.round(vSample * (heightmapHeight - ONE_VALUE6));
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
    for (let i = ZERO_VALUE8; i < indices.length; i += TRIANGLE_INDEX_STRIDE2) {
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
    for (let vertexIndex = ZERO_VALUE8; vertexIndex < vertexCount; vertexIndex += ONE_VALUE6) {
      const baseIndex = vertexIndex * VECTOR_COMPONENTS_3;
      const nx = normals[baseIndex + X_INDEX];
      const ny = normals[baseIndex + Y_INDEX];
      const nz = normals[baseIndex + Z_INDEX];
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (length > ZERO_VALUE8) {
        const invLength = ONE_VALUE6 / length;
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
    context.drawImage(image, ZERO_VALUE8, ZERO_VALUE8);
    return context.getImageData(ZERO_VALUE8, ZERO_VALUE8, image.width, image.height);
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

// core/geometry/points-geometry.js
var POSITION_COMPONENT_COUNT3 = 3;
var POSITION_X_OFFSET2 = 0;
var POSITION_Y_OFFSET2 = 1;
var POSITION_Z_OFFSET2 = 2;
var DEFAULT_COLORS2 = null;
var DEFAULT_POSITIONS = null;
var MIN_POINT_COUNT2 = 0;
var PointsGeometry = class _PointsGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {PointsGeometryOptions} options       - Points geometry options.
   * @throws {TypeError}  When inputs are invalid.
   * @throws {RangeError} When positions are invalid.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`PointsGeometry` expects options as a plain object.");
    }
    const {
      positions = DEFAULT_POSITIONS,
      colors = DEFAULT_COLORS2
    } = options;
    if (!Array.isArray(positions)) {
      throw new TypeError("`PointsGeometry` expects `positions` as an array of Vector3.");
    }
    if (positions.length < MIN_POINT_COUNT2) {
      throw new RangeError("`PointsGeometry` expects a non-negative point count.");
    }
    for (const point of positions) {
      if (!(point instanceof Vector3)) {
        throw new TypeError("`PointsGeometry` expects all positions to be `Vector3` instances.");
      }
    }
    if (colors !== null && !(colors instanceof Float32Array)) {
      throw new TypeError("`PointsGeometry` expects `colors` as a `Float32Array` or null.");
    }
    const positionsBuffer = _PointsGeometry.#createPositionsArray(positions);
    const vertexCount = positions.length;
    const colorBuffer = colors ? createColorsFromSpec(vertexCount, colors) : null;
    const indices = createSequentialIndexArray(vertexCount);
    super(
      webglContext,
      positionsBuffer,
      colorBuffer,
      indices,
      indices,
      null,
      null,
      {
        solidPrimitive: PRIMITIVE_POINTS,
        wireframePrimitive: PRIMITIVE_POINTS
      }
    );
  }
  /**
   * @param {Vector3[]} positions - Input positions.
   * @returns {Float32Array}
   * @private
   */
  static #createPositionsArray(positions) {
    const buffer = new Float32Array(positions.length * POSITION_COMPONENT_COUNT3);
    for (let index = 0; index < positions.length; index += 1) {
      const baseIndex = index * POSITION_COMPONENT_COUNT3;
      const point = positions[index];
      buffer[baseIndex + POSITION_X_OFFSET2] = point.x;
      buffer[baseIndex + POSITION_Y_OFFSET2] = point.y;
      buffer[baseIndex + POSITION_Z_OFFSET2] = point.z;
    }
    return buffer;
  }
};

// core/geometry/polyline-geometry.js
var POSITION_COMPONENT_COUNT4 = 3;
var POSITION_X_OFFSET3 = 0;
var POSITION_Y_OFFSET3 = 1;
var POSITION_Z_OFFSET3 = 2;
var MIN_VERTEX_COUNT2 = 2;
var DEFAULT_COLORS3 = null;
var DEFAULT_LOOP2 = false;
var PolylineGeometry = class _PolylineGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {PolylineGeometryOptions} options     - Polyline geometry options.
   * @throws {TypeError}  When inputs are invalid.
   * @throws {RangeError} When positions are invalid.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`PolylineGeometry` expects options as a plain object.");
    }
    const {
      positions,
      loop = DEFAULT_LOOP2,
      colors = DEFAULT_COLORS3
    } = options;
    if (!Array.isArray(positions)) {
      throw new TypeError("`PolylineGeometry` expects `positions` as an array of `Vector3`.");
    }
    if (positions.length < MIN_VERTEX_COUNT2) {
      throw new RangeError("`PolylineGeometry` expects at least 2 points.");
    }
    for (const point of positions) {
      if (!(point instanceof Vector3)) {
        throw new TypeError("`PolylineGeometry` expects all positions to be the `Vector3` instances.");
      }
    }
    if (typeof loop !== "boolean") {
      throw new TypeError("`PolylineGeometry` expects `loop` as a boolean.");
    }
    if (colors !== null && !(colors instanceof Float32Array)) {
      throw new TypeError("`PolylineGeometry` expects `colors` as `Float32Array` or null.");
    }
    const positionsBuffer = _PolylineGeometry.#createPositionsArray(positions);
    const vertexCount = positions.length;
    const colorBuffer = colors ? createColorsFromSpec(vertexCount, colors) : null;
    const indices = createSequentialIndexArray(vertexCount);
    const primitive = loop ? PRIMITIVE_LINE_LOOP : PRIMITIVE_LINE_STRIP;
    super(
      webglContext,
      positionsBuffer,
      colorBuffer,
      indices,
      indices,
      null,
      null,
      {
        solidPrimitive: primitive,
        wireframePrimitive: primitive
      }
    );
  }
  /**
   * @param {Vector3[]} positions - Input positions.
   * @returns {Float32Array}
   * @private
   */
  static #createPositionsArray(positions) {
    const buffer = new Float32Array(positions.length * POSITION_COMPONENT_COUNT4);
    for (let index = 0; index < positions.length; index += 1) {
      const baseIndex = index * POSITION_COMPONENT_COUNT4;
      const point = positions[index];
      buffer[baseIndex + POSITION_X_OFFSET3] = point.x;
      buffer[baseIndex + POSITION_Y_OFFSET3] = point.y;
      buffer[baseIndex + POSITION_Z_OFFSET3] = point.z;
    }
    return buffer;
  }
};

// core/geometry/tube-line-geometry.js
var POSITION_COMPONENT_COUNT5 = 3;
var POSITION_X_OFFSET4 = 0;
var POSITION_Y_OFFSET4 = 1;
var POSITION_Z_OFFSET4 = 2;
var MIN_POINT_COUNT3 = 2;
var DEFAULT_RADIUS = 0.05;
var DEFAULT_WIDTH = null;
var DEFAULT_RADIAL_SEGMENTS3 = 8;
var MIN_RADIAL_SEGMENTS = 3;
var DEFAULT_CLOSED2 = false;
var CAP_TYPE_NONE = "none";
var CAP_TYPE_FLAT = "flat";
var DEFAULT_CAP_TYPE = CAP_TYPE_NONE;
var ERROR_INVALID_CAP_TYPE = `\`TubeLineGeometry\` expects \`capType\` to be "${CAP_TYPE_NONE}" or "${CAP_TYPE_FLAT}".`;
var WIDTH_TO_RADIUS_DIVISOR = 2;
var TWO_PI4 = Math.PI * 2;
var NORMALIZE_EPSILON2 = 1e-8;
var UP_AXIS_X = 0;
var UP_AXIS_Y = 1;
var UP_AXIS_Z = 0;
var FALLBACK_AXIS_X = 1;
var FALLBACK_AXIS_Y = 0;
var FALLBACK_AXIS_Z = 0;
var SECOND_FALLBACK_AXIS_X = 0;
var SECOND_FALLBACK_AXIS_Y = 0;
var SECOND_FALLBACK_AXIS_Z = 1;
var ZERO_VALUE9 = 0;
var ONE_VALUE7 = 1;
var TWO_VALUE2 = 2;
var TubeLineGeometry = class _TubeLineGeometry extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {TubeLineGeometryOptions} options     - Tube geometry options.
   * @throws {TypeError}  When inputs are invalid.
   * @throws {RangeError} When numeric inputs are out of range.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`TubeLineGeometry` expects options as a plain object.");
    }
    const {
      positions,
      radius = DEFAULT_RADIUS,
      width = DEFAULT_WIDTH,
      radialSegments = DEFAULT_RADIAL_SEGMENTS3,
      closed = DEFAULT_CLOSED2,
      capType = DEFAULT_CAP_TYPE
    } = options;
    if (!Array.isArray(positions)) {
      throw new TypeError("`TubeLineGeometry` expects `positions` as an array of `Vector3`.");
    }
    if (positions.length < MIN_POINT_COUNT3) {
      throw new RangeError("`TubeLineGeometry` expects at least the 2 points.");
    }
    for (const point of positions) {
      if (!(point instanceof Vector3)) {
        throw new TypeError("`TubeLineGeometry` expects all positions to be the `Vector3` instances.");
      }
    }
    if (typeof radius !== "number" || !Number.isFinite(radius) || radius <= ZERO_VALUE9) {
      throw new RangeError("`TubeLineGeometry` expects `radius` as a positive number.");
    }
    if (width !== null && (typeof width !== "number" || !Number.isFinite(width) || width <= ZERO_VALUE9)) {
      throw new RangeError("`TubeLineGeometry` expects `width` as a positive number or null.");
    }
    if (!Number.isInteger(radialSegments) || radialSegments < MIN_RADIAL_SEGMENTS) {
      throw new RangeError("`TubeLineGeometry` expects `radialSegments` as an `integer >= 3`.");
    }
    if (typeof closed !== "boolean") {
      throw new TypeError("`TubeLineGeometry` expects `closed` as a boolean.");
    }
    if (capType !== CAP_TYPE_NONE && capType !== CAP_TYPE_FLAT) {
      throw new RangeError(ERROR_INVALID_CAP_TYPE);
    }
    const resolvedRadius = width !== null ? width / WIDTH_TO_RADIUS_DIVISOR : radius;
    const baseVertexCount = positions.length * radialSegments;
    const addCaps = capType === CAP_TYPE_FLAT && !closed;
    const extraCapVertices = addCaps ? TWO_VALUE2 : ZERO_VALUE9;
    const totalVertexCount = baseVertexCount + extraCapVertices;
    const positionsBuffer = new Float32Array(totalVertexCount * POSITION_COMPONENT_COUNT5);
    _TubeLineGeometry.#writeRingPositions(positionsBuffer, positions, radialSegments, resolvedRadius, closed);
    if (addCaps) {
      _TubeLineGeometry.#writeCapCenters(positionsBuffer, positions, baseVertexCount);
    }
    const indices = _TubeLineGeometry.#buildIndices(positions.length, radialSegments, closed, addCaps, baseVertexCount);
    const wireframeIndices = createWireframeIndicesFromSolidIndices(totalVertexCount, indices);
    super(
      webglContext,
      positionsBuffer,
      null,
      indices,
      wireframeIndices,
      null,
      null,
      {
        solidPrimitive: PRIMITIVE_TRIANGLES,
        wireframePrimitive: PRIMITIVE_LINES
      }
    );
  }
  /**
   * @param {Float32Array} buffer   - Output positions buffer.
   * @param {Vector3[]} positions   - Input path positions.
   * @param {number} radialSegments - Radial segment count.
   * @param {number} radius         - Tube radius.
   * @param {boolean} closed        - Whether path is closed.
   * @private
   */
  static #writeRingPositions(buffer, positions, radialSegments, radius, closed) {
    const pointCount = positions.length;
    for (let index = ZERO_VALUE9; index < pointCount; index += ONE_VALUE7) {
      const previousIndex = _TubeLineGeometry.#getPreviousIndex(index, pointCount, closed);
      const nextIndex = _TubeLineGeometry.#getNextIndex(index, pointCount, closed);
      const tangent = _TubeLineGeometry.#computeTangent(positions[previousIndex], positions[nextIndex]);
      const normal = _TubeLineGeometry.#computeNormal(tangent);
      const binormal = _TubeLineGeometry.#computeBinormal(tangent, normal);
      const ringBase = index * radialSegments;
      const point = positions[index];
      for (let segmentIndex = ZERO_VALUE9; segmentIndex < radialSegments; segmentIndex += ONE_VALUE7) {
        const angle = TWO_PI4 * (segmentIndex / radialSegments);
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const offsetX = (normal.x * cosAngle + binormal.x * sinAngle) * radius;
        const offsetY = (normal.y * cosAngle + binormal.y * sinAngle) * radius;
        const offsetZ = (normal.z * cosAngle + binormal.z * sinAngle) * radius;
        const vertexIndex = ringBase + segmentIndex;
        const baseIndex = vertexIndex * POSITION_COMPONENT_COUNT5;
        buffer[baseIndex + POSITION_X_OFFSET4] = point.x + offsetX;
        buffer[baseIndex + POSITION_Y_OFFSET4] = point.y + offsetY;
        buffer[baseIndex + POSITION_Z_OFFSET4] = point.z + offsetZ;
      }
    }
  }
  /**
   * @param {Float32Array} buffer    - Output positions buffer.
   * @param {Vector3[]} positions    - Input path positions.
   * @param {number} baseVertexCount - Base vertex count before caps.
   * @private
   */
  static #writeCapCenters(buffer, positions, baseVertexCount) {
    const startBaseIndex = baseVertexCount * POSITION_COMPONENT_COUNT5;
    const endBaseIndex = (baseVertexCount + ONE_VALUE7) * POSITION_COMPONENT_COUNT5;
    const startPoint = positions[ZERO_VALUE9];
    const endPoint = positions[positions.length - ONE_VALUE7];
    buffer[startBaseIndex + POSITION_X_OFFSET4] = startPoint.x;
    buffer[startBaseIndex + POSITION_Y_OFFSET4] = startPoint.y;
    buffer[startBaseIndex + POSITION_Z_OFFSET4] = startPoint.z;
    buffer[endBaseIndex + POSITION_X_OFFSET4] = endPoint.x;
    buffer[endBaseIndex + POSITION_Y_OFFSET4] = endPoint.y;
    buffer[endBaseIndex + POSITION_Z_OFFSET4] = endPoint.z;
  }
  /**
   * @param {number} pointCount      - Number of path points.
   * @param {number} radialSegments  - Radial segment count.
   * @param {boolean} closed         - Whether path is closed.
   * @param {boolean} addCaps        - Whether caps are added.
   * @param {number} baseVertexCount - Base vertex count before caps.
   * @returns {Uint16Array | Uint32Array}
   * @private
   */
  static #buildIndices(pointCount, radialSegments, closed, addCaps, baseVertexCount) {
    const segmentCount = closed ? pointCount : pointCount - ONE_VALUE7;
    const indices = [];
    for (let segmentIndex = ZERO_VALUE9; segmentIndex < segmentCount; segmentIndex += ONE_VALUE7) {
      const ringStart = segmentIndex * radialSegments;
      const nextRingStart = (segmentIndex + ONE_VALUE7) % pointCount * radialSegments;
      for (let radialIndex = ZERO_VALUE9; radialIndex < radialSegments; radialIndex += ONE_VALUE7) {
        const nextRadialIndex = (radialIndex + ONE_VALUE7) % radialSegments;
        const groupA = ringStart + radialIndex;
        const groupB = ringStart + nextRadialIndex;
        const groupC = nextRingStart + radialIndex;
        const groupD = nextRingStart + nextRadialIndex;
        indices.push(groupA, groupC, groupB);
        indices.push(groupB, groupC, groupD);
      }
    }
    if (addCaps) {
      const startCenterIndex = baseVertexCount;
      const endCenterIndex = baseVertexCount + ONE_VALUE7;
      const startRingStart = ZERO_VALUE9;
      const endRingStart = (pointCount - ONE_VALUE7) * radialSegments;
      for (let radialIndex = ZERO_VALUE9; radialIndex < radialSegments; radialIndex += ONE_VALUE7) {
        const nextRadialIndex = (radialIndex + ONE_VALUE7) % radialSegments;
        const startA = startRingStart + radialIndex;
        const startB = startRingStart + nextRadialIndex;
        indices.push(startCenterIndex, startB, startA);
        const endA = endRingStart + radialIndex;
        const endB = endRingStart + nextRadialIndex;
        indices.push(endCenterIndex, endA, endB);
      }
    }
    return createIndexArray(baseVertexCount + (addCaps ? TWO_VALUE2 : ZERO_VALUE9), indices);
  }
  /**
   * @param {number} index   - Current index.
   * @param {number} count   - Total count.
   * @param {boolean} closed - Whether path is closed.
   * @returns {number}
   * @private
   */
  static #getPreviousIndex(index, count, closed) {
    if (index > ZERO_VALUE9) {
      return index - ONE_VALUE7;
    }
    return closed ? count - ONE_VALUE7 : index;
  }
  /**
   * @param {number} index   - Current index.
   * @param {number} count   - Total count.
   * @param {boolean} closed - Whether path is closed.
   * @returns {number}
   * @private
   */
  static #getNextIndex(index, count, closed) {
    if (index < count - ONE_VALUE7) {
      return index + ONE_VALUE7;
    }
    return closed ? ZERO_VALUE9 : index;
  }
  /**
   * @param {Vector3} pointA - Start point.
   * @param {Vector3} pointB - End point.
   * @returns {Vector3}
   * @private
   */
  static #computeTangent(pointA, pointB) {
    const deltaX = pointB.x - pointA.x;
    const deltaY = pointB.y - pointA.y;
    const deltaZ = pointB.z - pointA.z;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    if (length <= NORMALIZE_EPSILON2) {
      return new Vector3(ZERO_VALUE9, ONE_VALUE7, ZERO_VALUE9);
    }
    return new Vector3(deltaX / length, deltaY / length, deltaZ / length);
  }
  /**
   * @param {Vector3} tangent - Tangent direction.
   * @returns {Vector3}
   * @private
   */
  static #computeNormal(tangent) {
    let normalX = tangent.y * UP_AXIS_Z - tangent.z * UP_AXIS_Y;
    let normalY = tangent.z * UP_AXIS_X - tangent.x * UP_AXIS_Z;
    let normalZ = tangent.x * UP_AXIS_Y - tangent.y * UP_AXIS_X;
    let length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
    if (length <= NORMALIZE_EPSILON2) {
      normalX = tangent.y * FALLBACK_AXIS_Z - tangent.z * FALLBACK_AXIS_Y;
      normalY = tangent.z * FALLBACK_AXIS_X - tangent.x * FALLBACK_AXIS_Z;
      normalZ = tangent.x * FALLBACK_AXIS_Y - tangent.y * FALLBACK_AXIS_X;
      length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
    }
    if (length <= NORMALIZE_EPSILON2) {
      normalX = tangent.y * SECOND_FALLBACK_AXIS_Z - tangent.z * SECOND_FALLBACK_AXIS_Y;
      normalY = tangent.z * SECOND_FALLBACK_AXIS_X - tangent.x * SECOND_FALLBACK_AXIS_Z;
      normalZ = tangent.x * SECOND_FALLBACK_AXIS_Y - tangent.y * SECOND_FALLBACK_AXIS_X;
      length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
    }
    if (length <= NORMALIZE_EPSILON2) {
      return new Vector3(ONE_VALUE7, ZERO_VALUE9, ZERO_VALUE9);
    }
    return new Vector3(normalX / length, normalY / length, normalZ / length);
  }
  /**
   * @param {Vector3} tangent - Tangent direction.
   * @param {Vector3} normal  - Normal vector.
   * @returns {Vector3}
   * @private
   */
  static #computeBinormal(tangent, normal) {
    const binormalX = tangent.y * normal.z - tangent.z * normal.y;
    const binormalY = tangent.z * normal.x - tangent.x * normal.z;
    const binormalZ = tangent.x * normal.y - tangent.y * normal.x;
    const length = Math.sqrt(binormalX * binormalX + binormalY * binormalY + binormalZ * binormalZ);
    if (length <= NORMALIZE_EPSILON2) {
      return new Vector3(ZERO_VALUE9, ZERO_VALUE9, ZERO_VALUE9);
    }
    return new Vector3(binormalX / length, binormalY / length, binormalZ / length);
  }
};

// core/texture/texture2d.js
var DEFAULT_FLIP_Y2 = true;
var MIPMAP_POLICY_NONE = 0;
var MIPMAP_POLICY_ALWAYS = 1;
var MIPMAP_POLICY_AUTO = 2;
var DEFAULT_MIPMAP_POLICY = MIPMAP_POLICY_AUTO;
var CROSS_ORIGIN_ANONYMOUS = "anonymous";
var CROSS_ORIGIN_USE_CREDENTIALS = "use-credentials";
var ERROR_EXPECTS_WEBGL2_CONTEXT = "`Texture2D` expects `WebGL2RenderingContext`.";
var ERROR_EXPECTS_OPTIONS_OBJECT = "`Texture2D` expects options as an object.";
var ERROR_EXPECTS_FLIPY_BOOLEAN = "`Texture2D` expects `options.flipY` as boolean.";
var ERROR_FAILED_CREATE_TEXTURE = "Failed to create `WebGLTexture`.";
var ERROR_EXPECTS_WRAP_S_ENUM = "`Texture2D` expects `options.wrapS` as the valid WebGL wrap mode.";
var ERROR_EXPECTS_WRAP_T_ENUM = "`Texture2D` expects `options.wrapT` as the valid WebGL wrap mode.";
var ERROR_EXPECTS_MIN_FILTER_ENUM = "`Texture2D` expects `options.minFilter` as the valid WebGL min filter.";
var ERROR_EXPECTS_MAG_FILTER_ENUM = "`Texture2D` expects `options.magFilter` as the valid WebGL mag filter.";
var ERROR_EXPECTS_MIPMAP_POLICY = "`Texture2D` expects `options.mipmapPolicy` as the valid mipmap policy.";
var ERROR_MIPMAP_POLICY_CONFLICT = "`Texture2D` cannot use the mipmap min filter, when mipmap policy is NONE.";
var ERROR_MIPMAP_AUTO_POT_REQUIRED_FOR_MIPMAP_FILTER = "`Texture2D` cannot apply a mipmap min filter with the auto policy for a `non power-of-two` texture. Use `MIPMAP_POLICY_ALWAYS` or the non-mipmap min filter.";
var ERROR_EXPECTS_SAMPLER_OPTIONS_OBJECT = "`Texture2D.setSamplerParams` expects options as an object.";
var ERROR_EXPECTS_TEXTURE_UNIT_INDEX = "`Texture2D.bind` expects `textureUnitIndex` as a non-negative integer.";
var ERROR_TEXTURE_UNIT_INDEX_OUT_OF_RANGE_PREFIX = "`Texture2D.bind` texture unit index is out of range. Max allowed index is ";
var ERROR_EXPECTS_URL_STRING = "`Texture2D.loadFromUrl` expects url as a non-empty string.";
var ERROR_INSTANCE_DISPOSED = "`Texture2D` instance is disposed.";
var ERROR_EXPECTS_LOAD_OPTIONS_OBJECT = "`Texture2D.loadFromUrl` expects options as an object.";
var ERROR_EXPECTS_CROSS_ORIGIN = "`Texture2D.loadFromUrl` expects `options.crossOrigin` as `anonymous`, `use-credentials` or null.";
var ERROR_FAILED_LOAD_IMAGE_PREFIX = "Failed to load the texture image: ";
var ERROR_FAILED_READ_MAX_TEXTURE_UNITS = "Failed to read WebGL `MAX_COMBINED_TEXTURE_IMAGE_UNITS`.";
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
   * When true, uploaded images are flipped vertically during upload. Applied via `UNPACK_FLIP_Y_WEBGL`.
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
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context, used to create and manage the GPU resources.
   * @param {Texture2DOptions} [options]          - Optional texture creation options.
   * @throws {TypeError} When provided arguments do not match expected types or supported enums.
   */
  constructor(webglContext, options = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_EXPECTS_WEBGL2_CONTEXT);
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(ERROR_EXPECTS_OPTIONS_OBJECT);
    }
    const {
      flipY = DEFAULT_FLIP_Y2,
      wrapS,
      wrapT,
      minFilter,
      magFilter,
      mipmapPolicy = DEFAULT_MIPMAP_POLICY
    } = options;
    if (typeof flipY !== "boolean") {
      throw new TypeError(ERROR_EXPECTS_FLIPY_BOOLEAN);
    }
    this.#webglContext = webglContext;
    if (!this.#isValidMipmapPolicy(mipmapPolicy)) {
      throw new TypeError(ERROR_EXPECTS_MIPMAP_POLICY);
    }
    const hasMinFilterProperty = Object.prototype.hasOwnProperty.call(options, "minFilter");
    const isResetMinFilter = hasMinFilterProperty && minFilter === null;
    const hasExplicitMinFilter = hasMinFilterProperty && !isResetMinFilter;
    const hasExplicitWrapS = Object.prototype.hasOwnProperty.call(options, "wrapS");
    const hasExplicitWrapT = Object.prototype.hasOwnProperty.call(options, "wrapT");
    const hasExplicitMagFilter = Object.prototype.hasOwnProperty.call(options, "magFilter");
    const resolvedWrapS = hasExplicitWrapS ? wrapS : webglContext.REPEAT;
    const resolvedWrapT = hasExplicitWrapT ? wrapT : webglContext.REPEAT;
    const resolvedMinFilter = hasExplicitMinFilter ? minFilter : webglContext.LINEAR;
    const resolvedMagFilter = hasExplicitMagFilter ? magFilter : webglContext.LINEAR;
    if (hasExplicitWrapS && !this.#isValidWrapMode(resolvedWrapS)) {
      throw new TypeError(ERROR_EXPECTS_WRAP_S_ENUM);
    }
    if (hasExplicitWrapT && !this.#isValidWrapMode(resolvedWrapT)) {
      throw new TypeError(ERROR_EXPECTS_WRAP_T_ENUM);
    }
    if (hasExplicitMinFilter && !this.#isValidMinFilter(resolvedMinFilter)) {
      throw new TypeError(ERROR_EXPECTS_MIN_FILTER_ENUM);
    }
    if (hasExplicitMagFilter && !this.#isValidMagFilter(resolvedMagFilter)) {
      throw new TypeError(ERROR_EXPECTS_MAG_FILTER_ENUM);
    }
    if (mipmapPolicy === MIPMAP_POLICY_NONE && hasExplicitMinFilter && this.#isMipmapMinFilter(resolvedMinFilter)) {
      throw new TypeError(ERROR_MIPMAP_POLICY_CONFLICT);
    }
    this.#flipY = flipY;
    this.#wrapS = resolvedWrapS;
    this.#wrapT = resolvedWrapT;
    this.#minFilter = resolvedMinFilter;
    this.#magFilter = resolvedMagFilter;
    this.#mipmapPolicy = mipmapPolicy;
    this.#hasExplicitMinFilter = hasExplicitMinFilter;
    const texture = webglContext.createTexture();
    if (!texture) {
      throw new Error(ERROR_FAILED_CREATE_TEXTURE);
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
    this.#applySamplerParams();
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
    if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < MIN_TEXTURE_UNIT_INDEX) {
      throw new TypeError(ERROR_EXPECTS_TEXTURE_UNIT_INDEX);
    }
    const webglContext = this.#webglContext;
    const maxUnits = webglContext.getParameter(webglContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    if (!Number.isInteger(maxUnits) || maxUnits <= MIN_TEXTURE_UNIT_INDEX) {
      throw new Error(ERROR_FAILED_READ_MAX_TEXTURE_UNITS);
    }
    if (textureUnitIndex >= maxUnits) {
      throw new RangeError(`${ERROR_TEXTURE_UNIT_INDEX_OUT_OF_RANGE_PREFIX}${maxUnits - 1}.`);
    }
    webglContext.activeTexture(webglContext.TEXTURE0 + textureUnitIndex);
    webglContext.bindTexture(webglContext.TEXTURE_2D, this.#texture);
  }
  /**
   * Updates sampler parameters for this texture.
   *
   * @param {Texture2DOptions} [options] - Sampler options to update.
   * @throws {TypeError} When provided arguments do not match expected types or supported enums.
   */
  setSamplerParams(options = {}) {
    this.#assertNotDisposed();
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(ERROR_EXPECTS_SAMPLER_OPTIONS_OBJECT);
    }
    const hasExplicitWrapS = Object.prototype.hasOwnProperty.call(options, "wrapS");
    const hasExplicitWrapT = Object.prototype.hasOwnProperty.call(options, "wrapT");
    const hasMinFilterProperty = Object.prototype.hasOwnProperty.call(options, "minFilter");
    const isResetMinFilter = hasMinFilterProperty && options.minFilter === null;
    const hasExplicitMinFilter = hasMinFilterProperty && !isResetMinFilter;
    const hasExplicitMagFilter = Object.prototype.hasOwnProperty.call(options, "magFilter");
    const hasExplicitMipmapPolicy = Object.prototype.hasOwnProperty.call(options, "mipmapPolicy");
    const nextWrapS = hasExplicitWrapS ? options.wrapS : this.#wrapS;
    const nextWrapT = hasExplicitWrapT ? options.wrapT : this.#wrapT;
    const nextMinFilter = isResetMinFilter ? this.#webglContext.LINEAR : hasExplicitMinFilter ? options.minFilter : this.#minFilter;
    const nextMagFilter = hasExplicitMagFilter ? options.magFilter : this.#magFilter;
    const nextMipmapPolicy = hasExplicitMipmapPolicy ? options.mipmapPolicy : this.#mipmapPolicy;
    const nextHasExplicitMinFilter = isResetMinFilter ? false : hasExplicitMinFilter ? true : this.#hasExplicitMinFilter;
    if (hasExplicitWrapS && !this.#isValidWrapMode(nextWrapS)) {
      throw new TypeError(ERROR_EXPECTS_WRAP_S_ENUM);
    }
    if (hasExplicitWrapT && !this.#isValidWrapMode(nextWrapT)) {
      throw new TypeError(ERROR_EXPECTS_WRAP_T_ENUM);
    }
    if (hasExplicitMinFilter && !this.#isValidMinFilter(nextMinFilter)) {
      throw new TypeError(ERROR_EXPECTS_MIN_FILTER_ENUM);
    }
    if (hasExplicitMagFilter && !this.#isValidMagFilter(nextMagFilter)) {
      throw new TypeError(ERROR_EXPECTS_MAG_FILTER_ENUM);
    }
    if (hasExplicitMipmapPolicy && !this.#isValidMipmapPolicy(nextMipmapPolicy)) {
      throw new TypeError(ERROR_EXPECTS_MIPMAP_POLICY);
    }
    if (nextMipmapPolicy === MIPMAP_POLICY_NONE && nextHasExplicitMinFilter && this.#isMipmapMinFilter(nextMinFilter)) {
      throw new TypeError(ERROR_MIPMAP_POLICY_CONFLICT);
    }
    this.#wrapS = nextWrapS;
    this.#wrapT = nextWrapT;
    this.#minFilter = nextMinFilter;
    this.#magFilter = nextMagFilter;
    this.#mipmapPolicy = nextMipmapPolicy;
    this.#hasExplicitMinFilter = nextHasExplicitMinFilter;
    this.#bindTexture();
    try {
      if (this.#isLoaded) {
        const mipmapsGenerated = this.#maybeGenerateMipmaps();
        this.#syncMinFilterWithMipmaps(mipmapsGenerated);
      } else if (!this.#hasExplicitMinFilter && this.#isMipmapMinFilter(this.#minFilter)) {
        this.#minFilter = this.#webglContext.LINEAR;
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
   * @returns {Promise<void>}                - Promise, that resolves after successful GPU upload, or rejects on `load/decode/upload` error.
   * @throws {TypeError} When arguments are invalid.
   */
  async loadFromUrl(url, options = {}) {
    this.#assertNotDisposed();
    if (typeof url !== "string" || url.length < MIN_REQUIRED_STRING_LENGTH2) {
      throw new TypeError(ERROR_EXPECTS_URL_STRING);
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(ERROR_EXPECTS_LOAD_OPTIONS_OBJECT);
    }
    const hasCrossOrigin = Object.prototype.hasOwnProperty.call(options, "crossOrigin");
    const crossOrigin = hasCrossOrigin ? options.crossOrigin : null;
    if (hasCrossOrigin && crossOrigin !== null && crossOrigin !== CROSS_ORIGIN_ANONYMOUS && crossOrigin !== CROSS_ORIGIN_USE_CREDENTIALS) {
      throw new TypeError(ERROR_EXPECTS_CROSS_ORIGIN);
    }
    const image = await this.#loadImage(url, crossOrigin);
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
   * @param {string} url                         - Image URL.
   * @param {(string|null)} [crossOrigin = null] - Optional CORS mode: `anonymous/use-credentials`.
   * @returns {Promise<HTMLImageElement>}        - Promise, that resolves with a decoded image on `load`, or rejects on `error`.
   * @private
   */
  #loadImage(url, crossOrigin = null) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      if (typeof crossOrigin === "string") {
        image.crossOrigin = crossOrigin;
      }
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`${ERROR_FAILED_LOAD_IMAGE_PREFIX}${url}`));
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
    const previousFlipY = webglContext.getParameter(webglContext.UNPACK_FLIP_Y_WEBGL);
    this.#bindTexture();
    try {
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
      const mipmapsGenerated = this.#maybeGenerateMipmaps();
      this.#syncMinFilterWithMipmaps(mipmapsGenerated);
      this.#applySamplerParams();
    } finally {
      webglContext.pixelStorei(
        webglContext.UNPACK_FLIP_Y_WEBGL,
        previousFlipY ? WEBGL_TRUE_AS_INTEGER : WEBGL_FALSE_AS_INTEGER
      );
      this.#unbindTexture();
    }
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
    if (this.#mipmapPolicy === MIPMAP_POLICY_NONE) {
      return false;
    }
    if (this.#mipmapPolicy === MIPMAP_POLICY_AUTO && !(this.#isPowerOfTwo(this.#width) && this.#isPowerOfTwo(this.#height))) {
      if (this.#hasExplicitMinFilter && this.#isMipmapMinFilter(this.#minFilter)) {
        throw new TypeError(ERROR_MIPMAP_AUTO_POT_REQUIRED_FOR_MIPMAP_FILTER);
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
    if (mipmapsGenerated) {
      if (!this.#hasExplicitMinFilter) {
        this.#minFilter = this.#webglContext.LINEAR_MIPMAP_LINEAR;
      }
      return;
    }
    if (!this.#hasExplicitMinFilter && this.#isMipmapMinFilter(this.#minFilter)) {
      this.#minFilter = this.#webglContext.LINEAR;
    }
  }
  /**
   * Checks whether a value is a valid wrap mode.
   *
   * @param {number} value - Wrap mode value to validate.
   * @returns {boolean} True, when value is a supported wrap mode.
   * @private
   */
  #isValidWrapMode(value) {
    const webglContext = this.#webglContext;
    return value === webglContext.REPEAT || value === webglContext.CLAMP_TO_EDGE || value === webglContext.MIRRORED_REPEAT;
  }
  /**
   * Checks whether a value is a valid minification filter.
   *
   * @param {number} value - Filter value to validate.
   * @returns {boolean} True, when value is a supported min filter.
   * @private
   */
  #isValidMinFilter(value) {
    const webglContext = this.#webglContext;
    return value === webglContext.NEAREST || value === webglContext.LINEAR || value === webglContext.NEAREST_MIPMAP_NEAREST || value === webglContext.LINEAR_MIPMAP_NEAREST || value === webglContext.NEAREST_MIPMAP_LINEAR || value === webglContext.LINEAR_MIPMAP_LINEAR;
  }
  /**
   * Checks whether a value is a valid magnification filter.
   *
   * @param {number} value - Filter value to validate.
   * @returns {boolean} True, when value is a supported mag filter.
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
   * @returns {boolean} True, when value is a supported policy.
   * @private
   */
  #isValidMipmapPolicy(value) {
    return value === MIPMAP_POLICY_NONE || value === MIPMAP_POLICY_ALWAYS || value === MIPMAP_POLICY_AUTO;
  }
  /**
   * Checks whether a min filter value uses mipmaps.
   *
   * @param {number} value - Filter value to validate.
   * @returns {boolean} True, when the filter expects mipmaps.
   * @private
   */
  #isMipmapMinFilter(value) {
    const webglContext = this.#webglContext;
    return value === webglContext.NEAREST_MIPMAP_NEAREST || value === webglContext.LINEAR_MIPMAP_NEAREST || value === webglContext.NEAREST_MIPMAP_LINEAR || value === webglContext.LINEAR_MIPMAP_LINEAR;
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
      throw new Error(ERROR_INSTANCE_DISPOSED);
    }
  }
};

// core/shader/shader-program.js
var MATRIX_4x4_ELEMENT_COUNT = 16;
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
    if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
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

// core/constants/ecmascript-types.js
var ECMASCRIPT_TYPEOF_RESULTS = Object.freeze({
  UNDEFINED: "undefined",
  OBJECT: "object",
  BOOLEAN: "boolean",
  NUMBER: "number",
  BIGINT: "bigint",
  STRING: "string",
  SYMBOL: "symbol",
  FUNCTION: "function"
});

// core/exception-messages/directional-light-material.js
var DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES = Object.freeze({
  WEBGL_CONTEXT_TYPE: "`DirectionalLightMaterial` expects a WebGL2RenderingContext.",
  SHADER_PROGRAM_TYPE: "`DirectionalLightMaterial` expects a ShaderProgram instance.",
  OWNS_SHADER_PROGRAM_TYPE: '`DirectionalLightMaterial` option "ownsShaderProgram" must be a boolean.',
  LIGHT_DIRECTION_LENGTH: "`DirectionalLightMaterial.setLightDirection` expects a non-zero finite vector.",
  AMBIENT_STRENGTH_TYPE: "`DirectionalLightMaterial.setAmbientStrength` expects a finite number.",
  DIRECTIONAL_STRENGTH_TYPE: "`DirectionalLightMaterial.setDirectionalStrength` expects a finite number.",
  DIRECTIONAL_ENABLED_TYPE: "`DirectionalLightMaterial.setDirectionalEnabled` expects a boolean.",
  LIGHTING_ENABLED_TYPE: "`DirectionalLightMaterial.setLightingEnabled` expects a boolean or a finite number.",
  LIGHTING_ENABLED_RANGE: "`DirectionalLightMaterial.setLightingEnabled` expects a value in [0..1].",
  VECTOR3_TYPE: "{methodName} expects a number[] or Float32Array.",
  VECTOR3_COMPONENTS: "{methodName} expects exactly 3 components [x, y, z].",
  VECTOR3_COMPONENTS_FINITE: "{methodName} expects all components to be finite numbers.",
  OPTIONS_OBJECT: "{methodName} expects an options object (plain object)."
});

// core/constants/light.js
var LIGHT_DEFAULTS = Object.freeze({ ENABLED: true });
var LIGHT_AMBIENT = Object.freeze({ DEFAULT_STRENGTH: 0.2 });
var LIGHT_DIRECTIONAL = Object.freeze({
  DEFAULT_DIRECTIONAL_STRENGTH: 1,
  MIN_DIRECTIONAL_STRENGTH: 0,
  MAX_DIRECTIONAL_STRENGTH: 3,
  MIN_DIRECTION_LENGTH_SQUARED: 0,
  INVERSE_LENGTH_NUMERATOR: 1,
  DEFAULT_ROLL_RADIANS: 0,
  ASIN_CLAMP_MIN: -1,
  ASIN_CLAMP_MAX: 1
});
var LIGHT_DIRECTIONAL_DEFAULT_DIRECTION = Object.freeze([0.5, 0.7, 1]);
var DEFAULT_DIRECTION_LENGTH = Math.hypot(
  LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MATH_VECTOR3_INDEXES.X],
  LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MATH_VECTOR3_INDEXES.Y],
  LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MATH_VECTOR3_INDEXES.Z]
);
var LIGHT_DIRECTIONAL_DEFAULT_NORMALIZED_DIRECTION = Object.freeze([
  LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MATH_VECTOR3_INDEXES.X] / DEFAULT_DIRECTION_LENGTH,
  LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MATH_VECTOR3_INDEXES.Y] / DEFAULT_DIRECTION_LENGTH,
  LIGHT_DIRECTIONAL_DEFAULT_DIRECTION[MATH_VECTOR3_INDEXES.Z] / DEFAULT_DIRECTION_LENGTH
]);

// core/constants/directional-light-material.js
var DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES = Object.freeze({
  POSITION_LOCATION: 0,
  NORMAL_LOCATION: 3
});
var DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS = Object.freeze({
  FINAL_MATRIX: "u_matrix",
  WORLD_INVERSE_TRANSPOSE_MATRIX: "u_worldInverseTranspose",
  WORLD_MATRIX: "u_worldMatrix",
  COLOR: "u_color",
  LIGHT_DIRECTION: "u_lightDirection",
  CAMERA_POSITION: "u_cameraPosition",
  AMBIENT_STRENGTH: "u_ambientStrength",
  DIRECTIONAL_STRENGTH: "u_directionalStrength",
  LIGHTING_ENABLED: "u_lightingEnabled",
  OPACITY: "u_opacity"
});
var DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR = Object.freeze([0.85, 0.85, 0.85]);
var DIRECTIONAL_LIGHT_MATERIAL_LIGHTING = Object.freeze({
  DEFAULT_LIGHTING_ENABLED: 1,
  FLOAT_FALSE: 0,
  FLOAT_TRUE: 1,
  MIN_LIGHTING_ENABLED: 0,
  MAX_LIGHTING_ENABLED: 1,
  LIGHTING_ENABLED_THRESHOLD: 0.5
});
var DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT = 3;

// core/material/directional-light-material.js
var DirectionalLightMaterial = class _DirectionalLightMaterial extends Material {
  /**
   * Diffuse/base color (RGB).
   *
   * @type {Float32Array}
   * @private
   */
  #color = new Float32Array(DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT);
  /**
   * Directional light direction (world space, normalized).
   *
   * @type {Float32Array}
   * @private
   */
  #lightDirection = new Float32Array(DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT);
  /**
   * Ambient term multiplier.
   *
   * @type {number}
   * @private
   */
  #ambientStrength = LIGHT_AMBIENT.DEFAULT_STRENGTH;
  /**
   * Directional strength multiplier.
   *
   * @type {number}
   * @private
   */
  #directionalStrength = LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;
  /**
   * Lighting enabled flag stored as a float.
   *
   * @type {number}
   * @private
   */
  #lightingEnabled = DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.DEFAULT_LIGHTING_ENABLED;
  /**
   * Creates a new directional-light material.
   *
   * @param {WebGL2RenderingContext} webglContext                   - WebGL2 rendering context used to create the GPU resources.
   * @param {ShaderProgram} shaderProgram                           - Compiled shader program instance.
   * @param {DirectionalLightMaterialOptions} [options]             - Common material options.
   * @param {DirectionalLightMaterialBaseOptions} [materialOptions] - Material base options.
   */
  constructor(webglContext, shaderProgram, options = {}, materialOptions = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.WEBGL_CONTEXT_TYPE);
    }
    if (!(shaderProgram instanceof ShaderProgram)) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.SHADER_PROGRAM_TYPE);
    }
    _DirectionalLightMaterial.#assertPlainObject("`DirectionalLightMaterial`", options);
    _DirectionalLightMaterial.#assertPlainObject("`DirectionalLightMaterial`", materialOptions);
    const { ownsShaderProgram = true } = materialOptions;
    if (typeof ownsShaderProgram !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.OWNS_SHADER_PROGRAM_TYPE);
    }
    super(webglContext, shaderProgram, { ownsShaderProgram });
    this.#color.set(DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR);
    this.setLightDirection(LIGHT_DIRECTIONAL_DEFAULT_DIRECTION);
    this.#ambientStrength = LIGHT_AMBIENT.DEFAULT_STRENGTH;
    this.#directionalStrength = LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;
    const {
      color,
      lightDirection,
      ambientStrength,
      directionalStrength,
      lightingEnabled
    } = options;
    if (color !== void 0) {
      this.setColor(color);
    }
    if (lightDirection !== void 0) {
      this.setLightDirection(lightDirection);
    }
    if (ambientStrength !== void 0) {
      this.setAmbientStrength(ambientStrength);
    }
    if (directionalStrength !== void 0) {
      this.setDirectionalStrength(directionalStrength);
    }
    if (lightingEnabled !== void 0) {
      this.setLightingEnabled(lightingEnabled);
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
    this.shaderProgram.setMatrix4(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX, finalMatrix);
    this.shaderProgram.setMatrix4(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX, worldInverseTransposeMatrix);
    this.shaderProgram.setVector3(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR, this.#color);
    this.shaderProgram.setVector3(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION, this.#lightDirection);
    this.shaderProgram.setFloat(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH, this.#ambientStrength);
    this.shaderProgram.setFloat(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH, this.#directionalStrength);
    this.shaderProgram.setFloat(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED, this.#lightingEnabled);
    this.shaderProgram.setFloat(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY, this.opacity);
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
    if (!Number.isFinite(directionLengthSquared) || directionLengthSquared <= LIGHT_DIRECTIONAL.MIN_DIRECTION_LENGTH_SQUARED) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHT_DIRECTION_LENGTH);
    }
    const inverseDirectionLength = LIGHT_DIRECTIONAL.INVERSE_LENGTH_NUMERATOR / Math.sqrt(directionLengthSquared);
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
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.AMBIENT_STRENGTH_TYPE);
    }
    this.#ambientStrength = value;
  }
  /**
   * Sets directional strength multiplier.
   *
   * @param {number} value - Directional strength multiplier.
   * @returns {void}
   * @throws {TypeError} When the value is invalid.
   */
  setDirectionalStrength(value) {
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.DIRECTIONAL_STRENGTH_TYPE);
    }
    this.#directionalStrength = value;
  }
  /**
   * Enables or disables the directional light contribution.
   *
   * @param {boolean} enabled - Whether directional lighting should be enabled.
   * @returns {void}
   * @throws {TypeError} When the value is invalid.
   */
  setDirectionalEnabled(enabled) {
    if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.DIRECTIONAL_ENABLED_TYPE);
    }
    this.#directionalStrength = enabled ? LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH : LIGHT_DIRECTIONAL.MIN_DIRECTIONAL_STRENGTH;
  }
  /**
   * Sets lighting enabled state.
   *
   * @param {boolean | number} enabled - Boolean or a [0..1] numeric flag.
   * @returns {void}
   * @throws {TypeError}  When the value type is invalid.
   * @throws {RangeError} When the value is outside [0..1].
   */
  setLightingEnabled(enabled) {
    if (typeof enabled === ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
      this.#lightingEnabled = enabled ? DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.FLOAT_TRUE : DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.FLOAT_FALSE;
      return;
    }
    if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(enabled)) {
      throw new TypeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHTING_ENABLED_TYPE);
    }
    if (enabled < DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.MIN_LIGHTING_ENABLED || enabled > DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.MAX_LIGHTING_ENABLED) {
      throw new RangeError(DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHTING_ENABLED_RANGE);
    }
    this.#lightingEnabled = enabled;
  }
  /**
   * @returns {boolean} - Returns current lighting enabled state.
   */
  isLightingEnabled() {
    return this.#lightingEnabled > DIRECTIONAL_LIGHT_MATERIAL_LIGHTING.LIGHTING_ENABLED_THRESHOLD;
  }
  /**
   * @returns {Float32Array} - Returns the internal diffuse/base color buffer.
   */
  get color() {
    return this.#color;
  }
  /**
   * @returns {Float32Array} - Returns the internal normalized light direction buffer.
   */
  get lightDirection() {
    return this.#lightDirection;
  }
  /**
   * @returns {number} - Ambient strength multiplier.
   */
  get ambientStrength() {
    return this.#ambientStrength;
  }
  /**
   * @returns {number} - Returns the directional strength multiplier value.
   */
  getDirectionalStrength() {
    return this.#directionalStrength;
  }
  /**
   * @returns {number} - Getter for the directional strength multiplier.
   */
  get directionalStrength() {
    return this.#directionalStrength;
  }
  /**
   * Formats a directional-light material exception message template.
   *
   * @param {string} messageTemplate - Message template with a `{methodName}` token.
   * @param {string} methodName      - Method name to inject.
   * @returns {string}               - Formatted exception message.
   * @private
   */
  static #formatExceptionMessage(messageTemplate, methodName) {
    return messageTemplate.replace("{methodName}", methodName);
  }
  /**
   * Validates a vector3-like input.
   *
   * @param {string} methodName               - Method name for error messages.
   * @param {Float32Array | number[]} vector3 - Vector to validate.
   */
  static assertVector3(methodName, vector3) {
    if (!Array.isArray(vector3) && !(vector3 instanceof Float32Array)) {
      throw new TypeError(_DirectionalLightMaterial.#formatExceptionMessage(
        DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.VECTOR3_TYPE,
        methodName
      ));
    }
    if (vector3.length !== DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT) {
      throw new TypeError(_DirectionalLightMaterial.#formatExceptionMessage(
        DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.VECTOR3_COMPONENTS,
        methodName
      ));
    }
    if (!Number.isFinite(vector3[0]) || !Number.isFinite(vector3[1]) || !Number.isFinite(vector3[2])) {
      throw new TypeError(_DirectionalLightMaterial.#formatExceptionMessage(
        DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.VECTOR3_COMPONENTS_FINITE,
        methodName
      ));
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
    if (object === null || typeof object !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(object)) {
      throw new TypeError(_DirectionalLightMaterial.#formatExceptionMessage(
        DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT,
        methodName
      ));
    }
  }
};

// core/material/lambert-material.js
var VERTEX_SHADER_SOURCE5 = `#version 300 es
precision mediump float;
layout(location = ${DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
out vec3 v_normal;

void main() {
    gl_Position = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(a_position, 1.0);
    v_normal    = (${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
}
`;
var FRAGMENT_SHADER_SOURCE5 = `#version 300 es
precision mediump float;
in vec3 v_normal;
uniform vec3  ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3  ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);

    if (!gl_FrontFacing) {
        surface_normal = -surface_normal;
    }

    vec3 light_direction    = normalize(${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    float diffuse_intensity = max(dot(surface_normal, light_direction), 0.0) * ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
    float lit_intensity     = clamp(${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH} + diffuse_intensity, 0.0, 1.0);
    float light_intensity   = mix(1.0, lit_intensity, ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED});
    outColor                = vec4(${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * light_intensity, ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY});
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
layout(location = ${DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX};
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
out vec3 v_worldPosition;
out vec3 v_normal;

void main() {
    gl_Position     = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(a_position, 1.0);
    v_worldPosition = (${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX} * vec4(a_position, 1.0)).xyz;
    v_normal        = (${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
}
`;
var FRAGMENT_SHADER_SOURCE6 = `#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
uniform vec3  ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3  ${SPECULAR_COLOR_UNIFORM_NAME};
uniform vec3  ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform vec3  ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${SPECULAR_STRENGTH_UNIFORM_NAME};
uniform float ${SHININESS_UNIFORM_NAME};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);

    if (!gl_FrontFacing) {
        surface_normal = -surface_normal;
    }

    vec3 light_direction     = normalize(${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    vec3 view_direction      = normalize(${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION} - v_worldPosition);
    float lighting_enabled   = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
    float diffuse_intensity  = max(dot(surface_normal, light_direction), 0.0) * ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
    float specular_intensity = 0.0;

    if (diffuse_intensity > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, surface_normal);
        float specular_base       = max(dot(view_direction, reflection_direction), 0.0);
        specular_intensity        = pow(specular_base, ${SHININESS_UNIFORM_NAME});
    }

    vec3 ambient  = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
    vec3 diffuse  = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * (diffuse_intensity * lighting_enabled);
    vec3 specular = ${SPECULAR_COLOR_UNIFORM_NAME}
        * (specular_intensity * ${SPECULAR_STRENGTH_UNIFORM_NAME}
        * ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH} * lighting_enabled);

    vec3 rgb = ambient + diffuse + specular;
    outColor = vec4(rgb, ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY});
}
`;
var PhongMaterial = class extends DirectionalLightMaterial {
  /**
   * Specular color (RGB).
   *
   * @type {Float32Array}
   * @private
   */
  #specularColor = new Float32Array(DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT);
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
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context, used to compile shaders.
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
    this.shaderProgram.setMatrix4(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX, worldMatrix);
    this.shaderProgram.setVector3(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION, cameraPosition);
    this.shaderProgram.setVector3(SPECULAR_COLOR_UNIFORM_NAME, this.#specularColor);
    this.shaderProgram.setFloat(SPECULAR_STRENGTH_UNIFORM_NAME, this.#specularStrength);
    this.shaderProgram.setFloat(SHININESS_UNIFORM_NAME, this.#shininess);
  }
  /**
   * Sets the specular RGB-color.
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

// core/material/points-material.js
var POSITION_ATTRIBUTE_LOCATION6 = 0;
var COLOR_ATTRIBUTE_LOCATION3 = 1;
var MATRIX_UNIFORM_NAME5 = "u_matrix";
var COLOR_UNIFORM_NAME2 = "u_color";
var POINT_SIZE_UNIFORM_NAME = "u_pointSize";
var OPACITY_UNIFORM_NAME5 = "u_opacity";
var USE_VERTEX_COLOR_UNIFORM_NAME = "u_useVertexColor";
var COLOR_COMPONENT_COUNT4 = 3;
var COLOR_COMPONENT_RED_INDEX = 0;
var COLOR_COMPONENT_GREEN_INDEX = 1;
var COLOR_COMPONENT_BLUE_INDEX = 2;
var DEFAULT_COLOR2 = new Float32Array([1, 1, 1]);
var DEFAULT_POINT_SIZE = 6;
var MIN_POINT_SIZE = 0;
var DEFAULT_USE_VERTEX_COLORS = false;
var FLOAT_FALSE = 0;
var FLOAT_TRUE = 1;
var POINT_COORD_CENTER = 0.5;
var POINT_COORD_RADIUS = 0.5;
var POSITION_W_COMPONENT = 1;
var VERTEX_SHADER_SOURCE7 = `#version 300 es
precision mediump float;
layout(location = ${POSITION_ATTRIBUTE_LOCATION6}) in vec3 a_position;
layout(location = ${COLOR_ATTRIBUTE_LOCATION3}) in vec3 a_color;
uniform mat4 ${MATRIX_UNIFORM_NAME5};
uniform vec3 ${COLOR_UNIFORM_NAME2};
uniform float ${POINT_SIZE_UNIFORM_NAME};
uniform float ${USE_VERTEX_COLOR_UNIFORM_NAME};
out vec3 v_color;

void main() {
    gl_Position  = ${MATRIX_UNIFORM_NAME5} * vec4(a_position, ${POSITION_W_COMPONENT});
    gl_PointSize = ${POINT_SIZE_UNIFORM_NAME};
    v_color      = mix(${COLOR_UNIFORM_NAME2}, a_color, ${USE_VERTEX_COLOR_UNIFORM_NAME});
}
`;
var FRAGMENT_SHADER_SOURCE7 = `#version 300 es
precision mediump float;
in vec3 v_color;
uniform float ${OPACITY_UNIFORM_NAME5};
out vec4 outColor;

void main() {
    vec2 centered = gl_PointCoord - vec2(${POINT_COORD_CENTER}, ${POINT_COORD_CENTER});
    float dist    = length(centered);

    if (dist > ${POINT_COORD_RADIUS}) {
        discard;
    }

    outColor = vec4(v_color, ${OPACITY_UNIFORM_NAME5});
}
`;
var PointsMaterial = class extends Material {
  /**
   * Current RGB color stored as Float32Array([red, green, blue]).
   *
   * @type {Float32Array}
   * @private
   */
  #color = new Float32Array(DEFAULT_COLOR2);
  /**
   * Point size in pixels.
   *
   * @type {number}
   * @private
   */
  #pointSize = DEFAULT_POINT_SIZE;
  /**
   * Flag controlling vertex color usage.
   *
   * @type {boolean}
   * @private
   */
  #useVertexColors = DEFAULT_USE_VERTEX_COLORS;
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
   * @param {PointsMaterialOptions} [options]     - Material options.
   * @throws {TypeError}  When inputs are invalid.
   * @throws {RangeError} When numeric inputs are out of range.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("`PointsMaterial` expects an options object (plain object).");
    }
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE7, FRAGMENT_SHADER_SOURCE7);
    super(webglContext, shaderProgram, { ownsShaderProgram: true });
    const {
      color,
      pointSize = DEFAULT_POINT_SIZE,
      useVertexColors = DEFAULT_USE_VERTEX_COLORS
    } = options;
    if (color !== void 0) {
      this.setColor(color);
    }
    this.setPointSize(pointSize);
    this.setUseVertexColors(useVertexColors);
  }
  /**
   * Applies per-object uniforms.
   *
   * @param {Float32Array} matrix4 - Transformation matrix passed as `u_matrix`.
   */
  apply(matrix4) {
    this.shaderProgram.setMatrix4(MATRIX_UNIFORM_NAME5, matrix4);
    this.shaderProgram.setVector3(COLOR_UNIFORM_NAME2, this.#color);
    this.shaderProgram.setFloat(POINT_SIZE_UNIFORM_NAME, this.#pointSize);
    this.shaderProgram.setFloat(USE_VERTEX_COLOR_UNIFORM_NAME, this.#useVertexColors ? FLOAT_TRUE : FLOAT_FALSE);
    this.shaderProgram.setFloat(OPACITY_UNIFORM_NAME5, this.opacity);
  }
  /**
   * Sets the RGB color.
   *
   * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
   * @throws {TypeError} When color is invalid.
   */
  setColor(color) {
    if (!Array.isArray(color) && !(color instanceof Float32Array)) {
      throw new TypeError("`PointsMaterial.setColor` expects a number[] or `Float32Array`.");
    }
    if (color.length !== COLOR_COMPONENT_COUNT4) {
      throw new TypeError("`PointsMaterial.setColor` expects exactly 3 components [red, green, blue].");
    }
    this.#color[COLOR_COMPONENT_RED_INDEX] = color[COLOR_COMPONENT_RED_INDEX];
    this.#color[COLOR_COMPONENT_GREEN_INDEX] = color[COLOR_COMPONENT_GREEN_INDEX];
    this.#color[COLOR_COMPONENT_BLUE_INDEX] = color[COLOR_COMPONENT_BLUE_INDEX];
  }
  /**
   * Sets point size in pixels.
   *
   * @param {number} size - Point size (> 0).
   * @throws {TypeError}  When size is not a finite number.
   * @throws {RangeError} When size is not positive.
   */
  setPointSize(size) {
    if (typeof size !== "number" || !Number.isFinite(size)) {
      throw new TypeError("`PointsMaterial.setPointSize` expects a finite number.");
    }
    if (size <= MIN_POINT_SIZE) {
      throw new RangeError("`PointsMaterial.setPointSize` expects a positive size.");
    }
    this.#pointSize = size;
  }
  /**
   * Enables or disables vertex colors.
   *
   * @param {boolean} enabled - When true, uses vertex colors.
   * @throws {TypeError} When enabled is not a boolean.
   */
  setUseVertexColors(enabled) {
    if (typeof enabled !== "boolean") {
      throw new TypeError("`PointsMaterial.setUseVertexColors` expects a boolean.");
    }
    this.#useVertexColors = enabled;
  }
  /**
   * @returns {Float32Array}
   */
  get color() {
    return this.#color;
  }
  /**
   * @returns {number}
   */
  get pointSize() {
    return this.#pointSize;
  }
  /**
   * @returns {boolean}
   */
  get useVertexColors() {
    return this.#useVertexColors;
  }
};

// core/material/mtl-standard-material.js
var UV_ATTRIBUTE_LOCATION3 = 2;
var DIFFUSE_MAP_UNIFORM_NAME = "u_diffuseMap";
var AMBIENT_MAP_UNIFORM_NAME = "u_ambientMap";
var SPECULAR_MAP_UNIFORM_NAME = "u_specularMap";
var ALPHA_MAP_UNIFORM_NAME = "u_alphaMap";
var BUMP_MAP_UNIFORM_NAME = "u_bumpMap";
var DISPLACEMENT_MAP_UNIFORM_NAME = "u_displacementMap";
var REFLECTION_MAP_UNIFORM_NAME = "u_reflectionMap";
var AMBIENT_COLOR_UNIFORM_NAME = "u_ambientColor";
var SPECULAR_COLOR_UNIFORM_NAME2 = "u_specularColor";
var EMISSIVE_COLOR_UNIFORM_NAME = "u_emissiveColor";
var SPECULAR_STRENGTH_UNIFORM_NAME2 = "u_specularStrength";
var SHININESS_UNIFORM_NAME2 = "u_shininess";
var SPECULAR_ENABLED_UNIFORM_NAME = "u_useSpecular";
var OPTICAL_DENSITY_UNIFORM_NAME = "u_opticalDensity";
var BUMP_MULTIPLIER_UNIFORM_NAME = "u_bumpMultiplier";
var DISPLACEMENT_SCALE_UNIFORM_NAME = "u_displacementScale";
var DIFFUSE_UV_OFFSET_UNIFORM_NAME = "u_diffuseUvOffset";
var DIFFUSE_UV_SCALE_UNIFORM_NAME = "u_diffuseUvScale";
var AMBIENT_UV_OFFSET_UNIFORM_NAME = "u_ambientUvOffset";
var AMBIENT_UV_SCALE_UNIFORM_NAME = "u_ambientUvScale";
var SPECULAR_UV_OFFSET_UNIFORM_NAME = "u_specularUvOffset";
var SPECULAR_UV_SCALE_UNIFORM_NAME = "u_specularUvScale";
var ALPHA_UV_OFFSET_UNIFORM_NAME = "u_alphaUvOffset";
var ALPHA_UV_SCALE_UNIFORM_NAME = "u_alphaUvScale";
var BUMP_UV_OFFSET_UNIFORM_NAME = "u_bumpUvOffset";
var BUMP_UV_SCALE_UNIFORM_NAME = "u_bumpUvScale";
var DISPLACEMENT_UV_OFFSET_UNIFORM_NAME = "u_displacementUvOffset";
var DISPLACEMENT_UV_SCALE_UNIFORM_NAME = "u_displacementUvScale";
var REFLECTION_UV_OFFSET_UNIFORM_NAME = "u_reflectionUvOffset";
var REFLECTION_UV_SCALE_UNIFORM_NAME = "u_reflectionUvScale";
var USE_DIFFUSE_MAP_UNIFORM_NAME = "u_useDiffuseMap";
var USE_AMBIENT_MAP_UNIFORM_NAME = "u_useAmbientMap";
var USE_SPECULAR_MAP_UNIFORM_NAME = "u_useSpecularMap";
var USE_ALPHA_MAP_UNIFORM_NAME = "u_useAlphaMap";
var USE_BUMP_MAP_UNIFORM_NAME = "u_useBumpMap";
var USE_DISPLACEMENT_MAP_UNIFORM_NAME = "u_useDisplacementMap";
var USE_REFLECTION_MAP_UNIFORM_NAME = "u_useReflectionMap";
var LIGHTING_ENABLED_THRESHOLD = 0.5;
var DEFAULT_DIFFUSE_COLOR = new Float32Array([1, 1, 1]);
var DEFAULT_AMBIENT_COLOR = new Float32Array([1, 1, 1]);
var DEFAULT_SPECULAR_COLOR2 = new Float32Array([1, 1, 1]);
var DEFAULT_EMISSIVE_COLOR = new Float32Array([0, 0, 0]);
var DEFAULT_SHININESS2 = 16;
var DEFAULT_SPECULAR_STRENGTH2 = 1;
var DEFAULT_OPTICAL_DENSITY = 1;
var DEFAULT_BUMP_MULTIPLIER = 1;
var DEFAULT_DISPLACEMENT_SCALE = 0.1;
var DEFAULT_UV_OFFSET = new Float32Array([0, 0]);
var DEFAULT_UV_SCALE = new Float32Array([1, 1]);
var FLOAT_FALSE2 = 0;
var FLOAT_TRUE2 = 1;
var DEFAULT_DIFFUSE_TEXTURE_UNIT = 0;
var DEFAULT_AMBIENT_TEXTURE_UNIT = 1;
var DEFAULT_SPECULAR_TEXTURE_UNIT = 2;
var DEFAULT_ALPHA_TEXTURE_UNIT = 3;
var DEFAULT_BUMP_TEXTURE_UNIT = 4;
var DEFAULT_DISPLACEMENT_TEXTURE_UNIT = 5;
var DEFAULT_REFLECTION_TEXTURE_UNIT = 6;
var ZERO_VALUE10 = 0;
var ERROR_OPTIONS_OBJECT = "`MtlStandardMaterial` expects an options object (plain object).";
var ERROR_SHININESS_TYPE = "`MtlStandardMaterial.setShininess` expects a finite number.";
var ERROR_SPECULAR_STRENGTH_TYPE = "`MtlStandardMaterial.setSpecularStrength` expects a finite number.";
var ERROR_SPECULAR_ENABLED_TYPE = "`MtlStandardMaterial.setSpecularEnabled` expects a boolean.";
var ERROR_OPTICAL_DENSITY_TYPE = "`MtlStandardMaterial.setOpticalDensity` expects a finite number.";
var ERROR_BUMP_MULTIPLIER_TYPE = "`MtlStandardMaterial.setBumpMultiplier` expects a finite number.";
var ERROR_DISPLACEMENT_SCALE_TYPE = "`MtlStandardMaterial.setDisplacementScale` expects a finite number.";
var ERROR_EXPECTS_TEXTURE_SUFFIX = " expects texture as Texture2D.";
var ERROR_EXPECTS_OPTIONS_OBJECT_SUFFIX = " expects options as a plain object.";
var ERROR_EXPECTS_TEXTURE_UNIT_INDEX_SUFFIX = " expects options.textureUnitIndex as a non-negative integer.";
var ERROR_EXPECTS_VECTOR2_TYPE_SUFFIX = " expects a number[] or Float32Array.";
var ERROR_EXPECTS_VECTOR2_COMPONENTS_SUFFIX = " expects exactly 2 components.";
var ERROR_EXPECTS_VECTOR3_COMPONENTS_SUFFIX = " expects exactly 3 components.";
var VERTEX_SHADER_SOURCE8 = `#version 300 es
precision mediump float;
layout(location = ${DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
layout(location = ${UV_ATTRIBUTE_LOCATION3}) in vec2 a_uv;
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX};
uniform mat4 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
uniform sampler2D ${DISPLACEMENT_MAP_UNIFORM_NAME};
uniform float ${USE_DISPLACEMENT_MAP_UNIFORM_NAME};
uniform float ${DISPLACEMENT_SCALE_UNIFORM_NAME};
uniform vec2 ${DISPLACEMENT_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${DISPLACEMENT_UV_SCALE_UNIFORM_NAME};
out vec3 v_worldPosition;
out vec3 v_normal;
out vec2 v_uv;

void main() {
    vec2 disp_uv = (a_uv * ${DISPLACEMENT_UV_SCALE_UNIFORM_NAME}) + ${DISPLACEMENT_UV_OFFSET_UNIFORM_NAME};
    float displacement = 0.0;

    if (${USE_DISPLACEMENT_MAP_UNIFORM_NAME} > 0.5) {
        displacement = texture(${DISPLACEMENT_MAP_UNIFORM_NAME}, disp_uv).r * ${DISPLACEMENT_SCALE_UNIFORM_NAME};
    }

    vec3 displaced_position = a_position + (a_normal * displacement);
    gl_Position     = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(displaced_position, 1.0);
    v_worldPosition = (${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX} * vec4(displaced_position, 1.0)).xyz;
    v_normal        = (${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
    v_uv = a_uv;
}
`;
var FRAGMENT_SHADER_SOURCE8 = `#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
in vec2 v_uv;
uniform vec3 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3 ${AMBIENT_COLOR_UNIFORM_NAME};
uniform vec3 ${SPECULAR_COLOR_UNIFORM_NAME2};
uniform vec3 ${EMISSIVE_COLOR_UNIFORM_NAME};
uniform vec3 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform vec3 ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${SPECULAR_STRENGTH_UNIFORM_NAME2};
uniform float ${SHININESS_UNIFORM_NAME2};
uniform float ${SPECULAR_ENABLED_UNIFORM_NAME};
uniform float ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
uniform float ${OPTICAL_DENSITY_UNIFORM_NAME};
uniform float ${BUMP_MULTIPLIER_UNIFORM_NAME};
uniform sampler2D ${DIFFUSE_MAP_UNIFORM_NAME};
uniform sampler2D ${AMBIENT_MAP_UNIFORM_NAME};
uniform sampler2D ${SPECULAR_MAP_UNIFORM_NAME};
uniform sampler2D ${ALPHA_MAP_UNIFORM_NAME};
uniform sampler2D ${BUMP_MAP_UNIFORM_NAME};
uniform sampler2D ${REFLECTION_MAP_UNIFORM_NAME};
uniform vec2 ${DIFFUSE_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${DIFFUSE_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${AMBIENT_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${AMBIENT_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${SPECULAR_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${SPECULAR_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${ALPHA_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${ALPHA_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${BUMP_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${BUMP_UV_SCALE_UNIFORM_NAME};
uniform vec2 ${REFLECTION_UV_OFFSET_UNIFORM_NAME};
uniform vec2 ${REFLECTION_UV_SCALE_UNIFORM_NAME};
uniform float ${USE_DIFFUSE_MAP_UNIFORM_NAME};
uniform float ${USE_AMBIENT_MAP_UNIFORM_NAME};
uniform float ${USE_SPECULAR_MAP_UNIFORM_NAME};
uniform float ${USE_ALPHA_MAP_UNIFORM_NAME};
uniform float ${USE_BUMP_MAP_UNIFORM_NAME};
uniform float ${USE_REFLECTION_MAP_UNIFORM_NAME};
out vec4 outColor;

vec2 apply_uv(vec2 base_uv, vec2 offset, vec2 scale) {
    return (base_uv * scale) + offset;
}

vec3 compute_bump_normal(vec3 normal, vec2 uv) {
    vec3 tangent_normal = texture(${BUMP_MAP_UNIFORM_NAME}, uv).xyz * 2.0 - 1.0;
    tangent_normal.xy  *= ${BUMP_MULTIPLIER_UNIFORM_NAME};
    tangent_normal      = normalize(tangent_normal);

    vec3 dp1       = dFdx(v_worldPosition);
    vec3 dp2       = dFdy(v_worldPosition);
    vec2 duv1      = dFdx(uv);
    vec2 duv2      = dFdy(uv);
    vec3 tangent   = normalize(dp1 * duv2.y - dp2 * duv1.y);
    vec3 bitangent = normalize(-dp1 * duv2.x + dp2 * duv1.x);

    mat3 tbn = mat3(tangent, bitangent, normal);
    return normalize(tbn * tangent_normal);
}

vec2 compute_reflection_uv(vec3 normal, vec3 view_dir) {
    vec3 reflect_dir = reflect(-view_dir, normal);
    float uv_scale   = 2.0 * sqrt(
          reflect_dir.x * reflect_dir.x
        + reflect_dir.y * reflect_dir.y
        + (reflect_dir.z + 1.0) * (reflect_dir.z + 1.0)
    );

    return (reflect_dir.xy / uv_scale) + vec2(0.5, 0.5);
}

void main() {
    vec3 diffuse_color     = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
    vec3 diffuse_map_color = vec3(1.0);

    if (${USE_DIFFUSE_MAP_UNIFORM_NAME} > 0.5) {
        vec2 diff_uv = apply_uv(v_uv, ${DIFFUSE_UV_OFFSET_UNIFORM_NAME}, ${DIFFUSE_UV_SCALE_UNIFORM_NAME});
        diffuse_map_color = texture(${DIFFUSE_MAP_UNIFORM_NAME}, diff_uv).rgb;
        diffuse_color *= diffuse_map_color;
    }

    float alpha = ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};

    if (${USE_ALPHA_MAP_UNIFORM_NAME} > 0.5) {
        vec2 alpha_uv = apply_uv(v_uv, ${ALPHA_UV_OFFSET_UNIFORM_NAME}, ${ALPHA_UV_SCALE_UNIFORM_NAME});
        alpha *= texture(${ALPHA_MAP_UNIFORM_NAME}, alpha_uv).r;
    }

    if (${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED} <= ${LIGHTING_ENABLED_THRESHOLD}) {
        vec3 unlit_color = diffuse_color;

        if (${USE_DIFFUSE_MAP_UNIFORM_NAME} > 0.5) {
            unlit_color = diffuse_map_color;
        }

        vec3 rgb = unlit_color + ${EMISSIVE_COLOR_UNIFORM_NAME};
        outColor = vec4(rgb, alpha);
        return;
    }

    vec3 normal         = normalize(v_normal);
    vec3 view_dir       = normalize(${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION} - v_worldPosition);
    vec3 ambient_tint   = ${AMBIENT_COLOR_UNIFORM_NAME};
    vec3 specular_color = ${SPECULAR_COLOR_UNIFORM_NAME2};

    if (${USE_BUMP_MAP_UNIFORM_NAME} > 0.5) {
        vec2 bump_uv = apply_uv(v_uv, ${BUMP_UV_OFFSET_UNIFORM_NAME}, ${BUMP_UV_SCALE_UNIFORM_NAME});
        normal = compute_bump_normal(normal, bump_uv);
    }

    if (!gl_FrontFacing) {
        normal = -normal;
    }

    if (${USE_AMBIENT_MAP_UNIFORM_NAME} > 0.5) {
        vec2 amb_uv   = apply_uv(v_uv, ${AMBIENT_UV_OFFSET_UNIFORM_NAME}, ${AMBIENT_UV_SCALE_UNIFORM_NAME});
        ambient_tint *= texture(${AMBIENT_MAP_UNIFORM_NAME}, amb_uv).rgb;
    }

    if (${USE_SPECULAR_MAP_UNIFORM_NAME} > 0.5) {
        vec2 spec_uv    = apply_uv(v_uv, ${SPECULAR_UV_OFFSET_UNIFORM_NAME}, ${SPECULAR_UV_SCALE_UNIFORM_NAME});
        specular_color *= texture(${SPECULAR_MAP_UNIFORM_NAME}, spec_uv).rgb;
    }

    float specular_intensity = 0.0;
    vec3 light_direction     = normalize(${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    float diffuse_intensity  = max(dot(normal, light_direction), 0.0);

    vec3 ambient = diffuse_color * ambient_tint * ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
    vec3 diffuse = diffuse_color * (diffuse_intensity * ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH});

    if (${SPECULAR_ENABLED_UNIFORM_NAME} > 0.5 && diffuse_intensity > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, normal);
        float specular_base = max(dot(view_dir, reflection_direction), 0.0);
        specular_intensity = pow(specular_base, ${SHININESS_UNIFORM_NAME2});
    }

    vec3 specular = specular_color * (specular_intensity * ${SPECULAR_STRENGTH_UNIFORM_NAME2}
        * ${DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH});

    vec3 emissive = ${EMISSIVE_COLOR_UNIFORM_NAME};
    vec3 rgb      = ambient + diffuse + specular + emissive;

    if (${USE_REFLECTION_MAP_UNIFORM_NAME} > 0.5) {
        vec2 refl_uv        = compute_reflection_uv(normal, view_dir);
        vec2 refl_uv_scaled = apply_uv(refl_uv, ${REFLECTION_UV_OFFSET_UNIFORM_NAME}, ${REFLECTION_UV_SCALE_UNIFORM_NAME});
        vec3 refl_color     = texture(${REFLECTION_MAP_UNIFORM_NAME}, refl_uv_scaled).rgb;
        float refl_strength = clamp(${OPTICAL_DENSITY_UNIFORM_NAME} - 1.0, 0.0, 1.0);
        rgb                 = mix(rgb, refl_color, refl_strength);
    }

    outColor = vec4(rgb, alpha);
}
`;
var MtlStandardMaterial = class _MtlStandardMaterial extends DirectionalLightMaterial {
  /**
   * Fallback texture used, when a map is not assigned.
   *
   * @type {Texture2D}
   * @private
   */
  #fallbackTexture;
  /**
   * Diffuse texture.
   *
   * @type {Texture2D}
   * @private
   */
  #diffuseTexture;
  /**
   * Ambient texture.
   *
   * @type {Texture2D}
   * @private
   */
  #ambientTexture;
  /**
   * Specular texture.
   *
   * @type {Texture2D}
   * @private
   */
  #specularTexture;
  /**
   * Alpha texture.
   *
   * @type {Texture2D}
   * @private
   */
  #alphaTexture;
  /**
   * Bump texture.
   *
   * @type {Texture2D}
   * @private
   */
  #bumpTexture;
  /**
   * Displacement texture.
   *
   * @type {Texture2D}
   * @private
   */
  #displacementTexture;
  /**
   * Reflection texture.
   *
   * @type {Texture2D}
   * @private
   */
  #reflectionTexture;
  /**
   * Diffuse texture unit index.
   *
   * @type {number}
   * @private
   */
  #diffuseTextureUnit = DEFAULT_DIFFUSE_TEXTURE_UNIT;
  /**
   * Ambient texture unit index.
   *
   * @type {number}
   * @private
   */
  #ambientTextureUnit = DEFAULT_AMBIENT_TEXTURE_UNIT;
  /**
   * Specular texture unit index.
   *
   * @type {number}
   * @private
   */
  #specularTextureUnit = DEFAULT_SPECULAR_TEXTURE_UNIT;
  /**
   * Alpha texture unit index.
   *
   * @type {number}
   * @private
   */
  #alphaTextureUnit = DEFAULT_ALPHA_TEXTURE_UNIT;
  /**
   * Bump texture unit index.
   *
   * @type {number}
   * @private
   */
  #bumpTextureUnit = DEFAULT_BUMP_TEXTURE_UNIT;
  /**
   * Displacement texture unit index.
   *
   * @type {number}
   * @private
   */
  #displacementTextureUnit = DEFAULT_DISPLACEMENT_TEXTURE_UNIT;
  /**
   * Reflection texture unit index.
   *
   * @type {number}
   * @private
   */
  #reflectionTextureUnit = DEFAULT_REFLECTION_TEXTURE_UNIT;
  /**
   * Ambient color.
   *
   * @type {Float32Array}
   * @private
   */
  #ambientColor = new Float32Array(DEFAULT_AMBIENT_COLOR);
  /**
   * Specular color.
   *
   * @type {Float32Array}
   * @private
   */
  #specularColor = new Float32Array(DEFAULT_SPECULAR_COLOR2);
  /**
   * Emissive color.
   *
   * @type {Float32Array}
   * @private
   */
  #emissiveColor = new Float32Array(DEFAULT_EMISSIVE_COLOR);
  /**
   * Shininess exponent.
   *
   * @type {number}
   * @private
   */
  #shininess = DEFAULT_SHININESS2;
  /**
   * Specular strength multiplier.
   *
   * @type {number}
   * @private
   */
  #specularStrength = DEFAULT_SPECULAR_STRENGTH2;
  /**
   * Optical density value.
   *
   * @type {number}
   * @private
   */
  #opticalDensity = DEFAULT_OPTICAL_DENSITY;
  /**
   * Bump multiplier.
   *
   * @type {number}
   * @private
   */
  #bumpMultiplier = DEFAULT_BUMP_MULTIPLIER;
  /**
   * Displacement scale factor.
   *
   * @type {number}
   * @private
   */
  #displacementScale = DEFAULT_DISPLACEMENT_SCALE;
  /**
   * Flag, controlling the specular lighting.
   *
   * @type {boolean}
   * @private
   */
  #specularEnabled = true;
  /**
   * Diffuse UV-offset.
   *
   * @type {Float32Array}
   * @private
   */
  #diffuseUvOffset = new Float32Array(DEFAULT_UV_OFFSET);
  /**
   * Diffuse UV-scale.
   *
   * @type {Float32Array}
   * @private
   */
  #diffuseUvScale = new Float32Array(DEFAULT_UV_SCALE);
  /**
   * Ambient UV-offset.
   *
   * @type {Float32Array}
   * @private
   */
  #ambientUvOffset = new Float32Array(DEFAULT_UV_OFFSET);
  /**
   * Ambient UV-scale.
   *
   * @type {Float32Array}
   * @private
   */
  #ambientUvScale = new Float32Array(DEFAULT_UV_SCALE);
  /**
   * Specular UV-offset.
   *
   * @type {Float32Array}
   * @private
   */
  #specularUvOffset = new Float32Array(DEFAULT_UV_OFFSET);
  /**
   * Specular UV-scale.
   *
   * @type {Float32Array}
   * @private
   */
  #specularUvScale = new Float32Array(DEFAULT_UV_SCALE);
  /**
   * Alpha UV-offset.
   *
   * @type {Float32Array}
   * @private
   */
  #alphaUvOffset = new Float32Array(DEFAULT_UV_OFFSET);
  /**
   * Alpha UV-scale.
   *
   * @type {Float32Array}
   * @private
   */
  #alphaUvScale = new Float32Array(DEFAULT_UV_SCALE);
  /**
   * Bump UV-offset.
   *
   * @type {Float32Array}
   * @private
   */
  #bumpUvOffset = new Float32Array(DEFAULT_UV_OFFSET);
  /**
   * Bump UV-scale.
   *
   * @type {Float32Array}
   * @private
   */
  #bumpUvScale = new Float32Array(DEFAULT_UV_SCALE);
  /**
   * Displacement UV-offset.
   *
   * @type {Float32Array}
   * @private
   */
  #displacementUvOffset = new Float32Array(DEFAULT_UV_OFFSET);
  /**
   * Displacement UV-scale.
   *
   * @type {Float32Array}
   * @private
   */
  #displacementUvScale = new Float32Array(DEFAULT_UV_SCALE);
  /**
   * Reflection UV-offset.
   *
   * @type {Float32Array}
   * @private
   */
  #reflectionUvOffset = new Float32Array(DEFAULT_UV_OFFSET);
  /**
   * Reflection UV-scale.
   *
   * @type {Float32Array}
   * @private
   */
  #reflectionUvScale = new Float32Array(DEFAULT_UV_SCALE);
  /**
   * Flag, indicating the diffuse map usage.
   *
   * @type {boolean}
   * @private
   */
  #useDiffuseMap = false;
  /**
   * Flag, indicating the ambient map usage.
   *
   * @type {boolean}
   * @private
   */
  #useAmbientMap = false;
  /**
   * Flag, indicating the specular map usage.
   *
   * @type {boolean}
   * @private
   */
  #useSpecularMap = false;
  /**
   * Flag, indicating the alpha map usage.
   *
   * @type {boolean}
   * @private
   */
  #useAlphaMap = false;
  /**
   * Flag, indicating the bump map usage.
   *
   * @type {boolean}
   * @private
   */
  #useBumpMap = false;
  /**
   * Flag, indicating the displacement map usage.
   *
   * @type {boolean}
   * @private
   */
  #useDisplacementMap = false;
  /**
   * Flag, indicating the reflection map usage.
   *
   * @type {boolean}
   * @private
   */
  #useReflectionMap = false;
  /**
   * Creates a new MTL standard material.
   *
   * @param {WebGL2RenderingContext} webglContext  - WebGL2 rendering context, used to compile the shaders.
   * @param {MtlStandardMaterialOptions} [options] - Material options.
   */
  constructor(webglContext, options = {}) {
    if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
      throw new TypeError(ERROR_OPTIONS_OBJECT);
    }
    const {
      diffuseColor,
      ambientColor,
      specularColor,
      emissiveColor,
      lightDirection,
      ambientStrength,
      shininess,
      specularStrength,
      opticalDensity
    } = options;
    super(
      webglContext,
      new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE8, FRAGMENT_SHADER_SOURCE8),
      {
        color: diffuseColor || DEFAULT_DIFFUSE_COLOR,
        lightDirection,
        ambientStrength
      },
      { ownsShaderProgram: true }
    );
    this.#fallbackTexture = new Texture2D(webglContext);
    this.#diffuseTexture = this.#fallbackTexture;
    this.#ambientTexture = this.#fallbackTexture;
    this.#specularTexture = this.#fallbackTexture;
    this.#alphaTexture = this.#fallbackTexture;
    this.#bumpTexture = this.#fallbackTexture;
    this.#displacementTexture = this.#fallbackTexture;
    this.#reflectionTexture = this.#fallbackTexture;
    this.setAmbientColor(ambientColor || DEFAULT_AMBIENT_COLOR);
    this.setSpecularColor(specularColor || DEFAULT_SPECULAR_COLOR2);
    this.setEmissiveColor(emissiveColor || DEFAULT_EMISSIVE_COLOR);
    if (shininess !== void 0) {
      this.setShininess(shininess);
    }
    if (specularStrength !== void 0) {
      this.setSpecularStrength(specularStrength);
    }
    if (opticalDensity !== void 0) {
      this.setOpticalDensity(opticalDensity);
    }
  }
  /**
   * Uploads per-object uniforms specific to the standard material.
   *
   * @param {Float32Array} worldMatrix    - World matrix.
   * @param {Float32Array} cameraPosition - Camera position.
   * @protected
   */
  applyAdditionalUniforms(worldMatrix, cameraPosition) {
    this.shaderProgram.setMatrix4(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX, worldMatrix);
    this.shaderProgram.setVector3(DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION, cameraPosition);
    this.shaderProgram.setVector3(AMBIENT_COLOR_UNIFORM_NAME, this.#ambientColor);
    this.shaderProgram.setVector3(SPECULAR_COLOR_UNIFORM_NAME2, this.#specularColor);
    this.shaderProgram.setVector3(EMISSIVE_COLOR_UNIFORM_NAME, this.#emissiveColor);
    this.shaderProgram.setFloat(SPECULAR_STRENGTH_UNIFORM_NAME2, this.#specularStrength);
    this.shaderProgram.setFloat(SHININESS_UNIFORM_NAME2, this.#shininess);
    this.shaderProgram.setFloat(SPECULAR_ENABLED_UNIFORM_NAME, this.#specularEnabled ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setFloat(OPTICAL_DENSITY_UNIFORM_NAME, this.#opticalDensity);
    this.shaderProgram.setFloat(BUMP_MULTIPLIER_UNIFORM_NAME, this.#bumpMultiplier);
    this.shaderProgram.setFloat(DISPLACEMENT_SCALE_UNIFORM_NAME, this.#displacementScale);
    this.shaderProgram.setVector2(DIFFUSE_UV_OFFSET_UNIFORM_NAME, this.#diffuseUvOffset);
    this.shaderProgram.setVector2(DIFFUSE_UV_SCALE_UNIFORM_NAME, this.#diffuseUvScale);
    this.shaderProgram.setVector2(AMBIENT_UV_OFFSET_UNIFORM_NAME, this.#ambientUvOffset);
    this.shaderProgram.setVector2(AMBIENT_UV_SCALE_UNIFORM_NAME, this.#ambientUvScale);
    this.shaderProgram.setVector2(SPECULAR_UV_OFFSET_UNIFORM_NAME, this.#specularUvOffset);
    this.shaderProgram.setVector2(SPECULAR_UV_SCALE_UNIFORM_NAME, this.#specularUvScale);
    this.shaderProgram.setVector2(ALPHA_UV_OFFSET_UNIFORM_NAME, this.#alphaUvOffset);
    this.shaderProgram.setVector2(ALPHA_UV_SCALE_UNIFORM_NAME, this.#alphaUvScale);
    this.shaderProgram.setVector2(BUMP_UV_OFFSET_UNIFORM_NAME, this.#bumpUvOffset);
    this.shaderProgram.setVector2(BUMP_UV_SCALE_UNIFORM_NAME, this.#bumpUvScale);
    this.shaderProgram.setVector2(DISPLACEMENT_UV_OFFSET_UNIFORM_NAME, this.#displacementUvOffset);
    this.shaderProgram.setVector2(DISPLACEMENT_UV_SCALE_UNIFORM_NAME, this.#displacementUvScale);
    this.shaderProgram.setVector2(REFLECTION_UV_OFFSET_UNIFORM_NAME, this.#reflectionUvOffset);
    this.shaderProgram.setVector2(REFLECTION_UV_SCALE_UNIFORM_NAME, this.#reflectionUvScale);
    this.shaderProgram.setFloat(USE_DIFFUSE_MAP_UNIFORM_NAME, this.#useDiffuseMap ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setFloat(USE_AMBIENT_MAP_UNIFORM_NAME, this.#useAmbientMap ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setFloat(USE_SPECULAR_MAP_UNIFORM_NAME, this.#useSpecularMap ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setFloat(USE_ALPHA_MAP_UNIFORM_NAME, this.#useAlphaMap ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setFloat(USE_BUMP_MAP_UNIFORM_NAME, this.#useBumpMap ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setFloat(USE_DISPLACEMENT_MAP_UNIFORM_NAME, this.#useDisplacementMap ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setFloat(USE_REFLECTION_MAP_UNIFORM_NAME, this.#useReflectionMap ? FLOAT_TRUE2 : FLOAT_FALSE2);
    this.shaderProgram.setTexture2D(DIFFUSE_MAP_UNIFORM_NAME, this.#diffuseTexture, this.#diffuseTextureUnit);
    this.shaderProgram.setTexture2D(AMBIENT_MAP_UNIFORM_NAME, this.#ambientTexture, this.#ambientTextureUnit);
    this.shaderProgram.setTexture2D(SPECULAR_MAP_UNIFORM_NAME, this.#specularTexture, this.#specularTextureUnit);
    this.shaderProgram.setTexture2D(ALPHA_MAP_UNIFORM_NAME, this.#alphaTexture, this.#alphaTextureUnit);
    this.shaderProgram.setTexture2D(BUMP_MAP_UNIFORM_NAME, this.#bumpTexture, this.#bumpTextureUnit);
    this.shaderProgram.setTexture2D(DISPLACEMENT_MAP_UNIFORM_NAME, this.#displacementTexture, this.#displacementTextureUnit);
    this.shaderProgram.setTexture2D(REFLECTION_MAP_UNIFORM_NAME, this.#reflectionTexture, this.#reflectionTextureUnit);
  }
  /**
   * Sets the ambient color.
   *
   * @param {Float32Array | number[]} color - RGB color in [0..1] range.
   */
  setAmbientColor(color) {
    _MtlStandardMaterial.#assertVector3("`MtlStandardMaterial.setAmbientColor`", color);
    this.#ambientColor.set(color);
  }
  /**
   * Sets the specular color.
   *
   * @param {Float32Array | number[]} color - RGB color in [0..1] range.
   */
  setSpecularColor(color) {
    _MtlStandardMaterial.#assertVector3("`MtlStandardMaterial.setSpecularColor`", color);
    this.#specularColor.set(color);
  }
  /**
   * Sets the emissive color.
   *
   * @param {Float32Array | number[]} color - RGB color in [0..1] range.
   */
  setEmissiveColor(color) {
    _MtlStandardMaterial.#assertVector3("`MtlStandardMaterial.setEmissiveColor`", color);
    this.#emissiveColor.set(color);
  }
  /**
   * Sets the shininess exponent.
   *
   * @param {number} value - Shininess exponent.
   */
  setShininess(value) {
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      throw new TypeError(ERROR_SHININESS_TYPE);
    }
    this.#shininess = value;
  }
  /**
   * Sets the specular strength multiplier.
   *
   * @param {number} value - Specular strength.
   */
  setSpecularStrength(value) {
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      throw new TypeError(ERROR_SPECULAR_STRENGTH_TYPE);
    }
    this.#specularStrength = value;
  }
  /**
   * Enables or disables specular term.
   *
   * @param {boolean} enabled - Specular usage flag.
   */
  setSpecularEnabled(enabled) {
    if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
      throw new TypeError(ERROR_SPECULAR_ENABLED_TYPE);
    }
    this.#specularEnabled = enabled;
  }
  /**
   * Sets optical density value.
   *
   * @param {number} value - Optical density.
   */
  setOpticalDensity(value) {
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      throw new TypeError(ERROR_OPTICAL_DENSITY_TYPE);
    }
    this.#opticalDensity = value;
  }
  /**
   * Sets bump multiplier value.
   *
   * @param {number} value - Bump multiplier.
   */
  setBumpMultiplier(value) {
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      throw new TypeError(ERROR_BUMP_MULTIPLIER_TYPE);
    }
    this.#bumpMultiplier = value;
  }
  /**
   * Sets displacement scale.
   *
   * @param {number} value - Displacement scale factor.
   */
  setDisplacementScale(value) {
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      throw new TypeError(ERROR_DISPLACEMENT_SCALE_TYPE);
    }
    this.#displacementScale = value;
  }
  /**
   * Sets a diffuse texture and its UV-transform.
   *
   * @param {Texture2D} texture                       - Diffuse texture.
   * @param {MtlStandardMaterialMapOptions} [options] - Map options.
   */
  setDiffuseMap(texture, options = {}) {
    this.#setMap(
      "`MtlStandardMaterial.setDiffuseMap`",
      texture,
      options,
      (map) => {
        this.#diffuseTexture = map.texture;
        this.#diffuseTextureUnit = map.textureUnitIndex;
        this.#useDiffuseMap = true;
        this.#diffuseUvOffset.set(map.uvOffset);
        this.#diffuseUvScale.set(map.uvScale);
      }
    );
  }
  /**
   * Sets an ambient texture and its UV-transform.
   *
   * @param {Texture2D} texture                       - Ambient texture.
   * @param {MtlStandardMaterialMapOptions} [options] - Map options.
   */
  setAmbientMap(texture, options = {}) {
    this.#setMap(
      "`MtlStandardMaterial.setAmbientMap`",
      texture,
      options,
      (map) => {
        this.#ambientTexture = map.texture;
        this.#ambientTextureUnit = map.textureUnitIndex;
        this.#useAmbientMap = true;
        this.#ambientUvOffset.set(map.uvOffset);
        this.#ambientUvScale.set(map.uvScale);
      }
    );
  }
  /**
   * Sets a specular texture and its UV-transform.
   *
   * @param {Texture2D} texture                       - Specular texture.
   * @param {MtlStandardMaterialMapOptions} [options] - Map options.
   */
  setSpecularMap(texture, options = {}) {
    this.#setMap(
      "`MtlStandardMaterial.setSpecularMap`",
      texture,
      options,
      (map) => {
        this.#specularTexture = map.texture;
        this.#specularTextureUnit = map.textureUnitIndex;
        this.#useSpecularMap = true;
        this.#specularUvOffset.set(map.uvOffset);
        this.#specularUvScale.set(map.uvScale);
      }
    );
  }
  /**
   * Sets an alpha texture and its UV-transform.
   *
   * @param {Texture2D} texture                       - Alpha texture.
   * @param {MtlStandardMaterialMapOptions} [options] - Map options.
   */
  setAlphaMap(texture, options = {}) {
    this.#setMap(
      "`MtlStandardMaterial.setAlphaMap`",
      texture,
      options,
      (map) => {
        this.#alphaTexture = map.texture;
        this.#alphaTextureUnit = map.textureUnitIndex;
        this.#useAlphaMap = true;
        this.#alphaUvOffset.set(map.uvOffset);
        this.#alphaUvScale.set(map.uvScale);
      }
    );
  }
  /**
   * Sets a bump texture and its UV-transform.
   *
   * @param {Texture2D} texture                       - Bump texture.
   * @param {MtlStandardMaterialMapOptions} [options] - Map options.
   */
  setBumpMap(texture, options = {}) {
    this.#setMap(
      "`MtlStandardMaterial.setBumpMap`",
      texture,
      options,
      (map) => {
        this.#bumpTexture = map.texture;
        this.#bumpTextureUnit = map.textureUnitIndex;
        this.#useBumpMap = true;
        this.#bumpUvOffset.set(map.uvOffset);
        this.#bumpUvScale.set(map.uvScale);
      }
    );
  }
  /**
   * Sets a displacement texture and its UV-transform.
   *
   * @param {Texture2D} texture                       - Displacement texture.
   * @param {MtlStandardMaterialMapOptions} [options] - Map options.
   */
  setDisplacementMap(texture, options = {}) {
    this.#setMap(
      "`MtlStandardMaterial.setDisplacementMap`",
      texture,
      options,
      (map) => {
        this.#displacementTexture = map.texture;
        this.#displacementTextureUnit = map.textureUnitIndex;
        this.#useDisplacementMap = true;
        this.#displacementUvOffset.set(map.uvOffset);
        this.#displacementUvScale.set(map.uvScale);
      }
    );
  }
  /**
   * Sets a reflection texture and its UV-transform.
   *
   * @param {Texture2D} texture                       - Reflection texture.
   * @param {MtlStandardMaterialMapOptions} [options] - Map options.
   */
  setReflectionMap(texture, options = {}) {
    this.#setMap(
      "`MtlStandardMaterial.setReflectionMap`",
      texture,
      options,
      (map) => {
        this.#reflectionTexture = map.texture;
        this.#reflectionTextureUnit = map.textureUnitIndex;
        this.#useReflectionMap = true;
        this.#reflectionUvOffset.set(map.uvOffset);
        this.#reflectionUvScale.set(map.uvScale);
      }
    );
  }
  /**
   * Disposes resources, owned by this material.
   */
  dispose() {
    if (this.isDisposed) {
      return;
    }
    if (this.#fallbackTexture) {
      this.#fallbackTexture.dispose();
    }
    super.dispose();
  }
  /**
   * Validates and applies the map options for a texture assignment.
   *
   * @param {string} context                        - Error context.
   * @param {Texture2D} texture                     - Map texture.
   * @param {MtlStandardMaterialMapOptions} options - Map options.
   * @param {function(Object): void} apply          - Apply callback.
   * @returns {void}
   * @private
   */
  #setMap(context, texture, options, apply) {
    if (!(texture instanceof Texture2D)) {
      throw new TypeError(context + ERROR_EXPECTS_TEXTURE_SUFFIX);
    }
    if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
      throw new TypeError(context + ERROR_EXPECTS_OPTIONS_OBJECT_SUFFIX);
    }
    const {
      textureUnitIndex = DEFAULT_DIFFUSE_TEXTURE_UNIT,
      uvOffset = DEFAULT_UV_OFFSET,
      uvScale = DEFAULT_UV_SCALE
    } = options;
    if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE10) {
      throw new TypeError(context + ERROR_EXPECTS_TEXTURE_UNIT_INDEX_SUFFIX);
    }
    _MtlStandardMaterial.#assertVector2(`${context} options.uvOffset`, uvOffset);
    _MtlStandardMaterial.#assertVector2(`${context} options.uvScale`, uvScale);
    apply({
      texture,
      textureUnitIndex,
      uvOffset,
      uvScale
    });
  }
  /**
   * Validates the `vector2` arrays.
   *
   * @param {string} context                - Error context.
   * @param {Float32Array | number[]} value - Vector to validate.
   * @returns {void}
   * @private
   */
  static #assertVector2(context, value) {
    if (!Array.isArray(value) && !(value instanceof Float32Array)) {
      throw new TypeError(context + ERROR_EXPECTS_VECTOR2_TYPE_SUFFIX);
    }
    if (value.length !== DEFAULT_UV_OFFSET.length) {
      throw new TypeError(context + ERROR_EXPECTS_VECTOR2_COMPONENTS_SUFFIX);
    }
  }
  /**
   * Validates the `vector3` arrays.
   *
   * @param {string} context                - Error context.
   * @param {Float32Array | number[]} value - Vector to validate.
   * @returns {void}
   * @private
   */
  static #assertVector3(context, value) {
    if (!Array.isArray(value) && !(value instanceof Float32Array)) {
      throw new TypeError(context + ERROR_EXPECTS_VECTOR2_TYPE_SUFFIX);
    }
    if (value.length !== DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT) {
      throw new TypeError(context + ERROR_EXPECTS_VECTOR3_COMPONENTS_SUFFIX);
    }
  }
};

// core/scene/object3d.js
var CHILD_NOT_FOUND_INDEX = -1;
var SINGLE_CHILD_REMOVE_COUNT = 1;
var MATRIX_4x4_ELEMENT_COUNT2 = 16;
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
    this.#localMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT2);
    this.#worldMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT2);
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
   * @param {Object3D} child - Child node to attach to this object (reparented, if it already has a parent).
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
   * Updates world matrices.
   *
   * @param {Float32Array | null | Object} inputMatrix            - Parent world matrix or options object.
   * @param {Float32Array | null} [inputMatrix.parentWorldMatrix] - Parent world matrix override (root, when null).
   * @returns {void}
   * @throws {TypeError} When inputs are invalid.
   */
  updateWorldMatrix(inputMatrix) {
    let resolvedParentWorldMatrix = inputMatrix;
    if (inputMatrix !== null && typeof inputMatrix === "object" && !(inputMatrix instanceof Float32Array)) {
      resolvedParentWorldMatrix = "parentWorldMatrix" in inputMatrix ? inputMatrix.parentWorldMatrix : null;
    }
    if (resolvedParentWorldMatrix !== null && !(resolvedParentWorldMatrix instanceof Float32Array)) {
      throw new TypeError("`Object3D.updateWorldMatrix` expects `Float32Array` or null.");
    }
    this.#updateWorldMatrixRecursive(resolvedParentWorldMatrix, false);
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
    for (let index = 0; index < MATRIX_4x4_ELEMENT_COUNT2; index += 1) {
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

// core/scene/points.js
var Points = class extends Mesh {
  /**
   * @param {Geometry} geometry - Point geometry.
   * @param {Material} material - Points material.
   * @throws {TypeError} When geometry or material are invalid.
   */
  constructor(geometry, material) {
    if (!(geometry instanceof Geometry)) {
      throw new TypeError("`Points` expects a `Geometry` instance.");
    }
    if (!(material instanceof Material)) {
      throw new TypeError("`Points` expects a `Material` instance.");
    }
    super(geometry, material);
  }
};

// core/scene/line.js
var Line = class extends Mesh {
  /**
   * @param {Geometry} geometry - Line geometry.
   * @param {Material} material - Line material.
   * @throws {TypeError} When geometry or material are invalid.
   */
  constructor(geometry, material) {
    if (!(geometry instanceof Geometry)) {
      throw new TypeError("`Line` expects a `Geometry` instance.");
    }
    if (!(material instanceof Material)) {
      throw new TypeError("`Line` expects a `Material` instance.");
    }
    super(geometry, material);
  }
};

// core/scene/scene.js
var Scene = class extends Object3D {
  constructor() {
    super();
  }
};

// core/scene/camera.js
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
    this.#viewMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
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
      this.#writeViewMatrixTo(this.#viewMatrix, position, rotation, scale);
      this.#cacheTransform(position, rotation, scale);
    }
  }
  /**
   * Writes a view matrix into an existing output matrix.
   *
   * A view matrix is the inverse of the camera transform.
   * It moves the world-space coordinates into the camera-relative view-space.
   *
   * 'Object3D' builds local transforms in this order:
   *
   * local = T * (Rz * Ry * Rx) * S
   *
   * Therefore the inverse view transform is applied in reverse order:
   *
   * view = inv(S) * inv(R) * inv(T)
   *
   * The inverse of the rotation block is its transpose, because the rotation
   * matrix is orthonormal. The inverse scale is applied to the rows of that
   * transposed rotation block, forming matrix:
   *
   * A = inv(S) * R^T
   *
   * Camera translation is then inverted as '-A * position', because the world must be
   * shifted by the opposite camera position after the inverse rotation/scale basis is known.
   *
   * Scale components must be non-zero. A zero scale would have no reciprocal,
   * so the camera transform could not be inverted into a valid view matrix.
   *
   * The method writes the matrix into 'out' and returns that same 'out' buffer.
   *
   * @private
   * @param {Float32Array} out      - Output 4x4 matrix (length 16), that will receive the view matrix.
   * @param {Vector3}      position - Camera position.
   * @param {Vector3}      rotation - Camera rotation in radians.
   * @param {Vector3}      scale    - Camera scale (must be non-zero on all axes).
   * @returns {Float32Array}        - The output matrix (out).
   */
  #writeViewMatrixTo(out, position, rotation, scale) {
    if (scale.x === MATH_MATRIX_VALUES.ZERO || scale.y === MATH_MATRIX_VALUES.ZERO || scale.z === MATH_MATRIX_VALUES.ZERO) {
      throw new RangeError("Private method `Camera.#writeViewMatrixTo` cannot invert a zero scale.");
    }
    const positionX = position.x;
    const positionY = position.y;
    const positionZ = position.z;
    const rotationX = rotation.x;
    const rotationY = rotation.y;
    const rotationZ = rotation.z;
    const inverseScaleX = MATH_VIEW_MATRIX.SCALE_INVERSE_NUMERATOR / scale.x;
    const inverseScaleY = MATH_VIEW_MATRIX.SCALE_INVERSE_NUMERATOR / scale.y;
    const inverseScaleZ = MATH_VIEW_MATRIX.SCALE_INVERSE_NUMERATOR / scale.z;
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
    out[3] = MATH_MATRIX_VALUES.ZERO;
    out[4] = a01;
    out[5] = a11;
    out[6] = a21;
    out[7] = MATH_MATRIX_VALUES.ZERO;
    out[8] = a02;
    out[9] = a12;
    out[10] = a22;
    out[11] = MATH_MATRIX_VALUES.ZERO;
    out[12] = translateX;
    out[13] = translateY;
    out[14] = translateZ;
    out[15] = MATH_MATRIX_VALUES.UNIT;
    return out;
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
      throw new RangeError("`PerspectiveCamera` expects a positive `aspect ratio`.");
    }
    if (near <= MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
      throw new RangeError("`PerspectiveCamera` expects `0 < near < far`.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#projectionMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
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
      Matrix4.writePerspectiveTo(
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
    this.#projectionMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
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
      Matrix4.writeOrthographicTo(
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
      throw new RangeError("`FirstPersonCamera` expects `aspectRatio` to be a positive number.");
    }
    if (near <= MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
      throw new RangeError("`FirstPersonCamera` expects `0 < near < far`.");
    }
    if (!FIRST_PERSON_CAMERA_MODE_SET.has(mode)) {
      throw new RangeError("`FirstPersonCamera` expects `mode` to be a valid value from `FirstPersonCamera.Modes`.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#projectionMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
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
      Matrix4.writePerspectiveTo(
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
      throw new RangeError("`ThirdPersonCamera` expects `aspectRatio` to be a positive number.");
    }
    if (near <= MATH_CAMERA_LIMITS.MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
      throw new RangeError("`ThirdPersonCamera` expects `0 < near < far`.");
    }
    if (!THIRD_PERSON_CAMERA_MODE_SET.has(mode)) {
      throw new RangeError("`ThirdPersonCamera` expects `mode` to be a valid value from `ThirdPersonCamera.Modes`.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
    this.#projectionMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
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
    if (aspectRatio <= MATH_CAMERA_LIMITS.MINIMUM_ASPECT_RATIO) {
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
      Matrix4.writePerspectiveTo(
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

// core/constants/renderer.js
var RENDERER_DRAW = Object.freeze({ INDEX_BUFFER_OFFSET_BYTES: 0 });
var RENDERER_OPACITY = Object.freeze({ OPAQUE_THRESHOLD: 1 });
var RENDERER_MATERIAL_APPLY_PARAM_COUNTS = Object.freeze({
  WORLD_MATRIX: 2,
  WORLD_INVERSE_TRANSPOSE: 3,
  CAMERA_POSITION: 4
});
var RENDERER_TRAVERSAL = Object.freeze({
  STACK_EMPTY_LENGTH: 0,
  CHILD_LOOP_START_INDEX: 0,
  CHILD_LOOP_INCREMENT: 1
});

// core/exception-messages/renderer.js
var RENDERER_EXCEPTION_MESSAGES = Object.freeze({
  UNKNOWN_PRIMITIVE: "Renderer received an unknown geometry primitive."
});

// core/exception-messages/light.js
var LIGHT_EXCEPTION_MESSAGES = Object.freeze({
  ABSTRACT_CONSTRUCTOR: "`Light` is an abstract class and cannot be instantiated directly.",
  ENABLED_TYPE: "`Light.setEnabled` expects a boolean.",
  AMBIENT_STRENGTH_TYPE: "`AmbientLight.setStrength` expects a finite number.",
  DIRECTION_TYPE: "`DirectionalLight.setDirection` expects a number[] or `Float32Array`.",
  DIRECTION_COMPONENTS: "`DirectionalLight.setDirection` expects exactly 3 components.",
  DIRECTION_COMPONENTS_FINITE: "`DirectionalLight.setDirection` expects finite components.",
  DIRECTION_LENGTH: "`DirectionalLight.setDirection` expects a non-zero direction vector.",
  DIRECTIONAL_STRENGTH_TYPE: "`DirectionalLight.setStrength` expects a finite number."
});

// core/light/light.js
var Light = class _Light extends Object3D {
  /**
   * Whether this light is enabled.
   *
   * @type {boolean}
   * @private
   */
  #enabled = LIGHT_DEFAULTS.ENABLED;
  /**
   * Creates a new light. This class is abstract and cannot be instantiated directly.
   *
   * @throws {Error} When attempting to instantiate the abstract `Light` class.
   */
  constructor() {
    super();
    if (new.target === _Light) {
      throw new Error(LIGHT_EXCEPTION_MESSAGES.ABSTRACT_CONSTRUCTOR);
    }
  }
  /**
   * Enables or disables this light.
   *
   * @param {boolean} enabled - When true, the light contributes to rendering.
   * @returns {void}
   * @throws {TypeError} When the value is not a boolean.
   */
  setEnabled(enabled) {
    if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
      throw new TypeError(LIGHT_EXCEPTION_MESSAGES.ENABLED_TYPE);
    }
    this.#enabled = enabled;
  }
  /**
   * Returns true when the light is enabled.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return this.#enabled;
  }
};

// core/light/directional-light.js
var DirectionalLight = class _DirectionalLight extends Light {
  /**
   * Cached normalized direction buffer.
   *
   * @type {Float32Array}
   * @private
   */
  #direction = new Float32Array(MATH_LAYOUT.VECTOR3_ELEMENT_COUNT);
  /**
   * Directional light strength multiplier.
   *
   * @type {number}
   * @private
   */
  #strength = LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;
  /**
   * Creates a new directional light with the default direction.
   */
  constructor() {
    super();
    this.setDirection(LIGHT_DIRECTIONAL_DEFAULT_DIRECTION);
    this.#strength = LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;
  }
  /**
   * Sets the light direction by updating the light rotation.
   *
   * @param {Float32Array | number[]} direction - Direction vector (world space).
   * @returns {void}
   * @throws {TypeError} When the direction is invalid.
   */
  setDirection(direction) {
    _DirectionalLight.#assertVector3(direction);
    const directionX = direction[MATH_VECTOR3_INDEXES.X];
    const directionY = direction[MATH_VECTOR3_INDEXES.Y];
    const directionZ = direction[MATH_VECTOR3_INDEXES.Z];
    const lengthSquared = directionX * directionX + directionY * directionY + directionZ * directionZ;
    if (!Number.isFinite(lengthSquared) || lengthSquared <= LIGHT_DIRECTIONAL.MIN_DIRECTION_LENGTH_SQUARED) {
      throw new TypeError(LIGHT_EXCEPTION_MESSAGES.DIRECTION_LENGTH);
    }
    const inverseLength = LIGHT_DIRECTIONAL.INVERSE_LENGTH_NUMERATOR / Math.sqrt(lengthSquared);
    const normalizedX = directionX * inverseLength;
    const normalizedY = directionY * inverseLength;
    const normalizedZ = directionZ * inverseLength;
    const clampedY = Math.min(LIGHT_DIRECTIONAL.ASIN_CLAMP_MAX, Math.max(LIGHT_DIRECTIONAL.ASIN_CLAMP_MIN, normalizedY));
    const rotationX = -Math.asin(clampedY);
    const rotationY = Math.atan2(normalizedX, normalizedZ);
    this.rotation.x = rotationX;
    this.rotation.y = rotationY;
    this.rotation.z = LIGHT_DIRECTIONAL.DEFAULT_ROLL_RADIANS;
  }
  /**
   * Returns the normalized light direction in world space.
   *
   * @returns {Float32Array}
   */
  getDirection() {
    const worldMatrix = this.worldMatrix;
    const axisX = worldMatrix[MATH_MATRIX4_INDEXES.WORLD_Z_AXIS_X];
    const axisY = worldMatrix[MATH_MATRIX4_INDEXES.WORLD_Z_AXIS_Y];
    const axisZ = worldMatrix[MATH_MATRIX4_INDEXES.WORLD_Z_AXIS_Z];
    const lengthSquared = axisX * axisX + axisY * axisY + axisZ * axisZ;
    if (!Number.isFinite(lengthSquared) || lengthSquared <= LIGHT_DIRECTIONAL.MIN_DIRECTION_LENGTH_SQUARED) {
      this.#direction.set(LIGHT_DIRECTIONAL_DEFAULT_NORMALIZED_DIRECTION);
      return this.#direction;
    }
    const inverseLength = LIGHT_DIRECTIONAL.INVERSE_LENGTH_NUMERATOR / Math.sqrt(lengthSquared);
    this.#direction[MATH_VECTOR3_INDEXES.X] = axisX * inverseLength;
    this.#direction[MATH_VECTOR3_INDEXES.Y] = axisY * inverseLength;
    this.#direction[MATH_VECTOR3_INDEXES.Z] = axisZ * inverseLength;
    return this.#direction;
  }
  /**
   * Sets the directional light strength multiplier.
   *
   * @param {number} strength - Directional strength multiplier.
   * @returns {void}
   * @throws {TypeError} When the strength is invalid.
   */
  setStrength(strength) {
    if (typeof strength !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(strength)) {
      throw new TypeError(LIGHT_EXCEPTION_MESSAGES.DIRECTIONAL_STRENGTH_TYPE);
    }
    this.#strength = Math.min(LIGHT_DIRECTIONAL.MAX_DIRECTIONAL_STRENGTH, Math.max(LIGHT_DIRECTIONAL.MIN_DIRECTIONAL_STRENGTH, strength));
  }
  /**
   * Returns the directional light strength multiplier.
   *
   * @returns {number}
   */
  getStrength() {
    return this.#strength;
  }
  /**
   * Validates a vector3-like input.
   *
   * @param {Float32Array | number[]} vector - Vector to validate.
   * @returns {void}
   * @throws {TypeError} When the vector is invalid.
   * @private
   */
  static #assertVector3(vector) {
    if (!Array.isArray(vector) && !(vector instanceof Float32Array)) {
      throw new TypeError(LIGHT_EXCEPTION_MESSAGES.DIRECTION_TYPE);
    }
    if (vector.length !== MATH_LAYOUT.VECTOR3_ELEMENT_COUNT) {
      throw new TypeError(LIGHT_EXCEPTION_MESSAGES.DIRECTION_COMPONENTS);
    }
    if (!Number.isFinite(vector[MATH_VECTOR3_INDEXES.X]) || !Number.isFinite(vector[MATH_VECTOR3_INDEXES.Y]) || !Number.isFinite(vector[MATH_VECTOR3_INDEXES.Z])) {
      throw new TypeError(LIGHT_EXCEPTION_MESSAGES.DIRECTION_COMPONENTS_FINITE);
    }
  }
};

// core/light/ambient-light.js
var AmbientLight = class extends Light {
  /**
   * Ambient strength multiplier.
   *
   * @type {number}
   * @private
   */
  #strength = LIGHT_AMBIENT.DEFAULT_STRENGTH;
  /**
   * Creates a new ambient light.
   */
  constructor() {
    super();
  }
  /**
   * Sets the ambient strength multiplier.
   *
   * @param {number} strength - Ambient strength.
   * @returns {void}
   * @throws {TypeError} When the strength is invalid.
   */
  setStrength(strength) {
    if (typeof strength !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(strength)) {
      throw new TypeError(LIGHT_EXCEPTION_MESSAGES.AMBIENT_STRENGTH_TYPE);
    }
    this.#strength = strength;
  }
  /**
   * Returns the ambient strength multiplier.
   *
   * @returns {number}
   */
  getStrength() {
    return this.#strength;
  }
};

// core/render/renderer.js
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
   * Reused stack for the light search traversal.
   *
   * @type {Object3D[]}
   * @private
   */
  #lightSearchStack;
  /**
   * Cached active directional light for the current frame.
   *
   * @type {DirectionalLight | null}
   * @private
   */
  #activeDirectionalLight = null;
  /**
   * Cached active ambient light for the current frame.
   *
   * @type {AmbientLight | null}
   * @private
   */
  #activeAmbientLight = null;
  /**
   * @param {WebGLContext} webglContext - Wrapper around the underlying WebGL2 rendering context.
   */
  constructor(webglContext) {
    if (!(webglContext instanceof WebGLContext)) {
      throw new TypeError("Renderer expects a WebGLContext instance.");
    }
    this.#contextWrapper = webglContext;
    this.#webglRenderingContext = this.#contextWrapper.context;
    this.#viewProjectionMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    this.#finalMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    this.#worldMatrixInverse = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    this.#worldInverseTransposeMatrix = new Float32Array(MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
    this.#cameraPosition = new Float32Array(MATH_LAYOUT.VECTOR3_ELEMENT_COUNT);
    this.#frameViewProjectionMatrix = this.#viewProjectionMatrix;
    this.#frameCameraPosition = this.#cameraPosition;
    this.#lightSearchStack = [];
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
    scene.updateWorldMatrix({ parentWorldMatrix: null });
    this.#findActiveLights(scene);
    scene.traverse(this.#traverseCallback);
  }
  /**
   * Renders a single visited scene node during traversal.
   *
   * Only `Mesh` instances are rendered. Other `Object3D` nodes are skipped.
   *
   * @param {Object3D} visitedObject - Visited scene node.
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
    if (material instanceof DirectionalLightMaterial) {
      if (this.#activeDirectionalLight) {
        material.setLightDirection(this.#activeDirectionalLight.getDirection());
        material.setDirectionalStrength(this.#activeDirectionalLight.getStrength());
      }
      if (this.#activeAmbientLight) {
        material.setAmbientStrength(this.#activeAmbientLight.getStrength());
      }
    }
    material.use();
    const materialOpacity = material.opacity;
    const isTransparent = materialOpacity < RENDERER_OPACITY.OPAQUE_THRESHOLD;
    if (isTransparent) {
      renderingContext.enable(renderingContext.BLEND);
      renderingContext.blendFunc(renderingContext.SRC_ALPHA, renderingContext.ONE_MINUS_SRC_ALPHA);
      renderingContext.depthMask(false);
    } else {
      renderingContext.disable(renderingContext.BLEND);
      renderingContext.depthMask(true);
    }
    const applyParameterCount = material.apply.length;
    const wantsWorldMatrix = applyParameterCount >= RENDERER_MATERIAL_APPLY_PARAM_COUNTS.WORLD_MATRIX;
    const wantsNormalMatrix = applyParameterCount >= RENDERER_MATERIAL_APPLY_PARAM_COUNTS.WORLD_INVERSE_TRANSPOSE;
    const wantsCameraPosition = applyParameterCount >= RENDERER_MATERIAL_APPLY_PARAM_COUNTS.CAMERA_POSITION;
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
    const primitive = geometry.getPrimitive(isWireframeEnabled);
    const mode = resolvePrimitiveMode(renderingContext, primitive);
    const indexCount = geometry.getIndexCount(isWireframeEnabled);
    renderingContext.drawElements(
      mode,
      indexCount,
      geometry.getIndexComponentType(isWireframeEnabled),
      RENDERER_DRAW.INDEX_BUFFER_OFFSET_BYTES
    );
  }
  /**
   * Finds the active lights for the current frame.
   *
   * @param {Scene} scene - Scene to search.
   * @returns {void}
   * @private
   */
  #findActiveLights(scene) {
    this.#activeDirectionalLight = null;
    this.#activeAmbientLight = null;
    const stack = this.#lightSearchStack;
    stack.length = RENDERER_TRAVERSAL.STACK_EMPTY_LENGTH;
    stack.push(scene);
    while (stack.length > RENDERER_TRAVERSAL.STACK_EMPTY_LENGTH && (this.#activeDirectionalLight === null || this.#activeAmbientLight === null)) {
      const node = stack.pop();
      if (this.#activeDirectionalLight === null && node instanceof DirectionalLight && node.isEnabled()) {
        this.#activeDirectionalLight = node;
      } else if (this.#activeAmbientLight === null && node instanceof AmbientLight && node.isEnabled()) {
        this.#activeAmbientLight = node;
      }
      const children = node.children;
      for (let index = RENDERER_TRAVERSAL.CHILD_LOOP_START_INDEX; index < children.length; index += RENDERER_TRAVERSAL.CHILD_LOOP_INCREMENT) {
        stack.push(children[index]);
      }
    }
  }
};
function resolvePrimitiveMode(renderingContext, primitive) {
  switch (primitive) {
    case PRIMITIVE_TRIANGLES:
      return renderingContext.TRIANGLES;
    case PRIMITIVE_LINES:
      return renderingContext.LINES;
    case PRIMITIVE_LINE_STRIP:
      return renderingContext.LINE_STRIP;
    case PRIMITIVE_LINE_LOOP:
      return renderingContext.LINE_LOOP;
    case PRIMITIVE_POINTS:
      return renderingContext.POINTS;
    default:
      throw new Error(RENDERER_EXCEPTION_MESSAGES.UNKNOWN_PRIMITIVE);
  }
}

// core/constants/engine.js
var ENGINE_CAMERA_DEFAULTS = Object.freeze({
  FIELD_OF_VIEW_RADIANS: Math.PI / 4,
  NEAR_CLIPPING_PLANE: 0.1,
  FAR_CLIPPING_PLANE: 100,
  INITIAL_CAMERA_Z: 5,
  INITIAL_CAMERA_ASPECT_RATIO: 1
});
var ENGINE_CANVAS_DEFAULTS = Object.freeze({ FIT_TO_WINDOW: false });
var ENGINE_HELPER_DEFAULTS = Object.freeze({ BOX_SIZE: 1 });
var ENGINE_VALIDATION_LIMITS = Object.freeze({
  MIN_BOX_SIZE_EXCLUSIVE: 0,
  MIN_NUMBER_EXCLUSIVE: 0
});
var ENGINE_TIME = Object.freeze({ MILLISECONDS_TO_SECONDS: 1e-3 });
var ENGINE_STATE_RESET = Object.freeze({
  ANIMATION_FRAME_ID: 0,
  TIME_SECONDS: 0
});

// core/engine/engine.js
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
   * Stores the active `requestAnimationFrame` id.
   * A reset value (usually `0`) indicates, that no frame is currently scheduled.
   *
   * @type {number}
   * @private
   */
  #requestAnimationFrameId = ENGINE_STATE_RESET.ANIMATION_FRAME_ID;
  /**
   * Timestamp (in seconds) of the previous frame.
   * Used to compute deltaTimeSeconds.
   *
   * @type {number}
   * @private
   */
  #lastTimeSeconds = ENGINE_STATE_RESET.TIME_SECONDS;
  /**
   * Start timestamp (in seconds) of the engine loop.
   * Used to compute `engineTimeSeconds`.
   *
   * @type {number}
   * @private
   */
  #startTimeSeconds = ENGINE_STATE_RESET.TIME_SECONDS;
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
  #resizeOptions = { fitToWindow: ENGINE_CANVAS_DEFAULTS.FIT_TO_WINDOW };
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
      fieldOfViewRadians = ENGINE_CAMERA_DEFAULTS.FIELD_OF_VIEW_RADIANS,
      near = ENGINE_CAMERA_DEFAULTS.NEAR_CLIPPING_PLANE,
      far = ENGINE_CAMERA_DEFAULTS.FAR_CLIPPING_PLANE,
      initialCameraZ = ENGINE_CAMERA_DEFAULTS.INITIAL_CAMERA_Z,
      fitToWindow = ENGINE_CANVAS_DEFAULTS.FIT_TO_WINDOW
    } = options;
    if (typeof fieldOfViewRadians !== "number" || fieldOfViewRadians <= ENGINE_VALIDATION_LIMITS.MIN_NUMBER_EXCLUSIVE) {
      throw new RangeError("Engine option `fieldOfViewRadians` must be a positive number.");
    }
    if (typeof near !== "number" || typeof far !== "number" || near <= ENGINE_VALIDATION_LIMITS.MIN_NUMBER_EXCLUSIVE || far <= ENGINE_VALIDATION_LIMITS.MIN_NUMBER_EXCLUSIVE || near >= far) {
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
    this.#camera = new PerspectiveCamera(fieldOfViewRadians, ENGINE_CAMERA_DEFAULTS.INITIAL_CAMERA_ASPECT_RATIO, near, far);
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
    const { size = ENGINE_HELPER_DEFAULTS.BOX_SIZE, material } = options;
    if (typeof size !== "number" || size <= ENGINE_VALIDATION_LIMITS.MIN_BOX_SIZE_EXCLUSIVE) {
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
    this.#lastTimeSeconds = ENGINE_STATE_RESET.TIME_SECONDS;
    this.#startTimeSeconds = ENGINE_STATE_RESET.TIME_SECONDS;
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
    this.#requestAnimationFrameId = ENGINE_STATE_RESET.ANIMATION_FRAME_ID;
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
    const timeSeconds = timeMs * ENGINE_TIME.MILLISECONDS_TO_SECONDS;
    if (this.#startTimeSeconds === ENGINE_STATE_RESET.TIME_SECONDS) {
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

// core/debug/light-gizmo.js
var DEFAULT_VISIBLE = true;
var ZERO_VALUE11 = 0;
var VISIBLE_OPACITY = 1;
var HIDDEN_OPACITY = 0;
var MARKER_HALF_SIZE = 0.4;
var ARROW_LENGTH = 2;
var ARROW_HEAD_LENGTH = 0.5;
var ARROW_HEAD_HALF_WIDTH = 0.25;
var MARKER_COLOR = new Float32Array([0.35, 0.9, 1]);
var ARROW_COLOR = new Float32Array([1, 0.9, 0.2]);
var ERROR_WEBGL_CONTEXT_TYPE = "`LightGizmo` expects `WebGL2RenderingContext`.";
var ERROR_LIGHT_TYPE = "`LightGizmo` expects a `DirectionalLight` instance.";
var ERROR_VISIBLE_TYPE = "`LightGizmo.setVisible` expects a boolean.";
var LightGizmo = class extends Object3D {
  /**
   * Target directional light.
   *
   * @type {DirectionalLight}
   * @private
   */
  #light;
  /**
   * Line materials, used by the gizmo.
   *
   * @type {SolidColorMaterial[]}
   * @private
   */
  #materials = [];
  /**
   * Current visibility state.
   *
   * @type {boolean}
   * @private
   */
  #visible = DEFAULT_VISIBLE;
  /**
   * Creates a new LightGizmo instance.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {DirectionalLight} light              - Target directional light.
   * @throws {TypeError} When the inputs are invalid.
   */
  constructor(webglContext, light) {
    super();
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE);
    }
    if (!(light instanceof DirectionalLight)) {
      throw new TypeError(ERROR_LIGHT_TYPE);
    }
    this.#light = light;
    this.#buildMarker(webglContext);
    this.#buildArrow(webglContext);
    this.setVisible(DEFAULT_VISIBLE);
  }
  /**
   * Sets gizmo visibility.
   *
   * @param {boolean} visible - Whether the gizmo should be visible.
   * @returns {void}
   * @throws {TypeError} When the visibility flag is invalid.
   */
  setVisible(visible) {
    if (typeof visible !== "boolean") {
      throw new TypeError(ERROR_VISIBLE_TYPE);
    }
    this.#visible = visible;
    const opacity = this.#visible ? VISIBLE_OPACITY : HIDDEN_OPACITY;
    for (const material of this.#materials) {
      material.setOpacity(opacity);
    }
  }
  /**
   * Returns the target directional light.
   *
   * @returns {DirectionalLight} - The directional light instance, tracked by this gizmo.
   */
  get light() {
    return this.#light;
  }
  /**
   * Builds the position marker lines.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @returns {void}
   * @private
   */
  #buildMarker(webglContext) {
    const markerMaterial = new SolidColorMaterial(webglContext, { color: MARKER_COLOR });
    this.#materials.push(markerMaterial);
    const xStart = new Vector3(-MARKER_HALF_SIZE, ZERO_VALUE11, ZERO_VALUE11);
    const xEnd = new Vector3(MARKER_HALF_SIZE, ZERO_VALUE11, ZERO_VALUE11);
    this.add(this.#createLine(webglContext, markerMaterial, [xStart, xEnd]));
    const yStart = new Vector3(ZERO_VALUE11, -MARKER_HALF_SIZE, ZERO_VALUE11);
    const yEnd = new Vector3(ZERO_VALUE11, MARKER_HALF_SIZE, ZERO_VALUE11);
    this.add(this.#createLine(webglContext, markerMaterial, [yStart, yEnd]));
    const zStart = new Vector3(ZERO_VALUE11, ZERO_VALUE11, -MARKER_HALF_SIZE);
    const zEnd = new Vector3(ZERO_VALUE11, ZERO_VALUE11, MARKER_HALF_SIZE);
    this.add(this.#createLine(webglContext, markerMaterial, [zStart, zEnd]));
  }
  /**
   * Builds the direction arrow lines.
   * The arrow points opposite to the shader light direction (where the light shines),
   * while `DirectionalLight.getDirection()` still returns the `towards light` vector.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @returns {void}
   * @private
   */
  #buildArrow(webglContext) {
    const arrowMaterial = new SolidColorMaterial(webglContext, { color: ARROW_COLOR });
    this.#materials.push(arrowMaterial);
    const shaftStart = new Vector3(ZERO_VALUE11, ZERO_VALUE11, ZERO_VALUE11);
    const shaftEnd = new Vector3(ZERO_VALUE11, ZERO_VALUE11, -ARROW_LENGTH);
    this.add(this.#createLine(webglContext, arrowMaterial, [shaftStart, shaftEnd]));
    const headBaseZ = -ARROW_LENGTH + ARROW_HEAD_LENGTH;
    const headLeft = new Vector3(-ARROW_HEAD_HALF_WIDTH, ZERO_VALUE11, headBaseZ);
    const headTip = new Vector3(ZERO_VALUE11, ZERO_VALUE11, -ARROW_LENGTH);
    const headRight = new Vector3(ARROW_HEAD_HALF_WIDTH, ZERO_VALUE11, headBaseZ);
    this.add(this.#createLine(webglContext, arrowMaterial, [headLeft, headTip, headRight]));
  }
  /**
   * Creates a line mesh from positions and adds it to this gizmo.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {SolidColorMaterial} material         - Material to use.
   * @param {Vector3[]} positions                 - Line positions.
   * @returns {Line}
   * @private
   */
  #createLine(webglContext, material, positions) {
    const geometry = new PolylineGeometry(webglContext, { positions });
    return new Line(geometry, material);
  }
};

// core/debug/transform-gizmo.js
var DEFAULT_VISIBLE2 = true;
var HIDDEN_OPACITY2 = 0;
var PICK_OPACITY = 0;
var AXIS_IDLE_OPACITY = 1;
var AXIS_HOVER_OPACITY = 0.8;
var AXIS_ACTIVE_OPACITY = 1;
var AXIS_INACTIVE_OPACITY = 0.35;
var AXIS_HIDDEN_OPACITY_WHEN_ACTIVE = 0;
var AXIS_LENGTH = 2.5;
var AXIS_HEAD_LENGTH = 0.45;
var AXIS_HEAD_HALF_WIDTH = 0.25;
var AXIS_PICK_THICKNESS = 0.35;
var AXIS_PICK_LENGTH = AXIS_LENGTH;
var AXIS_PICK_CENTER_DIVISOR = 2;
var ZERO_VALUE12 = 0;
var AXIS_X = "x";
var AXIS_Y = "y";
var AXIS_Z = "z";
var AXIS_X_COLOR = new Float32Array([1, 0.4, 0.4]);
var AXIS_Y_COLOR = new Float32Array([0.4, 1, 0.6]);
var AXIS_Z_COLOR = new Float32Array([0.4, 0.6, 1]);
var CENTER_SPHERE_RADIUS = 0.15;
var CENTER_SPHERE_DIAMETER_MULTIPLIER = 2;
var CENTER_SPHERE_DIAMETER = CENTER_SPHERE_RADIUS * CENTER_SPHERE_DIAMETER_MULTIPLIER;
var CENTER_SPHERE_WIDTH_SEGMENTS = 12;
var CENTER_SPHERE_HEIGHT_SEGMENTS = 8;
var CENTER_SPHERE_COLOR = new Float32Array([1, 1, 1]);
var CENTER_SPHERE_OPACITY = 0.8;
var ERROR_WEBGL_CONTEXT_TYPE2 = "`TransformGizmo` expects a `WebGL2RenderingContext`.";
var ERROR_TARGET_TYPE = "`TransformGizmo` expects an `Object3D` target.";
var ERROR_VISIBLE_TYPE2 = "`TransformGizmo.setVisible` expects a boolean.";
var ERROR_AXIS_TYPE = "`TransformGizmo.setActiveAxis` expects (x, y, z) or null.";
var ERROR_HOVER_AXIS_TYPE = "`TransformGizmo.setHoveredAxis` expects (x, y, z) or null.";
var ERROR_AXIS_MESH_TYPE = "`TransformGizmo.getAxisForMesh` expects a `Mesh` instance.";
var ERROR_OPTIONS_TYPE = "`TransformGizmo` expects `options` as a plain object.";
var AXIS_DIR_X = [1, 0, 0];
var AXIS_DIR_Y = [0, 1, 0];
var AXIS_DIR_Z = [0, 0, 1];
var AXIS_HEAD_ORTHO_X = AXIS_DIR_Y;
var AXIS_HEAD_ORTHO_Y = AXIS_DIR_X;
var AXIS_HEAD_ORTHO_Z = AXIS_DIR_X;
var TransformGizmo = class extends Object3D {
  /**
   * Target object, that the gizmo follows.
   *
   * @type {Object3D}
   * @private
   */
  #targetObject;
  /**
   * Materials used by the axis lines.
   *
   * @type {Map<string, SolidColorMaterial>}
   * @private
   */
  #axisMaterials = /* @__PURE__ */ new Map();
  /**
   * Pick volume materials (hidden).
   *
   * @type {SolidColorMaterial}
   * @private
   */
  #pickMaterial;
  /**
   * Center sphere material.
   *
   * @type {SolidColorMaterial}
   * @private
   */
  #centerMaterial;
  /**
   * Center sphere mesh.
   *
   * @type {Mesh}
   * @private
   */
  #centerMesh;
  /**
   * Axis pick meshes mapped to axis identifiers.
   *
   * @type {Map<Mesh, string>}
   * @private
   */
  #pickMeshAxisMap = /* @__PURE__ */ new Map();
  /**
   * Current visibility state.
   *
   * @type {boolean}
   * @private
   */
  #visible = DEFAULT_VISIBLE2;
  /**
   * Currently active axis (if any).
   *
   * @type {string | null}
   * @private
   */
  #activeAxis = null;
  /**
   * Currently hovered axis (if any).
   *
   * @type {string | null}
   * @private
   */
  #hoveredAxis = null;
  /**
   * Creates a new TransformGizmo instance.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {Object3D} targetObject               - Target object to attach the gizmo to.
   * @param {Object} [options]                    - Optional settings (reserved for future use).
   * @throws {TypeError} When inputs are invalid.
   */
  constructor(webglContext, targetObject, options = {}) {
    super();
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE2);
    }
    if (!(targetObject instanceof Object3D)) {
      throw new TypeError(ERROR_TARGET_TYPE);
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(ERROR_OPTIONS_TYPE);
    }
    this.#pickMaterial = new SolidColorMaterial(webglContext, { color: AXIS_X_COLOR });
    this.#pickMaterial.setOpacity(PICK_OPACITY);
    this.#buildAxes(webglContext);
    this.#buildCenterSphere(webglContext);
    this.setTarget(targetObject);
    this.setVisible(DEFAULT_VISIBLE2);
  }
  /**
   * Sets gizmo visibility.
   *
   * @param {boolean} visible - Whether the gizmo should be visible.
   * @returns {void}
   * @throws {TypeError} When the visibility flag is invalid.
   */
  setVisible(visible) {
    if (typeof visible !== "boolean") {
      throw new TypeError(ERROR_VISIBLE_TYPE2);
    }
    this.#visible = visible;
    this.#applyAxisVisuals();
  }
  /**
   * Returns current visibility state.
   *
   * @returns {boolean} - The current visibility state of the gizmo.
   */
  isVisible() {
    return this.#visible;
  }
  /**
   * Updates the gizmo target and reparents this object.
   *
   * @param {Object3D} targetObject - Target object to attach the gizmo to.
   * @returns {void}
   * @throws {TypeError} When the target object is invalid.
   */
  setTarget(targetObject) {
    if (!(targetObject instanceof Object3D)) {
      throw new TypeError(ERROR_TARGET_TYPE);
    }
    if (this.parent) {
      this.parent.remove(this);
    }
    this.#targetObject = targetObject;
    this.#targetObject.add(this);
  }
  /**
   * Returns the currently active axis (if set).
   *
   * @returns {string | null} - The currently active axis id (x, y, z) or null, if no axis is active.
   */
  getActiveAxis() {
    return this.#activeAxis;
  }
  /**
   * Sets the active axis identifier.
   *
   * @param {string | null} axis - Axis id (x, y, z) or null.
   * @returns {void}
   * @throws {TypeError} When the axis value is invalid.
   */
  setActiveAxis(axis) {
    if (axis !== null && axis !== AXIS_X && axis !== AXIS_Y && axis !== AXIS_Z) {
      throw new TypeError(ERROR_AXIS_TYPE);
    }
    if (this.#activeAxis !== null && axis !== null && axis !== this.#activeAxis) {
      return;
    }
    this.#activeAxis = axis;
    this.#applyAxisVisuals();
  }
  /**
   * Sets the hovered axis identifier.
   *
   * @param {string | null} axis - Axis id (x, y, z) or null.
   * @returns {void}
   * @throws {TypeError} When the axis value is invalid.
   */
  setHoveredAxis(axis) {
    if (axis !== null && axis !== AXIS_X && axis !== AXIS_Y && axis !== AXIS_Z) {
      throw new TypeError(ERROR_HOVER_AXIS_TYPE);
    }
    if (this.#activeAxis !== null) {
      return;
    }
    this.#hoveredAxis = axis;
    this.#applyAxisVisuals();
  }
  /**
   * Clears hovered/active state and restores the default visuals.
   *
   * @returns {void}
   */
  clearState() {
    this.#hoveredAxis = null;
    this.#activeAxis = null;
    this.#applyAxisVisuals();
  }
  /**
   * Returns the axis identifier for a pick mesh.
   *
   * @param {Mesh} mesh       - Pick the mesh instance.
   * @returns {string | null} - The axis id (x, y, z) for the provided pick mesh or null, if the mesh is not mapped to an axis.
   * @throws {TypeError} When the mesh input is invalid.
   */
  getAxisForMesh(mesh) {
    if (!(mesh instanceof Mesh)) {
      throw new TypeError(ERROR_AXIS_MESH_TYPE);
    }
    return this.#pickMeshAxisMap.get(mesh) ?? null;
  }
  /**
   * Builds the axes lines and arrow heads.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @returns {void}
   * @private
   */
  #buildAxes(webglContext) {
    this.#buildAxisX(webglContext);
    this.#buildAxisY(webglContext);
    this.#buildAxisZ(webglContext);
  }
  /**
   * Builds the center sphere marker.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @returns {void}
   * @private
   */
  #buildCenterSphere(webglContext) {
    const geometry = new SphereGeometry(webglContext, {
      width: CENTER_SPHERE_DIAMETER,
      height: CENTER_SPHERE_DIAMETER,
      depth: CENTER_SPHERE_DIAMETER,
      widthSegments: CENTER_SPHERE_WIDTH_SEGMENTS,
      heightSegments: CENTER_SPHERE_HEIGHT_SEGMENTS
    });
    const material = new SolidColorMaterial(webglContext, { color: CENTER_SPHERE_COLOR });
    material.setOpacity(CENTER_SPHERE_OPACITY);
    const mesh = new Mesh(geometry, material);
    this.#centerMaterial = material;
    this.#centerMesh = mesh;
    this.add(mesh);
  }
  /**
   * Builds a single axis line, arrow head and pick volume.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {string} axis                         - Axis identifier.
   * @param {Float32Array} color                  - Axis color.
   * @param {number[]} dir                        - Unit axis direction (X/Y/Z).
   * @param {number[]} headOrtho                  - Unit orthogonal direction for arrow head width.
   * @returns {void}
   * @private
   */
  #buildAxis(webglContext, axis, color, dir, headOrtho) {
    const material = new SolidColorMaterial(webglContext, { color });
    this.#axisMaterials.set(axis, material);
    const start = new Vector3(ZERO_VALUE12, ZERO_VALUE12, ZERO_VALUE12);
    const end = new Vector3(
      dir[0] * AXIS_LENGTH,
      dir[1] * AXIS_LENGTH,
      dir[2] * AXIS_LENGTH
    );
    this.add(this.#createLine(webglContext, material, [start, end]));
    const headBaseLength = AXIS_LENGTH - AXIS_HEAD_LENGTH;
    const headBase = new Vector3(
      dir[0] * headBaseLength,
      dir[1] * headBaseLength,
      dir[2] * headBaseLength
    );
    const headTip = new Vector3(
      dir[0] * AXIS_LENGTH,
      dir[1] * AXIS_LENGTH,
      dir[2] * AXIS_LENGTH
    );
    const headLeft = new Vector3(
      headBase.x + headOrtho[0] * -AXIS_HEAD_HALF_WIDTH,
      headBase.y + headOrtho[1] * -AXIS_HEAD_HALF_WIDTH,
      headBase.z + headOrtho[2] * -AXIS_HEAD_HALF_WIDTH
    );
    const headRight = new Vector3(
      headBase.x + headOrtho[0] * AXIS_HEAD_HALF_WIDTH,
      headBase.y + headOrtho[1] * AXIS_HEAD_HALF_WIDTH,
      headBase.z + headOrtho[2] * AXIS_HEAD_HALF_WIDTH
    );
    this.add(this.#createLine(webglContext, material, [headLeft, headTip, headRight]));
    this.#addPickMesh(webglContext, axis);
  }
  #buildAxisX(webglContext) {
    this.#buildAxis(webglContext, AXIS_X, AXIS_X_COLOR, AXIS_DIR_X, AXIS_HEAD_ORTHO_X);
  }
  #buildAxisY(webglContext) {
    this.#buildAxis(webglContext, AXIS_Y, AXIS_Y_COLOR, AXIS_DIR_Y, AXIS_HEAD_ORTHO_Y);
  }
  #buildAxisZ(webglContext) {
    this.#buildAxis(webglContext, AXIS_Z, AXIS_Z_COLOR, AXIS_DIR_Z, AXIS_HEAD_ORTHO_Z);
  }
  /**
   * Adds a pick mesh for the given axis.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {string} axis                         - Axis identifier.
   * @returns {void}
   * @private
   */
  #addPickMesh(webglContext, axis) {
    const geometry = new BoxGeometry(webglContext, {
      width: axis === AXIS_X ? AXIS_PICK_LENGTH : AXIS_PICK_THICKNESS,
      height: axis === AXIS_Y ? AXIS_PICK_LENGTH : AXIS_PICK_THICKNESS,
      depth: axis === AXIS_Z ? AXIS_PICK_LENGTH : AXIS_PICK_THICKNESS
    });
    const mesh = new Mesh(geometry, this.#pickMaterial, { ownsMaterial: false });
    switch (axis) {
      case AXIS_X:
        mesh.position.x = AXIS_PICK_LENGTH / AXIS_PICK_CENTER_DIVISOR;
        break;
      case AXIS_Y:
        mesh.position.y = AXIS_PICK_LENGTH / AXIS_PICK_CENTER_DIVISOR;
        break;
      case AXIS_Z:
        mesh.position.z = AXIS_PICK_LENGTH / AXIS_PICK_CENTER_DIVISOR;
        break;
      default:
        throw new Error(`Unknown axis: ${axis}`);
    }
    this.add(mesh);
    this.#pickMeshAxisMap.set(mesh, axis);
  }
  /**
   * Creates a line mesh from positions.
   *
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {SolidColorMaterial} material         - Material to use.
   * @param {Vector3[]} positions                 - Line positions.
   * @returns {Line}                              - A new line object, built from the provided positions and material.
   * @private
   */
  #createLine(webglContext, material, positions) {
    const geometry = new PolylineGeometry(webglContext, { positions });
    return new Line(geometry, material);
  }
  /**
   * Updates the axis materials based on current hover/active state.
   *
   * @returns {void}
   * @private
   */
  #applyAxisVisuals() {
    const isVisible = this.#visible;
    const activeAxis = this.#activeAxis;
    const hoveredAxis = this.#hoveredAxis;
    for (const [axis, material] of this.#axisMaterials.entries()) {
      let opacity = HIDDEN_OPACITY2;
      if (isVisible) {
        if (activeAxis) {
          opacity = axis === activeAxis ? AXIS_ACTIVE_OPACITY : AXIS_HIDDEN_OPACITY_WHEN_ACTIVE;
        } else if (hoveredAxis) {
          opacity = axis === hoveredAxis ? AXIS_HOVER_OPACITY : AXIS_INACTIVE_OPACITY;
        } else {
          opacity = AXIS_IDLE_OPACITY;
        }
      }
      material.setOpacity(opacity);
    }
    if (this.#centerMesh && this.#centerMaterial) {
      this.#centerMaterial.setOpacity(isVisible ? CENTER_SPHERE_OPACITY : HIDDEN_OPACITY2);
    }
  }
};

// core/loaders/obj-mtl/obj-geometry-builder.js
var POSITION_COMPONENT_COUNT6 = 3;
var UV_COMPONENT_COUNT2 = 2;
var NORMAL_COMPONENT_COUNT2 = 3;
var COLOR_COMPONENT_COUNT5 = 3;
var DEFAULT_UV = [0, 0];
var DEFAULT_NORMAL = [0, 0, 1];
var OBJ_INDEX_NOT_PROVIDED = -1;
var ZERO_VALUE13 = 0;
var FIRST_INDEX = 0;
var SECOND_INDEX = 1;
var THIRD_INDEX = 2;
var COMPONENT_INDEX_X = 0;
var COMPONENT_INDEX_Y = 1;
var COMPONENT_INDEX_Z = 2;
var VERTEX_KEY_SEPARATOR = "|";
var LOOP_INCREMENT = 1;
var LINE_MIN_VERTEX_COUNT = 2;
var ENTRY_TYPE_MESH = "mesh";
var ENTRY_TYPE_POINTS = "points";
var ENTRY_TYPE_LINE = "line";
var ERROR_WEBGL_CONTEXT_TYPE3 = "`ObjGeometryBuilder` expects a `WebGL2RenderingContext`.";
var ERROR_PARSED_DATA_TYPE = "`ObjGeometryBuilder.build` expects parsed OBJ data as an object.";
var ObjGeometryBuilder = class _ObjGeometryBuilder {
  /**
   * WebGL2 rendering context used to create the geometries.
   *
   * @type {WebGL2RenderingContext}
   * @private
   */
  #webglContext;
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @throws {TypeError} When `webglContext` is not a `WebGL2RenderingContext`.
   */
  constructor(webglContext) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE3);
    }
    this.#webglContext = webglContext;
  }
  /**
   * Builds the geometry for parsed OBJ data.
   *
   * @param {ObjParsedData} parsedData - Parsed OBJ data.
   * @returns {ObjGeometryBuildResult} - Build result, which is containing the root node, mesh creation entries and created geometries.
   * @throws {TypeError} When `parsedData` is invalid.
   */
  build(parsedData) {
    if (parsedData === null || typeof parsedData !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(parsedData)) {
      throw new TypeError(ERROR_PARSED_DATA_TYPE);
    }
    const root = new Object3D();
    const entries = [];
    const geometries = [];
    for (const objectData of parsedData.objects) {
      const objectNode = new Object3D();
      root.add(objectNode);
      for (const groupData of objectData.groups) {
        const groupNode = new Object3D();
        objectNode.add(groupNode);
        for (const chunk of groupData.materialChunks) {
          if (chunk.triangles.length) {
            const geometryData = this.#buildGeometryForChunk(chunk, parsedData);
            const geometry = new CustomGeometry(this.#webglContext, geometryData);
            const usesVertexColors = Boolean(geometryData.colors);
            entries.push({
              entryType: ENTRY_TYPE_MESH,
              parent: groupNode,
              geometry,
              materialName: chunk.materialName,
              usesVertexColors
            });
            geometries.push(geometry);
          }
          if (chunk.points.length) {
            const geometry = this.#buildPointsGeometry(chunk, parsedData);
            entries.push({
              entryType: ENTRY_TYPE_POINTS,
              parent: groupNode,
              geometry,
              materialName: chunk.materialName,
              usesVertexColors: false
            });
            geometries.push(geometry);
          }
          if (chunk.lines.length) {
            const lineGeometries = this.#buildLineGeometries(chunk, parsedData);
            for (const geometry of lineGeometries) {
              entries.push({
                entryType: ENTRY_TYPE_LINE,
                parent: groupNode,
                geometry,
                materialName: chunk.materialName,
                usesVertexColors: false
              });
              geometries.push(geometry);
            }
          }
        }
      }
    }
    return {
      root,
      entries,
      geometries
    };
  }
  /**
   * Builds the geometry data for a material chunk.
   *
   * @param {ObjMaterialChunk} chunk   - Material chunk.
   * @param {ObjParsedData} parsedData - Parsed OBJ data.
   * @returns {Object}                 - Geometry buffers for the chunk.
   * @private
   */
  #buildGeometryForChunk(chunk, parsedData) {
    const positions = [];
    const uvs = [];
    const normals = [];
    const colors = parsedData.hasVertexColors ? [] : null;
    const indices = [];
    if (chunk.smoothingGroup === ZERO_VALUE13) {
      this.#appendFlatGeometry(chunk, parsedData, positions, uvs, normals, colors, indices);
    } else {
      this.#appendSmoothGeometry(chunk, parsedData, positions, uvs, normals, colors, indices);
    }
    return {
      positions: new Float32Array(positions),
      indices,
      uvs: new Float32Array(uvs),
      normals: new Float32Array(normals),
      colors: colors ? new Float32Array(colors) : null
    };
  }
  /**
   * Builds points geometry for a chunk.
   *
   * @param {ObjMaterialChunk} chunk   - Material chunk.
   * @param {ObjParsedData} parsedData - Parsed OBJ data.
   * @returns {PointsGeometry}         - Points geometry.
   * @private
   */
  #buildPointsGeometry(chunk, parsedData) {
    const positions = _ObjGeometryBuilder.#buildVectorPositions(chunk.points, parsedData.positions);
    return new PointsGeometry(this.#webglContext, { positions });
  }
  /**
   * Builds line geometries for a chunk.
   *
   * @param {ObjMaterialChunk} chunk   - Material chunk.
   * @param {ObjParsedData} parsedData - Parsed OBJ data.
   * @returns {PolylineGeometry[]}     - Line geometries.
   * @private
   */
  #buildLineGeometries(chunk, parsedData) {
    const result = [];
    for (const lineIndices of chunk.lines) {
      const positions = _ObjGeometryBuilder.#buildVectorPositions(lineIndices, parsedData.positions);
      if (positions.length >= LINE_MIN_VERTEX_COUNT) {
        result.push(new PolylineGeometry(this.#webglContext, { positions }));
      }
    }
    return result;
  }
  /**
   * Appends the flat-shaded geometry data.
   *
   * @param {ObjMaterialChunk} chunk    - Material chunk.
   * @param {ObjParsedData} parsedData  - Parsed OBJ data.
   * @param {number[]} positionsOut     - Output positions.
   * @param {number[]} uvsOut           - Output UVs.
   * @param {number[]} normalsOut       - Output normals.
   * @param {number[] | null} colorsOut - Output colors.
   * @param {number[]} indicesOut       - Output indices.
   * @returns {void}                    - Appends the flat-shaded vertex data into the provided output buffers.
   * @private
   */
  #appendFlatGeometry(chunk, parsedData, positionsOut, uvsOut, normalsOut, colorsOut, indicesOut) {
    const positions = parsedData.positions;
    const uvs = parsedData.uvs;
    const normals = parsedData.normals;
    const colors = parsedData.colors;
    let vertexIndex = ZERO_VALUE13;
    for (const triangle of chunk.triangles) {
      const faceNormal = this.#computeFaceNormal(triangle, positions);
      for (const vertex of triangle) {
        const positionIndex = vertex.positionIndex;
        const uvIndex = vertex.uvIndex;
        const normalIndex = vertex.normalIndex;
        _ObjGeometryBuilder.#appendPosition(positions, positionIndex, positionsOut);
        _ObjGeometryBuilder.#appendUv(uvs, uvIndex, uvsOut);
        if (normalIndex !== OBJ_INDEX_NOT_PROVIDED) {
          _ObjGeometryBuilder.#appendNormal(normals, normalIndex, normalsOut);
        } else {
          normalsOut.push(
            faceNormal[COMPONENT_INDEX_X],
            faceNormal[COMPONENT_INDEX_Y],
            faceNormal[COMPONENT_INDEX_Z]
          );
        }
        if (colorsOut) {
          _ObjGeometryBuilder.#appendColor(colors, positionIndex, colorsOut);
        }
        indicesOut.push(vertexIndex);
        vertexIndex += LOOP_INCREMENT;
      }
    }
  }
  /**
   * Appends the smooth-shaded geometry data.
   *
   * @param {ObjMaterialChunk} chunk    - Material chunk.
   * @param {ObjParsedData} parsedData  - Parsed OBJ data.
   * @param {number[]} positionsOut     - Output positions.
   * @param {number[]} uvsOut           - Output UVs.
   * @param {number[]} normalsOut       - Output normals.
   * @param {number[] | null} colorsOut - Output colors.
   * @param {number[]} indicesOut       - Output indices.
   * @returns {void}                    - Appends the smooth-shaded vertex data into the provided output buffers, reusing the shared vertices, when possible.
   * @private
   */
  #appendSmoothGeometry(chunk, parsedData, positionsOut, uvsOut, normalsOut, colorsOut, indicesOut) {
    const positions = parsedData.positions;
    const uvs = parsedData.uvs;
    const normals = parsedData.normals;
    const colors = parsedData.colors;
    const vertexMap = /* @__PURE__ */ new Map();
    const normalAccumulator = this.#buildNormalAccumulator(chunk, positions);
    for (const triangle of chunk.triangles) {
      for (const vertex of triangle) {
        const key = _ObjGeometryBuilder.#buildVertexKey(vertex);
        if (vertexMap.has(key)) {
          indicesOut.push(vertexMap.get(key));
          continue;
        }
        const positionIndex = vertex.positionIndex;
        const uvIndex = vertex.uvIndex;
        const normalIndex = vertex.normalIndex;
        const nextIndex = positionsOut.length / POSITION_COMPONENT_COUNT6;
        vertexMap.set(key, nextIndex);
        _ObjGeometryBuilder.#appendPosition(positions, positionIndex, positionsOut);
        _ObjGeometryBuilder.#appendUv(uvs, uvIndex, uvsOut);
        if (normalIndex !== OBJ_INDEX_NOT_PROVIDED) {
          _ObjGeometryBuilder.#appendNormal(normals, normalIndex, normalsOut);
        } else {
          const smoothNormal = normalAccumulator.get(key) || DEFAULT_NORMAL;
          normalsOut.push(
            smoothNormal[COMPONENT_INDEX_X],
            smoothNormal[COMPONENT_INDEX_Y],
            smoothNormal[COMPONENT_INDEX_Z]
          );
        }
        if (colorsOut) {
          _ObjGeometryBuilder.#appendColor(colors, positionIndex, colorsOut);
        }
        indicesOut.push(nextIndex);
      }
    }
  }
  /**
   * Builds a normal accumulator map for smooth shading.
   *
   * @param {ObjMaterialChunk} chunk  - Material chunk.
   * @param {number[]} positions      - Source positions.
   * @returns {Map<string, number[]>} - Map of the `accumulated normalized` normals, keyed by the unique vertex key.
   * @private
   */
  #buildNormalAccumulator(chunk, positions) {
    const accumulators = /* @__PURE__ */ new Map();
    for (const triangle of chunk.triangles) {
      const faceNormal = this.#computeFaceNormal(triangle, positions);
      for (const vertex of triangle) {
        if (vertex.normalIndex !== OBJ_INDEX_NOT_PROVIDED) {
          continue;
        }
        const key = _ObjGeometryBuilder.#buildVertexKey(vertex);
        const current = accumulators.get(key) || [ZERO_VALUE13, ZERO_VALUE13, ZERO_VALUE13];
        current[COMPONENT_INDEX_X] += faceNormal[COMPONENT_INDEX_X];
        current[COMPONENT_INDEX_Y] += faceNormal[COMPONENT_INDEX_Y];
        current[COMPONENT_INDEX_Z] += faceNormal[COMPONENT_INDEX_Z];
        accumulators.set(key, current);
      }
    }
    for (const [key, normal] of accumulators.entries()) {
      const length = Math.hypot(normal[COMPONENT_INDEX_X], normal[COMPONENT_INDEX_Y], normal[COMPONENT_INDEX_Z]);
      if (length > ZERO_VALUE13) {
        normal[COMPONENT_INDEX_X] /= length;
        normal[COMPONENT_INDEX_Y] /= length;
        normal[COMPONENT_INDEX_Z] /= length;
      }
      accumulators.set(key, normal);
    }
    return accumulators;
  }
  /**
   * Computes a face normal for a triangle.
   *
   * @param {ObjFaceVertex[]} triangle - Triangle vertices.
   * @param {number[]} positions       - Source positions.
   * @returns {number[]}               - Normalized face normal as an `[x, y, z]` array.
   * @private
   */
  #computeFaceNormal(triangle, positions) {
    const vertexA = triangle[FIRST_INDEX];
    const vertexB = triangle[SECOND_INDEX];
    const vertexC = triangle[THIRD_INDEX];
    const ax = _ObjGeometryBuilder.#getPositionComponent(positions, vertexA.positionIndex, COMPONENT_INDEX_X);
    const ay = _ObjGeometryBuilder.#getPositionComponent(positions, vertexA.positionIndex, COMPONENT_INDEX_Y);
    const az = _ObjGeometryBuilder.#getPositionComponent(positions, vertexA.positionIndex, COMPONENT_INDEX_Z);
    const bx = _ObjGeometryBuilder.#getPositionComponent(positions, vertexB.positionIndex, COMPONENT_INDEX_X);
    const by = _ObjGeometryBuilder.#getPositionComponent(positions, vertexB.positionIndex, COMPONENT_INDEX_Y);
    const bz = _ObjGeometryBuilder.#getPositionComponent(positions, vertexB.positionIndex, COMPONENT_INDEX_Z);
    const cx = _ObjGeometryBuilder.#getPositionComponent(positions, vertexC.positionIndex, COMPONENT_INDEX_X);
    const cy = _ObjGeometryBuilder.#getPositionComponent(positions, vertexC.positionIndex, COMPONENT_INDEX_Y);
    const cz = _ObjGeometryBuilder.#getPositionComponent(positions, vertexC.positionIndex, COMPONENT_INDEX_Z);
    const abx = bx - ax;
    const aby = by - ay;
    const abz = bz - az;
    const acx = cx - ax;
    const acy = cy - ay;
    const acz = cz - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const length = Math.hypot(nx, ny, nz);
    if (length > ZERO_VALUE13) {
      return [nx / length, ny / length, nz / length];
    }
    return DEFAULT_NORMAL;
  }
  /**
   * Appends a position to the target buffer.
   *
   * @param {number[]} sourcePositions - Source positions.
   * @param {number} index             - Position index.
   * @param {number[]} target          - Target positions buffer.
   * @returns {void}                   - Appends the referenced position triplet to the target buffer.
   * @private
   */
  static #appendPosition(sourcePositions, index, target) {
    const baseIndex = index * POSITION_COMPONENT_COUNT6;
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
   * @param {number} index       - UV-index.
   * @param {number[]} target    - Target UV-buffer.
   * @returns {void}             - Appends the referenced UV-pair to the target buffer or the default UV, when missing/invalid.
   * @private
   */
  static #appendUv(sourceUvs, index, target) {
    if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE13 && index * UV_COMPONENT_COUNT2 < sourceUvs.length) {
      const baseIndex = index * UV_COMPONENT_COUNT2;
      target.push(sourceUvs[baseIndex + COMPONENT_INDEX_X], sourceUvs[baseIndex + COMPONENT_INDEX_Y]);
      return;
    }
    target.push(DEFAULT_UV[COMPONENT_INDEX_X], DEFAULT_UV[COMPONENT_INDEX_Y]);
  }
  /**
   * Appends a normal to the target buffer.
   *
   * @param {number[]} sourceNormals - Source normals.
   * @param {number} index           - Normal index.
   * @param {number[]} target        - Target normal buffer.
   * @returns {void}                 - Appends the referenced normal triplet to the target buffer or the default normal, when missing/invalid.
   * @private
   */
  static #appendNormal(sourceNormals, index, target) {
    if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE13 && index * NORMAL_COMPONENT_COUNT2 < sourceNormals.length) {
      const baseIndex = index * NORMAL_COMPONENT_COUNT2;
      target.push(
        sourceNormals[baseIndex + COMPONENT_INDEX_X],
        sourceNormals[baseIndex + COMPONENT_INDEX_Y],
        sourceNormals[baseIndex + COMPONENT_INDEX_Z]
      );
      return;
    }
    target.push(
      DEFAULT_NORMAL[COMPONENT_INDEX_X],
      DEFAULT_NORMAL[COMPONENT_INDEX_Y],
      DEFAULT_NORMAL[COMPONENT_INDEX_Z]
    );
  }
  /**
   * Appends a color to the target buffer.
   *
   * @param {number[]} sourceColors - Source colors.
   * @param {number} index          - Color index.
   * @param {number[]} target       - Target colors buffer.
   * @returns {void}                - Appends the referenced RGB-triplet to the target buffer.
   * @private
   */
  static #appendColor(sourceColors, index, target) {
    const baseIndex = index * COLOR_COMPONENT_COUNT5;
    target.push(
      sourceColors[baseIndex + COMPONENT_INDEX_X],
      sourceColors[baseIndex + COMPONENT_INDEX_Y],
      sourceColors[baseIndex + COMPONENT_INDEX_Z]
    );
  }
  /**
   * Builds a unique vertex key from the indices.
   *
   * @param {ObjFaceVertex} vertex - Face vertex.
   * @returns {string}             - Unique vertex key built from the OBJ indices.
   * @private
   */
  static #buildVertexKey(vertex) {
    return String(vertex.positionIndex) + VERTEX_KEY_SEPARATOR + String(vertex.uvIndex) + VERTEX_KEY_SEPARATOR + String(vertex.normalIndex);
  }
  /**
   * Reads the position component from the source array.
   *
   * @param {number[]} positions - Source positions.
   * @param {number} index       - Vertex index.
   * @param {number} component   - Component offset.
   * @returns {number}           - Requested position component value for the given vertex index.
   * @private
   */
  static #getPositionComponent(positions, index, component) {
    return positions[index * POSITION_COMPONENT_COUNT6 + component];
  }
  /**
   * Builds Vector3 positions from indices.
   *
   * @param {number[]} indices   - Position indices.
   * @param {number[]} positions - Flat positions array.
   * @returns {Vector3[]}        - Vector3 positions.
   * @private
   */
  static #buildVectorPositions(indices, positions) {
    const result = [];
    for (const index of indices) {
      const baseIndex = index * POSITION_COMPONENT_COUNT6;
      const x = positions[baseIndex + COMPONENT_INDEX_X];
      const y = positions[baseIndex + COMPONENT_INDEX_Y];
      const z = positions[baseIndex + COMPONENT_INDEX_Z];
      result.push(new Vector3(x, y, z));
    }
    return result;
  }
};

// core/loaders/obj-mtl/mtl-texture-cache.js
var ERROR_WEBGL_CONTEXT_TYPE4 = "`MtlTextureCache` expects a `WebGL2RenderingContext`.";
var ERROR_TEXTURE_URL_TYPE = "`MtlTextureCache.getTexture` expects `url` as a string.";
var ERROR_OUTPUT_LIST_TYPE = "`MtlTextureCache.getTexture` expects `output` as an array.";
var ERROR_OPTIONS_TYPE2 = "`MtlTextureCache.getTexture` expects `options` as a plain object.";
var ERROR_CLAMP_OPTION_TYPE = "`MtlTextureCache.getTexture` expects `options.clamp` as a boolean.";
var ERROR_WRAP_S_OPTION_TYPE = "`MtlTextureCache.getTexture` expects `options.wrapS` as a number.";
var ERROR_WRAP_T_OPTION_TYPE = "`MtlTextureCache.getTexture` expects `options.wrapT` as a number.";
var CACHE_KEY_SEPARATOR = "|";
var MtlTextureCache = class _MtlTextureCache {
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
  #cache = /* @__PURE__ */ new Map();
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @throws {TypeError} When `webglContext` is not `WebGL2RenderingContext`.
   */
  constructor(webglContext) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE4);
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
      throw new TypeError(ERROR_OPTIONS_TYPE2);
    }
    const { clamp = false, wrapS, wrapT } = options;
    if (typeof clamp !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
      throw new TypeError(ERROR_CLAMP_OPTION_TYPE);
    }
    if (wrapS !== void 0 && typeof wrapS !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
      throw new TypeError(ERROR_WRAP_S_OPTION_TYPE);
    }
    if (wrapT !== void 0 && typeof wrapT !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
      throw new TypeError(ERROR_WRAP_T_OPTION_TYPE);
    }
    const resolvedWrapS = wrapS !== void 0 ? wrapS : clamp ? this.#webglContext.CLAMP_TO_EDGE : this.#webglContext.REPEAT;
    const resolvedWrapT = wrapT !== void 0 ? wrapT : clamp ? this.#webglContext.CLAMP_TO_EDGE : this.#webglContext.REPEAT;
    const cacheKey = _MtlTextureCache.#buildCacheKey(url, resolvedWrapS, resolvedWrapT);
    if (this.#cache.has(cacheKey)) {
      return this.#cache.get(cacheKey);
    }
    const texture = new Texture2D(this.#webglContext, {
      wrapS: resolvedWrapS,
      wrapT: resolvedWrapT
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
};

// core/loaders/obj-mtl/obj-material-factory.js
var DEFAULT_TEXTURE_UNIT_INDEX3 = 0;
var DEFAULT_OPACITY2 = 1;
var DEFAULT_AMBIENT_STRENGTH = 0.2;
var COLOR_COMPONENT_COUNT6 = 3;
var DEFAULT_DIFFUSE_COLOR2 = new Float32Array([1, 1, 1]);
var DEFAULT_SHININESS3 = 16;
var DEFAULT_SPECULAR_STRENGTH3 = 1;
var DEFAULT_OPTICAL_DENSITY2 = 1;
var MIN_SHININESS = 1;
var MAX_SHININESS = 128;
var ZERO_VALUE14 = 0;
var AMBIENT_COLOR_EPSILON = 1e-4;
var FIRST_INDEX2 = 0;
var SECOND_INDEX2 = 1;
var THIRD_INDEX2 = 2;
var TEXTURE_UNIT_DIFFUSE = 0;
var TEXTURE_UNIT_AMBIENT = 1;
var TEXTURE_UNIT_SPECULAR = 2;
var TEXTURE_UNIT_ALPHA = 3;
var TEXTURE_UNIT_BUMP = 4;
var TEXTURE_UNIT_DISPLACEMENT = 5;
var TEXTURE_UNIT_REFLECTION = 6;
var MAX_TEXTURE_UNIT_OFFSET = TEXTURE_UNIT_REFLECTION;
var ERROR_WEBGL_CONTEXT_TYPE5 = "`ObjMaterialFactory` expects a `WebGL2RenderingContext`.";
var ERROR_OPTIONS_TYPE3 = "`ObjMaterialFactory` expects options as a plain object.";
var ERROR_TEXTURE_UNIT_INDEX_TYPE = "`ObjMaterialFactory` expects `textureUnitIndex` as a non-negative integer.";
var ERROR_DEFAULT_COLOR_TYPE = "`ObjMaterialFactory` expects `defaultColor` as `number[]` or `Float32Array`.";
var ERROR_DEFAULT_COLOR_LENGTH = "`ObjMaterialFactory` expects `defaultColor` to have 3 components.";
var ERROR_TEXTURE_CACHE_TYPE = "`ObjMaterialFactory` expects `textureCache` as `MtlTextureCache`.";
var ERROR_TEXTURES_OUTPUT_TYPE = "`ObjMaterialFactory.createMaterial` expects `textures` as an array.";
var ERROR_TEXTURE_UNITS_LIMIT = "`ObjMaterialFactory` cannot allocate texture units for MTL maps. Increase available texture units or reduce the number of maps.";
var ObjMaterialFactory = class _ObjMaterialFactory {
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
  #defaultColor = new Float32Array(DEFAULT_DIFFUSE_COLOR2);
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
      throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE5);
    }
    if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
      throw new TypeError(ERROR_OPTIONS_TYPE3);
    }
    const {
      textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX3,
      defaultColor,
      textureCache
    } = options;
    if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE14) {
      throw new TypeError(ERROR_TEXTURE_UNIT_INDEX_TYPE);
    }
    if (defaultColor !== void 0) {
      if (!Array.isArray(defaultColor) && !(defaultColor instanceof Float32Array)) {
        throw new TypeError(ERROR_DEFAULT_COLOR_TYPE);
      }
      if (defaultColor.length !== COLOR_COMPONENT_COUNT6) {
        throw new TypeError(ERROR_DEFAULT_COLOR_LENGTH);
      }
      this.#defaultColor.set(defaultColor);
    }
    if (textureCache !== void 0 && !(textureCache instanceof MtlTextureCache)) {
      throw new TypeError(ERROR_TEXTURE_CACHE_TYPE);
    }
    this.#webglContext = webglContext;
    this.#textureUnitIndex = textureUnitIndex;
    this.#textureCache = textureCache || new MtlTextureCache(webglContext);
  }
  /**
   * Creates a material instance, based on MTL data.
   *
   * @param {Object | null} definition                  - Parsed material definition.
   * @param {ObjMaterialTextureUrls | null} textureUrls - Resolved texture URLs.
   * @param {Array} textures                            - Output list of created textures.
   * @param {boolean} [useVertexColors = false]         - Whether the vertex colors are available.
   * @returns {Promise<LambertMaterial | PhongMaterial | VertexColorMaterial | MtlStandardMaterial>} - Promise, that resolves with the created material instance, based on the parsed MTL definition and the available inputs.
   * @throws {TypeError} When textures output is invalid.
   */
  async createMaterial(definition, textureUrls, textures, useVertexColors = false) {
    if (!Array.isArray(textures)) {
      throw new TypeError(ERROR_TEXTURES_OUTPUT_TYPE);
    }
    const opacity = definition ? definition.opacity : DEFAULT_OPACITY2;
    if (definition && this.#requiresStandardMaterial(definition, textureUrls)) {
      this.#assertTextureUnitsAvailable(definition, textureUrls);
      const ambientColor = _ObjMaterialFactory.#resolveAmbientColor(definition);
      const material = new MtlStandardMaterial(this.#webglContext, {
        diffuseColor: definition.diffuseColor,
        ambientColor,
        specularColor: definition.specularColor,
        emissiveColor: definition.emissiveColor,
        ambientStrength: DEFAULT_AMBIENT_STRENGTH
      });
      material.setOpacity(opacity);
      material.setShininess(_ObjMaterialFactory.#clampShininess(definition.specularExponent));
      material.setSpecularStrength(DEFAULT_SPECULAR_STRENGTH3);
      material.setOpticalDensity(definition.opticalDensity ?? DEFAULT_OPTICAL_DENSITY2);
      material.setSpecularEnabled(_ObjMaterialFactory.#isSpecularEnabled(definition));
      if (textureUrls && definition.diffuseMap && textureUrls.diffuse) {
        const texture = await this.#textureCache.getTexture(textureUrls.diffuse, textures, {
          clamp: definition.diffuseMap.clamp
        });
        material.setDiffuseMap(texture, {
          textureUnitIndex: this.#textureUnitIndex + TEXTURE_UNIT_DIFFUSE,
          uvOffset: definition.diffuseMap.offset,
          uvScale: definition.diffuseMap.scale
        });
      }
      if (textureUrls && definition.ambientMap && textureUrls.ambient) {
        const texture = await this.#textureCache.getTexture(textureUrls.ambient, textures, {
          clamp: definition.ambientMap.clamp
        });
        material.setAmbientMap(texture, {
          textureUnitIndex: this.#textureUnitIndex + TEXTURE_UNIT_AMBIENT,
          uvOffset: definition.ambientMap.offset,
          uvScale: definition.ambientMap.scale
        });
      }
      if (textureUrls && definition.specularMap && textureUrls.specular) {
        const texture = await this.#textureCache.getTexture(textureUrls.specular, textures, {
          clamp: definition.specularMap.clamp
        });
        material.setSpecularMap(texture, {
          textureUnitIndex: this.#textureUnitIndex + TEXTURE_UNIT_SPECULAR,
          uvOffset: definition.specularMap.offset,
          uvScale: definition.specularMap.scale
        });
      }
      if (textureUrls && definition.alphaMap && textureUrls.alpha) {
        const texture = await this.#textureCache.getTexture(textureUrls.alpha, textures, {
          clamp: definition.alphaMap.clamp
        });
        material.setAlphaMap(texture, {
          textureUnitIndex: this.#textureUnitIndex + TEXTURE_UNIT_ALPHA,
          uvOffset: definition.alphaMap.offset,
          uvScale: definition.alphaMap.scale
        });
      }
      if (textureUrls && definition.bumpMap && textureUrls.bump) {
        const texture = await this.#textureCache.getTexture(textureUrls.bump, textures, {
          clamp: definition.bumpMap.clamp
        });
        material.setBumpMap(texture, {
          textureUnitIndex: this.#textureUnitIndex + TEXTURE_UNIT_BUMP,
          uvOffset: definition.bumpMap.offset,
          uvScale: definition.bumpMap.scale
        });
        material.setBumpMultiplier(definition.bumpMap.bumpMultiplier);
      }
      if (textureUrls && definition.displacementMap && textureUrls.displacement) {
        const texture = await this.#textureCache.getTexture(textureUrls.displacement, textures, {
          clamp: definition.displacementMap.clamp
        });
        material.setDisplacementMap(texture, {
          textureUnitIndex: this.#textureUnitIndex + TEXTURE_UNIT_DISPLACEMENT,
          uvOffset: definition.displacementMap.offset,
          uvScale: definition.displacementMap.scale
        });
      }
      if (textureUrls && definition.reflectionMap && textureUrls.reflection) {
        const texture = await this.#textureCache.getTexture(textureUrls.reflection, textures, {
          clamp: definition.reflectionMap.clamp
        });
        material.setReflectionMap(texture, {
          textureUnitIndex: this.#textureUnitIndex + TEXTURE_UNIT_REFLECTION,
          uvOffset: definition.reflectionMap.offset,
          uvScale: definition.reflectionMap.scale
        });
      }
      return material;
    }
    if (useVertexColors && !this.#hasSpecularInfo(definition)) {
      const material = new VertexColorMaterial(this.#webglContext);
      material.setOpacity(opacity);
      return material;
    }
    if (this.#hasSpecularInfo(definition)) {
      const diffuseColor = definition ? definition.diffuseColor : this.#defaultColor;
      const specularColor = definition ? definition.specularColor : new Float32Array(COLOR_COMPONENT_COUNT6);
      const shininess = _ObjMaterialFactory.#clampShininess(definition ? definition.specularExponent : null);
      const material = new PhongMaterial(this.#webglContext, {
        color: diffuseColor,
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
   * Determines whether the material has the specular data.
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
    return Boolean(specular && (specular[FIRST_INDEX2] > ZERO_VALUE14 || specular[SECOND_INDEX2] > ZERO_VALUE14 || specular[THIRD_INDEX2] > ZERO_VALUE14));
  }
  /**
   * Resolves the ambient color, applying fallback to diffuse the color, when needed.
   *
   * @param {Object} definition                - Parsed material definition.
   * @returns {Float32Array | number[] | null} - Resolved ambient color.
   * @private
   */
  static #resolveAmbientColor(definition) {
    if (!definition) {
      return null;
    }
    if (definition.ambientMap) {
      return definition.ambientColor;
    }
    if (_ObjMaterialFactory.#isColorNearZero(definition.ambientColor)) {
      return null;
    }
    return definition.ambientColor;
  }
  /**
   * Checks whether a color is effectively zero.
   *
   * @param {Float32Array | number[] | null} color - Color input.
   * @returns {boolean}                            - True, when color is missing or near zero.
   * @private
   */
  static #isColorNearZero(color) {
    if (!color || typeof color.length !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || color.length < COLOR_COMPONENT_COUNT6) {
      return true;
    }
    return Math.abs(color[FIRST_INDEX2]) <= AMBIENT_COLOR_EPSILON && Math.abs(color[SECOND_INDEX2]) <= AMBIENT_COLOR_EPSILON && Math.abs(color[THIRD_INDEX2]) <= AMBIENT_COLOR_EPSILON;
  }
  /**
   * Clamps the shininess value into the allowed range.
   *
   * @param {number | null} value - Specular exponent.
   * @returns {number}            - Clamped shininess value within the allowed range (falls back to the default, when input is invalid).
   * @private
   */
  static #clampShininess(value) {
    if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
      return DEFAULT_SHININESS3;
    }
    return Math.min(Math.max(value, MIN_SHININESS), MAX_SHININESS);
  }
  /**
   * Determines if the material should be rendered with the standard MTL material.
   *
   * @param {Object} definition                         - Parsed material definition.
   * @param {ObjMaterialTextureUrls | null} textureUrls - Resolved texture URLs.
   * @returns {boolean}                                 - True, when the standard MTL material is required.
   * @private
   */
  #requiresStandardMaterial(definition, textureUrls) {
    if (!definition) {
      return false;
    }
    const hasMaps = Boolean(definition.diffuseMap || definition.ambientMap || definition.specularMap || definition.alphaMap || definition.bumpMap || definition.displacementMap || definition.reflectionMap);
    const hasIllumination = definition.illuminationModel !== null;
    const hasSpecular = this.#hasSpecularInfo(definition);
    if (hasMaps || hasIllumination || hasSpecular) {
      return true;
    }
    return Boolean(textureUrls && textureUrls.diffuse);
  }
  /**
   * Checks if specular lighting should be enabled.
   *
   * @param {Object} definition - Parsed material definition.
   * @returns {boolean}         - True when specular should be enabled.
   * @private
   */
  static #isSpecularEnabled(definition) {
    if (!definition || definition.illuminationModel === null) {
      return true;
    }
    return definition.illuminationModel >= SECOND_INDEX2;
  }
  /**
   * Ensures texture units are available for all required maps.
   *
   * @param {Object} definition                         - Parsed material definition.
   * @param {ObjMaterialTextureUrls | null} textureUrls - Resolved texture URLs.
   * @returns {void}
   * @throws {Error} When available texture units are insufficient.
   * @private
   */
  #assertTextureUnitsAvailable(definition, textureUrls) {
    const maxUnits = this.#webglContext.getParameter(this.#webglContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    if (!Number.isInteger(maxUnits) || maxUnits <= ZERO_VALUE14) {
      throw new Error(ERROR_TEXTURE_UNITS_LIMIT);
    }
    const usesDiffuse = Boolean(textureUrls && definition.diffuseMap && textureUrls.diffuse);
    const usesAmbient = Boolean(textureUrls && definition.ambientMap && textureUrls.ambient);
    const usesSpecular = Boolean(textureUrls && definition.specularMap && textureUrls.specular);
    const usesAlpha = Boolean(textureUrls && definition.alphaMap && textureUrls.alpha);
    const usesBump = Boolean(textureUrls && definition.bumpMap && textureUrls.bump);
    const usesDisplacement = Boolean(textureUrls && definition.displacementMap && textureUrls.displacement);
    const usesReflection = Boolean(textureUrls && definition.reflectionMap && textureUrls.reflection);
    let maxOffset = ZERO_VALUE14;
    if (usesDiffuse) {
      maxOffset = Math.max(maxOffset, TEXTURE_UNIT_DIFFUSE);
    }
    if (usesAmbient) {
      maxOffset = Math.max(maxOffset, TEXTURE_UNIT_AMBIENT);
    }
    if (usesSpecular) {
      maxOffset = Math.max(maxOffset, TEXTURE_UNIT_SPECULAR);
    }
    if (usesAlpha) {
      maxOffset = Math.max(maxOffset, TEXTURE_UNIT_ALPHA);
    }
    if (usesBump) {
      maxOffset = Math.max(maxOffset, TEXTURE_UNIT_BUMP);
    }
    if (usesDisplacement) {
      maxOffset = Math.max(maxOffset, TEXTURE_UNIT_DISPLACEMENT);
    }
    if (usesReflection) {
      maxOffset = Math.max(maxOffset, TEXTURE_UNIT_REFLECTION);
    }
    if (maxOffset > MAX_TEXTURE_UNIT_OFFSET) {
      throw new Error(ERROR_TEXTURE_UNITS_LIMIT);
    }
    const highestUnitIndex = this.#textureUnitIndex + maxOffset;
    if (highestUnitIndex >= maxUnits) {
      throw new Error(ERROR_TEXTURE_UNITS_LIMIT);
    }
  }
};

// core/loaders/obj-mtl/material-name-normalizer.js
var CARRIAGE_RETURN_REGEX = /\r+/gu;
var WHITESPACE_REGEX = /\s+/gu;
var QUOTE_TOKEN = '"';
var BACKSLASH_REGEX = /\\/gu;
var PATH_SEPARATOR = "/";
var EMPTY_STRING = "";
var SECOND_INDEX3 = 1;
var SPACE_SEPARATOR = " ";
var ERROR_MATERIAL_NAME_TYPE = "`MaterialNameNormalizer.normalize` expects `name` as a string.";
var MaterialNameNormalizer = class {
  /**
   * Normalizes a material name by: trimming, unquoting, collapsing spaces and fixing separators.
   *
   * @param {string} name - Raw material name input.
   * @returns {string}    - Normalized material name.
   * @throws {TypeError} When name is not a string.
   */
  static normalize(name) {
    if (typeof name !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_MATERIAL_NAME_TYPE);
    }
    let normalized = name.replace(CARRIAGE_RETURN_REGEX, EMPTY_STRING).trim();
    if (normalized.startsWith(QUOTE_TOKEN) && normalized.endsWith(QUOTE_TOKEN) && normalized.length > SECOND_INDEX3) {
      normalized = normalized.slice(SECOND_INDEX3, normalized.length - SECOND_INDEX3);
    }
    normalized = normalized.replace(BACKSLASH_REGEX, PATH_SEPARATOR);
    normalized = normalized.replace(WHITESPACE_REGEX, SPACE_SEPARATOR).trim();
    return normalized;
  }
};

// core/loaders/obj-mtl/obj-parser.js
var COMMENT_TOKEN = "#";
var OBJ_VERTEX_TOKEN = "v";
var OBJ_TEXCOORD_TOKEN = "vt";
var OBJ_NORMAL_TOKEN = "vn";
var OBJ_FACE_TOKEN = "f";
var OBJ_POINT_TOKEN = "p";
var OBJ_LINE_TOKEN = "l";
var OBJ_MATERIAL_LIB_TOKEN = "mtllib";
var OBJ_USE_MATERIAL_TOKEN = "usemtl";
var OBJ_OBJECT_TOKEN = "o";
var OBJ_GROUP_TOKEN = "g";
var OBJ_SMOOTHING_TOKEN = "s";
var OBJ_FACE_ATTRIBUTE_SEPARATOR = "/";
var DEFAULT_MATERIAL_NAME = "default";
var DEFAULT_OBJECT_NAME = "default";
var DEFAULT_GROUP_NAME = "default";
var SPACE_SEPARATOR2 = " ";
var EMPTY_STRING2 = "";
var LINE_SPLIT_REGEX = /\s+/u;
var LINE_BREAK_REGEX = /\r?\n/u;
var QUOTE_TOKEN2 = '"';
var NOT_FOUND_INDEX = -1;
var FACE_MIN_VERTEX_COUNT = 3;
var LINE_MIN_VERTEX_COUNT2 = 2;
var POSITION_COMPONENT_COUNT7 = 3;
var UV_COMPONENT_COUNT3 = 2;
var NORMAL_COMPONENT_COUNT3 = 3;
var COLOR_COMPONENT_COUNT7 = 3;
var FIRST_INDEX3 = 0;
var SECOND_INDEX4 = 1;
var THIRD_INDEX3 = 2;
var FOURTH_INDEX = 3;
var COLOR_START_INDEX = POSITION_COMPONENT_COUNT7 + SECOND_INDEX4;
var DEFAULT_SMOOTHING_GROUP = 0;
var SMOOTHING_OFF_TOKEN = "off";
var SMOOTHING_ON_TOKEN = "on";
var OBJ_INDEX_OFFSET = 1;
var OBJ_INDEX_NOT_PROVIDED2 = -1;
var OBJ_INDEX_ZERO = 0;
var DECIMAL_RADIX = 10;
var FAN_FIRST_VERTEX_INDEX = 0;
var NEXT_FACE_VERTEX_OFFSET = 1;
var CHUNK_KEY_SEPARATOR = "::";
var ERROR_MISSING_POSITION_INDEX = "OBJ face vertex is missing the position index.";
var ERROR_OBJ_TEXT_TYPE = "`ObjParser.parse` expects `objText` as a string.";
var DEFAULT_VERTEX_COLOR2 = [1, 1, 1];
var ObjParser = class _ObjParser {
  /**
   * Parsed positions array.
   *
   * @type {number[]}
   * @private
   */
  #positions = [];
  /**
   * Parsed UV array.
   *
   * @type {number[]}
   * @private
   */
  #uvs = [];
  /**
   * Parsed normals array.
   *
   * @type {number[]}
   * @private
   */
  #normals = [];
  /**
   * Parsed vertex colors array.
   *
   * @type {number[]}
   * @private
   */
  #colors = [];
  /**
   * Parsed material library references.
   *
   * @type {string[]}
   * @private
   */
  #materialLibraries = [];
  /**
   * Parsed objects.
   *
   * @type {ObjParsedObject[]}
   * @private
   */
  #objects = [];
  /**
   * Flag indicating whether any vertex colors are present.
   *
   * @type {boolean}
   * @private
   */
  #hasVertexColors = false;
  /**
   * Current object being populated.
   *
   * @type {ObjParsedObject | null}
   * @private
   */
  #currentObject = null;
  /**
   * Current group being populated.
   *
   * @type {ObjParsedGroup | null}
   * @private
   */
  #currentGroup = null;
  /**
   * Current material name.
   *
   * @type {string}
   * @private
   */
  #currentMaterialName = DEFAULT_MATERIAL_NAME;
  /**
   * Current smoothing group.
   *
   * @type {number}
   * @private
   */
  #currentSmoothingGroup = DEFAULT_SMOOTHING_GROUP;
  /**
   * Parses the OBJ text into structured data.
   *
   * @param {string} objText  - OBJ file contents.
   * @returns {ObjParsedData} - Parsed OBJ data including geometry arrays, material libraries, and `object/group/chunk` structure.
   * @throws {TypeError} When `objText` is not a string.
   */
  parse(objText) {
    if (typeof objText !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_OBJ_TEXT_TYPE);
    }
    this.#resetState();
    const lines = objText.split(LINE_BREAK_REGEX);
    for (const line of lines) {
      this.#parseLine(line);
    }
    return {
      materialLibraries: this.#materialLibraries,
      positions: this.#positions,
      uvs: this.#uvs,
      normals: this.#normals,
      colors: this.#hasVertexColors ? this.#colors : [],
      hasVertexColors: this.#hasVertexColors,
      objects: this.#objects
    };
  }
  /**
   * Resets the internal parsing state.
   *
   * @returns {void}
   * @private
   */
  #resetState() {
    this.#positions = [];
    this.#uvs = [];
    this.#normals = [];
    this.#colors = [];
    this.#materialLibraries = [];
    this.#objects = [];
    this.#hasVertexColors = false;
    this.#currentMaterialName = DEFAULT_MATERIAL_NAME;
    this.#currentSmoothingGroup = DEFAULT_SMOOTHING_GROUP;
    this.#currentObject = this.#getOrCreateObject(DEFAULT_OBJECT_NAME);
    this.#currentGroup = this.#getOrCreateGroup(this.#currentObject, DEFAULT_GROUP_NAME);
    this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
  }
  /**
   * Parses a single OBJ line.
   *
   * @param {string} line - Input line.
   * @returns {void}
   * @private
   */
  #parseLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
      return;
    }
    const parts = trimmed.split(LINE_SPLIT_REGEX);
    const keyword = parts[FIRST_INDEX3];
    switch (keyword) {
      case OBJ_VERTEX_TOKEN:
        this.#parseVertex(parts);
        break;
      case OBJ_TEXCOORD_TOKEN:
        this.#parseUv(parts);
        break;
      case OBJ_NORMAL_TOKEN:
        this.#parseNormal(parts);
        break;
      case OBJ_MATERIAL_LIB_TOKEN:
        this.#parseMaterialLibrary(trimmed);
        break;
      case OBJ_USE_MATERIAL_TOKEN:
        this.#parseUseMaterial(parts);
        break;
      case OBJ_OBJECT_TOKEN:
        this.#parseObject(parts);
        break;
      case OBJ_GROUP_TOKEN:
        this.#parseGroup(parts);
        break;
      case OBJ_SMOOTHING_TOKEN:
        this.#parseSmoothing(parts);
        break;
      case OBJ_FACE_TOKEN:
        this.#parseFace(parts);
        break;
      case OBJ_POINT_TOKEN:
        this.#parsePoints(parts);
        break;
      case OBJ_LINE_TOKEN:
        this.#parseLineElement(parts);
        break;
      default:
        break;
    }
  }
  /**
   * Parses a vertex position (and optional vertex color).
   *
   * @param {string[]} parts - Split line parts.
   * @returns {void}
   * @private
   */
  #parseVertex(parts) {
    const position = _ObjParser.#parseFloatTriplet(parts, POSITION_COMPONENT_COUNT7);
    this.#positions.push(...position);
    if (parts.length >= COLOR_START_INDEX + COLOR_COMPONENT_COUNT7) {
      if (!this.#hasVertexColors) {
        this.#hasVertexColors = true;
        this.#fillMissingColors();
      }
      const color = _ObjParser.#parseFloatTripletFromOffset(parts, COLOR_START_INDEX);
      this.#colors.push(...color);
      return;
    }
    if (this.#hasVertexColors) {
      const defaultColor = _ObjParser.#getDefaultVertexColor();
      this.#colors.push(...defaultColor);
    }
  }
  /**
   * Parses a UV coordinate.
   *
   * @param {string[]} parts - Split line parts.
   * @returns {void}
   * @private
   */
  #parseUv(parts) {
    const uv = _ObjParser.#parseFloatPair(parts);
    this.#uvs.push(...uv);
  }
  /**
   * Parses a vertex normal.
   *
   * @param {string[]} parts - Split line parts.
   * @returns {void}
   * @private
   */
  #parseNormal(parts) {
    const normal = _ObjParser.#parseFloatTriplet(parts, NORMAL_COMPONENT_COUNT3);
    this.#normals.push(...normal);
  }
  /**
   * Parses `mtllib` line and stores all referenced files.
   *
   * @param {string} line - Full line text.
   * @returns {void}
   * @private
   */
  #parseMaterialLibrary(line) {
    const tokens = _ObjParser.#splitTokens(line);
    if (tokens.length <= SECOND_INDEX4) {
      return;
    }
    const libraries = tokens.slice(SECOND_INDEX4);
    for (const library of libraries) {
      if (library) {
        this.#materialLibraries.push(library);
      }
    }
  }
  /**
   * Parses `usemtl` line and sets current material.
   *
   * @param {string[]} parts - Split line parts.
   * @returns {void}
   * @private
   */
  #parseUseMaterial(parts) {
    const rawMaterialName = parts.slice(SECOND_INDEX4).join(SPACE_SEPARATOR2) || DEFAULT_MATERIAL_NAME;
    const normalizedName = MaterialNameNormalizer.normalize(rawMaterialName);
    this.#currentMaterialName = normalizedName || DEFAULT_MATERIAL_NAME;
    this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
  }
  /**
   * Parses `o` line and sets current object.
   *
   * @param {string[]} parts - Split line parts.
   * @returns {void}
   * @private
   */
  #parseObject(parts) {
    const objectName = parts.slice(SECOND_INDEX4).join(SPACE_SEPARATOR2) || DEFAULT_OBJECT_NAME;
    this.#currentObject = this.#getOrCreateObject(objectName);
    this.#currentGroup = this.#getOrCreateGroup(this.#currentObject, DEFAULT_GROUP_NAME);
    this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
  }
  /**
   * Parses `g` line and sets current group.
   *
   * @param {string[]} parts - Split line parts.
   * @returns {void}
   * @private
   */
  #parseGroup(parts) {
    const groupName = parts.slice(SECOND_INDEX4).join(SPACE_SEPARATOR2) || DEFAULT_GROUP_NAME;
    this.#currentGroup = this.#getOrCreateGroup(this.#currentObject, groupName);
    this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
  }
  /**
   * Parses the smoothing group line.
   *
   * @param {string[]} parts - Split line parts.
   * @returns {void}
   * @private
   */
  #parseSmoothing(parts) {
    const smoothingValue = parts[SECOND_INDEX4] || SMOOTHING_OFF_TOKEN;
    if (smoothingValue === SMOOTHING_OFF_TOKEN || smoothingValue === String(DEFAULT_SMOOTHING_GROUP)) {
      this.#currentSmoothingGroup = DEFAULT_SMOOTHING_GROUP;
    } else if (smoothingValue === SMOOTHING_ON_TOKEN) {
      this.#currentSmoothingGroup = OBJ_INDEX_OFFSET;
    } else {
      const parsed = Number.parseInt(smoothingValue, DECIMAL_RADIX);
      this.#currentSmoothingGroup = Number.isFinite(parsed) ? parsed : OBJ_INDEX_OFFSET;
    }
    this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
  }
  /**
   * Parses a face line and appends the triangles to current chunk.
   *
   * @param {string[]} parts - Face line parts.
   * @returns {void}
   * @throws {Error} When position index is missing.
   * @private
   */
  #parseFace(parts) {
    const faceVertices = parts.slice(SECOND_INDEX4);
    if (faceVertices.length < FACE_MIN_VERTEX_COUNT) {
      return;
    }
    const vertices = faceVertices.map((vertex) => this.#resolveFaceVertex(vertex));
    const chunk = this.#getOrCreateMaterialChunk(
      this.#currentGroup,
      this.#currentMaterialName,
      this.#currentSmoothingGroup
    );
    for (let index = SECOND_INDEX4; index < vertices.length - NEXT_FACE_VERTEX_OFFSET; index += NEXT_FACE_VERTEX_OFFSET) {
      const firstVertex = vertices[FAN_FIRST_VERTEX_INDEX];
      const secondVertex = vertices[index];
      const thirdVertex = vertices[index + NEXT_FACE_VERTEX_OFFSET];
      chunk.triangles.push([firstVertex, secondVertex, thirdVertex]);
    }
  }
  /**
   * Parses a point line and appends indices to current chunk.
   *
   * @param {string[]} parts - Point line parts.
   * @returns {void}
   * @private
   */
  #parsePoints(parts) {
    const vertices = parts.slice(SECOND_INDEX4);
    if (!vertices.length) {
      return;
    }
    const chunk = this.#getOrCreateMaterialChunk(
      this.#currentGroup,
      this.#currentMaterialName,
      this.#currentSmoothingGroup
    );
    for (const vertex of vertices) {
      const positionIndex = this.#resolveVertexPositionIndex(vertex);
      if (positionIndex !== OBJ_INDEX_NOT_PROVIDED2) {
        chunk.points.push(positionIndex);
      }
    }
  }
  /**
   * Parses a line definition and appends it to current chunk.
   *
   * @param {string[]} parts - Line line parts.
   * @returns {void}
   * @private
   */
  #parseLineElement(parts) {
    const vertices = parts.slice(SECOND_INDEX4);
    if (vertices.length < LINE_MIN_VERTEX_COUNT2) {
      return;
    }
    const indices = [];
    for (const vertex of vertices) {
      const positionIndex = this.#resolveVertexPositionIndex(vertex);
      if (positionIndex !== OBJ_INDEX_NOT_PROVIDED2) {
        indices.push(positionIndex);
      }
    }
    if (indices.length < LINE_MIN_VERTEX_COUNT2) {
      return;
    }
    const chunk = this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
    chunk.lines.push(indices);
  }
  /**
   * Resolves a face vertex definition into the indices.
   *
   * @param {string} vertexData - Face vertex string.
   * @returns {ObjFaceVertex}   - Resolved face vertex indices.
   * @throws {Error} When position index is missing.
   * @private
   */
  #resolveFaceVertex(vertexData) {
    const indices = vertexData.split(OBJ_FACE_ATTRIBUTE_SEPARATOR);
    const positionIndex = _ObjParser.#parseIndex(indices[FIRST_INDEX3], this.#positions.length / POSITION_COMPONENT_COUNT7);
    const uvIndex = _ObjParser.#parseIndex(indices[SECOND_INDEX4], this.#uvs.length / UV_COMPONENT_COUNT3);
    const normalIndex = _ObjParser.#parseIndex(indices[THIRD_INDEX3], this.#normals.length / NORMAL_COMPONENT_COUNT3);
    if (positionIndex === OBJ_INDEX_NOT_PROVIDED2) {
      throw new Error(ERROR_MISSING_POSITION_INDEX);
    }
    return {
      positionIndex,
      uvIndex,
      normalIndex
    };
  }
  /**
   * Resolves a vertex token into a position index.
   *
   * @param {string} vertexData - Vertex data string.
   * @returns {number}          - Resolved position index or `-1`.
   * @private
   */
  #resolveVertexPositionIndex(vertexData) {
    const indices = vertexData.split(OBJ_FACE_ATTRIBUTE_SEPARATOR);
    return _ObjParser.#parseIndex(indices[FIRST_INDEX3], this.#positions.length / POSITION_COMPONENT_COUNT7);
  }
  /**
   * Creates or returns a parsed object entry.
   *
   * @param {string} name       - Object name.
   * @returns {ObjParsedObject} - Existing or newly created object entry for the given name.
   * @private
   */
  #getOrCreateObject(name) {
    const targetName = name || DEFAULT_OBJECT_NAME;
    const existing = this.#objects.find((object2) => object2.name === targetName);
    if (existing) {
      return existing;
    }
    const object = {
      name: targetName,
      groups: [],
      groupMap: /* @__PURE__ */ new Map()
    };
    this.#objects.push(object);
    return object;
  }
  /**
   * Creates or returns a parsed group entry.
   *
   * @param {ObjParsedObject} object - Target object.
   * @param {string} name            - Group name.
   * @returns {ObjParsedGroup}       - Existing or newly created group entry for the given name within the object.
   * @private
   */
  #getOrCreateGroup(object, name) {
    const targetName = name || DEFAULT_GROUP_NAME;
    if (object.groupMap.has(targetName)) {
      return object.groupMap.get(targetName);
    }
    const group = {
      name: targetName,
      materialChunks: [],
      chunkMap: /* @__PURE__ */ new Map()
    };
    object.groups.push(group);
    object.groupMap.set(targetName, group);
    return group;
  }
  /**
   * Creates or returns a material chunk for a group.
   *
   * @param {ObjParsedGroup} group  - Target group.
   * @param {string} materialName   - Material name.
   * @param {number} smoothingGroup - Smoothing group.
   * @returns {ObjMaterialChunk}    - Existing or newly created material chunk for the material name and the smoothing group.
   * @private
   */
  #getOrCreateMaterialChunk(group, materialName, smoothingGroup) {
    const materialKey = materialName || DEFAULT_MATERIAL_NAME;
    const key = materialKey + CHUNK_KEY_SEPARATOR + String(smoothingGroup);
    if (group.chunkMap.has(key)) {
      return group.chunkMap.get(key);
    }
    const chunk = {
      materialName: materialKey,
      smoothingGroup,
      triangles: [],
      points: [],
      lines: []
    };
    group.materialChunks.push(chunk);
    group.chunkMap.set(key, chunk);
    return chunk;
  }
  /**
   * Fills missing colors with defaults for already parsed vertices.
   *
   * @returns {void}
   * @private
   */
  #fillMissingColors() {
    const vertexCount = this.#positions.length / POSITION_COMPONENT_COUNT7;
    const defaultColor = _ObjParser.#getDefaultVertexColor();
    for (let index = this.#colors.length / COLOR_COMPONENT_COUNT7; index < vertexCount; index += NEXT_FACE_VERTEX_OFFSET) {
      this.#colors.push(...defaultColor);
    }
  }
  /**
   * Parses the OBJ index string into the zero-based index.
   *
   * @param {string} value     - OBJ index string.
   * @param {number} maxLength - Maximum element count.
   * @returns {number}         - Zero-based index, resolved from the OBJ indexing rules, or `-1`, when missing/invalid.
   * @private
   */
  static #parseIndex(value, maxLength) {
    if (!value) {
      return OBJ_INDEX_NOT_PROVIDED2;
    }
    const indexValue = Number.parseInt(value, DECIMAL_RADIX);
    if (maxLength === DEFAULT_SMOOTHING_GROUP) {
      return OBJ_INDEX_NOT_PROVIDED2;
    }
    if (Number.isNaN(indexValue) || indexValue === OBJ_INDEX_ZERO) {
      return OBJ_INDEX_NOT_PROVIDED2;
    }
    if (indexValue > DEFAULT_SMOOTHING_GROUP) {
      return indexValue - OBJ_INDEX_OFFSET;
    }
    return maxLength + indexValue;
  }
  /**
   * Parses the float triplet from the line parts.
   *
   * @param {string[]} parts  - Line parts.
   * @param {number} expected - Expected component count.
   * @returns {number[]}      - Parsed float triplet `[x, y, z]` (returns zeros, when components are missing).
   * @private
   */
  static #parseFloatTriplet(parts, expected) {
    if (parts.length <= expected) {
      return [DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP];
    }
    return [
      Number.parseFloat(parts[SECOND_INDEX4]),
      Number.parseFloat(parts[THIRD_INDEX3]),
      Number.parseFloat(parts[FOURTH_INDEX])
    ];
  }
  /**
   * Parses the float pair from the line parts.
   *
   * @param {string[]} parts - Line parts.
   * @returns {number[]}     - Parsed float pair `[u, v]` (returns zeros, when components are missing).
   * @private
   */
  static #parseFloatPair(parts) {
    if (parts.length <= THIRD_INDEX3) {
      return [DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP];
    }
    return [
      Number.parseFloat(parts[SECOND_INDEX4]),
      Number.parseFloat(parts[THIRD_INDEX3])
    ];
  }
  /**
   * Parses the float triplet starting from a specific offset.
   *
   * @param {string[]} parts - Line parts.
   * @param {number} offset  - Offset index for the first component.
   * @returns {number[]}     - Parsed float triplet starting at `offset` (returns zeros, when components are missing).
   * @private
   */
  static #parseFloatTripletFromOffset(parts, offset) {
    if (parts.length <= offset + THIRD_INDEX3) {
      return [DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP];
    }
    return [
      Number.parseFloat(parts[offset]),
      Number.parseFloat(parts[offset + SECOND_INDEX4]),
      Number.parseFloat(parts[offset + THIRD_INDEX3])
    ];
  }
  /**
   * Splits a line into tokens, while respecting quotes.
   *
   * @param {string} line - Line to split.
   * @returns {string[]}  - Tokenized line parts with the quoted substrings, preserved as single tokens.
   * @private
   */
  static #splitTokens(line) {
    let sanitized = line;
    const commentIndex = sanitized.indexOf(COMMENT_TOKEN);
    if (commentIndex !== NOT_FOUND_INDEX) {
      sanitized = sanitized.slice(FIRST_INDEX3, commentIndex);
    }
    sanitized = sanitized.trim();
    if (!sanitized) {
      return [];
    }
    const tokens = [];
    let currentToken = EMPTY_STRING2;
    let inQuotes = false;
    for (const char of sanitized) {
      if (char === QUOTE_TOKEN2) {
        inQuotes = !inQuotes;
        continue;
      }
      if (!inQuotes && LINE_SPLIT_REGEX.test(char)) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = EMPTY_STRING2;
        }
        continue;
      }
      currentToken += char;
    }
    if (currentToken) {
      tokens.push(currentToken);
    }
    return tokens;
  }
  /**
   * Returns default vertex color (white).
   *
   * @returns {number[]} - Default vertex color triplet (the white color).
   * @private
   */
  static #getDefaultVertexColor() {
    return DEFAULT_VERTEX_COLOR2;
  }
};

// core/loaders/obj-mtl/mtl-parser.js
var COMMENT_TOKEN2 = "#";
var MTL_NEW_MATERIAL_TOKEN = "newmtl";
var MTL_DIFFUSE_COLOR_TOKEN = "Kd";
var MTL_AMBIENT_COLOR_TOKEN = "Ka";
var MTL_SPECULAR_COLOR_TOKEN = "Ks";
var MTL_EMISSIVE_COLOR_TOKEN = "Ke";
var MTL_SPECULAR_EXPONENT_TOKEN = "Ns";
var MTL_OPTICAL_DENSITY_TOKEN = "Ni";
var MTL_ILLUMINATION_MODEL_TOKEN = "illum";
var MTL_DIFFUSE_MAP_TOKEN = "map_Kd";
var MTL_AMBIENT_MAP_TOKEN = "map_Ka";
var MTL_SPECULAR_MAP_TOKEN = "map_Ks";
var MTL_ALPHA_MAP_TOKEN = "map_d";
var MTL_BUMP_MAP_TOKEN = "bump";
var MTL_BUMP_MAP_ALT_TOKEN = "map_Bump";
var MTL_BUMP_MAP_LOWER_TOKEN = "map_bump";
var MTL_DISPLACEMENT_MAP_TOKEN = "disp";
var MTL_REFLECTION_MAP_TOKEN = "refl";
var MTL_OPACITY_TOKEN = "d";
var MTL_TRANSPARENCY_TOKEN = "Tr";
var MTL_MAP_OPTION_SCALE = "-s";
var MTL_MAP_OPTION_OFFSET = "-o";
var MTL_MAP_OPTION_CLAMP = "-clamp";
var MTL_MAP_OPTION_BUMP_MULTIPLIER = "-bm";
var MTL_MAP_OPTION_BLENDU = "-blendu";
var MTL_MAP_OPTION_BLENDV = "-blendv";
var MTL_MAP_OPTION_IMFCHAN = "-imfchan";
var MTL_MAP_OPTION_MM = "-mm";
var MTL_MAP_OPTION_TEXRES = "-texres";
var MTL_MAP_OPTION_TYPE = "-type";
var DEFAULT_MAP_OFFSET = new Float32Array([0, 0]);
var DEFAULT_MAP_SCALE = new Float32Array([1, 1]);
var DEFAULT_MAP_CLAMP = false;
var DEFAULT_BUMP_MULTIPLIER2 = 1;
var CLAMP_ON_TOKEN = "on";
var CLAMP_OFF_TOKEN = "off";
var CLAMP_ON_NUMERIC_TOKEN = "1";
var CLAMP_OFF_NUMERIC_TOKEN = "0";
var MTL_MAP_UV_COMPONENTS = 2;
var MTL_MAP_OPTIONAL_VECTOR_COMPONENTS = 1;
var MTL_MAP_BLEND_COMPONENTS = 1;
var MTL_MAP_IMFCHAN_COMPONENTS = 1;
var MTL_MAP_MM_COMPONENTS = 2;
var MTL_MAP_TEXRES_COMPONENTS = 1;
var MTL_MAP_TYPE_COMPONENTS = 1;
var MTL_MAP_SCALAR_COMPONENTS = 1;
var COLOR_COMPONENT_COUNT8 = 3;
var DEFAULT_OPACITY3 = 1;
var DEFAULT_DIFFUSE_COLOR3 = new Float32Array([1, 1, 1]);
var DEFAULT_SPECULAR_COLOR3 = new Float32Array([0, 0, 0]);
var DEFAULT_AMBIENT_COLOR2 = new Float32Array([0, 0, 0]);
var DEFAULT_EMISSIVE_COLOR2 = new Float32Array([0, 0, 0]);
var ZERO_VALUE15 = 0;
var EMPTY_STRING3 = "";
var SPACE_SEPARATOR3 = " ";
var LINE_SPLIT_REGEX2 = /\s+/u;
var LINE_BREAK_REGEX2 = /\r?\n/u;
var MAP_FLOAT_TOKEN_REGEX = /^[+-]?(?:\d+\.?\d*|\d*\.?\d+)(?:[eE][+-]?\d+)?$/u;
var HYPHEN_SEPARATOR = "-";
var QUOTE_TOKEN3 = '"';
var NOT_FOUND_INDEX2 = -1;
var FIRST_INDEX4 = 0;
var SECOND_INDEX5 = 1;
var THIRD_INDEX4 = 2;
var FOURTH_INDEX2 = 3;
var DECIMAL_RADIX2 = 10;
var ERROR_MTL_TEXT_TYPE = "`MtlParser.parse` expects `mtlText` as a string.";
var MtlParser = class _MtlParser {
  /**
   * Parses the MTL text into the material definitions.
   *
   * @param {string} mtlText                   - MTL file contents.
   * @returns {Map<string, ParsedMtlMaterial>} - Map of parsed materials keyed by the material name.
   * @throws {TypeError} When mtlText is not a string.
   */
  parse(mtlText) {
    if (typeof mtlText !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_MTL_TEXT_TYPE);
    }
    const materials = /* @__PURE__ */ new Map();
    const lines = mtlText.split(LINE_BREAK_REGEX2);
    let currentMaterial = null;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(COMMENT_TOKEN2)) {
        continue;
      }
      const parts = trimmed.split(LINE_SPLIT_REGEX2);
      const keyword = parts[FIRST_INDEX4];
      switch (keyword) {
        case MTL_NEW_MATERIAL_TOKEN: {
          const rawName = parts.slice(SECOND_INDEX5).join(SPACE_SEPARATOR3);
          const name = rawName ? MaterialNameNormalizer.normalize(rawName) : EMPTY_STRING3;
          if (!name) {
            currentMaterial = null;
            break;
          }
          currentMaterial = {
            name,
            diffuseColor: new Float32Array(DEFAULT_DIFFUSE_COLOR3),
            ambientColor: new Float32Array(DEFAULT_AMBIENT_COLOR2),
            specularColor: new Float32Array(DEFAULT_SPECULAR_COLOR3),
            emissiveColor: new Float32Array(DEFAULT_EMISSIVE_COLOR2),
            diffuseMap: null,
            ambientMap: null,
            specularMap: null,
            alphaMap: null,
            bumpMap: null,
            displacementMap: null,
            reflectionMap: null,
            specularExponent: null,
            opticalDensity: null,
            illuminationModel: null,
            opacity: DEFAULT_OPACITY3
          };
          materials.set(name, currentMaterial);
          break;
        }
        case MTL_AMBIENT_COLOR_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const color = _MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT8);
          currentMaterial.ambientColor.set(color);
          break;
        }
        case MTL_DIFFUSE_COLOR_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const color = _MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT8);
          currentMaterial.diffuseColor.set(color);
          break;
        }
        case MTL_SPECULAR_COLOR_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const color = _MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT8);
          currentMaterial.specularColor.set(color);
          break;
        }
        case MTL_EMISSIVE_COLOR_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const color = _MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT8);
          currentMaterial.emissiveColor.set(color);
          break;
        }
        case MTL_SPECULAR_EXPONENT_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          currentMaterial.specularExponent = _MtlParser.#parseFloatValue(parts[SECOND_INDEX5]);
          break;
        }
        case MTL_OPTICAL_DENSITY_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          currentMaterial.opticalDensity = _MtlParser.#parseFloatValue(parts[SECOND_INDEX5]);
          break;
        }
        case MTL_ILLUMINATION_MODEL_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const illumValue = Number.parseInt(parts[SECOND_INDEX5], DECIMAL_RADIX2);
          currentMaterial.illuminationModel = Number.isFinite(illumValue) ? illumValue : null;
          break;
        }
        case MTL_DIFFUSE_MAP_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapData = _MtlParser.#parseMtlMapLine(trimmed);
          currentMaterial.diffuseMap = mapData;
          break;
        }
        case MTL_AMBIENT_MAP_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapData = _MtlParser.#parseMtlMapLine(trimmed);
          currentMaterial.ambientMap = mapData;
          break;
        }
        case MTL_SPECULAR_MAP_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapData = _MtlParser.#parseMtlMapLine(trimmed);
          currentMaterial.specularMap = mapData;
          break;
        }
        case MTL_ALPHA_MAP_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapData = _MtlParser.#parseMtlMapLine(trimmed);
          currentMaterial.alphaMap = mapData;
          break;
        }
        case MTL_BUMP_MAP_TOKEN:
        case MTL_BUMP_MAP_ALT_TOKEN:
        case MTL_BUMP_MAP_LOWER_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapData = _MtlParser.#parseMtlMapLine(trimmed);
          currentMaterial.bumpMap = mapData;
          break;
        }
        case MTL_DISPLACEMENT_MAP_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapData = _MtlParser.#parseMtlMapLine(trimmed);
          currentMaterial.displacementMap = mapData;
          break;
        }
        case MTL_REFLECTION_MAP_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const mapData = _MtlParser.#parseMtlMapLine(trimmed);
          currentMaterial.reflectionMap = mapData;
          break;
        }
        case MTL_OPACITY_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const value = _MtlParser.#parseFloatValue(parts[SECOND_INDEX5]);
          if (value !== null) {
            currentMaterial.opacity = value;
          }
          break;
        }
        case MTL_TRANSPARENCY_TOKEN: {
          if (!currentMaterial) {
            break;
          }
          const value = _MtlParser.#parseFloatValue(parts[SECOND_INDEX5]);
          if (value !== null) {
            currentMaterial.opacity = DEFAULT_OPACITY3 - value;
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
   * Parses a float triplet from line parts.
   *
   * @param {string[]} parts  - Line parts.
   * @param {number} expected - Expected component count.
   * @returns {number[]}      - Array of parsed float components, returns zeros when values are missing.
   * @private
   */
  static #parseFloatTriplet(parts, expected) {
    if (parts.length <= expected) {
      return [ZERO_VALUE15, ZERO_VALUE15, ZERO_VALUE15];
    }
    return [
      Number.parseFloat(parts[SECOND_INDEX5]),
      Number.parseFloat(parts[THIRD_INDEX4]),
      Number.parseFloat(parts[FOURTH_INDEX2])
    ];
  }
  /**
   * Parses a float value from string.
   *
   * @param {string} value    - String value.
   * @returns {number | null} - Parsed finite float value, or `null` when the input is empty or not a finite number.
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
   * Parses the texture map line and extracts the file path.
   *
   * @param {string} line                  - Full `map_*` line.
   * @returns {ParsedMtlTextureMap | null} - Parsed texture map data, or null when no path is found.
   * @private
   */
  static #parseMtlMapLine(line) {
    if (typeof line !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      return null;
    }
    let sanitized = line;
    const commentIndex = sanitized.indexOf(COMMENT_TOKEN2);
    if (commentIndex !== NOT_FOUND_INDEX2) {
      sanitized = sanitized.slice(FIRST_INDEX4, commentIndex);
    }
    sanitized = sanitized.trim();
    if (!sanitized) {
      return null;
    }
    const tokens = _MtlParser.#splitTokens(sanitized);
    if (tokens.length <= SECOND_INDEX5) {
      return null;
    }
    const mapData = _MtlParser.#createDefaultTextureMap();
    let index = SECOND_INDEX5;
    while (index < tokens.length) {
      const token = tokens[index];
      if (token.startsWith(HYPHEN_SEPARATOR)) {
        switch (token) {
          case MTL_MAP_OPTION_SCALE:
            index = _MtlParser.#consumeMapVectorOption(mapData.scale, tokens, index, DEFAULT_MAP_SCALE);
            break;
          case MTL_MAP_OPTION_OFFSET:
            index = _MtlParser.#consumeMapVectorOption(mapData.offset, tokens, index, DEFAULT_MAP_OFFSET);
            break;
          case MTL_MAP_OPTION_CLAMP:
            mapData.clamp = _MtlParser.#parseClampToken(tokens[index + SECOND_INDEX5]);
            index += MTL_MAP_SCALAR_COMPONENTS + SECOND_INDEX5;
            break;
          case MTL_MAP_OPTION_BUMP_MULTIPLIER:
            mapData.bumpMultiplier = _MtlParser.#parseFloatValue(tokens[index + SECOND_INDEX5]) ?? DEFAULT_BUMP_MULTIPLIER2;
            index += MTL_MAP_SCALAR_COMPONENTS + SECOND_INDEX5;
            break;
          case MTL_MAP_OPTION_BLENDU:
          case MTL_MAP_OPTION_BLENDV:
            index += MTL_MAP_BLEND_COMPONENTS + SECOND_INDEX5;
            break;
          case MTL_MAP_OPTION_IMFCHAN:
            index += MTL_MAP_IMFCHAN_COMPONENTS + SECOND_INDEX5;
            break;
          case MTL_MAP_OPTION_MM:
            index += MTL_MAP_MM_COMPONENTS + SECOND_INDEX5;
            break;
          case MTL_MAP_OPTION_TEXRES:
            index += MTL_MAP_TEXRES_COMPONENTS + SECOND_INDEX5;
            break;
          case MTL_MAP_OPTION_TYPE:
            index += MTL_MAP_TYPE_COMPONENTS + SECOND_INDEX5;
            break;
          default:
            index += SECOND_INDEX5;
            break;
        }
        continue;
      }
      const rawPath = tokens.slice(index).join(SPACE_SEPARATOR3);
      const path = _MtlParser.#normalizeQuotedPath(rawPath);
      if (!path) {
        return null;
      }
      mapData.path = path;
      return mapData;
    }
    return null;
  }
  /**
   * Splits the line into tokens, while respecting the quotes.
   *
   * @param {string} line - Line to split.
   * @returns {string[]}  - Tokenized line parts with quotes preserved as a single token.
   * @private
   */
  static #splitTokens(line) {
    const tokens = [];
    let currentToken = EMPTY_STRING3;
    let inQuotes = false;
    for (const char of line) {
      if (char === QUOTE_TOKEN3) {
        inQuotes = !inQuotes;
        continue;
      }
      if (!inQuotes && LINE_SPLIT_REGEX2.test(char)) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = EMPTY_STRING3;
        }
        continue;
      }
      currentToken += char;
    }
    if (currentToken) {
      tokens.push(currentToken);
    }
    return tokens;
  }
  /**
   * Creates a default texture map definition.
   *
   * @returns {ParsedMtlTextureMap} - Parsed texture map object with defaults.
   * @private
   */
  static #createDefaultTextureMap() {
    return {
      path: EMPTY_STRING3,
      offset: new Float32Array(DEFAULT_MAP_OFFSET),
      scale: new Float32Array(DEFAULT_MAP_SCALE),
      clamp: DEFAULT_MAP_CLAMP,
      bumpMultiplier: DEFAULT_BUMP_MULTIPLIER2
    };
  }
  /**
   * Applies the vector map option to the target array.
   *
   * @param {Float32Array} target   - Target vector array.
   * @param {string[]} tokens       - Parsed tokens.
   * @param {number} startIndex     - Index of the first component.
   * @param {Float32Array} fallback - Fallback vector.
   * @returns {void}
   * @private
   */
  static #applyMapVector(target, tokens, startIndex, fallback) {
    const x = _MtlParser.#parseMapFloatToken(tokens[startIndex], fallback[FIRST_INDEX4]);
    const y = _MtlParser.#parseMapFloatToken(tokens[startIndex + SECOND_INDEX5], fallback[SECOND_INDEX5]);
    target[FIRST_INDEX4] = x;
    target[SECOND_INDEX5] = y;
  }
  /**
   * Consumes map vector options (scale/offset), handling the optional third component.
   *
   * @param {Float32Array} target   - Target vector array.
   * @param {string[]} tokens       - Parsed tokens.
   * @param {number} optionIndex    - Index of the option token.
   * @param {Float32Array} fallback - Fallback vector.
   * @returns {number}              - Next index to continue parsing.
   * @private
   */
  static #consumeMapVectorOption(target, tokens, optionIndex, fallback) {
    const startIndex = optionIndex + SECOND_INDEX5;
    _MtlParser.#applyMapVector(target, tokens, startIndex, fallback);
    let nextIndex = startIndex + MTL_MAP_UV_COMPONENTS;
    const thirdToken = tokens[nextIndex];
    if (_MtlParser.#isNumericToken(thirdToken) && tokens.length > nextIndex + SECOND_INDEX5) {
      nextIndex += MTL_MAP_OPTIONAL_VECTOR_COMPONENTS;
    }
    return nextIndex;
  }
  /**
   * Parses a float token for map options.
   *
   * @param {string} token    - Token value.
   * @param {number} fallback - Fallback value.
   * @returns {number}        - Parsed float value or fallback.
   * @private
   */
  static #parseMapFloatToken(token, fallback) {
    if (!_MtlParser.#isNumericToken(token)) {
      return fallback;
    }
    const parsed = Number.parseFloat(token);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  /**
   * Checks if the token is a numeric value.
   *
   * @param {string} token - Token value.
   * @returns {boolean}    - True when token is numeric.
   * @private
   */
  static #isNumericToken(token) {
    if (typeof token !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      return false;
    }
    return MAP_FLOAT_TOKEN_REGEX.test(token);
  }
  /**
   * Parses clamp option token.
   *
   * @param {string} token - Clamp option token.
   * @returns {boolean}    - True when clamp should be enabled.
   * @private
   */
  static #parseClampToken(token) {
    if (!token) {
      return DEFAULT_MAP_CLAMP;
    }
    const normalized = token.toLowerCase();
    if (normalized === CLAMP_ON_TOKEN || normalized === CLAMP_ON_NUMERIC_TOKEN) {
      return true;
    }
    if (normalized === CLAMP_OFF_TOKEN || normalized === CLAMP_OFF_NUMERIC_TOKEN) {
      return false;
    }
    return DEFAULT_MAP_CLAMP;
  }
  /**
   * Normalizes a quoted path string.
   *
   * @param {string} path - Path token.
   * @returns {string}    - Normalized path without the wrapping quotes.
   * @private
   */
  static #normalizeQuotedPath(path) {
    if (typeof path !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      return EMPTY_STRING3;
    }
    let normalized = path.trim();
    if (normalized.startsWith(QUOTE_TOKEN3) && normalized.endsWith(QUOTE_TOKEN3) && normalized.length > SECOND_INDEX5) {
      normalized = normalized.slice(SECOND_INDEX5, normalized.length - SECOND_INDEX5);
    }
    return normalized.trim();
  }
};

// core/loaders/obj-mtl/obj-mtl-loader.js
var DEFAULT_TEXTURE_UNIT_INDEX4 = 0;
var DEFAULT_DIFFUSE_COLOR4 = new Float32Array([1, 1, 1]);
var DEFAULT_OPACITY4 = 1;
var EMPTY_STRING4 = "";
var DEFAULT_BASE_URL = EMPTY_STRING4;
var PATH_SEPARATOR2 = "/";
var DOT_SLASH_PREFIX = "./";
var BACKSLASH_SEPARATOR = "\\";
var BACKSLASH_REGEX2 = /\\/gu;
var MULTIPLE_SLASHES_REGEX = /\/{2,}/gu;
var ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/u;
var QUOTE_TOKEN4 = '"';
var NOT_FOUND_INDEX3 = -1;
var SECOND_INDEX6 = 1;
var BASE_PATH_SLICE_OFFSET = 1;
var ZERO_VALUE16 = 0;
var COLOR_COMPONENT_COUNT9 = 3;
var ENTRY_TYPE_MESH2 = "mesh";
var ENTRY_TYPE_POINTS2 = "points";
var ENTRY_TYPE_LINE2 = "line";
var ERROR_WEBGL_CONTEXT_TYPE6 = "`ObjMtlLoader` expects a `WebGL2RenderingContext`.";
var ERROR_OPTIONS_TYPE4 = "`ObjMtlLoader` expects options as a plain object.";
var ERROR_TEXTURE_UNIT_INDEX_TYPE2 = "`ObjMtlLoader` expects `textureUnitIndex` as a non-negative integer.";
var ERROR_DEFAULT_COLOR_TYPE2 = "`ObjMtlLoader` expects `defaultColor` as `number[]` or `Float32Array`.";
var ERROR_DEFAULT_COLOR_LENGTH2 = "`ObjMtlLoader` expects `defaultColor` to have 3 components.";
var ERROR_LOAD_OPTIONS_TYPE = "`ObjMtlLoader` expects load options as a plain object.";
var ERROR_OBJ_URL_TYPE = "`ObjMtlLoader.loadFromUrls` expects `objUrl` as a string.";
var ERROR_MTL_URL_TYPE = "`ObjMtlLoader.loadFromUrls` expects `mtlUrl` as a string, when provided.";
var ERROR_BASE_URL_TYPE = "`ObjMtlLoader.loadFromUrls` expects `baseUrl` as a string.";
var ERROR_TEXTURE_BASE_URL_TYPE = "`ObjMtlLoader.loadFromUrls` expects `textureBaseUrl` as a string, when provided.";
var ERROR_OBJ_FILE_TYPE = "`ObjMtlLoader.loadFromFiles` expects `objFile` as `File`.";
var ERROR_MTL_FILES_TYPE = "`ObjMtlLoader.loadFromFiles` expects `mtlFiles` as `Map`, when provided.";
var ERROR_ASSET_URL_MAP_TYPE = "`ObjMtlLoader.loadFromFiles` expects `assetUrlMap` as `Map`, when provided.";
var ERROR_FILES_BASE_URL_TYPE = "`ObjMtlLoader.loadFromFiles` expects `baseUrl` as a string.";
var ERROR_FILES_TEXTURE_BASE_URL_TYPE = "`ObjMtlLoader.loadFromFiles` expects `textureBaseUrl` as a string, when provided.";
var WARNING_MTL_MATERIAL_NOT_FOUND_PREFIX = "MTL material not found for usemtl=";
var WARNING_MTL_AVAILABLE_PREFIX = ", available: ";
var WARNING_MTL_AVAILABLE_START = "[";
var WARNING_MTL_AVAILABLE_END = "]";
var WARNING_MTL_AVAILABLE_SEPARATOR = ", ";
var WARNING_MTL_MISSING_DIFFUSE_PREFIX = "MTL diffuse map URL missing for path=";
var WARNING_MTL_MISSING_DIFFUSE_BASE_PREFIX = ", textureBaseUrl=";
var WARNING_MTL_LOAD_FAILED_PREFIX = "Failed to load MTL: ";
var WARNING_MTL_LOAD_FAILED_REASON_PREFIX = ", reason: ";
var WARNING_MTL_LOAD_FAILED_UNKNOWN = "Unknown error";
var WARNING_MTL_AVAILABLE_LIMIT = 5;
var WARNING_KEY_SEPARATOR = "::";
var ERROR_FETCH_FAILED_PREFIX = "Failed to fetch resource: ";
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
  #defaultColor = new Float32Array(DEFAULT_DIFFUSE_COLOR4);
  /**
   * OBJ parser instance.
   *
   * @type {ObjParser}
   * @private
   */
  #objParser;
  /**
   * MTL parser instance.
   *
   * @type {MtlParser}
   * @private
   */
  #mtlParser;
  /**
   * Geometry builder instance.
   *
   * @type {ObjGeometryBuilder}
   * @private
   */
  #geometryBuilder;
  /**
   * Material factory instance.
   *
   * @type {ObjMaterialFactory}
   * @private
   */
  #materialFactory;
  /**
   * Texture cache shared across materials.
   *
   * @type {MtlTextureCache}
   * @private
   */
  #textureCache;
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
   * @param {ObjMtlLoaderOptions} [options]       - Loader options.
   * @throws {TypeError} When inputs are invalid.
   */
  constructor(webglContext, options = {}) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE6);
    }
    if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
      throw new TypeError(ERROR_OPTIONS_TYPE4);
    }
    const {
      textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX4,
      defaultColor
    } = options;
    if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE16) {
      throw new TypeError(ERROR_TEXTURE_UNIT_INDEX_TYPE2);
    }
    if (defaultColor !== void 0) {
      if (!Array.isArray(defaultColor) && !(defaultColor instanceof Float32Array)) {
        throw new TypeError(ERROR_DEFAULT_COLOR_TYPE2);
      }
      if (defaultColor.length !== COLOR_COMPONENT_COUNT9) {
        throw new TypeError(ERROR_DEFAULT_COLOR_LENGTH2);
      }
      this.#defaultColor.set(defaultColor);
    }
    this.#webglContext = webglContext;
    this.#textureUnitIndex = textureUnitIndex;
    this.#textureCache = new MtlTextureCache(this.#webglContext);
    this.#objParser = new ObjParser();
    this.#mtlParser = new MtlParser();
    this.#geometryBuilder = new ObjGeometryBuilder(this.#webglContext);
    this.#materialFactory = new ObjMaterialFactory(this.#webglContext, {
      textureUnitIndex: this.#textureUnitIndex,
      defaultColor: this.#defaultColor,
      textureCache: this.#textureCache
    });
  }
  /**
   * Loads the OBJ/MTL assets from URLs and creates the meshes.
   *
   * @param {ObjMtlLoadFromUrlsOptions} options - Load options.
   * @returns {Promise<ObjMtlLoadResult>}
   * @throws {TypeError} When options are invalid.
   */
  async loadFromUrls(options = {}) {
    if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
      throw new TypeError(ERROR_LOAD_OPTIONS_TYPE);
    }
    const {
      objUrl,
      mtlUrl,
      baseUrl = DEFAULT_BASE_URL,
      textureBaseUrl
    } = options;
    if (typeof objUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_OBJ_URL_TYPE);
    }
    if (mtlUrl !== void 0 && typeof mtlUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_MTL_URL_TYPE);
    }
    if (typeof baseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_BASE_URL_TYPE);
    }
    if (textureBaseUrl !== void 0 && typeof textureBaseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_TEXTURE_BASE_URL_TYPE);
    }
    const objText = await _ObjMtlLoader.#fetchText(objUrl);
    const objData = this.#objParser.parse(objText);
    const resolvedBaseUrl = baseUrl || _ObjMtlLoader.#getBasePath(objUrl);
    const mtlData = /* @__PURE__ */ new Map();
    const mtlBaseUrl = baseUrl || resolvedBaseUrl;
    if (mtlUrl) {
      const resolvedMtlUrl = _ObjMtlLoader.#resolvePath(mtlBaseUrl, mtlUrl);
      try {
        const mtlText = await _ObjMtlLoader.#fetchText(resolvedMtlUrl);
        const parsedMtl = this.#mtlParser.parse(mtlText);
        for (const [name, material] of parsedMtl.entries()) {
          mtlData.set(name, material);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : WARNING_MTL_LOAD_FAILED_UNKNOWN;
        console.warn(`${WARNING_MTL_LOAD_FAILED_PREFIX}${resolvedMtlUrl}${WARNING_MTL_LOAD_FAILED_REASON_PREFIX}${errorMessage}`);
      }
    }
    if (!mtlUrl && objData.materialLibraries.length > ZERO_VALUE16) {
      for (const library of objData.materialLibraries) {
        if (!library) {
          continue;
        }
        const resolvedMtlUrl = _ObjMtlLoader.#resolvePath(resolvedBaseUrl, library);
        try {
          const mtlText = await _ObjMtlLoader.#fetchText(resolvedMtlUrl);
          const parsedMtl = this.#mtlParser.parse(mtlText);
          for (const [name, material] of parsedMtl.entries()) {
            mtlData.set(name, material);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : WARNING_MTL_LOAD_FAILED_UNKNOWN;
          console.warn(`${WARNING_MTL_LOAD_FAILED_PREFIX}${resolvedMtlUrl}${WARNING_MTL_LOAD_FAILED_REASON_PREFIX}${errorMessage}`);
        }
      }
    }
    const resolvedTextureBase = textureBaseUrl || resolvedBaseUrl;
    return this.#buildMeshes(objData, mtlData, resolvedTextureBase);
  }
  /**
   * Loads OBJ/MTL assets from the local `File` objects.
   *
   * @param {ObjMtlLoadFromFilesOptions} options - Load options.
   * @returns {Promise<ObjMtlLoadResult>}        - Promise, that resolves with the created scene root and all created assets.
   * @throws {TypeError} When options are invalid.
   */
  async loadFromFiles(options = {}) {
    if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
      throw new TypeError(ERROR_LOAD_OPTIONS_TYPE);
    }
    const {
      objFile,
      mtlFiles = /* @__PURE__ */ new Map(),
      assetUrlMap,
      baseUrl = DEFAULT_BASE_URL,
      textureBaseUrl
    } = options;
    if (!(objFile instanceof File)) {
      throw new TypeError(ERROR_OBJ_FILE_TYPE);
    }
    if (!(mtlFiles instanceof Map)) {
      throw new TypeError(ERROR_MTL_FILES_TYPE);
    }
    if (assetUrlMap !== void 0 && !(assetUrlMap instanceof Map)) {
      throw new TypeError(ERROR_ASSET_URL_MAP_TYPE);
    }
    if (typeof baseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_FILES_BASE_URL_TYPE);
    }
    if (textureBaseUrl !== void 0 && typeof textureBaseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      throw new TypeError(ERROR_FILES_TEXTURE_BASE_URL_TYPE);
    }
    const objText = await objFile.text();
    const objData = this.#objParser.parse(objText);
    const resolvedBaseUrl = baseUrl || DEFAULT_BASE_URL;
    const mtlData = /* @__PURE__ */ new Map();
    for (const library of objData.materialLibraries) {
      const mtlFile = _ObjMtlLoader.#getFileFromMap(mtlFiles, library);
      if (!mtlFile) {
        continue;
      }
      const mtlText = await mtlFile.text();
      const parsedMtl = this.#mtlParser.parse(mtlText);
      for (const [name, material] of parsedMtl.entries()) {
        mtlData.set(name, material);
      }
    }
    const resolvedTextureBase = textureBaseUrl || resolvedBaseUrl;
    return this.#buildMeshes(objData, mtlData, resolvedTextureBase, assetUrlMap);
  }
  /**
   * Fetches text content by URL.
   *
   * @param {string} url        - URL to fetch.
   * @returns {Promise<string>} - Promise, that resolves with the response body as text.
   * @throws {Error} When the fetch fails.
   * @private
   */
  static async #fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(ERROR_FETCH_FAILED_PREFIX + url);
    }
    return response.text();
  }
  /**
   * Creates meshes for parsed OBJ/MTL data.
   *
   * @param {Object} objData                    - Parsed OBJ data.
   * @param {Map<string, Object>} mtlData       - Parsed MTL data.
   * @param {string} textureBaseUrl             - Base URL for textures.
   * @param {Map<string, string>} [assetUrlMap] - Asset URL override map.
   * @returns {Promise<ObjMtlLoadResult>}       - Promise, that resolves with the created root object and all created assets.
   * @private
   */
  async #buildMeshes(objData, mtlData, textureBaseUrl, assetUrlMap) {
    const buildResult = this.#geometryBuilder.build(objData);
    const root = buildResult.root;
    const meshes = [];
    const geometries = buildResult.geometries;
    const materials = [];
    const textures = [];
    const missingMaterialWarnings = /* @__PURE__ */ new Set();
    const missingDiffuseWarnings = /* @__PURE__ */ new Set();
    const availableMaterials = Array.from(mtlData.keys());
    const availablePreview = availableMaterials.slice(ZERO_VALUE16, WARNING_MTL_AVAILABLE_LIMIT);
    for (const entry of buildResult.entries) {
      const materialDefinition = mtlData.get(entry.materialName) || null;
      const textureUrls = _ObjMtlLoader.#resolveTextureUrls(materialDefinition, textureBaseUrl, assetUrlMap);
      if (!materialDefinition && !missingMaterialWarnings.has(entry.materialName)) {
        missingMaterialWarnings.add(entry.materialName);
        const availableList = availablePreview.join(WARNING_MTL_AVAILABLE_SEPARATOR);
        console.warn(
          "%s%s%s%s%s%s",
          WARNING_MTL_MATERIAL_NOT_FOUND_PREFIX,
          entry.materialName,
          WARNING_MTL_AVAILABLE_PREFIX,
          WARNING_MTL_AVAILABLE_START,
          availableList,
          WARNING_MTL_AVAILABLE_END
        );
      }
      if (materialDefinition && materialDefinition.diffuseMap && (!textureUrls || !textureUrls.diffuse)) {
        const warnKey = materialDefinition.diffuseMap.path + WARNING_KEY_SEPARATOR + textureBaseUrl;
        if (!missingDiffuseWarnings.has(warnKey)) {
          missingDiffuseWarnings.add(warnKey);
          console.warn(
            "%s%s%s%s",
            WARNING_MTL_MISSING_DIFFUSE_PREFIX,
            materialDefinition.diffuseMap.path,
            WARNING_MTL_MISSING_DIFFUSE_BASE_PREFIX,
            textureBaseUrl
          );
        }
      }
      if (entry.entryType === ENTRY_TYPE_MESH2) {
        const material = await this.#materialFactory.createMaterial(
          materialDefinition,
          textureUrls,
          textures,
          entry.usesVertexColors
        );
        const mesh = new Mesh(entry.geometry, material);
        entry.parent.add(mesh);
        meshes.push(mesh);
        materials.push(material);
        continue;
      }
      if (entry.entryType === ENTRY_TYPE_POINTS2) {
        const color = materialDefinition ? materialDefinition.diffuseColor : this.#defaultColor;
        const material = new PointsMaterial(this.#webglContext, { color });
        material.setOpacity(materialDefinition ? materialDefinition.opacity : DEFAULT_OPACITY4);
        const points = new Points(entry.geometry, material);
        entry.parent.add(points);
        meshes.push(points);
        materials.push(material);
        continue;
      }
      if (entry.entryType === ENTRY_TYPE_LINE2) {
        const color = materialDefinition ? materialDefinition.diffuseColor : this.#defaultColor;
        const material = new SolidColorMaterial(this.#webglContext, { color });
        material.setOpacity(materialDefinition ? materialDefinition.opacity : DEFAULT_OPACITY4);
        const line = new Line(entry.geometry, material);
        entry.parent.add(line);
        meshes.push(line);
        materials.push(material);
      }
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
   * Resolves an asset path using an override map, when provided.
   *
   * @param {string} baseUrl                    - Base URL.
   * @param {string} path                       - Asset path.
   * @param {Map<string, string>} [assetUrlMap] - Asset URL map.
   * @returns {string}                          - Asset URL resolved from `assetUrlMap`, when matched - otherwise resolved against `baseUrl`.
   * @private
   */
  static #resolveAssetUrl(baseUrl, path, assetUrlMap) {
    if (assetUrlMap instanceof Map) {
      const normalized = _ObjMtlLoader.#normalizePath(path);
      if (assetUrlMap.has(normalized)) {
        return assetUrlMap.get(normalized);
      }
      const basename = _ObjMtlLoader.#getBasename(normalized);
      if (basename && assetUrlMap.has(basename)) {
        return assetUrlMap.get(basename);
      }
    }
    const resolved = _ObjMtlLoader.#resolvePath(baseUrl, path);
    if (assetUrlMap instanceof Map) {
      const normalizedResolved = _ObjMtlLoader.#normalizePath(resolved);
      if (assetUrlMap.has(normalizedResolved)) {
        return assetUrlMap.get(normalizedResolved);
      }
      const basenameResolved = _ObjMtlLoader.#getBasename(normalizedResolved);
      if (basenameResolved && assetUrlMap.has(basenameResolved)) {
        return assetUrlMap.get(basenameResolved);
      }
    }
    return resolved;
  }
  /**
   * Resolves a base path from a URL string.
   *
   * @param {string} url - Input URL.
   * @returns {string}   - Base URL path or an empty string, when no slash is present.
   * @private
   */
  static #getBasePath(url) {
    const lastSlashIndex = url.lastIndexOf(PATH_SEPARATOR2);
    if (lastSlashIndex === NOT_FOUND_INDEX3) {
      return DEFAULT_BASE_URL;
    }
    return url.slice(ZERO_VALUE16, lastSlashIndex + BASE_PATH_SLICE_OFFSET);
  }
  /**
   * Resolves a relative path against a base URL.
   *
   * @param {string} baseUrl - Base URL.
   * @param {string} path    - Path to resolve.
   * @returns {string}       - Resolved URL string, absolute paths are returned as-is - otherwise resolved against `baseUrl`.
   * @private
   */
  static #resolvePath(baseUrl, path) {
    const normalizedBase = _ObjMtlLoader.#normalizePath(baseUrl);
    const normalizedPath = _ObjMtlLoader.#normalizePath(path);
    if (!normalizedPath) {
      return normalizedBase;
    }
    if (ABSOLUTE_URL_REGEX.test(normalizedPath) || normalizedPath.startsWith(PATH_SEPARATOR2)) {
      return normalizedPath;
    }
    if (!normalizedBase) {
      return normalizedPath;
    }
    const baseForCompare = _ObjMtlLoader.#stripDotSlashPrefix(normalizedBase);
    const pathForCompare = _ObjMtlLoader.#stripDotSlashPrefix(normalizedPath);
    if (baseForCompare && pathForCompare) {
      const baseWithSeparator = baseForCompare.endsWith(PATH_SEPARATOR2) ? baseForCompare : baseForCompare + PATH_SEPARATOR2;
      if (pathForCompare === baseForCompare || pathForCompare.startsWith(baseWithSeparator)) {
        return normalizedPath;
      }
    }
    if (normalizedBase.endsWith(PATH_SEPARATOR2) || normalizedPath.startsWith(PATH_SEPARATOR2)) {
      return normalizedBase + normalizedPath;
    }
    return normalizedBase + PATH_SEPARATOR2 + normalizedPath;
  }
  /**
   * Removes a leading `./` prefix from a normalized path.
   *
   * @param {string} path - Normalized path to sanitize.
   * @returns {string}    - Path without a leading `./` prefix.
   * @private
   */
  static #stripDotSlashPrefix(path) {
    if (path.startsWith(DOT_SLASH_PREFIX)) {
      return path.slice(DOT_SLASH_PREFIX.length);
    }
    return path;
  }
  /**
   * Normalizes a path string by: trimming, unquoting and deduplicating the relative slashes.
   *
   * @param {string} path - Input path.
   * @returns {string}    - Normalized path string.
   * @private
   */
  static #normalizePath(path) {
    if (typeof path !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
      return EMPTY_STRING4;
    }
    let normalized = path.trim();
    if (normalized.startsWith(QUOTE_TOKEN4) && normalized.endsWith(QUOTE_TOKEN4) && normalized.length > SECOND_INDEX6) {
      normalized = normalized.slice(SECOND_INDEX6, normalized.length - SECOND_INDEX6);
    }
    if (normalized.includes(BACKSLASH_SEPARATOR)) {
      normalized = normalized.replace(BACKSLASH_REGEX2, PATH_SEPARATOR2);
    }
    if (!ABSOLUTE_URL_REGEX.test(normalized) && !normalized.startsWith(PATH_SEPARATOR2)) {
      normalized = normalized.replace(MULTIPLE_SLASHES_REGEX, PATH_SEPARATOR2);
    }
    return normalized.trim();
  }
  /**
   * Resolves texture URLs for all supported maps.
   *
   * @param {Object | null} definition          - Parsed material definition.
   * @param {string} textureBaseUrl             - Base URL for textures.
   * @param {Map<string, string>} [assetUrlMap] - Asset URL override map.
   * @returns {Object | null}                   - Map of resolved URLs.
   * @private
   */
  static #resolveTextureUrls(definition, textureBaseUrl, assetUrlMap) {
    if (!definition) {
      return null;
    }
    return {
      diffuse: definition.diffuseMap ? _ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.diffuseMap.path, assetUrlMap) : null,
      ambient: definition.ambientMap ? _ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.ambientMap.path, assetUrlMap) : null,
      specular: definition.specularMap ? _ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.specularMap.path, assetUrlMap) : null,
      alpha: definition.alphaMap ? _ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.alphaMap.path, assetUrlMap) : null,
      bump: definition.bumpMap ? _ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.bumpMap.path, assetUrlMap) : null,
      displacement: definition.displacementMap ? _ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.displacementMap.path, assetUrlMap) : null,
      reflection: definition.reflectionMap ? _ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.reflectionMap.path, assetUrlMap) : null
    };
  }
  /**
   * Returns a basename for the path.
   *
   * @param {string} path - Normalized path.
   * @returns {string}    - Basename, or empty string when not available.
   * @private
   */
  static #getBasename(path) {
    if (!path) {
      return EMPTY_STRING4;
    }
    const index = path.lastIndexOf(PATH_SEPARATOR2);
    if (index === NOT_FOUND_INDEX3) {
      return path;
    }
    return path.slice(index + BASE_PATH_SLICE_OFFSET);
  }
  /**
   * Returns a file entry from map using the normalized path or basename.
   *
   * @param {Map<string, File>} fileMap - File map.
   * @param {string} path               - File path.
   * @returns {File | null}             - Matched file entry by normalized path or basename or `null`, when not found.
   * @private
   */
  static #getFileFromMap(fileMap, path) {
    if (!fileMap || !path) {
      return null;
    }
    const normalized = _ObjMtlLoader.#normalizePath(path);
    if (fileMap.has(normalized)) {
      return fileMap.get(normalized);
    }
    const basenameIndex = normalized.lastIndexOf(PATH_SEPARATOR2);
    const basename = basenameIndex === NOT_FOUND_INDEX3 ? normalized : normalized.slice(basenameIndex + BASE_PATH_SLICE_OFFSET);
    if (fileMap.has(basename)) {
      return fileMap.get(basename);
    }
    return null;
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
var DEFAULT_ROTATION_ENABLED = true;
var ROTATE_BUTTON = 0;
var ROTATION_RADIANS_PER_PIXEL = 5e-3;
var WHEEL_DISTANCE_MULTIPLIER = 0.01;
var WHEEL_LISTENER_OPTIONS = { passive: false };
var POINTER_ID_RESET_VALUE = -1;
var ERROR_ROTATION_ENABLED_TYPE = "`OrbitControls.setRotationEnabled` expects a boolean.";
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
   * Flag controlling whether rotation input is enabled.
   *
   * @type {boolean}
   * @private
   */
  #rotationEnabled = DEFAULT_ROTATION_ENABLED;
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
   * Enables or disables the pointer-driven rotation.
   *
   * @param {boolean} enabled - Whether the rotation input is enabled.
   * @returns {void}
   * @throws {TypeError} When the enabled flag is invalid.
   */
  setRotationEnabled(enabled) {
    if (typeof enabled !== "boolean") {
      throw new TypeError(ERROR_ROTATION_ENABLED_TYPE);
    }
    this.#rotationEnabled = enabled;
    if (!enabled && this.#capturedPointerId !== POINTER_ID_RESET_VALUE) {
      this.#element.releasePointerCapture(this.#capturedPointerId);
      this.#capturedPointerId = POINTER_ID_RESET_VALUE;
    }
  }
  /**
   * Returns the current state of the pointer-driven camera rotation input.
   *
   * @returns {boolean} - True if the rotation input is enabled, otherwise false.
   */
  isRotationEnabled() {
    return this.#rotationEnabled;
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
    if (!this.#rotationEnabled) {
      return;
    }
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
    if (!this.#rotationEnabled) {
      return;
    }
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

// core/interaction/raycaster.js
var DEFAULT_RECURSIVE = true;
var DEFAULT_FILTER = null;
var DEFAULT_SORT = true;
var NDC_NEAR = -1;
var NDC_FAR = 1;
var CLIP_W = 1;
var ZERO_COMPONENT = 0;
var ONE_COMPONENT = 1;
var MATRIX_INDEX_00 = 0;
var MATRIX_INDEX_01 = 1;
var MATRIX_INDEX_02 = 2;
var MATRIX_INDEX_03 = 3;
var MATRIX_INDEX_10 = 4;
var MATRIX_INDEX_11 = 5;
var MATRIX_INDEX_12 = 6;
var MATRIX_INDEX_13 = 7;
var MATRIX_INDEX_20 = 8;
var MATRIX_INDEX_21 = 9;
var MATRIX_INDEX_22 = 10;
var MATRIX_INDEX_23 = 11;
var MATRIX_INDEX_30 = 12;
var MATRIX_INDEX_31 = 13;
var MATRIX_INDEX_32 = 14;
var MATRIX_INDEX_33 = 15;
var LOOP_START_INDEX2 = 0;
var LOOP_INCREMENT2 = 1;
var VECTOR_INDEX_X = 0;
var VECTOR_INDEX_Y = 1;
var VECTOR_INDEX_Z = 2;
var RANGE_MIN_INDEX = 0;
var RANGE_MAX_INDEX = 1;
var RAY_T_MIN = 0;
var RAY_T_MAX_INIT = Number.POSITIVE_INFINITY;
var RAY_DIRECTION_EPSILON = 1e-8;
var INVERSE_DIRECTION_NUMERATOR = 1;
var COMPONENT_X = "x";
var COMPONENT_Y = "y";
var COMPONENT_Z = "z";
var INTERSECTION_OBJECT_KEY = "object";
var INTERSECTION_DISTANCE_KEY = "distance";
var INTERSECTION_POINT_KEY = "point";
var OPTION_RECURSIVE_KEY = "recursive";
var OPTION_FILTER_KEY = "filter";
var OPTION_SORT_KEY = "sort";
var MOUSE_NDC_X_KEY = "x";
var MOUSE_NDC_Y_KEY = "y";
var ERROR_SCENE_TYPE = "`Raycaster.raycast` expects scene as a `Scene` instance.";
var ERROR_CAMERA_TYPE = "`Raycaster.raycast` expects camera as a `Camera` instance.";
var ERROR_MOUSE_NDC_TYPE = "`Raycaster.raycast` expects `mouseNdc` as an object with numeric x/y.";
var ERROR_OPTIONS_TYPE5 = "`Raycaster.raycast` expects options as a plain object.";
var ERROR_OPTION_RECURSIVE_TYPE = "`Raycaster.raycast` option recursive must be a boolean.";
var ERROR_OPTION_FILTER_TYPE = "`Raycaster.raycast` option filter must be a function or null.";
var ERROR_OPTION_SORT_TYPE = "`Raycaster.raycast` option sort must be a boolean.";
var ERROR_UNPROJECT_W_ZERO = "`Raycaster.raycast` failed to unproject, `W component` is zero.";
var Raycaster = class _Raycaster {
  /**
   * Performs a raycast against the given scene and returns intersections.
   *
   * @param {Scene} scene                     - Scene to query.
   * @param {Camera} camera                   - Camera used to build the ray.
   * @param {{x: number, y: number}} mouseNdc - Mouse coordinates in NDC space [-1..1].
   * @param {RaycastOptions} [options]        - Optional raycast settings.
   * @returns {Intersection[]}                - Intersection list.
   */
  raycast(scene, camera, mouseNdc, options = {}) {
    if (!(scene instanceof Scene)) {
      throw new TypeError(ERROR_SCENE_TYPE);
    }
    if (!(camera instanceof Camera)) {
      throw new TypeError(ERROR_CAMERA_TYPE);
    }
    if (mouseNdc === null || typeof mouseNdc !== "object" || Array.isArray(mouseNdc)) {
      throw new TypeError(ERROR_MOUSE_NDC_TYPE);
    }
    if (typeof mouseNdc[MOUSE_NDC_X_KEY] !== "number" || typeof mouseNdc[MOUSE_NDC_Y_KEY] !== "number") {
      throw new TypeError(ERROR_MOUSE_NDC_TYPE);
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(ERROR_OPTIONS_TYPE5);
    }
    const recursive = OPTION_RECURSIVE_KEY in options ? options[OPTION_RECURSIVE_KEY] : DEFAULT_RECURSIVE;
    const filter = OPTION_FILTER_KEY in options ? options[OPTION_FILTER_KEY] : DEFAULT_FILTER;
    const shouldSort = OPTION_SORT_KEY in options ? options[OPTION_SORT_KEY] : DEFAULT_SORT;
    if (typeof recursive !== "boolean") {
      throw new TypeError(ERROR_OPTION_RECURSIVE_TYPE);
    }
    if (filter !== null && typeof filter !== "function") {
      throw new TypeError(ERROR_OPTION_FILTER_TYPE);
    }
    if (typeof shouldSort !== "boolean") {
      throw new TypeError(ERROR_OPTION_SORT_TYPE);
    }
    scene.updateWorldMatrix({ parentWorldMatrix: null });
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = camera.getProjectionMatrix();
    const viewProjectionMatrix = Matrix4.multiply(projectionMatrix, viewMatrix);
    const inverseViewProjectionMatrix = Matrix4.invert(viewProjectionMatrix);
    const ray = _Raycaster.#createRay(inverseViewProjectionMatrix, mouseNdc[MOUSE_NDC_X_KEY], mouseNdc[MOUSE_NDC_Y_KEY]);
    const intersections = [];
    if (recursive) {
      scene.traverse((object) => _Raycaster.#collectIntersection(object, ray, filter, intersections));
    } else {
      const children = scene.children;
      for (let index = LOOP_START_INDEX2; index < children.length; index += LOOP_INCREMENT2) {
        _Raycaster.#collectIntersection(children[index], ray, filter, intersections);
      }
    }
    if (shouldSort) {
      intersections.sort((left, right) => left[INTERSECTION_DISTANCE_KEY] - right[INTERSECTION_DISTANCE_KEY]);
    }
    return intersections;
  }
  /**
   * @param {Object} object                - Scene object.
   * @param {Object} ray                   - Ray data with origin/direction.
   * @param {Function | null} filter       - Optional mesh filter.
   * @param {Intersection[]} intersections - Output array.
   * @private
   */
  static #collectIntersection(object, ray, filter, intersections) {
    if (!(object instanceof Mesh)) {
      return;
    }
    if (object.isDisposed) {
      return;
    }
    if (filter && filter(object) === false) {
      return;
    }
    const geometry = object.geometry;
    const boundingBoxMin = geometry.getBoundingBoxMin();
    const boundingBoxMax = geometry.getBoundingBoxMax();
    const inverseWorldMatrix = Matrix4.invert(object.worldMatrix);
    const localOrigin = _Raycaster.#transformPoint(inverseWorldMatrix, ray.origin, ONE_COMPONENT);
    const localDirection = _Raycaster.#transformPoint(inverseWorldMatrix, ray.direction, ZERO_COMPONENT);
    const hitDistance = _Raycaster.#intersectRayAabb(localOrigin, localDirection, boundingBoxMin, boundingBoxMax);
    if (hitDistance === null) {
      return;
    }
    const localPoint = {
      [COMPONENT_X]: localOrigin[COMPONENT_X] + localDirection[COMPONENT_X] * hitDistance,
      [COMPONENT_Y]: localOrigin[COMPONENT_Y] + localDirection[COMPONENT_Y] * hitDistance,
      [COMPONENT_Z]: localOrigin[COMPONENT_Z] + localDirection[COMPONENT_Z] * hitDistance
    };
    const worldPoint = _Raycaster.#transformPoint(object.worldMatrix, localPoint, ONE_COMPONENT);
    const distance = _Raycaster.#distanceBetween(ray.origin, worldPoint);
    intersections.push({
      [INTERSECTION_OBJECT_KEY]: object,
      [INTERSECTION_DISTANCE_KEY]: distance,
      [INTERSECTION_POINT_KEY]: worldPoint
    });
  }
  /**
   * @param {Float32Array} inverseViewProjectionMatrix - Inverse view-projection matrix.
   * @param {number} ndcX                              - Normalized device coordinate X.
   * @param {number} ndcY                              - Normalized device coordinate Y.
   * @returns {Ray}                                    - Ray with origin and direction in world space.
   * @private
   */
  static #createRay(inverseViewProjectionMatrix, ndcX, ndcY) {
    const nearPoint = _Raycaster.#unproject(inverseViewProjectionMatrix, ndcX, ndcY, NDC_NEAR);
    const farPoint = _Raycaster.#unproject(inverseViewProjectionMatrix, ndcX, ndcY, NDC_FAR);
    const direction = _Raycaster.#normalizeVector({
      [COMPONENT_X]: farPoint[COMPONENT_X] - nearPoint[COMPONENT_X],
      [COMPONENT_Y]: farPoint[COMPONENT_Y] - nearPoint[COMPONENT_Y],
      [COMPONENT_Z]: farPoint[COMPONENT_Z] - nearPoint[COMPONENT_Z]
    });
    return {
      origin: nearPoint,
      direction
    };
  }
  /**
   * @param {Float32Array} matrix - Inverse view-projection matrix.
   * @param {number} ndcX         - NDC x.
   * @param {number} ndcY         - NDC y.
   * @param {number} ndcZ         - NDC z.
   * @returns {RaycastPoint}      - Unprojected point in world space.
   * @private
   */
  static #unproject(matrix, ndcX, ndcY, ndcZ) {
    const clipX = ndcX;
    const clipY = ndcY;
    const clipZ = ndcZ;
    const clipW = CLIP_W;
    const worldX = matrix[MATRIX_INDEX_00] * clipX + matrix[MATRIX_INDEX_10] * clipY + matrix[MATRIX_INDEX_20] * clipZ + matrix[MATRIX_INDEX_30] * clipW;
    const worldY = matrix[MATRIX_INDEX_01] * clipX + matrix[MATRIX_INDEX_11] * clipY + matrix[MATRIX_INDEX_21] * clipZ + matrix[MATRIX_INDEX_31] * clipW;
    const worldZ = matrix[MATRIX_INDEX_02] * clipX + matrix[MATRIX_INDEX_12] * clipY + matrix[MATRIX_INDEX_22] * clipZ + matrix[MATRIX_INDEX_32] * clipW;
    const worldW = matrix[MATRIX_INDEX_03] * clipX + matrix[MATRIX_INDEX_13] * clipY + matrix[MATRIX_INDEX_23] * clipZ + matrix[MATRIX_INDEX_33] * clipW;
    if (worldW === ZERO_COMPONENT) {
      throw new Error(ERROR_UNPROJECT_W_ZERO);
    }
    const inverseW = ONE_COMPONENT / worldW;
    return {
      [COMPONENT_X]: worldX * inverseW,
      [COMPONENT_Y]: worldY * inverseW,
      [COMPONENT_Z]: worldZ * inverseW
    };
  }
  /**
   * @param {Float32Array} matrix - Matrix to apply.
   * @param {RaycastPoint} point  - Point to transform.
   * @param {number} wComponent   - Homogeneous W component (1 for points, 0 for vectors).
   * @returns {RaycastPoint}      - Transformed (x, y, z) after applying the 4x4 matrix with the given `W component`.
   * @private
   */
  static #transformPoint(matrix, point, wComponent) {
    const x = point[COMPONENT_X];
    const y = point[COMPONENT_Y];
    const z = point[COMPONENT_Z];
    return {
      [COMPONENT_X]: matrix[MATRIX_INDEX_00] * x + matrix[MATRIX_INDEX_10] * y + matrix[MATRIX_INDEX_20] * z + matrix[MATRIX_INDEX_30] * wComponent,
      [COMPONENT_Y]: matrix[MATRIX_INDEX_01] * x + matrix[MATRIX_INDEX_11] * y + matrix[MATRIX_INDEX_21] * z + matrix[MATRIX_INDEX_31] * wComponent,
      [COMPONENT_Z]: matrix[MATRIX_INDEX_02] * x + matrix[MATRIX_INDEX_12] * y + matrix[MATRIX_INDEX_22] * z + matrix[MATRIX_INDEX_32] * wComponent
    };
  }
  /**
   * @param {RaycastPoint} vector - Vector to normalize.
   * @returns {RaycastPoint}      - Normalized vector, returns zero vector when input length is zero.
   * @private
   */
  static #normalizeVector(vector) {
    const x = vector[COMPONENT_X];
    const y = vector[COMPONENT_Y];
    const z = vector[COMPONENT_Z];
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length === ZERO_COMPONENT) {
      return {
        [COMPONENT_X]: ZERO_COMPONENT,
        [COMPONENT_Y]: ZERO_COMPONENT,
        [COMPONENT_Z]: ZERO_COMPONENT
      };
    }
    const inverseLength = ONE_COMPONENT / length;
    return {
      [COMPONENT_X]: x * inverseLength,
      [COMPONENT_Y]: y * inverseLength,
      [COMPONENT_Z]: z * inverseLength
    };
  }
  /**
   * @param {RaycastPoint} origin    - Ray origin in local space.
   * @param {RaycastPoint} direction - Ray direction in local space.
   * @param {Float32Array} min       - AABB minimum.
   * @param {Float32Array} max       - AABB maximum.
   * @returns {number | null}        - Intersection distance parameter along the ray direction, null when the ray misses the AABB.
   * @private
   */
  static #intersectRayAabb(origin, direction, min, max) {
    let tMin = RAY_T_MIN;
    let tMax = RAY_T_MAX_INIT;
    const originX = origin[COMPONENT_X];
    const originY = origin[COMPONENT_Y];
    const originZ = origin[COMPONENT_Z];
    const directionX = direction[COMPONENT_X];
    const directionY = direction[COMPONENT_Y];
    const directionZ = direction[COMPONENT_Z];
    const minX = min[VECTOR_INDEX_X];
    const minY = min[VECTOR_INDEX_Y];
    const minZ = min[VECTOR_INDEX_Z];
    const maxX = max[VECTOR_INDEX_X];
    const maxY = max[VECTOR_INDEX_Y];
    const maxZ = max[VECTOR_INDEX_Z];
    const rangeX = _Raycaster.#getAxisRange(originX, directionX, minX, maxX);
    if (!rangeX) {
      return null;
    }
    tMin = Math.max(tMin, rangeX[RANGE_MIN_INDEX]);
    tMax = Math.min(tMax, rangeX[RANGE_MAX_INDEX]);
    if (tMin > tMax) {
      return null;
    }
    const rangeY = _Raycaster.#getAxisRange(originY, directionY, minY, maxY);
    if (!rangeY) {
      return null;
    }
    tMin = Math.max(tMin, rangeY[RANGE_MIN_INDEX]);
    tMax = Math.min(tMax, rangeY[RANGE_MAX_INDEX]);
    if (tMin > tMax) {
      return null;
    }
    const rangeZ = _Raycaster.#getAxisRange(originZ, directionZ, minZ, maxZ);
    if (!rangeZ) {
      return null;
    }
    tMin = Math.max(tMin, rangeZ[RANGE_MIN_INDEX]);
    tMax = Math.min(tMax, rangeZ[RANGE_MAX_INDEX]);
    if (tMin > tMax) {
      return null;
    }
    if (tMax < RAY_T_MIN) {
      return null;
    }
    return tMin >= RAY_T_MIN ? tMin : tMax;
  }
  /**
   * @param {number} origin     - Ray origin component.
   * @param {number} direction  - Ray direction component.
   * @param {number} min        - AABB min component.
   * @param {number} max        - AABB max component.
   * @returns {number[] | null} - Two-element array for this axis slab, or null if the ray misses the slab.
   * @private
   */
  static #getAxisRange(origin, direction, min, max) {
    if (Math.abs(direction) < RAY_DIRECTION_EPSILON) {
      return origin < min || origin > max ? null : [RAY_T_MIN, RAY_T_MAX_INIT];
    }
    const inverseDirection = INVERSE_DIRECTION_NUMERATOR / direction;
    let axisEntry = (min - origin) * inverseDirection;
    let axisExit = (max - origin) * inverseDirection;
    if (axisEntry > axisExit) {
      const tempValue = axisEntry;
      axisEntry = axisExit;
      axisExit = tempValue;
    }
    return [axisEntry, axisExit];
  }
  /**
   * @param {RaycastPoint} from - Start point.
   * @param {RaycastPoint} to   - End point.
   * @returns {number}          - Euclidean distance between the two points.
   * @private
   */
  static #distanceBetween(from, to) {
    const deltaX = to[COMPONENT_X] - from[COMPONENT_X];
    const deltaY = to[COMPONENT_Y] - from[COMPONENT_Y];
    const deltaZ = to[COMPONENT_Z] - from[COMPONENT_Z];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
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
  Points,
  Line,
  Raycaster,
  Light,
  DirectionalLight,
  AmbientLight,
  // Grouped namespaces:
  Math: Object.freeze({
    Matrix4,
    Vector3,
    Vector3Math,
    Curve3,
    CatmullRomCurve3,
    Path3D
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
    HeightmapGeometry,
    PointsGeometry,
    PolylineGeometry,
    TubeLineGeometry
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
    PhongMaterial,
    PointsMaterial,
    MtlStandardMaterial
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
    FpsCounter,
    LightGizmo,
    TransformGizmo
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
