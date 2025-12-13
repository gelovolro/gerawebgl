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
   * @param {number} scaleX - Scale along X.
   * @param {number} scaleY - Scale along Y.
   * @param {number} scaleZ - Scale along Z.
   * @returns {Float32Array} A new scale matrix.
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
   * @returns {Float32Array} A new perspective projection matrix.
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
   * @returns {Float32Array} A new translation matrix.
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
   * @returns {Float32Array} A new rotation matrix.
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
   * @returns {Float32Array} A new rotation matrix.
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
   * @returns {Float32Array} A new rotation matrix.
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
   * @returns {Float32Array} A new matrix containing the product.
   */
  static multiply(leftMatrix, rightMatrix) {
    if (!(leftMatrix instanceof Float32Array) || leftMatrix.length !== MATRIX_4x4_ELEMENT_COUNT || !(rightMatrix instanceof Float32Array) || rightMatrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
      throw new TypeError("Matrix4.multiply expects two 4x4 Float32Array matrices.");
    }
    const out = _Matrix4.#createEmpty();
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
   * Multiplies several matrices in sequence:
   * result = m0 * m1 * m2 * ... * mn
   *
   * @param {...Float32Array} matrices - Matrices to multiply, in order.
   * @returns {Float32Array} The resulting matrix.
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
   * Internal helper to create a zero-filled 4x4 matrix.
   *
   * @returns {Float32Array}
   * @private
   */
  static #createEmpty() {
    return new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
  }
};

