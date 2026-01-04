import { Vector3 } from '../math/vector3.js';
import { Geometry, PRIMITIVE_LINE_LOOP, PRIMITIVE_LINE_STRIP } from './geometry.js';
import { createSequentialIndexArray, createColorsFromSpec }    from './geometry-utils.js';

/**
 * Number of components per position.
 *
 * @type {number}
 */
const POSITION_COMPONENT_COUNT = 3;

/**
 * Offset for X component in position triplet.
 *
 * @type {number}
 */
const POSITION_X_OFFSET = 0;

/**
 * Offset for Y component in position triplet.
 *
 * @type {number}
 */
const POSITION_Y_OFFSET = 1;

/**
 * Offset for Z component in position triplet.
 *
 * @type {number}
 */
const POSITION_Z_OFFSET = 2;

/**
 * Minimum vertex count for a polyline.
 *
 * @type {number}
 */
const MIN_VERTEX_COUNT = 2;

/**
 * Default colors option value.
 *
 * @type {null}
 */
const DEFAULT_COLORS = null;

/**
 * Default loop option.
 *
 * @type {boolean}
 */
const DEFAULT_LOOP = false;

/**
 * Options used by PolylineGeometry.
 *
 * @typedef {Object} PolylineGeometryOptions
 * @property {Vector3[]} positions          - Polyline positions.
 * @property {boolean} [loop=false]         - When true, use `LINE_LOOP`.
 * @property {Float32Array | null} [colors] - Color specification (uniform or per-vertex).
 */

/**
 * Geometry for thin polylines.
 */
export class PolylineGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {PolylineGeometryOptions} options     - Polyline geometry options.
     * @throws {TypeError}  When inputs are invalid.
     * @throws {RangeError} When positions are invalid.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`PolylineGeometry` expects options as a plain object.');
        }

        const {
            positions,
            loop   = DEFAULT_LOOP,
            colors = DEFAULT_COLORS
        } = options;

        if (!Array.isArray(positions)) {
            throw new TypeError('`PolylineGeometry` expects `positions` as an array of `Vector3`.');
        }

        if (positions.length < MIN_VERTEX_COUNT) {
            throw new RangeError('`PolylineGeometry` expects at least 2 points.');
        }

        for (const point of positions) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('`PolylineGeometry` expects all positions to be the `Vector3` instances.');
            }
        }

        if (typeof loop !== 'boolean') {
            throw new TypeError('`PolylineGeometry` expects `loop` as a boolean.');
        }

        if (colors !== null && !(colors instanceof Float32Array)) {
            throw new TypeError('`PolylineGeometry` expects `colors` as `Float32Array` or null.');
        }

        const positionsBuffer = PolylineGeometry.#createPositionsArray(positions);
        const vertexCount     = positions.length;
        const colorBuffer     = colors ? createColorsFromSpec(vertexCount, colors) : null;
        const indices         = createSequentialIndexArray(vertexCount);
        const primitive       = loop ? PRIMITIVE_LINE_LOOP : PRIMITIVE_LINE_STRIP;

        super(
            webglContext,
            positionsBuffer,
            colorBuffer,
            indices,
            indices,
            null,
            null,
            {
                solidPrimitive     : primitive,
                wireframePrimitive : primitive
            }
        );
    }

    /**
     * @param {Vector3[]} positions - Input positions.
     * @returns {Float32Array}
     * @private
     */
    static #createPositionsArray(positions) {
        const buffer = new Float32Array(positions.length * POSITION_COMPONENT_COUNT);

        for (let index = 0; index < positions.length; index += 1) {
            const baseIndex = index * POSITION_COMPONENT_COUNT;
            const point     = positions[index];
            buffer[baseIndex + POSITION_X_OFFSET] = point.x;
            buffer[baseIndex + POSITION_Y_OFFSET] = point.y;
            buffer[baseIndex + POSITION_Z_OFFSET] = point.z;
        }

        return buffer;
    }
}
