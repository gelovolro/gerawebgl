import * as GeometryConstants        from '../constants/geometry.js';
import * as GeometryUtilsConstants   from '../constants/geometry-utils.js';
import { ECMASCRIPT_TYPEOF_RESULTS } from '../constants/ecmascript-types.js';

/**
 * Utility class for geometry color and index buffers.
 *
 * Provides static methods for:
 * - expanding a uniform RGB color into a per-vertex buffer
 * - choosing between 16-bit and 32-bit index buffers
 * - generating sequential vertex indexes
 * - extracting unique wireframe edges from triangle indexes
 */
export class GeometryUtils {
    /**
     * Creates a per-vertex RGB buffer from a uniform color or an existing color buffer.
     * A positive `expectedPerVertexLength` overrides the length derived from `vertexCount`.
     *
     * @param {number} vertexCount                   - Total vertex count.
     * @param {Float32Array} colors                  - Uniform RGB color or per-vertex colors.
     * @param {number} [expectedPerVertexLength = 0] - Optional explicit expected buffer length.
     * @returns {Float32Array}                       - A new uniform-color buffer or the supplied per-vertex buffer.
     * @throws {TypeError}                             When colors have an unsupported type or length.
     */
    static createColorsFromSpec(
        vertexCount,
        colors,
        expectedPerVertexLength = GeometryUtilsConstants.GEOMETRY_COLORS.AUTO_LENGTH
    ) {
        if (!(colors instanceof Float32Array)) {
            throw new TypeError('GeometryUtils.createColorsFromSpec expects colors as a Float32Array.');
        }

        const colorConstants  = GeometryUtilsConstants.GEOMETRY_COLORS;
        const colorIndexes    = GeometryConstants.GEOMETRY_COLOR_INDEXES;
        const indexConstants  = GeometryUtilsConstants.GEOMETRY_INDICES;
        const perVertexLength = expectedPerVertexLength > colorConstants.AUTO_LENGTH
            ? expectedPerVertexLength
            : (vertexCount * colorConstants.COMPONENT_COUNT);

        // Repeat the same RGB color for every vertex in a new buffer
        if (colors.length === colorConstants.COMPONENT_COUNT) {
            const colorBuffer = new Float32Array(perVertexLength);

            for (
                let index = indexConstants.FIRST_VERTEX_INDEX;
                index < vertexCount;
                index += indexConstants.SEQUENTIAL_INDEX_INCREMENT
            ) {
                const baseIndex = index * colorConstants.COMPONENT_COUNT;
                colorBuffer[baseIndex + colorIndexes.RED]   = colors[colorIndexes.RED];
                colorBuffer[baseIndex + colorIndexes.GREEN] = colors[colorIndexes.GREEN];
                colorBuffer[baseIndex + colorIndexes.BLUE]  = colors[colorIndexes.BLUE];
            }

            return colorBuffer;
        }

        // Reuse the supplied per-vertex buffer without copying its components
        if (colors.length === perVertexLength) {
            return colors;
        }

        /* eslint-disable indent */
        throw new TypeError(
            'GeometryUtils.createColorsFromSpec expects colors length to be {uniform} (uniform) or {vertex} (per-vertex).'
            .replace('{uniform}', String(colorConstants.COMPONENT_COUNT))
            .replace('{vertex}' , String(perVertexLength))
        );
        /* eslint-enable indent */
    }

    /**
     * Creates an index buffer using the smallest type required by the vertex count.
     * The largest vertex index is `vertexCount - 1`.
     *
     * @param {number} vertexCount          - Total vertex count.
     * @param {number[]} indices            - Index list.
     * @returns {Uint16Array | Uint32Array} - A new typed index buffer.
     * @throws {TypeError}                    When indices are not an ordinary array.
     */
    static createIndexArray(vertexCount, indices) {
        if (!Array.isArray(indices)) {
            throw new TypeError('GeometryUtils.createIndexArray expects indices as an array of numbers.');
        }

        const indexConstants = GeometryUtilsConstants.GEOMETRY_INDICES;
        const requiresUint32 =
            (vertexCount - indexConstants.VERTEX_COUNT_TO_MAX_INDEX_OFFSET)
            > indexConstants.MAX_UINT16_INDEX_VALUE;

        if (requiresUint32) {
            return new Uint32Array(indices);
        }

        return new Uint16Array(indices);
    }

