import { Geometry } from './geometry.js';
import {
    DEFAULT_VERTEX_COLOR,
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default plane width.
 *
 * @type {number}
 */
const DEFAULT_PLANE_WIDTH = 1.0;

/**
 * Default plane height.
 *
 * @type {number}
 */
const DEFAULT_PLANE_HEIGHT = 1.0;

/**
 * Default segment count per axis.
 *
 * @type {number}
 */
const DEFAULT_SEGMENT_COUNT = 1;

/**
 * Minimum segment count supported by segmented geometries.
 *
 * @type {number}
 */
const MIN_SEGMENT_COUNT = 1;

/**
 * Adds one vertex per grid intersection, so vertex count along an axis is `segments + 1`.
 *
 * @type {number}
 */
const VERTICES_PER_SEGMENT_INCREMENT = 1;

/**
 * Offset to move from a vertex to the next vertex in the same row.
 *
 * @type {number}
 */
const NEXT_VERTEX_OFFSET = 1;

/**
 * Used to center coordinates around the origin: `(t - 0.5) * size`.
 *
 * @type {number}
 */
const CENTER_T_OFFSET = 0.5;

/**
 * UV/V coordinate is flipped to keep (0, 0) at top-left.
 *
 * @type {number}
 */
const UV_V_FLIP_BASE = 1.0;

/**
 * Plane is on XY plane, so Z is constant.
 *
 * @type {number}
 */
const PLANE_Z_POSITION = 0.0;

/**
 * Number of float components per `vec3` (position/normal).
 *
 * @type {number}
 */
const VEC3_COMPONENT_COUNT = 3;

/**
 * Number of float components per `vec2` (uv).
 *
 * @type {number}
 */
const VEC2_COMPONENT_COUNT = 2;

/**
 * Plane normal components.
 *
 * @type {number}
 */
const PLANE_NORMAL_X = 0.0;

/**
 * Plane normal components.
 *
 * @type {number}
 */
const PLANE_NORMAL_Y = 0.0;

/**
 * Plane normal components.
 *
 * @type {number}
 */
const PLANE_NORMAL_Z = 1.0;

/**
 * Plane geometry options.
 *
 * `colors` supports:
 * - Uniform RGB    (`length === 3`)
 * - Per-vertex RGB (`length === vertexCount * 3`)
 *
 * Segment parameters must be `integers >= 1`.
 *
 * @typedef {Object} PlaneGeometryOptions
 * @property {number} [width = 1.0]        - Plane width along the X axis.
 * @property {number} [height = 1.0]       - Plane height along the Y axis.
 * @property {number} [widthSegments = 1]  - Subdivisions along the X axis.
 * @property {number} [heightSegments = 1] - Subdivisions along the Y axis.
 * @property {Float32Array} [colors]       - Color specification buffer.
 */

/**
 * Internal geometry buffers produced by `PlaneGeometry`.
 *
 * @typedef {Object} PlaneGeometryData
 * @property {Float32Array} positions                     - Vertex positions (xyz).
 * @property {Float32Array} normals                       - Vertex normals (xyz).
 * @property {Float32Array} uvs                           - Vertex UVs (uv).
 * @property {Float32Array} colors                        - Vertex colors (rgb).
 * @property {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Line index buffer for wireframe.
 */

/**
 * Segmented plane geometry on the XY plane with normal pointing towards +Z.
 */
export class PlaneGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {PlaneGeometryOptions} [options = {}] - Geometry options.
     */
    constructor(webglContext, options = {}) {
        const normalized = PlaneGeometry.#normalizeOptions(options);
        const data       = PlaneGeometry.#createGeometryData(normalized);

        super(
            webglContext,
            data.positions,
            data.colors,
            data.indicesSolid,
            data.indicesWireframe,
            data.uvs,
            data.normals
        );
    }

    /**
     * Normalizes constructor input to a `PlaneGeometryOptions` object.
     *
     * @param {PlaneGeometryOptions} options     - Options object.
     * @returns {Required<PlaneGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('`PlaneGeometry` expects options as an object.');
        }

        const {
            width          = DEFAULT_PLANE_WIDTH,
            height         = DEFAULT_PLANE_HEIGHT,
            widthSegments  = DEFAULT_SEGMENT_COUNT,
            heightSegments = DEFAULT_SEGMENT_COUNT,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width !== 'number' || typeof height !== 'number') {
            throw new TypeError('`PlaneGeometry` expects `width/height` as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
            throw new RangeError('`PlaneGeometry` expects finite `width/height`.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`PlaneGeometry` expects colors as a `Float32Array`.');
        }

        return {
            width,
            height,
            widthSegments  : PlaneGeometry.#normalizeSegmentCount(widthSegments,  'widthSegments'),
            heightSegments : PlaneGeometry.#normalizeSegmentCount(heightSegments, 'heightSegments'),
            colors
        };
    }

    /**
     * Normalizes and validates a segment count parameter.
     *
     * @param {number} value      - Segment count value.
     * @param {string} optionName - Name of the option for error messages.
     * @returns {number}          - Normalized integer `>= 1`.
     * @private
     */
    static #normalizeSegmentCount(value, optionName) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`PlaneGeometry` expects `{name}` as a finite number.'.replace('{name}', optionName));
        }

        const intValue = Math.floor(value);

        if (intValue < MIN_SEGMENT_COUNT) {
            /* eslint-disable indent */
            throw new RangeError(
                '`PlaneGeometry` expects `{name}` to be `>= {min}`.'
                .replace('{name}', optionName)
                .replace('{min}', String(MIN_SEGMENT_COUNT))
            );
            /* eslint-enable indent */
        }

        return intValue;
    }

    /**
     * Creates full geometry data for a segmented plane.
     *
     * @param {Required<PlaneGeometryOptions>} options - Normalized options.
     * @returns {PlaneGeometryData}                    - Geometry buffers.
     * @private
     */
    static #createGeometryData(options) {
        const widthSegments     = options.widthSegments;
        const heightSegments    = options.heightSegments;
        const widthVertexCount  = widthSegments  + VERTICES_PER_SEGMENT_INCREMENT;
        const heightVertexCount = heightSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const vertexCount       = widthVertexCount * heightVertexCount;
        const positions         = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const normals           = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const uvs               = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT);
        let vertexIndex = 0;

        for (let rowIndex = 0; rowIndex < heightVertexCount; rowIndex += 1) {
            const vNormalized = rowIndex / heightSegments;
            const positionY   = (vNormalized - CENTER_T_OFFSET) * options.height;

            for (let columnIndex = 0; columnIndex < widthVertexCount; columnIndex += 1) {
                const uNormalized = columnIndex / widthSegments;
                const positionX   = (uNormalized - CENTER_T_OFFSET) * options.width;

                const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT;
                positions[positionBaseOffset + 0] = positionX;
                positions[positionBaseOffset + 1] = positionY;
                positions[positionBaseOffset + 2] = PLANE_Z_POSITION;

                normals[positionBaseOffset + 0] = PLANE_NORMAL_X;
                normals[positionBaseOffset + 1] = PLANE_NORMAL_Y;
                normals[positionBaseOffset + 2] = PLANE_NORMAL_Z;

                const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT;
                uvs[uvBaseOffset + 0] = uNormalized;
                uvs[uvBaseOffset + 1] = UV_V_FLIP_BASE - vNormalized;
                vertexIndex += 1;
            }
        }

        const solidTriangleIndices = [];

        for (let rowIndex = 0; rowIndex < heightSegments; rowIndex += 1) {
            for (let columnIndex = 0; columnIndex < widthSegments; columnIndex += 1) {
                const topLeftVertexIndex     = (rowIndex * widthVertexCount) + columnIndex;
                const topRightVertexIndex    = topLeftVertexIndex    + NEXT_VERTEX_OFFSET;
                const bottomLeftVertexIndex  = topLeftVertexIndex    + widthVertexCount;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
                solidTriangleIndices.push(topLeftVertexIndex , bottomLeftVertexIndex, topRightVertexIndex);
                solidTriangleIndices.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
            }
        }

        const indicesSolid     = createIndexArray(vertexCount, solidTriangleIndices);
        const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
        const colors           = createColorsFromSpec(vertexCount, options.colors);

        return {
            positions,
            normals,
            uvs,
            colors,
            indicesSolid,
            indicesWireframe
        };
    }
}
