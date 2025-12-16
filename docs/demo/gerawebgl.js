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
var ATTRIBUTE_NORMALIZED = false;
var ATTRIBUTE_NO_STRIDE = 0;
var ATTRIBUTE_NO_OFFSET = 0;
var Geometry = class {
  /** @type {WebGL2RenderingContext} */
  #webglContext;
  /** @type {WebGLVertexArrayObject} */
  #vertexArrayObject;
  /** @type {WebGLBuffer} */
  #positionBuffer;
  /** @type {WebGLBuffer | null} */
  #colorBuffer;
  /** @type {WebGLBuffer} */
  #indexBufferSolid;
  /** @type {WebGLBuffer} */
  #indexBufferWireframe;
  /** @type {number} */
  #solidIndexCount;
  /** @type {number} */
  #wireframeIndexCount;
  /** @type {boolean} */
  #isDisposed = false;
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
   * @param {Float32Array} positions              - [x, y, z] triples.
   * @param {Float32Array | null} colors          - [red, green, blue] triples or null.
   * @param {Uint16Array} indicesSolid            - Indices for solid triangles.
   * @param {Uint16Array} indicesWireframe        - Indices for wireframe lines.
   */
  constructor(webglContext, positions, colors, indicesSolid, indicesWireframe) {
    if (!(webglContext instanceof WebGL2RenderingContext)) {
      throw new TypeError("Geometry expects a WebGL2RenderingContext.");
    }
    if (!(positions instanceof Float32Array)) {
      throw new TypeError("Geometry expects positions as Float32Array.");
    }
    if (colors !== null && !(colors instanceof Float32Array)) {
      throw new TypeError("Geometry expects colors as Float32Array or null.");
    }
    if (!(indicesSolid instanceof Uint16Array) || !(indicesWireframe instanceof Uint16Array)) {
      throw new TypeError("Geometry expects indices as Uint16Array.");
    }
    this.#webglContext = webglContext;
    this.#solidIndexCount = indicesSolid.length;
    this.#wireframeIndexCount = indicesWireframe.length;
    this.#vertexArrayObject = this.#createVertexArrayObject();
    this.#positionBuffer = this.#createStaticArrayBuffer(positions);
    this.#colorBuffer = colors ? this.#createStaticArrayBuffer(colors) : null;
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
    webglContext.deleteBuffer(this.#indexBufferSolid);
    webglContext.deleteBuffer(this.#indexBufferWireframe);
    webglContext.deleteVertexArray(this.#vertexArrayObject);
    this.#isDisposed = true;
  }
  /**
   * @private
   */
  #assertNotDisposed() {
    if (this.#isDisposed) {
      throw new Error("Geometry has been disposed and can no longer be used.");
    }
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
   * Creates a static ARRAY_BUFFER and uploads the given data.
   *
   * @param {Float32Array} data - Vertex attribute data stored as a flat array of numeric components.
   * @returns {WebGLBuffer}
   * @private
   */
  #createStaticArrayBuffer(data) {
    const buffer = this.#webglContext.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create ARRAY_BUFFER.");
    }
    this.#webglContext.bindBuffer(this.#webglContext.ARRAY_BUFFER, buffer);
    this.#webglContext.bufferData(this.#webglContext.ARRAY_BUFFER, data, this.#webglContext.STATIC_DRAW);
    return buffer;
  }
  /**
   * Creates an ELEMENT_ARRAY_BUFFER and uploads the given index data.
   *
   * @param {Uint16Array} indices - Index data referencing vertices in the associated vertex buffers.
   * @returns {WebGLBuffer}
   * @private
   */
  #createIndexBuffer(indices) {
    const buffer = this.#webglContext.createBuffer();
    if (!buffer) {
      throw new Error("Failed to create ELEMENT_ARRAY_BUFFER.");
    }
    this.#webglContext.bindBuffer(this.#webglContext.ELEMENT_ARRAY_BUFFER, buffer);
    this.#webglContext.bufferData(this.#webglContext.ELEMENT_ARRAY_BUFFER, indices, this.#webglContext.STATIC_DRAW);
    return buffer;
  }
  /**
   * Configures the vertex array object (VAO) with position and optional color attributes.
   *
   * Attribute layout:
   * - location 0: vec3 position
   * - location 1: vec3 color (if present)
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
    webglContext.bindBuffer(webglContext.ELEMENT_ARRAY_BUFFER, this.#indexBufferSolid);
    webglContext.bindVertexArray(null);
  }
};

// core/geometry/box-geometry.js
var DEFAULT_BOX_SIZE = 1;
var BOX_HALF_SIZE_DIVISOR = 2;
var BoxGeometry = class extends Geometry {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
   * @param {number} size - Edge length of the box.
   */
  constructor(webglContext, size = DEFAULT_BOX_SIZE) {
    if (typeof size !== "number" || size <= 0) {
      throw new RangeError("BoxGeometry expects a positive size.");
    }
    const halfSize = size / BOX_HALF_SIZE_DIVISOR;
    const positions = new Float32Array([
      // Front face
      -halfSize,
      -halfSize,
      halfSize,
      // 0
      halfSize,
      -halfSize,
      halfSize,
      // 1
      halfSize,
      halfSize,
      halfSize,
      // 2
      -halfSize,
      halfSize,
      halfSize,
      // 3
      // Back face
      -halfSize,
      -halfSize,
      -halfSize,
      // 4
      halfSize,
      -halfSize,
      -halfSize,
      // 5
      halfSize,
      halfSize,
      -halfSize,
      // 6
      -halfSize,
      halfSize,
      -halfSize
      // 7
    ]);
    const colors = new Float32Array([
      // Front vertices (0-3) - red
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
      // Back vertices (4-7) - blue
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
      1
    ]);
    const indicesSolid = new Uint16Array([
      // Front face
      0,
      1,
      2,
      2,
      3,
      0,
      // Back face
      5,
      4,
      7,
      7,
      6,
      5,
      // Top face
      3,
      2,
      6,
      6,
      7,
      3,
      // Bottom face
      4,
      5,
      1,
      1,
      0,
      4,
      // Right face
      1,
      5,
      6,
      6,
      2,
      1,
      // Left face
      4,
      0,
      3,
      3,
      7,
      4
    ]);
    const indicesWireframe = new Uint16Array([
      // Front face edges
      0,
      1,
      1,
      2,
      2,
      3,
      3,
      0,
      // Back face edges
      4,
      5,
      5,
      6,
      6,
      7,
      7,
      4,
      // Side edges
      0,
      4,
      1,
      5,
      2,
      6,
      3,
      7
    ]);
    super(webglContext, positions, colors, indicesSolid, indicesWireframe);
  }
};

