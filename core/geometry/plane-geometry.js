import { GeometryUtils }                            from './geometry-utils.js';
import { GeneratedGeometry }                        from './generated-geometry.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';

import {
    PLANE_DEFAULTS,
    PLANE_LIMITS,
    PLANE_LAYOUT,
    PLANE_NORMALS
} from '../constants/plane-geometry.js';

import {
    DEFAULT_VERTEX_COLOR,
    GEOMETRY_GRID,
    GEOMETRY_LAYOUT,
    GEOMETRY_UV_INDEXES,
    GEOMETRY_UV
} from '../constants/geometry.js';

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
export class PlaneGeometry extends GeneratedGeometry {

    /**
     * Normalizes constructor input to a `PlaneGeometryOptions` object.
     *
     * @param {PlaneGeometryOptions} options     - Options object.
     * @returns {Required<PlaneGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError('PlaneGeometry expects options as an object.');
        }

        const {
            width          = PLANE_DEFAULTS.WIDTH,
            height         = PLANE_DEFAULTS.HEIGHT,
            widthSegments  = PLANE_DEFAULTS.SEGMENT_COUNT,
            heightSegments = PLANE_DEFAULTS.SEGMENT_COUNT,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || typeof height !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError('PlaneGeometry expects width/height as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
            throw new RangeError('PlaneGeometry expects finite width/height.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('PlaneGeometry expects colors as a Float32Array.');
        }

        return {
            width,
            height,
            widthSegments  : GeometryUtils.normalizeSegmentCount(widthSegments, 'widthSegments', PLANE_LIMITS.MIN_SEGMENT_COUNT, 'PlaneGeometry'),
            heightSegments : GeometryUtils.normalizeSegmentCount(heightSegments, 'heightSegments', PLANE_LIMITS.MIN_SEGMENT_COUNT, 'PlaneGeometry'),
            colors
        };
    }

    /**
     * Generates vertex and index buffers from construction options.
     *
     * @param {PlaneGeometryOptions} [options] - Geometry options.
     * @returns {PlaneGeometryData}            - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const normalized             = PlaneGeometry.#normalizeOptions(options);
        const widthSegments          = normalized.widthSegments;
        const heightSegments         = normalized.heightSegments;
        const widthVertexCount       = widthSegments  + GEOMETRY_GRID.VERTEX_INCREMENT;
        const heightVertexCount      = heightSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const vertexCount            = widthVertexCount * heightVertexCount;
        const positions              = new Float32Array(vertexCount * positionComponentCount);
        const normals                = new Float32Array(vertexCount * positionComponentCount);
        const uvs                    = new Float32Array(vertexCount * uvComponentCount);

        PlaneGeometry.#writeVertices(positions, normals, uvs, normalized);
        const solidTriangleIndices = [];
        GeometryUtils.appendGridTriangleIndices(solidTriangleIndices, widthSegments, heightSegments);

        const indicesSolid     = GeometryUtils.createIndexArray(vertexCount, solidTriangleIndices);
        const indicesWireframe = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
        const colors           = GeometryUtils.createColorsFromSpec(vertexCount, normalized.colors);

        return {
            positions,
            normals,
            uvs,
            colors,
            indicesSolid,
            indicesWireframe
        };
    }

    /**
     * Writes the grid positions, normals and texture coordinates.
     *
     * @param {Float32Array} positions                    - Output positions.
     * @param {Float32Array} normals                      - Output normals.
     * @param {Float32Array} uvs                          - Output texture coordinates.
     * @param {Required<PlaneGeometryOptions>} normalized - Normalized geometry options.
     * @private
     */
    static #writeVertices(positions, normals, uvs, normalized) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const centerOffset           = GEOMETRY_GRID.CENTER_OFFSET;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;
        const widthSegments          = normalized.widthSegments;
        const heightSegments         = normalized.heightSegments;
        const widthVertexCount       = widthSegments  + GEOMETRY_GRID.VERTEX_INCREMENT;
        const heightVertexCount      = heightSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        let vertexIndex              = MATH_COMMON_VALUES.ZERO;

        for (let rowIndex = MATH_COMMON_VALUES.ZERO; rowIndex < heightVertexCount; rowIndex += MATH_COMMON_VALUES.UNIT) {
            const vNormalized = rowIndex / heightSegments;
            const positionY   = (vNormalized - centerOffset) * normalized.height;

            for (let columnIndex = MATH_COMMON_VALUES.ZERO; columnIndex < widthVertexCount; columnIndex += MATH_COMMON_VALUES.UNIT) {
                const uNormalized        = columnIndex / widthSegments;
                const positionX          = (uNormalized - centerOffset) * normalized.width;
                const positionBaseOffset = vertexIndex * positionComponentCount;

                positions[positionBaseOffset + xComponentIndex] = positionX;
                positions[positionBaseOffset + yComponentIndex] = positionY;
                positions[positionBaseOffset + zComponentIndex] = PLANE_LAYOUT.Z_POSITION;
                normals[positionBaseOffset + xComponentIndex]   = PLANE_NORMALS.X;
                normals[positionBaseOffset + yComponentIndex]   = PLANE_NORMALS.Y;
                normals[positionBaseOffset + zComponentIndex]   = PLANE_NORMALS.Z;

                const uvBaseOffset = vertexIndex * uvComponentCount;
                uvs[uvBaseOffset + GEOMETRY_UV_INDEXES.U] = uNormalized;
                uvs[uvBaseOffset + GEOMETRY_UV_INDEXES.V] = GEOMETRY_UV.V_FLIP_BASE - vNormalized;
                vertexIndex += MATH_COMMON_VALUES.UNIT;
            }
        }
    }
}
