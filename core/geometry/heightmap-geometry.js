import { GeneratedGeometry }                        from './generated-geometry.js';
import { GeometryUtils }                            from './geometry-utils.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';

import {
    HEIGHTMAP_DEFAULTS,
    HEIGHTMAP_LIMITS,
    HEIGHTMAP_SAMPLING,
    HEIGHTMAP_LAYOUT,
    HEIGHTMAP_ERRORS
} from '../constants/heightmap-geometry.js';

import {
    GEOMETRY_GRID,
    GEOMETRY_LAYOUT,
    GEOMETRY_TRIANGLE_INDEXES,
    GEOMETRY_UV_INDEXES
} from '../constants/geometry.js';

/**
 * Heightmap source data.
 *
 * @typedef {Object} HeightmapSource
 * @property {ImageData} imageData - Heightmap image data.
 */

/**
 * Heightmap geometry options.
 *
 * `colors` supports:
 * - uniform RGB    (`length === 3`)
 * - per-vertex RGB (`length === vertexCount * 3`)
 *
 * Segment parameters must be `integers >= 1`.
 *
 * @typedef {Object} HeightmapGeometryOptions
 * @property {number} [width = 1.0]          - Terrain width along the X axis.
 * @property {number} [depth = 1.0]          - Terrain depth along the Z axis.
 * @property {number} [heightScale = 1.0]    - Heightmap scale multiplier.
 * @property {number} [heightOffset = 0.0]   - Heightmap offset along the Y axis.
 * @property {number} [segmentsX = 1]        - Segment count along the X axis.
 * @property {number} [segmentsZ = 1]        - Segment count along the Z axis.
 * @property {boolean} [isWireframe=false]   - Wireframe hint for consumers.
 * @property {Float32Array} [colors]         - Color specification buffer.
 * @property {boolean} [flipY = true]        - When true, flips heightmap sampling along the Y axis.
 * @property {string} [sampling = 'nearest'] - Sampling mode: `nearest` or `bilinear`.
 */

/**
 * Internal geometry buffers produced by `HeightmapGeometry`.
 *
 * @typedef {Object} HeightmapGeometryData
 * @property {Float32Array} positions                     - Vertex positions (xyz).
 * @property {Float32Array} normals                       - Vertex normals (xyz).
 * @property {Float32Array} uvs                           - Vertex UVs (uv).
 * @property {Float32Array} colors                        - Vertex colors (rgb).
 * @property {Uint16Array | Uint32Array} indicesSolid     - Triangle index buffer.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Line index buffer for wireframe.
 */

/**
 * Heightmap geometry on the XZ plane with Y up.
 */
export class HeightmapGeometry extends GeneratedGeometry {

    /**
     * Wireframe hint for consumers.
     *
     * @type {boolean}
     * @private
     */
    #isWireframe;

    /**
     * @param {WebGL2RenderingContext} webglContext          - WebGL2 rendering context.
     * @param {ImageData|HeightmapSource} heightmapImageData - Heightmap image data (grayscale) or a wrapped source.
     * @param {HeightmapGeometryOptions} [options={}]        - Geometry options.
     */
    constructor(webglContext, heightmapImageData, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(HEIGHTMAP_ERRORS.WEBGL_CONTEXT);
        }

