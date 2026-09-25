import { MATH_VECTOR3_INDEXES }      from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS } from '../constants/ecmascript-types.js';

export {
    PRIMITIVE_TRIANGLES,
    PRIMITIVE_LINES,
    PRIMITIVE_LINE_STRIP,
    PRIMITIVE_LINE_LOOP,
    PRIMITIVE_POINTS
} from '../constants/geometry.js';

import {
    PRIMITIVE_TRIANGLES,
    PRIMITIVE_LINES,
    PRIMITIVE_LINE_STRIP,
    PRIMITIVE_LINE_LOOP,
    PRIMITIVE_POINTS,
    SUPPORTED_PRIMITIVES,
    GEOMETRY_PRIMITIVE_DEFAULTS,
    GEOMETRY_LAYOUT,
    GEOMETRY_BUFFER_LAYOUT,
    GEOMETRY_LIMITS,
    GEOMETRY_ERRORS
} from '../constants/geometry.js';

/**
 * Geometry primitive override options.
 *
 * @typedef {Object} GeometryPrimitiveOptions
 * @property {string} [solidPrimitive=PRIMITIVE_TRIANGLES] - Solid primitive type.
 * @property {string} [wireframePrimitive=PRIMITIVE_LINES] - Wireframe primitive type.
 */

