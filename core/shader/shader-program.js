/** @type {number} */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Thin wrapper around a linked WebGL shader program.
 */
export class ShaderProgram {
    /** @type {WebGL2RenderingContext} */
    #webglRenderingContext;

    /** @type {WebGLProgram | null} */
    #program;

    /** @type {Map<string, WebGLUniformLocation>} */
    #uniformLocations;

    /** @type {boolean} */
    #isDisposed = false;

    /**
     * @param {WebGL2RenderingContext} webglRenderingContext - WebGL2 rendering context used to create shaders and the program.
     * @param {string} vertexSource   - GLSL source code of the vertex shader.
     * @param {string} fragmentSource - GLSL source code of the fragment shader.
     */
    constructor(webglRenderingContext, vertexSource, fragmentSource) {
        if (!(webglRenderingContext instanceof WebGL2RenderingContext)) {
            throw new TypeError('ShaderProgram expects a WebGL2RenderingContext.');
        }

        if (typeof vertexSource !== 'string' || typeof fragmentSource !== 'string') {
            throw new TypeError('ShaderProgram expects vertex and fragment source as strings.');
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
     * Sets a 4x4 matrix uniform.
     *
     * @param {string} name         - Name of the uniform variable in the GLSL program.
     * @param {Float32Array} matrix - 4x4 matrix in column-major order to upload to the uniform.
     */
    setMatrix4(name, matrix) {
        this.#assertNotDisposed();

        if (typeof name !== 'string') {
            throw new TypeError('ShaderProgram.setMatrix4 expects uniform name as a string.');
        }

        if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4x4_ELEMENT_COUNT) {
            throw new TypeError('ShaderProgram.setMatrix4 expects a 4x4 Float32Array.');
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
            throw new Error('ShaderProgram has been disposed and can no longer be used.');
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
            throw new TypeError('ShaderProgram.#getUniformLocation expects a string name.');
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
            throw new TypeError('ShaderProgram.#compileShader expects a numeric shader type.');
        }

        if (typeof source !== 'string') {
            throw new TypeError('ShaderProgram.#compileShader expects shader source as a string.');
        }

        const shader = this.#webglRenderingContext.createShader(type);

        if (!shader) {
            throw new Error('Failed to create WebGL shader.');
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