    /**
     * Creates a sequential index buffer without an intermediate JavaScript array.
     * The buffer contains every vertex index, from zero through `vertexCount - 1`.
     *
     * @param {number} vertexCount          - Total vertex count.
     * @returns {Uint16Array | Uint32Array} - A new sequential index buffer.
     * @throws {TypeError}                    When `vertexCount` is not a finite number.
     * @throws {RangeError}                   When `vertexCount` is negative or non-integer.
     */
    static createSequentialIndexArray(vertexCount) {
        if (typeof vertexCount !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(vertexCount)) {
            throw new TypeError('GeometryUtils.createSequentialIndexArray expects vertexCount as a finite number.');
        }

        const indexConstants = GeometryUtilsConstants.GEOMETRY_INDICES;

        if (!Number.isInteger(vertexCount) || vertexCount < indexConstants.MIN_VERTEX_COUNT) {
            throw new RangeError('GeometryUtils.createSequentialIndexArray expects vertexCount as a non-negative integer.');
        }

        if (vertexCount === indexConstants.MIN_VERTEX_COUNT) {
            return new Uint16Array(indexConstants.MIN_VERTEX_COUNT);
        }

        const requiresUint32 =
            (vertexCount - indexConstants.VERTEX_COUNT_TO_MAX_INDEX_OFFSET)
            > indexConstants.MAX_UINT16_INDEX_VALUE;

        const indexArray = requiresUint32 ? new Uint32Array(vertexCount) : new Uint16Array(vertexCount);

        for (
            let index = indexConstants.FIRST_VERTEX_INDEX;
            index < vertexCount;
            index += indexConstants.SEQUENTIAL_INDEX_INCREMENT
        ) {
            indexArray[index] = index;
        }

        return indexArray;
    }

    /**
     * Creates a wireframe line index buffer from a solid triangle index buffer.
     * Shared edges are included once, regardless of their direction in each triangle.
     *
     * @param {number} vertexCount                        - Total vertex count.
     * @param {Uint16Array | Uint32Array} triangleIndices - Solid triangle indexes.
     * @returns {Uint16Array | Uint32Array}               - Wireframe indexes, with two indexes per edge.
     * @throws {TypeError}                                  When triangle indices have an unsupported type.
     */
    static createWireframeIndicesFromSolidIndices(vertexCount, triangleIndices) {
        if (!(triangleIndices instanceof Uint16Array) && !(triangleIndices instanceof Uint32Array)) {
            throw new TypeError('GeometryUtils.createWireframeIndicesFromSolidIndices expects indices as Uint16Array or Uint32Array.');
        }

        const indexConstants  = GeometryUtilsConstants.GEOMETRY_INDICES;
        const triangleIndexes = GeometryConstants.GEOMETRY_TRIANGLE_INDEXES;
        const edgeSet         = new Set();
        const lines           = [];

        for (
            let index = indexConstants.FIRST_VERTEX_INDEX;
            index < triangleIndices.length;
            index += indexConstants.TRIANGLE_INDEX_STRIDE
        ) {
            const firstVertexIndex  = triangleIndices[index + triangleIndexes.FIRST];
            const secondVertexIndex = triangleIndices[index + triangleIndexes.SECOND];
            const thirdVertexIndex  = triangleIndices[index + triangleIndexes.THIRD];
            GeometryUtils.#addEdge(edgeSet, lines, firstVertexIndex  , secondVertexIndex);
            GeometryUtils.#addEdge(edgeSet, lines, secondVertexIndex , thirdVertexIndex);
            GeometryUtils.#addEdge(edgeSet, lines, thirdVertexIndex  , firstVertexIndex);
        }

        return GeometryUtils.createIndexArray(vertexCount, lines);
    }

