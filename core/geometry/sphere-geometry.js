import { Geometry } from './geometry.js';
import {
    DEFAULT_VERTEX_COLOR,
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default sphere width (diameter along X).
 *
 * @type {number}
 */
const DEFAULT_SPHERE_WIDTH = 1.0;

/**
 * Default sphere height (diameter along Y).
 *
 * @type {number}
 */
const DEFAULT_SPHERE_HEIGHT = 1.0;

/**
 * Default sphere depth (diameter along Z).
 *
 * @type {number}
 */
const DEFAULT_SPHERE_DEPTH = 1.0;

/**
 * Default longitudinal segment count.
 *
 * @type {number}
 */
const DEFAULT_WIDTH_SEGMENTS = 24;

/**
 * Default latitudinal segment count.
 *
 * @type {number}
 */
const DEFAULT_HEIGHT_SEGMENTS = 16;

/**
 * Minimum allowed longitudinal segment count.
 *
 * @type {number}
 */
const MIN_WIDTH_SEGMENT_COUNT = 3;

/**
 * Minimum allowed latitudinal segment count.
 *
 * @type {number}
 */
const MIN_HEIGHT_SEGMENT_COUNT = 2;

/**
 * Divisor used to compute radius from diameter.
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
 * Offset to move from a vertex to the next vertex in the same row.
 *
 * @type {number}
 */
const NEXT_VERTEX_OFFSET = 1;

/**
 * UV/V coordinate is flipped to keep (0, 0) at top-left.
 *
 * @type {number}
 */
const UV_V_FLIP_BASE = 1.0;

/**
 * Numeric zero used for comparisons and constants.
 *
 * @type {number}
 */
const ZERO_VALUE = 0.0;

/**
 * Numeric one used in inverse-length computation.
 *
 * @type {number}
 */
const ONE_VALUE = 1.0;

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
 * Constant for 2π.
 *
 * @type {number}
 */
const TWO_PI = Math.PI * 2.0;

/**
 * Sphere geometry options.
 *
 * `width/height/depth` define full extents (diameters). Use equal values for a perfect sphere.
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
 * Segmented UV sphere geometry. Supports ellipsoid sizes via `width/height/depth`.
 */
export class SphereGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext  - WebGL2 rendering context.
     * @param {SphereGeometryOptions} [options = {}] - Geometry options.
     */
    constructor(webglContext, options = {}) {
        const normalized = SphereGeometry.#normalizeOptions(options);
        const data       = SphereGeometry.#createGeometryData(normalized);

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
     * Normalizes constructor input to a `SphereGeometryOptions` object.
     *
     * @param {SphereGeometryOptions} options     - Options object.
     * @returns {Required<SphereGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('`SphereGeometry` expects options as an object.');
        }

        const {
            width          = DEFAULT_SPHERE_WIDTH,
            height         = DEFAULT_SPHERE_HEIGHT,
            depth          = DEFAULT_SPHERE_DEPTH,
            widthSegments  = DEFAULT_WIDTH_SEGMENTS,
            heightSegments = DEFAULT_HEIGHT_SEGMENTS,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width !== 'number' || typeof height !== 'number' || typeof depth !== 'number') {
            throw new TypeError('`SphereGeometry` expects `width/height/depth` as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('`SphereGeometry` expects finite `width/height/depth`.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`SphereGeometry` expects colors as a `Float32Array`.');
        }

        return {
            width,
            height,
            depth,
            widthSegments  : SphereGeometry.#normalizeSegmentCount(widthSegments,  'widthSegments',  MIN_WIDTH_SEGMENT_COUNT),
            heightSegments : SphereGeometry.#normalizeSegmentCount(heightSegments, 'heightSegments', MIN_HEIGHT_SEGMENT_COUNT),
            colors
        };
    }

    /**
     * Normalizes and validates a segment count parameter.
     *
     * @param {number} value      - Segment count value.
     * @param {string} optionName - Name of the option for error messages.
     * @param {number} minValue   - Minimal allowed value.
     * @returns {number}          - Normalized integer segment count.
     * @private
     */
    static #normalizeSegmentCount(value, optionName, minValue) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`SphereGeometry` expects `{name}` as a finite number.'.replace('{name}', optionName));
        }

        const intValue = Math.floor(value);

        if (intValue < minValue) {
            /* eslint-disable indent */
            throw new RangeError(
                '`SphereGeometry` expects `{name}` to be `>= {min}`.'
                .replace('{name}', optionName)
                .replace('{min}', String(minValue))
            );
            /* eslint-enable indent */
        }

        return intValue;
    }

    /**
     * Creates full geometry data for a segmented UV sphere.
     *
     * @param {Required<SphereGeometryOptions>} options - Normalized options.
     * @returns {SphereGeometryData}                    - Geometry buffers.
     * @private
     */
    static #createGeometryData(options) {
        const radiusX           = options.width  / HALF_SIZE_DIVISOR;
        const radiusY           = options.height / HALF_SIZE_DIVISOR;
        const radiusZ           = options.depth  / HALF_SIZE_DIVISOR;
        const widthSegments     = options.widthSegments;
        const heightSegments    = options.heightSegments;
        const widthVertexCount  = widthSegments  + VERTICES_PER_SEGMENT_INCREMENT;
        const heightVertexCount = heightSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const vertexCount       = widthVertexCount * heightVertexCount;
        const positions         = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const normals           = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const uvs               = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT);
        let vertexIndex = 0;

        for (let latitudeIndex = 0; latitudeIndex < heightVertexCount; latitudeIndex += 1) {
            const vNormalized = latitudeIndex / heightSegments;
            const phiRadians  = vNormalized * Math.PI;
            const sinPhi      = Math.sin(phiRadians);
            const cosPhi      = Math.cos(phiRadians);

            for (let longitudeIndex = 0; longitudeIndex < widthVertexCount; longitudeIndex += 1) {
                const uNormalized  = longitudeIndex / widthSegments;
                const thetaRadians = uNormalized * TWO_PI;
                const sinTheta     = Math.sin(thetaRadians);
                const cosTheta     = Math.cos(thetaRadians);
                const positionX    = cosTheta * sinPhi * radiusX;
                const positionY    = cosPhi * radiusY;
                const positionZ    = sinTheta * sinPhi * radiusZ;

                const positionBaseOffset = vertexIndex * VEC3_COMPONENT_COUNT;
                positions[positionBaseOffset + 0] = positionX;
                positions[positionBaseOffset + 1] = positionY;
                positions[positionBaseOffset + 2] = positionZ;

                const normalX0 = (radiusX !== ZERO_VALUE) ? (positionX / (radiusX * radiusX)) : ZERO_VALUE;
                const normalY0 = (radiusY !== ZERO_VALUE) ? (positionY / (radiusY * radiusY)) : ZERO_VALUE;
                const normalZ0 = (radiusZ !== ZERO_VALUE) ? (positionZ / (radiusZ * radiusZ)) : ZERO_VALUE;

                const inverseNormalLength = SphereGeometry.#inverseLength(normalX0, normalY0, normalZ0);
                normals[positionBaseOffset + 0] = normalX0 * inverseNormalLength;
                normals[positionBaseOffset + 1] = normalY0 * inverseNormalLength;
                normals[positionBaseOffset + 2] = normalZ0 * inverseNormalLength;

                const uvBaseOffset = vertexIndex * VEC2_COMPONENT_COUNT;
                uvs[uvBaseOffset + 0] = uNormalized;
                uvs[uvBaseOffset + 1] = UV_V_FLIP_BASE - vNormalized;
                vertexIndex += 1;
            }
        }

        const solidTriangleIndices = [];

        for (let latitudeIndex = 0; latitudeIndex < heightSegments; latitudeIndex += 1) {
            for (let longitudeIndex = 0; longitudeIndex < widthSegments; longitudeIndex += 1) {
                const topLeftVertexIndex     = (latitudeIndex * widthVertexCount) + longitudeIndex;
                const topRightVertexIndex    = topLeftVertexIndex + NEXT_VERTEX_OFFSET;
                const bottomLeftVertexIndex  = topLeftVertexIndex + widthVertexCount;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
                solidTriangleIndices.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
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
