import { GeometryUtils }                            from './geometry-utils.js';
import { GeneratedGeometry }                        from './generated-geometry.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';

import {
    GEOMETRY_DEFAULTS,
    DEFAULT_VERTEX_COLOR,
    GEOMETRY_SIZES,
    GEOMETRY_GRID,
    GEOMETRY_UV
} from '../constants/geometry.js';

import {
    PYRAMID_DEFAULTS,
    PYRAMID_LIMITS,
    PYRAMID_LAYOUT,
    PYRAMID_DIRECTIONS
} from '../constants/pyramid-geometry.js';

/**
 * Pyramid geometry options.
 *
 * `width` is the base size along X.
 * `depth` (optional) is the base size along Z.
 *
 * If `depth` is not provided, it defaults to `width` (square base).
 *
 * `colors` supports:
 * - Uniform RGB    (`length === 3`)
 * - Per-vertex RGB (`length === vertexCount * 3`)
 *
 * Segment parameters must be integers `>= 1`.
 *
 * @typedef {Object} PyramidGeometryOptions
 * @property {number} [width = 1.0]                        - Base width along X.
 * @property {number} [height = 1.5]                       - Pyramid height along Y.
 * @property {number} [depth = width]                      - Base depth along Z.
 * @property {number} [widthSegments = 1]                  - Subdivisions along X (base grid and faces that use X edges).
 * @property {number} [depthSegments = 1]                  - Subdivisions along Z (base grid and faces that use Z edges).
 * @property {number} [heightSegments = 1]                 - Subdivisions along side height.
 * @property {boolean} [capped = GEOMETRY_DEFAULTS.CAPPED] - Whether to generate the bottom face.
 * @property {Float32Array} [colors]                       - Color specification buffer.
 */

/**
 * Internal geometry buffers produced by `PyramidGeometry`.
 *
 * @typedef {Object} PyramidGeometryData
 * @property {Float32Array} positions                     - Vertex positions (xyz).
 * @property {Float32Array} normals                       - Vertex normals (xyz).
 * @property {Float32Array} uvs                           - Vertex UVs (uv).
 * @property {Float32Array} colors                        - Vertex colors (rgb).
 * @property {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Line index buffer for wireframe.
 */

/**
 * Small result object returned by base appender.
 *
 * @typedef {Object} PyramidBaseAppendResult
 * @property {number} vertexCount - Number of vertices appended for the base.
 */

/**
 * Segmented pyramid geometry with a rectangular base and 4 planar side faces.
 * Side faces use flat normals (sharp edges).
 */
export class PyramidGeometry extends GeneratedGeometry {

