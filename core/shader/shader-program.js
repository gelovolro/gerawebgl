import { Texture2D } from '../texture/texture2d.js';

/**
 * Number of elements in a 4x4 matrix.
 * Used to validate and upload `mat4` uniform values.
 *
 * @type {number}
 */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Number of elements in a 2-component vector.
 * Used to validate `vec2` uniform values.
 *
 * @type {number}
 */
const VECTOR_2_ELEMENT_COUNT = 2;

/**
 * Number of elements in a 3-component vector.
 * Used to validate `vec3` uniform values.
 *
 * @type {number}
 */
const VECTOR_3_ELEMENT_COUNT = 3;

/**
 * Number of elements in a 4-component vector.
 * Used to validate `vec4` uniform values.
 *
 * @type {number}
 */
const VECTOR_4_ELEMENT_COUNT = 4;

/**
 * WebGL sentinel value for `attribute not found`.
 * getAttribLocation returns `-1`, when the attribute is not found.
 *
 * @type {number}
 */
const ATTRIBUTE_LOCATION_NOT_FOUND_VALUE = -1;

/**
 * Minimum allowed texture unit index.
 *
 * @type {number}
 */
const MIN_TEXTURE_UNIT_INDEX = 0;

/**
 * Default texture unit index used by `ShaderProgram.setTexture2D`.
 * Zero corresponds to `TEXTURE0`.
 *
 * @type {number}
 */
const DEFAULT_TEXTURE_UNIT_INDEX = 0;

/**
 * Thin wrapper around a linked WebGL shader program.
 */
export class ShaderProgram {
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
            throw new TypeError('`ShaderProgram` expects a `WebGL2RenderingContext`.');
        }

        if (typeof vertexSource !== 'string' || typeof fragmentSource !== 'string') {
            throw new TypeError('`ShaderProgram` expects vertex and fragment source as strings.');
        }

        this.#webglRenderingContext = webglRenderingContext;
        this.#uniformLocations      = new Map();

        const vertexShader   = this.#compileShader(this.#webglRenderingContext.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.#compileShader(this.#webglRenderingContext.FRAGMENT_SHADER, fragmentSource);
        const program        = this.#webglRenderingContext.createProgram();

        if (!program) {
            this.#webglRenderingContext.deleteShader(vertexShader);
            this.#webglRenderingContext.deleteShader(fragmentShader);
            throw new Error('Failed to create WebGL program.');
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
            const infoLog = this.#webglRenderingContext.getProgramInfoLog(program) || 'Unknown program link error';
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.getAttribLocation` expects attribute name as a string.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.setFloat` expects uniform name as a string.');
        }

        if (typeof value !== 'number') {
            throw new TypeError('`ShaderProgram.setFloat` expects value as a number.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.setInt` expects uniform name as a string.');
        }

        if (typeof value !== 'number' || !Number.isInteger(value)) {
            throw new TypeError('`ShaderProgram.setInt` expects an integer value.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.setTexture2D` expects uniform name as a string.');
        }

        if (!(texture instanceof Texture2D)) {
            throw new TypeError('`ShaderProgram.setTexture2D` expects texture as Texture2D.');
        }

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < MIN_TEXTURE_UNIT_INDEX) {
            throw new TypeError('`ShaderProgram.setTexture2D` expects textureUnitIndex as a non-negative integer.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.setVector2` expects uniform name as a string.');
        }

        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError('`ShaderProgram.setVector2` expects a number[] or Float32Array.');
        }

        if (value.length !== VECTOR_2_ELEMENT_COUNT) {
            throw new TypeError('`ShaderProgram.setVector2` expects exactly 2 components.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.setVector3` expects uniform name as a string.');
        }

        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError('`ShaderProgram.setVector3` expects a number[] or Float32Array.');
        }

        if (value.length !== VECTOR_3_ELEMENT_COUNT) {
            throw new TypeError('`ShaderProgram.setVector3` expects exactly 3 components.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.setVector4` expects uniform name as a string.');
        }

        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError('`ShaderProgram.setVector4` expects a number[] or `Float32Array`.');
        }

        if (value.length !== VECTOR_4_ELEMENT_COUNT) {
            throw new TypeError('`ShaderProgram.setVector4` expects exactly 4 components.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.setMatrix4` expects uniform name as a string.');
        }

        if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('`ShaderProgram.setMatrix4` expects a 4x4 Float32Array.');
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
        this.#program    = null;
        this.#isDisposed = true;
    }

    /**
     * @private
     */
    #assertNotDisposed() {
        if (this.#isDisposed || this.#program === null) {
            throw new Error('`ShaderProgram` has been disposed and can no longer be used.');
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

        if (typeof name !== 'string') {
            throw new TypeError('`ShaderProgram.#getUniformLocation` expects a string name.');
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
        if (typeof type !== 'number') {
            throw new TypeError('`ShaderProgram.#compileShader` expects a numeric shader type.');
        }

        if (typeof source !== 'string') {
            throw new TypeError('`ShaderProgram.#compileShader` expects shader source as a string.');
        }

        const shader = this.#webglRenderingContext.createShader(type);

        if (!shader) {
            throw new Error('Failed to create the WebGL shader.');
        }

        this.#webglRenderingContext.shaderSource(shader, source);
        this.#webglRenderingContext.compileShader(shader);
        const compileStatus = this.#webglRenderingContext.getShaderParameter(shader, this.#webglRenderingContext.COMPILE_STATUS);

        if (!compileStatus) {
            const infoLog = this.#webglRenderingContext.getShaderInfoLog(shader) || 'Unknown shader compilation error';
            this.#webglRenderingContext.deleteShader(shader);
            throw new Error(`Failed to compile shader: ${infoLog}`);
        }

        return shader;
    }
}
