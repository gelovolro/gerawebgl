import { GeometryUtils }                            from './geometry-utils.js';
import { GeneratedGeometry }                        from './generated-geometry.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';

import {
    DEFAULT_VERTEX_COLOR,
    GEOMETRY_SIZES,
    GEOMETRY_GRID,
    GEOMETRY_UV,
    GEOMETRY_LAYOUT,
    GEOMETRY_COLOR_INDEXES
} from '../constants/geometry.js';

import {
    BOX_FACES,
    BOX_DEFAULTS,
    BOX_LAYOUT,
    BOX_LIMITS
} from '../constants/box-geometry.js';

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
 * @property {number} [size = 1.0]         - Convenience cube size (applies to width, height or depth).
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
 * @property {number[]} axisU   - U axis direction.
 * @property {number[]} axisV   - V axis direction.
 * @property {number[]} normal  - Face normal.
 * @property {number} fixed     - Fixed coordinate value for the remaining axis.
 * @property {number} sizeU     - Face size along U.
 * @property {number} sizeV     - Face size along V.
 * @property {number} segmentsU - Segment count along U `>= 1`.
 * @property {number} segmentsV - Segment count along V `>= 1`.
 */

/**
 * Segmented box geometry (cube, when `width = height = depth`).
 * Generates positions, normals, UVs and both solid and wireframe indices.
 */
export class BoxGeometry extends GeneratedGeometry {

    /**
     * Normalizes constructor input to a `BoxGeometryOptions` object.
     *
     * @param {BoxGeometryOptions | number} optionsOrSize - Options object or numeric size.
     * @returns {Required<BoxGeometryOptions>}            - Normalized options.
     * @private
     */
    static #normalizeOptions(optionsOrSize) {
        if (typeof optionsOrSize === ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            return {
                size           : optionsOrSize,
                width          : optionsOrSize,
                height         : optionsOrSize,
                depth          : optionsOrSize,
                widthSegments  : BOX_DEFAULTS.SEGMENT_COUNT,
                heightSegments : BOX_DEFAULTS.SEGMENT_COUNT,
                depthSegments  : BOX_DEFAULTS.SEGMENT_COUNT,
                colors         : DEFAULT_VERTEX_COLOR
            };
        }

        if (optionsOrSize === null || typeof optionsOrSize !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError('BoxGeometry expects options as an object or a number.');
        }

        const {
            size           = BOX_DEFAULTS.SIZE,
            width          = size,
            height         = size,
            depth          = size,
            widthSegments  = BOX_DEFAULTS.SEGMENT_COUNT,
            heightSegments = BOX_DEFAULTS.SEGMENT_COUNT,
            depthSegments  = BOX_DEFAULTS.SEGMENT_COUNT,
            colors         = DEFAULT_VERTEX_COLOR
        } = optionsOrSize;

        if (typeof width  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof height !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof depth  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError('BoxGeometry expects width, height or depth as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('BoxGeometry expects finite width, height or depth.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('BoxGeometry expects colors as a Float32Array.');
        }

        return {
            size,
            width,
            height,
            depth,
            widthSegments  : GeometryUtils.normalizeSegmentCount(widthSegments, 'widthSegments', BOX_LIMITS.MIN_SEGMENT_COUNT, 'BoxGeometry'),
            heightSegments : GeometryUtils.normalizeSegmentCount(heightSegments, 'heightSegments', BOX_LIMITS.MIN_SEGMENT_COUNT, 'BoxGeometry'),
            depthSegments  : GeometryUtils.normalizeSegmentCount(depthSegments, 'depthSegments', BOX_LIMITS.MIN_SEGMENT_COUNT, 'BoxGeometry'),
            colors
        };
    }