/**
 * Geometry represents a set of `vertex buffers + index buffers`, grouped under a VAO.
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
    constructor(
        webglContext,
        positions,
        colors,
        indicesSolid,
        indicesWireframe,
        uvs     = null,
        normals = null,
        options = null
    ) {
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

        if (normals !== null && !(normals instanceof Float32Array)) {
            throw new TypeError('Geometry expects normals as Float32Array or null.');
        }

        if (!Geometry.#isSupportedIndexArray(indicesSolid) || !Geometry.#isSupportedIndexArray(indicesWireframe)) {
            throw new TypeError('Geometry expects indices as Uint16Array or Uint32Array.');
        }

        if (options !== null && (typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options))) {
            throw new TypeError('Geometry expects options as a plain object or null.');
        }

        const {
            solidPrimitive     = GEOMETRY_PRIMITIVE_DEFAULTS.SOLID_PRIMITIVE,
            wireframePrimitive = GEOMETRY_PRIMITIVE_DEFAULTS.WIREFRAME_PRIMITIVE
        } = options || {};

        Geometry.#assertPrimitiveName(solidPrimitive);
        Geometry.#assertPrimitiveName(wireframePrimitive);
        this.#validateAttributeSizes(positions, colors, uvs, normals);
        this.#validateIndexSizes(indicesSolid, indicesWireframe, solidPrimitive, wireframePrimitive);

        this.#webglContext                = webglContext;
        this.#solidIndexCount             = indicesSolid.length;
        this.#wireframeIndexCount         = indicesWireframe.length;
        this.#solidIndexComponentType     = Geometry.#resolveIndexComponentType(webglContext, indicesSolid);
        this.#wireframeIndexComponentType = Geometry.#resolveIndexComponentType(webglContext, indicesWireframe);
        this.#vertexArrayObject           = this.#createVertexArrayObject();
        this.#positionBuffer              = this.#createStaticArrayBuffer(positions);
        this.#colorBuffer                 = colors ? this.#createStaticArrayBuffer(colors) : null;
        this.#uvBuffer                    = uvs ? this.#createStaticArrayBuffer(uvs) : null;
        this.#normalBuffer                = normals ? this.#createStaticArrayBuffer(normals) : null;
        this.#indexBufferSolid            = this.#createIndexBuffer(indicesSolid);
        this.#indexBufferWireframe        = this.#createIndexBuffer(indicesWireframe);
        this.#boundingBoxMin              = new Float32Array(GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT);
        this.#boundingBoxMax              = new Float32Array(GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT);
        this.#solidPrimitive              = solidPrimitive;
        this.#wireframePrimitive          = wireframePrimitive;

        Geometry.#writeBoundingBox(positions, this.#boundingBoxMin, this.#boundingBoxMax);
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
            throw new Error('Failed to create ARRAY_BUFFER.');
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
            throw new Error('Failed to create ELEMENT_ARRAY_BUFFER.');
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
        return (indices instanceof Uint16Array) || (indices instanceof Uint32Array);
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
        return (indices instanceof Uint32Array) ? webglContext.UNSIGNED_INT : webglContext.UNSIGNED_SHORT;
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
        if ((positions.length % GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT) !== GEOMETRY_BUFFER_LAYOUT.MODULO_ALIGNED_VALUE) {
            throw new Error('Geometry positions length must be a multiple of POSITION_COMPONENT_COUNT.');
        }

        const vertexCount = positions.length / GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;

        if (colors !== null) {
            if ((colors.length % GEOMETRY_LAYOUT.COLOR_COMPONENT_COUNT) !== GEOMETRY_BUFFER_LAYOUT.MODULO_ALIGNED_VALUE) {
                throw new Error('Geometry colors length must be a multiple of COLOR_COMPONENT_COUNT.');
            }

            const colorVertexCount = colors.length / GEOMETRY_LAYOUT.COLOR_COMPONENT_COUNT;

            if (colorVertexCount !== vertexCount) {
                throw new Error('Geometry colors vertex count must match positions vertex count.');
            }
        }

        if (uvs !== null) {
            if ((uvs.length % GEOMETRY_LAYOUT.UV_COMPONENT_COUNT) !== GEOMETRY_BUFFER_LAYOUT.MODULO_ALIGNED_VALUE) {
                throw new Error('Geometry uvs length must be a multiple of UV_COMPONENT_COUNT.');
            }

            const uvVertexCount = uvs.length / GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;

            if (uvVertexCount !== vertexCount) {
                throw new Error('Geometry uvs vertex count must match positions vertex count.');
            }
        }

        if (normals !== null) {
            if ((normals.length % GEOMETRY_LAYOUT.NORMAL_COMPONENT_COUNT) !== GEOMETRY_BUFFER_LAYOUT.MODULO_ALIGNED_VALUE) {
                throw new Error('Geometry normals length must be a multiple of NORMAL_COMPONENT_COUNT.');
            }

            const normalVertexCount = normals.length / GEOMETRY_LAYOUT.NORMAL_COMPONENT_COUNT;

            if (normalVertexCount !== vertexCount) {
                throw new Error('Geometry normals vertex count must match positions vertex count.');
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
        Geometry.#validateIndexSizeForPrimitive(indicesSolid, solidPrimitive, 'solid');
        Geometry.#validateIndexSizeForPrimitive(indicesWireframe, wireframePrimitive, 'wireframe');
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
                if ((indices.length % GEOMETRY_LAYOUT.TRIANGLE_INDEX_COUNT) !== GEOMETRY_BUFFER_LAYOUT.MODULO_ALIGNED_VALUE) {
                    throw new Error(`Geometry ${label} indices length must be a multiple of TRIANGLE_INDEX_COMPONENT_COUNT.`);
                }

                return;

            case PRIMITIVE_LINES:
                if ((indices.length % GEOMETRY_LAYOUT.LINE_INDEX_COUNT) !== GEOMETRY_BUFFER_LAYOUT.MODULO_ALIGNED_VALUE) {
                    throw new Error(`Geometry ${label} indices length must be a multiple of LINE_INDEX_COMPONENT_COUNT.`);
                }

                return;

            case PRIMITIVE_LINE_STRIP:
            case PRIMITIVE_LINE_LOOP:
                if (indices.length < GEOMETRY_LIMITS.MIN_LINE_STRIP_INDEX_COUNT) {
                    throw new Error(`Geometry ${label} indices length must be at least ${GEOMETRY_LIMITS.MIN_LINE_STRIP_INDEX_COUNT}.`);
                }

                return;

            case PRIMITIVE_POINTS:
                return;

            default:
                throw new Error(GEOMETRY_ERRORS.INVALID_PRIMITIVE);
        }
    }

    /**
     * Validates primitive name.
     *
     * @param {string} value - Primitive name.
     * @private
     */
    static #assertPrimitiveName(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.STRING || !SUPPORTED_PRIMITIVES.has(value)) {
            throw new TypeError(GEOMETRY_ERRORS.INVALID_PRIMITIVE);
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
        // Buffer types are validated by the constructor; output buffers are allocated internally.
        // Handle the empty geometry, write the empty bounds and exit early
        if (positions.length === GEOMETRY_BUFFER_LAYOUT.POSITION_START_INDEX) {
            outMin[MATH_VECTOR3_INDEXES.X] = GEOMETRY_BUFFER_LAYOUT.EMPTY_BOUND_COMPONENT;
            outMin[MATH_VECTOR3_INDEXES.Y] = GEOMETRY_BUFFER_LAYOUT.EMPTY_BOUND_COMPONENT;
            outMin[MATH_VECTOR3_INDEXES.Z] = GEOMETRY_BUFFER_LAYOUT.EMPTY_BOUND_COMPONENT;
            outMax[MATH_VECTOR3_INDEXES.X] = GEOMETRY_BUFFER_LAYOUT.EMPTY_BOUND_COMPONENT;
            outMax[MATH_VECTOR3_INDEXES.Y] = GEOMETRY_BUFFER_LAYOUT.EMPTY_BOUND_COMPONENT;
            outMax[MATH_VECTOR3_INDEXES.Z] = GEOMETRY_BUFFER_LAYOUT.EMPTY_BOUND_COMPONENT;
            return;
        }

        // Initialize min/max accumulators for the AABB-computation
        let minX = GEOMETRY_BUFFER_LAYOUT.BOUND_MIN_INIT;
        let minY = GEOMETRY_BUFFER_LAYOUT.BOUND_MIN_INIT;
        let minZ = GEOMETRY_BUFFER_LAYOUT.BOUND_MIN_INIT;
        let maxX = GEOMETRY_BUFFER_LAYOUT.BOUND_MAX_INIT;
        let maxY = GEOMETRY_BUFFER_LAYOUT.BOUND_MAX_INIT;
        let maxZ = GEOMETRY_BUFFER_LAYOUT.BOUND_MAX_INIT;

        for (let index = GEOMETRY_BUFFER_LAYOUT.POSITION_START_INDEX; index < positions.length; index += GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT) {
            const x = positions[index + MATH_VECTOR3_INDEXES.X];
            const y = positions[index + MATH_VECTOR3_INDEXES.Y];
            const z = positions[index + MATH_VECTOR3_INDEXES.Z];

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

        // Write the computed AABB bounds to the output buffers
        outMin[MATH_VECTOR3_INDEXES.X] = minX;
        outMin[MATH_VECTOR3_INDEXES.Y] = minY;
        outMin[MATH_VECTOR3_INDEXES.Z] = minZ;
        outMax[MATH_VECTOR3_INDEXES.X] = maxX;
        outMax[MATH_VECTOR3_INDEXES.Y] = maxY;
        outMax[MATH_VECTOR3_INDEXES.Z] = maxZ;
    }

    /**
     * Configures the VAO with position (and optional color/uv) attribute pointers.
     *
     * @private
     */
    #configureVertexArray() {
        const webglContext = this.#webglContext;
        webglContext.bindVertexArray(this.#vertexArrayObject);

        this.#configureAttribute(
            this.#positionBuffer,
            GEOMETRY_BUFFER_LAYOUT.POSITION_ATTRIBUTE_LOCATION,
            GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT
        );

        if (this.#colorBuffer) {
            this.#configureAttribute(
                this.#colorBuffer,
                GEOMETRY_BUFFER_LAYOUT.COLOR_ATTRIBUTE_LOCATION,
                GEOMETRY_LAYOUT.COLOR_COMPONENT_COUNT
            );
        }

        if (this.#uvBuffer) {
            this.#configureAttribute(
                this.#uvBuffer,
                GEOMETRY_BUFFER_LAYOUT.UV_ATTRIBUTE_LOCATION,
                GEOMETRY_LAYOUT.UV_COMPONENT_COUNT
            );
        }

        if (this.#normalBuffer) {
            this.#configureAttribute(
                this.#normalBuffer,
                GEOMETRY_BUFFER_LAYOUT.NORMAL_ATTRIBUTE_LOCATION,
                GEOMETRY_LAYOUT.NORMAL_COMPONENT_COUNT
            );
        }

        webglContext.bindBuffer(webglContext.ELEMENT_ARRAY_BUFFER, this.#indexBufferSolid);
        webglContext.bindVertexArray(null);
    }

    /**
     * Connects one vertex buffer to its attribute location in the current VAO.
     *
     * @param {WebGLBuffer} buffer    - Attribute buffer.
     * @param {number} location       - Shader attribute location.
     * @param {number} componentCount - Components per vertex.
     * @private
     */
    #configureAttribute(buffer, location, componentCount) {
        const webglContext = this.#webglContext;
        webglContext.bindBuffer(webglContext.ARRAY_BUFFER, buffer);
        webglContext.enableVertexAttribArray(location);
        webglContext.vertexAttribPointer(
            location,
            componentCount,
            webglContext.FLOAT,
            GEOMETRY_BUFFER_LAYOUT.ATTRIBUTE_NORMALIZED,
            GEOMETRY_BUFFER_LAYOUT.ATTRIBUTE_NO_STRIDE,
            GEOMETRY_BUFFER_LAYOUT.ATTRIBUTE_NO_OFFSET
        );
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