        const imageData  = HeightmapGeometry.#normalizeHeightmapImageData(heightmapImageData);
        const normalized = HeightmapGeometry.#normalizeOptions(options);
        super(webglContext, imageData, normalized);
        this.#isWireframe = normalized.isWireframe;
    }

    /**
     * Returns the wireframe hint value from construction options.
     *
     * @returns {boolean}
     */
    get isWireframe() {
        return this.#isWireframe;
    }

    /**
     * Loads heightmap image data from a URL and returns a new `HeightmapGeometry`.
     *
     * @param {WebGL2RenderingContext} webglContext   - WebGL2 rendering context.
     * @param {string} url                            - Image URL (relative or absolute).
     * @param {HeightmapGeometryOptions} [options={}] - Geometry options.
     * @returns {Promise<HeightmapGeometry>}          - Promise, that resolves with created geometry.
     */
    static async loadFromUrl(webglContext, url, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(HEIGHTMAP_ERRORS.WEBGL_CONTEXT);
        }

        if (typeof url !== ECMASCRIPT_TYPEOF_RESULTS.STRING || url.length < HEIGHTMAP_LIMITS.MIN_REQUIRED_STRING_LENGTH) {
            throw new TypeError(HEIGHTMAP_ERRORS.LOAD_URL);
        }

        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(HEIGHTMAP_ERRORS.LOAD_OPTIONS);
        }

        const image     = await HeightmapGeometry.#loadImage(url);
        const imageData = HeightmapGeometry.#createImageData(image);
        return new HeightmapGeometry(webglContext, imageData, options);
    }

    /**
     * Normalizes constructor input to a `HeightmapGeometryOptions` object.
     *
     * @param {HeightmapGeometryOptions} options     - Options object.
     * @returns {Required<HeightmapGeometryOptions>} - Normalized options.
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(HEIGHTMAP_ERRORS.OPTIONS_PLAIN_OBJECT);
        }

        const {
            width        = HEIGHTMAP_DEFAULTS.WIDTH,
            depth        = HEIGHTMAP_DEFAULTS.DEPTH,
            heightScale  = HEIGHTMAP_DEFAULTS.HEIGHT_SCALE,
            heightOffset = HEIGHTMAP_DEFAULTS.HEIGHT_OFFSET,
            segmentsX    = HEIGHTMAP_DEFAULTS.SEGMENTS_X,
            segmentsZ    = HEIGHTMAP_DEFAULTS.SEGMENTS_Z,
            isWireframe  = HEIGHTMAP_DEFAULTS.WIREFRAME_STATE,
            colors       = HEIGHTMAP_DEFAULTS.TERRAIN_COLOR,
            flipY        = HEIGHTMAP_DEFAULTS.FLIP_Y,
            sampling     = HEIGHTMAP_DEFAULTS.SAMPLING
        } = options;

        if (typeof width !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || typeof depth !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER
            || !Number.isFinite(width) || !Number.isFinite(depth)
            || width <= HEIGHTMAP_LIMITS.MIN_POSITIVE_VALUE || depth <= HEIGHTMAP_LIMITS.MIN_POSITIVE_VALUE) {
            throw new RangeError(HEIGHTMAP_ERRORS.SIZE_VALUES);
        }

        if (typeof heightScale !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(heightScale) || heightScale <= HEIGHTMAP_LIMITS.MIN_POSITIVE_VALUE) {
            throw new RangeError(HEIGHTMAP_ERRORS.HEIGHT_SCALE_VALUE);
        }

        if (typeof heightOffset !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(heightOffset)) {
            throw new RangeError(HEIGHTMAP_ERRORS.HEIGHT_OFFSET_VALUE);
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError(HEIGHTMAP_ERRORS.COLORS_BUFFER);
        }

        if (typeof flipY !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(HEIGHTMAP_ERRORS.FLIP_Y_VALUE);
        }

        if (typeof isWireframe !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(HEIGHTMAP_ERRORS.WIREFRAME_VALUE);
        }

        const normalizedSampling = HeightmapGeometry.#normalizeSampling(sampling);

        return {
            width,
            depth,
            heightScale,
            heightOffset,
            segmentsX : GeometryUtils.normalizeSegmentCount(segmentsX, HEIGHTMAP_LAYOUT.SEGMENTS_X_OPTION_NAME, HEIGHTMAP_LIMITS.MIN_SEGMENT_COUNT, 'HeightmapGeometry'),
            segmentsZ : GeometryUtils.normalizeSegmentCount(segmentsZ, HEIGHTMAP_LAYOUT.SEGMENTS_Z_OPTION_NAME, HEIGHTMAP_LIMITS.MIN_SEGMENT_COUNT, 'HeightmapGeometry'),
            isWireframe,
            colors,
            flipY,
            sampling : normalizedSampling
        };
    }

    /**
     * Normalizes sampling mode.
     *
     * @param {string} sampling - Sampling mode input.
     * @returns {string}        - Normalized sampling mode.
     * @private
     */
    static #normalizeSampling(sampling) {
        if (typeof sampling !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(HEIGHTMAP_ERRORS.SAMPLING_VALUE);
        }

        if (sampling === HEIGHTMAP_SAMPLING.NEAREST || sampling === HEIGHTMAP_SAMPLING.BILINEAR) {
            return sampling;
        }

        throw new RangeError(HEIGHTMAP_ERRORS.SAMPLING_VALUE);
    }

    /**
     * Creates full geometry data for a heightmap terrain.
     *
     * @param {ImageData} heightmapImageData               - Heightmap source image data.
     * @param {Required<HeightmapGeometryOptions>} options - Normalized options.
     * @returns {HeightmapGeometryData}                    - Geometry buffers.
     * @protected
     */
    static createGeometryData(heightmapImageData, options) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const widthSegments          = options.segmentsX;
        const depthSegments          = options.segmentsZ;
        const widthVertexCount       = widthSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const depthVertexCount       = depthSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const vertexCount            = widthVertexCount * depthVertexCount;
        const positions              = new Float32Array(vertexCount * positionComponentCount);
        const uvs                    = new Float32Array(vertexCount * uvComponentCount);

        HeightmapGeometry.#writeVertices(positions, uvs, heightmapImageData, options);
        const solidTriangleIndices = [];
        GeometryUtils.appendGridTriangleIndices(solidTriangleIndices, widthSegments, depthSegments);

        const indicesSolid     = GeometryUtils.createIndexArray(vertexCount, solidTriangleIndices);
        const indicesWireframe = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
        const normals          = HeightmapGeometry.#computeVertexNormals(positions, indicesSolid, vertexCount);
        const colors           = GeometryUtils.createColorsFromSpec(vertexCount, options.colors);

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
     * Samples the heightmap at the given normalized UV coordinate.
     *
     * @param {ImageData} heightmapImageData               - Heightmap image data.
     * @param {number} uNormalized                         - Normalized U coordinate [0..1].
     * @param {number} vNormalized                         - Normalized V coordinate [0..1].
     * @param {Required<HeightmapGeometryOptions>} options - Normalized options.
     * @returns {number}                                   - Height value in [0..1].
     * @private
     */
    static #sampleHeight(heightmapImageData, uNormalized, vNormalized, options) {
        const heightmapWidth  = heightmapImageData.width;
        const heightmapHeight = heightmapImageData.height;
        const vSample         = options.flipY ? (MATH_COMMON_VALUES.UNIT - vNormalized) : vNormalized;

        if (options.sampling === HEIGHTMAP_SAMPLING.BILINEAR) {
            // Convert normalized UV to continuous pixel coordinates in `[0..width - 1] / [0..height - 1]`
            const xFloat = uNormalized * (heightmapWidth - MATH_COMMON_VALUES.UNIT);
            const yFloat = vSample * (heightmapHeight - MATH_COMMON_VALUES.UNIT);

            // Find the 2x2 pixel neighborhood around the sample point (clamped to image bounds)
            const x0 = Math.floor(xFloat);
            const y0 = Math.floor(yFloat);
            const x1 = Math.min(x0 + MATH_COMMON_VALUES.UNIT, heightmapWidth  - MATH_COMMON_VALUES.UNIT);
            const y1 = Math.min(y0 + MATH_COMMON_VALUES.UNIT, heightmapHeight - MATH_COMMON_VALUES.UNIT);

            // Compute interpolation weights inside the cell
            const tx = xFloat - x0;
            const ty = yFloat - y0;

            // Fetch heights at the 2x2 neighborhood corners and bilinearly interpolate
            const h00 = HeightmapGeometry.#getHeightAt(heightmapImageData, x0, y0);
            const h10 = HeightmapGeometry.#getHeightAt(heightmapImageData, x1, y0);
            const h01 = HeightmapGeometry.#getHeightAt(heightmapImageData, x0, y1);
            const h11 = HeightmapGeometry.#getHeightAt(heightmapImageData, x1, y1);
            const h0  = h00 + ((h10 - h00) * tx);
            const h1  = h01 + ((h11 - h01) * tx);
            return h0 + ((h1 - h0) * ty);
        }

        const xIndex = Math.round(uNormalized * (heightmapWidth - MATH_COMMON_VALUES.UNIT));
        const yIndex = Math.round(vSample * (heightmapHeight - MATH_COMMON_VALUES.UNIT));
        return HeightmapGeometry.#getHeightAt(heightmapImageData, xIndex, yIndex);
    }

    /**
     * Reads normalized height from image data at a pixel coordinate.
     *
     * @param {ImageData} heightmapImageData - Heightmap image data.
     * @param {number} xIndex                - Pixel X coordinate.
     * @param {number} yIndex                - Pixel Y coordinate.
     * @returns {number}                     - Height value in [0..1].
     * @private
     */
    static #getHeightAt(heightmapImageData, xIndex, yIndex) {
        const width      = heightmapImageData.width;
        const data       = heightmapImageData.data;
        const pixelIndex = ((yIndex * width) + xIndex) * HEIGHTMAP_LAYOUT.BYTES_PER_PIXEL;
        const redValue   = data[pixelIndex + HEIGHTMAP_LAYOUT.RED_CHANNEL_OFFSET];
        return redValue / HEIGHTMAP_LAYOUT.MAX_CHANNEL_VALUE;
    }

    /**
     * Computes per-vertex normals from positions and indices.
     *
     * @param {Float32Array} positions            - Vertex positions.
     * @param {Uint16Array | Uint32Array} indices - Triangle indices.
     * @param {number} vertexCount                - Total vertex count.
     * @returns {Float32Array}                    - Vertex normals.
     * @private
     */
    static #computeVertexNormals(positions, indices, vertexCount) {
        const normals = new Float32Array(vertexCount * GEOMETRY_LAYOUT.NORMAL_COMPONENT_COUNT);
        HeightmapGeometry.#accumulateFaceNormals(positions, indices, normals);
        HeightmapGeometry.#normalizeVertexNormals(normals, vertexCount);
        return normals;
    }

    /**
     * Extracts `ImageData` from supported heightmap source formats.
     *
     * @param {ImageData|HeightmapSource} source - Heightmap source.
     * @returns {ImageData}                      - Extracted image data.
     * @private
     */
    static #normalizeHeightmapImageData(source) {
        if (source instanceof ImageData) {
            return source;
        }

        if (source === null || typeof source !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(source)) {
            throw new TypeError(HEIGHTMAP_ERRORS.HEIGHTMAP_IMAGE_DATA);
        }

        const imageData = source[HEIGHTMAP_LAYOUT.SOURCE_IMAGE_DATA_FIELD];

        if (!(imageData instanceof ImageData)) {
            throw new TypeError(HEIGHTMAP_ERRORS.HEIGHTMAP_IMAGE_DATA);
        }

        return imageData;
    }

    /**
     * Loads an `HTMLImageElement` from a URL.
     *
     * @param {string} url                  - Image URL.
     * @returns {Promise<HTMLImageElement>} - Promise, that resolves with a decoded image on `load`, or rejects on `error`.
     * @private
     */
    static #loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = HEIGHTMAP_LAYOUT.IMAGE_CROSS_ORIGIN_ANON;
            image.onload      = () => resolve(image);
            image.onerror     = () => reject(new Error(HEIGHTMAP_ERRORS.LOAD_IMAGE_PREFIX + url));
            image.src         = url;
        });
    }

    /**
     * Creates ImageData from a loaded image.
     *
     * @param {HTMLImageElement} image - Loaded image element.
     * @returns {ImageData}            - Extracted image data.
     * @private
     */
    static #createImageData(image) {
        const canvas  = document.createElement(HEIGHTMAP_LAYOUT.CANVAS_TAG_NAME);
        const context = canvas.getContext(HEIGHTMAP_LAYOUT.CANVAS_CONTEXT_2D);

        if (!context) {
            throw new Error(HEIGHTMAP_ERRORS.CANVAS_CONTEXT);
        }

        canvas.width  = image.width;
        canvas.height = image.height;
        context.drawImage(image, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);
        return context.getImageData(MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO, image.width, image.height);
    }

    /**
     * Heightmap sampling modes.
     *
     * @returns {{ NEAREST: string, BILINEAR: string }}
     */
    static get Sampling() {
        return Object.freeze({
            NEAREST  : HEIGHTMAP_SAMPLING.NEAREST,
            BILINEAR : HEIGHTMAP_SAMPLING.BILINEAR
        });
    }

    /**
     * Writes terrain positions and texture coordinates from the heightmap.
     *
     * @param {Float32Array} positions                     - Output positions.
     * @param {Float32Array} uvs                           - Output texture coordinates.
     * @param {ImageData} heightmapImageData               - Source heightmap pixels.
     * @param {Required<HeightmapGeometryOptions>} options - Normalized geometry options.
     * @private
     */
    static #writeVertices(positions, uvs, heightmapImageData, options) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const uvComponentCount       = GEOMETRY_LAYOUT.UV_COMPONENT_COUNT;
        const centerOffset           = GEOMETRY_GRID.CENTER_OFFSET;
        const widthSegments          = options.segmentsX;
        const depthSegments          = options.segmentsZ;
        const widthVertexCount       = widthSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        const depthVertexCount       = depthSegments + GEOMETRY_GRID.VERTEX_INCREMENT;
        let vertexIndex              = MATH_COMMON_VALUES.ZERO;

        for (let zIndex = MATH_COMMON_VALUES.ZERO; zIndex < depthVertexCount; zIndex += MATH_COMMON_VALUES.UNIT) {
            const vNormalized = zIndex / depthSegments;
            const positionZ   = (vNormalized - centerOffset) * options.depth;

            for (let xIndex = MATH_COMMON_VALUES.ZERO; xIndex < widthVertexCount; xIndex += MATH_COMMON_VALUES.UNIT) {
                const uNormalized = xIndex / widthSegments;
                const positionX   = (uNormalized - centerOffset) * options.width;
                const height      = HeightmapGeometry.#sampleHeight(
                    heightmapImageData,
                    uNormalized,
                    vNormalized,
                    options
                );

                const positionY          = (height * options.heightScale) + options.heightOffset;
                const positionBaseOffset = vertexIndex * positionComponentCount;
                positions[positionBaseOffset + MATH_VECTOR3_INDEXES.X] = positionX;
                positions[positionBaseOffset + MATH_VECTOR3_INDEXES.Y] = positionY;
                positions[positionBaseOffset + MATH_VECTOR3_INDEXES.Z] = positionZ;

                const uvBaseOffset = vertexIndex * uvComponentCount;
                uvs[uvBaseOffset + GEOMETRY_UV_INDEXES.U] = uNormalized;
                uvs[uvBaseOffset + GEOMETRY_UV_INDEXES.V] = vNormalized;
                vertexIndex += MATH_COMMON_VALUES.UNIT;
            }
        }
    }

    /**
     * Adds each triangle normal to the three vertices that share it.
     *
     * @param {Float32Array} positions            - Output positions.
     * @param {Uint16Array | Uint32Array} indices - Indices.
     * @param {Float32Array} normals              - Output normals.
     * @private
     */
    static #accumulateFaceNormals(positions, indices, normals) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;

        for (let i = MATH_COMMON_VALUES.ZERO; i < indices.length; i += GEOMETRY_LAYOUT.TRIANGLE_INDEX_COUNT) {
            // Convert vertex indices (A, B, C) to the base offsets in the flat `vec3` buffer (vertexIndex * 3)
            const indexA = indices[i + GEOMETRY_TRIANGLE_INDEXES.FIRST]  * positionComponentCount;
            const indexB = indices[i + GEOMETRY_TRIANGLE_INDEXES.SECOND] * positionComponentCount;
            const indexC = indices[i + GEOMETRY_TRIANGLE_INDEXES.THIRD]  * positionComponentCount;

            // Fetch triangle vertex positions from the flat positions buffer
            const ax = positions[indexA + xComponentIndex];
            const ay = positions[indexA + yComponentIndex];
            const az = positions[indexA + zComponentIndex];
            const bx = positions[indexB + xComponentIndex];
            const by = positions[indexB + yComponentIndex];
            const bz = positions[indexB + zComponentIndex];
            const cx = positions[indexC + xComponentIndex];
            const cy = positions[indexC + yComponentIndex];
            const cz = positions[indexC + zComponentIndex];

            // Build edges `AB and AC`
            const abx = bx - ax;
            const aby = by - ay;
            const abz = bz - az;
            const acx = cx - ax;
            const acy = cy - ay;
            const acz = cz - az;

            // `Face normal = cross(AB, AC)`, accumulated into per-vertex normals
            const crossX = (aby * acz) - (abz * acy);
            const crossY = (abz * acx) - (abx * acz);
            const crossZ = (abx * acy) - (aby * acx);

            // Accumulate the face normal into each of the triangle's vertex normals (A, B, C)
            normals[indexA + xComponentIndex] += crossX;
            normals[indexA + yComponentIndex] += crossY;
            normals[indexA + zComponentIndex] += crossZ;
            normals[indexB + xComponentIndex] += crossX;
            normals[indexB + yComponentIndex] += crossY;
            normals[indexB + zComponentIndex] += crossZ;
            normals[indexC + xComponentIndex] += crossX;
            normals[indexC + yComponentIndex] += crossY;
            normals[indexC + zComponentIndex] += crossZ;
        }
    }

    /**
     * Normalizes accumulated vertex normals while preserving zero-length normals.
     *
     * @param {Float32Array} normals - Output normals.
     * @param {number} vertexCount   - Vertex count.
     * @private
     */
    static #normalizeVertexNormals(normals, vertexCount) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const xComponentIndex        = MATH_VECTOR3_INDEXES.X;
        const yComponentIndex        = MATH_VECTOR3_INDEXES.Y;
        const zComponentIndex        = MATH_VECTOR3_INDEXES.Z;

        for (let vertexIndex = MATH_COMMON_VALUES.ZERO; vertexIndex < vertexCount; vertexIndex += MATH_COMMON_VALUES.UNIT) {
            const baseIndex = vertexIndex * positionComponentCount;
            const nx        = normals[baseIndex + xComponentIndex];
            const ny        = normals[baseIndex + yComponentIndex];
            const nz        = normals[baseIndex + zComponentIndex];
            const length    = Math.sqrt((nx * nx) + (ny * ny) + (nz * nz));

            if (length > MATH_COMMON_VALUES.ZERO) {
                const inverseLength = MATH_COMMON_VALUES.UNIT / length;
                normals[baseIndex + xComponentIndex] = nx * inverseLength;
                normals[baseIndex + yComponentIndex] = ny * inverseLength;
                normals[baseIndex + zComponentIndex] = nz * inverseLength;
            }
        }
    }
}
