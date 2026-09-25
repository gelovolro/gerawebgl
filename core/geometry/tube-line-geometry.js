import { GeneratedGeometry }                        from './generated-geometry.js';
import { Vector3 }                                  from '../math/vector3.js';
import { GeometryUtils }                            from './geometry-utils.js';
import { MATH_COMMON_VALUES, MATH_VECTOR3_INDEXES } from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';

import {
    TUBE_LINE_LIMITS,
    TUBE_LINE_DEFAULTS,
    TUBE_LINE_CAP_TYPES,
    TUBE_LINE_ERRORS,
    TUBE_LINE_LAYOUT,
    TUBE_LINE_NORMALS
} from '../constants/tube-line-geometry.js';

import {
    GEOMETRY_SIZES,
    GEOMETRY_LAYOUT,
    GEOMETRY_ANGLES,
    PRIMITIVE_LINES,
    PRIMITIVE_TRIANGLES
} from '../constants/geometry.js';

/**
 * Options used by `TubeLineGeometry`.
 *
 * @typedef {Object} TubeLineGeometryOptions
 * @property {Vector3[]} positions          - Path positions.
 * @property {number} [radius = 0.05]       - Tube radius.
 * @property {number | null} [width = null] - Optional tube width (overrides the radius).
 * @property {number} [radialSegments = 8]  - Radial segment count.
 * @property {boolean} [closed = false]     - Whether to close the tube.
 * @property {string} [capType = 'none']    - Cap type (none|flat).
 */

/**
 * Geometry for thick debug lines (tube around the polyline).
 */
export class TubeLineGeometry extends GeneratedGeometry {

    /**
     * @param {TubeLineGeometryOptions} options - Tube geometry options.
     * @throws {TypeError}                        When inputs are invalid.
     * @throws {RangeError}                       When numeric inputs are out of range.
     * @returns {GeneratedGeometryData}         - Generated CPU buffers.
     * @protected
     */
    static createGeometryData(options = {}) {
        const normalized = TubeLineGeometry.#normalizeOptions(options);
        const { positions, radius, width, radialSegments, closed, capType } = normalized;
        const resolvedRadius   = width !== null ? (width / GEOMETRY_SIZES.HALF_SIZE_DIVISOR) : radius;
        const baseVertexCount  = positions.length * radialSegments;
        const addCaps          = capType === TUBE_LINE_CAP_TYPES.FLAT && !closed;
        const extraCapVertices = addCaps ? TUBE_LINE_LAYOUT.CAP_CENTER_COUNT : MATH_COMMON_VALUES.ZERO;
        const totalVertexCount = baseVertexCount + extraCapVertices;
        const positionsBuffer  = new Float32Array(totalVertexCount * GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT);

        TubeLineGeometry.#writeRingPositions(positionsBuffer, positions, radialSegments, resolvedRadius, closed);

        if (addCaps) {
            TubeLineGeometry.#writeCapCenters(positionsBuffer, positions, baseVertexCount);
        }

        const indices          = TubeLineGeometry.#buildIndices(positions.length, radialSegments, closed, addCaps, baseVertexCount);
        const wireframeIndices = GeometryUtils.createWireframeIndicesFromSolidIndices(totalVertexCount, indices);

        return {
            positions        : positionsBuffer,
            colors           : null,
            indicesSolid     : indices,
            indicesWireframe : wireframeIndices,
            uvs              : null,
            normals          : null,
            primitiveOptions : {
                solidPrimitive     : PRIMITIVE_TRIANGLES,
                wireframePrimitive : PRIMITIVE_LINES
            }
        };
    }

    /**
     * @param {Float32Array} buffer   - Output positions buffer.
     * @param {Vector3[]} positions   - Input path positions.
     * @param {number} radialSegments - Radial segment count.
     * @param {number} radius         - Tube radius.
     * @param {boolean} closed        - Whether path is closed.
     * @private
     */
    static #writeRingPositions(buffer, positions, radialSegments, radius, closed) {
        const pointCount = positions.length;

