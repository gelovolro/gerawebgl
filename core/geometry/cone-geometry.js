import { Geometry } from './geometry.js';
import {
    DEFAULT_VERTEX_COLOR,
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default cone base diameter along X.
 *
 * @type {number}
 */
const DEFAULT_CONE_WIDTH = 1.0;

/**
 * Default cone height along Y.
 *
 * @type {number}
 */
const DEFAULT_CONE_HEIGHT = 1.5;

/**
 * Default radial segment count.
 *
 * @type {number}
 */
const DEFAULT_RADIAL_SEGMENTS = 24;

/**
 * Default height segment count.
 *
 * @type {number}
 */
const DEFAULT_HEIGHT_SEGMENTS = 1;

/**
 * Minimum allowed radial segment count.
 *
 * @type {number}
 */
const MIN_RADIAL_SEGMENT_COUNT = 3;

/**
 * Minimum allowed height segment count.
 *
 * @type {number}
 */
const MIN_HEIGHT_SEGMENT_COUNT = 1;

/**
 * Divisor used to compute half sizes from full sizes.
 *
 * @type {number}
 */
const HALF_SIZE_DIVISOR = 2.0;

/**
 * Adds one vertex per grid intersection, so vertex count along an axis is `segments + 1`.
 *
 * @type {number}
 */
const VERTICES_PER_SEGMENT_INCREMENT = 1;

/**
 * Offset to move from an index to the next index in the same ring/row.
 *
 * @type {number}
 */
const NEXT_INDEX_OFFSET = 1;

/**
 * UV/V coordinate is flipped to keep (0, 0) at top-left.
 *
 * @type {number}
 */
const UV_V_FLIP_BASE = 1.0;

/**
 * UV center coordinate.
 *
 * @type {number}
 */
const UV_CENTER = 0.5;

/**
 * Constant for `2 * pi`.
 *
 * @type {number}
 */
const TWO_PI = Math.PI * 2.0;

/**
 * Plane-like normal components.
 *
 * @type {number}
 */
const NORMAL_X_ZERO = 0.0;

/**
 * Plane-like normal components.
 *
 * @type {number}
 */
const NORMAL_Z_ZERO = 0.0;

/**
 * Up normal Y.
 *
 * @type {number}
 */
const NORMAL_Y_UP = 1.0;

/**
 * Down normal Y.
 *
 * @type {number}
 */
const NORMAL_Y_DOWN = -1.0;

/**
 * Origin coordinate.
 *
 * @type {number}
 */
const ORIGIN = 0.0;

/**
 * Used in some UV computations.
 *
 * @type {number}
 */
const DOUBLE_SIZE_MULTIPLIER = 2.0;

/**
 * Used in comparisons (e.g. radius checks).
 *
 * @type {number}
 */
const ZERO_VALUE = 0.0;

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
 * Vertex count used, when an optional part is disabled.
 *
 * @type {number}
 */
const ZERO_VERTEX_COUNT = 0;

/**
 * Cone geometry options.
 *
 * `width` is the base diameter along X. `depth` (optional) is the base diameter along Z.
 * If `depth` is not provided, it defaults to `width` (circular base).
 *
 * Segment parameters must be integers:
 * - `radialSegments >= 3`
 * - `heightSegments >= 1`
 *
 * @typedef {Object} ConeGeometryOptions
 * @property {number} [width = 1.0]         - Base diameter along X.
 * @property {number} [height = 1.5]        - Cone height along Y.
 * @property {number} [depth = width]       - Base diameter along Z.
 * @property {number} [radialSegments = 24] - Segments around the base.
 * @property {number} [heightSegments = 1]  - Segments along height.
 * @property {boolean} [capped = true]      - Whether to generate a bottom cap.
 * @property {Float32Array} [colors]        - Color specification buffer.
 */

/**
 * Internal geometry buffers produced by `ConeGeometry`.
 *
 * @typedef {Object} ConeGeometryData
 * @property {Float32Array} positions                     - Vertex positions (xyz).
 * @property {Float32Array} normals                       - Vertex normals (xyz).
 * @property {Float32Array} uvs                           - Vertex UVs (uv).
 * @property {Float32Array} colors                        - Vertex colors (rgb).
 * @property {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Line index buffer for wireframe.
 */

/**
 * Segmented cone geometry (with optional elliptical base and bottom cap).
 */
export class ConeGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {ConeGeometryOptions} [options = {}]  - Geometry options.
     */
    constructor(webglContext, options = {}) {
        const normalized = ConeGeometry.#normalizeOptions(options);
        const data       = ConeGeometry.#createGeometryData(normalized);

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
     * Normalizes constructor input to a `ConeGeometryOptions` object.
     *
     * @param {ConeGeometryOptions} options     - Options object.
     * @returns {Required<ConeGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('`ConeGeometry` expects options as an object.');
        }

        const {
            width          = DEFAULT_CONE_WIDTH,
            height         = DEFAULT_CONE_HEIGHT,
            depth          = width,
            radialSegments = DEFAULT_RADIAL_SEGMENTS,
            heightSegments = DEFAULT_HEIGHT_SEGMENTS,
            capped         = true,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width !== 'number' || typeof height !== 'number' || typeof depth !== 'number') {
            throw new TypeError('`ConeGeometry` expects `width/height/depth` as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('`ConeGeometry` expects finite `width/height/depth`.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`ConeGeometry` expects colors as a `Float32Array`.');
        }

        return {
            width,
            height,
            depth,
            radialSegments : ConeGeometry.#normalizeSegmentCount(radialSegments, 'radialSegments', MIN_RADIAL_SEGMENT_COUNT),
            heightSegments : ConeGeometry.#normalizeSegmentCount(heightSegments, 'heightSegments', MIN_HEIGHT_SEGMENT_COUNT),
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
     * @returns {number}          - Normalized integer segment count.
     * @private
     */
    static #normalizeSegmentCount(value, optionName, minValue) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`ConeGeometry` expects `{name}` as a finite number.'.replace('{name}', optionName));
        }

        const intValue = Math.floor(value);

        if (intValue < minValue) {
            /* eslint-disable indent */
            throw new RangeError(
                '`ConeGeometry` expects `{name}` to be `>= {min}`.'
                .replace('{name}', optionName)
                .replace('{min}', String(minValue))
            );
            /* eslint-enable indent */
        }

        return intValue;
    }

    /**
     * Creates full geometry data for a segmented cone.
     *
     * @param {Required<ConeGeometryOptions>} options - Normalized options.
     * @returns {ConeGeometryData}                    - Geometry buffers.
     * @private
     */
    static #createGeometryData(options) {
        const radiusX         = options.width / HALF_SIZE_DIVISOR;
        const radiusZ         = options.depth / HALF_SIZE_DIVISOR;
        const height          = options.height;
        const radialSegments  = options.radialSegments;
        const heightSegments  = options.heightSegments;
        const ringVertexCount = radialSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const sideRingCount   = heightSegments;
        const sideVertexCount = sideRingCount * ringVertexCount;
        const hasCap          = options.capped;
        const capVertexCount  = hasCap ? (ringVertexCount + VERTICES_PER_SEGMENT_INCREMENT) : ZERO_VERTEX_COUNT;
        const vertexCount     = sideVertexCount + VERTICES_PER_SEGMENT_INCREMENT + capVertexCount;
        const positions       = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const normals         = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const uvs             = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT);
        let vertexIndex = 0;

        for (let heightRingIndex = 0; heightRingIndex < sideRingCount; heightRingIndex += 1) {
            const heightNormalized = heightRingIndex / heightSegments;
            const radiusFactor     = UV_V_FLIP_BASE - heightNormalized;
            const positionY        = ((-height / HALF_SIZE_DIVISOR) + (heightNormalized * height));
            const currentRadiusX   = radiusX * radiusFactor;
            const currentRadiusZ   = radiusZ * radiusFactor;

            for (let radialVertexIndex = 0; radialVertexIndex < ringVertexCount; radialVertexIndex += 1) {
                const uNormalized  = radialVertexIndex / radialSegments;
                const angleRadians = uNormalized * TWO_PI;
                const cosTheta     = Math.cos(angleRadians);
                const sinTheta     = Math.sin(angleRadians);
                const positionX    = cosTheta * currentRadiusX;
                const positionZ    = sinTheta * currentRadiusZ;

                const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT;
                positions[positionBaseOffset + 0] = positionX;
                positions[positionBaseOffset + 1] = positionY;
                positions[positionBaseOffset + 2] = positionZ;

                const normalX0 = radiusZ * height * cosTheta;
                const normalY0 = radiusX * radiusZ;
                const normalZ0 = radiusX * height * sinTheta;
                const inverseNormalLength = ConeGeometry.#inverseLength(normalX0, normalY0, normalZ0);

                normals[positionBaseOffset + 0] = normalX0 * inverseNormalLength;
                normals[positionBaseOffset + 1] = normalY0 * inverseNormalLength;
                normals[positionBaseOffset + 2] = normalZ0 * inverseNormalLength;

                const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT;
                uvs[uvBaseOffset + 0] = uNormalized;
                uvs[uvBaseOffset + 1] = UV_V_FLIP_BASE - heightNormalized;
                vertexIndex += 1;
            }
        }

        const apexIndex = vertexIndex;
        {
            const apexBaseOffset = apexIndex * VEC3_COMPONENT_COUNT;
            positions[apexBaseOffset + 0] = ORIGIN;
            positions[apexBaseOffset + 1] = height / HALF_SIZE_DIVISOR;
            positions[apexBaseOffset + 2] = ORIGIN;

            normals[apexBaseOffset + 0] = NORMAL_X_ZERO;
            normals[apexBaseOffset + 1] = NORMAL_Y_UP;
            normals[apexBaseOffset + 2] = NORMAL_Z_ZERO;

            const apexUvOffset = apexIndex * VEC2_COMPONENT_COUNT;
            uvs[apexUvOffset + 0] = UV_CENTER;
            uvs[apexUvOffset + 1] = ORIGIN;
        }

        vertexIndex += 1;
        const capCenterIndex = vertexIndex;

        if (hasCap) {
            {
                const capCenterBaseOffset = capCenterIndex * VEC3_COMPONENT_COUNT;
                positions[capCenterBaseOffset + 0] = ORIGIN;
                positions[capCenterBaseOffset + 1] = -height / HALF_SIZE_DIVISOR;
                positions[capCenterBaseOffset + 2] = ORIGIN;

                normals[capCenterBaseOffset + 0] = NORMAL_X_ZERO;
                normals[capCenterBaseOffset + 1] = NORMAL_Y_DOWN;
                normals[capCenterBaseOffset + 2] = NORMAL_Z_ZERO;

                const capCenterUvOffset = capCenterIndex * VEC2_COMPONENT_COUNT;
                uvs[capCenterUvOffset + 0] = UV_CENTER;
                uvs[capCenterUvOffset + 1] = UV_CENTER;
            }

            vertexIndex += 1;

            for (let radialVertexIndex = 0; radialVertexIndex < ringVertexCount; radialVertexIndex += 1) {
                const uNormalized  = radialVertexIndex / radialSegments;
                const angleRadians = uNormalized * TWO_PI;
                const cosTheta     = Math.cos(angleRadians);
                const sinTheta     = Math.sin(angleRadians);
                const positionX    = cosTheta * radiusX;
                const positionZ    = sinTheta * radiusZ;

                const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT;
                positions[positionBaseOffset + 0] = positionX;
                positions[positionBaseOffset + 1] = -height / HALF_SIZE_DIVISOR;
                positions[positionBaseOffset + 2] = positionZ;

                normals[positionBaseOffset + 0] = NORMAL_X_ZERO;
                normals[positionBaseOffset + 1] = NORMAL_Y_DOWN;
                normals[positionBaseOffset + 2] = NORMAL_Z_ZERO;

                const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT;

                uvs[uvBaseOffset + 0] = (radiusX === ZERO_VALUE)
                    ? UV_CENTER
                    : ((positionX / (radiusX * DOUBLE_SIZE_MULTIPLIER)) + UV_CENTER);

                uvs[uvBaseOffset + 1] = (radiusZ === ZERO_VALUE)
                    ? UV_CENTER
                    : ((positionZ / (radiusZ * DOUBLE_SIZE_MULTIPLIER)) + UV_CENTER);

                vertexIndex += 1;
            }
        }

        const solidTriangleIndices = [];

        for (let heightRingIndex = 0; heightRingIndex < (sideRingCount - VERTICES_PER_SEGMENT_INCREMENT); heightRingIndex += 1) {
            const currentRingStartIndex = heightRingIndex * ringVertexCount;
            const nextRingStartIndex    = (heightRingIndex + VERTICES_PER_SEGMENT_INCREMENT) * ringVertexCount;

            for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
                const topLeftVertexIndex     = currentRingStartIndex + radialIndex;
                const topRightVertexIndex    = topLeftVertexIndex + NEXT_INDEX_OFFSET;
                const bottomLeftVertexIndex  = nextRingStartIndex + radialIndex;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_INDEX_OFFSET;
                solidTriangleIndices.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
                solidTriangleIndices.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
            }
        }

        const topRingStartIndex = (sideRingCount - VERTICES_PER_SEGMENT_INCREMENT) * ringVertexCount;

        for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
            const topLeftVertexIndex  = topRingStartIndex + radialIndex;
            const topRightVertexIndex = topLeftVertexIndex + NEXT_INDEX_OFFSET;
            solidTriangleIndices.push(topLeftVertexIndex, apexIndex, topRightVertexIndex);
        }

        if (hasCap) {
            const capRingStartIndex = capCenterIndex + VERTICES_PER_SEGMENT_INCREMENT;

            for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
                const capLeftVertexIndex  = capRingStartIndex + radialIndex;
                const capRightVertexIndex = capRingStartIndex + radialIndex + VERTICES_PER_SEGMENT_INCREMENT;
                solidTriangleIndices.push(capCenterIndex, capRightVertexIndex, capLeftVertexIndex);
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

    /**
     * Computes inverse vector length `(1 / sqrt(x ^ 2 + y ^ 2 + z ^ 2))`.
     * Returns `0`, when the input vector is zero-length.
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

        return UV_V_FLIP_BASE / length;
    }
}