    /**
     * Floors a finite segment count and checks the minimum required by a geometry.
     *
     * @param {number} value        - Requested segment count.
     * @param {string} optionName   - Option name included in errors.
     * @param {number} minimumValue - Minimum supported count.
     * @param {string} geometryName - Geometry class name included in errors.
     * @returns {number}            - Validated integer segment count.
     * @throws {TypeError}            When the value is not a finite number.
     * @throws {RangeError}           When the rounded count is below the minimum.
     */
    static normalizeSegmentCount(value, optionName, minimumValue, geometryName) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(`${geometryName} expects ${optionName} as a finite number.`);
        }

        const segmentCount = Math.floor(value);

        if (segmentCount < minimumValue) {
            throw new RangeError(`${geometryName} expects ${optionName} to be >= ${minimumValue}.`);
        }

        return segmentCount;
    }

    /**
     * Adds an undirected edge to the line list, if it has not already been added.
     * Stores the smaller vertex index first so reversed edges have the same key.
     *
     * @param {Set<string>} edgeSet - Keys of edges already added to the buffer.
     * @param {number[]} lines      - Output line index list.
     * @param {number} indexA       - First vertex index.
     * @param {number} indexB       - Second vertex index.
     * @private
     */
    static #addEdge(edgeSet, lines, indexA, indexB) {
        const minVertexIndex = Math.min(indexA, indexB);
        const maxVertexIndex = Math.max(indexA, indexB);
        const edgeKey = String(minVertexIndex)
            + GeometryUtilsConstants.GEOMETRY_EDGE_KEY_SEPARATOR
            + String(maxVertexIndex);

        if (edgeSet.has(edgeKey)) {
            return;
        }

        edgeSet.add(edgeKey);
        lines.push(minVertexIndex, maxVertexIndex);
    }

    /**
     * Appends triangles for a rectangular vertex grid in row order.
     * Dimensions and offsets come from normalized geometry options.
     *
     * @param {number[]} indices          - Output triangle indexes.
     * @param {number} columnSegments     - Number of cells per row.
     * @param {number} rowSegments        - Number of cell rows.
     * @param {number} [vertexOffset = 0] - First vertex in the grid.
     * @param {boolean} [reverse = false] - Whether to reverse each triangle's winding.
     */
    static appendGridTriangleIndices(
        indices,
        columnSegments,
        rowSegments,
        vertexOffset = GeometryUtilsConstants.GEOMETRY_INDICES.FIRST_VERTEX_INDEX,
        reverse      = false
    ) {
        const firstIndex     = GeometryUtilsConstants.GEOMETRY_INDICES.FIRST_VERTEX_INDEX;
        const increment      = GeometryUtilsConstants.GEOMETRY_INDICES.SEQUENTIAL_INDEX_INCREMENT;
        const rowVertexCount = columnSegments + GeometryConstants.GEOMETRY_GRID.VERTEX_INCREMENT;
        const nextOffset     = GeometryConstants.GEOMETRY_GRID.NEXT_VERTEX_OFFSET;

        for (let rowIndex = firstIndex; rowIndex < rowSegments; rowIndex += increment) {
            for (let columnIndex = firstIndex; columnIndex < columnSegments; columnIndex += increment) {
                const topLeft     = vertexOffset + (rowIndex * rowVertexCount) + columnIndex;
                const topRight    = topLeft + nextOffset;
                const bottomLeft  = topLeft + rowVertexCount;
                const bottomRight = bottomLeft + nextOffset;

                if (reverse) {
                    indices.push(topLeft, topRight, bottomLeft);
                    indices.push(topRight, bottomRight, bottomLeft);
                } else {
                    indices.push(topLeft, bottomLeft, topRight);
                    indices.push(topRight, bottomLeft, bottomRight);
                }
            }
        }
    }
}