    /**
     * Generates vertex and index buffers from construction options.
     *
     * @param {BoxGeometryOptions | number} [options] - Geometry options.
     * @returns {BoxGeometryData}                     - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        const normalized       = BoxGeometry.#normalizeOptions(options);
        const faces            = BoxGeometry.#createFaces(normalized);
        const positions        = [];
        const normals          = [];
        const uvs              = [];
        const faceVertexCounts = [];
        const indicesSolid     = [];
        let vertexOffset       = MATH_COMMON_VALUES.ZERO;

        for (let faceIndex = MATH_COMMON_VALUES.ZERO; faceIndex < faces.length; faceIndex += MATH_COMMON_VALUES.UNIT) {
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
        const colors            = BoxGeometry.#createColors(normalized.colors, vertexCount, faceVertexCounts);
        const indicesSolidTyped = GeometryUtils.createIndexArray(vertexCount, indicesSolid);
        const indicesWireframe  = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, indicesSolidTyped);

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
        const centerOffset    = GEOMETRY_GRID.CENTER_OFFSET;
        const xComponentIndex = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex = MATH_VECTOR3_INDEXES.Z;
        const segmentsU       = face.segmentsU;
        const segmentsV       = face.segmentsV;
        const uVertexCount    = segmentsU + GEOMETRY_GRID.VERTEX_INCREMENT;
        const vVertexCount    = segmentsV + GEOMETRY_GRID.VERTEX_INCREMENT;

        for (let vIndex = MATH_COMMON_VALUES.ZERO; vIndex < vVertexCount; vIndex += MATH_COMMON_VALUES.UNIT) {
            const vNormalized  = vIndex / segmentsV;
            const vLocalOffset = (vNormalized - centerOffset) * face.sizeV;

            for (let uIndex = MATH_COMMON_VALUES.ZERO; uIndex < uVertexCount; uIndex += MATH_COMMON_VALUES.UNIT) {
                const uNormalized  = uIndex / segmentsU;
                const uLocalOffset = (uNormalized - centerOffset) * face.sizeU;

                const positionX =
                    (face.axisU[xComponentIndex]  * uLocalOffset) +
                    (face.axisV[xComponentIndex]  * vLocalOffset) +
                    (face.normal[xComponentIndex] * face.fixed);

                const positionY =
                    (face.axisU[yComponentIndex]  * uLocalOffset) +
                    (face.axisV[yComponentIndex]  * vLocalOffset) +
                    (face.normal[yComponentIndex] * face.fixed);

                const positionZ =
                    (face.axisU[zComponentIndex]  * uLocalOffset) +
                    (face.axisV[zComponentIndex]  * vLocalOffset) +
                    (face.normal[zComponentIndex] * face.fixed);

                positions.push(positionX, positionY, positionZ);
                normals.push(face.normal[xComponentIndex], face.normal[yComponentIndex], face.normal[zComponentIndex]);
                uvs.push(uNormalized, GEOMETRY_UV.V_FLIP_BASE - vNormalized);
            }
        }

        GeometryUtils.appendGridTriangleIndices(indicesSolid, segmentsU, segmentsV, vertexOffset, true);
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
        const colorComponentCount = GEOMETRY_LAYOUT.COLOR_COMPONENT_COUNT;
        const redIndex            = GEOMETRY_COLOR_INDEXES.RED;
        const greenIndex          = GEOMETRY_COLOR_INDEXES.GREEN;
        const blueIndex           = GEOMETRY_COLOR_INDEXES.BLUE;

        // Repeat each face color for all vertices belonging to that face
        if (colorsSpec.length === BOX_LAYOUT.COLORS_PER_FACE_LENGTH) {
            const colorBuffer = new Float32Array(vertexCount * colorComponentCount);
            let vertexBase    = MATH_COMMON_VALUES.ZERO;

            for (let faceIndex = MATH_COMMON_VALUES.ZERO; faceIndex < BOX_LAYOUT.FACE_COUNT; faceIndex += MATH_COMMON_VALUES.UNIT) {
                const faceVertexCount = faceVertexCounts[faceIndex];
                const faceColorBase   = faceIndex * colorComponentCount;
                const red             = colorsSpec[faceColorBase + redIndex];
                const green           = colorsSpec[faceColorBase + greenIndex];
                const blue            = colorsSpec[faceColorBase + blueIndex];

                for (let i = MATH_COMMON_VALUES.ZERO; i < faceVertexCount; i += MATH_COMMON_VALUES.UNIT) {
                    const destinationComponentOffset = (vertexBase + i) * colorComponentCount;
                    colorBuffer[destinationComponentOffset + redIndex]   = red;
                    colorBuffer[destinationComponentOffset + greenIndex] = green;
                    colorBuffer[destinationComponentOffset + blueIndex]  = blue;
                }

                vertexBase += faceVertexCount;
            }

            return colorBuffer;
        }

        // Expand a uniform color or reuse the supplied per-vertex colors
        return GeometryUtils.createColorsFromSpec(vertexCount, colorsSpec);
    }

    /**
     * Describes the six outward-facing box grids in their existing face order.
     *
     * @param {Required<BoxGeometryOptions>} normalized - Normalized geometry options.
     * @returns {BoxFaceDefinition[]}
     * @private
     */
    static #createFaces(normalized) {
        const faces = [];

        for (const definition of BOX_FACES) {
            faces.push({
                axisU     : definition.axisU,
                axisV     : definition.axisV,
                normal    : definition.normal,
                fixed     : normalized[definition.fixedDimension] / GEOMETRY_SIZES.HALF_SIZE_DIVISOR,
                sizeU     : normalized[definition.sizeU],
                sizeV     : normalized[definition.sizeV],
                segmentsU : normalized[definition.segmentsU],
                segmentsV : normalized[definition.segmentsV]
            });
        }

        return faces;
    }
}
