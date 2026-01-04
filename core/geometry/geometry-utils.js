/**
 * Default vertex color used by geometry classes, when no explicit colors are provided.
 *
 * @type {Float32Array}
 */
export const DEFAULT_VERTEX_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Number of float components per RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Default value, that indicates auto-detect expected per-vertex color length.
 *
 * @type {number}
 */
const DEFAULT_EXPECTED_PER_VERTEX_COLOR_LENGTH = 0;

/**
 * Sentinel value, that means auto-detect expected per-vertex color buffer length.
 *
 * @type {number}
 */
const AUTO_EXPECTED_PER_VERTEX_COLOR_LENGTH = 0;

/**
 * Smallest vertex index that requires 32-bit element indices.
 * WebGL `UNSIGNED_SHORT` can address indices in range [0..65535].
 *
 * @type {number}
 */
const MAX_UINT16_INDEX_VALUE = 0xFFFF;

/**
 * Index offset to convert a vertex count into the maximum index value.
 * For `vertexCount` vertices, max index is `vertexCount - 1`.
 *
 * @type {number}
 */
const VERTEX_COUNT_TO_MAX_INDEX_OFFSET = 1;

/**
 * Minimum vertex count.
 *
 * @type {number}
 */
const MIN_VERTEX_COUNT = 0;

/**
 * First vertex index.
 *
 * @type {number}
 */
const FIRST_VERTEX_INDEX = 0;

/**
 * Increment value for sequential indices.
 *
 * @type {number}
 */
const SEQUENTIAL_INDEX_INCREMENT = 1;

/**
 * Indices per triangle (3 vertices).
 *
 * @type {number}
 */
const TRIANGLE_INDEX_STRIDE = 3;

/**
 * Separator used to build an undirected edge key string.
 *
 * @type {string}
 */
const EDGE_KEY_SEPARATOR = ',';

/**
 * Creates a per-vertex color buffer from a color specification.
 *
 * @param {number} vertexCount                   - Total vertex count.
 * @param {Float32Array} colors                  - Color specification.
 * @param {number} [expectedPerVertexLength = 0] - Optional explicit expected per-vertex length.
 * @returns {Float32Array}                       - Per-vertex RGB buffer.
 */
export function createColorsFromSpec(vertexCount, colors, expectedPerVertexLength = DEFAULT_EXPECTED_PER_VERTEX_COLOR_LENGTH) {
    if (!(colors instanceof Float32Array)) {
        throw new TypeError('`createColorsFromSpec` expects colors as a `Float32Array`.');
    }

    const perVertexLength = expectedPerVertexLength > AUTO_EXPECTED_PER_VERTEX_COLOR_LENGTH
        ? expectedPerVertexLength
        : (vertexCount * COLOR_COMPONENT_COUNT);

    // Uniform:
    if (colors.length === COLOR_COMPONENT_COUNT) {
        const colorBuffer = new Float32Array(perVertexLength);

        for (let i = 0; i < vertexCount; i += 1) {
            const baseIndex = i * COLOR_COMPONENT_COUNT;
            colorBuffer[baseIndex + 0] = colors[0];
            colorBuffer[baseIndex + 1] = colors[1];
            colorBuffer[baseIndex + 2] = colors[2];
        }

        return colorBuffer;
    }

    // Per-vertex:
    if (colors.length === perVertexLength) {
        return colors;
    }

    /* eslint-disable indent */
    throw new TypeError(
        '`createColorsFromSpec` expects `colors` length to be `{uniform}` (uniform) or `{vertex}` (per-vertex).'
        .replace('{uniform}', String(COLOR_COMPONENT_COUNT))
        .replace('{vertex}' , String(perVertexLength))
    );
    /* eslint-enable indent */
}

/**
 * Chooses the smallest index array type, that can represent the given indices.
 *
 * @param {number} vertexCount          - Total vertex count.
 * @param {number[]} indices            - Index list.
 * @returns {Uint16Array | Uint32Array} - Typed index array.
 */
