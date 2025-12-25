import { Geometry } from './geometry.js';
import {
    createColorsFromSpec,
    createIndexArray,
    createWireframeIndicesFromSolidIndices
} from './geometry-utils.js';

/**
 * Default wireframe indices input value.
 * When used, wireframe indices are generated from solid indices.
 *
 * @type {null}
 */
const DEFAULT_WIREFRAME_INDICES = null;

/**
 * Default colors input value. When used, no color buffer is created.
 *
 * @type {null}
 */
const DEFAULT_COLORS = null;

/**
 * Default UV input value. When used, no UV buffer is created.
 *
 * @type {null}
 */
const DEFAULT_UVS = null;

/**
 * Default normals input value. When used, no normal buffer is created.
 *
 * @type {null}
 */
const DEFAULT_NORMALS = null;

/**
 * Number of position components per vertex.
 *
 * @type {number}
 */
const POSITION_COMPONENT_COUNT = 3;

/**
 * Zero value used for numeric comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Options used by `CustomGeometry`.
 *
 * @typedef {Object} CustomGeometryOptions
 * @property {Float32Array} positions                                              - Vertex positions (xyz).
 * @property {number[] | Uint16Array | Uint32Array} indices                        - Solid triangle indices.
 * @property {number[] | Uint16Array | Uint32Array | null} [wireframeIndices=null] - Wireframe indices (lines).
 * @property {Float32Array | null} [colors=null]                                   - Optional colors (rgb) per vertex or uniform spec.
 * @property {Float32Array | null} [uvs=null]                                      - Optional UV coordinates (uv).
 * @property {Float32Array | null} [normals=null]                                  - Optional normals (xyz).
 */

/**
 * `CustomGeometry` allows creating geometry from user-provided buffers.
 * It supports: positions, optional colors, uvs, normals and index buffers.
 */
export class CustomGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {CustomGeometryOptions} options       - Geometry buffers.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`CustomGeometry` expects options as a plain object.');
        }

        const {
            positions,
            indices,
            wireframeIndices = DEFAULT_WIREFRAME_INDICES,
            colors           = DEFAULT_COLORS,
            uvs              = DEFAULT_UVS,
            normals          = DEFAULT_NORMALS
        } = options;

        if (!(positions instanceof Float32Array)) {
            throw new TypeError('`CustomGeometry` expects `positions` as `Float32Array`.');
        }

        if ((positions.length % POSITION_COMPONENT_COUNT) !== ZERO_VALUE) {
            throw new RangeError('`CustomGeometry` expects `positions` length to be a multiple of 3.');
        }

        const vertexCount      = positions.length / POSITION_COMPONENT_COUNT;
        const solidIndexBuffer = CustomGeometry.#normalizeIndices(vertexCount, indices, 'indices');
        const wireIndexBuffer  = CustomGeometry.#normalizeWireframeIndices(vertexCount, solidIndexBuffer, wireframeIndices);
        const colorBuffer      = CustomGeometry.#normalizeColors(vertexCount, colors);
        const uvBuffer         = CustomGeometry.#normalizeOptionalFloat32Array(uvs, 'uvs');
        const normalBuffer     = CustomGeometry.#normalizeOptionalFloat32Array(normals, 'normals');

        super(
            webglContext,
            positions,
            colorBuffer,
            solidIndexBuffer,
            wireIndexBuffer,
            uvBuffer,
            normalBuffer
        );
    }

    /**
     * Normalizes solid indices input to a typed array.
     *
     * @param {number} vertexCount                           - Total vertex count.
     * @param {number[] | Uint16Array | Uint32Array} indices - Input indices.
     * @param {string} optionName                            - Option name for error reporting.
     * @returns {Uint16Array | Uint32Array}
     * @private
     */
    static #normalizeIndices(vertexCount, indices, optionName) {
        if (Array.isArray(indices)) {
            return createIndexArray(vertexCount, indices);
        }

        if (indices instanceof Uint16Array || indices instanceof Uint32Array) {
            return indices;
        }

        throw new TypeError(`\`CustomGeometry\` expects \`${optionName}\` as an array, Uint16Array or Uint32Array.`);
    }

    /**
     * Normalizes wireframe indices input.
     *
     * @param {number} vertexCount                                           - Total vertex count.
     * @param {Uint16Array | Uint32Array} solidIndices                       - Solid triangle indices.
     * @param {number[] | Uint16Array | Uint32Array | null} wireframeIndices - Wireframe indices.
     * @returns {Uint16Array | Uint32Array}
     * @private
     */
    static #normalizeWireframeIndices(vertexCount, solidIndices, wireframeIndices) {
        if (wireframeIndices === null || wireframeIndices === undefined) {
            return createWireframeIndicesFromSolidIndices(vertexCount, solidIndices);
        }

        if (Array.isArray(wireframeIndices)) {
            return createIndexArray(vertexCount, wireframeIndices);
        }

        if (wireframeIndices instanceof Uint16Array || wireframeIndices instanceof Uint32Array) {
            return wireframeIndices;
        }

        throw new TypeError('`CustomGeometry` expects `wireframeIndices` as an array, `Uint16Array`, `Uint32Array` or null.');
    }

    /**
     * Normalizes optional colors input.
     *
     * @param {number} vertexCount         - Total vertex count.
     * @param {Float32Array | null} colors - Colors input.
     * @returns {Float32Array | null}
     * @private
     */
    static #normalizeColors(vertexCount, colors) {
        if (colors === null || colors === undefined) {
            return null;
        }

        if (!(colors instanceof Float32Array)) {
            throw new TypeError('`CustomGeometry` expects `colors` as `Float32Array` or null.');
        }

        return createColorsFromSpec(vertexCount, colors);
    }

    /**
     * Normalizes optional float arrays.
     *
     * @param {Float32Array | null} value - Buffer value.
     * @param {string} optionName         - Option name for error reporting.
     * @returns {Float32Array | null}
     * @private
     */
    static #normalizeOptionalFloat32Array(value, optionName) {
        if (value === null || value === undefined) {
            return null;
        }

        if (!(value instanceof Float32Array)) {
            throw new TypeError(`\`CustomGeometry\` expects \`${optionName}\` as \`Float32Array\` or null.`);
        }

        return value;
    }
}
