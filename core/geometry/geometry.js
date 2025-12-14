/** @type {number} */
const POSITION_ATTRIBUTE_LOCATION = 0;

/** @type {number} */
const POSITION_COMPONENT_COUNT = 3;

/** @type {number} */
const COLOR_ATTRIBUTE_LOCATION = 1;

/** @type {number} */
const COLOR_COMPONENT_COUNT = 3;

/** @type {boolean} */
const ATTRIBUTE_NORMALIZED = false;

/** @type {number} */
const ATTRIBUTE_NO_STRIDE = 0;

/** @type {number} */
const ATTRIBUTE_NO_OFFSET = 0;

/**
 * Geometry holds vertex buffers and index buffers for rendering.
 */
export class Geometry {
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
            throw new TypeError('Geometry expects a WebGL2RenderingContext.');
        }

        if (!(positions instanceof Float32Array)) {
            throw new TypeError('Geometry expects positions as Float32Array.');
        }

        if (colors !== null && !(colors instanceof Float32Array)) {
            throw new TypeError('Geometry expects colors as Float32Array or null.');
        }

        if (!(indicesSolid instanceof Uint16Array) || !(indicesWireframe instanceof Uint16Array)) {
            throw new TypeError('Geometry expects indices as Uint16Array.');
        }

        this.#webglContext         = webglContext;
        this.#solidIndexCount      = indicesSolid.length;
        this.#wireframeIndexCount  = indicesWireframe.length;
        this.#vertexArrayObject    = this.#createVertexArrayObject();
        this.#positionBuffer       = this.#createStaticArrayBuffer(positions);
        this.#colorBuffer          = colors ? this.#createStaticArrayBuffer(colors) : null;
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
            throw new Error('Geometry has been disposed and can no longer be used.');
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
            throw new Error('Failed to create vertex array object (VAO).');
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
            throw new Error('Failed to create ARRAY_BUFFER.');
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
            throw new Error('Failed to create ELEMENT_ARRAY_BUFFER.');
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

        // Set position attribute at location = 0:
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

        // Set color attribute at location = 1, if present:
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

        // Bind the default index buffer (solid) to the VAO:
        webglContext.bindBuffer(webglContext.ELEMENT_ARRAY_BUFFER, this.#indexBufferSolid);
        webglContext.bindVertexArray(null);
    }
}