export function createIndexArray(vertexCount, indices) {
    if (!Array.isArray(indices)) {
        throw new TypeError('`createIndexArray` expects indices as an array of numbers.');
    }

    const requiresUint32 = (vertexCount - VERTEX_COUNT_TO_MAX_INDEX_OFFSET) > MAX_UINT16_INDEX_VALUE;

    if (requiresUint32) {
        return new Uint32Array(indices);
    }

    return new Uint16Array(indices);
}

/**
 * Creates a sequential index buffer without the intermediate JS-arrays.
 *
 * @param {number} vertexCount          - Total vertex count.
 * @returns {Uint16Array | Uint32Array} - Sequential index buffer.
 * @throws {TypeError}  When `vertexCount` is not a finite number.
 * @throws {RangeError} When `vertexCount` is negative or non-integer.
 */
export function createSequentialIndexArray(vertexCount) {
    if (typeof vertexCount !== 'number' || !Number.isFinite(vertexCount)) {
        throw new TypeError('`createSequentialIndexArray` expects `vertexCount` as a finite number.');
    }

    if (!Number.isInteger(vertexCount) || vertexCount < MIN_VERTEX_COUNT) {
        throw new RangeError('`createSequentialIndexArray` expects `vertexCount` as a non-negative integer.');
    }

    if (vertexCount === MIN_VERTEX_COUNT) {
        return new Uint16Array(MIN_VERTEX_COUNT);
    }

    const requiresUint32 = (vertexCount - VERTEX_COUNT_TO_MAX_INDEX_OFFSET) > MAX_UINT16_INDEX_VALUE;
    const indexArray     = requiresUint32 ? new Uint32Array(vertexCount) : new Uint16Array(vertexCount);

    for (let index = FIRST_VERTEX_INDEX; index < vertexCount; index += SEQUENTIAL_INDEX_INCREMENT) {
        indexArray[index] = index;
    }

    return indexArray;
}

/**
 * Creates a wireframe line index buffer from a solid triangle index buffer.
 * This method deduplicates shared edges to keep the line buffer compact.
 *
 * @param {number} vertexCount                        - Total vertex count.
 * @param {Uint16Array | Uint32Array} triangleIndices - Solid triangle indices.
 * @returns {Uint16Array | Uint32Array}               - Wireframe line indices (2 indices per edge).
 */
export function createWireframeIndicesFromSolidIndices(vertexCount, triangleIndices) {
    if (!(triangleIndices instanceof Uint16Array) && !(triangleIndices instanceof Uint32Array)) {
        throw new TypeError('`createWireframeIndicesFromSolidIndices` expects indices as `Uint16Array` or `Uint32Array`.');
    }

    const edgeSet = new Set();
    const lines   = [];

    for (let i = 0; i < triangleIndices.length; i += TRIANGLE_INDEX_STRIDE) {
        const firstVertexIndex  = triangleIndices[i + 0];
        const secondVertexIndex = triangleIndices[i + 1];
        const thirdVertexIndex  = triangleIndices[i + 2];
        addEdge(edgeSet, lines, firstVertexIndex  , secondVertexIndex);
        addEdge(edgeSet, lines, secondVertexIndex , thirdVertexIndex);
        addEdge(edgeSet, lines, thirdVertexIndex  , firstVertexIndex);
    }

    return createIndexArray(vertexCount, lines);
}

/**
 * Adds an undirected edge to the line list, if it was not already added.
 *
 * @param {Set<string>} edgeSet - Edge set used to deduplicate edges.
 * @param {number[]} lines      - Output line index list.
 * @param {number} indexA       - First vertex index.
 * @param {number} indexB       - Second vertex index.
 * @private
 */
function addEdge(edgeSet, lines, indexA, indexB) {
    const minVertexIndex = Math.min(indexA, indexB);
    const maxVertexIndex = Math.max(indexA, indexB);
    const edgeKey        = String(minVertexIndex) + EDGE_KEY_SEPARATOR + String(maxVertexIndex);

    if (edgeSet.has(edgeKey)) {
        return;
    }

    edgeSet.add(edgeKey);
    lines.push(minVertexIndex, maxVertexIndex);
}
