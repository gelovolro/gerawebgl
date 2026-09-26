import { ECMASCRIPT_TYPEOF_RESULTS }         from '../constants/ecmascript-types.js';
import { MATH_LAYOUT }                       from '../constants/math.js';
import { SHADER_PROGRAM_EXCEPTION_MESSAGES } from '../exception-messages/shader-program.js';
import * as ShaderProgramConstants           from '../constants/shader-program.js';
import { Texture2D }                         from '../texture/texture2d.js';

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
        ShaderProgram.#assertConstructorArguments(webglRenderingContext, vertexSource, fragmentSource);
        this.#webglRenderingContext = webglRenderingContext;
        this.#uniformLocations      = new Map();
        this.#program               = this.#createProgram(vertexSource, fragmentSource);
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

        if (typeof name !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.ATTRIBUTE_NAME_TYPE);
        }

        const location = this.#webglRenderingContext.getAttribLocation(this.#program, name);

        if (location === ShaderProgramConstants.SHADER_PROGRAM_LIMITS.ATTRIBUTE_LOCATION_NOT_FOUND) {
            throw new Error(SHADER_PROGRAM_EXCEPTION_MESSAGES.ATTRIBUTE_NOT_FOUND(name));
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
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.UNIFORM_NAME_TYPE);
        return this.#getUniformLocation(name);
    }

    /**
     * Sets a float uniform.
     *
     * @param {string} name  - Name of the uniform variable.
     * @param {number} value - Float value to upload.
     */
    setFloat(name, value) {
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.FLOAT_NAME_TYPE);

        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.FLOAT_VALUE_TYPE);
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
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.INT_NAME_TYPE);

        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isInteger(value)) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.INT_VALUE_TYPE);
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
    setTexture2D(
        name,
        texture,
        textureUnitIndex = ShaderProgramConstants.SHADER_PROGRAM_DEFAULTS.TEXTURE_UNIT_INDEX
    ) {
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.TEXTURE_NAME_TYPE);

        if (!(texture instanceof Texture2D)) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.TEXTURE_TYPE);
        }

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ShaderProgramConstants.SHADER_PROGRAM_LIMITS.MIN_TEXTURE_UNIT_INDEX) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.TEXTURE_UNIT_INDEX);
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
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR2_NAME_TYPE);

        ShaderProgram.#assertVector(
            value,
            ShaderProgramConstants.SHADER_PROGRAM_LAYOUT.VECTOR2_ELEMENT_COUNT,
            SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR2_TYPE,
            SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR2_LENGTH
        );

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
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR3_NAME_TYPE);

        ShaderProgram.#assertVector(
            value,
            MATH_LAYOUT.VECTOR3_ELEMENT_COUNT,
            SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR3_TYPE,
            SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR3_LENGTH
        );

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
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR4_NAME_TYPE);

        ShaderProgram.#assertVector(
            value,
            ShaderProgramConstants.SHADER_PROGRAM_LAYOUT.VECTOR4_ELEMENT_COUNT,
            SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR4_TYPE,
            SHADER_PROGRAM_EXCEPTION_MESSAGES.VECTOR4_LENGTH
        );

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
        this.#assertUniformName(name, SHADER_PROGRAM_EXCEPTION_MESSAGES.MATRIX4_NAME_TYPE);

        if (!(matrix instanceof Float32Array) || matrix.length !== MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.MATRIX4_TYPE);
        }

        const location = this.#getUniformLocation(name);
        this.#webglRenderingContext.uniformMatrix4fv(
            location,
            ShaderProgramConstants.SHADER_PROGRAM_DEFAULTS.MATRIX_TRANSPOSE,
            matrix
        );
    }

    /**
     * Releases the underlying WebGL program. After calling dispose, this instance must not be used.
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        this.#webglRenderingContext.deleteProgram(this.#program);
        this.#uniformLocations.clear();
        this.#program    = null;
        this.#isDisposed = true;
    }

    /**
     * Validates constructor arguments before allocating WebGL resources.
     *
     * @param {WebGL2RenderingContext} webglRenderingContext - Rendering context to validate.
     * @param {string} vertexSource                          - Vertex shader source.
     * @param {string} fragmentSource                        - Fragment shader source.
     * @private
     */
    static #assertConstructorArguments(webglRenderingContext, vertexSource, fragmentSource) {
        if (!(webglRenderingContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.CONTEXT_TYPE);
        }

        if (typeof vertexSource   !== ECMASCRIPT_TYPEOF_RESULTS.STRING ||
            typeof fragmentSource !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(SHADER_PROGRAM_EXCEPTION_MESSAGES.SOURCE_TYPE);
        }
    }

    /**
     * Rejects operations after the program has been released.
     *
     * @private
     */
    #assertNotDisposed() {
        if (this.#isDisposed) {
            throw new Error(SHADER_PROGRAM_EXCEPTION_MESSAGES.DISPOSED);
        }
    }

    /**
     * Validates a uniform name while preserving each public method's error message.
     *
     * @param {string} name    - Uniform name to validate.
     * @param {string} message - Error message for the calling method.
     * @private
     */
    #assertUniformName(name, message) {
        this.#assertNotDisposed();

        if (typeof name !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(message);
        }
    }

    /**
     * Checks vector storage and length without copying its components.
     *
     * @param {Float32Array | number[]} value - Vector to validate.
     * @param {number} elementCount           - Required component count.
     * @param {string} typeMessage            - Error message for unsupported storage.
     * @param {string} lengthMessage          - Error message for an incorrect length.
     * @private
     */
    static #assertVector(value, elementCount, typeMessage, lengthMessage) {
        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError(typeMessage);
        }

        if (value.length !== elementCount) {
            throw new TypeError(lengthMessage);
        }
    }

    /**
     * Looks up a validated uniform name and caches successful results.
     *
     * @param {string} name - Name of the uniform variable in the linked shader program.
     * @returns {WebGLUniformLocation}
     * @private
     */
    #getUniformLocation(name) {
        this.#assertNotDisposed();

        if (this.#uniformLocations.has(name)) {
            return this.#uniformLocations.get(name);
        }

        const location = this.#webglRenderingContext.getUniformLocation(this.#program, name);

        if (location === null) {
            throw new Error(SHADER_PROGRAM_EXCEPTION_MESSAGES.UNIFORM_NOT_FOUND(name));
        }

        this.#uniformLocations.set(name, location);
        return location;
    }

    /**
     * Compiles both shaders and releases them after linking or a failure.
     *
     * @param {string} vertexSource   - Vertex shader source.
     * @param {string} fragmentSource - Fragment shader source.
     * @returns {WebGLProgram}
     * @private
     */
    #createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.#compileShader(this.#webglRenderingContext.VERTEX_SHADER, vertexSource);
        let fragmentShader = null;

        try {
            fragmentShader = this.#compileShader(this.#webglRenderingContext.FRAGMENT_SHADER, fragmentSource);
            return this.#linkProgram(vertexShader, fragmentShader);
        } finally {
            this.#webglRenderingContext.deleteShader(vertexShader);

            if (fragmentShader !== null) {
                this.#webglRenderingContext.deleteShader(fragmentShader);
            }
        }
    }

    /**
     * Links compiled shaders and deletes the program if linking fails.
     *
     * @param {WebGLShader} vertexShader   - Compiled vertex shader.
     * @param {WebGLShader} fragmentShader - Compiled fragment shader.
     * @returns {WebGLProgram}
     * @private
     */
    #linkProgram(vertexShader, fragmentShader) {
        const context = this.#webglRenderingContext;
        const program = context.createProgram();

        if (!program) {
            throw new Error(SHADER_PROGRAM_EXCEPTION_MESSAGES.PROGRAM_CREATION);
        }

        try {
            context.attachShader(program, vertexShader);
            context.attachShader(program, fragmentShader);
            context.linkProgram(program);

            if (!context.getProgramParameter(program, context.LINK_STATUS)) {
                const infoLog = context.getProgramInfoLog(program) || SHADER_PROGRAM_EXCEPTION_MESSAGES.UNKNOWN_LINK_ERROR;
                throw new Error(SHADER_PROGRAM_EXCEPTION_MESSAGES.PROGRAM_LINK(infoLog));
            }

            return program;
        } catch (error) {
            context.deleteProgram(program);
            throw error;
        }
    }

    /**
     * Compiles a shader and deletes it if compilation fails.
     *
     * @param {number} type   - WebGL shader type.
     * @param {string} source - Shader source validated by the constructor.
     * @returns {WebGLShader}
     * @private
     */
    #compileShader(type, source) {
        const context = this.#webglRenderingContext;
        const shader  = context.createShader(type);

        if (!shader) {
            throw new Error(SHADER_PROGRAM_EXCEPTION_MESSAGES.SHADER_CREATION);
        }

        try {
            context.shaderSource(shader, source);
            context.compileShader(shader);

            if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
                const infoLog = context.getShaderInfoLog(shader) || SHADER_PROGRAM_EXCEPTION_MESSAGES.UNKNOWN_COMPILE_ERROR;
                throw new Error(SHADER_PROGRAM_EXCEPTION_MESSAGES.SHADER_COMPILE(infoLog));
            }

            return shader;
        } catch (error) {
            context.deleteShader(shader);
            throw error;
        }
    }
}
