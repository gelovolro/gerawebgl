import { Geometry } from './geometry.js';
import {
    DEFAULT_VERTEX_COLOR,
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default torus major diameter (center ring diameter without tube).
 *
 * @type {number}
 */
const DEFAULT_MAJOR_DIAMETER = 1.5;

/**
 * Default torus tube diameter.
 *
 * @type {number}
 */
const DEFAULT_TUBE_DIAMETER = 0.5;

/**
 * Default radial segment count (tube segments).
 *
 * @type {number}
 */
const DEFAULT_RADIAL_SEGMENTS = 16;

/**
 * Default tubular segment count (around the ring).
 *
 * @type {number}
 */
const DEFAULT_TUBULAR_SEGMENTS = 32;

/**
 * Minimum segment count for torus grids.
 *
 * @type {number}
 */
const MIN_SEGMENT_COUNT = 3;

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
 * UV/V coordinate is flipped to keep (0, 0) at top-left.
 *
 * @type {number}
 */
const UV_V_FLIP_BASE = 1.0;

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
 * Constant for `2 * pi`.
 *
 * @type {number}
 */
const TWO_PI = Math.PI * 2.0;

/**
 * Offset to move from a vertex to the next vertex in the same row.
 *
 * @type {number}
 */
const NEXT_VERTEX_OFFSET = 1;

/**
 * Torus geometry options.
 *
 * `width` and `height` are interpreted as:
 * - `width`  = major diameter (center ring diameter)
 * - `height` = tube diameter
 *
 * Segment parameters must be integers `>= 3`.
 *
 * `colors` supports:
 * - Uniform RGB    `length === 3`
 * - Per-vertex RGB `length === vertexCount * 3`
 *
 * @typedef {Object} TorusGeometryOptions
 * @property {number} [width = 1.5]          - Major diameter.
 * @property {number} [height = 0.5]         - Tube diameter.
 * @property {number} [tubularSegments = 32] - Segments around the ring `>= 3`.
 * @property {number} [radialSegments = 16]  - Segments around the tube `>= 3`.
 * @property {Float32Array} [colors]         - Color specification buffer.
 */

/**
 * Internal geometry buffers produced by `TorusGeometry`.
 *
 * @typedef {Object} TorusGeometryData
 * @property {Float32Array} positions                     - Vertex positions (xyz).
 * @property {Float32Array} normals                       - Vertex normals (xyz).
 * @property {Float32Array} uvs                           - Vertex UVs (uv).
 * @property {Float32Array} colors                        - Vertex colors (rgb).
 * @property {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Line index buffer for wireframe.
 */

/**
 * Segmented torus geometry.
 */
export class TorusGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {TorusGeometryOptions} [options = {}] - Geometry options.
     */
    constructor(webglContext, options = {}) {
        const normalized = TorusGeometry.#normalizeOptions(options);
        const data       = TorusGeometry.#createGeometryData(normalized);

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
     * Normalizes constructor input to a `TorusGeometryOptions` object.
     *
     * @param {TorusGeometryOptions} options     - Options object.
     * @returns {Required<TorusGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== 'object') {
            throw new TypeError('`TorusGeometry` expects options as an object.');
        }

        const {
            width           = DEFAULT_MAJOR_DIAMETER,
            height          = DEFAULT_TUBE_DIAMETER,
            tubularSegments = DEFAULT_TUBULAR_SEGMENTS,
            radialSegments  = DEFAULT_RADIAL_SEGMENTS,
            colors          = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width !== 'number' || typeof height !== 'number') {
            throw new TypeError('`TorusGeometry` expects `width/height` as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
            throw new RangeError('`TorusGeometry` expects finite `width/height`.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`TorusGeometry` expects colors as a `Float32Array`.');
        }

        return {
            width,
            height,
            tubularSegments : TorusGeometry.#normalizeSegmentCount(tubularSegments, 'tubularSegments'),
            radialSegments  : TorusGeometry.#normalizeSegmentCount(radialSegments,  'radialSegments'),
            colors
        };
    }

    /**
     * Normalizes and validates a segment count parameter.
     *
     * @param {number} value      - Segment count value.
     * @param {string} optionName - Name of the option for error messages.
     * @returns {number}          - Normalized integer `>= 3`.
     * @private
     */
    static #normalizeSegmentCount(value, optionName) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`TorusGeometry` expects `{name}` as a finite number.'.replace('{name}', optionName));
        }

        const intValue = Math.floor(value);

        if (intValue < MIN_SEGMENT_COUNT) {
            /* eslint-disable indent */
            throw new RangeError(
                '`TorusGeometry` expects `{name}` to be `>= {min}`.'
                .replace('{name}', optionName)
                .replace('{min}', String(MIN_SEGMENT_COUNT))
            );
            /* eslint-enable indent */
        }

        return intValue;
    }

    /**
     * Creates full geometry data for a torus.
     *
     * @param {Required<TorusGeometryOptions>} options - Normalized options.
     * @returns {TorusGeometryData}                    - Geometry buffers.
     * @private
     */
    static #createGeometryData(options) {
        const majorRadius        = options.width  / HALF_SIZE_DIVISOR;
        const tubeRadius         = options.height / HALF_SIZE_DIVISOR;
        const tubularSegments    = options.tubularSegments;
        const radialSegments     = options.radialSegments;
        const tubularVertexCount = tubularSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const radialVertexCount  = radialSegments  + VERTICES_PER_SEGMENT_INCREMENT;
        const vertexCount        = tubularVertexCount * radialVertexCount;
        const positions          = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const normals            = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
        const uvs                = new Float32Array(vertexCount * VEC2_COMPONENT_COUNT);
        let vertexIndex = 0;

        for (let radialIndex = 0; radialIndex < radialVertexCount; radialIndex += 1) {
            const vNormalized = radialIndex / radialSegments;
            const phi         = vNormalized * TWO_PI;
            const cosPhi      = Math.cos(phi);
            const sinPhi      = Math.sin(phi);

            for (let tubularIndex = 0; tubularIndex < tubularVertexCount; tubularIndex += 1) {
                const uNormalized = tubularIndex / tubularSegments;
                const theta       = uNormalized * TWO_PI;
                const cosTheta    = Math.cos(theta);
                const sinTheta    = Math.sin(theta);
                const ringRadius  = majorRadius + (tubeRadius * cosPhi);

                const positionX = ringRadius * cosTheta;
                const positionY = tubeRadius * sinPhi;
                const positionZ = ringRadius * sinTheta;

                const positionBase = vertexIndex * VEC3_COMPONENT_COUNT;
                positions[positionBase + 0] = positionX;
                positions[positionBase + 1] = positionY;
                positions[positionBase + 2] = positionZ;

                normals[positionBase + 0] = cosTheta * cosPhi;
                normals[positionBase + 1] = sinPhi;
                normals[positionBase + 2] = sinTheta * cosPhi;

                const uvBase = vertexIndex * VEC2_COMPONENT_COUNT;
                uvs[uvBase + 0] = uNormalized;
                uvs[uvBase + 1] = UV_V_FLIP_BASE - vNormalized;
                vertexIndex += 1;
            }
        }

        const indicesSolidList = [];

        for (let radialIndex = 0; radialIndex < radialSegments; radialIndex += 1) {
            for (let tubularIndex = 0; tubularIndex < tubularSegments; tubularIndex += 1) {
                const topLeftVertexIndex     = (radialIndex * tubularVertexCount) + tubularIndex;
                const topRightVertexIndex    = topLeftVertexIndex    + NEXT_VERTEX_OFFSET;
                const bottomLeftVertexIndex  = topLeftVertexIndex    + tubularVertexCount;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
                indicesSolidList.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
                indicesSolidList.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
            }
        }

        const indicesSolid     = createIndexArray(vertexCount, indicesSolidList);
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
