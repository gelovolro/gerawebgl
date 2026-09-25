import { GeneratedGeometry }                        from './generated-geometry.js';
import { GeometryUtils }                            from './geometry-utils.js';
import { MATH_VECTOR3_INDEXES, MATH_COMMON_VALUES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';
import { SPHERE_DEFAULTS, SPHERE_LIMITS }           from '../constants/sphere-geometry.js';

import {
    DEFAULT_VERTEX_COLOR,
    GEOMETRY_SIZES,
    GEOMETRY_GRID,
    GEOMETRY_LAYOUT,
    GEOMETRY_ANGLES,
    GEOMETRY_UV_INDEXES,
    GEOMETRY_UV
} from '../constants/geometry.js';

/**
 * Sphere geometry options.
 *
 * `width, height or depth` define full extents (diameters). Use equal values for a perfect sphere.
 *
 * `colors` supports:
 * - Uniform RGB    (`length === 3`)
 * - Per-vertex RGB (`length === vertexCount * 3`)
 *
 * Segment parameters must be integers:
 * - `widthSegments  >= 3`
 * - `heightSegments >= 2`
 *
 * @typedef {Object} SphereGeometryOptions
 * @property {number} [width = 1.0]         - Diameter along X axis.
 * @property {number} [height = 1.0]        - Diameter along Y axis.
 * @property {number} [depth = 1.0]         - Diameter along Z axis.
 * @property {number} [widthSegments = 24]  - Longitudinal segments.
 * @property {number} [heightSegments = 16] - Latitudinal segments.
 * @property {Float32Array} [colors]        - Color specification buffer.
 */

/**
 * Internal geometry buffers produced by `SphereGeometry`.
 *
 * @typedef {Object} SphereGeometryData
 * @property {Float32Array} positions                     - Vertex positions (xyz).
 * @property {Float32Array} normals                       - Vertex normals (xyz).
 * @property {Float32Array} uvs                           - Vertex UVs (uv).
 * @property {Float32Array} colors                        - Vertex colors (rgb).
 * @property {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Line index buffer for wireframe.
 */

/**
 * Segmented UV sphere geometry. Supports ellipsoid sizes via `width, height or depth`.
 */
export class SphereGeometry extends GeneratedGeometry {

    /**
     * Normalizes constructor input to a `SphereGeometryOptions` object.
     *
     * @param {SphereGeometryOptions} options     - Options object.
     * @returns {Required<SphereGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError('SphereGeometry expects options as an object.');
        }

        const {
            width          = SPHERE_DEFAULTS.WIDTH,
            height         = SPHERE_DEFAULTS.HEIGHT,
            depth          = SPHERE_DEFAULTS.DEPTH,
            widthSegments  = SPHERE_DEFAULTS.WIDTH_SEGMENTS,
            heightSegments = SPHERE_DEFAULTS.HEIGHT_SEGMENTS,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof height !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof depth  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError('SphereGeometry expects width, height or depth as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('SphereGeometry expects finite width, height or depth.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('SphereGeometry expects colors as a Float32Array.');
        }

        return {
            width,
            height,
            depth,
            widthSegments  : GeometryUtils.normalizeSegmentCount(widthSegments, 'widthSegments', SPHERE_LIMITS.MIN_WIDTH_SEGMENT_COUNT, 'SphereGeometry'),
            heightSegments : GeometryUtils.normalizeSegmentCount(heightSegments, 'heightSegments', SPHERE_LIMITS.MIN_HEIGHT_SEGMENT_COUNT, 'SphereGeometry'),
            colors
        };
    }

    /**
     * Generates vertex and index buffers from construction options.
     *
     * @param {SphereGeometryOptions} [options] - Geometry options.
     * @returns {SphereGeometryData}            - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const normalized             = SphereGeometry.#normalizeOptions(options);
        const widthSegments          = normalized.widthSegments;
        const heightSegments         = normalized.heightSegments;
        const widthVertexCount       = widthSegments  + GEOMETRY_GRID.VERTEX_INCREMENT;
        const heightVertexCount      = heightSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const vertexCount            = widthVertexCount * heightVertexCount;
        const positions              = new Float32Array(vertexCount * positionComponentCount);
        const normals                = new Float32Array(vertexCount * positionComponentCount);
        const uvs                    = new Float32Array(vertexCount * uvComponentCount);

        SphereGeometry.#writeVertices(positions, normals, uvs, normalized);
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
     * Computes inverse vector length `(1 / sqrt(x ^ 2 + y ^ 2 + z ^ 2))`.
     * Returns 0 when the input vector is zero-length.
     *
     * @param {number} x - X component.
     * @param {number} y - Y component.
     * @param {number} z - Z component.
     * @returns {number} - Inverse length.
     * @private
     */
    static #inverseLength(x, y, z) {
        const length = Math.sqrt((x * x) + (y * y) + (z * z));

        if (length === MATH_COMMON_VALUES.ZERO) {
            return MATH_COMMON_VALUES.ZERO;
        }

        return MATH_COMMON_VALUES.UNIT / length;
    }

    /**
     * Writes the grid positions, normals and texture coordinates.
     *
     * @param {Float32Array} positions                     - Output positions.
     * @param {Float32Array} normals                       - Output normals.
     * @param {Float32Array} uvs                           - Output texture coordinates.
     * @param {Required<SphereGeometryOptions>} normalized - Normalized geometry options.
     * @private
     */
    static #writeVertices(positions, normals, uvs, normalized) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;
        const radiusX                = normalized.width  / GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const radiusY                = normalized.height / GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const radiusZ                = normalized.depth  / GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const widthSegments          = normalized.widthSegments;
        const heightSegments         = normalized.heightSegments;
        const widthVertexCount       = widthSegments  + GEOMETRY_GRID.VERTEX_INCREMENT;
        const heightVertexCount      = heightSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        let vertexIndex              = MATH_COMMON_VALUES.ZERO;

        for (let latitudeIndex = MATH_COMMON_VALUES.ZERO; latitudeIndex < heightVertexCount; latitudeIndex += MATH_COMMON_VALUES.UNIT) {
            const vNormalized = latitudeIndex / heightSegments;
            const phiRadians  = vNormalized * Math.PI;
            const sinPhi      = Math.sin(phiRadians);
            const cosPhi      = Math.cos(phiRadians);

            for (let longitudeIndex = MATH_COMMON_VALUES.ZERO; longitudeIndex < widthVertexCount; longitudeIndex += MATH_COMMON_VALUES.UNIT) {
                const uNormalized  = longitudeIndex / widthSegments;
                const thetaRadians = uNormalized * GEOMETRY_ANGLES.FULL_TURN;
                const sinTheta     = Math.sin(thetaRadians);
                const cosTheta     = Math.cos(thetaRadians);
                const positionX    = cosTheta * sinPhi * radiusX;
                const positionY    = cosPhi * radiusY;
                const positionZ    = sinTheta * sinPhi * radiusZ;

                const positionBaseOffset = vertexIndex * positionComponentCount;
                positions[positionBaseOffset + xComponentIndex] = positionX;
                positions[positionBaseOffset + yComponentIndex] = positionY;
                positions[positionBaseOffset + zComponentIndex] = positionZ;

                const normalX0 = (radiusX !== MATH_COMMON_VALUES.ZERO) ? (positionX / (radiusX * radiusX)) : MATH_COMMON_VALUES.ZERO;
                const normalY0 = (radiusY !== MATH_COMMON_VALUES.ZERO) ? (positionY / (radiusY * radiusY)) : MATH_COMMON_VALUES.ZERO;
                const normalZ0 = (radiusZ !== MATH_COMMON_VALUES.ZERO) ? (positionZ / (radiusZ * radiusZ)) : MATH_COMMON_VALUES.ZERO;

                const inverseNormalLength = SphereGeometry.#inverseLength(normalX0, normalY0, normalZ0);
                normals[positionBaseOffset + xComponentIndex] = normalX0 * inverseNormalLength;
                normals[positionBaseOffset + yComponentIndex] = normalY0 * inverseNormalLength;
                normals[positionBaseOffset + zComponentIndex] = normalZ0 * inverseNormalLength;

                const uvBaseOffset = vertexIndex * uvComponentCount;
                uvs[uvBaseOffset + GEOMETRY_UV_INDEXES.U] = uNormalized;
                uvs[uvBaseOffset + GEOMETRY_UV_INDEXES.V] = GEOMETRY_UV.V_FLIP_BASE - vNormalized;
                vertexIndex += MATH_COMMON_VALUES.UNIT;
            }
        }
    }
}
