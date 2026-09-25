import { GeneratedGeometry }                        from './generated-geometry.js';
import { Vector3 }                                  from '../math/vector3.js';
import { GeometryUtils }                            from './geometry-utils.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';
import { POLYLINE_LIMITS, POLYLINE_DEFAULTS }       from '../constants/polyline-geometry.js';

import {
    GEOMETRY_DEFAULTS,
    GEOMETRY_LAYOUT,
    PRIMITIVE_LINE_LOOP,
    PRIMITIVE_LINE_STRIP
} from '../constants/geometry.js';

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
export class PolylineGeometry extends GeneratedGeometry {
    /**
     * @param {PolylineGeometryOptions} options - Polyline geometry options.
     * @throws {TypeError}                        When inputs are invalid.
     * @throws {RangeError}                       When positions are invalid.
     * @returns {GeneratedGeometryData}         - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError('PolylineGeometry expects options as a plain object.');
        }

        const {
            positions,
            loop   = POLYLINE_DEFAULTS.LOOP,
            colors = GEOMETRY_DEFAULTS.COLORS
        } = options;

        if (!Array.isArray(positions)) {
            throw new TypeError('PolylineGeometry expects positions as an array of Vector3.');
        }

        if (positions.length < POLYLINE_LIMITS.MIN_VERTEX_COUNT) {
            throw new RangeError('PolylineGeometry expects at least 2 points.');
        }

        for (const point of positions) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('PolylineGeometry expects all positions to be the Vector3 instances.');
            }
        }

        if (typeof loop !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError('PolylineGeometry expects loop as a boolean.');
        }

        if (colors !== null && !(colors instanceof Float32Array)) {
            throw new TypeError('PolylineGeometry expects colors as Float32Array or null.');
        }

        const positionsBuffer = PolylineGeometry.#createPositionsArray(positions);
        const vertexCount     = positions.length;
        const colorBuffer     = colors ? GeometryUtils.createColorsFromSpec(vertexCount, colors) : null;
        const indices         = GeometryUtils.createSequentialIndexArray(vertexCount);
        const primitive       = loop ? PRIMITIVE_LINE_LOOP : PRIMITIVE_LINE_STRIP;

        return {
            positions        : positionsBuffer,
            colors           : colorBuffer,
            indicesSolid     : indices,
            indicesWireframe : indices,
            uvs              : null,
            normals          : null,
            primitiveOptions : {
                solidPrimitive     : primitive,
                wireframePrimitive : primitive
            }
        };
    }

    /**
     * @param {Vector3[]} positions - Input positions.
     * @returns {Float32Array}
     * @private
     */
    static #createPositionsArray(positions) {
        const positionComponentCount = GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const buffer                 = new Float32Array(positions.length * positionComponentCount);

        for (let index = MATH_COMMON_VALUES.ZERO; index < positions.length; index += MATH_COMMON_VALUES.UNIT) {
            const baseIndex = index * positionComponentCount;
            const point     = positions[index];
            buffer[baseIndex + MATH_VECTOR3_INDEXES.X] = point.x;
            buffer[baseIndex + MATH_VECTOR3_INDEXES.Y] = point.y;
            buffer[baseIndex + MATH_VECTOR3_INDEXES.Z] = point.z;
        }

        return buffer;
    }
}
