import { Geometry } from './geometry.js';
import {
    DEFAULT_VERTEX_COLOR,
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default pyramid base width.
 *
 * @type {number}
 */
const DEFAULT_PYRAMID_WIDTH = 1.0;

/**
 * Default pyramid height.
 *
 * @type {number}
 */
const DEFAULT_PYRAMID_HEIGHT = 1.5;

/**
 * Default segment count for base edges.
 *
 * @type {number}
 */
const DEFAULT_BASE_SEGMENT_COUNT = 1;

/**
 * Default segment count along side height.
 *
 * @type {number}
 */
const DEFAULT_HEIGHT_SEGMENT_COUNT = 1;

/**
 * Minimum segment count supported by segmented geometries.
 *
 * @type {number}
 */
const MIN_SEGMENT_COUNT = 1;

/**
 * Divisor used to compute half sizes.
 *
 * @type {number}
 */
const HALF_SIZE_DIVISOR = 2.0;

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
 * Common numeric constants.
 *
 * @type {number}
 */
const ZERO_VALUE = 0.0;

/**
 * Common numeric constants.
 *
 * @type {number}
 */
const ONE_VALUE = 1.0;

/**
 * Common numeric constants.
 *
 * @type {number}
 */
const NEGATIVE_ONE_VALUE = -1.0;

/**
 * Default UV for apex vertex.
 *
 * @type {number}
 */
const APEX_UV_U = 0.5;

/**
 * Default UV for apex vertex.
 *
 * @type {number}
 */
const APEX_UV_V = 0.0;

/**
 * Outward direction hints used to ensure side face normals point outside.
 *
 * @type {number[]}
 */
const OUTWARD_HINT_FRONT = [0.0, 0.0, 1.0];

/**
 * Outward direction hints used to ensure side face normals point outside.
 *
 * @type {number[]}
 */
const OUTWARD_HINT_RIGHT = [1.0, 0.0, 0.0];

/**
 * Outward direction hints used to ensure side face normals point outside.
 *
 * @type {number[]}
 */
const OUTWARD_HINT_BACK = [0.0, 0.0, -1.0];

/**
 * Outward direction hints used to ensure side face normals point outside.
 *
 * @type {number[]}
 */
const OUTWARD_HINT_LEFT = [-1.0, 0.0, 0.0];

/**
 * Pyramid geometry options.
 *
 * `width` is the base size along X. `depth` (optional) is the base size along Z.
 * If `depth` is not provided, it defaults to `width` (square base).
 *
 * `colors` supports:
 * - Uniform RGB    (`length === 3`)
 * - Per-vertex RGB (`length === vertexCount * 3`)
 *
 * Segment parameters must be integers `>= 1`.
 *
 * @typedef {Object} PyramidGeometryOptions
 * @property {number} [width = 1.0]         - Base width along X.
 * @property {number} [height = 1.5]        - Pyramid height along Y.
 * @property {number} [depth = width]       - Base depth along Z.
 * @property {number} [widthSegments = 1]   - Subdivisions along X (base grid and faces that use X edges).
 * @property {number} [depthSegments = 1]   - Subdivisions along Z (base grid and faces that use Z edges).
 * @property {number} [heightSegments = 1]  - Subdivisions along side height.
 * @property {boolean} [capped = true]      - Whether to generate the bottom face.
 * @property {Float32Array} [colors]        - Color specification buffer.
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
export class PyramidGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext   - WebGL2 rendering context.
     * @param {PyramidGeometryOptions} [options = {}] - Geometry options.
     */
    constructor(webglContext, options = {}) {
        const normalized = PyramidGeometry.#normalizeOptions(options);
        const data       = PyramidGeometry.#createGeometryData(normalized);

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
     * Normalizes constructor input to a `PyramidGeometryOptions` object.
     *
     * @param {PyramidGeometryOptions} options     - Options object.
     * @returns {Required<PyramidGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('`PyramidGeometry` expects options as an object.');
        }

        const {
            width          = DEFAULT_PYRAMID_WIDTH,
            height         = DEFAULT_PYRAMID_HEIGHT,
            depth          = width,
            widthSegments  = DEFAULT_BASE_SEGMENT_COUNT,
            depthSegments  = widthSegments,
            heightSegments = DEFAULT_HEIGHT_SEGMENT_COUNT,
            capped         = true,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width !== 'number' || typeof height !== 'number' || typeof depth !== 'number') {
            throw new TypeError('`PyramidGeometry` expects `width/height/depth` as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('`PyramidGeometry` expects finite `width/height/depth`.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`PyramidGeometry` expects colors as a `Float32Array`.');
        }

        return {
            width,
            height,
            depth,
            widthSegments  : PyramidGeometry.#normalizeSegmentCount(widthSegments,  'widthSegments',  MIN_SEGMENT_COUNT),
            depthSegments  : PyramidGeometry.#normalizeSegmentCount(depthSegments,  'depthSegments',  MIN_SEGMENT_COUNT),
            heightSegments : PyramidGeometry.#normalizeSegmentCount(heightSegments, 'heightSegments', MIN_SEGMENT_COUNT),
            capped         : Boolean(capped),
            colors
        };
    }

    /**
     * Normalizes and validates a segment count parameter.
     *
     * @param {number} value      - Segment count.
     * @param {string} optionName - Option name.
     * @param {number} minValue   - Minimal allowed value.
     * @returns {number}          - Integer segment count.
     * @private
     */
    static #normalizeSegmentCount(value, optionName, minValue) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`PyramidGeometry` expects `{name}` as a finite number.'.replace('{name}', optionName));
        }

        const intValue = Math.floor(value);

        if (intValue < minValue) {
            /* eslint-disable indent */
            throw new RangeError(
                '`PyramidGeometry` expects `{name}` to be `>= {min}`.'
                .replace('{name}', optionName)
                .replace('{min}', String(minValue))
            );
            /* eslint-enable indent */
        }

        return intValue;
    }

    /**
     * Creates full geometry data for a segmented pyramid.
     *
     * @param {Required<PyramidGeometryOptions>} options - Normalized options.
     * @returns {PyramidGeometryData}                    - Geometry buffers.
     * @private
     */
    static #createGeometryData(options) {
        const halfWidth  = options.width  / HALF_SIZE_DIVISOR;
        const halfDepth  = options.depth  / HALF_SIZE_DIVISOR;
        const halfHeight = options.height / HALF_SIZE_DIVISOR;

        const apexPoint        = [ZERO_VALUE, halfHeight, ZERO_VALUE];
        const positions        = [];
        const normals          = [];
        const uvs              = [];
        const indicesSolidList = [];
        let vertexOffset = 0;

        // Base (optional):
        if (options.capped) {
            const baseAppendResult = PyramidGeometry.#appendBase(
                positions,
                normals,
                uvs,
                indicesSolidList,
                vertexOffset,
                halfWidth,
                halfDepth,
                halfHeight,
                options.widthSegments,
                options.depthSegments
            );

            vertexOffset += baseAppendResult.vertexCount;
        }

        // Side faces:
        const baseY   = -halfHeight;
        const corners = {
            frontLeft  : [-halfWidth,  baseY,  halfDepth],
            frontRight : [ halfWidth,  baseY,  halfDepth],
            backRight  : [ halfWidth,  baseY, -halfDepth],
            backLeft   : [-halfWidth,  baseY, -halfDepth]
        };

        // Front face (+Z):
        vertexOffset += PyramidGeometry.#appendSideFace(
            positions,
            normals,
            uvs,
            indicesSolidList,
            vertexOffset,
            corners.frontLeft,
            corners.frontRight,
            apexPoint,
            options.widthSegments,
            options.heightSegments,
            OUTWARD_HINT_FRONT
        );

        // Right face (+X):
        vertexOffset += PyramidGeometry.#appendSideFace(
            positions,
            normals,
            uvs,
            indicesSolidList,
            vertexOffset,
            corners.frontRight,
            corners.backRight,
            apexPoint,
            options.depthSegments,
            options.heightSegments,
            OUTWARD_HINT_RIGHT
        );

        // Back face (-Z):
        vertexOffset += PyramidGeometry.#appendSideFace(
            positions,
            normals,
            uvs,
            indicesSolidList,
            vertexOffset,
            corners.backRight,
            corners.backLeft,
            apexPoint,
            options.widthSegments,
            options.heightSegments,
            OUTWARD_HINT_BACK
        );

        // Left face (-X):
        vertexOffset += PyramidGeometry.#appendSideFace(
            positions,
            normals,
            uvs,
            indicesSolidList,
            vertexOffset,
            corners.backLeft,
            corners.frontLeft,
            apexPoint,
            options.depthSegments,
            options.heightSegments,
            OUTWARD_HINT_LEFT
        );

        const vertexCount      = vertexOffset;
        const indicesSolid     = createIndexArray(vertexCount, indicesSolidList);
        const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
        const colors           = createColorsFromSpec(vertexCount, options.colors);

        return {
            positions : new Float32Array(positions),
            normals   : new Float32Array(normals),
            uvs       : new Float32Array(uvs),
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
        const xSegments    = widthSegments;
        const zSegments    = depthSegments;
        const xVertexCount = xSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const zVertexCount = zSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const baseY        = -halfHeight;
        const fullWidth    = halfWidth * HALF_SIZE_DIVISOR;
        const fullDepth    = halfDepth * HALF_SIZE_DIVISOR;

        for (let zIndex = 0; zIndex < zVertexCount; zIndex += 1) {
            const vNormalized = zIndex / zSegments;
            const positionZ   = (vNormalized - CENTER_T_OFFSET) * fullDepth;

            for (let xIndex = 0; xIndex < xVertexCount; xIndex += 1) {
                const uNormalized = xIndex / xSegments;
                const positionX   = (uNormalized - CENTER_T_OFFSET) * fullWidth;
                positions.push(positionX, baseY, positionZ);
                normals.push(ZERO_VALUE, NEGATIVE_ONE_VALUE, ZERO_VALUE);
                uvs.push(uNormalized, UV_V_FLIP_BASE - vNormalized);
            }
        }

        for (let zIndex = 0; zIndex < zSegments; zIndex += 1) {
            for (let xIndex = 0; xIndex < xSegments; xIndex += 1) {
                const topLeftVertexIndex     = vertexOffset + (zIndex * xVertexCount) + xIndex;
                const topRightVertexIndex    = topLeftVertexIndex + NEXT_VERTEX_OFFSET;
                const bottomLeftVertexIndex  = topLeftVertexIndex + xVertexCount;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
                indicesSolid.push(topLeftVertexIndex, topRightVertexIndex, bottomLeftVertexIndex);
                indicesSolid.push(topRightVertexIndex, bottomRightVertexIndex, bottomLeftVertexIndex);
            }
        }

        return { vertexCount: xVertexCount * zVertexCount };
    }

    /**
     * Appends a single planar side face subdivided into a grid.
     * The face uses a flat normal (sharp edges).
     *
     * @param {number[]} positions    - Output positions.
     * @param {number[]} normals      - Output normals.
     * @param {number[]} uvs          - Output UVs.
     * @param {number[]} indicesSolid - Output solid indices.
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
    static #appendSideFace(
        positions,
        normals,
        uvs,
        indicesSolid,
        vertexOffset,
        baseStart,
        baseEnd,
        apex,
        edgeSegments,
        heightSegments,
        outwardHint
    ) {
        let edgeStart  = baseStart;
        let edgeEnd    = baseEnd;
        let faceNormal = PyramidGeometry.#computeFaceNormal(edgeStart, edgeEnd, apex);

        if (PyramidGeometry.#dot(faceNormal, outwardHint) < ZERO_VALUE) {
            edgeStart  = baseEnd;
            edgeEnd    = baseStart;
            faceNormal = PyramidGeometry.#computeFaceNormal(edgeStart, edgeEnd, apex);
        }

        const edgeVertexCount = edgeSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const ringCount       = heightSegments;
        const faceVertexCount = (ringCount * edgeVertexCount) + VERTICES_PER_SEGMENT_INCREMENT;

        for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
            const heightNormalized = ringIndex / heightSegments;
            const rowStart         = PyramidGeometry.#lerp3(edgeStart, apex, heightNormalized);
            const rowEnd           = PyramidGeometry.#lerp3(edgeEnd, apex, heightNormalized);

            for (let edgeIndex = 0; edgeIndex < edgeVertexCount; edgeIndex += 1) {
                const edgeNormalized = edgeIndex / edgeSegments;
                const point          = PyramidGeometry.#lerp3(rowStart, rowEnd, edgeNormalized);
                positions.push(point[0], point[1], point[2]);
                normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
                uvs.push(edgeNormalized, UV_V_FLIP_BASE - heightNormalized);
            }
        }

        positions.push(apex[0], apex[1], apex[2]);
        normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
        uvs.push(APEX_UV_U, APEX_UV_V);

        const apexVertexIndex = vertexOffset + faceVertexCount - VERTICES_PER_SEGMENT_INCREMENT;

        for (let ringIndex = 0; ringIndex < (ringCount - VERTICES_PER_SEGMENT_INCREMENT); ringIndex += 1) {
            const ringStartVertexIndex = vertexOffset + (ringIndex * edgeVertexCount);
            const nextRingVertexIndex  = vertexOffset + ((ringIndex + VERTICES_PER_SEGMENT_INCREMENT) * edgeVertexCount);

            for (let edgeIndex = 0; edgeIndex < edgeSegments; edgeIndex += 1) {
                const topLeftVertexIndex     = ringStartVertexIndex + edgeIndex;
                const topRightVertexIndex    = topLeftVertexIndex + NEXT_VERTEX_OFFSET;
                const bottomLeftVertexIndex  = nextRingVertexIndex + edgeIndex;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
                indicesSolid.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
                indicesSolid.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
            }
        }

        const topRingStartVertexIndex = vertexOffset + ((ringCount - VERTICES_PER_SEGMENT_INCREMENT) * edgeVertexCount);

        for (let edgeIndex = 0; edgeIndex < edgeSegments; edgeIndex += 1) {
            const topLeftVertexIndex  = topRingStartVertexIndex + edgeIndex;
            const topRightVertexIndex = topLeftVertexIndex + NEXT_VERTEX_OFFSET;
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
            pointB[0] - pointA[0],
            pointB[1] - pointA[1],
            pointB[2] - pointA[2]
        ];

        const vectorAC = [
            pointC[0] - pointA[0],
            pointC[1] - pointA[1],
            pointC[2] - pointA[2]
        ];

        const normalX0 = (vectorAB[1] * vectorAC[2]) - (vectorAB[2] * vectorAC[1]);
        const normalY0 = (vectorAB[2] * vectorAC[0]) - (vectorAB[0] * vectorAC[2]);
        const normalZ0 = (vectorAB[0] * vectorAC[1]) - (vectorAB[1] * vectorAC[0]);
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
            pointA[0] + ((pointB[0] - pointA[0]) * interpolationFactor),
            pointA[1] + ((pointB[1] - pointA[1]) * interpolationFactor),
            pointA[2] + ((pointB[2] - pointA[2]) * interpolationFactor)
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
        return (vectorA[0] * vectorB[0]) + (vectorA[1] * vectorB[1]) + (vectorA[2] * vectorB[2]);
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

        if (length === ZERO_VALUE) {
            return ZERO_VALUE;
        }

        return ONE_VALUE / length;
    }
}