        for (let index = MATH_COMMON_VALUES.ZERO; index < pointCount; index += MATH_COMMON_VALUES.UNIT) {
            const previousIndex = TubeLineGeometry.#getPreviousIndex(index, pointCount, closed);
            const nextIndex     = TubeLineGeometry.#getNextIndex(index, pointCount, closed);
            const tangent       = TubeLineGeometry.#computeTangent(positions[previousIndex], positions[nextIndex]);
            const normal        = TubeLineGeometry.#computeNormal(tangent);
            const binormal      = TubeLineGeometry.#computeBinormal(tangent, normal);
            const ringBase      = index * radialSegments;
            const point         = positions[index];

            for (let segmentIndex = MATH_COMMON_VALUES.ZERO; segmentIndex < radialSegments; segmentIndex += MATH_COMMON_VALUES.UNIT) {
                const angle       = GEOMETRY_ANGLES.FULL_TURN * (segmentIndex / radialSegments);
                const cosAngle    = Math.cos(angle);
                const sinAngle    = Math.sin(angle);
                const offsetX     = (normal.x * cosAngle + binormal.x * sinAngle) * radius;
                const offsetY     = (normal.y * cosAngle + binormal.y * sinAngle) * radius;
                const offsetZ     = (normal.z * cosAngle + binormal.z * sinAngle) * radius;
                const vertexIndex = ringBase + segmentIndex;
                const baseIndex   = vertexIndex * GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
                buffer[baseIndex + MATH_VECTOR3_INDEXES.X] = point.x + offsetX;
                buffer[baseIndex + MATH_VECTOR3_INDEXES.Y] = point.y + offsetY;
                buffer[baseIndex + MATH_VECTOR3_INDEXES.Z] = point.z + offsetZ;
            }
        }
    }

    /**
     * @param {Float32Array} buffer    - Output positions buffer.
     * @param {Vector3[]} positions    - Input path positions.
     * @param {number} baseVertexCount - Base vertex count before caps.
     * @private
     */
    static #writeCapCenters(buffer, positions, baseVertexCount) {
        const startBaseIndex = baseVertexCount * GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const endBaseIndex   = (baseVertexCount + MATH_COMMON_VALUES.UNIT) * GEOMETRY_LAYOUT.POSITION_COMPONENT_COUNT;
        const startPoint     = positions[MATH_COMMON_VALUES.ZERO];
        const endPoint       = positions[positions.length - MATH_COMMON_VALUES.UNIT];
        buffer[startBaseIndex + MATH_VECTOR3_INDEXES.X] = startPoint.x;
        buffer[startBaseIndex + MATH_VECTOR3_INDEXES.Y] = startPoint.y;
        buffer[startBaseIndex + MATH_VECTOR3_INDEXES.Z] = startPoint.z;
        buffer[endBaseIndex + MATH_VECTOR3_INDEXES.X]   = endPoint.x;
        buffer[endBaseIndex + MATH_VECTOR3_INDEXES.Y]   = endPoint.y;
        buffer[endBaseIndex + MATH_VECTOR3_INDEXES.Z]   = endPoint.z;
    }

    /**
     * @param {number} pointCount      - Number of path points.
     * @param {number} radialSegments  - Radial segment count.
     * @param {boolean} closed         - Whether path is closed.
     * @param {boolean} addCaps        - Whether caps are added.
     * @param {number} baseVertexCount - Base vertex count before caps.
     * @returns {Uint16Array | Uint32Array}
     * @private
     */
    static #buildIndices(pointCount, radialSegments, closed, addCaps, baseVertexCount) {
        const segmentCount = closed ? pointCount : (pointCount - MATH_COMMON_VALUES.UNIT);
        const indices      = [];

        for (let segmentIndex = MATH_COMMON_VALUES.ZERO; segmentIndex < segmentCount; segmentIndex += MATH_COMMON_VALUES.UNIT) {
            const ringStart     = segmentIndex * radialSegments;
            const nextRingStart = ((segmentIndex + MATH_COMMON_VALUES.UNIT) % pointCount) * radialSegments;

            for (let radialIndex = MATH_COMMON_VALUES.ZERO; radialIndex < radialSegments; radialIndex += MATH_COMMON_VALUES.UNIT) {
                const nextRadialIndex = (radialIndex + MATH_COMMON_VALUES.UNIT) % radialSegments;
                const groupA          = ringStart + radialIndex;
                const groupB          = ringStart + nextRadialIndex;
                const groupC          = nextRingStart + radialIndex;
                const groupD          = nextRingStart + nextRadialIndex;
                indices.push(groupA, groupC, groupB);
                indices.push(groupB, groupC, groupD);
            }
        }

        if (addCaps) {
            const startCenterIndex = baseVertexCount;
            const endCenterIndex   = baseVertexCount + MATH_COMMON_VALUES.UNIT;
            const startRingStart   = MATH_COMMON_VALUES.ZERO;
            const endRingStart     = (pointCount - MATH_COMMON_VALUES.UNIT) * radialSegments;

            for (let radialIndex = MATH_COMMON_VALUES.ZERO; radialIndex < radialSegments; radialIndex += MATH_COMMON_VALUES.UNIT) {
                const nextRadialIndex = (radialIndex + MATH_COMMON_VALUES.UNIT) % radialSegments;
                const startA          = startRingStart + radialIndex;
                const startB          = startRingStart + nextRadialIndex;
                indices.push(startCenterIndex, startB, startA);

                const endA = endRingStart + radialIndex;
                const endB = endRingStart + nextRadialIndex;
                indices.push(endCenterIndex, endA, endB);
            }
        }

        return GeometryUtils.createIndexArray(baseVertexCount + (addCaps ? TUBE_LINE_LAYOUT.CAP_CENTER_COUNT : MATH_COMMON_VALUES.ZERO), indices);
    }

    /**
     * @param {number} index   - Current index.
     * @param {number} count   - Total count.
     * @param {boolean} closed - Whether path is closed.
     * @returns {number}
     * @private
     */
    static #getPreviousIndex(index, count, closed) {
        if (index > MATH_COMMON_VALUES.ZERO) {
            return index - MATH_COMMON_VALUES.UNIT;
        }

        return closed ? (count - MATH_COMMON_VALUES.UNIT) : index;
    }

    /**
     * @param {number} index   - Current index.
     * @param {number} count   - Total count.
     * @param {boolean} closed - Whether path is closed.
     * @returns {number}
     * @private
     */
    static #getNextIndex(index, count, closed) {
        if (index < count - MATH_COMMON_VALUES.UNIT) {
            return index + MATH_COMMON_VALUES.UNIT;
        }

        return closed ? MATH_COMMON_VALUES.ZERO : index;
    }

    /**
     * @param {Vector3} pointA - Start point.
     * @param {Vector3} pointB - End point.
     * @returns {Vector3}
     * @private
     */
    static #computeTangent(pointA, pointB) {
        const deltaX = pointB.x - pointA.x;
        const deltaY = pointB.y - pointA.y;
        const deltaZ = pointB.z - pointA.z;
        const length = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));

        if (length <= TUBE_LINE_LAYOUT.NORMALIZE_EPSILON) {
            return new Vector3(
                MATH_COMMON_VALUES.ZERO,
                MATH_COMMON_VALUES.UNIT,
                MATH_COMMON_VALUES.ZERO
            );
        }

        return new Vector3(deltaX / length, deltaY / length, deltaZ / length);
    }

    /**
     * @param {Vector3} tangent - Tangent direction.
     * @returns {Vector3}
     * @private
     */
    static #computeNormal(tangent) {
        let normalX = (tangent.y * TUBE_LINE_NORMALS.UP_AXIS_Z) - (tangent.z * TUBE_LINE_NORMALS.UP_AXIS_Y);
        let normalY = (tangent.z * TUBE_LINE_NORMALS.UP_AXIS_X) - (tangent.x * TUBE_LINE_NORMALS.UP_AXIS_Z);
        let normalZ = (tangent.x * TUBE_LINE_NORMALS.UP_AXIS_Y) - (tangent.y * TUBE_LINE_NORMALS.UP_AXIS_X);
        let length  = Math.sqrt((normalX * normalX) + (normalY * normalY) + (normalZ * normalZ));

        if (length <= TUBE_LINE_LAYOUT.NORMALIZE_EPSILON) {
            normalX = (tangent.y * TUBE_LINE_NORMALS.FALLBACK_AXIS_Z) - (tangent.z * TUBE_LINE_NORMALS.FALLBACK_AXIS_Y);
            normalY = (tangent.z * TUBE_LINE_NORMALS.FALLBACK_AXIS_X) - (tangent.x * TUBE_LINE_NORMALS.FALLBACK_AXIS_Z);
            normalZ = (tangent.x * TUBE_LINE_NORMALS.FALLBACK_AXIS_Y) - (tangent.y * TUBE_LINE_NORMALS.FALLBACK_AXIS_X);
            length  = Math.sqrt((normalX * normalX) + (normalY * normalY) + (normalZ * normalZ));
        }

        if (length <= TUBE_LINE_LAYOUT.NORMALIZE_EPSILON) {
            normalX = (tangent.y * TUBE_LINE_NORMALS.SECOND_FALLBACK_AXIS_Z) - (tangent.z * TUBE_LINE_NORMALS.SECOND_FALLBACK_AXIS_Y);
            normalY = (tangent.z * TUBE_LINE_NORMALS.SECOND_FALLBACK_AXIS_X) - (tangent.x * TUBE_LINE_NORMALS.SECOND_FALLBACK_AXIS_Z);
            normalZ = (tangent.x * TUBE_LINE_NORMALS.SECOND_FALLBACK_AXIS_Y) - (tangent.y * TUBE_LINE_NORMALS.SECOND_FALLBACK_AXIS_X);
            length  = Math.sqrt((normalX * normalX) + (normalY * normalY) + (normalZ * normalZ));
        }

        if (length <= TUBE_LINE_LAYOUT.NORMALIZE_EPSILON) {
            return new Vector3(MATH_COMMON_VALUES.UNIT, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);
        }

        return new Vector3(normalX / length, normalY / length, normalZ / length);
    }

    /**
     * @param {Vector3} tangent - Tangent direction.
     * @param {Vector3} normal  - Normal vector.
     * @returns {Vector3}
     * @private
     */
    static #computeBinormal(tangent, normal) {
        const binormalX = (tangent.y * normal.z) - (tangent.z * normal.y);
        const binormalY = (tangent.z * normal.x) - (tangent.x * normal.z);
        const binormalZ = (tangent.x * normal.y) - (tangent.y * normal.x);
        const length    = Math.sqrt((binormalX * binormalX) + (binormalY * binormalY) + (binormalZ * binormalZ));

        if (length <= TUBE_LINE_LAYOUT.NORMALIZE_EPSILON) {
            return new Vector3(
                MATH_COMMON_VALUES.ZERO,
                MATH_COMMON_VALUES.ZERO,
                MATH_COMMON_VALUES.ZERO
            );
        }

        return new Vector3(binormalX / length, binormalY / length, binormalZ / length);
    }

    /**
     * Validates the path and tube options before allocating geometry buffers.
     *
     * @param {TubeLineGeometryOptions} options - Normalized geometry options.
     * @returns {Required<TubeLineGeometryOptions>}
     * @private
     */
    static #normalizeOptions(options) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError('TubeLineGeometry expects options as a plain object.');
        }

        const {
            positions,
            radius         = TUBE_LINE_DEFAULTS.RADIUS,
            width          = TUBE_LINE_DEFAULTS.WIDTH,
            radialSegments = TUBE_LINE_DEFAULTS.RADIAL_SEGMENTS,
            closed         = TUBE_LINE_DEFAULTS.CLOSED,
            capType        = TUBE_LINE_DEFAULTS.CAP_TYPE
        } = options;

        if (!Array.isArray(positions)) {
            throw new TypeError('TubeLineGeometry expects positions as an array of Vector3.');
        }

        if (positions.length < TUBE_LINE_LIMITS.MIN_POINT_COUNT) {
            throw new RangeError('TubeLineGeometry expects at least the 2 points.');
        }

        for (const point of positions) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('TubeLineGeometry expects all positions to be the Vector3 instances.');
            }
        }

        if (typeof radius !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(radius) || radius <= MATH_COMMON_VALUES.ZERO) {
            throw new RangeError('TubeLineGeometry expects radius as a positive number.');
        }

        if (width !== null && (typeof width !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(width) || width <= MATH_COMMON_VALUES.ZERO)) {
            throw new RangeError('TubeLineGeometry expects width as a positive number or null.');
        }

        if (!Number.isInteger(radialSegments) || radialSegments < TUBE_LINE_LIMITS.MIN_RADIAL_SEGMENTS) {
            throw new RangeError('TubeLineGeometry expects radialSegments as an integer >= 3.');
        }

        if (typeof closed !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError('TubeLineGeometry expects closed as a boolean.');
        }

        if (capType !== TUBE_LINE_CAP_TYPES.NONE && capType !== TUBE_LINE_CAP_TYPES.FLAT) {
            throw new RangeError(TUBE_LINE_ERRORS.INVALID_CAP_TYPE);
        }

        return { positions, radius, width, radialSegments, closed, capType };
    }
}
