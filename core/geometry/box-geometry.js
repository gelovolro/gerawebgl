import { Geometry } from './geometry.js';

/**
 * Default box edge size.
 *
 * @type {number}
 */
const DEFAULT_BOX_SIZE = 1.0;

/**
 * Divisor used to compute the half-size from the full size.
 *
 * @type {number}
 */
const BOX_HALF_SIZE_DIVISOR = 2.0;

/**
 * Default vertex color (white). Used to keep `VertexColorMaterial` working without providing explicit colors.
 *
 * @type {Float32Array}
 */
const DEFAULT_VERTEX_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Number of faces of a box.
 *
 * @type {number}
 */
const BOX_FACE_COUNT = 6;

/**
 * Number of vertices per face.
 *
 * @type {number}
 */
const VERTICES_PER_FACE = 4;

/**
 * Total vertex count for the box (faces * vertices per face).
 *
 * @type {number}
 */
const BOX_VERTEX_COUNT = BOX_FACE_COUNT * VERTICES_PER_FACE;

/**
 * Number of color components per vertex (RGB).
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = DEFAULT_VERTEX_COLOR.length;

/**
 * Expected length for a uniform RGB color buffer (single color).
 *
 * @type {number}
 */
const COLORS_UNIFORM_LENGTH = COLOR_COMPONENT_COUNT;

/**
 * Expected length for per-face RGB color buffer.
 * One RGB triplet per face.
 *
 * @type {number}
 */
const COLORS_PER_FACE_LENGTH = BOX_FACE_COUNT * COLOR_COMPONENT_COUNT;

/**
 * Expected length for per-vertex RGB color buffer.
 * One RGB triplet per vertex.
 *
 * @type {number}
 */
const COLORS_PER_VERTEX_LENGTH = BOX_VERTEX_COUNT * COLOR_COMPONENT_COUNT;

/**
 * Index of the red channel in an RGB triplet (red, green, blue).
 * Used when reading/writing `Float32Array` color buffers.
 *
 * @type {number}
 */
const COLOR_COMPONENT_INDEX_RED = 0;

/**
 * Index of the green channel in an RGB triplet (red, green, blue).
 * Used when reading/writing `Float32Array` color buffers.
 *
 * @type {number}
 */
const COLOR_COMPONENT_INDEX_GREEN = 1;

/**
 * Index of the blue channel in an RGB triplet (red, green, blue).
 * Used when reading/writing `Float32Array` color buffers.
 *
 * @type {number}
 */
const COLOR_COMPONENT_INDEX_BLUE = 2;

/**
 * Number of indices per face for triangles (2 triangles = 6 indices).
 *
 * @type {number}
 */
const TRIANGLE_INDEX_COUNT_PER_FACE = 6;

/**
 * Total triangle index count for the box.
 *
 * @type {number}
 */
const BOX_TRIANGLE_INDEX_COUNT = BOX_FACE_COUNT * TRIANGLE_INDEX_COUNT_PER_FACE;

/**
 * Options used by `BoxGeometry` constructor:
 * - length = 3  => uniform RGB applied to all vertices.
 * - length = 18 => per-face RGB (6 faces * 3).
 * - length = 72 => per-vertex RGB (24 vertices * 3).
 *
 * @typedef {Object} BoxGeometryOptions
 * @property {number} [size = 1.0]   - Edge size of the cube.
 * @property {Float32Array} [colors] - Color source buffer (3 / 18 / 72 length).
 */

/**
 * Unit cube positions for 24-vertex representation (per-face vertices).
 * These are scaled by `halfSize` at runtime.
 *
 * Face order:
 * 0: Front  (+Z)
 * 1: Back   (-Z)
 * 2: Top    (+Y)
 * 3: Bottom (-Y)
 * 4: Right  (+X)
 * 5: Left   (-X)
 *
 * @type {Float32Array}
 */
const UNIT_POSITIONS = new Float32Array([
    /* eslint-disable indent */
    // Front (+Z):
    -1, -1,  1,
     1, -1,  1,
     1,  1,  1,
    -1,  1,  1,

    // Back (-Z):
     1, -1, -1,
    -1, -1, -1,
    -1,  1, -1,
     1,  1, -1,

    // Top (+Y):
    -1,  1,  1,
     1,  1,  1,
     1,  1, -1,
    -1,  1, -1,

    // Bottom (-Y):
    -1, -1, -1,
     1, -1, -1,
     1, -1,  1,
    -1, -1,  1,

    // Right (+X):
     1, -1,  1,
     1, -1, -1,
     1,  1, -1,
     1,  1,  1,

    // Left (-X):
    -1, -1, -1,
    -1, -1,  1,
    -1,  1,  1,
    -1,  1, -1
    /* eslint-enable indent */
]);

