import { GeometryUtils }                            from './geometry-utils.js';
import { GeneratedGeometry }                        from './generated-geometry.js';
import { MATH_VECTOR3_INDEXES, MATH_COMMON_VALUES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';

import {
    GEOMETRY_DEFAULTS,
    DEFAULT_VERTEX_COLOR,
    GEOMETRY_SIZES,
    GEOMETRY_GRID,
    GEOMETRY_LAYOUT,
    GEOMETRY_UV,
    GEOMETRY_ANGLES,
    GEOMETRY_UV_INDEXES
} from '../constants/geometry.js';

import {
    CONE_DEFAULTS,
    CONE_LIMITS,
    CONE_NORMALS,
    CONE_LAYOUT
} from '../constants/cone-geometry.js';

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
 * @property {number} [width = 1.0]                        - Base diameter along X.
 * @property {number} [height = 1.5]                       - Cone height along Y.
 * @property {number} [depth = width]                      - Base diameter along Z.
 * @property {number} [radialSegments = 24]                - Segments around the base.
 * @property {number} [heightSegments = 1]                 - Segments along height.
 * @property {boolean} [capped = GEOMETRY_DEFAULTS.CAPPED] - Whether to generate a bottom cap.
 * @property {Float32Array} [colors]                       - Color specification buffer.
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
export class ConeGeometry extends GeneratedGeometry {

    /**
     * Normalizes constructor input to a `ConeGeometryOptions` object.
     *
     * @param {ConeGeometryOptions} options     - Options object.
     * @returns {Required<ConeGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT) {
            throw new TypeError('ConeGeometry expects options as an object.');
        }

        const {
            width          = CONE_DEFAULTS.WIDTH,
            height         = CONE_DEFAULTS.HEIGHT,
            depth          = width,
            radialSegments = CONE_DEFAULTS.RADIAL_SEGMENTS,
            heightSegments = CONE_DEFAULTS.HEIGHT_SEGMENTS,
            capped         = GEOMETRY_DEFAULTS.CAPPED,
            colors         = DEFAULT_VERTEX_COLOR
        } = options;

        if (typeof width  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof height !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER ||
            typeof depth  !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER) {
            throw new TypeError('ConeGeometry expects width, height or depth as numbers.');
        }

        if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(depth)) {
            throw new RangeError('ConeGeometry expects finite width, height or depth.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('ConeGeometry expects colors as a Float32Array.');
        }

        return {
            width,
            height,
            depth,
            radialSegments : GeometryUtils.normalizeSegmentCount(radialSegments, 'radialSegments', CONE_LIMITS.MIN_RADIAL_SEGMENT_COUNT, 'ConeGeometry'),
            heightSegments : GeometryUtils.normalizeSegmentCount(heightSegments, 'heightSegments', CONE_LIMITS.MIN_HEIGHT_SEGMENT_COUNT, 'ConeGeometry'),
            capped         : Boolean(capped),
            colors
        };
    }

    /**
     * Generates vertex and index buffers from construction options.
     *
     * @param {ConeGeometryOptions} [options] - Geometry options.
     * @returns {ConeGeometryData}            - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        const normalized      = ConeGeometry.#normalizeOptions(options);
        const ringVertexCount = normalized.radialSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const sideVertexCount = normalized.heightSegments * ringVertexCount;
        const capVertexCount  = normalized.capped ? (ringVertexCount + GEOMETRY_GRID.VERTEX_INCREMENT) : CONE_LAYOUT.ZERO_VERTEX_COUNT;
        const vertexCount     = sideVertexCount + GEOMETRY_GRID.VERTEX_INCREMENT + capVertexCount;
        const positions       = new Float32Array(vertexCount * GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT);
        const normals         = new Float32Array(vertexCount * GEOMETRY_LAYOUT.NORMAL_COMPONENT_COUNT);
        const uvs             = new Float32Array(vertexCount * GEOMETRY_LAYOUT.UV_COMPONENT_COUNT);
        const apexIndex       = ConeGeometry.#writeSides(positions, normals, uvs, normalized);
        const capCenterIndex  = apexIndex + GEOMETRY_GRID.VERTEX_INCREMENT;
        ConeGeometry.#writeApex(positions, normals, uvs, normalized, apexIndex);

        if (normalized.capped) {
            ConeGeometry.#writeCapCenter(positions, normals, uvs, normalized, capCenterIndex);
            ConeGeometry.#writeCapRing(positions, normals, uvs, normalized, capCenterIndex);
        }

        const indexList        = ConeGeometry.#createTriangleIndices(normalized, apexIndex, capCenterIndex);
        const indicesSolid     = GeometryUtils.createIndexArray(vertexCount, indexList);
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

        if (length === MATH_COMMON_VALUES.ZERO) {
            return MATH_COMMON_VALUES.ZERO;
        }

        return MATH_COMMON_VALUES.UNIT / length;
    }

    /**
     * Writes the side rings and returns the apex vertex index.
     *
     * @param {Float32Array} positions                   - Output positions.
     * @param {Float32Array} normals                     - Output normals.
     * @param {Float32Array} uvs                         - Output texture coordinates.
     * @param {Required<ConeGeometryOptions>} normalized - Normalized geometry options.
     * @returns {number}
     * @private
     */
    static #writeSides(positions, normals, uvs, normalized) {
        const halfSizeDivisor        = GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const vertexIncrement        = GEOMETRY_GRID.VERTEX_INCREMENT;
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const vFlipBase              = GEOMETRY_UV.V_FLIP_BASE;
        const fullTurn               = GEOMETRY_ANGLES.FULL_TURN;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;
        const uIndex                 = GEOMETRY_UV_INDEXES.U;
        const vIndex                 = GEOMETRY_UV_INDEXES.V;
        const radiusX                = normalized.width / halfSizeDivisor;
        const radiusZ                = normalized.depth / halfSizeDivisor;
        const height                 = normalized.height;
        const radialSegments         = normalized.radialSegments;
        const heightSegments         = normalized.heightSegments;
        const ringVertexCount        = radialSegments + vertexIncrement;
        const sideRingCount          = heightSegments;
        let vertexIndex              = MATH_COMMON_VALUES.ZERO;

        for (let heightRingIndex = MATH_COMMON_VALUES.ZERO; heightRingIndex < sideRingCount; heightRingIndex += MATH_COMMON_VALUES.UNIT) {
            const heightNormalized = heightRingIndex / heightSegments;
            const radiusFactor     = vFlipBase - heightNormalized;
            const positionY        = ((-height / halfSizeDivisor) + (heightNormalized * height));
            const currentRadiusX   = radiusX * radiusFactor;
            const currentRadiusZ   = radiusZ * radiusFactor;

            for (let radialVertexIndex = MATH_COMMON_VALUES.ZERO; radialVertexIndex < ringVertexCount; radialVertexIndex += MATH_COMMON_VALUES.UNIT) {
                const uNormalized  = radialVertexIndex / radialSegments;
                const angleRadians = uNormalized * fullTurn;
                const cosTheta     = Math.cos(angleRadians);
                const sinTheta     = Math.sin(angleRadians);
                const positionX    = cosTheta * currentRadiusX;
                const positionZ    = sinTheta * currentRadiusZ;

                const positionBaseOffset = vertexIndex * positionComponentCount;
                positions[positionBaseOffset + xComponentIndex] = positionX;
                positions[positionBaseOffset + yComponentIndex] = positionY;
                positions[positionBaseOffset + zComponentIndex] = positionZ;

                const normalX0            = radiusZ * height * cosTheta;
                const normalY0            = radiusX * radiusZ;
                const normalZ0            = radiusX * height * sinTheta;
                const inverseNormalLength = ConeGeometry.#inverseLength(normalX0, normalY0, normalZ0);
                const uvBaseOffset        = vertexIndex * uvComponentCount;

                normals[positionBaseOffset + xComponentIndex] = normalX0 * inverseNormalLength;
                normals[positionBaseOffset + yComponentIndex] = normalY0 * inverseNormalLength;
                normals[positionBaseOffset + zComponentIndex] = normalZ0 * inverseNormalLength;
                uvs[uvBaseOffset + uIndex] = uNormalized;
                uvs[uvBaseOffset + vIndex] = vFlipBase - heightNormalized;
                vertexIndex += MATH_COMMON_VALUES.UNIT;
            }
        }

        return vertexIndex;
    }

    /**
     * Writes the apex position, upward normal and texture coordinates.
     *
     * @param {Float32Array} positions                   - Output positions.
     * @param {Float32Array} normals                     - Output normals.
     * @param {Float32Array} uvs                         - Output texture coordinates.
     * @param {Required<ConeGeometryOptions>} normalized - Normalized geometry options.
     * @param {number} apexIndex                         - Apex index.
     * @private
     */
    static #writeApex(positions, normals, uvs, normalized, apexIndex) {
        const halfSizeDivisor        = GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;
        const uIndex                 = GEOMETRY_UV_INDEXES.U;
        const vIndex                 = GEOMETRY_UV_INDEXES.V;
        const xZero                  = CONE_NORMALS.X_ZERO;
        const zZero                  = CONE_NORMALS.Z_ZERO;
        const center                 = GEOMETRY_UV.CENTER;
        const height                 = normalized.height;
        const apexBaseOffset         = apexIndex * positionComponentCount;

        positions[apexBaseOffset + xComponentIndex] = CONE_LAYOUT.ORIGIN;
        positions[apexBaseOffset + yComponentIndex] = height / halfSizeDivisor;
        positions[apexBaseOffset + zComponentIndex] = CONE_LAYOUT.ORIGIN;
        normals[apexBaseOffset + xComponentIndex]   = xZero;
        normals[apexBaseOffset + yComponentIndex]   = CONE_NORMALS.Y_UP;
        normals[apexBaseOffset + zComponentIndex]   = zZero;

        const apexUvOffset = apexIndex * uvComponentCount;
        uvs[apexUvOffset + uIndex] = center;
        uvs[apexUvOffset + vIndex] = CONE_LAYOUT.ORIGIN;
    }

    /**
     * Writes the bottom cap center and its downward normal.
     *
     * @param {Float32Array} positions                   - Output positions.
     * @param {Float32Array} normals                     - Output normals.
     * @param {Float32Array} uvs                         - Output texture coordinates.
     * @param {Required<ConeGeometryOptions>} normalized - Normalized geometry options.
     * @param {number} capCenterIndex                    - Cap center index.
     * @private
     */
    static #writeCapCenter(positions, normals, uvs, normalized, capCenterIndex) {
        const halfSizeDivisor        = GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;
        const uIndex                 = GEOMETRY_UV_INDEXES.U;
        const vIndex                 = GEOMETRY_UV_INDEXES.V;
        const xZero                  = CONE_NORMALS.X_ZERO;
        const zZero                  = CONE_NORMALS.Z_ZERO;
        const center                 = GEOMETRY_UV.CENTER;
        const yDown                  = CONE_NORMALS.Y_DOWN;
        const height                 = normalized.height;

        const capCenterBaseOffset = capCenterIndex * positionComponentCount;
        positions[capCenterBaseOffset + xComponentIndex] = CONE_LAYOUT.ORIGIN;
        positions[capCenterBaseOffset + yComponentIndex] = -height / halfSizeDivisor;
        positions[capCenterBaseOffset + zComponentIndex] = CONE_LAYOUT.ORIGIN;
        normals[capCenterBaseOffset + xComponentIndex]   = xZero;
        normals[capCenterBaseOffset + yComponentIndex]   = yDown;
        normals[capCenterBaseOffset + zComponentIndex]   = zZero;

        const capCenterUvOffset = capCenterIndex * uvComponentCount;
        uvs[capCenterUvOffset + uIndex] = center;
        uvs[capCenterUvOffset + vIndex] = center;
    }

    /**
     * Writes the bottom cap rim with radial texture coordinates.
     *
     * @param {Float32Array} positions                   - Output positions.
     * @param {Float32Array} normals                     - Output normals.
     * @param {Float32Array} uvs                         - Output texture coordinates.
     * @param {Required<ConeGeometryOptions>} normalized - Normalized geometry options.
     * @param {number} capCenterIndex                    - Cap center index.
     * @private
     */
    static #writeCapRing(positions, normals, uvs, normalized, capCenterIndex) {
        const halfSizeDivisor        = GEOMETRY_SIZES.HALF_SIZE_DIVISOR;
        const vertexIncrement        = GEOMETRY_GRID.VERTEX_INCREMENT;
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const fullTurn               = GEOMETRY_ANGLES.FULL_TURN;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;
        const uIndex                 = GEOMETRY_UV_INDEXES.U;
        const vIndex                 = GEOMETRY_UV_INDEXES.V;
        const xZero                  = CONE_NORMALS.X_ZERO;
        const zZero                  = CONE_NORMALS.Z_ZERO;
        const center                 = GEOMETRY_UV.CENTER;
        const yDown                  = CONE_NORMALS.Y_DOWN;
        const doubleSizeMultiplier   = GEOMETRY_SIZES.DOUBLE_SIZE_MULTIPLIER;
        const radiusX                = normalized.width / halfSizeDivisor;
        const radiusZ                = normalized.depth / halfSizeDivisor;
        const height                 = normalized.height;
        const radialSegments         = normalized.radialSegments;
        const ringVertexCount        = radialSegments + vertexIncrement;
        let vertexIndex              = capCenterIndex + GEOMETRY_GRID.VERTEX_INCREMENT;

        for (let radialVertexIndex = MATH_COMMON_VALUES.ZERO; radialVertexIndex < ringVertexCount; radialVertexIndex += MATH_COMMON_VALUES.UNIT) {
            const uNormalized        = radialVertexIndex / radialSegments;
            const angleRadians       = uNormalized * fullTurn;
            const cosTheta           = Math.cos(angleRadians);
            const sinTheta           = Math.sin(angleRadians);
            const positionX          = cosTheta * radiusX;
            const positionZ          = sinTheta * radiusZ;
            const positionBaseOffset = vertexIndex * positionComponentCount;

            positions[positionBaseOffset + xComponentIndex] = positionX;
            positions[positionBaseOffset + yComponentIndex] = -height / halfSizeDivisor;
            positions[positionBaseOffset + zComponentIndex] = positionZ;
            normals[positionBaseOffset + xComponentIndex]   = xZero;
            normals[positionBaseOffset + yComponentIndex]   = yDown;
            normals[positionBaseOffset + zComponentIndex]   = zZero;

            const uvBaseOffset = vertexIndex * uvComponentCount;
            uvs[uvBaseOffset + uIndex] = (radiusX === MATH_COMMON_VALUES.ZERO) ? center : ((positionX / (radiusX * doubleSizeMultiplier)) + center);
            uvs[uvBaseOffset + vIndex] = (radiusZ === MATH_COMMON_VALUES.ZERO) ? center : ((positionZ / (radiusZ * doubleSizeMultiplier)) + center);
            vertexIndex += MATH_COMMON_VALUES.UNIT;
        }
    }

    /**
     * Connects the side rings, apex and optional bottom cap.
     *
     * @param {Required<ConeGeometryOptions>} normalized - Normalized geometry options.
     * @param {number} apexIndex                         - Apex index.
     * @param {number} capCenterIndex                    - Cap center index.
     * @returns {number[]}
     * @private
     */
    static #createTriangleIndices(normalized, apexIndex, capCenterIndex) {
        const vertexIncrement      = GEOMETRY_GRID.VERTEX_INCREMENT;
        const nextVertexOffset     = GEOMETRY_GRID.NEXT_VERTEX_OFFSET;
        const radialSegments       = normalized.radialSegments;
        const heightSegments       = normalized.heightSegments;
        const ringVertexCount      = radialSegments + vertexIncrement;
        const sideRingCount        = heightSegments;
        const hasCap               = normalized.capped;
        const solidTriangleIndices = [];

        GeometryUtils.appendGridTriangleIndices(solidTriangleIndices, radialSegments, sideRingCount - vertexIncrement);
        const topRingStartIndex = (sideRingCount - vertexIncrement) * ringVertexCount;

        for (let radialIndex = MATH_COMMON_VALUES.ZERO; radialIndex < radialSegments; radialIndex += MATH_COMMON_VALUES.UNIT) {
            const topLeftVertexIndex  = topRingStartIndex  + radialIndex;
            const topRightVertexIndex = topLeftVertexIndex + nextVertexOffset;
            solidTriangleIndices.push(topLeftVertexIndex, apexIndex, topRightVertexIndex);
        }

        if (hasCap) {
            ConeGeometry.#appendCapIndices(solidTriangleIndices, radialSegments, capCenterIndex);
        }

        return solidTriangleIndices;
    }

    /**
     * Appends the triangle fan around the bottom cap center.
     *
     * @param {number[]} solidTriangleIndices - Output triangle indexes.
     * @param {number} radialSegments         - Radial segments.
     * @param {number} capCenterIndex         - Cap center index.
     * @private
     */
    static #appendCapIndices(solidTriangleIndices, radialSegments, capCenterIndex) {
        const vertexIncrement   = GEOMETRY_GRID.VERTEX_INCREMENT;
        const capRingStartIndex = capCenterIndex + vertexIncrement;

        for (let radialIndex = MATH_COMMON_VALUES.ZERO; radialIndex < radialSegments; radialIndex += MATH_COMMON_VALUES.UNIT) {
            const capLeftVertexIndex  = capRingStartIndex + radialIndex;
            const capRightVertexIndex = capRingStartIndex + radialIndex + vertexIncrement;
            solidTriangleIndices.push(capCenterIndex, capRightVertexIndex, capLeftVertexIndex);
        }
    }
}
