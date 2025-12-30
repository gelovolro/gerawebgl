import { Geometry } from './geometry.js';
import {
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default heightmap geometry width along the X axis.
 *
 * @type {number}
 */
const DEFAULT_HEIGHTMAP_WIDTH = 1.0;

/**
 * Default heightmap geometry depth along the Z axis.
 *
 * @type {number}
 */
const DEFAULT_HEIGHTMAP_DEPTH = 1.0;

/**
 * Default height scale multiplier (amplitude).
 *
 * @type {number}
 */
const DEFAULT_HEIGHT_SCALE = 1.0;

/**
 * Default height offset applied to all vertices.
 *
 * @type {number}
 */
const DEFAULT_HEIGHT_OFFSET = 0.0;

/**
 * Default segment count along the X axis.
 *
 * @type {number}
 */
const DEFAULT_SEGMENTS_X = 1;

/**
 * Default segment count along the Z axis.
 *
 * @type {number}
 */
const DEFAULT_SEGMENTS_Z = 1;

/**
 * Minimum segment count supported by heightmap geometry.
 *
 * @type {number}
 */
const MIN_SEGMENT_COUNT = 1;

/**
 * Lower bound for positive-only numeric options.
 *
 * @type {number}
 */
const MIN_POSITIVE_VALUE = 0;

/**
 * Default wireframe hint state.
 *
 * @type {boolean}
 */
const DEFAULT_WIREFRAME_STATE = false;

/**
 * Default vertical flip for heightmap sampling.
 *
 * @type {boolean}
 */
const DEFAULT_FLIP_Y = true;

/**
 * Heightmap sampling mode: `nearest`.
 *
 * @type {string}
 */
const SAMPLING_NEAREST = 'nearest';

/**
 * Heightmap sampling mode: `bilinear`.
 *
 * @type {string}
 */
const SAMPLING_BILINEAR = 'bilinear';

/**
 * Default heightmap sampling mode.
 *
 * @type {string}
 */
const DEFAULT_SAMPLING = SAMPLING_NEAREST;

/**
 * Default terrain color red component.
 *
 * @type {number}
 */
const DEFAULT_TERRAIN_COLOR_RED = 0.18;

/**
 * Default terrain color green component.
 *
 * @type {number}
 */
const DEFAULT_TERRAIN_COLOR_GREEN = 0.65;

/**
 * Default terrain color blue component.
 *
 * @type {number}
 */
const DEFAULT_TERRAIN_COLOR_BLUE = 0.28;

/**
 * Default terrain vertex color (green).
 *
 * @type {Float32Array}
 */
const DEFAULT_TERRAIN_COLOR = new Float32Array([
    DEFAULT_TERRAIN_COLOR_RED,
    DEFAULT_TERRAIN_COLOR_GREEN,
    DEFAULT_TERRAIN_COLOR_BLUE
]);

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
 * Used to center coordinates around the origin: `(t - 0.5) * size`.
 *
 * @type {number}
 */
const CENTER_T_OFFSET = 0.5;

/**
 * Number of float components per `vec3` (position/normal).
 *
 * @type {number}
 */
const VECTOR_COMPONENTS_3 = 3;

/**
 * Number of float components per `vec2` (uv).
 *
 * @type {number}
 */
const UV_COMPONENTS_2 = 2;

/**
 * X component index within `vec3`.
 *
 * @type {number}
 */
const X_INDEX = 0;

/**
 * Y component index within `vec3`.
 *
 * @type {number}
 */
const Y_INDEX = 1;

/**
 * Z component index within `vec3`.
 *
 * @type {number}
 */
const Z_INDEX = 2;

/**
 * U component index within `vec2`.
 *
 * @type {number}
 */
const U_INDEX = 0;

/**
 * V component index within `vec2`.
 *
 * @type {number}
 */
const V_INDEX = 1;

/**
 * Indices per triangle (3 vertices).
 *
 * @type {number}
 */
const TRIANGLE_INDEX_STRIDE = 3;

/**
 * Number of bytes per RGBA pixel.
 *
 * @type {number}
 */
const BYTES_PER_PIXEL = 4;

/**
 * Red channel offset inside RGBA pixel data.
 *
 * @type {number}
 */
const RED_CHANNEL_OFFSET = 0;

/**
 * Maximum channel value for 8-bit color channels.
 *
 * @type {number}
 */
const MAX_CHANNEL_VALUE = 255;

/**
 * String tag name used to create canvas elements.
 *
 * @type {string}
 */
const CANVAS_TAG_NAME = 'canvas';

/**
 * String identifier for 2D canvas context.
 *
 * @type {string}
 */
const CANVAS_CONTEXT_2D = '2d';

/**
 * Minimal allowed string length for required input url, used in `loadFromUrl()` method.
 *
 * @type {number}
 */
const MIN_REQUIRED_STRING_LENGTH = 1;

/**
 * Numeric zero value used for comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Numeric one value used for comparisons.
 *
 * @type {number}
 */
const ONE_VALUE = 1;

/**
 * Error message for invalid options object.
 *
 * @type {string}
 */
const ERROR_OPTIONS_PLAIN_OBJECT = '`HeightmapGeometry` expects options as a plain object.';

/**
 * Error message for invalid WebGL context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT = '`HeightmapGeometry` expects `webglContext` as a `WebGL2RenderingContext`.';

/**
 * Error message for invalid heightmap image data.
 *
 * @type {string}
 */
const ERROR_HEIGHTMAP_IMAGE_DATA = '`HeightmapGeometry` expects `heightmapImageData` as an `ImageData` instance or a `HeightmapSource` with `imageData`.';

/**
 * Field name for `HeightmapSource.imageData`.
 *
 * @type {string}
 */
const HEIGHTMAP_SOURCE_IMAGE_DATA_FIELD = 'imageData';

/**
 * Error message for invalid width/depth values.
 *
 * @type {string}
 */
const ERROR_SIZE_VALUES = '`HeightmapGeometry` expects `width` and `depth` as positive numbers.';

/**
 * Error message for invalid height scale value.
 *
 * @type {string}
 */
const ERROR_HEIGHT_SCALE_VALUE = '`HeightmapGeometry` expects `heightScale` as a positive number.';

/**
 * Error message for invalid height offset value.
 *
 * @type {string}
 */
const ERROR_HEIGHT_OFFSET_VALUE = '`HeightmapGeometry` expects `heightOffset` as a finite number.';

/**
 * Error message for invalid colors buffer.
 *
 * @type {string}
 */
const ERROR_COLORS_BUFFER = '`HeightmapGeometry` expects `colors` as a `Float32Array`.';

/**
 * Error message for invalid flipY option.
 *
 * @type {string}
 */
const ERROR_FLIP_Y_VALUE = '`HeightmapGeometry` expects `flipY` as a boolean.';

/**
 * Error message for invalid isWireframe option.
 *
 * @type {string}
 */
const ERROR_WIREFRAME_VALUE = '`HeightmapGeometry` expects `isWireframe` as a boolean.';

/**
 * Error message for invalid sampling option.
 *
 * @type {string}
 */
const ERROR_SAMPLING_VALUE = '`HeightmapGeometry` expects `sampling` to be a supported string value.';

/**
 * Error message for invalid segments option.
 *
 * @type {string}
 */
const ERROR_SEGMENT_VALUE = '`HeightmapGeometry` expects `{name}` to be a finite number.';

/**
 * Error message for segments below minimum.
 *
 * @type {string}
 */
const ERROR_SEGMENT_RANGE = '`HeightmapGeometry` expects `{name}` to be `>= {min}`.';

/**
 * Error message for invalid load URL.
 *
 * @type {string}
 */
const ERROR_LOAD_URL = '`HeightmapGeometry.loadFromUrl` expects url as a non-empty string.';

/**
 * Error message for invalid load options.
 *
 * @type {string}
 */
const ERROR_LOAD_OPTIONS = '`HeightmapGeometry.loadFromUrl` expects options as a plain object.';

/**
 * Error message for missing 2D canvas context.
 *
 * @type {string}
 */
const ERROR_CANVAS_CONTEXT = '`HeightmapGeometry.loadFromUrl` failed to acquire a 2D canvas context.';

/**
 * Error message prefix for image load failures.
 *
 * @type {string}
 */
const ERROR_LOAD_IMAGE_PREFIX = 'Failed to load the heightmap image: ';

/**
 * Option name for `segmentsX` in error messages.
 *
 * @type {string}
 */
const SEGMENTS_X_OPTION_NAME = 'segmentsX';

/**
 * Option name for `segmentsZ` in error messages.
 *
 * @type {string}
 */
const SEGMENTS_Z_OPTION_NAME = 'segmentsZ';

/**
 * Cross-origin mode for images used in canvas extraction.
 *
 * Prevents the `tainted canvas` issues, when loading images from other origins
 * (requires server to send the proper CORS headers).
 *
 * @type {string}
 */
const IMAGE_CROSS_ORIGIN_ANON = 'anonymous';

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
export class HeightmapGeometry extends Geometry {

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
            throw new TypeError(ERROR_WEBGL_CONTEXT);
        }

        const imageData  = HeightmapGeometry.#normalizeHeightmapImageData(heightmapImageData);
        const normalized = HeightmapGeometry.#normalizeOptions(options);
        const data       = HeightmapGeometry.#createGeometryData(imageData, normalized);

        super(
            webglContext,
            data.positions,
            data.colors,
            data.indicesSolid,
            data.indicesWireframe,
            data.uvs,
            data.normals
        );

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
            throw new TypeError(ERROR_WEBGL_CONTEXT);
        }

        if (typeof url !== 'string' || url.length < MIN_REQUIRED_STRING_LENGTH) {
            throw new TypeError(ERROR_LOAD_URL);
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError(ERROR_LOAD_OPTIONS);
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
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError(ERROR_OPTIONS_PLAIN_OBJECT);
        }

        const {
            width        = DEFAULT_HEIGHTMAP_WIDTH,
            depth        = DEFAULT_HEIGHTMAP_DEPTH,
            heightScale  = DEFAULT_HEIGHT_SCALE,
            heightOffset = DEFAULT_HEIGHT_OFFSET,
            segmentsX    = DEFAULT_SEGMENTS_X,
            segmentsZ    = DEFAULT_SEGMENTS_Z,
            isWireframe  = DEFAULT_WIREFRAME_STATE,
            colors       = DEFAULT_TERRAIN_COLOR,
            flipY        = DEFAULT_FLIP_Y,
            sampling     = DEFAULT_SAMPLING
        } = options;

        if (typeof width !== 'number' || typeof depth !== 'number'
            || !Number.isFinite(width) || !Number.isFinite(depth)
            || width <= MIN_POSITIVE_VALUE || depth <= MIN_POSITIVE_VALUE) {
            throw new RangeError(ERROR_SIZE_VALUES);
        }

        if (typeof heightScale !== 'number' || !Number.isFinite(heightScale) || heightScale <= MIN_POSITIVE_VALUE) {
            throw new RangeError(ERROR_HEIGHT_SCALE_VALUE);
        }

        if (typeof heightOffset !== 'number' || !Number.isFinite(heightOffset)) {
            throw new RangeError(ERROR_HEIGHT_OFFSET_VALUE);
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError(ERROR_COLORS_BUFFER);
        }

        if (typeof flipY !== 'boolean') {
            throw new TypeError(ERROR_FLIP_Y_VALUE);
        }

        if (typeof isWireframe !== 'boolean') {
            throw new TypeError(ERROR_WIREFRAME_VALUE);
        }

        const normalizedSampling = HeightmapGeometry.#normalizeSampling(sampling);

        return {
            width,
            depth,
            heightScale,
            heightOffset,
            segmentsX : HeightmapGeometry.#normalizeSegmentCount(segmentsX, SEGMENTS_X_OPTION_NAME),
            segmentsZ : HeightmapGeometry.#normalizeSegmentCount(segmentsZ, SEGMENTS_Z_OPTION_NAME),
            isWireframe,
            colors,
            flipY,
            sampling : normalizedSampling
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
            throw new TypeError(ERROR_SEGMENT_VALUE.replace('{name}', optionName));
        }

        const intValue = Math.floor(value);

        if (intValue < MIN_SEGMENT_COUNT) {
            /* eslint-disable indent */
            throw new RangeError(
                ERROR_SEGMENT_RANGE
                .replace('{name}', optionName)
                .replace('{min}', String(MIN_SEGMENT_COUNT))
            );
            /* eslint-enable indent */
        }

        return intValue;
    }

    /**
     * Normalizes sampling mode.
     *
     * @param {string} sampling - Sampling mode input.
     * @returns {string}        - Normalized sampling mode.
     * @private
     */
    static #normalizeSampling(sampling) {
        if (typeof sampling !== 'string') {
            throw new TypeError(ERROR_SAMPLING_VALUE);
        }

        if (sampling === SAMPLING_NEAREST || sampling === SAMPLING_BILINEAR) {
            return sampling;
        }

        throw new RangeError(ERROR_SAMPLING_VALUE);
    }

    /**
     * Creates full geometry data for a heightmap terrain.
     *
     * @param {ImageData} heightmapImageData               - Heightmap source image data.
     * @param {Required<HeightmapGeometryOptions>} options - Normalized options.
     * @returns {HeightmapGeometryData}                    - Geometry buffers.
     * @private
     */
    static #createGeometryData(heightmapImageData, options) {
        const widthSegments    = options.segmentsX;
        const depthSegments    = options.segmentsZ;
        const widthVertexCount = widthSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const depthVertexCount = depthSegments + VERTICES_PER_SEGMENT_INCREMENT;
        const vertexCount      = widthVertexCount * depthVertexCount;
        const positions        = new Float32Array(vertexCount * VECTOR_COMPONENTS_3);
        const uvs              = new Float32Array(vertexCount * UV_COMPONENTS_2);
        let vertexIndex        = ZERO_VALUE;

        for (let zIndex = ZERO_VALUE; zIndex < depthVertexCount; zIndex += ONE_VALUE) {
            const vNormalized = zIndex / depthSegments;
            const positionZ   = (vNormalized - CENTER_T_OFFSET) * options.depth;

            for (let xIndex = ZERO_VALUE; xIndex < widthVertexCount; xIndex += ONE_VALUE) {
                const uNormalized = xIndex / widthSegments;
                const positionX   = (uNormalized - CENTER_T_OFFSET) * options.width;
                const height      = HeightmapGeometry.#sampleHeight(
                    heightmapImageData,
                    uNormalized,
                    vNormalized,
                    options
                );

                const positionY          = (height * options.heightScale) + options.heightOffset;
                const positionBaseOffset = vertexIndex * VECTOR_COMPONENTS_3;
                positions[positionBaseOffset + X_INDEX] = positionX;
                positions[positionBaseOffset + Y_INDEX] = positionY;
                positions[positionBaseOffset + Z_INDEX] = positionZ;

                const uvBaseOffset = vertexIndex * UV_COMPONENTS_2;
                uvs[uvBaseOffset + U_INDEX] = uNormalized;
                uvs[uvBaseOffset + V_INDEX] = vNormalized;
                vertexIndex += ONE_VALUE;
            }
        }

        const solidTriangleIndices = [];

        for (let zIndex = ZERO_VALUE; zIndex < depthSegments; zIndex += ONE_VALUE) {
            for (let xIndex = ZERO_VALUE; xIndex < widthSegments; xIndex += ONE_VALUE) {
                const topLeftVertexIndex     = (zIndex * widthVertexCount) + xIndex;
                const topRightVertexIndex    = topLeftVertexIndex    + NEXT_VERTEX_OFFSET;
                const bottomLeftVertexIndex  = topLeftVertexIndex    + widthVertexCount;
                const bottomRightVertexIndex = bottomLeftVertexIndex + NEXT_VERTEX_OFFSET;
                solidTriangleIndices.push(topLeftVertexIndex , bottomLeftVertexIndex, topRightVertexIndex);
                solidTriangleIndices.push(topRightVertexIndex, bottomLeftVertexIndex, bottomRightVertexIndex);
            }
        }

        const indicesSolid     = createIndexArray(vertexCount, solidTriangleIndices);
        const indicesWireframe = createWireframeIndicesFromSolidIndices(vertexCount, indicesSolid);
        const normals          = HeightmapGeometry.#computeVertexNormals(positions, indicesSolid, vertexCount);
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
        const vSample         = options.flipY ? (ONE_VALUE - vNormalized) : vNormalized;

        if (options.sampling === SAMPLING_BILINEAR) {
            // Convert normalized UV to continuous pixel coordinates in `[0..width - 1] / [0..height - 1]`:
            const xFloat = uNormalized * (heightmapWidth - ONE_VALUE);
            const yFloat = vSample * (heightmapHeight - ONE_VALUE);

            // Find the 2x2 pixel neighborhood around the sample point (clamped to image bounds):
            const x0 = Math.floor(xFloat);
            const y0 = Math.floor(yFloat);
            const x1 = Math.min(x0 + ONE_VALUE, heightmapWidth  - ONE_VALUE);
            const y1 = Math.min(y0 + ONE_VALUE, heightmapHeight - ONE_VALUE);

            // Compute interpolation weights inside the cell:
            const tx = xFloat - x0;
            const ty = yFloat - y0;

            // Fetch heights at the 2x2 neighborhood corners and bilinearly interpolate:
            const h00 = HeightmapGeometry.#getHeightAt(heightmapImageData, x0, y0);
            const h10 = HeightmapGeometry.#getHeightAt(heightmapImageData, x1, y0);
            const h01 = HeightmapGeometry.#getHeightAt(heightmapImageData, x0, y1);
            const h11 = HeightmapGeometry.#getHeightAt(heightmapImageData, x1, y1);
            const h0  = h00 + ((h10 - h00) * tx);
            const h1  = h01 + ((h11 - h01) * tx);
            return h0 + ((h1 - h0) * ty);
        }

        const xIndex = Math.round(uNormalized * (heightmapWidth - ONE_VALUE));
        const yIndex = Math.round(vSample * (heightmapHeight - ONE_VALUE));
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
        const pixelIndex = ((yIndex * width) + xIndex) * BYTES_PER_PIXEL;
        const redValue   = data[pixelIndex + RED_CHANNEL_OFFSET];
        return redValue / MAX_CHANNEL_VALUE;
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
        const normals = new Float32Array(vertexCount * VECTOR_COMPONENTS_3);

        for (let i = ZERO_VALUE; i < indices.length; i += TRIANGLE_INDEX_STRIDE) {
            // Convert vertex indices (A, B, C) to the base offsets in the flat `vec3` buffer (vertexIndex * 3):
            const indexA = indices[i + X_INDEX] * VECTOR_COMPONENTS_3;
            const indexB = indices[i + Y_INDEX] * VECTOR_COMPONENTS_3;
            const indexC = indices[i + Z_INDEX] * VECTOR_COMPONENTS_3;

            // Fetch triangle vertex positions from the flat positions buffer:
            const ax = positions[indexA + X_INDEX];
            const ay = positions[indexA + Y_INDEX];
            const az = positions[indexA + Z_INDEX];
            const bx = positions[indexB + X_INDEX];
            const by = positions[indexB + Y_INDEX];
            const bz = positions[indexB + Z_INDEX];
            const cx = positions[indexC + X_INDEX];
            const cy = positions[indexC + Y_INDEX];
            const cz = positions[indexC + Z_INDEX];

            // Build edges `AB and AC`:
            const abx = bx - ax;
            const aby = by - ay;
            const abz = bz - az;
            const acx = cx - ax;
            const acy = cy - ay;
            const acz = cz - az;

            // `Face normal = cross(AB, AC)`, accumulated into per-vertex normals:
            const crossX = (aby * acz) - (abz * acy);
            const crossY = (abz * acx) - (abx * acz);
            const crossZ = (abx * acy) - (aby * acx);

            // Accumulate the face normal into each of the triangle's vertex normals (A, B, C):
            normals[indexA + X_INDEX] += crossX;
            normals[indexA + Y_INDEX] += crossY;
            normals[indexA + Z_INDEX] += crossZ;
            normals[indexB + X_INDEX] += crossX;
            normals[indexB + Y_INDEX] += crossY;
            normals[indexB + Z_INDEX] += crossZ;
            normals[indexC + X_INDEX] += crossX;
            normals[indexC + Y_INDEX] += crossY;
            normals[indexC + Z_INDEX] += crossZ;
        }

        for (let vertexIndex = ZERO_VALUE; vertexIndex < vertexCount; vertexIndex += ONE_VALUE) {
            const baseIndex = vertexIndex * VECTOR_COMPONENTS_3;
            const nx        = normals[baseIndex + X_INDEX];
            const ny        = normals[baseIndex + Y_INDEX];
            const nz        = normals[baseIndex + Z_INDEX];
            const length    = Math.sqrt((nx * nx) + (ny * ny) + (nz * nz));

            if (length > ZERO_VALUE) {
                const invLength = ONE_VALUE / length;
                normals[baseIndex + X_INDEX] = nx * invLength;
                normals[baseIndex + Y_INDEX] = ny * invLength;
                normals[baseIndex + Z_INDEX] = nz * invLength;
            }
        }

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

        if (source === null || typeof source !== 'object' || Array.isArray(source)) {
            throw new TypeError(ERROR_HEIGHTMAP_IMAGE_DATA);
        }

        const imageData = source[HEIGHTMAP_SOURCE_IMAGE_DATA_FIELD];

        if (!(imageData instanceof ImageData)) {
            throw new TypeError(ERROR_HEIGHTMAP_IMAGE_DATA);
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
            const image       = new Image();
            image.crossOrigin = IMAGE_CROSS_ORIGIN_ANON;
            image.onload      = () => resolve(image);
            image.onerror     = () => reject(new Error(ERROR_LOAD_IMAGE_PREFIX + url));
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
        const canvas  = document.createElement(CANVAS_TAG_NAME);
        const context = canvas.getContext(CANVAS_CONTEXT_2D);

        if (!context) {
            throw new Error(ERROR_CANVAS_CONTEXT);
        }

        canvas.width  = image.width;
        canvas.height = image.height;
        context.drawImage(image, ZERO_VALUE, ZERO_VALUE);
        return context.getImageData(ZERO_VALUE, ZERO_VALUE, image.width, image.height);
    }

    /**
     * Heightmap sampling modes.
     *
     * @returns {{ NEAREST: string, BILINEAR: string }}
     */
    static get Sampling() {
        return Object.freeze({
            NEAREST  : SAMPLING_NEAREST,
            BILINEAR : SAMPLING_BILINEAR
        });
    }
}