// core/shader/shader-program.js
var MATRIX_4x4_ELEMENT_COUNT3 = 16;
var VECTOR_2_ELEMENT_COUNT = 2;
var VECTOR_3_ELEMENT_COUNT = 3;
var VECTOR_4_ELEMENT_COUNT = 4;
var ATTRIBUTE_LOCATION_NOT_FOUND_VALUE = -1;
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
   * Sets a vec4 uniform.
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
      throw new TypeError("`ShaderProgram.setVector4` expects a number[] or Float32Array.");
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
  /** @type {WebGL2RenderingContext} */
  #webglContext;
  /** @type {ShaderProgram} */
  #shaderProgram;
  /** @type {boolean} */
  #wireframeEnabled = false;
  /** @type {boolean} */
  #ownsShaderProgram = false;
  /** @type {boolean} */
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
   * @returns {WebGL2RenderingContext}
   */
  get webglContext() {
    this.#assertNotDisposed();
    return this.#webglContext;
  }
  /**
   * @returns {ShaderProgram}
   */
  get shaderProgram() {
    this.#assertNotDisposed();
    return this.#shaderProgram;
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
   * @returns {boolean}
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

// core/material/basic-material.js
var VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_color;
uniform mat4 u_matrix;
out vec3 v_color;

void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);
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
var BasicMaterial = class extends Material {
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
   */
  constructor(webglContext) {
    const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    super(webglContext, shaderProgram, { ownsShaderProgram: true });
  }
  /**
   * Applies per-object uniforms.
   *
   * @param {Float32Array} matrix4 - Transformation matrix passed as u_matrix.
   */
  apply(matrix4) {
    this.shaderProgram.setMatrix4("u_matrix", matrix4);
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
var Mesh = class extends Object3D {
  /** @type {Geometry} */
  #geometry;
  /** @type {Material} */
  #material;
  /** @type {boolean} */
  #isDisposed = false;
  /**
   * @param {Geometry} geometry - Geometry that provides vertex and index buffers for this mesh.
   * @param {Material} material - Material that defines how the geometry should be shaded and rendered.
   */
  constructor(geometry, material) {
    super();
    if (!(geometry instanceof Geometry)) {
      throw new TypeError("Mesh constructor expects a Geometry instance.");
    }
    if (!(material instanceof Material)) {
      throw new TypeError("Mesh constructor expects a Material instance.");
    }
    this.#geometry = geometry;
    this.#material = material;
  }
  /**
   * Releases GPU resources owned by this mesh (geometry and material).
   * After dispose, the mesh can remain as a scene object, but it should not be rendered.
   */
  dispose() {
    if (this.#isDisposed) {
      return;
    }
    this.#geometry.dispose();
    this.#material.dispose();
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
   * Reference to the view-projection matrix of the current frame.
   * This is a pointer to a reused Float32Array (no allocations per frame).
   *
   * @type {Float32Array}
   * @private
   */
  #frameViewProjectionMatrix;
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
    this.#frameViewProjectionMatrix = this.#viewProjectionMatrix;
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
    material.apply(this.#finalMatrix);
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
   * Wrapper around the underlying WebGL2 rendering context.
   * Owns resize logic and provides access to raw `WebGL2RenderingContext` via `.context`.
   *
   * @type {WebGLContext}
   * @private
   */
  #contextWrapper;
  /**
   * High-level scene renderer.
   * Responsible for drawing the current scene using the current camera.
   *
   * @type {Renderer}
   * @private
   */
  #renderer;
  /**
   * Root scene graph node.
   *
   * @type {Scene}
   * @private
   */
  #scene;
  /**
   * Main camera used by the engine render loop.
   *
   * @type {PerspectiveCamera}
   * @private
   */
  #camera;
  /**
   * When true, the engine will resize the canvas to match the browser window.
   *
   * @type {boolean}
   * @private
   */
  #fitToWindow;
  /**
   * Indicates whether the requestAnimationFrame loop is running.
   *
   * @type {boolean}
   * @private
   */
  #isRunning = false;
  /**
   * Current requestAnimationFrame id.
   * Reset value means "not scheduled".
   *
   * @type {number}
   * @private
   */
  #requestAnimationFrameId = ENGINE_ANIMATION_FRAME_ID_RESET_VALUE;
  /**
   * Previous frame timestamp in seconds (performance.now() / 1000).
   * Reset value means "not initialized".
   *
   * @type {number}
   * @private
   */
  #lastTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;
  /**
   * First frame timestamp in seconds.
   * Used to compute time since engine start.
   *
   * @type {number}
   * @private
   */
  #startTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;
  /**
   * Optional callback executed every frame.
   *
   * @type {EngineFrameCallback | null}
   * @private
   */
  #frameCallback = null;
  /**
   * Reused resize options object passed to `Renderer.render()`.
   * Avoids allocating a new object on every frame.
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
      throw new RangeError('Engine options "near" and "far" must be positive numbers and near < far.');
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
  /**
   * @returns {WebGLContext}
   */
  get context() {
    return this.#contextWrapper;
  }
  /**
   * Returns the underlying WebGL2RenderingContext.
   *
   * @returns {WebGL2RenderingContext}
   */
  get webglRenderingContext() {
    return this.#contextWrapper.context;
  }
  /**
   * @returns {Renderer}
   */
  get renderer() {
    return this.#renderer;
  }
  /**
   * @returns {Scene}
   */
  get scene() {
    return this.#scene;
  }
  /**
   * @returns {PerspectiveCamera}
   */
  get camera() {
    return this.#camera;
  }
  /**
   * Creates a box mesh using: BoxGeometry + BasicMaterial.
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
    if (material !== void 0 && !(material instanceof BasicMaterial)) {
      throw new TypeError("`Engine.createBoxMesh` option `material` must be a `BasicMaterial` instance.");
    }
    const geometry = new BoxGeometry(this.webglRenderingContext, size);
    const usedMaterial = material || new BasicMaterial(this.webglRenderingContext);
    return new Mesh(geometry, usedMaterial);
  }
  /**
   * Renders a single frame.
   */
  render() {
    this.#resizeOptions.fitToWindow = this.#fitToWindow;
    this.#renderer.render(this.#scene, this.#camera, this.#resizeOptions);
  }
  /**
   * Starts the requestAnimationFrame loop.
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
   * Stops the requestAnimationFrame loop.
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
   * @param {number} timeMs
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
  Materials: Object.freeze({
    Material,
    BasicMaterial
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
