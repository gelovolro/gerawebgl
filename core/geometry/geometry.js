/**
 * Attribute location used by vec3 position.
 * Must match shader `layout(location = X)` declaration.
 *
 * @type {number}
 */
const POSITION_ATTRIBUTE_LOCATION = 0;

/**
 * Number of float components per vertex position.
 *
 * @type {number}
 */
const POSITION_COMPONENT_COUNT = 3;

/**
 * Attribute location used by vertex color.
 * Must match shader `layout(location = X)` declaration.
 *
 * @type {number}
 */
const COLOR_ATTRIBUTE_LOCATION = 1;

/**
 * Number of float components per vertex color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Attribute location used by the UV coordinates.
 * Must match shader `layout(location = X)` declaration.
 *
 * @type {number}
 */
const UV_ATTRIBUTE_LOCATION = 2;

/**
 * Number of float components per UV coordinate.
 *
 * @type {number}
 */
const UV_COMPONENT_COUNT = 2;

/**
 * Flag passed to `vertexAttribPointer()` method.
 * When false, attribute values are used as-is (no normalization).
 *
 * @type {boolean}
 */
const ATTRIBUTE_NORMALIZED = false;

/**
 * Stride parameter for `vertexAttribPointer()`, when the attribute data is tightly packed.
 * Zero means: compute stride automatically from attribute size and type.
 *
 * @type {number}
 */
const ATTRIBUTE_NO_STRIDE = 0;

/**
 * Offset parameter for `vertexAttribPointer()` for attributes starting at the beginning of the buffer.
 *
 * @type {number}
 */
const ATTRIBUTE_NO_OFFSET = 0;

/**
 * Modulo result expected for correct component alignment.
 *
 * @type {number}
 */
const MODULO_ALIGNED_VALUE = 0;

/**
 * Number of indices, that form a single triangle.
 *
 * @type {number}
 */
const TRIANGLE_INDEX_COMPONENT_COUNT = 3;

/**
 * Number of indices, that form a single line segment.
 *
 * @type {number}
 */
const LINE_INDEX_COMPONENT_COUNT = 2;

/**
 * Geometry represents a set of vertex buffers + index buffers, grouped under a VAO.
 */
export class Geometry {
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
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
     * @param {Float32Array} positions              - [x, y, z] triples.
     * @param {Float32Array | null} colors          - [red, green, blue] triples or null.
     * @param {Uint16Array} indicesSolid            - Indices for solid triangles.
     * @param {Uint16Array} indicesWireframe        - Indices for wireframe lines.
     * @param {Float32Array | null} [uvs = null]    - [u, v] pairs or null.
     */
    constructor(webglContext, positions, colors, indicesSolid, indicesWireframe, uvs = null) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError('Geometry expects a WebGL2RenderingContext.');
        }

        if (!(positions instanceof Float32Array)) {
            throw new TypeError('Geometry expects positions as Float32Array.');
        }

        if (colors !== null && !(colors instanceof Float32Array)) {
            throw new TypeError('Geometry expects colors as Float32Array or null.');
        }

        if (uvs !== null && !(uvs instanceof Float32Array)) {
            throw new TypeError('Geometry expects uvs as Float32Array or null.');
        }

        if (!(indicesSolid instanceof Uint16Array) || !(indicesWireframe instanceof Uint16Array)) {
            throw new TypeError('Geometry expects indices as Uint16Array.');
        }

        this.#validateAttributeSizes(positions, colors, uvs);
        this.#validateIndexSizes(indicesSolid, indicesWireframe);

        this.#webglContext         = webglContext;
        this.#solidIndexCount      = indicesSolid.length;
        this.#wireframeIndexCount  = indicesWireframe.length;
        this.#vertexArrayObject    = this.#createVertexArrayObject();
        this.#positionBuffer       = this.#createStaticArrayBuffer(positions);
        this.#colorBuffer          = colors ? this.#createStaticArrayBuffer(colors) : null;
        this.#uvBuffer             = uvs ? this.#createStaticArrayBuffer(uvs) : null;
        this.#indexBufferSolid     = this.#createIndexBuffer(indicesSolid);
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
            throw new Error('Failed to create vertex array object (VAO).');
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
            throw new Error('Failed to create `ARRAY_BUFFER`.');
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
            throw new Error('Failed to create `ELEMENT_ARRAY_BUFFER`.');
        }

        this.#webglContext.bindBuffer(this.#webglContext.ELEMENT_ARRAY_BUFFER, buffer);
        this.#webglContext.bufferData(this.#webglContext.ELEMENT_ARRAY_BUFFER, indices, this.#webglContext.STATIC_DRAW);
        return buffer;
    }

    /**
     * Validates vertex attribute array sizes (positions, colors, uvs).
     *
     * @param {Float32Array} positions     - Flat array of vec3 positions: [x, y, z] * vertexCount.
     * @param {Float32Array | null} colors - Optional flat array of vec3 colors: [red, green, blue] * vertexCount.
     * @param {Float32Array | null} uvs    - Optional flat array of vec2 UVs: [u, v] * vertexCount.
     * @private
     */
    #validateAttributeSizes(positions, colors, uvs) {
        if ((positions.length % POSITION_COMPONENT_COUNT) !== MODULO_ALIGNED_VALUE) {
            throw new Error('Geometry positions length must be a multiple of `POSITION_COMPONENT_COUNT`.');
        }

        const vertexCount = positions.length / POSITION_COMPONENT_COUNT;

        if (colors !== null) {
            if ((colors.length % COLOR_COMPONENT_COUNT) !== MODULO_ALIGNED_VALUE) {
                throw new Error('Geometry colors length must be a multiple of `COLOR_COMPONENT_COUNT`.');
            }

            const colorVertexCount = colors.length / COLOR_COMPONENT_COUNT;

            if (colorVertexCount !== vertexCount) {
                throw new Error('Geometry colors vertex count must match positions vertex count.');
            }
        }

        if (uvs !== null) {
            if ((uvs.length % UV_COMPONENT_COUNT) !== MODULO_ALIGNED_VALUE) {
                throw new Error('Geometry uvs length must be a multiple of `UV_COMPONENT_COUNT`.');
            }

            const uvVertexCount = uvs.length / UV_COMPONENT_COUNT;

            if (uvVertexCount !== vertexCount) {
                throw new Error('Geometry uvs vertex count must match positions vertex count.');
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
        if ((indicesSolid.length % TRIANGLE_INDEX_COMPONENT_COUNT) !== MODULO_ALIGNED_VALUE) {
            throw new Error('Geometry solid indices length must be a multiple of `TRIANGLE_INDEX_COMPONENT_COUNT`.');
        }

        if ((indicesWireframe.length % LINE_INDEX_COMPONENT_COUNT) !== MODULO_ALIGNED_VALUE) {
            throw new Error('Geometry wireframe indices length must be a multiple of `LINE_INDEX_COMPONENT_COUNT`.');
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

        // Positions:
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

        // Colors (optional):
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

        // UVs (optional):
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

        // Bind the default index buffer (solid) to the VAO:
        webglContext.bindBuffer(webglContext.ELEMENT_ARRAY_BUFFER, this.#indexBufferSolid);
        webglContext.bindVertexArray(null);
    }

    /**
     * @private
     */
    #assertNotDisposed() {
        if (this.#isDisposed) {
            throw new Error('Geometry has been disposed and can no longer be used.');
        }
    }
}