    /**
     * Normalizes constructor input to a `PyramidGeometryOptions` object.
     *
     * @param {PyramidGeometryOptions} options     - Options object.
     * @returns {Required<PyramidGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError('PyramidGeometry expects options as an object.');
        }

        const {
            width          = PYRAMID_DEFAULTS.WIDTH,
            height         = PYRAMID_DEFAULTS.HEIGHT,
            depth          = width,
            widthSegments  = PYRAMID_DEFAULTS.BASE_SEGMENT_COUNT,
            depthSegments  = widthSegments,
            heightSegments = PYRAMID_DEFAULTS.HEIGHT_SEGMENT_COUNT,
            capped         = GEOMETRY_DEFAULTS.CAPPED,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof height !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof depth  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError('PyramidGeometry expects width, height or depth as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('PyramidGeometry expects finite width, height or depth.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('PyramidGeometry expects colors as a Float32Array.');
        }

        return {
            width,
            height,
            depth,
            widthSegments  : GeometryUtils.normalizeSegmentCount(widthSegments, 'widthSegments', PYRAMID_LIMITS.MIN_SEGMENT_COUNT, 'PyramidGeometry'),
            depthSegments  : GeometryUtils.normalizeSegmentCount(depthSegments, 'depthSegments', PYRAMID_LIMITS.MIN_SEGMENT_COUNT, 'PyramidGeometry'),
            heightSegments : GeometryUtils.normalizeSegmentCount(heightSegments, 'heightSegments', PYRAMID_LIMITS.MIN_SEGMENT_COUNT, 'PyramidGeometry'),
            capped         : Boolean(capped),
            colors
        };
    }

    /**
     * Generates vertex and index buffers from construction options.
     *
     * @param {PyramidGeometryOptions} [options] - Geometry options.
     * @returns {PyramidGeometryData}            - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        const normalized = PyramidGeometry.#normalizeOptions(options);
        const buffers    = { positions: [], normals: [], uvs: [], indicesSolid: [] };
        let vertexOffset = MATH_COMMON_VALUES.ZERO;

        if (normalized.capped) {
            vertexOffset = PyramidGeometry.#appendBottom(buffers, normalized);
        }

        const vertexCount      = PyramidGeometry.#appendSides(buffers, normalized, vertexOffset);
        const indicesSolid     = GeometryUtils.createIndexArray(vertexCount, buffers.indicesSolid);
        const indicesWireframe = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
        const colors           = GeometryUtils.createColorsFromSpec(vertexCount, normalized.colors);

        return {
            positions : new Float32Array(buffers.positions),
            normals   : new Float32Array(buffers.normals),
            uvs       : new Float32Array(buffers.uvs),
            colors,
            indicesSolid,
            indicesWireframe
        };
    }

    /**
     * Appends a bottom base grid `XZ plane` with a `-Y` normal.
     *
     * @param {number[]} positions        - Output positions (flat vec3).
     * @param {number[]} normals          - Output normals (flat vec3).
     * @param {number[]} uvs              - Output UVs (flat vec2).
     * @param {number[]} indicesSolid     - Output solid indices.
     * @param {number} vertexOffset       - Starting vertex index.
     * @param {number} halfWidth          - Half base width.
     * @param {number} halfDepth          - Half base depth.
     * @param {number} halfHeight         - Half pyramid height.
     * @param {number} widthSegments      - Base subdivisions along X.
     * @param {number} depthSegments      - Base subdivisions along Z.
     * @returns {PyramidBaseAppendResult} - Base append result.
     * @private
     */
    static #appendBase(
        positions,
        normals,
        uvs,
        indicesSolid,
        vertexOffset,
        halfWidth,
        halfDepth,
        halfHeight,
        widthSegments,
        depthSegments
    ) {
        const centerOffset = GEOMETRY_GRID.CENTER_OFFSET;
        const zeroValue    = MATH_COMMON_VALUES.ZERO;
        const xSegments    = widthSegments;
        const zSegments    = depthSegments;
        const xVertexCount = xSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const zVertexCount = zSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const baseY        = -halfHeight;
        const fullWidth    = halfWidth * GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const fullDepth    = halfDepth * GEOMETRY_SIZES.HALF_SIZE_DIVISOR;

        for (let zIndex = MATH_COMMON_VALUES.ZERO; zIndex < zVertexCount; zIndex += MATH_COMMON_VALUES.UNIT) {
            const vNormalized = zIndex / zSegments;
            const positionZ   = (vNormalized - centerOffset) * fullDepth;

            for (let xIndex = MATH_COMMON_VALUES.ZERO; xIndex < xVertexCount; xIndex += MATH_COMMON_VALUES.UNIT) {
                const uNormalized = xIndex / xSegments;
                const positionX   = (uNormalized - centerOffset) * fullWidth;
                positions.push(positionX, baseY, positionZ);
                normals.push(zeroValue, PYRAMID_LAYOUT.NEGATIVE_ONE_VALUE, zeroValue);
                uvs.push(uNormalized, GEOMETRY_UV.V_FLIP_BASE - vNormalized);
            }
        }

        GeometryUtils.appendGridTriangleIndices(indicesSolid, xSegments, zSegments, vertexOffset, true);
        return { vertexCount: xVertexCount * zVertexCount };
    }

    /**
     * Appends a single planar side face subdivided into a grid.
     * The face uses a flat normal (sharp edges).
     *
     * @param {Object} buffers        - Output vertex and index lists.
     * @param {number} vertexOffset   - Starting vertex index.
     * @param {number[]} baseStart    - Base edge start point [x, y, z].
     * @param {number[]} baseEnd      - Base edge end point [x, y, z].
     * @param {number[]} apex         - Apex point [x, y, z].
     * @param {number} edgeSegments   - Subdivisions along the base edge.
     * @param {number} heightSegments - Subdivisions along the face height.
     * @param {number[]} outwardHint  - Expected outward direction hint.
     * @returns {number}              - Number of vertices appended.
     * @private
     */
    static #appendSideFace(buffers, vertexOffset, baseStart, baseEnd, apex, edgeSegments, heightSegments, outwardHint) {
        const { positions, normals, uvs, indicesSolid } = buffers;
        const vertexIncrement  = GEOMETRY_GRID.VERTEX_INCREMENT;
        const nextVertexOffset = GEOMETRY_GRID.NEXT_VERTEX_OFFSET;
        let edgeStart          = baseStart;
        let edgeEnd            = baseEnd;
        let faceNormal         = PyramidGeometry.#computeFaceNormal(edgeStart, edgeEnd, apex);

        if (PyramidGeometry.#dot(faceNormal, outwardHint) < MATH_COMMON_VALUES.ZERO) {
            edgeStart  = baseEnd;
            edgeEnd    = baseStart;
            faceNormal = PyramidGeometry.#computeFaceNormal(edgeStart, edgeEnd, apex);
        }

        const edgeVertexCount = edgeSegments + vertexIncrement;
        const ringCount       = heightSegments;
        const faceVertexCount = (ringCount * edgeVertexCount) + vertexIncrement;

        for (let ringIndex = MATH_COMMON_VALUES.ZERO; ringIndex < ringCount; ringIndex += MATH_COMMON_VALUES.UNIT) {
            const heightNormalized = ringIndex / heightSegments;
            const rowStart         = PyramidGeometry.#lerp3(edgeStart, apex, heightNormalized);
            const rowEnd           = PyramidGeometry.#lerp3(edgeEnd, apex, heightNormalized);

            for (let edgeIndex = MATH_COMMON_VALUES.ZERO; edgeIndex < edgeVertexCount; edgeIndex += MATH_COMMON_VALUES.UNIT) {
                const edgeNormalized = edgeIndex / edgeSegments;
                const point          = PyramidGeometry.#lerp3(rowStart, rowEnd, edgeNormalized);
                positions.push(point[MATH_VECTOR3_INDEXES.X], point[MATH_VECTOR3_INDEXES.Y], point[MATH_VECTOR3_INDEXES.Z]);
                normals.push(faceNormal[MATH_VECTOR3_INDEXES.X], faceNormal[MATH_VECTOR3_INDEXES.Y], faceNormal[MATH_VECTOR3_INDEXES.Z]);
                uvs.push(edgeNormalized, GEOMETRY_UV.V_FLIP_BASE - heightNormalized);
            }
        }

        positions.push(apex[MATH_VECTOR3_INDEXES.X], apex[MATH_VECTOR3_INDEXES.Y], apex[MATH_VECTOR3_INDEXES.Z]);
        normals.push(faceNormal[MATH_VECTOR3_INDEXES.X], faceNormal[MATH_VECTOR3_INDEXES.Y], faceNormal[MATH_VECTOR3_INDEXES.Z]);
        uvs.push(PYRAMID_LAYOUT.APEX_UV_U, PYRAMID_LAYOUT.APEX_UV_V);

        const apexVertexIndex = vertexOffset + faceVertexCount - vertexIncrement;
        GeometryUtils.appendGridTriangleIndices(indicesSolid, edgeSegments, ringCount - vertexIncrement, vertexOffset);
        const topRingStartVertexIndex = vertexOffset + ((ringCount - vertexIncrement) * edgeVertexCount);

        for (let edgeIndex = MATH_COMMON_VALUES.ZERO; edgeIndex < edgeSegments; edgeIndex += MATH_COMMON_VALUES.UNIT) {
            const topLeftVertexIndex  = topRingStartVertexIndex + edgeIndex;
            const topRightVertexIndex = topLeftVertexIndex + nextVertexOffset;
            indicesSolid.push(topLeftVertexIndex, apexVertexIndex, topRightVertexIndex);
        }

        return faceVertexCount;
    }

    /**
     * Computes a normalized face normal from 3 points.
     *
     * @param {number[]} pointA - Point A [x, y, z].
     * @param {number[]} pointB - Point B [x, y, z].
     * @param {number[]} pointC - Point C [x, y, z].
     * @returns {number[]}      - Normalized normal vector [x, y, z].
     * @private
     */
    static #computeFaceNormal(pointA, pointB, pointC) {
        const vectorAB = [
            pointB[MATH_VECTOR3_INDEXES.X] - pointA[MATH_VECTOR3_INDEXES.X],
            pointB[MATH_VECTOR3_INDEXES.Y] - pointA[MATH_VECTOR3_INDEXES.Y],
            pointB[MATH_VECTOR3_INDEXES.Z] - pointA[MATH_VECTOR3_INDEXES.Z]
        ];

        const vectorAC = [
            pointC[MATH_VECTOR3_INDEXES.X] - pointA[MATH_VECTOR3_INDEXES.X],
            pointC[MATH_VECTOR3_INDEXES.Y] - pointA[MATH_VECTOR3_INDEXES.Y],
            pointC[MATH_VECTOR3_INDEXES.Z] - pointA[MATH_VECTOR3_INDEXES.Z]
        ];

        const normalX0 = (vectorAB[MATH_VECTOR3_INDEXES.Y] * vectorAC[MATH_VECTOR3_INDEXES.Z]) - (vectorAB[MATH_VECTOR3_INDEXES.Z] * vectorAC[MATH_VECTOR3_INDEXES.Y]);
        const normalY0 = (vectorAB[MATH_VECTOR3_INDEXES.Z] * vectorAC[MATH_VECTOR3_INDEXES.X]) - (vectorAB[MATH_VECTOR3_INDEXES.X] * vectorAC[MATH_VECTOR3_INDEXES.Z]);
        const normalZ0 = (vectorAB[MATH_VECTOR3_INDEXES.X] * vectorAC[MATH_VECTOR3_INDEXES.Y]) - (vectorAB[MATH_VECTOR3_INDEXES.Y] * vectorAC[MATH_VECTOR3_INDEXES.X]);
        const inverseNormalLength = PyramidGeometry.#inverseLength(normalX0, normalY0, normalZ0);
        return [normalX0 * inverseNormalLength, normalY0 * inverseNormalLength, normalZ0 * inverseNormalLength];
    }

    /**
     * Linear interpolation between points A and B.
     *
     * @param {number[]} pointA            - Point A [x, y, z].
     * @param {number[]} pointB            - Point B [x, y, z].
     * @param {number} interpolationFactor - Interpolation factor.
     * @returns {number[]}                 - Interpolated point [x, y, z].
     * @private
     */
    static #lerp3(pointA, pointB, interpolationFactor) {
        return [
            pointA[MATH_VECTOR3_INDEXES.X] + ((pointB[MATH_VECTOR3_INDEXES.X] - pointA[MATH_VECTOR3_INDEXES.X]) * interpolationFactor),
            pointA[MATH_VECTOR3_INDEXES.Y] + ((pointB[MATH_VECTOR3_INDEXES.Y] - pointA[MATH_VECTOR3_INDEXES.Y]) * interpolationFactor),
            pointA[MATH_VECTOR3_INDEXES.Z] + ((pointB[MATH_VECTOR3_INDEXES.Z] - pointA[MATH_VECTOR3_INDEXES.Z]) * interpolationFactor)
        ];
    }

    /**
     * Dot product of two `vec3` arrays.
     *
     * @param {number[]} vectorA - Vector A.
     * @param {number[]} vectorB - Vector B.
     * @returns {number}         - Dot product.
     * @private
     */
    static #dot(vectorA, vectorB) {
        return (
            (vectorA[MATH_VECTOR3_INDEXES.X] * vectorB[MATH_VECTOR3_INDEXES.X]) +
            (vectorA[MATH_VECTOR3_INDEXES.Y] * vectorB[MATH_VECTOR3_INDEXES.Y]) +
            (vectorA[MATH_VECTOR3_INDEXES.Z] * vectorB[MATH_VECTOR3_INDEXES.Z])
        );
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
     * Appends the optional bottom grid before the side faces.
     *
     * @param {Object} buffers                           - Output vertex and index lists.
     * @param {Required<PyramidGeometryOptions>} options - Normalized geometry options.
     * @returns {number} - Number of base vertices.
     * @private
     */
    static #appendBottom(buffers, options) {
        const divisor = GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const result  = PyramidGeometry.#appendBase(
            buffers.positions,
            buffers.normals,
            buffers.uvs,
            buffers.indicesSolid,
            MATH_COMMON_VALUES.ZERO,
            options.width / divisor,
            options.depth / divisor,
            options.height / divisor,
            options.widthSegments,
            options.depthSegments
        );

        return result.vertexCount;
    }

    /**
     * Appends the front, right, back and left faces in their existing order.
     *
     * @param {Object} buffers                           - Output vertex and index lists.
     * @param {Required<PyramidGeometryOptions>} options - Normalized geometry options.
     * @param {number} vertexOffset                      - First side vertex.
     * @returns {number}                                 - Total vertex count after appending all sides.
     * @private
     */
    static #appendSides(buffers, options, vertexOffset) {
        const divisor        = GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const halfWidth      = options.width / divisor;
        const halfDepth      = options.depth / divisor;
        const halfHeight     = options.height / divisor;
        const apex           = [MATH_COMMON_VALUES.ZERO, halfHeight, MATH_COMMON_VALUES.ZERO];
        const frontLeft      = [-halfWidth, -halfHeight,  halfDepth];
        const frontRight     = [ halfWidth, -halfHeight,  halfDepth];
        const backRight      = [ halfWidth, -halfHeight, -halfDepth];
        const backLeft       = [-halfWidth, -halfHeight, -halfDepth];
        const heightSegments = options.heightSegments;

        const appendFace = (firstCorner, secondCorner, segmentCount, direction) => {
            vertexOffset += PyramidGeometry.#appendSideFace(
                buffers,
                vertexOffset,
                firstCorner,
                secondCorner,
                apex,
                segmentCount,
                heightSegments,
                direction
            );
        };

        appendFace(frontLeft, frontRight, options.widthSegments, PYRAMID_DIRECTIONS.FRONT);
        appendFace(frontRight, backRight, options.depthSegments, PYRAMID_DIRECTIONS.RIGHT);
        appendFace(backRight, backLeft, options.widthSegments, PYRAMID_DIRECTIONS.BACK);
        appendFace(backLeft, frontLeft, options.depthSegments, PYRAMID_DIRECTIONS.LEFT);
        return vertexOffset;
    }
}
