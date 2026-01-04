import { Vector3 }                    from '../math/vector3.js';
import { Geometry, PRIMITIVE_POINTS } from './geometry.js';
import {
    createColorsFromSpec,
    createSequentialIndexArray
} from './geometry-utils.js';

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
 * Default colors option value.
 *
 * @type {null}
 */
const DEFAULT_COLORS = null;

/**
 * Default positions option value.
 *
 * @type {null}
 */
const DEFAULT_POSITIONS = null;

/**
 * Minimum points count allowed.
 *
 * @type {number}
 */
const MIN_POINT_COUNT = 0;

/**
 * Options used by PointsGeometry.
 *
 * @typedef {Object} PointsGeometryOptions
 * @property {Vector3[]} positions          - Point positions.
 * @property {Float32Array | null} [colors] - Color specification (uniform or per-vertex).
 */

/**
 * Geometry for point clouds.
 */
export class PointsGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {PointsGeometryOptions} options       - Points geometry options.
     * @throws {TypeError}  When inputs are invalid.
     * @throws {RangeError} When positions are invalid.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`PointsGeometry` expects options as a plain object.');
        }

        const {
            positions = DEFAULT_POSITIONS,
            colors    = DEFAULT_COLORS
        } = options;

        if (!Array.isArray(positions)) {
            throw new TypeError('`PointsGeometry` expects `positions` as an array of Vector3.');
        }

        if (positions.length < MIN_POINT_COUNT) {
            throw new RangeError('`PointsGeometry` expects a non-negative point count.');
        }

        for (const point of positions) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('`PointsGeometry` expects all positions to be `Vector3` instances.');
            }
        }

        if (colors !== null && !(colors instanceof Float32Array)) {
            throw new TypeError('`PointsGeometry` expects `colors` as a `Float32Array` or null.');
        }

        const positionsBuffer = PointsGeometry.#createPositionsArray(positions);
        const vertexCount     = positions.length;
        const colorBuffer     = colors ? createColorsFromSpec(vertexCount, colors) : null;
        const indices         = createSequentialIndexArray(vertexCount);

        super(
            webglContext,
            positionsBuffer,
            colorBuffer,
            indices,
            indices,
            null,
            null,
            {
                solidPrimitive     : PRIMITIVE_POINTS,
                wireframePrimitive : PRIMITIVE_POINTS
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
