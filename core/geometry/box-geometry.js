import { Geometry } from './geometry.js';
import {
    DEFAULT_VERTEX_COLOR,
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default box edge size.
 *
 * @type {number}
 */
const DEFAULT_BOX_SIZE = 1.0;

/**
 * Default segment count for each box axis.
 *
 * @type {number}
 */
const DEFAULT_SEGMENT_COUNT = 1;

/**
 * Divisor used to compute the half-size from the full size.
 *
 * @type {number}
 */
const HALF_SIZE_DIVISOR = 2.0;

/**
 * Number of float components per `vec3` (position/normal).
 *
 * @type {number}
 */
const VEC3_COMPONENT_COUNT = 3;

/**
 * Number of box faces.
 *
 * @type {number}
 */
const BOX_FACE_COUNT = 6;

/**
 * Expected length for per-face RGB colors (6 faces * 3).
 *
 * @type {number}
 */
const COLORS_PER_FACE_LENGTH = BOX_FACE_COUNT * VEC3_COMPONENT_COUNT;

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
 * Used to center face coordinates around the origin: `(t - 0.5) * size`.
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
 * When segments are positive, the divisor is never 0. This value is used as fallback.
 *
 * @type {number}
 */
const DEFAULT_T_VALUE = 0.0;

/**
 * Sentinel segment count that would cause division by zero in normalization.
 *
 * @type {number}
 */
const ZERO_SEGMENT_COUNT = 0;

/**
 * Offset to move from a vertex to the next vertex in the same row.
 *
 * @type {number}
 */
const NEXT_VERTEX_OFFSET = 1;

/**
 * Options used by `BoxGeometry` constructor.
 *
 * `colors` supports:
 * - Uniform RGB    (`length === 3`)
 * - Per-face RGB   (`length === 18`)
 * - Per-vertex RGB (`length === vertexCount * 3`)
 *
 * Segment parameters must be `integers >= 1`.
 *
 * @typedef {Object} BoxGeometryOptions
 * @property {number} [size = 1.0]         - Convenience cube size (applies to `width/height/depth`).
 * @property {number} [width = size]       - Box width along the X axis.
 * @property {number} [height = size]      - Box height along the Y axis.
 * @property {number} [depth = size]       - Box depth along the Z axis.
 * @property {number} [widthSegments = 1]  - Subdivisions along the X axis.
 * @property {number} [heightSegments = 1] - Subdivisions along the Y axis.
 * @property {number} [depthSegments = 1]  - Subdivisions along the Z axis.
 * @property {Float32Array} [colors]       - Color specification buffer.
 */

/**
 * Internal geometry buffers produced by `BoxGeometry`.
 *
 * @typedef {Object} BoxGeometryData
 * @property {Float32Array} positions                     - Vertex positions (xyz).
 * @property {Float32Array} normals                       - Vertex normals (xyz).
 * @property {Float32Array} uvs                           - Vertex UVs (uv).
 * @property {Float32Array} colors                        - Vertex colors (rgb).
 * @property {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Line index buffer for wireframe.
 */

/**
 * Internal face grid definition for `BoxGeometry`.
 *
 * @typedef {Object} BoxFaceDefinition
 * @property {number[]} axisU    - U axis direction.
 * @property {number[]} axisV    - V axis direction.
 * @property {number[]} normal   - Face normal.
 * @property {number} fixed      - Fixed coordinate value for the remaining axis.
 * @property {number} sizeU      - Face size along U.
 * @property {number} sizeV      - Face size along V.
 * @property {number} segmentsU  - Segment count along U `>= 1`.
 * @property {number} segmentsV  - Segment count along V `>= 1`.
 */

/**
 * Segmented box geometry (cube, when `width = height = depth`).
 * Generates positions, normals, UVs and both solid and wireframe indices.
 */
export class BoxGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext         - WebGL2 rendering context.
     * @param {BoxGeometryOptions | number} [optionsOrSize] - Options object or numeric size.
     */
    constructor(webglContext, optionsOrSize = {}) {
        const options = BoxGeometry.#normalizeOptions(optionsOrSize);
        const data    = BoxGeometry.#createGeometryData(options);

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
     * Normalizes constructor input to a `BoxGeometryOptions` object.
     *
     * @param {BoxGeometryOptions | number} optionsOrSize - Options object or numeric size.
     * @returns {Required<BoxGeometryOptions>}            - Normalized options.
     * @private
     */
    static #normalizeOptions(optionsOrSize) {
        if (typeof optionsOrSize === 'number') {
            return {
                size           : optionsOrSize,
                width          : optionsOrSize,
                height         : optionsOrSize,
                depth          : optionsOrSize,
                widthSegments  : DEFAULT_SEGMENT_COUNT,
                heightSegments : DEFAULT_SEGMENT_COUNT,
                depthSegments  : DEFAULT_SEGMENT_COUNT,
                colors         : DEFAULT_VERTEX_COLOR
            };
        }

        if (optionsOrSize === null || typeof optionsOrSize !== 'object') {
            throw new TypeError('`BoxGeometry` expects options as an object or a number.');
        }

        const {
            size           = DEFAULT_BOX_SIZE,
            width          = size,
            height         = size,
            depth          = size,
            widthSegments  = DEFAULT_SEGMENT_COUNT,
            heightSegments = DEFAULT_SEGMENT_COUNT,
            depthSegments  = DEFAULT_SEGMENT_COUNT,
            colors         = DEFAULT_VERTEX_COLOR
        } = optionsOrSize;

        if (typeof width !== 'number' || typeof height !== 'number' || typeof depth !== 'number') {
            throw new TypeError('`BoxGeometry` expects `width/height/depth` as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('`BoxGeometry` expects finite `width/height/depth`.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`BoxGeometry` expects colors as a `Float32Array`.');
        }

        return {
            size,
            width,
            height,
            depth,
            widthSegments  : BoxGeometry.#normalizeSegmentCount(widthSegments  , 'widthSegments'),
            heightSegments : BoxGeometry.#normalizeSegmentCount(heightSegments , 'heightSegments'),
            depthSegments  : BoxGeometry.#normalizeSegmentCount(depthSegments  , 'depthSegments'),
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
            throw new TypeError('`BoxGeometry` expects `{name}` as a finite number.'.replace('{name}', optionName));
        }

        const intValue = Math.floor(value);

        if (intValue < MIN_SEGMENT_COUNT) {
            /* eslint-disable indent */
            throw new RangeError(
                '`BoxGeometry` expects `{name}` to be `>= {min}`.'
                .replace('{name}', optionName)
                .replace('{min}', String(MIN_SEGMENT_COUNT))
            );
            /* eslint-enable indent */
        }

        return intValue;
    }

    /**
     * Creates full geometry data for a segmented box.
     *
     * @param {Required<BoxGeometryOptions>} options - Normalized options.
     * @returns {BoxGeometryData}                    - Geometry buffers.
     *
     * @private
     */
    static #createGeometryData(options) {
        const halfWidth  = options.width  / HALF_SIZE_DIVISOR;
        const halfHeight = options.height / HALF_SIZE_DIVISOR;
        const halfDepth  = options.depth  / HALF_SIZE_DIVISOR;

        const positions        = [];
        const normals          = [];
        const uvs              = [];
        const faceVertexCounts = [];
        const indicesSolid     = [];
        let vertexOffset = 0;

        // Face definitions ensure `normal === normalize(cross(axisU, axisV))`.
        const faces = [
            // Front (+Z)
            {
                axisU      : [ 1, 0, 0],
                axisV      : [ 0, 1, 0],
                normal     : [ 0, 0, 1],
                fixed      : halfDepth,
                sizeU      : options.width,
                sizeV      : options.height,
                segmentsU  : options.widthSegments,
                segmentsV  : options.heightSegments
            },

            // Back (-Z)
            {
                axisU      : [-1, 0, 0],
                axisV      : [ 0, 1, 0],
                normal     : [ 0, 0,-1],
                fixed      : halfDepth,
                sizeU      : options.width,
                sizeV      : options.height,
                segmentsU  : options.widthSegments,
                segmentsV  : options.heightSegments
            },

            // Top (+Y)
            {
                axisU      : [ 1, 0, 0],
                axisV      : [ 0, 0,-1],
                normal     : [ 0, 1, 0],
                fixed      : halfHeight,
                sizeU      : options.width,
                sizeV      : options.depth,
                segmentsU  : options.widthSegments,
                segmentsV  : options.depthSegments
            },

            // Bottom (-Y)
            {
                axisU      : [ 1, 0, 0],
                axisV      : [ 0, 0, 1],
                normal     : [ 0,-1, 0],
                fixed      : halfHeight,
                sizeU      : options.width,
                sizeV      : options.depth,
                segmentsU  : options.widthSegments,
                segmentsV  : options.depthSegments
            },

            // Right (+X)
            {
                axisU      : [ 0, 0,-1],
                axisV      : [ 0, 1, 0],
                normal     : [ 1, 0, 0],
                fixed      : halfWidth,
                sizeU      : options.depth,
                sizeV      : options.height,
                segmentsU  : options.depthSegments,
                segmentsV  : options.heightSegments
            },

            // Left (-X)
            {
                axisU      : [ 0, 0, 1],
                axisV      : [ 0, 1, 0],
                normal     : [-1, 0, 0],
                fixed      : halfWidth,
                sizeU      : options.depth,
                sizeV      : options.height,
                segmentsU  : options.depthSegments,
                segmentsV  : options.heightSegments
            }
        ];

        for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
            const face = faces[faceIndex];
            const localVertexCount = BoxGeometry.#appendFaceGrid(
                positions,
                normals,
                uvs,
                indicesSolid,
                vertexOffset,
                face
            );

            faceVertexCounts.push(localVertexCount);
            vertexOffset += localVertexCount;
        }

        const vertexCount       = vertexOffset;
        const colors            = BoxGeometry.#createColors(options.colors, vertexCount, faceVertexCounts);
        const indicesSolidTyped = createIndexArray(vertexCount, indicesSolid);
        const indicesWireframe  = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolidTyped);

        return {
            positions        : new Float32Array(positions),
            normals          : new Float32Array(normals),
            uvs              : new Float32Array(uvs),
            colors,
            indicesSolid     : indicesSolidTyped,
            indicesWireframe
        };
    }

    /**
     * Appends a single face grid to the output buffers.
     *
     * @param {number[]} positions     - Output positions.
     * @param {number[]} normals       - Output normals.
     * @param {number[]} uvs           - Output UVs.
     * @param {number[]} indicesSolid  - Output solid indices (triangles).
     * @param {number} vertexOffset    - Starting vertex index for this face.
     * @param {BoxFaceDefinition} face - Face definition.
     * @returns {number}               - Number of vertices appended for this face.
     * @private
     */
    static #appendFaceGrid(positions, normals, uvs, indicesSolid, vertexOffset, face) {
        const segmentsU    = face.segmentsU;
        const segmentsV    = face.segmentsV;
        const uVertexCount = segmentsU + VERTICES_PER_SEGMENT_INCREMENT;
        const vVertexCount = segmentsV + VERTICES_PER_SEGMENT_INCREMENT;

        for (let vIndex = 0; vIndex < vVertexCount; vIndex += 1) {
            const vNormalized  = (segmentsV === ZERO_SEGMENT_COUNT) ? DEFAULT_T_VALUE : (vIndex / segmentsV);
            const vLocalOffset = (vNormalized - CENTER_T_OFFSET) * face.sizeV;

            for (let uIndex = 0; uIndex < uVertexCount; uIndex += 1) {
                const uNormalized  = (segmentsU === ZERO_SEGMENT_COUNT) ? DEFAULT_T_VALUE : (uIndex / segmentsU);
                const uLocalOffset = (uNormalized - CENTER_T_OFFSET) * face.sizeU;

                const positionX =
                    (face.axisU[0]  * uLocalOffset) +
                    (face.axisV[0]  * vLocalOffset) +
                    (face.normal[0] * face.fixed);

                const positionY =
                    (face.axisU[1]  * uLocalOffset) +
                    (face.axisV[1]  * vLocalOffset) +
                    (face.normal[1] * face.fixed);

                const positionZ =
                    (face.axisU[2]  * uLocalOffset) +
                    (face.axisV[2]  * vLocalOffset) +
                    (face.normal[2] * face.fixed);

                positions.push(positionX, positionY, positionZ);
                normals.push(face.normal[0], face.normal[1], face.normal[2]);
                uvs.push(uNormalized, UV_V_FLIP_BASE - vNormalized);
            }
        }

        // Indices:
        for (let vIndex = 0; vIndex < segmentsV; vIndex += 1) {
            for (let uIndex = 0; uIndex < segmentsU; uIndex += 1) {
                const topLeftVertexIndex     = vertexOffset + (vIndex * uVertexCount) + uIndex;
                const topRightVertexIndex    = topLeftVertexIndex    + NEXT_VERTEX_OFFSET;
                const bottomLeftVertexIndex  = topLeftVertexIndex    + uVertexCount;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
                indicesSolid.push(topLeftVertexIndex, bottomLeftVertexIndex, topRightVertexIndex);
                indicesSolid.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
            }
        }

        return uVertexCount * vVertexCount;
    }

    /**
     * Creates a per-vertex color buffer for the final vertex count.
     *
     * @param {Float32Array} colorsSpec   - Color specification.
     * @param {number} vertexCount        - Total vertex count.
     * @param {number[]} faceVertexCounts - Vertex count for each face, in face order.
     * @returns {Float32Array}            - Per-vertex RGB buffer.
     * @private
     */
    static #createColors(colorsSpec, vertexCount, faceVertexCounts) {
        // Per-face colors:
        if (colorsSpec.length === COLORS_PER_FACE_LENGTH) {
            const colorBuffer = new Float32Array(vertexCount * VEC3_COMPONENT_COUNT);
            let vertexBase = 0;

            for (let faceIndex = 0; faceIndex < BOX_FACE_COUNT; faceIndex += 1) {
                const faceVertexCount = faceVertexCounts[faceIndex];
                const faceColorBase   = faceIndex * VEC3_COMPONENT_COUNT;
                const red             = colorsSpec[faceColorBase + 0];
                const green           = colorsSpec[faceColorBase + 1];
                const blue            = colorsSpec[faceColorBase + 2];

                for (let i = 0; i < faceVertexCount; i += 1) {
                    const destinationComponentOffset = (vertexBase + i) * VEC3_COMPONENT_COUNT;
                    colorBuffer[destinationComponentOffset + 0] = red;
                    colorBuffer[destinationComponentOffset + 1] = green;
                    colorBuffer[destinationComponentOffset + 2] = blue;
                }

                vertexBase += faceVertexCount;
            }

            return colorBuffer;
        }

        // Uniform or per-vertex:
        return createColorsFromSpec(vertexCount, colorsSpec);
    }
}
