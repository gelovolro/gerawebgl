import { GeneratedGeometry }                        from './generated-geometry.js';
import { Vector3 }                                  from '../math/vector3.js';
import { GeometryUtils }                            from './geometry-utils.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';
import { POINTS_DEFAULTS }                          from '../constants/points-geometry.js';

import {
    GEOMETRY_DEFAULTS,
    GEOMETRY_LAYOUT,
    PRIMITIVE_POINTS
} from '../constants/geometry.js';

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
export class PointsGeometry extends GeneratedGeometry {

    /**
     * @param {PointsGeometryOptions} options - Points geometry options.
     * @throws {TypeError}                      When inputs are invalid.
     * @returns {GeneratedGeometryData}       - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError('PointsGeometry expects options as a plain object.');
        }

        const {
            positions = POINTS_DEFAULTS.POSITIONS,
            colors    = GEOMETRY_DEFAULTS.COLORS
        } = options;

        if (!Array.isArray(positions)) {
            throw new TypeError('PointsGeometry expects positions as an array of Vector3.');
        }

        for (const point of positions) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('PointsGeometry expects all positions to be Vector3 instances.');
            }
        }

        if (colors !== null && !(colors instanceof Float32Array)) {
            throw new TypeError('PointsGeometry expects colors as a Float32Array or null.');
        }

        const positionsBuffer = PointsGeometry.#createPositionsArray(positions);
        const vertexCount     = positions.length;
        const colorBuffer     = colors ? GeometryUtils.createColorsFromSpec(vertexCount, colors) : null;
        const indices         = GeometryUtils.createSequentialIndexArray(vertexCount);

        return {
            positions        : positionsBuffer,
            colors           : colorBuffer,
            indicesSolid     : indices,
            indicesWireframe : indices,
            uvs              : null,
            normals          : null,
            primitiveOptions : {
                solidPrimitive     : PRIMITIVE_POINTS,
                wireframePrimitive : PRIMITIVE_POINTS
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
