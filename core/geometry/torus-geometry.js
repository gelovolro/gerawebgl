import { GeometryUtils }                            from './geometry-utils.js';
import { GeneratedGeometry }                        from './generated-geometry.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';
import { TORUS_DEFAULTS, TORUS_LIMITS }             from '../constants/torus-geometry.js';

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
export class TorusGeometry extends GeneratedGeometry {

    /**
     * Normalizes constructor input to a `TorusGeometryOptions` object.
     *
     * @param {TorusGeometryOptions} options     - Options object.
     * @returns {Required<TorusGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError('TorusGeometry expects options as an object.');
        }

        const {
            width           = TORUS_DEFAULTS.MAJOR_DIAMETER,
            height          = TORUS_DEFAULTS.TUBE_DIAMETER,
            tubularSegments = TORUS_DEFAULTS.TUBULAR_SEGMENTS,
            radialSegments  = TORUS_DEFAULTS.RADIAL_SEGMENTS,
            colors          = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || typeof height !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError('TorusGeometry expects width/height as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
            throw new RangeError('TorusGeometry expects finite width/height.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('TorusGeometry expects colors as a Float32Array.');
        }

        return {
            width,
            height,
            tubularSegments : GeometryUtils.normalizeSegmentCount(tubularSegments, 'tubularSegments', TORUS_LIMITS.MIN_SEGMENT_COUNT, 'TorusGeometry'),
            radialSegments  : GeometryUtils.normalizeSegmentCount(radialSegments, 'radialSegments', TORUS_LIMITS.MIN_SEGMENT_COUNT, 'TorusGeometry'),
            colors
        };
    }

    /**
     * Generates vertex and index buffers from construction options.
     *
     * @param {TorusGeometryOptions} [options] - Geometry options.
     * @returns {TorusGeometryData}            - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const normalized             = TorusGeometry.#normalizeOptions(options);
        const tubularSegments        = normalized.tubularSegments;
        const radialSegments         = normalized.radialSegments;
        const tubularVertexCount     = tubularSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const radialVertexCount      = radialSegments  + GEOMETRY_GRID.VERTEX_INCREMENT;
        const vertexCount            = tubularVertexCount * radialVertexCount;
        const positions              = new Float32Array(vertexCount * positionComponentCount);
        const normals                = new Float32Array(vertexCount * positionComponentCount);
        const uvs                    = new Float32Array(vertexCount * uvComponentCount);

        TorusGeometry.#writeVertices(positions, normals, uvs, normalized);
        const indicesSolidList = [];
        GeometryUtils.appendGridTriangleIndices(indicesSolidList, tubularSegments, radialSegments);

        const indicesSolid     = GeometryUtils.createIndexArray(vertexCount, indicesSolidList);
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
     * @param {Required<TorusGeometryOptions>} normalized - Normalized geometry options.
     * @private
     */
    static #writeVertices(positions, normals, uvs, normalized) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const fullTurn               = GEOMETRY_ANGLES.FULL_TURN;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;
        const majorRadius            = normalized.width  / GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const tubeRadius             = normalized.height / GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const tubularSegments        = normalized.tubularSegments;
        const radialSegments         = normalized.radialSegments;
        const tubularVertexCount     = tubularSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const radialVertexCount      = radialSegments  + GEOMETRY_GRID.VERTEX_INCREMENT;
        let vertexIndex              = MATH_COMMON_VALUES.ZERO;

        for (let radialIndex = MATH_COMMON_VALUES.ZERO; radialIndex < radialVertexCount; radialIndex += MATH_COMMON_VALUES.UNIT) {
            const vNormalized = radialIndex / radialSegments;
            const phi         = vNormalized * fullTurn;
            const cosPhi      = Math.cos(phi);
            const sinPhi      = Math.sin(phi);

            for (let tubularIndex = MATH_COMMON_VALUES.ZERO; tubularIndex < tubularVertexCount; tubularIndex += MATH_COMMON_VALUES.UNIT) {
                const uNormalized = tubularIndex / tubularSegments;
                const theta       = uNormalized * fullTurn;
                const cosTheta    = Math.cos(theta);
                const sinTheta    = Math.sin(theta);
                const ringRadius  = majorRadius + (tubeRadius * cosPhi);
                const positionX   = ringRadius * cosTheta;
                const positionY   = tubeRadius * sinPhi;
                const positionZ   = ringRadius * sinTheta;

                const positionBase = vertexIndex * positionComponentCount;
                positions[positionBase + xComponentIndex] = positionX;
                positions[positionBase + yComponentIndex] = positionY;
                positions[positionBase + zComponentIndex] = positionZ;
                normals[positionBase + xComponentIndex]   = cosTheta * cosPhi;
                normals[positionBase + yComponentIndex]   = sinPhi;
                normals[positionBase + zComponentIndex]   = sinTheta * cosPhi;

                const uvBase = vertexIndex * uvComponentCount;
                uvs[uvBase + GEOMETRY_UV_INDEXES.U] = uNormalized;
                uvs[uvBase + GEOMETRY_UV_INDEXES.V] = GEOMETRY_UV.V_FLIP_BASE - vNormalized;
                vertexIndex += MATH_COMMON_VALUES.UNIT;
            }
        }
    }
}