// core/scene/object3d.js
var CHILD_NOT_FOUND_INDEX = -1;
var SINGLE_CHILD_REMOVE_COUNT = 1;
var Object3D = class _Object3D {
  /** @type {{ x: number, y: number, z: number }} */
  #position;
  /** @type {{ x: number, y: number, z: number }} */
  #rotation;
  /** @type {{ x: number, y: number, z: number }} */
  #scale;
  /** @type {Object3D | null} */
  #parent;
  /** @type {Object3D[]} */
  #children;
  /**
   * Local transform matrix of this object (position/rotation/scale relative to its parent).
   * @type {Float32Array}
   */
  #localMatrix;
  /**
   * World transform matrix of this object (relative to the scene origin).
   * @type {Float32Array}
   */
  #worldMatrix;
  /**
   * Creates a new transform node with position, rotation and scale.
   */
  constructor() {
    this.#position = { x: 0, y: 0, z: 0 };
    this.#rotation = { x: 0, y: 0, z: 0 };
    this.#scale = { x: 1, y: 1, z: 1 };
    this.#parent = null;
    this.#children = [];
    this.#localMatrix = Matrix4.createIdentity();
    this.#worldMatrix = Matrix4.createIdentity();
  }
  /**
   * @returns {{ x: number, y: number, z: number }} - Local position of this object.
   */
  get position() {
    return this.#position;
  }
  /**
   * @returns {{ x: number, y: number, z: number }} - Local rotation of this object in radians.
   */
  get rotation() {
    return this.#rotation;
  }
  /**
   * @returns {{ x: number, y: number, z: number }} - Local scale of this object.
   */
  get scale() {
    return this.#scale;
  }
  /**
   * @returns {Object3D | null}
   */
  get parent() {
    return this.#parent;
  }
  /**
   * @returns {Object3D[]}
   */
  get children() {
    return this.#children;
  }
  /**
   * @returns {Float32Array} - World transform matrix of this object.
   */
  get worldMatrix() {
    return this.#worldMatrix;
  }
  /**
   * Adds a child object to this object.
   *
   * @param {Object3D} child - Child object to attach to this node in the scene graph.
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
    this.#children.push(child);
  }
  /**
   * Removes a child from this object.
   *
   * @param {Object3D} child - Child object to detach from this node in the scene graph.
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
  }
  /**
   * Updates the world matrix of this object and all its descendants.
   *
   * @param {Float32Array | null} parentWorldMatrix - World matrix of the parent object, or null for the root node.
   */
  updateWorldMatrix(parentWorldMatrix) {
    if (parentWorldMatrix !== null && !(parentWorldMatrix instanceof Float32Array)) {
      throw new TypeError("Object3D.updateWorldMatrix expects a Float32Array or null.");
    }
    this.#updateLocalMatrix();
    const newWorldMatrix = parentWorldMatrix !== null ? Matrix4.multiply(parentWorldMatrix, this.#localMatrix) : this.#localMatrix;
    this.#worldMatrix.set(newWorldMatrix);
    for (let index = 0; index < this.#children.length; index += 1) {
      this.#children[index].updateWorldMatrix(this.#worldMatrix);
    }
  }
  /**
   * Called for each Object3D in the hierarchy.
   *
   * @callback Object3DVisitor
   * @param {Object3D} object - Current object in the traversal.
   */
  /**
   * Traverses this object and all its descendants.
   *
   * @param {Object3DVisitor} callback - Function called for this object and each of its children in depth-first order.
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
  /**
   * Recomputes the local matrix from position, rotation and scale.
   *
   * @private
   */
  #updateLocalMatrix() {
    const translation = Matrix4.createTranslation(
      this.#position.x,
      this.#position.y,
      this.#position.z
    );
    const rotationX = Matrix4.createRotationX(this.#rotation.x);
    const rotationY = Matrix4.createRotationY(this.#rotation.y);
    const rotationZ = Matrix4.createRotationZ(this.#rotation.z);
    const scale = Matrix4.createScale(
      this.#scale.x,
      this.#scale.y,
      this.#scale.z
    );
    this.#localMatrix = Matrix4.multiplyMany(
      translation,
      rotationZ,
      rotationY,
      rotationX,
      scale
    );
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
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
   * @param {Float32Array} positions              - [x, y, z] triples.
   * @param {Float32Array | null} colors          - [red, green, blue] triples or null.
   * @param {Uint16Array} indicesSolid            - Indices for solid triangles.
   * @param {Uint16Array} indicesWireframe        - Indices for wireframe lines.
   */
  constructor(webglContext2, positions, colors, indicesSolid, indicesWireframe) {
    if (!(webglContext2 instanceof WebGL2RenderingContext)) {
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
    this.#webglContext = webglContext2;
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
    this.#webglContext.bindVertexArray(this.#vertexArrayObject);
  }
  /**
   * Binds the appropriate index buffer depending on the wireframe flag.
   *
   * @param {boolean} wireframe - Flag indicating whether the geometry should be drawn in wireframe mode.
   */
  bindIndexBuffer(wireframe) {
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
    return wireframe ? this.#wireframeIndexCount : this.#solidIndexCount;
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
    const webglContext2 = this.#webglContext;
    webglContext2.bindVertexArray(this.#vertexArrayObject);
    webglContext2.bindBuffer(webglContext2.ARRAY_BUFFER, this.#positionBuffer);
    webglContext2.enableVertexAttribArray(POSITION_ATTRIBUTE_LOCATION);
    webglContext2.vertexAttribPointer(
      POSITION_ATTRIBUTE_LOCATION,
      POSITION_COMPONENT_COUNT,
      webglContext2.FLOAT,
      ATTRIBUTE_NORMALIZED,
      ATTRIBUTE_NO_STRIDE,
      ATTRIBUTE_NO_OFFSET
    );
    if (this.#colorBuffer) {
      webglContext2.bindBuffer(webglContext2.ARRAY_BUFFER, this.#colorBuffer);
      webglContext2.enableVertexAttribArray(COLOR_ATTRIBUTE_LOCATION);
      webglContext2.vertexAttribPointer(
        COLOR_ATTRIBUTE_LOCATION,
        COLOR_COMPONENT_COUNT,
        webglContext2.FLOAT,
        ATTRIBUTE_NORMALIZED,
        ATTRIBUTE_NO_STRIDE,
        ATTRIBUTE_NO_OFFSET
      );
    }
    webglContext2.bindBuffer(webglContext2.ELEMENT_ARRAY_BUFFER, this.#indexBufferSolid);
    webglContext2.bindVertexArray(null);
  }
};

// core/shader/shader-program.js
var MATRIX_4x4_ELEMENT_COUNT2 = 16;
var ShaderProgram = class {
  /** @type {WebGL2RenderingContext} */
  #webglRenderingContext;
  /** @type {WebGLProgram} */
  #program;
  /** @type {Map<string, WebGLUniformLocation>} */
  #uniformLocations;
  /**
   * @param {WebGL2RenderingContext} webglRenderingContext - WebGL2 rendering context used to create shaders and the program.
   * @param {string} vertexSource   - GLSL source code of the vertex shader.
   * @param {string} fragmentSource - GLSL source code of the fragment shader.
   */
  constructor(webglRenderingContext, vertexSource, fragmentSource) {
    if (!(webglRenderingContext instanceof WebGL2RenderingContext)) {
      throw new TypeError("ShaderProgram expects a WebGL2RenderingContext.");
    }
    if (typeof vertexSource !== "string" || typeof fragmentSource !== "string") {
      throw new TypeError("ShaderProgram expects vertex and fragment source as strings.");
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
    return this.#program;
  }
  /**
   * Makes this program active for subsequent draw calls.
   */
  use() {
    this.#webglRenderingContext.useProgram(this.#program);
  }
  /**
   * Sets a 4x4 matrix uniform.
   *
   * @param {string} name         - Name of the uniform variable in the GLSL program.
   * @param {Float32Array} matrix - 4x4 matrix in column-major order to upload to the uniform.
   */
  setMatrix4(name, matrix) {
    if (typeof name !== "string") {
      throw new TypeError("ShaderProgram.setMatrix4 expects uniform name as a string.");
    }
    if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT2) {
      throw new TypeError("ShaderProgram.setMatrix4 expects a 4x4 Float32Array.");
    }
    const location = this.#getUniformLocation(name);
    this.#webglRenderingContext.uniformMatrix4fv(location, false, matrix);
  }
  /**
   * Looks up a uniform location with caching.
   *
   * @param {string} name - Name of the uniform variable in the linked shader program.
   * @returns {WebGLUniformLocation}
   * @private
   */
  #getUniformLocation(name) {
    if (typeof name !== "string") {
      throw new TypeError("ShaderProgram.#getUniformLocation expects a string name.");
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
      throw new TypeError("ShaderProgram.#compileShader expects a numeric shader type.");
    }
    if (typeof source !== "string") {
      throw new TypeError("ShaderProgram.#compileShader expects shader source as a string.");
    }
    const shader = this.#webglRenderingContext.createShader(type);
    if (!shader) {
      throw new Error("Failed to create WebGL shader.");
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
  /**
   * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
   * @param {ShaderProgram} shaderProgram - Compiled and linked shader program used by this material for rendering.
   */
  constructor(webglContext2, shaderProgram) {
    if (!(webglContext2 instanceof WebGL2RenderingContext)) {
      throw new TypeError("Material expects a WebGL2RenderingContext.");
    }
    if (!(shaderProgram instanceof ShaderProgram)) {
      throw new TypeError("Material expects a ShaderProgram instance.");
    }
    this.#webglContext = webglContext2;
    this.#shaderProgram = shaderProgram;
  }
  /**
   * @returns {WebGL2RenderingContext}
   */
  get webglContext() {
    return this.#webglContext;
  }
  /**
   * @returns {ShaderProgram}
   */
  get shaderProgram() {
    return this.#shaderProgram;
  }
  /**
   * Makes this material's shader program active.
   */
  use() {
    this.#shaderProgram.use();
  }
  /**
   * Enables or disables wireframe rendering.
   *
   * @param {boolean} enabled - When true, switches material to wireframe mode. When false, uses solid rendering.
   */
  setWireframeEnabled(enabled) {
    this.#wireframeEnabled = Boolean(enabled);
  }
  /**
   * Toggles wireframe mode.
   */
  toggleWireframe() {
    this.#wireframeEnabled = !this.#wireframeEnabled;
  }
  /**
   * @returns {boolean}
   */
  isWireframeEnabled() {
    return this.#wireframeEnabled;
  }
};

// core/scene/mesh.js
var Mesh = class extends Object3D {
  /** @type {Geometry} */
  #geometry;
  /** @type {Material} */
  #material;
  /**
   * @param {Geometry} geometry - Geometry that provides vertex and index buffers for this mesh.
   * @param {Material} material - Material that defines how the geometry should be shaded and rendered.
   */
  constructor(geometry, material2) {
    super();
    if (!(geometry instanceof Geometry)) {
      throw new TypeError("Mesh constructor expects a Geometry instance.");
    }
    if (!(material2 instanceof Material)) {
      throw new TypeError("Mesh constructor expects a Material instance.");
    }
    this.#geometry = geometry;
    this.#material = material2;
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
};

// core/scene/scene.js
var Scene = class extends Object3D {
  constructor() {
    super();
  }
};

// core/scene/camera.js
var MINIMUM_NEAR_CLIP_DISTANCE = 0;
var MINIMUM_ASPECT_RATIO = 0;
var PerspectiveCamera = class extends Object3D {
  /** @type {number} */
  #fieldOfViewRadians;
  /** @type {number} */
  #aspectRatio;
  /** @type {number} */
  #near;
  /** @type {number} */
  #far;
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
    if (aspectRatio <= MINIMUM_ASPECT_RATIO) {
      throw new RangeError("PerspectiveCamera expects a positive aspect ratio.");
    }
    if (near <= MINIMUM_NEAR_CLIP_DISTANCE || far <= near) {
      throw new RangeError("PerspectiveCamera expects 0 < near < far.");
    }
    this.#fieldOfViewRadians = fieldOfViewRadians;
    this.#aspectRatio = aspectRatio;
    this.#near = near;
    this.#far = far;
  }
  /**
   * Updates the aspect ratio.
   *
   * @param {number} aspectRatio - New viewport aspect ratio (canvas width divided by canvas height).
   */
  setAspectRatio(aspectRatio) {
    if (typeof aspectRatio !== "number" || aspectRatio <= MINIMUM_ASPECT_RATIO) {
      throw new RangeError("PerspectiveCamera.setAspectRatio expects a positive number.");
    }
    this.#aspectRatio = aspectRatio;
  }
  /**
   * Returns the projection matrix for this camera.
   *
   * @returns {Float32Array}
   */
  getProjectionMatrix() {
    return Matrix4.createPerspective(
      this.#fieldOfViewRadians,
      this.#aspectRatio,
      this.#near,
      this.#far
    );
  }
};

// core/render/renderer.js
var INDEX_BUFFER_OFFSET_BYTES = 0;
var Renderer = class {
  /** @type {WebGLContext} */
  #contextWrapper;
  /** @type {WebGL2RenderingContext} */
  #webglRenderingContext;
  /**
   * @param {WebGLContext} webglContext - Wrapper around the underlying WebGL2 rendering context.
   */
  constructor(webglContext2) {
    if (!(webglContext2 instanceof WebGLContext)) {
      throw new TypeError("Renderer expects a WebGLContext instance.");
    }
    this.#contextWrapper = webglContext2;
    this.#webglRenderingContext = webglContext2.context;
  }
  /**
   * Renders the given scene from the point of view of the given camera.
   *
   * @param {Scene} scene - Scene graph containing all objects, that should be rendered.
   * @param {PerspectiveCamera} camera - Camera, that defines the view and projection used for rendering.
   */
  render(scene2, camera2) {
    if (!(scene2 instanceof Scene)) {
      throw new TypeError("Renderer.render expects a Scene instance.");
    }
    if (!(camera2 instanceof PerspectiveCamera)) {
      throw new TypeError("Renderer.render expects a PerspectiveCamera instance.");
    }
    const renderingContext = this.#webglRenderingContext;
    this.#contextWrapper.resizeToDisplaySize();
    this.#contextWrapper.clear();
    const canvas2 = renderingContext.canvas;
    const aspectRatio = canvas2.width / canvas2.height;
    camera2.setAspectRatio(aspectRatio);
    const projectionMatrix = camera2.getProjectionMatrix();
    scene2.updateWorldMatrix(null);
    scene2.traverse((object3d) => {
      if (!(object3d instanceof Mesh)) {
        return;
      }
      const mesh = object3d;
      const geometry = mesh.geometry;
      const material2 = mesh.material;
      const world = mesh.worldMatrix;
      const finalMatrix = Matrix4.multiply(projectionMatrix, world);
      material2.use();
      material2.apply(finalMatrix);
      geometry.bind();
      const isWireframeEnabled = material2.isWireframeEnabled();
      geometry.bindIndexBuffer(isWireframeEnabled);
      const mode = isWireframeEnabled ? renderingContext.LINES : renderingContext.TRIANGLES;
      const indexCount = geometry.getIndexCount(isWireframeEnabled);
      renderingContext.drawElements(
        mode,
        indexCount,
        renderingContext.UNSIGNED_SHORT,
        INDEX_BUFFER_OFFSET_BYTES
      );
    });
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
  constructor(webglContext2, size = DEFAULT_BOX_SIZE) {
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
    super(webglContext2, positions, colors, indicesSolid, indicesWireframe);
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
  constructor(webglContext2) {
    const shaderProgram = new ShaderProgram(webglContext2, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    super(webglContext2, shaderProgram);
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

// demo/stub.js
var canvas = document.getElementById("glcanvas");
if (!canvas) {
  throw new Error('Canvas element with id "glcanvas" not found.');
}
var webglContext = new WebGLContext(canvas);
var renderer = new Renderer(webglContext);
var scene = new Scene();
var gl = webglContext.context;
var camera = new PerspectiveCamera(
  Math.PI / 4,
  // 45 degrees
  canvas.width / canvas.height,
  0.1,
  100
);
var boxGeometry = new BoxGeometry(gl, 1);
var material = new BasicMaterial(gl);
var cube = new Mesh(boxGeometry, material);
cube.position.z = -3;
scene.add(cube);
var wireframeToggleButton = document.getElementById("wireframeToggleButton");
if (!wireframeToggleButton) {
  throw new Error('Button with id "wireframeToggleButton" not found.');
}
function updateWireframeButtonLabel() {
  const isWireframeEnabled = material.isWireframeEnabled();
  wireframeToggleButton.textContent = isWireframeEnabled ? "Wireframe: ON" : "Wireframe: OFF";
}
wireframeToggleButton.addEventListener("click", () => {
  material.toggleWireframe();
  updateWireframeButtonLabel();
});
updateWireframeButtonLabel();
var lastTimestamp = performance.now();
var rotationSpeedX = Math.PI / 4;
var rotationSpeedY = Math.PI / 3;
function renderFrame(currentTimestamp) {
  const deltaMilliseconds = currentTimestamp - lastTimestamp;
  lastTimestamp = currentTimestamp;
  const deltaSeconds = deltaMilliseconds / 1e3;
  cube.rotation.x += rotationSpeedX * deltaSeconds;
  cube.rotation.y += rotationSpeedY * deltaSeconds;
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderFrame);
}
window.requestAnimationFrame(renderFrame);
//# sourceMappingURL=gerawebgl.js.map