/**
 * UVs for 24-vertex representation (per-face UVs).
 *
 * @type {Float32Array}
 */
const UVS = new Float32Array([
    // Front:
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back (flip `U` to avoid the mirrored appearance):
    1.0, 0.0,
    0.0, 0.0,
    0.0, 1.0,
    1.0, 1.0,

    // Top:
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Bottom:
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Right:
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Left:
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
]);

/**
 * Solid indices for 24-vertex box (two triangles per face).
 *
 * @type {Uint16Array}
 */
const INDICES_SOLID = new Uint16Array([
    // Front (0-3):
    0, 1, 2,
    2, 3, 0,

    // Back (4-7):
    4, 5, 6,
    6, 7, 4,

    // Top (8-11):
    8, 9, 10,
    10, 11, 8,

    // Bottom (12-15):
    12, 13, 14,
    14, 15, 12,

    // Right (16-19):
    16, 17, 18,
    18, 19, 16,

    // Left (20-23):
    20, 21, 22,
    22, 23, 20
]);

/**
 * Wireframe indices reuse the first 8 vertices (front + back corners) to draw the 12 cube edges.
 *
 * @type {Uint16Array}
 */
const INDICES_WIREFRAME = new Uint16Array([
    // Front edges:
    0, 1,
    1, 2,
    2, 3,
    3, 0,

    // Back edges:
    4, 5,
    5, 6,
    6, 7,
    7, 4,

    // Side edges:
    0, 5,
    1, 4,
    2, 7,
    3, 6
]);

/**
 * BoxGeometry creates a cube mesh. This implementation duplicates vertices per face.
 * It enables the correct UV mapping (each face has its own UVs).
 * Prepares for future per-face normals.
 */
export class BoxGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} webglContext         - WebGL2 rendering context.
     * @param {BoxGeometryOptions | number} [optionsOrSize] - Options object or numeric size.
     */
    constructor(webglContext, optionsOrSize = {}) {
        const options = BoxGeometry.#normalizeOptions(optionsOrSize);
        const { size, colors: colorsSpec } = options;
        const halfSize  = size / BOX_HALF_SIZE_DIVISOR;
        const positions = BoxGeometry.#createPositions(halfSize);
        const colors    = BoxGeometry.#createColors(colorsSpec);
        const uvs       = UVS;

        if (INDICES_SOLID.length !== BOX_TRIANGLE_INDEX_COUNT) {
            throw new Error('BoxGeometry internal error: unexpected triangle index count.');
        }

        super(webglContext, positions, colors, INDICES_SOLID, INDICES_WIREFRAME, uvs);
    }

    /**
     * Normalizes constructor input to a `BoxGeometryOptions` object.
     *
     * @param {BoxGeometryOptions | number} optionsOrSize - Options object or numeric size.
     * @returns {{ size: number, colors: Float32Array }}  - Normalized options.
     * @private
     */
    static #normalizeOptions(optionsOrSize) {
        if (typeof optionsOrSize === 'number') {
            return { size: optionsOrSize, colors: DEFAULT_VERTEX_COLOR };
        }

        if (optionsOrSize === null || typeof optionsOrSize !== 'object') {
            throw new TypeError('`BoxGeometry` expects options as an object or a number.');
        }

        const { size = DEFAULT_BOX_SIZE, colors = DEFAULT_VERTEX_COLOR } = optionsOrSize;

        if (typeof size !== 'number') {
            throw new TypeError('`BoxGeometry` expects size as a number.');
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`BoxGeometry` expects colors as a `Float32Array`.');
        }

        /* eslint-disable indent */
        if (colors.length !== COLORS_UNIFORM_LENGTH
            && colors.length !== COLORS_PER_FACE_LENGTH
            && colors.length !== COLORS_PER_VERTEX_LENGTH) {
            throw new TypeError(
                '`BoxGeometry` expects `colors` length to be `{uniform}` (uniform), `{face}` (per-face), or `{vertex}` (per-vertex).'
                .replace('{uniform}' , String(COLORS_UNIFORM_LENGTH))
                .replace('{face}'    , String(COLORS_PER_FACE_LENGTH))
                .replace('{vertex}'  , String(COLORS_PER_VERTEX_LENGTH))
            );
        }
        /* eslint-enable indent */

        return { size, colors };
    }

    /**
     * Creates scaled positions for the box.
     * `UNIT_POSITIONS` contains `-1/+1` cube coordinates, scaling them by `halfSize`.
     *
     * @param {number} halfSize - Half of the cube edge size.
     * @returns {Float32Array}  - Scaled positions buffer.
     * @private
     */
    static #createPositions(halfSize) {
        const positions = new Float32Array(UNIT_POSITIONS.length);

        for (let i = 0; i < UNIT_POSITIONS.length; i += 1) {
            positions[i] = UNIT_POSITIONS[i] * halfSize;
        }

        return positions;
    }

    /**
     * Converts `colors` input (uniform/per-face/per-vertex) into a per-vertex RGB buffer.
     *
     * @param {Float32Array} colorsSpec - Color buffer that follows 3/18/72 proportion length.
     * @returns {Float32Array}          - Per-vertex RGB colors buffer (length = 72).
     * @private
     */
    static #createColors(colorsSpec) {
        if (colorsSpec.length === COLORS_PER_VERTEX_LENGTH) {
            return new Float32Array(colorsSpec);
        }

        if (colorsSpec.length === COLORS_UNIFORM_LENGTH) {
            return BoxGeometry.#createUniformColors(colorsSpec);
        }

        return BoxGeometry.#createPerFaceColors(colorsSpec);
    }

    /**
     * Creates a uniform per-vertex color buffer from a single RGB triplet.
     *
     * @param {Float32Array} uniformColor - Float32Array([red, green, blue]).
     * @returns {Float32Array}            - Per-vertex RGB buffer.
     * @private
     */
    static #createUniformColors(uniformColor) {
        const colors = new Float32Array(COLORS_PER_VERTEX_LENGTH);

        for (let vertexIndex = 0; vertexIndex < BOX_VERTEX_COUNT; vertexIndex += 1) {
            const baseIndex = vertexIndex * COLOR_COMPONENT_COUNT;
            colors[baseIndex + COLOR_COMPONENT_INDEX_RED]   = uniformColor[COLOR_COMPONENT_INDEX_RED];
            colors[baseIndex + COLOR_COMPONENT_INDEX_GREEN] = uniformColor[COLOR_COMPONENT_INDEX_GREEN];
            colors[baseIndex + COLOR_COMPONENT_INDEX_BLUE]  = uniformColor[COLOR_COMPONENT_INDEX_BLUE];
        }

        return colors;
    }

    /**
     * Creates a per-vertex color buffer from per-face RGB colors.
     * Each face color is applied to all 4 vertices of that face.
     *
     * @param {Float32Array} perFaceColors - Float32Array length = 18 (6 faces * 3 RGB).
     * @returns {Float32Array}             - Per-vertex RGB buffer (length = 72).
     * @private
     */
    static #createPerFaceColors(perFaceColors) {
        const colors = new Float32Array(COLORS_PER_VERTEX_LENGTH);

        for (let faceIndex = 0; faceIndex < BOX_FACE_COUNT; faceIndex += 1) {
            const faceColorBaseIndex = faceIndex * COLOR_COMPONENT_COUNT;
            const faceRed   = perFaceColors[faceColorBaseIndex + COLOR_COMPONENT_INDEX_RED];
            const faceGreen = perFaceColors[faceColorBaseIndex + COLOR_COMPONENT_INDEX_GREEN];
            const faceBlue  = perFaceColors[faceColorBaseIndex + COLOR_COMPONENT_INDEX_BLUE];

            for (let vertexOnFace = 0; vertexOnFace < VERTICES_PER_FACE; vertexOnFace += 1) {
                const vertexIndex = (faceIndex * VERTICES_PER_FACE) + vertexOnFace;
                const vertexBaseIndex = vertexIndex * COLOR_COMPONENT_COUNT;

                colors[vertexBaseIndex + COLOR_COMPONENT_INDEX_RED]   = faceRed;
                colors[vertexBaseIndex + COLOR_COMPONENT_INDEX_GREEN] = faceGreen;
                colors[vertexBaseIndex + COLOR_COMPONENT_INDEX_BLUE]  = faceBlue;
            }
        }

        return colors;
    }
}
